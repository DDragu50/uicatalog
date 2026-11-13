// loaderErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Loader can generate. Loader has no user-facing errors: the action it shows belongs
// to the application, which sets the end status and its text.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const LOADER_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:    { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:           { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:             { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:          { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    INVALID_TARGET:        { errorLabel:'INVALID_TARGET', message:'target must be an element that contains the container ({placement}).', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:        { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:        { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    POSITIONED_ANCESTOR:   { errorLabel:'POSITIONED_ANCESTOR', message:'an element between the container and the target is positioned; the {placement} layer covers that element, not the whole target.', source:'developer', severity:'warning', visibility:'console' },
    CANCEL_HANDLER_MISSING:{ errorLabel:'CANCEL_HANDLER_MISSING', message:'cancellable without onCancel; the Cancel button is not shown.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_VALUE:         { errorLabel:'INVALID_VALUE', message:'value "{value}" is not a number; {result}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_STATUS:        { errorLabel:'INVALID_STATUS', message:'status "{value}" is not DONE, ERROR or CANCELLED; the status is not changed.', source:'developer', severity:'warning', visibility:'console' },
    NOT_RUNNING:           { errorLabel:'NOT_RUNNING', message:'{method} is ignored while the Loader is not running (call start() or track() first).', source:'developer', severity:'warning', visibility:'console' },
    INVALID_PROMISE:       { errorLabel:'INVALID_PROMISE', message:'track() needs a Promise (or another object with then()); nothing is shown.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportLoaderIssue( errorLabel, values = {} )
{
    const definition = LOADER_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Loader${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
