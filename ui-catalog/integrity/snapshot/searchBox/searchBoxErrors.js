// searchBoxErrors.js
//
// ERROR CATALOG.
// Every developer error and warning SearchBox can generate. SearchBox has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const SEARCH_BOX_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:     { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:            { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:              { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:           { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:         { errorLabel:'LABEL_REQUIRED', message:'label is required (it is the accessible name, also when visually hidden).', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:         { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:         { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_SCOPE:          { errorLabel:'INVALID_SCOPE', message:'scope {index} needs a non-empty value and label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_SCOPE_VALUE:  { errorLabel:'DUPLICATE_SCOPE_VALUE', message:'duplicate scope value "{value}" dropped; the first occurrence is kept.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_SCOPE:          { errorLabel:'UNKNOWN_SCOPE', message:'scope "{value}" does not exist; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportSearchBoxIssue( errorLabel, values = {} )
{
    const definition = SEARCH_BOX_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `SearchBox${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
