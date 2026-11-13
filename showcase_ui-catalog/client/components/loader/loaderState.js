// loaderState.js
//
// RUNTIME STATE.
// Per-instance status (IDLE, RUNNING, DONE, ERROR, CANCELLED), whether the indicator is shown and since when, the
// value (null: indeterminate), the texts in use, the last milestone announced, the token of the tracked Promise and the
// timers. The blocking of an OVERLAY target (inert elements, saved focus) is held separately by the component.

export function createLoaderState( config )
{
    return {
        status:'IDLE',
        visible:false,
        shownAt:0,
        value:null,
        label:config.label || config.texts.loading,
        detail:'',           // the application's own value text (setValue(value, text))
        endText:'',
        milestone:0,
        token:0,
        cancelPressed:false,
        timers:{ show:null, hide:null }
    };
}

// Returns the share done, from 0 to 1 (0 when indeterminate).
export function progressOf( state, config ) { return state.value === null ? 0 : state.value / config.max; }
