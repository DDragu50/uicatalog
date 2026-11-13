// accordionEvents.js
//
// USER INTERACTIONS.
// Keyboard movement between item headers (Up / Down / Home / End). Only native elements are inspected: a <button>
// inside a heading (h2–h6) that is the header of an item. Removed through the returned controller.

const HEADINGS = 'h2, h3, h4, h5, h6';

// Registers the keyboard listener on the Accordion root.
export function registerAccordionEvents( root, handlers )
{
    const controller = new AbortController();
    root.addEventListener('keydown',event =>
    {
        if ( ![ 'ArrowDown', 'ArrowUp', 'Home', 'End' ].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey ) { return; }
        const button = event.target.closest('button');
        const item = button?.closest('.ui-accordion-item');
        // a header is the item's first heading containing the focused button (content buttons are ignored)
        if ( !button || !item || item.parentElement !== root || item.querySelector(HEADINGS) !== button.closest(HEADINGS) ) { return; }
        if ( handlers.onNavigate(Number(item.dataset.index),event.key) ) { event.preventDefault(); }
    },{ signal:controller.signal });
    return controller;
}
