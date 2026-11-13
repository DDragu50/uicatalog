// stepperErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Stepper can generate. Stepper has no user-facing errors: checking a step is the
// application's job (canLeave), and the application shows its own messages.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const STEPPER_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:{ errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:       { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:         { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:      { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    STEPS_REQUIRED:    { errorLabel:'STEPS_REQUIRED', message:'steps must contain at least one step with an id and a label.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:    { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:    { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:{ errorLabel:'INVALID_ICON_CLASS', message:'{key} contains invalid CSS class tokens; they are dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_STEP:      { errorLabel:'INVALID_STEP', message:'steps[{value}] has no id or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_STEP_ID: { errorLabel:'DUPLICATE_STEP_ID', message:'duplicate step id "{value}"; the later step is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_STEP:      { errorLabel:'UNKNOWN_STEP', message:'no step with id "{value}"{where}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_STATUS:    { errorLabel:'INVALID_STATUS', message:'status "{value}" of step "{step}" is not in statuses; {result}.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_STATUS:    { errorLabel:'UNKNOWN_STATUS', message:'statuses[{index}] "{value}" is not a status; dropped.', source:'developer', severity:'warning', visibility:'console' },
    CIRCULAR_AFTER:    { errorLabel:'CIRCULAR_AFTER', message:'the "after" rules of step "{value}" lead back to it; the rule is dropped (the step follows the previous one).', source:'developer', severity:'warning', visibility:'console' },
    INVALID_CHILD:     { errorLabel:'INVALID_CHILD', message:'content {index} of step "{value}" is neither a string nor a function; ignored.', source:'developer', severity:'warning', visibility:'console' },
    CAN_LEAVE_FAILED:  { errorLabel:'CAN_LEAVE_FAILED', message:'canLeave failed for step "{value}": {reason}; the step stays open.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACTION:    { errorLabel:'INVALID_ACTION', message:'{key}[{value}] has no key or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ACTION_KEY:{ errorLabel:'DUPLICATE_ACTION_KEY', message:'duplicate key "{value}" in {key}; the later action is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ACTION:    { errorLabel:'UNKNOWN_ACTION', message:'no action with key "{value}".', source:'developer', severity:'warning', visibility:'console' },
    ACTION_HANDLER_MISSING:{ errorLabel:'ACTION_HANDLER_MISSING', message:'{key} without {callback}; the action Buttons are rendered disabled.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportStepperIssue( errorLabel, values = {} )
{
    const definition = STEPPER_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? ( key === 'where' ? '' : match )));
    const text = `Stepper${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
