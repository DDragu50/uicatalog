// copyAreaConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The area shows either a text (code or plain
// text) or content rendered by the application (a render function); copyValue replaces what is copied.

import { reportCopyAreaIssue } from './copyAreaErrors.js';

export const COPY_AREA_TEXT_STYLES = [ 'CODE', 'PLAIN' ];
export const COPY_AREA_BUTTONS = [ 'ICON', 'TEXT' ];

export const DEFAULT_COPY_AREA_CONFIG =
{
    id:'',
    label:'',
    text:'',
    textStyle:'CODE',
    lineNumbers:false,
    content:null,
    copyValue:null,
    copyButton:'ICON',
    tooltipMode:'TITLE',
    texts:
    {
        copy:'Copy',
        copied:'Copied',
        failed:'Couldn\'t copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.',
        region:'Content to copy'
    },
    onCopy:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportCopyAreaIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_COPY_AREA_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Returns whether an option was supplied (not undefined, null or '').
function isSupplied( value ) { return value !== undefined && value !== null && value !== ''; }

// Returns the value to copy instead of the shown content: a string (numbers are converted), or null when not set.
function normalizeCopyValue( id, value )
{
    if ( value === undefined || value === null ) { return null; }
    if ( typeof value === 'string' || typeof value === 'number' ) { return String(value); }
    reportCopyAreaIssue('INVALID_OPTION',{ id, key:'copyValue', value:typeof value, fallback:'the shown content' });
    return null;
}

// Produces the normalized configuration; mode is CONTENT (render function), CODE or PLAIN (text).
function mergeCopyAreaConfigBase( userConfig = {} )
{
    const source = userConfig && typeof userConfig === 'object' ? userConfig : {};
    const id = String(source.id ?? '').trim();
    const content = typeof source.content === 'function' ? source.content : null;
    if ( isSupplied(source.content) && !content ) { reportCopyAreaIssue('INVALID_OPTION',{ id, key:'content', value:typeof source.content, fallback:'text' }); }
    const text = typeof source.text === 'string' || typeof source.text === 'number' ? String(source.text) : '';
    if ( content && text ) { reportCopyAreaIssue('OPTIONS_CONFLICT',{ id, key:'text / content', detail:'both are set; content is shown and text is ignored' }); }
    if ( content && isSupplied(source.textStyle) ) { reportCopyAreaIssue('OPTION_IGNORED',{ id, key:'textStyle', condition:'content is set' }); }
    const textStyle = normalizeEnum(id,'textStyle',content ? undefined : source.textStyle,COPY_AREA_TEXT_STYLES,DEFAULT_COPY_AREA_CONFIG.textStyle);
    const mode = content ? 'CONTENT' : textStyle;
    if ( source.lineNumbers === true && mode !== 'CODE' ) { reportCopyAreaIssue('OPTION_IGNORED',{ id, key:'lineNumbers', condition:content ? 'content is set' : 'textStyle is "PLAIN"' }); }
    return {
        id,
        label:String(source.label ?? '').trim(),
        text:content ? '' : text,
        textStyle,
        mode,
        lineNumbers:mode === 'CODE' && source.lineNumbers === true,
        content,
        copyValue:normalizeCopyValue(id,source.copyValue),
        copyButton:normalizeEnum(id,'copyButton',source.copyButton,COPY_AREA_BUTTONS,DEFAULT_COPY_AREA_CONFIG.copyButton),
        texts:normalizeTexts(source.texts),
        onCopy:typeof source.onCopy === 'function' ? source.onCopy : null
    };
}

// How the component shows hints on hover and keyboard focus — here the name of its icon Copy button: NONE, TITLE (the
// browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values in every component (guidelines §12).
export const COPY_AREA_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode,
// passed to the icon Copy button (CopyArea has no hints of its own; a text button shows its name, so it takes none).
export function mergeCopyAreaConfig( userConfig = {} )
{
    const base = mergeCopyAreaConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    if ( base.copyButton === 'TEXT' && isSupplied(value) ) { reportCopyAreaIssue('OPTION_IGNORED',{ id:base.id, key:'tooltipMode', condition:'copyButton is "TEXT" (the button shows its name)' }); }
    const tooltipMode = base.copyButton === 'TEXT' ? 'NONE' : normalizeEnum(base.id,'tooltipMode',value,COPY_AREA_TOOLTIP_MODES,DEFAULT_COPY_AREA_CONFIG.tooltipMode);
    return Object.freeze({ ...base, tooltipMode, texts:Object.freeze(base.texts) });
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateCopyAreaConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportCopyAreaIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportCopyAreaIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportCopyAreaIssue('DUPLICATE_ID',{ id }); }
    if ( !config.content && !config.text ) { return reportCopyAreaIssue('CONTENT_REQUIRED',{ id }); }
    return null;
}
