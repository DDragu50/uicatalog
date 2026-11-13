// stepperConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization of the steps and developer validation.
// Messages and labels are defined in stepperErrors.js.

import { reportStepperIssue } from './stepperErrors.js';
import { dropCircularRules } from './stepperState.js';

export const STEPPER_ORIENTATIONS = [ 'HORIZONTAL', 'VERTICAL' ];
// NUMBER: the step number. ICON: the step's icon (the number when it has none). DOT: a small dot, no text.
export const STEPPER_MARKERS = [ 'NUMBER', 'ICON', 'DOT' ];
// END: the label after the marker. BELOW: under the marker (HORIZONTAL). HIDDEN: only for screen readers and as a tooltip.
export const STEPPER_LABEL_PLACEMENTS = [ 'END', 'BELOW', 'HIDDEN' ];
// LINEAR: a step opens when the steps before it (or the steps named in its "after" rule) are complete.
// FREE: every enabled step opens at any time. NONE: the steps only inform (no interaction).
export const STEPPER_NAVIGATIONS = [ 'LINEAR', 'FREE', 'NONE' ];
// SEPARATE: one content area (below the steps, or beside them when VERTICAL). INLINE: under the current step (VERTICAL).
export const STEPPER_CONTENT_POSITIONS = [ 'SEPARATE', 'INLINE' ];
// Every status a step can show; the consumer keeps the ones the process needs (statuses option). NOT_STARTED is the
// neutral starting point and is always allowed.
export const STEPPER_STATUSES = [ 'NOT_STARTED', 'IN_PROGRESS', 'DONE', 'SKIPPED', 'WARNING', 'ERROR', 'BLOCKED', 'CANCELLED' ];

export const DEFAULT_STEPPER_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    ariaLabel:'',
    steps:[],
    current:'',
    orientation:'HORIZONTAL',
    marker:'NUMBER',
    labelPlacement:'END',
    connectors:true,
    statusText:false,
    compactWhenNarrow:true,
    navigation:'LINEAR',
    statuses:[ ...STEPPER_STATUSES ],
    autoStatus:true,
    showContent:false,
    contentPosition:'SEPARATE',
    showButtons:undefined,   // follows showContent
    actions:[],
    canLeave:null,
    texts:
    {
        stepper:'Progress', stepOf:'Step {index} of {count}', announcement:'Step {index} of {count}: {label}', optional:'(Optional)',
        availableAfter:'Available after: {steps}', back:'Back', next:'Next', finish:'Finish', skip:'Skip', finishBlocked:'Complete the other steps first', checking:'Checking the step…',
        statuses:{ NOT_STARTED:'Not started', IN_PROGRESS:'In progress', DONE:'Done', SKIPPED:'Skipped', WARNING:'Needs attention', ERROR:'Has errors', BLOCKED:'Blocked', CANCELLED:'Cancelled' }
    },
    onStepChange:null,
    onStatusChange:null,
    onFinish:null,
    onAction:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportStepperIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportStepperIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
}

// Merges consumer UI texts with defaults (one level of nesting for texts.statuses); empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    const result = Object.fromEntries(Object.entries(DEFAULT_STEPPER_CONFIG.texts).filter(( [ key ] ) => key !== 'statuses').map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
    const statuses = source.statuses && typeof source.statuses === 'object' ? source.statuses : {};
    result.statuses = Object.fromEntries(Object.entries(DEFAULT_STEPPER_CONFIG.texts.statuses).map(( [ key, fallback ] ) => [ key, String(statuses[key] ?? '').trim() || fallback ]));
    return result;
}

// Returns the allowed statuses (canonical, without duplicates, NOT_STARTED always included); invalid entries are dropped.
function normalizeStatuses( id, statuses )
{
    if ( statuses === undefined || statuses === null ) { return [ ...STEPPER_STATUSES ]; }
    if ( !Array.isArray(statuses) ) { reportStepperIssue('INVALID_OPTION',{ id, key:'statuses', value:String(statuses), fallback:'all statuses' }); return [ ...STEPPER_STATUSES ]; }
    const result = new Set([ 'NOT_STARTED' ]);
    statuses.forEach(( status, index ) =>
    {
        const normalized = String(status ?? '').trim().toUpperCase().replace(/-/g,'_');
        if ( STEPPER_STATUSES.includes(normalized) ) { result.add(normalized); }
        else { reportStepperIssue('UNKNOWN_STATUS',{ id, index, value:status }); }
    });
    return STEPPER_STATUSES.filter(status => result.has(status));
}

