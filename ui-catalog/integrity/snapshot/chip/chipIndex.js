// chipIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Chip only from this file.
//
// buildChip(config) / buildChips(configs)
//   Return complete, static Chip markup (no events). Removable Chips need renderChips().
//
// renderChips(container, chips, onRemove)
//   Renders a managed Chip list into a dedicated, consumer-owned container and returns { setChips, destroy }.
//   config.onRemove(id, chipElement) takes precedence over onRemove(id, chipElement).
//   Chip reports removal requests; the consumer owns the collection.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { buildChip, buildChips, renderChips } from './chipComponent.js';
export { DEFAULT_CHIP_CONFIG, CHIP_TYPES } from './chipConfig.js';
