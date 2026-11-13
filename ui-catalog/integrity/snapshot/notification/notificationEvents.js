// notificationEvents.js
//
// USER INTERACTIONS.
// The click of a clickable notification (native button: Enter and Space included). Removed through the returned controller.

// Registers the click listener.
export function registerNotificationEvents( element, onClick )
{
    const controller = new AbortController();
    element.addEventListener('click',event => onClick(event),{ signal:controller.signal });
    return controller;
}
