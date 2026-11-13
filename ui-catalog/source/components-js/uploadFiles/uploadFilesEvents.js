// uploadFilesEvents.js
//
// USER INTERACTIONS.
// Files chosen in the browser's picker, files dropped on the drop area (with its highlight while files are dragged over
// it), files pasted while focus is inside the field (allowPaste), and focus leaving the field. Returns the AbortController.

// Returns the files of a DataTransfer (drop or paste), or [].
function filesOf( transfer ) { return transfer ? [ ...( transfer.files ?? [] ) ] : []; }

// Returns whether a drag carries files (not text or links).
function carriesFiles( event ) { return [ ...( event.dataTransfer?.types ?? [] ) ].includes('Files'); }

// Registers the listeners. handlers: onFiles(files, source 'PICKER' | 'DROP' | 'PASTE'), onLeave(), isDisabled().
export function registerUploadFilesEvents( root, input, dropzone, allowPaste, handlers )
{
    const controller = new AbortController();
    const options = { signal:controller.signal };
    input.addEventListener('change',() => { const files = [ ...( input.files ?? [] ) ]; input.value = ''; if ( files.length ) { handlers.onFiles(files,'PICKER'); } },options);
    if ( dropzone )
    {
        let depth = 0;
        const setOver = over => dropzone.classList.toggle('ui-upload-files-dragover',over);
        dropzone.addEventListener('dragenter',event => { if ( !carriesFiles(event) || handlers.isDisabled() ) { return; } event.preventDefault(); depth++; setOver(true); },options);
        dropzone.addEventListener('dragover',event => { if ( !carriesFiles(event) || handlers.isDisabled() ) { return; } event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; },options);
        dropzone.addEventListener('dragleave',() => { depth = Math.max(0,depth - 1); if ( !depth ) { setOver(false); } },options);
        dropzone.addEventListener('drop',event =>
        {
            if ( !carriesFiles(event) ) { return; }
            event.preventDefault(); depth = 0; setOver(false);
            if ( !handlers.isDisabled() ) { const files = filesOf(event.dataTransfer); if ( files.length ) { handlers.onFiles(files,'DROP'); } }
        },options);
    }
    if ( allowPaste )
    {
        root.addEventListener('paste',event =>
        {
            const files = filesOf(event.clipboardData);
            if ( !files.length || handlers.isDisabled() ) { return; }
            event.preventDefault();
            handlers.onFiles(files,'PASTE');
        },options);
    }
    root.addEventListener('focusout',event => { if ( !root.contains(event.relatedTarget) ) { handlers.onLeave(); } },options);
    return controller;
}
