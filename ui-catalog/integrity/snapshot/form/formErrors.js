// formErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Form can generate. Form has no user errors of its own: it collects the
// errors of its fields (and of cross-field and server checks) into the error summary.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const FORM_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:    { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:           { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:             { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:          { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    MESSAGE_TARGET_MISSING: { errorLabel:'MESSAGE_TARGET_MISSING', message:'{value} is required for this placement; messages are shown above the form.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:        { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:        { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_CHILD:         { errorLabel:'INVALID_CHILD', message:'child {index} is neither a string nor a function; ignored.', source:'developer', severity:'warning', visibility:'console' },
    FIELD_WITHOUT_NAME:    { errorLabel:'FIELD_WITHOUT_NAME', message:'a field (id "{value}") has no name; it is not included in the values.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_FIELD_NAME:  { errorLabel:'DUPLICATE_FIELD_NAME', message:'field name "{value}" is used more than once; only the first field is used.', source:'developer', severity:'warning', visibility:'console' },
    MIXED_LABEL_POSITIONS: { errorLabel:'MIXED_LABEL_POSITIONS', message:'fields use different label positions ({value}); use the same position for the whole form.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_FIELD:         { errorLabel:'UNKNOWN_FIELD', message:'error for unknown field "{value}"; shown in the summary only.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportFormIssue( errorLabel, values = {} )
{
    const definition = FORM_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Form${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
