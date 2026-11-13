// tableConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, column normalization and developer validation.

import { reportTableIssue } from './tableErrors.js';

export const TABLE_DATA_MODES = [ 'CLIENT', 'SERVER' ];
export const TABLE_DISPLAY_MODES = [ 'SCROLL', 'PAGINATION' ];
export const TABLE_COLUMN_TYPES = [ 'TEXT', 'NUMBER', 'DATE' ];
export const TABLE_ALIGNMENTS = [ 'START', 'CENTER', 'END' ];
export const TABLE_COLUMN_WIDTHS = [ 'S', 'M', 'L', 'XL' ];

export const DEFAULT_TABLE_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    label:'',
    columns:[],
    rows:[],
    dataMode:'CLIENT',
    displayMode:'PAGINATION',
    itemsPerPage:null,
    selectable:false,
    selectionActions:[],
    stickyHeader:true,
    rowHover:true,
    alternateRows:false,
    locale:'',
    texts:
    {
        items:'{count} items', itemsSingular:'{count} item', visible:'{from}–{to} visible now', selected:'{count} selected',
        selectAll:'Select all {count} items', clearSelection:'Clear selection', noData:'No data', loading:'Loading…',
        loadError:'The data could not be loaded.', retry:'Retry', selectPage:'Select all rows on this page', selectRow:'Select row {number}', rowNumber:'#',
        pagination:'Table pages'
    },
    onDataRequest:null,
    onSelectionChange:null,
    onSelectionAction:null
};


// Returns the language tag for numbers, sorting or names: the given BCP 47 tag (e.g. 'ro', 'de-AT'), otherwise the page
// language, the browser language, 'en'; an invalid tag is reported and the fallback is used.
function normalizeLocale( id, value )
{
    const fallback = document.documentElement.lang || navigator.language || 'en';
    const text = String(value ?? '').trim();
    if ( !text ) { return fallback; }
    try { return Intl.getCanonicalLocales(text)[0]; }
    catch { reportTableIssue('INVALID_OPTION',{ id, key:'locale', value:text, fallback }); return fallback; }
}
// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTableIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Normalizes one column; returns null for columns without field.
function normalizeColumn( id, column, index )
{
    const field = String(column?.field ?? '').trim();
    if ( !field ) { reportTableIssue('INVALID_COLUMN',{ id, index }); return null; }
    const type = normalizeEnum(id,`columns[${field}].type`,column.type,TABLE_COLUMN_TYPES,'TEXT');
    const priorityRaw = column.priority ?? 1;
    const always = String(priorityRaw).toUpperCase() === 'ALWAYS';
    const priority = always ? 0 : Number.isInteger(Number(priorityRaw)) && Number(priorityRaw) >= 1 ? Number(priorityRaw) : ( reportTableIssue('INVALID_OPTION',{ id, key:`columns[${field}].priority`, value:priorityRaw, fallback:1 }), 1 );
    const compact = column.compact && typeof column.compact === 'object' ? { width:normalizeEnum(id,`columns[${field}].compact.width`,column.compact.width,TABLE_COLUMN_WIDTHS,'S'), format:typeof column.compact.format === 'function' ? column.compact.format : null } : null;
    return {
        field,
        label:String(column.label ?? field),
        type,
        sortable:column.sortable !== false,
        alignment:normalizeEnum(id,`columns[${field}].alignment`,column.alignment,TABLE_ALIGNMENTS,type === 'NUMBER' ? 'END' : 'START'),
        always,
        priority,
        width:normalizeEnum(id,`columns[${field}].width`,column.width,TABLE_COLUMN_WIDTHS,'M'),
        compact,
        format:typeof column.format === 'function' ? column.format : null,
        render:typeof column.render === 'function' ? column.render : null,
        truncate:column.truncate !== false
    };
}

