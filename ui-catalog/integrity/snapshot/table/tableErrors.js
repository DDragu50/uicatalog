// tableErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Table can generate. Table has no user errors of its own (data-loading
// errors are reported by the application through setError()).
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const TABLE_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:     { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:            { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:              { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:           { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    COLUMNS_REQUIRED:       { errorLabel:'COLUMNS_REQUIRED', message:'config.columns must contain at least one column with a field.', source:'developer', severity:'error', visibility:'console' },
    INVALID_COLUMN:         { errorLabel:'INVALID_COLUMN', message:'column {index} has no field; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_COLUMN_FIELD: { errorLabel:'DUPLICATE_COLUMN_FIELD', message:'duplicate column field "{value}" dropped.', source:'developer', severity:'warning', visibility:'console' },
    NO_ALWAYS_COLUMN:       { errorLabel:'NO_ALWAYS_COLUMN', message:'no column has priority "ALWAYS"; the first column is always visible.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:         { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:     { errorLabel:'INVALID_ICON_CLASS', message:'{key} contains invalid CSS class tokens; they are dropped.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:         { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    ROW_ID_MISSING:         { errorLabel:'ROW_ID_MISSING', message:'{value} row(s) without id; selection needs a unique id per row.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ROW_ID:       { errorLabel:'DUPLICATE_ROW_ID', message:'row id "{value}" is used more than once; selection may be wrong.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACTION:      { errorLabel:'INVALID_ACTION', message:'{key}[{value}] has no key or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ACTION_KEY: { errorLabel:'DUPLICATE_ACTION_KEY', message:'duplicate key "{value}" in {key}; the later action is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ACTION:      { errorLabel:'UNKNOWN_ACTION', message:'no action with key "{value}".', source:'developer', severity:'warning', visibility:'console' },
    ACTION_HANDLER_MISSING: { errorLabel:'ACTION_HANDLER_MISSING', message:'{key} without {callback}; the action Buttons are rendered disabled.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportTableIssue( errorLabel, values = {} )
{
    const definition = TABLE_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Table${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
