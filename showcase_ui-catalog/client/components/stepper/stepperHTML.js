// stepperHTML.js
//
// GENERATED MARKUP.
// The step list (an ordered list of step buttons, or plain entries when the steps only inform), the compact bar for
// narrow containers, the content panels and the button bar with its Button hosts. Markers and status texts are rebuilt
// by the component whenever a step changes.

// Font Awesome symbols shown in the marker for statuses that have one (NUMBER and ICON markers; DOT shows none).
export const STATUS_SYMBOLS = { DONE:'fa-solid fa-check', SKIPPED:'fa-solid fa-forward', WARNING:'fa-solid fa-exclamation', ERROR:'fa-solid fa-xmark', BLOCKED:'fa-solid fa-lock', CANCELLED:'fa-solid fa-ban' };

// Escapes consumer text before inserting it into generated markup.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Replaces {name} placeholders of a text.
export function fillText( text, values ) { return text.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match)); }

// Builds the inside of a marker: a status symbol, the step's icon, its number, or nothing (DOT).
export function buildMarkerHTML( config, step, status )
{
    if ( config.marker === 'DOT' ) { return ''; }
    const symbol = config.statuses.includes(status) ? STATUS_SYMBOLS[status] : '';
    if ( symbol ) { return `<i class="${symbol}"></i>`; }
    if ( config.marker === 'ICON' && step.icon ) { return `<i class="${escapeHTML(step.icon)}"></i>`; }
    return `<span class="ui-stepper-number">${step.index + 1}</span>`;
}

// Builds one step entry; the marker and the status text are filled by the component.
function buildStepHTML( config, step, interactive )
{
    const base = `${config.id}-step-${step.index}`;
    const optional = step.optional ? ` <span class="ui-stepper-optional">${escapeHTML(config.texts.optional)}</span>` : '';
    const description = step.description ? `<span class="ui-stepper-description">${escapeHTML(step.description)}</span>` : '';
    const hidden = config.labelPlacement === 'HIDDEN';
    const text = `<span class="ui-stepper-text${hidden ? ' ui-stepper-visually-hidden' : ''}"><span id="${base}-label" class="ui-stepper-label">${escapeHTML(step.label)}${optional}</span>${description}<span id="${base}-status" class="ui-stepper-status${config.statusText ? '' : ' ui-stepper-visually-hidden'}"></span></span>`;
    const title = hidden ? hintAttribute(config.tooltipMode,step.label) : '';
    const trigger = interactive
        ? `<button id="${base}" class="ui-stepper-trigger" type="button" tabindex="-1" aria-describedby="${base}-status"${title}><span class="ui-stepper-marker" aria-hidden="true"></span>${text}</button>`
        : `<div id="${base}" class="ui-stepper-trigger"${title}><span class="ui-stepper-marker" aria-hidden="true"></span>${text}</div>`;
    const connector = config.connectors && step.index < config.steps.length - 1 ? '<span class="ui-stepper-connector" aria-hidden="true"></span>' : '';
    const panel = config.showContent && config.contentPosition === 'INLINE' ? buildPanelHTML(config,step) : '';
    return `<li class="ui-stepper-step" data-step="${escapeHTML(step.id)}" data-index="${step.index}">${trigger}${connector}${panel}</li>`;
}

// Builds the (empty) content panel of a step; the component renders the step's content into it.
function buildPanelHTML( config, step )
{
    return `<section id="${config.id}-panel-${step.index}" class="ui-stepper-panel" data-index="${step.index}" aria-labelledby="${config.id}-step-${step.index}-label" tabindex="-1" hidden></section>`;
}

// Builds the button bar: the Loader host (a line above the bar while canLeave answers), Back, the application actions,
// then Skip, Next and Finish (each in its own Button host).
function buildButtonsHTML( config )
{
    const actions = config.actions.length ? `<span class="ui-stepper-actions">${config.actions.map(( action, index ) => `<span class="ui-stepper-action" data-index="${index}"></span>`).join('')}</span>` : '';
    return `<div class="ui-stepper-buttons"><span class="ui-stepper-loader-host"></span><span class="ui-stepper-button" data-button="back"></span>${actions}`
        + `<span class="ui-stepper-forward"><span class="ui-stepper-button" data-button="skip"></span><span class="ui-stepper-button" data-button="next"></span><span class="ui-stepper-button" data-button="finish"></span></span></div>`;
}

// Builds the whole Stepper.
export function buildStepperHTML( config )
{
    const interactive = config.navigation !== 'NONE';
    const classes = [ 'ui-stepper', `ui-stepper-${toClassPart(config.orientation)}`, `ui-stepper-marker-${toClassPart(config.marker)}`, `ui-stepper-label-${toClassPart(config.labelPlacement)}`,
        `ui-stepper-navigation-${toClassPart(config.navigation)}`, config.connectors ? 'ui-stepper-connectors' : '', config.compactWhenNarrow ? 'ui-stepper-compact' : '',
        config.showContent ? `ui-stepper-with-content ui-stepper-content-${toClassPart(config.contentPosition)}` : '' ].filter(Boolean).join(' ');
    const compact = config.compactWhenNarrow ? '<div class="ui-stepper-compact-bar"><span class="ui-stepper-compact-text"></span><span class="ui-stepper-compact-track" aria-hidden="true"><span class="ui-stepper-compact-fill"></span></span></div>' : '';
    const list = `<ol class="ui-stepper-list" aria-label="${escapeHTML(config.ariaLabel || config.texts.stepper)}">${config.steps.map(step => buildStepHTML(config,step,interactive)).join('')}</ol>`;
    const panels = config.showContent && config.contentPosition === 'SEPARATE' ? `<div class="ui-stepper-panels">${config.steps.map(step => buildPanelHTML(config,step)).join('')}</div>` : '';
    const buttons = config.showButtons ? buildButtonsHTML(config) : '';
    const live = interactive ? '<div class="ui-stepper-live ui-stepper-visually-hidden" aria-live="polite"></div>' : '';
    return `<div id="${escapeHTML(config.id)}" class="${classes}">${compact}<div class="ui-stepper-body">${list}${panels}</div>${buttons}${live}</div>`;
}
