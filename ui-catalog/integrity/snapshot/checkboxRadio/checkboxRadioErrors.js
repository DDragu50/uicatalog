// checkboxRadioErrors.js
//
// ERROR CATALOG.
// Every error CheckboxRadio can generate: the user validation error and all developer errors and warnings.
//
// source:     "validation" = user input rule; "developer" = component configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective (user error, cleared when corrected); console (developer errors and warnings).
// EXTERNAL: set by setError(message) (server or cross-field rules); cleared by a user change or clearError().
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
//
// REQUIRED_SELECTION: raised on a mandatory group (mandatory:true) with [] by validate(), or when the user leaves
// the group after changing it; cleared by a successful validation or automatically by a user selection while
// visible. Message: config.texts.requiredSelection.

export const CHECKBOX_RADIO_ERRORS =
{
    EXTERNAL: { errorLabel:'EXTERNAL', source:'external', severity:'error', visibility:'corrective' },
    REQUIRED_SELECTION: { errorLabel:'REQUIRED_SELECTION', source:'validation', severity:'error', visibility:'corrective' }
};

export const CHECKBOX_RADIO_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:         { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:                { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID: { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:               { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    OPTIONS_REQUIRED:           { errorLabel:'OPTIONS_REQUIRED', message:'config.options must contain at least one option.', source:'developer', severity:'error', visibility:'console' },
    OPTION_VALUE_REQUIRED:      { errorLabel:'OPTION_VALUE_REQUIRED', message:'every option requires a non-empty value.', source:'developer', severity:'error', visibility:'console' },
    OPTION_LABEL_REQUIRED:      { errorLabel:'OPTION_LABEL_REQUIRED', message:'every option requires a non-empty label.', source:'developer', severity:'error', visibility:'console' },
    MULTIPLE_INITIAL_SELECTION: { errorLabel:'MULTIPLE_INITIAL_SELECTION', message:'SINGLE selection allows at most one selected:true option.', source:'developer', severity:'error', visibility:'console' },
    GROUP_LABEL_REQUIRED:       { errorLabel:'GROUP_LABEL_REQUIRED', message:'groupLabel is required when mandatory=true.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:             { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_OPTION_VALUE:     { errorLabel:'DUPLICATE_OPTION_VALUE', message:'duplicate option value "{value}" dropped; the first occurrence is kept.', source:'developer', severity:'warning', visibility:'console' },
    GROUP_LABEL_MISSING:        { errorLabel:'GROUP_LABEL_MISSING', message:'groupLabel is missing; provide an accessible group name (e.g. a surrounding FieldGroup).', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:             { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured user error with its configured message, or null for an unknown label.
export function getCheckboxRadioError( errorLabel, config )
{
    const definition = CHECKBOX_RADIO_ERRORS[errorLabel];
    return definition ? { ...definition, message:config.texts.requiredSelection } : null;
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportCheckboxRadioIssue( errorLabel, values = {} )
{
    const definition = CHECKBOX_RADIO_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `CheckboxRadio${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
