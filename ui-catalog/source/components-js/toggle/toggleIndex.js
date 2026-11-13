// toggleIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Toggle only from this file.
//
// renderToggle(container, config, onValueChange, onValidation)
//   Renders a yes/no decision into a dedicated, consumer-owned container.
//   Returns { id, getValue, getError, setValue, validate, isDirty, focus, setBusy, destroy } or null after a developer error.
//   SWITCH: value true | false (always answered; never invalid). RADIO: value true | false | null (unanswered);
//   a mandatory unanswered RADIO is invalid (REQUIRED). validate() and setValue() return { valid, errorLabel }.
//
//   onValueChange(value, instance): a user action changed the value (not setValue()).
//   onValidation(result, instance): the effective result { valid, errorLabel } changed.
//
// setBusy(true) blocks toggling while the page saves an immediate-effect setting; revert with setValue() on failure.
// Both presentations use native inputs only; no other framework component is used.
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderToggle } from './toggleComponent.js';
export { DEFAULT_TOGGLE_CONFIG, TOGGLE_PRESENTATIONS, TOGGLE_STATES, TOGGLE_STATE_TEXTS, TOGGLE_STATE_DISPLAYS, TOGGLE_SIZES, TOGGLE_DIRECTIONS, TOGGLE_MANDATORY_INDICATORS, TOGGLE_LABEL_POSITIONS } from './toggleConfig.js';
