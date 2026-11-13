// notificationsPanelIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports NotificationsPanel only from this file.
//
// renderNotificationsPanel(container, config)
//   Renders a bell with the unread count that opens a panel with the latest notifications; returns { id,
//   setNotifications, addNotification, markRead, markAllRead, getUnreadCount, getNotifications, open, close, getBell,
//   destroy }, or null after a developer error.
//   onOpen(item, event, instance): a notification was chosen (marked as read when markReadOnOpen); links navigate
//   unless event.preventDefault(). onMarkAllRead(instance), onSeeAll(event, instance), onToggle(open, instance).
//
// Everything not exported here is internal implementation.

export { renderNotificationsPanel } from './notificationsPanelComponent.js';
export { DEFAULT_NOTIFICATIONS_PANEL_CONFIG, NOTIFICATIONS_PANEL_TOOLTIP_MODES } from './notificationsPanelConfig.js';
