# Table

## For business

### Overview

Table shows lists of records (orders, customers, invoices) in rows and columns. It fits the screen before it is shown, and again when the space changes: it chooses which columns are visible, how many rows fit on a page, and on small screens turns each row into a card. Users sort columns, move between pages, select rows and act on them; the application decides what the actions do.

### When to use

- Use it for lists of records with several attributes: orders, customers, invoices.
- Use TreeView for data organised in levels, and Pagination with the application's own layout for lists that are not tables.

### Key features

- Small tables sorted and paged in the browser; large tables loaded page by page from the server.
- Columns that fit the screen by importance, and rows that become cards on narrow screens; both adapt when the window is resized.
- Sorting that follows the user's language and compares numbers by value.
- Optional row selection, including all items, with buttons for the selected rows.
- A counts line: items, rows visible now and selected rows.
- While a page loads, the rows already shown stay (dimmed) and a thin line runs under the column header, so the table does not jump.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, column widths, spacing and typography. |
| Table styles (`table.css`) | Always | Table, bar, cards. |
| Button component and `button.css` | Always | Selection links and actions, Retry. |
| Message component and `message.css` | Always | "No data" and load-error messages. |
| Pagination component and `pagination.css` | Pagination display | Page navigation. |
| Loader component and `loader.css` | Always | The line under the column header while data loads. |
| Font Awesome icon library | Always | Sort and button icons. Loaded by the application page. |
| ActionMenu, other components | When used in cells | Rendered by the application through `render()`. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application loads data (server mode), performs row and selection actions (with confirmations), formats dates and amounts (through `format`), and remembers user preferences. Column filters in the header, expandable rows, grouping, totals, inline editing, resizing and reordering, export and virtual scrolling are not part of this version.

## For designers

### Structure

```text
div#{id}.ui-table[.ui-table-sticky][.ui-table-cards][.ui-table-hover][.ui-table-alternate]
├── div.ui-table-bar
│   ├── span.ui-table-counts                      "600 items, 121–144 visible now, 12 selected"
│   ├── span.ui-table-selection-links → Buttons  "Select all 600 items", "Clear selection"   (selectable)
│   └── span.ui-table-actions > span.ui-table-action → Button   selection actions (shown with a selection)
├── table.ui-table-grid  (fixed layout; col widths from --table-column-* tokens)
│   ├── thead > tr > th.ui-table-select-cell (page checkbox) + th.ui-table-counter "#" + th[aria-sort] > button.ui-table-sort
│   │   └── tr.ui-table-progress > td.ui-table-progress-cell > div.ui-table-loader-host → Loader (EDGE: a line under the header while data loads)
│   └── tbody > tr[.ui-table-row-selected]
│       ├── td.ui-table-select-cell > input.ui-table-select-row
│       ├── td.ui-table-counter
│       └── td.ui-table-align-{start|center|end}[.ui-table-always] > span.ui-table-truncate[title]  (or consumer content)
│       tr.ui-table-message-{empty|loading|error}   ("Loading…" text, or → Message: INFO INLINE "No data"; INFO load error, BLOCK with Retry in server mode)
└── div.ui-table-footer > div.ui-table-pagination-host → Pagination
```

Headers are muted, bold and small; rows are separated by thin borders; the selected row uses the selected background; the counter is muted and aligned to the end. In card mode (`.ui-table-cards`) the header row is hidden (except the page checkbox) and each row becomes a bordered card of label/value pairs. With `.ui-table-sticky`, the bar sticks at `--page-sticky-offset` and the column header right below it, with the Loader line under the header. While data loads after rows were shown (`.ui-table-loading`), the rows are dimmed.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Column width | S, M, L, XL | `--table-column-s`, `-m`, `-l`, `-xl` on `col` |
| Alignment | Start, center, end | `ui-table-align-start`, `-center`, `-end` |
| Row | Hover, alternate | `ui-table-hover`, `ui-table-alternate` |
| Layout | Table, cards | —, `ui-table-cards` |
| Sticky bar and header | Off, on | —, `ui-table-sticky` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Sort | None, ascending, descending | `th[aria-sort]`, icon `fa-up-down` (↕), `fa-arrow-up` (↑), `fa-arrow-down` (↓) |
| Row | Selected | `ui-table-row-selected` |
| Messages | Empty, loading (no rows shown yet), error | `ui-table-message-empty`, `-loading`, `-error` |
| Table | Loading with rows shown (rows dimmed, the Loader line runs) | `ui-table-loading`, `table[aria-busy="true"]` |

