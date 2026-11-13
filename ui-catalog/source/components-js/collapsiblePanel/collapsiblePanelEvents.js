// collapsiblePanelEvents.js
//
// USER INTERACTIONS.
// Binds the panel's own toggle button only, so nested panels never trigger their ancestors.

// Registers the toggle interaction and returns the AbortController that removes it.
export function registerCollapsiblePanelEvents( toggle, onToggleClick )
{
    const controller = new AbortController();
    toggle?.addEventListener('click',event => { event.preventDefault(); onToggleClick(); },{ signal:controller.signal });
    return controller;
}
