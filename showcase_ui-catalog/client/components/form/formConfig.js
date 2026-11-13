// formConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. Messages and labels are defined in formErrors.js.

import { reportFormIssue } from './formErrors.js';

// SUBMIT: validate everything and report on submit. LIVE: report changes (Apply button, or automatically after a pause).
export const FORM_MODES = [ 'SUBMIT', 'LIVE' ];
export const FORM_LIVE_APPLY = [ 'BUTTON', 'AUTO' ];
export const FORM_LABEL_POSITIONS = [ 'TOP', 'START' ];
export const FORM_BUTTONS_ALIGN = [ 'START', 'END' ];
// AUTO: the note appears when at least one field shows the mandatory asterisk; ALWAYS / NEVER force it.
export const FORM_REQUIRED_NOTES = [ 'AUTO', 'ALWAYS', 'NEVER' ];
// Where Form shows its non-field messages (submit success and showMessage()): above the fields, as a toast, or handed
// to onMessage for another component (e.g. AppHeader) to show.
export const FORM_MESSAGE_PLACEMENTS = [ 'ABOVE', 'TOAST', 'EXTERNAL' ];
// Remaining-time indicator of temporary TOAST messages (Message remainingIndicator); NONE where it is not wanted.
export const FORM_MESSAGE_REMAINING = [ 'NONE', 'BAR', 'TEXT', 'BAR_AND_TEXT' ];
// What the user sees while the form is busy (setBusy, a pending onSubmit): a small Loader ring before the buttons, a Loader
// layer over the whole form (blocks it), or nothing but the disabled main button.
export const FORM_BUSY_INDICATORS = [ 'BUTTONS', 'OVERLAY', 'NONE' ];

