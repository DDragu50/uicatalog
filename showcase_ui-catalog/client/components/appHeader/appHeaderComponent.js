// appHeaderComponent.js
//
// COMPONENT COORDINATOR.
// Builds the application header from optional elements, composes SearchBox, TopNavigation, Breadcrumbs and
// Button (declared dependencies), and pins the levels configured as sticky: once the first sticky level scrolls past
// the top of the viewport, the sticky levels are fixed there, the others are hidden, and the root keeps the header's
// full height so the page does not jump. The height of the sticky levels is published as --page-sticky-offset
// (so e.g. Table's sticky bar sits below). The container is a dedicated, consumer-owned mount point.

import { mergeAppHeaderConfig, validateAppHeaderConfig, hasTopLevel, normalizeUser } from './appHeaderConfig.js';
import { buildAppHeaderHTML } from './appHeaderHTML.js';
import { registerAppHeaderEvents } from './appHeaderEvents.js';
import { reportAppHeaderIssue } from './appHeaderErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderSearchBox } from '../searchBox/searchBoxIndex.js';
import { renderTopNavigation } from '../topNavigation/topNavigationIndex.js';
import { renderBreadcrumbs } from '../breadcrumbs/breadcrumbsIndex.js';
import { renderMessage } from '../message/messageIndex.js';
import { renderNotification } from '../notification/notificationIndex.js';
import { renderBadge } from '../badge/badgeIndex.js';
import { renderNotificationsPanel } from '../notificationsPanel/notificationsPanelIndex.js';

// Sets or removes an element's hint for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function setHint( element, mode, text )
{
    const value = String(text ?? '').trim();
    element.removeAttribute('title');
    element.removeAttribute('data-tooltip');
    if ( value && mode !== 'NONE' ) { element.setAttribute(mode === 'TITLE' ? 'title' : 'data-tooltip',value); }
}

// tooltipMode TOOLTIP (guidelines §12): one Tooltip for the elements with data-tooltip that belong to this component
// (the nearest component around them; hints inside a nested component are left to it), in a host after the component;
// the Tooltip module is loaded only then (if it cannot be loaded, the browser reports it and the hints stay without a
// tooltip). Returns the function that removes it.
function attachHintTooltip( container, id, mode, options = {} )
{
    if ( mode !== 'TOOLTIP' ) { return () => {}; }
    const scope = container.firstElementChild;
    scope?.setAttribute('data-tooltip-scope',id);
    const host = document.createElement('span');
    host.className = 'ui-tooltip-host';
    container.appendChild(host);
    let tooltip = null, removed = false;
    import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
    {
        if ( removed ) { return; }
        tooltip = renderTooltip(host,{ id:`${id}-tooltip`, targets:{ within:container, selector:'[data-tooltip]', text:element => ( element.closest('[data-tooltip-scope]') === scope ? element.getAttribute('data-tooltip') : '' ) }, ...options });
    }).catch(() => {});
    return () => { removed = true; tooltip?.destroy(); host.remove(); scope?.removeAttribute('data-tooltip-scope'); };
}

