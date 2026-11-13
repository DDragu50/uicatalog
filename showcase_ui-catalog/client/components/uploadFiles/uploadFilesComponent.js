// uploadFilesComponent.js
//
// COMPONENT COORDINATOR.
// A form field for files: chosen with a Button (the hidden native file input), dropped on the drop area, pasted
// (allowPaste) or taken with the phone's camera (camera). Each file is checked (type, size, count, total size; duplicates
// are ignored) and listed with a preview or type icon, its name, size and status. FORM keeps the files for the form;
// AUTO uploads each one through config.upload (at most maxParallel at a time), with a Loader bar, Cancel and Retry.
// Follows the form-field contract (§10.1). Buttons and Loaders are declared dependencies created through their entry
// points; the Tooltip is loaded only with tooltipMode TOOLTIP. The container is a dedicated, consumer-owned mount point.

import { mergeUploadFilesConfig, validateUploadFilesConfig, normalizeFileEntries } from './uploadFilesConfig.js';
import { buildUploadFilesHTML, buildEntryHTML } from './uploadFilesHTML.js';
import { createUploadFilesState, createEntry, IN_VALUE, usedSize, usedCount } from './uploadFilesState.js';
import { registerUploadFilesEvents } from './uploadFilesEvents.js';
import { getUploadFilesError, getUploadFilesReason, reportUploadFilesIssue } from './uploadFilesErrors.js';
import { fillText, formatSize, isAccepted, isPreviewable } from './uploadFilesFiles.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderLoader } from '../loader/loaderIndex.js';

// tooltipMode TOOLTIP (guidelines §12): one Tooltip for the elements with data-tooltip that belong to this component
// (the nearest component around them; hints inside a nested component are left to it), in a host after the component;
// the Tooltip module is loaded only then (if it cannot be loaded, the browser reports it and the hints stay without a
// tooltip). Returns the function that removes it.
function attachHintTooltip( container, id, mode, options = {} )
{
    if ( mode !== 'TOOLTIP' ) { return () => {}; }
    const scope = container.firstElementChild;
    scope?.setAttribute('data-tooltip-scope',id);
    const host = document.createElement('span');
    host.className = 'ui-tooltip-host';
    container.appendChild(host);
    let tooltip = null, removed = false;
    import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
    {
        if ( removed ) { return; }
        tooltip = renderTooltip(host,{ id:`${id}-tooltip`, targets:{ within:container, selector:'[data-tooltip]', text:element => ( element.closest('[data-tooltip-scope]') === scope ? element.getAttribute('data-tooltip') : '' ) }, ...options });
    }).catch(() => {});
    return () => { removed = true; tooltip?.destroy(); host.remove(); scope?.removeAttribute('data-tooltip-scope'); };
}

