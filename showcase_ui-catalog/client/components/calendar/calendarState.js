// calendarState.js
//
// RUNTIME STATE.
// Per-instance value, dirty flag, error, last validation result, segment parts and typing buffers per field,
// unparseable input per field and (CUSTOM) the open dialog's field, zoom level and view.

// Creates independent runtime state; the initial value stays available in config.value.
export function createCalendarState( config )
{
    return { value:config.range ? { ...config.value } : config.value, isDirty:false, error:null, lastResult:null, parts:{}, buffers:{}, badInput:{}, open:false, activePart:null, level:'DAYS', viewDate:null, focusDate:null, rendering:false };
}
