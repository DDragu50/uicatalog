// calendarSegments.js
//
// PURE HELPERS.
// Segmented, Chrome-like editing: which parts (day, month, year, hour, minute, AM/PM, week) a type has in a
// date format, how typed digits and arrow keys change a part, and conversion between parts and ISO values.

import { parseValue, formatValue, makeDate, isoWeek } from './calendarDates.js';

const SPEC =
{
    day:{ min:1, max:31, digits:2 }, month:{ min:1, max:12, digits:2 }, year:{ min:1, max:9999, digits:4 },
    hour:{ min:0, max:23, digits:2 }, hour12:{ min:1, max:12, digits:2 }, minute:{ min:0, max:59, digits:2 }, period:{ min:0, max:1, digits:0 }, week:{ min:1, max:53, digits:2 }
};

// Returns the date parts in display order with their separators, e.g. EU: day . month . year.
function dateParts( dateFormat )
{
    if ( dateFormat === 'US' ) { return [ 'month', '/', 'day', '/', 'year' ]; }
    if ( dateFormat === 'ISO' ) { return [ 'year', '-', 'month', '-', 'day' ]; }
    return [ 'day', '.', 'month', '.', 'year' ];
}

// Returns the time parts (24h, or 12h with AM/PM for US).
function timeParts( dateFormat ) { return dateFormat === 'US' ? [ 'hour12', ':', 'minute', ' ', 'period' ] : [ 'hour', ':', 'minute' ]; }

// Returns the ordered layout (part keys and separator strings) for a type and date format.
export function segmentLayout( type, dateFormat, texts )
{
    if ( type === 'DATE' ) { return dateParts(dateFormat); }
    if ( type === 'TIME' ) { return timeParts(dateFormat); }
    if ( type === 'DATETIME' ) { return [ ...dateParts(dateFormat), ' ', ...timeParts(dateFormat) ]; }
    if ( type === 'MONTH' ) { return dateFormat === 'US' ? [ 'month', '/', 'year' ] : dateFormat === 'ISO' ? [ 'year', '-', 'month' ] : [ 'month', '.', 'year' ]; }
    return dateFormat === 'ISO' ? [ 'year', '-W', 'week' ] : [ `${texts.week} `, 'week', ', ', 'year' ];
}

// Returns whether a layout item is a part key (not a separator).
export function isPart( item ) { return Object.prototype.hasOwnProperty.call(SPEC,item); }

// Returns the limits of a part.
export function partSpec( key ) { return SPEC[key]; }

// Returns the text shown for a part: the padded number, AM/PM, or the placeholder while empty.
export function partText( key, value, placeholders )
{
    if ( value === null || value === undefined ) { return placeholders[key]; }
    if ( key === 'period' ) { return value === 0 ? 'AM' : 'PM'; }
    return String(value).padStart(SPEC[key].digits,'0');
}

// Applies a typed digit to a part: returns { value, buffer, advance } (Chrome-like auto-advance).
export function typeDigit( key, buffer, digit )
{
    const spec = SPEC[key];
    let next = `${buffer}${digit}`;
    if ( Number(next) > spec.max ) { next = digit; }
    const value = Number(next);
    const complete = next.length >= spec.digits || value * 10 > spec.max;
    const clamped = complete && value < spec.min ? spec.min : value;
    return { value:next === '0' && spec.min > 0 && !complete ? null : clamped, buffer:complete ? '' : next, advance:complete, pending:!complete ? value : null };
}

// Returns the value after an arrow step (wrapping), starting from a default when empty.
export function stepPart( key, value, step, fallback )
{
    const spec = SPEC[key];
    if ( value === null || value === undefined ) { return fallback; }
    const range = spec.max - spec.min + 1;
    return ( ( value - spec.min + step ) % range + range ) % range + spec.min;
}

// Returns the "today/now" value of each part (arrow start values).
export function defaultParts( reference )
{
    const { week, year } = isoWeek(reference);
    return { day:reference.getDate(), month:reference.getMonth() + 1, year:reference.getFullYear(), hour:reference.getHours(), hour12:reference.getHours() % 12 || 12, minute:reference.getMinutes(), period:reference.getHours() < 12 ? 0 : 1, week, weekYear:year };
}

