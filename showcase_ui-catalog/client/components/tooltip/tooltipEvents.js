// tooltipEvents.js
//
// USER INTERACTIONS.
// Pointer (mouse and pen) entering and leaving the target or one of the targets, keyboard focus, long press on touch
// screens (with the click that ends it suppressed), the pointer on the tooltip itself, Escape, scrolling and resizing,
// and the document events through which tooltips show one at a time. Returns the AbortController.

// The document events Tooltips use to show one at a time and to know when another one was just hidden (no registry).
export const TOOLTIP_SHOW_EVENT = 'ui-tooltip-show';
export const TOOLTIP_HIDE_EVENT = 'ui-tooltip-hide';
const LONG_PRESS_MS = 500;

// Registers the listeners. find(node) returns the target element a node belongs to, or null; handlers receive it.
export function registerTooltipEvents( scope, bubble, find, handlers, longPress )
{
    const controller = new AbortController();
    const options = { signal:controller.signal };
    let pressTimer = 0, pressed = null, suppressClick = false;
    const leaving = ( event, element ) => !event.relatedTarget || ( !element.contains(event.relatedTarget) && !bubble.contains(event.relatedTarget) );

    scope.addEventListener('pointerover',event =>
    {
        if ( event.pointerType === 'touch' ) { return; }
        const element = find(event.target);
        if ( element && !element.contains(event.relatedTarget) ) { handlers.onEnter(element); }
    },options);
    scope.addEventListener('pointerout',event =>
    {
        if ( event.pointerType === 'touch' ) { return; }
        const element = find(event.target);
        if ( element && leaving(event,element) ) { handlers.onLeave(element); }
    },options);
    scope.addEventListener('focusin',event => { const element = find(event.target); if ( element ) { handlers.onFocus(element); } },options);
    scope.addEventListener('focusout',event => { const element = find(event.target); if ( element && !element.contains(event.relatedTarget) ) { handlers.onBlur(element); } },options);
    // a press on the target (not a long one) hides the tooltip, as it starts an action
    scope.addEventListener('pointerdown',event =>
    {
        const element = find(event.target);
        if ( !element ) { return; }
        if ( event.pointerType !== 'touch' ) { handlers.onPress(element); return; }
        if ( !longPress ) { return; }
        clearTimeout(pressTimer);
        pressed = element;
        pressTimer = setTimeout(() => { suppressClick = true; handlers.onLongPress(element); },LONG_PRESS_MS);
    },options);
    const cancelPress = () => { clearTimeout(pressTimer); pressed = null; };
    [ 'pointerup', 'pointercancel' ].forEach(type => scope.addEventListener(type,cancelPress,options));
    scope.addEventListener('pointermove',event => { if ( event.pointerType === 'touch' && pressed && !pressed.contains(document.elementFromPoint(event.clientX,event.clientY)) ) { cancelPress(); } },options);
    // the click that ends a long press does not activate the target; the context menu of a long press is not opened
    scope.addEventListener('click',event => { if ( suppressClick ) { suppressClick = false; event.preventDefault(); event.stopPropagation(); } },{ capture:true, signal:controller.signal });
    if ( longPress ) { scope.addEventListener('contextmenu',event => { if ( find(event.target) ) { event.preventDefault(); } },options); }

    bubble.addEventListener('pointerenter',() => handlers.onBubbleEnter(),options);
    bubble.addEventListener('pointerleave',event => handlers.onBubbleLeave(event.relatedTarget),options);
    document.addEventListener('keydown',event => { if ( event.key === 'Escape' && handlers.onEscape() ) { event.preventDefault(); event.stopPropagation(); } },{ capture:true, signal:controller.signal });
    window.addEventListener('scroll',() => handlers.onViewportChange(),{ capture:true, passive:true, signal:controller.signal });
    window.addEventListener('resize',() => handlers.onViewportChange(),options);
    document.addEventListener(TOOLTIP_SHOW_EVENT,event => handlers.onOtherShown(event.detail?.id),options);
    document.addEventListener(TOOLTIP_HIDE_EVENT,event => handlers.onOtherHidden(event.detail?.id),options);
    controller.signal.addEventListener('abort',() => clearTimeout(pressTimer));
    return controller;
}
