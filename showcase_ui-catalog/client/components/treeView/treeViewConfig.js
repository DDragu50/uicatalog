// treeViewConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization of the item tree and developer validation.
// Messages and labels are defined in treeViewErrors.js.

import { reportTreeViewIssue } from './treeViewErrors.js';

// NONE: items are only browsed and activated. SINGLE: one selected item. MULTIPLE: checkboxes.
export const TREE_VIEW_SELECTION_MODES = [ 'NONE', 'SINGLE', 'MULTIPLE' ];
// Which ticked ids form the value (MULTIPLE with checkCascade): every ticked item, only end items, or the top-most ones.
export const TREE_VIEW_CHECKED_VALUES = [ 'ALL', 'LEAVES', 'TOP' ];
export const TREE_VIEW_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];
export const TREE_VIEW_MANDATORY_INDICATORS = [ 'NONE', 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK' ];

export const DEFAULT_TREE_VIEW_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    name:'',
    label:'',
    ariaLabel:'',
    help:'',
    items:[],
    selectionMode:'SINGLE',
    checkCascade:true,
    checkedValue:'ALL',
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    guideLines:false,
    search:false,
    editable:false,
    confirmDelete:true,
    actions:[],
    loadChildren:null,
    canMove:null,
    canAct:null,
    texts:
    {
        tree:'Tree', optional:'(Optional)', search:'Search the tree', noResults:'No matching items', loading:'Loading…', loadError:'Could not load. Open again to retry.',
        toolbar:'Edit the tree', add:'Add', addChild:'Add sub-item', rename:'Rename', delete:'Delete', moveUp:'Move up', moveDown:'Move down', indent:'Move into the item above', outdent:'Move out of the parent',
        newItem:'New item', renameField:'New name for {label}', deleteTitle:'Delete "{label}"?', deleteText:'This cannot be undone.', deleteTextChildren:'Its {count} sub-items are deleted too. This cannot be undone.', deleteConfirm:'Delete', cancel:'Cancel',
        errors:{ REQUIRED_SELECTION:'Select an item.' }
    },
    onValueChange:null,
    onActivate:null,
    onExpandChange:null,
    onCurrentChange:null,
    onEdit:null,
    onAction:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTreeViewIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped (also used by updateItem()).
export function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportTreeViewIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
}

// Merges consumer UI texts with defaults (one level of nesting for texts.errors); empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    const result = Object.fromEntries(Object.entries(DEFAULT_TREE_VIEW_CONFIG.texts).filter(( [ key ] ) => key !== 'errors').map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
    const errors = source.errors && typeof source.errors === 'object' ? source.errors : {};
    result.errors = Object.fromEntries(Object.entries(DEFAULT_TREE_VIEW_CONFIG.texts.errors).map(( [ key, fallback ] ) => [ key, String(errors[key] ?? '').trim() || fallback ]));
    return result;
}

