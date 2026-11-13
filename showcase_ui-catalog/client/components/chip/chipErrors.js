// chipErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Chip can generate. Chip has no user-facing errors.
//
// source:     "validation" = user input rule; "developer" = component configuration or usage.
// severity:   "error" = component not rendered (or item omitted); "warning" = value normalized or ignored, rendering continues.
// visibility: corrective | temporary | dismissible (user errors); console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const CHIP_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:         { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    CONFIGS_NOT_ARRAY:          { errorLabel:'CONFIGS_NOT_ARRAY', message:'expected an array of configurations.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:             { errorLabel:'LABEL_REQUIRED', message:'config.label is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED_WHEN_REMOVABLE: { errorLabel:'ID_REQUIRED_WHEN_REMOVABLE', message:'id is required when removable=true.', source:'developer', severity:'error', visibility:'console' },
    INVALID_BACKGROUND_TOKEN:   { errorLabel:'INVALID_BACKGROUND_TOKEN', message:'backgroundToken must be a design-system token name such as "--c-surface-muted".', source:'developer', severity:'error', visibility:'console' },
    INVALID_COLOR_TOKEN:        { errorLabel:'INVALID_COLOR_TOKEN', message:'colorToken must be a design-system token name such as "--c-text".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:               { errorLabel:'DUPLICATE_ID', message:'duplicate id in the collection; Chip omitted.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:             { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:         { errorLabel:'INVALID_ICON_CLASS', message:'invalid class names removed from {key}.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:             { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportChipIssue( errorLabel, values = {} )
{
    const definition = CHIP_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Chip${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
