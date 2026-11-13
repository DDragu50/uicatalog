// tableIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Table only from this file.
//
// renderTable(container, config)
//   Renders a data table into a dedicated, consumer-owned container and returns
//   { id, setRows, setLoading, setError, getSelection, clearSelection, getSort, setSort, getPage, setPage,
//     getItemsPerPage, getVisibleColumns, destroy }, or null after a developer error.
//
// dataMode CLIENT (default): all rows in config.rows or setRows(rows); Table sorts and pages them.
// dataMode SERVER: Table calls onDataRequest({ page, pageSize, sort }, table); the application loads the page and
//   calls table.setRows(pageRows, totalItems).
// Visible columns (priority and width), compact views, card mode and rows per page are decided once, before display.
// Rows are never clickable: actions live in cells rendered by column.render(host, row, context) (links, Buttons,
// ActionMenu). Selection: checkboxes; the header checkbox selects the current page, "Select all N items" the table.
//
// Everything not exported here is internal implementation.

export { renderTable } from './tableComponent.js';
export { DEFAULT_TABLE_CONFIG, TABLE_TOOLTIP_MODES, TABLE_DATA_MODES, TABLE_DISPLAY_MODES, TABLE_COLUMN_TYPES, TABLE_ALIGNMENTS, TABLE_COLUMN_WIDTHS } from './tableConfig.js';
