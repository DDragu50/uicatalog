// chipEvents.js
//
// USER INTERACTIONS.
// Delegates remove actions through the container; removed through the returned AbortController.

// Registers delegated remove actions resolving the Chip-owned or consumer-level callback.
export function registerChipEvents( container, getConfig, onRemove )
{
    const controller = new AbortController();
    container.addEventListener('click',event =>
    {
        const button = event.target.closest('[data-chip-remove]');
        if ( !button || !container.contains(button) ) { return; }
        event.preventDefault();
        const id = button.dataset.chipRemove;
        const callback = getConfig(id)?.onRemove ?? onRemove;
        if ( typeof callback === 'function' ) { callback(id,button.closest('.ui-chip')); }
    },{ signal:controller.signal });
    return controller;
}
