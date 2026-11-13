# Table — test plan

This plan proves the Table README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components table` (code: `tests/components/table.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: orders `ORD-1`, `ORD-2`… with a customer, a city, a date and a note; five columns — Order (always visible, S), Customer (importance 1, L), Date (2, M, with a short view in S), City (3, M), Note (4, XL).

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-08, BA-09 | auto | Give 23 rows, 10 per page; click page 3 in the page navigation; then sort by Customer. | "23 items, 1–10 visible now" and rows 1–10; on page 3 "21–23 visible now" and rows 21–23; after sorting, page 1 is numbered 1–10 again. |
| T-02 | BA-03, BA-14, onDataRequest | auto | Render in server mode, 10 per page; answer with 10 rows of 600; sort by Customer; go to page 3. | The table asks for page 1 (unsorted) on display, then for page 1 sorted by Customer, then for page 3, each time with the table; the counts line says "600 items". |
| T-03 | BA-04, BA-05, BA-06 | auto | Render in server mode and wait without answering; answer; go to page 2 and wait. | "Loading…" in the table; the line under the column header appears after the delay and goes away with the data; on page 2 the 10 rows already shown stay, dimmed and unavailable. |
| T-04 | BA-07, onDataRequest | auto | Render in server mode; call `setError()`; click Retry. | An error message with a Retry button; Retry asks for the page again. |
| T-05 | BA-10, BA-11 | auto | Click the Customer header three times. | Ascending, descending, then the original order; the header announces each state. |
| T-06 | BA-12, BA-13 | auto | Sort names "banana", "Apple", "cherry"; orders "ORD-10", "ORD-9", "ORD-100"; a number and a date column. | Apple, banana, cherry; ORD-9, ORD-10, ORD-100; numbers and dates by value. |
| T-07 | BA-12, BA-14 | auto | Sort "Örjan", "Zoe", "Anna" with `locale:'sv'`, then `'de'`; show 12000 items with `'de'`. | Swedish: Anna, Zoe, Örjan; German: Anna, Örjan, Zoe; the count reads "12.000 items". |
| T-08 | BA-15, BA-16, onSelectionChange | auto | Tick the checkbox of row 2; untick it. | The row is shown selected; `onSelectionChange` reports `o2` (count 1) with the table; the counts line adds "1 selected"; unticking reports count 0. |
| T-09 | BA-17, BA-18, BA-19, BA-20 | auto | Give 23 rows, 10 per page; tick the header checkbox; click "Select all 23 items". | The 10 rows of the page are selected and "Select all 23 items" appears; then all 23 are selected (`scope:'ALL'`) and the counts line says "23 selected". |
| T-10 | BA-21, BA-22 | auto | Select the page; click "Clear selection". | Nothing is selected, it is reported, and "Clear selection" is hidden again. |
| T-11 | BA-23, BA-24, BA-25, BA-26, onSelectionAction | auto | Add the actions Export and Delete (icon only); select row 3; click Export. | The buttons appear only while rows are selected; Delete is named by its label; `onSelectionAction` reports "export", the selection (`o3`) and the table. |
| T-12 | BA-28 | auto | Click a cell of a row. | Nothing is reported and nothing is selected. |
| T-13 | BA-29 | auto | Render a column with links (`render`) and a formatted amount (`format`). | Each cell has its link; the amounts read "37.00 €"… |
| T-14 | BA-30, BA-31, BA-32, BA-41 | auto | Put a long note in a small column; hover it; repeat with `tooltipMode` `NONE` and `TOOLTIP`. | The text ends with "…"; by default the full text is the browser tooltip; `NONE`: no tooltip; `TOOLTIP`: a Tooltip with the full text appears. |
| T-15 | BA-33, BA-34 | auto | Render the table at widths from 1200 px down to 660 px (a new table each time). | With room, all five columns; first the short date; then Note, City, Date, Customer hidden in that order; Order always stays. |
| T-16 | BA-35 | auto | Render at 800 px; sort, change page, select a row. | The visible columns stay the same. |
| T-17 | BA-42 | auto | Render at 1200 px; sort by Customer, go to page 2, select two rows, focus the Customer header; make the container 760 px, 560 px, then 1200 px. | Fewer columns, then cards, then all columns again; each time the sort, page 2 and the two selected rows stay, and no selection is reported; focus stays on the Customer header while it is shown, and moves to the table when the cards hide it. |
| T-18 | BA-36 | auto | Render at 560 px. | Each row is a bordered card with the always-visible column and its label; the header row is hidden. |
| T-19 | BA-37, BA-38 | auto | Render 200 rows in a 720 px high window, then in a 300 px high window; then with `itemsPerPage:7`. | Rows per page are a multiple of 5 (at least 5), then 5; then 7; the page navigation is below the table at its right end. |
| T-20 | BA-39 | auto | Render 50 rows on a long page and scroll down; repeat with `stickyHeader:false`. | The counts line stays at the top and the column header right below it; with `stickyHeader:false` both scroll away. |
| T-21 | BA-40 | auto | Render with `alternateRows:true`; hover row 3; select row 5. | Every second row has another background; the hovered row and the selected row have their own. |
| T-22 | COLUMNS_REQUIRED, INVALID_COLUMN, DUPLICATE_COLUMN_FIELD, NO_ALWAYS_COLUMN | auto | Render without columns; then with a column without field, a duplicate field and no always-visible column; narrow the container. | No table and `[COLUMNS_REQUIRED]`; then the table renders with one warning each, without the two bad columns, and the first column stays visible as a card. |
| T-23 | OPTION_IGNORED | auto | Render `SCROLL` with `SERVER`; `itemsPerPage` with `SCROLL`; actions without `selectable`. | Each renders; the console warns `[OPTION_IGNORED]` three times. |
| T-24 | INVALID_ICON_CLASS, INVALID_ACTION, DUPLICATE_ACTION_KEY | auto | Add an action with a bad icon class, one without label, and one with a repeated key. | One warning each; only the first action is shown. |
| T-25 | ACTION_HANDLER_MISSING, UNKNOWN_ACTION | auto | Add an action without `onSelectionAction`; select a row; call `setActionDisabled('nope', true)`. | The action is shown disabled with `[ACTION_HANDLER_MISSING]`; the call returns false with `[UNKNOWN_ACTION]`. |
| T-26 | ROW_ID_MISSING, DUPLICATE_ROW_ID | auto | With `selectable`, give a row without `id` and two rows with the same `id`. | The table renders; the console warns `[ROW_ID_MISSING]` and `[DUPLICATE_ROW_ID]`. |
| T-27 | BA-42 | auto | In server mode, show a load error at 1200 px; make the container 560 px, then 1200 px. | The error message stays the same (it is not announced again) and spans the visible columns each time. |
| M-01 | BA-27 | manual | In the showcase, select rows of the live example and click an action. | The Output panel reports the action and the selection: the application performs it (the component only reports it). |
| M-02 | BA-04, BA-30, BA-36, BA-38, BA-39, BA-40 | manual | Open the gallery (`npm run gallery`, Table) in the light and the dark theme and from right to left; make the window narrow and wide again. | The table, the cards, the counts line, the loading line and the page navigation look as in the design. |
| M-03 | BA-42 | manual | On a phone or tablet, open the gallery (Table) and turn the device. | The table changes between columns and cards; the page and the selection stay. |
| M-04 | BA-07, BA-11, BA-16, BA-18 | manual | With a screen reader, sort a column, select rows and the page, and show a load error. | The sort state is read with the header; the checkboxes are named ("Select row 3"); the load error is announced. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/table.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Table uses Button, Pagination, Message and Loader: after a change to any of them, run `npm run test:components table` as well as their own tests and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, real devices and screen readers.
