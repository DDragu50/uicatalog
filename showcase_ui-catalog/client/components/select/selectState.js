// selectState.js
//
// RUNTIME STATE.
// Per-instance selection, effective presentation, list state (open, active option, filter) and error.

// Creates independent runtime state from the normalized initial selection.
export function createSelectState( config, presentation )
{
    return { values:config.options.filter(option => option.selected).map(option => option.value), presentation, isDirty:false, error:null, lastResult:null, open:false, activeIndex:-1, filter:'', typeahead:'', typeaheadTimer:null };
}
