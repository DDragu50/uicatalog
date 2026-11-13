# UI Catalog — release 1.0.0

Date: 2026-11-13 · Version: 1.0.0 · Result: **PASSED**

| Step | Result |
| --- | --- |
| Static checks (30 components) | no findings |
| Coverage of the test plans | complete; 30 component(s) with a plan, 0 without |
| Shared contract test | 265 passed, 0 failed |
| Component tests | 527 passed, 0 failed, 86 for a person |
| Gallery | every component renders without messages |
| Integrity | nothing stored yet; fingerprints stored now |

## Completion (guidelines §14)

| Component | Status | Reason |
| --- | --- | --- |
| accordion | complete after the manual checks below | 2 manual case(s) |
| actionMenu | complete after the manual checks below | 3 manual case(s) |
| appHeader | complete after the manual checks below | 3 manual case(s) |
| badge | complete after the manual checks below | 3 manual case(s) |
| breadcrumbs | complete after the manual checks below | 2 manual case(s) |
| button | complete after the manual checks below | 3 manual case(s) |
| calendar | complete after the manual checks below | 3 manual case(s) |
| checkboxRadio | complete after the manual checks below | 2 manual case(s) |
| chip | complete after the manual checks below | 3 manual case(s) |
| collapsiblePanel | complete after the manual checks below | 2 manual case(s) |
| contentGroup | complete after the manual checks below | 2 manual case(s) |
| copyArea | complete after the manual checks below | 3 manual case(s) |
| form | complete after the manual checks below | 4 manual case(s) |
| loader | complete after the manual checks below | 3 manual case(s) |
| message | complete after the manual checks below | 3 manual case(s) |
| notification | complete after the manual checks below | 3 manual case(s) |
| notificationsPanel | complete after the manual checks below | 3 manual case(s) |
| pagination | complete after the manual checks below | 2 manual case(s) |
| searchBox | complete after the manual checks below | 3 manual case(s) |
| select | complete after the manual checks below | 3 manual case(s) |
| sideNavigation | complete after the manual checks below | 3 manual case(s) |
| stepper | complete after the manual checks below | 2 manual case(s) |
| table | complete after the manual checks below | 4 manual case(s) |
| textArea | complete after the manual checks below | 4 manual case(s) |
| textInput | complete after the manual checks below | 4 manual case(s) |
| toggle | complete after the manual checks below | 2 manual case(s) |
| tooltip | complete after the manual checks below | 3 manual case(s) |
| topNavigation | complete after the manual checks below | 3 manual case(s) |
| treeView | complete after the manual checks below | 3 manual case(s) |
| uploadFiles | complete after the manual checks below | 3 manual case(s) |

## Checked by a person

Tick each case after checking it; note the browser and the date.

