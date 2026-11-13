// messageIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Message only from this file.
//
// renderMessage(container, config)
//   Renders a message and returns { id, show, hide, isVisible, update, focus, destroy }, or null after a developer error.
//   type: INFO | SUCCESS | WARNING | DANGER | CUSTOM; layout: INLINE | BLOCK | BANNER | TOAST | MODAL.
//   For TOAST, container is the toast area provided once by the application (messages stack in its corner region).
//   onClose(reason, instance): reason USER (close Button), TIMEOUT (duration), ESCAPE (modal) or ACTION (modal Button).
//   onAction(key, instance): an action Button was pressed (a modal then closes).
//
// Everything not exported here is internal implementation.

export { renderMessage } from './messageComponent.js';
export { DEFAULT_MESSAGE_CONFIG, MESSAGE_TOOLTIP_MODES, MESSAGE_TYPES, MESSAGE_LAYOUTS, MESSAGE_CORNERS } from './messageConfig.js';
