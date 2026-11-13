// notificationsPanelEvents.js
//
// USER INTERACTIONS.
// Item and "See all" clicks, Escape, focus leaving the component, clicks outside it, and scrolling or resizing (the open
// panel is kept inside the window). Removed through the controller.

// Registers the panel listeners.
export function registerNotificationsPanelEvents( root, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    root.addEventListener('click',event =>
    {
        const item = event.target.closest('a[data-item]');
        if ( item ) { handlers.onItem(item.dataset.item,event); return; }
        if ( event.target.closest('.ui-notifications-panel-see-all') ) { handlers.onSeeAll(event); }
    },{ signal });
    root.addEventListener('keydown',event => { if ( event.key === 'Escape' ) { handlers.onEscape(event); } },{ signal });
    root.addEventListener('focusout',event => { if ( event.relatedTarget && !root.contains(event.relatedTarget) ) { handlers.onLeave(); } },{ signal });
    document.addEventListener('pointerdown',event => { if ( !root.contains(event.target) ) { handlers.onLeave(); } },{ signal, capture:true });
    window.addEventListener('resize',handlers.onReposition,{ signal });
    document.addEventListener('scroll',handlers.onReposition,{ signal, capture:true, passive:true });
    return controller;
}
