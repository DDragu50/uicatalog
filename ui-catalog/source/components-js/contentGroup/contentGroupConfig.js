// contentGroupConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.
// Messages and labels are defined in contentGroupErrors.js.

import { reportContentGroupIssue } from './contentGroupErrors.js';

// FIELDSET: the group contains form controls (text may be mixed in). SECTION: static content only.
export const CONTENT_GROUP_SEMANTICS = [ 'FIELDSET', 'SECTION' ];
export const CONTENT_GROUP_DIRECTIONS = [ 'VERTICAL', 'HORIZONTAL' ];

export const DEFAULT_CONTENT_GROUP_CONFIG =
{
    id:'',
    label:'',
    title:'',
    description:'',
    semantic:'FIELDSET',
    headingLevel:3,
    direction:'VERTICAL',
    span:1,
    bordered:true,
    disabled:false
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportContentGroupIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max]; warns and falls back when a supplied value is outside it.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportContentGroupIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Produces the normalized, immutable configuration consumed by ContentGroup.
export function mergeContentGroupConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const semantic = normalizeEnum(id,'semantic',userConfig.semantic,CONTENT_GROUP_SEMANTICS,DEFAULT_CONTENT_GROUP_CONFIG.semantic);
    const config =
    {
        id,
        label:String(userConfig.label ?? '').trim(),
        title:String(userConfig.title ?? '').trim(),
        description:String(userConfig.description ?? '').trim(),
        semantic,
        headingLevel:normalizeInteger(id,'headingLevel',userConfig.headingLevel,2,6,DEFAULT_CONTENT_GROUP_CONFIG.headingLevel),
        direction:normalizeEnum(id,'direction',userConfig.direction,CONTENT_GROUP_DIRECTIONS,DEFAULT_CONTENT_GROUP_CONFIG.direction),
        span:normalizeInteger(id,'span',userConfig.span,1,12,DEFAULT_CONTENT_GROUP_CONFIG.span),
        bordered:Boolean(userConfig.bordered ?? DEFAULT_CONTENT_GROUP_CONFIG.bordered),
        disabled:Boolean(userConfig.disabled ?? DEFAULT_CONTENT_GROUP_CONFIG.disabled)
    };
    if ( semantic === 'SECTION' && config.disabled ) { reportContentGroupIssue('OPTION_IGNORED',{ id, key:'disabled', condition:'semantic="SECTION"' }); config.disabled = false; }
    if ( semantic === 'FIELDSET' && config.title ) { reportContentGroupIssue('OPTION_IGNORED',{ id, key:'title', condition:'semantic="FIELDSET" (use label)' }); config.title = ''; }
    if ( userConfig.headingLevel !== undefined && !config.title ) { reportContentGroupIssue('OPTION_IGNORED',{ id, key:'headingLevel', condition:'there is no title' }); }
    if ( semantic === 'FIELDSET' && !config.label ) { reportContentGroupIssue('NAME_MISSING',{ id, names:'label' }); }
    if ( semantic === 'SECTION' && !config.label && !config.title ) { reportContentGroupIssue('NAME_MISSING',{ id, names:'label or title' }); }
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateContentGroupConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportContentGroupIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportContentGroupIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportContentGroupIssue('DUPLICATE_ID',{ id }); }
    return null;
}
