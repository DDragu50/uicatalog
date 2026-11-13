// calendarComponent.js
//
// COMPONENT COORDINATOR.
// Owns lifecycle, value and error lifecycle, all Buttons (through the Button component), quick ranges and:
// CUSTOM – segmented, Chrome-like typing per field ("From"/"To" for ranges) and a calendar dialog per field with
// zoom levels (days → months → years → decades), keyboard navigation and time selects;
// NATIVE – browser inputs. Markup is rendered once; segments and the dialog body are updated in place.
// The container is a dedicated, consumer-owned mount point.

import { mergeCalendarConfig, validateCalendarConfig } from './calendarConfig.js';
import { createCalendarState } from './calendarState.js';
import { buildCalendarHTML, buildViewValueHTML, baseDescribedBy, placeholders, buildHeaderHTML, buildDayGridHTML, buildZoomGridHTML, buildTimeHTML, buildFooterHTML } from './calendarHTML.js';
import { registerNativeCalendarEvents, registerCustomCalendarEvents, registerOpenCalendarEvents } from './calendarEvents.js';
import { validateCalendar } from './calendarValidation.js';
import { getCalendarError, CALENDAR_ERRORS, reportCalendarIssue } from './calendarErrors.js';
import { parseValue, formatValue, makeDate, addDays, addMonths, toISODate, quickRange } from './calendarDates.js';
import { segmentLayout, isPart, partSpec, partText, typeDigit, stepPart, defaultParts, partsToValue, valueToParts, parsePasted } from './calendarSegments.js';
import { renderButton } from '../button/buttonIndex.js';

const POPUP_GAP = 4;
const SEPARATOR_KEYS = [ '.', '/', '-', ':', ',', ' ' ];

// tooltipMode TOOLTIP (guidelines §12): one Tooltip for the elements with data-tooltip that belong to this component
// (the nearest component around them; hints inside a nested component are left to it), in a host after the component;
// the Tooltip module is loaded only then (if it cannot be loaded, the browser reports it and the hints stay without a
// tooltip). Returns the function that removes it.
function attachHintTooltip( container, id, mode, options = {} )
{
    if ( mode !== 'TOOLTIP' ) { return () => {}; }
    const scope = container.firstElementChild;
    scope?.setAttribute('data-tooltip-scope',id);
    const host = document.createElement('span');
    host.className = 'ui-tooltip-host';
    container.appendChild(host);
    let tooltip = null, removed = false;
    import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
    {
        if ( removed ) { return; }
        tooltip = renderTooltip(host,{ id:`${id}-tooltip`, targets:{ within:container, selector:'[data-tooltip]', text:element => ( element.closest('[data-tooltip-scope]') === scope ? element.getAttribute('data-tooltip') : '' ) }, ...options });
    }).catch(() => {});
    return () => { removed = true; tooltip?.destroy(); host.remove(); scope?.removeAttribute('data-tooltip-scope'); };
}

