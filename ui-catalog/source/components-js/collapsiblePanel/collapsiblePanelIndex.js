// collapsiblePanelIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports CollapsiblePanel only from this file.
//
// renderCollapsiblePanel(container, config, children)
//   Renders one panel into a dedicated, consumer-owned container and returns
//   { id, getState, getStatus, expand, collapse, toggle, focus, refreshSummary, setStatus, getChildren, destroy }
//   or null after a developer error.
//
// children (panel content): ordered array; each item is either a string (trusted static HTML) or a
// function (host, instance) => childInstance | null that renders any component into its own host.
// A single string is accepted as one child. Children are rendered once (on the first expansion with
// lazyContent) and destroyed with the panel. The panel imports no content component.
//
// Configured Chips and Buttons are composed through their public APIs; their configuration,
// validation and interactions remain owned by those components.
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderCollapsiblePanel } from './collapsiblePanelComponent.js';
export { DEFAULT_COLLAPSIBLE_PANEL_CONFIG, COLLAPSIBLE_PANEL_TOOLTIP_MODES, COLLAPSIBLE_PANEL_STATES, COLLAPSIBLE_PANEL_STATUSES, COLLAPSIBLE_PANEL_VARIANTS, COLLAPSIBLE_PANEL_HEADING_LEVELS } from './collapsiblePanelConfig.js';
