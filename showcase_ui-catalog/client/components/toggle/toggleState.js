// toggleState.js
//
// RUNTIME STATE.
// Per-instance value, dirty flag, busy flag, current error and last validation result.

// Creates independent runtime state; the initial value stays available in config.value.
export function createToggleState( config ) { return { value:config.value, isDirty:false, busy:false, error:null, lastResult:null }; }
