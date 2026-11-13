// sideNavigationEvents.js
//
// USER INTERACTIONS.
// Clicks (links, expand buttons, parent rows, flyout), search typing, drawer keyboard (Escape, focus kept inside)
// and the viewport change between desktop and drawer. Removed through the returned AbortController.

// Registers the navigation listeners.
export function registerSideNavigationEvents( nav, overlay, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    nav.addEventListener('click',event =>
    {
        const toggle = event.target.closest('[data-toggle]');
        if ( toggle ) { event.preventDefault(); handlers.onToggle(toggle.dataset.toggle,toggle); return; }
        const link = event.target.closest('a[data-item]');
        if ( link ) { handlers.onLink(link.dataset.item,event,link); }
    },{ signal });
    nav.querySelector('.ui-side-nav-search-input')?.addEventListener('input',event => handlers.onSearch(event.target.value),{ signal });
    nav.addEventListener('keydown',event => handlers.onKeyDown(event),{ signal });
    overlay.addEventListener('click',() => handlers.onOverlay(),{ signal });
    document.addEventListener('pointerdown',event => { if ( !event.target.closest('.ui-side-nav-flyout') && !event.target.closest('.ui-side-nav-has-children') ) { handlers.onOutsidePress(); } },{ signal, capture:true });
    const media = window.matchMedia('(max-width:48rem)');
    media.addEventListener('change',() => handlers.onViewport(media.matches),{ signal });
    return { controller, isMobile:() => media.matches };
}
