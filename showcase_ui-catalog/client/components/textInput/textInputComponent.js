// textInputComponent.js
//
// COMPONENT COORDINATOR.
// Owns lifecycle, error lifecycle and child-Button composition. Markup is rendered once;
// value, errors and ARIA relationships are updated in place. The container is a dedicated,
// consumer-owned mount point.

import { mergeTextInputConfig, validateTextInputConfig, truncateToMaxLength } from './textInputConfig.js';
import { createTextInputState } from './textInputState.js';
import { buildTextInputHTML } from './textInputHTML.js';
import { registerTextInputEvents } from './textInputEvents.js';
import { validateTextInput } from './textInputValidation.js';
import { getTextInputError, TEXTINPUT_ERRORS, reportTextInputIssue } from './textInputErrors.js';
import { renderButton } from '../button/buttonIndex.js';

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// Renders an interactive TextInput and returns its runtime instance, or null after a developer error.
export function renderTextInput( container, config, onValueChange, onValidation )
{
    if ( !container ) { reportTextInputIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTextInputConfig(config);
    if ( validateTextInputConfig(merged) ) { return null; }

    container.innerHTML = buildTextInputHTML(merged);
    const state = createTextInputState(merged);
    const input = container.querySelector('.ui-text-input-field');
    const errorElement = container.querySelector('.ui-text-input-error');
    let controller = null, errorTimer = null, childButton = null, instance = null;
    let actionDisabled = Boolean(merged.actions[0]?.disabled);

    // Cancels an active temporary-error timer.
    function clearErrorTimer() { if ( errorTimer ) { clearTimeout(errorTimer); errorTimer = null; } }

    // Shows or clears the current error in place: message, aria-invalid and aria-describedby.
    function renderError()
    {
        if ( !input ) { return; }
        errorElement.textContent = state.error?.message ?? '';
        errorElement.hidden = !state.error;
        input.setAttribute('aria-invalid',String(Boolean(state.error)));
        const describedBy = [ merged.help ? `${merged.id}-help` : '', state.error ? errorElement.id : '' ].filter(Boolean).join(' ');
        if ( describedBy ) { input.setAttribute('aria-describedby',describedBy); } else { input.removeAttribute('aria-describedby'); }
    }

    // Applies an error label (or null), updates the display and schedules temporary errors.
    function applyError( errorLabel )
    {
        clearErrorTimer();
        const next = errorLabel ? ( errorLabel === 'EXTERNAL' ? { ...TEXTINPUT_ERRORS.EXTERNAL, message:state.external } : getTextInputError(errorLabel,merged) ) : null;
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
        let result = validateTextInput(merged,state.value,mode);
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        if ( mode !== 'input' ) { applyError(result.errorLabel); }
        else if ( state.error?.visibility === 'corrective' ) { applyError(result.errorLabel); }
        notifyValidation(result);
        return { ...result };
    }

    // Handles a native input event: trimming, max-length truncation, validation and notification.
    function handleInput()
    {
        let value = input.value;
        if ( merged.trimStart && merged.type !== 'NUMBER' ) { value = value.trimStart(); }
        const truncated = truncateToMaxLength(merged,value);
        if ( truncated !== input.value ) { input.value = truncated; }
        const changed = truncated !== state.value;
        state.value = truncated;
        if ( changed ) { state.isDirty = true; state.external = null; }
        if ( truncated.length < value.length ) { applyError('MAX_LENGTH'); } else { runValidation('input'); }
        if ( changed && typeof onValueChange === 'function' ) { onValueChange(truncated,instance); }
    }

    // Renders the predefined password-visibility Button.
    function renderPasswordButton( host )
    {
        const label = state.passwordVisible ? merged.texts.hidePassword : merged.texts.showPassword;
        childButton = renderButton(host,{ id:`${merged.id}-password-toggle`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:state.passwordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye', ariaLabel:label, tooltipMode:merged.iconTooltip },() =>
        {
            state.passwordVisible = !state.passwordVisible;
            input.type = state.passwordVisible ? 'text' : 'password';
            renderChildButton();
            input.focus();
        });
        childButton?.getElement().setAttribute('aria-pressed',String(state.passwordVisible));
    }

    // Renders the application action (guidelines §10.2) as the trailing icon Button; without onAction it is disabled.
    function renderActionButton( host )
    {
        const action = merged.actions[0];
        if ( action ) { childButton = renderButton(host,buildActionButtonConfig(`${merged.id}-action-0`,action,'TERTIARY',actionDisabled || !merged.onAction,merged.iconTooltip),() => merged.onAction?.(action.key,instance)); }
    }

    // Renders the applicable child Button through the Button public API.
    function renderChildButton()
    {
        childButton?.destroy();
        childButton = null;
        const host = container.querySelector('.ui-text-input-icon-button-host');
        if ( !host ) { return; }
        if ( merged.type === 'PASSWORD' ) { renderPasswordButton(host); } else { renderActionButton(host); }
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
            if ( input ) { input.value = state.value; }
            const view = container.querySelector('.ui-text-input-view-value');
            if ( view ) { view.textContent = state.value; }
            if ( options?.quiet ) { state.external = null; state.isDirty = false; applyError(null); return { ...validateTextInput(merged,state.value,'final') }; }
            return runValidation('final');
        },
        // Runs final validation and returns { valid, errorLabel }.
        validate:() => runValidation('final'),
        // Returns whether the user has changed the value.
        isDirty:() => state.isDirty,
        // Moves focus to the input (e.g. from an error summary); returns whether the input received focus.
        focus:() => { input?.focus(); return Boolean(input) && document.activeElement === input; },
        // Enables or disables the action Button; returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            if ( merged.actions[0]?.key !== String(key) ) { reportTextInputIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            actionDisabled = Boolean(disabled);
            if ( merged.type !== 'PASSWORD' ) { childButton?.setDisabled(actionDisabled || !merged.onAction); }
            return true;
        },
        // Removes timers, listeners and the child Button, then clears the container.
        destroy:() => { clearErrorTimer(); controller?.abort(); childButton?.destroy(); container.innerHTML = ''; }
    };

    if ( input && merged.state === 'EDIT' )
    {
        controller = registerTextInputEvents(input,{ onInput:handleInput, onBlur:() => { if ( state.isDirty ) { runValidation('blur'); } } });
        renderChildButton();
        if ( merged.autoFocus ) { input.focus(); }
    }
    return instance;
}
