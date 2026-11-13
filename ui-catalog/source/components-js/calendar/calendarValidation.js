// calendarValidation.js
//
// VALIDATION RULES.
// Pure functions: identify validation errors without display or lifecycle responsibility.

import { parseValue, toISODate } from './calendarDates.js';

// Returns whether a date value falls on a disabled day (CUSTOM only).
export function isDisabledDay( config, date ) { return config.disabledDaysOfWeek.includes(date.getDay()) || config.disabledDates.includes(toISODate(date)); }

// Validates one value against the type, limits and disabled days.
function validateOne( config, value )
{
    const date = parseValue(config.type,value);
    if ( !date ) { return { valid:false, errorLabel:'INVALID_DATE' }; }
    if ( config.minValue && value < config.minValue ) { return { valid:false, errorLabel:'MIN_VALUE' }; }
    if ( config.maxValue && value > config.maxValue ) { return { valid:false, errorLabel:'MAX_VALUE' }; }
    if ( config.type !== 'TIME' && config.type !== 'MONTH' && config.type !== 'WEEK' && isDisabledDay(config,date) ) { return { valid:false, errorLabel:'DISABLED_DATE' }; }
    return null;
}

// Validates the value; badInput marks text the browser could not turn into a value (native incomplete dates).
export function validateCalendar( config, value, badInput = false )
{
    if ( badInput ) { return { valid:false, errorLabel:'INVALID_DATE' }; }
    if ( !config.range )
    {
        if ( !value ) { return config.mandatory ? { valid:false, errorLabel:'REQUIRED' } : { valid:true, errorLabel:null }; }
        return validateOne(config,value) ?? { valid:true, errorLabel:null };
    }
    const { from, to } = value;
    if ( !from && !to ) { return config.mandatory ? { valid:false, errorLabel:'REQUIRED' } : { valid:true, errorLabel:null }; }
    if ( !from || !to ) { return { valid:false, errorLabel:'RANGE_INCOMPLETE' }; }
    const single = validateOne(config,from) ?? validateOne(config,to);
    if ( single ) { return single; }
    if ( to < from ) { return { valid:false, errorLabel:'RANGE_ORDER' }; }
    const days = Math.round(( parseValue('DATE',to.slice(0,10)) - parseValue('DATE',from.slice(0,10)) ) / 86400000) + 1;
    if ( config.minRangeDays && days < config.minRangeDays ) { return { valid:false, errorLabel:'RANGE_TOO_SHORT' }; }
    if ( config.maxRangeDays && days > config.maxRangeDays ) { return { valid:false, errorLabel:'RANGE_TOO_LONG' }; }
    return { valid:true, errorLabel:null };
}
