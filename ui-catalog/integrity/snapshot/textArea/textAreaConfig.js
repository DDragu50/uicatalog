// textAreaConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The normalized configuration is
// immutable; config.value keeps the initial value. Messages and labels are defined in textAreaErrors.js.

import { reportTextAreaIssue } from './textAreaErrors.js';

export const TEXTAREA_STATES = [ 'EDIT', 'VIEW', 'INACTIVE', 'INVISIBLE' ];
export const TEXTAREA_WIDTHS = [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ];
export const TEXTAREA_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const TEXTAREA_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];
export const TEXTAREA_RESIZE_MODES = [ 'NONE', 'VERTICAL' ];

export const DEFAULT_TEXTAREA_CONFIG =
{
    id:'',
    name:'',
    label:'',
    value:'',
    placeholder:'',
    help:'',
    state:'EDIT',
    width:'FULL',
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    autoFocus:false,
    autocomplete:'off',
    spellcheck:true,
    rows:4,
    autoGrow:false,
    maxRows:12,
    resize:'VERTICAL',
    showCounter:true,
    counterWarningThreshold:5,
    locale:'',
    errorVisibilityDuration:5000,
    validation:{ enabled:false, minLength:0, maxLength:1000 },
    texts:
    {
        optional:'(Optional)',
        counter:'{remaining} characters left',
        counterSingular:'{remaining} character left',
        limit:'Maximum {maxLength} characters.',
        errors:
        {
            REQUIRED:'Required.',
            MIN_LENGTH:'Minimum {minLength} characters.',
            MAX_LENGTH:'Maximum {maxLength} characters.',
            UNIDENTIFIED:'An unidentified error occurred.'
        }
    }
};


// Returns the language tag for numbers, sorting or names: the given BCP 47 tag (e.g. 'ro', 'de-AT'), otherwise the page
// language, the browser language, 'en'; an invalid tag is reported and the fallback is used.
function normalizeLocale( id, value )
{
    const fallback = document.documentElement.lang || navigator.language || 'en';
    const text = String(value ?? '').trim();
    if ( !text ) { return fallback; }
    try { return Intl.getCanonicalLocales(text)[0]; }
    catch { reportTextAreaIssue('INVALID_OPTION',{ id, key:'locale', value:text, fallback }); return fallback; }
}
// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTextAreaIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max]; warns and falls back when a supplied value is outside it.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportTextAreaIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns the autocomplete token list; only letters, digits, spaces and "-" are allowed.
function normalizeAutocomplete( id, value )
{
    if ( value === undefined || value === null || value === '' ) { return DEFAULT_TEXTAREA_CONFIG.autocomplete; }
    const text = String(value).trim();
    if ( /^[a-zA-Z0-9 -]+$/.test(text) ) { return text; }
    reportTextAreaIssue('INVALID_OPTION',{ id, key:'autocomplete', value, fallback:DEFAULT_TEXTAREA_CONFIG.autocomplete });
    return DEFAULT_TEXTAREA_CONFIG.autocomplete;
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
    const { errors, ...plain } = DEFAULT_TEXTAREA_CONFIG.texts;
    return { ...mergeTexts(plain,texts), errors:mergeTexts(errors,texts?.errors) };
}

// Normalizes validation rules.
function normalizeValidation( id, source = {} )
{
    const defaults = DEFAULT_TEXTAREA_CONFIG.validation;
    const validation =
    {
        enabled:Boolean(source.enabled ?? defaults.enabled),
        minLength:normalizeInteger(id,'validation.minLength',source.minLength,0,1000000,defaults.minLength),
        maxLength:normalizeInteger(id,'validation.maxLength',source.maxLength,1,1000000,defaults.maxLength)
    };
    if ( validation.minLength > validation.maxLength ) { reportTextAreaIssue('MIN_LENGTH_CLAMPED',{ id, fallback:validation.maxLength }); validation.minLength = validation.maxLength; }
    return validation;
}

// Truncates a programmatic value to maxLength when validation is enabled (browser counting).
export function truncateToMaxLength( config, value )
{
    const text = String(value ?? '').replace(/\r\n?/g,'\n');
    return config.validation.enabled ? text.slice(0,config.validation.maxLength) : text;
}

