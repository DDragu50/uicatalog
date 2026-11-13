// topNavigationComponent.js
//
// COMPONENT COORDINATOR.
// Horizontal application navigation from an item tree the application provides (two levels): dropdown panels
// (LIST or MEGA) opened by click or keyboard only and moved so they stay inside the window, top items that do not fit moved into an emphasized "More" item
// (priority+ pattern, recalculated when the width changes), current page in three styles (UNDERLINE, PILL, TAB),
// and below 48rem a menu Button that opens the whole tree as expandable sections. Renders only the navigation;
// the header around it belongs to the page. The container is a dedicated, consumer-owned mount point.

import { mergeTopNavigationConfig, validateTopNavigationConfig, normalizeItems } from './topNavigationConfig.js';
import { buildTopNavigationHTML, buildBarHTML, buildMoreEntriesHTML, buildMobileHTML } from './topNavigationHTML.js';
import { registerTopNavigationEvents } from './topNavigationEvents.js';
import { reportTopNavigationIssue } from './topNavigationErrors.js';
import { renderButton } from '../button/buttonIndex.js';

// Keeps an open popup inside the window. The popup is placed by its stylesheet (position:absolute, under the element
// it is positioned in, aligned to that element's start or end); this moves it to the other alignment when it does not
// fit on its side of the window, above the element when there is no room below (and more room above), keeps it inside
// the window as a last resort and limits its height when neither side has room. Called on open, scroll and resize.
function fitPopupInWindow( popup, alignEnd )
{
    const GAP = 8;
    [ 'left', 'right', 'top', 'bottom', 'max-block-size' ].forEach(property => popup.style.removeProperty(property));
    const parent = popup.offsetParent;
    if ( !parent || popup.hidden ) { return; }
    const anchor = parent.getBoundingClientRect(), box = popup.getBoundingClientRect(), style = getComputedStyle(popup);
    const marginTop = parseFloat(style.marginTop) || 0, marginLeft = parseFloat(style.marginLeft) || 0;
    const originLeft = anchor.left + parent.clientLeft, originTop = anchor.top + parent.clientTop;
    const width = box.width, height = box.height, gap = Math.max(0,box.top - anchor.bottom);
    const rtl = style.direction === 'rtl';
    const endAligned = rtl ? anchor.left : anchor.right - width, startAligned = rtl ? anchor.right - width : anchor.left;
    const fits = value => value >= GAP && value + width <= window.innerWidth - GAP;
    const [ preferred, other ] = alignEnd ? [ endAligned, startAligned ] : [ startAligned, endAligned ];
    const left = Math.max(GAP,Math.min(fits(preferred) ? preferred : fits(other) ? other : preferred,window.innerWidth - width - GAP));
    const below = window.innerHeight - anchor.bottom - gap - GAP, above = anchor.top - gap - GAP;
    const up = height > below && above > below, room = Math.max(0,up ? above : below);
    const frame = style.boxSizing === 'border-box' ? 0 : height - parseFloat(style.height);
    if ( height > room ) { popup.style.setProperty('max-block-size',`${Math.max(0,room - frame)}px`); }
    const top = up ? anchor.top - gap - Math.min(height,room) : anchor.bottom + gap;
    popup.style.setProperty('left',`${left - originLeft - marginLeft}px`);
    popup.style.setProperty('right','auto');
    popup.style.setProperty('top',`${top - originTop - marginTop}px`);
    popup.style.setProperty('bottom','auto');
}

// Returns the entry with an id (or href) anywhere in the two-level tree, or null.
function findEntry( items, key )
{
    for ( const top of items )
    {
        if ( top.id === key || ( top.href && top.href === key ) ) { return top; }
        for ( const entry of top.children )
        {
            const list = entry.type === 'GROUP' ? entry.children : entry.type === 'ITEM' ? [ entry ] : [];
            const found = list.find(item => item.id === key || ( item.href && item.href === key ));
            if ( found ) { return found; }
        }
    }
    return null;
}

