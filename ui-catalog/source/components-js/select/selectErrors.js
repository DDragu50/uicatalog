// selectErrors.js
//
// ERROR CATALOG.
// Every error Select can generate: user validation errors and all developer errors and warnings.
//
// source:     "validation" = user input rule; "component" = unexpected component state; "developer" = configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | dismissible (user errors); console (developer messages).
// EXTERNAL: set by setError(message) (server or cross-field rules); cleared by a user change or clearError().
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// User messages come from config.texts.errors[errorLabel]; developer messages are defined below.

export const SELECT_ERRORS =
{
    EXTERNAL: { errorLabel:'EXTERNAL', source:'external', severity:'error', visibility:'corrective' },
    REQUIRED:     { errorLabel:'REQUIRED', source:'validation', severity:'error', visibility:'corrective' },
    UNIDENTIFIED: { errorLabel:'UNIDENTIFIED', source:'component', severity:'error', visibility:'dismissible' }
};

export const SELECT_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:         { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:                { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:                  { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:               { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    OPTIONS_REQUIRED:           { errorLabel:'OPTIONS_REQUIRED', message:'config.options must contain at least one option.', source:'developer', severity:'error', visibility:'console' },
    OPTION_VALUE_REQUIRED:      { errorLabel:'OPTION_VALUE_REQUIRED', message:'every option requires a non-empty value.', source:'developer', severity:'error', visibility:'console' },
    OPTION_LABEL_REQUIRED:      { errorLabel:'OPTION_LABEL_REQUIRED', message:'every option requires a non-empty label.', source:'developer', severity:'error', visibility:'console' },
    MULTIPLE_INITIAL_SELECTION: { errorLabel:'MULTIPLE_INITIAL_SELECTION', message:'SINGLE selection allows at most one selected:true option.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:             { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:             { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_OPTION_VALUE:     { errorLabel:'DUPLICATE_OPTION_VALUE', message:'duplicate option value "{value}" dropped; the first occurrence is kept.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_VALUE:              { errorLabel:'UNKNOWN_VALUE', message:'setValue() received unknown value(s) {value}; ignored.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured user error with its configured message.
export function getSelectError( errorLabel, config )
{
    const definition = SELECT_ERRORS[errorLabel] ?? SELECT_ERRORS.UNIDENTIFIED;
    return { ...definition, message:config.texts.errors[definition.errorLabel] };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportSelectIssue( errorLabel, values = {} )
{
    const definition = SELECT_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Select${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
