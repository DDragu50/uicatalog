# Chip — test plan

This plan proves the Chip README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components chip` (code: `tests/components/chip.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves rendering and `destroy()` and that no callback fires without a user action; Chip has its own collection rules for ids (`ID_REQUIRED_WHEN_REMOVABLE`, `DUPLICATE_ID` within the list), proved here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01 | auto | Render "John" with the prefix "Owner:". | "Owner: John" with "Owner:" in bold. |
| T-02 | BA-02 | auto | Render with an icon at the start and one at the end. | Icon, text, icon. |
| T-03 | BA-03 | auto | In an 8rem space render a long label. | The label ends with "…". |
| T-04 | BA-04 | auto | In a 16rem space render five chips. | They form a row that wraps. |
| T-05 | BA-05 | auto | Render the four statuses and one with own design-system colours. | A colour per status; the own background and text colours. |
| T-06 | BA-06 | auto | Render a chip without and one with `bordered`. | The second has a border in its text colour. |
| T-07 | BA-07, BA-08, BA-09, BA-10, BA-11, onRemove | auto | Render two removable chips (one with its own remove name); click the second "×"; call `setChips()` with the first only. | Each has a named "×" ("Remove Segment: Retail", "Remove the banking filter"); the click reports the id and the chip; the chip stays until the App calls `setChips()`. |
| T-08 | CONFIGS_NOT_ARRAY, CONTAINER_REQUIRED, LABEL_REQUIRED, ID_REQUIRED_WHEN_REMOVABLE, INVALID_BACKGROUND_TOKEN, INVALID_COLOR_TOKEN, DUPLICATE_ID | auto | Render something that is not a list; without a container; a list with an empty label, a removable chip without id, bad colour tokens and a repeated id. | No list for the first two; the valid chips ("One", "Fine") render and the others are omitted; the console shows the seven labels. |
| T-09 | INVALID_OPTION, INVALID_ICON_CLASS, OPTION_IGNORED | auto | Render an unknown type, a bad icon class, and a status chip with an own colour. | One warning each. |
| M-01 | BA-11 | manual | In the showcase, remove a chip of the live example. | The Output panel reports the request; the chip goes only when the example removes it. |
| M-02 | BA-04, BA-05, BA-06, BA-08 | manual | Open the gallery (`npm run gallery`, Chip) in the light and the dark theme and from right to left. | Statuses, own colours, borders, icons and "×" look as in the design. |
| M-03 | BA-08 | manual | With a screen reader, reach a removable chip. | The "×" is read as "Remove {prefix} {label}, button". |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/chip.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- CheckboxRadio uses Chip markup: after any change, run `npm run test:components chip checkboxRadio` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
