// uploadFilesConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization (accept list, limits, files already saved) and developer validation.
// Messages and labels are defined in uploadFilesErrors.js.

import { reportUploadFilesIssue } from './uploadFilesErrors.js';
import { parseAccept, acceptsImages } from './uploadFilesFiles.js';

// FORM: the files stay in the browser and the value is the list of files (the application sends them with the form).
// AUTO: each file is uploaded as soon as it is added, through config.upload; the value is what the server returned.
export const UPLOAD_FILES_MODES = [ 'FORM', 'AUTO' ];
// BUTTON: a "Choose files" button with the list after it. DROPZONE: a large area to drop files on, with the button inside.
export const UPLOAD_FILES_LAYOUTS = [ 'BUTTON', 'DROPZONE' ];
// Phones: NONE (the usual picker: files, gallery, camera), BACK or FRONT (open that camera directly; images only).
export const UPLOAD_FILES_CAMERAS = [ 'NONE', 'BACK', 'FRONT' ];
export const UPLOAD_FILES_LABEL_POSITIONS = [ 'TOP', 'START', 'INHERIT' ];
export const UPLOAD_FILES_MANDATORY_INDICATORS = [ 'NONE', 'OPTIONAL_TEXT', 'MANDATORY_ASTERISK' ];
// How the full name of a cut-off file and the names of the icon buttons show on hover (guidelines §12).
export const UPLOAD_FILES_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

export const DEFAULT_UPLOAD_FILES_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    name:'',
    label:'',
    help:'',
    labelPosition:'TOP',
    mandatory:true,
    mandatoryIndicator:'NONE',
    uploadMode:'FORM',
    layout:'BUTTON',
    multiple:true,
    accept:'',
    maxFiles:null,
    maxFileSize:null,
    maxTotalSize:null,
    showLimits:true,
    showPreviews:false,
    allowPaste:false,
    camera:'NONE',
    initialFiles:[],
    upload:null,
    maxParallel:3,
    disabled:false,
    locale:'',
    texts:
    {
        choose:'Choose files', chooseOne:'Choose file', dropzone:'Drag files here or', dropzoneOne:'Drag a file here or', paste:'You can also paste a file (Ctrl+V).',
        list:'Chosen files', summary:'{count} files, {size}', summaryOne:'1 file, {size}', optional:'(Optional)', required:'required',
        remove:'Remove {name}', cancel:'Cancel the upload of {name}', retry:'Upload {name} again', uploading:'Uploading {name}',
        limitsSize:'up to {size} each', limitsFiles:'at most {count} files', limitsTotal:'up to {size} in total', separator:' · ', or:' or ',
        typeGroups:{ image:'images', video:'videos', audio:'audio files', text:'text files', application:'documents' },
        statuses:{ READY:'', WAITING:'Waiting', UPLOADING:'Uploading {percent}%', DONE:'Uploaded', FAILED:'Not uploaded', CANCELLED:'Upload cancelled', REJECTED:'Not added' },
        added:'{count} files added', addedOne:'{name} added', removed:'{name} removed', uploaded:'{name} uploaded', allUploaded:'All files uploaded', duplicate:'{name} is already in the list', notAdded:'{name}: {reason}',
        reasons:{ TYPE_NOT_ACCEPTED:'This type of file is not accepted.', FILE_TOO_LARGE:'Larger than {size}.', TOTAL_TOO_LARGE:'All files together would be larger than {size}.', TOO_MANY_FILES:'At most {count} files.', UPLOAD_FAILED:'The upload failed. Try again.' },
        errors:{ REQUIRED:'Add a file.', UPLOADS_PENDING:'Wait until the files are uploaded.', UPLOADS_FAILED:'Some files were not uploaded: upload them again or remove them.' }
    },
    onValueChange:null,
    onFileRejected:null,
    onUploadsComplete:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportUploadFilesIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a positive whole number, or null (no limit); warns and falls back for anything else.
function normalizeLimit( id, key, value, fallback = null )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isInteger(number) && number > 0 ) { return number; }
    reportUploadFilesIssue('INVALID_OPTION',{ id, key, value, fallback:fallback ?? 'no limit' });
    return fallback;
}

// Merges consumer UI texts with defaults (one level of nesting for the groups); empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_UPLOAD_FILES_CONFIG.texts).map(( [ key, fallback ] ) =>
    {
        if ( fallback && typeof fallback === 'object' )
        {
            const group = source[key] && typeof source[key] === 'object' ? source[key] : {};
            return [ key, Object.fromEntries(Object.entries(fallback).map(( [ item, value ] ) => [ item, group[item] === undefined || group[item] === null || ( group[item] === '' && value !== '' ) ? value : String(group[item]) ])) ];
        }
        return [ key, String(source[key] ?? '').trim() || fallback ];
    }));
}

