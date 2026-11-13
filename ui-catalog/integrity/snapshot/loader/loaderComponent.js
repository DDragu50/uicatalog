// loaderComponent.js
//
// COMPONENT COORDINATOR.
// Shows that a long action runs: a bar or a ring, indeterminate until the application gives a value, with a label, a
// value text and an optional Cancel Button (created through its public entry point). Waits showDelayMs before showing
// (quick actions never flash), stays at least minVisibleMs once shown, then shows the end status (DONE, ERROR, CANCELLED)
// and hides after hideAfterMs (ERROR stays until hide() or start()). OVERLAY covers and blocks a target region from the
// start: mouse (the layer), keyboard and screen readers (inert on everything but the layer), aria-busy, focus moved into
// the layer and back. The container is a dedicated, consumer-owned mount point.

import { mergeLoaderConfig, validateLoaderConfig, resolveLoaderTarget, LOADER_END_STATUSES } from './loaderConfig.js';
import { buildLoaderHTML, fillText, STATUS_SYMBOLS } from './loaderHTML.js';
import { createLoaderState, progressOf } from './loaderState.js';
import { reportLoaderIssue } from './loaderErrors.js';
import { renderButton } from '../button/buttonIndex.js';

// Elements that take focus with Tab (used to give focus back to the start of an OVERLAY target).
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
// The arc of an indeterminate ring: a quarter of the circle (pathLength 100).
const RING_ARC = '25 75';

