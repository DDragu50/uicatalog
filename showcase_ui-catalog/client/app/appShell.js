// appShell.js
//
// APPLICATION SHELL.
// Renders the frame around every page with the catalog's own components: AppHeader (skip link, logo, search, breadcrumbs)
// and SideNavigation (main menu: Home, the component groups, Search, Contact; rail on wide screens, drawer on phones).
// The header search opens the Search page with its text (the search Button and Enter, also with an empty field).
// Pages update it through setPage().

import { renderAppHeader } from '../components/appHeader/appHeaderIndex.js';
import { renderSideNavigation } from '../components/sideNavigation/sideNavigationIndex.js';
import { APP_CONFIG, APP_TEXTS } from './appConfig.js';
import { reportAppIssue } from './appErrors.js';

// Returns the menu address of a component page.
export function componentHref( id ) { return `#/component/${id}`; }

// Builds the SideNavigation tree: fixed pages, then one branch per catalog group (a branch only opens and closes).
function buildNavigationItems( catalog )
{
    const names = Object.fromEntries(catalog.components.map(component => [ component.id, component.name ]));
    const groups = catalog.groups.map(group => (
    {
        id:`group-${group.id}`, label:group.label, icon:group.icon || 'fa-solid fa-folder',
        children:group.components.map(id => ( { id:`${group.id}-${id}`, label:names[id] ?? id, href:componentHref(id) } ))
    } ));
    return [
        { id:'home', label:APP_TEXTS.navigation.home, href:'#/', icon:'fa-solid fa-house' },
        ...groups,
        { id:'search', label:APP_TEXTS.navigation.search, href:'#/search', icon:'fa-solid fa-magnifying-glass' },
        { id:'contact', label:APP_TEXTS.navigation.contact, href:'#/contact', icon:'fa-solid fa-envelope' }
    ];
}

// Reads the remembered menu state (rail, open branches); browser storage may be unavailable.
function readNavigationState()
{
    try { const stored = JSON.parse(localStorage.getItem(APP_CONFIG.storageKey) ?? '{}'); return { rail:stored.rail === true, expanded:Array.isArray(stored.expanded) ? stored.expanded.map(String) : [] }; }
    catch { return { rail:false, expanded:[] }; }
}

// Remembers one part of the menu state; ignored when browser storage is unavailable.
function writeNavigationState( changes )
{
    try { localStorage.setItem(APP_CONFIG.storageKey,JSON.stringify({ ...readNavigationState(), ...changes })); }
    catch { /* storage unavailable: the menu state is simply not remembered */ }
}

// Renders AppHeader and SideNavigation; returns the shell instance, or null after a developer error.
export function renderAppShell( headerHost, navigationHost, catalog )
{
    if ( !headerHost ) { reportAppIssue('CONTAINER_REQUIRED',{ value:'#app-header-host' }); return null; }
    if ( !navigationHost ) { reportAppIssue('CONTAINER_REQUIRED',{ value:'#app-side-host' }); return null; }

    const header = renderAppHeader(headerHost,
    {
        id:'app-header', skipLinkTarget:'#main', menuHost:true, logo:{ ...APP_CONFIG.logo }, homeHref:'#/',   // logo only: its alt text names the app
        environment:{ ...APP_CONFIG.release },   // "beta" next to the logo, handwritten in blue (app.css overrides)
        //breadcrumbs:{ items:[ { label:APP_TEXTS.navigation.home } ] },
        search:{ label:APP_TEXTS.search.headerLabel, placeholder:APP_TEXTS.search.headerPlaceholder, searchMode:'ON_DEMAND', showSearchButton:true, searchButtonVariant:'ICON_BUTTON', searchButtonHierarchy:'TERTIARY' },
        sticky:{ top:true }
    });
    if ( !header ) { reportAppIssue('SHELL_RENDER_FAILED',{ value:'AppHeader' }); return null; }
    // Header search: the search Button and Enter always open the Search page with the field's text (also when the text
    // is empty or the same as last time, when SearchBox itself reports nothing).
    const openSearch = () => { const query = header.getSearchBox()?.getValue().query ?? ''; window.location.hash = query ? `#/search?text=${encodeURIComponent(query)}` : '#/search'; };
    const searchHost = headerHost.querySelector('.ui-app-header-search-host');
    searchHost?.addEventListener('click',event => { if ( event.target.closest('.ui-search-box-button-host button') ) { openSearch(); } });
    searchHost?.addEventListener('keydown',event => { if ( event.key === 'Enter' && event.target.closest('.ui-search-box-input') && !event.isComposing ) { openSearch(); } });

    const stored = readNavigationState();
    const navigation = renderSideNavigation(navigationHost,
    {
        id:'app-side-navigation', items:buildNavigationItems(catalog), railCollapsed:stored.rail, expandedIds:stored.expanded,
        drawerToggleHost:header.getMenuHost(), texts:{ navigation:APP_TEXTS.navigation.label },
        onRailChange:rail => writeNavigationState({ rail }),
        onExpandChange:expanded => writeNavigationState({ expanded })
    });
    if ( !navigation ) { reportAppIssue('SHELL_RENDER_FAILED',{ value:'SideNavigation' }); header.destroy(); return null; }

    return {
        header,
        // Marks the page in the menu (when it has a menu entry) and shows its path in the breadcrumbs.
        setPage:( { navigationKey, breadcrumbs } ) =>
        {
            if ( navigationKey ) { navigation.setCurrent(navigationKey); }
            header.getBreadcrumbs()?.update(breadcrumbs);
        },
        // Removes the menu and the header.
        destroy:() => { navigation.destroy(); header.destroy(); }
    };
}
