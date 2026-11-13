// appErrors.js
//
// ERROR CATALOG.
// User errors shown by the application pages, developer errors and warnings, and their reporter.

import { APP_TEXTS } from './appConfig.js';

// User errors: shown on the page; messages come from APP_TEXTS.errors.
export const APP_ERRORS =
{
    NOT_FOUND:            { errorLabel:'NOT_FOUND', source:'component', severity:'error', visibility:'corrective' },
    CONTENT_UNAVAILABLE:  { errorLabel:'CONTENT_UNAVAILABLE', source:'component', severity:'error', visibility:'corrective' },
    CATALOG_UNAVAILABLE:  { errorLabel:'CATALOG_UNAVAILABLE', source:'component', severity:'error', visibility:'corrective' },
    CONTACT_RATE_LIMITED: { errorLabel:'CONTACT_RATE_LIMITED', source:'component', severity:'error', visibility:'dismissible' },
    CONTACT_FAILED:       { errorLabel:'CONTACT_FAILED', source:'component', severity:'error', visibility:'dismissible' },
    VALUE_INVALID:        { errorLabel:'VALUE_INVALID', source:'validation', severity:'error', visibility:'corrective' },
    NUMBER_INVALID:       { errorLabel:'NUMBER_INVALID', source:'validation', severity:'error', visibility:'corrective' }
};

// Developer errors and warnings: written to the browser console only.
export const APP_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:     { errorLabel:'CONTAINER_REQUIRED', message:'the page host element "{value}" is missing in index.html.', source:'developer', severity:'error', visibility:'console' },
    CATALOG_LOAD_FAILED:    { errorLabel:'CATALOG_LOAD_FAILED', message:'{url} could not be loaded ({reason}). Run "npm run setup" and reload.', source:'developer', severity:'error', visibility:'console' },
    CONTENT_LOAD_FAILED:    { errorLabel:'CONTENT_LOAD_FAILED', message:'{url} could not be loaded ({reason}).', source:'developer', severity:'warning', visibility:'console' },
    SHELL_RENDER_FAILED:    { errorLabel:'SHELL_RENDER_FAILED', message:'{value} was not rendered; see its own message above.', source:'developer', severity:'error', visibility:'console' },
    CONTACT_REQUEST_FAILED: { errorLabel:'CONTACT_REQUEST_FAILED', message:'the contact message was not accepted ({reason}).', source:'developer', severity:'warning', visibility:'console' },
    ADJUSTMENT_LOAD_FAILED: { errorLabel:'ADJUSTMENT_LOAD_FAILED', message:'{url} could not be loaded ({reason}); the panel uses the README only.', source:'developer', severity:'warning', visibility:'console' },
    PREVIEW_UNAVAILABLE:    { errorLabel:'PREVIEW_UNAVAILABLE', message:'preview.html did not start for "{value}"; the live example is empty.', source:'developer', severity:'error', visibility:'console' },
    PREVIEW_RENDER_FAILED:  { errorLabel:'PREVIEW_RENDER_FAILED', message:'the live example of "{value}" failed: {reason}', source:'developer', severity:'error', visibility:'console' }
};

// Returns a user error { errorLabel, message, source, severity, visibility } with its message from APP_TEXTS.errors.
export function getAppError( errorLabel ) { return { ...APP_ERRORS[errorLabel], message:APP_TEXTS.errors[errorLabel] }; }

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportAppIssue( errorLabel, values = {} )
{
    const definition = APP_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `App${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
