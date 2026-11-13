// searchBoxConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.
// Messages and labels are defined in searchBoxErrors.js.

import { reportSearchBoxIssue } from './searchBoxErrors.js';

// LIVE: search while typing (debounced). ON_DEMAND: search on Enter or the Search button.
export const SEARCH_BOX_MODES = [ 'LIVE', 'ON_DEMAND' ];
export const SEARCH_BOX_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];
export const SEARCH_BOX_WIDTHS = [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL', 'FIT_CONTENT' ];
// Search Button: a Button with the label (optionally with the magnifying glass before it) or an icon Button.
export const SEARCH_BOX_BUTTON_VARIANTS = [ 'BUTTON', 'ICON_BUTTON' ];
export const SEARCH_BOX_BUTTON_HIERARCHIES = [ 'PRIMARY', 'SECONDARY', 'TERTIARY' ];

export const DEFAULT_SEARCH_BOX_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    name:'',
    label:'',
    labelVisible:true,
    placeholder:'',
    help:'',
    searchMode:'LIVE',
    debounceMs:300,
    minLength:1,
    showSearchButton:false,
    searchButtonVariant:'BUTTON',
    searchButtonHierarchy:'PRIMARY',
    searchButtonIcon:false,
    autocomplete:'off',
    scopes:[],
    defaultScope:'',
    landmark:false,
    labelPosition:'INHERIT',
    width:'FULL',
    disabled:false,
    texts:{ clear:'Clear search', search:'Search', scopeLabel:'Search in', minLength:'Type at least {minLength} characters.' },
    onSearch:null,
    onInput:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportSearchBoxIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max]; warns and falls back when a supplied value is outside it.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportSearchBoxIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_SEARCH_BOX_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Returns the autocomplete token list; only letters, digits, spaces and "-" are allowed.
function normalizeAutocomplete( id, value )
{
    if ( value === undefined || value === null || value === '' ) { return DEFAULT_SEARCH_BOX_CONFIG.autocomplete; }
    const text = String(value).trim();
    if ( /^[a-zA-Z0-9 -]+$/.test(text) ) { return text; }
    reportSearchBoxIssue('INVALID_OPTION',{ id, key:'autocomplete', value, fallback:DEFAULT_SEARCH_BOX_CONFIG.autocomplete });
    return DEFAULT_SEARCH_BOX_CONFIG.autocomplete;
}

// Normalizes scopes: drops invalid and duplicate entries with warnings.
function normalizeScopes( id, scopes )
{
    if ( !Array.isArray(scopes) ) { return []; }
    const seen = new Set();
    return scopes.map(( scope, index ) => ({ index, value:String(scope?.value ?? '').trim(), label:String(scope?.label ?? '').trim(), description:String(scope?.description ?? '').trim() })).filter(scope =>
    {
        if ( !scope.value || !scope.label ) { reportSearchBoxIssue('INVALID_SCOPE',{ id, index:scope.index }); return false; }
        if ( seen.has(scope.value) ) { reportSearchBoxIssue('DUPLICATE_SCOPE_VALUE',{ id, value:scope.value }); return false; }
        seen.add(scope.value);
        return true;
    }).map(( { value, label, description } ) => ({ value, label, description }));
}

// Returns the initial scope value: the configured default when it exists, otherwise the first scope.
export function resolveScope( config, value )
{
    if ( config.scopes.length === 0 ) { return ''; }
    const requested = String(value ?? '').trim();
    if ( !requested || config.scopes.some(scope => scope.value === requested) ) { return requested || config.scopes[0].value; }
    reportSearchBoxIssue('UNKNOWN_SCOPE',{ id:config.id, value:requested, fallback:config.scopes[0].value });
    return config.scopes[0].value;
}

