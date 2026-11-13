# Accordion — test plan

This plan proves the Accordion README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components accordion` (code: `tests/components/accordion.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: three questions — "How do I order?", "How do I pay?", "When does it arrive?" — each with a short answer.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, BA-04, BA-05, onChange | auto | Click the first title, the second, the second again; call `expand('q3')`. | The sections in order; the first opens; opening the second closes the first; it closes; `onChange` reports `['q1']`, `['q2']`, `[]` with the instance; `expand()` is not reported. |
| T-02 | BA-06, BA-07 | auto | With `MULTIPLE` and the third section starting open, open the first two; `collapseAll()`; `expandAll()`. | The third starts open; all three open together; all close; all open. |
| T-03 | BA-08, BA-09 | auto | Render the default look, `SEPARATE`, `cornerRadius:'NONE'` and `bordered:false`. | One frame with a line between sections; one card per section with space between; rounded or square corners; no border. |
| T-04 | BA-10 | auto | Give the first section an icon, a description, a label, a button, a status and a summary. | All shown in its header; the summary while closed. |
| T-05 | BA-11 | auto | With the second section disabled, focus the first title and press Down, Down, Home, End, Up. | Third, first (wrapping), first, third, first — the disabled one is skipped. |
| T-06 | BA-12 | auto | Render `headingLevel:4`; open the second section. | Every title is an h4 heading announced as collapsed; the second as expanded. |
| T-07 | BA-13, BA-14 | auto | Put the accordion in a Form: a closed section with a Name field, and a `lazyContent` section with a City field; open the second. | The form has Name while its section is closed; City is added once its section opens. |
| T-08 | BA-15 | auto | Give a section an icon-only Share action; render `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover it. | `TITLE`: the browser tooltip "Share"; default: none; `TOOLTIP`: a Tooltip "Share". |
| T-09 | onToggle | auto | Call `getPanel('q1')` and `getChildren()`; render an item with its own `onToggle` and click it. | The panel and the three panels; the item's `onToggle` runs before `onChange`. |
| T-10 | ITEMS_REQUIRED | auto | Render without items. | Nothing is rendered; the console shows `[ITEMS_REQUIRED]`. |
| T-11 | OPTION_IGNORED, INVALID_ITEM, ITEM_NOT_RENDERED, SINGLE_EXPANDED, UNKNOWN_ITEM | auto | Give an item its own `headingLevel` and `bordered`, a non-object item, an item without title and two items starting open; call `expand('nope')` and `expandAll()`. | `[OPTION_IGNORED]` twice, one warning each for the others, only the first stays open; `expand('nope')` returns false with `[UNKNOWN_ITEM]`; `expandAll()` returns false in one-at-a-time mode. |
| M-01 | BA-08, BA-09, BA-10 | manual | Open the gallery (`npm run gallery`, Accordion) in the light and the dark theme and from right to left. | Joined and separate looks, borders, corners and headers look as in the design. |
| M-02 | BA-11, BA-12 | manual | With a screen reader, list the headings and move between titles with the arrows. | Each title is found as a heading and read as expanded or collapsed. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/accordion.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Accordion is built from CollapsiblePanel: after a change to either, run `npm run test:components accordion collapsiblePanel` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
