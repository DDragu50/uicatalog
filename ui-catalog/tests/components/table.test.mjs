// table.test.mjs
//
// The "auto" cases of source/components-js/table/tableTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Table's configuration holds functions (format, render, callbacks), so the cases render
// it with mount(): the configuration is written as JavaScript source and evaluated in the page, with
//   rows(n, extra)  n rows { id:'o1'…, order:'ORD-1'…, customer, city, date, amount, note } (extra(row, i) adds fields),
//   record(name)    a callback that records its calls like the harness does (t.calls(name)).
// The instance becomes harness.instance, so t.call(member, …) works as usual.

const ID = 'orders';
const ROOT = `#${ID}`;
const SHEETS = [ 'table', 'button', 'pagination', 'message', 'loader', 'tooltip', 'chip' ];
const COLUMNS = `[
    { field:'order', label:'Order', priority:'ALWAYS', width:'S' },
    { field:'customer', label:'Customer', priority:1, width:'L' },
    { field:'date', label:'Date', type:'DATE', priority:2, width:'M', compact:{ width:'S', format:value => value.slice(5) } },
    { field:'city', label:'City', priority:3, width:'M' },
    { field:'note', label:'Note', priority:4, width:'XL' } ]`;

// Renders a Table from configuration source; returns its id or null.
async function mount( t, source )
{
    return t.page.evaluate(async ( [ code, id, sheets ] ) =>
    {
        sheets.forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        await Promise.all([ ...document.querySelectorAll('link[rel="stylesheet"]') ].map(link => ( link.sheet ? null : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }) )));
        const { renderTable } = await import('/source/components-js/table/tableIndex.js');
        const plain = value => JSON.parse(JSON.stringify(value,( key, item ) => ( item instanceof Set ? [ ...item ] : item )));
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg === 'object' && typeof arg.destroy === 'function' ? `instance(${id})` : plain(arg) )) }); };
        const cities = [ 'Iasi', 'Wien', 'Lyon', 'Porto', 'Gent', 'Turku', 'Split' ];
        const rows = ( n, extra = () => ( {} ) ) => Array.from({ length:n },( _, index ) => { const i = index + 1; const row = { id:`o${i}`, order:`ORD-${i}`, customer:`Customer ${String.fromCharCode(65 + ( i * 7 ) % 26)}${i}`, city:cities[i % 7], date:`2026-${String(1 + i % 12).padStart(2,'0')}-${String(1 + i % 28).padStart(2,'0')}`, amount:( i * 37 ) % 1000, note:`Note ${i}` }; return { ...row, ...extra(row,index) }; });
        const config = new Function('rows','record',`return (${code});`)(rows,record);
        window.harness.instance = renderTable(document.querySelector('#host'),{ id, ...config });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return window.harness.instance ? id : null;
    },[ source, ID, SHEETS ]);
}

