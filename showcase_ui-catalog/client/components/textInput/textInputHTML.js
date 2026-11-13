// textInputHTML.js
//
// GENERATED MARKUP.
// Converts the normalized configuration into markup, rendered once per instance.
// The error element always exists (hidden when empty) so errors can be updated in place.
// It is not a live region: announcing errors belongs to the consumer (error summary).

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Builds the optional-text or mandatory-asterisk marker; the asterisk is aria-hidden (aria-required announces it).
function buildRequirementIndicatorHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-text-input-optional">${escapeHTML(config.texts.optional)}</span>`; }
    if ( config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ) { return ' <span class="ui-text-input-mandatory" aria-hidden="true">*</span>'; }
    return '';
}

// Builds the trailing area: host for a child Button (password toggle or the application action), or a static icon.
function buildIconAreaHTML( config )
{
    if ( config.state !== 'EDIT' ) { return ''; }
    if ( config.type === 'PASSWORD' && config.passwordToggle ) { return '<div class="ui-text-input-icon-area"><div class="ui-text-input-icon-button-host"></div></div>'; }
    if ( config.actions.length ) { return `<div class="ui-text-input-icon-area"><div class="ui-text-input-icon-button-host ui-text-input-action" data-action="${escapeHTML(config.actions[0].key)}"></div></div>`; }
    return config.iconArea.staticIcon ? `<div class="ui-text-input-icon-area"><i class="ui-text-input-static-icon ${escapeHTML(config.iconArea.staticIcon)}" aria-hidden="true"></i></div>` : '';
}

// Returns the native attributes of the input element.
function buildInputAttributes( config )
{
    const number = config.type === 'NUMBER';
    const showSpinner = number && config.validation.numberType === 'INTEGER' && config.validation.step !== 1;
    return [
        config.inputMode ? `inputmode="${config.inputMode.toLowerCase()}"` : '',
        config.state === 'INACTIVE' ? 'disabled' : '',
        config.mandatory ? 'aria-required="true"' : '',
        showSpinner ? `step="${config.validation.step}"` : '',
        number && config.validation.minValue !== null ? `min="${config.validation.minValue}"` : '',
        number && config.validation.maxValue !== null ? `max="${config.validation.maxValue}"` : '',
        config.help ? `aria-describedby="${escapeHTML(config.id)}-help"` : ''
    ].filter(Boolean).join(' ');
}

// Builds TextInput markup for the configured state; INVISIBLE renders nothing.
function buildMarkup( config )
{
    if ( config.state === 'INVISIBLE' ) { return ''; }
    const id = escapeHTML(config.id);
    const label = escapeHTML(config.label);
    const width = `ui-text-input-width-${toClassPart(config.width)}`;

    if ( config.state === 'VIEW' ) { return `<div class="ui-text-input-wrapper ${width}">${label ? `<p class="ui-text-input-label">${label}</p>` : ''}<p class="ui-text-input-view-value">${escapeHTML(config.value)}</p></div>`; }

    const indicator = buildRequirementIndicatorHTML(config);
    const spinner = config.type === 'NUMBER' && !( config.validation.numberType === 'INTEGER' && config.validation.step !== 1 ) ? ' ui-text-input-number-no-spinner' : '';
    return `<div class="ui-text-input-wrapper ${width}">`
        + ( label ? `<label class="ui-text-input-label" for="${id}">${label}${indicator}</label>` : '' )
        + `<div class="ui-text-input-control"><input id="${id}" name="${escapeHTML(config.name)}" class="ui-text-input-field${spinner}" type="${config.type.toLowerCase()}" value="${escapeHTML(config.value)}" placeholder="${escapeHTML(config.placeholder)}" autocomplete="${escapeHTML(config.autocomplete)}" aria-invalid="false" ${buildInputAttributes(config)}>${buildIconAreaHTML(config)}</div>`
        + ( config.help ? `<div id="${id}-help" class="ui-text-input-help">${escapeHTML(config.help)}</div>` : '' )
        + `<div id="${id}-error" class="ui-text-input-error" hidden></div>`
        + '</div>';
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-text-input-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildTextInputHTML( config ) { return withLabelPosition(buildMarkup(config),config); }
