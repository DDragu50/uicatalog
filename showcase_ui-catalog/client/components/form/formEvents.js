// formEvents.js
//
// USER INTERACTIONS.
// Native submit, value-change detection (any user event inside the form triggers a
// comparison of the field values) and the unsaved-changes warning. Removed through the returned AbortController.

// Registers the form listeners.
export function registerFormEvents( form, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    form.addEventListener('submit',event => { event.preventDefault(); handlers.onSubmit(); },{ signal });
    [ 'input', 'change', 'keyup', 'click', 'paste', 'focusout' ].forEach(type => form.addEventListener(type,() => handlers.onUserEvent(),{ signal }));
    window.addEventListener('beforeunload',event => { if ( handlers.shouldWarn() ) { event.preventDefault(); event.returnValue = ''; } },{ signal });
    return controller;
}
