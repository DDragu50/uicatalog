// textInputValidation.js
//
// VALIDATION RULES.
// Pure functions: identify validation errors without display or lifecycle responsibility.

// Characters allowed in a phone number: digits, spaces, "+", "-", "(" and ")"; at least one digit.
const PHONE_CHARACTERS = /^(?=.*\d)[\d\s+()-]+$/;

// Validates a non-empty numerical value.
function validateNumber( config, value )
{
    const number = Number(value.trim());
    if ( !Number.isFinite(number) ) { return { valid:false, errorLabel:'INVALID_NUMBER' }; }
    if ( config.validation.numberType === 'INTEGER' && !Number.isInteger(number) ) { return { valid:false, errorLabel:'INTEGER_REQUIRED' }; }
    if ( config.validation.minValue !== null && number < config.validation.minValue ) { return { valid:false, errorLabel:'MIN_VALUE' }; }
    if ( config.validation.maxValue !== null && number > config.validation.maxValue ) { return { valid:false, errorLabel:'MAX_VALUE' }; }
    return { valid:true, errorLabel:null };
}

// Validates a value for the interaction mode: "input" (while typing), "blur" or "final".
export function validateTextInput( config, value, mode = 'final' )
{
    const text = String(value ?? '');
    const isEmpty = text.trim() === '';
    if ( config.mandatory && isEmpty ) { return { valid:false, errorLabel:'REQUIRED' }; }
    if ( isEmpty || !config.validation.enabled ) { return { valid:true, errorLabel:null }; }
    if ( config.type === 'NUMBER' ) { return mode === 'input' ? { valid:true, errorLabel:null } : validateNumber(config,text); }
    if ( text.length < config.validation.minLength ) { return { valid:false, errorLabel:'MIN_LENGTH' }; }
    if ( mode !== 'input' && text.length > config.validation.maxLength ) { return { valid:false, errorLabel:'MAX_LENGTH' }; }
    if ( config.type === 'TEL' && !PHONE_CHARACTERS.test(text.trim()) ) { return { valid:false, errorLabel:'INVALID_PHONE' }; }
    if ( config.validation.pattern && !config.validation.pattern.test(text) ) { return { valid:false, errorLabel:'PATTERN' }; }
    return { valid:true, errorLabel:null };
}
