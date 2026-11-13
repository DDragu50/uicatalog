// textAreaValidation.js
//
// VALIDATION RULES.
// Pure functions: identify validation errors without display or lifecycle responsibility.

// Validates a value for the interaction mode: "input" (while typing), "blur" or "final".
export function validateTextArea( config, value, mode = 'final' )
{
    const text = String(value ?? '');
    const isEmpty = text.trim() === '';
    if ( config.mandatory && isEmpty ) { return { valid:false, errorLabel:'REQUIRED' }; }
    if ( isEmpty || !config.validation.enabled ) { return { valid:true, errorLabel:null }; }
    if ( text.length < config.validation.minLength ) { return { valid:false, errorLabel:'MIN_LENGTH' }; }
    if ( mode !== 'input' && text.length > config.validation.maxLength ) { return { valid:false, errorLabel:'MAX_LENGTH' }; }
    return { valid:true, errorLabel:null };
}
