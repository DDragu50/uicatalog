# Toggle — test plan

This plan proves the Toggle README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components toggle` (code: `tests/components/toggle.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, onValueChange | auto | Render a switch; click it; press Space. | It is a switch; on, then off; `onValueChange` reports `true`, then `false`, with the instance; `isDirty()` is true. |
| T-02 | BA-04 | auto | Render a switch; click it; then render `stateText:'CUSTOM'` with "Yes" / "No". | "Off", then "On"; the knob moves and the track colour changes; the own pair reads "No". |
| T-03 | BA-05, BA-06, BA-07 | auto | Render `stateDisplay:'BOTH'`; click "On" twice. | "Off – switch – On" with the active value emphasized; the click turns it on and is reported; clicking the active value changes nothing. |
| T-04 | BA-08 | auto | Render each size; render `offBackgroundToken:'--c-danger'`. | The small switch is smaller; the off track uses the danger colour of the design system. |
| T-05 | BA-09, BA-10, BA-11 | auto | Call `setBusy(true)` and click; `setBusy(false)` and click; then `setValue(false)`. | Busy is exposed and the click changes nothing; after it the click works; `setValue` turns it back without a report. |
| T-06 | BA-12, BA-13 | auto | Render `presentation:'RADIO'`; then stacked with "Yes" / "No" and pick "No". | Two radio buttons "On" / "Off" side by side, none selected; "Yes" / "No" one below the other; the answer is `false` and reported. |
| T-07 | BA-14, BA-15, REQUIRED, onValidation | auto | Render a required radio question; call `validate()`; pick "On". | "Select an answer." and `onValidation` reports `REQUIRED`; the answer clears it and `onValidation` reports valid. |
| T-08 | BA-16 | auto | Render the read-only view of an "on" switch, then of an unanswered question. | "On"; "—". |
| T-09 | EXTERNAL | auto | On an answered question call `setError(…)`; pick another answer; call `setError` again and `clearError()`. | The message is shown with label `EXTERNAL`; it disappears when the user changes the answer, and on `clearError()`. |
| T-10 | UNIDENTIFIED | auto | Ask the error function for a label it does not know (an internal fallback; no public way leads to it). | It returns `UNIDENTIFIED` with "An unidentified error occurred." (dismissible). |
| T-11 | LABEL_REQUIRED | auto | Render without label. | Nothing is rendered; the console shows `[LABEL_REQUIRED]`. |
| T-12 | OPTION_IGNORED | auto | Render a switch with `direction`; a radio question with `size`. | Both render; the console warns `[OPTION_IGNORED]` twice. |
| T-13 | CUSTOM_TEXTS_MISSING | auto | Render `stateText:'CUSTOM'` with only `customOn`. | The console warns `[CUSTOM_TEXTS_MISSING]`; the switch reads "Off". |
| M-01 | BA-04, BA-05, BA-08, BA-09, BA-12 | manual | Open the gallery (`npm run gallery`, Toggle) in the light and the dark theme and from right to left. | Switches, both values, sizes, colours, the busy knob and the radio buttons look as in the design; the busy knob stops moving with reduced motion. |
| M-02 | BA-01, BA-12, BA-15 | manual | With a screen reader, reach a switch, a busy switch and a radio question with an error. | The switch is read as a switch, on or off, and busy; the question is read with its answers and the error. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/toggle.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Form collects Toggle values through its members: after any change, run `npm test` (all components) as well as `npm run test:components toggle form`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
