// tooltipIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Tooltip only from this file.
//
// renderTooltip(container, config)
//   Renders a tooltip for config.target (an element) or for every element of config.targets ({ within, selector, text? })
//   into a dedicated, consumer-owned container placed next to the target (not inside a button or link), and returns
//   { id, setText, show, hide, setDisabled, getState, destroy }, or null after a developer error.
//
// It shows when the pointer rests on the target, on keyboard focus, or after a long press (longPress), one tooltip at a
// time; Escape hides it. No callbacks: a tooltip reports nothing to the application.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderTooltip } from './tooltipComponent.js';
export { DEFAULT_TOOLTIP_CONFIG, TOOLTIP_PURPOSES, TOOLTIP_PLACEMENTS, TOOLTIP_TONES } from './tooltipConfig.js';