// Renders an UploadFiles field and returns its runtime instance, or null after a developer error.
export function renderUploadFiles( container, config )
{
    if ( !container ) { reportUploadFilesIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeUploadFilesConfig(config);
    if ( validateUploadFilesConfig(merged) ) { return null; }

    container.innerHTML = buildUploadFilesHTML(merged);
    const root = container.querySelector('.ui-upload-files');
    const input = root.querySelector('.ui-upload-files-input');
    const list = root.querySelector('.ui-upload-files-list');
    const summary = root.querySelector('.ui-upload-files-summary');
    const errorElement = root.querySelector('.ui-upload-files-error');
    const live = root.querySelector('.ui-upload-files-live');
    const alert = root.querySelector('.ui-upload-files-alert');
    const state = createUploadFilesState();
    const auto = merged.uploadMode === 'AUTO', t = merged.texts;
    // Hints of this component default to TITLE (file names): its icon Buttons get only TOOLTIP (guidelines §12).
    const iconTooltip = merged.tooltipMode === 'TOOLTIP' ? 'TOOLTIP' : 'NONE';
    let chooseButton = null, controller = null, instance = null, destroyed = false, removeHintTooltip = () => {};
    state.disabled = merged.disabled;

    const find = key => state.entries.find(entry => entry.key === String(key)) ?? null;
    const sizeText = bytes => formatSize(bytes,merged.locale);
    const active = entry => entry.status === 'WAITING' || entry.status === 'UPLOADING';

    // Writes a text into a live region (a repeated text gets a trailing no-break space, so it is announced again).
    function announce( region, text ) { region.textContent = text && text === region.textContent ? `${text} ` : text; }

    // Returns the value: FORM — the File objects and copies of the files already saved; AUTO — the uploaded files as
    // { name, size, type, result } and copies of the files already saved; in list order.
    function currentValue()
    {
        return state.entries.filter(entry => IN_VALUE[merged.uploadMode].includes(entry.status)).map(entry =>
        {
            if ( entry.saved ) { return { ...entry.saved }; }
            return auto ? { name:entry.name, size:entry.size, type:entry.type, result:entry.result } : entry.file;
        });
    }
    const valueKey = () => state.entries.filter(entry => IN_VALUE[merged.uploadMode].includes(entry.status)).map(entry => entry.key).join(',');

    // Returns a copy of an entry for the application.
    function publicEntry( entry )
    {
        return { key:entry.key, name:entry.name, size:entry.size, type:entry.type, status:entry.status, progress:Math.round(entry.progress * 100), reason:entry.reason, errorLabel:entry.reasonLabel || null, result:entry.result, saved:Boolean(entry.saved) };
    }

    // Links the choose Button to the label, the limits, the help and the error.
    function describe()
    {
        const button = chooseButton?.getElement();
        if ( !button ) { return; }
        button.setAttribute('aria-labelledby',`${merged.id}-label ${button.id}`);
        const ids = [ root.querySelector('.ui-upload-files-limits') ? `${merged.id}-limits` : '', merged.help ? `${merged.id}-help` : '', state.error ? `${merged.id}-error` : '' ].filter(Boolean);
        if ( ids.length ) { button.setAttribute('aria-describedby',ids.join(' ')); } else { button.removeAttribute('aria-describedby'); }
    }

    // Shows or clears the field error.
    function showError( error )
    {
        state.error = error;
        errorElement.textContent = error?.message ?? '';
        errorElement.hidden = !error;
        root.classList.toggle('ui-upload-files-invalid',Boolean(error));
        describe();
    }

    // Returns the field's validation result { valid, errorLabel } (external error, uploads running, failed uploads, required).
    function check()
    {
        if ( state.external ) { return { valid:false, errorLabel:'EXTERNAL' }; }
        if ( state.entries.some(active) ) { return { valid:false, errorLabel:'UPLOADS_PENDING' }; }
        if ( auto && state.entries.some(entry => entry.status === 'FAILED') ) { return { valid:false, errorLabel:'UPLOADS_FAILED' }; }
        if ( merged.mandatory && !currentValue().length ) { return { valid:false, errorLabel:'REQUIRED' }; }
        return { valid:true, errorLabel:null };
    }

    // Validates and shows the result.
    function runValidation()
    {
        const result = check();
        showError(result.valid ? null : getUploadFilesError(result.errorLabel,merged,state.external));
        return result;
    }

    // Updates the list's visibility and the summary line ("3 files, 4.2 MB").
    function refreshList()
    {
        list.hidden = !state.entries.length;
        const counted = state.entries.filter(entry => IN_VALUE[merged.uploadMode].includes(entry.status));
        const size = counted.reduce(( sum, entry ) => sum + ( entry.size || 0 ),0);
        summary.hidden = !merged.multiple || counted.length === 0;
        summary.textContent = fillText(counted.length === 1 ? t.summaryOne : t.summary,{ count:counted.length, size:sizeText(size) });
    }

    // After any change: list and summary; a value changed by the user is reported (onValueChange) and makes the field
    // dirty (the external error goes); a shown error is checked again (it clears as soon as its cause disappears).
    function afterChange( user )
    {
        refreshList();
        const key = valueKey(), changed = key !== state.lastKey;
        state.lastKey = key;
        if ( changed && user )
        {
            state.dirty = true;
            state.external = '';
            merged.onValueChange?.(currentValue(),instance);
        }
        if ( state.error ) { runValidation(); }
    }

    // Writes an entry's status, reason, progress and Buttons.
    function paint( entry )
    {
        const nodes = entry.nodes;
        if ( !nodes ) { return; }
        nodes.li.dataset.status = entry.status;
        nodes.status.textContent = entry.saved ? '' : fillText(t.statuses[entry.status] ?? '',{ percent:Math.round(entry.progress * 100) });
        nodes.reason.textContent = entry.reason;
        nodes.reason.hidden = !entry.reason;
        const show = ( name, visible ) => { nodes.hosts[name].hidden = !visible; nodes.buttons[name]?.setDisabled(state.disabled); };
        show('retry',auto && Boolean(entry.file) && ( entry.status === 'FAILED' || entry.status === 'CANCELLED' ));
        show('cancel',active(entry));
        show('remove',!active(entry));
        if ( entry.status === 'UPLOADING' )
        {
            if ( !nodes.loader ) { nodes.loader = renderLoader(nodes.progress,{ id:`${merged.id}-${entry.key}-loader`, size:'SMALL', labelPlacement:'HIDDEN', valueText:'NONE', announceEvery:0, showDelayMs:0, minVisibleMs:0, hideAfterMs:0, label:fillText(t.uploading,{ name:entry.name }) }); }
            if ( nodes.loader?.getState().status !== 'RUNNING' ) { nodes.loader?.start(); }
            nodes.loader?.setValue(entry.progress * 100);
        }
        else if ( nodes.loader?.getState().status === 'RUNNING' ) { nodes.loader.hide(); }
    }

    // Adds an entry's list item with its Buttons.
    function addNode( entry )
    {
        list.insertAdjacentHTML('beforeend',buildEntryHTML(merged,entry));
        const li = list.lastElementChild;
        const nodes = { li, status:li.querySelector('.ui-upload-files-status'), reason:li.querySelector('.ui-upload-files-reason'), progress:li.querySelector('.ui-upload-files-progress'), hosts:{}, buttons:{}, loader:null };
        entry.nodes = nodes;
        [ [ 'retry', 'fa-solid fa-rotate-right', t.retry, () => retry(entry,true) ], [ 'cancel', 'fa-solid fa-ban', t.cancel, () => cancel(entry,true) ], [ 'remove', 'fa-solid fa-xmark', t.remove, () => remove(entry,true) ] ].forEach(( [ name, icon, text, onClick ] ) =>
        {
            nodes.hosts[name] = li.querySelector(`[data-button="${name}"]`);
            nodes.buttons[name] = renderButton(nodes.hosts[name],{ id:`${merged.id}-${entry.key}-${name}`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon, ariaLabel:fillText(text,{ name:entry.name }), tooltipMode:iconTooltip },onClick);
        });
        paint(entry);
    }

    // Removes an entry's list item, its Buttons, its Loader and its preview.
    function dropNode( entry )
    {
        const nodes = entry.nodes;
        if ( entry.ownPreview && entry.previewUrl ) { URL.revokeObjectURL(entry.previewUrl); }
        if ( !nodes ) { return; }
        Object.values(nodes.buttons).forEach(button => button?.destroy());
        nodes.loader?.destroy();
        nodes.li.remove();
        entry.nodes = null;
    }

    // Starts the waiting uploads while fewer than maxParallel run; reports the end of a batch (onUploadsComplete).
    function pump()
    {
        if ( !auto || destroyed ) { return; }
        while ( state.entries.filter(entry => entry.status === 'UPLOADING').length < merged.maxParallel )
        {
            const next = state.entries.find(entry => entry.status === 'WAITING');
            if ( !next ) { break; }
            start(next);
        }
        if ( state.batch && !state.entries.some(active) )
        {
            const user = state.batchUser;
            state.batch = false; state.batchUser = false;
            if ( state.batchCount > 1 && state.entries.every(entry => entry.status !== 'FAILED') ) { announce(live,t.allUploaded); }
            state.batchCount = 0;
            if ( user ) { merged.onUploadsComplete?.(currentValue(),instance); }
        }
    }

    // Uploads one file through config.upload(file, { onProgress, signal }).
    function start( entry )
    {
        const abort = new AbortController();
        Object.assign(entry,{ status:'UPLOADING', progress:0, reason:'', reasonLabel:'', controller:abort });
        state.batch = true; state.batchCount = ( state.batchCount ?? 0 ) + 1; state.batchUser = state.batchUser || entry.user;
        paint(entry);
        const current = () => !destroyed && entry.controller === abort;
        const failed = reason =>
        {
            Object.assign(entry,{ status:'FAILED', controller:null, reasonLabel:'UPLOAD_FAILED', reason:reason || getUploadFilesReason('UPLOAD_FAILED',merged) });
            announce(alert,fillText(t.notAdded,{ name:entry.name, reason:entry.reason }));
            paint(entry); afterChange(entry.user); pump();
        };
        let pending;
        try { pending = merged.upload(entry.file,{ signal:abort.signal, onProgress:fraction => { if ( current() && entry.status === 'UPLOADING' ) { entry.progress = Math.min(Math.max(Number(fraction) || 0,0),1); paint(entry); } } }); }
        catch ( error ) { reportUploadFilesIssue('UPLOAD_HANDLER_FAILED',{ id:merged.id, value:entry.name, reason:`it threw: ${error?.message ?? String(error)}` }); failed(''); return; }
        if ( !pending || typeof pending.then !== 'function' ) { reportUploadFilesIssue('UPLOAD_HANDLER_FAILED',{ id:merged.id, value:entry.name, reason:'it returned no Promise' }); failed(''); return; }
        pending.then(result =>
        {
            if ( !current() ) { return; }
            Object.assign(entry,{ status:'DONE', result:result ?? null, progress:1, controller:null });
            announce(live,fillText(t.uploaded,{ name:entry.name }));
            paint(entry); afterChange(entry.user); pump();
        },error =>
        {
            if ( !current() ) { return; }
            failed(typeof error === 'string' ? error : String(error?.userMessage ?? '').trim());
        });
    }

    // Stops a waiting or running upload; the file stays in the list as cancelled (Retry, Remove).
    function cancel( entry, user )
    {
        if ( !active(entry) || ( user && state.disabled ) ) { return false; }
        const abort = entry.controller;
        Object.assign(entry,{ status:'CANCELLED', controller:null, progress:0 });
        abort?.abort();
        paint(entry); afterChange(user); pump();
        if ( user ) { entry.nodes?.buttons.remove?.getElement().focus(); }
        return true;
    }

    // Uploads a failed or cancelled file again.
    function retry( entry, user )
    {
        if ( !auto || !entry.file || ( entry.status !== 'FAILED' && entry.status !== 'CANCELLED' ) || ( user && state.disabled ) ) { return false; }
        Object.assign(entry,{ status:'WAITING', reason:'', reasonLabel:'', progress:0, user:user || entry.user });
        paint(entry); afterChange(user); pump();
        if ( user ) { entry.nodes?.buttons.cancel?.getElement().focus(); }
        return true;
    }

    // Removes a file from the list (a running upload is stopped); focus goes to the next file's Remove or the choose Button.
    function remove( entry, user )
    {
        if ( user && state.disabled ) { return false; }
        const index = state.entries.indexOf(entry);
        if ( index < 0 ) { return false; }
        entry.controller?.abort(); entry.controller = null;
        state.entries.splice(index,1);
        dropNode(entry);
        if ( user ) { announce(live,fillText(t.removed,{ name:entry.name })); }
        afterChange(user); pump();
        if ( user ) { const next = state.entries[index] ?? state.entries[index - 1]; ( next?.nodes?.buttons.remove?.getElement() ?? chooseButton?.getElement() )?.focus(); }
        return true;
    }

    // Adds files after the checks (type, size, count, total size; duplicates ignored); one file replaces the previous one
    // when multiple is false. user: from the picker, a drop or a paste (reported; rejected files through onFileRejected).
    function addFiles( files, user )
    {
        if ( user && state.disabled ) { return []; }
        const chosen = merged.multiple ? files : files.slice(0,1);
        // the files refused last time were feedback for that action: they go when new files arrive
        if ( chosen.length ) { state.entries.filter(entry => entry.status === 'REJECTED').forEach(entry => remove(entry,false)); }
        const added = [], rejected = [];
        chosen.forEach(file =>
        {
            if ( state.entries.some(entry => entry.file && entry.status !== 'REJECTED' && entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified) )
            {
                announce(live,fillText(t.duplicate,{ name:file.name }));
                return;
            }
            const entry = createEntry(state,file,auto ? 'WAITING' : 'READY');
            entry.user = user;
            let label = '';
            if ( !isAccepted(file,merged.accept) ) { label = 'TYPE_NOT_ACCEPTED'; }
            else if ( merged.maxFileSize && file.size > merged.maxFileSize ) { label = 'FILE_TOO_LARGE'; }
            else if ( merged.multiple && merged.maxFiles && usedCount(state) >= merged.maxFiles ) { label = 'TOO_MANY_FILES'; }
            else if ( merged.maxTotalSize && usedSize(state) + file.size > merged.maxTotalSize ) { label = 'TOTAL_TOO_LARGE'; }
            if ( label )
            {
                Object.assign(entry,{ status:'REJECTED', reasonLabel:label, reason:getUploadFilesReason(label,merged,{ size:sizeText(label === 'FILE_TOO_LARGE' ? merged.maxFileSize : merged.maxTotalSize), count:merged.maxFiles }) });
                rejected.push(entry);
            }
            else
            {
                // one file (multiple false): an accepted file replaces the previous one (a refused one leaves it in place)
                if ( !merged.multiple ) { state.entries.filter(item => item.status !== 'REJECTED').forEach(item => remove(item,false)); }
                if ( merged.showPreviews && isPreviewable(file) ) { entry.previewUrl = URL.createObjectURL(file); entry.ownPreview = true; }
                added.push(entry);
            }
            state.entries.push(entry);
            addNode(entry);
        });
        if ( added.length ) { announce(live,added.length === 1 ? fillText(t.addedOne,{ name:added[0].name }) : fillText(t.added,{ count:added.length })); }
        if ( rejected.length ) { announce(alert,rejected.map(entry => fillText(t.notAdded,{ name:entry.name, reason:entry.reason })).join(' ')); }
        if ( user ) { rejected.forEach(entry => merged.onFileRejected?.(publicEntry(entry),instance)); }
        afterChange(user);
        pump();
        return [ ...added, ...rejected ].map(publicEntry);
    }

    // Replaces the whole list with files already saved and File objects (programmatic: no callbacks, not dirty).
    function replaceAll( value )
    {
        [ ...state.entries ].forEach(entry => { entry.controller?.abort(); dropNode(entry); });
        state.entries = [];
        const items = normalizeFileEntries(merged.id,'setValue',value);
        items.filter(item => !( item instanceof File )).forEach(item => { const entry = createEntry(state,item,'DONE'); state.entries.push(entry); addNode(entry); });
        const files = items.filter(item => item instanceof File);
        if ( files.length ) { addFiles(files,false); } else { afterChange(false); }
        state.lastKey = valueKey();
    }

    instance =
    {
        id:merged.id,
        name:merged.name,
        // Returns the value (a new array): FORM — File objects and copies of the saved files; AUTO — { name, size, type, result } of the uploaded files and copies of the saved files.
        getValue:() => currentValue(),
        // Replaces the files (File objects and/or saved files { name, size?, type?, url?, id? }); not dirty, no callbacks;
        // AUTO uploads the File objects. Shows the validation result unless { quiet:true }; returns { valid, errorLabel }.
        setValue:( value, options = {} ) =>
        {
            state.external = '';
            replaceAll(value);
            state.dirty = false;
            if ( options?.quiet ) { showError(null); return check(); }
            return runValidation();
        },
        // Validates and shows the result; returns { valid, errorLabel }.
        validate:() => runValidation(),
        // Returns a copy of the current error or null.
        getError:() => ( state.error ? { ...state.error } : null ),
        // Shows an external error (cleared by the next change of the value by the user).
        setError:( message ) => { state.external = String(message ?? '').trim(); runValidation(); },
        // Removes the external error and the shown error.
        clearError:() => { state.external = ''; showError(null); },
        // Moves focus to the choose Button.
        focus:() => { const button = chooseButton?.getElement(); button?.focus(); return Boolean(button) && document.activeElement === button; },
        // Returns the label text.
        getLabel:() => merged.label,
        // Returns the effective label position: TOP or START (INHERIT follows an ancestor with the class ui-labels-start).
        getLabelPosition:() => ( merged.labelPosition !== 'INHERIT' ? merged.labelPosition : container.closest('.ui-labels-start') ? 'START' : 'TOP' ),
        // Returns { mandatory, indicator }.
        getMandatoryState:() => ( { mandatory:merged.mandatory, indicator:merged.mandatoryIndicator } ),
        // Returns whether the user changed the files.
        isDirty:() => state.dirty,
        // Returns a copy of every file in the list: { key, name, size, type, status, progress, reason, errorLabel, result, saved }.
        getFiles:() => state.entries.map(publicEntry),
        // Adds files programmatically (same checks as the user's; no callbacks); returns the new entries.
        addFiles:( files ) => addFiles([ ...( files ?? [] ) ].filter(file => file instanceof File),false),
        // Removes a file (stops its upload); returns whether it existed.
        removeFile:( key ) => { const entry = find(key); if ( !entry ) { reportUploadFilesIssue('UNKNOWN_FILE',{ id:merged.id, value:key }); return false; } return remove(entry,false); },
        // Stops a waiting or running upload; returns whether it was stopped.
        cancelFile:( key ) => { const entry = find(key); if ( !entry ) { reportUploadFilesIssue('UNKNOWN_FILE',{ id:merged.id, value:key }); return false; } return cancel(entry,false); },
        // Uploads a failed or cancelled file again; returns whether it was queued.
        retryFile:( key ) => { const entry = find(key); if ( !entry ) { reportUploadFilesIssue('UNKNOWN_FILE',{ id:merged.id, value:key }); return false; } return retry(entry,false); },
        // Returns whether uploads are waiting or running.
        isUploading:() => state.entries.some(active),
        // Turns the field off or on (no choosing, dropping, pasting, removing; running uploads continue).
        setDisabled:( disabled ) =>
        {
            state.disabled = Boolean(disabled);
            root.classList.toggle('ui-upload-files-disabled',state.disabled);
            chooseButton?.setDisabled(state.disabled);
            state.entries.forEach(paint);
        },
        // Stops the uploads, removes the listeners, Buttons, Loaders, previews and the Tooltip, then clears the container.
        destroy:() =>
        {
            if ( destroyed ) { return; }
            destroyed = true;
            state.entries.forEach(entry => { entry.controller?.abort(); dropNode(entry); });
            removeHintTooltip();
            controller?.abort();
            chooseButton?.destroy();
            container.innerHTML = '';
        }
    };

    chooseButton = renderButton(root.querySelector('[data-button="choose"]'),{ id:`${merged.id}-choose`, label:merged.multiple ? t.choose : t.chooseOne, iconBefore:'fa-solid fa-paperclip', hierarchy:'SECONDARY', disabled:state.disabled },() => { if ( !state.disabled ) { input.click(); } });
    root.classList.toggle('ui-upload-files-disabled',state.disabled);
    describe();
    controller = registerUploadFilesEvents(root,input,root.querySelector('.ui-upload-files-dropzone'),merged.allowPaste,
    {
        onFiles:files => addFiles(files,true),
        onLeave:() => { if ( state.dirty ) { runValidation(); } },
        isDisabled:() => state.disabled
    });
    merged.initialFiles.forEach(item => { const entry = createEntry(state,item,'DONE'); state.entries.push(entry); addNode(entry); });
    refreshList();
    state.lastKey = valueKey();
    removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ onlyWhenTruncated:true });
    return instance;
}
