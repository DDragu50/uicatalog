# Breadcrumbs — test plan

This plan proves the Breadcrumbs README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components breadcrumbs` (code: `tests/components/breadcrumbs.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Home › Customers › Acme GmbH › Orders › Order 1042; the long path adds Sales and Europe after Home.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render the path. | A "Breadcrumb" navigation; every level above the current page is a link; "Order 1042" is bold text marked as the current page. |
| T-02 | BA-03 | auto | Render `homeIcon:true`. | Home is a house icon; its label stays for screen readers. |
| T-03 | BA-04 | auto | Render the default separator, then `SLASH`, `ARROW`, `DOT`. | A chevron; "/", "›", "·". |
| T-04 | BA-05, BA-06, onNavigate | auto | Click Customers; then with `onNavigate` click Acme GmbH; then with an `onNavigate` that stops the link click Orders and the current page. | The page opens; Acme GmbH is reported (label, href, index) with the click and the instance; the App takes over navigation; the current page reports nothing. |
| T-05 | BA-07, BA-08, BA-09 | auto | Render the long path; click "…"; render it with `maxItems:0`. | Home, "…", Acme GmbH, Orders, Order 1042; the menu lists Sales, Europe, Customers; `maxItems:0` shows all seven. |
| T-06 | BA-10, BA-11, BA-12 | auto | Render a level with a very long name. | The name ends with "…"; the full name is the browser tooltip. |
| T-07 | BA-13, BA-14, BA-15, BA-16 | auto | Give Acme GmbH its sibling customers; click the arrow; pick Beta SA. Then place the path near the bottom of the window and click the arrow. | An arrow button "Other customers"; the list opens below the level with Acme GmbH highlighted; Beta SA is reported as a sibling and the list closes; near the bottom it opens above. |
| T-08 | BA-17 | auto | Render the path in a 25rem space. | "Back to Orders" (a link to Orders) instead of the path. |
| T-09 | BA-18 | auto | Render `structuredData:true`. | A `BreadcrumbList` with the five levels for search engines. |
| T-10 | BA-19 | auto | Render `tooltipMode:'NONE'`; then `TOOLTIP` with a long name and hover it. | `NONE`: no tooltip; `TOOLTIP`: a Tooltip with the full name. |
| T-11 | ITEMS_REQUIRED | auto | Render without items; render the path and `update([])`; `update()` with two levels. | Nothing rendered and `[ITEMS_REQUIRED]`; the empty update keeps the path; the new path replaces it. |
| T-12 | INVALID_ITEM, LINK_MISSING, INVALID_SIBLING | auto | Give an item without label, a level without `href`, and a sibling without `href`. | One warning each; the level without link is shown as text. |
| M-01 | BA-02, BA-03, BA-04, BA-16, BA-17 | manual | Open the gallery (`npm run gallery`, Breadcrumbs) in the light and the dark theme and from right to left; make the window narrow. | Links, the current page, separators (mirrored from right to left), the "…" menu, sibling lists and the back link look as in the design. |
| M-02 | BA-02, BA-09, BA-15 | manual | With a screen reader, move through the path, open "…" and a sibling list. | The navigation is read as "Breadcrumb"; the current page is read as current; menus are read with their items. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/breadcrumbs.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Breadcrumbs uses Button and ActionMenu: after a change to any of them, run `npm run test:components breadcrumbs` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
