// tableComponent.js
//
// COMPONENT COORDINATOR.
// Owns the table lifecycle: layout decided before display and again whenever the container's width changes (visible
// and compact columns by priority and width, card mode; data, sort, page and selection are kept), rows per page decided
// once, client-side or server-side data, sorting, current-page selection with
// "select all", the counts/actions bar, cell rendering and the Pagination. While data loads, a Loader line runs under
// the column header and the rows already shown stay, dimmed and inert. Composes Button, Pagination, Message and Loader as
// declared dependencies; cells may contain any component through column.render(). The container is a dedicated,
// consumer-owned mount point.

import { mergeTableConfig, validateTableConfig, checkRowIds } from './tableConfig.js';
import { createTableState, rowKey, isSelected, setRowSelected, publicSelection, sortedRows } from './tableState.js';
import { buildTableShellHTML, buildColumnsHTML, buildMessageRowHTML, buildRowHTML, buildProbeRowHTML, columnWidthToken } from './tableHTML.js';
import { registerTableEvents } from './tableEvents.js';
import { reportTableIssue } from './tableErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderPagination } from '../pagination/paginationIndex.js';
import { renderMessage } from '../message/messageIndex.js';
import { renderLoader } from '../loader/loaderIndex.js';

const CARD_BREAKPOINT_REM = 40;

