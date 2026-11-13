// textAreaHTML.js
//
// GENERATED MARKUP.
// Rendered once per instance; value, counter, errors and ARIA relationships are updated in place.
// The error element is not a live region; only counter thresholds are announced (polite).

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Returns whether the counter is shown (edit state, active maxLength, showCounter).
export function hasCounter( config ) { return config.state === 'EDIT' && config.validation.enabled && config.showCounter; }

// Builds the optional-text or mandatory-asterisk marker; the asterisk is aria-hidden (aria-required announces it).
function buildMandatoryIndicatorHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-text-area-optional">${escapeHTML(config.texts.optional)}</span>`; }
    if ( config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ) { return ' <span class="ui-text-area-mandatory" aria-hidden="true">*</span>'; }
    return '';
}

// Returns the ids the field is described by: help and the maxLength limit (errors are added at runtime).
export function baseDescribedBy( config )
{
    return [ config.help ? `${config.id}-help` : '', config.validation.enabled && config.state === 'EDIT' ? `${config.id}-limit` : '' ].filter(Boolean);
}

// Builds TextArea markup for the configured state; INVISIBLE renders nothing.
function buildMarkup( config )
{
    if ( config.state === 'INVISIBLE' ) { return ''; }
    const id = escapeHTML(config.id);
    const label = escapeHTML(config.label);
    const width = `ui-text-area-width-${toClassPart(config.width)}`;

    if ( config.state === 'VIEW' ) { return `<div class="ui-text-area-wrapper ${width}">${label ? `<p class="ui-text-area-label">${label}</p>` : ''}<p class="ui-text-area-view-value" dir="auto">${escapeHTML(config.value)}</p></div>`; }

    const describedBy = baseDescribedBy(config).join(' ');
    const attributes = [
        `rows="${config.rows}"`,
        `autocomplete="${escapeHTML(config.autocomplete)}"`,
        `spellcheck="${config.spellcheck}"`,
        'dir="auto"',
        'aria-invalid="false"',
        config.mandatory ? 'aria-required="true"' : '',
        describedBy ? `aria-describedby="${describedBy}"` : '',
        config.state === 'INACTIVE' ? 'disabled' : ''
    ].filter(Boolean).join(' ');
    const classes = `ui-text-area-field ui-text-area-resize-${toClassPart(config.resize)}${config.autoGrow ? ' ui-text-area-auto-grow' : ''}`;
    const counter = hasCounter(config) ? `<div id="${id}-counter" class="ui-text-area-counter" aria-hidden="true"></div>` : '';
    const limit = config.validation.enabled && config.state === 'EDIT' ? `<span id="${id}-limit" class="ui-text-area-visually-hidden">${escapeHTML(config.texts.limit.replace('{maxLength}',String(config.validation.maxLength)))}</span>` : '';
    const announcer = hasCounter(config) ? `<span id="${id}-announcer" class="ui-text-area-visually-hidden" aria-live="polite"></span>` : '';
    return `<div class="ui-text-area-wrapper ${width}">`
        + ( label ? `<label class="ui-text-area-label" for="${id}">${label}${buildMandatoryIndicatorHTML(config)}</label>` : '' )
        + `<textarea id="${id}" name="${escapeHTML(config.name)}" class="${classes}" placeholder="${escapeHTML(config.placeholder)}" ${attributes}>${escapeHTML(config.value)}</textarea>`
        + `<div class="ui-text-area-footer">${config.help ? `<div id="${id}-help" class="ui-text-area-help">${escapeHTML(config.help)}</div>` : ''}`
        + `<div id="${id}-error" class="ui-text-area-error" hidden></div>${counter}</div>`
        + limit + announcer
        + '</div>';
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-text-area-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildTextAreaHTML( config ) { return withLabelPosition(buildMarkup(config),config); }
