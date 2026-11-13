// uploadFiles.js
//
// CUSTOMIZATION ADJUSTMENTS (UploadFiles).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/uploadFiles.html: the field "Attachments" with a help text, PDF or images up to 10 MB.
// Choose files from your computer or drop them on the drop area; the Output shows the value and the callbacks.
// uploadMode AUTO: the example uploads with a simulated server (2 s per file, progress in 10 steps); a file whose name
// contains "fail" is refused by it, so Retry and the UPLOADS_FAILED error can be tried.
// Variants panel (decision 118: only options with a visible effect): first the panel-only option scenario (decision 184),
// which sets layout, multiple and initialFiles for the four typical cases —
//   NEW_BUTTON      nothing saved yet, the button only (layout BUTTON, several files; the default)
//   NEW_DROPZONE    nothing saved yet, with the drop area (layout DROPZONE)
//   SAVED_SINGLE    one file already saved, replaced by the next one chosen (multiple false, initialFiles with one file)
//   SAVED_MULTIPLE  several files already saved (initialFiles with two files, the first with a link)
// then uploadMode, accept, maxFiles, maxFileSize, maxTotalSize, maxParallel, showLimits, showPreviews, allowPaste,
// camera, mandatory, mandatoryIndicator, labelPosition, tooltipMode, disabled.
// Hidden: layout, multiple and initialFiles (set by scenario), id, name, label and help (fixed sample texts), locale,
// texts; upload is set here. No Examples section: the four cases are chosen in the panel.

// Simulated server: progress in 10 steps over 2 s; a name containing "fail" fails; Cancel (signal) stops it.
function simulateUpload( file, { onProgress, signal } )
{
    return new Promise(( resolve, reject ) =>
    {
        let step = 0;
        const timer = setInterval(() =>
        {
            step++;
            onProgress(step / 10);
            if ( step < 10 ) { return; }
            clearInterval(timer);
            if ( /fail/i.test(file.name) ) { reject({ userMessage:'The server refused this file.' }); return; }
            resolve({ id:`file-${Math.random().toString(36).slice(2,8)}` });
        },200);
        signal.addEventListener('abort',() => { clearInterval(timer); reject(new DOMException('Aborted','AbortError')); });
    });
}

const SAVED = [ { id:'c-17', name:'signed-contract-2026-final-version.pdf', size:482000, type:'application/pdf', url:'#contract' }, { id:'c-18', name:'notes.txt', size:1200, type:'text/plain' } ];

const SCENARIOS =
{
    NEW_BUTTON:{},
    NEW_DROPZONE:{ layout:'DROPZONE' },
    SAVED_SINGLE:{ multiple:false, label:'Signed contract', initialFiles:[ SAVED[0] ] },
    SAVED_MULTIPLE:{ label:'Contract and notes', initialFiles:SAVED }
};

export default
{
    show:[ 'scenario', 'uploadMode', 'accept', 'maxFiles', 'maxFileSize', 'maxTotalSize', 'maxParallel', 'showLimits', 'showPreviews', 'allowPaste', 'camera',
        'mandatory', 'mandatoryIndicator', 'labelPosition', 'tooltipMode', 'disabled' ],
    fields:
    [
        { path:'scenario', kind:'enum', allowed:Object.keys(SCENARIOS), defaultValue:'NEW_BUTTON',
            description:'Typical case: nothing saved yet with the button only or with the drop area (layout), one saved file that the next one replaces (multiple false), or several saved files (initialFiles).' }
    ],
    valueLabels:{ labelPosition:{ START:'LEFT' }, scenario:{ NEW_BUTTON:'Not saved yet, button only', NEW_DROPZONE:'Not saved yet, with drop area', SAVED_SINGLE:'Saved, one file (replaceable)', SAVED_MULTIPLE:'Saved, several files' } },
    start:{ label:'Attachments', help:'Attach the signed contract and any photos of the damage.', accept:'.pdf,image/*', maxFileSize:10000000 },
    // camera applies only when accept allows images (an empty accept allows every file, images included).
    // maxFiles and maxTotalSize apply only with several files (every scenario except SAVED_SINGLE).
    appliesWhen:{ maxFiles:values => values.scenario !== 'SAVED_SINGLE', maxTotalSize:values => values.scenario !== 'SAVED_SINGLE', camera:values => { const accept = String(values.accept ?? '').toLowerCase(); return !accept.trim() || /image\/|\.(png|jpe?g|gif|webp|heic|avif|bmp|svg)\b/.test(accept); } },
    // upload is the simulated server set in prepare(), never reported as a callback.
    callbacks:{ upload:false },
    uses:[ 'tooltip' ],
    // Turns scenario into layout, multiple, label and initialFiles; AUTO: hands the field the simulated server.
    prepare:( { config } ) =>
    {
        const scenario = SCENARIOS[config.scenario] ?? SCENARIOS.NEW_BUTTON;
        delete config.scenario;
        Object.assign(config,scenario);
        if ( config.uploadMode === 'AUTO' ) { config.upload = simulateUpload; }
        return [ config ];
    }
};
