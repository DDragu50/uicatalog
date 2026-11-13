// treeView.test.mjs
//
// The "auto" cases of source/components-js/treeView/treeViewTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). TreeView's configuration holds functions (loadChildren, canMove, canAct, callbacks), so the
// cases render it with mount(): the configuration is JavaScript source evaluated in the page, with ITEMS (the test tree)
// and record(name) in scope; the instance is harness.instance.

const ID = 'files';
const ROOT = `#${ID}`;
const ITEMS = [
    { id:'docs', label:'Documents', icon:'fa-solid fa-folder', children:[ { id:'contracts', label:'Contracts', badge:2, children:[ { id:'c1', label:'Contract Acme' }, { id:'c2', label:'Contract Beta' } ] }, { id:'invoices', label:'Invoices' } ] },
    { id:'photos', label:'Photos', children:[ { id:'p1', label:'Holiday' } ] },
    { id:'archive', label:'Archive', disabled:true },
    { id:'readme', label:'Read me' }
];
const item = id => `${ROOT} [data-item="${id}"]`;
const row = id => `${item(id)} > .ui-tree-view-row`;
const toggle = id => `${row(id)} .ui-tree-view-toggle`;
const text = id => `${row(id)} .ui-tree-view-text`;
const check = id => `${row(id)} .ui-tree-view-check`;
const tool = key => `${ROOT} .ui-tree-view-tool[data-tool="${key}"] button`;
const shownItems = t => t.page.$$eval(`${ROOT} [role="treeitem"]`,items => items.filter(item => item.getClientRects().length > 0 && item.getBoundingClientRect().height > 0).map(item => item.dataset.item));
const current = async t => ( await t.call('getCurrent') )?.id ?? null;
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const frame = t => t.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function mount( t, source, setup = '' )
{
    return t.page.evaluate(async ( [ code, id, items, prepare ] ) =>
    {
        [ 'treeView', 'button', 'message', 'loader', 'tooltip', 'form' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        await Promise.all([ ...document.querySelectorAll('link[rel="stylesheet"]') ].map(link => ( link.sheet ? null : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }) )));
        const { renderTreeView } = await import('/source/components-js/treeView/treeViewIndex.js');
        const plain = value => JSON.parse(JSON.stringify(value ?? null));
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${id})` : plain(arg) )) }); return window.answers?.[name]?.(...args); };
        new Function(prepare)();
        window.harness.instance = renderTreeView(document.querySelector('#host'),{ id, ...new Function('ITEMS','record',`return (${code});`)(items,record) });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return window.harness.instance ? id : null;
    },[ source, ID, ITEMS, setup ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, onExpandChange:record('onExpandChange') }`);
        t.equal(await shownItems(t),[ 'docs', 'photos', 'archive', 'readme' ],'the top level of the tree');
        await t.page.click(toggle('docs'));
        t.equal(await shownItems(t),[ 'docs', 'contracts', 'invoices', 'photos', 'archive', 'readme' ],'the arrow opens the sub-items');
        const indent = await t.page.evaluate(() => [ 'docs', 'contracts' ].map(id => document.querySelector(`[data-item="${id}"] > .ui-tree-view-row .ui-tree-view-toggle`).getBoundingClientRect().left));
        t.assert(indent[1] > indent[0] + 8,`indented under their parent (${indent.join(' / ')})`);
        await t.page.click(toggle('docs'));
        t.equal(( await t.calls('onExpandChange') ).map(call => call.args[0]),[ [ 'docs' ], [] ],'opening and closing reported');
    },
    'T-02':async t =>
    {
        await mount(t,`{ label:'Files', guideLines:true, items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true } : node) }`);
        const lines = await t.page.$eval(`${item('docs')} > .ui-tree-view-group`,element => { const before = getComputedStyle(element,'::before'), self = getComputedStyle(element); return ( before.content !== 'none' && before.content !== 'normal' ) || self.borderInlineStartStyle === 'solid' || self.backgroundImage !== 'none'; });
        t.equal([ await t.page.$eval(ROOT,element => element.classList.contains('ui-tree-view-lines')), lines ],[ true, true ],'guide lines between a parent and its sub-items');
    },
    'T-03':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true } : node) }`);
        t.assert(await t.page.$(`${row('docs')} .ui-tree-view-icon .fa-folder`),'an icon before an item');
        t.equal(await t.page.$eval(`${row('contracts')} .ui-tree-view-badge`,element => element.textContent),'2','a counter after it');
    },
    'T-04':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, editable:true, onValueChange:record('onValueChange') }`);
        const look = await t.page.evaluate(() => [ 'archive', 'readme' ].map(id => Number(getComputedStyle(document.querySelector(`[data-item="${id}"] > .ui-tree-view-row`)).opacity)));
        t.assert(look[0] < look[1],`greyed out (${look.join(' / ')})`);
        t.equal(await t.page.getAttribute(item('archive'),'aria-disabled'),'true','unavailable');
        await t.page.click(text('archive'));
        t.equal([ await t.call('getValue'), ( await t.calls('onValueChange') ).length ],[ '', 0 ],'cannot be selected');
        await t.page.keyboard.press('F2');
        t.equal(await t.page.$(`${ROOT} .ui-tree-view-rename`),null,'cannot be renamed');
        t.equal(await t.page.getAttribute(item('archive'),'draggable'),null,'cannot be moved');
        await t.call('destroy');
        await mount(t,`{ label:'Files', items:ITEMS, selectionMode:'MULTIPLE' }`);
        await t.page.click(check('archive'),{ force:true });
        t.equal(await t.page.getAttribute(item('archive'),'aria-checked'),'false','cannot be ticked');
    },
    'T-05':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, onCurrentChange:record('onCurrentChange') }`);
        await t.page.click(text('readme'));
        t.equal(await t.page.$eval(item('readme'),element => [ element.classList.contains('ui-tree-view-current'), getComputedStyle(element.querySelector('.ui-tree-view-row')).boxShadow.includes('inset') ]),[ true, true ],'a thin frame around the current item');
        const call = ( await t.calls('onCurrentChange') ).at(-1);
        t.equal([ call.args[0].id, call.args[1] ],[ 'readme', `instance(${ID})` ],'reported');
    },
    'T-06':async t =>
    {
        await mount(t,`{ ariaLabel:'Files', items:ITEMS, selectionMode:'NONE', onActivate:record('onActivate') }`);
        await t.page.click(text('readme'));
        const call = ( await t.calls('onActivate') )[0];
        t.equal([ call.args[0].id, call.args[0].label, call.args[1] ],[ 'readme', 'Read me', `instance(${ID})` ],'browsing only: the item reported');
        t.equal(await t.page.getAttribute(item('readme'),'aria-selected'),null,'nothing selected');
    },
    'T-07':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true } : node), onValueChange:record('onValueChange') }`);
        await t.page.click(text('invoices'));
        const look = await t.page.$eval(item('invoices'),element => ( { selected:element.getAttribute('aria-selected'), weight:Number(getComputedStyle(element.querySelector('.ui-tree-view-text')).fontWeight), background:getComputedStyle(element.querySelector('.ui-tree-view-row')).backgroundColor } ));
        t.assert(look.selected === 'true' && look.weight >= 600 && look.background !== 'rgba(0, 0, 0, 0)',`selected: a filled background and bold text (${JSON.stringify(look)})`);
        t.equal(( await t.calls('onValueChange') ).map(call => call.args),[ [ 'invoices', `instance(${ID})` ] ],'reported');
    },
    'T-08':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true, children:node.children.map(child => ( { ...child, expanded:true } )) } : node), selectionMode:'MULTIPLE', onValueChange:record('onValueChange') }`);
        await t.page.click(check('contracts'));
        const states = () => t.page.evaluate(() => Object.fromEntries([ 'docs', 'contracts', 'c1', 'c2' ].map(id => [ id, document.querySelector(`[data-item="${id}"]`).getAttribute('aria-checked') ])));
        t.equal(await states(),{ docs:'mixed', contracts:'true', c1:'true', c2:'true' },'ticking a parent ticks its sub-items');
        await t.page.click(check('c2'));
        t.equal(await states(),{ docs:'mixed', contracts:'mixed', c1:'true', c2:'false' },'a dash in partly ticked parents');
        t.equal(( await t.calls('onValueChange') ).length,2,'each change reported');
    },
    'T-09':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, selectionMode:'MULTIPLE', onValueChange:record('onValueChange') }`);
        await t.page.click(text('readme'));
        t.equal([ await current(t), await t.page.getAttribute(item('readme'),'aria-checked'), ( await t.calls('onValueChange') ).length ],[ 'readme', 'false', 0 ],'the name only moves the current-item frame');
    },
    'T-10':async t =>
    {
        const value = async checkedValue => { await mount(t,`{ label:'Files', items:ITEMS, selectionMode:'MULTIPLE', checkedValue:'${checkedValue}' }`); await t.call('setValue',[ 'docs' ]); const result = await t.call('getValue'); await t.call('destroy'); return result; };
        t.equal(await value('ALL'),[ 'docs', 'contracts', 'c1', 'c2', 'invoices' ],'all ticked items');
        t.equal(await value('LEAVES'),[ 'c1', 'c2', 'invoices' ],'only the end items');
        t.equal(await value('TOP'),[ 'docs' ],'only the top-most');
    },
    'T-11':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, search:true }`);
        await t.page.fill(`#${ID}-search`,'acme');
        await frame(t);
        t.equal(await shownItems(t),[ 'docs', 'contracts', 'c1' ],'only the matches and their parents');
        t.equal(await t.page.$eval(`${row('c1')} mark.ui-tree-view-match`,element => [ element.textContent, Number(getComputedStyle(element).fontWeight) >= 600 ]),[ 'Acme', true ],'the matching text in bold');
        await t.page.fill(`#${ID}-search`,'zzz');
        await frame(t);
        t.equal(await t.page.$eval(`${ROOT} .ui-tree-view-no-results`,element => element.textContent.trim()),'No matching items','nothing matches');
    },
    'T-12':async t =>
    {
        await mount(t,`{ label:'Files', items:[ { id:'remote', label:'Remote', hasChildren:true }, { id:'local', label:'Local' } ], loadChildren:record('loadChildren') }`,
            `window.tries = 0; window.answers = { loadChildren:() => new Promise(( resolve, reject ) => setTimeout(() => ( ++window.tries === 1 ? reject(new Error('offline')) : resolve([ { id:'r1', label:'Remote file' } ]) ),900)) };`);
        await t.page.click(toggle('remote'));
        t.equal(( await t.calls('loadChildren') ).map(call => call.args[0].id),[ 'remote' ],'the sub-items requested');
        await t.wait(600);
        t.assert(await t.page.$eval(row('remote'),element => element.querySelector('.ui-loader')?.classList.contains('ui-loader-shown') ?? false),'a small turning ring after a short delay');
        await t.wait(500);
        t.assert(( await t.page.$eval(row('remote'),element => element.textContent) ).includes('Could not load. Open again to retry.'),'an error on the parent');
        t.equal(( await warnings(t,'LOAD_FAILED') ).length,1,'LOAD_FAILED');
        await t.page.click(toggle('remote'));
        await t.wait(1100);
        t.equal(await shownItems(t),[ 'remote', 'r1', 'local' ],'clicking again retries');
    },
    'T-13':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, editable:true, onEdit:record('onEdit') }`);
        t.equal(await t.page.$$eval(`${ROOT} .ui-tree-view-tool button`,buttons => buttons.map(button => button.getAttribute('aria-label') || button.textContent.trim())),[ 'Add', 'Add sub-item', 'Rename', 'Delete', 'Move up', 'Move down', 'Move into the item above', 'Move out of the parent' ],'the toolbar');
        await t.page.click(text('readme'));
        await t.page.click(tool('add'));
        t.equal(await t.page.$eval(`${ROOT} .ui-tree-view-rename`,element => element.value),'New item','added after the current item, its name open for renaming');
        await t.page.fill(`${ROOT} .ui-tree-view-rename`,'Notes');
        await t.page.keyboard.press('Enter');
        const edits = ( await t.calls('onEdit') ).map(call => call.args[0]);
        t.equal([ edits[0].type, edits[0].parentId, edits[0].index, edits[1].type, edits[1].label, edits[1].previousLabel ],[ 'ADD', '', 4, 'RENAME', 'Notes', 'New item' ],'each change reported');
        await t.page.click(text('photos'));
        await t.page.click(tool('add-child'));
        await t.page.keyboard.press('Enter');
        t.equal(( await t.calls('onEdit') ).at(-1).args[0].parentId,'photos','Add sub-item: under the current item');
    },
    'T-14':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, editable:true, onEdit:record('onEdit') }`);
        await t.page.click(text('readme'));
        await t.page.keyboard.press('F2');
        await t.page.fill(`${ROOT} .ui-tree-view-rename`,'Changed');
        await t.page.keyboard.press('Escape');
        t.equal([ ( await t.call('getItem','readme') ).label, ( await t.calls('onEdit') ).length ],[ 'Read me', 0 ],'Escape keeps the old name');
        await t.page.click(tool('rename'));
        await t.page.fill(`${ROOT} .ui-tree-view-rename`,'Read me first');
        await t.page.keyboard.press('Enter');
        t.equal([ ( await t.call('getItem','readme') ).label, ( await t.calls('onEdit') ).at(-1).args[0].type ],[ 'Read me first', 'RENAME' ],'Enter keeps the new name');
    },
    'T-15':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true } : node), editable:true, onEdit:record('onEdit') }`);
        await t.page.click(text('contracts'));
        await t.page.keyboard.press('Delete');
        const dialog = await t.page.evaluate(id => { const box = document.getElementById(`${id}-confirm`); return { open:box?.open, title:box?.querySelector('.ui-message-title').textContent, text:box?.querySelector('.ui-message-text').textContent, focus:document.activeElement?.textContent.trim() }; },ID);
        t.equal(dialog,{ open:true, title:'Delete "Contracts"?', text:'Its 2 sub-items are deleted too. This cannot be undone.', focus:'Cancel' },'asks, stating the sub-items');
        await t.page.click(`#${ID}-confirm .ui-message-action[data-action="delete"] button, #${ID}-confirm button:has-text("Delete")`);
        await t.wait(100);
        const change = ( await t.calls('onEdit') ).at(-1).args[0];
        t.equal([ change.type, change.ids ],[ 'DELETE', [ 'contracts', 'c1', 'c2' ] ],'removed with its sub-items');
        t.equal(await t.call('getItem','c1'),null,'gone');
    },
    'T-16':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'docs' ? { ...node, expanded:true } : node), editable:true, onEdit:record('onEdit') }`);
        await t.page.click(text('invoices'));
        const place = async () => [ ( await t.call('getItem','invoices') ).parentId, Number(await t.page.getAttribute(item('invoices'),'aria-posinset')) - 1 ];
        await t.page.click(tool('move-up'));
        t.equal(await place(),[ 'docs', 0 ],'Move up');
        await t.page.click(tool('move-down'));
        t.equal(await place(),[ 'docs', 1 ],'Move down');
        await t.page.click(tool('indent'));
        t.equal(( await place() )[0],'contracts','Move into the item above');
        await t.page.click(tool('outdent'));
        t.equal(( await place() )[0],'docs','Move out of the parent');
        t.equal(( await t.calls('onEdit') ).map(call => call.args[0].type),[ 'MOVE', 'MOVE', 'MOVE', 'MOVE' ],'each move reported');
    },
    'T-17':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, editable:true, onEdit:record('onEdit') }`);
        const marker = await t.page.evaluate(() =>
        {
            const source = document.querySelector('[data-item="readme"]'), target = document.querySelector('[data-item="photos"]');
            const data = new DataTransfer();
            source.dispatchEvent(new DragEvent('dragstart',{ bubbles:true, dataTransfer:data }));
            const rect = target.querySelector('.ui-tree-view-row').getBoundingClientRect();
            const point = { bubbles:true, cancelable:true, dataTransfer:data, clientX:rect.left + 20, clientY:rect.top + rect.height / 2 };
            target.dispatchEvent(new DragEvent('dragenter',point));
            target.querySelector('.ui-tree-view-row').dispatchEvent(new DragEvent('dragover',point));
            const shown = target.querySelector('.ui-tree-view-row').getAttribute('data-drop');
            target.querySelector('.ui-tree-view-row').dispatchEvent(new DragEvent('drop',point));
            source.dispatchEvent(new DragEvent('dragend',{ bubbles:true, dataTransfer:data }));
            return shown;
        });
        t.equal(marker,'inside','where the item will go is shown');
        t.equal(( await t.call('getItem','readme') ).parentId,'photos','moved inside Photos');
        t.equal(( await t.calls('onEdit') ).at(-1).args[0].type,'MOVE','reported');
    },
    'T-18':async t =>
    {
        const drag = ( from, to ) => t.page.evaluate(( [ from, to ] ) =>
        {
            const source = document.querySelector(`[data-item="${from}"]`), target = document.querySelector(`[data-item="${to}"] > .ui-tree-view-row`);
            const data = new DataTransfer();
            source.dispatchEvent(new DragEvent('dragstart',{ bubbles:true, dataTransfer:data }));
            const rect = target.getBoundingClientRect();
            const point = { bubbles:true, cancelable:true, dataTransfer:data, clientX:rect.left + 20, clientY:rect.top + rect.height / 2 };
            target.dispatchEvent(new DragEvent('dragover',point));
            const shown = target.getAttribute('data-drop');
            target.dispatchEvent(new DragEvent('drop',point));
            source.dispatchEvent(new DragEvent('dragend',{ bubbles:true, dataTransfer:data }));
            return shown;
        },[ from, to ]);
        await mount(t,`{ label:'Files', items:[ { id:'folder', label:'Folder', children:[] }, { id:'photos', label:'Photos', children:[] }, { id:'readme', label:'Read me' } ], editable:true, canMove:move => move.parentId !== 'photos', onEdit:record('onEdit') }`);
        await t.page.click(text('readme'));
        const off = key => t.page.$eval(tool(key),element => element.disabled || element.getAttribute('aria-disabled') === 'true');
        t.equal([ await off('indent'), await off('move-up') ],[ true, false ],'the forbidden move button is disabled, an allowed one is not');
        t.equal([ await drag('readme','photos'), ( await t.call('getItem','readme') ).parentId ],[ null, '' ],'a forbidden drop is not offered and nothing moves');
        t.equal([ await drag('readme','folder'), ( await t.call('getItem','readme') ).parentId ],[ 'inside', 'folder' ],'an allowed drop is offered');
    },
    'T-19':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, actions:[ { key:'open', label:'Open' }, { key:'print', label:'Print', icon:'fa-solid fa-print', iconOnly:true } ], canAct:( key, item ) => key !== 'print' || !item.hasChildren, onAction:record('onAction') }`);
        const disabled = () => t.page.$$eval(`${ROOT} .ui-tree-view-action button`,buttons => buttons.map(button => button.disabled || button.getAttribute('aria-disabled') === 'true'));
        await t.page.click(text('docs'));
        t.equal(await disabled(),[ false, true ],'Print forbidden for a folder');
        await t.page.click(text('archive'));
        t.equal(await disabled(),[ true, true ],'no actions for an unavailable item');
        await t.page.click(text('readme'));
        await t.page.click(`${ROOT} .ui-tree-view-action[data-action="1"] button`);
        const call = ( await t.calls('onAction') )[0];
        t.equal([ call.args[0], call.args[1].id, call.args[2] ],[ 'print', 'readme', `instance(${ID})` ],'the action and the current item reported');
    },
    'T-20':async t =>
    {
        await t.page.evaluate(async items =>
        {
            [ 'treeView', 'form', 'button', 'message', 'loader' ].forEach(sheet => document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href:`/source/components-js/${sheet}/${sheet}.css` })));
            const [ { renderForm }, { renderTreeView } ] = await Promise.all([ import('/source/components-js/form/formIndex.js'), import('/source/components-js/treeView/treeViewIndex.js') ]);
            window.form = renderForm(document.querySelector('#host'),{ id:'pick', showSubmit:false },[ host => ( window.harness.instance = renderTreeView(host,{ id:'files', name:'folder', label:'Folder', items }) ) ]);
        },ITEMS);
        await t.page.click(text('readme'));
        t.equal(await t.page.evaluate(() => window.form.getValues()),{ folder:'readme' },'the selected item is sent with the form');
    },
    'T-21':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, onValueChange:record('onValueChange') }`);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED_SELECTION' },'a required tree without a selection');
        const shown = await t.page.evaluate(id => ( { message:document.getElementById(`${id}-error`).hidden ? '' : document.getElementById(`${id}-error`).textContent.trim(), invalid:document.getElementById(`${id}-tree`).getAttribute('aria-invalid'), colours:[ getComputedStyle(document.getElementById(`${id}-label`)).color, getComputedStyle(document.getElementById(`${id}-error`)).color ] } ),ID);
        t.equal([ shown.message, shown.invalid, shown.colours[0] === shown.colours[1] ],[ 'Select an item.', 'true', true ],'the message, the label in the error colour');
        await t.page.click(text('readme'));
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.hidden),true,'cleared by a selection');
    },
    'T-22':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS.map(node => node.id === 'readme' ? { ...node, selected:true } : node) }`);
        t.equal(await t.call('setError','This folder is full.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.textContent.trim()),'This folder is full.','shown');
        await t.page.click(text('photos'));
        t.equal(await t.page.$eval(`#${ID}-error`,element => element.hidden),true,'removed by a user change');
    },
    'T-23':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS }`);
        await t.call('focus');
        const path = [];
        for ( const key of [ 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowLeft', 'End', 'Home' ] ) { await t.page.keyboard.press(key); path.push(await t.page.evaluate(() => document.activeElement?.dataset.item + ( document.activeElement?.getAttribute('aria-expanded') === 'true' ? '+' : '' ))); }
        t.equal(path,[ 'docs+', 'contracts', 'invoices', 'docs+', 'docs', 'readme', 'docs' ],'arrows open, move into, move, go to the parent, close; End and Home');
    },
    'T-24':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS }`);
        await t.call('focus');
        await t.page.keyboard.type('re');
        t.equal(await t.page.evaluate(() => document.activeElement?.dataset.item),'readme','the first letters move to the item');
    },
    'T-25':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, onExpandChange:record('onExpandChange') }`);
        await t.call('focus');
        await t.page.keyboard.press('*');
        t.equal(await t.page.$$eval(`${ROOT} .ui-tree-view-tree > [role="treeitem"][aria-expanded]`,items => items.map(item => [ item.dataset.item, item.getAttribute('aria-expanded') ])),[ [ 'docs', 'true' ], [ 'photos', 'true' ] ],'"*" opens all parents at the same level');
        t.equal(( await t.calls('onExpandChange') ).length,1,'reported');
    },
    'T-26':async t =>
    {
        await mount(t,`{ label:'Files', items:ITEMS, tooltipMode:'TITLE' }`);
        t.equal(await t.page.getAttribute(text('readme'),'title'),'Read me','TITLE');
        await t.call('destroy');
        await mount(t,`{ label:'Files', items:ITEMS }`);
        t.equal(await t.page.getAttribute(text('readme'),'title'),null,'NONE by default');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '9rem'; });
        await mount(t,`{ label:'Files', items:[ { id:'long', label:'A remarkably long folder name for testing' } ], tooltipMode:'TOOLTIP' }`);
        await t.page.hover(text('long'));
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(entry => entry.startsWith('A remarkably long')),`TOOLTIP shows the full name (${JSON.stringify(shown)})`);
    },
    'T-27':async t =>
    {
        t.equal(await mount(t,`{ items:ITEMS }`),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[LABEL_REQUIRED]')),'a required selection tree needs a label');
    },
    'T-28':async t =>
    {
        t.assert(await mount(t,`{ selectionMode:'NONE', checkedValue:'LEAVES', items:[ { id:'a', label:'A', icon:'fa-solid fa-<bad>' }, { id:'b' }, { id:'a', label:'Again' } ] }`),'rendered');
        await t.call('expand','nope');
        const counts = {};
        for ( const label of [ 'LABEL_MISSING', 'OPTION_IGNORED', 'INVALID_ICON_CLASS', 'INVALID_ITEM', 'DUPLICATE_ITEM_ID', 'UNKNOWN_ITEM' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ LABEL_MISSING:1, OPTION_IGNORED:1, INVALID_ICON_CLASS:1, INVALID_ITEM:1, DUPLICATE_ITEM_ID:1, UNKNOWN_ITEM:1 },'one warning each');
        await t.call('destroy');
        t.assert(await mount(t,`{ label:'Files', items:[ { id:'a', label:'A', selected:true }, { id:'b', label:'B', selected:true } ] }`),'rendered');
        t.equal([ ( await warnings(t,'SINGLE_SELECTED') ).length, await t.call('getValue') ],[ 1, 'a' ],'only the first is selected');
    },
    'T-29':async t =>
    {
        t.assert(await mount(t,`{ label:'Files', items:ITEMS, actions:[ { key:'open', label:'Open' }, { key:'x' }, { key:'open', label:'Open again' } ] }`),'rendered');
        const counts = {};
        for ( const label of [ 'INVALID_ACTION', 'DUPLICATE_ACTION_KEY', 'ACTION_HANDLER_MISSING' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ INVALID_ACTION:1, DUPLICATE_ACTION_KEY:1, ACTION_HANDLER_MISSING:1 },'one warning each');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'UNKNOWN_ACTION');
    }
};
