// badgeIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Badge only from this file.
//
// renderBadge(container, config, onClick)
//   Renders a Notification (picture, icon or initials with an optional indicator) with a name and an optional
//   role/description; returns { id, getElement, getNotification, setName, setDescription, setIndicator, setCount,
//   destroy }, or null after a developer error. With href the badge is a link, with onClick a button.
//
// Everything not exported here is internal implementation.

export { renderBadge } from './badgeComponent.js';
export { DEFAULT_BADGE_CONFIG, BADGE_TOOLTIP_MODES, BADGE_LAYOUTS, BADGE_SIZES } from './badgeConfig.js';
