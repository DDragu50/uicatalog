// searchBoxEvents.js
//
// USER INTERACTIONS.
// Binds input and keyboard events of the search input; removed through the returned AbortController.
// Input is ignored while an IME composition is running; compositionend delivers the final text.

// Registers input, Enter and Escape handling on the search input.
export function registerSearchBoxEvents( input, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    input.addEventListener('input',event => { if ( !event.isComposing ) { handlers.onInput(); } },{ signal });
    input.addEventListener('compositionend',() => handlers.onInput(),{ signal });
    input.addEventListener('keydown',event =>
    {
        if ( event.isComposing ) { return; }
        if ( event.key === 'Enter' ) { event.preventDefault(); handlers.onEnter(); }
        if ( event.key === 'Escape' && input.value !== '' ) { event.preventDefault(); handlers.onEscape(); }
    },{ signal });
    return controller;
}
