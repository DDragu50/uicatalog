// notificationHTML.js
//
// GENERATED MARKUP.
// A native button (clickable) or a span with role="img" (display only) holding the shape (the main content: icon,
// image or text) and the indicator. The indicator is visual (aria-hidden); its meaning is part of the accessible name.
// The shape is its own element so that a long indicator at a right corner can widen the notification without
// stretching the shape.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the text shown in a COUNT indicator ("99+" above max), or '' when it is hidden (0).
export const countText = indicator => ( indicator.value > indicator.max ? `${indicator.max}+` : indicator.value ? String(indicator.value) : '' );

// Returns the spoken meaning of the indicator ("3 new", the description, or the text).
export function indicatorSpeech( config, indicator )
{
    if ( !indicator ) { return ''; }
    if ( indicator.kind === 'COUNT' ) { return indicator.value ? indicator.description || config.texts.count.replace('{count}',countText(indicator)) : ''; }
    if ( indicator.kind === 'TEXT' ) { return indicator.value ? indicator.description || indicator.value : ''; }
    return indicator.description;
}

// Builds the indicator element (empty string when there is nothing to show).
export function buildIndicatorHTML( indicator )
{
    if ( !indicator ) { return ''; }
    const text = indicator.kind === 'COUNT' ? countText(indicator) : indicator.kind === 'TEXT' ? indicator.value : '';
    if ( indicator.kind !== 'DOT' && !text ) { return ''; }
    const classes = [ 'ui-notification-indicator', `ui-notification-indicator-${indicator.kind.toLowerCase()}`, `ui-notification-type-${indicator.type.toLowerCase()}`, `ui-notification-corner-${indicator.corner.toLowerCase().replace('_','-')}`,
        indicator.kind === 'DOT' ? `ui-notification-shape-${indicator.shape.toLowerCase()}` : text.length > 1 ? 'ui-notification-pill' : '' ].filter(Boolean).join(' ');
    const style = [ indicator.backgroundToken ? `--ui-notification-indicator-bg:var(${indicator.backgroundToken})` : '', indicator.colorToken ? `--ui-notification-indicator-color:var(${indicator.colorToken})` : '' ].filter(Boolean).join(';');
    return `<span class="${classes}" aria-hidden="true"${style ? ` style="${style}"` : ''}>${escapeHTML(text)}</span>`;
}

// Builds the whole notification.
export function buildNotificationHTML( config )
{
    const shape = config.content === 'text' && config.text.length > 3 ? 'ui-notification-pill-main' : 'ui-notification-circle';
    const classes = `ui-notification ui-notification-content-${config.content} ui-notification-size-${config.size.toLowerCase()} ${shape}${config.border ? ' ui-notification-bordered' : ''}`;
    const main = config.content === 'image' ? `<img class="ui-notification-image" src="${escapeHTML(config.image)}" alt="">`
        : config.content === 'icon' ? `<span class="ui-notification-icon" aria-hidden="true"><i class="${escapeHTML(config.icon)}"></i></span>`
        : `<span class="ui-notification-text" aria-hidden="true">${escapeHTML(config.text)}</span>`;
    const inner = `<span class="ui-notification-shape">${main}</span>${buildIndicatorHTML(config.indicator)}`;
    const colours = [ config.colorToken ? `--ui-notification-color:var(${config.colorToken})` : '', config.backgroundToken ? `--ui-notification-bg:var(${config.backgroundToken})` : '' ].filter(Boolean).join(';');
    const style = colours ? ` style="${colours}"` : '';
    return config.clickable
        ? `<button id="${escapeHTML(config.id)}" class="${classes}" type="button"${style}${config.disabled ? ' disabled' : ''}>${inner}</button>`
        : `<span id="${escapeHTML(config.id)}" class="${classes}" role="img"${style}>${inner}</span>`;
}