// Returns a status allowed by the configuration; reports and falls back to NOT_STARTED otherwise (also used by setStepStatus()).
export function normalizeStatus( id, step, value, allowed )
{
    const normalized = String(value ?? '').trim().toUpperCase().replace(/-/g,'_') || 'NOT_STARTED';
    if ( allowed.includes(normalized) ) { return normalized; }
    reportStepperIssue('INVALID_STATUS',{ id, value, step, result:'"NOT_STARTED" is used' });
    return 'NOT_STARTED';
}

// Normalizes the step list: { id, label, description?, icon?, status?, optional?, disabled?, after?, content? }.
// Steps without id or label and duplicate ids are dropped; "after" keeps known ids only (a string is one id).
function normalizeSteps( config, steps, allowed, rules )
{
    const id = config.id, seen = new Set(), list = [];
    ( Array.isArray(steps) ? steps : [] ).forEach(( step, index ) =>
    {
        const stepId = String(step?.id ?? '').trim(), label = String(step?.label ?? '').trim();
        if ( !step || typeof step !== 'object' || !stepId || !label ) { reportStepperIssue('INVALID_STEP',{ id, value:index }); return; }
        if ( seen.has(stepId) ) { reportStepperIssue('DUPLICATE_STEP_ID',{ id, value:stepId }); return; }
        seen.add(stepId);
        list.push({ index:list.length, source:index, id:stepId, label, step });
    });
    const ids = new Set(list.map(entry => entry.id));
    let afterIgnored = false;
    return list.map(( { index, source, id:stepId, label, step } ) =>
    {
        let after = null;
        if ( step.after !== undefined && step.after !== null )
        {
            if ( !rules ) { if ( !afterIgnored ) { reportStepperIssue('OPTION_IGNORED',{ id, key:'steps[].after', condition:`navigation="${config.navigation}" (only LINEAR follows rules)` }); afterIgnored = true; } }
            else
            {
                after = ( Array.isArray(step.after) ? step.after : [ step.after ] ).map(value => String(value ?? '').trim()).filter(Boolean);
                after = after.filter(value =>
                {
                    if ( value === stepId ) { reportStepperIssue('CIRCULAR_AFTER',{ id, value:stepId }); return false; }
                    if ( !ids.has(value) ) { reportStepperIssue('UNKNOWN_STEP',{ id, value, where:` in steps[${source}].after` }); return false; }
                    return true;
                });
            }
        }
        if ( step.content !== undefined && !config.showContent ) { config.contentIgnored = true; }
        return {
            index, id:stepId, label,
            description:String(step.description ?? '').trim(),
            icon:normalizeIconClass(id,`steps[${source}].icon`,step.icon),
            status:normalizeStatus(id,stepId,step.status,allowed),
            optional:Boolean(step.optional),
            disabled:Boolean(step.disabled),
            after,
            content:config.showContent ? ( Array.isArray(step.content) ? step.content : ( step.content === undefined || step.content === null ? [] : [ step.content ] ) ) : []
        };
    });
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
        if ( !key || !label ) { reportStepperIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportStepperIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportStepperIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Produces the normalized, immutable configuration consumed by Stepper.
function mergeStepperConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const ignore = ( key, condition ) => { if ( userConfig[key] !== undefined ) { reportStepperIssue('OPTION_IGNORED',{ id, key, condition }); } };
    const navigation = normalizeEnum(id,'navigation',userConfig.navigation,STEPPER_NAVIGATIONS,DEFAULT_STEPPER_CONFIG.navigation);
    const interactive = navigation !== 'NONE';
    const orientation = normalizeEnum(id,'orientation',userConfig.orientation,STEPPER_ORIENTATIONS,DEFAULT_STEPPER_CONFIG.orientation);
    const horizontal = orientation === 'HORIZONTAL';
    if ( !interactive ) { [ 'showContent', 'contentPosition', 'showButtons', 'actions', 'canLeave', 'autoStatus', 'onStepChange', 'onStatusChange', 'onFinish', 'onAction' ].forEach(key => ignore(key,'navigation="NONE" (the steps only inform)')); }
    const showContent = interactive && Boolean(userConfig.showContent);
    if ( interactive && !showContent ) { ignore('contentPosition','showContent is false'); }
    let labelPlacement = normalizeEnum(id,'labelPlacement',userConfig.labelPlacement,STEPPER_LABEL_PLACEMENTS,DEFAULT_STEPPER_CONFIG.labelPlacement);
    if ( !horizontal && labelPlacement === 'BELOW' ) { reportStepperIssue('OPTION_IGNORED',{ id, key:'labelPlacement "BELOW"', condition:'orientation="VERTICAL" ("END" is used)' }); labelPlacement = 'END'; }
    let contentPosition = showContent ? normalizeEnum(id,'contentPosition',userConfig.contentPosition,STEPPER_CONTENT_POSITIONS,DEFAULT_STEPPER_CONFIG.contentPosition) : 'SEPARATE';
    if ( horizontal && contentPosition === 'INLINE' ) { reportStepperIssue('OPTION_IGNORED',{ id, key:'contentPosition "INLINE"', condition:'orientation="HORIZONTAL" ("SEPARATE" is used)' }); contentPosition = 'SEPARATE'; }
    if ( !horizontal ) { ignore('compactWhenNarrow','orientation="VERTICAL"'); }
    const showButtons = interactive && Boolean(userConfig.showButtons ?? showContent);
    const actions = showButtons ? normalizeActions(id,'actions',userConfig.actions,'TERTIARY') : [];
    if ( interactive && !showButtons ) { ignore('actions','showButtons is false'); }
    if ( showButtons && !actions.length ) { ignore('onAction','there are no actions'); }
    if ( actions.length && typeof userConfig.onAction !== 'function' ) { reportStepperIssue('ACTION_HANDLER_MISSING',{ id, key:'actions', callback:'onAction' }); }
    const statuses = normalizeStatuses(id,userConfig.statuses);
    const config =
    {
        id,
        ariaLabel:String(userConfig.ariaLabel ?? '').trim(),
        orientation,
        marker:normalizeEnum(id,'marker',userConfig.marker,STEPPER_MARKERS,DEFAULT_STEPPER_CONFIG.marker),
        labelPlacement,
        connectors:userConfig.connectors !== false,
        statusText:Boolean(userConfig.statusText),
        compactWhenNarrow:horizontal && userConfig.compactWhenNarrow !== false,
        navigation,
        statuses,
        autoStatus:interactive && userConfig.autoStatus !== false,
        showContent,
        contentPosition,
        showButtons,
        actions:Object.freeze(actions),
        canLeave:interactive && typeof userConfig.canLeave === 'function' ? userConfig.canLeave : null,
        texts:normalizeTexts(userConfig.texts),
        onStepChange:interactive && typeof userConfig.onStepChange === 'function' ? userConfig.onStepChange : null,
        onStatusChange:interactive && typeof userConfig.onStatusChange === 'function' ? userConfig.onStatusChange : null,
        onFinish:interactive && typeof userConfig.onFinish === 'function' ? userConfig.onFinish : null,
        onAction:actions.length && typeof userConfig.onAction === 'function' ? userConfig.onAction : null,
        contentIgnored:false
    };
    const steps = normalizeSteps(config,userConfig.steps,statuses,navigation === 'LINEAR');
    if ( config.contentIgnored ) { reportStepperIssue('OPTION_IGNORED',{ id, key:'steps[].content', condition:'showContent is false' }); }
    delete config.contentIgnored;
    dropCircularRules(steps,stepId => reportStepperIssue('CIRCULAR_AFTER',{ id, value:stepId }));
    config.steps = Object.freeze(steps);
    const current = String(userConfig.current ?? '').trim();
    config.current = current && !steps.some(step => step.id === current) ? ( reportStepperIssue('UNKNOWN_STEP',{ id, value:current, where:' (current); the first open step is used' }), '' ) : current;
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const STEPPER_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeStepperConfig( userConfig = {} )
{
    const base = mergeStepperConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,STEPPER_TOOLTIP_MODES,DEFAULT_STEPPER_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_STEPPER_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateStepperConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportStepperIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportStepperIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportStepperIssue('DUPLICATE_ID',{ id }); }
    if ( !config.steps.length ) { return reportStepperIssue('STEPS_REQUIRED',{ id }); }
    return null;
}
