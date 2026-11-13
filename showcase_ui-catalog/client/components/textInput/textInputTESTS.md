# TextInput — test plan

This plan proves the TextInput README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components textInput` (code: `tests/components/textInput.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, onValueChange | auto | Render a field; type "Ias", then paste "i". | `onValueChange` runs once per change; the last call receives "Iasi" and the instance; `getValue()` is "Iasi" and `isDirty()` is true. |
| T-02 | BA-03 | auto | Render `label`, `placeholder` and `help`. | The label names the field, the placeholder is shown, and the help text describes the field. |
| T-03 | BA-04 | auto | Render each `type`: TEXT, EMAIL, PASSWORD, URL, TEL, NUMBER. | The field has the matching native type. |
| T-04 | BA-05, BA-06, MIN_LENGTH, MAX_LENGTH | auto | Render `minLength:3`, `maxLength:5`, `errorVisibilityDuration:400`; type "abcdefg"; wait; then enter "ab" and leave the field. | The value is "abcde" and "Maximum 5 characters." is shown, then disappears; after leaving the field "Minimum 3 characters." is shown and `getError()` returns it. |
| T-05 | BA-07, BA-12, INTEGER_REQUIRED, MIN_VALUE, MAX_VALUE, INVALID_NUMBER | auto | Render a NUMBER field with `INTEGER`, `minValue:1`, `maxValue:10`; set "2.5", "0", "11", "4". Then render a decimal NUMBER field and set "1e". | The results are `INTEGER_REQUIRED`, `MIN_VALUE` ("Minimum value is 1."), `MAX_VALUE`, valid; "1e" gives "Enter a valid number." |
| T-06 | BA-08 | auto | Render a NUMBER field with `INTEGER` and `step:5`; then a decimal NUMBER field. | The whole-number field has step buttons (step 5); the decimal field has none. |
| T-07 | BA-09, BA-10, INVALID_PHONE | auto | Render `type:'TEL'` with validation enabled; type "+40 (721) 555-123" and leave; then enter "0721 abc" and leave. | The field asks for the numeric keypad (`inputmode="tel"`) and phone autofill; the first number has no error; the second shows "Enter a valid phone number." |
| T-08 | BA-11, PATTERN | auto | Render `pattern:'[0-9]{6}'` with its own message; set "70012", then "700123". | Five digits show the own message; six digits are valid and the message disappears. |
| T-09 | BA-12, REQUIRED, onValidation | auto | Tab through an empty mandatory field; then type a letter, delete it and leave; then type "Iasi". | Tabbing shows nothing; after the change "Required." is shown, the field is marked invalid and `onValidation` reports `{ valid:false, errorLabel:'REQUIRED' }`; typing clears the error and `onValidation` reports valid. |
| T-10 | BA-13, BA-14, BA-15 | auto | Render `type:'PASSWORD'`; click the show/hide button twice; then render with `passwordToggle:false`. | The password is shown ("Hide password", pressed), then hidden ("Show password"); focus stays in the field; without the toggle there is no button. |
| T-11 | BA-16 | auto | Render `iconArea.staticIcon`. | The icon is shown and hidden from screen readers. |
| T-12 | BA-16, BA-17, BA-18, onAction | auto | Render one action "Search"; click it; disable it with `setActionDisabled` and click it again. | The icon button is named "Search"; `onAction` runs once with "search" and the instance; the disabled action reports nothing. |
| T-13 | BA-20 | auto | Render each `width`: SMALL, MEDIUM, LARGE, FULL; then `FIT_CONTENT` with a short value. | Widths grow from small to large; FULL is as wide as its container; the fitted field is narrower than FULL. |
| T-14 | BA-21 | auto | Render a password field with `tooltipMode` `TITLE`, `NONE`, then `TOOLTIP` and hover the show/hide button. | `TITLE`: the browser tooltip is the name; `NONE`: no tooltip; `TOOLTIP`: no browser tooltip, a Tooltip with the name appears. |
| T-15 | EXTERNAL | auto | Call `setError('This name is taken.')`; type a letter; call `setError` again and then `clearError()`. | The message is shown with label `EXTERNAL`; it disappears when the user changes the value, and on `clearError()`. |
| T-16 | UNIDENTIFIED | auto | Ask the error function for a label it does not know (an internal fallback; no public way leads to it). | It returns `UNIDENTIFIED` with "An unidentified error occurred." (dismissible). |
| T-17 | INVALID_ICON_CLASS | auto | Render `iconArea.staticIcon:'fa-solid fa-<bad>'`. | The field renders; the console warns `[INVALID_ICON_CLASS]`. |
| T-18 | MIN_LENGTH_CLAMPED | auto | Render `minLength:10`, `maxLength:5`; set "abcd". | The console warns `[MIN_LENGTH_CLAMPED]`; the minimum becomes 5, so "abcd" is too short. |
| T-19 | OPTION_IGNORED, OPTIONS_CONFLICT | auto | Render a password field with a static icon; then a field with a static icon and an action. | The console warns `[OPTION_IGNORED]`, then `[OPTIONS_CONFLICT]`; the action is shown instead of the icon. |
| T-20 | INVALID_PATTERN | auto | Render `pattern:'[0-9'`; set "abc". | The field renders; the console warns `[INVALID_PATTERN]`; the pattern is ignored. |
| T-21 | INVALID_ACTION, DUPLICATE_ACTION_KEY | auto | Render an action without label; then two actions with the same key. | `[INVALID_ACTION]`: no action button; `[DUPLICATE_ACTION_KEY]`: the first action stays. |
| T-22 | ACTION_HANDLER_MISSING, UNKNOWN_ACTION | auto | Render an action without `onAction`; call `setActionDisabled('nope', true)`. | The action is rendered disabled with `[ACTION_HANDLER_MISSING]`; the call returns false with `[UNKNOWN_ACTION]`. |
| M-01 | BA-19 | manual | In the showcase, add an action to the live example and click it. | The Output panel reports the action: the application performs it (the component only reports it). |
| M-02 | BA-10 | manual | On a phone, tap a `TEL` field of the gallery (TextInput). | The numeric keypad opens. |
| M-03 | BA-03, BA-12, BA-13, BA-16, BA-20 | manual | Open the gallery (`npm run gallery`, TextInput) in the light and the dark theme and from right to left; look at every width, the error, the help, the icon and the password toggle. | Every variant looks as in the design; focus and error states are visible. |
| M-04 | BA-12, BA-15 | manual | With a screen reader, reach a field with an error and the password toggle of the gallery. | The error is read with the field; the toggle is read as "Show password", pressed or not. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/textInput.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form collects TextInput values through its members: after any change, run `npm test` (all components) as well as `npm run test:components textInput`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, real devices and screen readers.
