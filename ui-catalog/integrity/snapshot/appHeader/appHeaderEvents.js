// appHeaderEvents.js
//
// USER INTERACTIONS.
// Page scroll and window resize for pinning the sticky levels, and (optionally) size changes of the levels themselves
// (e.g. Breadcrumbs switching to its back link, a SearchBox message); removed through the returned AbortController.
// Buttons, search, navigation and breadcrumbs handle their own interactions.

// Registers scroll and resize listeners (throttled to one update per animation frame).
export function registerAppHeaderEvents( handlers )
{
    const controller = new AbortController();
    let frame = 0;
    const schedule = callback => () => { if ( frame ) { return; } frame = requestAnimationFrame(() => { frame = 0; callback(); }); };
    window.addEventListener('scroll',schedule(handlers.onScroll),{ signal:controller.signal, passive:true, capture:true });
    window.addEventListener('resize',schedule(handlers.onResize),{ signal:controller.signal });
    // Level size changes: handled in the next animation frame (never inside the observer callback), at most once per frame.
    let levelFrame = 0;
    const observer = handlers.levels?.length && handlers.onLevelResize && typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => { if ( levelFrame ) { return; } levelFrame = requestAnimationFrame(() => { levelFrame = 0; handlers.onLevelResize(); }); })
        : null;
    handlers.levels?.forEach(level => observer?.observe(level));
    controller.signal.addEventListener('abort',() => { cancelAnimationFrame(frame); cancelAnimationFrame(levelFrame); observer?.disconnect(); });
    return controller;
}
