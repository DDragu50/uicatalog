// accordionIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Accordion only from this file.
//
// renderAccordion(container, config)
//   Renders a stack of CollapsiblePanels into a dedicated, consumer-owned container and returns
//   { id, getOpenIds, expand, collapse, expandAll, collapseAll, getPanel, getChildren, focus, destroy },
//   or null after a developer error.
//
// config.items: ordered array of CollapsiblePanel configurations (id, title, …) with an extra "content": the panel's
// children (static HTML strings or functions (host, panel) => instance | null), passed to CollapsiblePanel unchanged.
// config.onChange(openIds, instance): the user opened or closed an item (never for programmatic calls).
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderAccordion } from './accordionComponent.js';
export { DEFAULT_ACCORDION_CONFIG, ACCORDION_TOOLTIP_MODES, ACCORDION_EXPAND_MODES, ACCORDION_LOOKS, ACCORDION_CORNER_RADII } from './accordionConfig.js';
