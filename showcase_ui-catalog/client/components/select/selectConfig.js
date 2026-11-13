// selectConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The normalized configuration is
// immutable; initial selection is kept in config.options. Messages and labels are defined in selectErrors.js.

import { reportSelectIssue } from './selectErrors.js';

export const SELECT_STATES = [ 'EDIT', 'VIEW', 'INACTIVE', 'INVISIBLE' ];
export const SELECT_WIDTHS = [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ];
export const SELECT_SELECTION_MODES = [ 'SINGLE', 'MULTIPLE' ];
export const SELECT_PRESENTATIONS = [ 'NATIVE', 'CUSTOM' ];
export const SELECT_TOUCH_PRESENTATIONS = [ 'NATIVE', 'AS_CONFIGURED' ];
export const SELECT_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const SELECT_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];

export const DEFAULT_SELECT_CONFIG =
{
    id:'',
    name:'',
    label:'',
    help:'',
    state:'EDIT',
    width:'FULL',
    selectionMode:'SINGLE',
    presentation:'NATIVE',
    touchPresentation:'NATIVE',
    options:[],
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    searchable:false,
    showMultipleHint:false,
    autoFocus:false,
    optionHoverBackgroundToken:'--select-option-hover-bg',
    optionHoverColorToken:'--select-option-hover-color',
    optionSelectedBackgroundToken:'--select-option-selected-bg',
    optionSelectedColorToken:'--select-option-selected-color',
    texts:
    {
        optional:'(Optional)',
        placeholder:'Select an option',
        clear:'Clear selection',
        search:'Search options',
        noMatches:'No matching options',
        more:'+{count}',
        multipleHint:'Hold Ctrl or Cmd to select several.',
        errors:{ REQUIRED:'Select an option.', UNIDENTIFIED:'An unidentified error occurred.' }
    }
};

const TOKEN_KEYS = [ 'optionHoverBackgroundToken', 'optionHoverColorToken', 'optionSelectedBackgroundToken', 'optionSelectedColorToken' ];

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportSelectIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a design-system token name; warns and falls back when a supplied value is not a token name.
function normalizeToken( id, key, value )
{
    const fallback = DEFAULT_SELECT_CONFIG[key];
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const token = String(value).trim();
    if ( /^--[a-zA-Z0-9_-]+$/.test(token) ) { return token; }
    reportSelectIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
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
    const { errors, ...plain } = DEFAULT_SELECT_CONFIG.texts;
    return { ...mergeTexts(plain,texts), errors:mergeTexts(errors,texts?.errors) };
}

// Flattens options and groups into one ordered list; every option knows its group heading (or '').
function flattenOptions( options )
{
    const list = [];
    ( Array.isArray(options) ? options : [] ).forEach(item =>
    {
        if ( item && Array.isArray(item.options) ) { item.options.forEach(option => list.push({ ...option, group:String(item.group ?? '').trim() })); }
        else { list.push({ ...item, group:'' }); }
    });
    return list.map(( option, index ) => ({ index, value:String(option?.value ?? '').trim(), label:String(option?.label ?? '').trim(), disabled:Boolean(option?.disabled), selected:Boolean(option?.selected), group:option.group }));
}

// Drops duplicate values (first occurrence kept) with a warning and re-indexes the options.
function dropDuplicateValues( id, options )
{
    const seen = new Set();
    return options.filter(option =>
    {
        if ( !option.value || !seen.has(option.value) ) { seen.add(option.value); return true; }
        reportSelectIssue('DUPLICATE_OPTION_VALUE',{ id, value:option.value });
        return false;
    }).map(( option, index ) => ({ ...option, index }));
}

// Produces the normalized, immutable configuration consumed by Select.
export function mergeSelectConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const presentation = normalizeEnum(id,'presentation',userConfig.presentation,SELECT_PRESENTATIONS,DEFAULT_SELECT_CONFIG.presentation);
    const selectionMode = normalizeEnum(id,'selectionMode',userConfig.selectionMode,SELECT_SELECTION_MODES,DEFAULT_SELECT_CONFIG.selectionMode);
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? '').trim(),
        help:String(userConfig.help ?? ''),
        state:normalizeEnum(id,'state',userConfig.state,SELECT_STATES,DEFAULT_SELECT_CONFIG.state),
        width:normalizeEnum(id,'width',userConfig.width,SELECT_WIDTHS,DEFAULT_SELECT_CONFIG.width),
        selectionMode,
        presentation,
        touchPresentation:normalizeEnum(id,'touchPresentation',userConfig.touchPresentation,SELECT_TOUCH_PRESENTATIONS,DEFAULT_SELECT_CONFIG.touchPresentation),
        options:dropDuplicateValues(id,flattenOptions(userConfig.options)),
        mandatory:Boolean(userConfig.mandatory ?? DEFAULT_SELECT_CONFIG.mandatory),
        mandatoryIndicator:normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,SELECT_MANDATORY_INDICATORS,DEFAULT_SELECT_CONFIG.mandatoryIndicator),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,SELECT_LABEL_POSITIONS,DEFAULT_SELECT_CONFIG.labelPosition),
        searchable:Boolean(userConfig.searchable ?? DEFAULT_SELECT_CONFIG.searchable),
        showMultipleHint:Boolean(userConfig.showMultipleHint ?? DEFAULT_SELECT_CONFIG.showMultipleHint),
        autoFocus:Boolean(userConfig.autoFocus ?? DEFAULT_SELECT_CONFIG.autoFocus),
        texts:normalizeTexts(userConfig.texts)
    };
    TOKEN_KEYS.forEach(key => { config[key] = normalizeToken(id,key,userConfig[key]); });
    if ( presentation === 'NATIVE' )
    {
        [ 'searchable', ...TOKEN_KEYS ].filter(key => userConfig[key]).forEach(key => reportSelectIssue('OPTION_IGNORED',{ id, key, condition:'presentation="NATIVE"' }));
        if ( userConfig.touchPresentation !== undefined ) { reportSelectIssue('OPTION_IGNORED',{ id, key:'touchPresentation', condition:'presentation="NATIVE"' }); }
    }
    if ( userConfig.showMultipleHint && !( presentation === 'NATIVE' && selectionMode === 'MULTIPLE' ) ) { reportSelectIssue('OPTION_IGNORED',{ id, key:'showMultipleHint', condition:'the select is not a native multiple select' }); }
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateSelectConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportSelectIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportSelectIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportSelectIssue('DUPLICATE_ID',{ id }); }
    if ( config.options.length === 0 ) { return reportSelectIssue('OPTIONS_REQUIRED',{ id }); }
    if ( config.options.some(option => !option.value) ) { return reportSelectIssue('OPTION_VALUE_REQUIRED',{ id }); }
    if ( config.options.some(option => !option.label) ) { return reportSelectIssue('OPTION_LABEL_REQUIRED',{ id }); }
    if ( config.selectionMode === 'SINGLE' && config.options.filter(option => option.selected).length > 1 ) { return reportSelectIssue('MULTIPLE_INITIAL_SELECTION',{ id }); }
    return null;
}
