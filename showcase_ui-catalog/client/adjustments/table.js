// table.js
//
// CUSTOMIZATION ADJUSTMENTS (Table).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/table.html (orders), with customers from many European countries. Column priorities: Order
// and Actions always; Customer, Status and Invoice first; then Date (short view first), then Total — a narrow live
// example (laid out 900px wide) leaves out the least important columns first, as the component does on narrow screens. In SERVER mode the live
// example answers onDataRequest itself: it sorts and pages the rows after a short delay, as a server would.
// Variants panel: the README options except label, columns, rows and selectionActions (they keep their start values);
// locale is a Select of en, de, sv, ro (or the page language) — the 15 customers include Åsa Lindqvist, Örjan Berg,
// Ștefan Ionescu, Sven Olsen and Zoltán Kiss, whose order changes with the language when sorting by Customer; plus three panel-only checkboxes (fields; start unticked) that add columns through the column render option:
//   showLinks   — "Invoice": a link per row;
//   showActions — "Actions": tertiary icon Buttons — one (View), two (View, Edit) or, for more than two, an ActionMenu;
//   statusIcons — the Status column gets a coloured icon before the text (shape and colour together).

import { renderButton } from '../components/button/buttonIndex.js';
import { renderActionMenu } from '../components/actionMenu/actionMenuIndex.js';

const SERVER_DELAY_MS = 600;
const PANEL_FIELDS = [ 'showLinks', 'showActions', 'statusIcons' ];
// Status icon and colour token (the text stays, so the meaning never depends on colour alone).
const STATUS_ICONS =
{
    New:{ icon:'fa-solid fa-circle-plus', color:'--c-info' },
    Paid:{ icon:'fa-solid fa-credit-card', color:'--c-accent' },
    Shipped:{ icon:'fa-solid fa-truck', color:'--c-warning' },
    Delivered:{ icon:'fa-solid fa-circle-check', color:'--c-success' },
    Cancelled:{ icon:'fa-solid fa-circle-xmark', color:'--c-danger' }
};

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Sorts and pages rows the way a server would answer a data request.
function answerRequest( rows, { page, pageSize, sort } )
{
    const sorted = [ ...rows ];
    if ( sort?.field && sort.direction ) { sorted.sort(( a, b ) => String(a[sort.field] ?? '').localeCompare(String(b[sort.field] ?? ''),undefined,{ numeric:true }) * ( sort.direction === 'DESC' ? -1 : 1 )); }
    return sorted.slice(( page - 1 ) * pageSize,page * pageSize);
}

// Column "Invoice": a link per row.
const LINK_COLUMN =
{
    field:'invoice', label:'Invoice', width:'S', priority:1, sortable:false,
    render:( host, row ) => { host.innerHTML = `<a href="#invoice-${escapeHTML(row.number)}">${escapeHTML(row.number.replace('ORD','INV'))}</a>`; return null; }
};

// Column "Actions": one, two or (more than two) an ActionMenu — all tertiary icon Buttons; presses are reported.
function actionColumn( report )
{
    const ACTIONS = [ { key:'view', label:'View', icon:'fa-solid fa-eye' }, { key:'edit', label:'Edit', icon:'fa-solid fa-pen' }, { key:'duplicate', label:'Duplicate', icon:'fa-regular fa-copy' }, { key:'delete', label:'Delete', icon:'fa-solid fa-trash', danger:true } ];
    return {
        field:'actions', label:'Actions', width:'S', priority:'ALWAYS', sortable:false, alignment:'END',
        render:( host, row ) =>
        {
            const count = [ 1, 2, 4 ][( row.id - 1 ) % 3];
            const actions = ACTIONS.slice(0,count), id = `order-${row.id}`;
            if ( count > 2 )
            {
                return renderActionMenu(host,{ id:`${id}-more`, label:`More actions for ${row.number}`, size:'SMALL',
                    items:actions.map(action => ( { key:action.key, label:action.label, icon:action.icon, danger:action.danger } )) },key => report('action',key,row.number));
            }
            host.innerHTML = actions.map(action => `<span data-action="${action.key}"></span>`).join('');
            const buttons = actions.map(action => renderButton(host.querySelector(`[data-action="${action.key}"]`),{ id:`${id}-${action.key}`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:action.icon, ariaLabel:`${action.label} ${row.number}` },() => report('action',action.key,row.number)));
            return { destroy:() => buttons.forEach(button => button?.destroy()) };
        }
    };
}

// Status cell with a small coloured icon (--icon-size-small) before the text.
function statusRender( host, row )
{
    const status = STATUS_ICONS[row.status];
    host.innerHTML = status ? `<i class="${status.icon}" aria-hidden="true" style="color:var(${status.color}); font-size:var(--icon-size-small); margin-inline-end:var(--gap-tight)"></i>${escapeHTML(row.status)}` : escapeHTML(row.status);
    return null;
}

