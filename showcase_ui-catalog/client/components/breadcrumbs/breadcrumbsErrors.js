// breadcrumbsErrors.js
//
// ERROR CATALOG.
// Every developer error and warning Breadcrumbs can generate. Breadcrumbs has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const BREADCRUMBS_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    ITEMS_REQUIRED:     { errorLabel:'ITEMS_REQUIRED', message:'items must contain at least one entry with a label.', source:'developer', severity:'error', visibility:'console' },
    INVALID_ITEM:       { errorLabel:'INVALID_ITEM', message:'item {index} has no label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    LINK_MISSING:       { errorLabel:'LINK_MISSING', message:'item "{value}" is not the current page but has no href; shown as text.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_SIBLING:    { errorLabel:'INVALID_SIBLING', message:'level "{value}" has siblings without label or href; they are dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportBreadcrumbsIssue( errorLabel, values = {} )
{
    const definition = BREADCRUMBS_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Breadcrumbs${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
