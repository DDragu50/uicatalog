// paginationConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. Messages and labels are defined in paginationErrors.js.

import { reportPaginationIssue } from './paginationErrors.js';

export const DEFAULT_PAGINATION_CONFIG =
{
    id:'',
    tooltipMode:'NONE',
    label:'',
    totalItems:0,
    itemsPerPage:25,
    currentPage:1,
    visiblePageCount:5,
    arrowVisibilityThreshold:6,
    showGoToPage:false,
    goToPageThreshold:6,
    locale:'',
    texts:
    {
        navigation:'Pagination', page:'Page {page}', previous:'Previous page', next:'Next page', goToPage:'Go to page',
        errors:{ INVALID_PAGE:'Enter a page from 1 to {totalPages}.' }
    },
    onPageChange:null
};


// Returns the language tag for numbers, sorting or names: the given BCP 47 tag (e.g. 'ro', 'de-AT'), otherwise the page
// language, the browser language, 'en'; an invalid tag is reported and the fallback is used.
function normalizeLocale( id, value )
{
    const fallback = document.documentElement.lang || navigator.language || 'en';
    const text = String(value ?? '').trim();
    if ( !text ) { return fallback; }
    try { return Intl.getCanonicalLocales(text)[0]; }
    catch { reportPaginationIssue('INVALID_OPTION',{ id, key:'locale', value:text, fallback }); return fallback; }
}
// Returns an integer ≥ min; warns and falls back when a supplied value is not one.
export function normalizeInteger( id, key, value, min, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min ) { return number; }
    reportPaginationIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges one level of consumer texts with defaults; empty texts fall back to defaults.
function mergeTexts( defaults, source )
{
    const input = source && typeof source === 'object' ? source : {};
    return Object.fromEntries(Object.entries(defaults).map(( [ key, fallback ] ) => [ key, String(input[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by Pagination (initial numbers; update() changes them later).
function mergePaginationConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const { errors, ...plain } = DEFAULT_PAGINATION_CONFIG.texts;
    const config =
    {
        id,
        label:String(userConfig.label ?? '').trim(),
        totalItems:normalizeInteger(id,'totalItems',userConfig.totalItems,0,DEFAULT_PAGINATION_CONFIG.totalItems),
        itemsPerPage:normalizeInteger(id,'itemsPerPage',userConfig.itemsPerPage,1,DEFAULT_PAGINATION_CONFIG.itemsPerPage),
        currentPage:normalizeInteger(id,'currentPage',userConfig.currentPage,1,DEFAULT_PAGINATION_CONFIG.currentPage),
        visiblePageCount:normalizeInteger(id,'visiblePageCount',userConfig.visiblePageCount,3,DEFAULT_PAGINATION_CONFIG.visiblePageCount),
        arrowVisibilityThreshold:normalizeInteger(id,'arrowVisibilityThreshold',userConfig.arrowVisibilityThreshold,2,DEFAULT_PAGINATION_CONFIG.arrowVisibilityThreshold),
        showGoToPage:Boolean(userConfig.showGoToPage ?? DEFAULT_PAGINATION_CONFIG.showGoToPage),
        goToPageThreshold:normalizeInteger(id,'goToPageThreshold',userConfig.goToPageThreshold,2,DEFAULT_PAGINATION_CONFIG.goToPageThreshold),
        // language of the page numbers (digit grouping): the page language when not given
        locale:normalizeLocale(id,userConfig.locale),
        texts:{ ...mergeTexts(plain,userConfig.texts), errors:mergeTexts(errors,userConfig.texts?.errors) },
        onPageChange:typeof userConfig.onPageChange === 'function' ? userConfig.onPageChange : null
    };
    config.label = config.label || config.texts.navigation;
    if ( !config.showGoToPage && userConfig.goToPageThreshold !== undefined ) { reportPaginationIssue('OPTION_IGNORED',{ id, key:'goToPageThreshold', condition:'showGoToPage=false' }); }
    return Object.freeze(config);
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const PAGINATION_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergePaginationConfig( userConfig = {} )
{
    const base = mergePaginationConfigBase(userConfig);
    const value = userConfig?.tooltipMode, given = value !== undefined && value !== null && value !== '';
    const tooltipMode = !given ? DEFAULT_PAGINATION_CONFIG.tooltipMode : PAGINATION_TOOLTIP_MODES.includes(String(value).trim().toUpperCase()) ? String(value).trim().toUpperCase()
        : ( reportPaginationIssue('INVALID_OPTION',{ id:base.id, key:'tooltipMode', value, fallback:DEFAULT_PAGINATION_CONFIG.tooltipMode }), DEFAULT_PAGINATION_CONFIG.tooltipMode );
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_PAGINATION_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validatePaginationConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportPaginationIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportPaginationIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportPaginationIssue('DUPLICATE_ID',{ id }); }
    return null;
}
