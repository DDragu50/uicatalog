// notificationConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization of the main content and of the indicator, developer validation.

import { reportNotificationIssue } from './notificationErrors.js';

export const NOTIFICATION_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];
export const NOTIFICATION_INDICATOR_KINDS = [ 'COUNT', 'DOT', 'TEXT' ];
export const NOTIFICATION_SHAPES = [ 'CIRCLE', 'TRIANGLE', 'SQUARE', 'DIAMOND' ];
export const NOTIFICATION_TYPES = [ 'INFO', 'SUCCESS', 'WARNING', 'DANGER', 'CUSTOM' ];
export const NOTIFICATION_CORNERS = [ 'TOP_RIGHT', 'TOP_LEFT', 'BOTTOM_RIGHT', 'BOTTOM_LEFT' ];

export const DEFAULT_NOTIFICATION_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    label:'',
    icon:'',
    image:'',
    text:'',
    size:'MEDIUM',
    clickable:true,
    disabled:false,
    border:false,
    colorToken:'',
    backgroundToken:'',
    indicator:null,
    texts:{ count:'{count} new' },
    onClick:null
};

export const DEFAULT_INDICATOR = { kind:'COUNT', value:0, max:99, shape:'CIRCLE', type:'DANGER', corner:'TOP_RIGHT', description:'', backgroundToken:'', colorToken:'' };

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportNotificationIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a design-token name or '' (warning for invalid names).
function tokenName( id, key, value )
{
    const text = String(value ?? '').trim();
    if ( !text ) { return ''; }
    if ( /^--[a-zA-Z0-9_-]+$/.test(text) ) { return text; }
    reportNotificationIssue('INVALID_TOKEN',{ id, key });
    return '';
}

// Normalizes the indicator { kind, value, max, shape, type, corner, description, backgroundToken, colorToken }, merged over a base; null removes it.
export function normalizeIndicator( id, source, base = DEFAULT_INDICATOR )
{
    if ( source === null || source === false ) { return null; }
    if ( !source || typeof source !== 'object' ) { return base === DEFAULT_INDICATOR ? null : base; }
    const kind = normalizeEnum(id,'indicator.kind',source.kind ?? base.kind,NOTIFICATION_INDICATOR_KINDS,'COUNT');
    const type = normalizeEnum(id,'indicator.type',source.type ?? base.type,NOTIFICATION_TYPES,'DANGER');
    const max = Number.isInteger(Number(source.max ?? base.max)) && Number(source.max ?? base.max) > 0 ? Number(source.max ?? base.max) : 99;
    const rawValue = source.value ?? base.value;
    const value = kind === 'COUNT' ? Math.max(0,Math.trunc(Number(rawValue) || 0)) : String(rawValue ?? '').trim();
    if ( kind !== 'DOT' && source.shape !== undefined ) { reportNotificationIssue('OPTION_IGNORED',{ id, key:'indicator.shape', condition:`kind="${kind}" (text indicators are a circle, or a pill for longer content)` }); }
    const indicator =
    {
        kind, value, max, type,
        shape:kind === 'DOT' ? normalizeEnum(id,'indicator.shape',source.shape ?? base.shape,NOTIFICATION_SHAPES,'CIRCLE') : 'CIRCLE',
        corner:normalizeEnum(id,'indicator.corner',source.corner ?? base.corner,NOTIFICATION_CORNERS,'TOP_RIGHT'),
        description:String(source.description ?? base.description ?? '').trim(),
        backgroundToken:type === 'CUSTOM' ? tokenName(id,'indicator.backgroundToken',source.backgroundToken ?? base.backgroundToken) : '',
        colorToken:type === 'CUSTOM' ? tokenName(id,'indicator.colorToken',source.colorToken ?? base.colorToken) : ''
    };
    return indicator;
}

// Warns that a main-content colour does not apply to images and returns ''.
function ignoreForImage( id, key, value ) { if ( String(value ?? '').trim() ) { reportNotificationIssue('OPTION_IGNORED',{ id, key, condition:'the main content is an image' }); } return ''; }

// Produces the normalized, immutable configuration consumed by Notification.
function mergeNotificationConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const image = String(userConfig.image ?? '').trim();
    const icon = String(userConfig.icon ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');
    const text = String(userConfig.text ?? '').trim();
    const given = [ image && 'image', icon && 'icon', text && 'text' ].filter(Boolean);
    const content = given[0] ?? '';
    if ( given.length > 1 ) { reportNotificationIssue('CONTENT_CONFLICT',{ id, value:content }); }
    if ( content === 'text' && text.length > 12 ) { reportNotificationIssue('TEXT_TOO_LONG',{ id, value:text }); }
    const clickable = Boolean(userConfig.clickable ?? DEFAULT_NOTIFICATION_CONFIG.clickable);
    if ( !clickable && userConfig.disabled !== undefined ) { reportNotificationIssue('OPTION_IGNORED',{ id, key:'disabled', condition:'clickable=false' }); }
    const texts = userConfig.texts && typeof userConfig.texts === 'object' ? userConfig.texts : {};
    return Object.freeze({
        id,
        label:String(userConfig.label ?? '').trim(),
        content,
        image, icon, text,
        size:normalizeEnum(id,'size',userConfig.size,NOTIFICATION_SIZES,DEFAULT_NOTIFICATION_CONFIG.size),
        clickable,
        disabled:clickable && Boolean(userConfig.disabled),
        border:Boolean(userConfig.border ?? DEFAULT_NOTIFICATION_CONFIG.border),
        colorToken:content === 'image' ? ignoreForImage(id,'colorToken',userConfig.colorToken) : tokenName(id,'colorToken',userConfig.colorToken),
        backgroundToken:content === 'image' ? ignoreForImage(id,'backgroundToken',userConfig.backgroundToken) : tokenName(id,'backgroundToken',userConfig.backgroundToken),
        indicator:normalizeIndicator(id,userConfig.indicator),
        texts:{ count:String(texts.count ?? '').trim() || DEFAULT_NOTIFICATION_CONFIG.texts.count },
        onClick:typeof userConfig.onClick === 'function' ? userConfig.onClick : null
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const NOTIFICATION_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeNotificationConfig( userConfig = {} )
{
    const base = mergeNotificationConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,NOTIFICATION_TOOLTIP_MODES,DEFAULT_NOTIFICATION_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_NOTIFICATION_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateNotificationConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportNotificationIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportNotificationIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportNotificationIssue('DUPLICATE_ID',{ id }); }
    if ( !config.label ) { return reportNotificationIssue('LABEL_REQUIRED',{ id }); }
    if ( !config.content ) { return reportNotificationIssue('CONTENT_REQUIRED',{ id }); }
    return null;
}
