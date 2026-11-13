// calendarHTML.js
//
// GENERATED MARKUP.
// CUSTOM: segmented, Chrome-like fields (one, or "From"/"To" for ranges) with a host for the calendar Button, and
// a non-modal dialog popover whose body (header, day/month/year/decade grid, time selects, footer) is rebuilt by
// the coordinator. NATIVE: browser inputs. VIEW: exact and/or relative text. Buttons are rendered into hosts
// ([data-button]) by the coordinator through the Button component.

import { formatExact, formatRelative, makeDate, addDays, toISODate, isoWeek, formatValue } from './calendarDates.js';
import { isDisabledDay } from './calendarValidation.js';
import { segmentLayout, isPart, partSpec, partText } from './calendarSegments.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

const NATIVE_TYPES = { DATE:'date', TIME:'time', DATETIME:'datetime-local', MONTH:'month', WEEK:'week' };

// Builds the optional-text or mandatory-asterisk marker; the asterisk is aria-hidden.
function buildMandatoryIndicatorHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-calendar-optional">${escapeHTML(config.texts.optional)}</span>`; }
    if ( config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ) { return ' <span class="ui-calendar-mandatory" aria-hidden="true">*</span>'; }
    return '';
}

// Returns the ids the controls are described by (help); the error id is added at runtime.
export function baseDescribedBy( config ) { return config.help ? [ `${config.id}-help` ] : []; }

// Returns the placeholders of the segments from texts.
export function placeholders( config )
{
    const t = config.texts;
    return { day:t.placeholderDay, month:t.placeholderMonth, year:t.placeholderYear, hour:t.placeholderHour, hour12:t.placeholderHour, minute:t.placeholderMinute, period:t.placeholderPeriod, week:t.placeholderWeek };
}

// Returns the accessible name of a segment.
function segmentName( config, key ) { return { day:config.texts.day, month:config.texts.month, year:config.texts.year, hour:config.texts.hour, hour12:config.texts.hour, minute:config.texts.minute, period:config.texts.period, week:config.texts.week }[key]; }

// Builds one segmented field (role="group" of spin buttons) with the calendar Button host.
function buildSegmentedFieldHTML( config, part, labelledBy )
{
    const id = escapeHTML(part === 'value' ? config.id : `${config.id}-${part}`);
    const inactive = config.state === 'INACTIVE';
    const layout = segmentLayout(config.type,config.dateFormat,config.texts);
    const described = baseDescribedBy(config).join(' ');
    const items = layout.map(item =>
    {
        if ( !isPart(item) ) { return `<span class="ui-calendar-separator" aria-hidden="true">${escapeHTML(item)}</span>`; }
        const spec = partSpec(item);
        return `<span id="${id}-${item}" class="ui-calendar-segment ui-calendar-segment-empty" role="spinbutton" tabindex="${inactive ? '-1' : '0'}" data-key="${item}" aria-label="${escapeHTML(segmentName(config,item))}" aria-valuemin="${spec.min}" aria-valuemax="${spec.max}" aria-valuetext="${escapeHTML(placeholders(config)[item])}"${config.mandatory ? ' aria-required="true"' : ''}${inactive ? ' aria-disabled="true"' : ''} aria-invalid="false"${described ? ` aria-describedby="${described}"` : ''}>${escapeHTML(partText(item,null,placeholders(config)))}</span>`;
    }).join('');
    return `<div id="${id}" class="ui-calendar-box${inactive ? ' ui-calendar-box-disabled' : ''}" role="group" aria-labelledby="${labelledBy}" data-part="${part}"><span class="ui-calendar-segments">${items}</span><span class="ui-calendar-button-host" data-button="calendar" data-part="${part}"></span></div>`;
}

// Returns the exact text of a single value or a range ("12 Aug 26 – 20 Aug 26").
export function exactText( config, value )
{
    const one = item => item ? formatExact(config.type,item,config.displayFormat,config.locale,config.texts,config.dateFormat) : '';
    if ( !config.range ) { return one(value); }
    return value.from || value.to ? `${one(value.from)} – ${one(value.to)}` : '';
}

