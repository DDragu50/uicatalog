// buttonEvents.js
//
// USER INTERACTIONS.
// Registers the click listener. Native [disabled] blocks clicks, so the listener is always registered.
// Link (<a>): only a plain primary click reaches the callback; Ctrl / Cmd / Shift / Alt + click and middle-click keep
// the browser's own behaviour (new tab, new window, download), so the callback never blocks them. A disabled link
// has no address and its clicks never reach the callback. The callback may call event.preventDefault() to stay on the page.

// Whether a click is a plain primary click (no modifier key).
function isPlainClick( event ) { return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey; }

// Registers the click callback and returns the AbortController that removes it.
// isLinkDisabled: for a link, returns whether it is disabled; null for a button.
export function registerButtonEvents( button, callback, instance, isLinkDisabled = null )
{
    const controller = new AbortController();
    if ( !button ) { return controller; }
    if ( isLinkDisabled )
    {
        button.addEventListener('click',event =>
        {
            if ( isLinkDisabled() ) { event.preventDefault(); return; }
            if ( typeof callback === 'function' && isPlainClick(event) ) { callback(event,instance); }
        },{ signal:controller.signal });
        return controller;
    }
    if ( typeof callback === 'function' ) { button.addEventListener('click',event => callback(event,instance),{ signal:controller.signal }); }
    return controller;
}
