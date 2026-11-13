// loaderIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Loader only from this file.
//
// renderLoader(container, config)
//   Renders a Loader for long actions into a dedicated, consumer-owned container and returns
//   { id, start, setValue, setLabel, setStatus, hide, track, getState, destroy }, or null after a developer error.
//
// Nothing is visible until start() or track() (or running:true); then it shows after showDelayMs, stays at least
// minVisibleMs, ends with setStatus('DONE' | 'ERROR' | 'CANCELLED') and hides after hideAfterMs (ERROR stays).
// config.placement OVERLAY covers and blocks config.target (default: the container's parent), which contains the container.
// config.onCancel(instance): the user pressed Cancel (cancellable); the application decides whether to stop the action.
// Callbacks report user actions only (never programmatic calls).
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderLoader } from './loaderComponent.js';
export { DEFAULT_LOADER_CONFIG, LOADER_SHAPES, LOADER_SIZES, LOADER_PLACEMENTS, LOADER_LABEL_PLACEMENTS, LOADER_VALUE_TEXTS, LOADER_INDICATOR_POSITIONS, LOADER_END_STATUSES } from './loaderConfig.js';
