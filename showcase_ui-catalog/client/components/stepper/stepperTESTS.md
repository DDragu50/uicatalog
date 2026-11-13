# Stepper — test plan

This plan proves the Stepper README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components stepper` (code: `tests/components/stepper.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: a checkout with Account ("Who you are"), Address, Payment (optional) and Review, unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, BA-04 | auto | Render three steps with an icon marker, a description and a restored "done" status. | The steps in order, each with a marker, label and description; the first is current; the restored status is kept. |
| T-02 | BA-05, BA-06, BA-07, INVALID_STATUS | auto | Render Account done and Address with errors; then with `statusText:true`; then with only the `DONE` status allowed and Address starting as `WARNING`. | A symbol, a colour and a text for screen readers per status (Payment: "Available after: Address"); the text on the screen when chosen; only the chosen statuses are used (`[INVALID_STATUS]`, `setStepStatus` refuses another). |
| T-03 | BA-08, BA-09 | auto | Look at Payment. | "Payment (Optional)". |
| T-04 | BA-10, BA-15, BA-16, BA-17, BA-29, onStepChange, onStatusChange | auto | Click Next. | Account done, Address open and in progress; `onStatusChange` for both, then `onStepChange('address', { previousId:'account', reason:'NEXT' })`. |
| T-05 | BA-11, BA-12, BA-13, BA-14, canLeave | auto | With a `canLeave` that answers no after 1.2 s, click Next twice; wait; then answer yes and click Next. | The App is asked once ("NEXT"); the Stepper is busy and ignores other moves while it checks; a thin line appears above the buttons after the delay; the step stays open; with yes it moves to Address. |
| T-06 | BA-18, BA-19 | auto | Click Next, then Back. | Account opens again; reported as `BACK`. |
| T-07 | BA-20, BA-21 | auto | On Payment (free order) click Skip. | Payment is skipped and Review opens; reported as `SKIP`. |
| T-08 | BA-22, BA-23, BA-24, BA-25, onFinish | auto | Open Review; mark Account and Address done; click Finish. | Finish is disabled with "Complete the other steps first"; then the App is asked ("FINISH"), Review is done and `onFinish` reports the completion. |
| T-09 | BA-26, BA-27, BA-28 | auto | In free order click Payment; then the same with `autoStatus:false`. | Payment opens in progress, reported as `SELECT`; without automatic status it stays not started. |
| T-10 | BA-30, BA-31 | auto | Render the default order; click Next. | Only Account is open at first; Address opens after it. |
| T-11 | BA-32, BA-33, BA-34 | auto | Render Documents and Photo after Account, Review after both; click Next. | Review reads "Available after: Documents, Photo"; Documents and Photo open together. |
| T-12 | BA-35 | auto | Render `navigation:'FREE'`. | Every step can be opened. |
| T-13 | BA-36 | auto | Render `navigation:'NONE'` with `showButtons`. | No buttons, steps that cannot be clicked, no announcements; `showButtons` ignored with a warning. |
| T-14 | BA-37, BA-38, BA-39 | auto | Call `setStepStatus`, `goTo('review')`, `setStepDisabled('payment', true)`. | Each takes effect; nothing is reported. |
| T-15 | BA-40, BA-41, BA-42 | auto | Show content with a field per step; type in the first; Next; Back; then render vertical with the content under the step. | Only the current step's content; the typed value is kept; horizontal content is below the steps; vertical inline content is under the current step. |
| T-16 | BA-43, BA-44, BA-45, BA-46, onAction | auto | Show content with the action "Save draft"; click it. | The bar: Back, Save draft, Next; `onAction` reports "save" with the current step and the instance. |
| T-17 | BA-47, BA-48, BA-49, BA-50 | auto | Render horizontal and vertical, a dot marker, the label below and hidden, and without connectors. | Side by side or stacked; a number or a dot; the label after, below, or hidden with the label as tooltip; three lines between four steps, or none. |
| T-18 | BA-51 | auto | Render in a 30rem space. | "Step 1 of 4: Account" in a compact bar instead of the steps. |
| T-19 | BA-52 | auto | In free order, focus the steps and press Right, Right, End, Home, Left. | Address, Payment, Review, Account, Review. |
| T-20 | BA-53, BA-54 | auto | Look at the list; click Next. | An ordered list named "Progress"; "Step 2 of 4: Address" is announced. |
| T-21 | BA-55 | auto | With hidden labels render `tooltipMode:'NONE'`, then `TOOLTIP` and hover the first step. | `NONE`: no tooltip; `TOOLTIP`: a Tooltip "Account". |
| T-22 | STEPS_REQUIRED | auto | Render without steps. | Nothing is rendered; the console shows `[STEPS_REQUIRED]`. |
| T-23 | UNKNOWN_STATUS, OPTION_IGNORED, INVALID_ICON_CLASS, INVALID_STEP, DUPLICATE_STEP_ID, UNKNOWN_STEP, CIRCULAR_AFTER, INVALID_CHILD | auto | Render an unknown status, `BELOW` with vertical steps, content without `showContent`, a bad icon class, a step without label, a repeated id, unknown and circular `after` rules and an unknown `current`; then content with the child 42. | Each warning appears. |
| T-24 | CAN_LEAVE_FAILED | auto | Give a `canLeave` that throws; click Next. | The step stays open; `[CAN_LEAVE_FAILED]`. |
| T-25 | INVALID_ACTION, DUPLICATE_ACTION_KEY, ACTION_HANDLER_MISSING, UNKNOWN_ACTION | auto | Add actions with a missing label and a repeated key, without `onAction`; call `setActionDisabled('nope', true)`. | One warning each; the action is disabled; the call returns false with `[UNKNOWN_ACTION]`. |
| M-01 | BA-03, BA-05, BA-13, BA-47, BA-48, BA-49, BA-50, BA-51 | manual | Open the gallery (`npm run gallery`, Stepper) in the light and the dark theme and from right to left; make the window narrow. | Markers, statuses, lines, labels, the checking line and the compact bar look as in the design; arrows and lines follow the text direction. |
| M-02 | BA-53, BA-54 | manual | With a screen reader, move through the steps and press Next. | The list, the current step, statuses and waiting steps are read; the new step is announced. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/stepper.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Stepper uses Button and Loader: after a change to any of them, run `npm run test:components stepper` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
