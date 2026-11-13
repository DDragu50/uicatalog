// sideNavigationErrors.js
//
// ERROR CATALOG.
// Every developer error and warning SideNavigation can generate. SideNavigation has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const SIDE_NAVIGATION_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    ITEMS_REQUIRED:     { errorLabel:'ITEMS_REQUIRED', message:'items must contain at least one entry.', source:'developer', severity:'error', visibility:'console' },
    INVALID_ITEM:       { errorLabel:'INVALID_ITEM', message:'item at {value} needs an id and a label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ITEM_ID:  { errorLabel:'DUPLICATE_ITEM_ID', message:'item id "{value}" is used more than once; the later item is dropped.', source:'developer', severity:'warning', visibility:'console' },
    RAIL_NEEDS_ICONS:   { errorLabel:'RAIL_NEEDS_ICONS', message:'the rail needs an icon on every top-level item ({value} without icon); the rail is not offered.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ITEM:       { errorLabel:'UNKNOWN_ITEM', message:'no item "{value}"; ignored.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportSideNavigationIssue( errorLabel, values = {} )
{
    const definition = SIDE_NAVIGATION_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `SideNavigation${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
