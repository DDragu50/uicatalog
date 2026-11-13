// breadcrumbsComponent.js
//
// COMPONENT COORDINATOR.
// Shows the path to the current page. Long paths collapse their middle levels into a "…" ActionMenu (declared
// dependency); narrow containers can show a single "Back to parent" link instead. Links navigate normally;
// onNavigate lets single-page applications take over. Sibling lists open under their level, moved so they stay inside
// the window. The container is a dedicated, consumer-owned mount point.

import { mergeBreadcrumbsConfig, validateBreadcrumbsConfig, normalizeItems } from './breadcrumbsConfig.js';
import { buildBreadcrumbsHTML, buildBreadcrumbsContentHTML, collapse, buildStructuredData } from './breadcrumbsHTML.js';
import { reportBreadcrumbsIssue } from './breadcrumbsErrors.js';
import { renderActionMenu } from '../actionMenu/actionMenuIndex.js';
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

// Renders Breadcrumbs and returns its runtime instance, or null after a developer error.
export function renderBreadcrumbs( container, config, onNavigate )
{
    if ( !container ) { reportBreadcrumbsIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeBreadcrumbsConfig(config);
    if ( validateBreadcrumbsConfig(merged) ) { return null; }

    container.innerHTML = buildBreadcrumbsHTML(merged);
    const nav = container.querySelector('.ui-breadcrumbs');
    const callback = merged.onNavigate ?? ( typeof onNavigate === 'function' ? onNavigate : null );
    const controller = new AbortController();
    let items = merged.items, menu = null, instance = null, openSiblings = null;
    const siblingButtons = [];

    // Reports a navigation; the application may call event.preventDefault() to route itself.
    function navigate( index, event )
    {
        const item = items[index];
        if ( item && callback ) { callback({ label:item.label, href:item.href, index },event,instance); }
    }

    // Opens a level's sibling list (closing any other) and focuses its first page; closes it when already open.
    function toggleSiblings( button, list )
    {
        const open = openSiblings?.list === list;
        closeSiblings(false);
        if ( open ) { return; }
        list.hidden = false;
        fitPopupInWindow(list,false);
        button.getElement().setAttribute('aria-expanded','true');
        openSiblings = { button, list };
        ( list.querySelector('[aria-current]') ?? list.querySelector('a') )?.focus();
    }

    // Closes the open sibling list; optionally returns focus to its Button.
    function closeSiblings( returnFocus )
    {
        if ( !openSiblings ) { return; }
        const { button, list } = openSiblings;
        openSiblings = null;
        list.hidden = true;
        button.getElement()?.setAttribute('aria-expanded','false');
        if ( returnFocus ) { button.getElement()?.focus(); }
    }

    // Draws the list for the current items, with the ActionMenu for collapsed levels and the sibling Buttons.
    function draw()
    {
        menu?.destroy(); menu = null;
        closeSiblings(false);
        siblingButtons.splice(0).forEach(button => button?.destroy());
        nav.innerHTML = buildBreadcrumbsContentHTML(merged,items);
        if ( merged.structuredData )
        {
            container.querySelector('.ui-breadcrumbs-structured-data')?.remove();
            nav.insertAdjacentHTML('afterend',buildStructuredData(items,window.location.href.split('#')[0]));
        }
        nav.querySelectorAll('.ui-breadcrumbs-siblings-host').forEach(host =>
        {
            const item = items[Number(host.dataset.index)];
            const list = host.nextElementSibling;
            const button = renderButton(host,{ id:`${list.id}-button`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:'fa-solid fa-chevron-down', ariaLabel:item.siblingsLabel || merged.texts.siblings.replace('{label}',item.label), tooltipMode:merged.iconTooltip },() => toggleSiblings(button,list));
            button?.getElement().setAttribute('aria-expanded','false');
            button?.getElement().setAttribute('aria-controls',list.id);
            siblingButtons.push(button);
        });
        const host = nav.querySelector('.ui-breadcrumbs-more-host');
        if ( host )
        {
            const visible = merged.showCurrent ? items : items.slice(0,-1);
            const { hidden } = collapse(visible,merged.maxItems);
            menu = renderActionMenu(host,{ id:`${merged.id}-more`, tooltipMode:merged.iconTooltip, label:merged.texts.more, icon:'fa-solid fa-ellipsis', items:hidden.map(item => ({ key:String(item.index), label:item.label, href:item.href || undefined, disabled:!item.href })) },key => navigate(Number(key),null));
        }
    }

    nav.addEventListener('click',event =>
    {
        const sibling = event.target.closest('a[data-sibling]');
        if ( sibling ) { callback?.({ label:sibling.dataset.siblingLabel, href:sibling.dataset.sibling, index:null, sibling:true },event,instance); closeSiblings(false); return; }
        const link = event.target.closest('a[data-index]');
        if ( link ) { navigate(Number(link.dataset.index),event); }
    },{ signal:controller.signal });
    nav.addEventListener('keydown',event => { if ( event.key === 'Escape' && openSiblings ) { event.preventDefault(); closeSiblings(true); } },{ signal:controller.signal });
    nav.addEventListener('focusout',event => { if ( openSiblings && !event.target.closest('.ui-breadcrumbs-item')?.contains(event.relatedTarget) ) { closeSiblings(false); } },{ signal:controller.signal });
    document.addEventListener('pointerdown',event => { if ( openSiblings && !event.target.closest('.ui-breadcrumbs-item') ) { closeSiblings(false); } },{ signal:controller.signal, capture:true });
    // keeps the open sibling list inside the window while the page scrolls or the window is resized
    const reposition = event => { if ( openSiblings && !openSiblings.list.contains(event.target) ) { fitPopupInWindow(openSiblings.list,false); } };
    window.addEventListener('resize',reposition,{ signal:controller.signal });
    document.addEventListener('scroll',reposition,{ signal:controller.signal, capture:true, passive:true });

    instance =
    {
        id:merged.id,
        // Returns a copy of the current path.
        getItems:() => items.map(item => ({ ...item })),
        // Replaces the path (e.g. after navigation in a single-page application).
        update:( nextItems ) => { const list = normalizeItems(merged.id,nextItems); if ( list.length ) { items = list; draw(); } else { reportBreadcrumbsIssue('ITEMS_REQUIRED',{ id:merged.id }); } },
        // Removes listeners and the ActionMenu, then clears the container.
        destroy:() => { removeHintTooltip(); controller.abort(); menu?.destroy(); siblingButtons.splice(0).forEach(button => button?.destroy()); container.innerHTML = ''; }
    };

    draw();
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ onlyWhenTruncated:true });
    return instance;
}
