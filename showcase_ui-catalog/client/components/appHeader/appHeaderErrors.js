// appHeaderErrors.js
//
// ERROR CATALOG.
// Every developer error and warning AppHeader can generate. AppHeader has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const APP_HEADER_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    CONTENT_REQUIRED:   { errorLabel:'CONTENT_REQUIRED', message:'nothing to show: configure at least one element (announcement, logo, appName, search, user, settings, auth, navigation, breadcrumbs, …).', source:'developer', severity:'error', visibility:'console' },
    LOGO_ALT_MISSING:   { errorLabel:'LOGO_ALT_MISSING', message:'logo.alt is empty; the logo is treated as decorative (use appName or give the logo a text alternative).', source:'developer', severity:'warning', visibility:'console' },
    BRAND_MENU_HOST:    { errorLabel:'BRAND_MENU_HOST', message:'background BRAND with menuHost: the menu Button rendered there by SideNavigation is tertiary and may be hard to see on the accent colour; prefer SURFACE.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:     { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportAppHeaderIssue( errorLabel, values = {} )
{
    const definition = APP_HEADER_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `AppHeader${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
