// tooltipErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Tooltip can generate. Tooltip has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const TOOLTIP_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:{ errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:       { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:         { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:      { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    TARGET_REQUIRED:   { errorLabel:'TARGET_REQUIRED', message:'target (an element) or targets ({ within, selector }) is required.', source:'developer', severity:'error', visibility:'console' },
    CONTAINER_IN_TARGET:{ errorLabel:'CONTAINER_IN_TARGET', message:'the container is inside the target; put it next to the target (a button or link cannot hold the tooltip).', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:    { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:    { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    TEXT_REQUIRED:     { errorLabel:'TEXT_REQUIRED', message:'the tooltip has no text; it is not shown until setText() gives one.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportTooltipIssue( errorLabel, values = {} )
{
    const definition = TOOLTIP_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Tooltip${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