const counts = t => t.page.$eval(`${ROOT} .ui-table-counts`,element => element.textContent.trim());
const column = ( t, field ) => t.page.$$eval(`${ROOT} tbody td[data-field="${field}"]`,cells => cells.map(cell => cell.textContent.trim()));
const numbers = t => t.page.$$eval(`${ROOT} tbody td.ui-table-counter`,cells => cells.map(cell => Number(cell.textContent)));
const visible = t => t.call('getVisibleColumns');
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
const hostWidth = ( t, width ) => t.page.evaluate(value => { document.querySelector('#host').style.inlineSize = value; },width);
const settle = t => t.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const button = name => `${ROOT} [data-button="${name}"] button`;

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(23), itemsPerPage:10 }`);
        t.equal(await counts(t),'23 items, 1–10 visible now','counts line');
        t.equal(await numbers(t),[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],'row numbers');
        await t.page.click(`${ROOT} .ui-pagination-page[data-page="3"]`);
        t.equal(await counts(t),'23 items, 21–23 visible now','last page');
        t.equal(await numbers(t),[ 21, 22, 23 ],'numbers continue across pages');
        await t.page.click(`${ROOT} .ui-table-sort[data-sort="customer"]`);
        t.equal(await numbers(t),[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],'numbers as shown, whatever the sort (back to page 1)');
    },
    'T-02':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, dataMode:'SERVER', itemsPerPage:10, onDataRequest:record('onDataRequest') }`);
        const requests = async () => ( await t.calls('onDataRequest') ).map(call => call.args[0]);
        t.equal(await requests(),[ { page:1, pageSize:10, sort:null } ],'first page requested on display');
        t.equal(( await t.calls('onDataRequest') )[0].args[1],`instance(${ID})`,'with the table');
        await t.page.evaluate(() => window.harness.instance.setRows(Array.from({ length:10 },( _, i ) => ( { id:`o${i + 1}`, order:`ORD-${i + 1}`, customer:'C', city:'X', date:'2026-01-01', note:'' } )),600));
        t.equal(await counts(t),'600 items, 1–10 visible now','the total the server reports');
        await t.page.click(`${ROOT} .ui-table-sort[data-sort="customer"]`);
        t.equal(( await requests() ).at(-1),{ page:1, pageSize:10, sort:{ field:'customer', direction:'ASC' } },'sort requests page 1 sorted');
        await t.call('setPage',3);
        t.equal(( await requests() ).at(-1),{ page:3, pageSize:10, sort:{ field:'customer', direction:'ASC' } },'page change requests that page');
    },
    'T-03':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, dataMode:'SERVER', itemsPerPage:10, onDataRequest:record('onDataRequest') }`);
        t.equal(await t.page.$eval(`${ROOT} tbody`,element => element.textContent.trim()),'Loading…','"Loading…" when no rows are shown yet');
        await t.wait(1200);
        t.assert(await t.page.$eval(`${ROOT} .ui-table-progress-cell .ui-loader`,element => element.classList.contains('ui-loader-shown')),'the line under the header after a short delay');
        await t.page.evaluate(() => window.harness.instance.setRows(Array.from({ length:10 },( _, i ) => ( { id:`o${i + 1}`, order:`ORD-${i + 1}`, customer:'C', city:'X', date:'2026-01-01', note:'' } )),600));
        t.assert(!await t.page.$eval(`${ROOT} .ui-table-progress-cell .ui-loader`,element => element.classList.contains('ui-loader-shown')),'the line goes away with the data');
        await t.call('setPage',2);
        const loading = await t.page.$eval(ROOT,element => ( { dimmed:element.classList.contains('ui-table-loading'), inert:element.querySelector('tbody').inert, rows:element.querySelectorAll('tbody tr[data-row-key]').length } ));
        t.equal(loading,{ dimmed:true, inert:true, rows:10 },'rows already shown stay, dimmed and unavailable');
    },
    'T-04':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, dataMode:'SERVER', itemsPerPage:10, onDataRequest:record('onDataRequest') }`);
        await t.call('setError');
        const message = await t.page.$eval(`${ROOT} tbody`,element => ( { text:element.querySelector('.ui-message')?.textContent ?? '', retry:Boolean(element.querySelector('button')) } ));
        t.assert(message.retry,`a Retry button (${message.text})`);
        await t.page.click(`${ROOT} tbody button`);
        t.equal(( await t.calls('onDataRequest') ).length,2,'Retry requests the page again');
    },
    'T-05':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(6), displayMode:'SCROLL' }`);
        const original = await column(t,'customer');
        const sortBy = async () => { await t.page.click(`${ROOT} .ui-table-sort[data-sort="customer"]`); return [ await column(t,'customer'), await t.page.getAttribute(`${ROOT} th[data-field="customer"]`,'aria-sort') ]; };
        const sorted = [ ...original ].sort(( a, b ) => a.localeCompare(b,'en',{ numeric:true }));
        t.equal(await sortBy(),[ sorted, 'ascending' ],'ascending');
        t.equal(await sortBy(),[ [ ...sorted ].reverse(), 'descending' ],'descending');
        t.equal(await sortBy(),[ original, 'none' ],'back to the original order');
    },
    'T-06':async t =>
    {
        await mount(t,`{ displayMode:'SCROLL', columns:[ { field:'order', label:'Order', priority:'ALWAYS' }, { field:'name', label:'Name' }, { field:'amount', label:'Amount', type:'NUMBER' }, { field:'date', label:'Date', type:'DATE' } ],
            rows:[ { id:'a', order:'ORD-10', name:'banana', amount:100, date:'2026-02-01' }, { id:'b', order:'ORD-9', name:'Apple', amount:20, date:'2025-12-31' }, { id:'c', order:'ORD-100', name:'cherry', amount:3, date:'2026-01-15' } ] }`);
        const sortBy = async field => { await t.call('setSort',field,'ASC'); return column(t,field); };
        t.equal(await sortBy('name'),[ 'Apple', 'banana', 'cherry' ],'text ignores upper and lower case');
        t.equal(await sortBy('order'),[ 'ORD-9', 'ORD-10', 'ORD-100' ],'numbers inside text by value');
        t.equal(await sortBy('amount'),[ '3', '20', '100' ],'number column by value');
        t.equal(await sortBy('date'),[ '2025-12-31', '2026-01-15', '2026-02-01' ],'date column by value');
    },
    'T-07':async t =>
    {
        const names = `rows:[ { id:'a', order:'1', name:'Örjan' }, { id:'b', order:'2', name:'Zoe' }, { id:'c', order:'3', name:'Anna' } ]`;
        const columns = `columns:[ { field:'order', label:'#', priority:'ALWAYS' }, { field:'name', label:'Name' } ]`;
        await mount(t,`{ locale:'sv', displayMode:'SCROLL', ${columns}, ${names} }`);
        await t.call('setSort','name','ASC');
        t.equal(await column(t,'name'),[ 'Anna', 'Zoe', 'Örjan' ],'Swedish: Ö after Z');
        await t.call('destroy');
        await mount(t,`{ locale:'de', displayMode:'SCROLL', ${columns}, ${names} }`);
        await t.call('setSort','name','ASC');
        t.equal(await column(t,'name'),[ 'Anna', 'Örjan', 'Zoe' ],'German: Ö with O');
        await t.call('destroy');
        await mount(t,`{ locale:'de', dataMode:'SERVER', itemsPerPage:10, ${columns}, onDataRequest:record('onDataRequest') }`);
        await t.page.evaluate(() => window.harness.instance.setRows([ { id:'a', order:'1', name:'A' } ],12000));
        t.assert(( await counts(t) ).startsWith('12.000 items'),`German digit grouping (${await counts(t)})`);
    },
    'T-08':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(5), selectable:true, onSelectionChange:record('onSelectionChange') }`);
        const second = `${ROOT} tbody tr:nth-child(2) .ui-table-select-row`;
        await t.page.check(second);
        const call = ( await t.calls('onSelectionChange') )[0];
        t.equal([ call.args[0].scope, call.args[0].ids, call.args[0].count, call.args[1] ],[ 'IDS', [ 'o2' ], 1, `instance(${ID})` ],'reported');
        t.assert(await t.page.$eval(`${ROOT} tbody tr:nth-child(2)`,element => element.classList.contains('ui-table-row-selected')),'row shown selected');
        t.equal(await counts(t),'5 items, 1–5 visible now, 1 selected','counts line');
        await t.page.uncheck(second);
        t.equal(( await t.calls('onSelectionChange') ).at(-1).args[0].count,0,'cleared and reported');
    },
    'T-09':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(23), itemsPerPage:10, selectable:true, onSelectionChange:record('onSelectionChange') }`);
        t.assert(await t.page.$eval(`${ROOT} [data-button="select-all"]`,element => element.hidden),'no "Select all" at first');
        await t.page.check(`${ROOT} .ui-table-select-page`);
        t.equal(( await t.call('getSelection') ).count,10,'the rows of the current page');
        t.equal(await t.page.$eval(button('select-all'),element => element.textContent.trim()),'Select all 23 items','"Select all 23 items" shown');
        await t.page.click(button('select-all'));
        const selection = await t.call('getSelection');
        t.equal([ selection.scope, selection.count ],[ 'ALL', 23 ],'all items of the table');
        t.equal(await counts(t),'23 items, 1–10 visible now, 23 selected','counts line');
    },
    'T-10':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(8), selectable:true, onSelectionChange:record('onSelectionChange') }`);
        await t.page.check(`${ROOT} .ui-table-select-page`);
        await t.page.click(button('clear-selection'));
        t.equal(( await t.call('getSelection') ).count,0,'cleared');
        t.equal(( await t.calls('onSelectionChange') ).at(-1).args[0].count,0,'reported');
        t.assert(await t.page.$eval(`${ROOT} [data-button="clear-selection"]`,element => element.hidden),'"Clear selection" hidden again');
    },
    'T-11':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(5), selectable:true, selectionActions:[ { key:'export', label:'Export', icon:'fa-solid fa-download' }, { key:'delete', label:'Delete', icon:'fa-solid fa-trash', iconOnly:true } ], onSelectionAction:record('onSelectionAction') }`);
        const hidden = () => t.page.$$eval(`${ROOT} .ui-table-actions [data-action]`,hosts => hosts.map(host => host.hidden));
        t.equal(await hidden(),[ true, true ],'hidden while nothing is selected');
        await t.page.check(`${ROOT} tbody tr:nth-child(3) .ui-table-select-row`);
        t.equal(await hidden(),[ false, false ],'shown in the counts line');
        t.equal(await t.page.getAttribute(`${ROOT} [data-action="delete"] button`,'aria-label'),'Delete','icon-only action named by its label');
        await t.page.click(`${ROOT} [data-action="export"] button`);
        const call = ( await t.calls('onSelectionAction') )[0];
        t.equal([ call.args[0], call.args[1].ids, call.args[1].count, call.args[2] ],[ 'export', [ 'o3' ], 1, `instance(${ID})` ],'action and selection reported');
    },
    'T-12':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(5), selectable:true, onSelectionChange:record('onSelectionChange') }`);
        await t.page.click(`${ROOT} tbody tr:nth-child(2) td[data-field="customer"]`);
        t.equal([ ( await t.calls() ).length, ( await t.call('getSelection') ).count ],[ 0, 0 ],'a click on a row reports nothing and selects nothing');
    },
    'T-13':async t =>
    {
        await mount(t,`{ displayMode:'SCROLL', rows:rows(3), columns:[ { field:'order', label:'Order', priority:'ALWAYS', render:( host, row ) => { host.innerHTML = '<a href="#' + row.id + '">' + row.order + '</a>'; return null; } }, { field:'amount', label:'Amount', type:'NUMBER', format:value => value.toFixed(2) + ' €' } ] }`);
        t.equal(await t.page.$$eval(`${ROOT} tbody td[data-field="order"] a`,links => links.map(link => link.getAttribute('href'))),[ '#o1', '#o2', '#o3' ],'links rendered into the cells');
        t.equal(await column(t,'amount'),[ '37.00 €', '74.00 €', '111.00 €' ],'formatted values');
    },
    'T-14':async t =>
    {
        const long = `rows:rows(2,( row, i ) => ( { note:'A very long note that cannot fit into a small column at all, number ' + i + '. ' + 'More words to make it longer. '.repeat(12) } ))`;
        const columns = `columns:[ { field:'order', label:'Order', priority:'ALWAYS', width:'S' }, { field:'note', label:'Note', width:'S' } ]`;
        await mount(t,`{ displayMode:'SCROLL', ${columns}, ${long} }`);
        const cell = `${ROOT} tbody tr:first-child td[data-field="note"] .ui-table-truncate`;
        const cut = await t.page.$eval(cell,element => ( { cut:element.scrollWidth > element.clientWidth, ellipsis:getComputedStyle(element).textOverflow, title:element.getAttribute('title') } ));
        t.equal([ cut.cut, cut.ellipsis ],[ true, 'ellipsis' ],'shortened with "…"');
        t.assert(cut.title?.startsWith('A very long note'),'full text as the browser tooltip by default');
        await t.call('destroy');
        await mount(t,`{ tooltipMode:'NONE', displayMode:'SCROLL', ${columns}, ${long} }`);
        t.equal(await t.page.$eval(cell,element => [ element.getAttribute('title'), element.getAttribute('data-tooltip') ]),[ null, null ],'NONE: no tooltip');
        await t.call('destroy');
        await mount(t,`{ tooltipMode:'TOOLTIP', displayMode:'SCROLL', ${columns}, ${long} }`);
        await t.page.hover(cell);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('A very long note')),`TOOLTIP shows the full text (${JSON.stringify(shown)})`);
    },
    'T-15':async t =>
    {
        const seen = [];
        for ( let width = 1200; width >= 660; width -= 30 )
        {
            await hostWidth(t,`${width}px`);
            await mount(t,`{ columns:${COLUMNS}, rows:rows(3), displayMode:'SCROLL' }`);
            const date = ( await column(t,'date') )[0];
            seen.push(`${( await visible(t) ).join(',')}|${date && date.length === 5 ? 'short' : 'long'}`);
            await t.call('destroy');
        }
        const steps = seen.filter(( item, index ) => item !== seen[index - 1]);
        t.equal(steps[0],'order,customer,date,city,note|long','everything when there is room');
        t.equal(steps[1],'order,customer,date,city,note|short','first the short date');
        const removed = steps.map(step => step.split('|')[0].split(','));
        const order = [];
        removed.slice(1).forEach(( fields, index ) => removed[index].filter(field => !fields.includes(field)).forEach(field => order.push(field)));
        t.equal(order,[ 'note', 'city', 'date', 'customer' ].slice(0,order.length),`then the least important columns (${steps.join(' → ')})`);
        t.assert(order.length >= 2,'at least two columns hidden in the range');
        t.assert(removed.every(fields => fields[0] === 'order'),'the always-visible column stays');
    },
    'T-16':async t =>
    {
        await hostWidth(t,'800px');
        await mount(t,`{ columns:${COLUMNS}, rows:rows(30), itemsPerPage:10, selectable:true }`);
        const before = await visible(t);
        await t.page.click(`${ROOT} .ui-table-sort[data-sort="customer"]`);
        await t.call('setPage',2);
        await t.page.check(`${ROOT} tbody tr:first-child .ui-table-select-row`);
        await t.wait(300);
        t.equal(await visible(t),before,'the choice stays while the space stays the same');
    },
    'T-17':async t =>
    {
        await hostWidth(t,'1200px');
        await mount(t,`{ columns:${COLUMNS}, rows:rows(30), itemsPerPage:10, selectable:true, onSelectionChange:record('onSelectionChange') }`);
        await t.page.click(`${ROOT} .ui-table-sort[data-sort="customer"]`);
        await t.call('setPage',2);
        await t.page.check(`${ROOT} tbody tr:nth-child(1) .ui-table-select-row`);
        await t.page.check(`${ROOT} tbody tr:nth-child(2) .ui-table-select-row`);
        const reports = ( await t.calls('onSelectionChange') ).length;
        await t.page.focus(`${ROOT} .ui-table-sort[data-sort="customer"]`);
        const kept = async () => ( { sort:await t.call('getSort'), page:await t.call('getPage'), selected:( await t.call('getSelection') ).count, focus:await t.page.evaluate(() => document.activeElement?.dataset?.sort ?? ( document.activeElement?.classList.contains('ui-table-grid') ? 'table' : null )) } );
        const expected = { sort:{ field:'customer', direction:'ASC' }, page:2, selected:2 };
        const states = [];
        for ( const width of [ '760px', '560px', '1200px' ] )
        {
            await hostWidth(t,width);
            await settle(t);
            states.push({ width, columns:await visible(t), cards:await t.page.$eval(ROOT,element => element.classList.contains('ui-table-cards')), kept:await kept() });
        }
        t.assert(states[0].columns.length < 5 && !states[0].cards,`fewer columns at 760px (${states[0].columns})`);
        t.equal([ states[1].columns, states[1].cards ],[ [ 'order' ], true ],'cards at 560px');
        t.equal(states[2].columns,[ 'order', 'customer', 'date', 'city', 'note' ],'all columns again at 1200px');
        states.forEach(state => t.equal({ ...state.kept, focus:undefined },{ ...expected, focus:undefined },`kept at ${state.width}`));
        t.equal(states.map(state => state.kept.focus),[ 'customer', 'table', 'table' ],'focus stays on the header while it is shown, then in the table');
        t.equal(( await t.calls('onSelectionChange') ).length,reports,'no selection report for a new layout');
        t.equal(await t.page.$$eval(`${ROOT} tbody tr.ui-table-row-selected`,rows => rows.length),2,'selected rows shown selected');
    },
    'T-18':async t =>
    {
        await hostWidth(t,'560px');
        await mount(t,`{ columns:${COLUMNS}, rows:rows(4), displayMode:'SCROLL' }`);
        t.assert(await t.page.$eval(ROOT,element => element.classList.contains('ui-table-cards')),'cards below 40rem');
        t.equal(await visible(t),[ 'order' ],'with the always-visible columns');
        const card = await t.page.$eval(`${ROOT} tbody tr`,row => ( { label:row.querySelector('td[data-field="order"]').dataset.label, header:getComputedStyle(row.closest('table').querySelector('thead th[data-field="order"]')).display, border:getComputedStyle(row).borderTopStyle } ));
        t.equal(card,{ label:'Order', header:'none', border:'solid' },'a bordered card with labels; the header row hidden');
    },
    'T-19':async t =>
    {
        await t.page.setViewportSize({ width:1280, height:720 });
        await mount(t,`{ columns:${COLUMNS}, rows:rows(200) }`);
        const automatic = await t.call('getItemsPerPage');
        t.assert(automatic >= 5 && automatic % 5 === 0,`a multiple of 5, at least 5 (${automatic})`);
        await t.call('destroy');
        await t.page.setViewportSize({ width:1280, height:300 });
        await mount(t,`{ columns:${COLUMNS}, rows:rows(200) }`);
        t.equal(await t.call('getItemsPerPage'),5,'at least 5 on a low screen');
        await t.call('destroy');
        await t.page.setViewportSize({ width:1280, height:720 });
        await mount(t,`{ columns:${COLUMNS}, rows:rows(200), itemsPerPage:7 }`);
        t.equal([ await t.call('getItemsPerPage'), ( await numbers(t) ).length ],[ 7, 7 ],'a fixed number');
        const place = await t.page.evaluate(id => { const grid = document.querySelector(`#${id} .ui-table-grid`).getBoundingClientRect(), nav = document.querySelector(`#${id} .ui-pagination`).getBoundingClientRect(); return { below:nav.top >= grid.bottom - 1, right:Math.abs(nav.right - grid.right) <= 2 }; },ID);
        t.equal(place,{ below:true, right:true },'page navigation at the bottom right');
    },
    'T-20':async t =>
    {
        await t.page.evaluate(() => { document.body.style.paddingBlockEnd = '200vh'; });
        await mount(t,`{ columns:${COLUMNS}, rows:rows(60), itemsPerPage:50, selectable:true }`);
        await t.page.evaluate(() => window.scrollTo(0,800));
        await settle(t);
        const tops = await t.page.evaluate(id => ( { bar:Math.round(document.querySelector(`#${id} .ui-table-bar`).getBoundingClientRect().top), barHeight:Math.round(document.querySelector(`#${id} .ui-table-bar`).getBoundingClientRect().height), head:Math.round(document.querySelector(`#${id} thead th[data-field="order"]`).getBoundingClientRect().top) } ),ID);
        t.equal(tops.bar,0,'the counts line stays at the top');
        t.assert(Math.abs(tops.head - tops.barHeight) <= 2,`the column header right below it (${JSON.stringify(tops)})`);
        await t.call('destroy');
        await t.page.evaluate(() => window.scrollTo(0,0));
        await mount(t,`{ columns:${COLUMNS}, rows:rows(60), itemsPerPage:50, stickyHeader:false }`);
        await t.page.evaluate(() => window.scrollTo(0,800));
        await settle(t);
        t.assert(await t.page.$eval(`${ROOT} .ui-table-bar`,element => element.getBoundingClientRect().top < -100),'scrolls away with stickyHeader:false');
    },
    'T-21':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(5), selectable:true, alternateRows:true, displayMode:'SCROLL' }`);
        const background = index => t.page.$eval(`${ROOT} tbody tr:nth-child(${index})`,row => getComputedStyle(row.querySelector('td[data-field="customer"]')).backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(row).backgroundColor : getComputedStyle(row.querySelector('td[data-field="customer"]')).backgroundColor);
        const [ first, second ] = [ await background(1), await background(2) ];
        t.assert(first !== second,`every second row differs (${first} / ${second})`);
        await t.page.hover(`${ROOT} tbody tr:nth-child(3) td[data-field="customer"]`);
        const hovered = await background(3);
        t.assert(hovered !== first && hovered !== second,`row under the pointer (${hovered})`);
        await t.page.check(`${ROOT} tbody tr:nth-child(5) .ui-table-select-row`);
        await t.page.mouse.move(0,0);
        const selected = await background(5);
        t.assert(![ first, second, hovered ].includes(selected),`selected row (${selected})`);
    },
    'T-22':async t =>
    {
        t.equal(await mount(t,`{ columns:[] }`),null,'no columns');
        t.equal(await errors(t),[ 'COLUMNS_REQUIRED' ],'error');
        t.assert(await mount(t,`{ displayMode:'SCROLL', rows:rows(2), columns:[ { label:'No field' }, { field:'order', label:'Order' }, { field:'order', label:'Again' }, { field:'customer', label:'Customer' } ] }`),'rendered');
        t.equal([ ( await warnings(t,'INVALID_COLUMN') ).length, ( await warnings(t,'DUPLICATE_COLUMN_FIELD') ).length, ( await warnings(t,'NO_ALWAYS_COLUMN') ).length ],[ 1, 1, 1 ],'one warning each');
        t.equal(await visible(t),[ 'order', 'customer' ],'invalid and duplicate columns dropped');
        await hostWidth(t,'500px');
        await settle(t);
        t.equal(await visible(t),[ 'order' ],'the first column became always-visible');
    },
    'T-23':async t =>
    {
        t.assert(await mount(t,`{ columns:${COLUMNS}, dataMode:'SERVER', displayMode:'SCROLL', onDataRequest:record('onDataRequest') }`),'server table rendered');
        await t.call('destroy');
        t.assert(await mount(t,`{ columns:${COLUMNS}, rows:rows(3), displayMode:'SCROLL', itemsPerPage:10 }`),'scroll table rendered');
        await t.call('destroy');
        t.assert(await mount(t,`{ columns:${COLUMNS}, rows:rows(3), selectionActions:[ { key:'export', label:'Export' } ] }`),'table without selection rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,3,'three warnings');
    },
    'T-24':async t =>
    {
        t.assert(await mount(t,`{ columns:${COLUMNS}, rows:rows(3), selectable:true, onSelectionAction:record('onSelectionAction'), selectionActions:[ { key:'export', label:'Export', icon:'fa-solid fa-<bad>' }, { key:'archive' }, { key:'export', label:'Export again' } ] }`),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ICON_CLASS') ).length, ( await warnings(t,'INVALID_ACTION') ).length, ( await warnings(t,'DUPLICATE_ACTION_KEY') ).length ],[ 1, 1, 1 ],'one warning each');
        t.equal(await t.page.$$eval(`${ROOT} .ui-table-actions [data-action]`,hosts => hosts.map(host => host.dataset.action)),[ 'export' ],'only the valid action');
    },
    'T-25':async t =>
    {
        await mount(t,`{ columns:${COLUMNS}, rows:rows(3), selectable:true, selectionActions:[ { key:'export', label:'Export' } ] }`);
        t.equal(( await warnings(t,'ACTION_HANDLER_MISSING') ).length,1,'warning without onSelectionAction');
        await t.page.check(`${ROOT} tbody tr:first-child .ui-table-select-row`);
        t.assert(await t.page.$eval(`${ROOT} [data-action="export"] button`,element => element.disabled || element.getAttribute('aria-disabled') === 'true'),'the action is disabled');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'warning');
    },
    'T-26':async t =>
    {
        t.assert(await mount(t,`{ columns:${COLUMNS}, selectable:true, displayMode:'SCROLL', rows:[ { order:'ORD-1' }, { id:'a', order:'ORD-2' }, { id:'a', order:'ORD-3' } ] }`),'rendered');
        t.equal([ ( await warnings(t,'ROW_ID_MISSING') ).length, ( await warnings(t,'DUPLICATE_ROW_ID') ).length ],[ 1, 1 ],'one warning each');
    },
    'T-27':async t =>
    {
        await hostWidth(t,'1200px');
        await mount(t,`{ columns:${COLUMNS}, dataMode:'SERVER', itemsPerPage:10, onDataRequest:record('onDataRequest') }`);
        await t.call('setError');
        await settle(t);
        await t.page.evaluate(id => { document.querySelector(`#${id} tbody .ui-message`).dataset.first = 'yes'; },ID);
        for ( const width of [ '560px', '1200px' ] )
        {
            await hostWidth(t,width);
            await settle(t);
            const message = await t.page.evaluate(id => { const element = document.querySelector(`#${id} tbody .ui-message`); return { same:element?.dataset.first === 'yes', span:element?.closest('td').colSpan, columns:1 + ( document.querySelector(`#${id}`).classList.contains('ui-table-cards') ? 1 : 5 ) }; },ID);
            t.equal(message.same,true,`at ${width} the error message stays (not announced again)`);
            t.equal(message.span,message.columns,`at ${width} it spans the visible columns`);
        }
    }
};
