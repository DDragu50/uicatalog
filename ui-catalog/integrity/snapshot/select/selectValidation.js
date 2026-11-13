// selectValidation.js
//
// VALIDATION RULES.
// Only generic rule: a mandatory select needs at least one selected value.

// Returns { valid, errorLabel } for the given selection.
export function validateSelection( config, values ) { return config.mandatory && values.length === 0 ? { valid:false, errorLabel:'REQUIRED' } : { valid:true, errorLabel:null }; }
