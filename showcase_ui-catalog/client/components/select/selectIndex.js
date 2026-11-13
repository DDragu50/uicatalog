// selectIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Select only from this file.
//
// renderSelect(container, config, onValueChange, onValidation)
//   Renders a single or multiple select into a dedicated, consumer-owned container.
//   Returns { id, getValue, getError, setValue, validate, isDirty, focus, destroy } or null after a developer error.
//   The value is always an array: [] | ['value'] | ['a', 'b'] (option order).
//   validate() and setValue() return { valid, errorLabel }, like every framework input component.
//
//   onValueChange(values, instance): a user action changed the selection.
//   onValidation(result, instance): the effective result { valid, errorLabel } changed.
//
// presentation NATIVE (default) uses the browser <select>; CUSTOM uses an own listbox with styleable option
// colors (design-token names) and optional search. On touch-first devices CUSTOM falls back to NATIVE unless
// touchPresentation is 'AS_CONFIGURED'. Enumerated values are canonical UPPER_CASE, accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderSelect } from './selectComponent.js';
export { DEFAULT_SELECT_CONFIG, SELECT_STATES, SELECT_WIDTHS, SELECT_SELECTION_MODES, SELECT_PRESENTATIONS, SELECT_TOUCH_PRESENTATIONS, SELECT_MANDATORY_INDICATORS, SELECT_LABEL_POSITIONS } from './selectConfig.js';
