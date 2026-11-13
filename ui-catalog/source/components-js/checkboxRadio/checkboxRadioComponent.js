// checkboxRadioComponent.js
//
// COMPONENT COORDINATOR.
// The container is a dedicated, consumer-owned mount point.
// The native inputs are the authoritative checked and disabled state; presentation derives from input.checked.
// User change: read inputs → state → ICON/CHIP sync → clear corrected visible error → onValueChange.

import { mergeCheckboxRadioConfig, validateCheckboxRadioConfig } from './checkboxRadioConfig.js';
import { buildCheckboxRadioHTML, getIconClass, buildOptionChip } from './checkboxRadioHTML.js';
import { bindCheckboxRadioEvents } from './checkboxRadioEvents.js';
import { createCheckboxRadioState, getSelectedValues, setSelectedValues, setCheckboxRadioError } from './checkboxRadioState.js';
import { validateSelection } from './checkboxRadioValidation.js';
import { getCheckboxRadioError, CHECKBOX_RADIO_ERRORS, reportCheckboxRadioIssue } from './checkboxRadioErrors.js';

// Reads the effective selection from the native inputs in option order.
function readSelectedValues( root ) { return [ ...root.querySelectorAll('.ui-checkbox-radio-input:checked') ].map(input => input.value); }

// Updates ICON/CHIP visuals only for options whose native checked state changed.
function syncPresentation( root, config )
{
    root.querySelectorAll('.ui-checkbox-radio-option').forEach(option =>
    {
        const selected = option.querySelector('.ui-checkbox-radio-input').checked;
        if ( option.dataset.selected === String(selected) ) { return; }
        option.dataset.selected = String(selected);
        if ( config.presentation === 'ICON' ) { option.querySelector('.ui-checkbox-radio-icon i').className = getIconClass(config,selected); }
        if ( config.presentation === 'CHIP' ) { const label = config.options.find(item => String(item.index) === option.dataset.index).label; option.querySelector('.ui-checkbox-radio-chip').innerHTML = buildOptionChip(label,selected); }
    });
}

// Shows or clears the error message, group-label error treatment and input relationships (help, then error).
function renderValidation( root, state )
{
    const invalid = Boolean(state.error), error = root.querySelector('.ui-checkbox-radio-error');
    root.classList.toggle('ui-checkbox-radio-invalid',invalid);
    error.textContent = state.error?.message ?? '';
    error.hidden = !invalid;
    const help = root.querySelector('.ui-checkbox-radio-help');
    const describedBy = [ help?.id ?? '', invalid ? error.id : '' ].filter(Boolean).join(' ');
    root.querySelectorAll('.ui-checkbox-radio-input').forEach(input =>
    {
        if ( invalid ) { input.setAttribute('aria-invalid','true'); } else { input.removeAttribute('aria-invalid'); }
        if ( describedBy ) { input.setAttribute('aria-describedby',describedBy); } else { input.removeAttribute('aria-describedby'); }
    });
}

// Creates an interactive CheckboxRadio instance, or returns null after a developer error without rendering.
export function renderCheckboxRadio( container, config, onValueChange = null )
{
    if ( !container ) { reportCheckboxRadioIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeCheckboxRadioConfig(config);
    if ( validateCheckboxRadioConfig(merged) ) { return null; }

    container.innerHTML = buildCheckboxRadioHTML(merged);
    const root = container.querySelector('.ui-checkbox-radio');
    const state = createCheckboxRadioState(merged);
    const controller = new AbortController();
    const callback = typeof onValueChange === 'function' ? onValueChange : null;
    let instance = null;

    // Runs validation and shows or clears the error.
    function runValidation()
    {
        let result = validateSelection(merged,getSelectedValues(state));
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        setCheckboxRadioError(state,result.valid ? null : ( result.errorLabel === 'EXTERNAL' ? { ...CHECKBOX_RADIO_ERRORS.EXTERNAL, message:state.external } : getCheckboxRadioError(result.errorLabel,merged) ));
        renderValidation(root,state);
        return result;
    }

    // Handles one user-generated native change.
    function handleChange()
    {
        const previous = getSelectedValues(state), current = readSelectedValues(root);
        setSelectedValues(state,current);
        state.isDirty = true;
        state.external = null;
        syncPresentation(root,merged);
        if ( state.error && validateSelection(merged,current).valid ) { setCheckboxRadioError(state,null); renderValidation(root,state); }
        if ( callback && previous.join('\u0000') !== current.join('\u0000') ) { callback([ ...current ],instance); }
    }

    // Validates when the user leaves the group after changing it; tabbing through shows no error.
    function handleLeave() { if ( state.isDirty ) { runValidation(); } }

    bindCheckboxRadioEvents(root,controller.signal,handleChange,handleLeave);

    instance =
    {
        id:merged.id,
        name:merged.name,
        // Returns the effective label position: TOP or START (INHERIT follows an ancestor with the class ui-labels-start).
        getLabelPosition:() => ( merged.labelPosition !== 'INHERIT' ? merged.labelPosition : container.closest('.ui-labels-start') ? 'START' : 'TOP' ),
        // Returns the field's visible label (form-field contract: Form prefixes summary messages with it).
        getLabel:() => merged.groupLabel,
        // Returns { mandatory, indicator } (form-field contract: Form shows the "* Required field" note when an asterisk is shown).
        getMandatoryState:() => ({ mandatory:merged.mandatory, indicator:merged.mandatoryIndicator }),
        // Shows an external error (e.g. from the server) until the user changes the value or clearError() is called; returns { valid, errorLabel }.
        setError:( message ) => { state.external = String(message ?? '').trim() || null; return runValidation(); },
        // Removes an external error (own validation errors stay as they are).
        clearError:() => { const shown = state.error?.errorLabel === 'EXTERNAL'; state.external = null; if ( shown ) { runValidation(); } },
        // Returns a new array with the current selection.
        getValue:() => getSelectedValues(state),
        // Sets the selection programmatically (no onValueChange, not dirty) and returns { valid, errorLabel }.
        // options.quiet (Form's quiet reset): sets the value without validating, clears any shown error and the changed state.
        setValue:( values, options = {} ) =>
        {
            const wanted = ( Array.isArray(values) ? values : [ values ] ).filter(value => value !== undefined && value !== null && value !== '').map(String);
            const known = merged.options.map(option => option.value);
            const next = ( merged.selectionMode === 'SINGLE' ? wanted.slice(0,1) : wanted ).filter(value => known.includes(value));
            root.querySelectorAll('.ui-checkbox-radio-input').forEach(input => { input.checked = next.includes(input.value); });
            setSelectedValues(state,next);
            syncPresentation(root,merged);
            if ( options?.quiet ) { state.external = null; state.isDirty = false; setCheckboxRadioError(state,null); renderValidation(root,state); return { ...validateSelection(merged,next) }; }
            return runValidation();
        },
        // Returns whether the user has changed the selection.
        isDirty:() => state.isDirty,
        // Returns a copy of the current validation error, or null.
        getError:() => state.error ? { ...state.error } : null,
        // Runs consumer-triggered validation and shows or clears the error.
        validate:() => runValidation(),
        // Focuses the selected enabled option, else the first enabled one; returns whether an option received focus.
        focus:() =>
        {
            const target = root.querySelector('.ui-checkbox-radio-input:checked:enabled') ?? root.querySelector('.ui-checkbox-radio-input:enabled');
            target?.focus();
            return Boolean(target) && document.activeElement === target;
        },
        // Removes the listeners and clears the container.
        destroy:() => { controller.abort(); container.innerHTML = ''; }
    };
    return instance;
}