### Styling contract

`table.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-table-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface`: bar, grid, header cell
  - `--c-muted`: counts, header cell, counter, sort (icon), cell (message, cards)
  - `--c-border`: header cell (also sticky), cell, row (cards)
  - `--c-accent`: sort (icon + sorted)
  - `--c-surface-alt`: row (alternate)
  - `--c-info-soft`: row (hover)
  - `--c-selected`: row selected, row (hover + row selected)
- Typography
  - `--font-ui`: table
  - `--fw-ui`: table
  - `--fs-label`: counts, grid, cell (cards)
  - `--fs-caption`: header cell, sort (icon)
  - `--fw-ui-strong`: header cell, cell (cards)
- Borders and corners
  - `--border-thin`: header cell (also sticky), cell, row (cards)
  - `--radius-control`: row (cards)
- States and motion
  - `--opacity-muted`: cell (loading)
  - `--transition-1`: cell (loading)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: bar, selection links, actions, header cell, cell (also cards), row (cards)
  - `--gap-tight`: bar, header cell, cell, sort, row (cards)
  - `--gap-block`: cell (message)
- Sizes
  - `--control-height`: bar

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: sort (focus)
  - `--focus-offset`: sort (focus)
- Spacing
  - `--page-sticky-offset`: bar (sticky), header cell (sticky), progress cell (sticky)

**Set by the component — don't change**

