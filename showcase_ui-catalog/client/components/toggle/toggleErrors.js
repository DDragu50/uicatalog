// toggleErrors.js
//
// ERROR CATALOG.
// Every error Toggle can generate: user validation errors and all developer errors and warnings.
//
// source:     "validation" = user input rule; "component" = unexpected component state; "developer" = configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | dismissible (user errors); console (developer messages).
// EXTERNAL: set by setError(message) (server or cross-field rules); cleared by a user change or clearError().
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// REQUIRED exists only for the RADIO presentation (an unanswered mandatory question); message config.texts.errors.REQUIRED.

export const TOGGLE_ERRORS =
{
    EXTERNAL: { errorLabel:'EXTERNAL', source:'external', severity:'error', visibility:'corrective' },
    REQUIRED:     { errorLabel:'REQUIRED', source:'validation', severity:'error', visibility:'corrective' },
    UNIDENTIFIED: { errorLabel:'UNIDENTIFIED', source:'component', severity:'error', visibility:'dismissible' }
};

export const TOGGLE_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:  { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:         { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:           { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:        { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:      { errorLabel:'LABEL_REQUIRED', message:'label is required (it names the switch or the question).', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:      { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:      { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    CUSTOM_TEXTS_MISSING:{ errorLabel:'CUSTOM_TEXTS_MISSING', message:'stateText="CUSTOM" needs texts.customOn and texts.customOff; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured user error with its configured message.
export function getToggleError( errorLabel, config )
{
    const definition = TOGGLE_ERRORS[errorLabel] ?? TOGGLE_ERRORS.UNIDENTIFIED;
    return { ...definition, message:config.texts.errors[definition.errorLabel] };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportToggleIssue( errorLabel, values = {} )
{
    const definition = TOGGLE_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Toggle${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
