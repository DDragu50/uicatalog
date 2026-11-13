# Notification — test plan

This plan proves the Notification README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components notification` (code: `tests/components/notification.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: a bell icon named "Notifications", unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render the bell; then a picture. | Both are circles. |
| T-02 | BA-03 | auto | Render the text "AP", then "BETA". | "AP" is a circle; "BETA" is a pill. |
| T-03 | BA-04, BA-05 | auto | Render each size with a count. | The shape grows from small to large; the marker grows with it. |
| T-04 | BA-06 | auto | Render without and with `border`. | A thin border; the same size either way. |
| T-05 | BA-07 | auto | Render the text "AP" with `colorToken:'--c-on-accent'` and `backgroundToken:'--c-accent'`. | White initials on the brand colour (the token values). |
| T-06 | BA-08, BA-09, BA-10 | auto | Show the count 3; `setCount` 42, 120, 0. | "3" in a circle; "42" in a pill; "99+"; no marker. |
| T-07 | BA-11 | auto | Render a dot as a circle, triangle, square and diamond. | Four different dot shapes. |
| T-08 | BA-08, BA-12 | auto | Render a text marker "NEW" (SUCCESS); a count in each type; a CUSTOM count with own colours. | "NEW" in the success colour; a colour per type; the own colours. |
| T-09 | BA-13, BA-14 | auto | Render a count at the default corner, then `BOTTOM_LEFT`; then a text marker "BETA". | Top right; bottom left; "BETA" sits outside the shape at the right and the notification is wider. |
| T-10 | BA-15, BA-16, BA-17, onClick | auto | Click the bell and press Enter on it; disable it and click; render `clickable:false`. | A button; both activations reported with the instance; nothing while disabled; display only is an image (`role="img"`). |
| T-11 | BA-19, BA-20, BA-21 | auto | Show the count 3; `setIndicator({ value:5 })`; a DOT "Online"; `setCount(2)`; `setIndicator(null)`. | Named "Notifications, 3 new", then "…, 5 new" with "5" shown; "Notifications, Online"; "Notifications, 2 new" (the dot's meaning does not stay); "Notifications" without a marker. |
| T-12 | BA-22 | auto | Render with the default `tooltipMode`, then `NONE`, then `TOOLTIP` and hover. | `TITLE`: the browser tooltip "Notifications"; `NONE`: none; `TOOLTIP`: a Tooltip "Notifications". |
| T-13 | LABEL_REQUIRED, CONTENT_REQUIRED | auto | Render without label; without content. | Nothing rendered each time; the console shows both labels. |
| T-14 | CONTENT_CONFLICT, TEXT_TOO_LONG, INVALID_TOKEN, OPTION_IGNORED | auto | Render an icon and a text with `colorToken:'red'`; a text of 21 characters; then display only with `disabled`. | One warning each. |
| M-01 | BA-18 | manual | In the showcase, click the live example. | The Output panel reports the click: the application performs the action. |
| M-02 | BA-02, BA-03, BA-05, BA-11, BA-12, BA-13 | manual | Open the gallery (`npm run gallery`, Notification) in the light and the dark theme and from right to left. | Shapes, markers, colours and corners look as in the design; corners are mirrored from right to left. |
| M-03 | BA-21 | manual | With a screen reader, reach a bell with a count and a display-only avatar with a dot. | "Notifications, 3 new, button"; the avatar is read with its meaning, e.g. "Ana, Online". |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/notification.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Badge, NotificationsPanel and AppHeader use Notification: after any change, run `npm run test:components notification badge notificationsPanel appHeader` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
