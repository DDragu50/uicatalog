// paginationErrors.js
//
// ERROR CATALOG.
// Every error Pagination can generate: the go-to-page input error and all developer errors and warnings.
//
// source:     "validation" = user input rule; "developer" = component configuration or usage.
// severity:   "error" = user error shown, or component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective (until the input changes); console (developer messages).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const PAGINATION_ERRORS =
{
    INVALID_PAGE: { errorLabel:'INVALID_PAGE', source:'validation', severity:'error', visibility:'corrective' }
};

export const PAGINATION_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED: { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:        { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:          { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:       { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:     { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:     { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    PAGE_OUT_OF_RANGE:  { errorLabel:'PAGE_OUT_OF_RANGE', message:'currentPage {value} is outside 1–{fallback}; the nearest page is used.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the structured go-to-page error with its message (placeholder {totalPages}).
export function getPaginationError( errorLabel, config, totalPages )
{
    return { ...PAGINATION_ERRORS[errorLabel], message:config.texts.errors[errorLabel].replace('{totalPages}',new Intl.NumberFormat(config.locale).format(totalPages)) };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportPaginationIssue( errorLabel, values = {} )
{
    const definition = PAGINATION_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `Pagination${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
