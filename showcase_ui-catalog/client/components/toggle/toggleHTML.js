// toggleHTML.js
//
// GENERATED MARKUP.
// SWITCH: a native checkbox with role="switch" laid over a decorative track; the state text shows the current
// value, or both values around the switch (stateDisplay BOTH). RADIO: two native radio buttons in a fieldset.
// VIEW: label and the chosen state as text. Rendered once per instance.

import { stateLabels } from './toggleConfig.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the view text for a value (on/off texts, or the unanswered text for null).
export function viewText( config, value )
{
    const [ on, off ] = config.stateText === 'NONE' ? [ config.texts.on, config.texts.off ] : stateLabels(config);
    return value === null ? config.texts.unanswered : value ? on : off;
}

// Builds the optional-text or mandatory-asterisk marker (RADIO); the asterisk is aria-hidden.
function buildMandatoryIndicatorHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-toggle-optional">${escapeHTML(config.texts.optional)}</span>`; }
    if ( config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ) { return ' <span class="ui-toggle-mandatory" aria-hidden="true">*</span>'; }
    return '';
}

// Builds the help element (both presentations).
function buildHelpHTML( config ) { return config.help ? `<div id="${escapeHTML(config.id)}-help" class="ui-toggle-help">${escapeHTML(config.help)}</div>` : ''; }

// Builds the switch: label, native checkbox (role="switch") over the track, state text(s) and help.
function buildSwitchHTML( config )
{
    const id = escapeHTML(config.id);
    const [ on, off ] = stateLabels(config);
    const both = config.stateDisplay === 'BOTH' && config.stateText !== 'NONE';
    const current = config.stateText === 'NONE' || both ? '' : `<span class="ui-toggle-state" aria-hidden="true" data-on="${escapeHTML(on)}" data-off="${escapeHTML(off)}">${escapeHTML(config.value ? on : off)}</span>`;
    const sideOff = both ? `<span class="ui-toggle-side ui-toggle-side-off" aria-hidden="true" data-value="false">${escapeHTML(off)}</span>` : '';
    const sideOn = both ? `<span class="ui-toggle-side ui-toggle-side-on" aria-hidden="true" data-value="true">${escapeHTML(on)}</span>` : '';
    const attributes = [ config.value ? 'checked' : '', config.state === 'INACTIVE' ? 'disabled' : '', config.help ? `aria-describedby="${id}-help"` : '' ].filter(Boolean).join(' ');
    const style = ` style="--ui-toggle-on-bg:var(${config.onBackgroundToken});--ui-toggle-off-bg:var(${config.offBackgroundToken})"`;
    return `<div class="ui-toggle ui-toggle-switch ui-toggle-size-${config.size.toLowerCase()}${both ? ' ui-toggle-display-both' : ''}"${style}>`
        + `<label class="ui-toggle-label" for="${id}">${escapeHTML(config.label)}</label>`
        + `<div class="ui-toggle-row">${sideOff}<span class="ui-toggle-control"><input id="${id}" name="${escapeHTML(config.name)}" class="ui-toggle-input" type="checkbox" role="switch" ${attributes}><span class="ui-toggle-track" aria-hidden="true"><span class="ui-toggle-knob"></span></span></span>${sideOn}${current}</div>`
        + buildHelpHTML(config)
        + `<div id="${id}-error" class="ui-toggle-error" hidden></div>`
        + '</div>';
}

// Builds one native radio option.
function buildRadioOptionHTML( config, key, text, checked )
{
    const id = escapeHTML(config.id);
    return `<label class="ui-toggle-option" for="${id}-${key}"><input id="${id}-${key}" class="ui-toggle-radio-input" type="radio" name="${escapeHTML(config.name)}" value="${key === 'on' ? 'TRUE' : 'FALSE'}"${checked ? ' checked' : ''}${config.state === 'INACTIVE' ? ' disabled' : ''}><span class="ui-toggle-option-label">${escapeHTML(text)}</span></label>`;
}

// Builds the two native radio buttons in a fieldset named by its legend.
function buildRadioHTML( config )
{
    const id = escapeHTML(config.id);
    const [ on, off ] = stateLabels(config);
    const attributes = [ 'role="radiogroup"', `aria-labelledby="${id}-label"`, config.mandatory ? 'aria-required="true"' : '', config.help ? `aria-describedby="${id}-help"` : '' ].filter(Boolean).join(' ');
    return `<fieldset id="${id}" class="ui-toggle ui-toggle-radio ui-toggle-${config.direction.toLowerCase()}" ${attributes}>`
        + `<legend id="${id}-label" class="ui-toggle-label">${escapeHTML(config.label)}${buildMandatoryIndicatorHTML(config)}</legend>`
        + `<div class="ui-toggle-options">${buildRadioOptionHTML(config,'on',on,config.value === true)}${buildRadioOptionHTML(config,'off',off,config.value === false)}</div>`
        + buildHelpHTML(config)
        + `<div id="${id}-error" class="ui-toggle-error" hidden></div>`
        + '</fieldset>';
}

// Builds Toggle markup for the configured state and presentation; INVISIBLE renders nothing.
function buildMarkup( config )
{
    if ( config.state === 'INVISIBLE' ) { return ''; }
    if ( config.state === 'VIEW' ) { return `<div class="ui-toggle ui-toggle-view"><p class="ui-toggle-label">${escapeHTML(config.label)}</p><p class="ui-toggle-view-value">${escapeHTML(viewText(config,config.value))}</p></div>`; }
    return config.presentation === 'RADIO' ? buildRadioHTML(config) : buildSwitchHTML(config);
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-toggle-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildToggleHTML( config ) { return withLabelPosition(buildMarkup(config),config); }
