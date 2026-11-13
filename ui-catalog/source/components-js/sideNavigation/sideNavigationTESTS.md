# SideNavigation — test plan

This plan proves the SideNavigation README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components sideNavigation` (code: `tests/components/sideNavigation.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Dashboard; Sales (a parent without page: Orders, Invoices with counter 3); Customers (a parent with its own page: Companies, Contacts); a separator; the group "Administration" with Users, Audit log (unavailable) and Help centre (external). Every top-level entry has an icon.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01 | auto | Render the tree. | Dashboard, Sales and Customers at the top, a separator and the heading "Administration". |
| T-02 | BA-02 | auto | Render with Invoices current. | Invoices is marked as the current page and highlighted; Sales is open. |
| T-03 | BA-03, BA-04, onNavigate | auto | With an App that routes itself, click Dashboard. | `onNavigate` reports Dashboard (id, label, href, not external) with the click and the instance; the App opens the page. |
| T-04 | BA-06, BA-07, BA-08, onExpandChange | auto | Open Customers with its mark, then Sales; close Customers. | Both open independently; `onExpandChange` reports `['customers']`, then both; closing Customers leaves Sales open. |
| T-05 | BA-09, BA-10 | auto | Click Sales (a parent that is not a page) twice. | It is a button; it opens its sub-pages without navigating, then closes them. |
| T-06 | BA-11 | auto | Render with Orders current in each `levelStyle`. | Indentation, tree lines joining Orders to Sales, and a background for the deeper level. |
| T-07 | BA-12 | auto | Look at Sales by default, then with `PLUS_MINUS`. | An arrow at the end of the row; a + / − sign before the icon. |
| T-08 | BA-13 | auto | Render each `cornerRadius`. | None < small < medium (default) < large. |
| T-09 | BA-14 | auto | Look at Invoices and Dashboard; call `setBadge('invoices', 7)`. | The counter 3 and an icon; then 7. |
| T-10 | BA-15, BA-16 | auto | Click Audit log; look at Help centre. | Audit log is unavailable (not a link) and reports nothing; Help centre opens in a new tab with a visible and a spoken hint. |
| T-11 | BA-17, BA-18, BA-19, BA-20, BA-21, BA-22, onRailChange | auto | Click the rail button; look at Dashboard; click the Sales icon; call `setRail(false)`. | Only icons (much narrower), reported with `onRailChange(true)`; Dashboard's name is its tooltip; a small panel "Sales" with Orders and Invoices opens next to the icon; `setRail()` is not reported. |
| T-12 | BA-23, RAIL_NEEDS_ICONS | auto | Render with a top-level entry without icon. | No rail button; the console warns `[RAIL_NEEDS_ICONS]`. |
| T-13 | BA-24, BA-25, BA-26, BA-27 | auto | In a 700 px wide window with a menu host in the page header, click the menu button; press Tab 25 times; press Escape; reopen and click outside; reopen and click the close button; reopen and choose Dashboard. | The menu is hidden and a menu button is in the header; it opens a drawer from the side, above the header, with the focus inside; Tab keeps the focus inside; Escape, a click outside, the close button and choosing a page each close it. |
| T-14 | BA-28, BA-29, BA-30, BA-31 | auto | Render `search:true` with `searchThreshold:5`; type "invo", then "xyz"; render `search:true` with the default threshold. | A search field; only Sales and Invoices stay; "No matching pages", announced; no field with fewer entries than 15. |
| T-15 | BA-32 | auto | Render the open tree in a 260 px high area of a 400 px high window. | Only the menu scrolls; it stays within the available height. |
| T-16 | BA-33 | auto | Render with `railCollapsed:true` and `expandedIds:['customers']`; leave the rail. | The rail is on; Customers is open. |
| T-17 | BA-34 | auto | In the rail, render `tooltipMode:'NONE'`; then `TOOLTIP` and hover Dashboard. | `NONE`: no tooltip; `TOOLTIP`: a Tooltip "Dashboard". |
| T-18 | ITEMS_REQUIRED, INVALID_ITEM, DUPLICATE_ITEM_ID, UNKNOWN_ITEM | auto | Render without items; with an item without id and a repeated id; call `setCurrent('nope')`, `setBadge('nope', 1)` and `setItems([])`. | Nothing rendered and `[ITEMS_REQUIRED]`; one warning each; `[UNKNOWN_ITEM]` twice; the empty update keeps the tree. |
| M-01 | BA-05 | manual | In the showcase, click a page of the live example. | The Output panel reports the page: the application opens it. |
| M-02 | BA-11, BA-12, BA-13, BA-18, BA-22, BA-26 | manual | Open the gallery (`npm run gallery`, SideNavigation) in the light and the dark theme and from right to left; switch the rail; make the window narrow. | Level styles, marks, corners, the rail, its panels and the drawer look as in the design; from right to left they open on the other side. |
| M-03 | BA-02, BA-26, BA-31 | manual | With a screen reader, move through the tree, open the drawer and search without result. | The current page is read as current; parents are read as expanded or collapsed; the drawer keeps the focus; "No matching pages" is announced. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/sideNavigation.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- SideNavigation uses Button and Message: after a change to any of them, run `npm run test:components sideNavigation` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
