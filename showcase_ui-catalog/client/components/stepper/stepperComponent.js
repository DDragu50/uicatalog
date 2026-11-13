// stepperComponent.js
//
// COMPONENT COORDINATOR.
// Shows a task as ordered steps and moves the user through them: the current step, each step's status, which steps
// are open (LINEAR rules, FREE, or none when the steps only inform), the content panel of each step (showContent) and
// the button bar (Back, application actions, Skip, Next, Finish; Buttons created through their public entry point).
// Before Next and Finish it asks the application (canLeave), which may answer later (a Promise; the Stepper is busy
// meanwhile, with a Loader line above the button bar). The container is a dedicated, consumer-owned mount point.

import { mergeStepperConfig, validateStepperConfig, normalizeStatus } from './stepperConfig.js';
import { buildStepperHTML, buildMarkerHTML, fillText } from './stepperHTML.js';
import { createStepperState } from './stepperState.js';
import { registerStepperEvents } from './stepperEvents.js';
import { reportStepperIssue } from './stepperErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderLoader } from '../loader/loaderIndex.js';

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// Renders a step's content (static HTML strings or functions (host, stepper) => instance | null) into its panel, one
// host per child; returns the instances.
function renderChildren( panel, content, owner, id, stepId )
{
    return content.map(( child, index ) =>
    {
        if ( typeof child !== 'string' && typeof child !== 'function' ) { reportStepperIssue('INVALID_CHILD',{ id, index, value:stepId }); return null; }
        const host = document.createElement('div');
        host.className = 'ui-stepper-item';
        panel.appendChild(host);
        if ( typeof child === 'string' ) { host.innerHTML = child; return null; }
        return child(host,owner) ?? null;
    }).filter(Boolean);
}

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

