// textInputConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization, developer warnings and developer errors.
// The normalized configuration is immutable; config.value keeps the initial value.
// Messages and labels are defined in textInputErrors.js.

import { reportTextInputIssue } from './textInputErrors.js';

export const TEXTINPUT_STATES = [ 'EDIT', 'VIEW', 'INACTIVE', 'INVISIBLE' ];
export const TEXTINPUT_TYPES = [ 'TEXT', 'EMAIL', 'PASSWORD', 'NUMBER', 'URL', 'TEL' ];
export const TEXTINPUT_WIDTHS = [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL', 'FIT_CONTENT' ];
export const TEXTINPUT_NUMBER_TYPES = [ 'REAL', 'INTEGER' ];
export const TEXTINPUT_INPUT_MODES = [ 'TEXT', 'DECIMAL', 'NUMERIC', 'TEL', 'SEARCH', 'EMAIL', 'URL' ];
export const TEXTINPUT_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const TEXTINPUT_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];

export const DEFAULT_TEXTINPUT_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    name:'',
    label:'',
    value:'',
    placeholder:'',
    help:'',
    state:'EDIT',
    type:'TEXT',
    width:'FULL',
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    trimStart:false,
    autoFocus:false,
    autocomplete:'off',
    inputMode:'',
    passwordToggle:true,
    errorVisibilityDuration:5000,
    iconArea:{ staticIcon:'' },
    actions:[],
    onAction:null,
    validation:{ enabled:false, minLength:0, maxLength:255, numberType:'REAL', minValue:null, maxValue:null, step:1, pattern:'' },
    texts:
    {
        optional:'(Optional)',
        showPassword:'Show password',
        hidePassword:'Hide password',
        errors:
        {
            REQUIRED:'Required.',
            MIN_LENGTH:'Minimum {minLength} characters.',
            MAX_LENGTH:'Maximum {maxLength} characters.',
            INVALID_NUMBER:'Enter a valid number.',
            INTEGER_REQUIRED:'Enter an integer.',
            MIN_VALUE:'Minimum value is {minValue}.',
            MAX_VALUE:'Maximum value is {maxValue}.',
            INVALID_PHONE:'Enter a valid phone number.',
            PATTERN:'Enter a value in the required format.',
            UNIDENTIFIED:'An unidentified error occurred.'
        }
    }
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTextInputIssue('INVALID_OPTION',{ id, key, value, fallback:fallback || 'none' });
    return fallback;
}

// Returns a finite number; warns and falls back when a supplied value is not numeric.
function normalizeNumber( id, key, value, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isFinite(number) ) { return number; }
    reportTextInputIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportTextInputIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
}

// Merges one level of consumer texts with defaults; empty texts fall back to defaults.
function mergeTexts( defaults, source )
{
    const input = source && typeof source === 'object' ? source : {};
    return Object.fromEntries(Object.entries(defaults).map(( [ key, fallback ] ) => [ key, String(input[key] ?? '').trim() || fallback ]));
}

// Normalizes the UI texts, including the per-errorLabel messages.
function normalizeTexts( texts )
{
    const { errors, ...plain } = DEFAULT_TEXTINPUT_CONFIG.texts;
    return { ...mergeTexts(plain,texts), errors:mergeTexts(errors,texts?.errors) };
}

// Compiles validation.pattern (string or RegExp) as a whole-value match; an invalid pattern is ignored with a warning.
function normalizePattern( id, value )
{
    if ( value === undefined || value === null || value === '' ) { return null; }
    const source = value instanceof RegExp ? value.source : String(value);
    try { return new RegExp(`^(?:${source})$`,'u'); }
    catch { reportTextInputIssue('INVALID_PATTERN',{ id, value:source }); return null; }
}

// Normalizes validation rules.
function normalizeValidation( id, source = {} )
{
    const defaults = DEFAULT_TEXTINPUT_CONFIG.validation;
    const validation =
    {
        enabled:Boolean(source.enabled ?? defaults.enabled),
        minLength:Math.max(0,Math.trunc(normalizeNumber(id,'validation.minLength',source.minLength,defaults.minLength))),
        maxLength:Math.max(0,Math.trunc(normalizeNumber(id,'validation.maxLength',source.maxLength,defaults.maxLength))),
        numberType:normalizeEnum(id,'validation.numberType',source.numberType,TEXTINPUT_NUMBER_TYPES,defaults.numberType),
        minValue:normalizeNumber(id,'validation.minValue',source.minValue,null),
        maxValue:normalizeNumber(id,'validation.maxValue',source.maxValue,null),
        step:Math.max(1,Math.trunc(normalizeNumber(id,'validation.step',source.step,defaults.step))),
        pattern:normalizePattern(id,source.pattern)
    };
    if ( validation.minLength > validation.maxLength ) { reportTextInputIssue('MIN_LENGTH_CLAMPED',{ id, fallback:validation.maxLength }); validation.minLength = validation.maxLength; }
    return validation;
}