// Produces the normalized, immutable configuration consumed by TextArea.
export function mergeTextAreaConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const rows = normalizeInteger(id,'rows',userConfig.rows,1,50,DEFAULT_TEXTAREA_CONFIG.rows);
    const autoGrow = Boolean(userConfig.autoGrow ?? DEFAULT_TEXTAREA_CONFIG.autoGrow);
    let maxRows = normalizeInteger(id,'maxRows',userConfig.maxRows,1,100,DEFAULT_TEXTAREA_CONFIG.maxRows);
    if ( maxRows < rows ) { reportTextAreaIssue('MAX_ROWS_CLAMPED',{ id, fallback:rows }); maxRows = rows; }
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? ''),
        placeholder:String(userConfig.placeholder ?? ''),
        help:String(userConfig.help ?? ''),
        state:normalizeEnum(id,'state',userConfig.state,TEXTAREA_STATES,DEFAULT_TEXTAREA_CONFIG.state),
        width:normalizeEnum(id,'width',userConfig.width,TEXTAREA_WIDTHS,DEFAULT_TEXTAREA_CONFIG.width),
        mandatory:Boolean(userConfig.mandatory ?? DEFAULT_TEXTAREA_CONFIG.mandatory),
        mandatoryIndicator:normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,TEXTAREA_MANDATORY_INDICATORS,DEFAULT_TEXTAREA_CONFIG.mandatoryIndicator),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,TEXTAREA_LABEL_POSITIONS,DEFAULT_TEXTAREA_CONFIG.labelPosition),
        autoFocus:Boolean(userConfig.autoFocus ?? DEFAULT_TEXTAREA_CONFIG.autoFocus),
        autocomplete:normalizeAutocomplete(id,userConfig.autocomplete),
        spellcheck:Boolean(userConfig.spellcheck ?? DEFAULT_TEXTAREA_CONFIG.spellcheck),
        rows,
        autoGrow,
        maxRows,
        resize:autoGrow ? 'NONE' : normalizeEnum(id,'resize',userConfig.resize,TEXTAREA_RESIZE_MODES,DEFAULT_TEXTAREA_CONFIG.resize),
        showCounter:Boolean(userConfig.showCounter ?? DEFAULT_TEXTAREA_CONFIG.showCounter),
        counterWarningThreshold:normalizeInteger(id,'counterWarningThreshold',userConfig.counterWarningThreshold,0,1000000,DEFAULT_TEXTAREA_CONFIG.counterWarningThreshold),
        // language of the counter number (digit grouping): the page language when not given
        locale:normalizeLocale(id,userConfig.locale),
        errorVisibilityDuration:normalizeInteger(id,'errorVisibilityDuration',userConfig.errorVisibilityDuration,0,60000,DEFAULT_TEXTAREA_CONFIG.errorVisibilityDuration),
        validation:normalizeValidation(id,userConfig.validation),
        texts:normalizeTexts(userConfig.texts)
    };
    if ( autoGrow && userConfig.resize !== undefined && String(userConfig.resize).toUpperCase() !== 'NONE' ) { reportTextAreaIssue('OPTION_IGNORED',{ id, key:'resize', condition:'autoGrow=true' }); }
    if ( !autoGrow && userConfig.maxRows !== undefined ) { reportTextAreaIssue('OPTION_IGNORED',{ id, key:'maxRows', condition:'autoGrow=false' }); }
    if ( !config.validation.enabled && ( userConfig.counterWarningThreshold !== undefined || userConfig.showCounter === true ) ) { reportTextAreaIssue('OPTION_IGNORED',{ id, key:'counter options', condition:'validation.enabled=false (no maxLength)' }); }
    config.value = truncateToMaxLength(config,userConfig.value);
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTextAreaConfig( config )
{
    if ( !config.id ) { return reportTextAreaIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(config.id) ) { return reportTextAreaIssue('UNSAFE_ID',{ id:config.id }); }
    if ( document.getElementById(config.id) ) { return reportTextAreaIssue('DUPLICATE_ID',{ id:config.id }); }
    return null;
}
