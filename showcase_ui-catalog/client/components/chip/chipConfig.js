// chipConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization, developer warnings and developer errors.
// Messages and labels are defined in chipErrors.js.

import { reportChipIssue } from './chipErrors.js';

export const CHIP_TYPES = [ 'CUSTOM', 'SUCCESS', 'WARNING', 'DANGER', 'INFO' ];

export const DEFAULT_CHIP_CONFIG =
{
    id:'',
    label:'',
    prefix:'',
    type:'CUSTOM',
    iconBefore:'',
    iconAfter:'',
    bordered:false,
    removable:false,
    removeLabel:'',
    backgroundToken:'--c-surface-muted',
    colorToken:'--c-text',
    texts:{ remove:'Remove {label}' },
    onRemove:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( name, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportChipIssue('INVALID_OPTION',{ id:name, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( name, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportChipIssue('INVALID_ICON_CLASS',{ id:name, key }); }
    return valid.join(' ');
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_CHIP_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Checks whether a value is a valid design-system custom-property name.
function isTokenName( value ) { return /^--[a-zA-Z0-9_-]+$/.test(value); }

// Produces the normalized configuration consumed by Chip.
export function mergeChipConfig( userConfig = {} )
{
    const config = { ...DEFAULT_CHIP_CONFIG, ...userConfig };
    config.id = String(config.id ?? '').trim();
    config.label = String(config.label ?? '').trim();
    const name = config.id || config.label;
    config.prefix = String(config.prefix ?? '').trim();
    config.type = normalizeEnum(name,'type',config.type,CHIP_TYPES,DEFAULT_CHIP_CONFIG.type);
    // iconBefore (start, left in left-to-right) and iconAfter (end, before the remove button). "icon" no longer exists.
    if ( userConfig.icon !== undefined ) { reportChipIssue('OPTION_IGNORED',{ id:name, key:'icon', condition:'it is not a Chip option (use iconBefore or iconAfter)' }); }
    config.iconBefore = normalizeIconClass(name,'iconBefore',config.iconBefore);
    config.iconAfter = normalizeIconClass(name,'iconAfter',config.iconAfter);
    delete config.icon;
    config.bordered = Boolean(config.bordered);
    config.removable = Boolean(config.removable);
    config.removeLabel = String(config.removeLabel ?? '').trim();
    config.backgroundToken = String(config.backgroundToken ?? '').trim();
    config.colorToken = String(config.colorToken ?? '').trim();
    config.texts = normalizeTexts(config.texts);
    config.onRemove = typeof config.onRemove === 'function' ? config.onRemove : null;
    if ( config.type !== 'CUSTOM' && ( userConfig.backgroundToken || userConfig.colorToken ) ) { reportChipIssue('OPTION_IGNORED',{ id:name, key:'backgroundToken/colorToken', condition:`type="${config.type}"` }); }
    if ( !config.removable && ( userConfig.removeLabel || userConfig.onRemove ) ) { reportChipIssue('OPTION_IGNORED',{ id:name, key:'removeLabel/onRemove', condition:'removable=false' }); }
    return config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateChipConfig( config )
{
    const id = config.id || config.label;
    if ( !config.label ) { return reportChipIssue('LABEL_REQUIRED',{ id }); }
    if ( config.removable && !config.id ) { return reportChipIssue('ID_REQUIRED_WHEN_REMOVABLE',{ id }); }
    if ( config.type === 'CUSTOM' && !isTokenName(config.backgroundToken) ) { return reportChipIssue('INVALID_BACKGROUND_TOKEN',{ id }); }
    if ( config.type === 'CUSTOM' && !isTokenName(config.colorToken) ) { return reportChipIssue('INVALID_COLOR_TOKEN',{ id }); }
    return null;
}

// Returns the accessible name of the remove action.
export function removeLabelFor( config ) { return config.removeLabel || config.texts.remove.replace('{label}',[ config.prefix, config.label ].filter(Boolean).join(' ')).trim(); }
