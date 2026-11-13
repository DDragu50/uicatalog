# Select — test plan

This plan proves the Select README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components select` (code: `tests/components/select.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Europe (Romania, Austria, France, Réunion) and Americas (Canada, Brazil — unavailable). "Custom" means `presentation:'CUSTOM'` with `touchPresentation:'AS_CONFIGURED'`.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-08 | auto | Render the default select; then the custom list and open it. | The browser's own dropdown with the groups "Europe" and "Americas"; the same headings in the custom list. |
| T-02 | BA-02, BA-03 | auto | Render single choice, multiple choice, then custom. | "Select an option" while nothing is chosen; multiple choice is a list box; the custom field also reads "Select an option". |
| T-03 | BA-04, BA-05, onValueChange | auto | Choose Austria in the native select; choose France in the custom list. | Each choice is reported with the instance; the single-choice list closes. |
| T-04 | BA-06 | auto | In an optional select choose Romania, then the empty option; repeat in the custom list with "Clear selection". | The selection is emptied and reported. |
| T-05 | BA-07 | auto | Look at Brazil in the native select; click it in the custom list. | It is unavailable and cannot be chosen. |
| T-06 | BA-09 | auto | Render a native multiple select with `showMultipleHint`. | "Hold Ctrl or Cmd to select several." below the list box, linked to it. |
| T-07 | BA-10, BA-11 | auto | Click the custom field; then place it near the bottom of the window and click it. | The list opens below the field; near the bottom it opens above. |
| T-08 | BA-12 | auto | Put the custom field in a 120 px area that clips its content; open it. | The list goes beyond the area and stays on top. |
| T-09 | BA-13, BA-14 | auto | With Austria chosen and own colours for chosen and pointed options, open the list; point at Canada; press the Down arrow. | The chosen option has its colour and a check mark; the pointed option its colour; the keyboard position has an outline. |
| T-10 | BA-15, BA-16 | auto | In a small custom multiple select choose five options; close the list. | The list stays open while choosing; the closed field reads "Romania, …" with "+N"; screen readers get the full value. |
| T-11 | BA-17, BA-18, BA-19, BA-20 | auto | In a searchable list type "reu", "AUS", "xyz". | Only Réunion; only Austria; "No matching options". |
| T-12 | BA-21 | auto | Focus the custom field and type "fr". | France becomes the keyboard position. |
| T-13 | BA-22 | auto | On an emulated touch-first device render a custom select, then one with `touchPresentation:'AS_CONFIGURED'`. | The device's own picker by default; the custom list when asked. |
| T-14 | BA-23, BA-24, REQUIRED, onValidation | auto | Call `validate()` on an empty required select; choose Romania. | "Select an option.", the field marked invalid, `onValidation` reports `REQUIRED`; choosing clears it and `onValidation` reports valid. |
| T-15 | BA-25 | auto | Render each `width`: SMALL, MEDIUM, LARGE, FULL. | Widths grow from small to large; FULL is as wide as its container. |
| T-16 | EXTERNAL | auto | With Romania chosen call `setError(…)`; choose Austria; call `setError` again and `clearError()`. | The message is shown with label `EXTERNAL`; it disappears when the user changes the value, and on `clearError()`. |
| T-17 | UNIDENTIFIED | auto | Ask the error function for a label it does not know (an internal fallback; no public way leads to it). | It returns `UNIDENTIFIED` with "An unidentified error occurred." (dismissible). |
| T-18 | OPTIONS_REQUIRED, OPTION_VALUE_REQUIRED, OPTION_LABEL_REQUIRED, MULTIPLE_INITIAL_SELECTION | auto | Render without options; with an option without value; without label; with two starting selections in single choice. | Nothing is rendered each time; the console shows the four labels in that order. |
| T-19 | OPTION_IGNORED, DUPLICATE_OPTION_VALUE, UNKNOWN_VALUE | auto | Render a native select with `searchable` and a duplicate value; call `setValue(['xx'])`. | `[OPTION_IGNORED]` and `[DUPLICATE_OPTION_VALUE]` (one Romania); `[UNKNOWN_VALUE]` and nothing selected. |
| M-01 | BA-08, BA-13, BA-14, BA-16, BA-25 | manual | Open the gallery (`npm run gallery`, Select) in the light and the dark theme and from right to left; open each list. | Fields, lists, chosen and pointed options, check marks and the shortened value look as in the design. |
| M-02 | BA-22 | manual | On a phone, tap a custom select of the gallery. | The phone's own picker opens. |
| M-03 | BA-11, BA-21, BA-24 | manual | With a screen reader, open a custom list, move through it, type letters, and reach a select with an error. | The field is read as a combo box with its value; the options are read with their state; the error is read with the field. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/select.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form collects Select values through its members: after any change, run `npm test` (all components) as well as `npm run test:components select form`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, real devices and screen readers.
