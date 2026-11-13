// accordionConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.
// Messages and labels are defined in accordionErrors.js. Each item is a CollapsiblePanel configuration plus
// "content" (the panel's children); CollapsiblePanel normalizes and validates the item itself.

import { reportAccordionIssue } from './accordionErrors.js';

// SINGLE: opening an item closes the open one. MULTIPLE: items open and close independently.
export const ACCORDION_EXPAND_MODES = [ 'SINGLE', 'MULTIPLE' ];
// JOINED: one frame with dividers (items use CollapsiblePanel PLAIN). SEPARATE: one card per item, with a gap.
export const ACCORDION_LOOKS = [ 'JOINED', 'SEPARATE' ];
export const ACCORDION_CORNER_RADII = [ 'NONE', 'ROUNDED' ];
// Item options Accordion sets itself (the same for every item).
const OWNED_ITEM_KEYS = [ 'headingLevel' ];

export const DEFAULT_ACCORDION_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    items:[],
    expandMode:'SINGLE',
    look:'JOINED',
    headingLevel:3,
    bordered:true,
    cornerRadius:'ROUNDED',
    keyboardNavigation:true,
    onChange:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportAccordionIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max]; warns and falls back when a supplied value is outside it.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportAccordionIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps the item objects (copied, content separated); invalid items are reported and dropped. In SINGLE mode only the
// first item that asks for state EXPANDED keeps it.
function normalizeItems( config, items )
{
    const list = [];
    ( Array.isArray(items) ? items : [] ).forEach(( item, index ) =>
    {
        if ( !item || typeof item !== 'object' || Array.isArray(item) ) { reportAccordionIssue('INVALID_ITEM',{ id:config.id, index }); return; }
        const { content = [], ...panel } = item;
        OWNED_ITEM_KEYS.filter(key => panel[key] !== undefined).forEach(key => reportAccordionIssue('OPTION_IGNORED',{ id:config.id, key:`items[${index}].${key}`, condition:'the item is in an Accordion (set it on the Accordion)' }));
        if ( config.look === 'JOINED' && [ 'variant', 'bordered', 'cornerRadius' ].some(key => panel[key] !== undefined) ) { reportAccordionIssue('OPTION_IGNORED',{ id:config.id, key:`items[${index}].variant/bordered/cornerRadius`, condition:'look="JOINED" (the Accordion draws one frame)' }); }
        list.push({ index, panel, content });
    });
    if ( config.expandMode === 'SINGLE' )
    {
        const expanded = list.filter(entry => String(entry.panel.state ?? '').toUpperCase() === 'EXPANDED' && entry.panel.collapsible !== false);
        if ( expanded.length > 1 ) { reportAccordionIssue('SINGLE_EXPANDED',{ id:config.id, value:expanded[0].panel.id }); expanded.slice(1).forEach(entry => { entry.panel = { ...entry.panel, state:'COLLAPSED' }; }); }
    }
    return list;
}

// Produces the normalized, immutable configuration consumed by Accordion.
function mergeAccordionConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const config =
    {
        id,
        expandMode:normalizeEnum(id,'expandMode',userConfig.expandMode,ACCORDION_EXPAND_MODES,DEFAULT_ACCORDION_CONFIG.expandMode),
        look:normalizeEnum(id,'look',userConfig.look,ACCORDION_LOOKS,DEFAULT_ACCORDION_CONFIG.look),
        headingLevel:normalizeInteger(id,'headingLevel',userConfig.headingLevel,2,6,DEFAULT_ACCORDION_CONFIG.headingLevel),
        bordered:Boolean(userConfig.bordered ?? DEFAULT_ACCORDION_CONFIG.bordered),
        cornerRadius:normalizeEnum(id,'cornerRadius',userConfig.cornerRadius,ACCORDION_CORNER_RADII,DEFAULT_ACCORDION_CONFIG.cornerRadius),
        keyboardNavigation:Boolean(userConfig.keyboardNavigation ?? DEFAULT_ACCORDION_CONFIG.keyboardNavigation),
        onChange:typeof userConfig.onChange === 'function' ? userConfig.onChange : null
    };
    config.items = Object.freeze(normalizeItems(config,userConfig.items));
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const ACCORDION_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeAccordionConfig( userConfig = {} )
{
    const base = mergeAccordionConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,ACCORDION_TOOLTIP_MODES,DEFAULT_ACCORDION_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_ACCORDION_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateAccordionConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportAccordionIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportAccordionIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportAccordionIssue('DUPLICATE_ID',{ id }); }
    if ( !config.items.length ) { return reportAccordionIssue('ITEMS_REQUIRED',{ id }); }
    return null;
}
