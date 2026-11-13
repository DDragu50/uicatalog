// tableState.js
//
// RUNTIME STATE.
// Per-instance rows, total, page, sort, selection (current-page ids or "all" with exclusions), load status and
// the layout (visible columns, compact columns, card mode: decided at first display and again when the container's
// width changes; rows per page: decided once).

// Creates independent runtime state.
export function createTableState( config )
{
    return {
        rows:[], total:0, page:1, pageSize:config.itemsPerPage ?? 5,
        sort:{ field:null, direction:null },
        selection:{ scope:'IDS', ids:new Set(), excluded:new Set() },
        status:'READY', errorMessage:'',
        layout:{ columns:config.columns, compact:new Set(), cards:false },
        cellInstances:[]
    };
}

// Returns the row key used for selection (ids compared as strings).
export const rowKey = row => String(row?.id);

// Returns whether a row is selected.
export function isSelected( state, row )
{
    const key = rowKey(row);
    return state.selection.scope === 'ALL' ? !state.selection.excluded.has(key) : state.selection.ids.has(key);
}

// Selects or deselects one row.
export function setRowSelected( state, row, selected )
{
    const key = rowKey(row), { scope, ids, excluded } = state.selection;
    if ( scope === 'ALL' ) { if ( selected ) { excluded.delete(key); } else { excluded.add(key); } }
    else if ( selected ) { ids.add(key); } else { ids.delete(key); }
}

// Returns the public selection: { scope, ids, excludedIds, count }.
export function publicSelection( state, dataMode, allRows )
{
    const { scope, ids, excluded } = state.selection;
    if ( scope === 'ALL' )
    {
        const count = Math.max(0,state.total - excluded.size);
        const selectedIds = dataMode === 'CLIENT' ? allRows.map(rowKey).filter(key => !excluded.has(key)) : [];
        return { scope:'ALL', ids:selectedIds, excludedIds:[ ...excluded ], count };
    }
    return { scope:'IDS', ids:[ ...ids ], excludedIds:[], count:ids.size };
}

// Compares two values by column type (text in the table's language, numbers, dates); empty values sort last.
export function compareValues( a, b, type, collator )
{
    const empty = value => value === null || value === undefined || value === '';
    if ( empty(a) || empty(b) ) { return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1; }
    if ( type === 'NUMBER' ) { return Number(a) - Number(b); }
    if ( type === 'DATE' ) { return new Date(a) - new Date(b); }
    return collator.compare(String(a),String(b));
}

// Returns rows sorted by the current sort (stable); unsorted returns the original order.
export function sortedRows( rows, sort, columns, collator )
{
    if ( !sort.field || !sort.direction ) { return rows; }
    const column = columns.find(item => item.field === sort.field);
    const factor = sort.direction === 'ASC' ? 1 : -1;
    return rows.map(( row, index ) => ({ row, index })).sort(( a, b ) => factor * compareValues(a.row[sort.field],b.row[sort.field],column?.type ?? 'TEXT',collator) || a.index - b.index).map(item => item.row);
}
