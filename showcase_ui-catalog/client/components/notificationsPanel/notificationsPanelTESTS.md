# NotificationsPanel — test plan

This plan proves the NotificationsPanel README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components notificationsPanel` (code: `tests/components/notificationsPanel.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: six notifications, newest first; the first two unread ("Order 1042 shipped", "Invoice 77 paid").

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01 | auto | Render; give more than 99 unread; mark all as read. | The bell shows 2; then "99+"; then nothing. |
| T-02 | BA-02, BA-03, onToggle | auto | Click the bell. | The panel opens, the focus is on the first notification, `onToggle(true)`. |
| T-03 | BA-04, BA-05, onToggle | auto | Open and press Escape; open and click outside; open and tab out of the last notification to the next control on the page. | It closes each time (`onToggle(false)`); Escape returns the focus to the bell. |
| T-04 | BA-06, BA-07 | auto | Open the panel; render with `maxItems:3`. | The first 5 in the given order, each with icon, text and time ("5 minutes ago"); then 3. |
| T-05 | BA-08, BA-09 | auto | Open the panel; call `setNotifications([])`. | Unread notifications are highlighted; "You have no notifications.". |
| T-06 | BA-10, BA-11, onOpen | auto | With an App that routes itself, click "Invoice 77 paid"; then with `markReadOnOpen:false` click the first. | It is reported (already read) with the click and the instance, one unread left; without marking it stays unread. |
| T-07 | BA-13, BA-14, onMarkAllRead | auto | Click "Mark all as read"; give the notifications again and call `markAllRead()`. | All read, no counter, reported once; the call by code is not reported. |
| T-08 | BA-16, onSeeAll | auto | Render `seeAllHref:'#all'` and click "See all notifications". | The link to the full list; reported. |
| T-09 | BA-17, BA-18 | auto | Call `addNotification` with a new unread one; again with the same id. | The bell shows 3 and the new one is on top; the same id is replaced. |
| T-10 | BA-19 | auto | Render with the default `tooltipMode`, then `NONE`, then `TOOLTIP` and hover the bell. | `TITLE`: "Notifications" as the browser tooltip; `NONE`: none; `TOOLTIP`: a Tooltip "Notifications". |
| T-11 | INVALID_ITEM, DUPLICATE_ITEM_ID | auto | Give a notification without text, a repeated id and `maxItems:0`. | One warning each (`INVALID_OPTION` too); only the valid notification stays. |
| M-01 | BA-12, BA-15 | manual | In the showcase, open a notification of the live example and mark all as read. | The Output panel reports both: the application opens the item and stores the read state. |
| M-02 | BA-01, BA-07, BA-08 | manual | Open the gallery (`npm run gallery`, NotificationsPanel) in the light and the dark theme and from right to left. | The bell, the panel, unread highlighting and the footer look as in the design; the panel stays inside the window. |
| M-03 | BA-03, BA-05 | manual | With a screen reader, open the panel and close it. | The panel is read as a dialog named "Notifications" with its first notification; unread ones are read as unread. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/notificationsPanel.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- NotificationsPanel uses Notification and Button, and AppHeader uses NotificationsPanel: after any change, run `npm run test:components notificationsPanel appHeader` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
