// textInputErrors.js
//
// ERROR CATALOG.
// Every error TextInput can generate: user validation errors and all developer errors and warnings.
//
// source:     "validation" = user input rule; "component" = unexpected component state; "developer" = configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective  = visible until the user corrects the cause;
//             temporary   = cause already corrected by the component; visible for errorVisibilityDuration;
//             dismissible = visible until explicitly dismissed;
//             console     = developer errors and warnings, written to the console only.
// EXTERNAL: set by setError(message) (server or cross-field rules); cleared by a user change or clearError().
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// User messages come from config.texts.errors[errorLabel]; developer messages are defined below.

export const TEXTINPUT_ERRORS =
{
    EXTERNAL: { errorLabel:'EXTERNAL', source:'external', severity:'error', visibility:'corrective' },
    REQUIRED:         { errorLabel:'REQUIRED', source:'validation', severity:'error', visibility:'corrective' },
    MIN_LENGTH:       { errorLabel:'MIN_LENGTH', source:'validation', severity:'error', visibility:'corrective' },
    MAX_LENGTH:       { errorLabel:'MAX_LENGTH', source:'validation', severity:'error', visibility:'temporary' },
    INVALID_NUMBER:   { errorLabel:'INVALID_NUMBER', source:'validation', severity:'error', visibility:'corrective' },
    INTEGER_REQUIRED: { errorLabel:'INTEGER_REQUIRED', source:'validation', severity:'error', visibility:'corrective' },
    MIN_VALUE:        { errorLabel:'MIN_VALUE', source:'validation', severity:'error', visibility:'corrective' },
    MAX_VALUE:        { errorLabel:'MAX_VALUE', source:'validation', severity:'error', visibility:'corrective' },
    INVALID_PHONE:    { errorLabel:'INVALID_PHONE', source:'validation', severity:'error', visibility:'corrective' },
    PATTERN:          { errorLabel:'PATTERN', source:'validation', severity:'error', visibility:'corrective' },
    UNIDENTIFIED:     { errorLabel:'UNIDENTIFIED', source:'component', severity:'error', visibility:'dismissible' }
};

export const TEXTINPUT_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:        { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:               { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID: { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:              { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:            { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:        { errorLabel:'INVALID_ICON_CLASS', message:'invalid class names removed from {key}.', source:'developer', severity:'warning', visibility:'console' },
    MIN_LENGTH_CLAMPED:        { errorLabel:'MIN_LENGTH_CLAMPED', message:'validation.minLength is greater than validation.maxLength; minLength set to {fallback}.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:            { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    OPTIONS_CONFLICT:          { errorLabel:'OPTIONS_CONFLICT', message:'iconArea.staticIcon and actions are mutually exclusive; the action takes precedence.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_PATTERN:           { errorLabel:'INVALID_PATTERN', message:'validation.pattern "{value}" is not a valid regular expression; ignored.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACTION:      { errorLabel:'INVALID_ACTION', message:'{key}[{value}] has no key or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ACTION_KEY: { errorLabel:'DUPLICATE_ACTION_KEY', message:'duplicate key "{value}" in {key}; the later action is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ACTION:      { errorLabel:'UNKNOWN_ACTION', message:'no action with key "{value}".', source:'developer', severity:'warning', visibility:'console' },
    ACTION_HANDLER_MISSING: { errorLabel:'ACTION_HANDLER_MISSING', message:'{key} without {callback}; the action Buttons are rendered disabled.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured user error for an error label with its configured, placeholder-filled message.
export function getTextInputError( errorLabel, config )
{
    const definition = TEXTINPUT_ERRORS[errorLabel] ?? TEXTINPUT_ERRORS.UNIDENTIFIED;
    const message = config.texts.errors[definition.errorLabel].replace(/\{(\w+)\}/g,( match, key ) => String(config.validation[key] ?? match));
    return { ...definition, message };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportTextInputIssue( errorLabel, values = {} )
{
    const definition = TEXTINPUT_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `TextInput${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
