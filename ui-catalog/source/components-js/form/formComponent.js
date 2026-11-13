// formComponent.js
//
// COMPONENT COORDINATOR.
// Orchestrates the fields found among its children (form-field contract, duck-typed, no imports of input
// components): values, validation on submit or apply, cross-field and server errors, error summary, reset,
// clear (quiet by default, confirmed when there are unsaved changes), busy state, change detection, the
// unsaved-changes warning and non-field messages (submit success, showMessage()) shown above the form, as a toast or
// handed to externalMessage.onMessage. Buttons use Button; the summary, messages and confirmation use Message; the busy
// state shows a Loader (busyIndicator).
// The container is a dedicated, consumer-owned mount point.

import { mergeFormConfig, validateFormConfig } from './formConfig.js';
import { buildFormHTML } from './formHTML.js';
import { registerFormEvents } from './formEvents.js';
import { reportFormIssue } from './formErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderLoader } from '../loader/loaderIndex.js';
import { renderMessage } from '../message/messageIndex.js';

// Returns whether an instance follows the form-field contract.
const isField = item => item && typeof item.getValue === 'function' && typeof item.setValue === 'function' && typeof item.validate === 'function' && typeof item.focus === 'function';

// Returns the empty value of the same shape (Clear all): '' / [] / false / null / object with empty members.
function emptyLike( value )
{
    if ( Array.isArray(value) ) { return []; }
    if ( value === null || value === undefined ) { return null; }
    if ( typeof value === 'boolean' ) { return false; }
    if ( typeof value === 'object' ) { return Object.fromEntries(Object.entries(value).map(( [ key, item ] ) => [ key, emptyLike(item) ])); }
    return '';
}

// Returns whether a value is a file (File or Blob, e.g. from UploadFiles): files are kept as they are, never copied.
const isFile = value => typeof Blob !== 'undefined' && value instanceof Blob;

// Returns a deep copy of plain values (strings, numbers, booleans, arrays, objects); files are kept as they are.
function copy( value )
{
    if ( typeof value === 'number' && !Number.isFinite(value) ) { return null; }
    if ( value === undefined || value === null || typeof value !== 'object' || isFile(value) ) { return value; }
    if ( Array.isArray(value) ) { return value.map(item => ( item === undefined ? null : copy(item) )); }
    if ( value instanceof Date ) { return value.toJSON(); }
    return Object.fromEntries(Object.entries(value).filter(( [ , item ] ) => item !== undefined && typeof item !== 'function').map(( [ key, item ] ) => [ key, copy(item) ]));
}

// Returns a text that changes when the values change (a file counts by its name, size, type and date).
const snapshotOf = values => JSON.stringify(values,( key, value ) => ( isFile(value) ? { file:value.name ?? '', size:value.size, type:value.type, modified:value.lastModified ?? null } : value ));

// Renders ordered children (static HTML strings or render functions) into item hosts; returns the child instances.
function renderChildren( content, children, owner, id )
{
    const list = Array.isArray(children) ? children : ( children === undefined || children === null ? [] : [ children ] );
    return list.map(( child, index ) =>
    {
        if ( typeof child !== 'string' && typeof child !== 'function' ) { reportFormIssue('INVALID_CHILD',{ id, index }); return null; }
        const host = document.createElement('div');
        host.className = 'ui-form-item';
        content.appendChild(host);
        if ( typeof child === 'string' ) { host.innerHTML = child; return null; }
        return child(host,owner) ?? null;
    }).filter(Boolean);
}

