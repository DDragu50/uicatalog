// toggleConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The normalized configuration is
// immutable; config.value keeps the initial value. Messages and labels are defined in toggleErrors.js.

import { reportToggleIssue } from './toggleErrors.js';

// SWITCH: on/off slider (value true | false). RADIO: two radio buttons (value true | false | null = unanswered).
export const TOGGLE_PRESENTATIONS = [ 'SWITCH', 'RADIO' ];
export const TOGGLE_STATES = [ 'EDIT', 'VIEW', 'INACTIVE', 'INVISIBLE' ];
export const TOGGLE_STATE_TEXTS = [ 'NONE', 'ON_OFF', 'CUSTOM' ];
export const TOGGLE_STATE_DISPLAYS = [ 'CURRENT', 'BOTH' ];
export const TOGGLE_SIZES = [ 'SMALL', 'MEDIUM' ];
export const TOGGLE_DIRECTIONS = [ 'HORIZONTAL', 'VERTICAL' ];
export const TOGGLE_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const TOGGLE_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];

export const DEFAULT_TOGGLE_CONFIG =
{
    id:'',
    name:'',
    label:'',
    help:'',
    presentation:'SWITCH',
    state:'EDIT',
    value:false,
    stateText:'ON_OFF',
    stateDisplay:'CURRENT',
    onBackgroundToken:'--toggle-track-on-bg',
    offBackgroundToken:'--toggle-track-off-bg',
    size:'MEDIUM',
    direction:'HORIZONTAL',
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    autoFocus:false,
    texts:
    {
        on:'On', off:'Off', customOn:'', customOff:'', optional:'(Optional)', unanswered:'—',
        errors:{ REQUIRED:'Select an answer.', UNIDENTIFIED:'An unidentified error occurred.' }
    }
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportToggleIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a design-system token name; warns and falls back when a supplied value is not a token name.
function normalizeToken( id, key, value )
{
    const fallback = DEFAULT_TOGGLE_CONFIG[key];
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const token = String(value).trim();
    if ( /^--[a-zA-Z0-9_-]+$/.test(token) ) { return token; }
    reportToggleIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Merges one level of consumer texts with defaults; empty texts fall back to defaults.
function mergeTexts( defaults, source )
{
    const input = source && typeof source === 'object' ? source : {};
    return Object.fromEntries(Object.entries(defaults).map(( [ key, fallback ] ) => [ key, String(input[key] ?? '').trim() || fallback ]));
}

// Normalizes the UI texts, including the per-errorLabel messages.
function normalizeTexts( texts )
{
    const { errors, ...plain } = DEFAULT_TOGGLE_CONFIG.texts;
    return { ...mergeTexts(plain,texts), errors:mergeTexts(errors,texts?.errors) };
}

// Normalizes the initial value: boolean for SWITCH, boolean or null for RADIO.
function normalizeValue( id, presentation, value )
{
    const fallback = presentation === 'RADIO' ? null : false;
    if ( value === undefined ) { return fallback; }
    if ( value === true || value === false || ( value === null && presentation === 'RADIO' ) ) { return value; }
    reportToggleIssue('INVALID_OPTION',{ id, key:'value', value, fallback:String(fallback) });
    return fallback;
}

// Returns the [on, off] texts for the chosen state-text style.
export function stateLabels( config )
{
    if ( config.stateText === 'CUSTOM' ) { return [ config.texts.customOn, config.texts.customOff ]; }
    return [ config.texts.on, config.texts.off ];
}

// Produces the normalized, immutable configuration consumed by Toggle.
export function mergeToggleConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const presentation = normalizeEnum(id,'presentation',userConfig.presentation,TOGGLE_PRESENTATIONS,DEFAULT_TOGGLE_CONFIG.presentation);
    const texts = normalizeTexts(userConfig.texts);
    let stateText = normalizeEnum(id,'stateText',userConfig.stateText,TOGGLE_STATE_TEXTS,DEFAULT_TOGGLE_CONFIG.stateText);
    if ( presentation === 'RADIO' && stateText === 'NONE' ) { reportToggleIssue('OPTION_IGNORED',{ id, key:'stateText="NONE"', condition:'presentation="RADIO" (radios need labels; ON_OFF is used)' }); stateText = 'ON_OFF'; }
    if ( stateText === 'CUSTOM' && ( !texts.customOn || !texts.customOff ) ) { reportToggleIssue('CUSTOM_TEXTS_MISSING',{ id, fallback:'ON_OFF' }); stateText = 'ON_OFF'; }
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? '').trim(),
        help:String(userConfig.help ?? '').trim(),
        presentation,
        state:normalizeEnum(id,'state',userConfig.state,TOGGLE_STATES,DEFAULT_TOGGLE_CONFIG.state),
        value:normalizeValue(id,presentation,userConfig.value),
        stateText,
        stateDisplay:normalizeEnum(id,'stateDisplay',userConfig.stateDisplay,TOGGLE_STATE_DISPLAYS,DEFAULT_TOGGLE_CONFIG.stateDisplay),
        onBackgroundToken:normalizeToken(id,'onBackgroundToken',userConfig.onBackgroundToken),
        offBackgroundToken:normalizeToken(id,'offBackgroundToken',userConfig.offBackgroundToken),
        size:normalizeEnum(id,'size',userConfig.size,TOGGLE_SIZES,DEFAULT_TOGGLE_CONFIG.size),
        direction:normalizeEnum(id,'direction',userConfig.direction,TOGGLE_DIRECTIONS,DEFAULT_TOGGLE_CONFIG.direction),
        mandatory:Boolean(userConfig.mandatory ?? DEFAULT_TOGGLE_CONFIG.mandatory),
        mandatoryIndicator:normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,TOGGLE_MANDATORY_INDICATORS,DEFAULT_TOGGLE_CONFIG.mandatoryIndicator),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,TOGGLE_LABEL_POSITIONS,DEFAULT_TOGGLE_CONFIG.labelPosition),
        autoFocus:Boolean(userConfig.autoFocus ?? DEFAULT_TOGGLE_CONFIG.autoFocus),
        texts
    };
    if ( presentation === 'SWITCH' )
    {
        if ( config.stateText === 'NONE' && config.stateDisplay === 'BOTH' ) { reportToggleIssue('OPTION_IGNORED',{ id, key:'stateDisplay="BOTH"', condition:'stateText="NONE"' }); config.stateDisplay = 'CURRENT'; }
        [ 'mandatory', 'mandatoryIndicator', 'direction' ].filter(key => userConfig[key] !== undefined).forEach(key => reportToggleIssue('OPTION_IGNORED',{ id, key, condition:'presentation="SWITCH" (a switch always has a value)' }));
        config.mandatory = false;
    }
    else
    {
        [ 'size', 'stateDisplay', 'onBackgroundToken', 'offBackgroundToken' ].filter(key => userConfig[key] !== undefined).forEach(key => reportToggleIssue('OPTION_IGNORED',{ id, key, condition:'presentation="RADIO"' }));
    }
    return Object.freeze(config);
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateToggleConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportToggleIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportToggleIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportToggleIssue('DUPLICATE_ID',{ id }); }
    if ( !config.label ) { return reportToggleIssue('LABEL_REQUIRED',{ id }); }
    return null;
}
