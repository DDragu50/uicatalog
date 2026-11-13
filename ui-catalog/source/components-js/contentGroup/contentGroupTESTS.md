# ContentGroup — test plan

This plan proves the ContentGroup README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components contentGroup` (code: `tests/components/contentGroup.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: an "Address" group with three inputs (Street, City, Postal code), unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render with `label:'Address'`. | "Address" sits in a gap of the frame's top border. |
| T-02 | BA-03, BA-15 | auto | Render a `SECTION` with the title "Delivery" (level 2) and a description. | A section named "Delivery" with an h2 heading, described by its description. |
| T-03 | BA-04 | auto | Render with a description. | The description describes the group. |
| T-04 | BA-05 | auto | Render with and without `bordered`. | A border, or none (and no padding). |
| T-05 | BA-06 | auto | Render static text, a render function with an input that returns an instance, and one with a list; destroy the group. | The three items in order; `getChildren()` returns the instance; it is destroyed with the group and the container is empty. |
| T-06 | BA-07, BA-08, BA-09 | auto | Render vertically; side by side; six fields side by side in a 30rem space; side by side in an 18rem space. | One below the other; one row; wrapped on several rows; one below the other in the narrow space. |
| T-07 | BA-10 | auto | Render a group inside a group. | The inner group is inside the outer one; the outer group sees the inner inputs (no warning). |
| T-08 | BA-11 | auto | In a four-column grid render `span:2`. | The group takes two of the four columns. |
| T-09 | BA-12, BA-13 | auto | Render `disabled:true`. | Every input inside is disabled at once. |
| T-10 | BA-14 | auto | Render the Address group. | A group (`fieldset`) named "Address". |
| T-11 | OPTION_IGNORED | auto | Render a `SECTION` with `disabled`; a group of inputs with `title`. | Both render; the console warns `[OPTION_IGNORED]` twice. |
| T-12 | NAME_MISSING | auto | Render a group of inputs without label. | The console warns `[NAME_MISSING]`. |
| T-13 | INVALID_CHILD | auto | Pass an input and the number 42 as children. | The console warns `[INVALID_CHILD]`; only the input is shown. |
| T-14 | FIELDSET_WITHOUT_CONTROLS, REDUNDANT_GROUP | auto | Render a group of inputs with only text; then one whose only input is inside a nested fieldset. | `[FIELDSET_WITHOUT_CONTROLS]`; then `[REDUNDANT_GROUP]`. |
| M-01 | BA-02, BA-05, BA-08, BA-09 | manual | Open the gallery (`npm run gallery`, ContentGroup) in the light and the dark theme and from right to left; make the window narrow. | Frames, labels in the border, titles and descriptions look as in the design; side-by-side content wraps and stacks. |
| M-02 | BA-14, BA-15 | manual | With a screen reader, reach a group of inputs and a section with a title. | The inputs are read with "Address, group"; the section is found by heading navigation. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/contentGroup.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form finds fields inside groups through `getChildren()`: after any change, run `npm test` (all components) as well as `npm run test:components contentGroup form`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
