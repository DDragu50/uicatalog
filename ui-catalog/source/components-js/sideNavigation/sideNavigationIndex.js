// sideNavigationIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports SideNavigation only from this file.
//
// renderSideNavigation(container, config, onNavigate)
//   Renders the vertical application navigation from config.items (the application loads and maps its data)
//   and returns { id, setItems, setCurrent, setBadge, getExpandedIds, isRail, setRail, openDrawer, closeDrawer,
//   destroy }, or null after a developer error.
//
//   onNavigate({ id, label, href, external }, event, instance): a link was chosen; it navigates normally unless the
//   application calls event.preventDefault() (single-page applications). onRailChange(rail) and
//   onExpandChange(expandedIds) report user choices so the application can remember them.
//
// Everything not exported here is internal implementation.

export { renderSideNavigation } from './sideNavigationComponent.js';
export { DEFAULT_SIDE_NAVIGATION_CONFIG, SIDE_NAVIGATION_TOOLTIP_MODES, SIDE_NAVIGATION_LEVEL_STYLES } from './sideNavigationConfig.js';
