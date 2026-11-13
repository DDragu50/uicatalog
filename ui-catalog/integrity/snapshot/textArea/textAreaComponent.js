// textAreaComponent.js
//
// COMPONENT COORDINATOR.
// Owns lifecycle, error lifecycle, the remaining-characters counter and auto-grow. Markup is rendered once;
// value, counter, errors and ARIA relationships are updated in place.
// The container is a dedicated, consumer-owned mount point.

import { mergeTextAreaConfig, validateTextAreaConfig, truncateToMaxLength } from './textAreaConfig.js';
import { createTextAreaState } from './textAreaState.js';
import { buildTextAreaHTML, baseDescribedBy } from './textAreaHTML.js';
import { registerTextAreaEvents } from './textAreaEvents.js';
import { validateTextArea } from './textAreaValidation.js';
import { getTextAreaError, TEXTAREA_ERRORS, reportTextAreaIssue } from './textAreaErrors.js';

// Renders an interactive TextArea and returns its runtime instance, or null after a developer error.
export function renderTextArea( container, config, onValueChange, onValidation )
{
    if ( !container ) { reportTextAreaIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTextAreaConfig(config);
    if ( validateTextAreaConfig(merged) ) { return null; }

    container.innerHTML = buildTextAreaHTML(merged);
    const state = createTextAreaState(merged);
    const field = container.querySelector('.ui-text-area-field');
    const errorElement = container.querySelector('.ui-text-area-error');
    const counter = container.querySelector('.ui-text-area-counter');
    const announcer = container.querySelector(`[id="${merged.id}-announcer"]`);
    let controller = null, errorTimer = null, resizeObserver = null, lastWidth = 0, instance = null;

    // Cancels an active temporary-error timer.
    function clearErrorTimer() { if ( errorTimer ) { clearTimeout(errorTimer); errorTimer = null; } }

    // Shows or clears the current error in place: message, aria-invalid and aria-describedby.
    function renderError()
    {
        if ( !field ) { return; }
        errorElement.textContent = state.error?.message ?? '';
        errorElement.hidden = !state.error;
        field.setAttribute('aria-invalid',String(Boolean(state.error)));
        const describedBy = [ ...baseDescribedBy(merged), state.error ? errorElement.id : '' ].filter(Boolean).join(' ');
        if ( describedBy ) { field.setAttribute('aria-describedby',describedBy); } else { field.removeAttribute('aria-describedby'); }
    }

    // Applies an error label (or null), updates the display and schedules temporary errors.
    function applyError( errorLabel )
    {
        clearErrorTimer();
        const next = errorLabel ? ( errorLabel === 'EXTERNAL' ? { ...TEXTAREA_ERRORS.EXTERNAL, message:state.external } : getTextAreaError(errorLabel,merged) ) : null;
        if ( state.error?.errorLabel !== next?.errorLabel ) { state.error = next; renderError(); }
        if ( next?.visibility === 'temporary' )
        {
            errorTimer = setTimeout(() => { errorTimer = null; if ( state.error?.errorLabel === next.errorLabel ) { state.error = null; renderError(); } },merged.errorVisibilityDuration);
        }
    }

    // Notifies the consumer only when the effective validation result changes.
    function notifyValidation( result )
    {
        if ( state.lastResult?.valid === result.valid && state.lastResult?.errorLabel === result.errorLabel ) { return; }
        state.lastResult = { ...result };
        if ( typeof onValidation === 'function' ) { onValidation({ ...result },instance); }
    }

    // Runs validation for a mode, applies the error visibility policy and returns a copy of { valid, errorLabel }.
    function runValidation( mode )
    {
        let result = validateTextArea(merged,state.value,mode);
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        if ( mode !== 'input' ) { applyError(result.errorLabel); }
        else if ( state.error?.visibility === 'corrective' ) { applyError(result.errorLabel); }
        notifyValidation(result);
        return { ...result };
    }

    // Updates the counter text and warning style; announces entering the warning zone and reaching the limit.
    function updateCounter( announce )
    {
        if ( !counter ) { return; }
        const remaining = Math.max(0,merged.validation.maxLength - state.value.length);
        const text = ( remaining === 1 ? merged.texts.counterSingular : merged.texts.counter ).replace('{remaining}',new Intl.NumberFormat(merged.locale).format(remaining));
        const zone = remaining === 0 ? 'LIMIT' : remaining < merged.counterWarningThreshold ? 'WARNING' : 'NORMAL';
        counter.textContent = text;
        counter.classList.toggle('ui-text-area-counter-warning',zone !== 'NORMAL');
        if ( announce && zone !== 'NORMAL' && zone !== state.counterZone ) { announcer.textContent = text; }
        state.counterZone = zone;
    }

    // Grows the field with its content between rows and maxRows (auto-grow only), then scrolls.
    function autoGrow()
    {
        if ( !merged.autoGrow || !field ) { return; }
        const style = getComputedStyle(field);
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
        const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        const maxHeight = lineHeight * merged.maxRows + chrome;
        field.style.setProperty('--ui-text-area-height','auto');
        const needed = field.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        field.style.setProperty('--ui-text-area-height',`${Math.min(needed,maxHeight)}px`);
        field.style.setProperty('--ui-text-area-overflow',needed > maxHeight ? 'auto' : 'hidden');
    }

    // Handles a user edit: truncation to maxLength, dirty flag, counter, auto-grow, validation and notification.
    function handleInput()
    {
        const value = field.value;
        const truncated = truncateToMaxLength(merged,value);
        if ( truncated !== value ) { field.value = truncated; }
        const changed = truncated !== state.value;
        state.value = truncated;
        if ( changed ) { state.isDirty = true; state.external = null; }
        updateCounter(true);
        autoGrow();
        if ( truncated.length < value.replace(/\r\n?/g,'\n').length ) { applyError('MAX_LENGTH'); } else { runValidation('input'); }
        if ( changed && typeof onValueChange === 'function' ) { onValueChange(truncated,instance); }
    }

    instance =
    {
        id:merged.id,
        name:merged.name,
        // Returns the effective label position: TOP or START (INHERIT follows an ancestor with the class ui-labels-start).
        getLabelPosition:() => ( merged.labelPosition !== 'INHERIT' ? merged.labelPosition : container.closest('.ui-labels-start') ? 'START' : 'TOP' ),
        // Returns the field's visible label (form-field contract: Form prefixes summary messages with it).
        getLabel:() => merged.label,
        // Returns { mandatory, indicator } (form-field contract: Form shows the "* Required field" note when an asterisk is shown).
        getMandatoryState:() => ({ mandatory:merged.mandatory, indicator:merged.mandatoryIndicator }),
        // Shows an external error (e.g. from the server) until the user changes the value or clearError() is called; returns { valid, errorLabel }.
        setError:( message ) => { state.external = String(message ?? '').trim() || null; return runValidation('final'); },
        // Removes an external error (own validation errors stay as they are).
        clearError:() => { const shown = state.error?.errorLabel === 'EXTERNAL'; state.external = null; if ( shown ) { runValidation('final'); } },
        // Returns the current value.
        getValue:() => state.value,
        // Returns a copy of the current error, or null.
        getError:() => state.error ? { ...state.error } : null,
        // Sets a programmatic value (truncated when required); not dirty, no onValueChange; returns { valid, errorLabel }.
        // options.quiet (Form's quiet reset): sets the value without validating, clears any shown error and the changed state.
        setValue:( value, options = {} ) =>
        {
            state.value = truncateToMaxLength(merged,value);
            if ( field ) { field.value = state.value; }
            const view = container.querySelector('.ui-text-area-view-value');
            if ( view ) { view.textContent = state.value; }
            updateCounter(false);
            autoGrow();
            if ( options?.quiet ) { state.external = null; state.isDirty = false; applyError(null); return { ...validateTextArea(merged,state.value,'final') }; }
            return runValidation('final');
        },
        // Runs final validation and returns { valid, errorLabel }.
        validate:() => runValidation('final'),
        // Returns whether the user has changed the value.
        isDirty:() => state.isDirty,
        // Moves focus to the field; returns whether it received focus.
        focus:() => { field?.focus(); return Boolean(field) && document.activeElement === field; },
        // Removes listeners, timers and the resize observer, then clears the container.
        destroy:() => { clearErrorTimer(); controller?.abort(); resizeObserver?.disconnect(); container.innerHTML = ''; }
    };

    if ( field && merged.state === 'EDIT' )
    {
        controller = registerTextAreaEvents(field,{ onInput:handleInput, onBlur:() => { if ( state.isDirty ) { runValidation('blur'); } } });
        if ( merged.autoGrow && typeof ResizeObserver === 'function' )
        {
            resizeObserver = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if ( width !== lastWidth ) { lastWidth = width; autoGrow(); } });
            resizeObserver.observe(field);
        }
        updateCounter(false);
        autoGrow();
        if ( merged.autoFocus ) { field.focus(); }
    }
    return instance;
}
