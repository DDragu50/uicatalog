// calendarConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. The normalized configuration is
// immutable; config.value keeps the initial value. Messages and labels are defined in calendarErrors.js.

import { reportCalendarIssue } from './calendarErrors.js';
import { parseValue, formatExact, QUICK_RANGES } from './calendarDates.js';

export const CALENDAR_TYPES = [ 'DATE', 'TIME', 'DATETIME', 'MONTH', 'WEEK' ];
export const CALENDAR_PRESENTATIONS = [ 'NATIVE', 'CUSTOM' ];
export const CALENDAR_STATES = [ 'EDIT', 'VIEW', 'INACTIVE', 'INVISIBLE' ];
export const CALENDAR_WIDTHS = [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ];
export const CALENDAR_DISPLAY_FORMATS = [ 'SHORT', 'LONG' ];
export const CALENDAR_DATE_FORMATS = [ 'EU', 'US', 'ISO' ];
export const CALENDAR_DISPLAY_MODES = [ 'EXACT', 'RELATIVE', 'BOTH' ];
export const CALENDAR_MANDATORY_INDICATORS = [ 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK', 'NONE' ];
export const CALENDAR_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];
export const CALENDAR_QUICK_RANGES = QUICK_RANGES;

export const DEFAULT_CALENDAR_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    name:'',
    label:'',
    help:'',
    type:'DATE',
    presentation:'CUSTOM',
    range:false,
    state:'EDIT',
    width:'MEDIUM',
    value:'',
    minValue:'',
    maxValue:'',
    minRangeDays:null,
    maxRangeDays:null,
    timeStep:1,
    showToday:false,
    showClear:false,
    quickRanges:[],
    firstDayOfWeek:1,
    showWeekNumbers:false,
    disabledDaysOfWeek:[],
    disabledDates:[],
    highlights:[ { daysOfWeek:[ 6, 0 ], backgroundToken:'--calendar-weekend-bg' } ],
    dateFormat:'EU',
    displayFormat:'SHORT',
    displayMode:'EXACT',
    referenceTime:null,
    locale:'',
    mandatory:true,
    mandatoryIndicator:'NONE',
    labelPosition:'INHERIT',
    autoFocus:false,
    texts:
    {
        optional:'(Optional)', from:'From', to:'To', today:'Today', now:'Now', clear:'Clear', done:'Done',
        openCalendar:'Choose date', previousMonth:'Previous month', nextMonth:'Next month', previousYear:'Previous year', nextYear:'Next year',
        hour:'Hour', minute:'Minute', week:'Week', weekShort:'W{week} {year}', weekLong:'Week {week}, {year}', placeholder:'Select',
        day:'Day', month:'Month', year:'Year', period:'AM/PM', chooseMonth:'Choose month', chooseYear:'Choose year', chooseDecade:'Choose decade',
        previousDecade:'Previous decade', nextDecade:'Next decade', previousCentury:'Previous century', nextCentury:'Next century',
        placeholderDay:'dd', placeholderMonth:'mm', placeholderYear:'yyyy', placeholderHour:'hh', placeholderMinute:'mm', placeholderWeek:'ww', placeholderPeriod:'--',
        LAST_7_DAYS:'Last 7 days', NEXT_7_DAYS:'Next 7 days', LAST_1_MONTH:'Last month', NEXT_1_MONTH:'Next month',
        LAST_3_MONTHS:'Last 3 months', NEXT_3_MONTHS:'Next 3 months', LAST_6_MONTHS:'Last 6 months', NEXT_6_MONTHS:'Next 6 months',
        LAST_1_YEAR:'Last year', NEXT_1_YEAR:'Next year',
        errors:
        {
            REQUIRED:'Enter a date.', INVALID_DATE:'Enter a valid date.', MIN_VALUE:'Enter {minValue} or later.', MAX_VALUE:'Enter {maxValue} or earlier.',
            DISABLED_DATE:'This date is not available.', RANGE_INCOMPLETE:'Enter both dates.', RANGE_ORDER:'The end must not be before the start.',
            RANGE_TOO_SHORT:'Choose at least {minRangeDays} days.', RANGE_TOO_LONG:'Choose at most {maxRangeDays} days.', UNIDENTIFIED:'An unidentified error occurred.'
        }
    }
};


