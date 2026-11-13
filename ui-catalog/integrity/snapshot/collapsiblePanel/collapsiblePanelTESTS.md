# CollapsiblePanel — test plan

This plan proves the CollapsiblePanel README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components collapsiblePanel` (code: `tests/components/collapsiblePanel.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: a panel "Shipping" ("Address and delivery", a truck icon) with a short text inside, unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, onToggle | auto | Click the header twice; call `expand()`. | Closed at first; open (announced as expanded), then closed; `onToggle` reports each state with the instance; `expand()` is not reported. |
| T-02 | BA-04, BA-05 | auto | Render `state:'EXPANDED'`; then `collapsible:false`. | Open from the start; always open, without a toggle. |
| T-03 | BA-06, BA-07 | auto | Render `disabled:true` and click the header. | Nothing opens and nothing is reported. |
| T-04 | BA-08 | auto | Render with `headingLevel:3`. | Title, description and icon in an h3 heading; the content region is named by the title. |
| T-05 | BA-09, BA-10, INVALID_STATUS | auto | Render each status; then `setStatus('success')` and `setStatus('DONE')`. | A different side border for each status; the App changes it to success; an invalid status is refused with `[INVALID_STATUS]`. |
| T-06 | BA-11, BA-12, BA-13, onAction | auto | Render a "Draft" label, an Edit button and an icon-only Remove; click Edit. | Labels and buttons in the header; Edit is reported with the instance and the panel stays closed. |
| T-07 | BA-14 | auto | Render the same header in a 22rem space. | The labels and buttons move below the title. |
| T-08 | BA-15, BA-16, BA-17 | auto | Render a summary; open the panel; render with `showSummaryWhenExpanded`; render with only `summaryEmptyText`. | The summary while closed, hidden while open; kept while open when chosen; the placeholder when empty. |
| T-09 | BA-18, BA-19 | auto | Render open as a card, `INLINE` and `COMPACT`. | A card; inline without a card and with a line below; compact with smaller spacing. |
| T-10 | BA-20 | auto | Render without and with `bordered`, and with `cornerRadius:'NONE'`. | A border when asked; rounded or square corners. |
| T-11 | BA-21, BA-22 | auto | With `lazyContent`, give a text and a component; open, close and open. | Nothing before the first opening; then both, rendered once; `getChildren()` returns the component. |
| T-12 | BA-23 | auto | Render an icon-only action with `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover it. | `TITLE`: the browser tooltip "Remove"; default: none; `TOOLTIP`: a Tooltip "Remove". |
| T-13 | TITLE_REQUIRED | auto | Render without a title. | Nothing is rendered; the console shows `[TITLE_REQUIRED]`. |
| T-14 | INVALID_ICON_CLASS, INVALID_COLLECTION, INVALID_ACTION, DUPLICATE_ACTION_KEY, ACTION_HANDLER_MISSING, INVALID_CHILD, UNKNOWN_ACTION | auto | Render a bad icon class, `chips` that is not a list, an action without label, a repeated key, no `onAction`, a child 42; call `setActionDisabled('nope', true)`. | One warning each; the call returns false with `[UNKNOWN_ACTION]`. |
| T-15 | OPTION_IGNORED | auto | Render `collapsible:false` with `disabled`; `INLINE` with `bordered`. | The console warns `[OPTION_IGNORED]` twice. |
| M-01 | BA-02, BA-09, BA-14, BA-18, BA-20 | manual | Open the gallery (`npm run gallery`, CollapsiblePanel) in the light and the dark theme and from right to left; make the window narrow. | Cards, inline and compact panels, status borders, labels and buttons look as in the design; the chevron turns. |
| M-02 | BA-01, BA-08 | manual | With a screen reader, list the headings and open a panel. | Each panel header is found as a heading and read as expanded or collapsed; the content is read as a region named by the title. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/collapsiblePanel.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Accordion is built from CollapsiblePanel: after any change, run `npm run test:components collapsiblePanel accordion` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
