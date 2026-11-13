// calendarErrors.js
//
// ERROR CATALOG.
// Every error Calendar can generate: user validation errors and all developer errors and warnings.
//
// source:     "validation" = user input rule; "component" = unexpected component state; "developer" = configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | dismissible (user errors); console (developer messages).
// EXTERNAL: set by setError(message) (server or cross-field rules); cleared by a user change or clearError().
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// User messages come from config.texts.errors[errorLabel] with {minValue}, {maxValue}, {minRangeDays}, {maxRangeDays}.

export const CALENDAR_ERRORS =
{
    EXTERNAL: { errorLabel:'EXTERNAL', source:'external', severity:'error', visibility:'corrective' },
    REQUIRED:          { errorLabel:'REQUIRED', source:'validation', severity:'error', visibility:'corrective' },
    INVALID_DATE:      { errorLabel:'INVALID_DATE', source:'validation', severity:'error', visibility:'corrective' },
    MIN_VALUE:         { errorLabel:'MIN_VALUE', source:'validation', severity:'error', visibility:'corrective' },
    MAX_VALUE:         { errorLabel:'MAX_VALUE', source:'validation', severity:'error', visibility:'corrective' },
    DISABLED_DATE:     { errorLabel:'DISABLED_DATE', source:'validation', severity:'error', visibility:'corrective' },
    RANGE_INCOMPLETE:  { errorLabel:'RANGE_INCOMPLETE', source:'validation', severity:'error', visibility:'corrective' },
    RANGE_ORDER:       { errorLabel:'RANGE_ORDER', source:'validation', severity:'error', visibility:'corrective' },
    RANGE_TOO_SHORT:   { errorLabel:'RANGE_TOO_SHORT', source:'validation', severity:'error', visibility:'corrective' },
    RANGE_TOO_LONG:    { errorLabel:'RANGE_TOO_LONG', source:'validation', severity:'error', visibility:'corrective' },
    UNIDENTIFIED:      { errorLabel:'UNIDENTIFIED', source:'component', severity:'error', visibility:'dismissible' }
};

export const CALENDAR_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:      { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:             { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:               { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:            { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:          { errorLabel:'LABEL_REQUIRED', message:'label is required.', source:'developer', severity:'error', visibility:'console' },
    NATIVE_TYPE_UNSUPPORTED: { errorLabel:'NATIVE_TYPE_UNSUPPORTED', message:'type="{value}" has no native picker in this browser (month and week inputs exist only in Chromium-based browsers). Use presentation:"CUSTOM", or another type. Not rendered.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:          { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:          { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    NOT_SUPPORTED_NATIVE:    { errorLabel:'NOT_SUPPORTED_NATIVE', message:'{key} cannot be provided by the browser calendar and is not applied; use presentation:"CUSTOM" if it is needed.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_QUICK_RANGE:     { errorLabel:'UNKNOWN_QUICK_RANGE', message:'unknown quick range "{value}" dropped.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured user error with its configured, placeholder-filled message.
export function getCalendarError( errorLabel, config )
{
    const definition = CALENDAR_ERRORS[errorLabel] ?? CALENDAR_ERRORS.UNIDENTIFIED;
    const values = { minValue:config.displayMin, maxValue:config.displayMax, minRangeDays:config.minRangeDays, maxRangeDays:config.maxRangeDays };
    return { ...definition, message:config.texts.errors[definition.errorLabel].replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match)) };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportCalendarIssue( errorLabel, values = {} )
{
    const definition = CALENDAR_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Calendar${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
