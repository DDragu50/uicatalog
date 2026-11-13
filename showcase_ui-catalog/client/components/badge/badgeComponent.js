// badgeComponent.js
//
// COMPONENT COORDINATOR.
// A person (or item) badge: a Notification (image, icon or initials with an optional corner indicator) next to or above
// a name and an optional role/description. The whole badge can be a link (href) or a button (onClick); the Notification
// inside is display-only and hidden from assistive technology, its indicator meaning is added to the badge's text
// ("Ana Pop, Administrator, Online"). Composes Notification (declared dependency).

import { mergeBadgeConfig, validateBadgeConfig } from './badgeConfig.js';
import { buildBadgeHTML, buildTextHTML } from './badgeHTML.js';
import { registerBadgeEvents } from './badgeEvents.js';
import { reportBadgeIssue } from './badgeErrors.js';
import { renderNotification } from '../notification/notificationIndex.js';

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

// Renders a Badge and returns its runtime instance, or null after a developer error.
export function renderBadge( container, config, onClick )
{
    if ( !container ) { reportBadgeIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeBadgeConfig({ ...config, onClick:config?.onClick ?? onClick });
    if ( validateBadgeConfig(merged) ) { return null; }

    container.innerHTML = buildBadgeHTML(merged);
    const root = container.querySelector('.ui-badge');
    const textElement = root.querySelector('.ui-badge-text');
    const state = { name:merged.name, description:merged.description };
    let notification = null, controller = null, instance = null;

    // Redraws the text (name, description, hidden indicator meaning).
    function drawText()
    {
        textElement.innerHTML = buildTextHTML(state.name,state.description,notification?.getIndicatorSpeech() ?? '',merged.tooltipMode);
        if ( root.getAttribute('role') === 'group' ) { root.setAttribute('aria-label',[ state.name, state.description, notification?.getIndicatorSpeech() ].filter(Boolean).join(', ')); }
    }

    const host = root.querySelector('.ui-badge-notification-host');
    if ( host )
    {
        notification = renderNotification(host,{ label:state.name, ...merged.notification, id:`${merged.id}-notification`, size:merged.size, clickable:false, onClick:undefined });
        if ( notification ) { notification.getElement().setAttribute('aria-hidden','true'); } else { reportBadgeIssue('NOTIFICATION_FAILED',{ id:merged.id }); host.remove(); }
    }

    instance =
    {
        id:merged.id,
        // Returns the badge element (link, button or group).
        getElement:() => root,
        // Returns the composed Notification (or null); use the Badge methods below to change its indicator.
        getNotification:() => notification,
        // Changes the name.
        setName:( name ) => { const text = String(name ?? '').trim(); if ( !text ) { reportBadgeIssue('NAME_REQUIRED',{ id:merged.id }); return; } state.name = text; drawText(); },
        // Changes or removes ('') the role/description.
        setDescription:( description ) => { state.description = String(description ?? '').trim(); drawText(); },
        // Changes or removes (null) the Notification's indicator and updates the spoken text.
        setIndicator:( changes ) => { notification?.setIndicator(changes); drawText(); },
        // Sets the Notification's count (0 hides it) and updates the spoken text.
        setCount:( count ) => { notification?.setCount(count); drawText(); },
        // Removes listeners and the Notification, then clears the container.
        destroy:() => { removeHintTooltip(); controller?.abort(); notification?.destroy(); container.innerHTML = ''; }
    };

    drawText();
    if ( merged.onClick ) { controller = registerBadgeEvents(root,event => merged.onClick(event,instance)); }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ onlyWhenTruncated:true });
    return instance;
}
