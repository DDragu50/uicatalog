// messageEvents.js
//
// USER INTERACTIONS.
// Pausing the temporary timer while the pointer is over the message or it has focus, the modal's Escape
// (native dialog "cancel") and clicks on detail links. Buttons handle their own clicks. Removed through the returned AbortController.

// Registers the message listeners.
export function registerMessageEvents( root, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    [ 'pointerenter', 'focusin' ].forEach(type => root.addEventListener(type,() => handlers.onPause(),{ signal }));
    root.addEventListener('pointerleave',() => handlers.onResume(),{ signal });
    root.addEventListener('focusout',event => { if ( !root.contains(event.relatedTarget) ) { handlers.onResume(); } },{ signal });
    root.addEventListener('cancel',event => { event.preventDefault(); handlers.onEscape(); },{ signal });
    root.addEventListener('click',event => { const link = event.target.closest('[data-detail]'); if ( link ) { handlers.onDetail(Number(link.dataset.detail),event); } },{ signal });
    return controller;
}
