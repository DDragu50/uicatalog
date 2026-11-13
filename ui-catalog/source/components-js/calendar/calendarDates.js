// calendarDates.js
//
// PURE HELPERS.
// Local-time date arithmetic, ISO value parsing/formatting per type, ISO weeks, display formatting
// (SHORT/LONG and relative) and rolling quick ranges. No DOM access, no state.

// Pads a number to two digits.
const pad = value => String(value).padStart(2,'0');

// Returns a local Date from year, month (1–12), day, hour and minute.
export function makeDate( year, month, day, hour = 0, minute = 0 ) { return new Date(year,month - 1,day,hour,minute); }

// Returns 'YYYY-MM-DD' for a local Date.
export function toISODate( date ) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }

// Returns 'HH:MM' for a local Date.
export function toISOTime( date ) { return `${pad(date.getHours())}:${pad(date.getMinutes())}`; }

// Adds days to a date (local, DST-safe).
export function addDays( date, days ) { return makeDate(date.getFullYear(),date.getMonth() + 1,date.getDate() + days,date.getHours(),date.getMinutes()); }

// Adds months to a date, clamping the day to the target month's length.
export function addMonths( date, months )
{
    const target = makeDate(date.getFullYear(),date.getMonth() + 1 + months,1,date.getHours(),date.getMinutes());
    const last = makeDate(target.getFullYear(),target.getMonth() + 2,0).getDate();
    target.setDate(Math.min(date.getDate(),last));
    return target;
}

// Returns the ISO week { year, week } of a date (weeks start on Monday; week 1 contains 4 January).
export function isoWeek( date )
{
    const day = ( date.getDay() + 6 ) % 7;
    const thursday = makeDate(date.getFullYear(),date.getMonth() + 1,date.getDate() - day + 3);
    const firstThursday = makeDate(thursday.getFullYear(),1,4);
    const week = 1 + Math.round(( ( thursday - firstThursday ) / 86400000 - 3 + ( firstThursday.getDay() + 6 ) % 7 ) / 7);
    return { year:thursday.getFullYear(), week };
}

// Returns the Monday of an ISO week.
export function isoWeekStart( year, week )
{
    const january4 = makeDate(year,1,4);
    return addDays(january4,-( ( january4.getDay() + 6 ) % 7 ) + ( week - 1 ) * 7);
}

// Returns 'YYYY-Www' for a date.
export function toISOWeek( date ) { const { year, week } = isoWeek(date); return `${year}-W${pad(week)}`; }

const PATTERNS = { DATE:/^(\d{4})-(\d{2})-(\d{2})$/, TIME:/^(\d{2}):(\d{2})$/, DATETIME:/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/, MONTH:/^(\d{4})-(\d{2})$/, WEEK:/^(\d{4})-W(\d{2})$/ };

// Parses an ISO value of a type into a local Date (TIME uses 1 Jan 2000), or null when invalid.
export function parseValue( type, value )
{
    const match = PATTERNS[type]?.exec(String(value ?? ''));
    if ( !match ) { return null; }
    const n = match.slice(1).map(Number);
    let date = null;
    if ( type === 'DATE' ) { date = makeDate(n[0],n[1],n[2]); if ( date.getMonth() + 1 !== n[1] || date.getDate() !== n[2] ) { return null; } }
    if ( type === 'DATETIME' ) { date = makeDate(n[0],n[1],n[2],n[3],n[4]); if ( date.getMonth() + 1 !== n[1] || date.getDate() !== n[2] || n[3] > 23 || n[4] > 59 ) { return null; } }
    if ( type === 'TIME' ) { if ( n[0] > 23 || n[1] > 59 ) { return null; } date = makeDate(2000,1,1,n[0],n[1]); }
    if ( type === 'MONTH' ) { if ( n[1] < 1 || n[1] > 12 ) { return null; } date = makeDate(n[0],n[1],1); }
    if ( type === 'WEEK' ) { if ( n[1] < 1 || n[1] > 53 || isoWeek(isoWeekStart(n[0],n[1])).week !== n[1] ) { return null; } date = isoWeekStart(n[0],n[1]); }
    return date;
}

// Formats a local Date as the ISO value of a type.
export function formatValue( type, date )
{
    if ( type === 'DATE' ) { return toISODate(date); }
    if ( type === 'TIME' ) { return toISOTime(date); }
    if ( type === 'DATETIME' ) { return `${toISODate(date)}T${toISOTime(date)}`; }
    if ( type === 'MONTH' ) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`; }
    return toISOWeek(date);
}

// Returns localized month names ("short" or "long") for a locale.
function monthName( date, style, locale ) { return new Intl.DateTimeFormat(locale,{ month:style }).format(date); }

// Formats a time as "14:30" (EU/ISO) or "2:30 PM" (US).
export function formatTime( date, dateFormat )
{
    if ( dateFormat !== 'US' ) { return toISOTime(date); }
    const hour = date.getHours() % 12 || 12;
    return `${hour}:${pad(date.getMinutes())} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
}

// Formats a date part: SHORT "12 Aug 26" / "Aug 12, 26", LONG "12 August 2026" / "August 12, 2026", ISO "2026-08-12".
function formatDay( date, displayFormat, dateFormat, locale )
{
    if ( dateFormat === 'ISO' ) { return toISODate(date); }
    const long = displayFormat === 'LONG';
    const month = monthName(date,long ? 'long' : 'short',locale), year = long ? String(date.getFullYear()) : pad(date.getFullYear() % 100);
    return dateFormat === 'US' ? `${month} ${date.getDate()}, ${year}` : `${date.getDate()} ${month} ${year}`;
}