// Renders an interactive Calendar and returns its runtime instance, or null after a developer error.
export function renderCalendar( container, config, onValueChange, onValidation )
{
    if ( !container ) { reportCalendarIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeCalendarConfig(config);
    if ( validateCalendarConfig(merged) ) { return null; }

    const reference = () => merged.referenceTime ?? new Date();
    const state = createCalendarState(merged);
    state.reported = merged.range ? `${state.value.from}|${state.value.to}` : state.value;   // the value the App was last told
    container.innerHTML = buildCalendarHTML(merged,state.value,reference());
    const wrapper = container.querySelector('.ui-calendar-wrapper');
    const errorElement = container.querySelector('.ui-calendar-error');
    const editable = merged.state === 'EDIT' || merged.state === 'INACTIVE';
    const custom = editable && merged.presentation === 'CUSTOM';
    const fields = editable && !custom ? [ ...wrapper.querySelectorAll('.ui-calendar-field') ] : [];
    const boxes = custom ? [ ...wrapper.querySelectorAll('.ui-calendar-box') ] : [];
    const popup = custom ? wrapper.querySelector('.ui-calendar-popup') : null;
    const body = popup?.querySelector('.ui-calendar-body') ?? null;
    const layout = segmentLayout(merged.type,merged.dateFormat,merged.texts);
    const partNames = merged.range ? [ 'from', 'to' ] : [ 'value' ];
    const fieldButtons = [], popupButtons = [];
    let controller = null, openController = null, instance = null;

    // ---- value, errors and validation ----

    // Returns the controls that carry aria-invalid / aria-describedby.
    const controls = () => ( custom ? boxes.flatMap(box => [ ...box.querySelectorAll('.ui-calendar-segment') ]) : fields );

    // Returns the value of one field ("value", "from" or "to").
    const fieldValue = part => ( merged.range ? state.value[part] : state.value );

    // Shows or clears the current error in place.
    function renderError()
    {
        if ( !errorElement ) { return; }
        errorElement.textContent = state.error?.message ?? '';
        errorElement.hidden = !state.error;
        wrapper.classList.toggle('ui-calendar-invalid',Boolean(state.error));
        const describedBy = [ ...baseDescribedBy(merged), state.error ? errorElement.id : '' ].filter(Boolean).join(' ');
        controls().forEach(control => { control.setAttribute('aria-invalid',String(Boolean(state.error))); if ( describedBy ) { control.setAttribute('aria-describedby',describedBy); } else { control.removeAttribute('aria-describedby'); } });
    }

    // Notifies the consumer only when the effective validation result changes.
    function notifyValidation( result )
    {
        if ( state.lastResult?.valid === result.valid && state.lastResult?.errorLabel === result.errorLabel ) { return; }
        state.lastResult = { ...result };
        if ( typeof onValidation === 'function' ) { onValidation({ ...result },instance); }
    }

    // Runs validation; "input" only updates a visible error, "final" shows or clears it; notify:false keeps onValidation for
    // later (typing in the field). Returns { valid, errorLabel }.
    function runValidation( mode, notify = true )
    {
        let result = validateCalendar(merged,state.value,Object.values(state.badInput).some(Boolean));
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        if ( mode === 'final' || state.error )
        {
            const next = result.errorLabel ? ( result.errorLabel === 'EXTERNAL' ? { ...CALENDAR_ERRORS.EXTERNAL, message:state.external } : getCalendarError(result.errorLabel,merged) ) : null;
            if ( state.error?.errorLabel !== next?.errorLabel ) { state.error = next; renderError(); }
        }
        if ( notify ) { notifyValidation(result); }
        return { ...result };
    }

    // Returns a comparable string for a value (single or range).
    const key = value => ( merged.range ? `${value.from}|${value.to}` : value );

    // Stores a new value; updates native inputs, segments (unless typed) and the view; for user changes marks dirty and notifies.
    // deferred (typing, arrows, Backspace and paste in the field): the App is told when focus leaves the field (reportPending).
    function commit( value, user, typed = false, deferred = typed )
    {
        const previous = key(state.value);
        state.value = merged.range ? { from:value.from ?? '', to:value.to ?? '' } : value ?? '';
        if ( !typed ) { partNames.forEach(part => { state.badInput[part] = false; syncSegments(part); }); }
        syncNative();
        const view = container.querySelector('.ui-calendar-view-value');
        if ( view ) { view.innerHTML = buildViewValueHTML(merged,state.value,reference()) || '—'; }
        if ( !user ) { state.reported = key(state.value); return; }
        const changed = previous !== key(state.value);
        if ( changed ) { state.isDirty = true; state.external = null; }
        runValidation('input',!deferred);
        if ( !deferred ) { reportPending(); }
    }

    // Tells the App the value when it differs from the last value it was told (user changes only).
    function reportPending()
    {
        if ( key(state.value) === state.reported ) { return; }
        state.reported = key(state.value);
        if ( typeof onValueChange === 'function' ) { onValueChange(merged.range ? { ...state.value } : state.value,instance); }
    }

    // Sets one field's value (range-aware) as a user change.
    function commitPart( part, value, typed = false ) { commit(merged.range ? { ...state.value, [part]:value } : value,true,typed); }

    // Returns the "today/now" value of the type (time rounded down to timeStep).
    function nowValue()
    {
        const now = new Date(reference());   // the "today" the calendar marks (referenceTime, otherwise now)
        now.setMinutes(Math.floor(now.getMinutes() / merged.timeStep) * merged.timeStep,0,0);
        return formatValue(merged.type,now);
    }

    // Applies a rolling quick range.
    function applyQuickRange( quick )
    {
        const { from, to } = quickRange(quick,reference());
        commit(merged.type === 'DATETIME' ? { from:`${toISODate(from)}T00:00`, to:`${toISODate(to)}T23:59` } : { from:toISODate(from), to:toISODate(to) },true);
    }

    // ---- native presentation ----

    // Applies the value to the native inputs.
    function syncNative()
    {
        if ( fields.length === 1 ) { fields[0].value = state.value; }
        if ( fields.length === 2 ) { fields[0].value = state.value.from; fields[1].value = state.value.to; fields[1].min = state.value.from || merged.minValue; }
    }

    // Reads the native inputs (and whether the browser holds unparseable text).
    function readNative()
    {
        state.badInput = { native:fields.some(field => field.validity.badInput) };
        commit(fields.length === 2 ? { from:fields[0].value, to:fields[1].value } : fields[0].value,true,true);
    }

    // ---- custom presentation: segments ----

    // Returns the segmented field element of a part.
    const boxOf = part => boxes.find(box => box.dataset.part === part);

    // Shows the parts of a field in its segments (text, empty state and spin button values).
    function renderSegments( part )
    {
        const box = boxOf(part);
        if ( !box ) { return; }
        box.querySelectorAll('.ui-calendar-segment').forEach(segment =>
        {
            const value = state.parts[part][segment.dataset.key];
            const text = partText(segment.dataset.key,value,placeholders(merged));
            segment.textContent = text;
            segment.classList.toggle('ui-calendar-segment-empty',value === null || value === undefined);
            if ( value === null || value === undefined ) { segment.removeAttribute('aria-valuenow'); } else { segment.setAttribute('aria-valuenow',String(value)); }
            segment.setAttribute('aria-valuetext',text);
        });
    }

    // Loads a field's parts from its value (programmatic changes, calendar picks, Today/Clear).
    function syncSegments( part )
    {
        if ( !custom ) { return; }
        state.parts[part] = valueToParts(merged.type,layout,fieldValue(part));
        state.buffers[part] = {};
        renderSegments(part);
    }

    // Recomputes a field's value from its parts after typing; incomplete or impossible input is "bad input".
    function updateFromParts( part )
    {
        renderSegments(part);
        const result = partsToValue(merged.type,layout,state.parts[part]);
        state.badInput[part] = !result.complete && !result.empty;
        commitPart(part,result.value,true);
    }

    // Moves focus to the next or previous segment of the same field.
    function moveSegment( segment, step )
    {
        const list = [ ...segment.closest('.ui-calendar-box').querySelectorAll('.ui-calendar-segment') ];
        list[list.indexOf(segment) + step]?.focus();
    }

    // Chrome-like keyboard editing of one segment.
    function handleSegmentKey( event )
    {
        const segment = event.target, part = segment.closest('.ui-calendar-box').dataset.part, name = segment.dataset.key;
        const parts = state.parts[part], buffers = state.buffers[part] ?? ( state.buffers[part] = {} ), spec = partSpec(name);
        if ( merged.state !== 'EDIT' ) { return; }
        if ( event.altKey && event.key === 'ArrowDown' ) { event.preventDefault(); openDialog(part); return; }
        if ( event.key === 'Tab' || event.ctrlKey || event.metaKey ) { return; }
        if ( /^\d$/.test(event.key) && name !== 'period' )
        {
            event.preventDefault();
            const result = typeDigit(name,buffers[name] ?? '',event.key);
            parts[name] = result.value; buffers[name] = result.buffer;
            updateFromParts(part);
            if ( result.advance ) { moveSegment(segment,1); }
            return;
        }
        if ( name === 'period' && /^[aApP]$/.test(event.key) ) { event.preventDefault(); parts.period = /^[aA]$/.test(event.key) ? 0 : 1; updateFromParts(part); moveSegment(segment,1); return; }
        if ( event.key === 'ArrowUp' || event.key === 'ArrowDown' )
        {
            event.preventDefault();
            buffers[name] = '';
            parts[name] = stepPart(name,parts[name],event.key === 'ArrowUp' ? 1 : -1,name === 'year' && merged.type === 'WEEK' ? defaultParts(reference()).weekYear : defaultParts(reference())[name]);
            updateFromParts(part);
            return;
        }
        if ( event.key === 'Home' || event.key === 'End' ) { event.preventDefault(); buffers[name] = ''; parts[name] = event.key === 'Home' ? spec.min : spec.max; updateFromParts(part); return; }
        if ( event.key === 'Backspace' || event.key === 'Delete' ) { event.preventDefault(); buffers[name] = ''; parts[name] = null; updateFromParts(part); return; }
        if ( event.key === 'ArrowRight' || event.key === 'ArrowLeft' ) { event.preventDefault(); moveSegment(segment,event.key === 'ArrowRight' ? 1 : -1); return; }
        if ( SEPARATOR_KEYS.includes(event.key) ) { event.preventDefault(); moveSegment(segment,1); return; }
        if ( event.key.length === 1 ) { event.preventDefault(); }
    }

    // Pastes a whole value typed in the configured format (or ISO) into a field.
    function handlePaste( segment, text )
    {
        if ( merged.state !== 'EDIT' ) { return; }
        const part = segment.closest('.ui-calendar-box').dataset.part, value = parsePasted(merged.type,merged.dateFormat,text);
        if ( value ) { commit(merged.range ? { ...state.value, [part]:value } : value,true,false,true); }   // reported when focus leaves the field
    }

    // ---- custom presentation: calendar dialog ----

    // Destroys the Buttons rendered inside the dialog body.
    function destroyPopupButtons() { popupButtons.splice(0).forEach(button => button?.destroy()); }

    // Renders a Button into a host (or nothing when the host is missing) and remembers it for destruction.
    function button( list, host, options, onClick ) { if ( host ) { list.push(renderButton(host,{ hierarchy:'TERTIARY', size:'SMALL', ...options },onClick)); } }

    // Returns the selection state of a day cell for the active field (selected, range classes, disabled by limits).
    function cellState( date )
    {
        const iso = toISODate(date), classes = [], dateOf = value => ( value ? value.slice(0,10) : '' );
        let selected = false;
        if ( merged.type === 'WEEK' ) { selected = Boolean(state.value) && formatValue('WEEK',date) === state.value; }
        else if ( merged.range )
        {
            const from = dateOf(state.value.from), to = dateOf(state.value.to);
            selected = iso === dateOf(state.value[state.activePart]);
            if ( from && to && iso > from && iso < to ) { classes.push('ui-calendar-in-range'); }
            if ( iso === from ) { classes.push('ui-calendar-range-start'); }
            if ( iso === to ) { classes.push('ui-calendar-range-end'); }
        }
        else { selected = dateOf(state.value) === iso; }
        if ( selected ) { classes.push('ui-calendar-selected'); }
        const min = merged.range && state.activePart === 'to' && state.value.from ? [ state.value.from.slice(0,10), merged.minValue.slice(0,10) ].sort().pop() : merged.minValue.slice(0,10);
        const max = merged.maxValue.slice(0,10);
        const outside = merged.type === 'WEEK' ? ( merged.minValue && formatValue('WEEK',date) < merged.minValue ) || ( merged.maxValue && formatValue('WEEK',date) > merged.maxValue ) : ( min && iso < min ) || ( max && iso > max );
        return { selected, classes, disabled:Boolean(outside) };
    }

    // Returns the items of the month, year or decade grid for the current zoom level.
    function zoomItems()
    {
        const focus = state.focusDate, today = reference(), selected = parseValue(merged.type === 'TIME' ? 'DATE' : merged.type,fieldValue(state.activePart));
        const long = new Intl.DateTimeFormat(merged.locale,{ month:'long', year:'numeric' }), short = new Intl.DateTimeFormat(merged.locale,{ month:'short' });
        if ( state.level === 'MONTHS' )
        {
            return Array.from({ length:12 },( _, index ) =>
            {
                const date = makeDate(focus.getFullYear(),index + 1,1), value = formatValue('MONTH',date);
                return { key:value, text:short.format(date), label:long.format(date), selected:selected && formatValue('MONTH',selected) === value, current:value === formatValue('MONTH',today), focus:index === focus.getMonth(), disabled:( merged.minValue && value < merged.minValue.slice(0,7) ) || ( merged.maxValue && value > merged.maxValue.slice(0,7) ) };
            });
        }
        const span = state.level === 'YEARS' ? 1 : 10, block = span * 10, start = Math.floor(focus.getFullYear() / block) * block;
        return Array.from({ length:12 },( _, index ) =>
        {
            const first = start + ( index - 1 ) * span, last = first + span - 1;
            const within = year => ( merged.minValue ? year >= Number(merged.minValue.slice(0,4)) : true ) && ( merged.maxValue ? year <= Number(merged.maxValue.slice(0,4)) : true );
            const text = span === 1 ? String(first) : `${first}–${last}`;
            return { key:String(first), text, label:text, selected:Boolean(selected) && selected.getFullYear() >= first && selected.getFullYear() <= last, current:today.getFullYear() >= first && today.getFullYear() <= last, outside:index === 0 || index === 11, focus:focus.getFullYear() >= first && focus.getFullYear() <= last, disabled:!( within(first) || within(last) ) };
        });
    }

    // Renders the dialog body for the current field, zoom level and view; focuses the active cell when requested.
    function renderDialog( focusCell )
    {
        state.rendering = true;
        destroyPopupButtons();
        state.rendering = false;
        const time = merged.type === 'TIME' || merged.type === 'DATETIME';
        const title = { DAYS:() => new Intl.DateTimeFormat(merged.locale,{ month:'long', year:'numeric' }).format(state.focusDate), MONTHS:() => String(state.focusDate.getFullYear()), YEARS:() => { const s = Math.floor(state.focusDate.getFullYear() / 10) * 10; return `${s}–${s + 9}`; }, DECADES:() => { const s = Math.floor(state.focusDate.getFullYear() / 100) * 100; return `${s}–${s + 99}`; } }[state.level]();
        let html = '';
        if ( merged.type !== 'TIME' ) { html += buildHeaderHTML(); }
        if ( merged.type !== 'TIME' ) { html += state.level === 'DAYS' ? buildDayGridHTML(merged,{ viewDate:state.focusDate, focusDate:state.focusDate, today:reference(), cellState }) : buildZoomGridHTML(merged,zoomItems(),{ MONTHS:'month', YEARS:'year', DECADES:'decade' }[state.level]); }
        if ( time ) { const value = fieldValue(state.activePart); html += buildTimeHTML(merged,merged.type === 'TIME' ? value : value ? value.slice(11) : ''); }
        html += buildFooterHTML(merged,time);
        state.rendering = true;
        body.innerHTML = html;
        state.rendering = false;
        const names = { DAYS:[ merged.texts.previousMonth, merged.texts.nextMonth, merged.texts.chooseMonth ], MONTHS:[ merged.texts.previousYear, merged.texts.nextYear, merged.texts.chooseYear ], YEARS:[ merged.texts.previousDecade, merged.texts.nextDecade, merged.texts.chooseDecade ], DECADES:[ merged.texts.previousCentury, merged.texts.nextCentury, '' ] }[state.level];
        const host = name => body.querySelector(`[data-button="${name}"]`), id = `${merged.id}-dialog`;
        button(popupButtons,host('previous'),{ id:`${id}-previous`, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-chevron-left', ariaLabel:names[0], tooltipMode:merged.iconTooltip },() => navigate(-1));
        button(popupButtons,host('title'),{ id:`${id}-title`, label:title, disabled:state.level === 'DECADES' },() => zoomOut());
        body.querySelector(`[id="${id}-title"]`)?.setAttribute('title',names[2]);
        button(popupButtons,host('next'),{ id:`${id}-next`, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-chevron-right', ariaLabel:names[1], tooltipMode:merged.iconTooltip },() => navigate(1));
        button(popupButtons,host('today'),{ id:`${id}-today`, label:time ? merged.texts.now : merged.texts.today },() => { commitPart(state.activePart,nowValue()); closeDialog(true); });
        button(popupButtons,host('clear'),{ id:`${id}-clear`, label:merged.texts.clear },() => { commitPart(state.activePart,''); closeDialog(true); });
        button(popupButtons,host('done'),{ id:`${id}-done`, label:merged.texts.done },() => closeDialog(true));
        if ( focusCell ) { ( body.querySelector('[role="gridcell"][tabindex="0"]') ?? body.querySelector('select, button') )?.focus(); }
    }

    // Moves the view by one unit of the zoom level (month, year, decade, century).
    function navigate( step )
    {
        const months = { DAYS:1, MONTHS:12, YEARS:120, DECADES:1200 }[state.level];
        state.focusDate = addMonths(state.focusDate,step * months);
        renderDialog(true);
    }

    // Zooms out one level (days → months → years → decades).
    function zoomOut()
    {
        state.level = { DAYS:'MONTHS', MONTHS:'YEARS', YEARS:'DECADES', DECADES:'DECADES' }[state.level];
        renderDialog(true);
    }

    // Positions the dialog under (or above) the active field; closes it when the field leaves the viewport.
    function positionDialog()
    {
        const box = boxOf(state.activePart);
        if ( !box ) { return; }
        const rect = box.getBoundingClientRect();
        if ( rect.bottom < 0 || rect.top > window.innerHeight ) { closeDialog(false); return; }
        const height = popup.offsetHeight, below = window.innerHeight - rect.bottom - POPUP_GAP * 2;
        const top = below < height && rect.top > below ? rect.top - POPUP_GAP - height : rect.bottom + POPUP_GAP;
        const left = Math.max(POPUP_GAP,Math.min(rect.left,window.innerWidth - popup.offsetWidth - POPUP_GAP));
        popup.style.setProperty('--ui-calendar-popup-top',`${Math.max(POPUP_GAP,top)}px`);
        popup.style.setProperty('--ui-calendar-popup-left',`${left}px`);
    }

    // Opens the dialog for one field at its value (or the reference day) and focuses the active cell.
    function openDialog( part )
    {
        if ( merged.state !== 'EDIT' ) { return; }
        if ( state.open ) { closeDialog(false); if ( state.activePart === part ) { return; } }
        state.open = true;
        state.activePart = part;
        state.level = merged.type === 'MONTH' ? 'MONTHS' : 'DAYS';
        const today = reference(), parsed = merged.type === 'TIME' ? null : parseValue(merged.type,fieldValue(part)) ?? ( part === 'to' ? parseValue(merged.type,state.value.from) : null );
        state.focusDate = parsed ?? makeDate(today.getFullYear(),today.getMonth() + 1,today.getDate());
        if ( typeof popup.showPopover === 'function' ) { popup.showPopover(); } else { popup.classList.add('ui-calendar-popup-open'); }
        renderDialog(false);
        positionDialog();
        ( body.querySelector('[role="gridcell"][tabindex="0"]') ?? body.querySelector('select, button') )?.focus();
        openController = registerOpenCalendarEvents(wrapper,{ onOutsidePress:() => closeDialog(false), onReposition:positionDialog });
    }

    // Closes the dialog; optionally returns focus to the first segment of the active field.
    function closeDialog( returnFocus )
    {
        if ( !state.open ) { return; }
        state.open = false;
        openController?.abort();
        if ( typeof popup.hidePopover === 'function' ) { popup.hidePopover(); } else { popup.classList.remove('ui-calendar-popup-open'); }
        if ( returnFocus ) { boxOf(state.activePart)?.querySelector('.ui-calendar-segment')?.focus(); }
        state.rendering = true;
        destroyPopupButtons();
        body.innerHTML = '';
        state.rendering = false;
    }

    // Reads the popup time selects as 'HH:MM' (US: hour 1–12 plus AM/PM).
    function readTime()
    {
        const unit = name => body.querySelector(`.ui-calendar-time-select[data-unit="${name}"]`)?.value;
        if ( unit('hour') === undefined ) { return '00:00'; }
        let hour = Number(unit('hour'));
        const period = unit('period');
        if ( period ) { hour = ( hour % 12 ) + ( period === 'PM' ? 12 : 0 ); }
        return `${String(hour).padStart(2,'0')}:${String(Number(unit('minute'))).padStart(2,'0')}`;
    }

    // Handles a click (or Enter) on a grid cell at any zoom level.
    function chooseCell( cell )
    {
        if ( cell.getAttribute('aria-disabled') === 'true' ) { return; }
        if ( cell.dataset.decade ) { state.focusDate = makeDate(Number(cell.dataset.decade),state.focusDate.getMonth() + 1,1); state.level = 'YEARS'; renderDialog(true); return; }
        if ( cell.dataset.year ) { state.focusDate = makeDate(Number(cell.dataset.year),state.focusDate.getMonth() + 1,1); state.level = 'MONTHS'; renderDialog(true); return; }
        if ( cell.dataset.month )
        {
            const [ year, month ] = cell.dataset.month.split('-').map(Number);
            if ( merged.type === 'MONTH' ) { commitPart(state.activePart,cell.dataset.month); closeDialog(true); return; }
            state.focusDate = makeDate(year,month,Math.min(state.focusDate.getDate(),28)); state.level = 'DAYS'; renderDialog(true); return;
        }
        const date = parseValue('DATE',cell.dataset.date);
        if ( merged.type === 'WEEK' ) { commitPart(state.activePart,formatValue('WEEK',date)); closeDialog(true); return; }
        if ( merged.type === 'DATE' ) { commitPart(state.activePart,cell.dataset.date); closeDialog(true); return; }
        commitPart(state.activePart,`${cell.dataset.date}T${readTime()}`);
        state.focusDate = date;
        renderDialog(true);
    }

    // Applies the popup time selects (TIME, and DATETIME once a day is chosen).
    function changeTime()
    {
        const current = fieldValue(state.activePart);
        if ( merged.type === 'TIME' ) { commitPart(state.activePart,readTime()); return; }
        if ( current ) { commitPart(state.activePart,`${current.slice(0,10)}T${readTime()}`); }
    }

    // Keyboard handling in the dialog grids (day, month, year, decade) and Escape.
    function handlePopupKeyDown( event )
    {
        if ( event.key === 'Escape' ) { event.preventDefault(); closeDialog(true); return; }
        const cell = event.target.closest('[role="gridcell"]');
        if ( !cell ) { return; }
        const date = state.focusDate, unit = { MONTHS:1, YEARS:12, DECADES:120 }[state.level];
        const moves = state.level === 'DAYS'
            ? { ArrowLeft:() => addDays(date,-1), ArrowRight:() => addDays(date,1), ArrowUp:() => addDays(date,-7), ArrowDown:() => addDays(date,7), PageUp:() => addMonths(date,event.shiftKey ? -12 : -1), PageDown:() => addMonths(date,event.shiftKey ? 12 : 1), Home:() => addDays(date,-( ( date.getDay() - merged.firstDayOfWeek + 7 ) % 7 )), End:() => addDays(date,6 - ( date.getDay() - merged.firstDayOfWeek + 7 ) % 7) }
            : { ArrowLeft:() => addMonths(date,-unit), ArrowRight:() => addMonths(date,unit), ArrowUp:() => addMonths(date,-4 * unit), ArrowDown:() => addMonths(date,4 * unit), PageUp:() => addMonths(date,-12 * unit), PageDown:() => addMonths(date,12 * unit) };
        if ( moves[event.key] ) { event.preventDefault(); state.focusDate = moves[event.key](); renderDialog(true); return; }
        if ( event.key === 'Enter' || event.key === ' ' ) { event.preventDefault(); chooseCell(cell); }
    }

    instance =
    {
        id:merged.id,
        name:merged.name,
        // Returns the effective label position: TOP or START (INHERIT follows an ancestor with the class ui-labels-start).
        getLabelPosition:() => ( merged.labelPosition !== 'INHERIT' ? merged.labelPosition : container.closest('.ui-labels-start') ? 'START' : 'TOP' ),
        // Returns the field's visible label (form-field contract: Form prefixes summary messages with it).
        getLabel:() => merged.label,
        // Returns { mandatory, indicator } (form-field contract: Form shows the "* Required field" note when an asterisk is shown).
        getMandatoryState:() => ({ mandatory:merged.mandatory, indicator:merged.mandatoryIndicator }),
        // Shows an external error (e.g. from the server) until the user changes the value or clearError() is called; returns { valid, errorLabel }.
        setError:( message ) => { state.external = String(message ?? '').trim() || null; return runValidation('final'); },
        // Removes an external error (own validation errors stay as they are).
        clearError:() => { const shown = state.error?.errorLabel === 'EXTERNAL'; state.external = null; if ( shown ) { runValidation('final'); } },
        // Returns the value: an ISO string ('' when empty or incomplete) or { from, to } for ranges.
        getValue:() => ( merged.range ? { ...state.value } : state.value ),
        // Returns a copy of the current error, or null.
        getError:() => state.error ? { ...state.error } : null,
        // Sets the value programmatically (invalid ISO values ignored with a warning); returns { valid, errorLabel }.
        // options.quiet (Form's quiet reset): sets the value without validating, clears any shown error and the changed state.
        setValue:( value, options = {} ) =>
        {
            const valid = entry => !entry || parseValue(merged.type,entry);
            const next = merged.range ? { from:value?.from ?? '', to:value?.to ?? '' } : value ?? '';
            if ( merged.range ? !( valid(next.from) && valid(next.to) ) : !valid(next) ) { reportCalendarIssue('INVALID_OPTION',{ id:merged.id, key:'setValue()', value:JSON.stringify(value), fallback:JSON.stringify(state.value) }); return runValidation('final'); }
            state.badInput = {};
            commit(next,false);
            if ( options?.quiet ) { state.external = null; state.isDirty = false; state.error = null; renderError(); return { ...validateCalendar(merged,state.value,false) }; }
            return runValidation('final');
        },
        // Runs final validation and returns { valid, errorLabel }.
        validate:() => runValidation('final'),
        // Returns whether the user has changed the value.
        isDirty:() => state.isDirty,
        // Moves focus to the first input or the first segment; returns whether it received focus.
        focus:() => { const target = controls()[0]; target?.focus(); return Boolean(target) && document.activeElement === target; },
        // Closes the dialog, destroys Buttons, removes listeners, then clears the container.
        destroy:() => { removeHintTooltip(); if ( custom ) { closeDialog(false); } fieldButtons.splice(0).forEach(item => item?.destroy()); controller?.abort(); openController?.abort(); container.innerHTML = ''; }
    };

    // Field-level Buttons: calendar button per custom field, Today/Clear for native, quick ranges.
    const inactive = merged.state !== 'EDIT';
    boxes.forEach(box => button(fieldButtons,box.querySelector('[data-button="calendar"]'),{ id:`${box.id}-calendar`, buttonVariant:'ICON_BUTTON', icon:'fa-regular fa-calendar', ariaLabel:merged.texts.openCalendar, disabled:inactive, tooltipMode:merged.iconTooltip },() => openDialog(box.dataset.part)));
    button(fieldButtons,wrapper?.querySelector('.ui-calendar-actions [data-button="today"]'),{ id:`${merged.id}-today`, label:merged.type === 'TIME' || merged.type === 'DATETIME' ? merged.texts.now : merged.texts.today, disabled:inactive },() => { const value = nowValue(); commit(merged.range ? { from:value, to:value } : value,true); });
    button(fieldButtons,wrapper?.querySelector('.ui-calendar-actions [data-button="clear"]'),{ id:`${merged.id}-clear`, label:merged.texts.clear, disabled:inactive },() => { state.badInput = {}; commit(merged.range ? { from:'', to:'' } : '',true); });
    wrapper?.querySelectorAll('[data-button="quick"]').forEach(host => button(fieldButtons,host,{ id:`${merged.id}-quick-${host.dataset.quick.toLowerCase()}`, label:merged.texts[host.dataset.quick], disabled:inactive },() => applyQuickRange(host.dataset.quick)));

    if ( custom ) { partNames.forEach(part => syncSegments(part)); }
    if ( merged.state === 'EDIT' && !custom && fields.length )
    {
        controller = registerNativeCalendarEvents(wrapper,{ onInput:readNative, onLeave:() => { state.badInput = { native:fields.some(field => field.validity.badInput) }; reportPending(); if ( state.isDirty || state.badInput.native ) { runValidation('final'); } } });
    }
    if ( merged.state === 'EDIT' && custom )
    {
        controller = registerCustomCalendarEvents(wrapper,popup,
        {
            onSegmentKey:handleSegmentKey,
            onPaste:handlePaste,
            onSegmentBlur:segment => { const part = segment.closest('.ui-calendar-box').dataset.part; if ( state.buffers[part] ) { state.buffers[part][segment.dataset.key] = ''; } },
            onBoxClick:box => box.querySelector('.ui-calendar-segment')?.focus(),
            onCellClick:chooseCell,
            onPopupKeyDown:handlePopupKeyDown,
            onTimeChange:changeTime,
            onLeave:() => { if ( state.rendering ) { return; } closeDialog(false); reportPending(); if ( state.isDirty || Object.values(state.badInput).some(Boolean) ) { runValidation('final'); } }
        });
    }
    if ( merged.autoFocus && merged.state === 'EDIT' ) { instance.focus(); }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode);
    return instance;
}
