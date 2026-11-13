// checkboxRadioIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports CheckboxRadio only from this file.
//
// renderCheckboxRadio(container, config, onValueChange)
//   Creates an interactive instance and returns { id, getValue, getError, validate, focus, destroy },
//   or null after a developer configuration error (nothing is rendered).
//
// onValueChange(values, instance)
//   Fires only after a user-generated change of the effective selection.
//   values is always a new array: SINGLE → [] | [value], MULTIPLE → zero or more values.
//
// Mandatory selection (mandatory:true, the default) means at least one selected option, in both modes.
// The error is shown by validate(), or when the user leaves the group after changing it; it is not announced
// by the component: the consumer combines errors (e.g. an error summary) and uses focus().
//
// Everything not exported here is internal implementation.

export { renderCheckboxRadio } from './checkboxRadioComponent.js';
export { DEFAULT_CHECKBOX_RADIO_CONFIG, CHECKBOX_RADIO_SELECTION_MODES, CHECKBOX_RADIO_PRESENTATIONS, CHECKBOX_RADIO_DIRECTIONS, CHECKBOX_RADIO_ICON_VARIANTS, CHECKBOX_RADIO_ICON_SIZES, CHECKBOX_RADIO_MANDATORY_INDICATORS, CHECKBOX_RADIO_LABEL_POSITIONS } from './checkboxRadioConfig.js';