// Renders a Form and returns its runtime instance, or null after a developer error.
export function renderForm( container, config, children = [] )
{
    if ( !container ) { reportFormIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeFormConfig(config);
    if ( validateFormConfig(merged) ) { return null; }

    container.innerHTML = buildFormHTML(merged);
    const form = container.querySelector('form');
    const summaryHost = form.querySelector('.ui-form-summary-host');
    const messageHost = form.querySelector('.ui-form-message-host');
    const dialogHost = form.querySelector('.ui-form-dialog-host');
    let summary = null, aboveMessage = null, confirmDialog = null, messageCount = 0;
    const buttons = {};
    const state = { children:[], initial:{}, baseline:{}, lastValues:'', busy:false, summaryErrors:[], formErrorFields:new Set(), checkTimer:null, liveTimer:null };
    let controller = null, instance = null;
    // busyIndicator BUTTONS: a small ring before the buttons; OVERLAY: a layer over the form (TOP, so a long form keeps it in view).
    const loaderHost = form.querySelector('.ui-form-loader-host, .ui-form-overlay-host');
    const loader = !loaderHost ? null : merged.busyIndicator === 'OVERLAY'
        ? renderLoader(loaderHost,{ id:`${merged.id}-loader`, placement:'OVERLAY', target:form, indicatorPosition:'TOP', label:merged.texts.busy })
        : renderLoader(loaderHost,{ id:`${merged.id}-loader`, shape:'RING', size:'SMALL', label:merged.texts.busy });

    // Returns the fields found among the children and inside containers (getChildren), first name wins.
    function collectFields( warn = false )
    {
        const found = [], names = new Set();
        const walk = items => items.forEach(item =>
        {
            if ( isField(item) )
            {
                if ( !item.name ) { if ( warn ) { reportFormIssue('FIELD_WITHOUT_NAME',{ id:merged.id, value:item.id }); } return; }
                if ( names.has(item.name) ) { if ( warn ) { reportFormIssue('DUPLICATE_FIELD_NAME',{ id:merged.id, value:item.name }); } return; }
                names.add(item.name); found.push(item);
                return;
            }
            if ( item && typeof item.getChildren === 'function' ) { walk(item.getChildren()); }
        });
        walk(state.children);
        return found;
    }

    // Returns the summary text of a field's message: "E-mail: Required." (label from getLabel(); message alone without a label).
    function summaryMessage( field, message )
    {
        const label = String(field.getLabel?.() ?? '').trim();
        return label && message ? merged.texts.summaryItem.replace('{label}',label).replace('{message}',message) : message || label || field.name;
    }

    // AUTO: shows the "* Required field" note when at least one field shows the mandatory asterisk (getMandatoryState()).
    function updateRequiredNote( fields = collectFields() )
    {
        const note = form.querySelector('.ui-form-required-note');
        if ( !note || merged.requiredNote !== 'AUTO' ) { return; }
        note.hidden = !fields.some(field => { const mandatory = field.getMandatoryState?.(); return mandatory?.mandatory && mandatory.indicator === 'MANDATORY_ASTERISK'; });
    }

    // Returns { name: value } for all fields.
    const getValues = () => Object.fromEntries(collectFields().map(field => [ field.name, copy(field.getValue()) ]));

    // Returns the field with a name, or null.
    const fieldByName = name => collectFields().find(field => field.name === name) ?? null;

    // Shows (or hides with an empty list) the error summary — a DANGER Message whose details link to the fields; SUBMIT
    // mode moves focus to it after a failed submit.
    function showSummary( errors, focusSummary )
    {
        state.summaryErrors = errors;
        if ( !errors.length ) { summary?.hide(); return; }
        const details = errors.map(error => ({ label:error.message, onClick:() => error.field?.focus() }));
        if ( !summary ) { summary = renderMessage(summaryHost,{ id:`${merged.id}-summary`, type:'DANGER', layout:'BLOCK', title:merged.texts.summaryTitle, text:merged.texts.summaryText, details, visible:false }); }
        else { summary.update({ details }); }
        summary?.show();
        if ( focusSummary ) { summary?.focus(); }
    }

    // Shows a non-field message (Message configuration) where externalMessage.placement says: ABOVE (replaces the previous
    // one), TOAST (in the toast area) or EXTERNAL (handed to onMessage, e.g. AppHeader.showAnnouncement).
    function showMessage( message )
    {
        if ( !message || typeof message !== 'object' || !message.text ) { return; }
        const { placement, toastArea, onMessage, remainingIndicator } = merged.externalMessage;
        const { id, layout, ...content } = message;
        if ( placement === 'EXTERNAL' ) { onMessage({ ...content },instance); return; }
        if ( placement === 'TOAST' )
        {
            // temporary toasts (6 s, not DANGER) show the remaining time as configured (default BAR); permanent ones show none
            const toast = { closable:true, duration:content.type === 'DANGER' ? 0 : 6000, remainingIndicator, ...content, id:`${merged.id}-toast-${++messageCount}`, layout:'TOAST' };
            if ( !toast.duration || content.type === 'DANGER' ) { delete toast.remainingIndicator; }
            renderMessage(toastArea,toast);
            return;
        }
        aboveMessage?.destroy();
        aboveMessage = renderMessage(messageHost,{ closable:true, ...content, id:`${merged.id}-message`, layout:'BLOCK', visible:false });
        aboveMessage?.show();
    }

    // Removes the message shown above the form (if any).
    function clearMessage() { aboveMessage?.destroy(); aboveMessage = null; }

    // Asks before discarding unsaved changes (WARNING modal, "Keep editing" focused); runs proceed() on "Discard".
    function confirmDiscard( proceed )
    {
        if ( !merged.confirmReset || !isDirty() ) { proceed(); return; }
        confirmDialog?.destroy();
        confirmDialog = renderMessage(dialogHost,{ id:`${merged.id}-confirm`, type:'WARNING', layout:'MODAL', title:merged.texts.confirmTitle, text:merged.texts.confirmText,
            actions:[ { key:'discard', label:merged.texts.confirmDiscard }, { key:'keep', label:merged.texts.confirmKeep, cancel:true } ], defaultAction:'keep',
            onAction:key => { if ( key === 'discard' ) { proceed(); } },
            onClose:() => setTimeout(() => { confirmDialog?.destroy(); confirmDialog = null; },0) });
    }

    // Removes external errors that Form set (cross-field and server errors) and hides the summary.
    function clearFormErrors()
    {
        state.formErrorFields.forEach(field => field.clearError?.());
        state.formErrorFields.clear();
        showSummary([],false);
    }

    // Applies external errors [{ name, message }] to their fields (setError) and returns summary entries.
    function applyExternalErrors( list )
    {
        return ( Array.isArray(list) ? list : [] ).filter(item => item && item.message).map(item =>
        {
            const field = fieldByName(item.name);
            if ( !field ) { reportFormIssue('UNKNOWN_FIELD',{ id:merged.id, value:item.name }); return { message:String(item.message), field:null }; }
            if ( typeof field.setError === 'function' ) { field.setError(String(item.message)); state.formErrorFields.add(field); }
            return { message:summaryMessage(field,String(item.message)), field };
        });
    }

    // Validates all fields and then the cross-field rules; returns the error list [{ message, field }].
    function validateAll()
    {
        clearFormErrors();
        const fields = collectFields();
        updateRequiredNote(fields);
        const errors = fields.map(field => ( field.validate()?.valid === false ? { message:summaryMessage(field,field.getError?.()?.message ?? ''), field } : null )).filter(Boolean);
        if ( errors.length || !merged.onValidate ) { return errors; }
        return applyExternalErrors(merged.onValidate(getValues(),instance));
    }

    // Shows or hides the busy state: the main button is blocked while the page saves or applies; the Loader (busyIndicator)
    // appears after its delay and hides when the form is no longer busy.
    function setBusy( busy )
    {
        if ( Boolean(busy) !== state.busy ) { if ( busy ) { loader?.start(); } else { loader?.hide(); } }
        state.busy = Boolean(busy);
        form.setAttribute('aria-busy',String(state.busy));
        form.classList.toggle('ui-form-busy',state.busy);
        [ buttons.submit, buttons.apply ].forEach(button => button?.setDisabled(state.busy));
    }

    // SUBMIT: validate, then summary or onSubmit (a returned promise keeps the form busy until it settles).
    function submit()
    {
        if ( state.busy ) { return false; }
        const errors = validateAll();
        if ( errors.length ) { showSummary(errors,true); return false; }
        const values = getValues();
        clearMessage();
        const result = merged.onSubmit ? merged.onSubmit(values,instance) : null;
        const succeeded = () => { state.baseline = values; if ( merged.showSubmitSuccess && result !== false ) { showMessage({ type:'SUCCESS', text:merged.texts.submitSuccess }); } };
        if ( result && typeof result.then === 'function' )
        {
            setBusy(true);
            result.then(outcome => { if ( outcome !== false ) { succeeded(); } },() => {}).finally(() => setBusy(false));
        }
        else { succeeded(); }
        return true;
    }

    // LIVE: validate (errors next to the fields only) and report valid values through onChange.
    function apply()
    {
        clearTimeout(state.liveTimer);
        if ( state.busy ) { return false; }
        const errors = validateAll();
        if ( errors.length ) { return false; }
        const values = getValues();
        state.baseline = values;
        merged.onChange?.(values,instance);
        return true;
    }

    // Compares the values after a user event; LIVE + AUTO applies after the configured pause.
    function detectChange()
    {
        clearTimeout(state.checkTimer);
        state.checkTimer = setTimeout(() =>
        {
            const snapshot = snapshotOf(getValues());
            if ( snapshot === state.lastValues ) { return; }
            state.lastValues = snapshot;
            updateRequiredNote();   // lazily rendered fields (e.g. in a panel) may add an asterisk
            if ( merged.mode === 'LIVE' && merged.liveApply === 'AUTO' ) { clearTimeout(state.liveTimer); state.liveTimer = setTimeout(apply,merged.liveDelayMs); }
        },0);
    }

    // Sets values programmatically on the named fields (unknown names ignored); quiet = no validation, errors cleared.
    function setValues( values, quiet = false )
    {
        collectFields().forEach(field => { if ( values && Object.prototype.hasOwnProperty.call(values,field.name) ) { field.setValue(copy(values[field.name]),quiet ? { quiet:true } : undefined); } });
        state.lastValues = snapshotOf(getValues());
    }

    // Returns every field to its initial value and clears Form errors (LIVE: reports the result).
    function reset()
    {
        clearFormErrors();
        clearMessage();
        setValues(state.initial,merged.quietReset);
        state.baseline = getValues();
        merged.onReset?.(instance);
        if ( merged.mode === 'LIVE' ) { apply(); }
    }

    // Empties every field and clears Form errors (LIVE: reports the result).
    function clear()
    {
        clearFormErrors();
        clearMessage();
        const values = getValues();
        setValues(Object.fromEntries(Object.entries(values).map(( [ name, value ] ) => [ name, emptyLike(value) ])),merged.quietReset);
        merged.onClear?.(instance);
        if ( merged.mode === 'LIVE' ) { apply(); }
    }

    // Returns whether the values differ from the last submitted, applied or reset values.
    const isDirty = () => snapshotOf(getValues()) !== snapshotOf(state.baseline);

    instance =
    {
        id:merged.id,
        // Returns the top-level child instances (containers expose theirs through getChildren()).
        getChildren:() => [ ...state.children ],
        // Returns the fields found among the children (form-field contract, with a name).
        getFields:() => collectFields(),
        // Returns { name: value } for all fields.
        getValues:() => getValues(),
        // Sets values on the named fields programmatically (no field callbacks).
        setValues:( values ) => setValues(values),
        // SUBMIT: validates and submits (as the Submit button); LIVE: validates and applies. Returns whether it succeeded.
        submit:() => ( merged.mode === 'LIVE' ? apply() : submit() ),
        // Validates all fields and cross-field rules; shows the summary in SUBMIT mode; returns { valid, errors }.
        validate:() => { const errors = validateAll(); if ( merged.mode === 'SUBMIT' ) { showSummary(errors,false); } return { valid:errors.length === 0, errors:errors.map(error => ({ name:error.field?.name ?? null, message:error.message })) }; },
        // Shows server errors [{ name, message }] next to the fields and in the summary (SUBMIT mode).
        showErrors:( list ) => { const errors = applyExternalErrors(list); if ( merged.mode === 'SUBMIT' ) { showSummary([ ...state.summaryErrors, ...errors ],true); } },
        // Removes the errors Form set (cross-field and server errors) and hides the summary.
        clearErrors:() => clearFormErrors(),
        // Returns every field to its initial value.
        reset:() => reset(),
        // Empties every field.
        clear:() => clear(),
        // Shows or hides the busy state.
        setBusy:( busy ) => setBusy(busy),
        // Returns whether values changed since the last submit, apply or reset.
        isDirty:() => isDirty(),
        // Shows a non-field message (Message configuration, any type) at externalMessage.placement.
        showMessage:( message ) => showMessage(message),
        // Removes the message shown above the form.
        clearMessage:() => clearMessage(),
        // Focuses the summary when it shows errors, otherwise the first field.
        focus:() => { if ( summary?.isVisible() ) { return summary.focus(); } return collectFields()[0]?.focus() ?? false; },
        // Removes listeners, timers, Buttons and children, then clears the container.
        destroy:() => { loader?.destroy(); summary?.destroy(); clearMessage(); confirmDialog?.destroy(); clearTimeout(state.checkTimer); clearTimeout(state.liveTimer); controller?.abort(); Object.values(buttons).forEach(button => button?.destroy()); state.children.forEach(child => child?.destroy?.()); container.innerHTML = ''; }
    };

    // Action Buttons.
    const host = name => form.querySelector(`.ui-form-actions [data-button="${name}"]`);
    const addButton = ( name, options, onClick ) => { if ( host(name) ) { buttons[name] = renderButton(host(name),{ id:`${merged.id}-${name}`, ...options },onClick); } };
    addButton('submit',{ label:merged.texts.submit, buttonType:'SUBMIT', hierarchy:'PRIMARY' },null);
    addButton('apply',{ label:merged.texts.apply, buttonType:'SUBMIT', hierarchy:'PRIMARY' },null);
    addButton('reset',{ label:merged.texts.reset, hierarchy:'SECONDARY' },() => confirmDiscard(reset));
    addButton('clear',{ label:merged.texts.clear, hierarchy:'TERTIARY' },() => confirmDiscard(clear));
    addButton('cancel',{ label:merged.texts.cancel, hierarchy:'TERTIARY' },() => merged.onCancel?.(instance));

    // Children, initial values and developer checks.
    state.children = renderChildren(form.querySelector('.ui-form-content'),children,instance,merged.id);
    const fields = collectFields(true);
    const positions = [ ...new Set(fields.map(field => field.getLabelPosition?.()).filter(Boolean)) ];
    if ( positions.length > 1 ) { reportFormIssue('MIXED_LABEL_POSITIONS',{ id:merged.id, value:positions.join(', ') }); }
    updateRequiredNote(fields);
    state.initial = getValues();
    state.baseline = state.initial;
    state.lastValues = snapshotOf(state.initial);

    controller = registerFormEvents(form,
    {
        onSubmit:() => ( merged.mode === 'LIVE' ? apply() : submit() ),
        onUserEvent:detectChange,
        shouldWarn:() => merged.warnUnsavedChanges && isDirty()
    });
    return instance;
}
