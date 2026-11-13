// uploadFiles.test.mjs
//
// The "auto" cases of source/components-js/uploadFiles/uploadFilesTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). UploadFiles' configuration can hold an upload function, so the cases render it with
// mount(): the configuration is JavaScript source evaluated in the page, with record(name) in scope; the instance is
// harness.instance. Files are made in the page (window.makeFile) and given as the user would: chosen in the browser's
// picker (pick), dropped (drop) or pasted (paste). In AUTO cases the upload function of window.uploads keeps every call,
// so a case decides when an upload progresses, ends or fails.

const ID = 'docs';
const ROOT = `#${ID}`;
const UPLOAD = `( file, options ) => new Promise(( resolve, reject ) => { window.uploads.push({ name:file.name, options, resolve, reject }); })`;
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const files = t => t.call('getFiles');
const statuses = async t => ( await files(t) ).map(file => [ file.name, file.status ]);
const settle = t => t.page.evaluate(() => new Promise(resolve => setTimeout(() => requestAnimationFrame(() => resolve()),20)));
const text = ( t, selector ) => t.page.$eval(selector,element => element.textContent.trim());
const regions = t => t.page.evaluate(id => ( { live:document.querySelector(`#${id} ~ .ui-upload-files-live, #${id} .ui-upload-files-live`)?.textContent.trim(), alert:document.querySelector(`#${id} .ui-upload-files-alert`)?.textContent.trim() } ),ID);
const rowText = ( t, name ) => t.page.evaluate(( [ id, name ] ) => { const li = [ ...document.querySelectorAll(`#${id} .ui-upload-files-item`) ].find(item => item.querySelector('.ui-upload-files-name').textContent === name); return li ? [ '.ui-upload-files-name', '.ui-upload-files-size', '.ui-upload-files-status', '.ui-upload-files-reason:not([hidden])' ].map(part => li.querySelector(part)?.textContent.trim() ?? '').filter(Boolean).join(' ') : null; },[ ID, name ]);
const button = ( t, name, which ) => t.page.evaluate(( [ id, name, which ] ) => { const li = [ ...document.querySelectorAll(`#${id} .ui-upload-files-item`) ].find(item => item.querySelector('.ui-upload-files-name').textContent === name); const host = li?.querySelector(`[data-button="${which}"]`); return host && !host.hidden ? host.querySelector('button').id : null; },[ ID, name, which ]);
const press = async ( t, name, which ) => { const found = await button(t,name,which); t.assert(found,`${which} button of ${name}`); await t.page.click(`#${found}`); await settle(t); };