// Renders a TopNavigation and returns its runtime instance, or null after a developer error.
export function renderTopNavigation( container, config, onNavigate )
{
    if ( !container ) { reportTopNavigationIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTopNavigationConfig(config);
    if ( validateTopNavigationConfig(merged) ) { return null; }

    container.innerHTML = buildTopNavigationHTML(merged);
    const nav = container.querySelector('.ui-top-nav');
    const bar = nav.querySelector('.ui-top-nav-bar');
    const mobile = nav.querySelector('.ui-top-nav-mobile');
    const mobileList = mobile.querySelector('.ui-top-nav-mobile-list');
    const callback = merged.onNavigate ?? ( typeof onNavigate === 'function' ? onNavigate : null );
    const state = { items:merged.items, currentId:merged.currentId, openTrigger:null, mobileOpen:false };
    let events = null, menuButton = null, instance = null;

    // Draws the bar and the narrow-screen panel for the current items, then fits the bar.
    function draw()
    {
        closePanel(false);
        bar.innerHTML = buildBarHTML(merged,state.items,state.currentId);
        mobileList.innerHTML = buildMobileHTML(merged,state.items,state.currentId);
        fit();
    }

    // Priority+: shows as many top items as fit (in order) and moves the rest into "More".
    function fit()
    {
        if ( events?.isMobile() ) { return; }
        closePanel(false);
        const tops = [ ...bar.querySelectorAll('.ui-top-nav-item[data-top]') ], more = bar.querySelector('.ui-top-nav-more');
        tops.forEach(li => { li.hidden = false; });
        more.hidden = true;
        const available = bar.clientWidth;
        const width = list => list.reduce(( sum, li ) => sum + li.getBoundingClientRect().width,0) + Math.max(0,list.length - 1) * parseFloat(getComputedStyle(bar).columnGap || 0);
        if ( width(tops) <= available ) { return; }
        more.hidden = false;
        const moreWidth = more.getBoundingClientRect().width + parseFloat(getComputedStyle(bar).columnGap || 0);
        let visible = tops.length;
        while ( visible > 0 && width(tops.slice(0,visible)) + moreWidth > available ) { visible--; }
        const hidden = tops.slice(visible);
        hidden.forEach(li => { li.hidden = true; });
        const overflow = hidden.map(li => state.items[Number(li.dataset.top)]);
        more.querySelector('.ui-top-nav-panel-list').innerHTML = buildMoreEntriesHTML(merged,overflow,state.currentId);
        more.classList.toggle('ui-top-nav-current-branch',hidden.some(li => li.classList.contains('ui-top-nav-current-branch')));
    }

    // Opens a dropdown panel for a trigger (closing any other one); optionally focuses its first entry.
    function openPanel( trigger, focusFirst )
    {
        closePanel(false);
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if ( !panel ) { return; }
        panel.hidden = false;
        fitPopupInWindow(panel,false);
        trigger.setAttribute('aria-expanded','true');
        state.openTrigger = trigger;
        if ( focusFirst ) { panel.querySelector('a, [aria-disabled]')?.focus(); }
    }

    // Closes the open dropdown panel; optionally returns focus to its trigger.
    function closePanel( returnFocus )
    {
        const trigger = state.openTrigger;
        if ( !trigger ) { return; }
        state.openTrigger = null;
        trigger.setAttribute('aria-expanded','false');
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        if ( panel ) { panel.hidden = true; }
        if ( returnFocus ) { trigger.focus(); }
    }

    // Opens or closes the narrow-screen panel.
    function setMobile( open )
    {
        state.mobileOpen = Boolean(open);
        mobile.hidden = !state.mobileOpen;
        menuButton?.getElement().setAttribute('aria-expanded',String(state.mobileOpen));
        if ( state.mobileOpen ) { mobile.querySelector('a, button')?.focus(); }
    }

    // A link was chosen: report it (single-page applications may prevent navigation) and close panels.
    function handleLink( id, event )
    {
        const entry = findEntry(state.items,id);
        if ( entry && callback ) { callback({ id:entry.id, label:entry.label, href:entry.href, external:entry.external },event,instance); }
        if ( entry?.external ) { return; }
        closePanel(false);
        if ( state.mobileOpen ) { setMobile(false); menuButton?.getElement().focus(); }
    }

    // Keyboard: Escape closes the dropdown (or the narrow panel); ArrowDown on a trigger opens it and focuses its first entry.
    function handleKeyDown( event )
    {
        if ( event.key === 'Escape' && state.openTrigger ) { event.preventDefault(); closePanel(true); return; }
        if ( event.key === 'Escape' && state.mobileOpen ) { event.preventDefault(); setMobile(false); menuButton?.getElement().focus(); return; }
        const trigger = event.target.closest('[data-toggle]');
        if ( trigger && event.key === 'ArrowDown' ) { event.preventDefault(); openPanel(trigger,true); }
    }

    // Switches between the bar and the menu Button at 48rem.
    function handleViewport( isMobile )
    {
        closePanel(false);
        if ( !isMobile ) { setMobile(false); fit(); }
    }

    instance =
    {
        id:merged.id,
        // Replaces the items (e.g. after permissions changed).
        setItems:( items ) => { const list = normalizeItems(merged.id,items); if ( !list.length ) { reportTopNavigationIssue('ITEMS_REQUIRED',{ id:merged.id }); return; } state.items = list; draw(); },
        // Marks the current page by item id or href (and its top item as the current branch).
        setCurrent:( key ) => { const entry = findEntry(state.items,String(key ?? '')); if ( !entry ) { reportTopNavigationIssue('UNKNOWN_ITEM',{ id:merged.id, value:key }); return; } state.currentId = entry.id; draw(); },
        // Updates the badge of an item ('' or null removes it).
        setBadge:( id, badge ) => { const entry = findEntry(state.items,String(id)); if ( !entry ) { reportTopNavigationIssue('UNKNOWN_ITEM',{ id:merged.id, value:id }); return; } entry.badge = badge === null || badge === undefined ? '' : String(badge); draw(); },
        // Closes any open dropdown and the narrow-screen panel.
        close:() => { closePanel(false); setMobile(false); },
        // Removes listeners and the menu Button, then clears the container.
        destroy:() => { events?.controller.abort(); menuButton?.destroy(); container.innerHTML = ''; }
    };

    events = registerTopNavigationEvents(nav,
    {
        onToggle:trigger => ( state.openTrigger === trigger ? closePanel(false) : openPanel(trigger,false) ),
        onSection:section => { const open = section.getAttribute('aria-expanded') !== 'true'; section.setAttribute('aria-expanded',String(open)); document.getElementById(section.getAttribute('aria-controls')).hidden = !open; },
        onLink:handleLink,
        onKeyDown:handleKeyDown,
        onLeave:() => closePanel(false),
        // Focus moved inside the navigation: close the open panel when focus left its section (trigger and panel).
        onFocusMove:( target ) => { const section = state.openTrigger?.closest('li'); if ( section && !section.contains(target) ) { closePanel(false); } },
        onViewport:handleViewport,
        onResize:() => fit(),
        onReposition:event => { const panel = state.openTrigger && document.getElementById(state.openTrigger.getAttribute('aria-controls')); if ( panel && !panel.contains(event.target) ) { fitPopupInWindow(panel,false); } }
    });
    menuButton = renderButton(nav.querySelector('.ui-top-nav-menu-host'),{ id:`${merged.id}-menu`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', icon:'fa-solid fa-bars', ariaLabel:merged.texts.menu, tooltipMode:merged.iconTooltip },() => setMobile(!state.mobileOpen));
    menuButton?.getElement().setAttribute('aria-controls',mobile.id);
    menuButton?.getElement().setAttribute('aria-expanded','false');
    draw();
    return instance;
}
