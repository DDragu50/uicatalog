// notificationIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Notification only from this file.
//
// renderNotification(container, config, onClick)
//   Renders a round icon, image or short text with an optional corner indicator (count, dot in four shapes, or text)
//   and returns { id, getElement, setIndicator, setCount, getIndicator, getIndicatorSpeech, setDisabled,
//   destroy }, or null after a
//   developer error. Clickable notifications are tertiary-style buttons; onClick(event, instance) reports clicks.
//
// Everything not exported here is internal implementation.

export { renderNotification } from './notificationComponent.js';
export { DEFAULT_NOTIFICATION_CONFIG, NOTIFICATION_TOOLTIP_MODES, NOTIFICATION_SIZES, NOTIFICATION_INDICATOR_KINDS, NOTIFICATION_SHAPES, NOTIFICATION_TYPES, NOTIFICATION_CORNERS } from './notificationConfig.js';
