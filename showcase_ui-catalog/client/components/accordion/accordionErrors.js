// accordionErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Accordion can generate. Accordion has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// Errors of an item's CollapsiblePanel configuration are reported by CollapsiblePanel itself.

export const ACCORDION_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:{ errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:       { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:         { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:      { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    ITEMS_REQUIRED:    { errorLabel:'ITEMS_REQUIRED', message:'items must be a non-empty array of panel configurations.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:    { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:    { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ITEM:      { errorLabel:'INVALID_ITEM', message:'item {index} is not a panel configuration object; ignored.', source:'developer', severity:'warning', visibility:'console' },
    ITEM_NOT_RENDERED: { errorLabel:'ITEM_NOT_RENDERED', message:'item {index} was not rendered (see the CollapsiblePanel message above).', source:'developer', severity:'warning', visibility:'console' },
    SINGLE_EXPANDED:   { errorLabel:'SINGLE_EXPANDED', message:'expandMode="SINGLE" allows one open item; only "{value}" starts expanded.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ITEM:      { errorLabel:'UNKNOWN_ITEM', message:'no item with id "{value}".', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportAccordionIssue( errorLabel, values = {} )
{
    const definition = ACCORDION_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Accordion${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
