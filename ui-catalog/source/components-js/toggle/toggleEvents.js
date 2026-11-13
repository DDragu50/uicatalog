// toggleEvents.js
//
// USER INTERACTIONS.
// SWITCH: change of the native switch, busy guard, and clicks on the visible state texts (stateDisplay BOTH).
// RADIO: change of the native radios and focus leaving the group. Removed through the returned AbortController.

// Registers the switch listeners.
export function registerSwitchEvents( root, input, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    input.addEventListener('click',event => { if ( handlers.isBusy() ) { event.preventDefault(); } },{ signal });
    input.addEventListener('change',() => handlers.onChange(),{ signal });
    root.querySelectorAll('.ui-toggle-side').forEach(side => side.addEventListener('click',() => handlers.onSideClick(side.dataset.value === 'true'),{ signal }));
    return controller;
}

// Registers the radio group listeners.
export function registerRadioEvents( group, handlers )
{
    const controller = new AbortController();
    group.addEventListener('change',event => { if ( event.target.matches('.ui-toggle-radio-input') ) { handlers.onChange(event.target.value === 'TRUE'); } },{ signal:controller.signal });
    group.addEventListener('focusout',event => { if ( !group.contains(event.relatedTarget) ) { handlers.onLeave(); } },{ signal:controller.signal });
    return controller;
}