// Builds the read-only view: exact, relative or both, in <time> elements (the exact text stays available).
export function buildViewValueHTML( config, value, reference )
{
    const item = entry =>
    {
        if ( !entry ) { return ''; }
        const exact = escapeHTML(formatExact(config.type,entry,config.displayFormat,config.locale,config.texts,config.dateFormat));
        const relative = escapeHTML(formatRelative(config.type,entry,reference,config.locale));
        if ( config.displayMode === 'RELATIVE' ) { return `<time datetime="${escapeHTML(entry)}"${hintAttribute(config.tooltipMode,formatExact(config.type,entry,config.displayFormat,config.locale,config.texts,config.dateFormat))}>${relative}<span class="ui-calendar-visually-hidden"> (${exact})</span></time>`; }
        if ( config.displayMode === 'BOTH' ) { return `<time datetime="${escapeHTML(entry)}">${exact} <span class="ui-calendar-relative">(${relative})</span></time>`; }
        return `<time datetime="${escapeHTML(entry)}">${exact}</time>`;
    };
    if ( !config.range ) { return item(value); }
    return value.from || value.to ? `${item(value.from)} – ${item(value.to)}` : '';
}

// Builds a native input.
function buildNativeInputHTML( config, id, value, labelledBy )
{
    const step = config.type === 'TIME' || config.type === 'DATETIME' ? ` step="${config.timeStep * 60}"` : '';
    const attributes = [ `value="${escapeHTML(value)}"`, config.minValue ? `min="${escapeHTML(config.minValue)}"` : '', config.maxValue ? `max="${escapeHTML(config.maxValue)}"` : '', config.mandatory ? 'aria-required="true"' : '', 'aria-invalid="false"', baseDescribedBy(config).length ? `aria-describedby="${baseDescribedBy(config).join(' ')}"` : '', labelledBy ? `aria-labelledby="${labelledBy}"` : '', config.state === 'INACTIVE' ? 'disabled' : '' ].filter(Boolean).join(' ');
    return `<input id="${escapeHTML(id)}" name="${escapeHTML(id === config.id ? config.name : `${config.name}-${id.split('-').pop()}`)}" class="ui-calendar-field" type="${NATIVE_TYPES[config.type]}"${step} ${attributes}>`;
}

// Builds the fields area (native inputs or segmented fields), with the Today/Clear hosts for NATIVE.
function buildFieldsHTML( config, value )
{
    const id = escapeHTML(config.id);
    const native = config.presentation === 'NATIVE';
    const actions = native && ( config.showToday || config.showClear ) ? `<span class="ui-calendar-actions">${config.showToday ? '<span data-button="today"></span>' : ''}${config.showClear ? '<span data-button="clear"></span>' : ''}</span>` : '';
    if ( !config.range ) { return `<div class="ui-calendar-row">${native ? buildNativeInputHTML(config,config.id,value,'') : buildSegmentedFieldHTML(config,'value',`${id}-label`)}${actions}</div>`; }
    const part = key => `<span class="ui-calendar-part"><${native ? `label for="${id}-${key}"` : 'span'} id="${id}-${key}-label" class="ui-calendar-sublabel">${escapeHTML(config.texts[key])}</${native ? 'label' : 'span'}>${native ? buildNativeInputHTML(config,`${config.id}-${key}`,value[key],`${config.id}-label ${config.id}-${key}-label`) : buildSegmentedFieldHTML(config,key,`${id}-label ${id}-${key}-label`)}</span>`;
    const quick = config.quickRanges.length ? `<div class="ui-calendar-quick-ranges">${config.quickRanges.map(key => `<span data-button="quick" data-quick="${key}"></span>`).join('')}</div>` : '';
    return `<div class="ui-calendar-row">${part('from')}${part('to')}${actions}</div>${quick}`;
}

