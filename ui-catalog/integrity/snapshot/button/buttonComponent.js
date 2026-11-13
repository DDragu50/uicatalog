// buttonComponent.js
//
// COMPONENT COORDINATOR.
// Owns the Button lifecycle and runtime API. With href, Button is a link (<a>): disabled removes the address
// (role link + aria-disabled), so it leaves the tab order. An icon button can show its name on hover and focus: the browser's title, or
// a Tooltip (tooltipMode TOOLTIP; loaded only then, as an optional dependency). The container is a dedicated,
// consumer-owned mount point.

import { mergeButtonConfig, validateButtonConfig } from './buttonConfig.js';
import { buildButtonHTML, buildDescription, buildLinkAttributes } from './buttonHTML.js';
import { registerButtonEvents } from './buttonEvents.js';
import { reportButtonIssue } from './buttonErrors.js';

// Renders an interactive Button and returns its runtime instance, or null after a developer error.
export function renderButton( container, config, onClick )
{
    if ( !container ) { reportButtonIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeButtonConfig(config);
    if ( validateButtonConfig(merged) ) { return null; }

    container.innerHTML = buildButtonHTML(merged);
    const button = container.querySelector(merged.isLink ? 'a' : 'button');
    let controller = null, tooltip = null, destroyed = false, linkDisabled = merged.disabled;
    // Link: writes the attributes of an available or an unavailable link.
    const LINK_ATTRIBUTES = [ 'href', 'target', 'rel', 'download', 'role', 'aria-disabled' ];
    const applyLink = ( disabled ) =>
    {
        linkDisabled = disabled;
        LINK_ATTRIBUTES.forEach(name => button.removeAttribute(name));
        Object.entries(buildLinkAttributes(merged,disabled)).forEach(( [ name, value ] ) => button.setAttribute(name,value));
    };
    // TOOLTIP: the icon button's name as a LABEL Tooltip (the Tooltip module is loaded on first use).
    const tooltipHost = container.querySelector('.ui-tooltip-host');
    if ( tooltipHost )
    {
        import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
        {
            if ( !destroyed ) { tooltip = renderTooltip(tooltipHost,{ id:`${merged.id}-tooltip`, target:button, text:merged.ariaLabel, purpose:'LABEL' }); }
        }).catch(() => {});   // a Tooltip that cannot be loaded: the browser reports the failed module; the button works without it
    }

    const instance =
    {
        id:merged.id,
        // Returns the native button (or the <a> of a link) for integrations that need native access.
        getElement:() => button,
        // Returns whether the button (or link) is currently disabled.
        isDisabled:() => ( merged.isLink ? linkDisabled : button.disabled ),
        // Enables or disables the button: native disabled; a link loses or gets back its address.
        setDisabled:( disabled ) => { if ( merged.isLink ) { applyLink(Boolean(disabled)); } else { button.disabled = Boolean(disabled); } },
        // Sets, changes or removes ('') the description read by screen readers after the name.
        setDescription:( description ) =>
        {
            const text = String(description ?? '').trim();
            container.querySelector(`[id="${merged.id}-description"]`)?.remove();
            if ( text ) { button.insertAdjacentHTML('afterend',buildDescription(merged.id,text)); button.setAttribute('aria-describedby',`${merged.id}-description`); }
            else { button.removeAttribute('aria-describedby'); }
        },
        // Removes the listener and clears the container.
        destroy:() => { destroyed = true; tooltip?.destroy(); controller.abort(); container.innerHTML = ''; }
    };

    controller = registerButtonEvents(button,merged.onClick ?? onClick,instance,merged.isLink ? () => linkDisabled : null);
    return instance;
}