// Normalizes application actions { key, label, icon?, iconOnly?, hierarchy?, disabled? } (§10.2): entries without key or
// label and duplicate keys are dropped; invalid icon classes and hierarchies fall back with a warning. path is the option
// name (e.g. 'actions'); defaultHierarchy '' leaves a missing hierarchy to the component (an invalid one becomes SECONDARY).
function normalizeActions( id, path, actions, defaultHierarchy )
{
    const seen = new Set();
    return ( Array.isArray(actions) ? actions : [] ).map(( action, index ) =>
    {
        const key = String(action?.key ?? '').trim(), label = String(action?.label ?? '').trim();
        if ( !key || !label ) { reportTextInputIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportTextInputIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportTextInputIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Normalizes the trailing area: a static icon, or one application action (guidelines §10.2: a single slot inside the field,
// so at most one action, always icon-only; an action without an icon cannot be shown). PASSWORD keeps the area for its
// show/hide Button. Returns { iconArea, actions }.
function normalizeTrailingArea( id, userConfig, type )
{
    const staticIcon = normalizeIconClass(id,'iconArea.staticIcon',userConfig.iconArea?.staticIcon);
    let actions = normalizeActions(id,'actions',userConfig.actions,'TERTIARY');
    if ( type === 'PASSWORD' )
    {
        if ( staticIcon || actions.length ) { reportTextInputIssue('OPTION_IGNORED',{ id, key:staticIcon ? 'iconArea.staticIcon' : 'actions', condition:'type="PASSWORD" (use passwordToggle)' }); }
        return { iconArea:{ staticIcon:'' }, actions:[] };
    }
    if ( actions.length > 1 ) { reportTextInputIssue('OPTION_IGNORED',{ id, key:'actions[1…]', condition:'more than one action is given (one fits inside the field)' }); actions = actions.slice(0,1); }
    if ( actions.length && !actions[0].icon ) { reportTextInputIssue('OPTION_IGNORED',{ id, key:'actions[0]', condition:'it has no icon (inside the field only an icon fits)' }); actions = []; }
    actions = actions.map(action => ( { ...action, iconOnly:true } ));
    if ( actions.length && typeof userConfig.onAction !== 'function' ) { reportTextInputIssue('ACTION_HANDLER_MISSING',{ id, key:'actions', callback:'onAction' }); }
    if ( staticIcon && actions.length ) { reportTextInputIssue('OPTIONS_CONFLICT',{ id }); return { iconArea:{ staticIcon:'' }, actions }; }
    return { iconArea:{ staticIcon }, actions };
}

// Truncates a programmatic text value when active max-length validation requires it.
export function truncateToMaxLength( config, value )
{
    const text = String(value ?? '');
    return config.type === 'NUMBER' || !config.validation.enabled ? text : text.slice(0,config.validation.maxLength);
}

// Produces the normalized, immutable configuration consumed by TextInput.
function mergeTextInputConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const type = normalizeEnum(id,'type',userConfig.type,TEXTINPUT_TYPES,DEFAULT_TEXTINPUT_CONFIG.type);
    const validation = normalizeValidation(id,userConfig.validation);
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? ''),
        placeholder:String(userConfig.placeholder ?? ''),
        help:String(userConfig.help ?? ''),
        state:normalizeEnum(id,'state',userConfig.state,TEXTINPUT_STATES,DEFAULT_TEXTINPUT_CONFIG.state),
        type,
        width:normalizeEnum(id,'width',userConfig.width,TEXTINPUT_WIDTHS,DEFAULT_TEXTINPUT_CONFIG.width),
        mandatory:Boolean(userConfig.mandatory ?? DEFAULT_TEXTINPUT_CONFIG.mandatory),
        mandatoryIndicator:normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,TEXTINPUT_MANDATORY_INDICATORS,DEFAULT_TEXTINPUT_CONFIG.mandatoryIndicator),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,TEXTINPUT_LABEL_POSITIONS,DEFAULT_TEXTINPUT_CONFIG.labelPosition),
        trimStart:Boolean(userConfig.trimStart ?? DEFAULT_TEXTINPUT_CONFIG.trimStart),
        autoFocus:Boolean(userConfig.autoFocus ?? DEFAULT_TEXTINPUT_CONFIG.autoFocus),
        autocomplete:String(userConfig.autocomplete ?? ( type === 'TEL' ? 'tel' : DEFAULT_TEXTINPUT_CONFIG.autocomplete )),
        inputMode:normalizeEnum(id,'inputMode',userConfig.inputMode,TEXTINPUT_INPUT_MODES,type === 'TEL' ? 'TEL' : DEFAULT_TEXTINPUT_CONFIG.inputMode),
        passwordToggle:Boolean(userConfig.passwordToggle ?? DEFAULT_TEXTINPUT_CONFIG.passwordToggle),
        errorVisibilityDuration:Math.max(0,normalizeNumber(id,'errorVisibilityDuration',userConfig.errorVisibilityDuration,DEFAULT_TEXTINPUT_CONFIG.errorVisibilityDuration)),
        ...normalizeTrailingArea(id,userConfig,type),
        onAction:typeof userConfig.onAction === 'function' ? userConfig.onAction : null,
        validation,
        texts:normalizeTexts(userConfig.texts)
    };
    if ( type === 'NUMBER' && config.validation.pattern ) { reportTextInputIssue('OPTION_IGNORED',{ id, key:'validation.pattern', condition:'type="NUMBER" (use minValue/maxValue)' }); config.validation.pattern = null; }
    config.value = truncateToMaxLength(config,userConfig.value);
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const TEXTINPUT_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeTextInputConfig( userConfig = {} )
{
    const base = mergeTextInputConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,TEXTINPUT_TOOLTIP_MODES,DEFAULT_TEXTINPUT_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_TEXTINPUT_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTextInputConfig( config )
{
    if ( !config.id ) { return reportTextInputIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(config.id) ) { return reportTextInputIssue('UNSAFE_ID',{ id:config.id }); }
    if ( document.getElementById(config.id) ) { return reportTextInputIssue('DUPLICATE_ID',{ id:config.id }); }
    return null;
}
