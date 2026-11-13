// appRouter.js
//
// PAGE ROUTER.
// Reads the address after "#" (e.g. #/component/button), shows the matching page and updates the shell:
// menu entry, breadcrumbs, browser tab title, scroll position and focus (moved to the page heading).

import { APP_CONFIG, APP_TEXTS } from './appConfig.js';
import { componentHref } from './appShell.js';
import { renderHomePage } from './pages/homePage.js';
import { renderContactPage } from './pages/contactPage.js';
import { renderComponentPage } from './pages/componentPage.js';
import { renderCustomizePage } from './pages/customizePage.js';
import { renderDocumentPage } from './pages/documentPage.js';
import { renderSearchPage } from './pages/searchPage.js';
import { renderNotFoundPage } from './pages/notFoundPage.js';

const HOME_CRUMB = { label:APP_TEXTS.navigation.home, href:'#/' };

// Returns the description of a component route (the page itself, its Variants page or its README page), or null for
// an unknown component.
function describeComponent( match, catalog, subpage )
{
    const component = catalog.components.find(entry => entry.id === match[1]);
    if ( !component ) { return null; }
    const last = { variants:APP_TEXTS.pages.variants, readme:`${component.id}README.md` }[subpage];
    const crumbs = last ? [ HOME_CRUMB, { label:component.name, href:componentHref(component.id) }, { label:last } ] : [ HOME_CRUMB, { label:component.name } ];
    const title = subpage === 'variants' ? APP_TEXTS.customize.pageTitle.replace('{name}',component.name) : last ?? component.name;
    return { title, navigationKey:componentHref(component.id), breadcrumbs:crumbs, params:{ component } };
}

// Routes: address pattern → page renderer and description (title, menu entry, breadcrumbs); describe returns null for unknown items.
const ROUTES =
[
    { pattern:/^\/$/, render:renderHomePage, describe:() => ( { title:APP_TEXTS.pages.home, navigationKey:'home', breadcrumbs:[ { label:APP_TEXTS.navigation.home } ] } ) },
    // The Description page was removed (its text is on the Home page, its component lists on the Search page): old bookmarks show Home.
    { pattern:/^\/description$/, render:renderHomePage, describe:() => ( { title:APP_TEXTS.pages.home, navigationKey:'home', breadcrumbs:[ { label:APP_TEXTS.navigation.home } ] } ) },
    // Guides from the Home page (APP_CONFIG.guides): #/framework, #/guidelines, #/design-system.
    { pattern:/^\/(framework|guidelines|design-system)$/, render:renderDocumentPage, describe:match => { const guide = APP_CONFIG.guides.find(entry => entry.key === match[1]); const name = guide.content.split('/').pop(); return { title:name, navigationKey:'home', breadcrumbs:[ HOME_CRUMB, { label:name } ], params:{ guide } }; } },
    { pattern:/^\/contact$/, render:renderContactPage, describe:() => ( { title:APP_TEXTS.pages.contact, navigationKey:'contact', breadcrumbs:[ HOME_CRUMB, { label:APP_TEXTS.pages.contact } ] } ) },
    { pattern:/^\/search$/, render:renderSearchPage, describe:() => ( { title:APP_TEXTS.pages.search, navigationKey:'search', breadcrumbs:[ HOME_CRUMB, { label:APP_TEXTS.pages.search } ] } ) },
    { pattern:/^\/component\/([A-Za-z0-9]+)$/, render:renderComponentPage, describe:( match, catalog ) => describeComponent(match,catalog,'') },
    // Variants page (narrow screens); /customize is the earlier address of the same page (kept for bookmarks).
    { pattern:/^\/component\/([A-Za-z0-9]+)\/(?:variants|customize)$/, render:renderCustomizePage, describe:( match, catalog ) => describeComponent(match,catalog,'variants') },
    // README page: the component's .md file whole, with downloads.
    { pattern:/^\/component\/([A-Za-z0-9]+)\/readme$/, render:renderDocumentPage, describe:( match, catalog ) => describeComponent(match,catalog,'readme') }
];

// Returns whether an address part after "#" is a page address ("#/…"); others (e.g. "#main" from the skip link) are in-page anchors.
function isRouteHash( hash ) { return hash === '' || hash === '#' || hash.startsWith('#/'); }

// Returns the route path from the address ("#/contact" → "/contact"; empty or an in-page anchor → "/").
function readPath() { const hash = window.location.hash; if ( !isRouteHash(hash) ) { return '/'; } let path = ''; try { path = decodeURIComponent(hash.slice(1).split('?')[0]); } catch { path = hash.slice(1); } return path || '/'; }

// Returns the query part of the address ("#/search?text=menu" → URLSearchParams with text=menu).
function readQuery() { const hash = window.location.hash; return new URLSearchParams(isRouteHash(hash) && hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''); }

// Finds the route and description for a path; unknown paths and items lead to the "not found" page.
function resolveRoute( path, catalog )
{
    for ( const route of ROUTES )
    {
        const match = path.match(route.pattern);
        const description = match ? route.describe(match,catalog) : null;
        if ( description ) { return { render:route.render, ...description }; }
    }
    return { render:renderNotFoundPage, title:APP_TEXTS.pages.notFound, navigationKey:'', breadcrumbs:[ HOME_CRUMB, { label:APP_TEXTS.pages.notFound } ] };
}

// Starts routing: renders the current page now and on every address change; returns the router instance.
export function startRouter( pageHost, shell, catalog )
{
    let page = null, version = 0, routeHash = isRouteHash(window.location.hash) ? window.location.hash : '#/';

    // Changes the address of the current page without showing it again (e.g. search filters); keeps the skip-link fallback in step.
    function replaceAddress( hash ) { routeHash = hash; history.replaceState(history.state,'',hash); }

    // Moves keyboard and screen-reader focus to the page heading after an in-app navigation.
    function focusHeading( root ) { const heading = root.querySelector('h1'); if ( heading ) { heading.setAttribute('tabindex','-1'); heading.focus({ preventScroll:true }); } }

    // Replaces the current page with the page of the current address.
    async function showPage( initial )
    {
        const current = ++version;
        const route = resolveRoute(readPath(),catalog);
        page?.destroy();
        page = null;
        const root = document.createElement('div');
        root.className = 'app-page';
        pageHost.replaceChildren(root);
        shell.setPage(route);
        document.title = route.title === APP_TEXTS.pages.home ? APP_CONFIG.appName : APP_TEXTS.documentTitle.replace('{page}',route.title);
        window.scrollTo(0,0);
        const instance = await route.render(root,{ catalog, params:route.params ?? {}, query:readQuery(), shell, replaceAddress });
        if ( current !== version ) { instance?.destroy(); return; }
        page = instance;
        if ( !initial ) { focusHeading(root); }
    }

    // Handles address changes made by links, the menu, the breadcrumbs and the browser's back button.
    // In-page anchors (the skip link "#main") keep the current page: the browser has already moved focus,
    // and the address is set back to the page address so that reloading or bookmarking keeps working.
    const onHashChange = () =>
    {
        if ( !isRouteHash(window.location.hash) ) { history.replaceState(history.state,'',routeHash); return; }
        routeHash = window.location.hash;
        showPage(false);
    };
    window.addEventListener('hashchange',onHashChange);
    showPage(true);
    return {
        // Stops routing and removes the current page.
        destroy:() => { window.removeEventListener('hashchange',onHashChange); page?.destroy(); pageHost.replaceChildren(); }
    };
}
