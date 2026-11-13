// breadcrumbsConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, item normalization and developer validation.

import { reportBreadcrumbsIssue } from './breadcrumbsErrors.js';

// Separator between levels: CHEVRON (drawn), SLASH "/", ARROW "›", DOT "·".
export const BREADCRUMBS_SEPARATORS = [ 'CHEVRON', 'SLASH', 'ARROW', 'DOT' ];

export const DEFAULT_BREADCRUMBS_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    items:[],
    maxItems:5,
    separator:'CHEVRON',
    homeIcon:false,
    showCurrent:true,
    backLinkOnNarrow:true,
    structuredData:false,
    texts:{ navigation:'Breadcrumb', more:'Show hidden levels', back:'Back to {label}', siblings:'Pages next to {label}' },
    onNavigate:null
};

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Normalizes items: { label, href?, icon?, siblings?:[{ label, href }], siblingsLabel? }; the last item is the current page.
export function normalizeItems( id, items )
{
    const list = ( Array.isArray(items) ? items : [] ).map(( item, index ) =>
    {
        const label = String(item?.label ?? '').trim();
        if ( !label ) { reportBreadcrumbsIssue('INVALID_ITEM',{ id, index }); return null; }
        const siblings = ( Array.isArray(item.siblings) ? item.siblings : [] ).map(sibling => ({ label:String(sibling?.label ?? '').trim(), href:String(sibling?.href ?? '').trim() })).filter(sibling => sibling.label && sibling.href);
        if ( Array.isArray(item.siblings) && siblings.length < item.siblings.length ) { reportBreadcrumbsIssue('INVALID_SIBLING',{ id, value:label }); }
        return { label, href:String(item.href ?? '').trim(), icon:iconClass(item.icon), siblings, siblingsLabel:String(item.siblingsLabel ?? '').trim() };
    }).filter(Boolean);
    list.slice(0,-1).filter(item => !item.href).forEach(item => reportBreadcrumbsIssue('LINK_MISSING',{ id, value:item.label }));
    return list;
}

// Returns the canonical separator; warns and falls back to CHEVRON when a supplied value is not allowed.
function normalizeSeparator( id, value )
{
    if ( value === undefined || value === null || value === '' ) { return DEFAULT_BREADCRUMBS_CONFIG.separator; }
    const normalized = String(value).trim().toUpperCase();
    if ( BREADCRUMBS_SEPARATORS.includes(normalized) ) { return normalized; }
    reportBreadcrumbsIssue('INVALID_OPTION',{ id, key:'separator', value, fallback:DEFAULT_BREADCRUMBS_CONFIG.separator });
    return DEFAULT_BREADCRUMBS_CONFIG.separator;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_BREADCRUMBS_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by Breadcrumbs (config.items keeps the initial path).
function mergeBreadcrumbsConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const raw = userConfig.maxItems;
    const maxItems = raw === undefined || raw === null || raw === '' ? DEFAULT_BREADCRUMBS_CONFIG.maxItems : Number.isInteger(Number(raw)) && ( Number(raw) === 0 || Number(raw) >= 3 ) ? Number(raw) : ( reportBreadcrumbsIssue('INVALID_OPTION',{ id, key:'maxItems', value:raw, fallback:DEFAULT_BREADCRUMBS_CONFIG.maxItems }), DEFAULT_BREADCRUMBS_CONFIG.maxItems );
    return Object.freeze({
        id,
        items:normalizeItems(id,userConfig.items),
        maxItems,
        separator:normalizeSeparator(id,userConfig.separator),
        homeIcon:Boolean(userConfig.homeIcon ?? DEFAULT_BREADCRUMBS_CONFIG.homeIcon),
        showCurrent:Boolean(userConfig.showCurrent ?? DEFAULT_BREADCRUMBS_CONFIG.showCurrent),
        backLinkOnNarrow:Boolean(userConfig.backLinkOnNarrow ?? DEFAULT_BREADCRUMBS_CONFIG.backLinkOnNarrow),
        structuredData:Boolean(userConfig.structuredData ?? DEFAULT_BREADCRUMBS_CONFIG.structuredData),
        texts:normalizeTexts(userConfig.texts),
        onNavigate:typeof userConfig.onNavigate === 'function' ? userConfig.onNavigate : null
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const BREADCRUMBS_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeBreadcrumbsConfig( userConfig = {} )
{
    const base = mergeBreadcrumbsConfigBase(userConfig);
    const value = userConfig?.tooltipMode, given = value !== undefined && value !== null && value !== '';
    const tooltipMode = !given ? DEFAULT_BREADCRUMBS_CONFIG.tooltipMode : BREADCRUMBS_TOOLTIP_MODES.includes(String(value).trim().toUpperCase()) ? String(value).trim().toUpperCase()
        : ( reportBreadcrumbsIssue('INVALID_OPTION',{ id:base.id, key:'tooltipMode', value, fallback:DEFAULT_BREADCRUMBS_CONFIG.tooltipMode }), DEFAULT_BREADCRUMBS_CONFIG.tooltipMode );
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_BREADCRUMBS_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateBreadcrumbsConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportBreadcrumbsIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportBreadcrumbsIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportBreadcrumbsIssue('DUPLICATE_ID',{ id }); }
    if ( config.items.length === 0 ) { return reportBreadcrumbsIssue('ITEMS_REQUIRED',{ id }); }
    return null;
}
