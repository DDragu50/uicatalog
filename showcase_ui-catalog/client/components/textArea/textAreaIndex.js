// textAreaIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports TextArea only from this file.
//
// renderTextArea(container, config, onValueChange, onValidation)
//   Renders a multi-line plain-text field into a dedicated, consumer-owned container.
//   Returns { id, getValue, getError, setValue, validate, isDirty, focus, destroy } or null after a developer error.
//   validate() and setValue() return { valid, errorLabel }, like every framework input component.
//
//   onValueChange(value, instance): a user edit changed the value (also when truncated to maxLength).
//   onValidation(result, instance): the effective result { valid, errorLabel } changed.
//
// Same input contract as TextInput. Plain text only: no formatting. Characters are counted as the browser
// counts them (a line break counts 1); input beyond maxLength is truncated with a temporary MAX_LENGTH error.
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderTextArea } from './textAreaComponent.js';
export { DEFAULT_TEXTAREA_CONFIG, TEXTAREA_STATES, TEXTAREA_WIDTHS, TEXTAREA_MANDATORY_INDICATORS, TEXTAREA_RESIZE_MODES, TEXTAREA_LABEL_POSITIONS } from './textAreaConfig.js';
