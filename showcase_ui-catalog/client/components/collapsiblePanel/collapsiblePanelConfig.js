// collapsiblePanelConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization, developer warnings and developer errors.
// Messages and labels are defined in collapsiblePanelErrors.js.

import { reportCollapsiblePanelIssue } from './collapsiblePanelErrors.js';

export const COLLAPSIBLE_PANEL_STATES = [ 'EXPANDED', 'COLLAPSED' ];
export const COLLAPSIBLE_PANEL_STATUSES = [ 'DEFAULT', 'SUCCESS', 'WARNING', 'ERROR', 'INCOMPLETE' ];
export const COLLAPSIBLE_PANEL_VARIANTS = [ 'DEFAULT', 'INLINE', 'COMPACT', 'PLAIN' ];
export const COLLAPSIBLE_PANEL_CORNER_RADII = [ 'NONE', 'ROUNDED' ];
export const COLLAPSIBLE_PANEL_HEADING_LEVELS = [ 0, 2, 3, 4, 5, 6 ];   // 0 = no heading element around the header

export const DEFAULT_COLLAPSIBLE_PANEL_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    title:'',
    description:'',
    icon:'',
    state:'COLLAPSED',
    collapsible:true,
    disabled:false,
    status:'DEFAULT',
    variant:'DEFAULT',
    bordered:false,
    cornerRadius:'ROUNDED',
    chips:[],
    actions:[],
    summaryRenderer:null,
    summaryEmptyText:'',
    showSummaryWhenExpanded:false,
    lazyContent:false,
    headingLevel:0,
    onToggle:null,
    onAction:null
};

// Returns the canonical UPPER_CASE value, or null when a supplied value is not allowed.
export function toEnumValue( value, allowed )
{
    const normalized = String(value ?? '').trim().toUpperCase().replace(/-/g,'_');
    return allowed.includes(normalized) ? normalized : null;
}

// Returns the canonical value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = toEnumValue(value,allowed);
    if ( normalized ) { return normalized; }
    reportCollapsiblePanelIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportCollapsiblePanelIssue('INVALID_ICON_CLASS',{ id, key }); }
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
        if ( !key || !label ) { reportCollapsiblePanelIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportCollapsiblePanelIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportCollapsiblePanelIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Copies child-component configurations without interpreting them.
function normalizeComponentConfigs( id, key, value )
{
    if ( value !== undefined && !Array.isArray(value) ) { reportCollapsiblePanelIssue('INVALID_COLLECTION',{ id, key }); return []; }
    return ( value ?? [] ).filter(item => item && typeof item === 'object').map(item => ({ ...item }));
}

// Produces the normalized configuration consumed by CollapsiblePanel.
function mergeCollapsiblePanelConfigBase( userConfig = {} )
{
    const config = { ...DEFAULT_COLLAPSIBLE_PANEL_CONFIG, ...userConfig };
    const id = config.id = String(config.id ?? '').trim();
    config.title = String(config.title ?? '').trim();
    config.description = String(config.description ?? '').trim();
    config.icon = normalizeIconClass(id,'icon',config.icon);
    config.state = normalizeEnum(id,'state',config.state,COLLAPSIBLE_PANEL_STATES,DEFAULT_COLLAPSIBLE_PANEL_CONFIG.state);
    config.collapsible = Boolean(config.collapsible);
    config.disabled = Boolean(config.disabled);
    config.status = normalizeEnum(id,'status',config.status,COLLAPSIBLE_PANEL_STATUSES,DEFAULT_COLLAPSIBLE_PANEL_CONFIG.status);
    config.variant = normalizeEnum(id,'variant',config.variant,COLLAPSIBLE_PANEL_VARIANTS,DEFAULT_COLLAPSIBLE_PANEL_CONFIG.variant);
    // border and corners belong to the card frame (DEFAULT, COMPACT); INLINE and PLAIN have no frame
    const frameless = config.variant === 'INLINE' || config.variant === 'PLAIN';
    if ( frameless && ( userConfig.bordered !== undefined || userConfig.cornerRadius !== undefined ) ) { reportCollapsiblePanelIssue('OPTION_IGNORED',{ id, key:'bordered/cornerRadius', condition:`variant="${config.variant}" (no frame)` }); }
    config.bordered = !frameless && Boolean(config.bordered);
    config.cornerRadius = normalizeEnum(id,'cornerRadius',config.cornerRadius,COLLAPSIBLE_PANEL_CORNER_RADII,DEFAULT_COLLAPSIBLE_PANEL_CONFIG.cornerRadius);
    config.chips = normalizeComponentConfigs(id,'chips',userConfig.chips);
    // header buttons: application actions (guidelines §10.2), TERTIARY by default; the former buttons option is gone
    if ( userConfig.buttons !== undefined ) { reportCollapsiblePanelIssue('OPTION_IGNORED',{ id, key:'buttons', condition:'used: it was replaced by actions + onAction' }); }
    delete config.buttons;
    config.actions = normalizeActions(id,'actions',userConfig.actions,'TERTIARY');
    config.onAction = typeof config.onAction === 'function' ? config.onAction : null;
    if ( config.actions.length && !config.onAction ) { reportCollapsiblePanelIssue('ACTION_HANDLER_MISSING',{ id, key:'actions', callback:'onAction' }); }
    config.summaryRenderer = typeof config.summaryRenderer === 'function' ? config.summaryRenderer : null;
    config.summaryEmptyText = String(config.summaryEmptyText ?? '').trim();
    config.showSummaryWhenExpanded = Boolean(config.showSummaryWhenExpanded);
    config.lazyContent = Boolean(config.lazyContent);
    // headingLevel: an integer 2–6 wraps the header control in <h2>…<h6>; 0 (default) adds no heading
    if ( config.headingLevel === undefined || config.headingLevel === null || config.headingLevel === '' ) { config.headingLevel = 0; }   // missing: the default, silently
    if ( !COLLAPSIBLE_PANEL_HEADING_LEVELS.includes(Number(config.headingLevel)) ) { reportCollapsiblePanelIssue('INVALID_OPTION',{ id, key:'headingLevel', value:config.headingLevel, fallback:0 }); config.headingLevel = 0; }
    else { config.headingLevel = Number(config.headingLevel); }
    config.onToggle = typeof config.onToggle === 'function' ? config.onToggle : null;

    if ( !config.collapsible )
    {
        if ( config.state === 'COLLAPSED' && userConfig.state !== undefined ) { reportCollapsiblePanelIssue('OPTION_IGNORED',{ id, key:'state="COLLAPSED"', condition:'collapsible=false (EXPANDED is used)' }); }
        [ 'disabled', 'lazyContent', 'onToggle' ].filter(key => userConfig[key]).forEach(key => reportCollapsiblePanelIssue('OPTION_IGNORED',{ id, key, condition:'collapsible=false' }));
        Object.assign(config,{ state:'EXPANDED', lazyContent:false });
    }
    return config;
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const COLLAPSIBLE_PANEL_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeCollapsiblePanelConfig( userConfig = {} )
{
    const base = mergeCollapsiblePanelConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,COLLAPSIBLE_PANEL_TOOLTIP_MODES,DEFAULT_COLLAPSIBLE_PANEL_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_COLLAPSIBLE_PANEL_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateCollapsiblePanelConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportCollapsiblePanelIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportCollapsiblePanelIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportCollapsiblePanelIssue('DUPLICATE_ID',{ id }); }
    if ( !config.title ) { return reportCollapsiblePanelIssue('TITLE_REQUIRED',{ id }); }
    return null;
}
