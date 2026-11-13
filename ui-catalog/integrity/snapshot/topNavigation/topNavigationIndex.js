// topNavigationIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports TopNavigation only from this file.
//
// renderTopNavigation(container, config, onNavigate)
//   Renders the horizontal application navigation from config.items (two levels; the application loads and maps
//   its data) and returns { id, setItems, setCurrent, setBadge, close, destroy }, or null after a developer error.
//
//   onNavigate({ id, label, href, external }, event, instance): a link was chosen; it navigates normally unless the
//   application calls event.preventDefault() (single-page applications).
//
// Everything not exported here is internal implementation.

export { renderTopNavigation } from './topNavigationComponent.js';
export { DEFAULT_TOP_NAVIGATION_CONFIG, TOP_NAVIGATION_TOOLTIP_MODES, TOP_NAVIGATION_CURRENT_STYLES, TOP_NAVIGATION_PANELS } from './topNavigationConfig.js';
