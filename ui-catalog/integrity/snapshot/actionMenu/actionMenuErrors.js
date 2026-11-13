// actionMenuErrors.js
//
// ERROR CATALOG.
// Every developer error and warning ActionMenu can generate. ActionMenu has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const ACTION_MENU_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:  { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:         { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:           { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:        { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    ITEMS_REQUIRED:      { errorLabel:'ITEMS_REQUIRED', message:'config.items must contain at least one action.', source:'developer', severity:'error', visibility:'console' },
    INVALID_ITEM:        { errorLabel:'INVALID_ITEM', message:'item {index} needs a key and a label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ITEM_KEY:  { errorLabel:'DUPLICATE_ITEM_KEY', message:'duplicate item key "{value}" dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:      { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportActionMenuIssue( errorLabel, values = {} )
{
    const definition = ACTION_MENU_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `ActionMenu${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
