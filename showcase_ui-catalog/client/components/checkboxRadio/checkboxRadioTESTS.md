# CheckboxRadio — test plan

This plan proves the CheckboxRadio README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components checkboxRadio` (code: `tests/components/checkboxRadio.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, BA-06, onValueChange | auto | Render a single-choice list; click "Post", then "Courier". | The options are radio buttons; "Courier" is selected and "Post" is cleared; `onValueChange` runs twice, with `['post']` and `['courier']` and the instance. |
| T-02 | BA-01, BA-04, BA-05, BA-06 | auto | Render a multiple-choice list (the default); click "Post", "Pick-up point", "Post". | The options are checkboxes; the value is `['pickup']`; each change is reported, values in option order; `isDirty()` is true. |
| T-03 | BA-07, BA-08, BA-11 | auto | Render the icon look single choice and select an option; then multiple choice with `REGULAR_SOLID`; then each `iconSize`. | Circles for single choice (a check in the selected one); squares for multiple choice, the selected one filled; icons grow from small to large. |
| T-04 | BA-07, BA-09 | auto | Render the chip look; select "Courier". | Only the selected chip has a check mark and a different (tinted) background. |
| T-05 | BA-07, BA-10 | auto | Render the segmented look; select "Courier". | One row of joined segments; the selected one is filled and in bold. |
| T-06 | BA-12, BA-13 | auto | Render the default list; then `direction:'HORIZONTAL'`; then side by side in a 12rem-wide container. | Options are one below the other, then side by side, then wrapped on several rows without sticking out. |
| T-07 | BA-14 | auto | Render with "Courier" and "Pick-up point" selected. | They are shown selected, `getValue()` returns them, and nothing is reported. |
| T-08 | BA-15, BA-16 | auto | Render with "Courier" selected and unavailable; click it. Then render the whole list unavailable and click an option. | "Courier" stays selected and nothing is reported; in the unavailable list every option is unavailable and nothing changes. |
| T-09 | BA-17, BA-18, BA-19, REQUIRED_SELECTION | auto | Tab through a required list; then select and clear "Post" and leave the list; then select "Pick-up point". Render again and call `validate()`. | Tabbing shows nothing; after leaving, "Select an option." is shown, the group title has the error colour and the options are marked invalid; selecting clears it; `validate()` returns `REQUIRED_SELECTION`. |
| T-10 | EXTERNAL | auto | With "Post" selected, call `setError(…)`; select another option; call `setError` again and then `clearError()`. | The message is shown with label `EXTERNAL`; it disappears when the user changes the selection, and on `clearError()`. |
| T-11 | OPTIONS_REQUIRED, OPTION_VALUE_REQUIRED, OPTION_LABEL_REQUIRED | auto | Render without options; with an option without value; with an option without label. | Nothing is rendered each time; the console shows the three labels in that order. |
| T-12 | MULTIPLE_INITIAL_SELECTION, GROUP_LABEL_REQUIRED | auto | Render a single-choice list with several starting selections; render a required list without title. | Nothing is rendered either time; the console shows the two labels. |
| T-13 | DUPLICATE_OPTION_VALUE, GROUP_LABEL_MISSING | auto | Render with a second "post" option; render an optional list without title. | Both render; the duplicate is dropped; the console warns `[DUPLICATE_OPTION_VALUE]`, then `[GROUP_LABEL_MISSING]`. |
| T-14 | OPTION_IGNORED | auto | Render `iconSize` with the standard look; render `direction` with the segmented look. | Both render; the console warns `[OPTION_IGNORED]` twice. |
| M-01 | BA-07, BA-08, BA-09, BA-10, BA-11, BA-12 | manual | Open the gallery (`npm run gallery`, CheckboxRadio) in the light and the dark theme and from right to left; look at every look and direction, selected and unselected, with keyboard focus. | Every variant looks as in the design; focus is visible on every look. |
| M-02 | BA-02, BA-04, BA-18 | manual | With a screen reader, move through a single-choice and a multiple-choice list of the gallery and reach a list with an error. | Each option is read with its state and the group title; the required list is announced as required; the error is read with the group. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/checkboxRadio.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- CheckboxRadio is used by SearchBox and collected by Form: after any change, run `npm test` (all components) as well as `npm run test:components checkboxRadio`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