// Renders an AppHeader and returns its runtime instance, or null after a developer error.
export function renderAppHeader( container, config )
{
    if ( !container ) { reportAppHeaderIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeAppHeaderConfig(config);
    if ( validateAppHeaderConfig(merged) ) { return null; }

    container.innerHTML = buildAppHeaderHTML(merged,hasTopLevel(merged));
    const root = container.querySelector('.ui-app-header');
    const inner = root.querySelector('.ui-app-header-inner');
    const levels = [ ...inner.querySelectorAll('.ui-app-header-level') ];
    const stickyLevels = levels.filter(level => level.classList.contains('ui-app-header-sticky'));
    const children = {};
    const previousOffset = document.documentElement.style.getPropertyValue('--page-sticky-offset');
    const state = { user:merged.user, signedIn:merged.auth?.signedIn ?? false, count:merged.notifications?.count ?? 0, pinned:false, heights:[], naturalHeight:0 };
    const buttonHierarchy = merged.background === 'BRAND' ? 'SECONDARY' : 'TERTIARY';   // tertiary Buttons would disappear on the accent background
    let controller = null, instance = null;

    // ---- elements ----

    // Renders the sign-in / sign-out Button for the current state.
    function drawAuth()
    {
        const host = root.querySelector('.ui-app-header-auth-host');
        if ( !host ) { return; }
        children.auth?.destroy();
        children.auth = renderButton(host,{ id:`${merged.id}-auth`, label:state.signedIn ? merged.texts.signOut : merged.texts.signIn, hierarchy:buttonHierarchy, size:'SMALL', iconBefore:state.signedIn ? 'fa-solid fa-right-from-bracket' : 'fa-solid fa-right-to-bracket' },() => ( state.signedIn ? merged.onSignOut : merged.onSignIn )?.(instance));
    }

    // Renders the user as a Badge (avatar image or initials, name, role, optional indicator, link to the user's page).
    function drawUser()
    {
        const host = root.querySelector('.ui-app-header-user-host');
        if ( !host ) { return; }
        children.user?.destroy(); children.user = null;
        const user = state.user;
        if ( !user ) { return; }
        const parts = user.name.split(/\s+/).filter(Boolean);
        const initials = ( parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0,2) ).toUpperCase();
        const brand = merged.background === 'BRAND';
        children.user = renderBadge(host,{ id:`${merged.id}-user`, tooltipMode:merged.tooltipMode, name:user.name, description:user.role, href:user.href || undefined,
            notification:{ ...( user.avatar ? { image:user.avatar } : { text:initials } ), ...( brand && !user.avatar ? { colorToken:'--c-accent', backgroundToken:'--c-on-accent' } : {} ), ...( user.indicator ? { indicator:user.indicator } : {} ) },
            ...( brand ? { colorToken:'--c-on-accent', descriptionColorToken:'--c-on-accent' } : {} ) });
        setHint(host,merged.tooltipMode,user.href && children.user ? merged.texts.userPage : '');   // on AppHeader's own host around the Badge
    }

    // Shows a Message configuration as the announcement banner (replacing the current one); announce = live announcement
    // (true for messages arriving later, e.g. from a Form's externalMessage.onMessage). Closing removes the level.
    function showAnnouncement( message, announce = true )
    {
        if ( !message || typeof message !== 'object' || !String(message.text ?? '').trim() ) { return; }
        const level = announcementHost.closest('.ui-app-header-level');
        children.announcement?.destroy();
        const { id, layout, onClose:userClose, ...content } = message;
        children.announcement = renderMessage(announcementHost,{ closable:true, tooltipMode:merged.iconTooltip, ...content, id:`${merged.id}-announcement`, layout:'BANNER', visible:!announce,
            onClose:( reason, instanceOfMessage ) => { level.hidden = true; measure(); updatePinning(); userClose?.(reason,instanceOfMessage); } });
        level.hidden = !children.announcement;
        if ( announce ) { children.announcement?.show(); }
        measure(); updatePinning();
    }

    // ---- pinning of sticky levels ----

    // Measures the natural height of the header and of each level (only while not pinned).
    function measure()
    {
        if ( state.pinned ) { return; }
        state.naturalHeight = inner.offsetHeight;
        state.heights = levels.map(level => level.offsetHeight);
        const stickyHeight = levels.reduce(( sum, level, index ) => sum + ( stickyLevels.includes(level) ? state.heights[index] : 0 ),0);
        if ( stickyLevels.length ) { document.documentElement.style.setProperty('--page-sticky-offset',`${stickyHeight}px`); }
    }

    // A level changed size. Not pinned: full re-measure. Pinned: only the visible sticky levels are re-measured (their
    // offset and the reserved space follow the change); hidden levels are re-measured when they reappear on unpinning.
    function onLevelResize()
    {
        if ( !state.pinned ) { measure(); updatePinning(); return; }
        let delta = 0;
        levels.forEach(( level, index ) => { if ( stickyLevels.includes(level) ) { const height = level.offsetHeight; delta += height - state.heights[index]; state.heights[index] = height; } });
        if ( !delta ) { return; }
        state.naturalHeight += delta;
        root.style.setProperty('--ui-app-header-space',`${state.naturalHeight}px`);
        const stickyHeight = levels.reduce(( sum, level, index ) => sum + ( stickyLevels.includes(level) ? state.heights[index] : 0 ),0);
        document.documentElement.style.setProperty('--page-sticky-offset',`${stickyHeight}px`);
    }

    // Pins the sticky levels once the first of them scrolls past the top of the viewport; unpins when scrolling back.
    function updatePinning()
    {
        if ( !stickyLevels.length ) { return; }
        const first = levels.indexOf(stickyLevels[0]);
        const above = state.heights.slice(0,first).reduce(( sum, height ) => sum + height,0);
        const rect = root.getBoundingClientRect();
        const pinned = rect.top + above < 0;   // strictly past the top: at scroll position 0 nothing is pinned
        if ( pinned !== state.pinned )
        {
            if ( pinned ) { root.style.setProperty('--ui-app-header-space',`${state.naturalHeight}px`); }
            state.pinned = pinned;
            root.classList.toggle('ui-app-header-pinned',pinned);
        }
        if ( pinned ) { inner.style.setProperty('--ui-app-header-left',`${rect.left}px`); inner.style.setProperty('--ui-app-header-width',`${rect.width}px`); }
    }

    instance =
    {
        id:merged.id,
        // Shows, changes or removes (null) the user: { name, role?, href?, avatar?, indicator? } (rendered as a Badge).
        setUser:( user ) => { state.user = normalizeUser(user); drawUser(); measure(); updatePinning(); },
        // Switches between "Sign in" and "Sign out".
        setSignedIn:( signedIn ) => { state.signedIn = Boolean(signedIn); drawAuth(); },
        // Updates the notifications counter (0 hides it).
        setNotificationCount:( count ) => { state.count = Math.max(0,Math.trunc(Number(count) || 0)); children.notifications?.setCount?.(state.count); },
        // Returns the host for SideNavigation's menu Button (drawerToggleHost), or null.
        getMenuHost:() => root.querySelector('.ui-app-header-menu-host'),
        // Returns the composed SearchBox, TopNavigation and Breadcrumbs instances (or null).
        getAnnouncement:() => children.announcement ?? null,
        // Shows any Message configuration ({ type, text, title?, link?, … }) as the announcement banner — the collector for
        // other components' externalMessage.onMessage hooks (e.g. a Form's success message).
        showAnnouncement:( message ) => showAnnouncement(message,true),
        getSearchBox:() => children.search ?? null,
        getTopNavigation:() => children.navigation ?? null,
        getUserBadge:() => children.user ?? null,
        // Returns the bell Notification, or the NotificationsPanel when notifications.items is configured.
        getNotifications:() => children.notifications ?? null,
        getBreadcrumbs:() => children.breadcrumbs ?? null,
        // Removes listeners and child components, restores --page-sticky-offset, then clears the container.
        destroy:() =>
        {
            removeHintTooltip();
            controller?.abort();
            Object.values(children).forEach(child => child?.destroy());
            if ( stickyLevels.length ) { if ( previousOffset ) { document.documentElement.style.setProperty('--page-sticky-offset',previousOffset); } else { document.documentElement.style.removeProperty('--page-sticky-offset'); } }
            container.innerHTML = '';
        }
    };

    // Child components (their own configuration is passed through; ids are derived from the header id).
    const announcementHost = root.querySelector('.ui-app-header-announcement-host');
    if ( merged.announcement ) { showAnnouncement(merged.announcement,false); }
    const searchHost = root.querySelector('.ui-app-header-search-host');
    if ( searchHost ) { children.search = renderSearchBox(searchHost,{ labelVisible:false, label:'Search', tooltipMode:merged.iconTooltip, ...merged.search, id:`${merged.id}-search` }); }
    const notificationsHost = root.querySelector('.ui-app-header-notifications-host');
    if ( notificationsHost && merged.notifications.panel )
    {
        const { id, ...panel } = merged.notifications.panel;
        children.notifications = renderNotificationsPanel(notificationsHost,{ tooltipMode:merged.tooltipMode, ...panel, id:`${merged.id}-notifications`, bell:{ ...( panel.bell ?? {} ), ...( merged.background === 'BRAND' ? { colorToken:'--c-on-accent' } : {} ) } });
    }
    else if ( notificationsHost ) { children.notifications = renderNotification(notificationsHost,{ id:`${merged.id}-notifications`, tooltipMode:merged.tooltipMode, label:merged.texts.notifications, icon:'fa-solid fa-bell', texts:{ count:merged.texts.notificationsCount }, ...( merged.background === 'BRAND' ? { colorToken:'--c-on-accent' } : {} ), indicator:{ kind:'COUNT', value:state.count } },() => merged.onNotifications?.(instance)); }
    drawUser();
    drawAuth();
    const navigationHost = root.querySelector('.ui-app-header-navigation-host');
    if ( navigationHost ) { children.navigation = renderTopNavigation(navigationHost,{ tooltipMode:merged.iconTooltip, ...merged.navigation, id:`${merged.id}-navigation` }); }
    const breadcrumbsHost = root.querySelector('.ui-app-header-breadcrumbs-host');
    if ( breadcrumbsHost ) { children.breadcrumbs = renderBreadcrumbs(breadcrumbsHost,{ tooltipMode:merged.tooltipMode, ...merged.breadcrumbs, id:`${merged.id}-breadcrumbs` }); }

    measure();
    if ( stickyLevels.length )
    {
        controller = registerAppHeaderEvents({ levels:merged.autoMeasure ? levels : [], onLevelResize, onScroll:updatePinning, onResize:() => { if ( state.pinned ) { root.classList.remove('ui-app-header-pinned'); state.pinned = false; } measure(); updatePinning(); } });
        updatePinning();
    }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode);
    return instance;
}
