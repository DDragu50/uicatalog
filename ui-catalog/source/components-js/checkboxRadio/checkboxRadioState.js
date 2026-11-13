// checkboxRadioState.js
//
// RUNTIME STATE.
// Only the selection array (mirrors the native checked inputs) and the current validation error.

// Creates independent state for one instance from the normalized initial selection.
export function createCheckboxRadioState( config ) { return { selectedValues:config.options.filter(option => option.selected).map(option => option.value), isDirty:false, error:null }; }

// Returns a copy so consumers never receive the internal array.
export function getSelectedValues( state ) { return [ ...state.selectedValues ]; }

// Replaces the selection with values read from the native inputs.
export function setSelectedValues( state, values ) { state.selectedValues = [ ...values ]; }

// Stores (or clears with null) the current validation error.
export function setCheckboxRadioError( state, error ) { state.error = error; }