// Renders a Loader and returns its runtime instance, or null after a developer error.
export function renderLoader( container, config )
{
    if ( !container ) { reportLoaderIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeLoaderConfig(config);
    if ( validateLoaderConfig(merged) ) { return null; }
    const target = resolveLoaderTarget(merged,container);
    if ( merged.placement !== 'INLINE' && !target ) { return null; }

    container.innerHTML = buildLoaderHTML(merged);
    const root = container.querySelector('.ui-loader');
    const frame = root.querySelector('.ui-loader-frame');
    const indicator = root.querySelector('.ui-loader-indicator');
    const label = root.querySelector('.ui-loader-label');
    const valueText = root.querySelector('.ui-loader-value');
    const symbol = root.querySelector('.ui-loader-symbol');
    const arc = root.querySelector('.ui-loader-circle-arc');
    const live = root.querySelector('.ui-loader-live');
    const alert = root.querySelector('.ui-loader-alert');
    const cancelHost = root.querySelector('.ui-loader-cancel');
    const state = createLoaderState(merged);
    const overlay = merged.placement === 'OVERLAY';
    // OVERLAY blocking: whether it is on, the elements made inert, the observer that blocks new content, the element that
    // had focus, the target's own aria-busy; and whether the positioning classes are on the target (EDGE, OVERLAY).
    const blocking = { active:false, inert:[], observer:null, focus:null, busy:null, attached:false };
    let cancelButton = null, instance = null, destroyed = false;

    const isEnd = () => LOADER_END_STATUSES.includes(state.status);
    const clearTimer = name => { clearTimeout(state.timers[name]); state.timers[name] = null; };

    // Returns the value text: the application's own text, "12 of 30" or "45%" ('' when indeterminate).
    function describeValue()
    {
        if ( state.value === null ) { return ''; }
        if ( state.detail ) { return state.detail; }
        return merged.valueText === 'COUNT' ? fillText(merged.texts.count,{ value:state.value, max:merged.max }) : fillText(merged.texts.percent,{ value:Math.round(progressOf(state,merged) * 100) });
    }

    // Writes a text into a live region (a repeated text gets a trailing no-break space, so it is announced again).
    function announce( region, text ) { region.textContent = text && text === region.textContent ? `${text} ` : text; }

    // Puts the positioning classes on the target (EDGE while shown, OVERLAY while blocking), or takes them off.
    function attachTarget( attach )
    {
        if ( !target || blocking.attached === attach ) { return; }
        blocking.attached = attach;
        if ( attach ) { target.classList.add('ui-loader-target'); if ( getComputedStyle(target).position === 'static' ) { target.classList.add('ui-loader-target-static'); } }
        else { target.classList.remove('ui-loader-target','ui-loader-target-static'); }
    }

    // Moves focus to the indicator when it is on an element about to be hidden or disabled (Cancel).
    function keepFocus( element ) { if ( element && element.contains(document.activeElement) ) { indicator.focus({ preventScroll:true }); } }

    // Writes the look, the texts, the value and the progress-bar attributes from the state.
    function refresh()
    {
        const end = isEnd();
        const share = end && ( state.status === 'DONE' || state.value === null ) ? 1 : progressOf(state,merged);
        const determinate = state.value !== null || end;
        root.dataset.status = state.status;
        root.classList.toggle('ui-loader-indeterminate',!determinate);
        root.classList.toggle('ui-loader-shown',state.visible);
        root.classList.toggle('ui-loader-blocking',blocking.active);
        root.style.setProperty('--ui-loader-progress',String(share));
        arc?.setAttribute('stroke-dasharray',determinate ? `${share * 100} 100` : RING_ARC);
        frame.hidden = !state.visible && !blocking.active;
        label.textContent = end ? state.endText : state.label;
        valueText.textContent = end ? '' : ( merged.valueText === 'NONE' && !state.detail ? '' : describeValue() );
        symbol.className = `ui-loader-symbol${end ? ` ${STATUS_SYMBOLS[state.status]}` : ''}`;
        const now = state.status === 'DONE' ? merged.max : state.value;
        if ( now === null || ( end && state.status !== 'DONE' && state.value === null ) ) { indicator.removeAttribute('aria-valuenow'); } else { indicator.setAttribute('aria-valuenow',String(now)); }
        if ( !end && state.value !== null ) { indicator.setAttribute('aria-valuetext',state.detail || describeValue()); } else { indicator.removeAttribute('aria-valuetext'); }
        if ( cancelHost )
        {
            const running = state.status === 'RUNNING';
            if ( !running || state.cancelPressed ) { keepFocus(cancelHost); }
            cancelHost.hidden = !running;
            cancelButton?.setDisabled(state.cancelPressed);
            cancelButton?.setDescription(state.label);
        }
    }

    // Makes everything in the target inert except the path to the Loader (also content added while blocking).
    function applyInert()
    {
        for ( let node = container; node && node !== target; node = node.parentElement )
        {
            const parent = node.parentElement;
            if ( !parent ) { break; }
            [ ...parent.children ].forEach(sibling =>
            {
                if ( sibling !== node && !sibling.inert ) { sibling.inert = true; blocking.inert.push(sibling); }
            });
        }
    }

    // OVERLAY: blocks the target at once (the layer is shown later): positioning classes, aria-busy, focus into the
    // layer when it was inside the target, inert content.
    function block()
    {
        if ( !overlay || blocking.active ) { return; }
        blocking.active = true;
        attachTarget(true);
        blocking.busy = target.getAttribute('aria-busy');
        target.setAttribute('aria-busy','true');
        refresh();
        const active = document.activeElement;
        if ( active && active !== document.body && target.contains(active) && !root.contains(active) ) { blocking.focus = active; indicator.focus({ preventScroll:true }); }
        applyInert();
        blocking.observer = new MutationObserver(applyInert);
        blocking.observer.observe(target,{ childList:true, subtree:true });
    }

    // OVERLAY: releases the target and gives focus back (to the element that had it, else the start of the target).
    function unblock()
    {
        if ( !blocking.active ) { return; }
        blocking.active = false;
        blocking.observer?.disconnect(); blocking.observer = null;
        blocking.inert.splice(0).forEach(element => { element.inert = false; });
        if ( blocking.busy === null ) { target.removeAttribute('aria-busy'); } else { target.setAttribute('aria-busy',blocking.busy); }
        attachTarget(false);
        const active = document.activeElement, saved = blocking.focus;
        blocking.focus = null;
        if ( !root.contains(active) && !( saved && ( !active || active === document.body ) ) ) { return; }
        if ( saved && saved.isConnected && target.contains(saved) && !saved.closest('[inert]') ) { saved.focus(); return; }
        [ ...target.querySelectorAll(FOCUSABLE) ].find(element => !root.contains(element) && !element.closest('[inert]'))?.focus();
    }

    // Shows the indicator (after the delay): announces the label (and the value), moves focus to Cancel in an OVERLAY.
    function show()
    {
        clearTimer('show');
        if ( state.visible ) { return; }
        state.visible = true;
        state.shownAt = performance.now();
        if ( merged.placement === 'EDGE' ) { attachTarget(true); }
        if ( merged.announceEvery && state.value !== null ) { state.milestone = Math.floor(progressOf(state,merged) * 100 / merged.announceEvery); }
        refresh();
        if ( state.status === 'RUNNING' ) { announce(live,[ state.label, describeValue() ].filter(Boolean).join(' ')); }
        if ( overlay && cancelButton && document.activeElement === indicator ) { cancelButton.getElement().focus({ preventScroll:true }); }
    }

    // Hides at once: the indicator, the EDGE classes and the OVERLAY blocking.
    function hideNow()
    {
        clearTimer('show'); clearTimer('hide');
        state.visible = false;
        if ( merged.placement === 'EDGE' ) { attachTarget(false); }
        unblock();
        refresh();
    }

    // Hides after a delay, never before minVisibleMs from showing.
    function scheduleHide( delay )
    {
        clearTimer('hide');
        const remaining = state.visible ? Math.max(0,merged.minVisibleMs - ( performance.now() - state.shownAt )) : 0;
        const wait = Math.max(delay,remaining);
        if ( wait ) { state.timers.hide = setTimeout(hideNow,wait); } else { hideNow(); }
    }

    // Announces a milestone (every announceEvery percent) while shown.
    function announceMilestone()
    {
        if ( !state.visible || !merged.announceEvery || state.value === null ) { return; }
        const reached = Math.floor(progressOf(state,merged) * 100 / merged.announceEvery);
        if ( reached > state.milestone ) { state.milestone = reached; announce(live,[ state.label, describeValue() ].filter(Boolean).join(' ')); }
    }

    // Starts (or restarts) the action: RUNNING, indeterminate, blocking at once (OVERLAY), shown after the delay.
    function start( text, value = null )
    {
        clearTimer('show'); clearTimer('hide');
        state.token++;
        state.status = 'RUNNING';
        state.value = value; state.detail = ''; state.endText = ''; state.cancelPressed = false; state.milestone = 0;
        state.label = String(text ?? '').trim() || merged.label || merged.texts.loading;
        block();
        refresh();
        if ( state.visible ) { announce(live,state.label); }
        else if ( merged.showDelayMs ) { state.timers.show = setTimeout(show,merged.showDelayMs); }
        else { show(); }
    }

    // Ends the action with DONE, ERROR or CANCELLED. Not shown yet: DONE and CANCELLED stay hidden, ERROR is shown at once.
    function finish( status, text )
    {
        clearTimer('show');
        state.token++;
        state.status = status;
        state.endText = String(text ?? '').trim() || merged.texts[status === 'DONE' ? 'done' : status === 'ERROR' ? 'error' : 'cancelled'];
        if ( !state.visible && status !== 'ERROR' ) { unblock(); refresh(); return; }
        if ( !state.visible ) { state.visible = true; state.shownAt = performance.now(); if ( merged.placement === 'EDGE' ) { attachTarget(true); } }
        refresh();
        announce(status === 'ERROR' ? alert : live,state.endText);
        if ( status !== 'ERROR' ) { scheduleHide(merged.hideAfterMs); }
    }

    // Reports a method used while the Loader is not running.
    function running( method )
    {
        if ( state.status === 'RUNNING' ) { return true; }
        reportLoaderIssue('NOT_RUNNING',{ id:merged.id, method });
        return false;
    }

    instance =
    {
        id:merged.id,
        // Starts the action (indeterminate) with an optional label; restarts a running or ended Loader.
        start:( text ) => { if ( !destroyed ) { start(text); } },
        // Sets the value (0–max, clamped; null: indeterminate again) and an optional value text; returns whether it was applied.
        setValue:( value, text ) =>
        {
            if ( !running('setValue()') ) { return false; }
            if ( value === null ) { state.value = null; state.detail = ''; refresh(); return true; }
            const number = Number(value);
            if ( value === '' || typeof value === 'boolean' || !Number.isFinite(number) ) { reportLoaderIssue('INVALID_VALUE',{ id:merged.id, value, result:'the value is not changed' }); return false; }
            state.value = Math.min(Math.max(number,0),merged.max);
            state.detail = String(text ?? '').trim();
            refresh();
            announceMilestone();
            return true;
        },
        // Changes the label (empty: the configured label or texts.loading).
        setLabel:( text ) => { state.label = String(text ?? '').trim() || merged.label || merged.texts.loading; refresh(); },
        // Ends the action: 'DONE', 'ERROR' or 'CANCELLED', with an optional text; returns whether it was applied.
        setStatus:( status, text ) =>
        {
            const value = String(status ?? '').trim().toUpperCase();
            if ( !LOADER_END_STATUSES.includes(value) ) { reportLoaderIssue('INVALID_STATUS',{ id:merged.id, value:status }); return false; }
            if ( !running('setStatus()') ) { return false; }
            finish(value,text);
            return true;
        },
        // Hides the Loader (after the rest of minVisibleMs) and ends the OVERLAY blocking; a running action becomes IDLE.
        hide:() =>
        {
            if ( destroyed ) { return; }
            clearTimer('show');
            state.token++;
            if ( state.status === 'RUNNING' ) { state.status = 'IDLE'; }
            scheduleHide(0);
        },
        // Shows the Loader while a Promise is pending: start(texts.label), then DONE (texts.done) or ERROR (texts.error).
        // Returns the same Promise.
        track:( promise, texts = {} ) =>
        {
            if ( !promise || typeof promise.then !== 'function' ) { reportLoaderIssue('INVALID_PROMISE',{ id:merged.id }); return promise; }
            if ( destroyed ) { return promise; }
            start(texts?.label);
            const token = state.token;
            const settle = ( status, text ) => { if ( !destroyed && token === state.token && state.status === 'RUNNING' ) { finish(status,text); } };
            promise.then(() => settle('DONE',texts?.done),() => settle('ERROR',texts?.error));
            return promise;
        },
        // Returns { status, visible, value, max, label }: status IDLE, RUNNING, DONE, ERROR or CANCELLED; value null when
        // indeterminate; label the text shown (the end text after the end).
        getState:() => ( { status:state.status, visible:state.visible, value:state.value, max:merged.max, label:isEnd() ? state.endText : state.label } ),
        // Clears the timers, ends the blocking, removes the Cancel Button and clears the container.
        destroy:() =>
        {
            if ( destroyed ) { return; }
            destroyed = true;
            clearTimer('show'); clearTimer('hide');
            unblock(); attachTarget(false);
            cancelButton?.destroy(); cancelButton = null;
            container.innerHTML = '';
        }
    };

    if ( cancelHost )
    {
        cancelButton = renderButton(cancelHost,{ id:`${merged.id}-cancel`, label:merged.texts.cancel, hierarchy:'TERTIARY', size:'SMALL' },() =>
        {
            if ( state.status !== 'RUNNING' || state.cancelPressed ) { return; }
            state.cancelPressed = true;
            refresh();
            merged.onCancel(instance);
        });
    }
    refresh();
    if ( merged.running ) { start('',merged.value); }
    return instance;
}
