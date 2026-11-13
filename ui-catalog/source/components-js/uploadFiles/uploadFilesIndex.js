// uploadFilesIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports UploadFiles only from this file.
//
// renderUploadFiles(container, config)
//   Renders a form field for files into a dedicated, consumer-owned container and returns
//   { id, name, getValue, setValue, validate, getError, setError, clearError, focus, getLabel, getLabelPosition,
//     getMandatoryState, isDirty, getFiles, addFiles, removeFile, cancelFile, retryFile, isUploading, setDisabled, destroy },
//   or null after a developer error. It follows the form-field contract (Form finds it like any input).
//
// uploadMode FORM: the value is the list of File objects (and the files already saved). AUTO: each file is uploaded
// through config.upload(file, { onProgress(fraction), signal }) returning a Promise of the server's result.
// Callbacks (configuration): onValueChange(value, instance), onFileRejected(file, instance), onUploadsComplete(value,
// instance) — user actions only (never for programmatic calls).
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderUploadFiles } from './uploadFilesComponent.js';
export { DEFAULT_UPLOAD_FILES_CONFIG, UPLOAD_FILES_MODES, UPLOAD_FILES_LAYOUTS, UPLOAD_FILES_CAMERAS, UPLOAD_FILES_LABEL_POSITIONS, UPLOAD_FILES_MANDATORY_INDICATORS, UPLOAD_FILES_TOOLTIP_MODES } from './uploadFilesConfig.js';
