# Message — test plan

This plan proves the Message README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components message` (code: `tests/components/message.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render each type: INFO, SUCCESS, WARNING, DANGER; then CUSTOM with design-token colours. | Each type has its own colour and icon; the custom message uses the given colours. |
| T-02 | BA-03 | auto | Render the layouts INLINE, BLOCK, BANNER. | Each has its layout. |
| T-03 | BA-04 | auto | Render two toasts in the top right corner. | Both are in a fixed corner region at the top right, one below the other. |
| T-04 | BA-05, BA-10, BA-11, BA-12, onClose | auto | Render a MODAL with a title and the actions Delete and Cancel; click Delete; show it again and press Escape. | A modal window in the middle of the screen, named by its title, blocks the page; Delete is reported, then `onClose('ACTION')` and it closes; Escape closes it and reports `onClose('ESCAPE')`. |
| T-05 | BA-06 | auto | Render a title, text, link, two details (one a link) and an action. | All are shown in that order. |
| T-06 | BA-07, BA-08, onAction | auto | Render a block message with a Retry action; click it. | `onAction` reports "retry" with the instance; the block message stays. |
| T-07 | BA-13 | auto | Render a DANGER MODAL with Delete and Cancel; press Enter. | Cancel has the focus; Enter cancels. |
| T-08 | BA-14, BA-15, BA-16 | auto | Render `closable`; click the close button; show it again and call `hide()`. | The button is named "Close message"; the message hides and `onClose('USER')` is reported; `hide()` by code is not reported. |
| T-09 | BA-14, BA-17, BA-18 | auto | Render `duration:600`; wait. Then hover a new one and wait, move away and wait. Then focus its action and wait. | It hides after the time (`onClose('TIMEOUT')`); it stays while the mouse is over it and hides after the mouse leaves; it stays while it has the keyboard focus. |
| T-10 | BA-19 | auto | Render `duration:5000`, `remainingIndicator:'BAR_AND_TEXT'`; hover it. | A bar and "Closes in 5 s" (or 4 s); "Paused" while hovered. |
| T-11 | BA-20, TEMPORARY_DANGER | auto | Render DANGER with `duration:500`; wait. | The console warns `[TEMPORARY_DANGER]`; the message stays. |
| T-12 | BA-21, BA-22 | auto | Render an INFO message visible from the start; hide and show it. Render a hidden WARNING and show it. | From the start it is shown but not announced; shown again it is announced politely (`status`); the warning is announced at once (`alert`). |
| T-13 | BA-23, BA-24 | auto | Render INFO "Saving…"; call `update({ type:'SUCCESS', text:'Saved.' })`. | The message turns into a success "Saved." in place and is announced. |
| T-14 | BA-25 | auto | Render `closable` with `tooltipMode` `TITLE`, the default, then `TOOLTIP` and hover the close button. | `TITLE`: the browser tooltip "Close message"; default: none; `TOOLTIP`: a Tooltip "Close message". |
| T-15 | TEXT_REQUIRED | auto | Render without text. | Nothing is rendered; the console shows `[TEXT_REQUIRED]`. |
| T-16 | INVALID_TOKEN | auto | Render CUSTOM with `backgroundToken:'red'`. | The message renders; the console warns `[INVALID_TOKEN]`. |
| T-17 | INVALID_ICON_CLASS, INVALID_ACTION, DUPLICATE_ACTION_KEY | auto | Add an action with a bad icon class, one without label, one with a repeated key. | One warning each; only the first action is shown. |
| T-18 | ACTION_HANDLER_MISSING, UNKNOWN_ACTION | auto | Add an action without `onAction`; call `setActionDisabled('nope', true)`. | The action is disabled with `[ACTION_HANDLER_MISSING]`; the call returns false with `[UNKNOWN_ACTION]`. |
| T-19 | OPTION_IGNORED | auto | Render a MODAL with `closable`; a block message with `corner`. | Both render; the console warns `[OPTION_IGNORED]` twice. |
| M-01 | BA-09 | manual | In the showcase, add an action to the live example and click it. | The Output panel reports the action: the application performs it (the component only reports it). |
| M-02 | BA-02, BA-03, BA-04, BA-05, BA-19 | manual | Open the gallery (`npm run gallery`, Message) in the light and the dark theme and from right to left. | Every type and layout, the toasts, the modal and the remaining-time bar look as in the design. |
| M-03 | BA-21, BA-22, BA-24 | manual | With a screen reader, show an information and a danger message, change one, and load a page with a message already on it. | Information is read after the current speech, danger at once, the change is read, and the message already on the page is not read out by itself. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/message.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Table, Form and other components use Message: after any change, run `npm run test:components message table` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
