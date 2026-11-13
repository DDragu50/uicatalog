// treeViewValidation.js
//
// VALIDATION RULES.
// Only generic rule: a mandatory selection tree (mandatory:true) needs a selected item (SINGLE) or a ticked one (MULTIPLE).

// Returns { valid, errorLabel } for a value ('' or an array of ids).
export function validateTreeSelection( config, value )
{
    const empty = Array.isArray(value) ? value.length === 0 : !value;
    return config.mandatory && empty ? { valid:false, errorLabel:'REQUIRED_SELECTION' } : { valid:true, errorLabel:null };
}
