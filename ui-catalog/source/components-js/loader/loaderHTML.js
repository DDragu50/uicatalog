// loaderHTML.js
//
// GENERATED MARKUP.
// The indicator (a bar with its fill, or a ring drawn as two SVG circles), the label and value texts, the Cancel host,
// the scrim of an OVERLAY Loader and the two live regions. The component fills the texts, the value and the status
// symbol in place while the action runs.

// Font Awesome symbols of the end statuses (round glyphs, so a ring can be replaced by its symbol at the same size).
export const STATUS_SYMBOLS = { DONE:'fa-solid fa-circle-check', ERROR:'fa-solid fa-circle-exclamation', CANCELLED:'fa-solid fa-ban' };

// Ring geometry in SVG user units (viewBox 24 × 24): the circle radius and the stroke width; pathLength 100 lets the
// component write the share done directly as the dash length.
const RING = { center:12, radius:10, stroke:3 };

// Escapes consumer text before inserting it into generated markup.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Replaces {name} placeholders of a text.
export function fillText( text, values ) { return text.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match)); }

// Builds the indicator: the progress-bar role with the bar or the ring inside.
function buildIndicatorHTML( config )
{
    const { center, radius, stroke } = RING;
    const circle = className => `<circle class="${className}" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke-width="${stroke}" pathLength="100"${className === 'ui-loader-circle-arc' ? ` transform="rotate(-90 ${center} ${center})"` : ''}></circle>`;
    const inside = config.shape === 'RING'
        ? `<svg class="ui-loader-circle" viewBox="0 0 ${center * 2} ${center * 2}" aria-hidden="true" focusable="false">${circle('ui-loader-circle-track')}${circle('ui-loader-circle-arc')}</svg><i class="ui-loader-symbol" aria-hidden="true"></i>`
        : '<span class="ui-loader-track" aria-hidden="true"><span class="ui-loader-fill"></span></span>';
    return `<div id="${escapeHTML(config.id)}-indicator" class="ui-loader-indicator" role="progressbar" aria-labelledby="${escapeHTML(config.id)}-label" aria-valuemin="0" aria-valuemax="${config.max}" tabindex="-1">${inside}</div>`;
}

// Builds the whole Loader (idle: nothing visible but the empty live regions).
export function buildLoaderHTML( config )
{
    const classes = [ 'ui-loader', `ui-loader-${toClassPart(config.shape)}`, `ui-loader-size-${toClassPart(config.size)}`, `ui-loader-placement-${toClassPart(config.placement)}`,
        `ui-loader-label-${toClassPart(config.labelPlacement)}`, config.placement === 'OVERLAY' ? `ui-loader-indicator-${toClassPart(config.indicatorPosition)}` : '', 'ui-loader-indeterminate' ].filter(Boolean).join(' ');
    const symbol = config.shape === 'BAR' ? '<i class="ui-loader-symbol" aria-hidden="true"></i>' : '';
    const text = `<div class="ui-loader-text${config.labelPlacement === 'HIDDEN' ? ' ui-loader-visually-hidden' : ''}">${symbol}<span id="${escapeHTML(config.id)}-label" class="ui-loader-label"></span><span class="ui-loader-value" aria-hidden="true"></span></div>`;
    const cancel = config.cancellable ? '<span class="ui-loader-cancel" data-button="cancel"></span>' : '';
    const scrim = config.placement === 'OVERLAY' ? '<div class="ui-loader-scrim" aria-hidden="true"></div>' : '';
    return `<div id="${escapeHTML(config.id)}" class="${classes}" data-status="IDLE">`
        + `<div class="ui-loader-frame" hidden>${scrim}<div class="ui-loader-panel"><div class="ui-loader-body">${buildIndicatorHTML(config)}${text}</div>${cancel}</div></div>`
        + '<div class="ui-loader-live ui-loader-visually-hidden" aria-live="polite"></div><div class="ui-loader-alert ui-loader-visually-hidden" aria-live="assertive"></div></div>';
}
