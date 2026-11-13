// textAreaState.js
//
// RUNTIME STATE.
// Per-instance runtime values, kept separate from the immutable configuration.

// Creates independent runtime state; the initial value stays available in config.value.
export function createTextAreaState( config ) { return { value:config.value, isDirty:false, error:null, lastResult:null, counterZone:'NORMAL' }; }