// Builds Calendar markup for the configured state and presentation; INVISIBLE renders nothing.
function buildMarkup( config, value, reference )
{
    if ( config.state === 'INVISIBLE' ) { return ''; }
    const id = escapeHTML(config.id);
    const width = `ui-calendar-width-${config.width.toLowerCase()}`;
    if ( config.state === 'VIEW' ) { return `<div class="ui-calendar-wrapper ${width}"><p class="ui-calendar-label">${escapeHTML(config.label)}</p><p class="ui-calendar-view-value">${buildViewValueHTML(config,value,reference) || '—'}</p></div>`; }
    const label = `${escapeHTML(config.label)}${buildMandatoryIndicatorHTML(config)}`;
    const footer = `${config.help ? `<div id="${id}-help" class="ui-calendar-help">${escapeHTML(config.help)}</div>` : ''}<div id="${id}-error" class="ui-calendar-error" hidden></div>`;
    const popup = config.presentation === 'CUSTOM' ? `<div id="${id}-popup" class="ui-calendar-popup" popover="manual" role="dialog" aria-modal="false" aria-labelledby="${id}-label"><div class="ui-calendar-body"></div></div>` : '';
    const classes = `ui-calendar-wrapper ${width} ui-calendar-${config.presentation.toLowerCase()}${config.range ? ' ui-calendar-range' : ''}`;
    if ( config.range ) { return `<fieldset id="${id}" class="${classes}" role="group" aria-labelledby="${id}-label"><legend id="${id}-label" class="ui-calendar-label">${label}</legend>${buildFieldsHTML(config,value)}${popup}${footer}</fieldset>`; }
    const labelHTML = config.presentation === 'NATIVE' ? `<label id="${id}-label" class="ui-calendar-label" for="${id}">${label}</label>` : `<span id="${id}-label" class="ui-calendar-label">${label}</span>`;
    return `<div class="${classes}">${labelHTML}${buildFieldsHTML(config,value)}${popup}${footer}</div>`;
}

// ---- CUSTOM dialog body ----

// Builds the dialog header: previous / zoom-out title / next (Button hosts).
export function buildHeaderHTML() { return '<div class="ui-calendar-header"><span data-button="previous"></span><span class="ui-calendar-title-host" data-button="title"></span><span data-button="next"></span></div>'; }

// Returns the highlight group of a day (first match), or null.
function highlightOf( config, date )
{
    const iso = toISODate(date);
    for ( const group of config.highlights )
    {
        const entry = group.dates.find(item => item.date === iso);
        if ( entry || group.daysOfWeek.includes(date.getDay()) ) { return { token:group.backgroundToken, label:entry?.label || group.label }; }
    }
    return null;
}

// Builds the day grid of a month (week column, highlights, selection and range states from view.cellState).
export function buildDayGridHTML( config, view )
{
    const monthStart = makeDate(view.viewDate.getFullYear(),view.viewDate.getMonth() + 1,1);
    const start = addDays(monthStart,-( ( monthStart.getDay() - config.firstDayOfWeek + 7 ) % 7 ));
    const weekday = new Intl.DateTimeFormat(config.locale,{ weekday:'short' }), weekdayLong = new Intl.DateTimeFormat(config.locale,{ weekday:'long' });
    const dayLabel = new Intl.DateTimeFormat(config.locale,{ weekday:'long', day:'numeric', month:'long', year:'numeric' });
    const weekHead = config.showWeekNumbers ? `<th scope="col" class="ui-calendar-week-head">${escapeHTML(config.texts.week)}</th>` : '';
    let rows = '';
    for ( let row = 0; row < 6; row++ )
    {
        const first = addDays(start,row * 7);
        const cells = Array.from({ length:7 },( _, index ) =>
        {
            const date = addDays(first,index), iso = toISODate(date), state = view.cellState(date), highlight = highlightOf(config,date);
            const classes = [ 'ui-calendar-day', date.getMonth() !== monthStart.getMonth() ? 'ui-calendar-outside' : '', iso === toISODate(view.today) ? 'ui-calendar-today' : '', highlight ? 'ui-calendar-highlight' : '', ...state.classes ].filter(Boolean).join(' ');
            const disabled = state.disabled || isDisabledDay(config,date);
            const name = `${dayLabel.format(date)}${highlight?.label ? `, ${highlight.label}` : ''}`;
            return `<td role="gridcell" class="${classes}" data-date="${iso}" tabindex="${iso === toISODate(view.focusDate) ? '0' : '-1'}" aria-selected="${state.selected}"${disabled ? ' aria-disabled="true"' : ''}${iso === toISODate(view.today) ? ' aria-current="date"' : ''} aria-label="${escapeHTML(name)}"${highlight ? ` style="--ui-calendar-highlight-bg:var(${highlight.token})"` : ''}${hintAttribute(config.tooltipMode,highlight?.label)}>${date.getDate()}</td>`;
        }).join('');
        const weekCell = config.showWeekNumbers ? `<th scope="row" class="ui-calendar-week-number">${isoWeek(addDays(first,( 8 - first.getDay() ) % 7)).week}</th>` : '';
        rows += `<tr>${weekCell}${cells}</tr>`;
    }
    const heads = Array.from({ length:7 },( _, index ) => addDays(start,index)).map(date => `<th scope="col" abbr="${escapeHTML(weekdayLong.format(date))}">${escapeHTML(weekday.format(date))}</th>`).join('');
    return `<table class="ui-calendar-grid" role="grid" aria-labelledby="${escapeHTML(config.id)}-label"><thead><tr>${weekHead}${heads}</tr></thead><tbody>${rows}</tbody></table>`;
}