// Returns the exact display text of a value per type, display format (SHORT/LONG) and date format (EU/US/ISO).
export function formatExact( type, value, displayFormat, locale, texts, dateFormat = 'EU' )
{
    const date = parseValue(type,value);
    if ( !date ) { return ''; }
    const long = displayFormat === 'LONG';
    if ( type === 'TIME' ) { return formatTime(date,dateFormat); }
    if ( type === 'DATETIME' ) { return `${formatDay(date,displayFormat,dateFormat,locale)}, ${formatTime(date,dateFormat)}`; }
    if ( type === 'MONTH' ) { return dateFormat === 'ISO' ? formatValue('MONTH',date) : `${monthName(date,long ? 'long' : 'short',locale)} ${long ? date.getFullYear() : pad(date.getFullYear() % 100)}`; }
    if ( type === 'WEEK' ) { if ( dateFormat === 'ISO' ) { return formatValue('WEEK',date); } const { year, week } = isoWeek(date); return ( long ? texts.weekLong : texts.weekShort ).replace('{week}',String(week)).replace('{year}',long ? String(year) : pad(year % 100)); }
    return formatDay(date,displayFormat,dateFormat,locale);
}

// Returns the relative text of a value against a reference ("3 hours ago", "yesterday", "in 2 weeks").
export function formatRelative( type, value, reference, locale )
{
    const date = parseValue(type,value);
    if ( !date ) { return ''; }
    const format = new Intl.RelativeTimeFormat(locale,{ numeric:'auto' });
    if ( type === 'TIME' || type === 'DATETIME' )
    {
        const target = type === 'TIME' ? makeDate(reference.getFullYear(),reference.getMonth() + 1,reference.getDate(),date.getHours(),date.getMinutes()) : date;
        const minutes = Math.round(( target - reference ) / 60000);
        if ( Math.abs(minutes) < 60 ) { return format.format(minutes,'minute'); }
        if ( Math.abs(minutes) < 1440 ) { return format.format(Math.round(minutes / 60),'hour'); }
        if ( type === 'TIME' ) { return format.format(Math.round(minutes / 60),'hour'); }
    }
    const today = makeDate(reference.getFullYear(),reference.getMonth() + 1,reference.getDate());
    const start = makeDate(date.getFullYear(),date.getMonth() + 1,date.getDate());
    const days = Math.round(( start - today ) / 86400000);
    if ( type === 'MONTH' ) { return format.format(( date.getFullYear() - reference.getFullYear() ) * 12 + date.getMonth() - reference.getMonth(),'month'); }
    if ( type === 'WEEK' ) { return format.format(Math.round(( start - addDays(today,-( ( today.getDay() + 6 ) % 7 )) ) / 604800000),'week'); }
    if ( Math.abs(days) < 7 ) { return format.format(days,'day'); }
    if ( Math.abs(days) < 30 ) { return format.format(Math.round(days / 7),'week'); }
    if ( Math.abs(days) < 365 ) { return format.format(Math.round(days / 30.44),'month'); }
    return format.format(Math.round(days / 365.25),'year');
}

export const QUICK_RANGES = [ 'LAST_7_DAYS', 'NEXT_7_DAYS', 'LAST_1_MONTH', 'NEXT_1_MONTH', 'LAST_3_MONTHS', 'NEXT_3_MONTHS', 'LAST_6_MONTHS', 'NEXT_6_MONTHS', 'LAST_1_YEAR', 'NEXT_1_YEAR' ];

// Returns the rolling range { from, to } (dates, reference day included) for a quick-range key.
export function quickRange( key, reference )
{
    const today = makeDate(reference.getFullYear(),reference.getMonth() + 1,reference.getDate());
    const [ direction, amount, unit ] = key.split('_');
    const n = Number(amount), last = direction === 'LAST';
    if ( unit === 'DAYS' ) { return last ? { from:addDays(today,-( n - 1 )), to:today } : { from:today, to:addDays(today,n - 1) }; }
    const months = unit === 'YEAR' ? 12 * n : n;
    return last ? { from:addDays(addMonths(today,-months),1), to:today } : { from:today, to:addDays(addMonths(today,months),-1) };
}

// Formats a Calendar value for display anywhere (e.g. table cells), with options per call:
// { type, displayFormat, dateFormat, displayMode, referenceTime, locale, texts }. Ranges are { from, to }.
// Returns plain text ('' for empty or invalid values).
export function formatCalendarValue( value, options = {} )
{
    const type = String(options.type ?? 'DATE').toUpperCase();
    const displayFormat = String(options.displayFormat ?? 'SHORT').toUpperCase();
    const dateFormat = String(options.dateFormat ?? 'EU').toUpperCase();
    const displayMode = String(options.displayMode ?? 'EXACT').toUpperCase();
    const locale = options.locale || document.documentElement.lang || navigator.language || 'en';
    const reference = options.referenceTime ? new Date(options.referenceTime) : new Date();
    const texts = { weekShort:'W{week} {year}', weekLong:'Week {week}, {year}', ...( options.texts ?? {} ) };
    const one = entry =>
    {
        if ( !entry ) { return ''; }
        const exact = formatExact(type,entry,displayFormat,locale,texts,dateFormat);
        if ( !exact ) { return ''; }
        const relative = formatRelative(type,entry,reference,locale);
        return displayMode === 'RELATIVE' ? relative : displayMode === 'BOTH' ? `${exact} (${relative})` : exact;
    };
    if ( value && typeof value === 'object' ) { return value.from || value.to ? `${one(value.from)} – ${one(value.to)}` : ''; }
    return one(value);
}