// Normalizes a list of entries: File objects, or files already saved { name, size?, type?, url?, previewUrl?, … } (other
// members, e.g. id or result, are kept and returned by getValue).
export function normalizeFileEntries( id, key, list )
{
    return ( Array.isArray(list) ? list : [] ).map(( item, index ) =>
    {
        if ( typeof File !== 'undefined' && item instanceof File ) { return item; }
        if ( item && typeof item === 'object' && String(item.name ?? '').trim() )
        {
            return { ...item, name:String(item.name).trim(), size:item.size !== null && item.size !== undefined && Number.isFinite(Number(item.size)) ? Number(item.size) : null, type:String(item.type ?? '') };
        }
        reportUploadFilesIssue('INVALID_FILE_ENTRY',{ id, key, index });
        return null;
    }).filter(Boolean);
}

// Produces the normalized, immutable configuration consumed by UploadFiles.
export function mergeUploadFilesConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const ignore = ( key, condition ) => { if ( userConfig[key] !== undefined && userConfig[key] !== null ) { reportUploadFilesIssue('OPTION_IGNORED',{ id, key, condition }); } };
    const uploadMode = normalizeEnum(id,'uploadMode',userConfig.uploadMode,UPLOAD_FILES_MODES,DEFAULT_UPLOAD_FILES_CONFIG.uploadMode);
    const multiple = userConfig.multiple !== false;
    const accept = parseAccept(userConfig.accept,value => reportUploadFilesIssue('INVALID_ACCEPT',{ id, value }));
    let camera = normalizeEnum(id,'camera',userConfig.camera,UPLOAD_FILES_CAMERAS,DEFAULT_UPLOAD_FILES_CONFIG.camera);
    if ( camera !== 'NONE' && !acceptsImages(accept) ) { reportUploadFilesIssue('OPTION_IGNORED',{ id, key:`camera "${camera}"`, condition:'accept allows no images' }); camera = 'NONE'; }
    if ( uploadMode !== 'AUTO' ) { [ 'upload', 'maxParallel', 'onUploadsComplete' ].forEach(key => ignore(key,'uploadMode="FORM"')); }
    if ( !multiple ) { [ 'maxFiles', 'maxTotalSize' ].forEach(key => ignore(key,'multiple is false (one file)')); }
    const mandatory = userConfig.mandatory !== false;
    const mandatoryIndicator = normalizeEnum(id,'mandatoryIndicator',userConfig.mandatoryIndicator,UPLOAD_FILES_MANDATORY_INDICATORS,DEFAULT_UPLOAD_FILES_CONFIG.mandatoryIndicator);
    return Object.freeze({
        id,
        name:String(userConfig.name ?? '').trim() || id,
        label:String(userConfig.label ?? '').trim(),
        help:String(userConfig.help ?? '').trim(),
        labelPosition:normalizeEnum(id,'labelPosition',userConfig.labelPosition,UPLOAD_FILES_LABEL_POSITIONS,DEFAULT_UPLOAD_FILES_CONFIG.labelPosition),
        mandatory,
        mandatoryIndicator,
        uploadMode,
        layout:normalizeEnum(id,'layout',userConfig.layout,UPLOAD_FILES_LAYOUTS,DEFAULT_UPLOAD_FILES_CONFIG.layout),
        multiple,
        accept:Object.freeze(accept),
        maxFiles:multiple ? normalizeLimit(id,'maxFiles',userConfig.maxFiles) : 1,
        maxFileSize:normalizeLimit(id,'maxFileSize',userConfig.maxFileSize),
        maxTotalSize:multiple ? normalizeLimit(id,'maxTotalSize',userConfig.maxTotalSize) : null,
        showLimits:userConfig.showLimits !== false,
        showPreviews:Boolean(userConfig.showPreviews),
        allowPaste:Boolean(userConfig.allowPaste),
        camera,
        initialFiles:Object.freeze(normalizeFileEntries(id,'initialFiles',userConfig.initialFiles).filter(item => !( item instanceof File ))),
        upload:uploadMode === 'AUTO' && typeof userConfig.upload === 'function' ? userConfig.upload : null,
        maxParallel:normalizeLimit(id,'maxParallel',userConfig.maxParallel,DEFAULT_UPLOAD_FILES_CONFIG.maxParallel),
        disabled:Boolean(userConfig.disabled),
        locale:String(userConfig.locale ?? '').trim(),
        tooltipMode:normalizeEnum(id,'tooltipMode',userConfig.tooltipMode,UPLOAD_FILES_TOOLTIP_MODES,DEFAULT_UPLOAD_FILES_CONFIG.tooltipMode),
        texts:normalizeTexts(userConfig.texts),
        onValueChange:typeof userConfig.onValueChange === 'function' ? userConfig.onValueChange : null,
        onFileRejected:typeof userConfig.onFileRejected === 'function' ? userConfig.onFileRejected : null,
        onUploadsComplete:uploadMode === 'AUTO' && typeof userConfig.onUploadsComplete === 'function' ? userConfig.onUploadsComplete : null
    });
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateUploadFilesConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportUploadFilesIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportUploadFilesIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportUploadFilesIssue('DUPLICATE_ID',{ id }); }
    if ( !config.label ) { return reportUploadFilesIssue('LABEL_REQUIRED',{ id }); }
    if ( config.uploadMode === 'AUTO' && !config.upload ) { return reportUploadFilesIssue('UPLOAD_HANDLER_REQUIRED',{ id }); }
    return null;
}