// Converts parts into { value, complete, empty }; value is the ISO value, '' when empty or invalid.
export function partsToValue( type, layout, parts )
{
    const keys = layout.filter(isPart);
    const filled = keys.filter(key => parts[key] !== null && parts[key] !== undefined);
    if ( filled.length === 0 ) { return { value:'', complete:false, empty:true }; }
    if ( filled.length < keys.length ) { return { value:'', complete:false, empty:false }; }
    const hour = keys.includes('hour12') ? ( parts.hour12 % 12 ) + ( parts.period === 1 ? 12 : 0 ) : parts.hour;
    const pad = ( number, size = 2 ) => String(number).padStart(size,'0');
    const iso =
    {
        DATE:() => `${pad(parts.year,4)}-${pad(parts.month)}-${pad(parts.day)}`,
        TIME:() => `${pad(hour)}:${pad(parts.minute)}`,
        DATETIME:() => `${pad(parts.year,4)}-${pad(parts.month)}-${pad(parts.day)}T${pad(hour)}:${pad(parts.minute)}`,
        MONTH:() => `${pad(parts.year,4)}-${pad(parts.month)}`,
        WEEK:() => `${pad(parts.year,4)}-W${pad(parts.week)}`
    }[type]();
    return parseValue(type,iso) ? { value:iso, complete:true, empty:false } : { value:'', complete:false, empty:false };
}

// Converts an ISO value into parts for a layout (all null when empty).
export function valueToParts( type, layout, value )
{
    const parts = Object.fromEntries(layout.filter(isPart).map(key => [ key, null ]));
    const date = parseValue(type,value);
    if ( !date ) { return parts; }
    if ( type === 'WEEK' ) { const { year, week } = isoWeek(date); return { ...parts, year, week }; }
    const all = { day:date.getDate(), month:date.getMonth() + 1, year:date.getFullYear(), hour:date.getHours(), hour12:date.getHours() % 12 || 12, minute:date.getMinutes(), period:date.getHours() < 12 ? 0 : 1 };
    Object.keys(parts).forEach(key => { parts[key] = all[key]; });
    return parts;
}

// Parses pasted text in the configured format (or ISO) into an ISO value, or '' when it cannot be read.
export function parsePasted( type, dateFormat, text )
{
    const trimmed = String(text ?? '').trim();
    if ( parseValue(type,trimmed) ) { return trimmed; }
    const numbers = trimmed.match(/\d+/g)?.map(Number) ?? [];
    const pm = /pm/i.test(trimmed), am = /am/i.test(trimmed);
    const hour = h => ( pm && h < 12 ? h + 12 : am && h === 12 ? 0 : h );
    const date = ( a, b, c ) => ( dateFormat === 'US' ? { month:a, day:b, year:c } : dateFormat === 'ISO' ? { year:a, month:b, day:c } : { day:a, month:b, year:c } );
    const pad = ( number, size = 2 ) => String(number).padStart(size,'0');
    let iso = '';
    if ( type === 'DATE' && numbers.length >= 3 ) { const d = date(...numbers); iso = `${pad(d.year,4)}-${pad(d.month)}-${pad(d.day)}`; }
    if ( type === 'DATETIME' && numbers.length >= 5 ) { const d = date(...numbers); iso = `${pad(d.year,4)}-${pad(d.month)}-${pad(d.day)}T${pad(hour(numbers[3]))}:${pad(numbers[4])}`; }
    if ( type === 'TIME' && numbers.length >= 2 ) { iso = `${pad(hour(numbers[0]))}:${pad(numbers[1])}`; }
    if ( type === 'MONTH' && numbers.length >= 2 ) { iso = dateFormat === 'ISO' ? `${pad(numbers[0],4)}-${pad(numbers[1])}` : `${pad(numbers[1],4)}-${pad(numbers[0])}`; }
    if ( type === 'WEEK' && numbers.length >= 2 ) { const [ week, year ] = numbers[0] > 53 ? [ numbers[1], numbers[0] ] : numbers; iso = `${pad(year,4)}-W${pad(week)}`; }
    return parseValue(type,iso) ? iso : '';
}

export { formatValue, makeDate };
