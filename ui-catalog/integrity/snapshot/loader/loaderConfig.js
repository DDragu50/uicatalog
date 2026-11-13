// loaderConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.
// Messages and labels are defined in loaderErrors.js.

import { reportLoaderIssue } from './loaderErrors.js';

// BAR: a line that fills (or a band that moves along it). RING: a circle that fills (or an arc that turns).
export const LOADER_SHAPES = [ 'BAR', 'RING' ];
// SMALL: a thin line, or a ring of icon size. MEDIUM. LARGE.
export const LOADER_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];
// INLINE: in the container, in the page flow. EDGE: a thin line pinned to the top of the target, taking no space.
// OVERLAY: a layer that covers the target, blocks it and shows the indicator in a panel.
export const LOADER_PLACEMENTS = [ 'INLINE', 'EDGE', 'OVERLAY' ];
// Where the label and the value text go: above or below the indicator, after it, or only for screen readers.
export const LOADER_LABEL_PLACEMENTS = [ 'ABOVE', 'BELOW', 'END', 'HIDDEN' ];
// The visible value of a determinate Loader: "45%", "12 of 30", or none.
export const LOADER_VALUE_TEXTS = [ 'PERCENT', 'COUNT', 'NONE' ];
// OVERLAY: the panel in the middle of the target, or at the top of its visible part (tall, scrolled regions).
export const LOADER_INDICATOR_POSITIONS = [ 'CENTER', 'TOP' ];
// End statuses set by the application (setStatus) or by track(). getState() also reports IDLE and RUNNING.
export const LOADER_END_STATUSES = [ 'DONE', 'ERROR', 'CANCELLED' ];

export const DEFAULT_LOADER_CONFIG =
{
    id:'',
    shape:'BAR',
    size:'MEDIUM',
    placement:'INLINE',
    target:null,              // EDGE, OVERLAY: the container's parent element
    label:'',                 // texts.loading
    labelPlacement:undefined, // BAR: ABOVE; RING: END
    valueText:'PERCENT',
    max:100,
    value:null,               // null: indeterminate
    running:false,
    cancellable:false,
    indicatorPosition:'CENTER',
    showDelayMs:400,
    minVisibleMs:600,
    hideAfterMs:1500,
    announceEvery:25,
    texts:
    {
        loading:'Loading…', done:'Done', error:'Could not complete', cancelled:'Cancelled', cancel:'Cancel',
        percent:'{value}%', count:'{value} of {max}'
    },
    onCancel:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportLoaderIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a number within [min, max]; warns and falls back for anything else.
function normalizeNumber( id, key, value, fallback, min, max = Infinity )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isFinite(number) && number >= min && number <= max ) { return number; }
    reportLoaderIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_LOADER_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by Loader.