// Builds a 3×4 grid of months, years or decades; items: [{ key, attribute, text, label, selected, current, outside, disabled, focus }].
export function buildZoomGridHTML( config, items, kind )
{
    let rows = '';
    for ( let row = 0; row < 3; row++ )
    {
        rows += `<tr>${items.slice(row * 4,row * 4 + 4).map(item => `<td role="gridcell" class="ui-calendar-zoom${item.selected ? ' ui-calendar-selected' : ''}${item.current ? ' ui-calendar-today' : ''}${item.outside ? ' ui-calendar-outside' : ''}" data-${kind}="${item.key}" tabindex="${item.focus ? '0' : '-1'}" aria-selected="${item.selected}"${item.disabled ? ' aria-disabled="true"' : ''} aria-label="${escapeHTML(item.label)}">${escapeHTML(item.text)}</td>`).join('')}</tr>`;
    }
    return `<table class="ui-calendar-grid ui-calendar-zoom-grid" role="grid" aria-labelledby="${escapeHTML(config.id)}-label"><tbody>${rows}</tbody></table>`;
}

// Builds the time selects for the popup: hour (00–23, or 1–12 with an AM/PM list for US) and minutes in timeStep steps.
export function buildTimeHTML( config, time )
{
    const [ hour, minute ] = ( time || '00:00' ).split(':').map(Number);
    const us = config.dateFormat === 'US';
    const option = ( value, text, selected ) => `<option value="${value}"${selected ? ' selected' : ''}>${text}</option>`;
    const hours = us
        ? Array.from({ length:12 },( _, index ) => index + 1).map(h => option(h,String(h),h === ( hour % 12 || 12 ))).join('')
        : Array.from({ length:24 },( _, h ) => option(h,String(h).padStart(2,'0'),h === hour)).join('');
    const minutes = Array.from({ length:Math.ceil(60 / config.timeStep) },( _, index ) => index * config.timeStep).map(m => option(m,String(m).padStart(2,'0'),m === minute)).join('');
    const period = us ? `<select class="ui-calendar-time-select" data-unit="period" aria-label="${escapeHTML(config.texts.period)}">${option('AM','AM',hour < 12)}${option('PM','PM',hour >= 12)}</select>` : '';
    return `<div class="ui-calendar-time"><select class="ui-calendar-time-select" data-unit="hour" aria-label="${escapeHTML(config.texts.hour)}">${hours}</select><span aria-hidden="true">:</span><select class="ui-calendar-time-select" data-unit="minute" aria-label="${escapeHTML(config.texts.minute)}">${minutes}</select>${period}</div>`;
}

// Builds the dialog footer with Button hosts (Today/Now, Clear, Done).
export function buildFooterHTML( config, showDone )
{
    const hosts = [ config.showToday ? '<span data-button="today"></span>' : '', config.showClear ? '<span data-button="clear"></span>' : '', showDone ? '<span class="ui-calendar-done" data-button="done"></span>' : '' ].join('');
    return hosts ? `<div class="ui-calendar-footer">${hosts}</div>` : '';
}

export { formatValue };

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-calendar-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildCalendarHTML( config, value, reference ) { return withLabelPosition(buildMarkup(config, value, reference),config); }
