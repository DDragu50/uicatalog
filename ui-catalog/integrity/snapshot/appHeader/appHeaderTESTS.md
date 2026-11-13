# AppHeader — test plan

This plan proves the AppHeader README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components appHeader` (code: `tests/components/appHeader.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: the application "Orders" with a logo, the environment "TEST", help and settings, the user Ana Popescu (Sales manager, Online), Sign out, 4 notifications and a skip link to `#main`, unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render the header. | Logo and "Orders" link to the home page; the label "TEST". |
| T-02 | BA-03, BA-04, BA-05, onSearch | auto | Render a search; type "1042" and press Enter; type "1043" and press the search button. | A search field; `onSearch` reports "1042", then "1043". |
| T-03 | BA-07, BA-08, BA-09, onNotifications | auto | Click the bell; set 120 notifications; then render with notification items and click the bell. | A bell with 4; the click is reported with `onNotifications`; "99+"; with items, the panel with the latest notifications opens. |
| T-04 | BA-10 | auto | Render the header. | Help and "Application settings" shortcuts. |
| T-05 | BA-11 | auto | Render the header; `setUser` with a photo; `setUser(null)`. | "AP" initials, name, role and "Online", linked to the user's page; a photo; nothing. |
| T-06 | BA-12, BA-13, BA-14, onSignIn, onSignOut | auto | Render signed out; click "Sign in"; call `setSignedIn(true)`; click "Sign out". | `onSignIn`, then "Sign out" and `onSignOut`, each with the header. |
| T-07 | BA-16 | auto | Render `menuHost:true`. | A place for the side navigation's menu button at the start of the first level (`getMenuHost()`). |
| T-08 | BA-17 | auto | Render the default background, then `BRAND`. | A light first level; the brand colour. |
| T-09 | BA-18, BA-19, onNavigate | auto | Render a navigation and breadcrumbs; click Orders in the navigation. | The navigation on the second level, the breadcrumbs on the third; the click reaches the navigation's `onNavigate`. |
| T-10 | BA-20, BA-21 | auto | Render an announcement; call `showAnnouncement` with another message. | "Planned maintenance tonight at 22:00" as a full-width banner above everything; replaced by the new message. |
| T-11 | BA-22, BA-23 | auto | Close the announcement. | The close is reported (`USER`) and its level is removed. |
| T-12 | BA-24, BA-25, BA-26 | auto | Render with the navigation sticky on a long page; scroll down; destroy the header. | The navigation stays at the top while the first level scrolls away; `--page-sticky-offset` is its height; the content below does not move; `destroy()` restores the offset. |
| T-13 | BA-27 | auto | Press Tab from the start of the page. | "Skip to main content" (to `#main`) is the first stop. |
| T-14 | BA-28, BA-29 | auto | In a 600 px wide window render the header with a search. | The name next to the logo and the user's name and role are hidden (the name stays for screen readers); the search is on its own line. |
| T-15 | BA-30 | auto | Render `tooltipMode` `TITLE` (default), `NONE`, then `TOOLTIP` and hover Settings. | `TITLE`: "Help" and "Test environment" as browser tooltips; `NONE`: none; `TOOLTIP`: a Tooltip "Application settings". |
| T-16 | CONTENT_REQUIRED | auto | Render with nothing configured. | Nothing is rendered; the console shows `[CONTENT_REQUIRED]`. |
| T-17 | LOGO_ALT_MISSING, BRAND_MENU_HOST, OPTION_IGNORED | auto | Render a logo without `alt` or name, `BRAND` with `menuHost`, and sticky breadcrumbs without breadcrumbs. | One warning each. |
| M-01 | BA-06, BA-15 | manual | In the showcase, search and sign out in the live example. | The Output panel reports the search and the request: the application performs them. |
| M-02 | BA-01, BA-02, BA-11, BA-17, BA-21, BA-25, BA-28 | manual | Open the gallery (`npm run gallery`, AppHeader) in the light and the dark theme and from right to left; scroll; make the window narrow. | All levels, the brand background, the banner, pinned levels and the narrow layout look as in the design. |
| M-03 | BA-21, BA-27 | manual | With a screen reader, load a page with the header and an announcement; use the skip link. | The banner is announced; the skip link moves to the main content; the header landmark is named. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/appHeader.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- AppHeader composes SearchBox, Notification, NotificationsPanel, Badge, Button, Message, TopNavigation and Breadcrumbs: after a change to any of them, run `npm run test:components appHeader` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look and screen readers.
