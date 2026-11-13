// calendar.js
//
// CUSTOMIZATION ADJUSTMENTS (Calendar).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/calendar.html (no help text).
// Variants panel, in this order: presentation, type, range, displayFormat, dateFormat, locale, minValue, maxValue,
// minRangeDays, maxRangeDays, showWeekNumbers, showToday, showClear, state, width, labelPosition (TOP / LEFT / INHERIT).
// locale is a Select of languages whose names look different in the calendar (month title, weekdays, view text);
// each option shows how the 3rd of March is written. Every other option keeps its start value.
// state VIEW without a value: prepare() adds a sample value that fits the other settings (type, range, minValue /
// maxValue, minRangeDays / maxRangeDays), so the view shows how the value is written (displayFormat, dateFormat, locale).

// Sample values per type (the 3rd of March 2026, 14:30); a range lasts 8 days unless the range limits say otherwise.
const SAMPLE = { DATE:'2026-03-03', DATETIME:'2026-03-03T14:30', TIME:'14:30', MONTH:'2026-03', WEEK:'2026-W10' };
const RANGE_DAYS = 8;

// Returns the value moved inside minValue / maxValue (ISO values of one type compare as text).
function within( value, min, max )
{
    if ( min && value < min ) { return min; }
    if ( max && value > max ) { return max; }
    return value;
}

// Adds days to an ISO date or date-time (keeps the time part).
function addDays( value, days )
{
    const [ date, time ] = value.split('T');
    const day = new Date(`${date}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + days);
    return day.toISOString().slice(0,10) + ( time ? `T${time}` : '' );
}

// Returns a sample value for the current settings: a single value, or { from, to } for a range.
function sampleValue( config )
{
    const type = config.type ?? 'DATE';
    const single = within(SAMPLE[type] ?? SAMPLE.DATE,config.minValue,config.maxValue);
    if ( !config.range || ( type !== 'DATE' && type !== 'DATETIME' ) ) { return single; }
    const days = Math.min(Math.max(RANGE_DAYS,Number(config.minRangeDays) || 1),Number(config.maxRangeDays) || Infinity);
    let from = single, to = within(addDays(from,days - 1),config.minValue,config.maxValue);
    if ( to === config.maxValue && addDays(from,days - 1) > to ) { from = within(addDays(to,1 - days),config.minValue,config.maxValue); }
    return { from, to };
}

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'presentation', 'type', 'range', 'displayFormat', 'dateFormat', 'locale', 'minValue', 'maxValue', 'minRangeDays', 'maxRangeDays',
           'showWeekNumbers', 'showToday', 'showClear', 'state', 'width', 'labelPosition', 'tooltipMode' ],
    choices:{ locale:[ 'en-GB', 'de', 'fr', 'ro', 'hu', 'fi', 'el' ] },
    // labelPosition START is shown as LEFT; each language shows its short date (SHORT) and its long month name.
    valueLabels:
    {
        labelPosition:{ START:'LEFT' },
        locale:
        {
            'en-GB':'en-GB — 3 Mar 26, March, Mon',
            de:'de — 3 Mär 26, März, Mo',
            fr:'fr — 3 mars 26, mars, lun.',
            ro:'ro — 3 mar. 26, martie, lun.',
            hu:'hu — 3 márc. 26, március, H',
            fi:'fi — 3 maalis 26, maaliskuu, ma',
            el:'el — 3 Μαρ 26, Μάρτιος, Δευ'
        }
    },
    // Room for the open menu or popup inside the live example.
    stage:{ minHeight:'--size-lg-1' },
    start:
    {
        label:'Due date',
        showToday:true,
        showClear:true,
        highlights:
        [
            { daysOfWeek:[ 6, 0 ], backgroundToken:'--calendar-weekend-bg' },
            { dates:[ { date:'2026-12-25', label:'Christmas' }, { date:'2026-12-26', label:'Boxing Day' }, { date:'2026-12-01', label:'National Day' } ] }
        ]
    },
    // VIEW shows a value: when none is set, a sample that fits the other settings (in place, so the Output shows it).
    prepare:( { config, callbacks } ) =>
    {
        const empty = config.value === undefined || config.value === '' || ( typeof config.value === 'object' && !config.value?.from && !config.value?.to );
        if ( config.state === 'VIEW' && empty ) { config.value = sampleValue(config); }
        return [ config, ...callbacks ];
    }
};
