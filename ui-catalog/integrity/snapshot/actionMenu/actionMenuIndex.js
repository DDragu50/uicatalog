// actionMenuIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports ActionMenu only from this file.
//
// renderActionMenu(container, config, onAction)
//   Renders a "more actions" button (tertiary icon Button, three dots by default) that opens a menu of actions
//   and links; returns { id, open, close, focus, destroy } or null after a developer error.
//
//   onAction(key, instance)   config.onAction takes precedence. Reports the chosen item (links also navigate).
//
// Everything not exported here is internal implementation.

export { renderActionMenu } from './actionMenuComponent.js';
export { DEFAULT_ACTION_MENU_CONFIG, ACTION_MENU_TOOLTIP_MODES, ACTION_MENU_SIZES } from './actionMenuConfig.js';
