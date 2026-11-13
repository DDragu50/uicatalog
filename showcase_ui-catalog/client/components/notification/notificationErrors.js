// notificationErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Notification can generate. Notification has no user errors of its own.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const NOTIFICATION_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:     { errorLabel:'LABEL_REQUIRED', message:'label is required: it is the accessible name (e.g. "Notifications", "Ana Pop").', source:'developer', severity:'error', visibility:'console' },
    CONTENT_REQUIRED:   { errorLabel:'CONTENT_REQUIRED', message:'one main content is required: icon, image or text.', source:'developer', severity:'error', visibility:'console' },
    CONTENT_CONFLICT:   { errorLabel:'CONTENT_CONFLICT', message:'several main contents given; {value} is used (priority: image, icon, text).', source:'developer', severity:'warning', visibility:'console' },
    TEXT_TOO_LONG:      { errorLabel:'TEXT_TOO_LONG', message:'text "{value}" is longer than 12 characters; keep the main text short.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_TOKEN:      { errorLabel:'INVALID_TOKEN', message:'{key} must be a design-token name (e.g. "--c-accent"); the default colours are used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:     { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportNotificationIssue( errorLabel, values = {} )
{
    const definition = NOTIFICATION_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Notification${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