// Returns the language tag for numbers, sorting or names: the given BCP 47 tag (e.g. 'ro', 'de-AT'), otherwise the page
// language, the browser language, 'en'; an invalid tag is reported and the fallback is used.
function normalizeLocale( id, value )
{
    const fallback = document.documentElement.lang || navigator.language || 'en';
    const text = String(value ?? '').trim();
    if ( !text ) { return fallback; }
    try { return Intl.getCanonicalLocales(text)[0]; }
    catch { reportCalendarIssue('INVALID_OPTION',{ id, key:'locale', value:text, fallback }); return fallback; }
}
// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportCalendarIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns an integer within [min, max] (or null when allowed); warns and falls back otherwise.
function normalizeInteger( id, key, value, min, max, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number >= min && number <= max ) { return number; }
    reportCalendarIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a valid ISO value of the type (or ''), warning about invalid ones.
function normalizeValue( id, key, type, value )
{
    if ( value === undefined || value === null || value === '' ) { return ''; }
    if ( parseValue(type,value) ) { return String(value); }
    reportCalendarIssue('INVALID_OPTION',{ id, key, value, fallback:'' });
    return '';
}

// Normalizes highlight groups: { daysOfWeek:[0–6], dates:['YYYY-MM-DD' | { date, label }], label, backgroundToken }.
function normalizeHighlights( id, value )
{
    if ( value === undefined ) { return DEFAULT_CALENDAR_CONFIG.highlights.map(group => ({ ...group, dates:[], label:'' })); }
    if ( !Array.isArray(value) ) { reportCalendarIssue('INVALID_OPTION',{ id, key:'highlights', value:JSON.stringify(value), fallback:'[]' }); return []; }
    return value.filter(group => group && typeof group === 'object').map(group =>
    {
        const token = String(group.backgroundToken ?? '').trim() || '--calendar-highlight-bg';
        if ( !/^--[a-zA-Z0-9_-]+$/.test(token) ) { reportCalendarIssue('INVALID_OPTION',{ id, key:'highlights.backgroundToken', value:token, fallback:'--calendar-highlight-bg' }); }
        return {
            daysOfWeek:( Array.isArray(group.daysOfWeek) ? group.daysOfWeek : [] ).map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6),
            dates:( Array.isArray(group.dates) ? group.dates : [] ).map(entry => ( typeof entry === 'object' && entry ? { date:String(entry.date ?? ''), label:String(entry.label ?? '').trim() } : { date:String(entry), label:'' } )).filter(entry => parseValue('DATE',entry.date)),
            label:String(group.label ?? '').trim(),
            backgroundToken:/^--[a-zA-Z0-9_-]+$/.test(token) ? token : '--calendar-highlight-bg'
        };
    });
}

// Merges one level of consumer texts with defaults; empty texts fall back to defaults.
function mergeTexts( defaults, source )
{
    const input = source && typeof source === 'object' ? source : {};
    return Object.fromEntries(Object.entries(defaults).map(( [ key, fallback ] ) => [ key, String(input[key] ?? '').trim() || fallback ]));
}

// Returns the reference time (Date) for relative texts and quick ranges; null means "now" at use time.
function normalizeReference( id, value )
{
    if ( value === undefined || value === null || value === '' ) { return null; }
    const date = value instanceof Date ? value : new Date(String(value));
    if ( !Number.isNaN(date.getTime()) ) { return date; }
    reportCalendarIssue('INVALID_OPTION',{ id, key:'referenceTime', value, fallback:'now' });
    return null;
}

