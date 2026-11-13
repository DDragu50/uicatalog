// topNavigationEvents.js
//
// USER INTERACTIONS.
// Clicks (dropdown triggers, sections, links), keyboard (Escape, ArrowDown), focus leaving the navigation, outside
// presses, width changes (overflow into "More"), the narrow-screen switch, and scrolling or resizing (the open dropdown
// is kept inside the window). Removed through the returned controller.

// Registers the navigation listeners.
export function registerTopNavigationEvents( nav, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    nav.addEventListener('click',event =>
    {
        const toggle = event.target.closest('[data-toggle]');
        if ( toggle ) { handlers.onToggle(toggle); return; }
        const section = event.target.closest('[data-section]');
        if ( section ) { handlers.onSection(section); return; }
        const link = event.target.closest('a[data-item]');
        if ( link ) { handlers.onLink(link.dataset.item,event); }
    },{ signal });
    nav.addEventListener('keydown',event => handlers.onKeyDown(event),{ signal });
    // Focus leaving the navigation closes the open panel; focus moving to another place inside it (e.g. Tab from the
    // last entry of a panel to the next section) closes the panel when it leaves that panel's section.
    nav.addEventListener('focusout',event => { if ( !nav.contains(event.relatedTarget) ) { handlers.onLeave(); } else { handlers.onFocusMove(event.relatedTarget); } },{ signal });
    document.addEventListener('pointerdown',event => { if ( !nav.contains(event.target) ) { handlers.onLeave(); } },{ signal, capture:true });
    window.addEventListener('resize',handlers.onReposition,{ signal });
    document.addEventListener('scroll',handlers.onReposition,{ signal, capture:true, passive:true });
    const media = window.matchMedia('(max-width:48rem)');
    media.addEventListener('change',() => handlers.onViewport(media.matches),{ signal });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => handlers.onResize()) : null;
    observer?.observe(nav);
    signal.addEventListener('abort',() => observer?.disconnect());
    return { controller, isMobile:() => media.matches };
}
