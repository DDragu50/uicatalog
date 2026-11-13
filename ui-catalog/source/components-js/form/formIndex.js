// formIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Form only from this file.
//
// renderForm(container, config, children)
//   Renders a form into a dedicated, consumer-owned container and returns
//   { id, getChildren, getFields, getValues, setValues, submit, validate, showErrors, clearErrors, reset, clear,
//     setBusy, isDirty, focus, destroy }, or null after a developer error.
//
// children: ordered array of static HTML strings or functions (host, form) => instance (ContentGroups, inputs, …).
// Form finds its fields among the children and inside containers (getChildren()) through the form-field contract
// (name, getValue, setValue, validate, getError, focus, getLabel, getLabelPosition, getMandatoryState, optional
// setError/clearError); it imports
// no input component. Values are { name: value }.
//
// mode SUBMIT: validate on submit → error summary, or onSubmit(values, form) (a returned promise keeps it busy).
// mode LIVE:   report valid values through onChange(values, form) on Apply (default) or automatically after liveDelayMs.
// onValidate(values, form) returns cross-field errors [{ name, message }]; showErrors() shows server errors.
//
// Everything not exported here is internal implementation.

export { renderForm } from './formComponent.js';
export { DEFAULT_FORM_CONFIG, FORM_MODES, FORM_LIVE_APPLY, FORM_LABEL_POSITIONS, FORM_BUTTONS_ALIGN, FORM_REQUIRED_NOTES, FORM_BUSY_INDICATORS } from './formConfig.js';
