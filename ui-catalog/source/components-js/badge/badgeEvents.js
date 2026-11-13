// badgeEvents.js
//
// USER INTERACTIONS.
// The click of an interactive badge (link or button). Removed through the returned AbortController.

// Registers the click listener.
export function registerBadgeEvents( element, onClick )
{
    const controller = new AbortController();
    element.addEventListener('click',event => onClick(event),{ signal:controller.signal });
    return controller;
}
