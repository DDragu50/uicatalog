# SearchBox — test plan

This plan proves the SearchBox README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components searchBox` (code: `tests/components/searchBox.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: "Search customers"; the scopes "All fields", "Name" (with its own hint) and "Company".

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, onSearch, onInput | auto | With a 200 ms pause, type "acme"; wait. | Nothing while typing; then `onSearch` reports `{ query:'acme', scopes:[] }` with the instance; `onInput` reports every edit. |
| T-02 | BA-03, BA-04 | auto | On request with the Search button: type and wait; click Search; type and press Enter. Then in while-typing mode press Enter before the pause ends. | Nothing while typing; the button and Enter search; Enter searches at once in while-typing mode too. |
| T-03 | BA-06, BA-07 | auto | Search "  acme  ", press Enter again, search "acme ". | One search "acme": spaces removed, the same search not repeated. |
| T-04 | BA-08, BA-09 | auto | With `minLength:3` search "ac", then "acm". | "ac" is not searched and "Type at least 3 characters." is shown; "acm" is searched. |
| T-05 | BA-10 | auto | Inside a form, press Enter in the field. | The search runs; the form is not submitted. |
| T-06 | BA-11 | auto | Render a hint and a placeholder; then `labelVisible:false`. | The label names the field, the hint describes it, the placeholder is shown; the label can be hidden visually. |
| T-07 | BA-12, BA-13, BA-14 | auto | Type "acme" and click "×"; type "beta" and press Escape. | No "×" while empty; "Clear search" as soon as there is text; the field is emptied and keeps the cursor; Escape clears too; each change is reported. |
| T-08 | BA-15, BA-16, BA-17 | auto | Call `setBusy(true)`; `setMessage('No results for "xyz".')`; `setMessage(null)`. | A busy indicator at the end of the field (busy exposed); the message under the field; then none. |
| T-09 | BA-18 | auto | Render the default, then `autocomplete:'on'`. | No browser suggestions by default; the browser's own suggestions when chosen. |
| T-10 | BA-19 | auto | Render each `width`, then `FIT_CONTENT`. | Widths grow from small to full; fitted is narrower than full. |
| T-11 | BA-20, BA-21, BA-22, BA-23 | auto | Render the scopes with Company as default; type "acme"; choose Name. | The three scopes, Company selected; Name's hint; the search reported again with the scope "name". |
| T-12 | BA-24, BA-25 | auto | Render the Search button in each hierarchy, with the icon, and as icon only. | Primary, secondary, tertiary; "Search"; a magnifying glass before it; the glass only, named "Search". |
| T-13 | BA-26 | auto | With an icon-only Search button render `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover it. | `TITLE`: the browser tooltip "Search"; default: none; `TOOLTIP`: a Tooltip "Search". |
| T-14 | LABEL_REQUIRED | auto | Render without a label. | Nothing is rendered; the console shows `[LABEL_REQUIRED]`. |
| T-15 | OPTION_IGNORED, INVALID_SCOPE, DUPLICATE_SCOPE_VALUE, UNKNOWN_SCOPE | auto | Render `debounceMs` on request, a scope without label, a repeated value and an unknown `defaultScope`. | One warning each; the first scope is used. |
| M-01 | BA-05 | manual | In the showcase, search in the live example. | The Output panel reports the search: the application performs it and shows the results. |
| M-02 | BA-12, BA-16, BA-19, BA-20, BA-24 | manual | Open the gallery (`npm run gallery`, SearchBox) in the light and the dark theme and from right to left. | Field, clear button, busy indicator, scopes and Search button look as in the design. |
| M-03 | BA-17, BA-18 | manual | With a screen reader, search and receive "No results"; in a real browser with `autocomplete:'on'`, start typing an earlier search. | The message is announced; the browser offers the earlier search. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/searchBox.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- AppHeader uses SearchBox: after any change, run `npm run test:components searchBox appHeader` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, the browser's own help and screen readers.
