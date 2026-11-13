// contentGroupIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports ContentGroup only from this file.
//
// renderContentGroup(container, config, children)
//   Renders a titled group into a dedicated, consumer-owned container and returns
//   { id, getChildren, destroy }, or null after a developer error.
//
// children: ordered array; each item is either
//   - a string: trusted static HTML, or
//   - a function (host, instance) => childInstance | null: renders any component into its own host.
// ContentGroup imports no other component; it keeps returned child instances and destroys them first.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderContentGroup } from './contentGroupComponent.js';
export { DEFAULT_CONTENT_GROUP_CONFIG, CONTENT_GROUP_SEMANTICS, CONTENT_GROUP_DIRECTIONS } from './contentGroupConfig.js';
