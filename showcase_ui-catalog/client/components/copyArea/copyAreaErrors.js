// copyAreaErrors.js
//
// ERROR CATALOG.
// The user error of CopyArea (the browser refused the copy) and every developer error and warning it can generate.
//
// source:     "component" = a user action the component could not complete; "developer" = configuration or usage.
// severity:   "error" = component not rendered (developer) or action not completed (user); "warning" = value
//             normalized or ignored, rendering continues.
// visibility: corrective (visible until the next copy succeeds); console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const COPY_AREA_ERRORS =
{
    COPY_FAILED: { errorLabel:'COPY_FAILED', source:'component', severity:'error', visibility:'corrective' }
};

export const COPY_AREA_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    CONTENT_REQUIRED:   { errorLabel:'CONTENT_REQUIRED', message:'text (a non-empty string) or content (a render function) is required.', source:'developer', severity:'error', visibility:'console' },
    OPTIONS_CONFLICT:   { errorLabel:'OPTIONS_CONFLICT', message:'{key}: {detail}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:     { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportCopyAreaIssue( errorLabel, values = {} )
{
    const definition = COPY_AREA_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `CopyArea${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