// Normalizes the columns: drops invalid and duplicate ones; the first column becomes ALWAYS when none is.
function normalizeColumns( id, columns )
{
    const seen = new Set();
    const list = ( Array.isArray(columns) ? columns : [] ).map(( column, index ) => normalizeColumn(id,column,index)).filter(Boolean).filter(column =>
    {
        if ( seen.has(column.field) ) { reportTableIssue('DUPLICATE_COLUMN_FIELD',{ id, value:column.field }); return false; }
        seen.add(column.field);
        return true;
    });
    if ( list.length && !list.some(column => column.always) ) { reportTableIssue('NO_ALWAYS_COLUMN',{ id }); list[0] = { ...list[0], always:true, priority:0 }; }
    return list;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportTableIssue('INVALID_ICON_CLASS',{ id, key }); }
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
        if ( !key || !label ) { reportTableIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportTableIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportTableIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_TABLE_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by Table (config.rows keeps the initial rows).
function mergeTableConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const dataMode = normalizeEnum(id,'dataMode',userConfig.dataMode,TABLE_DATA_MODES,DEFAULT_TABLE_CONFIG.dataMode);
    let displayMode = normalizeEnum(id,'displayMode',userConfig.displayMode,TABLE_DISPLAY_MODES,DEFAULT_TABLE_CONFIG.displayMode);
    if ( dataMode === 'SERVER' && displayMode === 'SCROLL' ) { reportTableIssue('OPTION_IGNORED',{ id, key:'displayMode="SCROLL"', condition:'dataMode="SERVER" (PAGINATION is used)' }); displayMode = 'PAGINATION'; }
    const perPage = userConfig.itemsPerPage;
    const itemsPerPage = perPage === undefined || perPage === null || perPage === '' ? null : Number.isInteger(Number(perPage)) && Number(perPage) >= 1 ? Number(perPage) : ( reportTableIssue('INVALID_OPTION',{ id, key:'itemsPerPage', value:perPage, fallback:'automatic' }), null );
    const config =
    {
        id,
        label:String(userConfig.label ?? '').trim(),
        columns:normalizeColumns(id,userConfig.columns),
        rows:Array.isArray(userConfig.rows) ? userConfig.rows : [],
        dataMode,
        displayMode,
        itemsPerPage,
        selectable:Boolean(userConfig.selectable ?? DEFAULT_TABLE_CONFIG.selectable),
        selectionActions:normalizeActions(id,'selectionActions',userConfig.selectionActions,'SECONDARY'),
        stickyHeader:Boolean(userConfig.stickyHeader ?? DEFAULT_TABLE_CONFIG.stickyHeader),
        rowHover:Boolean(userConfig.rowHover ?? DEFAULT_TABLE_CONFIG.rowHover),
        alternateRows:Boolean(userConfig.alternateRows ?? DEFAULT_TABLE_CONFIG.alternateRows),
        locale:normalizeLocale(id,userConfig.locale),
        texts:normalizeTexts(userConfig.texts),
        onDataRequest:typeof userConfig.onDataRequest === 'function' ? userConfig.onDataRequest : null,
        onSelectionChange:typeof userConfig.onSelectionChange === 'function' ? userConfig.onSelectionChange : null,
        onSelectionAction:typeof userConfig.onSelectionAction === 'function' ? userConfig.onSelectionAction : null
    };
    if ( displayMode === 'SCROLL' && perPage !== undefined && perPage !== null ) { reportTableIssue('OPTION_IGNORED',{ id, key:'itemsPerPage', condition:'displayMode="SCROLL"' }); }
    if ( !config.selectable && config.selectionActions.length ) { reportTableIssue('OPTION_IGNORED',{ id, key:'selectionActions', condition:'selectable=false' }); }
    if ( config.selectable && config.selectionActions.length && !config.onSelectionAction ) { reportTableIssue('ACTION_HANDLER_MISSING',{ id, key:'selectionActions', callback:'onSelectionAction' }); }
    if ( dataMode === 'CLIENT' && userConfig.onDataRequest ) { reportTableIssue('OPTION_IGNORED',{ id, key:'onDataRequest', condition:'dataMode="CLIENT"' }); }
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const TABLE_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeTableConfig( userConfig = {} )
{
    const base = mergeTableConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,TABLE_TOOLTIP_MODES,DEFAULT_TABLE_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_TABLE_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTableConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportTableIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportTableIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportTableIssue('DUPLICATE_ID',{ id }); }
    if ( config.columns.length === 0 ) { return reportTableIssue('COLUMNS_REQUIRED',{ id }); }
    return null;
}

// Warns about rows without id or with duplicate ids (selection needs unique ids).
export function checkRowIds( config, rows )
{
    if ( !config.selectable ) { return; }
    const missing = rows.filter(row => row?.id === undefined || row?.id === null || row?.id === '').length;
    if ( missing ) { reportTableIssue('ROW_ID_MISSING',{ id:config.id, value:missing }); }
    const seen = new Set();
    rows.forEach(row => { const key = String(row?.id); if ( seen.has(key) ) { reportTableIssue('DUPLICATE_ROW_ID',{ id:config.id, value:key }); } seen.add(key); });
}
