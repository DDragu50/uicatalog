// selectComponent.js
//
// COMPONENT COORDINATOR.
// Owns lifecycle, selection, error lifecycle and (CUSTOM) the listbox: open/close, positioning, active option,
// keyboard, type-ahead and search. Markup is rendered once; state is applied in place.
// The container is a dedicated, consumer-owned mount point.

import { mergeSelectConfig, validateSelectConfig } from './selectConfig.js';
import { createSelectState } from './selectState.js';
import { buildSelectHTML, baseDescribedBy } from './selectHTML.js';
import { registerNativeSelectEvents, registerCustomSelectEvents, registerOpenListEvents } from './selectEvents.js';
import { validateSelection } from './selectValidation.js';
import { getSelectError, SELECT_ERRORS, reportSelectIssue } from './selectErrors.js';

const POPUP_GAP = 4;

// Lower-cases and removes accents so "sao" matches "São".
function fold( text ) { return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

// Returns the effective presentation: CUSTOM becomes NATIVE on touch-first devices unless configured otherwise.
function effectivePresentation( config )
{
    if ( config.presentation !== 'CUSTOM' || config.touchPresentation !== 'NATIVE' ) { return config.presentation; }
    return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'NATIVE' : 'CUSTOM';
}

// Renders an interactive Select and returns its runtime instance, or null after a developer error.
export function renderSelect( container, config, onValueChange, onValidation )
{
    if ( !container ) { reportSelectIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeSelectConfig(config);
    if ( validateSelectConfig(merged) ) { return null; }

    const state = createSelectState(merged,effectivePresentation(merged));
    container.innerHTML = buildSelectHTML(merged,state.presentation,state.values);
    const wrapper = container.querySelector('.ui-select-wrapper');
    const control = container.querySelector(`[id="${merged.id}"]`);
    const errorElement = container.querySelector('.ui-select-error');
    const custom = state.presentation === 'CUSTOM' && merged.state !== 'VIEW' && merged.state !== 'INVISIBLE';
    const elements = custom ? { wrapper, trigger:control, popup:wrapper.querySelector('.ui-select-popup'), listbox:wrapper.querySelector('.ui-select-listbox'), search:wrapper.querySelector('.ui-select-search'), noMatches:wrapper.querySelector('.ui-select-no-matches'), announcer:wrapper.querySelector('.ui-select-popup [aria-live]'), value:wrapper.querySelector('.ui-select-value'), more:wrapper.querySelector('.ui-select-more'), valueText:wrapper.querySelector('.ui-select-trigger .ui-select-visually-hidden') } : null;
    const options = custom ? [ ...elements.listbox.querySelectorAll('.ui-select-option') ] : [];
    let controller = null, openController = null, resizeObserver = null, instance = null;

    // ---- errors and validation (shared) ----

    // Shows or clears the current error in place: message, aria-invalid and aria-describedby.
    function renderError()
    {
        if ( !control || !errorElement ) { return; }
        errorElement.textContent = state.error?.message ?? '';
        errorElement.hidden = !state.error;
        control.setAttribute('aria-invalid',String(Boolean(state.error)));
        const describedBy = [ ...baseDescribedBy(merged,state.presentation), state.error ? errorElement.id : '' ].filter(Boolean).join(' ');
        if ( describedBy ) { control.setAttribute('aria-describedby',describedBy); } else { control.removeAttribute('aria-describedby'); }
    }

    // Notifies the consumer only when the effective validation result changes.
    function notifyValidation( result )
    {
        if ( state.lastResult?.valid === result.valid && state.lastResult?.errorLabel === result.errorLabel ) { return; }
        state.lastResult = { ...result };
        if ( typeof onValidation === 'function' ) { onValidation({ ...result },instance); }
    }

    // Runs validation; "input" only updates a visible error, "blur"/"final" show or clear it. Returns { valid, errorLabel }.
    function runValidation( mode )
    {
        let result = validateSelection(merged,state.values);
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        if ( mode !== 'input' || state.error )
        {
            const next = result.errorLabel ? ( result.errorLabel === 'EXTERNAL' ? { ...SELECT_ERRORS.EXTERNAL, message:state.external } : getSelectError(result.errorLabel,merged) ) : null;
            if ( state.error?.errorLabel !== next?.errorLabel ) { state.error = next; renderError(); }
        }
        notifyValidation(result);
        return { ...result };
    }

    // Stores a new selection, synchronizes the view and, for user changes, marks dirty and notifies.
    function commit( values, user )
    {
        const previous = state.values.join('\u0000');
        state.values = merged.options.filter(option => values.includes(option.value)).map(option => option.value);
        if ( custom ) { syncCustom(); } else { syncNative(); }
        if ( !user ) { return; }
        const changed = previous !== state.values.join('\u0000');
        if ( changed ) { state.isDirty = true; state.external = null; }
        runValidation('input');
        if ( changed && typeof onValueChange === 'function' ) { onValueChange([ ...state.values ],instance); }
    }

    // ---- native presentation ----

    // Applies the selection to the native <select> (programmatic updates).
    function syncNative()
    {
        if ( !control || control.tagName !== 'SELECT' ) { return; }
        [ ...control.options ].forEach(option => { option.selected = option.value === '' ? state.values.length === 0 : state.values.includes(option.value); });
    }

    // ---- custom presentation ----

    // Returns the option data for an option element (null for the clear entry).
    function optionData( element ) { return merged.options[Number(element.dataset.index)] ?? null; }

    // Returns the options the keyboard can reach: visible and not disabled.
    function navigable() { return options.filter(element => !element.hidden && element.getAttribute('aria-disabled') !== 'true'); }

    // Updates aria-selected and the closed-field text ("Red, Blue +2"), fitting as many labels as the width allows.
    function syncCustom()
    {
        options.forEach(element => { const data = optionData(element); element.setAttribute('aria-selected',String(Boolean(data) && state.values.includes(data.value))); });
        const labels = merged.options.filter(option => state.values.includes(option.value)).map(option => option.label);
        elements.valueText.textContent = labels.length ? labels.join(', ') : merged.texts.placeholder;
        elements.value.classList.toggle('ui-select-placeholder',labels.length === 0);
        fitValue(labels);
    }

    // Shows the longest comma list that fits, followed by "+N" for the remaining labels.
    function fitValue( labels )
    {
        if ( labels.length === 0 ) { elements.value.textContent = merged.texts.placeholder; elements.more.textContent = ''; return; }
        for ( let count = labels.length; count >= 1; count-- )
        {
            elements.value.textContent = labels.slice(0,count).join(', ');
            elements.more.textContent = count < labels.length ? merged.texts.more.replace('{count}',String(labels.length - count)) : '';
            if ( elements.value.scrollWidth <= elements.value.clientWidth ) { return; }
        }
    }

    // Marks one option as active (hover/keyboard) and points aria-activedescendant at it.
    function setActive( element )
    {
        options.forEach(item => item.classList.toggle('ui-select-option-active',item === element));
        const focusElement = elements.search ?? elements.trigger;
        if ( element ) { focusElement.setAttribute('aria-activedescendant',element.id); element.scrollIntoView({ block:'nearest' }); }
        else { focusElement.removeAttribute('aria-activedescendant'); }
        state.activeIndex = element ? options.indexOf(element) : -1;
    }

    // Moves the active option by a step, or to the first/last reachable option.
    function moveActive( step )
    {
        const list = navigable();
        if ( list.length === 0 ) { return; }
        const current = list.indexOf(options[state.activeIndex]);
        if ( step === 'FIRST' ) { setActive(list[0]); return; }
        if ( step === 'LAST' ) { setActive(list[list.length - 1]); return; }
        setActive(list[current === -1 ? 0 : Math.min(list.length - 1,Math.max(0,current + step))]);
    }

    // Positions the popover under (or above) the trigger, within the viewport, with the trigger's width;
    // closes the list when the trigger has scrolled out of view.
    function positionPopup()
    {
        const popupStyle = elements.popup.style;
        popupStyle.removeProperty('--ui-select-popup-max-height');   // measure the natural height, not the last constrained one
        const rect = elements.trigger.getBoundingClientRect();
        if ( rect.bottom < 0 || rect.top > window.innerHeight ) { closeList(false); return; }   // trigger scrolled out of view
        const below = window.innerHeight - rect.bottom - POPUP_GAP * 2, above = rect.top - POPUP_GAP * 2;
        const wanted = Math.min(elements.popup.scrollHeight,parseFloat(getComputedStyle(elements.popup).getPropertyValue('--ui-select-popup-limit')) || 320);
        const placeAbove = below < wanted && above > below;
        const maxHeight = Math.max(0,Math.min(wanted,placeAbove ? above : below));
        popupStyle.setProperty('--ui-select-popup-left',`${rect.left}px`);
        popupStyle.setProperty('--ui-select-popup-width',`${rect.width}px`);
        popupStyle.setProperty('--ui-select-popup-max-height',`${maxHeight}px`);
        popupStyle.setProperty('--ui-select-popup-top',`${placeAbove ? rect.top - POPUP_GAP - maxHeight : rect.bottom + POPUP_GAP}px`);
    }

    // Shows or hides options and groups for the search text; announces "no matches" once.
    function applyFilter()
    {
        const text = fold(elements.search?.value.trim() ?? '');
        options.forEach(element => { const data = optionData(element); element.hidden = Boolean(text) && ( !data || !fold(data.label).includes(text) ); });
        elements.listbox.querySelectorAll('.ui-select-group').forEach(group => { group.hidden = !group.querySelector('.ui-select-option:not([hidden])'); });
        const empty = navigable().length === 0 && options.every(element => element.hidden);
        elements.noMatches.hidden = !empty;
        elements.announcer.textContent = empty ? merged.texts.noMatches : '';
        moveActive('FIRST');
    }

    // Opens the list: shows the popover, positions it and activates the selected (or first) option.
    function openList()
    {
        if ( state.open || elements.trigger.disabled ) { return; }
        state.open = true;
        elements.trigger.setAttribute('aria-expanded','true');
        if ( typeof elements.popup.showPopover === 'function' ) { elements.popup.showPopover(); } else { elements.popup.classList.add('ui-select-popup-open'); }
        if ( elements.search ) { elements.search.value = ''; applyFilter(); }
        positionPopup();
        const selected = navigable().find(element => element.getAttribute('aria-selected') === 'true');
        setActive(selected ?? navigable()[0] ?? null);
        openController = registerOpenListEvents(wrapper,{ onOutsidePress:() => closeList(false), onReposition:positionPopup });
        ( elements.search ?? elements.trigger ).focus();
    }

    // Closes the list; optionally returns focus to the trigger.
    function closeList( returnFocus )
    {
        if ( !state.open ) { return; }
        state.open = false;
        openController?.abort();
        elements.trigger.setAttribute('aria-expanded','false');
        if ( typeof elements.popup.hidePopover === 'function' ) { elements.popup.hidePopover(); } else { elements.popup.classList.remove('ui-select-popup-open'); }
        setActive(null);
        if ( elements.search ) { elements.search.value = ''; options.forEach(element => { element.hidden = false; }); elements.listbox.querySelectorAll('.ui-select-group').forEach(group => { group.hidden = false; }); elements.noMatches.hidden = true; }
        if ( returnFocus ) { elements.trigger.focus(); }
    }

    // Selects (SINGLE) or toggles (MULTIPLE) an option; the clear entry empties the selection.
    function chooseOption( element )
    {
        if ( !element || element.getAttribute('aria-disabled') === 'true' ) { return; }
        const data = optionData(element);
        if ( merged.selectionMode === 'SINGLE' ) { commit(data ? [ data.value ] : [],true); closeList(true); return; }
        commit(state.values.includes(data.value) ? state.values.filter(value => value !== data.value) : [ ...state.values, data.value ],true);
        setActive(element);
    }

    // Jumps to the next option whose label starts with the typed characters (non-searchable lists).
    function typeahead( character )
    {
        clearTimeout(state.typeaheadTimer);
        state.typeahead += fold(character);
        state.typeaheadTimer = setTimeout(() => { state.typeahead = ''; },500);
        const list = navigable().filter(element => optionData(element));
        const start = Math.max(0,list.indexOf(options[state.activeIndex]));
        const ordered = [ ...list.slice(start + ( state.typeahead.length === 1 ? 1 : 0 )), ...list.slice(0,start + 1) ];
        const match = ordered.find(element => fold(optionData(element).label).startsWith(state.typeahead));
        if ( match ) { setActive(match); }
    }

    // Keyboard handling for the trigger (closed or open) and the search field.
    function handleKeyDown( event, source )
    {
        const key = event.key, printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
        if ( !state.open )
        {
            if ( [ 'ArrowDown', 'ArrowUp', 'Enter', ' ' ].includes(key) ) { event.preventDefault(); openList(); return; }
            if ( printable ) { event.preventDefault(); openList(); if ( elements.search ) { elements.search.value = key; applyFilter(); } else { typeahead(key); } }
            return;
        }
        if ( key === 'ArrowDown' ) { event.preventDefault(); moveActive(1); }
        else if ( key === 'ArrowUp' ) { event.preventDefault(); moveActive(-1); }
        else if ( ( key === 'Home' || key === 'End' ) && source === 'TRIGGER' ) { event.preventDefault(); moveActive(key === 'Home' ? 'FIRST' : 'LAST'); }
        else if ( key === 'Enter' || ( key === ' ' && source === 'TRIGGER' ) ) { event.preventDefault(); chooseOption(options[state.activeIndex]); }
        else if ( key === 'Escape' ) { event.preventDefault(); closeList(true); }
        else if ( key === 'Tab' ) { closeList(false); }
        else if ( printable && source === 'TRIGGER' ) { event.preventDefault(); typeahead(key); }
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
        // Returns a new array with the selected values, in option order.
        getValue:() => [ ...state.values ],
        // Returns a copy of the current error, or null.
        getError:() => state.error ? { ...state.error } : null,
        // Sets the selection programmatically (unknown values ignored); not dirty, no onValueChange; returns { valid, errorLabel }.
        // options.quiet (Form's quiet reset): sets the value without validating, clears any shown error and the changed state.
        setValue:( values, options = {} ) =>
        {
            const list = ( Array.isArray(values) ? values : [ values ] ).filter(value => value !== undefined && value !== null && value !== '').map(String);
            const unknown = list.filter(value => !merged.options.some(option => option.value === value));
            if ( unknown.length ) { reportSelectIssue('UNKNOWN_VALUE',{ id:merged.id, value:JSON.stringify(unknown) }); }
            const known = list.filter(value => !unknown.includes(value));
            commit(merged.selectionMode === 'SINGLE' ? known.slice(0,1) : known,false);
            const view = container.querySelector('.ui-select-view-value');
            if ( view ) { view.textContent = merged.options.filter(option => state.values.includes(option.value)).map(option => option.label).join(', '); }
            if ( options?.quiet ) { state.external = null; state.isDirty = false; state.error = null; renderError(); return { ...validateSelection(merged,state.values) }; }
            return runValidation('final');
        },
        // Runs final validation and returns { valid, errorLabel }.
        validate:() => runValidation('final'),
        // Returns whether the user has changed the selection.
        isDirty:() => state.isDirty,
        // Moves focus to the select or combobox; returns whether it received focus.
        focus:() => { control?.focus(); return Boolean(control) && document.activeElement === control; },
        // Closes the list and removes listeners, observers and timers, then clears the container.
        destroy:() => { if ( custom ) { closeList(false); } clearTimeout(state.typeaheadTimer); controller?.abort(); openController?.abort(); resizeObserver?.disconnect(); container.innerHTML = ''; }
    };

    if ( control && merged.state === 'EDIT' && !custom )
    {
        controller = registerNativeSelectEvents(control,{ onChange:() => commit([ ...control.selectedOptions ].map(option => option.value).filter(Boolean),true), onBlur:() => { if ( state.isDirty ) { runValidation('blur'); } } });
    }
    if ( custom )
    {
        syncCustom();
        if ( merged.state === 'EDIT' )
        {
            controller = registerCustomSelectEvents(elements,
            {
                onTriggerClick:() => ( state.open ? closeList(true) : openList() ),
                onKeyDown:handleKeyDown,
                onSearchInput:applyFilter,
                onOptionClick:chooseOption,
                onOptionHover:element => { if ( element.getAttribute('aria-disabled') !== 'true' ) { setActive(element); } },
                onLeave:() => { closeList(false); if ( state.isDirty ) { runValidation('blur'); } }
            });
        }
        let lastWidth = 0;
        if ( typeof ResizeObserver === 'function' ) { resizeObserver = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if ( width !== lastWidth ) { lastWidth = width; syncCustom(); } }); resizeObserver.observe(elements.trigger); }
    }
    if ( control && merged.state === 'EDIT' && merged.autoFocus ) { control.focus(); }
    return instance;
}
