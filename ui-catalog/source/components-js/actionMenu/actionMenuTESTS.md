# ActionMenu — test plan

This plan proves the ActionMenu README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components actionMenu` (code: `tests/components/actionMenu.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: "More actions for order 1042" with Edit, Duplicate, Archive (unavailable), a separator, "Open invoice" (a link) and Delete (dangerous).

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03 | auto | Click the button in the middle of the page. | The list opens below the button, aligned with its end edge; the focus is on Edit. |
| T-02 | BA-02, BA-03 | auto | Place the button at the bottom left of the window and click it. | The list opens above, aligned with the start edge. |
| T-03 | BA-04, BA-05, BA-06, onAction | auto | Click Duplicate; open again, press the Down arrow and Enter. | The list closes and `onAction` reports "copy" with the instance; Enter chooses too. |
| T-04 | BA-08, BA-09 | auto | Open and press Escape; open and press Tab; open and click outside. | It closes each time without reporting; Escape returns the focus to the button. |
| T-05 | BA-10, BA-11 | auto | Render the items with extra separators at the start, the end and twice in a row. | Labels with their icons; one separator between the groups. |
| T-06 | BA-12 | auto | Open the list. | Delete is in the danger colour. |
| T-07 | BA-13 | auto | Click Archive. | Shown as unavailable; nothing is reported and the list stays open. |
| T-08 | BA-14 | auto | Click "Open invoice". | It is a link to `#invoice`; it is reported and the page opens. |
| T-09 | BA-15, BA-16 | auto | Press Down three times, End, Home, Up; then "d", a pause, and "d" again. | Duplicate, Open invoice, Delete, Delete, Edit, Delete (Archive skipped, wrapping around); "d" moves to Duplicate, then to Delete. |
| T-10 | BA-17, BA-18 | auto | Render the default button; then `size:'LARGE'`, another icon and `bordered:true`. | Named "More actions for order 1042"; the own icon, a larger size and a border. |
| T-11 | BA-19 | auto | Render `disabled:true` and click. | The button is disabled; nothing opens. |
| T-12 | BA-20 | auto | Render `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover. | `TITLE`: the browser tooltip with the name; default: none; `TOOLTIP`: a Tooltip with the name. |
| T-13 | ITEMS_REQUIRED, INVALID_ITEM, DUPLICATE_ITEM_KEY | auto | Render with only a separator; then with an item without label and a repeated key. | Nothing rendered and `[ITEMS_REQUIRED]`; then one warning each. |
| M-01 | BA-07 | manual | In the showcase, choose an action of the live example. | The Output panel reports the key: the application performs the action. |
| M-02 | BA-02, BA-03, BA-12, BA-18 | manual | Open the gallery (`npm run gallery`, ActionMenu) in the light and the dark theme and from right to left; open menus near the edges. | The button, the list, separators, icons and the danger colour look as in the design; lists stay inside the window. |
| M-03 | BA-01, BA-13, BA-15 | manual | With a screen reader, open a menu and move through it. | The button is read with its name and "menu"; actions are read as menu items, Archive as unavailable. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/actionMenu.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Breadcrumbs and Table cells use ActionMenu: after any change, run `npm run test:components actionMenu breadcrumbs` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
