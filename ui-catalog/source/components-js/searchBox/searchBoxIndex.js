// searchBoxIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports SearchBox only from this file.
//
// renderSearchBox(container, config, onSearch)
//   Renders a search field into a dedicated, consumer-owned container and returns
//   { id, getValue, setValue, clear, focus, setBusy, setMessage, destroy }, or null after a developer error.
//
//   onSearch({ query, scopes }, instance)   config.onSearch takes precedence.
//     Fires after a user action changes the effective search: typing (LIVE, debounced), Enter or the
//     Search button (ON_DEMAND), clearing, or a scope change while a query is present.
//     query is trimmed; below minLength it is ''. scopes is an array ([] without scopes, else one value).
//   config.onInput(text, instance): every user edit of the raw text (optional).
//
// SearchBox collects the query only: it never searches, fetches or shows results.
// Programmatic setValue() and clear() fire no callback.
//
// Everything not exported here is internal implementation.

export { renderSearchBox } from './searchBoxComponent.js';
export { DEFAULT_SEARCH_BOX_CONFIG, SEARCH_BOX_TOOLTIP_MODES, SEARCH_BOX_MODES, SEARCH_BOX_LABEL_POSITIONS } from './searchBoxConfig.js';
