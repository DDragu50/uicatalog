// searchBoxComponent.js
//
// COMPONENT COORDINATOR.
// Owns the search lifecycle: effective query, debounce, reporting, clear, scope and busy state.
// Composes Button (Clear, Search) and CheckboxRadio (scopes) as declared dependencies.
// The container is a dedicated, consumer-owned mount point.

import { mergeSearchBoxConfig, validateSearchBoxConfig, resolveScope } from './searchBoxConfig.js';
import { createSearchBoxState } from './searchBoxState.js';
import { buildSearchBoxHTML } from './searchBoxHTML.js';
import { registerSearchBoxEvents } from './searchBoxEvents.js';
import { reportSearchBoxIssue } from './searchBoxErrors.js';
import { renderMessage } from '../message/messageIndex.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderCheckboxRadio } from '../checkboxRadio/checkboxRadioIndex.js';

// Renders a SearchBox and returns its runtime instance, or null after a developer error.
export function renderSearchBox( container, config, onSearch )
{
    if ( !container ) { reportSearchBoxIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeSearchBoxConfig(config);
    if ( validateSearchBoxConfig(merged) ) { return null; }

    container.innerHTML = buildSearchBoxHTML(merged);
    const root = container.querySelector('.ui-search-box');
    const input = root.querySelector('.ui-search-box-input');
    const busyIcon = root.querySelector('.ui-search-box-busy-icon');
    const help = root.querySelector('.ui-search-box-help');
    const clearHost = root.querySelector('.ui-search-box-clear-host');
    const state = createSearchBoxState(merged);
    const callback = merged.onSearch ?? ( typeof onSearch === 'function' ? onSearch : null );
    let controller = null, clearButton = null, searchButton = null, scopeList = null, instance = null;
    let searchMessage = null;

    // Returns the effective search: trimmed query ('' below minLength) and the selected scope(s).
    function currentSearch()
    {
        const text = input.value.trim();
        return { query:text.length >= merged.minLength ? text : '', scopes:state.scope ? [ state.scope ] : [] };
    }

    // Reports the effective search when it differs from the last reported one.
    function report()
    {
        clearTimer();
        const next = currentSearch();
        if ( next.query === state.reported.query && next.scopes.join('\u0000') === state.reported.scopes.join('\u0000') ) { return; }
        state.reported = next;
        if ( callback ) { callback({ query:next.query, scopes:[ ...next.scopes ] },instance); }
    }

    // Cancels a pending debounced report.
    function clearTimer() { if ( state.timer ) { clearTimeout(state.timer); state.timer = null; } }

    // Updates the clear button visibility and the help line (min-length hint, scope description or help).
    function syncView()
    {
        clearHost.hidden = input.value === '';
        const length = input.value.trim().length;
        const scope = merged.scopes.find(item => item.value === state.scope);
        help.textContent = length > 0 && length < merged.minLength ? merged.texts.minLength.replace('{minLength}',String(merged.minLength)) : ( scope?.description || merged.help );
        help.hidden = help.textContent === '';
    }

    // Handles a user edit of the text.
    function handleInput()
    {
        syncView();
        if ( merged.onInput ) { merged.onInput(input.value,instance); }
        if ( merged.searchMode !== 'LIVE' ) { return; }
        clearTimer();
        state.timer = setTimeout(report,merged.debounceMs);
    }

    // Clears the text, keeps focus in the field and reports the empty search (user action).
    function clearByUser()
    {
        input.value = '';
        syncView();
        input.focus();
        if ( merged.onInput ) { merged.onInput('',instance); }
        report();
    }

    // Renders the scope list (single choice, chip look) and sets the scope when the user changes it.
    function renderScopes()
    {
        const host = root.querySelector('.ui-search-box-scopes-host');
        if ( !host ) { return; }
        scopeList?.destroy();
        scopeList = renderCheckboxRadio(host,
        {
            id:`${merged.id}-scope`,
            groupLabel:merged.texts.scopeLabel,
            selectionMode:'SINGLE',
            presentation:'CHIP',
            direction:'HORIZONTAL',
            disabled:merged.disabled,
            options:merged.scopes.map(scope => ({ value:scope.value, label:scope.label, selected:scope.value === state.scope }))
        },( values ) =>
        {
            state.scope = values[0] ?? state.scope;
            syncView();
            if ( currentSearch().query ) { report(); } else { state.reported = currentSearch(); }
        });
    }

    // Renders the Clear icon Button and the optional Search Button through the Button public API.
    function renderButtons()
    {
        clearButton = renderButton(clearHost,{ id:`${merged.id}-clear`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:'fa-solid fa-xmark', ariaLabel:merged.texts.clear, disabled:merged.disabled, tooltipMode:merged.iconTooltip },clearByUser);
        const buttonHost = root.querySelector('.ui-search-box-button-host');
        const look = merged.searchButtonVariant === 'ICON_BUTTON'
            ? { buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-magnifying-glass', ariaLabel:merged.texts.search, tooltipMode:merged.iconTooltip }
            : { label:merged.texts.search, ...( merged.searchButtonIcon ? { iconBefore:'fa-solid fa-magnifying-glass' } : {} ) };
        if ( buttonHost ) { searchButton = renderButton(buttonHost,{ id:`${merged.id}-submit`, ...look, hierarchy:merged.searchButtonHierarchy, disabled:merged.disabled },() => report()); }
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
        getMandatoryState:() => ({ mandatory:false, indicator:'NONE' }),
        // SearchBox has no validation rules; it is always valid (form-field contract).
        validate:() => ({ valid:true, errorLabel:null }),
        // SearchBox never has an error (form-field contract).
        getError:() => null,
        // Returns the current effective search { query, scopes } (what a search now would report).
        getValue:() => { const value = currentSearch(); return { query:value.query, scopes:[ ...value.scopes ] }; },
        // Sets text and/or scope programmatically (e.g. restored from the URL); fires no callback.
        // options (e.g. Form's quiet reset) are accepted for the form-field contract; SearchBox never shows errors.
        setValue:( value = {}, options = {} ) =>
        {
            clearTimer();
            if ( value.query !== undefined ) { input.value = String(value.query ?? ''); }
            if ( value.scopes !== undefined && merged.scopes.length ) { state.scope = resolveScope(merged,Array.isArray(value.scopes) ? value.scopes[0] : value.scopes); renderScopes(); }
            syncView();
            state.reported = currentSearch();
        },
        // Clears the text programmatically; fires no callback.
        clear:() => { clearTimer(); input.value = ''; syncView(); state.reported = currentSearch(); },
        // Moves focus to the search input; returns whether it received focus.
        focus:() => { input.focus(); return document.activeElement === input; },
        // Shows or hides the busy indicator while the page is searching.
        setBusy:( busy ) =>
        {
            state.busy = Boolean(busy);
            root.classList.toggle('ui-search-box-busy',state.busy);
            root.setAttribute('aria-busy',String(state.busy));
            busyIcon.hidden = !state.busy;
        },
        // Removes listeners, timers and child components, then clears the container.
        // Shows a Message under the field (INLINE; e.g. "No results for …", "Search failed"): a string (INFO) or a
        // Message configuration { type, text, … }; null removes it. Announced when it appears or changes.
        setMessage:( message ) =>
        {
            const host = container.querySelector('.ui-search-box-message-host');
            searchMessage?.destroy(); searchMessage = null;
            const config = typeof message === 'string' ? { text:message } : message;
            if ( !config || !String(config.text ?? '').trim() ) { return; }
            const { id, layout, ...content } = config;
            searchMessage = renderMessage(host,{ type:'INFO', ...content, id:`${merged.id}-message`, layout:'INLINE', visible:false });
            searchMessage?.show();
        },
        destroy:() => { searchMessage?.destroy(); clearTimer(); controller?.abort(); clearButton?.destroy(); searchButton?.destroy(); scopeList?.destroy(); container.innerHTML = ''; }
    };

    renderButtons();
    renderScopes();
    syncView();
    controller = registerSearchBoxEvents(input,
    {
        onInput:handleInput,
        onEnter:() => report(),
        onEscape:clearByUser
    });
    return instance;
}
