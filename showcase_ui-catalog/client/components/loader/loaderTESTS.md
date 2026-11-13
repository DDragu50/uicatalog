# Loader — test plan

This plan proves the Loader README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components loader` (code: `tests/components/loader.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

Short times keep the cases quick: shown after 100 ms, at least 300 ms on screen, the end shown for 300 ms, unless a case says otherwise. EDGE and OVERLAY cases use a region with a button "Inside" and the Loader's container.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03 | auto | Start with a 300 ms delay; look at 100 ms and at 500 ms. Then start again and end it as done at 100 ms. | Not shown at 100 ms; at 500 ms a moving indicator with "Loading…"; the action that ends within the delay is never shown. |
| T-02 | BA-04 | auto | Start (no delay, at least 800 ms on screen); hide at 100 ms. | Still shown at 400 ms; hidden after the minimum time. |
| T-03 | BA-05, BA-06, BA-07 | auto | Set 45; then 3 with the text "3 files left"; then, counting to 30, set 12. | The indicator shows 45 of 100 and "45%"; then "3 files left"; then "12 of 30". |
| T-04 | BA-08 | auto | Change the label to "Uploading photos". | The new label is shown. |
| T-05 | BA-09, BA-10, BA-11 | auto | End as done; then, on a new Loader, as cancelled; wait. | Each end shows its symbol, its colour (status) and "Done" / "Cancelled", then hides after a short time. |
| T-06 | BA-12, BA-13 | auto | Start with a 1 s delay; fail it at 100 ms with "Upload failed"; wait 1.2 s; start again. | The failure is shown at once with its text and stays; starting again runs a new action. |
| T-07 | BA-14 | auto | Track a result that arrives after 150 ms with the label "Saving"; then one that fails. | "Saving" while it runs; done when the result arrives; failed when the result is a failure. |
| T-08 | BA-15 | auto | Start and hide at once. | Hidden; the action is no longer running. |
| T-09 | BA-16, BA-17, BA-18, BA-19, BA-20, onCancel | auto | Render `cancellable`; start; click Cancel; end it as cancelled. | A Cancel button; the click reports `onCancel` once with the Loader and disables Cancel; the action keeps running until the App ends it; ending it is not reported again. |
| T-10 | BA-21, BA-22 | auto | Start a bar and a ring in each size. | A bar or a ring; each grows from small to large. |
| T-11 | BA-23 | auto | Start with the label above, below, after and hidden. | The label is in that place; hidden means for screen readers only. |
| T-12 | BA-24 | auto | Render `valueText:'NONE'`; set 40. | No visible value; screen readers still get "40%". |
| T-13 | BA-25 | auto | Start an INLINE Loader. | It takes space in the page: the text after it moves down. |
| T-14 | BA-26 | auto | Start an EDGE Loader in the region. | A thin line along the top edge of the region, as wide as the region; its container takes no space. |
| T-15 | BA-27, BA-28, BA-29, BA-30, BA-31, BA-33, BA-34, BA-39 | auto | With focus on "Inside", start an OVERLAY Loader (300 ms delay); add a button to the region; wait; hide it. | At once: the region is busy, its content blocked and focus moves into the layer; the added button is blocked too; after the delay the region is dimmed with the indicator in a panel; when hidden, everything is released and focus returns to "Inside". |
| T-16 | BA-32 | auto | Start an OVERLAY in a 1600 px tall region with the panel in the middle, then at the top. | `CENTER`: the panel is in the middle of the region; `TOP`: at the top of its visible part. |
| T-17 | BA-35, BA-36, BA-37, BA-38 | auto | Start "Uploading"; set 10, then 30; fail it; start and end it as done. | A progress bar named "Uploading"; the label is announced when shown; nothing at 10, "Uploading 30%" at a quarter; the failure is announced at once (assertive), "Done" politely. |
| T-18 | INVALID_TARGET | auto | Render an EDGE Loader whose target does not contain its container. | Nothing is rendered; the console shows `[INVALID_TARGET]`. |
| T-19 | OPTION_IGNORED | auto | Render an EDGE Loader with `shape:'RING'`. | The console warns `[OPTION_IGNORED]`. |
| T-20 | POSITIONED_ANCESTOR | auto | Render an OVERLAY on the region with a positioned box between the container and the region. | The console warns `[POSITIONED_ANCESTOR]`. |
| T-21 | CANCEL_HANDLER_MISSING | auto | Render `cancellable` without `onCancel`; start. | The console warns `[CANCEL_HANDLER_MISSING]`; there is no Cancel button. |
| T-22 | NOT_RUNNING, INVALID_VALUE | auto | Set a value before starting; start and set "abc". | Both return false, with `[NOT_RUNNING]` and `[INVALID_VALUE]`. |
| T-23 | INVALID_STATUS, INVALID_PROMISE | auto | Start; end with "FINISHED"; track 42. | `[INVALID_STATUS]` (false) and `[INVALID_PROMISE]`. |
| M-01 | BA-20 | manual | In the showcase, make the live example cancellable, start it and press Cancel. | The Output panel reports the request; the action stops only when the example ends it. |
| M-02 | BA-10, BA-21, BA-22, BA-23, BA-26, BA-30 | manual | Open the gallery (`npm run gallery`, Loader) in the light and the dark theme and from right to left. | Bars, rings, edge lines, the overlay panel and the end states look as in the design; the moving indicator stops moving with reduced motion. |
| M-03 | BA-35, BA-36, BA-37, BA-38, BA-39 | manual | With a screen reader, run a Loader with progress to the end, and an overlay over a region. | The label, the quarters and the end are read; a failure interrupts; the region is read as busy and cannot be reached until the Loader hides. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/loader.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Table, Form and other components use Loader: after any change, run `npm run test:components loader table` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, motion and screen readers.