// Renders a Stepper and returns its runtime instance, or null after a developer error.
export function renderStepper( container, config )
{
    if ( !container ) { reportStepperIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeStepperConfig(config);
    if ( validateStepperConfig(merged) ) { return null; }

    container.innerHTML = buildStepperHTML(merged);
    const root = container.querySelector('.ui-stepper');
    const list = root.querySelector('.ui-stepper-list');
    const live = root.querySelector('.ui-stepper-live');
    const state = createStepperState(merged);
    const interactive = merged.navigation !== 'NONE';
    const entries = merged.steps.map(step =>
    {
        const li = list.querySelector(`.ui-stepper-step[data-index="${step.index}"]`);
        return { step, li, trigger:li.querySelector('.ui-stepper-trigger'), marker:li.querySelector('.ui-stepper-marker'), status:li.querySelector('.ui-stepper-status'),
            panel:root.querySelector(`.ui-stepper-panel[data-index="${step.index}"]`), children:[] };
    });
    const buttons = {}, actionButtons = [], actionDisabled = merged.actions.map(action => action.disabled);
    let controller = null, instance = null, destroyed = false, loader = null;

    const entryOf = id => entries[state.indexOf(id)] ?? null;
    const allowed = status => merged.statuses.includes(status);
    const shownStatus = id => ( allowed(state.status.get(id)) ? state.status.get(id) : 'NOT_STARTED' );

    // Returns the step button that takes Tab: the current step's, else the first enabled one.
    function tabTarget()
    {
        if ( !interactive ) { return null; }
        const current = entryOf(state.current);
        return current && !current.trigger.disabled ? current.trigger : entries.find(entry => !entry.trigger.disabled)?.trigger ?? null;
    }

    // Writes every step's look and attributes, the compact bar and the button bar from the state.
    function refresh()
    {
        const count = entries.length;
        entries.forEach(entry =>
        {
            const { step, li, trigger } = entry;
            const status = shownStatus(step.id), current = step.id === state.current, disabled = state.isDisabled(step.id);
            const available = interactive && state.isAvailable(step);
            const waiting = state.waitingFor(step);
            li.dataset.status = status;
            li.classList.toggle('ui-stepper-current',current);
            li.classList.toggle('ui-stepper-complete',state.isComplete(step.id));
            li.classList.toggle('ui-stepper-disabled',disabled);
            li.classList.toggle('ui-stepper-locked',waiting.length > 0);
            if ( current ) { trigger.setAttribute('aria-current','step'); } else { trigger.removeAttribute('aria-current'); }
            if ( interactive ) { trigger.disabled = !available; trigger.tabIndex = -1; }
            entry.marker.innerHTML = buildMarkerHTML(merged,step,status);
            entry.status.textContent = [ status !== 'NOT_STARTED' ? merged.texts.statuses[status] : '', waiting.length ? fillText(merged.texts.availableAfter,{ steps:waiting.map(item => item.label).join(', ') }) : '' ].filter(Boolean).join('. ');
            if ( entry.panel ) { entry.panel.hidden = !current; }
        });
        const target = tabTarget();
        if ( target ) { target.tabIndex = 0; }
        const position = state.indexOf(state.current);
        const compactText = root.querySelector('.ui-stepper-compact-text');
        if ( compactText )
        {
            compactText.textContent = position < 0 ? fillText(merged.texts.stepOf,{ index:0, count }) : fillText(merged.texts.announcement,{ index:position + 1, count, label:entries[position].step.label });
            const done = entries.filter(entry => state.isComplete(entry.step.id)).length;
            root.style.setProperty('--ui-stepper-progress',String(count ? done / count : 0));
        }
        root.classList.toggle('ui-stepper-busy',state.busy);
        if ( state.busy ) { root.setAttribute('aria-busy','true'); } else { root.removeAttribute('aria-busy'); }
        refreshButtons();
    }

    // Updates the button bar: Back, Skip (optional steps), Next or Finish (the last enabled step), the actions.
    function refreshButtons()
    {
        if ( !merged.showButtons ) { return; }
        const current = state.find(state.current);
        const last = Boolean(current) && state.lastEnabled()?.id === current.id;
        const host = name => root.querySelector(`.ui-stepper-buttons [data-button="${name}"]`);
        host('next').hidden = last; host('finish').hidden = !last;
        host('skip').hidden = !current || !current.optional || last;
        buttons.back?.setDisabled(!current || !state.backTarget());
        buttons.next?.setDisabled(!current);
        buttons.skip?.setDisabled(!current);
        const finishBlocked = !current || !state.canFinish();
        buttons.finish?.setDisabled(finishBlocked);
        buttons.finish?.setDescription(current && finishBlocked ? merged.texts.finishBlocked : '');
        actionButtons.forEach(( button, index ) =>
        {
            button.setDisabled(actionDisabled[index] || !merged.onAction || !current);
            button.setDescription(current?.label ?? '');
        });
    }

    // Sets a status; user = true reports it (onStatusChange). Statuses that do not complete a step undo "passed".
    function setStatus( id, status, user )
    {
        if ( state.status.get(id) === status ) { return false; }
        state.status.set(id,status);
        if ( status !== 'DONE' && status !== 'SKIPPED' ) { state.passed.delete(id); }
        if ( user ) { merged.onStatusChange?.(id,status,instance); }
        return true;
    }

    // Marks the current step as passed by the user (Next, Finish: DONE; Skip: SKIPPED) and sets that status (autoStatus).
    function pass( status )
    {
        const id = state.current;
        if ( merged.autoStatus && allowed(status) ) { setStatus(id,status,true); }
        state.passed.add(id);
    }

    // Moves focus after a user move: into the content panel, back to the step, or to the bar's forward Button.
    function focusAfterMove( origin )
    {
        const entry = entryOf(state.current);
        if ( merged.showContent && entry?.panel ) { entry.panel.focus(); return; }
        if ( origin === 'STEP' ) { entry?.trigger.focus(); return; }
        const active = document.activeElement;
        if ( !root.contains(active) || active.disabled || active.closest('[hidden]') )
        {
            const forward = [ 'next', 'finish' ].map(name => buttons[name]?.getElement()).find(element => element && !element.disabled && !element.closest('[hidden]'));
            ( forward ?? tabTarget() )?.focus();
        }
    }

    // Opens a step after a user action, reports it and announces it.
    function moveTo( id, reason, origin )
    {
        const previousId = state.current;
        state.current = id;
        if ( merged.autoStatus && state.status.get(id) === 'NOT_STARTED' && allowed('IN_PROGRESS') ) { setStatus(id,'IN_PROGRESS',true); }
        refresh();
        const position = state.indexOf(id);
        if ( live ) { live.textContent = fillText(merged.texts.announcement,{ index:position + 1, count:entries.length, label:entries[position].step.label }); }
        focusAfterMove(origin);
        merged.onStepChange?.(id,{ previousId, reason },instance);
    }

    // Asks the application whether the current step may be left (action NEXT or FINISH), then runs proceed. A Promise
    // makes the Stepper busy until it settles; false (or a rejected Promise) keeps the step open.
    function guard( action, proceed )
    {
        if ( !merged.canLeave ) { proceed(); return; }
        const stepId = state.current;
        let result;
        try { result = merged.canLeave(stepId,action,instance); }
        catch ( error ) { reportStepperIssue('CAN_LEAVE_FAILED',{ id:merged.id, value:stepId, reason:error.message }); return; }
        if ( !result || typeof result.then !== 'function' ) { if ( result !== false ) { proceed(); } return; }
        state.busy = true; refresh(); loader?.start();
        Promise.resolve(result).then(answer =>
        {
            if ( destroyed ) { return; }
            state.busy = false; loader?.hide();
            if ( answer !== false && state.current === stepId ) { proceed(); } else { refresh(); }
        },error =>
        {
            if ( destroyed ) { return; }
            state.busy = false; loader?.hide(); refresh();
            reportStepperIssue('CAN_LEAVE_FAILED',{ id:merged.id, value:stepId, reason:error?.message ?? String(error) });
        });
    }

    // Continues after the current step was passed: opens the next open step, or only refreshes when there is none.
    function goForward( reason )
    {
        const target = state.nextTarget();
        if ( target ) { moveTo(target.id,reason,'BUTTON'); } else { refresh(); focusAfterMove('BUTTON'); }
    }

    // User actions (ignored while busy).
    const userActions =
    {
        select:( index ) => { const step = entries[index]?.step; if ( state.busy || !step || step.id === state.current || !state.isAvailable(step) ) { return; } moveTo(step.id,'SELECT','STEP'); },
        next:() => { if ( state.busy || !state.current ) { return; } guard('NEXT',() => { pass('DONE'); goForward('NEXT'); }); },
        back:() => { const target = state.busy ? null : state.backTarget(); if ( target ) { moveTo(target.id,'BACK','BUTTON'); } },
        skip:() => { const current = state.find(state.current); if ( state.busy || !current?.optional ) { return; } pass('SKIPPED'); goForward('SKIP'); },
        finish:() =>
        {
            if ( state.busy || !state.current || !state.canFinish() ) { return; }
            guard('FINISH',() => { pass('DONE'); refresh(); merged.onFinish?.(instance); });
        }
    };

    // Moves focus between enabled step buttons (arrow keys follow the orientation and the text direction).
    function moveFocus( index, key )
    {
        const horizontal = merged.orientation === 'HORIZONTAL';
        const rtl = getComputedStyle(root).direction === 'rtl';
        const forwardKey = horizontal ? ( rtl ? 'ArrowLeft' : 'ArrowRight' ) : 'ArrowDown';
        const backwardKey = horizontal ? ( rtl ? 'ArrowRight' : 'ArrowLeft' ) : 'ArrowUp';
        if ( ![ forwardKey, backwardKey, 'Home', 'End' ].includes(key) ) { return false; }
        const enabled = entries.filter(entry => !entry.trigger.disabled);
        const position = enabled.findIndex(entry => entry.step.index === index);
        if ( !enabled.length ) { return false; }
        const target = key === 'Home' ? enabled[0] : key === 'End' ? enabled[enabled.length - 1]
            : enabled[( position + ( key === forwardKey ? 1 : -1 ) + enabled.length ) % enabled.length];
        entries.forEach(entry => { entry.trigger.tabIndex = -1; });
        target.trigger.tabIndex = 0;
        target.trigger.focus();
        return true;
    }

    // Finds a step by id; reports unknown ids.
    function find( id )
    {
        const step = state.find(id);
        if ( !step ) { reportStepperIssue('UNKNOWN_STEP',{ id:merged.id, value:id }); }
        return step;
    }

    instance =
    {
        id:merged.id,
        // Returns the id of the current step, or null.
        getCurrent:() => state.current,
        // Opens a step (programmatic: no canLeave, no automatic status, no callbacks); false when unknown or disabled.
        goTo:( id ) =>
        {
            const step = find(id);
            if ( !step || state.isDisabled(step.id) ) { return false; }
            state.current = step.id; refresh();
            return true;
        },
        // Returns a copy of every step's state, in display order.
        getSteps:() => entries.map(( { step } ) => ( { id:step.id, label:step.label, status:state.status.get(step.id), optional:step.optional, disabled:state.isDisabled(step.id),
            available:interactive && state.isAvailable(step), complete:state.isComplete(step.id), current:step.id === state.current } )),
        // Returns a step's status, or null when unknown.
        getStepStatus:( id ) => ( find(id) ? state.status.get(String(id)) : null ),
        // Sets a step's status (one of statuses; no callback); returns whether it changed.
        setStepStatus:( id, status ) =>
        {
            const step = find(id);
            if ( !step ) { return false; }
            const value = String(status ?? '').trim().toUpperCase().replace(/-/g,'_');
            if ( !allowed(value) ) { reportStepperIssue('INVALID_STATUS',{ id:merged.id, value:status, step:step.id, result:'the status is not changed' }); return false; }
            const changed = setStatus(step.id,normalizeStatus(merged.id,step.id,value,merged.statuses),false);
            refresh();
            return changed;
        },
        // Enables or disables a step; returns whether it changed (a disabled current step stays open until the user moves).
        setStepDisabled:( id, disabled ) =>
        {
            const step = find(id);
            if ( !step || state.isDisabled(step.id) === Boolean(disabled) ) { return false; }
            state.disabled.set(step.id,Boolean(disabled)); refresh();
            return true;
        },
        // Enables or disables an application action; returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            const index = merged.actions.findIndex(action => action.key === key);
            if ( index < 0 ) { reportStepperIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            actionDisabled[index] = Boolean(disabled); refreshButtons();
            return true;
        },
        // Returns the instances rendered in the content panels, in step order (a Form finds fields through them).
        getChildren:() => entries.flatMap(entry => entry.children),
        // Moves focus to the step button that takes Tab; returns whether it succeeded.
        focus:() => { const target = tabTarget(); target?.focus(); return Boolean(target) && document.activeElement === target; },
        // Removes the listeners, Buttons and content, then clears the container.
        destroy:() =>
        {
            removeHintTooltip();
            destroyed = true; controller?.abort(); loader?.destroy();
            Object.values(buttons).forEach(button => button?.destroy()); actionButtons.splice(0).forEach(button => button.destroy());
            entries.forEach(entry => { entry.children.forEach(child => child?.destroy?.()); entry.children = []; });
            container.innerHTML = '';
        }
    };

    // Start: the current step (given, else the first open one), its automatic status, the content and the Buttons.
    state.current = merged.current || state.firstOpen();
    if ( interactive && merged.autoStatus && state.current && state.status.get(state.current) === 'NOT_STARTED' && allowed('IN_PROGRESS') ) { state.status.set(state.current,'IN_PROGRESS'); }
    entries.forEach(entry => { if ( entry.panel ) { entry.children = renderChildren(entry.panel,entry.step.content,instance,merged.id,entry.step.id); } });
    if ( merged.showButtons )
    {
        const host = name => root.querySelector(`.ui-stepper-buttons [data-button="${name}"]`);
        // The bar ends a page-level task, like Form's buttons: MEDIUM, not the SMALL of buttons inside components.
        const add = ( name, hierarchy ) => { buttons[name] = renderButton(host(name),{ id:`${merged.id}-${name}`, label:merged.texts[name], hierarchy, size:'MEDIUM' },() => userActions[name]()); };
        add('back','SECONDARY'); add('skip','TERTIARY'); add('next','PRIMARY'); add('finish','PRIMARY');
        // A line above the bar while canLeave answers (shown after the Loader's delay; the label is for screen readers).
        if ( merged.canLeave ) { loader = renderLoader(root.querySelector('.ui-stepper-loader-host'),{ id:`${merged.id}-loader`, size:'SMALL', labelPlacement:'HIDDEN', label:merged.texts.checking }); }
        root.querySelectorAll('.ui-stepper-action').forEach(( actionHost, index ) =>
        {
            const action = merged.actions[index];
            actionButtons.push(renderButton(actionHost,{ ...buildActionButtonConfig(`${merged.id}-action-${index}`,action,'TERTIARY',action.disabled,merged.iconTooltip), size:'MEDIUM' },() =>
            {
                if ( !state.busy && state.current ) { merged.onAction?.(action.key,instance.getSteps()[state.indexOf(state.current)],instance); }
            }));
        });
    }
    if ( interactive ) { controller = registerStepperEvents(list,{ onSelect:userActions.select, onMove:moveFocus }); }
    refresh();
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode);
    return instance;
}
