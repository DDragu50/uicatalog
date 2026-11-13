// calendarEvents.js
//
// USER INTERACTIONS.
// Maps native events to coordinator handlers; listeners are removed through the returned AbortController.
// Buttons (calendar, Today, Clear, Done, quick ranges, navigation) are Button instances with their own callbacks.

// Registers native inputs (input/change) and focus leaving the component.
export function registerNativeCalendarEvents( wrapper, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    wrapper.addEventListener('input',event => { if ( event.target.matches('.ui-calendar-field') ) { handlers.onInput(); } },{ signal });
    wrapper.addEventListener('change',event => { if ( event.target.matches('.ui-calendar-field') ) { handlers.onInput(); } },{ signal });
    wrapper.addEventListener('focusout',event => { if ( !wrapper.contains(event.relatedTarget) ) { handlers.onLeave(); } },{ signal });
    return controller;
}

// Registers segment keyboard/paste/focus handling, dialog grid clicks and keys, time selects and focus leave.
export function registerCustomCalendarEvents( wrapper, popup, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    wrapper.addEventListener('keydown',event => { if ( event.target.matches('.ui-calendar-segment') && !event.isComposing ) { handlers.onSegmentKey(event); } },{ signal });
    wrapper.addEventListener('paste',event => { if ( event.target.matches('.ui-calendar-segment') ) { event.preventDefault(); handlers.onPaste(event.target,event.clipboardData?.getData('text') ?? ''); } },{ signal });
    wrapper.addEventListener('focusout',event => { if ( event.target.matches('.ui-calendar-segment') ) { handlers.onSegmentBlur(event.target); } if ( !wrapper.contains(event.relatedTarget) ) { handlers.onLeave(); } },{ signal });
    wrapper.addEventListener('click',event => { const box = event.target.closest('.ui-calendar-box'); if ( box && !event.target.closest('.ui-calendar-segment, button') ) { handlers.onBoxClick(box); } },{ signal });
    popup.addEventListener('click',event => { const cell = event.target.closest('[data-date],[data-month],[data-year],[data-decade]'); if ( cell ) { handlers.onCellClick(cell); } },{ signal });
    popup.addEventListener('keydown',event => handlers.onPopupKeyDown(event),{ signal });
    popup.addEventListener('change',event => { if ( event.target.matches('.ui-calendar-time-select') ) { handlers.onTimeChange(); } },{ signal });
    return controller;
}

// Registers the document-level listeners needed only while the dialog is open (outside press, scroll, resize).
export function registerOpenCalendarEvents( wrapper, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    document.addEventListener('pointerdown',event => { if ( !wrapper.contains(event.target) ) { handlers.onOutsidePress(); } },{ signal, capture:true });
    window.addEventListener('scroll',() => handlers.onReposition(),{ signal, capture:true, passive:true });
    window.addEventListener('resize',() => handlers.onReposition(),{ signal });
    return controller;
}
