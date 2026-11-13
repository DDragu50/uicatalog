# TextArea — test plan

This plan proves the TextArea README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components textArea` (code: `tests/components/textArea.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, onValueChange | auto | Type "Line one", press Enter, paste "two". | `onValueChange` runs once per change; the last call receives "Line one", a line break, "two" and the instance; `getValue()` returns the same. |
| T-02 | BA-03 | auto | Render `label`, `placeholder` and `help`. | The label names the field, the placeholder is shown, and the help text describes the field. |
| T-03 | BA-04 | auto | Render the read-only view (`state:'VIEW'`) with two lines. | The text is shown on two lines. |
| T-04 | BA-05 | auto | Render a small field, then the read-only view, with a 300-character word. | The field does not scroll sideways and the page does not widen: the word wraps. |
| T-05 | BA-06 | auto | Paste `<b>bold</b>  two  spaces`; then show the same text read-only. | The value is exactly the pasted text; the view shows it as plain text, without bold. |
| T-06 | BA-07, BA-08, BA-09 | auto | Render `maxLength:20`; type 16, then 3 more characters; then render `counterWarningThreshold:10` and type 11. | "20 characters left", then "4 characters left" in red and bold, then "1 character left"; with the own threshold, "9 characters left" is already red and bold. |
| T-07 | BA-10, MAX_LENGTH | auto | Render `maxLength:5`, `errorVisibilityDuration:400`; paste "abcdefg"; wait. | The value is "abcde"; "Maximum 5 characters." is shown, then disappears. |
| T-08 | BA-11, BA-12, MIN_LENGTH | auto | Render `minLength:10`; type "short"; leave the field. | No error while typing; after leaving, "Minimum 10 characters."; `getError()` returns `MIN_LENGTH`. |
| T-09 | BA-12, REQUIRED, onValidation | auto | In a mandatory field type two spaces and leave; then type "ok". | "Required." is shown, the field is marked invalid and `onValidation` reports `REQUIRED`; typing clears it and `onValidation` reports valid. |
| T-10 | BA-13 | auto | Render `rows:2`, then `rows:6`. | The six-line field is more than twice as tall. |
| T-11 | BA-14 | auto | Render `rows:2`, `autoGrow:true`, `maxRows:4`; paste three lines, then four more. | The field grows with the text, stops at four lines and then scrolls. |
| T-12 | BA-15 | auto | Render the default field, then `autoGrow:true`, then `resize:'NONE'`. | Only the default field has the resize handle. |
| T-13 | BA-16, BA-17 | auto | Render the default field, then `spellcheck:false` with `autocomplete:'on'`. | By default spelling is checked and earlier entries are not suggested; then the opposite. |
| T-14 | BA-18 | auto | Render each `width`: SMALL, MEDIUM, LARGE, FULL. | Widths grow from small to large; FULL is as wide as its container. |
| T-15 | EXTERNAL | auto | Call `setError(…)`; type a character; call `setError` again and then `clearError()`. | The message is shown with label `EXTERNAL`; it disappears when the user changes the value, and on `clearError()`. |
| T-16 | UNIDENTIFIED | auto | Ask the error function for a label it does not know (an internal fallback; no public way leads to it). | It returns `UNIDENTIFIED` with "An unidentified error occurred." (dismissible). |
| T-17 | OPTION_IGNORED | auto | Render `autoGrow` with `resize:'VERTICAL'`; `maxRows` without `autoGrow`; `counterWarningThreshold` without validation. | Each renders; the console warns `[OPTION_IGNORED]` three times. |
| T-18 | MIN_LENGTH_CLAMPED | auto | Render `minLength:30`, `maxLength:20`; set 19 characters. | The console warns `[MIN_LENGTH_CLAMPED]`; the minimum becomes 20, so 19 characters are too short. |
| T-19 | MAX_ROWS_CLAMPED | auto | Render `rows:6`, `autoGrow:true`, `maxRows:3`. | The field renders; the console warns `[MAX_ROWS_CLAMPED]`. |
| M-01 | BA-15 | manual | In the gallery (TextArea), drag the corner of the default field down. | The field gets taller; it cannot be made wider. |
| M-02 | BA-16, BA-17 | manual | In the gallery, type a misspelled word; in a field with `autocomplete:'on'` inside a form that was sent before, start typing an earlier entry. | The word is underlined by the browser; the browser offers the earlier entry. |
| M-03 | BA-04, BA-05, BA-08, BA-09, BA-18 | manual | Open the gallery (`npm run gallery`, TextArea) in the light and the dark theme and from right to left. | Every variant looks as in the design; the counter is at the end of the line, in red and bold near the limit. |
| M-04 | BA-08, BA-12 | manual | With a screen reader, type in a field with a maximum length until the warning zone and the limit; then leave a field with an error. | The limit is read with the field; entering the warning zone and reaching the limit are announced once; the error is read with the field. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/textArea.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form collects TextArea values through its members: after any change, run `npm test` (all components) as well as `npm run test:components textArea`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, the browser's own help and screen readers.
