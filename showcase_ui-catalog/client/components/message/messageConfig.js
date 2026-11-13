// messageConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.

import { reportMessageIssue } from './messageErrors.js';

export const MESSAGE_TYPES = [ 'INFO', 'SUCCESS', 'WARNING', 'DANGER', 'CUSTOM' ];
export const MESSAGE_LAYOUTS = [ 'INLINE', 'BLOCK', 'BANNER', 'TOAST', 'MODAL' ];
export const MESSAGE_CORNERS = [ 'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT' ];
export const MESSAGE_CORNER_RADII = [ 'NONE', 'ROUNDED' ];
export const MESSAGE_REMAINING_INDICATORS = [ 'NONE', 'BAR', 'TEXT', 'BAR_AND_TEXT' ];
// Layouts drawn as a box (border and corners apply).
const BOX_LAYOUTS = [ 'BLOCK', 'TOAST', 'MODAL' ];

export const DEFAULT_MESSAGE_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    type:'INFO',
    layout:'BLOCK',
    title:'',
    text:'',
    details:[],
    link:null,
    actions:[],
    defaultAction:'',
    closable:false,
    bordered:false,
    cornerRadius:'ROUNDED',
    duration:0,
    remainingIndicator:'NONE',
    visible:true,
    corner:'TOP_LEFT',
    icon:'',
    backgroundToken:'',
    colorToken:'',
    borderToken:'',
    texts:{ close:'Close message', ok:'OK', remaining:'Closes in {seconds} s', paused:'Paused', closesIn:'Closes by itself in {seconds} seconds.' },
    onClose:null,
    onAction:null
};

const DEFAULT_ICONS = { INFO:'fa-solid fa-circle-info', SUCCESS:'fa-solid fa-circle-check', WARNING:'fa-solid fa-triangle-exclamation', DANGER:'fa-solid fa-circle-exclamation', CUSTOM:'fa-solid fa-circle-info' };

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportMessageIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportMessageIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
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
        if ( !key || !label ) { reportMessageIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportMessageIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportMessageIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Returns a design-token name or '' (warning for invalid names).
function tokenName( id, key, value )
{
    const text = String(value ?? '').trim();
    if ( !text ) { return ''; }
    if ( /^--[a-zA-Z0-9_-]+$/.test(text) ) { return text; }
    reportMessageIssue('INVALID_TOKEN',{ id, key });
    return '';
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_MESSAGE_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Normalizes details: strings, or { label, href?, onClick? } entries (links or buttons, e.g. jumping to a form field).
function normalizeDetails( details )
{
    return ( Array.isArray(details) ? details : [] ).map(item =>
    {
        if ( item && typeof item === 'object' ) { const label = String(item.label ?? '').trim(); return label ? { label, href:String(item.href ?? '').trim(), onClick:typeof item.onClick === 'function' ? item.onClick : null } : null; }
        const label = String(item ?? '').trim();
        return label ? { label, href:'', onClick:null } : null;
    }).filter(Boolean);
}

// Normalizes the changeable content: title, text, details, link, type and icon.
export function normalizeContent( id, source, base = {} )
{
    const type = source.type !== undefined ? normalizeEnum(id,'type',source.type,MESSAGE_TYPES,'INFO') : base.type ?? 'INFO';
    const link = source.link && typeof source.link === 'object' && String(source.link.href ?? '').trim() && String(source.link.label ?? '').trim() ? { href:String(source.link.href).trim(), label:String(source.link.label).trim() } : source.link === undefined ? base.link ?? null : null;
    return {
        type,
        title:source.title !== undefined ? String(source.title ?? '').trim() : base.title ?? '',
        text:source.text !== undefined ? String(source.text ?? '').trim() : base.text ?? '',
        details:source.details !== undefined ? normalizeDetails(source.details) : base.details ?? [],
        link,
        icon:source.icon !== undefined ? iconClass(source.icon) || DEFAULT_ICONS[type] : ( base.customIcon ? base.icon : DEFAULT_ICONS[type] ),
        customIcon:source.icon !== undefined ? Boolean(iconClass(source.icon)) : Boolean(base.customIcon)
    };
}

// Returns the key of the action focused when a MODAL opens: defaultAction when given; for DANGER the cancel action
// (cancel:true, or key "cancel"), otherwise the last action, so a dangerous choice is never the default; '' = first button.
function resolveDefaultAction( id, layout, type, actions, requested )
{
    const key = String(requested ?? '').trim();
    if ( key && layout !== 'MODAL' ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'defaultAction', condition:`layout="${layout}"` }); return ''; }
    if ( key ) { if ( actions.some(action => action.key === key) ) { return key; } reportMessageIssue('INVALID_OPTION',{ id, key:'defaultAction', value:key, fallback:type === 'DANGER' ? 'the cancel action' : 'the first action' }); }
    if ( layout !== 'MODAL' || type !== 'DANGER' || actions.length < 2 ) { return ''; }
    return ( actions.find(action => action.cancel) ?? actions[actions.length - 1] ).key;
}

