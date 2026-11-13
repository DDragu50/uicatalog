// toggleComponent.js
//
// COMPONENT COORDINATOR.
// SWITCH: a native role="switch" checkbox (value true/false) with busy state for immediate-effect settings.
// RADIO: two native radio buttons (value true/false/null) with the required-answer error lifecycle.
// No other framework component is used. The container is a dedicated, consumer-owned mount point.

import { mergeToggleConfig, validateToggleConfig } from './toggleConfig.js';
import { createToggleState } from './toggleState.js';
import { buildToggleHTML, viewText } from './toggleHTML.js';
import { registerSwitchEvents, registerRadioEvents } from './toggleEvents.js';
import { getToggleError, TOGGLE_ERRORS, reportToggleIssue } from './toggleErrors.js';

// Renders a Toggle and returns its runtime instance, or null after a developer error.
export function renderToggle( container, config, onValueChange, onValidation )
{
    if ( !container ) { reportToggleIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeToggleConfig(config);
    if ( validateToggleConfig(merged) ) { return null; }

    container.innerHTML = buildToggleHTML(merged);
    const state = createToggleState(merged);
    const root = container.querySelector('.ui-toggle');
    const input = container.querySelector('.ui-toggle-input');
    const radios = [ ...container.querySelectorAll('.ui-toggle-radio-input') ];
    const errorElement = container.querySelector('.ui-toggle-error');
    const stateTextElement = container.querySelector('.ui-toggle-state');
    let controller = null, instance = null;

    // Returns { valid, errorLabel } for the current value (only an unanswered mandatory RADIO is invalid).
    function currentResult() { return merged.presentation === 'RADIO' && merged.mandatory && state.value === null ? { valid:false, errorLabel:'REQUIRED' } : { valid:true, errorLabel:null }; }

    // Notifies the consumer only when the effective validation result changes.
    function notifyValidation( result )
    {
        if ( state.lastResult?.valid === result.valid && state.lastResult?.errorLabel === result.errorLabel ) { return; }
        state.lastResult = { ...result };
        if ( typeof onValidation === 'function' ) { onValidation({ ...result },instance); }
    }

    // Shows or clears the error in place (RADIO required error; external errors for both presentations): message, group error style, aria-invalid and aria-describedby.
    function renderError()
    {
        if ( !errorElement ) { return; }
        errorElement.textContent = state.error?.message ?? '';
        errorElement.hidden = !state.error;
        root.classList.toggle('ui-toggle-invalid',Boolean(state.error));
        const describedBy = [ merged.help ? `${merged.id}-help` : '', state.error ? errorElement.id : '' ].filter(Boolean).join(' ');
        [ ...radios, ...( input ? [ input ] : [] ) ].forEach(control => { control.setAttribute('aria-invalid',String(Boolean(state.error))); if ( describedBy ) { control.setAttribute('aria-describedby',describedBy); } else { control.removeAttribute('aria-describedby'); } });
    }

    // Runs validation; "input" only clears a visible error, "final" shows or clears it. Returns { valid, errorLabel }.
    function runValidation( mode )
    {
        let result = currentResult();
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        if ( mode === 'final' || state.error )
        {
            const next = result.errorLabel ? ( result.errorLabel === 'EXTERNAL' ? { ...TOGGLE_ERRORS.EXTERNAL, message:state.external } : getToggleError(result.errorLabel,merged) ) : null;
            if ( state.error?.errorLabel !== next?.errorLabel ) { state.error = next; renderError(); }
        }
        notifyValidation(result);
        return { ...result };
    }

    // Stores a user change, marks dirty, clears a corrected error and notifies the consumer.
    function userChange( value )
    {
        if ( value === state.value ) { return; }
        state.value = value;
        state.isDirty = true;
        state.external = null;
        runValidation('input');
        if ( typeof onValueChange === 'function' ) { onValueChange(value,instance); }
    }

    // Applies the value to the native controls and the current state text.
    function syncControls()
    {
        if ( input ) { input.checked = state.value === true; }
        radios.forEach(radio => { radio.checked = ( radio.value === 'TRUE' && state.value === true ) || ( radio.value === 'FALSE' && state.value === false ); });
        if ( stateTextElement ) { stateTextElement.textContent = state.value ? stateTextElement.dataset.on : stateTextElement.dataset.off; }
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
        // Returns true, false, or null (RADIO unanswered).
        getValue:() => state.value,
        // Returns a copy of the current error, or null (RADIO only).
        getError:() => state.error ? { ...state.error } : null,
        // Sets the value programmatically (e.g. to revert after a failed save); not dirty, no onValueChange; returns { valid, errorLabel }.
        // options.quiet (Form's quiet reset): sets the value without validating, clears any shown error and the changed state.
        setValue:( value, options = {} ) =>
        {
            const allowed = merged.presentation === 'RADIO' ? [ true, false, null ] : [ true, false ];
            if ( !allowed.includes(value) ) { reportToggleIssue('INVALID_OPTION',{ id:merged.id, key:'setValue()', value, fallback:String(state.value) }); return currentResult(); }
            state.value = value;
            const view = container.querySelector('.ui-toggle-view-value');
            if ( view ) { view.textContent = viewText(merged,value); }
            syncControls();
            if ( options?.quiet ) { state.external = null; state.isDirty = false; state.error = null; renderError(); return currentResult(); }
            return runValidation('final');
        },
        // Runs validation (RADIO: shows or clears the required error) and returns { valid, errorLabel }.
        validate:() => runValidation('final'),
        // Returns whether the user has changed the value.
        isDirty:() => state.isDirty,
        // Moves focus to the switch, or to the chosen (else first) radio; returns whether it received focus.
        focus:() =>
        {
            const target = input ?? radios.find(radio => radio.checked && !radio.disabled) ?? radios.find(radio => !radio.disabled);
            target?.focus();
            return Boolean(target) && document.activeElement === target;
        },
        // Shows or hides the busy state (SWITCH): blocks toggling while the page saves the new value.
        setBusy:( busy ) =>
        {
            state.busy = Boolean(busy) && Boolean(input);
            root?.classList.toggle('ui-toggle-busy',state.busy);
            input?.setAttribute('aria-busy',String(state.busy));
        },
        // Removes listeners, then clears the container.
        destroy:() => { controller?.abort(); container.innerHTML = ''; }
    };

    if ( merged.state === 'EDIT' && input )
    {
        controller = registerSwitchEvents(root,input,
        {
            isBusy:() => state.busy,
            onChange:() => { userChange(input.checked); syncControls(); },
            onSideClick:value => { if ( input.disabled ) { return; } if ( !state.busy && value !== state.value ) { userChange(value); syncControls(); } input.focus(); }
        });
    }
    if ( merged.state === 'EDIT' && radios.length ) { controller = registerRadioEvents(root,{ onChange:userChange, onLeave:() => { if ( state.isDirty ) { runValidation('final'); } } }); }
    if ( merged.autoFocus && merged.state === 'EDIT' ) { instance.focus(); }
    return instance;
}
