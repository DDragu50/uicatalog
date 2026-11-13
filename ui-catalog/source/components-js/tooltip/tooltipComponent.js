// tooltipComponent.js
//
// COMPONENT COORDINATOR.
// Shows a short text next to an element (target) or next to any element of a group (targets: within + selector) when
// the pointer rests on it (after showDelayMs; at once when another tooltip was just shown), when it gets keyboard
// focus (at once) or after a long press on touch screens (longPress). Stays while the pointer is on the tooltip, hides
// with Escape (focus stays), when the pointer or focus leaves (after hideDelayMs) or when the target is pressed. One
// tooltip shows at a time. The bubble is a manual popover in the container (top layer: never cut off); its position is
// computed from the target (opposite side when there is no room, kept inside the window). A single target is linked to
// it with aria-describedby (DESCRIPTION) or aria-labelledby (LABEL). The container is a dedicated, consumer-owned mount
// point next to the target.

import { mergeTooltipConfig, validateTooltipConfig } from './tooltipConfig.js';
import { buildTooltipHTML } from './tooltipHTML.js';
import { computeTooltipPosition, physicalSide } from './tooltipPosition.js';
import { registerTooltipEvents, TOOLTIP_SHOW_EVENT, TOOLTIP_HIDE_EVENT } from './tooltipEvents.js';
import { reportTooltipIssue } from './tooltipErrors.js';

// Time after another tooltip hid during which a new one shows at once (moving along a toolbar); also at once while another
// tooltip is shown.
const WARM_MS = 300;
// How long a tooltip opened by a long press stays.
const LONG_PRESS_VISIBLE_MS = 1500;

