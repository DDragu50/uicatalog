# TopNavigation — test plan

This plan proves the TopNavigation README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components topNavigation` (code: `tests/components/topNavigation.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Home; Products (a list: Laptops, Phones, a line, the group "Extras" with Cases); Solutions (a mega menu: "By industry" with Retail — "Shops and chains" — and Banking, "By size" with Startups); Support (its own page, with Contact and an external Docs link); Careers (icon, counter 3); Blog (unavailable); About us.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01 | auto | Render the navigation; open Products. | The main sections in the bar; Laptops, Phones and Cases in the panel. |
| T-02 | BA-02, BA-03 | auto | Click Products, then Solutions. | Products' panel opens (announced as expanded); opening Solutions closes it. |
| T-03 | BA-04, BA-05 | auto | Open Products and press Escape; open it and click outside; open it and tab out of the last entry. | The panel closes each time. |
| T-04 | BA-06, BA-07, onNavigate | auto | With an App that routes itself, open Products and click Phones. | `onNavigate` reports Phones (id, label, href, not external) with the click and the instance; the panel closes; the App opens the page. |
| T-05 | BA-09, BA-10, BA-11 | auto | Open Products, then Solutions. | Products is a simple list with a line and the heading "Extras"; Solutions is a mega menu with the columns "By industry" and "By size" side by side, and "Shops and chains" under Retail. |
| T-06 | BA-12, BA-13 | auto | Look at Support; click its arrow; close it and click its name. | The name is a link to its page with an arrow button "Support pages"; the arrow opens the panel; the name opens the section page. |
| T-07 | BA-14, BA-15 | auto | Render with Phones current and open Products; render each `currentStyle`. | Phones is marked as the current page and Products is highlighted; underline, pill and tab look different. |
| T-08 | BA-16, BA-17, BA-18 | auto | Render in a 34rem space with "About us" current; open "More"; widen the space. | The last sections go into "More", an outlined pill highlighted because it holds the current page; widening brings the sections back. |
| T-09 | BA-19, BA-20, BA-21 | auto | In a 700 px wide window, with Phones current, click the menu button. | A menu button instead of the bar; the panel lists all sections as blocks, only Products open. |
| T-10 | BA-22 | auto | Look at Careers; call `setBadge` with 5, then with ''. | An icon and the counter 3; then 5; then no counter. |
| T-11 | BA-23 | auto | Click Blog. | Blog is shown as unavailable (not a link) and reports nothing. |
| T-12 | BA-24 | auto | Open Support and look at Docs. | It opens in a new tab, with a visible icon and a spoken "new tab" hint. |
| T-13 | BA-25 | auto | In a 700 px wide window render `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover the menu button. | `TITLE`: the browser tooltip "Menu"; default: none; `TOOLTIP`: a Tooltip "Menu". |
| T-14 | ITEMS_REQUIRED | auto | Render without items; render the navigation and call `setItems([])`. | Nothing rendered and `[ITEMS_REQUIRED]`; the empty update keeps the items. |
| T-15 | INVALID_ITEM, DUPLICATE_ITEM_ID, DEPTH_LIMIT, UNKNOWN_ITEM | auto | Give an item without id, a repeated id and a third level; call `setCurrent('nope')` and `setBadge('nope', '1')`. | One warning each for the items; `[UNKNOWN_ITEM]` twice. |
| M-01 | BA-08 | manual | In the showcase, click a page of the live example. | The Output panel reports the page: the application opens it. |
| M-02 | BA-09, BA-15, BA-17, BA-19 | manual | Open the gallery (`npm run gallery`, TopNavigation) in the light and the dark theme and from right to left; hover sections; make the window narrow. | Panels, mega menus, the three highlights and their hover, "More" and the menu panel look as in the design. |
| M-03 | BA-03, BA-14, BA-24 | manual | With a screen reader, open panels, reach the current page and the external link. | Sections are read as expanded or collapsed; the current page is read as current; "opens in a new tab" is read. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/topNavigation.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- TopNavigation uses Button: after a change to it, run `npm run test:components topNavigation` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