async function mount( t, source )
{
    return t.page.evaluate(async ( [ code, id ] ) =>
    {
        [ 'uploadFiles', 'button', 'loader', 'tooltip', 'form' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        await Promise.all([ ...document.querySelectorAll('link[rel="stylesheet"]') ].map(link => ( link.sheet ? null : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }) )));
        const { renderUploadFiles } = await import('/source/components-js/uploadFiles/uploadFilesIndex.js');
        const plain = value => JSON.parse(JSON.stringify(value ?? null, ( key, item ) => ( item instanceof File ? `File(${item.name})` : item )));
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${id})` : plain(arg) )) }); };
        window.uploads = [];
        window.makeFile = ( name, size = 1000, type = '', lastModified = 1 ) => new File([ new Uint8Array(size) ],name,{ type, lastModified });
        window.harness.instance = renderUploadFiles(document.querySelector('#host'),{ id, ...new Function('record',`return (${code});`)(record) });
        return window.harness.instance ? id : null;
    },[ source, ID ]);
}

// Gives files as the user does: [ name, size, type, lastModified ] each.
const transfer = specs => `(() => { const data = new DataTransfer(); ${JSON.stringify(specs)}.forEach(spec => data.items.add(window.makeFile(...spec))); return data; })()`;
async function pick( t, ...specs )
{
    await t.page.evaluate(( [ id, code ] ) => { const input = document.getElementById(`${id}-input`); input.files = new Function(`return ${code}`)().files; input.dispatchEvent(new Event('change',{ bubbles:true })); },[ ID, transfer(specs) ]);
    await settle(t);
}
async function drop( t, ...specs )
{
    const over = await t.page.evaluate(( [ id, code ] ) =>
    {
        const zone = document.querySelector(`#${id} .ui-upload-files-dropzone`), data = new Function(`return ${code}`)();
        zone.dispatchEvent(new DragEvent('dragenter',{ bubbles:true, cancelable:true, dataTransfer:data }));
        zone.dispatchEvent(new DragEvent('dragover',{ bubbles:true, cancelable:true, dataTransfer:data }));
        const marked = zone.classList.contains('ui-upload-files-dragover');
        zone.dispatchEvent(new DragEvent('drop',{ bubbles:true, cancelable:true, dataTransfer:data }));
        return [ marked, zone.classList.contains('ui-upload-files-dragover') ];
    },[ ID, transfer(specs) ]);
    await settle(t);
    return over;
}
async function paste( t, ...specs )
{
    await t.page.evaluate(( [ id, code ] ) => { const target = document.activeElement?.closest(`#${id}`) ? document.activeElement : document.getElementById(`${id}-choose`); target.dispatchEvent(new ClipboardEvent('paste',{ bubbles:true, cancelable:true, clipboardData:new Function(`return ${code}`)() })); },[ ID, transfer(specs) ]);
    await settle(t);
}
const upload = ( t, index, action, value ) => t.page.evaluate(( [ index, action, value ] ) => { const call = window.uploads[index]; if ( action === 'progress' ) { call.options.onProgress(value); } else { call[action](value); } },[ index, action, value ]).then(() => settle(t));

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ label:'Receipts', onValueChange:record('onValueChange') }`);
        t.equal(await text(t,`#${ID}-choose`),'Choose files','the button');
        const [ chooser ] = await Promise.all([ t.page.waitForEvent('filechooser'), t.page.click(`#${ID}-choose`) ]);
        t.equal(chooser.isMultiple(),true,'the browser window, several files');
        await chooser.setFiles([ { name:'report.pdf', mimeType:'application/pdf', buffer:Buffer.alloc(1200) }, { name:'notes.txt', mimeType:'text/plain', buffer:Buffer.alloc(300) } ]);
        await settle(t);
        t.equal(await statuses(t),[ [ 'report.pdf', 'READY' ], [ 'notes.txt', 'READY' ] ],'added to the list');
        t.equal(await text(t,`${ROOT} .ui-upload-files-summary`),'2 files, 1.5 kB','the number and total size');
        t.equal(( await regions(t) ).live,'2 files added','announced');
        const change = ( await t.calls('onValueChange') ).map(call => call.args);
        t.equal(change,[ [ [ 'File(report.pdf)', 'File(notes.txt)' ], `instance(${ID})` ] ],'the changed list reported');
    },
    'T-02':async t =>
    {
        await mount(t,`{ label:'Receipts', layout:'DROPZONE' }`);
        t.equal(await text(t,`${ROOT} .ui-upload-files-dropzone-text`),'Drag files here or','a drop area with the button inside');
        t.assert(await t.page.$(`${ROOT} .ui-upload-files-dropzone #${ID}-choose`),'the button in the area');
        t.equal(await drop(t,[ 'scan.pdf', 500, 'application/pdf' ]),[ true, false ],'marked while the files are over it');
        t.equal(await statuses(t),[ [ 'scan.pdf', 'READY' ] ],'then added');
    },
    'T-03':async t =>
    {
        await mount(t,`{ label:'Receipts', allowPaste:true }`);
        t.assert(( await text(t,`#${ID}-limits`) ).includes('You can also paste a file (Ctrl+V).'),'the limits mention pasting');
        await t.call('focus');
        await paste(t,[ 'screenshot.png', 800, 'image/png' ]);
        t.equal(await statuses(t),[ [ 'screenshot.png', 'READY' ] ],'pasted file added');
        await t.call('destroy');
        await mount(t,`{ label:'Receipts' }`);
        await t.call('focus');
        await paste(t,[ 'screenshot.png', 800, 'image/png' ]);
        t.equal(await files(t),[],'without allowPaste nothing is added');
    },
    'T-04':async t =>
    {
        const capture = async camera => { await mount(t,`{ label:'Photos', accept:'image/*', camera:'${camera}' }`); const value = await t.page.getAttribute(`#${ID}-input`,'capture'); await t.call('destroy'); return value; };
        t.equal([ await capture('NONE'), await capture('BACK'), await capture('FRONT') ],[ null, 'environment', 'user' ],'the back or front camera');
    },
    'T-05':async t =>
    {
        await mount(t,`{ label:'Receipts', accept:'.pdf,image/*', maxFileSize:1000, maxFiles:5, maxTotalSize:20000000, onFileRejected:record('onFileRejected'), onValueChange:record('onValueChange') }`);
        t.equal(await text(t,`#${ID}-limits`),'PDF or images · up to 1 kB each · at most 5 files · up to 20 MB in total','the limits under the button');
        t.assert(( await t.page.getAttribute(`#${ID}-choose`,'aria-describedby') ).includes(`${ID}-limits`),'the button is described by them');
        await pick(t,[ 'notes.txt', 100, 'text/plain' ],[ 'big.pdf', 2000, 'application/pdf' ],[ 'ok.pdf', 900, 'application/pdf' ]);
        t.equal(await statuses(t),[ [ 'notes.txt', 'REJECTED' ], [ 'big.pdf', 'REJECTED' ], [ 'ok.pdf', 'READY' ] ],'each file checked; refused files kept');
        t.equal(await rowText(t,'notes.txt'),'notes.txt 100 B Not added This type of file is not accepted.','the reason (type)');
        t.equal(await rowText(t,'big.pdf'),'big.pdf 2 kB Not added Larger than 1 kB.','the reason (size)');
        t.equal(( await t.calls('onFileRejected') ).map(call => [ call.args[0].name, call.args[0].errorLabel, call.args[1] ]),[ [ 'notes.txt', 'TYPE_NOT_ACCEPTED', `instance(${ID})` ], [ 'big.pdf', 'FILE_TOO_LARGE', `instance(${ID})` ] ],'reported to the App');
        t.equal(( await regions(t) ).alert,'notes.txt: This type of file is not accepted. big.pdf: Larger than 1 kB.','announced at once');
        t.equal(( await t.call('getValue') ).length,1,'refused files are not part of the value');
    },
    'T-06':async t =>
    {
        await mount(t,`{ label:'Receipts', maxFiles:3, maxTotalSize:2500, onFileRejected:record('onFileRejected') }`);
        await pick(t,[ 'a.pdf', 1000 ],[ 'b.pdf', 1000 ],[ 'c.pdf', 1000 ]);
        t.equal(( await files(t) ).map(file => file.errorLabel),[ null, null, 'TOTAL_TOO_LARGE' ],'the total size');
        t.equal(await t.page.evaluate(id => document.querySelector(`#${id} .ui-upload-files-item:last-child .ui-upload-files-reason`).textContent,ID),'All files together would be larger than 2.5 kB.','its reason');
        await pick(t,[ 'd.pdf', 400 ]);
        t.equal(await statuses(t),[ [ 'a.pdf', 'READY' ], [ 'b.pdf', 'READY' ], [ 'd.pdf', 'READY' ] ],'refused files removed when new ones are added');
        await pick(t,[ 'e.pdf', 10 ]);
        t.equal(( await files(t) ).at(-1).errorLabel,'TOO_MANY_FILES','the number of files');
        t.equal(await t.page.evaluate(id => document.querySelector(`#${id} .ui-upload-files-item:last-child .ui-upload-files-reason`).textContent,ID),'At most 3 files.','its reason');
    },
    'T-07':async t =>
    {
        await mount(t,`{ label:'Receipts', onValueChange:record('onValueChange') }`);
        await pick(t,[ 'report.pdf', 1000, 'application/pdf', 5 ]);
        await pick(t,[ 'report.pdf', 1000, 'application/pdf', 5 ]);
        t.equal(await statuses(t),[ [ 'report.pdf', 'READY' ] ],'not added twice');
        t.equal(( await regions(t) ).live,'report.pdf is already in the list','announced');
        t.equal(( await t.calls('onValueChange') ).length,1,'nothing reported for the duplicate');
    },
    'T-08':async t =>
    {
        await mount(t,`{ label:'Contract', multiple:false, onValueChange:record('onValueChange') }`);
        t.equal([ await text(t,`#${ID}-choose`), await t.page.getAttribute(`#${ID}-input`,'multiple') ],[ 'Choose file', null ],'one file');
        await pick(t,[ 'first.pdf', 100 ]);
        await pick(t,[ 'second.pdf', 100 ]);
        t.equal(await statuses(t),[ [ 'second.pdf', 'READY' ] ],'a new file replaces it');
        t.equal(await t.page.$eval(`${ROOT} .ui-upload-files-summary`,element => element.hidden),true,'no summary for one file');
    },
    'T-09':async t =>
    {
        await mount(t,`{ label:'Receipts', showPreviews:true }`);
        await t.page.evaluate(id => { const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),char => char.charCodeAt(0)); const data = new DataTransfer(); data.items.add(new File([ png ],'photo.png',{ type:'image/png' })); data.items.add(window.makeFile('report.pdf',2500000,'application/pdf')); const input = document.getElementById(`${id}-input`); input.files = data.files; input.dispatchEvent(new Event('change',{ bubbles:true })); },ID);
        await settle(t);
        t.assert(( await t.page.getAttribute(`${ROOT} .ui-upload-files-item:first-child img.ui-upload-files-preview`,'src') ).startsWith('blob:'),'a preview for the image');
        t.assert(await t.page.$(`${ROOT} .ui-upload-files-item:last-child .ui-upload-files-icon .fa-file-pdf`),'the type icon for the PDF');
        t.equal(await rowText(t,'report.pdf'),'report.pdf 2.5 MB','its name and size; the status of a ready file is empty');
        t.equal(await t.page.getAttribute(`${ROOT} .ui-upload-files-item:last-child .ui-upload-files-name`,'title'),'report.pdf','the full name on hover');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '14rem'; });
        await mount(t,`{ label:'Receipts' }`);
        await pick(t,[ 'a-remarkably-long-file-name-for-the-tests.pdf', 100 ]);
        t.assert(await t.page.$eval(`${ROOT} .ui-upload-files-name`,element => element.scrollWidth > element.clientWidth && getComputedStyle(element).textOverflow === 'ellipsis'),'a long name is cut off');
    },
    'T-10':async t =>
    {
        await mount(t,`{ label:'Receipts', onValueChange:record('onValueChange') }`);
        await pick(t,[ 'a.pdf', 100 ],[ 'b.pdf', 100 ],[ 'c.pdf', 100 ]);
        t.equal(await t.page.getAttribute(`#${await button(t,'b.pdf','remove')}`,'aria-label'),'Remove b.pdf','named with the file');
        await press(t,'b.pdf','remove');
        t.equal([ ( await statuses(t) ).map(item => item[0]), await t.page.evaluate(() => document.activeElement.getAttribute('aria-label')) ],[ [ 'a.pdf', 'c.pdf' ], 'Remove c.pdf' ],'removed; focus on the next file');
        t.equal(( await regions(t) ).live,'b.pdf removed','announced');
        await press(t,'c.pdf','remove');
        t.equal(await t.page.evaluate(() => document.activeElement.getAttribute('aria-label')),'Remove a.pdf','the last one: focus on the one before');
        await press(t,'a.pdf','remove');
        t.equal(await t.page.evaluate(() => document.activeElement.id),`${ID}-choose`,'none left: focus on "Choose files"');
        t.equal(( await t.calls('onValueChange') ).map(call => call.args[0].length),[ 3, 2, 1, 0 ],'each change reported');
    },
    'T-11':async t =>
    {
        await mount(t,`{ label:'Contract', initialFiles:[ { id:'c-17', name:'contract.pdf', size:482000, type:'application/pdf', url:'/files/c-17' } ] }`);
        await pick(t,[ 'annex.pdf', 100 ]);
        t.equal(( await statuses(t) ).map(item => item[0]),[ 'contract.pdf', 'annex.pdf' ],'listed first');
        t.equal(await t.page.$eval(`${ROOT} .ui-upload-files-item:first-child a.ui-upload-files-name`,element => [ element.getAttribute('href'), element.target ]),[ '/files/c-17', '_blank' ],'with a link to open it');
        t.equal(( await t.call('getValue') )[0],{ id:'c-17', name:'contract.pdf', size:482000, type:'application/pdf', url:'/files/c-17' },'kept in the value with its own members');
        await t.call('setValue',[ { name:'bad.pdf', url:'javascript:alert(1)' } ]);
        t.equal(await t.page.$(`${ROOT} a.ui-upload-files-name`),null,'an unsafe address is not a link');
    },
    'T-12':async t =>
    {
        const values = await t.page.evaluate(async () =>
        {
            [ 'uploadFiles', 'form', 'button' ].forEach(sheet => document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href:`/source/components-js/${sheet}/${sheet}.css` })));
            const [ { renderForm }, { renderUploadFiles } ] = await Promise.all([ import('/source/components-js/form/formIndex.js'), import('/source/components-js/uploadFiles/uploadFilesIndex.js') ]);
            const form = renderForm(document.querySelector('#host'),{ id:'expense', showSubmit:false },[ host => ( window.harness.instance = renderUploadFiles(host,{ id:'docs', name:'receipts', label:'Receipts' }) ) ]);
            const data = new DataTransfer(); data.items.add(new File([ 'x' ],'r.pdf',{ type:'application/pdf' }));
            const input = document.getElementById('docs-input'); input.files = data.files; input.dispatchEvent(new Event('change',{ bubbles:true }));
            const result = form.getValues();
            return result.receipts.map(file => [ file instanceof File, file.name ]);
        });
        t.equal(values,[ [ true, 'r.pdf' ] ],'the File objects are sent with the form');
    },
    'T-13':async t =>
    {
        await mount(t,`{ label:'Photos', uploadMode:'AUTO', maxParallel:1, upload:${UPLOAD}, onValueChange:record('onValueChange'), onUploadsComplete:record('onUploadsComplete') }`);
        await pick(t,[ 'one.png', 100, 'image/png' ],[ 'two.png', 100, 'image/png' ]);
        t.equal([ await statuses(t), await t.page.evaluate(() => window.uploads.map(call => call.name)) ],[ [ [ 'one.png', 'UPLOADING' ], [ 'two.png', 'WAITING' ] ], [ 'one.png' ] ],'sent to the App, one at a time');
        t.equal(await rowText(t,'two.png'),'two.png 100 B Waiting','the other waits');
        await upload(t,0,'progress',0.45);
        t.equal(await rowText(t,'one.png'),'one.png 100 B Uploading 45%','the progress text');
        t.equal(await t.page.$eval(`#${ID}-f1-loader`,element => element.getAttribute('aria-valuenow') ?? element.querySelector('[aria-valuenow]')?.getAttribute('aria-valuenow')),'45','a progress bar');
        await upload(t,0,'resolve',{ fileId:7 });
        t.equal(await rowText(t,'one.png'),'one.png 100 B Uploaded','"Uploaded"');
        t.equal(( await t.calls('onValueChange') ).map(call => call.args[0]),[ [ { name:'one.png', size:100, type:'image/png', result:{ fileId:7 } } ] ],'the value reported when an upload ends');
        t.equal(await t.page.evaluate(() => window.uploads.length),2,'the next one starts');
        await upload(t,1,'reject',{ userMessage:'The server refused this photo.' });
        t.equal(await rowText(t,'two.png'),'two.png 100 B Not uploaded The server refused this photo.','"Not uploaded" with the App\'s reason');
        t.equal(( await t.call('getFiles') )[1].errorLabel,'UPLOAD_FAILED','UPLOAD_FAILED');
        t.equal(( await t.calls('onUploadsComplete') ).map(call => call.args[0].map(item => item.name)),[ [ 'one.png' ] ],'reported once when all uploads have ended');
        await t.call('retryFile','f2');
        await upload(t,2,'reject','');
        t.equal(await rowText(t,'two.png'),'two.png 100 B Not uploaded The upload failed. Try again.','the default reason');
    },
    'T-14':async t =>
    {
        await mount(t,`{ label:'Photos', uploadMode:'AUTO', upload:${UPLOAD} }`);
        await pick(t,[ 'one.png', 100, 'image/png' ]);
        t.equal(await t.page.getAttribute(`#${await button(t,'one.png','cancel')}`,'aria-label'),'Cancel the upload of one.png','Cancel while it uploads');
        await press(t,'one.png','cancel');
        t.equal([ await rowText(t,'one.png'), await t.page.evaluate(() => window.uploads[0].options.signal.aborted) ],[ 'one.png 100 B Upload cancelled', true ],'marked as cancelled and kept; the upload stopped');
        t.equal(await t.page.evaluate(() => document.activeElement.getAttribute('aria-label')),'Remove one.png','focus on Remove');
        await press(t,'one.png','retry');
        t.equal([ await t.page.evaluate(() => window.uploads.length), ( await statuses(t) )[0][1] ],[ 2, 'UPLOADING' ],'sent to the App again');
        t.equal(await t.page.evaluate(() => document.activeElement.getAttribute('aria-label')),'Cancel the upload of one.png','focus on Cancel');
        await upload(t,1,'reject','Offline.');
        t.assert(await button(t,'one.png','retry'),'Retry on a failed file too');
    },
    'T-15':async t =>
    {
        await mount(t,`{ label:'Receipts' }`);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED' },'a required field without a file');
        t.equal([ await text(t,`#${ID}-error`), await t.page.$eval(ROOT,element => element.classList.contains('ui-upload-files-invalid')) ],[ 'Add a file.', true ],'the message under the field');
        t.assert(( await t.page.getAttribute(`#${ID}-choose`,'aria-describedby') ).includes(`${ID}-error`),'the button is described by it');
        await pick(t,[ 'a.pdf', 100 ]);
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.hidden),true,'cleared by a file');
        await press(t,'a.pdf','remove');
        await t.page.evaluate(() => document.activeElement.blur());
        await settle(t);
        t.equal(await text(t,`#${ID}-error`),'Add a file.','shown again when focus leaves after a change');
    },
    'T-16':async t =>
    {
        await mount(t,`{ label:'Photos', uploadMode:'AUTO', upload:${UPLOAD} }`);
        await pick(t,[ 'one.png', 100, 'image/png' ]);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'UPLOADS_PENDING' },'an upload is running');
        t.equal(await text(t,`#${ID}-error`),'Wait until the files are uploaded.','its message');
        await upload(t,0,'reject','');
        t.equal(await text(t,`#${ID}-error`),'Some files were not uploaded: upload them again or remove them.','an upload failed (UPLOADS_FAILED)');
        t.equal(( await t.call('validate') ).errorLabel,'UPLOADS_FAILED','UPLOADS_FAILED');
        await press(t,'one.png','retry');
        await upload(t,1,'resolve',null);
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.hidden),true,'fixed by the user');
    },
    'T-17':async t =>
    {
        await mount(t,`{ label:'Receipts', mandatory:false }`);
        await t.call('setError','The server could not read this file.');
        t.equal([ ( await t.call('getError') ).label ?? ( await t.call('validate') ).errorLabel, await text(t,`#${ID}-error`) ],[ 'EXTERNAL', 'The server could not read this file.' ],'shown');
        await pick(t,[ 'a.pdf', 100 ]);
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.hidden),true,'removed when the user changes the files');
    },
    'T-18':async t =>
    {
        const long = 'a-remarkably-long-file-name-for-the-tests.pdf';
        const titles = async mode => { await mount(t,`{ label:'Receipts'${mode ? `, tooltipMode:'${mode}'` : ''} }`); await pick(t,[ long, 100 ]); const value = await t.page.getAttribute(`${ROOT} .ui-upload-files-name`,'title'); await t.call('destroy'); return value; };
        t.equal([ await titles(''), await titles('NONE') ],[ long, null ],'the browser\'s tooltip by default; none');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '14rem'; });
        await mount(t,`{ label:'Receipts', tooltipMode:'TOOLTIP' }`);
        await pick(t,[ long, 100 ]);
        await t.page.hover(`${ROOT} .ui-upload-files-name`);
        await t.wait(900);
        const shown = () => t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(( await shown() ).includes(long),`a Tooltip with the full name (${JSON.stringify(await shown())})`);
        await t.page.mouse.move(0,0);
        await t.page.hover(`#${await button(t,long,'remove')}`);
        await t.wait(900);
        t.assert(( await shown() ).includes(`Remove ${long}`),'the Remove button\'s name in a Tooltip');
    },
    'T-19':async t =>
    {
        t.equal(await mount(t,`{ label:'' }`),null,'without a label');
        t.equal(await mount(t,`{ label:'Photos', uploadMode:'AUTO' }`),null,'AUTO without upload');
        const errors = ( await t.messages() ).filter(message => message.level === 'error').map(message => message.text);
        t.assert(errors.some(entry => entry.includes('[LABEL_REQUIRED]')) && errors.some(entry => entry.includes('[UPLOAD_HANDLER_REQUIRED]')),'LABEL_REQUIRED and UPLOAD_HANDLER_REQUIRED');
    },
    'T-20':async t =>
    {
        t.assert(await mount(t,`{ label:'Receipts', multiple:false, maxFiles:3, upload:() => null, accept:'.pdf, pdf files, image/*', camera:'BACK', initialFiles:[ { size:3 }, { name:'kept.pdf' } ] }`),'rendered');
        await t.call('removeFile','nope');
        const counts = {};
        for ( const label of [ 'OPTION_IGNORED', 'INVALID_ACCEPT', 'INVALID_FILE_ENTRY', 'UNKNOWN_FILE' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ OPTION_IGNORED:2, INVALID_ACCEPT:1, INVALID_FILE_ENTRY:1, UNKNOWN_FILE:1 },'one warning each (maxFiles and upload ignored)');
        t.equal([ await t.page.getAttribute(`#${ID}-input`,'accept'), ( await statuses(t) ).map(item => item[0]) ],[ '.pdf,image/*', [ 'kept.pdf' ] ],'the wrong entries are dropped');
        await t.call('destroy');
        t.assert(await mount(t,`{ label:'Photos', uploadMode:'AUTO', upload:() => { throw new Error('broken'); } }`),'rendered');
        await pick(t,[ 'one.png', 100, 'image/png' ]);
        t.equal([ ( await warnings(t,'UPLOAD_HANDLER_FAILED') ).length, ( await statuses(t) )[0][1] ],[ 1, 'FAILED' ],'the file is marked as failed');
    }
};
