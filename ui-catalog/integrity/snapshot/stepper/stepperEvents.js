// stepperEvents.js
//
// USER INTERACTIONS.
// Clicks on step buttons and the arrow keys between them (one step button is in the Tab order). Only the Stepper's own
// step list is inspected; the content panels and the button bar are left to their own components. Removed through
// the returned controller.

const KEYS = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End' ];

// Registers the click and keyboard listeners on the step list.
export function registerStepperEvents( list, handlers )
{
    const controller = new AbortController();
    const stepOf = target => target.closest('button.ui-stepper-trigger')?.closest('.ui-stepper-step');
    list.addEventListener('click',event =>
    {
        const step = stepOf(event.target);
        if ( step && list.contains(step) ) { handlers.onSelect(Number(step.dataset.index)); }
    },{ signal:controller.signal });
    list.addEventListener('keydown',event =>
    {
        if ( !KEYS.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey ) { return; }
        const step = stepOf(event.target);
        if ( step && list.contains(step) && handlers.onMove(Number(step.dataset.index),event.key) ) { event.preventDefault(); }
    },{ signal:controller.signal });
    return controller;
}