// Produces the normalized, immutable configuration consumed by SearchBox.
function mergeSearchBoxConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const searchMode = normalizeEnum(id,'searchMode',userConfig.searchMode,SEARCH_BOX_MODES,DEFAULT_SEARCH_BOX_CONFIG.searchMode);
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? '').trim(),
        labelVisible:Boolean(userConfig.labelVisible ?? DEFAULT_SEARCH_BOX_CONFIG.labelVisible),
        placeholder:String(userConfig.placeholder ?? ''),
        help:String(userConfig.help ?? '').trim(),
        searchMode,
        debounceMs:normalizeInteger(id,'debounceMs',userConfig.debounceMs,0,5000,DEFAULT_SEARCH_BOX_CONFIG.debounceMs),
        minLength:normalizeInteger(id,'minLength',userConfig.minLength,1,50,DEFAULT_SEARCH_BOX_CONFIG.minLength),
        showSearchButton:Boolean(userConfig.showSearchButton ?? DEFAULT_SEARCH_BOX_CONFIG.showSearchButton),
        searchButtonVariant:normalizeEnum(id,'searchButtonVariant',userConfig.searchButtonVariant,SEARCH_BOX_BUTTON_VARIANTS,DEFAULT_SEARCH_BOX_CONFIG.searchButtonVariant),
        searchButtonHierarchy:normalizeEnum(id,'searchButtonHierarchy',userConfig.searchButtonHierarchy,SEARCH_BOX_BUTTON_HIERARCHIES,DEFAULT_SEARCH_BOX_CONFIG.searchButtonHierarchy),
        searchButtonIcon:Boolean(userConfig.searchButtonIcon ?? DEFAULT_SEARCH_BOX_CONFIG.searchButtonIcon),
        autocomplete:normalizeAutocomplete(id,userConfig.autocomplete),
        scopes:normalizeScopes(id,userConfig.scopes),
        landmark:Boolean(userConfig.landmark ?? DEFAULT_SEARCH_BOX_CONFIG.landmark),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,SEARCH_BOX_LABEL_POSITIONS,DEFAULT_SEARCH_BOX_CONFIG.labelPosition),
        width:normalizeEnum(id,'width',userConfig.width,SEARCH_BOX_WIDTHS,DEFAULT_SEARCH_BOX_CONFIG.width),
        disabled:Boolean(userConfig.disabled ?? DEFAULT_SEARCH_BOX_CONFIG.disabled),
        texts:normalizeTexts(userConfig.texts),
        onSearch:typeof userConfig.onSearch === 'function' ? userConfig.onSearch : null,
        onInput:typeof userConfig.onInput === 'function' ? userConfig.onInput : null
    };
    if ( searchMode === 'ON_DEMAND' && userConfig.debounceMs !== undefined ) { reportSearchBoxIssue('OPTION_IGNORED',{ id, key:'debounceMs', condition:'searchMode="ON_DEMAND"' }); }
    const buttonOptions = [ 'searchButtonVariant', 'searchButtonHierarchy', 'searchButtonIcon' ].filter(key => userConfig[key] !== undefined);
    if ( !config.showSearchButton && buttonOptions.length ) { reportSearchBoxIssue('OPTION_IGNORED',{ id, key:buttonOptions.join('/'), condition:'showSearchButton=false' }); }
    else if ( config.searchButtonVariant === 'ICON_BUTTON' && userConfig.searchButtonIcon !== undefined ) { reportSearchBoxIssue('OPTION_IGNORED',{ id, key:'searchButtonIcon', condition:'searchButtonVariant="ICON_BUTTON" (the icon Button always shows the magnifying glass)' }); }
    if ( config.scopes.length === 0 && userConfig.defaultScope ) { reportSearchBoxIssue('OPTION_IGNORED',{ id, key:'defaultScope', condition:'there are no scopes' }); }
    config.defaultScope = resolveScope(config,userConfig.defaultScope);
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const SEARCH_BOX_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeSearchBoxConfig( userConfig = {} )
{
    const base = mergeSearchBoxConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,SEARCH_BOX_TOOLTIP_MODES,DEFAULT_SEARCH_BOX_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_SEARCH_BOX_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateSearchBoxConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportSearchBoxIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportSearchBoxIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportSearchBoxIssue('DUPLICATE_ID',{ id }); }
    if ( !config.label ) { return reportSearchBoxIssue('LABEL_REQUIRED',{ id }); }
    return null;
}
