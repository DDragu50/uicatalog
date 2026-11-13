// buttonErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Button can generate. Button has no user-facing errors.
//
// source:     "validation" = user input rule; "developer" = component configuration or usage.
// severity:   "error" = component not rendered (or item omitted); "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | temporary | dismissible (user errors); console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const BUTTON_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:  { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:         { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID: { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:        { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:      { errorLabel:'LABEL_REQUIRED', message:'label is required when buttonVariant="BUTTON".', source:'developer', severity:'error', visibility:'console' },
    ICON_REQUIRED:       { errorLabel:'ICON_REQUIRED', message:'icon is required when buttonVariant="ICON_BUTTON".', source:'developer', severity:'error', visibility:'console' },
    ARIA_LABEL_REQUIRED: { errorLabel:'ARIA_LABEL_REQUIRED', message:'ariaLabel is required when buttonVariant="ICON_BUTTON".', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:      { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:  { errorLabel:'INVALID_ICON_CLASS', message:'invalid class names removed from {key}.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:      { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    UNSAFE_HREF:         { errorLabel:'UNSAFE_HREF', message:'href with a javascript:, data: or vbscript: address is refused; the link has no address.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportButtonIssue( errorLabel, values = {} )
{
    const definition = BUTTON_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Button${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