// Produces the normalized, immutable configuration consumed by Message.
function mergeMessageConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const content = normalizeContent(id,userConfig);
    const layout = normalizeEnum(id,'layout',userConfig.layout,MESSAGE_LAYOUTS,DEFAULT_MESSAGE_CONFIG.layout);
    // Application actions (guidelines §10.2) plus Message's own extension: cancel marks the safe choice (also key "cancel").
    const source = Array.isArray(userConfig.actions) ? userConfig.actions : [];
    const actions = normalizeActions(id,'actions',source,'').map(action => ( { ...action, cancel:Boolean(source.find(item => String(item?.key ?? '').trim() === action.key)?.cancel) || action.key.toLowerCase() === 'cancel' } ));
    if ( actions.length && layout !== 'MODAL' && typeof userConfig.onAction !== 'function' ) { reportMessageIssue('ACTION_HANDLER_MISSING',{ id, key:'actions', callback:'onAction' }); }
    let duration = Number(userConfig.duration ?? 0);
    if ( !Number.isFinite(duration) || duration < 0 ) { reportMessageIssue('INVALID_OPTION',{ id, key:'duration', value:userConfig.duration, fallback:0 }); duration = 0; }
    if ( duration && content.type === 'DANGER' ) { reportMessageIssue('TEMPORARY_DANGER',{ id }); duration = 0; }
    if ( duration && layout === 'MODAL' ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'duration', condition:'layout="MODAL" (a modal waits for the user)' }); duration = 0; }
    // The remaining time is shown only for a temporary message drawn as a box or strip (not INLINE: one line).
    let remainingIndicator = normalizeEnum(id,'remainingIndicator',userConfig.remainingIndicator,MESSAGE_REMAINING_INDICATORS,DEFAULT_MESSAGE_CONFIG.remainingIndicator);
    if ( remainingIndicator !== 'NONE' && ( !duration || layout === 'INLINE' ) )
    {
        reportMessageIssue('OPTION_IGNORED',{ id, key:'remainingIndicator', condition:layout === 'INLINE' ? 'layout="INLINE" (one line)' : 'no duration (the message is not temporary)' });
        remainingIndicator = 'NONE';
    }
    const config =
    {
        id,
        ...content,
        layout,
        actions,
        defaultAction:resolveDefaultAction(id,layout,content.type,actions,userConfig.defaultAction),
        closable:layout === 'MODAL' ? false : Boolean(userConfig.closable ?? DEFAULT_MESSAGE_CONFIG.closable),
        bordered:BOX_LAYOUTS.includes(layout) && Boolean(userConfig.bordered ?? DEFAULT_MESSAGE_CONFIG.bordered),
        cornerRadius:normalizeEnum(id,'cornerRadius',userConfig.cornerRadius,MESSAGE_CORNER_RADII,DEFAULT_MESSAGE_CONFIG.cornerRadius),
        duration,
        remainingIndicator,
        visible:Boolean(userConfig.visible ?? DEFAULT_MESSAGE_CONFIG.visible),
        corner:normalizeEnum(id,'corner',userConfig.corner,MESSAGE_CORNERS,DEFAULT_MESSAGE_CONFIG.corner),
        backgroundToken:tokenName(id,'backgroundToken',userConfig.backgroundToken),
        colorToken:tokenName(id,'colorToken',userConfig.colorToken),
        borderToken:tokenName(id,'borderToken',userConfig.borderToken),
        texts:normalizeTexts(userConfig.texts),
        onClose:typeof userConfig.onClose === 'function' ? userConfig.onClose : null,
        onAction:typeof userConfig.onAction === 'function' ? userConfig.onAction : null
    };
    if ( layout === 'MODAL' && userConfig.closable !== undefined ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'closable', condition:'layout="MODAL" (it closes through its buttons or Escape)' }); }
    if ( !BOX_LAYOUTS.includes(layout) && ( userConfig.bordered !== undefined || userConfig.cornerRadius !== undefined ) ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'bordered/cornerRadius', condition:`layout="${layout}" (not a box)` }); }
    if ( layout !== 'TOAST' && userConfig.corner !== undefined ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'corner', condition:`layout="${layout}"` }); }
    if ( content.type !== 'CUSTOM' && ( userConfig.backgroundToken || userConfig.colorToken || userConfig.borderToken ) ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'backgroundToken/colorToken/borderToken', condition:`type="${content.type}"` }); }
    if ( layout === 'INLINE' && ( content.details.length || actions.length ) ) { reportMessageIssue('OPTION_IGNORED',{ id, key:'details/actions', condition:'layout="INLINE" (one line)' }); }
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const MESSAGE_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeMessageConfig( userConfig = {} )
{
    const base = mergeMessageConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,MESSAGE_TOOLTIP_MODES,DEFAULT_MESSAGE_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_MESSAGE_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateMessageConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportMessageIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportMessageIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportMessageIssue('DUPLICATE_ID',{ id }); }
    if ( !config.text ) { return reportMessageIssue('TEXT_REQUIRED',{ id }); }
    return null;
}
