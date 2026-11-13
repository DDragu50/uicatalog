// uploadFilesState.js
//
// RUNTIME STATE.
// The files in the list, in order, each with its status (READY, WAITING, UPLOADING, DONE, FAILED, CANCELLED, REJECTED),
// progress, reason, server result and preview address; whether the user changed the field; the current error and the
// external error; whether a batch of uploads is running (for onUploadsComplete).

export function createUploadFilesState()
{
    return { entries:[], nextKey:1, dirty:false, error:null, external:'', disabled:false, batch:false };
}

// Statuses whose file is part of the value (FORM: READY; AUTO: DONE; files already saved are DONE in both modes).
export const IN_VALUE = { FORM:[ 'READY', 'DONE' ], AUTO:[ 'DONE' ] };

// Returns a new entry for a File (status from the mode) or a file already saved (DONE).
export function createEntry( state, source, status )
{
    const file = typeof File !== 'undefined' && source instanceof File ? source : null;
    return {
        key:`f${state.nextKey++}`,
        file,
        saved:file ? null : source,
        name:file ? file.name : source.name,
        size:file ? file.size : source.size,
        type:file ? file.type : source.type,
        status:file ? status : 'DONE',
        progress:0,
        reason:'',
        reasonLabel:'',
        result:null,
        previewUrl:file ? '' : source.previewUrl || '',
        controller:null,
        nodes:null
    };
}

// Returns the sum of the sizes of the entries that count (in the value, waiting or uploading).
export function usedSize( state ) { return state.entries.filter(entry => entry.status !== 'REJECTED' && entry.status !== 'FAILED' && entry.status !== 'CANCELLED').reduce(( sum, entry ) => sum + ( entry.size || 0 ),0); }

// Returns the number of entries that count towards maxFiles (everything except rejected, failed and cancelled files).
export function usedCount( state ) { return state.entries.filter(entry => entry.status !== 'REJECTED' && entry.status !== 'FAILED' && entry.status !== 'CANCELLED').length; }
