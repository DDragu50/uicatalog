// textInputEvents.js
//
// USER INTERACTIONS.
// Binds native input and blur events to coordinator handlers; removed through the returned AbortController.

// Registers the input and blur handlers.
export function registerTextInputEvents( input, handlers )
{
    const controller = new AbortController();
    input.addEventListener('input',() => handlers.onInput(),{ signal:controller.signal });
    input.addEventListener('blur',() => handlers.onBlur(),{ signal:controller.signal });
    return controller;
}
