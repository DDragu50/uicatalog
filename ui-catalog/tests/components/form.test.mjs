// form.test.mjs
//
// The "auto" cases of source/components-js/form/formTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). A Form's children are functions that render real fields, so the cases render it with
// mount(): configuration and children are JavaScript source evaluated in the page, with renderTextInput, renderSelect,
// renderToggle and record(name) (a callback recorded like the harness does) in scope. The instance is harness.instance.

const ID = 'profile';
const FORM = `#${ID}`;
const SHEETS = [ 'form', 'textInput', 'select', 'toggle', 'button', 'message', 'loader', 'contentGroup' ];
const NAME = `( host ) => renderTextInput(host,{ id:'name', label:'Name' })`;
const EMAIL = `( host ) => renderTextInput(host,{ id:'email', label:'E-mail', type:'EMAIL', mandatory:false })`;
const EMAIL2 = `( host ) => renderTextInput(host,{ id:'email2', label:'Repeat e-mail', type:'EMAIL', mandatory:false })`;
const FIELDS = `[ ${NAME}, ${EMAIL} ]`;

async function mount( t, configSource, childrenSource = FIELDS, setup = '' )
{
    return t.page.evaluate(async ( [ config, children, prepare, id, sheets ] ) =>
    {
        sheets.forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        await Promise.all([ ...document.querySelectorAll('link[rel="stylesheet"]') ].map(link => ( link.sheet ? null : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }) )));
        const modules = await Promise.all([ 'form', 'textInput', 'select', 'toggle' ].map(name => import(`/source/components-js/${name}/${name}Index.js`)));
        const [ { renderForm }, { renderTextInput }, { renderSelect }, { renderToggle } ] = modules;
        const plain = value => JSON.parse(JSON.stringify(value ?? null));
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${arg.id})` : plain(arg) )) }); return window.answers?.[name]?.(...args); };
        new Function(prepare)();
        const scope = [ 'renderTextInput', 'renderSelect', 'renderToggle', 'record' ];
        const values = [ renderTextInput, renderSelect, renderToggle, record ];
        window.harness.instance = renderForm(document.querySelector('#host'),{ id, ...new Function(...scope,`return (${config});`)(...values) },new Function(...scope,`return (${children});`)(...values));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return window.harness.instance ? id : null;
    },[ configSource, childrenSource, setup, ID, SHEETS ]);
}

const settle = t => t.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const button = name => `${FORM} [data-button="${name}"] button`;
const fieldError = ( t, id ) => t.page.$eval(`#${id}-error`,element => ( element.hidden ? '' : element.textContent.trim() ));
const summary = async t => { await settle(t); return readSummary(t); };
const readSummary = t => t.page.evaluate(id => { const box = document.querySelector(`#${id}-summary`); if ( !box || box.hidden ) { return null; } return { title:box.querySelector('.ui-message-title')?.textContent.trim(), items:[ ...box.querySelectorAll('.ui-message-details li') ].map(item => item.textContent.trim()) }; },ID);
const submits = async t => ( await t.calls('onSubmit') ).map(call => call.args[0]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`);
        await t.page.fill('#name','Ana');
        await t.page.fill('#email','ana@example.com');
        await t.page.click(button('submit'));
        t.equal(( await t.calls('onSubmit') ).map(call => call.args),[ [ { name:'Ana', email:'ana@example.com' }, `instance(${ID})` ] ],'all fields checked, values reported');
        t.equal(await t.call('getValues'),{ name:'Ana', email:'ana@example.com' },'getValues()');
    },
    'T-02':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`);
        await t.page.click(button('submit'));
        t.equal(await summary(t),{ title:'There is a problem', items:[ 'Name: Required.' ] },'a box at the top naming each problem');
        t.equal(await t.page.evaluate(id => document.activeElement?.closest(`#${id}-summary`) !== null,ID),true,'focus on the box');
        t.equal(await submits(t),[],'nothing reported');
        t.equal(await fieldError(t,'name'),'Required.','the error next to the field too');
    },
    'T-03':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`);
        await t.page.click(button('submit'));
        await t.page.click(`#${ID}-summary .ui-message-detail-link`);
        t.equal(await t.page.evaluate(() => document.activeElement?.id),'name','the link moves the user to the field');
    },
    'T-04':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`,FIELDS,`window.answers = { onSubmit:() => new Promise(resolve => setTimeout(resolve,1500)) };`);
        await t.page.fill('#name','Ana');
        await t.page.click(button('submit'));
        const busy = await t.page.evaluate(id => ( { busy:document.getElementById(id).getAttribute('aria-busy'), disabled:( button => button.disabled || button.getAttribute('aria-disabled') === 'true' )(document.querySelector(`#${id} [data-button="submit"] button`)) } ),ID);
        t.equal(busy,{ busy:'true', disabled:true },'busy, Submit blocked');
        await t.page.click(button('submit'),{ force:true });
        await t.call('submit');
        t.equal(( await submits(t) ).length,1,'no second submit');
        t.equal(await t.page.$eval(`${FORM} .ui-form-loader-host .ui-loader`,element => element.classList.contains('ui-loader-shown')),false,'no ring before the delay');
        await t.wait(700);
        const ring = await t.page.$eval(`${FORM} .ui-form-loader-host .ui-loader`,element => ( { shown:element.classList.contains('ui-loader-shown'), ring:element.classList.contains('ui-loader-ring'), label:element.querySelector('.ui-loader-label').textContent.trim(), before:element.getBoundingClientRect().right <= document.querySelector('[data-button="submit"]').getBoundingClientRect().left + 1 } ));
        t.equal(ring,{ shown:true, ring:true, label:'Saving…', before:true },'a small turning ring with "Saving…" before the buttons');
        await t.wait(1200);
        t.equal(await t.page.getAttribute(FORM,'aria-busy'),'false','not busy after saving');
    },
    'T-05':async t =>
    {
        await mount(t,`{ busyIndicator:'OVERLAY', onSubmit:record('onSubmit') }`);
        await t.call('setBusy',true);
        await t.wait(700);
        const layer = await t.page.evaluate(id => ( { shown:document.querySelector(`#${id} .ui-form-overlay-host .ui-loader`)?.classList.contains('ui-loader-shown'), blocked:document.querySelector('#name').closest('[inert]') !== null } ),ID);
        t.equal(layer,{ shown:true, blocked:true },'a layer over the whole form; fields cannot be changed');
        await t.call('setBusy',false);
        await t.wait(800);
        t.equal(await t.page.evaluate(() => document.querySelector('#name').closest('[inert]') === null),true,'released');
    },
    'T-06':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`,FIELDS,`window.answers = { onSubmit:() => Promise.resolve() };`);
        await t.page.fill('#name','Ana');
        await t.page.click(button('submit'));
        await t.wait(200);
        t.equal(await t.page.$eval(`${FORM} .ui-form-message-host .ui-message`,element => [ element.classList.contains('ui-message-type-success'), element.querySelector('.ui-message-text').textContent.trim() ]),[ true, 'Your changes were saved.' ],'success message after a successful submit');
        await t.call('destroy');
        await mount(t,`{ onSubmit:record('onSubmit') }`,FIELDS,`window.answers = { onSubmit:() => Promise.resolve(false) };`);
        await t.page.fill('#name','Ana');
        await t.page.click(button('submit'));
        await t.wait(200);
        t.equal(await t.page.$(`${FORM} .ui-form-message-host .ui-message:not([hidden])`),null,'no success message when the App answers false');
    },
    'T-07':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit'), onValidate:record('onValidate') }`,`[ ${NAME}, ${EMAIL}, ${EMAIL2} ]`,`window.answers = { onValidate:values => ( values.email !== values.email2 ? [ { name:'email2', message:'The e-mail addresses do not match.' } ] : null ) };`);
        await t.page.fill('#name','Ana');
        await t.page.fill('#email','ana@example.com');
        await t.page.fill('#email2','ana@example.org');
        await t.page.click(button('submit'));
        t.equal(( await t.calls('onValidate') )[0].args[0],{ name:'Ana', email:'ana@example.com', email2:'ana@example.org' },'cross-field rule asked with the values');
        t.equal(( await summary(t) )?.items,[ 'Repeat e-mail: The e-mail addresses do not match.' ],'shown in the summary');
        t.equal(await fieldError(t,'email2'),'The e-mail addresses do not match.','and next to the field');
        t.equal(await submits(t),[],'nothing submitted');
    },
    'T-08':async t =>
    {
        await mount(t,`{ onSubmit:record('onSubmit') }`);
        await t.page.fill('#email','ana@example.com');
        await t.call('showErrors',[ { name:'email', message:'This e-mail address is already registered.' } ]);
        t.equal(await fieldError(t,'email'),'This e-mail address is already registered.','next to the field');
        t.equal(( await summary(t) )?.items,[ 'E-mail: This e-mail address is already registered.' ],'and in the summary');
        await t.page.fill('#email','ana2@example.com');
        t.equal(await fieldError(t,'email'),'','cleared when the user changes the field');
    },
    'T-09':async t =>
    {
        await mount(t,`{ mode:'LIVE', onChange:record('onChange') }`);
        await t.page.fill('#name','Ana');
        t.equal(( await t.calls('onChange') ).length,0,'nothing before Apply');
        await t.page.click(button('apply'));
        t.equal(( await t.calls('onChange') ).map(call => call.args),[ [ { name:'Ana', email:'' }, `instance(${ID})` ] ],'reported on Apply');
        await t.call('destroy');
        await mount(t,`{ mode:'LIVE', liveApply:'AUTO', liveDelayMs:200, onChange:record('onChange') }`);
        await t.page.fill('#name','Bo');
        await t.wait(500);
        t.equal(( await t.calls('onChange') ).at(-1).args[0],{ name:'Bo', email:'' },'reported after the pause');
    },
    'T-10':async t =>
    {
        await mount(t,`{ mode:'LIVE', liveApply:'AUTO', liveDelayMs:100, onChange:record('onChange') }`,`[ ( host ) => renderTextInput(host,{ id:'name', label:'Name', value:'Ana' }), ${EMAIL} ]`);
        await t.page.fill('#name','');
        await t.page.click('#email');
        await t.wait(400);
        t.equal([ await fieldError(t,'name'), await summary(t), ( await t.calls('onChange') ).length ],[ 'Required.', null, 0 ],'the problem next to the field only; nothing reported');
        await t.page.fill('#name','Bo');
        await t.wait(400);
        t.equal(( await t.calls('onChange') ).at(-1)?.args[0],{ name:'Bo', email:'' },'reported once corrected');
    },
    'T-11':async t =>
    {
        await mount(t,`{ showReset:true, showClear:true, showCancel:true, buttonsAlign:'START', onCancel:record('onCancel'), onReset:record('onReset'), onClear:record('onClear') }`);
        const labels = await t.page.$$eval(`${FORM} .ui-form-actions button`,buttons => buttons.map(button => button.textContent.trim()));
        t.equal(labels,[ 'Submit', 'Reset to initial values', 'Clear all', 'Cancel' ],'the buttons');
        t.assert(await t.page.evaluate(id => Math.abs(document.querySelector(`#${id} .ui-form-actions button`).getBoundingClientRect().left - document.getElementById(id).getBoundingClientRect().left) < 4,ID),'aligned at the start');
        await t.page.click(button('cancel'));
        await t.call('reset');
        await t.call('clear');
        t.equal(( await t.calls() ).map(call => call.name),[ 'onCancel', 'onReset', 'onClear' ],'Cancel, reset() and clear() reported');
    },
    'T-12':async t =>
    {
        await mount(t,`{ showReset:true, showClear:true, onReset:record('onReset') }`);
        await t.page.fill('#name','Ana');
        await t.page.click(button('reset'));
        const dialog = await t.page.evaluate(id => { const box = document.querySelector(`#${id}-confirm`); return { open:box?.open, title:box?.querySelector('.ui-message-title').textContent.trim(), focus:document.activeElement?.textContent.trim() }; },ID);
        t.equal(dialog,{ open:true, title:'Discard your changes?', focus:'Keep editing' },'asks, with "Keep editing" selected first');
        await t.page.keyboard.press('Enter');
        t.equal(await t.page.inputValue('#name'),'Ana','Keep editing keeps the changes');
        await t.page.click(button('reset'));
        await t.page.click(`#${ID}-confirm .ui-message-action[data-action="discard"] button`);
        await settle(t);
        t.equal([ await t.page.inputValue('#name'), await fieldError(t,'name'), ( await t.calls('onReset') ).length ],[ '', '', 1 ],'reset without showing "Required."');
        await t.page.fill('#name','Bo');
        await t.page.click(button('clear'));
        await t.page.click(`#${ID}-confirm .ui-message-action[data-action="discard"] button`);
        await settle(t);
        t.equal([ await t.page.inputValue('#name'), await fieldError(t,'name') ],[ '', '' ],'cleared without errors');
    },
    'T-13':async t =>
    {
        await mount(t,`{ externalMessage:{ placement:'TOAST', toastArea:document.querySelector('#toasts') } }`,FIELDS,`if ( !document.querySelector('#toasts') ) { document.body.appendChild(Object.assign(document.createElement('div'),{ id:'toasts' })); }`);
        await t.call('showMessage',{ type:'SUCCESS', text:'Profile saved.' });
        await t.call('showMessage',{ type:'DANGER', text:'Sync failed.' });
        await settle(t);
        const toasts = () => t.page.$$eval('#toasts .ui-message',items => items.filter(item => !item.hidden).map(item => ( { text:item.querySelector('.ui-message-text').textContent.trim(), bar:Boolean(item.querySelector('.ui-message-remaining-bar')) } )));
        t.equal(await toasts(),[ { text:'Profile saved.', bar:true }, { text:'Sync failed.', bar:false } ],'pop-ups in a screen corner, with a time bar on the temporary one');
        await t.wait(6500);
        t.equal(( await toasts() ).map(item => item.text),[ 'Sync failed.' ],'closed after 6 s; the danger message stays');
        await t.call('destroy');
        await mount(t,`{ externalMessage:{ placement:'EXTERNAL', onMessage:record('onMessage') } }`);
        await t.call('showMessage',{ type:'INFO', text:'Shown elsewhere.' });
        t.equal(( await t.calls('onMessage') ).map(call => call.args[0].text),[ 'Shown elsewhere.' ],'handed to another component');
    },
    'T-14':async t =>
    {
        await mount(t,`{}`);
        await t.call('showMessage',{ type:'WARNING', text:'Only 3 left in stock.' });
        await settle(t);
        const above = await t.page.evaluate(id => { const message = document.querySelector(`#${id} .ui-form-message-host .ui-message`); return { warning:message?.classList.contains('ui-message-type-warning'), text:message?.querySelector('.ui-message-text').textContent.trim(), above:message.getBoundingClientRect().bottom <= document.querySelector('#name').getBoundingClientRect().top }; },ID);
        t.equal(above,{ warning:true, text:'Only 3 left in stock.', above:true },'the App\'s own message above the fields');
        await t.call('clearMessage');
        t.equal(await t.page.$(`${FORM} .ui-form-message-host .ui-message:not([hidden])`),null,'clearMessage()');
    },
    'T-15':async t =>
    {
        const tops = () => t.page.evaluate(() => [ '#name', '#email' ].map(selector => Math.round(document.querySelector(selector).getBoundingClientRect().top)));
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '60rem'; });
        await mount(t,`{ columns:2 }`);
        const wide = await tops();
        t.equal(wide[0],wide[1],'two columns');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '30rem'; });
        await mount(t,`{ columns:2 }`);
        const narrow = await tops();
        t.assert(narrow[1] > narrow[0],'one column when narrow');
    },
    'T-16':async t =>
    {
        const place = () => t.page.evaluate(() => { const label = document.querySelector('label[for="name"]').getBoundingClientRect(), input = document.querySelector('#name').getBoundingClientRect(); return label.right <= input.left + 1 ? 'START' : label.bottom <= input.top + 1 ? 'TOP' : 'OTHER'; });
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '60rem'; });
        await mount(t,`{ labelPosition:'START' }`);
        t.equal(await place(),'START','labels on the left');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '28rem'; });
        await mount(t,`{ labelPosition:'START' }`);
        t.equal(await place(),'TOP','on top when there is not enough room');
    },
    'T-17':async t =>
    {
        const note = () => t.page.$eval(`${FORM} .ui-form-required-note`,element => ( element.hidden ? '' : element.textContent.trim() ));
        await mount(t,`{}`);
        t.equal(await note(),'','no note without asterisks');
        await t.call('destroy');
        await mount(t,`{}`,`[ ( host ) => renderTextInput(host,{ id:'name', label:'Name', mandatoryIndicator:'MANDATORY_ASTERISK' }) ]`);
        t.equal(await note(),'* Required field','the note when fields use the asterisk');
    },
    'T-18':async t =>
    {
        const leaving = () => t.page.evaluate(() => { const event = new Event('beforeunload',{ cancelable:true }); window.dispatchEvent(event); return event.defaultPrevented; });
        await mount(t,`{ warnUnsavedChanges:true }`);
        t.equal(await leaving(),false,'no question without changes');
        await t.page.fill('#name','Ana');
        t.equal(await leaving(),true,'the browser is asked to confirm leaving');
    },
    'T-19':async t =>
    {
        t.assert(await mount(t,`{ externalMessage:{ placement:'TOAST' } }`),'rendered');
        t.equal(( await warnings(t,'MESSAGE_TARGET_MISSING') ).length,1,'warning');
        await t.call('showMessage',{ type:'INFO', text:'Here instead.' });
        await settle(t);
        t.equal(await t.page.$eval(`${FORM} .ui-form-message-host .ui-message-text`,element => element.textContent.trim()),'Here instead.','shown above the form');
    },
    'T-20':async t =>
    {
        t.assert(await mount(t,`{ mode:'LIVE', showSubmit:false, onChange:record('onChange') }`),'live form rendered');
        await t.call('destroy');
        t.assert(await mount(t,`{ mode:'LIVE', liveDelayMs:500, onChange:record('onChange') }`),'live form rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    },
    'T-21':async t =>
    {
        t.assert(await mount(t,`{}`,`[ ${NAME}, 42 ]`),'rendered');
        t.equal(( await warnings(t,'INVALID_CHILD') ).length,1,'warning');
    },
    'T-22':async t =>
    {
        const nameless = `( host ) => ( { getValue:() => 1, setValue:() => ( { valid:true, errorLabel:null } ), validate:() => ( { valid:true, errorLabel:null } ), focus:() => true, destroy:() => {} } )`;
        t.assert(await mount(t,`{}`,`[ ${NAME}, ${nameless}, ( host ) => renderTextInput(host,{ id:'name-2', name:'name', label:'Name again' }) ]`),'rendered');
        await t.call('getValues');
        t.equal([ ( await warnings(t,'FIELD_WITHOUT_NAME') ).length >= 1, ( await warnings(t,'DUPLICATE_FIELD_NAME') ).length >= 1 ],[ true, true ],'warnings');
        t.equal(Object.keys(await t.call('getValues')),[ 'name' ],'only the first field per name');
    },
    'T-23':async t =>
    {
        t.assert(await mount(t,`{}`,`[ ( host ) => renderTextInput(host,{ id:'name', label:'Name', labelPosition:'TOP' }), ( host ) => renderTextInput(host,{ id:'email', label:'E-mail', labelPosition:'START' }) ]`),'rendered');
        t.equal(( await warnings(t,'MIXED_LABEL_POSITIONS') ).length,1,'warning');
    },
    'T-24':async t =>
    {
        await mount(t,`{}`);
        await t.call('showErrors',[ { name:'nope', message:'The server is busy.' } ]);
        t.equal(( await warnings(t,'UNKNOWN_FIELD') ).length,1,'warning');
        t.equal(( await summary(t) )?.items,[ 'The server is busy.' ],'shown in the summary only');
    }
};
