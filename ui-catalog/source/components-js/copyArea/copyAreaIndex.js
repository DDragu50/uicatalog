// copyAreaIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports CopyArea only from this file.
//
// renderCopyArea(container, config, onCopy)
//   Renders an area with a Copy button: code or a plain text (text, textStyle CODE | PLAIN), or content the
//   application renders (content: (host, instance) => instance | null). The button copies the content (or copyValue)
//   to the clipboard and shows "Copied"; when the browser refuses, a message appears and the content is selected.
//   config.onCopy(result, instance) takes precedence over onCopy; result is { copied, text, errorLabel? }.
//   Returns { id, getElement, getError, setText, setCopyValue, getChildren, destroy } or null after a developer error.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively ("plain" = "PLAIN").
//
// Everything not exported here is internal implementation.

export { renderCopyArea } from './copyAreaComponent.js';
export { DEFAULT_COPY_AREA_CONFIG, COPY_AREA_TEXT_STYLES, COPY_AREA_BUTTONS, COPY_AREA_TOOLTIP_MODES } from './copyAreaConfig.js';
