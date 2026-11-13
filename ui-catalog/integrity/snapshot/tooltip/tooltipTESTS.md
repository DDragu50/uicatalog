# Tooltip — test plan

This plan proves the Tooltip README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components tooltip` (code: `tests/components/tooltip.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: the buttons Save, Copy and a "★" button without a name, a text cut off in 80 px, a text that fits, and a list with the buttons "E" and "D" carrying `data-tooltip` texts.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, BA-18 | auto | Hover Save (400 ms pause); look at 150 ms and at 600 ms; then hover Copy, which has its own tooltip. | Not yet at 150 ms; "Save the order" after the pause; Copy's tooltip at once, right after the other one. |
| T-02 | BA-04, BA-05 | auto | With a 2 s pause, press Tab from Save to Copy. | Copy's tooltip is shown at once. |
| T-03 | BA-06, BA-07, BA-10, BA-11 | auto | Hover Save, move onto the tooltip, wait; move away; look at 150 ms and at 500 ms. | It stays while the pointer is over it; after leaving it hides only after the pause. |
| T-04 | BA-08, BA-09, BA-10, BA-11 | auto | Tab to Copy and press Escape; show it again and press Tab. | Escape hides it and the focus stays on Copy; moving the focus away hides it. |
| T-05 | BA-12, BA-13 | auto | Hover Save until it shows; click Save. | The click hides it. |
| T-06 | BA-14 | auto | Show Save's tooltip, then Copy's. | Only Copy's is shown. |
| T-07 | BA-15, BA-16, BA-17 | auto | With `longPress` on an emulated touch screen, press Save for 650 ms and lift; wait 1.7 s. | Shown during the press; the click that ends the press is not sent; hidden after a moment. |
| T-08 | BA-19, BA-26, BA-27 | auto | Render "Save" with the shortcut "Ctrl+S"; `setText('Save all')`; `setDisabled(true)` and `show()`; `setDisabled(false)` and `show()`. | "Save" with "Ctrl+S" after it; the new text; disabled it hides and does not show; on again it shows. |
| T-09 | BA-20, BA-21, BA-22 | auto | Show it on each side; then place Save at the top edge, partly off the left edge, with a long text above it. | Above, below, before, after; at the edge it moves below and stays inside the window. |
| T-10 | BA-23 | auto | Show the default, `tone:'SURFACE'` and `arrow:false`. | A dark bubble, a light panel with a border; with and without the arrow. |
| T-11 | BA-24, BA-29 | auto | Render one tooltip for the list buttons; hover "E"; add a button and hover it. | "Edit order"; "Archive order" for the added one; the tooltip is hidden from screen readers. |
| T-12 | BA-25 | auto | With `onlyWhenTruncated`, show it on the cut-off text and on the text that fits. | Shown for the cut-off text only. |
| T-13 | BA-28 | auto | Render a tooltip for Save; destroy it; render one for "★" with `purpose:'LABEL'`. | Save is described by the tooltip and the link is removed with it; "★" is named by it (`role="tooltip"`). |
| T-14 | TARGET_REQUIRED, CONTAINER_IN_TARGET | auto | Render without a target; render into a container inside Save. | Nothing rendered each time; both labels. |
| T-15 | TEXT_REQUIRED, OPTION_IGNORED | auto | Render for Save without text and call `show()`; render a group with `purpose` and call `setText()`. | `[TEXT_REQUIRED]` and nothing shown; `[OPTION_IGNORED]` twice. |
| M-01 | BA-02, BA-21, BA-22, BA-23 | manual | Open the gallery (`npm run gallery`, Tooltip) in the light and the dark theme and from right to left; hover near the edges of the window. | Both looks, the arrow and the sides look as in the design; tooltips flip and stay inside the window; START and END follow the text direction. |
| M-02 | BA-16, BA-17 | manual | On a phone, press a long-press control of the gallery for half a second. | The tooltip shows for a moment; the control does not act and no menu opens. |
| M-03 | BA-28, BA-29 | manual | With a screen reader, reach Save (described) and "★" (named) in the gallery, and a group with tooltips. | Save is read with its description; "★" is read by the tooltip text; group tooltips are not read twice. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/tooltip.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Most components load Tooltip for `tooltipMode:'TOOLTIP'`: after any change, run `npm run test:components` (all plans) and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, real touch devices and screen readers.