// Measures a CSS length (a token) in pixels inside an element.
function measure( host, token )
{
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;inline-size:var(${token});`;
    host.appendChild(probe);
    const size = probe.offsetWidth;
    probe.remove();
    return size;
}

// Returns whether an element's text, or the text of an element inside it, is cut off (wider or taller than its box).
function isTruncated( element ) { return [ element, ...element.querySelectorAll('*') ].some(item => item.clientWidth > 0 && ( item.scrollWidth > item.clientWidth + 1 || item.scrollHeight > item.clientHeight + 1 )); }

// Adds or removes an id in an id-list attribute (aria-describedby, aria-labelledby) without touching the other ids.
function toggleIdRef( element, attribute, id, add )
{
    const ids = ( element.getAttribute(attribute) ?? '' ).split(/\s+/).filter(item => item && item !== id);
    if ( add ) { ids.push(id); }
    if ( ids.length ) { element.setAttribute(attribute,ids.join(' ')); } else { element.removeAttribute(attribute); }
}

// Renders a Tooltip and returns its runtime instance, or null after a developer error.
export function renderTooltip( container, config )
{
    if ( !container ) { reportTooltipIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTooltipConfig(config);
    if ( validateTooltipConfig(merged,container) ) { return null; }

    container.innerHTML = buildTooltipHTML(merged);
    const root = container.querySelector('.ui-tooltip');
    const textElement = root.querySelector('.ui-tooltip-text');
    const state = { visible:false, current:null, text:merged.text, disabled:merged.disabled, onBubble:false, otherVisible:false, otherHiddenAt:-Infinity, timers:{ show:0, hide:0, press:0 } };
    const single = merged.target;
    const linkAttribute = merged.purpose === 'LABEL' ? 'aria-labelledby' : 'aria-describedby';
    const clearTimer = name => { clearTimeout(state.timers[name]); state.timers[name] = 0; };
    let controller = null, destroyed = false;

    // Returns the target a node belongs to, or null: with targets, the nearest matching element that has a text for this
    // tooltip (an element without one, e.g. a hint another tooltip shows, passes the node on to the next one out).
    function find( node )
    {
        if ( !( node instanceof Element ) ) { return null; }
        if ( single ) { return single.contains(node) ? single : null; }
        for ( let element = node.closest(merged.targets.selector); element && merged.targets.within.contains(element); element = element.parentElement?.closest(merged.targets.selector) )
        {
            if ( textFor(element) ) { return element; }
        }
        return null;
    }

    // Returns the text for an element: the configured text (target), or targets.text(element), data-tooltip or its own text.
    function textFor( element )
    {
        if ( single ) { return state.text; }
        const custom = merged.targets.text?.(element);
        return String(custom ?? element.getAttribute('data-tooltip') ?? element.textContent ?? '').trim();
    }

    // Places the bubble next to the current target.
    function position()
    {
        const target = state.current;
        if ( !state.visible || !target ) { return; }
        if ( !target.isConnected ) { hideNow(); return; }
        const gap = measure(container,'--space-md-1'), inset = measure(container,'--space-md-3');
        const rtl = getComputedStyle(target).direction === 'rtl';
        const placed = computeTooltipPosition(target.getBoundingClientRect(),{ width:root.offsetWidth, height:root.offsetHeight },{ width:document.documentElement.clientWidth, height:document.documentElement.clientHeight },
            physicalSide(merged.placement,rtl),gap,gap,inset);
        root.dataset.side = placed.side;
        root.style.setProperty('--ui-tooltip-left',`${placed.left}px`);
        root.style.setProperty('--ui-tooltip-top',`${placed.top}px`);
        root.style.setProperty('--ui-tooltip-arrow',`${placed.arrow}px`);
    }

    // Shows the bubble for an element now (when it has a text and, with onlyWhenTruncated, is cut off).
    function showNow( element )
    {
        clearTimer('show'); clearTimer('hide');
        if ( destroyed || state.disabled || !element?.isConnected ) { return false; }
        const text = textFor(element);
        if ( !text || ( merged.onlyWhenTruncated && !isTruncated(element) ) ) { return false; }
        textElement.textContent = text;
        state.current = element;
        document.dispatchEvent(new CustomEvent(TOOLTIP_SHOW_EVENT,{ detail:{ id:merged.id } }));
        root.classList.add('ui-tooltip-open');
        if ( typeof root.showPopover === 'function' && !root.matches(':popover-open') ) { root.showPopover(); }
        state.visible = true;
        position();
        return true;
    }

    // Hides the bubble now.
    function hideNow()
    {
        clearTimer('show'); clearTimer('hide'); clearTimer('press');
        state.onBubble = false;
        if ( !state.visible ) { state.current = null; return; }
        state.visible = false;
        state.current = null;
        root.classList.remove('ui-tooltip-open');
        if ( typeof root.hidePopover === 'function' && root.matches(':popover-open') ) { root.hidePopover(); }
        document.dispatchEvent(new CustomEvent(TOOLTIP_HIDE_EVENT,{ detail:{ id:merged.id } }));
    }

    // Shows after the delay (at once when another tooltip hid a moment ago, or this one is already shown).
    function scheduleShow( element, immediate )
    {
        clearTimer('hide');
        if ( state.visible && state.current === element ) { return; }
        const warm = state.otherVisible || performance.now() - state.otherHiddenAt < WARM_MS || state.visible;
        if ( immediate || warm || !merged.showDelayMs ) { showNow(element); return; }
        clearTimer('show');
        state.timers.show = setTimeout(() => showNow(element),merged.showDelayMs);
    }

    // Hides after the delay unless the pointer moves onto the bubble.
    function scheduleHide()
    {
        clearTimer('show');
        if ( !state.visible ) { return; }
        clearTimer('hide');
        state.timers.hide = setTimeout(() => { if ( !state.onBubble ) { hideNow(); } },merged.hideDelayMs);
    }

    const instance =
    {
        id:merged.id,
        // Changes the text (target); an empty text hides the tooltip.
        setText:( text ) =>
        {
            if ( !single ) { reportTooltipIssue('OPTION_IGNORED',{ id:merged.id, key:'setText()', condition:'targets is used (the text comes from each element)' }); return; }
            state.text = String(text ?? '').trim();
            textElement.textContent = state.text;
            if ( !state.text ) { hideNow(); } else { position(); }
        },
        // Shows the tooltip now, next to the target (or a given element of targets); returns whether it is shown.
        show:( element ) => showNow(single ?? find(element)),
        // Hides the tooltip now.
        hide:() => hideNow(),
        // Turns the tooltip off or on (off: it hides and no longer shows).
        setDisabled:( disabled ) => { state.disabled = Boolean(disabled); if ( state.disabled ) { hideNow(); } },
        // Returns { visible, text, disabled }: text is the text shown (or the configured one while hidden).
        getState:() => ( { visible:state.visible, text:state.visible ? textElement.textContent : state.text, disabled:state.disabled } ),
        // Removes the listeners, the link from the target and the bubble, then clears the container.
        destroy:() =>
        {
            if ( destroyed ) { return; }
            hideNow();
            destroyed = true;
            controller?.abort();
            if ( single ) { toggleIdRef(single,linkAttribute,merged.id,false); }
            container.innerHTML = '';
        }
    };

    if ( single ) { textElement.textContent = state.text; toggleIdRef(single,linkAttribute,merged.id,true); }
    controller = registerTooltipEvents(single ?? merged.targets.within,root,find,
    {
        onEnter:element => scheduleShow(element,false),
        onLeave:() => scheduleHide(),
        onFocus:element => { if ( element.matches(':focus-visible') ) { scheduleShow(element,true); } },
        onBlur:() => hideNow(),
        onPress:() => hideNow(),
        onLongPress:element => { if ( showNow(element) ) { clearTimer('press'); state.timers.press = setTimeout(hideNow,LONG_PRESS_VISIBLE_MS); } },
        onBubbleEnter:() => { state.onBubble = true; clearTimer('hide'); },
        onBubbleLeave:next => { state.onBubble = false; if ( !( next instanceof Node && state.current?.contains(next) ) ) { scheduleHide(); } },
        onEscape:() => { if ( !state.visible ) { return false; } hideNow(); return true; },
        onViewportChange:() => position(),
        onOtherShown:id => { if ( id === merged.id ) { return; } state.otherVisible = true; if ( state.visible ) { hideNow(); } },
        onOtherHidden:id => { if ( id !== merged.id ) { state.otherVisible = false; state.otherHiddenAt = performance.now(); } }
    },merged.longPress);
    return instance;
}
