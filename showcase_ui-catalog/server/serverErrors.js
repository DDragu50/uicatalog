// serverErrors.js
//
// ERROR CATALOG.
// Developer errors and warnings of the local server and the tools (sync, catalog), and their reporter.

// Developer messages written to the terminal; never sent to visitors.
export const SERVER_DEVELOPER_ERRORS =
{
    INVALID_SETTING:         { errorLabel:'INVALID_SETTING', message:'{key}="{value}" in .env is not valid; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    PORT_IN_USE:             { errorLabel:'PORT_IN_USE', message:'port {port} is already used by another program. Stop that program or change PORT in .env.', source:'developer', severity:'error', visibility:'console' },
    SERVER_FAILED:           { errorLabel:'SERVER_FAILED', message:'the server could not start: {reason}', source:'developer', severity:'error', visibility:'console' },
    REQUEST_FAILED:          { errorLabel:'REQUEST_FAILED', message:'{method} {url} failed: {reason}', source:'developer', severity:'error', visibility:'console' },
    CONTACT_STORE_FAILED:    { errorLabel:'CONTACT_STORE_FAILED', message:'a contact message could not be saved: {reason}', source:'developer', severity:'error', visibility:'console' },
    SOURCE_NOT_FOUND:        { errorLabel:'SOURCE_NOT_FOUND', message:'the original library was not found at {path}. Check UI_CATALOG_SOURCE in .env.', source:'developer', severity:'error', visibility:'console' },
    COMPONENTS_NOT_FOUND:    { errorLabel:'COMPONENTS_NOT_FOUND', message:'no components found in {path}. Run "npm run sync" first.', source:'developer', severity:'error', visibility:'console' },
    CATALOG_RULES_INVALID:   { errorLabel:'CATALOG_RULES_INVALID', message:'{path} could not be read: {reason}', source:'developer', severity:'error', visibility:'console' },
    UNKNOWN_COMPONENT:       { errorLabel:'UNKNOWN_COMPONENT', message:'"{value}" in {key} is not a component folder; ignored.', source:'developer', severity:'warning', visibility:'console' },
    DEPENDENCY_CYCLE:        { errorLabel:'DEPENDENCY_CYCLE', message:'components need each other in a circle ({value}); the dependency count stops there.', source:'developer', severity:'warning', visibility:'console' },
    COMPONENT_WITHOUT_GROUP: { errorLabel:'COMPONENT_WITHOUT_GROUP', message:'component "{value}" belongs to no group; it does not appear in the menu.', source:'developer', severity:'warning', visibility:'console' },
    README_MISSING:          { errorLabel:'README_MISSING', message:'component "{value}" has no README; name and summary are missing.', source:'developer', severity:'warning', visibility:'console' },
    ADJUSTMENT_INVALID:      { errorLabel:'ADJUSTMENT_INVALID', message:'{path} could not be loaded: {reason}', source:'developer', severity:'error', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportServerIssue( errorLabel, values = {} )
{
    const definition = SERVER_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Server${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
