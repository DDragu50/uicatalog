// actionMenuConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, item normalization and developer validation.

import { reportActionMenuIssue } from './actionMenuErrors.js';

export const ACTION_MENU_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];
export const ACTION_MENU_ITEM_TYPES = [ 'ACTION', 'LINK', 'SEPARATOR' ];

export const DEFAULT_ACTION_MENU_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    label:'More actions',
    icon:'fa-solid fa-ellipsis-vertical',
    size:'SMALL',
    bordered:false,
    disabled:false,
    items:[],
    onAction:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportActionMenuIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Normalizes items: { key, label, icon?, disabled?, danger?, href?, target? } or { type:'SEPARATOR' }.
function normalizeItems( id, items )
{
    const seen = new Set();
    const list = ( Array.isArray(items) ? items : [] ).map(( item, index ) =>
    {
        if ( item?.type && String(item.type).toUpperCase() === 'SEPARATOR' ) { return { type:'SEPARATOR' }; }
        const key = String(item?.key ?? '').trim(), label = String(item?.label ?? '').trim();
        if ( !key || !label ) { reportActionMenuIssue('INVALID_ITEM',{ id, index }); return null; }
        if ( seen.has(key) ) { reportActionMenuIssue('DUPLICATE_ITEM_KEY',{ id, value:key }); return null; }
        seen.add(key);
        const href = String(item.href ?? '').trim();
        return { type:href ? 'LINK' : 'ACTION', key, label, icon:iconClass(item.icon), disabled:Boolean(item.disabled), danger:Boolean(item.danger), href, target:String(item.target ?? '').trim() };
    }).filter(Boolean);
    // Separators only between actions: none at the start, none after another separator, none at the end.
    const kept = list.filter(( item, index ) => item.type !== 'SEPARATOR' || ( index > 0 && list[index - 1].type !== 'SEPARATOR' ));
    while ( kept.at(-1)?.type === 'SEPARATOR' ) { kept.pop(); }
    return kept;
}

// Produces the normalized, immutable configuration consumed by ActionMenu.
function mergeActionMenuConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    return Object.freeze({
        id,
        label:String(userConfig.label ?? '').trim() || DEFAULT_ACTION_MENU_CONFIG.label,
        icon:iconClass(userConfig.icon) || DEFAULT_ACTION_MENU_CONFIG.icon,
        size:normalizeEnum(id,'size',userConfig.size,ACTION_MENU_SIZES,DEFAULT_ACTION_MENU_CONFIG.size),
        bordered:Boolean(userConfig.bordered ?? DEFAULT_ACTION_MENU_CONFIG.bordered),
        disabled:Boolean(userConfig.disabled ?? DEFAULT_ACTION_MENU_CONFIG.disabled),
        items:normalizeItems(id,userConfig.items),
        onAction:typeof userConfig.onAction === 'function' ? userConfig.onAction : null
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const ACTION_MENU_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeActionMenuConfig( userConfig = {} )
{
    const base = mergeActionMenuConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,ACTION_MENU_TOOLTIP_MODES,DEFAULT_ACTION_MENU_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_ACTION_MENU_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateActionMenuConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportActionMenuIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportActionMenuIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportActionMenuIssue('DUPLICATE_ID',{ id }); }
    if ( !config.items.some(item => item.type !== 'SEPARATOR') ) { return reportActionMenuIssue('ITEMS_REQUIRED',{ id }); }
    return null;
}