export const DEFAULT_FORM_CONFIG =
{
    id:'',
    mode:'SUBMIT',
    columns:1,
    labelPosition:'TOP',
    liveApply:'BUTTON',
    liveDelayMs:300,
    showSubmit:true,
    showReset:false,
    showClear:false,
    showCancel:false,
    buttonsAlign:'END',
    warnUnsavedChanges:false,
    requiredNote:'AUTO',
    confirmReset:true,
    quietReset:true,
    showSubmitSuccess:true,
    busyIndicator:'BUTTONS',
    externalMessage:{ placement:'ABOVE', toastArea:null, onMessage:null, remainingIndicator:'BAR' },
    texts:{ submit:'Submit', apply:'Apply', reset:'Reset to initial values', clear:'Clear all', cancel:'Cancel', summaryTitle:'There is a problem', summaryText:'Correct the following and try again.', summaryItem:'{label}: {message}', requiredNote:'* Required field', busy:'Saving…',
        submitSuccess:'Your changes were saved.', confirmTitle:'Discard your changes?', confirmText:'Your unsaved changes will be lost.', confirmDiscard:'Discard changes', confirmKeep:'Keep editing' },
    onSubmit:null,
    onChange:null,
    onValidate:null,
    onReset:null,
    onClear:null,
    onCancel:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportFormIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max]; warns and falls back when a supplied value is outside it.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportFormIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Normalizes externalMessage { placement, toastArea, onMessage, remainingIndicator } (where non-field messages are shown;
// remainingIndicator only for TOAST, whose non-DANGER messages close by themselves).
function normalizeExternalMessage( id, source )
{
    const input = source && typeof source === 'object' ? source : {};
    let placement = normalizeEnum(id,'externalMessage.placement',input.placement,FORM_MESSAGE_PLACEMENTS,'ABOVE');
    const toastArea = input.toastArea instanceof Element ? input.toastArea : null;
    const onMessage = typeof input.onMessage === 'function' ? input.onMessage : null;
    if ( placement === 'TOAST' && !toastArea ) { reportFormIssue('MESSAGE_TARGET_MISSING',{ id, value:'externalMessage.toastArea' }); placement = 'ABOVE'; }
    if ( placement === 'EXTERNAL' && !onMessage ) { reportFormIssue('MESSAGE_TARGET_MISSING',{ id, value:'externalMessage.onMessage' }); placement = 'ABOVE'; }
    const remainingIndicator = normalizeEnum(id,'externalMessage.remainingIndicator',input.remainingIndicator,FORM_MESSAGE_REMAINING,'BAR');
    if ( placement !== 'TOAST' && input.remainingIndicator !== undefined ) { reportFormIssue('OPTION_IGNORED',{ id, key:'externalMessage.remainingIndicator', condition:`placement="${placement}" (only toasts close by themselves)` }); }
    return Object.freeze({ placement, toastArea, onMessage, remainingIndicator });
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_FORM_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Returns a function option or null.
const fn = value => ( typeof value === 'function' ? value : null );

// Produces the normalized, immutable configuration consumed by Form.
export function mergeFormConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const mode = normalizeEnum(id,'mode',userConfig.mode,FORM_MODES,DEFAULT_FORM_CONFIG.mode);
    const config =
    {
        id,
        mode,
        columns:normalizeInteger(id,'columns',userConfig.columns,1,4,DEFAULT_FORM_CONFIG.columns),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,FORM_LABEL_POSITIONS,DEFAULT_FORM_CONFIG.labelPosition),
        liveApply:normalizeEnum(id,'liveApply',userConfig.liveApply,FORM_LIVE_APPLY,DEFAULT_FORM_CONFIG.liveApply),
        liveDelayMs:normalizeInteger(id,'liveDelayMs',userConfig.liveDelayMs,0,10000,DEFAULT_FORM_CONFIG.liveDelayMs),
        showSubmit:Boolean(userConfig.showSubmit ?? DEFAULT_FORM_CONFIG.showSubmit),
        showReset:Boolean(userConfig.showReset ?? DEFAULT_FORM_CONFIG.showReset),
        showClear:Boolean(userConfig.showClear ?? DEFAULT_FORM_CONFIG.showClear),
        showCancel:Boolean(userConfig.showCancel ?? DEFAULT_FORM_CONFIG.showCancel),
        buttonsAlign:normalizeEnum(id,'buttonsAlign',userConfig.buttonsAlign,FORM_BUTTONS_ALIGN,DEFAULT_FORM_CONFIG.buttonsAlign),
        warnUnsavedChanges:Boolean(userConfig.warnUnsavedChanges ?? DEFAULT_FORM_CONFIG.warnUnsavedChanges),
        requiredNote:userConfig.requiredNote === true ? 'ALWAYS' : userConfig.requiredNote === false ? 'NEVER' : normalizeEnum(id,'requiredNote',userConfig.requiredNote,FORM_REQUIRED_NOTES,DEFAULT_FORM_CONFIG.requiredNote),
        confirmReset:Boolean(userConfig.confirmReset ?? DEFAULT_FORM_CONFIG.confirmReset),
        quietReset:Boolean(userConfig.quietReset ?? DEFAULT_FORM_CONFIG.quietReset),
        showSubmitSuccess:Boolean(userConfig.showSubmitSuccess ?? DEFAULT_FORM_CONFIG.showSubmitSuccess),
        busyIndicator:normalizeEnum(id,'busyIndicator',userConfig.busyIndicator,FORM_BUSY_INDICATORS,DEFAULT_FORM_CONFIG.busyIndicator),
        externalMessage:normalizeExternalMessage(id,userConfig.externalMessage),
        texts:normalizeTexts(userConfig.texts),
        onSubmit:fn(userConfig.onSubmit), onChange:fn(userConfig.onChange), onValidate:fn(userConfig.onValidate),
        onReset:fn(userConfig.onReset), onClear:fn(userConfig.onClear), onCancel:fn(userConfig.onCancel)
    };
    if ( mode === 'SUBMIT' ) { [ 'liveApply', 'liveDelayMs', 'onChange' ].filter(key => userConfig[key] !== undefined).forEach(key => reportFormIssue('OPTION_IGNORED',{ id, key, condition:'mode="SUBMIT"' })); }
    if ( mode === 'LIVE' )
    {
        [ 'showSubmit', 'onSubmit' ].filter(key => userConfig[key] !== undefined).forEach(key => reportFormIssue('OPTION_IGNORED',{ id, key, condition:'mode="LIVE" (use liveApply and onChange)' }));
        if ( config.liveApply === 'BUTTON' && userConfig.liveDelayMs !== undefined ) { reportFormIssue('OPTION_IGNORED',{ id, key:'liveDelayMs', condition:'liveApply="BUTTON"' }); }
    }
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateFormConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportFormIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportFormIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportFormIssue('DUPLICATE_ID',{ id }); }
    return null;
}
