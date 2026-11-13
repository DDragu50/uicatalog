// textInputIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports TextInput only from this file.
//
// renderTextInput(container, config, onValueChange, onValidation)
//   Renders an interactive TextInput into a dedicated, consumer-owned container.
//   Returns { id, getValue, getError, setValue, validate, isDirty, focus, destroy } or null after a developer error.
//   validate() and setValue() return { valid, errorLabel }, like every framework input component.
//
//   Errors are shown on blur only after the user changed the value, and always on validate()/setValue().
//   The field announces nothing itself: the consumer combines errors (e.g. an error summary) and uses focus().
//
//   onValueChange(value, instance)
//     Fires after a user-generated change of the value. When active maxLength validation truncates
//     the input, it fires with the truncated value only if that value differs from the previous one.
//
//   onValidation(result, instance)
//     Fires only when the effective validation result { valid, errorLabel } changes.
//
// Programmatic values (initial config.value and setValue()) are truncated to maxLength when text
// validation is enabled; they never mark the component dirty and never invoke onValueChange.
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderTextInput } from './textInputComponent.js';
export { DEFAULT_TEXTINPUT_CONFIG, TEXTINPUT_TOOLTIP_MODES, TEXTINPUT_STATES, TEXTINPUT_TYPES, TEXTINPUT_WIDTHS, TEXTINPUT_NUMBER_TYPES, TEXTINPUT_INPUT_MODES, TEXTINPUT_MANDATORY_INDICATORS, TEXTINPUT_LABEL_POSITIONS } from './textInputConfig.js';
