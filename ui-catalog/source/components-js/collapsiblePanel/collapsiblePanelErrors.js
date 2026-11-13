// collapsiblePanelErrors.js
//
// ERROR CATALOG.
// Every developer error and warning CollapsiblePanel can generate. It has no user-facing errors.
//
// source:     "validation" = user input rule; "developer" = component configuration or usage.
// severity:   "error" = component not rendered (or item omitted); "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | temporary | dismissible (user errors); console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const COLLAPSIBLE_PANEL_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    TITLE_REQUIRED:     { errorLabel:'TITLE_REQUIRED', message:'title is required.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS: { errorLabel:'INVALID_ICON_CLASS', message:'{key} contains invalid CSS class tokens; they are dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_COLLECTION: { errorLabel:'INVALID_COLLECTION', message:'{key} must be an array; ignored.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:     { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_CHILD:      { errorLabel:'INVALID_CHILD', message:'content child {index} is neither a string nor a function; ignored.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_STATUS:     { errorLabel:'INVALID_STATUS', message:'invalid status "{value}"; status unchanged.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACTION:      { errorLabel:'INVALID_ACTION', message:'{key}[{value}] has no key or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ACTION_KEY: { errorLabel:'DUPLICATE_ACTION_KEY', message:'duplicate key "{value}" in {key}; the later action is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ACTION:      { errorLabel:'UNKNOWN_ACTION', message:'no action with key "{value}".', source:'developer', severity:'warning', visibility:'console' },
    ACTION_HANDLER_MISSING: { errorLabel:'ACTION_HANDLER_MISSING', message:'{key} without {callback}; the action Buttons are rendered disabled.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportCollapsiblePanelIssue( errorLabel, values = {} )
{
    const definition = COLLAPSIBLE_PANEL_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `CollapsiblePanel${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