export function mergeLoaderConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const ignore = ( key, condition ) => { if ( userConfig[key] !== undefined && userConfig[key] !== null ) { reportLoaderIssue('OPTION_IGNORED',{ id, key, condition }); } };
    const placement = normalizeEnum(id,'placement',userConfig.placement,LOADER_PLACEMENTS,DEFAULT_LOADER_CONFIG.placement);
    const edge = placement === 'EDGE';
    let shape = normalizeEnum(id,'shape',userConfig.shape,LOADER_SHAPES,DEFAULT_LOADER_CONFIG.shape);
    let size = normalizeEnum(id,'size',userConfig.size,LOADER_SIZES,DEFAULT_LOADER_CONFIG.size);
    let labelPlacement = normalizeEnum(id,'labelPlacement',userConfig.labelPlacement,LOADER_LABEL_PLACEMENTS,shape === 'RING' ? 'END' : 'ABOVE');
    if ( edge )
    {
        // EDGE is always a thin bar without visible text or Cancel.
        if ( shape !== 'BAR' ) { reportLoaderIssue('OPTION_IGNORED',{ id, key:'shape "RING"', condition:'placement="EDGE" ("BAR" is used)' }); shape = 'BAR'; }
        if ( userConfig.size !== undefined && size !== 'SMALL' ) { reportLoaderIssue('OPTION_IGNORED',{ id, key:`size "${size}"`, condition:'placement="EDGE" ("SMALL" is used)' }); }
        if ( userConfig.labelPlacement !== undefined && labelPlacement !== 'HIDDEN' ) { reportLoaderIssue('OPTION_IGNORED',{ id, key:`labelPlacement "${labelPlacement}"`, condition:'placement="EDGE" (the label is for screen readers only)' }); }
        size = 'SMALL'; labelPlacement = 'HIDDEN';
        ignore('valueText','placement="EDGE" (no visible text)');
        ignore('cancellable','placement="EDGE"');
    }
    if ( placement === 'INLINE' ) { ignore('target','placement="INLINE"'); }
    if ( placement !== 'OVERLAY' ) { ignore('indicatorPosition',`placement="${placement}"`); }
    const running = Boolean(userConfig.running);
    let value = null;
    if ( userConfig.value !== undefined && userConfig.value !== null && userConfig.value !== '' )
    {
        if ( !running ) { ignore('value','running is false (pass the value to setValue())'); }
        else if ( Number.isFinite(Number(userConfig.value)) ) { value = Number(userConfig.value); }
        else { reportLoaderIssue('INVALID_VALUE',{ id, value:userConfig.value, result:'the Loader starts indeterminate' }); }
    }
    let cancellable = !edge && Boolean(userConfig.cancellable);
    if ( cancellable && typeof userConfig.onCancel !== 'function' ) { reportLoaderIssue('CANCEL_HANDLER_MISSING',{ id }); cancellable = false; }
    else if ( !cancellable ) { ignore('onCancel',edge ? 'placement="EDGE"' : 'cancellable is false'); }
    const max = normalizeNumber(id,'max',userConfig.max,DEFAULT_LOADER_CONFIG.max,Number.MIN_VALUE);
    const config =
    {
        id,
        shape,
        size,
        placement,
        target:placement === 'INLINE' ? null : userConfig.target ?? null,
        label:String(userConfig.label ?? '').trim(),
        labelPlacement,
        valueText:edge ? 'PERCENT' : normalizeEnum(id,'valueText',userConfig.valueText,LOADER_VALUE_TEXTS,DEFAULT_LOADER_CONFIG.valueText),
        max,
        value:value === null ? null : Math.min(Math.max(value,0),max),
        running,
        cancellable,
        indicatorPosition:placement === 'OVERLAY' ? normalizeEnum(id,'indicatorPosition',userConfig.indicatorPosition,LOADER_INDICATOR_POSITIONS,DEFAULT_LOADER_CONFIG.indicatorPosition) : 'CENTER',
        showDelayMs:normalizeNumber(id,'showDelayMs',userConfig.showDelayMs,DEFAULT_LOADER_CONFIG.showDelayMs,0),
        minVisibleMs:normalizeNumber(id,'minVisibleMs',userConfig.minVisibleMs,DEFAULT_LOADER_CONFIG.minVisibleMs,0),
        hideAfterMs:normalizeNumber(id,'hideAfterMs',userConfig.hideAfterMs,DEFAULT_LOADER_CONFIG.hideAfterMs,0),
        announceEvery:normalizeNumber(id,'announceEvery',userConfig.announceEvery,DEFAULT_LOADER_CONFIG.announceEvery,0,100),
        texts:normalizeTexts(userConfig.texts),
        onCancel:cancellable ? userConfig.onCancel : null
    };
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateLoaderConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportLoaderIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportLoaderIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportLoaderIssue('DUPLICATE_ID',{ id }); }
    return null;
}

// Returns the element an EDGE or OVERLAY Loader covers (target, else the container's parent), or null after INVALID_TARGET;
// warns when a positioned element between the container and the target would take the layer instead.
export function resolveLoaderTarget( config, container )
{
    if ( config.placement === 'INLINE' ) { return null; }
    const target = config.target ?? container.parentElement;
    if ( !( target instanceof Element ) || target === container || !target.contains(container) )
    {
        reportLoaderIssue('INVALID_TARGET',{ id:config.id, placement:`placement="${config.placement}"` });
        return null;
    }
    for ( let node = container.parentElement; node && node !== target; node = node.parentElement )
    {
        if ( getComputedStyle(node).position !== 'static' ) { reportLoaderIssue('POSITIONED_ANCESTOR',{ id:config.id, placement:config.placement }); break; }
    }
    return target;
}
