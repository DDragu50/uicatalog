// textAreaEvents.js
//
// USER INTERACTIONS.
// Binds native input and blur events; input during an IME composition is handled when the composition ends.

// Registers the input and blur handlers and returns the AbortController that removes them.
export function registerTextAreaEvents( field, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    field.addEventListener('input',event => { if ( !event.isComposing ) { handlers.onInput(); } },{ signal });
    field.addEventListener('compositionend',() => handlers.onInput(),{ signal });
    field.addEventListener('blur',() => handlers.onBlur(),{ signal });
    return controller;
}
