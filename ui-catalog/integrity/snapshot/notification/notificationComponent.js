// notificationComponent.js
//
// COMPONENT COORDINATOR.
// A round element (icon or image: circle; text: circle up to 3 characters, pill beyond) with an optional indicator in a
// corner: a count (circle, pill for several digits, "99+"), a dot in one of four shapes, or short text. Clickable
// notifications are native buttons styled as tertiary icon buttons; display-only ones are images for assistive
// technology. The accessible name combines the label and the indicator's meaning ("Notifications, 3 new").

import { mergeNotificationConfig, validateNotificationConfig, normalizeIndicator } from './notificationConfig.js';
import { buildNotificationHTML, buildIndicatorHTML, indicatorSpeech } from './notificationHTML.js';
import { registerNotificationEvents } from './notificationEvents.js';
import { reportNotificationIssue } from './notificationErrors.js';

// Sets or removes an element's hint for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function setHint( element, mode, text )
{
    const value = String(text ?? '').trim();
    element.removeAttribute('title');
    element.removeAttribute('data-tooltip');
    if ( value && mode !== 'NONE' ) { element.setAttribute(mode === 'TITLE' ? 'title' : 'data-tooltip',value); }
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

// Renders a Notification and returns its runtime instance, or null after a developer error.
export function renderNotification( container, config, onClick )
{
    if ( !container ) { reportNotificationIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeNotificationConfig(config);
    if ( validateNotificationConfig(merged) ) { return null; }

    container.innerHTML = buildNotificationHTML(merged);
    const element = container.querySelector('.ui-notification');
    const callback = merged.onClick ?? ( typeof onClick === 'function' ? onClick : null );
    let indicator = merged.indicator, controller = null, instance = null;

    // Sets the accessible name: label plus the indicator's meaning.
    function applyName()
    {
        const speech = indicatorSpeech(merged,indicator);
        element.setAttribute('aria-label',speech ? `${merged.label}, ${speech}` : merged.label);
        if ( merged.clickable ) { setHint(element,merged.tooltipMode,merged.label); }
    }

    // Replaces the indicator in place.
    function drawIndicator()
    {
        element.querySelector('.ui-notification-indicator')?.remove();
        element.insertAdjacentHTML('beforeend',buildIndicatorHTML(indicator));
        applyName();
    }

    instance =
    {
        id:merged.id,
        // Returns the notification element (button or span).
        getElement:() => element,
        // Changes (partial object), or removes (null) the indicator.
        setIndicator:( changes ) => { indicator = changes === null ? null : normalizeIndicator(merged.id,changes,indicator ?? undefined); drawIndicator(); },
        // Sets the count of a COUNT indicator (0 hides it).
        // A count keeps the settings of a count marker; after a dot or text marker it starts afresh (only the corner
        // stays), so the old marker's meaning (e.g. "Online") is not spoken with the count.
        setCount:( count ) => { const base = indicator?.kind === 'COUNT' ? indicator : indicator ? { corner:indicator.corner } : undefined; indicator = normalizeIndicator(merged.id,{ kind:'COUNT', value:count },base); drawIndicator(); },
        // Returns the indicator's spoken meaning ("3 new", "Online") or '' — for components that show the notification inside their own name.
        getIndicatorSpeech:() => indicatorSpeech(merged,indicator),
        // Returns the current indicator (copy) or null.
        getIndicator:() => ( indicator ? { ...indicator } : null ),
        // Enables or disables a clickable notification.
        setDisabled:( disabled ) => { if ( merged.clickable ) { element.disabled = Boolean(disabled); } },
        // Removes listeners and clears the container.
        destroy:() => { removeHintTooltip(); controller?.abort(); container.innerHTML = ''; }
    };

    applyName();
    if ( merged.clickable ) { controller = registerNotificationEvents(element,event => callback?.(event,instance)); }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode);
    return instance;
}
