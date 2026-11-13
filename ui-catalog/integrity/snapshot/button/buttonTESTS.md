# Button — test plan

This plan proves the Button README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components button` (code: `tests/components/button.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, onClick | auto | Render a text button; click it. | `onClick` runs once with the click event and the instance. |
| T-02 | BA-01 | auto | Focus the button; press Enter, then Space. | Each key runs `onClick` once (two calls). |
| T-03 | BA-04 | auto | Inside a form with a text field, render `buttonType:'SUBMIT'` and click it; render `buttonType:'RESET'` after typing in the field and click it. | The form is submitted once; then the field is back to its first value. |
| T-04 | BA-05, BA-06, BA-07, BA-17 | auto | Render `href:'#target'` (target `SAME`); click it. | The button is a link (`<a href="#target">`); `onClick` runs once; the page address ends with `#target`. |
| T-05 | BA-07, BA-18, BA-19 | auto | Render `href` with `target:'NEW_TAB'`. | The link opens a new tab (`target="_blank"`, `rel` with `noopener`), shows the new-tab icon after the text, and has the hidden text "(opens in a new tab)". |
| T-06 | BA-08 | auto | Render `href:'#target'` with an `onClick` that cancels the click; click it. | `onClick` runs; the page address does not change. |
| T-07 | BA-09, BA-10 | auto | Render `href:'#target'`; Ctrl+click it. | A new tab opens; `onClick` does not run; the page address does not change. |
| T-08 | BA-11, BA-12 | auto | Render `hierarchy:'LINK'` inside text of 20 px. | The button has the link look (`ui-button-link`) and the size of the text around it (20 px). |
| T-09 | BA-13, BA-15 | auto | Render `buttonVariant:'ICON_BUTTON'` with `icon` and `ariaLabel:'Delete'`. | Only the icon is shown; the button is named "Delete"; its corners make a circle. |
| T-10 | BA-14 | auto | Render `label`, `iconBefore` and `iconAfter`. | The order is: icon, text, icon. |
| T-11 | BA-16 | auto | Render `size` `SMALL`, `MEDIUM`, `LARGE`; then `width:'FULL'`; then the default corners, `radius` `SMALL` and `LARGE`, and an icon button with `iconButtonRadius:'NONE'`. | Heights grow from small to large; the full-width button is as wide as its container; corners are square by default and grow from small to large; the icon button is square. |
| T-12 | BA-20, BA-21 | auto | Call `setDisabled(true)`; click; call `setDisabled(false)`; click. | While disabled: `isDisabled()` is true, the button stays visible and the click runs nothing; after enabling, the click runs `onClick` once. |
| T-13 | BA-22 | auto | Render `href:'#target'` with `disabled:true`; press Tab from the text before it. | The link is visible, has no address, is announced as unavailable (`aria-disabled="true"`) and is skipped by Tab. |
| T-14 | BA-23, BA-24 | auto | Render `description:'Order 1042'`; call `setDescription('Order 7')`. | The button is described by "Order 1042", then by "Order 7". |
| T-15 | BA-25 | auto | Render an icon button with `tooltipMode` `TITLE`, `NONE`, then `TOOLTIP` and hover it. | `TITLE`: the title is the name; `NONE`: no title; `TOOLTIP`: a Tooltip with the name appears. |
| T-16 | LABEL_REQUIRED | auto | Render a text button without `label`. | Nothing is rendered; the console shows `Button "…" [LABEL_REQUIRED]`. |
| T-17 | ICON_REQUIRED, ARIA_LABEL_REQUIRED | auto | Render an icon button without `icon`; then without `ariaLabel`. | Nothing is rendered either time; the console shows `[ICON_REQUIRED]`, then `[ARIA_LABEL_REQUIRED]`. |
| T-18 | INVALID_ICON_CLASS | auto | Render `iconBefore:'fa-solid fa-<bad>'`. | The button renders; the console warns `[INVALID_ICON_CLASS]`. |
| T-19 | OPTION_IGNORED | auto | Render `href` with `buttonType:'SUBMIT'`; render `hierarchy:'LINK'` with `size:'LARGE'`. | Both render; the console warns `[OPTION_IGNORED]` twice. |
| T-20 | UNSAFE_HREF | auto | Render `href:'javascript:alert(1)'`. | The link renders without an address; the console warns `[UNSAFE_HREF]`. |
| M-01 | BA-03 | manual | In the showcase, click the live example. | The Output panel reports the click: the application decides the action (the component only reports it). |
| M-02 | BA-11, BA-14, BA-16, BA-18 | manual | Open the gallery (`npm run gallery`, Button) in the light and the dark theme and from right to left; look at every hierarchy, size, width and link. | Every variant looks as in the design; focus, hover and pressed states are visible. |
| M-03 | BA-19, BA-22 | manual | With a screen reader, reach the new-tab link and the disabled link of the gallery (Button). | "Opens in a new tab" is read after the name; the disabled link is announced as unavailable. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/button.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Button is used by many components: after any change, run `npm test` (all components) as well as `npm run test:components button`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
