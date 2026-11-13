// selectEvents.js
//
// USER INTERACTIONS.
// Maps native events to coordinator handlers; listeners are removed through the returned AbortController.
// Pointer presses inside the popup are prevented from moving focus, so the combobox keeps focus while choosing.

// Registers change and blur on a native <select>.
export function registerNativeSelectEvents( select, handlers )
{
    const controller = new AbortController();
    select.addEventListener('change',() => handlers.onChange(),{ signal:controller.signal });
    select.addEventListener('blur',() => handlers.onBlur(),{ signal:controller.signal });
    return controller;
}

// Registers trigger, search, option and focus-leave events of the custom presentation.
export function registerCustomSelectEvents( elements, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    const { wrapper, trigger, popup, listbox, search } = elements;
    trigger.addEventListener('click',event => { if ( event.detail !== 0 ) { handlers.onTriggerClick(); } },{ signal });   // keyboard activation is handled in keydown
    trigger.addEventListener('keydown',event => handlers.onKeyDown(event,'TRIGGER'),{ signal });
    search?.addEventListener('keydown',event => { if ( !event.isComposing ) { handlers.onKeyDown(event,'SEARCH'); } },{ signal });
    search?.addEventListener('input',event => { if ( !event.isComposing ) { handlers.onSearchInput(); } },{ signal });
    search?.addEventListener('compositionend',() => handlers.onSearchInput(),{ signal });
    popup.addEventListener('pointerdown',event => { if ( event.target !== search ) { event.preventDefault(); } },{ signal });
    listbox.addEventListener('click',event => { const option = event.target.closest('.ui-select-option'); if ( option ) { handlers.onOptionClick(option); } },{ signal });
    listbox.addEventListener('pointermove',event => { const option = event.target.closest('.ui-select-option'); if ( option ) { handlers.onOptionHover(option); } },{ signal });
    wrapper.addEventListener('focusout',event => { if ( !wrapper.contains(event.relatedTarget) ) { handlers.onLeave(); } },{ signal });
    return controller;
}

// Registers the document-level listeners needed only while the list is open (outside press, scroll, resize).
export function registerOpenListEvents( wrapper, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    document.addEventListener('pointerdown',event => { if ( !wrapper.contains(event.target) ) { handlers.onOutsidePress(); } },{ signal, capture:true });
    window.addEventListener('scroll',() => handlers.onReposition(),{ signal, capture:true, passive:true });
    window.addEventListener('resize',() => handlers.onReposition(),{ signal });
    return controller;
}
