// stepperIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Stepper only from this file.
//
// renderStepper(container, config)
//   Renders a task as ordered steps into a dedicated, consumer-owned container and returns
//   { id, getCurrent, goTo, getSteps, getStepStatus, setStepStatus, setStepDisabled, setActionDisabled, getChildren, focus, destroy },
//   or null after a developer error.
//
// config.steps: ordered array of { id, label, description?, icon?, status?, optional?, disabled?, after?, content? }.
// config.canLeave(stepId, action, instance): asked before Next and Finish; false (or a Promise of false) keeps the step open.
// config.onStepChange(stepId, { previousId, reason }, instance), onStatusChange(stepId, status, instance), onFinish(instance):
// user actions only (never for programmatic calls).
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderStepper } from './stepperComponent.js';
export { DEFAULT_STEPPER_CONFIG, STEPPER_TOOLTIP_MODES, STEPPER_ORIENTATIONS, STEPPER_MARKERS, STEPPER_LABEL_PLACEMENTS, STEPPER_NAVIGATIONS, STEPPER_CONTENT_POSITIONS, STEPPER_STATUSES } from './stepperConfig.js';
