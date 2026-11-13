# Form — test plan

This plan proves the Form README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components form` (code: `tests/components/form.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: real TextInput fields — Name (required) and E-mail (optional), plus "Repeat e-mail" where a case says so.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, onSubmit | auto | Fill Name and E-mail; click Submit. | `onSubmit` receives `{ name, email }` and the form; `getValues()` returns the same. |
| T-02 | BA-02, BA-09, BA-10, BA-11 | auto | Click Submit with Name empty. | A box "There is a problem" with "Name: Required."; focus moves to it; the error also shows next to the field; nothing is reported. |
| T-03 | BA-12, BA-13 | auto | Click the link in the box. | Focus moves to the Name field. |
| T-04 | BA-05, BA-06 | auto | Submit with an `onSubmit` that takes 1.5 s; click Submit again and call `submit()`; wait. | The form is busy and Submit blocked; no second submit; after the delay a small ring with "Saving…" before the buttons; not busy once saved. |
| T-05 | BA-07 | auto | Render `busyIndicator:'OVERLAY'`; call `setBusy(true)`, wait, then `setBusy(false)`. | A layer covers the form and the fields cannot be changed; released afterwards. |
| T-06 | BA-08 | auto | Submit with an `onSubmit` that resolves; then one that resolves `false`. | "Your changes were saved." as a success message; none when the App answers `false`. |
| T-07 | BA-14, onValidate | auto | Fill different e-mail addresses with an `onValidate` that compares them; submit. | `onValidate` gets the values; "Repeat e-mail: The e-mail addresses do not match." in the summary and next to the field; nothing submitted. |
| T-08 | BA-15, BA-16, BA-17 | auto | Call `showErrors` with "This e-mail address is already registered." for E-mail; change E-mail. | Next to the field and in the summary ("E-mail: …"); cleared when the user changes the field. |
| T-09 | BA-18, BA-19, onChange | auto | In live mode change Name and click Apply; then in `AUTO` mode with a 200 ms pause change Name and wait. | Nothing before Apply, then `onChange` with the values and the form; after the pause the values are reported. |
| T-10 | BA-20 | auto | In live `AUTO` mode empty Name and leave it; then type "Bo". | "Required." next to the field only, no summary, nothing reported; reported once corrected. |
| T-11 | BA-21, onReset, onClear, onCancel | auto | Render Reset, Clear all and Cancel aligned at the start; click Cancel; call `reset()` and `clear()`. | The four buttons, at the start of the line; `onCancel`, `onReset`, `onClear` reported. |
| T-12 | BA-22, BA-23, BA-24 | auto | Type in Name; click Reset; press Enter; click Reset and choose Discard; type again; click Clear all and Discard. | "Discard your changes?" with "Keep editing" focused; Enter keeps the changes; Discard resets without "Required."; Clear all empties without errors. |
| T-13 | BA-25, BA-26, BA-27 | auto | With toasts in a toast area, show a success and a danger message; wait 6.5 s. Then with `EXTERNAL` placement show a message. | Two pop-ups, the success one with a time bar; after 6 s only the danger one stays; the external message is handed to `onMessage`. |
| T-14 | BA-28 | auto | Show a WARNING message with the default placement; call `clearMessage()`. | The warning appears above the fields; it is removed. |
| T-15 | BA-29, BA-30 | auto | Render two columns in a 60rem space, then in a 30rem space. | Name and E-mail side by side; one below the other when narrow. |
| T-16 | BA-31, BA-32 | auto | Render `labelPosition:'START'` in a 60rem space, then in a 28rem space. | Labels on the left; on top when there is not enough room. |
| T-17 | BA-33 | auto | Render fields without the asterisk; then a field with `mandatoryIndicator:'MANDATORY_ASTERISK'`. | No note; "* Required field". |
| T-18 | BA-34, BA-35 | auto | With `warnUnsavedChanges`, try to leave the page before and after typing in Name. | The browser is asked to confirm only after the change. |
| T-19 | MESSAGE_TARGET_MISSING | auto | Render `placement:'TOAST'` without a toast area; show a message. | The console warns `[MESSAGE_TARGET_MISSING]`; the message appears above the form. |
| T-20 | OPTION_IGNORED | auto | Render a live form with `showSubmit`; a live form with `liveDelayMs` and the Apply button. | The console warns `[OPTION_IGNORED]` twice. |
| T-21 | INVALID_CHILD | auto | Pass a field and the number 42 as children. | The console warns `[INVALID_CHILD]`. |
| T-22 | FIELD_WITHOUT_NAME, DUPLICATE_FIELD_NAME | auto | Add a field without name and two fields named "name". | Both warnings; the values hold only the first "name". |
| T-23 | MIXED_LABEL_POSITIONS | auto | Add one field with labels on top and one with labels on the left. | The console warns `[MIXED_LABEL_POSITIONS]`. |
| T-24 | UNKNOWN_FIELD | auto | Call `showErrors` for a field that does not exist. | The console warns `[UNKNOWN_FIELD]`; the message is in the summary only. |
| M-01 | BA-04 | manual | In the showcase, submit the live example. | The Output panel shows the values: the application sends them (the form only reports them). |
| M-02 | BA-06, BA-07, BA-09, BA-21, BA-26, BA-29, BA-31, BA-33 | manual | Open the gallery (`npm run gallery`, Form) in the light and the dark theme and from right to left; submit with errors, while busy and successfully. | The summary, buttons, busy ring and layer, messages and columns look as in the design. |
| M-03 | BA-11, BA-13, BA-23 | manual | With a screen reader, submit a form with errors, follow a summary link, and reset with changes. | The summary is read when it receives focus; the link reaches the field; the question is read with "Keep editing" focused. |
| M-04 | BA-35 | manual | In a real browser, change a field of a form with `warnUnsavedChanges` and close the tab. | The browser asks before leaving. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/form.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form works with every field component and uses Button, Message and Loader: after a change to any of them, run `npm run test:components form` as well as their own tests and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, the real browser's leave dialog and screen readers.