- [ ] accordion M-01: Open the gallery (`npm run gallery`, Accordion) in the light and the dark theme and from right to left. → Joined and separate looks, borders, corners and headers look as in the design.
- [ ] accordion M-02: With a screen reader, list the headings and move between titles with the arrows. → Each title is found as a heading and read as expanded or collapsed.
- [ ] actionMenu M-01: In the showcase, choose an action of the live example. → The Output panel reports the key: the application performs the action.
- [ ] actionMenu M-02: Open the gallery (`npm run gallery`, ActionMenu) in the light and the dark theme and from right to left; open menus near the edges. → The button, the list, separators, icons and the danger colour look as in the design; lists stay inside the window.
- [ ] actionMenu M-03: With a screen reader, open a menu and move through it. → The button is read with its name and "menu"; actions are read as menu items, Archive as unavailable.
- [ ] appHeader M-01: In the showcase, search and sign out in the live example. → The Output panel reports the search and the request: the application performs them.
- [ ] appHeader M-02: Open the gallery (`npm run gallery`, AppHeader) in the light and the dark theme and from right to left; scroll; make the window narrow. → All levels, the brand background, the banner, pinned levels and the narrow layout look as in the design.
- [ ] appHeader M-03: With a screen reader, load a page with the header and an announcement; use the skip link. → The banner is announced; the skip link moves to the main content; the header landmark is named.
- [ ] badge M-01: In the showcase, make the live example a button and click it. → The Output panel reports the click: the application performs the action.
- [ ] badge M-02: Open the gallery (`npm run gallery`, Badge) in the light and the dark theme and from right to left. → Pictures, markers, layouts, sizes and own colours look as in the design; hover and focus are visible on links and buttons.
- [ ] badge M-03: With a screen reader, reach a link badge and a display-only badge. → Each is read as one sentence with its role ("link", "group").
- [ ] breadcrumbs M-01: Open the gallery (`npm run gallery`, Breadcrumbs) in the light and the dark theme and from right to left; make the window narrow. → Links, the current page, separators (mirrored from right to left), the "…" menu, sibling lists and the back link look as in the design.
- [ ] breadcrumbs M-02: With a screen reader, move through the path, open "…" and a sibling list. → The navigation is read as "Breadcrumb"; the current page is read as current; menus are read with their items.
- [ ] button M-01: In the showcase, click the live example. → The Output panel reports the click: the application decides the action (the component only reports it).
- [ ] button M-02: Open the gallery (`npm run gallery`, Button) in the light and the dark theme and from right to left; look at every hierarchy, size, width and link. → Every variant looks as in the design; focus, hover and pressed states are visible.
- [ ] button M-03: With a screen reader, reach the new-tab link and the disabled link of the gallery (Button). → "Opens in a new tab" is read after the name; the disabled link is announced as unavailable.
- [ ] calendar M-01: Open the gallery (`npm run gallery`, Calendar) in the light and the dark theme and from right to left. → Field, calendar, zoom levels, weekends, highlights, unavailable days and time lists look as in the design.
- [ ] calendar M-02: Open the live example with the browser's own fields in Firefox and Safari. → Date, time and date-and-time fields work; month and week fields are not offered.
- [ ] calendar M-03: With a screen reader, type a date, open the calendar and move through the days. → The parts, the days with their names (e.g. a holiday) and the chosen value are read.
- [ ] checkboxRadio M-01: Open the gallery (`npm run gallery`, CheckboxRadio) in the light and the dark theme and from right to left; look at every look and direction, selected and unselected, with keyboard focus. → Every variant looks as in the design; focus is visible on every look.
- [ ] checkboxRadio M-02: With a screen reader, move through a single-choice and a multiple-choice list of the gallery and reach a list with an error. → Each option is read with its state and the group title; the required list is announced as required; the error is read with the group.
- [ ] chip M-01: In the showcase, remove a chip of the live example. → The Output panel reports the request; the chip goes only when the example removes it.
- [ ] chip M-02: Open the gallery (`npm run gallery`, Chip) in the light and the dark theme and from right to left. → Statuses, own colours, borders, icons and "×" look as in the design.
- [ ] chip M-03: With a screen reader, reach a removable chip. → The "×" is read as "Remove {prefix} {label}, button".
- [ ] collapsiblePanel M-01: Open the gallery (`npm run gallery`, CollapsiblePanel) in the light and the dark theme and from right to left; make the window narrow. → Cards, inline and compact panels, status borders, labels and buttons look as in the design; the chevron turns.
- [ ] collapsiblePanel M-02: With a screen reader, list the headings and open a panel. → Each panel header is found as a heading and read as expanded or collapsed; the content is read as a region named by the title.
- [ ] contentGroup M-01: Open the gallery (`npm run gallery`, ContentGroup) in the light and the dark theme and from right to left; make the window narrow. → Frames, labels in the border, titles and descriptions look as in the design; side-by-side content wraps and stacks.
- [ ] contentGroup M-02: With a screen reader, reach a group of inputs and a section with a title. → The inputs are read with "Address, group"; the section is found by heading navigation.
- [ ] copyArea M-01: Open the gallery (`npm run gallery`, CopyArea) in the light and the dark theme, from left to right and from right to left, and in a 380 px wide window. → The code box, the single value and the button look as in the design; long code scrolls inside its box; nothing overflows the page.
- [ ] copyArea M-02: Copy the "Formatted content" example of the gallery (CopyArea) and paste it into Word or an e-mail, then into a plain text field. → The document keeps the list, the link and the bold text; the plain field gets clean text with "1." and "2.".
- [ ] copyArea M-03: With a screen reader (NVDA or VoiceOver), copy an example of the gallery (CopyArea). → "Copied" is read without moving the focus. (The failure message is announced through the same status region; T-13 checks its text.)
- [ ] form M-01: In the showcase, submit the live example. → The Output panel shows the values: the application sends them (the form only reports them).
- [ ] form M-02: Open the gallery (`npm run gallery`, Form) in the light and the dark theme and from right to left; submit with errors, while busy and successfully. → The summary, buttons, busy ring and layer, messages and columns look as in the design.
- [ ] form M-03: With a screen reader, submit a form with errors, follow a summary link, and reset with changes. → The summary is read when it receives focus; the link reaches the field; the question is read with "Keep editing" focused.
- [ ] form M-04: In a real browser, change a field of a form with `warnUnsavedChanges` and close the tab. → The browser asks before leaving.
- [ ] loader M-01: In the showcase, make the live example cancellable, start it and press Cancel. → The Output panel reports the request; the action stops only when the example ends it.
- [ ] loader M-02: Open the gallery (`npm run gallery`, Loader) in the light and the dark theme and from right to left. → Bars, rings, edge lines, the overlay panel and the end states look as in the design; the moving indicator stops moving with reduced motion.
- [ ] loader M-03: With a screen reader, run a Loader with progress to the end, and an overlay over a region. → The label, the quarters and the end are read; a failure interrupts; the region is read as busy and cannot be reached until the Loader hides.
- [ ] message M-01: In the showcase, add an action to the live example and click it. → The Output panel reports the action: the application performs it (the component only reports it).
- [ ] message M-02: Open the gallery (`npm run gallery`, Message) in the light and the dark theme and from right to left. → Every type and layout, the toasts, the modal and the remaining-time bar look as in the design.
- [ ] message M-03: With a screen reader, show an information and a danger message, change one, and load a page with a message already on it. → Information is read after the current speech, danger at once, the change is read, and the message already on the page is not read out by itself.
- [ ] notification M-01: In the showcase, click the live example. → The Output panel reports the click: the application performs the action.
- [ ] notification M-02: Open the gallery (`npm run gallery`, Notification) in the light and the dark theme and from right to left. → Shapes, markers, colours and corners look as in the design; corners are mirrored from right to left.
- [ ] notification M-03: With a screen reader, reach a bell with a count and a display-only avatar with a dot. → "Notifications, 3 new, button"; the avatar is read with its meaning, e.g. "Ana, Online".
- [ ] notificationsPanel M-01: In the showcase, open a notification of the live example and mark all as read. → The Output panel reports both: the application opens the item and stores the read state.
- [ ] notificationsPanel M-02: Open the gallery (`npm run gallery`, NotificationsPanel) in the light and the dark theme and from right to left. → The bell, the panel, unread highlighting and the footer look as in the design; the panel stays inside the window.
- [ ] notificationsPanel M-03: With a screen reader, open the panel and close it. → The panel is read as a dialog named "Notifications" with its first notification; unread ones are read as unread.
- [ ] pagination M-01: Open the gallery (`npm run gallery`, Pagination) in the light and the dark theme and from right to left. → The bar, the current page, the disabled arrow and the go-to field look as in the design; in right-to-left the arrows point the other way.
- [ ] pagination M-02: With a screen reader, reach the paginations of the gallery. → Each navigation is read by its own name; the current page is read as current; the go-to error is read with the field.
- [ ] searchBox M-01: In the showcase, search in the live example. → The Output panel reports the search: the application performs it and shows the results.
- [ ] searchBox M-02: Open the gallery (`npm run gallery`, SearchBox) in the light and the dark theme and from right to left. → Field, clear button, busy indicator, scopes and Search button look as in the design.
- [ ] searchBox M-03: With a screen reader, search and receive "No results"; in a real browser with `autocomplete:'on'`, start typing an earlier search. → The message is announced; the browser offers the earlier search.
- [ ] select M-01: Open the gallery (`npm run gallery`, Select) in the light and the dark theme and from right to left; open each list. → Fields, lists, chosen and pointed options, check marks and the shortened value look as in the design.
- [ ] select M-02: On a phone, tap a custom select of the gallery. → The phone's own picker opens.
- [ ] select M-03: With a screen reader, open a custom list, move through it, type letters, and reach a select with an error. → The field is read as a combo box with its value; the options are read with their state; the error is read with the field.
- [ ] sideNavigation M-01: In the showcase, click a page of the live example. → The Output panel reports the page: the application opens it.
- [ ] sideNavigation M-02: Open the gallery (`npm run gallery`, SideNavigation) in the light and the dark theme and from right to left; switch the rail; make the window narrow. → Level styles, marks, corners, the rail, its panels and the drawer look as in the design; from right to left they open on the other side.
- [ ] sideNavigation M-03: With a screen reader, move through the tree, open the drawer and search without result. → The current page is read as current; parents are read as expanded or collapsed; the drawer keeps the focus; "No matching pages" is announced.
- [ ] stepper M-01: Open the gallery (`npm run gallery`, Stepper) in the light and the dark theme and from right to left; make the window narrow. → Markers, statuses, lines, labels, the checking line and the compact bar look as in the design; arrows and lines follow the text direction.
- [ ] stepper M-02: With a screen reader, move through the steps and press Next. → The list, the current step, statuses and waiting steps are read; the new step is announced.
- [ ] table M-01: In the showcase, select rows of the live example and click an action. → The Output panel reports the action and the selection: the application performs it (the component only reports it).
- [ ] table M-02: Open the gallery (`npm run gallery`, Table) in the light and the dark theme and from right to left; make the window narrow and wide again. → The table, the cards, the counts line, the loading line and the page navigation look as in the design.
- [ ] table M-03: On a phone or tablet, open the gallery (Table) and turn the device. → The table changes between columns and cards; the page and the selection stay.
- [ ] table M-04: With a screen reader, sort a column, select rows and the page, and show a load error. → The sort state is read with the header; the checkboxes are named ("Select row 3"); the load error is announced.
- [ ] textArea M-01: In the gallery (TextArea), drag the corner of the default field down. → The field gets taller; it cannot be made wider.
- [ ] textArea M-02: In the gallery, type a misspelled word; in a field with `autocomplete:'on'` inside a form that was sent before, start typing an earlier entry. → The word is underlined by the browser; the browser offers the earlier entry.
- [ ] textArea M-03: Open the gallery (`npm run gallery`, TextArea) in the light and the dark theme and from right to left. → Every variant looks as in the design; the counter is at the end of the line, in red and bold near the limit.
- [ ] textArea M-04: With a screen reader, type in a field with a maximum length until the warning zone and the limit; then leave a field with an error. → The limit is read with the field; entering the warning zone and reaching the limit are announced once; the error is read with the field.
- [ ] textInput M-01: In the showcase, add an action to the live example and click it. → The Output panel reports the action: the application performs it (the component only reports it).
- [ ] textInput M-02: On a phone, tap a `TEL` field of the gallery (TextInput). → The numeric keypad opens.
- [ ] textInput M-03: Open the gallery (`npm run gallery`, TextInput) in the light and the dark theme and from right to left; look at every width, the error, the help, the icon and the password toggle. → Every variant looks as in the design; focus and error states are visible.
- [ ] textInput M-04: With a screen reader, reach a field with an error and the password toggle of the gallery. → The error is read with the field; the toggle is read as "Show password", pressed or not.
- [ ] toggle M-01: Open the gallery (`npm run gallery`, Toggle) in the light and the dark theme and from right to left. → Switches, both values, sizes, colours, the busy knob and the radio buttons look as in the design; the busy knob stops moving with reduced motion.
- [ ] toggle M-02: With a screen reader, reach a switch, a busy switch and a radio question with an error. → The switch is read as a switch, on or off, and busy; the question is read with its answers and the error.
- [ ] tooltip M-01: Open the gallery (`npm run gallery`, Tooltip) in the light and the dark theme and from right to left; hover near the edges of the window. → Both looks, the arrow and the sides look as in the design; tooltips flip and stay inside the window; START and END follow the text direction.
- [ ] tooltip M-02: On a phone, press a long-press control of the gallery for half a second. → The tooltip shows for a moment; the control does not act and no menu opens.
- [ ] tooltip M-03: With a screen reader, reach Save (described) and "★" (named) in the gallery, and a group with tooltips. → Save is read with its description; "★" is read by the tooltip text; group tooltips are not read twice.
- [ ] topNavigation M-01: In the showcase, click a page of the live example. → The Output panel reports the page: the application opens it.
- [ ] topNavigation M-02: Open the gallery (`npm run gallery`, TopNavigation) in the light and the dark theme and from right to left; hover sections; make the window narrow. → Panels, mega menus, the three highlights and their hover, "More" and the menu panel look as in the design.
- [ ] topNavigation M-03: With a screen reader, open panels, reach the current page and the external link. → Sections are read as expanded or collapsed; the current page is read as current; "opens in a new tab" is read.
- [ ] treeView M-01: In the showcase, choose an item, edit the tree and press an action of the live example. → The Output panel reports each: the application opens the item, stores the change and performs the action.
- [ ] treeView M-02: Open the gallery (`npm run gallery`, TreeView) in the light and the dark theme and from right to left; drag items with the mouse. → Indentation, guide lines, frames, selection, dashes, the loading ring, the toolbar and drop markers look as in the design; from right to left the tree is mirrored.
- [ ] treeView M-03: With a screen reader, move through the tree, open parents and tick items. → Items are read with their level, position, expanded and ticked states.
- [ ] uploadFiles M-01: On a phone, open the live example with the back camera; in the showcase upload a file in `AUTO`. → The camera opens directly; the Output panel shows the App's upload and its progress.
- [ ] uploadFiles M-02: Open the gallery (`npm run gallery`, UploadFiles) in the light and the dark theme and from right to left; drag real files from the desktop. → Drop area, list, icons, previews, progress bars and statuses look as in the design.
- [ ] uploadFiles M-03: With a screen reader, add, refuse, remove and upload files. → Added, removed and uploaded files are announced politely, refused and failed ones at once.
