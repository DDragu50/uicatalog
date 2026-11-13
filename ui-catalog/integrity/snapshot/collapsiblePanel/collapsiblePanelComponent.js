// collapsiblePanelComponent.js
//
// COMPONENT COORDINATOR.
// Owns lifecycle and runtime state; composes Chip and Button through their public APIs.
// The container is a dedicated, consumer-owned mount point.

import { mergeCollapsiblePanelConfig, validateCollapsiblePanelConfig, toEnumValue, COLLAPSIBLE_PANEL_STATUSES } from './collapsiblePanelConfig.js';
import { createPanelState } from './collapsiblePanelState.js';
import { buildPanelHTML, buildSummaryHTML } from './collapsiblePanelHTML.js';
import { registerCollapsiblePanelEvents } from './collapsiblePanelEvents.js';
import { reportCollapsiblePanelIssue } from './collapsiblePanelErrors.js';
import { renderChips } from '../chip/chipIndex.js';
import { renderButton } from '../button/buttonIndex.js';

// Renders ordered children (static HTML strings or render functions) into item hosts; returns the child instances.
function renderChildren( content, children, owner, id )
{
    const list = Array.isArray(children) ? children : ( children === undefined || children === null ? [] : [ children ] );
    return list.map(( child, index ) =>
    {
        if ( typeof child !== 'string' && typeof child !== 'function' ) { reportCollapsiblePanelIssue('INVALID_CHILD',{ id, index }); return null; }
        const host = document.createElement('div');
        host.className = 'ui-collapsible-panel-item';
        content.appendChild(host);
        if ( typeof child === 'string' ) { host.innerHTML = child; return null; }
        return child(host,owner) ?? null;
    }).filter(Boolean);
}

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// Renders one CollapsiblePanel and returns its runtime API, or null after a developer error.
export function renderCollapsiblePanel( container, config = {}, children = [] )
{
    if ( !container ) { reportCollapsiblePanelIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeCollapsiblePanelConfig(config);
    if ( validateCollapsiblePanelConfig(merged) ) { return null; }

    const panel = createPanelState(merged);
    let root = null, controller = null, chipInstance = null, buttonInstances = [], childInstances = [];

    const instance =
    {
        id:merged.id,
        // Returns the content child instances (lazy content: empty until first expanded); e.g. for Form field discovery.
        getChildren:() => [ ...childInstances ],
        // Returns the current expanded/collapsed state.
        getState:() => panel.state,
        // Returns the current semantic status.
        getStatus:() => panel.status,
        // Expands the panel.
        expand:() => applyState('EXPANDED',false),
        // Collapses the panel when it is collapsible.
        collapse:() => applyState('COLLAPSED',false),
        // Toggles the panel when it is collapsible.
        toggle:() => applyState(panel.state === 'EXPANDED' ? 'COLLAPSED' : 'EXPANDED',false),
        // Moves keyboard focus to the header toggle; false when the panel is not collapsible (no toggle) or it is disabled.
        focus:() => { const toggle = root?.querySelector('.ui-collapsible-panel-toggle'); if ( !toggle || toggle.disabled ) { return false; } toggle.focus(); return document.activeElement === toggle; },
        // Rebuilds consumer-owned summary markup.
        refreshSummary:() => drawSummary(),
        // Changes the semantic status; returns false for an invalid status.
        setStatus:( status ) => applyStatus(status),
        // Enables or disables a header action Button; returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            const index = merged.actions.findIndex(action => action.key === String(key));
            if ( index < 0 ) { reportCollapsiblePanelIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            buttonInstances[index]?.setDisabled(Boolean(disabled) || !merged.onAction);
            return true;
        },
        // Removes listeners, header components and content children, then clears the container.
        destroy:() => { controller?.abort(); chipInstance?.destroy(); buttonInstances.forEach(button => button.destroy()); childInstances.forEach(child => child?.destroy?.()); container.innerHTML = ''; }
    };

    // Draws the current summary; an empty summary (no markup or only spaces) is hidden so no empty strip remains.
    function drawSummary()
    {
        const summary = root.querySelector('.ui-collapsible-panel-summary');
        const markup = buildSummaryHTML(merged,instance);
        summary.innerHTML = markup;
        summary.hidden = !markup.trim();
    }

    // Renders the content children once: at render time, or on the first expansion when lazyContent is true.
    function drawContent()
    {
        if ( panel.contentDrawn ) { return; }
        childInstances = renderChildren(root.querySelector('.ui-collapsible-panel-content'),children,instance,merged.id);
        panel.contentDrawn = true;
    }

    // Applies an allowed state transition and synchronizes the rendered state.
    function applyState( nextState, userInitiated )
    {
        if ( !merged.collapsible || panel.state === nextState || ( userInitiated && merged.disabled ) ) { return false; }
        if ( nextState === 'EXPANDED' ) { drawContent(); }
        panel.state = nextState;
        root.dataset.state = nextState;
        root.querySelector('.ui-collapsible-panel-toggle')?.setAttribute('aria-expanded',String(nextState === 'EXPANDED'));
        drawSummary();
        if ( userInitiated && merged.onToggle ) { merged.onToggle(nextState,instance); }
        return true;
    }

    // Applies a semantic status (case-insensitive) and synchronizes the rendered styling.
    function applyStatus( status )
    {
        const next = toEnumValue(status,COLLAPSIBLE_PANEL_STATUSES);
        if ( !next ) { reportCollapsiblePanelIssue('INVALID_STATUS',{ id:merged.id, value:status }); return false; }
        panel.status = next;
        root.dataset.status = next;
        return true;
    }

    const renderNow = panel.contentDrawn;
    panel.contentDrawn = false;
    container.innerHTML = buildPanelHTML(merged);
    root = container.querySelector('.ui-collapsible-panel');
    const chipsHost = root.querySelector('.ui-collapsible-panel-chips');
    chipInstance = chipsHost ? renderChips(chipsHost,merged.chips) : null;
    // header actions (guidelines §10.2): pressing one reports onAction and never opens or closes the panel
    buttonInstances = merged.actions.map(( action, index ) => renderButton(root.querySelector(`.ui-collapsible-panel-action[data-action="${CSS.escape(action.key)}"]`),buildActionButtonConfig(`${merged.id}-action-${index}`,action,'TERTIARY',action.disabled || !merged.onAction,merged.iconTooltip),() => merged.onAction?.(action.key,instance)));
    if ( renderNow ) { drawContent(); }
    drawSummary();
    controller = registerCollapsiblePanelEvents(root.querySelector('.ui-collapsible-panel-toggle'),() => applyState(panel.state === 'EXPANDED' ? 'COLLAPSED' : 'EXPANDED',true));
    return instance;
}
