// searchBoxState.js
//
// RUNTIME STATE.
// Per-instance scope, last reported search, busy flag and debounce timer. The raw text lives in the input.

// Creates independent runtime state for one instance.
export function createSearchBoxState( config ) { return { scope:config.defaultScope, reported:{ query:'', scopes:config.defaultScope ? [ config.defaultScope ] : [] }, busy:false, timer:null }; }