- Variables
  - `--ui-table-col`: width of each column (a `--table-column-*` token, from the column's `width`)
  - `--ui-table-bar-height`: height of the sticky bar, so the column header stays below it (measured)
  - `--ui-table-head-height`: height of the column header, so the Loader line stays below it (measured)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--table-column-select`: width of the selection column
  - `--table-column-counter`: width of the row-number column
  - `--table-column-s`, `--table-column-m`, `--table-column-l`, `--table-column-xl`: column widths `S`, `M`, `L`, `XL`
  - `--page-sticky-offset`: read: space taken by a sticky AppHeader
  - `--control-height`, `--gap-form-field`: read: height of the bar below the table

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `tableIndex.js`.
- Use `dataMode:'CLIENT'` (default) for small data sets passed in `rows`; use `'SERVER'` for large ones: load the requested page in `onDataRequest({ page, pageSize, sort })` and call `table.setRows(pageRows, totalItems)` (or `table.setError()` on failure).
- Every row needs a unique `id` when `selectable` is on.
- Mark the identifying columns `priority:'ALWAYS'`; give the others a priority (1 = most important) and a width (`S`–`XL`); add `compact` views (narrower width and shorter format) for columns such as dates.
- Put values' formatting in `format(value, row)` (plain text, escaped); put links, icon Buttons and ActionMenus in `render(host, row, context)` and return the instance (or an object with `destroy()`), so Table cleans up when the page or the layout changes.
- Never make whole rows clickable; actions belong in cells.
- Application buttons follow the shared actions contract (guidelines §10.2): pass `selectionActions` (`{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`) and handle `onSelectionAction(key, selection)`; never create Buttons yourself inside the component.
- Handle selections in `onSelectionAction(key, selection)`: `scope:'IDS'` lists the ids; `scope:'ALL'` means every item except `excludedIds` — apply it on the server in server mode.
- Leave `itemsPerPage` empty for the automatic number of rows, or set a fixed number.
- Give each table a unique, DOM-safe `id` and `label`, and call `destroy()` before rendering into the same container again.

### Safety

- `format()` output is escaped; `render()` writes into the cell directly — escape any data you insert as HTML there.
- Check permissions and the "all items" scope on the server before bulk actions.
- Never remove `aria-sort`, the checkbox names or the table label.

### Example prompts

```text
Show the orders in a server-side Table with order number (link to the order page), customer, e-mail (mailto link), date (short date when space is tight), amount (euro, aligned to the end), status and actions (Edit and View icon buttons plus a "more" menu); make rows selectable with Export and Delete for the selection.
```

```text
Show a small client-side Table of the team members with name and role always visible, e-mail and phone only on wide screens, sorted by name.
```

## For developers

### Business analysis

> **Component**: the Table itself. **Consumer**: the developer who configures the Table in the application's code. **App**: the running application that uses the Table; it provides the data, performs the actions and stores the changes.

**Data**

- App provides all rows of a small table. <!-- BA-01 -->
  - Component sorts and pages them. <!-- BA-02 -->
- Component requests one page at a time from the App for a large table. <!-- BA-03 -->
  - Component displays a thin line under the column header while the page loads (after a short delay). <!-- BA-04 -->
  - Component keeps the rows already shown, dimmed and unavailable, until the new page arrives. <!-- BA-05 -->
  - Component displays "Loading…" in the table when no rows are shown yet. <!-- BA-06 -->
  - Component displays an error with a Retry button when loading fails. <!-- BA-07 -->

**Counts and row numbers**

- Component displays a line above the table with the number of items, the rows visible now and the selection, e.g. "600 items, 121–144 visible now, 12 selected". <!-- BA-08 -->
- Component displays row numbers as shown, continuing across pages, whatever the sort. <!-- BA-09 -->

**Sorting**

- User clicks a column header. <!-- BA-10 -->
  - Component sorts the column ascending, then descending, then back to the original order. <!-- BA-11 -->
- Component sorts text in the user's language, ignoring upper and lower case. <!-- BA-12 -->
- Component sorts numbers inside text by value, e.g. "ORD-9" before "ORD-10", and number and date columns by value. <!-- BA-13 -->
- Consumer provides the language rules for sorting and for the digit grouping of counts (optional; the page language by default). <!-- BA-14 -->

**Selection** (optional)

- User clicks the checkbox of a row. <!-- BA-15 -->
  - Component selects or clears the row and reports the selection to the App. <!-- BA-16 -->
- User clicks the header checkbox. <!-- BA-17 -->
  - Component selects the rows of the current page, and displays "Select all 600 items". <!-- BA-18 -->
  - User clicks "Select all 600 items". <!-- BA-19 -->
  - Component selects all items of the table. <!-- BA-20 -->
- User clicks "Clear selection". <!-- BA-21 -->
  - Component clears the selection. <!-- BA-22 -->
- Consumer adds buttons for the selected rows, e.g. Export, Delete. <!-- BA-23 -->
  - Component displays them in the counts line while rows are selected. <!-- BA-24 -->
  - User clicks a button. <!-- BA-25 -->
  - Component reports the action and the selection to the App. <!-- BA-26 -->
  - App performs the action. <!-- BA-27 -->

**Cells**

- Component reports no action for a click on a row; actions are inside the cells. <!-- BA-28 -->
- Consumer provides the cell content: values, links, icon buttons or a "more" menu. <!-- BA-29 -->
- Component shortens long texts with "…". <!-- BA-30 -->
  - User hovers over a shortened text. <!-- BA-31 -->
  - Component displays the full text as a tooltip. <!-- BA-32 -->

**Fitting the screen**

- Consumer chooses the columns that are always visible, and an importance order and a width (S, M, L, XL) for the others. <!-- BA-33 -->
- Component displays narrower views of columns first, e.g. a short date, then hides the least important columns, before the table appears. <!-- BA-34 -->
  - Component keeps this choice while the space for the table stays the same. <!-- BA-35 -->
  - Component adapts this choice when the space for the table changes, e.g. when the window is resized or a phone is turned, and keeps the data, the sort, the page and the selection. <!-- BA-42 -->
- Component displays each row as a card on narrow screens (below 40rem), with the always-visible columns. <!-- BA-36 -->
- Component displays as many rows per page as fit the screen height, rounded down to a multiple of 5 (at least 5), or a fixed number chosen by the Consumer. <!-- BA-37 -->
  - Component displays the page navigation at the bottom right. <!-- BA-38 -->
- Component keeps the counts line and the column headers visible while the page scrolls, below the page's own sticky header (optional). <!-- BA-39 -->

**Look** (optional)

- Component displays every second row in light grey, the row under the pointer in light blue, and selected rows in the brand tint. <!-- BA-40 -->

**Tooltips**

- Consumer chooses how the full text of cut-off cells shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-41 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: yes (`selectionActions`, `onSelectionAction`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTable, DEFAULT_TABLE_CONFIG, TABLE_TOOLTIP_MODES, TABLE_DATA_MODES, TABLE_DISPLAY_MODES, TABLE_COLUMN_TYPES, TABLE_ALIGNMENTS, TABLE_COLUMN_WIDTHS } from './tableIndex.js';

const table = renderTable(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element; its width decides the layout, when the table is rendered and again whenever that width changes. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `setRows(rows, totalItems)` | — | Client: replaces all rows. Server: the rows of the requested page and the total number of items. |
| `setLoading()` | — | Shows the loading state: the Loader line, and the rows already shown dimmed (or the "Loading…" row when none are shown). |
| `setError(message?)` | — | Shows the load error (default text) as an INFO Message — announced — with a Retry action in server mode that requests the page again. |
| `getSelection()` | object | `{ scope:'IDS' \| 'ALL', ids, excludedIds, count }` (in client mode `ids` also lists all selected ids for `ALL`). |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables an action Button; `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `clearSelection()` | — | Clears the selection (reports it). |
| `getSort()` / `setSort(field, direction)` | object / — | Current sort `{ field, direction:'ASC' \| 'DESC' \| null }`; setting it goes back to page 1. |
| `getPage()` / `setPage(page)` | number / — | Current page; moves to a page (server: requests it). |
| `getItemsPerPage()` | number | Rows per page in use (automatic or explicit). |
| `getVisibleColumns()` | array | Fields of the visible columns for the container's current width. |
| `destroy()` | — | Removes listeners, the resize observer, cell components, Buttons and the Pagination, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `label` | string | `''` | Text | Always | Accessible name of the table (recommended). |
| `columns` | array | `[]` | See Columns | Always | Required, at least one column. |
| `rows` | array | `[]` | Objects with `id` | `CLIENT` | Initial rows. |
| `dataMode` | string | `'CLIENT'` | `CLIENT`, `SERVER` | Always | Who holds, sorts and pages the data; see CLIENT and SERVER data below. |
| `displayMode` | string | `'PAGINATION'` | `PAGINATION`, `SCROLL` | Always | Pages with Pagination, or all rows (`SERVER` always pages). |
| `itemsPerPage` | number \| null | `null` (automatic) | Integer ≥ 1 | `PAGINATION` | Fixed rows per page; automatic = rows fitting the screen height, rounded down to 5, minimum 5. |
| `selectable` | boolean | `false` | — | Always | Checkbox column, selection links and actions. |
| `selectionActions` | array | `[]` | `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }` | `selectable` | Application buttons (guidelines §10.2) shown in the bar when rows are selected; SECONDARY by default; `iconOnly` shows only the icon (the label is its name). Without `onSelectionAction` they are disabled (`ACTION_HANDLER_MISSING`). |
| `stickyHeader` | boolean | `true` | — | Always | The bar and the column header stick below `--page-sticky-offset`. |
| `rowHover` / `alternateRows` | boolean | `true` / `false` | — | Always | Row highlight on hover; alternating backgrounds. |
| `locale` | string | page language | BCP 47 tag, e.g. `'en'`, `'ro'`, `'de-AT'` | Always | Optional. The language whose rules Table uses to sort text columns and to write numbers. When empty, Table uses the page language (`<html lang>`), then the browser language. For example: • Language-specific sorting: in English (`en`) or German (`de`), names such as “Åsa” and “Örjan” sort with A and O; in Swedish (`sv`), they sort after Z. • Number format: 12000 items is written “12,000” in English, “12.000” in German and “12 000” in Swedish. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the full text of cut-off cells (`TOOLTIP`: only when it is cut off) shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). With `TOOLTIP` it also applies to icon-only selection actions; with `TITLE` or `NONE` they show nothing (as before). |
| `texts.*` | string | English defaults | Text | Always | `items` ("{count} items"), `itemsSingular`, `visible` ("{from}–{to} visible now"), `selected`, `selectAll` ("Select all {count} items"), `clearSelection`, `noData`, `loading` (the "Loading…" row and the Loader's label), `loadError`, `retry`, `selectPage`, `selectRow` ("Select row {number}"), `rowNumber` ("#"), `pagination` (Pagination name). |
| `onDataRequest` | function | `null` | `({ page, pageSize, sort }, table) => {}` | `SERVER` | Load the page and call `setRows()` or `setError()`. |
| `onSelectionChange` | function | `null` | `(selection, table) => {}` | `selectable` | Selection changed. |
| `onSelectionAction` | function | `null` | `(key, selection, table) => {}` | `selectionActions` | A selection action Button was pressed. |

### CLIENT and SERVER data

The difference is **where the rows live and who sorts and pages them**.

| | `CLIENT` (default) | `SERVER` |
| --- | --- | --- |
| Where the rows are | All rows are in the browser: the application passes them once in `rows` (or later with `setRows(rows)`). | Only the current page is in the browser; the rest stays on the server (database, API). |
| Who sorts and pages | Table, in the browser: instantly, without asking anyone. | The server: on every page change or sort, Table calls `onDataRequest({ page, pageSize, sort })`; the application asks the server for that page and passes it with `setRows(pageRows, totalItems)`. |
| What the user sees while waiting | Nothing: changes are immediate. | A line under the column header and the previous rows dimmed until the page arrives ("Loading…" in the table for the first page); on failure the application calls `setError()` and the user gets a Retry button. |
| Item count ("600 items") | Counted from `rows`. | The `totalItems` the server reports. |
| Sorting of text | With the user's language rules (`locale`). | The server's own order (its database collation). |
| "Select all 600 items" | Reported as `scope:'ALL'` with `excludedIds`; the application has every row and can apply the action itself. | Reported the same way, but the browser does not have all rows: the server must apply the action to "all except `excludedIds`". |
| Scrolling through all rows (`displayMode:'SCROLL'`) | Possible. | Not possible: always pages. |
| Use it for | Small, complete data sets, up to a few hundred rows (e.g. the members of a team, the lines of one order). | Large or growing data (e.g. all orders, all customers), or data that must stay on the server for security. |

Rule of thumb: if loading all rows at once is quick and they fit in memory, use `CLIENT`; otherwise use `SERVER`. Changing the mode later does not change how the table looks to the user, only who does the work.

### Columns

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | string | — | Required, unique; the row property. |
| `label` | string | `field` | Header text (also the card label). |
| `type` | string | `'TEXT'` | `TEXT`, `NUMBER`, `DATE`: sort order (and `NUMBER` aligns to the end). |
| `sortable` | boolean | `true` | Header sort button. |
| `alignment` | string | `START` (`END` for numbers) | `START`, `CENTER`, `END`. |
| `priority` | string \| number | `1` | `'ALWAYS'` (never hidden, shown in cards) or 1, 2, 3… (higher numbers are hidden first). If no column is `ALWAYS`, the first one becomes it. |
| `width` | string | `'M'` | `S`, `M`, `L`, `XL` (design tokens). |
| `compact` | object | `null` | `{ width, format }`: narrower view used first when space is short. |
| `format` | function | `null` | `(value, row) => text`, escaped; not called for empty values. |
| `render` | function | `null` | `(host, row, { rowIndex, number, compact, table }) => instance \| null`; renders anything into the cell (links, Buttons, ActionMenu); returned instances are destroyed when the rows change. |
| `truncate` | boolean | `true` | Shortens long text with "…" and a tooltip (text cells). |

Layout decisions (visible columns, compact views, cards) are taken when the table is rendered and again whenever the container's width changes (window resized, phone turned, a side panel opened or closed). Each time, the table keeps its data, sort, page and selection, keeps keyboard focus on a sort button or row checkbox (when that element is gone or hidden, for example a header in card mode, focus moves to the table itself), and renders the components in `render()` cells again (their `destroy()` is called first; `context.compact` tells them which view to show). A message shown instead of rows ("Loading…", no data, a load error) stays as it is, so it is not announced again. Rows per page are decided once, at render time, from the window height, so the pages do not shift while the user reads; render the table again for a new page size.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onDataRequest` | `({ page, pageSize, sort }, table)` | Server mode: first display, page change, sort change, Retry. | Client mode. |
| `onSelectionChange` | `(selection, table)` | A checkbox, "Select all", "Clear selection" or `clearSelection()`. | Page or sort changes (the selection is kept). |
| `onSelectionAction` | `(key, selection, table)` | A selection action Button. | — |

### Errors

Table has no user errors of its own; loading errors are shown through `setError()`. Developer errors prevent rendering (`renderTable()` returns `null`); warnings are logged and rendering continues. Console format: `Table "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `COLUMNS_REQUIRED` | error | No column with a field. |
| `INVALID_COLUMN` | warning | A column without field; dropped. |
| `DUPLICATE_COLUMN_FIELD` | warning | Duplicate field; dropped. |
| `NO_ALWAYS_COLUMN` | warning | No `ALWAYS` column; the first column becomes one. |
| `INVALID_OPTION` | warning | Invalid enumerated value, number or `locale` tag (the page language is used). |
| `OPTION_IGNORED` | warning | Option that does not apply (e.g. `SCROLL` with `SERVER`, `itemsPerPage` with `SCROLL`, actions without `selectable`). |
| `INVALID_ICON_CLASS` | warning | An action icon with invalid class tokens; they are dropped. |
| `INVALID_ACTION` | warning | An action without key or label; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A duplicate action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` names no action. |
| `ACTION_HANDLER_MISSING` | warning | Actions without `onSelectionAction`; their Buttons are rendered disabled. |
| `ROW_ID_MISSING` | warning | Rows without `id` while `selectable`. |
| `DUPLICATE_ROW_ID` | warning | The same `id` on several rows while `selectable`. |

### Accessibility

- A real `<table>` with a label, column headers and `aria-sort` on sortable headers; sort controls are buttons, so keyboard use needs no extra keys; focus stays on the sort button after sorting (the header is not redrawn).
- Checkboxes have names ("Select all rows on this page", "Select row 121"); the page checkbox shows the partly-selected state.
- Rows are not clickable; actions are links and buttons inside cells, reachable with Tab.
- `aria-busy` while loading; the rows kept while a page loads are inert; the Loader announces "Loading…" when the line appears; "Loading…" (first page) is a text row; "No data" and load errors are INFO Messages inside the table area (load errors are announced politely).
- Truncated text keeps the full text as a tooltip (a native tooltip: not shown on touch screens).
- Card mode keeps the column labels next to the values.

### Examples

Server-side orders table with cell actions and selection actions:

```js
const table = renderTable(tableHost,
{
    id:'orders', label:'Orders', dataMode:'SERVER', selectable:true,
    selectionActions:[ { key:'export', label:'Export', icon:'fa-solid fa-file-export' }, { key:'delete', label:'Delete', icon:'fa-solid fa-trash' } ],
    columns:[
        { field:'id', label:'Order', priority:'ALWAYS', width:'S', render:( host, row ) => { host.innerHTML = `<a href="/orders/${encodeURIComponent(row.id)}">${escapeHTML(row.id)}</a>`; return null; } },
        { field:'customer', label:'Customer', priority:'ALWAYS' },
        { field:'date', label:'Date', type:'DATE', priority:2, format:formatLongDate, compact:{ width:'S', format:formatShortDate } },
        { field:'amount', label:'Amount', type:'NUMBER', priority:1, width:'S', format:formatEuro },
        { field:'actions', label:'Actions', priority:'ALWAYS', sortable:false, render:( host, row ) => renderActionMenu(host,{ id:`more-${row.id}`, label:`More actions for order ${row.id}`, items:orderActions(row) },( key ) => handleOrderAction(key,row)) }
    ],
    onDataRequest:async ( { page, pageSize, sort }, table ) =>
    {
        try { const result = await api.orders({ page, pageSize, sort }); table.setRows(result.items,result.total); }
        catch { table.setError(); }
    },
    onSelectionAction:( key, selection ) => api.bulk(key,selection)   // { scope:'IDS', ids } or { scope:'ALL', excludedIds }
});
```

### Files

| File | Responsibility |
| --- | --- |
| `tableIndex.js` | Public entry point; the only import surface. |
| `tableConfig.js` | Defaults, column normalization, developer validation, row id checks. |
| `tableComponent.js` | Layout decision, data modes, sorting, selection, bar, body rendering with cell components, Pagination, the Loader while data loads. |
| `tableHTML.js` | Shell (with the progress row), rows, message and probe rows. |
| `tableEvents.js` | Sort and checkbox listeners. |
| `tableState.js` | Per-instance state, selection model, type-aware sorting. |
| `tableErrors.js` | Developer error and warning catalog. |
| `table.css` | Presentation (table, bar, sticky, cards). |
| `tableTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/table.test.mjs`). |
