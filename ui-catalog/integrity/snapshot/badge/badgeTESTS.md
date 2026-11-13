# Badge — test plan

This plan proves the Badge README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components badge` (code: `tests/components/badge.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Ana Pop, Administrator, with the initials "AP" and a green "Online" dot, unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render Ana; then only the name. | "Ana Pop", "Administrator" and the initials "AP"; text only without a picture. |
| T-02 | BA-03, BA-04 | auto | Render an icon with the count 3 at the bottom left. | "3" on the picture, at the bottom left. |
| T-03 | BA-05 | auto | Render the default layout, then `VERTICAL`. | Text beside the picture; centred below it. |
| T-04 | BA-06, BA-07 | auto | Render each size. | The picture and the text grow together. |
| T-05 | BA-08, BA-09, BA-10 | auto | In a 9rem space render a long name and description. | The name ends with "…"; the full name and the full description are the browser tooltips. |
| T-06 | BA-11, BA-12, BA-13, BA-14, BA-15, onClick | auto | Render with `href` and click; with `onClick` and click; with neither. | A link that opens the page; a button whose click is reported with the instance; display only (a named group). |
| T-07 | BA-17, BA-18 | auto | Call `setName`, `setDescription`, `setCount(4)`; then remove the description and the marker. | All change in place and the spoken text follows ("4 new"); both are removed. |
| T-08 | BA-19 | auto | Render Ana as a link. | Screen readers get one sentence: "Ana Pop, Administrator, Online". |
| T-09 | BA-20 | auto | Render with `colorToken` and `descriptionColorToken` `--c-on-accent`. | Name and description in the light text colour. |
| T-10 | BA-21 | auto | In a 9rem space render a long name with `tooltipMode:'NONE'`; then `TOOLTIP` and hover the name. | `NONE`: no tooltip; `TOOLTIP`: a Tooltip with the full name. |
| T-11 | NAME_REQUIRED | auto | Render without a name; render Ana and call `setName('')`. | Nothing rendered and `[NAME_REQUIRED]`; the empty name is refused and "Ana Pop" stays. |
| T-12 | NOTIFICATION_FAILED, OPTION_IGNORED | auto | Render a picture configuration without content; then one with `size` and `clickable`. | `[NOTIFICATION_FAILED]` and text only; `[OPTION_IGNORED]` twice. |
| M-01 | BA-16 | manual | In the showcase, make the live example a button and click it. | The Output panel reports the click: the application performs the action. |
| M-02 | BA-02, BA-05, BA-06, BA-20 | manual | Open the gallery (`npm run gallery`, Badge) in the light and the dark theme and from right to left. | Pictures, markers, layouts, sizes and own colours look as in the design; hover and focus are visible on links and buttons. |
| M-03 | BA-19 | manual | With a screen reader, reach a link badge and a display-only badge. | Each is read as one sentence with its role ("link", "group"). |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/badge.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Badge uses Notification, and AppHeader uses Badge: after any change, run `npm run test:components badge notification appHeader` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
