// checkboxRadioConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization, developer warnings and developer errors.
//
// Developer errors and warnings, with their labels and messages, are defined in checkboxRadioErrors.js.

import { reportCheckboxRadioIssue } from './checkboxRadioErrors.js';

export const CHECKBOX_RADIO_SELECTION_MODES = [ 'SINGLE', 'MULTIPLE' ];
export const CHECKBOX_RADIO_PRESENTATIONS = [ 'NATIVE', 'ICON', 'CHIP', 'SEGMENTED' ];
export const CHECKBOX_RADIO_DIRECTIONS = [ 'VERTICAL', 'HORIZONTAL' ];
export const CHECKBOX_RADIO_ICON_VARIANTS = [ 'REGULAR_REGULAR', 'REGULAR_SOLID' ];
export const CHECKBOX_RADIO_ICON_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];
export const CHECKBOX_RADIO_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const CHECKBOX_RADIO_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];

export const DEFAULT_CHECKBOX_RADIO_CONFIG =
{
    id:'',
    name:'',
    groupLabel:'',
    help:'',
    selectionMode:'MULTIPLE',
    presentation:'NATIVE',
    direction:'VERTICAL',
    iconVariant:'REGULAR_REGULAR',
    iconSize:'MEDIUM',
    options:[],
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    texts:{ optional:'(Optional)', mandatory:'Mandatory', requiredSelection:'Select an option.' },
    disabled:false
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed )
{
    const fallback = DEFAULT_CHECKBOX_RADIO_CONFIG[key];
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportCheckboxRadioIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_CHECKBOX_RADIO_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Normalizes one consumer option into the internal option shape.
function normalizeItem( option, index )
{
    const source = option && typeof option === 'object' ? option : {};
    return { value:String(source.value ?? '').trim(), label:String(source.label ?? '').trim(), selected:Boolean(source.selected), disabled:Boolean(source.disabled), index };
}

// Keeps the first occurrence of every option value and warns about dropped duplicates.
function dropDuplicateValues( id, options )
{
    const seen = new Set();
    return options.filter(option =>
    {
        if ( !option.value || !seen.has(option.value) ) { seen.add(option.value); return true; }
        reportCheckboxRadioIssue('DUPLICATE_OPTION_VALUE',{ id, value:option.value });
        return false;
    });
}

// Produces the normalized configuration consumed by CheckboxRadio.
export function mergeCheckboxRadioConfig( userConfig = {} )
{
    const config = { ...DEFAULT_CHECKBOX_RADIO_CONFIG, ...userConfig };
    config.id = String(config.id ?? '').trim();
    config.name = String(config.name ?? '').trim() || config.id;
    config.groupLabel = String(config.groupLabel ?? '').trim();
    config.help = String(config.help ?? '').trim();
    config.selectionMode = normalizeEnum(config.id,'selectionMode',config.selectionMode,CHECKBOX_RADIO_SELECTION_MODES);
    config.presentation = normalizeEnum(config.id,'presentation',config.presentation,CHECKBOX_RADIO_PRESENTATIONS);
    config.direction = normalizeEnum(config.id,'direction',config.direction,CHECKBOX_RADIO_DIRECTIONS);
    config.iconVariant = normalizeEnum(config.id,'iconVariant',config.iconVariant,CHECKBOX_RADIO_ICON_VARIANTS);
    config.iconSize = normalizeEnum(config.id,'iconSize',config.iconSize,CHECKBOX_RADIO_ICON_SIZES);
    config.options = dropDuplicateValues(config.id,Array.isArray(config.options) ? config.options.map(normalizeItem) : []);
    config.texts = normalizeTexts(config.texts);
    config.disabled = Boolean(config.disabled);
    config.mandatory = Boolean(config.mandatory);
    config.mandatoryIndicator = normalizeEnum(config.id,'mandatoryIndicator',config.mandatoryIndicator,CHECKBOX_RADIO_MANDATORY_INDICATORS);
    config.labelPosition = normalizeEnum(config.id,'labelPosition',config.labelPosition,CHECKBOX_RADIO_LABEL_POSITIONS);
    // SEGMENTED: one row of joined segments, so the arrangement is fixed (horizontal)
    if ( config.presentation === 'SEGMENTED' ) { if ( userConfig.direction !== undefined && userConfig.direction !== null && userConfig.direction !== '' ) { reportCheckboxRadioIssue('OPTION_IGNORED',{ id:config.id, key:'direction', condition:'presentation="SEGMENTED" (always one row)' }); } config.direction = 'HORIZONTAL'; }
    if ( config.presentation !== 'ICON' && ( userConfig.iconVariant || userConfig.iconSize ) ) { reportCheckboxRadioIssue('OPTION_IGNORED',{ id:config.id, key:'iconVariant/iconSize', condition:`presentation="${config.presentation}"` }); }
    if ( !config.groupLabel && !config.mandatory ) { reportCheckboxRadioIssue('GROUP_LABEL_MISSING',{ id:config.id }); }
    return config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateCheckboxRadioConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportCheckboxRadioIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportCheckboxRadioIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportCheckboxRadioIssue('DUPLICATE_ID',{ id }); }
    if ( config.options.length === 0 ) { return reportCheckboxRadioIssue('OPTIONS_REQUIRED',{ id }); }
    if ( config.options.some(option => !option.value) ) { return reportCheckboxRadioIssue('OPTION_VALUE_REQUIRED',{ id }); }
    if ( config.options.some(option => !option.label) ) { return reportCheckboxRadioIssue('OPTION_LABEL_REQUIRED',{ id }); }
    if ( config.selectionMode === 'SINGLE' && config.options.filter(option => option.selected).length > 1 ) { return reportCheckboxRadioIssue('MULTIPLE_INITIAL_SELECTION',{ id }); }
    if ( config.mandatory && !config.groupLabel ) { return reportCheckboxRadioIssue('GROUP_LABEL_REQUIRED',{ id }); }
    return null;
}
