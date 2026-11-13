// calendar.test.mjs
//
// The "auto" cases of source/components-js/calendar/calendarTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onValueChange and onValidation are the third and fourth render arguments ({ $callback }
// values in args). Every case fixes "today" with referenceTime (Wednesday 12 August 2026, 10:00).

const ID = 'due';
const NOW = '2026-08-12T10:00:00';
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const RECORD = { ...DEPENDS, args:[ { $callback:'onValueChange' }, { $callback:'onValidation' } ] };
const BASE = { id:ID, label:'Due date', referenceTime:NOW };
const segment = ( key, part = '' ) => `#${ID}${part ? `-${part}` : ''}-${key}`;
const segments = ( t, part = '' ) => t.page.$eval(`#${ID}${part ? `-${part}` : ''} .ui-calendar-segments`,element => element.textContent);
const popup = `#${ID}-popup`;
const isOpen = t => t.page.$eval(popup,element => element.matches(':popover-open'));
const open = async ( t, part = '' ) => { await t.page.click(`#${ID}${part ? `-${part}` : ''}-calendar`); await t.wait(50); };
const day = iso => `${popup} [data-date="${iso}"]`;
const title = t => t.page.$eval(`#${ID}-dialog-title`,element => element.textContent.trim());
const error = t => t.page.$eval(`#${ID}-error`,element => ( element.hidden ? '' : element.textContent.trim() ));
const values = async t => ( await t.calls('onValueChange') ).map(call => call.args[0]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const leave = async t => { await t.page.evaluate(() => document.activeElement?.blur()); await t.wait(50); };

export const cases =
{
    'T-01':async t =>
    {
        const shown = {};
        for ( const [ key, config ] of Object.entries({ DATE:{}, US:{ dateFormat:'US' }, ISO:{ dateFormat:'ISO' }, TIME:{ type:'TIME' }, TIME_US:{ type:'TIME', dateFormat:'US' }, DATETIME:{ type:'DATETIME' }, MONTH:{ type:'MONTH' }, WEEK:{ type:'WEEK' } }) )
        {
            t.assert(await t.render({ ...BASE, ...config },DEPENDS),`rendered ${key}`);
            shown[key] = await segments(t);
            await t.call('destroy');
        }
        t.equal(shown,{ DATE:'dd.mm.yyyy', US:'mm/dd/yyyy', ISO:'yyyy-mm-dd', TIME:'hh:mm', TIME_US:'hh:mm --', DATETIME:'dd.mm.yyyy hh:mm', MONTH:'mm.yyyy', WEEK:'Week ww, yyyy' },'each kind of value in each format');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, label:'Holiday', range:true, value:{ from:'2026-08-03', to:'2026-08-14' } },DEPENDS);
        t.equal(await t.page.$$eval(`#${ID} .ui-calendar-sublabel`,labels => labels.map(label => label.textContent)),[ 'From', 'To' ],'two fields');
        t.equal([ await segments(t,'from'), await segments(t,'to') ],[ '03.08.2026', '14.08.2026' ],'each with its date');
        t.equal(await t.call('getValue'),{ from:'2026-08-03', to:'2026-08-14' },'the value');
    },
    'T-03':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(segment('day'));
        await t.page.keyboard.type('12');
        t.equal(await t.page.evaluate(() => document.activeElement.id),`${ID}-month`,'the next part when the day is full');
        await t.page.keyboard.type('082026');
        t.equal([ await segments(t), await t.call('getValue') ],[ '12.08.2026', '2026-08-12' ],'typed; getValue() already returns it');
        t.equal([ ( await t.calls('onValueChange') ).length, ( await t.calls('onValidation') ).length ],[ 0, 0 ],'nothing reported while focus stays in the field');
        await leave(t);
        t.equal(( await t.calls('onValueChange') ).map(call => call.args),[ [ '2026-08-12', `instance(${ID})` ] ],'reported once when focus leaves, with the instance');
        t.equal(( await t.calls('onValidation') ).map(call => call.args[0]),[ { valid:true, errorLabel:null } ],'onValidation: the result, when focus leaves');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, value:'2026-08-12' },RECORD);
        await t.page.focus(segment('day'));
        await t.page.keyboard.press('ArrowUp');
        t.equal(await t.call('getValue'),'2026-08-13','up: one more');
        await t.page.keyboard.press('ArrowDown');
        await t.page.keyboard.press('ArrowDown');
        t.equal(await t.call('getValue'),'2026-08-11','down: one less');
        t.equal(await values(t),[],'nothing reported while focus stays in the field');
        await leave(t);
        t.equal(await values(t),[ '2026-08-11' ],'the last value reported once when focus leaves');
    },
    'T-05':async t =>
    {
        await t.render({ ...BASE, value:'2026-08-12' },RECORD);
        await t.page.focus(segment('month'));
        await t.page.keyboard.press('Backspace');
        t.equal([ await segments(t), await t.call('getValue') ],[ '12.mm.2026', '' ],'the part is cleared');
        t.equal(await values(t),[],'nothing reported yet');
        await leave(t);
        t.equal(await values(t),[ '' ],'the incomplete value reported when focus leaves');
        t.equal(await error(t),'Enter a valid date.','INVALID_DATE when leaving it incomplete');
    },
    'T-06':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.focus(segment('day'));
        await t.page.evaluate(id => { const data = new DataTransfer(); data.setData('text/plain','24.12.2026'); document.getElementById(`${id}-day`).dispatchEvent(new ClipboardEvent('paste',{ bubbles:true, cancelable:true, clipboardData:data })); },ID);
        t.equal([ await segments(t), await values(t) ],[ '24.12.2026', [] ],'a pasted date fills all parts');
        await leave(t);
        t.equal(await values(t),[ '2026-12-24' ],'reported when focus leaves');
    },
    'T-07':async t =>
    {
        await t.render(BASE,RECORD);
        await open(t);
        t.equal([ await isOpen(t), await title(t) ],[ true, 'August 2026' ],'opens at today');
        t.equal(await t.page.$eval(`${popup} [aria-current="date"]`,element => element.dataset.date),'2026-08-12','today is marked');
        await t.page.click(day('2026-08-20'));
        t.equal([ await isOpen(t), await segments(t), await values(t) ],[ false, '20.08.2026', [ '2026-08-20' ] ],'the day closes it and fills the field');
        await t.call('setValue','2025-03-04');
        await open(t);
        t.equal([ await title(t), await t.page.evaluate(() => document.activeElement.dataset.date) ],[ 'March 2025', '2025-03-04' ],'opens at the current value');
    },
    'T-08':async t =>
    {
        await t.render(BASE,DEPENDS);
        await open(t);
        await t.page.click(`#${ID}-dialog-title`);
        t.equal([ await title(t), await t.page.$$eval(`${popup} [data-month]`,cells => cells.length) ],[ '2026', 12 ],'months');
        await t.page.click(`#${ID}-dialog-title`);
        t.equal([ await t.page.$$eval(`${popup} [data-year]`,cells => cells.length) >= 10, ( await title(t) ).includes('2020') ],[ true, true ],'years');
        await t.page.click(`#${ID}-dialog-title`);
        t.equal([ ( await title(t) ).includes('2000'), await t.page.$eval(`#${ID}-dialog-title`,element => element.disabled) ],[ true, true ],'decades, the widest');
        await t.page.click(`${popup} [data-decade="1990"]`);
        await t.page.click(`${popup} [data-year="1995"]`);
        await t.page.click(`${popup} [data-month="1995-06"]`);
        t.equal(await title(t),'June 1995','a distant month reached in three clicks');
    },
    'T-09':async t =>
    {
        const head = () => t.page.$$eval(`${popup} thead th`,cells => cells.map(cell => cell.getAttribute('abbr') || cell.textContent.trim()));
        await t.render(BASE,DEPENDS);
        await open(t);
        t.assert(/^Mon/.test(( await head(t) )[0]),'Monday first by default');
        await t.call('destroy');
        await t.render({ ...BASE, firstDayOfWeek:0, showWeekNumbers:true },DEPENDS);
        await open(t);
        const columns = await head(t);
        t.assert(/^Sun/.test(columns[1]),`Sunday first when chosen (${columns.join(',')})`);
        t.equal(await t.page.$$eval(`${popup} .ui-calendar-week-number`,cells => cells.map(cell => cell.textContent)).then(list => list.slice(0,2)),[ '31', '32' ],'week numbers');
    },
    'T-10':async t =>
    {
        const lists = async config =>
        {
            await t.render({ ...BASE, type:'DATETIME', ...config },DEPENDS);
            await open(t);
            const result = await t.page.evaluate(id => Object.fromEntries([ ...document.querySelectorAll(`#${id}-popup .ui-calendar-time-select`) ].map(select => [ select.dataset.unit, [ ...select.options ].map(option => option.textContent.trim()) ])),ID);
            await t.call('destroy');
            return result;
        };
        const eu = await lists({});
        t.equal([ eu.hour.length, eu.hour[0], eu.hour.at(-1), eu.period ],[ 24, '00', '23', undefined ],'European: 00–23');
        const us = await lists({ dateFormat:'US', timeStep:15 });
        t.equal([ us.hour.length, us.hour[0], us.hour.at(-1), us.period, us.minute ],[ 12, '1', '12', [ 'AM', 'PM' ], [ '00', '15', '30', '45' ] ],'US: 1–12 with AM/PM; the time step');
    },
    'T-11':async t =>
    {
        const background = iso => t.page.$eval(day(iso),element => getComputedStyle(element).backgroundColor);
        await t.render({ ...BASE, highlights:[ { daysOfWeek:[ 6, 0 ], backgroundToken:'--calendar-weekend-bg' }, { dates:[ { date:'2026-08-14', label:'Founders Day' } ], backgroundToken:'--c-selected' } ] },DEPENDS);
        await open(t);
        t.assert(( await background('2026-08-15') ) !== ( await background('2026-08-13') ),'Saturday shaded');
        t.assert(( await background('2026-08-14') ) !== ( await background('2026-08-13') ),'the highlighted day in its colour');
        t.equal([ await t.page.getAttribute(day('2026-08-14'),'title'), ( await t.page.getAttribute(day('2026-08-14'),'aria-label') ).includes('Founders Day') ],[ 'Founders Day', true ],'its name on hover and for screen readers');
        await t.call('destroy');
        await t.render({ ...BASE, highlights:[] },DEPENDS);
        await open(t);
        t.equal(await background('2026-08-15'),await background('2026-08-13'),'no shading when removed');
    },
    'T-12':async t =>
    {
        await t.render({ ...BASE, disabledDates:[ '2026-08-20' ], disabledDaysOfWeek:[ 0 ] },RECORD);
        await open(t);
        t.equal([ await t.page.getAttribute(day('2026-08-20'),'aria-disabled'), await t.page.getAttribute(day('2026-08-16'),'aria-disabled') ],[ 'true', 'true' ],'unavailable days');
        await t.page.click(day('2026-08-20'),{ force:true });
        t.equal([ await isOpen(t), await t.call('getValue') ],[ true, '' ],'cannot be selected');
        await t.page.keyboard.press('Escape');
        t.equal(await t.call('setValue','2026-08-20'),{ valid:false, errorLabel:'DISABLED_DATE' },'set by the App');
        t.equal(await error(t),'This date is not available.','DISABLED_DATE');
    },
    'T-13':async t =>
    {
        await t.render({ ...BASE, minValue:'2026-08-05', maxValue:'2026-08-25' },DEPENDS);
        await open(t);
        t.equal([ await t.page.getAttribute(day('2026-08-04'),'aria-disabled'), await t.page.getAttribute(day('2026-08-05'),'aria-disabled'), await t.page.getAttribute(day('2026-08-26'),'aria-disabled') ],[ 'true', null, 'true' ],'days outside the limits');
        await t.page.keyboard.press('Escape');
        t.equal(await t.call('setValue','2026-08-01'),{ valid:false, errorLabel:'MIN_VALUE' },'too early');
        t.equal(await error(t),'Enter 5 Aug 26 or later.','MIN_VALUE');
        t.equal(await t.call('setValue','2026-09-01'),{ valid:false, errorLabel:'MAX_VALUE' },'too late');
        t.equal(await error(t),'Enter 25 Aug 26 or earlier.','MAX_VALUE');
    },
    'T-14':async t =>
    {
        await t.render({ ...BASE, showToday:true, showClear:true },RECORD);
        await open(t);
        await t.page.click(`#${ID}-dialog-today`);
        t.equal(await t.call('getValue'),'2026-08-12','Today');
        await open(t);
        await t.page.click(`#${ID}-dialog-clear`);
        t.equal([ await t.call('getValue'), await values(t) ],[ '', [ '2026-08-12', '' ] ],'Clear');
        await t.call('destroy');
        await t.render({ ...BASE, type:'TIME', showToday:true },DEPENDS);
        await open(t);
        t.equal(await t.page.$eval(`#${ID}-dialog-today`,element => element.textContent.trim()),'Now','"Now" for times');
    },
    'T-15':async t =>
    {
        await t.render({ ...BASE, label:'Period', range:true, quickRanges:[ 'LAST_7_DAYS', 'NEXT_1_MONTH' ] },RECORD);
        t.equal(await t.page.$$eval(`#${ID} .ui-calendar-quick-ranges button`,buttons => buttons.map(button => button.textContent.trim())),[ 'Last 7 days', 'Next month' ],'the quick choices');
        await t.page.click(`#${ID}-quick-last_7_days`);
        t.equal([ await segments(t,'from'), await segments(t,'to') ],[ '06.08.2026', '12.08.2026' ],'the period in both fields, today included');
        t.equal(await values(t),[ { from:'2026-08-06', to:'2026-08-12' } ],'reported');
    },
    'T-16':async t =>
    {
        await t.render(BASE,DEPENDS);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED' },'missing');
        t.equal(await error(t),'Enter a date.','REQUIRED');
        await t.call('destroy');
        await t.render({ ...BASE, range:true, minRangeDays:3, maxRangeDays:10 },DEPENDS);
        const check = async value => [ ( await t.call('setValue',value) ).errorLabel, await error(t) ];
        t.equal(await check({ from:'2026-08-10', to:'' }),[ 'RANGE_INCOMPLETE', 'Enter both dates.' ],'incomplete');
        t.equal(await check({ from:'2026-08-10', to:'2026-08-01' }),[ 'RANGE_ORDER', 'The end must not be before the start.' ],'wrong order');
        t.equal(await check({ from:'2026-08-10', to:'2026-08-11' }),[ 'RANGE_TOO_SHORT', 'Choose at least 3 days.' ],'too short');
        t.equal(await check({ from:'2026-08-01', to:'2026-08-20' }),[ 'RANGE_TOO_LONG', 'Choose at most 10 days.' ],'too long');
        t.equal(await check({ from:'2026-08-01', to:'2026-08-05' }),[ null, '' ],'a valid period');
    },
    'T-17':async t =>
    {
        await t.render({ ...BASE, value:'2026-08-12' },DEPENDS);
        t.equal(await t.call('setError','This day is fully booked.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await error(t),'This day is fully booked.','shown');
        await t.page.focus(segment('day'));
        await t.page.keyboard.press('ArrowUp');
        t.equal(await error(t),'','removed by the user\'s change');
    },
    'T-18':async t =>
    {
        const view = async config => { await t.render({ ...BASE, state:'VIEW', value:'2026-08-12', ...config },DEPENDS); const value = await t.page.$eval(`#host .ui-calendar-view-value`,element => element.textContent.trim()); await t.call('destroy'); return value; };
        t.equal([ await view({}), await view({ displayFormat:'LONG' }), await view({ dateFormat:'US' }), await view({ value:'' }) ],[ '12 Aug 26', '12 August 2026', 'Aug 12, 26', '—' ],'short, long, US order, empty');
    },
    'T-19':async t =>
    {
        const view = async config => { await t.render({ ...BASE, state:'VIEW', value:'2026-08-26', ...config },DEPENDS); return t.page.$eval(`#host .ui-calendar-view-value`,element => ( { text:( () => { const copy = element.cloneNode(true); copy.querySelectorAll('.ui-calendar-visually-hidden').forEach(hidden => hidden.remove()); return copy.textContent.trim(); } )(), title:element.querySelector('time')?.getAttribute('title') ?? null, tip:element.querySelector('time')?.getAttribute('data-tooltip') ?? null } )); };
        t.equal(await view({ displayMode:'RELATIVE' }),{ text:'in 2 weeks', title:'26 Aug 26', tip:null },'relative text, the exact date as the browser\'s tooltip');
        await t.call('destroy');
        t.equal(( await view({ displayMode:'BOTH' }) ).text,'26 Aug 26 (in 2 weeks)','both');
        await t.call('destroy');
        t.equal(( await view({ displayMode:'RELATIVE', referenceTime:'2026-09-09T10:00:00' }) ).text,'2 weeks ago','from the given moment');
        await t.call('destroy');
        t.equal(await view({ displayMode:'RELATIVE', tooltipMode:'NONE' }),{ text:'in 2 weeks', title:null, tip:null },'NONE');
        await t.call('destroy');
        t.equal(( await view({ displayMode:'RELATIVE', tooltipMode:'TOOLTIP' }) ).tip,'26 Aug 26','TOOLTIP');
        await t.page.hover('#host time');
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.includes('26 Aug 26'),`a Tooltip with the exact date (${JSON.stringify(shown)})`);
    },
    'T-20':async t =>
    {
        const texts = await t.page.evaluate(async () =>
        {
            const { formatCalendarValue } = await import('/source/components-js/calendar/calendarIndex.js');
            return [
                formatCalendarValue('2026-08-12'),
                formatCalendarValue('2026-08-12',{ displayFormat:'LONG' }),
                formatCalendarValue('2026-08-12T14:30',{ type:'DATETIME', dateFormat:'US' }),
                formatCalendarValue({ from:'2026-03-01', to:'2026-03-15' }),
                formatCalendarValue('2026-W33',{ type:'WEEK' }),
                formatCalendarValue('2026-08-09',{ displayMode:'RELATIVE', referenceTime:'2026-08-12T10:00:00' }),
                formatCalendarValue('2026-03-03',{ locale:'ro' }),
                formatCalendarValue('nonsense')
            ];
        });
        t.equal(texts,[ '12 Aug 26', '12 August 2026', 'Aug 12, 26, 2:30 PM', '1 Mar 26 – 15 Mar 26', 'W33 26', '3 days ago', '3 mar. 26', '' ],'each place with its own format');
    },
    'T-21':async t =>
    {
        t.assert(await t.render({ ...BASE, presentation:'NATIVE', value:'2026-08-12', showWeekNumbers:true, disabledDates:[ '2026-08-20' ] },RECORD),'rendered');
        t.equal(await t.page.$eval(`#${ID}`,element => [ element.tagName, element.type, element.value ]),[ 'INPUT', 'date', '2026-08-12' ],'the browser\'s own date field');
        t.equal([ await t.page.$(`#host .ui-calendar-segment`), await t.page.$(popup) ],[ null, null ],'without the custom field and calendar');
        t.equal(( await warnings(t,'NOT_SUPPORTED_NATIVE') ).length,2,'custom-only features not applied');
        await t.page.fill(`#${ID}`,'2026-09-01');
        t.equal(await values(t),[],'not reported while focus stays in the field');
        await leave(t);
        t.equal(await values(t),[ '2026-09-01' ],'the value reported when focus leaves');
        await t.call('destroy');
        t.assert(await t.render({ ...BASE, presentation:'NATIVE', type:'MONTH' },DEPENDS),'month in Chromium');
        t.equal(await t.page.$eval(`#${ID}`,element => element.type),'month','the browser\'s month field');
    },
    'T-22':async t =>
    {
        await t.page.evaluate(() => { const original = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'type'); Object.defineProperty(HTMLInputElement.prototype,'type',{ configurable:true, get() { const value = original.get.call(this); return value === 'week' ? 'text' : value; }, set( value ) { original.set.call(this,value); } }); });
        t.equal(await t.render({ ...BASE, presentation:'NATIVE', type:'WEEK' },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[NATIVE_TYPE_UNSUPPORTED]')),'NATIVE_TYPE_UNSUPPORTED in a browser without week fields');
    },
    'T-23':async t =>
    {
        t.equal(await t.render({ id:ID },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[LABEL_REQUIRED]')),'LABEL_REQUIRED');
    },
    'T-24':async t =>
    {
        t.assert(await t.render({ ...BASE, type:'TIME', range:true, minRangeDays:2 },DEPENDS),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'range for a time, a range option without a range');
        await t.call('destroy');
        t.assert(await t.render({ ...BASE, range:true, quickRanges:[ 'LAST_7_DAYS', 'NEXT_2_DAYS' ] },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'UNKNOWN_QUICK_RANGE') ).length, await t.page.$$eval(`#${ID} .ui-calendar-quick-ranges button`,buttons => buttons.length) ],[ 1, 1 ],'unknown quick range dropped');
    },
    'T-26':async t =>
    {
        await t.render({ ...BASE, value:'2026-08-12' },RECORD);
        await t.page.focus(segment('day'));
        await t.page.keyboard.press('ArrowUp');
        await t.page.keyboard.press('ArrowDown');
        await leave(t);
        t.equal(await values(t),[],'a value that ends as it was is not reported');
        await t.page.focus(segment('year'));
        await t.page.keyboard.type('2027');
        await leave(t);
        t.equal(await values(t),[ '2027-08-12' ],'the year reported once, not each digit');
        await t.call('destroy');
        await t.render({ ...BASE, label:'Holiday', range:true },RECORD);
        const before = ( await values(t) ).length, since = async () => ( await values(t) ).slice(before);
        await t.page.click(segment('day','from'));
        await t.page.keyboard.type('03082026');
        await t.page.click(segment('day','to'));
        await t.page.keyboard.type('14082026');
        t.equal(await since(),[],'moving between From and To stays in the field');
        await leave(t);
        t.equal(await since(),[ { from:'2026-08-03', to:'2026-08-14' } ],'both dates reported once when focus leaves');
        await open(t,'to');
        await t.page.click(day('2026-08-20'));
        t.equal(( await values(t) ).at(-1),{ from:'2026-08-03', to:'2026-08-20' },'picking in the calendar is reported at once');
    },
    'T-25':async t =>
    {
        const result = await t.page.evaluate(async () =>
        {
            const [ { getCalendarError }, { mergeCalendarConfig } ] = await Promise.all([ import('/source/components-js/calendar/calendarErrors.js'), import('/source/components-js/calendar/calendarConfig.js') ]);
            return getCalendarError('NOT_A_LABEL',mergeCalendarConfig({ id:'x', label:'X' }));
        });
        t.equal([ result.errorLabel, result.message, result.visibility ],[ 'UNIDENTIFIED', 'An unidentified error occurred.', 'dismissible' ],'fallback');
    }
};
