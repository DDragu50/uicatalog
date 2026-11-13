// checkboxRadioValidation.js
//
// VALIDATION RULES.
// Only generic rule: a mandatory group (mandatory:true) needs at least one selected option. No presentation responsibility.

// Returns { valid, errorLabel } for the given selection.
export function validateSelection( config, selectedValues )
{
    if ( !config.mandatory || selectedValues.length > 0 ) { return { valid:true, errorLabel:null }; }
    return { valid:false, errorLabel:'REQUIRED_SELECTION' };
}