export default
{
    hide:[ 'label', 'columns', 'rows', 'selectionActions' ],
    // locale: four languages whose sorting differs on the demo names (Å, Ö, Ș); empty = the page language
    choices:{ locale:[ 'en', 'de', 'sv', 'ro' ] },
    fields:
    [
        { path:'showLinks', kind:'string', description:'Adds the column "Invoice" with a link per row (e.g. INV-1031), drawn by the column render option. A link is the usual way to open a record: rows themselves are never clickable.' },
        { path:'showActions', kind:'string', description:'Adds the column "Actions" with tertiary icon Buttons: some rows have one action (View), some two (View, Edit), and rows with more than two show one "more" button that opens an ActionMenu (View, Edit, Duplicate, Delete). Pressing an action is shown in the Output.' },
        { path:'statusIcons', kind:'string', description:'Shows a coloured icon before each status (New, Paid, Shipped, Delivered, Cancelled). The text stays, so the status never depends on colour alone.' }
    ],
    checkboxes:{ showLinks:'ON', showActions:'ON', statusIcons:'ON' },
    valueLabels:{ showLinks:{ ON:'Show the links column' }, showActions:{ ON:'Show the actions column' }, statusIcons:{ ON:'Show status icons' } },
    uses:[ 'button', 'actionMenu', 'tooltip' ],
    // Laid out 900px wide (scaled down to fit narrower pages), so the table shows its columns instead of cards (below
    // 40rem) and the optional columns have room; Menu popups need some height.
    stage:{ width:900, minHeight:'--size-md-3' },
    start:
    {
        label:'Orders',
        itemsPerPage:15,
        selectable:true,
        selectionActions:[ { key:'export', label:'Export', icon:'fa-solid fa-file-export' }, { key:'delete', label:'Delete', icon:'fa-solid fa-trash', hierarchy:'SECONDARY' } ],
        columns:
        [
            { field:'number', label:'Order', priority:'ALWAYS', width:'S' },
            { field:'customer', label:'Customer', width:'M', priority:1 },
            { field:'date', label:'Date', type:'DATE', width:'M', priority:2, compact:{ width:'S' } },
            { field:'status', label:'Status', width:'S', priority:1 },
            { field:'total', label:'Total (EUR)', type:'NUMBER', width:'S', priority:3 }
        ],
        rows:
        [
            { id:1, number:'ORD-1031', customer:'Ana Popescu', date:'2026-09-02', status:'Delivered', total:120.5 },
            { id:2, number:'ORD-1032', customer:'Lukas Müller', date:'2026-09-03', status:'Delivered', total:89 },
            { id:3, number:'ORD-1033', customer:'Chloé Martin', date:'2026-09-05', status:'Cancelled', total:45.9 },
            { id:4, number:'ORD-1034', customer:'Åsa Lindqvist', date:'2026-09-06', status:'Delivered', total:212 },
            { id:5, number:'ORD-1035', customer:'Giulia Bianchi', date:'2026-09-08', status:'Delivered', total:310 },
            { id:6, number:'ORD-1036', customer:'Ștefan Ionescu', date:'2026-09-10', status:'Shipped', total:66.6 },
            { id:7, number:'ORD-1037', customer:'Javier García', date:'2026-09-11', status:'Shipped', total:72.4 },
            { id:8, number:'ORD-1038', customer:'Sofia Andersson', date:'2026-09-14', status:'Shipped', total:15 },
            { id:9, number:'ORD-1039', customer:'Zoltán Kiss', date:'2026-09-17', status:'Paid', total:48.2 },
            { id:10, number:'ORD-1040', customer:'Jan Kowalski', date:'2026-09-20', status:'Paid', total:230.1 },
            { id:11, number:'ORD-1041', customer:'Örjan Berg', date:'2026-09-22', status:'Paid', total:91 },
            { id:12, number:'ORD-1042', customer:'Eva Novotná', date:'2026-09-24', status:'Paid', total:64 },
            { id:13, number:'ORD-1043', customer:'Sven Olsen', date:'2026-09-29', status:'New', total:98.75 },
            { id:14, number:'ORD-1044', customer:'Katalin Nagy', date:'2026-10-02', status:'New', total:142 },
            { id:15, number:'ORD-1045', customer:'João Silva', date:'2026-10-07', status:'New', total:57.3 }
        ]
    },
    // Adds the optional columns; in SERVER mode the rows option does not apply, so the example keeps them to answer the requests.
    prepare:( { config, report } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        config.columns = ( config.columns ?? [] ).map(column => ( panel.statusIcons && column.field === 'status' ? { ...column, render:statusRender } : { ...column } ));
        if ( panel.showLinks ) { config.columns.splice(1,0,{ ...LINK_COLUMN }); }
        if ( panel.showActions ) { config.columns.push(actionColumn(report)); }
        if ( config.dataMode !== 'SERVER' ) { return [ config ]; }
        const rows = config.rows ?? [];
        delete config.rows;
        const reportRequest = config.onDataRequest;
        config.onDataRequest = ( request, table ) => { reportRequest?.(request,table); setTimeout(() => table.setRows(answerRequest(rows,request),rows.length),SERVER_DELAY_MS); };
        return [ config ];
    },
    appliesWhen:{ rows:() => true }
};