// Normalizes an item tree: { id, label, icon?, badge?, disabled?, expanded?, selected?, hasChildren?, children? }.
// Items without id or label, and duplicate ids (also against ids already in the tree: existing), are dropped with
// their children. hasChildren (children loaded on first opening) applies only with loadChildren (lazy). Used for
// config.items, setItems() and children returned by loadChildren.
export function normalizeTreeItems( treeId, items, lazy, existing = new Set(), path = '' )
{
    return ( Array.isArray(items) ? items : [] ).map(( item, index ) =>
    {
        const where = `${path}${index}`;
        const id = String(item?.id ?? '').trim(), label = String(item?.label ?? '').trim();
        if ( !item || typeof item !== 'object' || !id || !label ) { reportTreeViewIssue('INVALID_ITEM',{ id:treeId, value:`items[${where}]` }); return null; }
        if ( existing.has(id) ) { reportTreeViewIssue('DUPLICATE_ITEM_ID',{ id:treeId, value:id }); return null; }
        existing.add(id);
        const badge = item.badge === undefined || item.badge === null || item.badge === '' ? '' : String(item.badge);
        const children = normalizeTreeItems(treeId,item.children,lazy,existing,`${where}.`);
        const later = children.length === 0 && Boolean(item.hasChildren);
        if ( later && !lazy ) { reportTreeViewIssue('OPTION_IGNORED',{ id:treeId, key:`items[${where}].hasChildren`, condition:'loadChildren is not set' }); }
        return { id, label, icon:normalizeIconClass(treeId,`items[${where}].icon`,item.icon), badge, disabled:Boolean(item.disabled), expanded:Boolean(item.expanded), selected:Boolean(item.selected),
            hasChildren:children.length > 0 || ( later && lazy ), loaded:!( later && lazy ), children };
    }).filter(Boolean);
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
        if ( !key || !label ) { reportTreeViewIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportTreeViewIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportTreeViewIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Produces the normalized, immutable configuration consumed by TreeView.
function mergeTreeViewConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const selectionMode = normalizeEnum(id,'selectionMode',userConfig.selectionMode,TREE_VIEW_SELECTION_MODES,DEFAULT_TREE_VIEW_CONFIG.selectionMode);
    const multiple = selectionMode === 'MULTIPLE', selecting = selectionMode !== 'NONE';
    const ignore = ( key, condition ) => { if ( userConfig[key] !== undefined ) { reportTreeViewIssue('OPTION_IGNORED',{ id, key, condition }); } };
    if ( !multiple ) { ignore('checkCascade','selectionMode is not "MULTIPLE"'); ignore('checkedValue','selectionMode is not "MULTIPLE"'); }
    if ( !selecting ) { [ 'name', 'mandatory', 'mandatoryIndicator', 'labelPosition' ].forEach(key => ignore(key,'selectionMode="NONE" (the tree is not a form field)')); }
    if ( selecting ) { ignore('onActivate','selectionMode is not "NONE" (use the value-change callback)'); }
    const checkCascade = multiple ? userConfig.checkCascade !== false : false;
    if ( multiple && !checkCascade && userConfig.checkedValue !== undefined ) { reportTreeViewIssue('OPTION_IGNORED',{ id, key:'checkedValue', condition:'checkCascade is false (the value holds every ticked item)' }); }
    const editable = Boolean(userConfig.editable);
    if ( !editable ) { ignore('confirmDelete','editable is false'); ignore('canMove','editable is false'); ignore('onEdit','editable is false'); }
    const actions = normalizeActions(id,'actions',userConfig.actions,'TERTIARY');
    if ( !actions.length ) { ignore('canAct','there are no actions'); ignore('onAction','there are no actions'); }
    if ( actions.length && typeof userConfig.onAction !== 'function' ) { reportTreeViewIssue('ACTION_HANDLER_MISSING',{ id, key:'actions', callback:'onAction' }); }
    const label = String(userConfig.label ?? '').trim();
    if ( label && userConfig.ariaLabel !== undefined ) { reportTreeViewIssue('OPTION_IGNORED',{ id, key:'ariaLabel', condition:'label is set (the visible label names the tree)' }); }
    const texts = normalizeTexts(userConfig.texts);
    const config =
    {
        id,
        name:selecting ? String(userConfig.name ?? '').trim() || id : '',
        label,
        ariaLabel:label ? '' : String(userConfig.ariaLabel ?? '').trim(),
        help:String(userConfig.help ?? '').trim(),
        selectionMode,
        checkCascade,
        checkedValue:multiple && checkCascade ? normalizeEnum(id,'checkedValue',userConfig.checkedValue,TREE_VIEW_CHECKED_VALUES,DEFAULT_TREE_VIEW_CONFIG.checkedValue) : 'ALL',
        mandatory:selecting ? userConfig.mandatory !== false : false,
        mandatoryIndicator:selecting ? normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,TREE_VIEW_MANDATORY_INDICATORS,DEFAULT_TREE_VIEW_CONFIG.mandatoryIndicator) : 'NONE',
        labelPosition:selecting ? normalizeEnum(id,'labelPosition',userConfig.labelPosition,TREE_VIEW_LABEL_POSITIONS,DEFAULT_TREE_VIEW_CONFIG.labelPosition) : 'TOP',
        guideLines:Boolean(userConfig.guideLines),
        search:Boolean(userConfig.search),
        editable,
        confirmDelete:editable ? userConfig.confirmDelete !== false : false,
        loadChildren:typeof userConfig.loadChildren === 'function' ? userConfig.loadChildren : null,
        canMove:editable && typeof userConfig.canMove === 'function' ? userConfig.canMove : null,
        actions:Object.freeze(actions),
        canAct:actions.length && typeof userConfig.canAct === 'function' ? userConfig.canAct : null,
        onAction:actions.length && typeof userConfig.onAction === 'function' ? userConfig.onAction : null,
        onCurrentChange:typeof userConfig.onCurrentChange === 'function' ? userConfig.onCurrentChange : null,
        texts,
        onActivate:!selecting && typeof userConfig.onActivate === 'function' ? userConfig.onActivate : null,
        onExpandChange:typeof userConfig.onExpandChange === 'function' ? userConfig.onExpandChange : null,
        onEdit:editable && typeof userConfig.onEdit === 'function' ? userConfig.onEdit : null,
        onValueChange:selecting && typeof userConfig.onValueChange === 'function' ? userConfig.onValueChange : null
    };
    config.items = normalizeTreeItems(id,userConfig.items,Boolean(config.loadChildren));
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const TREE_VIEW_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeTreeViewConfig( userConfig = {} )
{
    const base = mergeTreeViewConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,TREE_VIEW_TOOLTIP_MODES,DEFAULT_TREE_VIEW_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_TREE_VIEW_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTreeViewConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportTreeViewIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportTreeViewIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportTreeViewIssue('DUPLICATE_ID',{ id }); }
    if ( config.mandatory && !config.label ) { return reportTreeViewIssue('LABEL_REQUIRED',{ id }); }
    if ( !config.label && !config.ariaLabel ) { reportTreeViewIssue('LABEL_MISSING',{ id, value:config.texts.tree }); }
    return null;
}
