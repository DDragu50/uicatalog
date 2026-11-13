// topNavigationConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, two-level item normalization and developer validation.

import { reportTopNavigationIssue } from './topNavigationErrors.js';

export const TOP_NAVIGATION_CURRENT_STYLES = [ 'UNDERLINE', 'PILL', 'TAB' ];
export const TOP_NAVIGATION_PANELS = [ 'LIST', 'MEGA' ];

export const DEFAULT_TOP_NAVIGATION_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    items:[],
    currentId:'',
    currentStyle:'UNDERLINE',
    texts:{ navigation:'Main', more:'More', menu:'Menu', subMenu:'{label} pages', newTab:'(opens in a new tab)' },
    onNavigate:null
};

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase();
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTopNavigationIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Normalizes the two-level tree: top items (with panel LIST or MEGA), dropdown entries, groups and separators.
export function normalizeItems( navId, items )
{
    const seen = new Set();
    const leaf = ( item, path, depth ) =>
    {
        const id = String(item?.id ?? '').trim(), label = String(item?.label ?? '').trim();
        if ( !id || !label ) { reportTopNavigationIssue('INVALID_ITEM',{ id:navId, value:path }); return null; }
        if ( seen.has(id) ) { reportTopNavigationIssue('DUPLICATE_ITEM_ID',{ id:navId, value:id }); return null; }
        seen.add(id);
        if ( depth > 0 && Array.isArray(item.children) && item.children.length ) { reportTopNavigationIssue('DEPTH_LIMIT',{ id:navId, value:label }); }
        const badge = item.badge === undefined || item.badge === null || item.badge === '' ? '' : String(item.badge);
        return { type:'ITEM', id, label, href:String(item.href ?? '').trim(), icon:iconClass(item.icon), badge, disabled:Boolean(item.disabled), external:Boolean(item.external), description:String(item.description ?? '').trim() };
    };
    const entries = ( list, path ) => ( Array.isArray(list) ? list : [] ).map(( item, index ) =>
    {
        const type = String(item?.type ?? '').toUpperCase();
        if ( type === 'SEPARATOR' ) { return { type:'SEPARATOR' }; }
        if ( type === 'GROUP' ) { const label = String(item.label ?? '').trim(); return label ? { type:'GROUP', label, children:( Array.isArray(item.children) ? item.children : [] ).map(( child, childIndex ) => leaf(child,`${path}${index}.${childIndex}`,1)).filter(Boolean) } : null; }
        return leaf(item,`${path}${index}`,1);
    }).filter(Boolean);
    return ( Array.isArray(items) ? items : [] ).map(( item, index ) =>
    {
        const top = leaf(item,String(index),0);
        if ( !top ) { return null; }
        return { ...top, panel:normalizeEnum(navId,`items[${top.id}].panel`,item.panel,TOP_NAVIGATION_PANELS,'LIST'), children:entries(item.children,`${index}.`) };
    }).filter(Boolean);
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_TOP_NAVIGATION_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by TopNavigation.
function mergeTopNavigationConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    return Object.freeze({
        id,
        items:normalizeItems(id,userConfig.items),
        currentId:String(userConfig.currentId ?? '').trim(),
        currentStyle:normalizeEnum(id,'currentStyle',userConfig.currentStyle,TOP_NAVIGATION_CURRENT_STYLES,DEFAULT_TOP_NAVIGATION_CONFIG.currentStyle),
        texts:normalizeTexts(userConfig.texts),
        onNavigate:typeof userConfig.onNavigate === 'function' ? userConfig.onNavigate : null
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const TOP_NAVIGATION_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeTopNavigationConfig( userConfig = {} )
{
    const base = mergeTopNavigationConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,TOP_NAVIGATION_TOOLTIP_MODES,DEFAULT_TOP_NAVIGATION_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_TOP_NAVIGATION_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTopNavigationConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportTopNavigationIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportTopNavigationIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportTopNavigationIssue('DUPLICATE_ID',{ id }); }
    if ( config.items.length === 0 ) { return reportTopNavigationIssue('ITEMS_REQUIRED',{ id }); }
    return null;
}
