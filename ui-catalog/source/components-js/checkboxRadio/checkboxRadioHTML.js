// checkboxRadioHTML.js
//
// GENERATED MARKUP.
// Every presentation keeps the native radio/checkbox; ICON and CHIP only add the visible state; SEGMENTED draws each
// option as a segment of one joined control (its label only; the selected look comes from CSS).
// CHIP visuals are produced by the Chip component through its public entry point.

import { buildChip } from '../chip/chipIndex.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the Font Awesome classes for one ICON state (the solid→regular combination is not representable).
export function getIconClass( config, selected )
{
    const solid = config.iconVariant === 'REGULAR_SOLID' && selected;
    const shape = config.selectionMode === 'SINGLE' ? 'circle' : 'square';
    return `${solid ? 'fa-solid' : 'fa-regular'} fa-${shape}${selected ? '-check' : ''}`;
}

// Returns Chip markup for one CHIP state; selection is shown by background token and a check icon after the label.
export function buildOptionChip( label, selected )
{
    return buildChip({ label, type:'CUSTOM', bordered:true, iconAfter:selected ? 'fa-solid fa-check' : '', backgroundToken:selected ? '--c-selected' : '--c-surface', colorToken:'--c-text' });
}

// Returns the presentation-specific visible part of one option.
function buildOptionVisual( config, option )
{
    if ( config.presentation === 'CHIP' ) { return `<span class="ui-checkbox-radio-chip">${buildOptionChip(option.label,option.selected)}</span>`; }
    const icon = config.presentation === 'ICON' ? `<span class="ui-checkbox-radio-icon ui-checkbox-radio-icon-size-${config.iconSize.toLowerCase()}" aria-hidden="true"><i class="${getIconClass(config,option.selected)}"></i></span>` : '';
    return `${icon}<span class="ui-checkbox-radio-option-label">${escapeHTML(option.label)}</span>`;
}

// Returns one option: label wrapping the native input and its visible presentation.
function buildOption( config, option )
{
    const inputId = `${config.id}-option-${option.index}`;
    const type = config.selectionMode === 'SINGLE' ? 'radio' : 'checkbox';
    return `<label class="ui-checkbox-radio-option" for="${escapeHTML(inputId)}" data-index="${option.index}" data-selected="${option.selected}"><input id="${escapeHTML(inputId)}" class="ui-checkbox-radio-input" type="${type}" name="${escapeHTML(config.name)}" value="${escapeHTML(option.value)}"${option.selected ? ' checked' : ''}${option.disabled ? ' disabled' : ''}${config.help ? ` aria-describedby="${escapeHTML(config.id)}-help"` : ''}>${buildOptionVisual(config,option)}</label>`;
}

// Returns the optional text or mandatory asterisk; mandatory MULTIPLE groups also get visually hidden text,
// because aria-required is not supported on a checkbox group and the asterisk is aria-hidden.
function buildRequirementIndicatorHTML( config )
{
    if ( !config.mandatory ) { return config.mandatoryIndicator === 'OPTIONAL_TEXT' ? ` <span class="ui-checkbox-radio-optional">${escapeHTML(config.texts.optional)}</span>` : ''; }
    const asterisk = config.mandatoryIndicator === 'MANDATORY_ASTERISK' ? ' <span class="ui-checkbox-radio-mandatory" aria-hidden="true">*</span>' : '';
    const hidden = config.selectionMode === 'MULTIPLE' ? ` <span class="ui-checkbox-radio-visually-hidden">${escapeHTML(config.texts.mandatory)}</span>` : '';
    return `${asterisk}${hidden}`;
}

// Returns the complete component markup from a normalized, validated configuration.
function buildMarkup( config )
{
    const id = escapeHTML(config.id);
    const classes = `ui-checkbox-radio ui-checkbox-radio-${config.direction.toLowerCase()} ui-checkbox-radio-presentation-${config.presentation.toLowerCase()}`;
    const role = config.selectionMode === 'SINGLE' ? ' role="radiogroup"' : '';
    const labelledBy = config.groupLabel ? ` aria-labelledby="${id}-label"` : '';
    const required = config.mandatory && config.selectionMode === 'SINGLE' ? ' aria-required="true"' : '';
    const legend = config.groupLabel ? `<legend id="${id}-label" class="ui-checkbox-radio-group-label">${escapeHTML(config.groupLabel)}${buildRequirementIndicatorHTML(config)}</legend>` : '';
    const options = config.options.map(option => buildOption(config,option)).join('');
    const help = config.help ? `<div id="${id}-help" class="ui-checkbox-radio-help">${escapeHTML(config.help)}</div>` : '';
    const describedBy = config.help ? ` aria-describedby="${id}-help"` : '';
    return `<fieldset id="${id}" class="${classes}"${role}${labelledBy}${describedBy}${required}${config.disabled ? ' disabled' : ''}>${legend}<div class="ui-checkbox-radio-options">${options}</div>${help}<div id="${id}-error" class="ui-checkbox-radio-error" hidden></div></fieldset>`;
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-checkbox-radio-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildCheckboxRadioHTML( config ) { return withLabelPosition(buildMarkup(config),config); }
