// buttonHTML.js
//
// GENERATED MARKUP.
// Converts a normalized, validated configuration into Button markup; no DOM access or events.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Generates one decorative icon while preserving the icon library's natural glyph proportions.
function buildIcon( iconClass, position, iconSize )
{
    if ( !iconClass ) { return ''; }
    return `<span class="ui-button-icon ui-button-icon-${position} ui-button-icon-size-${toClassPart(iconSize)}" aria-hidden="true"><i class="${escapeHTML(iconClass)}"></i></span>`;
}

// Whether the link opens in a new tab (the hidden text and rel noopener follow from it).
function opensNewTab( config ) { return config.isLink && config.target === 'NEW_TAB'; }

// Generates the internal content of a text button or an icon-only button; a text link that opens a new tab adds the hidden
// text " (opens in a new tab)" (an icon link has it in aria-label).
function buildContent( config )
{
    if ( config.buttonVariant === 'ICON_BUTTON' ) { return buildIcon(config.icon,'only',config.iconSize); }
    const newTab = opensNewTab(config) ? `<span class="ui-button-visually-hidden"> ${escapeHTML(config.newTabText)}</span>` : '';
    const after = config.iconAfter ? buildIcon(config.iconAfter,config.showsNewTabIcon ? 'after ui-button-icon-new-tab' : 'after',config.iconSize) : '';
    return `${buildIcon(config.iconBefore,'before',config.iconSize)}<span class="ui-button-label">${escapeHTML(config.label)}</span>${newTab}${after}`;
}

// Returns the attributes that make <a> a link, or an unavailable link (disabled or no address: no href, role link, aria-disabled).
export function buildLinkAttributes( config, disabled )
{
    if ( disabled || !config.href ) { return { role:'link', 'aria-disabled':'true' }; }
    const attributes = { href:config.href };
    if ( opensNewTab(config) ) { attributes.target = '_blank'; }
    const rel = [ ...new Set([ ...config.rel.split(' ').filter(Boolean), ...( opensNewTab(config) ? [ 'noopener' ] : [] ) ]) ].join(' ');
    if ( rel ) { attributes.rel = rel; }
    if ( config.download !== '' ) { attributes.download = config.download === true ? '' : config.download; }
    return attributes;
}

// Generates the hidden description read by screen readers after the button's name (aria-describedby).
export function buildDescription( id, description ) { return description ? `<span id="${escapeHTML(id)}-description" hidden>${escapeHTML(description)}</span>` : ''; }

// Generates Button markup (the button, or <a> when href is set, followed by its hidden description and the Tooltip host when configured).
export function buildButtonHTML( config )
{
    const isIconButton = config.buttonVariant === 'ICON_BUTTON';
    const classes =
    [
        'ui-button',
        `ui-button-${toClassPart(config.buttonVariant)}`,
        `ui-button-${toClassPart(config.hierarchy)}`,
        `ui-button-size-${toClassPart(config.size)}`,
        isIconButton ? `ui-button-icon-radius-${toClassPart(config.iconButtonRadius)}` : `ui-button-radius-${toClassPart(config.radius)}`,
        isIconButton ? '' : `ui-button-width-${toClassPart(config.width)}`
    ].filter(Boolean).join(' ');
    const name = isIconButton && opensNewTab(config) ? `${config.ariaLabel} ${config.newTabText}` : config.ariaLabel;
    const ariaLabel = isIconButton ? ` aria-label="${escapeHTML(name)}"${config.tooltipMode === 'TITLE' ? ` title="${escapeHTML(config.ariaLabel)}"` : ''}` : '';
    const tooltip = config.tooltipMode === 'TOOLTIP' ? '<span class="ui-tooltip-host"></span>' : '';
    const style = !isIconButton && config.width === 'MIN_WIDTH' ? ` style="--ui-button-min-width:${config.minWidth}px"` : '';
    const describedBy = config.description ? ` aria-describedby="${escapeHTML(config.id)}-description"` : '';
    const after = `${buildDescription(config.id,config.description)}${tooltip}`;
    if ( config.isLink )
    {
        const link = Object.entries(buildLinkAttributes(config,config.disabled)).map(( [ key, value ] ) => ( value === '' ? ` ${key}` : ` ${key}="${escapeHTML(value)}"` )).join('');
        return `<a id="${escapeHTML(config.id)}" class="${classes} ui-button-as-link"${link}${ariaLabel}${describedBy}${style}>${buildContent(config)}</a>${after}`;
    }
    return `<button id="${escapeHTML(config.id)}" class="${classes}" type="${config.buttonType.toLowerCase()}"${ariaLabel}${describedBy}${style}${config.disabled ? ' disabled' : ''}>${buildContent(config)}</button>${after}`;
}
