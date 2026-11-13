// sideNavigationComponent.js
//
// COMPONENT COORDINATOR.
// Vertical application navigation drawn from an item tree the application provides (it never loads data):
// current page (aria-current, parents opened), several branches open at once, collapsed icon rail with flyouts,
// mobile drawer below 48rem (hamburger Button rendered into a host the application provides), optional search,
// badges, groups, separators, disabled and external items, and level styles. User choices (rail, open branches)
// are reported so the application can remember them. The container is a dedicated, consumer-owned mount point.

import { mergeSideNavigationConfig, validateSideNavigationConfig, normalizeItems } from './sideNavigationConfig.js';
import { createSideNavigationState, walkItems, findItem, countItems, topLevelWithoutIcon } from './sideNavigationState.js';
import { buildSideNavigationHTML, buildItemsHTML } from './sideNavigationHTML.js';
import { registerSideNavigationEvents } from './sideNavigationEvents.js';
import { reportSideNavigationIssue } from './sideNavigationErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderMessage } from '../message/messageIndex.js';

const GAP = 4;

// Lower-cases and removes accents so "sao" matches "São".
const fold = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

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

// Renders a SideNavigation and returns its runtime instance, or null after a developer error.
export function renderSideNavigation( container, config, onNavigate )
{
    if ( !container ) { reportSideNavigationIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeSideNavigationConfig(config);
    if ( validateSideNavigationConfig(merged) ) { return null; }

    const state = createSideNavigationState(merged);
    let railAllowed = merged.allowRail;
    const showSearch = merged.search && countItems(state.items) > merged.searchThreshold;
    container.innerHTML = buildSideNavigationHTML(merged,showSearch);
    const nav = container.querySelector('.ui-side-nav');
    const overlay = container.querySelector('.ui-side-nav-overlay');
    const root = nav.querySelector('.ui-side-nav-root');
    const flyout = nav.querySelector('.ui-side-nav-flyout');
    const noResultsHost = nav.querySelector('.ui-side-nav-no-results');
    let noResults = null;

    // Shows or hides the "No matching pages" Message (INLINE, INFO; announced when it appears).
    function setNoResults( visible )
    {
        if ( !visible ) { noResults?.hide(); return; }
        noResults ??= renderMessage(noResultsHost,{ id:`${merged.id}-no-results`, type:'INFO', layout:'INLINE', text:merged.texts.noResults, visible:false });
        noResults?.show();
    }
    const callback = merged.onNavigate ?? ( typeof onNavigate === 'function' ? onNavigate : null );
    const domIds = new WeakMap();
    let counter = 0, events = null, railButton = null, closeButton = null, drawerButton = null, instance = null;

    // The rail is offered only when every top-level item has an icon (warns once per tree when it cannot be).
    function checkRailIcons()
    {
        const missing = topLevelWithoutIcon(state.items);
        railAllowed = merged.allowRail && missing.length === 0;
        if ( merged.allowRail && missing.length ) { reportSideNavigationIssue('RAIL_NEEDS_ICONS',{ id:merged.id, value:missing.map(item => `"${item.label}"`).join(', ') }); }
        if ( !railAllowed ) { state.rail = false; }
    }

    // Returns the per-instance DOM id of an item or group.
    const domId = item => { if ( !domIds.has(item) ) { domIds.set(item,`${merged.id}-n${++counter}`); } return domIds.get(item); };

    // Opens the ancestors of the current item (not reported: not a user choice).
    function openCurrentAncestors() { const found = state.currentId ? findItem(state.items,state.currentId) : null; found?.ancestors.forEach(id => state.expanded.add(id)); }

    // Draws the tree for the current state, then applies search and rail tooltips.
    function draw()
    {
        root.innerHTML = buildItemsHTML(merged,state.items,{ domId, expanded:id => state.expanded.has(id), currentId:state.currentId, flat:false });
        applySearch();
        syncRail();
    }

    // Shows or hides entries for the search text: matching items with their ancestors, opened.
    function applySearch()
    {
        const query = fold(state.query.trim());
        nav.classList.toggle('ui-side-nav-searching',Boolean(query));
        if ( !query ) { root.querySelectorAll('[hidden]').forEach(element => { element.hidden = false; }); setNoResults(false); return; }
        const keep = new Set();
        walkItems(state.items,( item, ancestors ) => { if ( fold(item.label).includes(query) ) { keep.add(item.id); ancestors.forEach(id => keep.add(id)); } });
        root.querySelectorAll('.ui-side-nav-item').forEach(li => { li.hidden = !keep.has(li.dataset.itemRow); });
        root.querySelectorAll('.ui-side-nav-group, .ui-side-nav-separator').forEach(element => { element.hidden = Boolean(query) && ( element.matches('.ui-side-nav-separator') || !element.querySelector('.ui-side-nav-item:not([hidden])') ); });
        setNoResults(keep.size === 0);
    }

    // Applies the rail state: class, tooltips on rows, rail Button icon and name.
    function syncRail()
    {
        const rail = state.rail && !events?.isMobile();
        nav.classList.toggle('ui-side-nav-rail',rail);
        root.querySelectorAll('.ui-side-nav-row').forEach(row => setHint(row,merged.tooltipMode,rail ? row.querySelector('.ui-side-nav-label')?.textContent : ''));
        const hadFocus = railButton && document.activeElement === railButton.getElement();
        if ( railButton ) { railButton.destroy(); }
        const host = nav.querySelector('.ui-side-nav-rail-host');
        railButton = railAllowed ? renderButton(host,{ id:`${merged.id}-rail`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:state.rail ? 'fa-solid fa-angles-right' : 'fa-solid fa-angles-left', ariaLabel:state.rail ? merged.texts.expandRail : merged.texts.collapseRail, tooltipMode:merged.iconTooltip },() => setRail(!state.rail,true)) : null;
        railButton?.getElement().setAttribute('aria-controls',merged.id);
        railButton?.getElement().setAttribute('aria-expanded',String(!state.rail));
        if ( hadFocus ) { railButton?.getElement().focus(); }
    }

    // Switches the rail; user changes are reported so the application can remember them.
    function setRail( rail, user )
    {
        state.rail = Boolean(rail) && railAllowed;
        closeFlyout();
        syncRail();
        if ( user ) { merged.onRailChange?.(state.rail,instance); }
    }

    // Opens or closes a branch in place (or, in the rail, shows its flyout).
    function toggle( id, trigger )
    {
        if ( nav.classList.contains('ui-side-nav-rail') ) { openFlyout(id,trigger); return; }
        const open = !state.expanded.has(id);
        if ( open ) { state.expanded.add(id); } else { state.expanded.delete(id); }
        const found = findItem(state.items,id);
        const children = document.getElementById(`${domId(found.item)}-children`);
        children?.classList.toggle('ui-side-nav-children-open',open);
        nav.querySelectorAll(`[data-toggle="${CSS.escape(id)}"]`).forEach(button =>
        {
            button.setAttribute('aria-expanded',String(open));
            if ( button.classList.contains('ui-side-nav-toggle') ) { button.setAttribute('aria-label',( open ? merged.texts.collapse : merged.texts.expand ).replace('{label}',found.item.label)); }
        });
        merged.onExpandChange?.([ ...state.expanded ],instance);
    }

    // Shows a parent's sub-items (and its own page) in a flyout next to its icon (rail mode).
    function openFlyout( id, trigger )
    {
        if ( state.flyoutId === id ) { closeFlyout(); return; }
        const found = findItem(state.items,id);
        if ( !found ) { return; }
        state.flyoutId = id;
        const parent = found.item.href ? [ { ...found.item, children:[] } ] : [];
        flyout.setAttribute('aria-label',found.item.label);
        flyout.innerHTML = `<p class="ui-side-nav-flyout-title">${found.item.label.replace(/[&<>"']/g,char => `&#${char.charCodeAt(0)};`)}</p><ul class="ui-side-nav-list">${buildItemsHTML(merged,[ ...parent, ...found.item.children ],{ domId:item => `${domId(item)}-f`, expanded:() => true, currentId:state.currentId, flat:true })}</ul>`;
        if ( typeof flyout.showPopover === 'function' ) { flyout.showPopover(); } else { flyout.classList.add('ui-side-nav-flyout-open'); }
        const rect = ( trigger.closest('.ui-side-nav-row') ?? trigger ).getBoundingClientRect(), navRect = nav.getBoundingClientRect();
        const rtl = getComputedStyle(nav).direction === 'rtl';
        flyout.style.setProperty('--ui-side-nav-flyout-top',`${Math.max(GAP,Math.min(rect.top,window.innerHeight - flyout.offsetHeight - GAP))}px`);
        flyout.style.setProperty('--ui-side-nav-flyout-left',`${rtl ? navRect.left - flyout.offsetWidth - GAP : navRect.right + GAP}px`);
        flyout.querySelector('a, button')?.focus();
    }

    // Closes the flyout.
    function closeFlyout()
    {
        if ( state.flyoutId === null ) { return; }
        state.flyoutId = null;
        if ( typeof flyout.hidePopover === 'function' ) { flyout.hidePopover(); } else { flyout.classList.remove('ui-side-nav-flyout-open'); }
        flyout.innerHTML = '';
    }

    // Opens or closes the mobile drawer; focus moves into it or back to the hamburger Button.
    function setDrawer( open )
    {
        state.drawerOpen = Boolean(open) && Boolean(events?.isMobile());
        nav.classList.toggle('ui-side-nav-drawer-open',state.drawerOpen);
        overlay.hidden = !state.drawerOpen;
        drawerButton?.getElement().setAttribute('aria-expanded',String(state.drawerOpen));
        if ( state.drawerOpen ) { focusables()[0]?.focus(); } else if ( open === false ) { drawerButton?.getElement().focus(); }
    }

    // Returns the visible, focusable controls of the navigation (for the drawer).
    const focusables = () => [ ...nav.querySelectorAll('a[href], button:not([disabled]), input') ].filter(element => element.getClientRects().length > 0 && !element.closest('.ui-side-nav-flyout'));

    // Keyboard: Escape closes the flyout or the drawer; Tab stays inside the open drawer.
    function handleKeyDown( event )
    {
        if ( event.key === 'Escape' && state.flyoutId !== null ) { const id = state.flyoutId; closeFlyout(); nav.querySelector(`[data-row="${CSS.escape(id)}"] [data-toggle], [data-row="${CSS.escape(id)}"] a`)?.focus(); return; }
        if ( event.key === 'Escape' && state.drawerOpen ) { setDrawer(false); return; }
        if ( event.key !== 'Tab' || !state.drawerOpen ) { return; }
        const focusable = focusables();
        const first = focusable[0], last = focusable[focusable.length - 1];
        if ( event.shiftKey && document.activeElement === first ) { event.preventDefault(); last.focus(); }
        else if ( !event.shiftKey && document.activeElement === last ) { event.preventDefault(); first.focus(); }
    }

    // A link was chosen: report it (single-page applications may prevent the navigation), close flyout and drawer.
    function handleLink( id, event, link )
    {
        const found = findItem(state.items,id);
        if ( found && nav.classList.contains('ui-side-nav-rail') && found.item.children.length && !link.closest('.ui-side-nav-flyout') ) { event.preventDefault(); openFlyout(id,link); return; }
        if ( found && callback ) { callback({ id:found.item.id, label:found.item.label, href:found.item.href, external:found.item.external },event,instance); }
        if ( found?.item.external ) { return; }
        closeFlyout();
        if ( state.drawerOpen ) { setDrawer(false); }
    }

    // Shows the hamburger Button only on narrow screens; closes the drawer when returning to desktop.
    function handleViewport( mobile )
    {
        if ( merged.drawerToggleHost ) { merged.drawerToggleHost.hidden = !mobile; }
        if ( !mobile && state.drawerOpen ) { setDrawer(false); }
        closeFlyout();
        syncRail();
    }

    instance =
    {
        id:merged.id,
        // Replaces the item tree (e.g. after permissions changed); keeps open branches that still exist.
        setItems:( items ) => { const list = normalizeItems(merged.id,items); if ( !list.length ) { reportSideNavigationIssue('ITEMS_REQUIRED',{ id:merged.id }); return; } state.items = list; checkRailIcons(); openCurrentAncestors(); closeFlyout(); draw(); },
        // Marks the current page by item id or href and opens its parents.
        setCurrent:( key ) => { const found = findItem(state.items,String(key ?? '')); if ( !found ) { reportSideNavigationIssue('UNKNOWN_ITEM',{ id:merged.id, value:key }); return; } state.currentId = found.item.id; openCurrentAncestors(); draw(); },
        // Updates the badge of an item ('' or null removes it).
        setBadge:( id, badge ) => { const found = findItem(state.items,String(id)); if ( !found ) { reportSideNavigationIssue('UNKNOWN_ITEM',{ id:merged.id, value:id }); return; } found.item.badge = badge === null || badge === undefined ? '' : String(badge); draw(); },
        // Returns the ids of the open branches.
        getExpandedIds:() => [ ...state.expanded ],
        // Returns whether the rail (icons only) is active.
        isRail:() => state.rail,
        // Switches the rail programmatically (not reported).
        setRail:( rail ) => setRail(rail,false),
        // Opens the mobile drawer (narrow screens only).
        openDrawer:() => setDrawer(true),
        // Closes the mobile drawer.
        closeDrawer:() => setDrawer(false),
        // Removes listeners and Buttons, then clears the container (and hides the hamburger host).
        destroy:() => { removeHintTooltip(); noResults?.destroy(); closeFlyout(); events?.controller.abort(); railButton?.destroy(); closeButton?.destroy(); drawerButton?.destroy(); if ( merged.drawerToggleHost ) { merged.drawerToggleHost.hidden = false; } container.innerHTML = ''; }
    };

    events = registerSideNavigationEvents(nav,overlay,
    {
        onToggle:toggle,
        onLink:handleLink,
        onSearch:query => { state.query = query; applySearch(); },
        onKeyDown:handleKeyDown,
        onOverlay:() => setDrawer(false),
        onOutsidePress:() => closeFlyout(),
        onViewport:handleViewport
    });
    closeButton = renderButton(nav.querySelector('.ui-side-nav-close-host'),{ id:`${merged.id}-close`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:'fa-solid fa-xmark', ariaLabel:merged.texts.closeDrawer, tooltipMode:merged.iconTooltip },() => setDrawer(false));
    if ( merged.drawerToggleHost )
    {
        drawerButton = renderButton(merged.drawerToggleHost,{ id:`${merged.id}-drawer`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', icon:'fa-solid fa-bars', ariaLabel:merged.texts.openDrawer, tooltipMode:merged.iconTooltip },() => setDrawer(!state.drawerOpen));
        drawerButton?.getElement().setAttribute('aria-controls',merged.id);
        drawerButton?.getElement().setAttribute('aria-expanded','false');
    }
    checkRailIcons();
    openCurrentAncestors();
    draw();
    handleViewport(events.isMobile());
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ placement:'END' });
    return instance;
}
