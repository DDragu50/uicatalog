// messageComponent.js
//
// COMPONENT COORDINATOR.
// Shows a message (INFO, SUCCESS, WARNING, DANGER, CUSTOM) in one of five layouts: INLINE, BLOCK, BANNER, TOAST
// (stacked in a corner region inside the toast area the application provides) and MODAL (native dialog, also for
// confirmations). Visibility: permanent (code), closable (close Button), temporary (duration, paused on hover or
// focus; the remaining time can be shown as a bar and/or a text) — closable and temporary can be combined. Messages that appear after the page is shown are announced
// (INFO/SUCCESS politely, WARNING/DANGER immediately). Composes Button.

import { mergeMessageConfig, validateMessageConfig, normalizeContent } from './messageConfig.js';
import { buildMessageHTML, buildBodyHTML, messageClasses } from './messageHTML.js';
import { registerMessageEvents } from './messageEvents.js';
import { reportMessageIssue } from './messageErrors.js';
import { renderButton } from '../button/buttonIndex.js';

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// Renders a Message and returns its runtime instance, or null after a developer error.
// For TOAST, container is the shared toast area: the message is added to a corner region inside it (it does not replace
// the area's content); destroy() removes only this message (and the region when it becomes empty).
export function renderMessage( container, config )
{
    if ( !container ) { reportMessageIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeMessageConfig(config);
    if ( validateMessageConfig(merged) ) { return null; }

    const toast = merged.layout === 'TOAST', modal = merged.layout === 'MODAL';
    const actions = modal && !merged.actions.length ? [ { key:'ok', label:merged.texts.ok, hierarchy:'PRIMARY' } ] : merged.actions;
    let content = { type:merged.type, title:merged.title, text:merged.text, details:merged.details, link:merged.link, icon:merged.icon, customIcon:merged.customIcon };
    const html = buildMessageHTML(merged,content,actions);
    let region = null;
    if ( toast )
    {
        const corner = merged.corner.toLowerCase().replace('_','-');
        region = container.querySelector(`:scope > .ui-message-region-${corner}`);
        if ( !region ) { region = document.createElement('div'); region.className = `ui-message-region ui-message-region-${corner}`; container.appendChild(region); }
        region.insertAdjacentHTML(corner.startsWith('bottom') ? 'afterbegin' : 'beforeend',html);
    }
    else { container.innerHTML = html; }
    const root = document.getElementById(merged.id);
    const body = root.querySelector('.ui-message-body');
    const buttons = [];
    const disabledActions = new Set(actions.filter(action => action.disabled).map(action => action.key));
    const state = { visible:merged.visible, timer:null, ticker:null, remaining:merged.duration, started:0, paused:false };
    // With reduced motion the bar moves in whole seconds (no gliding).
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    let controller = null, closeButton = null, instance = null;

    // Renders the action Buttons (modal: first action primary, others secondary; elsewhere secondary by default). Without
    // onAction they are disabled, except in a MODAL, where pressing closes it.
    function renderActions()
    {
        buttons.splice(0).forEach(button => button?.destroy());
        root.querySelectorAll('.ui-message-actions [data-action]').forEach(( host, index ) =>
        {
            const action = actions.find(item => item.key === host.dataset.action);
            const disabled = disabledActions.has(action.key) || ( !modal && !merged.onAction );
            buttons.push(renderButton(host,buildActionButtonConfig(`${merged.id}-action-${index}`,action,modal && index === 0 ? 'PRIMARY' : 'SECONDARY',disabled,merged.iconTooltip),() =>
            {
                merged.onAction?.(action.key,instance);
                if ( modal ) { hide('ACTION'); }
            }));
        });
    }

    // Makes the message announce itself: polite for INFO/SUCCESS/CUSTOM, immediate for WARNING/DANGER.
    function announce()
    {
        if ( modal ) { return; }
        root.setAttribute('role',content.type === 'WARNING' || content.type === 'DANGER' ? 'alert' : 'status');
        // The body is emptied and built again (not copied: a copy would duplicate the Buttons' ids and leave dead buttons).
        body.innerHTML = '';
        requestAnimationFrame(() => { body.innerHTML = buildBodyHTML(merged,content,actions); renderActions(); drawRemaining(); });
    }

    // Draws the remaining-time indicator (bar from 1 to 0, text in whole seconds, "Paused" while paused).
    function drawRemaining()
    {
        const box = merged.remainingIndicator === 'NONE' ? null : root.querySelector('.ui-message-remaining');
        if ( !box ) { return; }
        const left = Math.max(0,state.timer ? state.remaining - ( Date.now() - state.started ) : state.remaining);
        const seconds = Math.ceil(left / 1000);
        box.style.setProperty('--ui-message-remaining',String(( reducedMotion ? seconds * 1000 : left ) / merged.duration));
        box.classList.toggle('ui-message-remaining-paused',state.paused);
        const text = box.querySelector('.ui-message-remaining-text');
        if ( text ) { text.textContent = state.paused ? merged.texts.paused : merged.texts.remaining.replace('{seconds}',String(seconds)); }
    }
    function stopTicker() { clearInterval(state.ticker); state.ticker = null; }

    // Starts, pauses and resumes the temporary timer (and the remaining-time indicator with it).
    function startTimer() { clearTimeout(state.timer); state.timer = null; if ( !merged.duration || !state.visible ) { return; } state.remaining = merged.duration; state.paused = false; resume(); }
    function pause() { if ( !state.timer ) { return; } clearTimeout(state.timer); state.timer = null; stopTicker(); state.remaining -= Date.now() - state.started; state.paused = true; drawRemaining(); }
    function resume()
    {
        if ( !merged.duration || !state.visible || state.timer ) { return; }
        state.paused = false; state.started = Date.now();
        state.timer = setTimeout(() => { state.timer = null; stopTicker(); hide('TIMEOUT'); },Math.max(0,state.remaining));
        if ( merged.remainingIndicator !== 'NONE' ) { stopTicker(); state.ticker = setInterval(drawRemaining,100); }
        drawRemaining();
    }

    // Moves focus to the default action of a MODAL (DANGER: Cancel), otherwise to its first button — never to a link in
    // the text, which the browser would choose on its own (the first focusable element).
    function focusDefault()
    {
        const index = actions.findIndex(action => action.key === merged.defaultAction);
        ( buttons[index >= 0 ? index : 0] ?? buttons.find(Boolean) )?.getElement().focus();
    }

    // Shows the message (announced, timer started; MODAL opens as a modal dialog).
    function show()
    {
        if ( state.visible && !modal ) { return; }
        state.visible = true;
        if ( modal ) { if ( !root.open ) { root.showModal(); focusDefault(); } return; }
        root.hidden = false;
        announce();
        startTimer();
    }

    // Hides the message and reports the reason (USER, TIMEOUT, ESCAPE, ACTION; CODE is not reported).
    function hide( reason )
    {
        if ( !state.visible ) { return; }
        state.visible = false;
        clearTimeout(state.timer); state.timer = null; stopTicker();
        if ( modal ) { if ( root.open ) { root.close(); } } else { root.hidden = true; }
        if ( reason !== 'CODE' ) { merged.onClose?.(reason,instance); }
    }

    instance =
    {
        id:merged.id,
        // Shows the message (again).
        show:() => show(),
        // Hides the message (not reported as a user close).
        hide:() => hide('CODE'),
        // Returns whether the message is visible.
        isVisible:() => state.visible,
        // Moves focus to the message (e.g. an error summary after a failed submit); returns whether it succeeded.
        focus:() => { if ( !root.hasAttribute('tabindex') ) { root.setAttribute('tabindex','-1'); } root.focus(); return document.activeElement === root; },
        // Changes type, title, text, details, link or icon in place (announced when visible).
        // Enables or disables an action Button; returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            const index = actions.findIndex(action => action.key === String(key));
            if ( index < 0 ) { reportMessageIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            if ( disabled ) { disabledActions.add(actions[index].key); } else { disabledActions.delete(actions[index].key); }
            buttons[index]?.setDisabled(Boolean(disabled) || ( !modal && !merged.onAction ));
            return true;
        },
        update:( changes = {} ) =>
        {
            content = normalizeContent(merged.id,changes,content);
            root.className = messageClasses(merged,content);
            root.querySelector('.ui-message-icon i').className = content.icon;
            body.innerHTML = buildBodyHTML(merged,content,actions);
            renderActions();
            drawRemaining();
            if ( state.visible && !modal ) { announce(); }
        },
        // Removes timers, listeners and Buttons; removes the message (toast) or clears the container.
        destroy:() =>
        {
            clearTimeout(state.timer); stopTicker();
            controller?.abort();
            buttons.splice(0).forEach(button => button?.destroy());
            closeButton?.destroy();
            if ( modal && root.open ) { root.close(); }
            if ( toast ) { root.remove(); if ( region && !region.children.length ) { region.remove(); } } else { container.innerHTML = ''; }
        }
    };

    renderActions();
    const closeHost = root.querySelector('.ui-message-close-host');
    if ( closeHost ) { closeButton = renderButton(closeHost,{ id:`${merged.id}-close`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:'fa-solid fa-xmark', ariaLabel:merged.texts.close, tooltipMode:merged.iconTooltip },() => hide('USER')); }
    controller = registerMessageEvents(root,{ onPause:pause, onResume:resume, onEscape:() => hide('ESCAPE'), onDetail:( index, event ) => { const item = content.details[index]; if ( item?.onClick ) { if ( !item.href ) { event.preventDefault(); } item.onClick(event,instance); } } });

    if ( modal ) { if ( merged.visible ) { root.showModal(); focusDefault(); } }
    else if ( merged.visible && toast ) { announce(); startTimer(); }
    else if ( merged.visible ) { startTimer(); }
    return instance;
}
