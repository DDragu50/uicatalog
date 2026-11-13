// badgeConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The visual part is a Notification configuration.

import { reportBadgeIssue } from './badgeErrors.js';

export const BADGE_LAYOUTS = [ 'HORIZONTAL', 'VERTICAL' ];
export const BADGE_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];

export const DEFAULT_BADGE_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    name:'',
    description:'',
    notification:null,
    size:'MEDIUM',
    layout:'HORIZONTAL',
    href:'',
    colorToken:'',
    descriptionColorToken:'',
    onClick:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase();
    if ( allowed.includes(normalized) ) { return normalized; }
    reportBadgeIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a design-token name or '' (warning for invalid names).
function tokenName( id, key, value )
{
    const text = String(value ?? '').trim();
    if ( !text ) { return ''; }
    if ( /^--[a-zA-Z0-9_-]+$/.test(text) ) { return text; }
    reportBadgeIssue('INVALID_OPTION',{ id, key, value:text, fallback:'default colour' });
    return '';
}

// Produces the normalized, immutable configuration consumed by Badge.
function mergeBadgeConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const notification = userConfig.notification && typeof userConfig.notification === 'object' ? { ...userConfig.notification } : null;
    if ( notification && ( notification.clickable === true || notification.onClick ) ) { reportBadgeIssue('OPTION_IGNORED',{ id, key:'notification.clickable / notification.onClick', condition:'the Notification is inside a Badge (use the Badge href or onClick)' }); }
    if ( notification && notification.size !== undefined ) { reportBadgeIssue('OPTION_IGNORED',{ id, key:'notification.size', condition:'inside a Badge (use the Badge size)' }); }
    const href = String(userConfig.href ?? '').trim();
    const onClick = typeof userConfig.onClick === 'function' ? userConfig.onClick : null;
    if ( href && onClick ) { reportBadgeIssue('OPTION_IGNORED',{ id, key:'onClick', condition:'href is set (the badge is a link; use onClick only for button badges) — onClick is still reported before navigation' }); }
    return Object.freeze({
        id,
        name:String(userConfig.name ?? '').trim(),
        description:String(userConfig.description ?? '').trim(),
        notification,
        size:normalizeEnum(id,'size',userConfig.size,BADGE_SIZES,DEFAULT_BADGE_CONFIG.size),
        layout:normalizeEnum(id,'layout',userConfig.layout,BADGE_LAYOUTS,DEFAULT_BADGE_CONFIG.layout),
        href,
        colorToken:tokenName(id,'colorToken',userConfig.colorToken),
        descriptionColorToken:tokenName(id,'descriptionColorToken',userConfig.descriptionColorToken),
        onClick
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const BADGE_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeBadgeConfig( userConfig = {} )
{
    const base = mergeBadgeConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,BADGE_TOOLTIP_MODES,DEFAULT_BADGE_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_BADGE_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateBadgeConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportBadgeIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportBadgeIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportBadgeIssue('DUPLICATE_ID',{ id }); }
    if ( !config.name ) { return reportBadgeIssue('NAME_REQUIRED',{ id }); }
    return null;
}
