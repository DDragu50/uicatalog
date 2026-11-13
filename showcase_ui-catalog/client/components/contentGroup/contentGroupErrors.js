// contentGroupErrors.js
//
// ERROR CATALOG.
// Every developer error and warning ContentGroup can generate. ContentGroup has no user-facing errors.
//
// source:     "developer" = component configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).
// Retired: TITLE_REQUIRED (the title became optional; replaced by the NAME_MISSING warning).

export const CONTENT_GROUP_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:       { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:              { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:                { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:             { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:           { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:           { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    NAME_MISSING:             { errorLabel:'NAME_MISSING', message:'the group has no {names} and therefore no accessible name.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_CHILD:            { errorLabel:'INVALID_CHILD', message:'child {index} is neither a string nor a function; ignored.', source:'developer', severity:'warning', visibility:'console' },
    FIELDSET_WITHOUT_CONTROLS:{ errorLabel:'FIELDSET_WITHOUT_CONTROLS', message:'semantic="FIELDSET" but the content has no form controls; use semantic="SECTION".', source:'developer', severity:'warning', visibility:'console' },
    REDUNDANT_GROUP:          { errorLabel:'REDUNDANT_GROUP', message:'the only grouped content is one nested group (e.g. a CheckboxRadio); use it directly or add further inputs.', source:'developer', severity:'warning', visibility:'console' }
};

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportContentGroupIssue( errorLabel, values = {} )
{
    const definition = CONTENT_GROUP_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `ContentGroup${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
