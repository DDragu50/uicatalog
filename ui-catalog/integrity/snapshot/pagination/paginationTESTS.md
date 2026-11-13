# Pagination — test plan

This plan proves the Pagination README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components pagination` (code: `tests/components/pagination.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: 1000 items, 10 per page (100 pages), unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render page 35 of 100. | "1 … 33 34 35 36 37 … 100"; `getPage()` 35, `getTotalPages()` 100. |
| T-02 | BA-03 | auto | Render page 35. | Page 35 is highlighted (its own look) and announced as the current page ("Page 35"). |
| T-03 | BA-04 | auto | Render 10 items; then update to 11. | Hidden with one page; shown with two. |
| T-04 | BA-05, BA-06, BA-07, onPageChange | auto | On page 35, click 36; update to page 36; click 36 again. | `onPageChange` reports 36 with the instance; the bar stays on 35 until the App updates it to 36; clicking the current page reports nothing. |
| T-05 | BA-08 | auto | Render 5 pages, then 6; then 3 pages with `arrowVisibilityThreshold:3`. | No arrows with 5 pages; arrows with 6; arrows with 3 when the threshold is 3. |
| T-06 | BA-09 | auto | Render 10 pages; go to the last page; click Next. | Previous is disabled on the first page; Next on the last; the disabled arrow reports nothing. |
| T-07 | BA-10, BA-11 | auto | On page 35, click Previous, then Next. | Pages 34 and 36 are reported. |
| T-08 | BA-12, BA-13, BA-14 | auto | Render 5 pages with `showGoToPage`; update to 100 pages; type 42 and press Enter. | No field with 5 pages; the labelled field from 6 pages; 42 is reported. |
| T-09 | BA-15, INVALID_PAGE | auto | Type 150 and press Enter; then "abc"; then start typing 7. | "Enter a page from 1 to 100." and the field marked invalid; nothing reported; the message goes when the input changes. |
| T-10 | BA-16 | auto | Render page 3. | The bar sits at the end of the line. |
| T-11 | BA-17 | auto | Render with `label:'Orders, top'`. | A navigation landmark named "Orders, top". |
| T-12 | BA-18 | auto | Render with `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover Next. | `TITLE`: the browser tooltip "Next page"; default: none; `TOOLTIP`: a Tooltip "Next page". |
| T-13 | PAGE_OUT_OF_RANGE | auto | Render page 1250 of 2500 with `locale:'de'`; render page 500 of 100. | The page reads "1.250"; the console warns `[PAGE_OUT_OF_RANGE]` and page 100 is used. |
| T-14 | OPTION_IGNORED | auto | Render `goToPageThreshold` without `showGoToPage`. | The console warns `[OPTION_IGNORED]`. |
| M-01 | BA-02, BA-03, BA-09, BA-16 | manual | Open the gallery (`npm run gallery`, Pagination) in the light and the dark theme and from right to left. | The bar, the current page, the disabled arrow and the go-to field look as in the design; in right-to-left the arrows point the other way. |
| M-02 | BA-03, BA-15, BA-17 | manual | With a screen reader, reach the paginations of the gallery. | Each navigation is read by its own name; the current page is read as current; the go-to error is read with the field. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/pagination.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Table uses Pagination: after any change, run `npm run test:components pagination table` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