// Produces the normalized, immutable configuration consumed by Calendar.
function mergeCalendarConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const type = normalizeEnum(id,'type',userConfig.type,CALENDAR_TYPES,DEFAULT_CALENDAR_CONFIG.type);
    const presentation = normalizeEnum(id,'presentation',userConfig.presentation,CALENDAR_PRESENTATIONS,DEFAULT_CALENDAR_CONFIG.presentation);
    let range = Boolean(userConfig.range ?? DEFAULT_CALENDAR_CONFIG.range);
    if ( range && type !== 'DATE' && type !== 'DATETIME' ) { reportCalendarIssue('OPTION_IGNORED',{ id, key:'range', condition:`type="${type}" (ranges exist for DATE and DATETIME)` }); range = false; }
    const { errors, ...plain } = DEFAULT_CALENDAR_CONFIG.texts;
    const texts = { ...mergeTexts(plain,userConfig.texts), errors:mergeTexts(errors,userConfig.texts?.errors) };
    const initial = userConfig.value && typeof userConfig.value === 'object' ? userConfig.value : { from:'', to:'' };
    const config =
    {
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? '').trim(),
        help:String(userConfig.help ?? ''),
        type,
        presentation,
        range,
        state:normalizeEnum(id,'state',userConfig.state,CALENDAR_STATES,DEFAULT_CALENDAR_CONFIG.state),
        width:normalizeEnum(id,'width',userConfig.width,CALENDAR_WIDTHS,DEFAULT_CALENDAR_CONFIG.width),
        value:range ? { from:normalizeValue(id,'value.from',type,initial.from), to:normalizeValue(id,'value.to',type,initial.to) } : normalizeValue(id,'value',type,typeof userConfig.value === 'object' ? '' : userConfig.value),
        minValue:normalizeValue(id,'minValue',type,userConfig.minValue),
        maxValue:normalizeValue(id,'maxValue',type,userConfig.maxValue),
        minRangeDays:normalizeInteger(id,'minRangeDays',userConfig.minRangeDays,1,36600,null),
        maxRangeDays:normalizeInteger(id,'maxRangeDays',userConfig.maxRangeDays,1,36600,null),
        timeStep:normalizeInteger(id,'timeStep',userConfig.timeStep,1,60,DEFAULT_CALENDAR_CONFIG.timeStep),
        showToday:Boolean(userConfig.showToday ?? DEFAULT_CALENDAR_CONFIG.showToday),
        showClear:Boolean(userConfig.showClear ?? DEFAULT_CALENDAR_CONFIG.showClear),
        quickRanges:( Array.isArray(userConfig.quickRanges) ? userConfig.quickRanges : [] ).map(key => String(key).trim().toUpperCase()).filter(key => QUICK_RANGES.includes(key) || ( reportCalendarIssue('UNKNOWN_QUICK_RANGE',{ id, value:key }), false )),
        firstDayOfWeek:normalizeInteger(id,'firstDayOfWeek',userConfig.firstDayOfWeek,0,1,DEFAULT_CALENDAR_CONFIG.firstDayOfWeek),
        showWeekNumbers:Boolean(userConfig.showWeekNumbers ?? DEFAULT_CALENDAR_CONFIG.showWeekNumbers) || type === 'WEEK',
        disabledDaysOfWeek:( Array.isArray(userConfig.disabledDaysOfWeek) ? userConfig.disabledDaysOfWeek : [] ).map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6),
        disabledDates:( Array.isArray(userConfig.disabledDates) ? userConfig.disabledDates : [] ).map(String).filter(value => parseValue('DATE',value)),
        highlights:normalizeHighlights(id,userConfig.highlights),
        dateFormat:normalizeEnum(id,'dateFormat',userConfig.dateFormat,CALENDAR_DATE_FORMATS,DEFAULT_CALENDAR_CONFIG.dateFormat),
        displayFormat:normalizeEnum(id,'displayFormat',userConfig.displayFormat,CALENDAR_DISPLAY_FORMATS,DEFAULT_CALENDAR_CONFIG.displayFormat),
        displayMode:normalizeEnum(id,'displayMode',userConfig.displayMode,CALENDAR_DISPLAY_MODES,DEFAULT_CALENDAR_CONFIG.displayMode),
        referenceTime:normalizeReference(id,userConfig.referenceTime),
        locale:normalizeLocale(id,userConfig.locale),
        mandatory:Boolean(userConfig.mandatory ?? DEFAULT_CALENDAR_CONFIG.mandatory),
        mandatoryIndicator:normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,CALENDAR_MANDATORY_INDICATORS,DEFAULT_CALENDAR_CONFIG.mandatoryIndicator),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,CALENDAR_LABEL_POSITIONS,DEFAULT_CALENDAR_CONFIG.labelPosition),
        autoFocus:Boolean(userConfig.autoFocus ?? DEFAULT_CALENDAR_CONFIG.autoFocus),
        texts
    };
    if ( !range ) { [ 'minRangeDays', 'maxRangeDays', 'quickRanges' ].filter(key => userConfig[key] !== undefined).forEach(key => reportCalendarIssue('OPTION_IGNORED',{ id, key, condition:'range=false' })); config.quickRanges = []; }
    if ( type === 'WEEK' && config.firstDayOfWeek !== 1 ) { reportCalendarIssue('OPTION_IGNORED',{ id, key:'firstDayOfWeek', condition:'type="WEEK" (ISO weeks start on Monday)' }); config.firstDayOfWeek = 1; }
    if ( type !== 'TIME' && type !== 'DATETIME' && userConfig.timeStep !== undefined ) { reportCalendarIssue('OPTION_IGNORED',{ id, key:'timeStep', condition:`type="${type}"` }); }
    if ( presentation === 'NATIVE' )
    {
        const native = { firstDayOfWeek:userConfig.firstDayOfWeek !== undefined, showWeekNumbers:Boolean(userConfig.showWeekNumbers), disabledDaysOfWeek:config.disabledDaysOfWeek.length > 0, disabledDates:config.disabledDates.length > 0, highlights:userConfig.highlights !== undefined, 'dateFormat (while editing; the read-only view still uses it)':userConfig.dateFormat !== undefined };
        Object.entries(native).filter(( [ , used ] ) => used).forEach(( [ key ] ) => reportCalendarIssue('NOT_SUPPORTED_NATIVE',{ id, key }));
        config.disabledDaysOfWeek = []; config.disabledDates = []; config.highlights = [];
    }
    config.displayMin = config.minValue ? formatExact(type,config.minValue,config.displayFormat,config.locale,texts,config.dateFormat) : '';
    config.displayMax = config.maxValue ? formatExact(type,config.maxValue,config.displayFormat,config.locale,texts,config.dateFormat) : '';
    return Object.freeze(config);
}

// Returns whether the browser has a native picker for the type.
export function nativeTypeSupported( type )
{
    const input = document.createElement('input');
    const nativeType = { DATE:'date', TIME:'time', DATETIME:'datetime-local', MONTH:'month', WEEK:'week' }[type];
    input.setAttribute('type',nativeType);
    return input.type === nativeType;
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const CALENDAR_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeCalendarConfig( userConfig = {} )
{
    const base = mergeCalendarConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,CALENDAR_TOOLTIP_MODES,DEFAULT_CALENDAR_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_CALENDAR_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateCalendarConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportCalendarIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportCalendarIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportCalendarIssue('DUPLICATE_ID',{ id }); }
    if ( !config.label ) { return reportCalendarIssue('LABEL_REQUIRED',{ id }); }
    if ( config.presentation === 'NATIVE' && config.state !== 'VIEW' && config.state !== 'INVISIBLE' && !nativeTypeSupported(config.type) ) { return reportCalendarIssue('NATIVE_TYPE_UNSUPPORTED',{ id, value:config.type }); }
    return null;
}
