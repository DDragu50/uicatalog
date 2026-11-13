// uploadFilesErrors.js
//
// ERROR CATALOG.
// User errors of the field (shown under it, in the Form summary), reasons a single file is not added or not uploaded
// (shown in the list next to the file), and developer errors and warnings.
//
// source:     "user" = the user's files or the field's state; "developer" = component configuration or usage.
// severity:   "error" = field invalid / component not rendered; "warning" = value normalized or ignored.
// visibility: field = under the field; file = in the list, next to the file; console = developer messages.
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

import { fillText } from './uploadFilesFiles.js';

export const UPLOAD_FILES_USER_ERRORS =
{
    REQUIRED:       { errorLabel:'REQUIRED', source:'user', severity:'error', visibility:'field' },
    UPLOADS_PENDING:{ errorLabel:'UPLOADS_PENDING', source:'user', severity:'error', visibility:'field' },
    UPLOADS_FAILED: { errorLabel:'UPLOADS_FAILED', source:'user', severity:'error', visibility:'field' },
    EXTERNAL:       { errorLabel:'EXTERNAL', source:'user', severity:'error', visibility:'field' }
};

export const UPLOAD_FILES_FILE_REASONS =
{
    TYPE_NOT_ACCEPTED:{ errorLabel:'TYPE_NOT_ACCEPTED', source:'user', severity:'error', visibility:'file' },
    FILE_TOO_LARGE:   { errorLabel:'FILE_TOO_LARGE', source:'user', severity:'error', visibility:'file' },
    TOTAL_TOO_LARGE:  { errorLabel:'TOTAL_TOO_LARGE', source:'user', severity:'error', visibility:'file' },
    TOO_MANY_FILES:   { errorLabel:'TOO_MANY_FILES', source:'user', severity:'error', visibility:'file' },
    UPLOAD_FAILED:    { errorLabel:'UPLOAD_FAILED', source:'user', severity:'error', visibility:'file' }
};

export const UPLOAD_FILES_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:     { errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:            { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:              { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:           { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:         { errorLabel:'LABEL_REQUIRED', message:'config.label is required (the field and its buttons are named by it).', source:'developer', severity:'error', visibility:'console' },
    UPLOAD_HANDLER_REQUIRED:{ errorLabel:'UPLOAD_HANDLER_REQUIRED', message:'uploadMode "AUTO" needs config.upload(file, { onProgress, signal }) returning a Promise.', source:'developer', severity:'error', visibility:'console' },
    INVALID_OPTION:         { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:         { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACCEPT:         { errorLabel:'INVALID_ACCEPT', message:'accept entry "{value}" is neither an extension (".pdf") nor a type ("image/*", "application/pdf"); dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_FILE_ENTRY:     { errorLabel:'INVALID_FILE_ENTRY', message:'{key}[{index}] is neither a File nor { name, size?, type?, url?, id? }; dropped.', source:'developer', severity:'warning', visibility:'console' },
    UPLOAD_HANDLER_FAILED:  { errorLabel:'UPLOAD_HANDLER_FAILED', message:'upload() for "{value}" did not return a Promise ({reason}); the file is marked as failed.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_FILE:           { errorLabel:'UNKNOWN_FILE', message:'no file with key "{value}".', source:'developer', severity:'warning', visibility:'console' }
};

// Returns the user message of a field error label (texts.errors.{LABEL}; EXTERNAL: the given message).
export function getUploadFilesError( errorLabel, config, external = '' )
{
    const message = errorLabel === 'EXTERNAL' ? external : config.texts.errors[errorLabel] ?? '';
    return { ...UPLOAD_FILES_USER_ERRORS[errorLabel], message };
}

// Returns the reason shown next to a file (texts.reasons.{LABEL}, with {size} and {count} filled).
export function getUploadFilesReason( errorLabel, config, values = {} ) { return fillText(config.texts.reasons[errorLabel] ?? '',values); }

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportUploadFilesIssue( errorLabel, values = {} )
{
    const definition = UPLOAD_FILES_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `UploadFiles${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