// Measures a CSS length (e.g. a token) in pixels inside an element.
function measure( host, property, value )
{
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;${property}:${value};`;
    host.appendChild(probe);
    const size = property === 'inline-size' ? probe.offsetWidth : probe.offsetHeight;
    probe.remove();
    return size;
}

// Decides which columns are visible, which use their compact view, and whether rows become cards, for the container's
// current width (before display, and again when that width changes).
function decideLayout( config, container )
{
    const available = container.clientWidth;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const width = token => measure(container,'inline-size',`var(${token})`);
    const fixed = ( config.selectable ? width('--table-column-select') : 0 ) + width('--table-column-counter');
    const always = config.columns.filter(column => column.always);
    if ( available < CARD_BREAKPOINT_REM * rem ) { return { columns:always, compact:new Set(), cards:true }; }
    let visible = [ ...config.columns ];
    const compact = new Set();
    const total = () => fixed + visible.reduce(( sum, column ) => sum + width(columnWidthToken(column,compact.has(column.field))),0);
    const byImportance = list => [ ...list ].sort(( a, b ) => ( b.always ? -1 : b.priority ) - ( a.always ? -1 : a.priority ) || config.columns.indexOf(b) - config.columns.indexOf(a));
    for ( const column of byImportance(visible.filter(item => item.compact)) ) { if ( total() <= available ) { break; } compact.add(column.field); }
    for ( const column of byImportance(visible.filter(item => !item.always)) ) { if ( total() <= available ) { break; } visible = visible.filter(item => item !== column); }
    if ( total() > available ) { return { columns:always, compact:new Set(), cards:true }; }
    return { columns:visible, compact, cards:false };
}

// Whether two layout decisions show the same thing (same columns, compact views and card mode).
function sameLayout( a, b )
{
    return a.cards === b.cards && a.columns.length === b.columns.length && a.columns.every(( column, index ) => column === b.columns[index]) && a.compact.size === b.compact.size && [ ...a.compact ].every(field => b.compact.has(field));
}

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

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

// Renders a Table and returns its runtime instance, or null after a developer error.
export function renderTable( container, config )
{
    if ( !container ) { reportTableIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTableConfig(config);
    if ( validateTableConfig(merged) ) { return null; }

    const state = createTableState(merged);
    const collator = new Intl.Collator(merged.locale,{ numeric:true, sensitivity:'base' });
    // Numbers in the counts line and the selection links, written with the locale's digit grouping (12,000 / 12.000 / 12 000).
    const numberFormat = new Intl.NumberFormat(merged.locale);
    const count = value => numberFormat.format(value);
    state.layout = decideLayout(merged,container);
    container.innerHTML = buildTableShellHTML(merged,state.layout);
    const root = container.querySelector('.ui-table');
    const table = root.querySelector('.ui-table-grid');
    const body = table.querySelector('tbody');
    const counts = root.querySelector('.ui-table-counts');
    const pageBox = root.querySelector('.ui-table-select-page');
    const paging = merged.displayMode === 'PAGINATION';
    let span = ( merged.selectable ? 1 : 0 ) + 1 + state.layout.columns.length;
    const buttons = {};
    let allRows = [], controller = null, pagination = null, rowMessage = null, instance = null, rowsShown = false, resizeObserver = null, layoutFrame = 0;
    // The line under the column header while data loads (EDGE Loader on the progress cell; shown after its delay).
    const progressCell = table.querySelector('.ui-table-progress-cell');
    const loader = renderLoader(progressCell.querySelector('.ui-table-loader-host'),{ id:`${merged.id}-loader`, placement:'EDGE', target:progressCell, label:merged.texts.loading });

    // ---- data and pages ----

    // Returns the rows of the current view: client → sorted and sliced; server → the loaded page.
    function viewRows()
    {
        if ( merged.dataMode === 'SERVER' ) { return state.rows; }
        const rows = sortedRows(allRows,state.sort,merged.columns,collator);
        return paging ? rows.slice(( state.page - 1 ) * state.pageSize,state.page * state.pageSize) : rows;
    }

    // Number of the first row of the current view (row numbers continue across pages).
    const firstNumber = () => ( paging ? ( state.page - 1 ) * state.pageSize : 0 ) + 1;

    // Asks the application for a page (server mode) and shows the loading state.
    function requestData()
    {
        setStatus('LOADING');
        merged.onDataRequest?.({ page:state.page, pageSize:state.pageSize, sort:state.sort.field ? { field:state.sort.field, direction:state.sort.direction } : null },instance);
    }

    // Sets the load status (READY, LOADING, ERROR) and redraws the body. LOADING runs the Loader line; rows already shown
    // stay (dimmed, inert) until the new data arrives, otherwise the "Loading…" row is shown.
    function setStatus( status, message = '' )
    {
        state.status = status;
        state.errorMessage = message;
        table.setAttribute('aria-busy',String(status === 'LOADING'));
        if ( status === 'LOADING' ) { loader?.start(); } else { loader?.hide(); }
        const keep = status === 'LOADING' && rowsShown;
        root.classList.toggle('ui-table-loading',keep);
        body.inert = keep;
        if ( keep ) { updateHeader(); updateBar(); return; }
        drawBody();
    }

    // ---- drawing (in place) ----

    // Destroys component instances rendered into cells.
    function destroyCells() { state.cellInstances.splice(0).forEach(item => item?.destroy?.()); rowMessage?.destroy(); rowMessage = null; }

    // Redraws the body for the current view, rendering render() cells as component hosts. keepRows: while data loads,
    // draw the rows already shown again (after a new layout) instead of the "Loading…" row.
    function drawBody( keepRows = false )
    {
        destroyCells();
        const rows = viewRows();
        rowsShown = ( state.status === 'READY' || keepRows ) && rows.length > 0;
        if ( state.status === 'LOADING' && !keepRows ) { body.innerHTML = buildMessageRowHTML(span,merged.texts.loading,'loading'); }
        else if ( state.status === 'ERROR' )
        {
            // INFO Message (the user can only retry); BLOCK with a Retry action in server mode, INLINE otherwise; announced.
            body.innerHTML = buildMessageRowHTML(span,'','error',true);
            const retry = merged.dataMode === 'SERVER';
            rowMessage = renderMessage(body.querySelector('.ui-table-message-host'),{ id:`${merged.id}-error`, type:'INFO', layout:retry ? 'BLOCK' : 'INLINE', text:state.errorMessage || merged.texts.loadError,
                actions:retry ? [ { key:'retry', label:merged.texts.retry, hierarchy:'SECONDARY' } ] : undefined, onAction:() => requestData(), visible:false });
            rowMessage?.show();
        }
        else if ( rows.length === 0 )
        {
            body.innerHTML = buildMessageRowHTML(span,'','empty',true);
            rowMessage = renderMessage(body.querySelector('.ui-table-message-host'),{ id:`${merged.id}-empty`, type:'INFO', layout:'INLINE', text:merged.texts.noData });
        }
        else
        {
            const first = firstNumber();
            body.innerHTML = rows.map(( row, index ) => buildRowHTML(merged,state.layout,row,first + index,isSelected(state,row))).join('');
            [ ...body.rows ].forEach(( tr, index ) => tr.querySelectorAll('td[data-render]').forEach(cell =>
            {
                const column = state.layout.columns.find(item => item.field === cell.dataset.field);
                state.cellInstances.push(column.render(cell,rows[index],{ rowIndex:index, number:first + index, compact:state.layout.compact.has(column.field), table:instance }) ?? null);
            }));
        }
        updateHeader();
        updateBar();
    }

    // Updates sort states and the page checkbox in place.
    function updateHeader()
    {
        table.querySelectorAll('th[data-field]').forEach(th =>
        {
            const sorted = state.sort.field === th.dataset.field ? state.sort.direction : null;
            if ( th.hasAttribute('aria-sort') ) { th.setAttribute('aria-sort',sorted === 'ASC' ? 'ascending' : sorted === 'DESC' ? 'descending' : 'none'); }
            const icon = th.querySelector('.ui-table-sort-icon i');
            if ( icon ) { icon.className = sorted === 'ASC' ? 'fa-solid fa-arrow-up' : sorted === 'DESC' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-up-down'; }
        });
        if ( pageBox )
        {
            const rows = state.status === 'READY' ? viewRows() : [];
            const selected = rows.filter(row => isSelected(state,row)).length;
            pageBox.checked = rows.length > 0 && selected === rows.length;
            pageBox.indeterminate = selected > 0 && selected < rows.length;
            pageBox.disabled = rows.length === 0;
        }
    }

    // Updates the counts line ("600 items, 123–146 visible now, 12 selected") and the selection links and actions.
    function updateBar()
    {
        const t = merged.texts, selection = publicSelection(state,merged.dataMode,allRows);
        const parts = [ ( state.total === 1 ? t.itemsSingular : t.items ).replace('{count}',count(state.total)) ];
        const rows = state.status === 'READY' ? viewRows() : [];
        if ( paging && rows.length ) { parts.push(t.visible.replace('{from}',count(firstNumber())).replace('{to}',count(firstNumber() + rows.length - 1))); }
        if ( selection.count > 0 ) { parts.push(t.selected.replace('{count}',count(selection.count))); }
        counts.textContent = parts.join(', ');
        if ( !merged.selectable ) { return; }
        const pageAll = rows.length > 0 && rows.every(row => isSelected(state,row));
        setHidden('select-all',!( state.selection.scope === 'IDS' && pageAll && state.total > rows.length ));
        const label = t.selectAll.replace('{count}',count(state.total));
        if ( buttons['select-all'] && state.selectAllLabel !== label ) { buttons['select-all'].destroy(); state.selectAllLabel = label; addButton('select-all',root.querySelector('[data-button="select-all"]'),{ label },selectAll); }
        setHidden('clear-selection',selection.count === 0);
        root.querySelectorAll('.ui-table-actions [data-action]').forEach(host => { host.hidden = selection.count === 0; });
    }

    // Shows or hides a selection-link host.
    function setHidden( name, hidden ) { const host = root.querySelector(`[data-button="${name}"]`); if ( host ) { host.hidden = hidden; } }

    // Updates row checkboxes and selected styles in place, then the header and bar; reports the selection.
    function selectionChanged()
    {
        const rows = viewRows();
        [ ...body.rows ].forEach(( tr, index ) =>
        {
            const row = rows[index];
            if ( !row || !tr.dataset.rowKey ) { return; }
            const selected = isSelected(state,row);
            tr.classList.toggle('ui-table-row-selected',selected);
            const box = tr.querySelector('.ui-table-select-row');
            if ( box ) { box.checked = selected; }
        });
        updateHeader();
        updateBar();
        merged.onSelectionChange?.(publicSelection(state,merged.dataMode,allRows),instance);
    }

    // ---- layout again when the space changes ----

    // Decides the layout for the container's current width; when it differs, replaces the column widths and headers,
    // switches card mode and draws the rows again. Data, sort, page, selection and rows per page stay; focus on a sort
    // button or a row checkbox is kept.
    function relayout()
    {
        layoutFrame = 0;
        if ( !container.isConnected || !container.clientWidth ) { return; }
        const layout = decideLayout(merged,container);
        if ( sameLayout(layout,state.layout) ) { return; }
        const active = root.contains(document.activeElement) ? document.activeElement : null;
        const focusSort = active?.closest('.ui-table-sort')?.dataset.sort;
        const focusRow = active?.matches('.ui-table-select-row') ? active.closest('tr')?.dataset.rowKey : null;
        state.layout = layout;
        span = ( merged.selectable ? 1 : 0 ) + 1 + layout.columns.length;
        const { cols, heads } = buildColumnsHTML(merged,layout);
        table.querySelector('colgroup').innerHTML = cols;
        const headRow = table.tHead.rows[0];
        headRow.querySelectorAll('th[data-field]').forEach(th => th.remove());
        headRow.insertAdjacentHTML('beforeend',heads);
        progressCell.colSpan = span;
        root.classList.toggle('ui-table-cards',layout.cards);
        // Rows are drawn again for the new columns; a message row ("Loading…", empty, load error) only gets the new
        // span, so its Message is not rendered (and announced) again.
        if ( rowsShown ) { drawBody(state.status === 'LOADING'); }
        else { body.querySelectorAll('tr.ui-table-message > td').forEach(cell => { cell.colSpan = span; }); updateHeader(); }
        root.style.setProperty('--ui-table-head-height',`${table.tHead.rows[0].offsetHeight}px`);
        if ( focusSort ) { root.querySelector(`.ui-table-sort[data-sort="${CSS.escape(focusSort)}"]`)?.focus(); }
        else if ( focusRow ) { body.querySelector(`tr[data-row-key="${CSS.escape(focusRow)}"] .ui-table-select-row`)?.focus(); }
        // The focused element is gone or hidden (e.g. a header in card mode): keep keyboard users in the table.
        if ( active && !root.contains(document.activeElement) ) { table.tabIndex = -1; table.focus({ preventScroll:true }); }
    }

    // ---- user actions ----

    // Cycles a column's sort: ascending → descending → none; goes back to page 1.
    function toggleSort( field )
    {
        const next = state.sort.field !== field ? 'ASC' : state.sort.direction === 'ASC' ? 'DESC' : state.sort.direction === 'DESC' ? null : 'ASC';
        state.sort = { field:next ? field : null, direction:next };
        goToPage(1,true);
    }

    // Moves to a page: client redraws; server requests the page.
    function goToPage( page, force = false )
    {
        if ( page === state.page && !force ) { return; }
        state.page = page;
        if ( merged.dataMode === 'SERVER' ) { requestData(); } else { drawBody(); }
        pagination?.update({ currentPage:state.page });
    }

    // Selects or deselects all rows of the current page.
    function selectPage( selected ) { viewRows().forEach(row => setRowSelected(state,row,selected)); selectionChanged(); }

    // Selects or deselects one row by key.
    function selectRow( key, selected ) { const row = viewRows().find(item => rowKey(item) === key); if ( row ) { setRowSelected(state,row,selected); selectionChanged(); } }

    instance =
    {
        id:merged.id,
        // Replaces the data: client → all rows; server → the loaded page rows plus the total number of items.
        setRows:( rows, totalItems ) =>
        {
            const list = Array.isArray(rows) ? rows : [];
            checkRowIds(merged,list);
            if ( merged.dataMode === 'SERVER' ) { state.rows = list; state.total = Number.isInteger(totalItems) && totalItems >= 0 ? totalItems : list.length; }
            else { allRows = list; state.total = list.length; }
            const last = paging ? Math.max(1,Math.ceil(state.total / state.pageSize)) : 1;
            if ( state.page > last ) { state.page = last; }
            pagination?.update({ totalItems:state.total, currentPage:state.page });
            setStatus('READY');
        },
        // Shows the loading state (e.g. while the application loads the data).
        setLoading:() => setStatus('LOADING'),
        // Shows a load error (optional message) with a Retry button in server mode.
        setError:( message ) => setStatus('ERROR',String(message ?? '')),
        // Returns the selection { scope:'IDS' | 'ALL', ids, excludedIds, count }.
        getSelection:() => publicSelection(state,merged.dataMode,allRows),
        // Clears the selection.
        // Enables or disables a selection action Button; returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            const index = merged.selectionActions.findIndex(action => action.key === String(key));
            if ( index < 0 ) { reportTableIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            buttons[`action-${index}`]?.setDisabled(Boolean(disabled) || !merged.onSelectionAction);
            return true;
        },
        clearSelection:() => { state.selection = { scope:'IDS', ids:new Set(), excluded:new Set() }; selectionChanged(); },
        // Returns the sort { field, direction } (direction 'ASC', 'DESC' or null).
        getSort:() => ({ ...state.sort }),
        // Sets the sort programmatically (direction 'ASC', 'DESC' or null) and goes back to page 1.
        setSort:( field, direction ) => { const dir = direction ? String(direction).toUpperCase() : null; state.sort = { field:dir && merged.columns.some(column => column.field === field) ? field : null, direction:dir === 'ASC' || dir === 'DESC' ? dir : null }; goToPage(1,true); },
        // Returns the current page.
        getPage:() => state.page,
        // Moves to a page programmatically.
        setPage:( page ) => { const last = Math.max(1,Math.ceil(state.total / state.pageSize)); goToPage(Math.min(Math.max(1,Number(page) || 1),last)); },
        // Returns the rows per page in use (automatic or explicit).
        getItemsPerPage:() => state.pageSize,
        // Returns the fields of the visible columns (for the container's current width).
        getVisibleColumns:() => state.layout.columns.map(column => column.field),
        // Removes listeners, the resize observer, cell components, Buttons and the Pagination, then clears the container.
        destroy:() => { resizeObserver?.disconnect(); cancelAnimationFrame(layoutFrame); removeHintTooltip(); destroyCells(); controller?.abort(); Object.values(buttons).forEach(button => button?.destroy()); pagination?.destroy(); loader?.destroy(); container.innerHTML = ''; }
    };

    // Selection links and application actions (Buttons).
    // Renders a tertiary small Button into a host and remembers it.
    function addButton( key, host, options, onClick ) { if ( host ) { buttons[key] = renderButton(host,{ id:`${merged.id}-${key}`, hierarchy:'TERTIARY', size:'SMALL', ...options },onClick); } }
    // Switches the selection to all items of the table.
    function selectAll() { state.selection = { scope:'ALL', ids:new Set(), excluded:new Set() }; selectionChanged(); }
    addButton('select-all',root.querySelector('[data-button="select-all"]'),{ label:merged.texts.selectAll.replace('{count}','0') },selectAll);
    addButton('clear-selection',root.querySelector('[data-button="clear-selection"]'),{ label:merged.texts.clearSelection },() => instance.clearSelection());
    // Selection actions (guidelines §10.2): SECONDARY by default; without onSelectionAction they are disabled.
    merged.selectionActions.forEach(( action, index ) => { const host = root.querySelector(`.ui-table-actions [data-action="${CSS.escape(action.key)}"]`); if ( host ) { buttons[`action-${index}`] = renderButton(host,buildActionButtonConfig(`${merged.id}-action-${index}`,action,'SECONDARY',action.disabled || !merged.onSelectionAction,merged.iconTooltip),() => merged.onSelectionAction?.(action.key,publicSelection(state,merged.dataMode,allRows),instance)); } });

    // Sticky offsets: the bar sticks below the page's sticky header, the column header below the bar, the Loader line below the header.
    root.style.setProperty('--ui-table-bar-height',`${root.querySelector('.ui-table-bar').offsetHeight}px`);
    // The Loader line sticks below the column header.
    root.style.setProperty('--ui-table-head-height',`${table.tHead.rows[0].offsetHeight}px`);

    // Rows per page decided once: automatic (rows that fit the screen height, rounded down to 5, minimum 5) or explicit.
    if ( paging && merged.itemsPerPage === null )
    {
        body.innerHTML = buildProbeRowHTML(merged,state.layout);
        const rowHeight = body.rows[0].offsetHeight || 1;
        body.innerHTML = '';
        const offset = measure(container,'block-size','var(--page-sticky-offset)');
        const footer = measure(container,'block-size','calc(var(--control-height) + 2 * var(--gap-form-field))');
        const space = window.innerHeight - offset - root.querySelector('.ui-table-bar').offsetHeight - table.tHead.offsetHeight - footer;
        state.pageSize = Math.max(5,Math.floor(Math.floor(space / rowHeight) / 5) * 5);
    }
    else if ( paging ) { state.pageSize = merged.itemsPerPage; }

    if ( paging ) { pagination = renderPagination(root.querySelector('.ui-table-pagination-host'),{ id:`${merged.id}-pagination`, label:merged.texts.pagination, locale:merged.locale, totalItems:0, itemsPerPage:state.pageSize, currentPage:1 },page => goToPage(page)); }
    controller = registerTableEvents(root,{ onSort:toggleSort, onSelectPage:selectPage, onSelectRow:selectRow });

    if ( merged.dataMode === 'SERVER' ) { updateBar(); requestData(); } else { instance.setRows(merged.rows); }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ onlyWhenTruncated:true });
    // Layout again when the container's width changes (window resized, phone turned, side panel opened); once per frame.
    let lastWidth = container.clientWidth;
    resizeObserver = new ResizeObserver(() =>
    {
        const width = container.clientWidth;
        if ( width === lastWidth ) { return; }
        lastWidth = width;
        if ( !layoutFrame ) { layoutFrame = requestAnimationFrame(relayout); }
    });
    resizeObserver.observe(container);
    return instance;
}
