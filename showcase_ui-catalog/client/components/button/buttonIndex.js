// buttonIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Button only from this file.
//
// renderButton(container, config, onClick)
//   Renders an interactive Button into a dedicated, consumer-owned container.
//   config.onClick(event, instance) takes precedence over onClick(event, instance).
//   config.href renders a link (<a>) that keeps every browser link feature (open in a new tab, copy address).
//   Returns { id, getElement, isDisabled, setDisabled, setDescription, destroy } or null after a developer error.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively ("icon-button" = "ICON_BUTTON").
//
// Everything not exported here is internal implementation.

export { renderButton } from './buttonComponent.js';
export { DEFAULT_BUTTON_CONFIG, BUTTON_VARIANTS, BUTTON_TYPES, BUTTON_HIERARCHIES, BUTTON_SIZES, BUTTON_WIDTHS, BUTTON_RADII, BUTTON_ICON_RADII, BUTTON_TOOLTIP_MODES, BUTTON_TARGETS } from './buttonConfig.js';
