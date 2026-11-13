// sideNavigationConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, item-tree normalization and developer validation.

import { reportSideNavigationIssue } from './sideNavigationErrors.js';

export const SIDE_NAVIGATION_LEVEL_STYLES = [ 'INDENTATION', 'TREE', 'BACKGROUND' ];

// Former level styles still accepted without a warning, and the style they now give.
const FORMER_LEVEL_STYLES = { FONT_WEIGHT:'TREE' };

export const SIDE_NAVIGATION_EXPAND_INDICATORS = [ 'CHEVRON', 'PLUS_MINUS' ];
export const SIDE_NAVIGATION_CORNER_RADII = [ 'NONE', 'SMALL', 'MEDIUM', 'LARGE' ];

export const DEFAULT_SIDE_NAVIGATION_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    items:[],
    currentId:'',
    levelStyle:'INDENTATION',
    expandIndicator:'CHEVRON',
    cornerRadius:'MEDIUM',
    railCollapsed:false,
    allowRail:true,
    expandedIds:[],
    search:false,
    searchThreshold:15,
    drawerToggleHost:null,
    texts:
    {
        navigation:'Main', expand:'Expand {label}', collapse:'Collapse {label}', collapseRail:'Collapse navigation', expandRail:'Expand navigation',
        openDrawer:'Open navigation', closeDrawer:'Close navigation', search:'Search the navigation', noResults:'No matching pages', newTab:'(opens in a new tab)'
    },
    onNavigate:null,
    onRailChange:null,
    onExpandChange:null
};

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Normalizes the item tree: links/parents { id, label, href?, icon?, badge?, disabled?, external?, children? },
// groups { type:'GROUP', label, children }, separators { type:'SEPARATOR' }. Invalid and duplicate items are dropped.
export function normalizeItems( navId, items )
{
    const seen = new Set();
    const walk = ( list, path ) => ( Array.isArray(list) ? list : [] ).map(( item, index ) =>
    {
        const type = String(item?.type ?? '').toUpperCase();
        if ( type === 'SEPARATOR' ) { return { type:'SEPARATOR' }; }
        const label = String(item?.label ?? '').trim();
        if ( type === 'GROUP' ) { return label ? { type:'GROUP', label, children:walk(item.children,`${path}${index}.`) } : ( reportSideNavigationIssue('INVALID_ITEM',{ id:navId, value:`${path}${index}` }), null ); }
        const id = String(item?.id ?? '').trim();
        if ( !id || !label ) { reportSideNavigationIssue('INVALID_ITEM',{ id:navId, value:`${path}${index}` }); return null; }
        if ( seen.has(id) ) { reportSideNavigationIssue('DUPLICATE_ITEM_ID',{ id:navId, value:id }); return null; }
        seen.add(id);
        const badge = item.badge === undefined || item.badge === null || item.badge === '' ? '' : String(item.badge);
        return { type:'ITEM', id, label, href:String(item.href ?? '').trim(), icon:iconClass(item.icon), badge, disabled:Boolean(item.disabled), external:Boolean(item.external), children:walk(item.children,`${path}${index}.`) };
    }).filter(Boolean);
    return walk(items,'');
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_SIDE_NAVIGATION_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Reads an option with a fixed list of values (upper case; '-' read as '_'); empty gives the default, an invalid
// value is reported and gives the default.
function readChoice( id, key, value, allowed )
{
    const fallback = DEFAULT_SIDE_NAVIGATION_CONFIG[key];
    const text = String(value ?? '').trim().toUpperCase().replace(/-/g,'_');
    if ( !text ) { return fallback; }
    if ( allowed.includes(text) ) { return text; }
    reportSideNavigationIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Produces the normalized, immutable configuration consumed by SideNavigation (initial items and state).
function mergeSideNavigationConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const given = String(userConfig.levelStyle ?? '').trim().toUpperCase().replace(/-/g,'_');
    const level = FORMER_LEVEL_STYLES[given] ?? given;
    const levelStyle = !level ? DEFAULT_SIDE_NAVIGATION_CONFIG.levelStyle : SIDE_NAVIGATION_LEVEL_STYLES.includes(level) ? level : ( reportSideNavigationIssue('INVALID_OPTION',{ id, key:'levelStyle', value:userConfig.levelStyle, fallback:'INDENTATION' }), 'INDENTATION' );
    const expandIndicator = readChoice(id,'expandIndicator',userConfig.expandIndicator,SIDE_NAVIGATION_EXPAND_INDICATORS);
    const cornerRadius = readChoice(id,'cornerRadius',userConfig.cornerRadius,SIDE_NAVIGATION_CORNER_RADII);
    const threshold = Number(userConfig.searchThreshold ?? DEFAULT_SIDE_NAVIGATION_CONFIG.searchThreshold);
    return Object.freeze({
        id,
        items:normalizeItems(id,userConfig.items),
        currentId:String(userConfig.currentId ?? '').trim(),
        levelStyle,
        expandIndicator,
        cornerRadius,
        railCollapsed:Boolean(userConfig.railCollapsed ?? DEFAULT_SIDE_NAVIGATION_CONFIG.railCollapsed),
        allowRail:Boolean(userConfig.allowRail ?? DEFAULT_SIDE_NAVIGATION_CONFIG.allowRail),
        expandedIds:Array.isArray(userConfig.expandedIds) ? userConfig.expandedIds.map(String) : [],
        search:Boolean(userConfig.search ?? DEFAULT_SIDE_NAVIGATION_CONFIG.search),
        searchThreshold:Number.isInteger(threshold) && threshold >= 0 ? threshold : ( reportSideNavigationIssue('INVALID_OPTION',{ id, key:'searchThreshold', value:userConfig.searchThreshold, fallback:15 }), 15 ),
        drawerToggleHost:userConfig.drawerToggleHost instanceof Element ? userConfig.drawerToggleHost : null,
        texts:normalizeTexts(userConfig.texts),
        onNavigate:typeof userConfig.onNavigate === 'function' ? userConfig.onNavigate : null,
        onRailChange:typeof userConfig.onRailChange === 'function' ? userConfig.onRailChange : null,
        onExpandChange:typeof userConfig.onExpandChange === 'function' ? userConfig.onExpandChange : null
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const SIDE_NAVIGATION_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeSideNavigationConfig( userConfig = {} )
{
    const base = mergeSideNavigationConfigBase(userConfig);
    const value = userConfig?.tooltipMode, given = value !== undefined && value !== null && value !== '';
    const tooltipMode = !given ? DEFAULT_SIDE_NAVIGATION_CONFIG.tooltipMode : SIDE_NAVIGATION_TOOLTIP_MODES.includes(String(value).trim().toUpperCase()) ? String(value).trim().toUpperCase()
        : ( reportSideNavigationIssue('INVALID_OPTION',{ id:base.id, key:'tooltipMode', value, fallback:DEFAULT_SIDE_NAVIGATION_CONFIG.tooltipMode }), DEFAULT_SIDE_NAVIGATION_CONFIG.tooltipMode );
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_SIDE_NAVIGATION_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateSideNavigationConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportSideNavigationIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportSideNavigationIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportSideNavigationIssue('DUPLICATE_ID',{ id }); }
    if ( config.items.length === 0 ) { return reportSideNavigationIssue('ITEMS_REQUIRED',{ id }); }
    return null;
}
