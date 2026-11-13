// breadcrumbsIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Breadcrumbs only from this file.
//
// renderBreadcrumbs(container, config, onNavigate)
//   Renders the path to the current page and returns { id, getItems, update, destroy }, or null after a developer error.
//   items: [{ label, href?, icon? }] from the top level to the current page (the last item, shown as text).
//   onNavigate({ label, href, index }, event, instance): a level was chosen; links navigate normally unless the
//   application calls event.preventDefault() (event is null for levels chosen in the "…" menu, which navigates itself).
//
// Everything not exported here is internal implementation.

export { renderBreadcrumbs } from './breadcrumbsComponent.js';
export { DEFAULT_BREADCRUMBS_CONFIG, BREADCRUMBS_TOOLTIP_MODES, BREADCRUMBS_SEPARATORS } from './breadcrumbsConfig.js';
