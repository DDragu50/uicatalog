# Changelog

## Delivery 139 — 2026-11-13: Contact page, right column

Showcase look: **Contact page** (your request). The live examples are unchanged.

- The text on the right starts at the top of the page, in line with "Contact", and ends in line with the header's search icon; it takes all the width left beside the form.
- 64px between the form and the text (was 32px). One column below 48rem, as before.

## Delivery 138 — 2026-11-13: External links in new tabs; contact page in two columns

Showcase look: **Home page** links and **Contact page** layout (your list). The live examples are unchanged.

- New `client/app/markdown/externalLinks.js`: links to other sites in the Home intro and on the Contact page open in a new tab and show a small icon (arrow out of a square) after the text; screen readers hear "(opens in a new tab)". Home: GitHub, Codeberg; Contact: LinkedIn. "Download .zip archive" stays in the same tab.
- Contact page: title and invitation across the page; below, the form on the left and your text on the right (one below the other in a narrow page). "With extensive experience…" is its own paragraph. `contact.md` is split at the line `<!-- aside -->` (`APP_CONFIG.contactAsideMarker`).
- Public copy, the public GitHub repository and `client/assets/uicatalog.zip` updated.

## Delivery 137 — 2026-11-13: Favicon, repository links

Showcase look: **browser tab icon** (favicon) and **Home page** links. Nothing else changes.

- Favicon from the public repository: `client/assets/favicon.svg` and `favicon.png` (32×32, for browsers without SVG icons), linked in `client/index.html` with addresses relative to the page (`assets/…`).
- `client/assets/logo1.svg` removed (not used).
- Home page: "GitHub" and "Codeberg" link to https://github.com/DDragu50/uicatalog and https://codeberg.org/DDragu50/uicatalog (GitLab replaced by Codeberg).
- Top `README.md`: the two repository links. README and `build-public.js` comments: Codeberg instead of GitLab.
- Public copy and `client/assets/uicatalog.zip` rebuilt.

## Delivery 136 — 2026-11-13: Public copy and download zip

Showcase look: **Home page** — "Download .zip archive" is now a link. Nothing else changes.

- New `server/build-public.js` (`npm run public`): copies the project into `uicatalog/` (next to `ui-catalog/` and `showcase_ui-catalog/`, ignored by Git; the content of the public repositories) and writes the same files to `client/assets/uicatalog.zip` (top folder `uicatalog/`). Private and working files are left out (README, "Make the public copy").
- `client/content/home.md`: the link `./assets/uicatalog.zip`.
- `server/server.js`: serves `.zip` files.
- New `README.md` at the top of the project (for the repositories' front page); the public copy also has `LICENSE` at the top.
- Library: `README.md` names uicatalog.eu (was uicomponent.eu); `CHANGELOG.md` no longer points to DECISIONS.
- DECISIONS 217.

## Delivery 135 — 2026-11-12: Site adjustments; contact e-mails on PHP hosting

Showcase look: **footer, Search, component and Contact pages changed** (your list). The live examples are unchanged.

- Footer: "Dan Dragu" links to the LinkedIn page (new tab).
- Search page: the results table no longer has a wide empty space before the names (narrow row-number column; the last column takes the spare width; Keywords wider).
- Component pages: the Variants column is open at first ("For a cleaner view you can collapse this section"); collapsing or expanding it applies to every component page and is remembered in the browser.
- Contact page: your text at the top and a LinkedIn link ("Dan Dragu - LinkedIn").
- New `client/api/contact.php` and `client/api/.htaccess`: on Apache/PHP hosting (cPanel) the contact form sends each message by e-mail to admin@uicatalog.eu, with the same checks and limit as the Node server.
- README, DECISIONS (216; open item 1 closed, item 2 updated).

## Delivery 134 — 2026-11-11: New Home page texts and FAQs; AI entry files

Showcase look: **Home page changed** — new tagline, a "Download .zip archive" line, new core concepts, five new FAQs; answers can show lists, bold text and a prompt to copy. The live examples are unchanged.

### Library (ui-catalog)

- `AGENTS.md`: "Rules that win over everything else" (five, numbered), a quick reference (load, render, check for `null`, `destroy()`), and a table for choosing a component by what the user needs.
- `README.md`: a short code example and the new AI files in "What is inside".
- `how-to-use-the-framework.md`: §10 "In React, Vue or Svelte" (render after mount, keep the instance, `destroy()` on unmount; an example for each); §11 the files to give an AI tool, in order, and a prompt that works.
- `llms.txt` (index: documents to read first, one line per component) and `llms-full.txt` (all documentation in one file): new `npm run llms` (`tools/llms.mjs`); `npm run release` writes them too.
- TreeView folder: the two unused screenshots removed.
- `TESTING.md` and CHANGELOG 1.0.0 updated.

### Showcase app

- `client/content/home.md`: tagline, the zip line, core concepts.
- `client/app/appConfig.js`: five FAQs (answers in Markdown, two with a prompt); `APP_TEXTS.home.prompt`.
- `client/app/pages/homePage.js`: answers rendered as Markdown; a FAQ's prompt in a CopyArea before the guide button (`app.css`: the gap).
- Guides synced. DECISIONS: 215; next-delivery items 1–3 done.

### Tested

- ui-catalog `npm run check`: no findings; `node tools/llms.mjs --check`: up to date. Showcase `npm run check`: no findings. In the browser: Home without scrolling at 1920×1080 and 1440×900 (answers closed), 150 px of scrolling at 1366×768; every FAQ opens with its answer, the two prompts and the guide buttons; bold text in the shadcn/ui answer; the Home page and 30 component pages without console errors.

### To install

- `git pull`, then `npm start` in `showcase_ui-catalog`.

## Delivery 133 — 2026-11-11: README Files tables list the test plan; manual checks moved to the next version

Showcase look: **unchanged** — documentation and checks only.

### Library (ui-catalog)

- READMEs of all 30 components: the Files table has a row for the test plan (`xTESTS.md`, with the file of its automatic cases).
- `npm run check`: `xTESTS.md` is a required file; a .js, .css or .md file of the component folder missing from the README Files table is reported. Guidelines §2: the rule.
- CHANGELOG 1.0.0, Verification: the 86 manual cases are not checked by a person for this release; planned for the next version.

### Showcase app

- READMEs and guidelines synced. DECISIONS: 213; open item 10 (manual checks, next version).

### Tested

- ui-catalog `npm run check`: no findings; a README without its test plan row is reported (tried on Chip, then restored). `npm run coverage`: no findings.

### To install

- `git pull`.

## Delivery 132 — 2026-11-11: Id rules documented; Button corners in the live examples

Showcase look: **live examples changed (approved)** — text buttons in every live example are square by default, like the library; icon buttons stay round. The `radius` and `iconButtonRadius` options in the Button Variants panel now change the corners.

### Library (ui-catalog)

- Guidelines §5, new point "Ids: rules for the Consumer, and what the check does not catch"; §13 points to it. The same rules, shorter, in `how-to-use-the-framework.md` ("Ids") and `AGENTS.md` (step 3). Documentation only, no code.

### Showcase app

- `client/showcase-styling/button.css`: corners per configuration (CORNERS block, as in the library) instead of per type; the header comment and the structure example updated.
- Guides synced. DECISIONS: 210, 211; open items 6 and 7 removed.

### Tested

- ui-catalog `npm run check`: no findings. In the browser: the Button live example is square by default; `radius` NONE / SMALL / MEDIUM / LARGE give 0 / 4 / 8 / 12px, an icon button with `iconButtonRadius` SMALL 4px; the Home page and 30 component pages without console errors.

### To install

- `git pull`, then `npm start` in `showcase_ui-catalog`.

## Delivery 131 — 2026-11-11: "Applies when" in a fixed form; optional dependencies shown

Showcase look: **component pages only** — "Can use" and "Can be used by" rows appear under "Uses" / "Used by" where a component loads another on demand (e.g. Tooltip). In the Variants panels, options whose condition was free text are now greyed out when they have no effect. The live examples are unchanged.

### Library (ui-catalog)

- READMEs: the "Applies when" cells of 46 options in 17 components rewritten in the fixed form (e.g. "Label present" → `` `label` ``, "Counter shown" → `` `showCounter` ``, "No `target`" → `` not `target` ``); requirements, screen sizes and conditions on data moved to the description, with `Always` in the cell. AppHeader `onNotifications` and SearchBox `texts.search` / `texts.scopeLabel` got rows of their own.
- Guidelines (Configuration table): the fixed form of "Applies when".
- `npm run check`: reports an "Applies when" cell that is not in the fixed form.
- CHANGELOG 1.0.0: one line under Added.

### Showcase app

- `server/build-catalog.js`: optional dependencies (dynamic imports, also through a dependency) as `optional` / `optionalVia` and `optionalUsedBy` / `optionalUsedByVia` in `catalog.json`; groups and dependency keywords unchanged.
- Component page: "Can use" and "Can be used by" rows, only when not empty (`componentPage.js`, `APP_TEXTS.component.canUse` / `canBeUsedBy`).
- READMEs and guidelines synced, `client/data/catalog.json` rebuilt. DECISIONS: 209; open items 3–5 removed.

### Tested

- ui-catalog: `npm run check`, `npm run coverage`, `npm run gallery:check`: no findings. Showcase: `npm run check` no free-text conditions; the new conditions evaluated for sample settings (e.g. Select `texts.clear` only for CUSTOM + SINGLE + not mandatory; SearchBox `texts.minLength` only when `minLength` is above 1). In the browser: the Home page and 30 component pages without console errors; Button, TextInput, Tooltip and Select show the right rows.

### To install

- `git pull`, then `npm start` in `showcase_ui-catalog`.

## Delivery 130 — 2026-11-11: Footer names the MIT licence; open decisions checked

Showcase look: **footer only** — the Creative Commons icon is replaced by a copyright icon, and the line now reads "2026 Dan Dragu · MIT License" with a link. The live examples are unchanged.

### Library (ui-catalog)

- No change.

### Showcase app

- Footer: copyright icon (`fa-regular fa-copyright`, announced as "Copyright"), "2026 Dan Dragu", a middle dot and the link "MIT License", which opens the licence text in a new tab. Link colours and underline come from the link tokens (`app.css`). Texts in `APP_TEXTS.footer`, address in `APP_CONFIG.license` (`appConfig.js`, `appIndex.js`).
- `npm run sync` now also copies `ui-catalog/LICENSE` to `client/content/LICENSE.txt` (`server/sync-components.js`).
- DECISIONS: 207 (footer), 208 (open decisions checked against the code: nine remain, numbered 1–9; resolved rows and finished to-do items removed; the `[APP]` working rule moved under "App look" with current counts).

### Tested

- In the browser: the footer shows the icon, the text and the link; the link opens the licence in a new tab; no console errors. `npm run check`: no new findings.

### To install

- `git pull`, then `npm start` in `showcase_ui-catalog`.

## Delivery 129 — 2026-11-10: Calendar reports typed input when focus leaves the field

Showcase look: **unchanged** — behaviour only. In the Calendar live example the Output panel now shows a typed date when you leave the field.

### Library (ui-catalog)

- Calendar: typing, the arrows, Backspace and paste in the parts of the field (day, month, year, hour, minute, AM/PM, week) are reported to the App **once, when focus leaves the field**, and only if the value differs from the last one reported — no more report for every key (e.g. 0002, 0020, 0202, 2026 while typing a year). The same applies to the browser's own fields. `onValidation` follows the same rule. Moving between "From" and "To" of a period stays in the field. `getValue()` returns the typed value at once.
- Still reported at once: picking in the calendar, the time lists, Today/Clear, quick ranges.
- README: new lines BA-42 and BA-43; the `onValueChange` and `onValidation` rows describe when they fire.
- Test plan: new case T-26; T-03 to T-06 and T-21 changed. Each failed on the old code before the fix.

### Showcase app

- `client/components/calendar/*` synced, `client/data/catalog.json` rebuilt. DECISIONS: 206.

### Tested

- `npm run check`, `npm run coverage`, `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components calendar table form`: all pass (Calendar 26 auto cases).
- Together: the Form with Calendar, UploadFiles and TreeView still lists errors, sends values and resets quietly.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`. Rollback point: branch `before-delivery-129`.

## Delivery 128 — 2026-11-10: Test plans for SearchBox, TreeView, UploadFiles and Calendar; two fixes

Showcase look: **unchanged** — the two fixes change behaviour only.

### Library (ui-catalog)

- New test plans with their tests: SearchBox (15 auto, 3 manual), TreeView (29 auto, 3 manual), UploadFiles (20 auto, 3 manual), Calendar (25 auto, 3 manual). Every Business analysis code, callback and error label is covered. **All 30 components now have a test plan** (526 auto, 86 manual cases).
- TreeView fix: pressing "*" opens all parents at the same level and now reports it once (before: once per opened parent). Case T-25.
- Calendar fix: the "Today"/"Now" button now uses the same "today" the calendar marks (`referenceTime` when given); before it used the computer's date. Case T-14; README `referenceTime` row updated.
- Noted, not changed: while the year is typed in the Calendar, each digit gives a whole year (0002, 0020, 0202, 2026) and each is reported through `onValueChange`, as the browser's own date field does.
- `TESTING.md`: all 30 components listed; a new component gets its plan in the delivery that adds it.

### Showcase app

- `client/components/*` synced (the plans, the two fixes, the Calendar README), `client/data/catalog.json` rebuilt. DECISIONS: 205.

### Tested

- `npm run check`, `npm run coverage` (30 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: all 30 components pass every case; the four new plans twice in a row.
- Together, beyond the plans: a Form with Calendar, UploadFiles and TreeView — all three errors are listed, the values arrive, the quiet reset empties them without errors; a SearchBox beside it searches on Enter; no console messages.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`. Rollback point: branch `before-delivery-128`.

## Delivery 127 — 2026-11-10: Test plans for Chip, CollapsiblePanel, Accordion and Stepper

Showcase look: **unchanged** — only test plans, tests and one test tool.

### Library (ui-catalog)

- New test plans with their tests: Chip (9 auto, 3 manual), CollapsiblePanel (15 auto, 2 manual), Accordion (11 auto, 2 manual), Stepper (25 auto, 2 manual). Every Business analysis code, callback and error label is covered. No faults found in the four components.
- `tools/lib.mjs`: a test case may cover any callback name (Stepper's `canLeave`); before, only names starting with "on" were read.
- `TESTING.md`: the list of components with a plan (26).

### Showcase app

- `client/components/*` synced (the new plans), `client/data/catalog.json` rebuilt. DECISIONS: 204.

### Tested

- `npm run check`, `npm run coverage` (26 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: all 26 components pass every case; Stepper twice in a row.
- Together, beyond the plans: a Form around a Stepper with fields in its steps — the form sees all fields, Next is refused while Name is empty, the values arrive from both steps; a removable Chip in a CollapsiblePanel header — removing it is reported and the panel stays closed; no console messages.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`.

## Delivery 126 — 2026-11-10: Test plans for the overlays and small parts; three fixes

Showcase look: **unchanged** — the fixes change behaviour only (what a screen reader hears after a count change, the first tooltip's pause, a trailing separator in action menus).

### Library (ui-catalog)

- New test plans with their tests: Notification (14 auto, 3 manual), Badge (12 auto, 3 manual), NotificationsPanel (11 auto, 3 manual), Tooltip (15 auto, 3 manual), ActionMenu (13 auto, 3 manual). Every Business analysis code, callback and error label is covered.
- **Notification** (fixed): `setCount()` after a dot or text marker no longer keeps that marker's meaning — a bell or avatar switched from "Online" to a count of 2 is read "2 new", not "Online". README `setCount()` row.
- **Tooltip** (fixed): the first tooltip on a freshly loaded page waits for its pause like every other one.
- **ActionMenu** (fixed): separators at the end of the list (also two in a row) are removed, as the README says.
- `TESTING.md`: the list of components with a plan (22).

### Showcase app

- `client/components/*` synced, `client/data/catalog.json` rebuilt. DECISIONS: 203.

### Tested

- `npm run check`, `npm run coverage` (22 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: all 22 components pass every case; Tooltip three times in a row, ActionMenu and Breadcrumbs (which uses it) twice.
- Together, beyond the plans: ActionMenus in the rows of a Table — one open at a time, the chosen action reported for the right row, the last row's menu inside the window; an AppHeader with a NotificationsPanel — the panel opens on top and inside the window; no console messages.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`. Rollback point: branch `before-delivery-126` (the state after Delivery 125).

## Delivery 125 — 2026-11-10: Test plans for the page frame; two fixes

Showcase look: **unchanged in the live examples** (showcase-styling not changed). On the app's own pages and in the library, below 48rem the AppHeader user shows only the photo or initials (the README already promised it).

### Library (ui-catalog)

- New test plans with their tests: Breadcrumbs (12 auto, 2 manual), TopNavigation (15 auto, 3 manual), SideNavigation (18 auto, 3 manual), AppHeader (17 auto, 3 manual). Every Business analysis code, callback and error label is covered.
- **TopNavigation** (fixed, found by T-03): pressing Tab out of an open panel to the next section now closes the panel (before, it stayed open until focus left the whole navigation).
- **AppHeader** (fixed, found by T-14): below 48rem the user's name and role are hidden visually, as the README says, and stay available to screen readers; the photo or initials remain. `appHeader.css` (part 3 and the header comment).
- `TESTING.md`: the list of components with a plan (17).

### Showcase app

- `client/local-styling/appHeader.css` (same change), `client/components/*` synced, `client/data/catalog.json` rebuilt. DECISIONS: 202.

### Tested

- `npm run check`, `npm run coverage` (17 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: all 17 components pass every case; TopNavigation and AppHeader twice after their fixes.
- Together, beyond the plans: an AppHeader with TopNavigation and Breadcrumbs and a SideNavigation whose menu button is in the header — at 1280 px the side menu is shown and no menu button; at 700 px the menu button is in the header, the drawer opens above the header and Escape returns the focus to the button; the pinned header stays at the top; no console messages.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`. Rollback point: branch `before-delivery-125` (the state after Delivery 124).

## Delivery 124 — 2026-11-10: Test plans for Form, Toggle, Select and ContentGroup

Showcase look: **unchanged** — only test plans, tests and one test tool.

### Library (ui-catalog)

- New test plans with their tests: Toggle (13 auto, 2 manual), Select (19 auto, 3 manual), ContentGroup (14 auto, 2 manual), Form (24 auto, 4 manual). Every Business analysis code, callback and error label is covered. No faults found in the four components.
- `tools/lib.mjs`: the coverage check reads every callback of a row that names several (Form's `onReset` / `onClear` / `onCancel`); before, only the first one had to be covered.
- `TESTING.md`: the list of components with a plan (13).

### Showcase app

- `client/components/*` synced (the new plans), `client/data/catalog.json` rebuilt. DECISIONS: 201.

### Tested

- `npm run check`, `npm run coverage` (13 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: all 13 components pass every case (Button 20, CheckboxRadio 14, ContentGroup 14, CopyArea 22, Form 24, Loader 23, Message 19, Pagination 14, Select 19, Table 27, TextArea 19, TextInput 22, Toggle 13).
- Together, beyond the plans: a Form with a TextInput and a ContentGroup holding a Select, a Toggle question and a CheckboxRadio — submitting empty lists all four problems, each link moves to its field, filled values arrive complete, and Reset empties them without showing errors; no console messages.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`.

## Delivery 123 — 2026-11-10: Test plans for Pagination, Message and Loader; Table rechecked

Showcase look: **unchanged** — test plans and tests, and one Table fix that only affects screen readers.

### Library (ui-catalog)

- New test plans with their tests: Pagination (14 auto, 2 manual), Message (19 auto, 3 manual), Loader (23 auto, 3 manual). Every Business analysis code, callback and error label is covered. No faults found in the three components.
- **Table** (rechecked after the group): when the layout changed while a load error was shown, the error was rendered and announced again; now "Loading…", "no data" and load-error messages stay as they are and only widen to the new columns. New case T-27; README layout paragraph.
- `TESTING.md`: the list of components with a plan.

### Showcase app

- `client/components/*` synced (the new plans, Table), `client/data/catalog.json` rebuilt. DECISIONS: 200.

### Tested

- `npm run check`, `npm run coverage` (9 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: Button 20/20, CheckboxRadio 14/14, CopyArea 22/22, Loader 23/23, Message 19/19, Pagination 14/14, Table 27/27, TextArea 19/19, TextInput 22/22. Table, Pagination, Message and Loader three times in a row without a failure.
- Table in the browser, beyond the plan: resizing while a page loads keeps the rows dimmed and unavailable (also as cards) until the page arrives; resizing with a load error shown no longer changes the announced region.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`.

## Delivery 122 — 2026-11-10: Table test plan; focus kept in the table when it switches to cards

Showcase look: **unchanged** — the Table example is laid out at a fixed width in the showcase, so the focus fix does not show there.

### Library (ui-catalog)

- New `table/tableTESTS.md` and `tests/components/table.test.mjs`: 26 auto, 4 manual cases; every Business analysis code (42), callback (3) and error label (17) covered.
- **Table:** when the layout changes while a column header that disappears (card mode) has keyboard focus, focus moves to the table instead of the page (found by T-17). README: the layout paragraph says so.
- `TESTING.md`: Table in the list of components with a plan.

### Showcase app

- `client/components/table/*` synced, `client/data/catalog.json` rebuilt. DECISIONS: 199.

### Tested

- `npm run check`, `npm run coverage` (6 components with a plan), `npm run gallery:check`: no findings; `npm test`: 265 passed.
- `npm run test:components`: Table 26/26 (three runs in a row), Button 20/20, CheckboxRadio 14/14, CopyArea 22/22, TextArea 19/19, TextInput 22/22.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`.

## Delivery 121 — 2026-11-10: Table adapts to its space; TextInput tooltip fix and wording

Showcase look: **changed, approved** (decision 198) — the TextInput live example no longer shows the browser tooltip on the password show/hide button by default (it follows "Tooltip mode"). The Table example is laid out at a fixed 900px in the showcase, so its new behaviour is seen in the gallery and in applications.

### Library (ui-catalog)

- **Table:** the visible columns, compact views and cards are decided again whenever the container's width changes (window resized, phone turned, side panel opened); data, sort, page, selection and keyboard focus stay; components in cells are rendered again; rows per page stay as decided at render time. `tableComponent.js` (ResizeObserver, once per frame, only when the decision differs), `tableHTML.js` (`buildColumnsHTML`), `tableState.js` (comment). README: overview, key features, BA-35 narrowed, new BA-42, container, `getVisibleColumns()`, `destroy()`, the layout paragraph, the cell clean-up note.
- **TextInput:** the password toggle follows `tooltipMode` (no browser tooltip with `NONE`, only the Tooltip with `TOOLTIP`). BA-08: "step buttons for whole numbers with a step other than 1".

### Showcase app

- `client/components/*` synced, `client/data/catalog.json` rebuilt.
- DECISIONS: 198; the three open items of delivery 120 marked done; 196 says rollback points are branches (tags cannot be pushed from here).

### Tested

- `npm run check`, `npm run coverage`, `npm run gallery:check`: no findings; `npm test`: 265 passed; `npm run test:components`: Button 20/20, CheckboxRadio 14/14, CopyArea 22/22, TextArea 19/19, TextInput 22/22 (T-14 now passes).
- Table in the browser (Playwright): a table with 7 columns at 1400px shows all 7; sorted by Customer, on page 2 with 2 rows selected and focus on a sort button, at 900px it shows 4 (date compact), at 560px cards, back at 1400px all 7 — sort, page, selection and focus kept every time; cell components destroyed and rendered again without leftovers; no console messages. Gallery: the Table variant switches to cards at 480px and back.
- Showcase: Home and all 30 component pages without console messages.

### To install

Pushed to `main`: run `git pull`. Rollback point: branch `before-delivery-121` (the state after Delivery 120).

## Delivery 120 — 2026-11-10: Test plans for TextInput, TextArea and CheckboxRadio; Table layout cause

Showcase look: **unchanged** — only test plans, test code, the harness and documents changed; no component code or stylesheet.

### Library (ui-catalog)

- New test plans (`xTESTS.md`, next to each README) with their tests (`tests/components/x.test.mjs`): TextInput (22 auto, 4 manual), TextArea (19 auto, 4 manual), CheckboxRadio (14 auto, 2 manual). Every Business analysis code, callback and error label is covered.
- `tests/components/harness.js`: records callbacks passed as render arguments (`{ $callback:'name' }` in `args`), needed by the form fields' `onValueChange` and `onValidation`.
- `TESTING.md`: components with a plan, the `$callback` values, the one exception for internal fallbacks.
- TextInput README: the `INVALID_PHONE` trigger says it needs `validation.enabled` (it always did). Button test plan: its introduction lists `UNSAFE_ID`.

### Showcase app

- `client/components/*` synced (the new test plans and the README wording), `client/data/catalog.json` rebuilt.
- DECISIONS: 197; Open decisions: Table layout cause and options, TextInput password toggle tooltip (a bug), TextInput step buttons wording.

### Found, waiting for your decision

- **TextInput password toggle** always shows the browser tooltip, also with `tooltipMode:'NONE'` (the default); with `TOOLTIP` it shows two. One-line fix; it changes the live example on hover, so it needs your approval. Until then TextInput test T-14 fails on purpose, and `npm run test:components` reports it.
- **TextInput step buttons:** BA-08 promises them for whole numbers, the code shows them only when `step` is not 1. Recommended: correct the wording.
- **Table:** the layout is decided once when the table is drawn, by design and documented. Three options are in Open decisions; recommended: adapt when the container's width changes.

### Tested

- `npm run check`: no findings; `npm run coverage`: no findings (5 components with a plan); `npm test`: 265 passed, 0 failed; `npm run gallery:check`: no findings.
- `npm run test:components`: Button 20/20, CopyArea 22/22, TextArea 19/19, CheckboxRadio 14/14, TextInput 21/22 (T-14, the tooltip bug above).
- Showcase: Home and all 30 component pages open without console messages.

### To install

Pushed to `main` (decision 196): run `git pull`. No `npm` commands needed.

## Delivery 119 — 2026-11-10: Square buttons, unsafe ids, licence note

Showcase look: **changed on the app's own pages only** — text buttons on the Home page, the guide pages and inside components rendered by the app are now square (decision 195). The live examples (showcase-styling) are unchanged: their buttons keep the old corners.

### Library (ui-catalog)

- **Button:** text buttons are square by default (`radius` default `NONE`, was `SMALL`); icon buttons stay round (`iconButtonRadius` `CIRCLE`). The corner options now work: `button.css` gets one rule per corner class (`ui-button-radius-…`, `ui-button-icon-radius-…`) instead of corners per hierarchy. README (`radius` row, Styling contract) and `buttonTESTS.md` T-11 updated; `button.test.mjs` T-11 checks the default, SMALL < LARGE and an icon button with `NONE`.
- **Button, CheckboxRadio, TextArea, TextInput:** new error `UNSAFE_ID` — an id that does not start with a letter, or contains characters other than letters, digits, `_ : . -`, is refused (nothing is rendered), as in the other components. README rows for `id` and the developer errors updated.
- `LICENSE`: Font Awesome named as used but not included, with its licences.

### Showcase app

- `client/local-styling/button.css` (same as the library), `client/components/*` synced, `client/data/catalog.json` rebuilt.
- DECISIONS: 195, 196 (delivery workflow: straight to `main`, tags as rollback points); Open decisions: Table wide layout after the window shrinks (to investigate), Button corners in the live examples (to decide).

### Tested

- `npm run check`: no findings; `npm run coverage`: no findings; `npm test` (shared contract test): 265 passed, 0 failed — the "id unsafe" check now runs and passes for Button, CheckboxRadio, TextArea and TextInput (before: not applicable); `npm run test:components`: Button 20/20, CopyArea 22/22; `npm run gallery:check`: no findings.
- Showcase (Playwright): Home and all 30 component pages opened, no console errors or warnings; on the Button page the app's own text buttons have square corners and the icon buttons are round.

### To install

Pushed to `main` (decision 196): run `git pull`. Built on your push "Update 10nov2026" (commit 8be8ba6); your name in `ui-catalog/LICENSE` is kept. The synced showcase files and `catalog.json` are included, so `npm run sync` and `npm run catalog` are not needed. Also removed: `showcase_ui-catalog/client/assets/fonts/Inter-4.1/LICENSE.txt` (left over from Delivery 118; its copy is in the `web` folder).

## Delivery 118 — 2026-11-10: Gallery, completion rule, starter and the documents for outside users

Showcase look: **changed only by the font** — the showcase now finds the Inter font (it was in the wrong folder, so the system font was shown). Pages, live examples and README pages are otherwise unchanged; the guide pages show the updated guidelines.

### Library (ui-catalog)

- `gallery/` (new): `index.html`, `gallery.js`, `gallery.css`, `variants.js` — every component in its key variants (68 variants) and every design token, read live; light, dark and right-to-left switches; a component's console messages appear under it. `npm run gallery` opens it; `npm run gallery:check` checks it (also in `status` and `release`).
- Guidelines §14 "Verification and completion": the completion rule; §2, §15.1, §16, §17, §18 updated (gallery instead of test page). `TESTING.md`: gallery, completion rule, folders. The release record lists every component as complete or not yet verified.
- Removed: the HTML test pages, `tests/00-component-test.js`, `tests/00-component-test.css`, `source/color-tokens.html` (its content is in the gallery). Manual test cases of CopyArea and Button point to the gallery; the gallery got the variants they need.
- `starter/` (new): a minimal working page (header, form, message, table) with its own layout and overrides files and a README on starting a project; `npm run starter`.
- New documents: `README.md`, `AGENTS.md`, `DEPENDENCIES.md`, `CHANGELOG.md` (with the rules for new entries), `LICENSE` (MIT), `.gitignore`.
- `assets/fonts/Inter-4.1/web/` (new): the Inter font and its licence, where `design-system.css` looks for it.
- `how-to-use-the-framework.md`, `how-to-build-a-design-system.md`: point to the starter, `AGENTS.md` and the gallery.
- Tools: `gallery.mjs`, `gallery-check.mjs` (new); `server.mjs` serves folder pages and the starter's layout; `check.mjs` requires a gallery entry; `release.mjs` adds the gallery and the completion table.

### Showcase app

- `client/assets/fonts/Inter-4.1/web/` (new): the font where `local-styling/design-system.css` expects it.
- `client/content/*`, `client/components/*` synced.

### Tested

- Gallery (Playwright): 30 components, 68 variants, no console messages and no script errors; 17 token groups with swatches (values of `color-mix()` tokens converted correctly) and tables; no sideways scrolling at 1300 px in both directions and at 380 px when opened at that width; dark theme and right-to-left switch.
- Starter: renders without messages; Save with an empty customer shows "Required."; with a name it adds the order to the table, shows the confirmation and empties the field without an error.
- `npm run check` (30 components, gallery entries included): no findings; `npm test`: 261 passed; `npm run gallery:check`: no findings; `npm run test:components`: CopyArea 22/22, Button 19/20 (T-11, the open corner question); the status report shows the completion table (CopyArea complete after its manual checks; Button and 28 others not yet verified).
- Showcase: no missing files (the font loads); the guidelines page shows §14 "Verification and completion".

### To install

Copy the files into the same places. Then delete: every `*.html` file and `00-component-test.js` / `00-component-test.css` in `ui-catalog\tests\`, `ui-catalog\source\color-tokens.html`, and the two font files and `LICENSE.txt` directly in `showcase_ui-catalog\client\assets\fonts\Inter-4.1\` (their copies are now in its `web\` folder). Fill in your name in `ui-catalog\LICENSE`. In the showcase: `npm run sync`.

## Delivery 117 — 2026-11-09: Testing — checks, contract test, test plans, integrity and release record

Showcase look: **unchanged**. The README pages read the same: the new Business analysis codes are hidden.

### Library (ui-catalog)

- `package.json` (new): commands `check`, `coverage`, `test`, `test:components`, `status`, `release`, `integrity:save`, `integrity:verify`, `integrity:restore`; the only dependency is Playwright, for the tests. The components still need nothing from it.
- `tools/` (new): `check.mjs` (static checks: files and roles, imports, console calls, error labels in code / catalog / README with severity, tokens and Styling contract, tables, Business analysis wording and codes, permanence), `coverage.mjs`, `contract.mjs`, `component-tests.mjs`, `integrity.mjs`, `release.mjs`, `server.mjs`, `lib.mjs`.
- `tests/contract/` (new): the shared contract test, one small valid configuration per component (`cases.js`).
- `tests/components/` (new): the harness and the test code of the pilot components (`copyArea.test.mjs`, `button.test.mjs`).
- `TESTING.md` (new): the mechanism in plain words: commands, what is stored where, the integrity loop, how to write a test plan, rules for people and AI tools.
- All 30 READMEs: each Business analysis line ends with its hidden code (`<!-- BA-07 -->`).
- `copyArea/copyAreaTESTS.md`, `button/buttonTESTS.md` (new): the first two test plans.
- `framework-component-development-guidelines.md`: the test plan file in §2, §14.1 "Test plan and automatic tests", codes in §15.1, test plan in the build order (§16), in changes (§17) and in the delivery checklist (§18, items the check covers marked ✓).
- `tests/00-component-test.js`: the README reader of the test pages hides the codes.

### Showcase app

- `app/markdown/markdownReader.js`: hides the codes at the end of README lines; `client/components/*` and `client/content/*` synced.

### Tested

- `npm run check`: 30 components, no findings (proved by planting three mistakes: a missing README label, a wrong severity, a line without a code — all three reported).
- `npm test`: 261 checks passed on 30 components; not applicable where a component has no such label (UNSAFE_ID in Button, CheckboxRadio, TextArea, TextInput; ids in Chip).
- `npm run test:components`: CopyArea 22 of 22 passed (proved by planting a regression: the "Copied" time changed from 2 to 5 seconds → T-10 fails); Button 19 of 20 passed — **T-11 fails**: `radius:'NONE'` gives 4 px corners, because the library stylesheet gives the radius options no rules although the README offers them (a decision for you).
- `npm run coverage`: CopyArea and Button fully covered; 28 components without a plan yet.
- Integrity and release on a copy of the library: save, verify (a styling change in part 1 not reported; changes in a JavaScript file and in part 3 reported), restore (both put back, the styling change kept); a release with all tests passing stored the fingerprints, `tests/published.json` and the report; a removed code was then reported as missing.
- Showcase: README pages show no codes; the guidelines page shows the quoted example code; all 30 README pages open without script errors.

### To install

Copy the files into the same places. In the library folder, once: `npm install` and `npx playwright install chromium`. In the showcase: `npm run sync`.

## Delivery 116 — 2026-11-04: Home page — "beta" mark, FAQs as an Accordion

Showcase look: **changed, approved** (decision 192): the header shows a handwritten blue "beta" next to the logo on every page; the Home page FAQs are an Accordion with short answers. Live examples are unchanged.

### Showcase app

- Header: `appShell.js` passes `APP_CONFIG.release` (`{ label:'beta', description:'Beta version', tone:'INFO' }`) as the AppHeader `environment`; `app.css` (overrides) shows it without the pill, in `--c-info` (primary blue), tilted, in the new app role `--font-hand` (`local-styling/design-system.css`: Segoe Print, Bradley Hand, Comic Sans MS, cursive). Screen readers hear "Beta version"; the mouse tooltip says it too.
- FAQs (`homePage.js`, `appConfig.js`): an Accordion (one open at a time) with the six questions; each opens a short answer and a Button with the .md file name (how-to-use-the-framework.md, framework-component-development-guidelines.md, how-to-build-a-design-system.md) that opens it on the document page. `index.html` loads `local-styling/accordion.css` (copied by `npm run sync`); the old FAQ Button styles are removed from `app.css`.
- `content/home.md`: "Native JavaScript components…".

### Tested

- Showcase (Playwright): the tagline reads "JavaScript"; "beta" next to the logo in blue (rgb 37, 99, 235), without background, named "Beta version"; the FAQ Accordion with six questions, the first opens its answer and the Button "how-to-use-the-framework.md", which opens #/framework, and Back returns Home; all README pages without script errors.

### To install

Copy the files into the same places and run `npm run sync` (it copies `accordion.css` into `local-styling`).

## Delivery 115 — 2026-11-04: TopNavigation — MEGA panel under its item; panel order

Showcase look: **changed, approved** (decision 191): the Products MEGA panel opens under Products; the Variants panel starts with `currentStyle` and no longer shows `tooltipMode`.

### TopNavigation

- MEGA panels open under their own item, like LIST panels (before: from the start of the navigation); when there is no room they are moved to end alignment; the panel is as wide as its columns, at most `--size-lg-4` (960 px) and the window. `topNavigation.css` in the library, `local-styling` and `showcase-styling`; Styling contract regenerated.

### Showcase app

- `adjustments/topNavigation.js`: order `currentStyle`, icons, badges, secondLevel; `tooltipMode` hidden.

### Tested

- Showcase (Playwright): the panel shows currentStyle, icons, badges, secondLevel; Products opens its MEGA panel at the left edge of Products (426 px, two columns as before), Team its list under Team; on the test page at 900 px the three-column MEGA panel stays inside the window; no script errors; script checks and `npm run check` with no issues for TopNavigation.

## Delivery 114 — 2026-11-04: TopNavigation — Variants panel and hover per current style

Showcase look: **changed, approved** (decision 190): the TopNavigation live example starts as a simple navigation, and the hover look of the three current-page styles changes (also in `showcase-styling`). Other pages are unchanged; the app does not use TopNavigation itself.

### TopNavigation

- Hover per `currentStyle` (`topNavigation.css` in the library, `local-styling` and `showcase-styling`):
  - `UNDERLINE`: a bar under the item in `--c-muted` instead of the hover background (the current item keeps its accent bar; "More" keeps its own look);
  - `PILL`: every top-level link and arrow button has the pill corners; links have wider side padding (`--space-md-3`), so the hover pill and the current pill have the same padding and corners;
  - `TAB`: links and arrow buttons have square bottom corners, like the tab.
- README: the Structure note on hover; Styling contract regenerated.

### Showcase app

- `adjustments/topNavigation.js`: `items` and `currentId` hidden; start: seven simple pages (Dashboard current); checkboxes "Show icons", "Show badges" (Approvals 3, Team 12), "Show a second level" (Projects list, Team groups, Products MEGA panel); panel order icons, badges, secondLevel, currentStyle, tooltipMode.

### Tested

- Showcase (Playwright): the panel shows icons, badges, secondLevel, currentStyle, tooltipMode; the example starts with seven plain items; each checkbox adds icons, the two badges, then the three panels; the Output shows the items sent. Hovering Reports: UNDERLINE a 2 px grey bar and no background; PILL the same 12 px side padding and pill corners as the current Dashboard; TAB a background with square bottom corners like the tab. Test page and all README pages without script errors; script checks and `npm run check` with no issues for TopNavigation.

## Delivery 113 — 2026-11-04: README pages — code blocks with Copy (CopyArea)

Showcase look: **changed on the README pages only** (approved, decision 189): every code block is a CopyArea with a Copy button, on the light CopyArea box (before: dark code blocks); diagrams such as Structure keep a plain block, now with the same light look; the language tab above a block takes the same look and joins the box. Code taller than 320 px scrolls inside its box. Live examples, component pages and the guide pages are unchanged.

### Showcase app

- `app/pages/documentPage.js`: on README pages, each code block (except blocks drawn with ├ └ │) is replaced by a CopyArea with the same text and name; the instances are destroyed with the page.
- `index.html`: loads `local-styling/copyArea.css` (copied by `npm run sync`, the library look).
- `app/app.css`: the dark code rules apply only to plain blocks (`.app-markdown-code > pre`); README diagrams and language tabs in the CopyArea look; overrides: the square corner under a language tab, and on paper (Download .pdf) the code wraps, is printed whole and has no Copy button.

### Tested

- Showcase (Playwright): Badge README: 3 code blocks with Copy (the import, an example, the example prompt), the Structure diagram without; Copy puts the exact code on the clipboard; Tab from a code block reaches its Copy button; Button 7, CopyArea 5, UploadFiles 7, Form 6 blocks with Copy, each with its diagram plain; moving between README pages leaves no duplicate ids; the guidelines page keeps its 7 plain blocks; print view: no Copy button, no height limit, long lines wrap; all 30 README pages open without script errors.

### To install

Copy the files into the same places and run `npm run sync` (it copies `copyArea.css` into `local-styling`).

## Delivery 112 — 2026-11-04: CopyArea page — no Examples section

Showcase look: **unchanged** for every other page; the CopyArea page no longer has the Examples section below the live example (approved, decision 188).

### Showcase app

- `adjustments/copyArea.js`: the `examples` and their sample removed.
- The Examples option `wide` (added in Delivery 111 for CopyArea only) removed: `customizationModel.js`, `previewIndex.js` and `preview.css` are back as before Delivery 111.

### Tested

- Showcase (Playwright): the CopyArea page shows the live example, the Output and the README, without "Typical variants"; the live example still copies; the Badge page keeps its examples; no script errors; `npm run check` with no issues for CopyArea.

## Delivery 111 — 2026-11-03: CopyArea — new component

Showcase look: **unchanged** for the existing live examples and pages. New: the CopyArea page (Basic components, keyword "actions"). The Variants panel starts with the panel-only option `shownContent` (TEXT: the text in the panel; CONTENT: a formatted sample reply whose internal note is left out of the copy). The Copy button really copies (the showcase runs on localhost); the Output shows `onCopy`. Examples: code (install command; a configuration with line numbers that scrolls) and single values (masked API key with the full key copied, IBAN copied without spaces with a text button, invitation link), one example per row. The README code blocks of the showcase are not changed (postponed, decision 187).

### CopyArea (new)

- `renderCopyArea(container, config, onCopy)`; instance `id`, `getElement`, `getError`, `setText`, `setCopyValue`, `getChildren`, `destroy`.
- `text` as code (`textStyle` `CODE`, default: fixed-width font in a light box, scrolls when taller than `--copy-area-max-height`; optional `lineNumbers`, not selected or copied; code stays left-to-right on right-to-left pages) or a single value (`PLAIN`: text font, the button right after it; can stand inside a sentence).
- `content`: a render function for formatted content; copied as plain text and HTML (pasting into a document keeps lists, links, bold text and tables; a plain field gets plain text with list numbers, tables with tabs), without hidden parts, buttons, fields and `[data-copy="skip"]`; only `[data-copy="only"]` when there are such parts.
- `copyValue`: copied instead of what is shown (a masked key, an IBAN without spaces).
- Copy button (Button, TERTIARY, SMALL): `copyButton` `ICON` (default; `tooltipMode` `TITLE`, `TOOLTIP`, `NONE`) or `TEXT`; after a copy "Copied" with a check for 2 s, announced, the focus stays on the button; `label` names the area and describes the button ("Copy, Install command"); texts `copy`, `copied`, `failed`, `region`.
- Refused copy (no clipboard access, e.g. a page not served over https): user error `COPY_FAILED` with the message "Couldn't copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.", announced; the content is selected (with `copyValue`: the value is written in the message and selected); cleared by the next successful copy. `onCopy({ copied, text, errorLabel? }, instance)` after every click.
- Developer errors `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID`, `CONTENT_REQUIRED`; warnings `OPTIONS_CONFLICT` (`text` and `content`), `INVALID_OPTION`, `OPTION_IGNORED`.
- New design tokens (library `design-system.css`, `local-styling` and `showcase-styling` copies): `--copy-area-bg` (`--c-surface-muted`), `--copy-area-color` (`--c-text`), `--copy-area-max-height` (`--size-md-3`, 320 px).
- Files: `copyAreaIndex.js`, `copyAreaConfig.js`, `copyAreaComponent.js`, `copyAreaHTML.js`, `copyAreaErrors.js`, `copyArea.css`, `copyAreaREADME.md`; test page `tests/copyArea.html` (configurator, examples of the business cases, a "simulate a browser that refuses the copy" box).

### Showcase app

- `adjustments/copyArea.js` (new); `showcase-styling/copyArea.css` (copy of the library file); `catalog-rules.json`: CopyArea in the keyword "actions"; `catalog.json` rebuilt.
- Examples: new group option `wide` (one example per row, as wide as the section) in `customizationModel.js`, `previewIndex.js` and `preview.css`; used only by CopyArea, so no other page changes.

### Tested

- Test page (Playwright, clipboard read back after each copy): code copied exactly (line breaks, indentation); "Copied" with a check, announced, back to "Copy" after 2 s, focus kept; Tab from the code area reaches the button, Enter copies; `copyValue` (API key, IBAN without spaces); a value inside a sentence; formatted reply: plain text with "1." and "2.", HTML with the list, link and bold text, internal note (`data-copy="skip"`) and screen-reader-only text left out; table (`data-copy="only"`): tab-separated plain text and the HTML table without the title; refused copy: message, content selected, announced, `getError()` `COPY_FAILED`, the button goes back to "Copy", message hidden after the next copy; with `copyValue` the value is written in the message and selected; line numbers not selected; `TOOLTIP` shows "Copy"; all developer warnings and errors; dark theme; right-to-left (button on the left, code left-to-right); a 380 px wide window without horizontal scrolling.
- Showcase: the CopyArea page, the live example copies and the Output shows `onCopy`; `shownContent` CONTENT renders and copies the sample reply (text options off); Examples one per row and the API-key example copies the full key; the Badge page keeps its examples layout; `npm run check` with no issues for CopyArea.
- Script checks (tokens, Styling contract, labels, console calls, Business analysis wording, tables) with no findings; all 30 README pages and 32 test pages open without script errors (the only console messages are the missing Inter font files of the local servers).

### To install

Copy the files into the same places; run `npm run sync` and `npm run catalog`. Load `copyArea.css` and `button.css` on pages with CopyArea (`tooltip.css` with `tooltipMode:'TOOLTIP'`), and the new tokens in `design-system.css`.

## Delivery 110 — 2026-11-03: Button page — link options last in Variants

Showcase look: **unchanged** for the live examples; only the order of the Button page's Variants panel changes (approved, decision 186).

### Showcase app

- `adjustments/button.js`: `show` lists the panel options in order, with `href`, `target` and `newTabIcon` last (after `tooltipMode`); the hidden options stay hidden.

### Tested

- Showcase (Playwright): the Button Variants panel shows buttonVariant, hierarchy, size, label, iconBefore, iconAfter, iconSize, width, minWidth, tooltipMode, href, target, newTabIcon in this order; an address turns the example into a link; no script errors; `npm run check` with no issues for Button.

## Delivery 109 — 2026-11-03: Button — links (href) and the LINK look

Showcase look: **unchanged** for the existing live examples with their default settings (approved changes, decision 185): the README button on every component page is now a link that looks the same and opens in the same tab (Ctrl / Cmd + click or "Open in a new tab" opens it in a new tab); the Button page's Variants panel has `href`, `target` and `newTabIcon` (`target` and `newTabIcon` only with an address); the Button "States" table has a fourth column, LINK. showcase-styling: `button.css` gets the LINK rules and the disabled-link selectors, `design-system.css` the link tokens; no existing value changed.

### Button

- `href`: the Button is rendered as `<a>` with the same classes plus `ui-button-as-link`; every hierarchy and both variants can be links.
- New hierarchy `LINK`: the look of a text link (`--c-link`, `--c-link-hover`, `--c-link-active`, `--c-link-visited`, `--c-link-disabled`, `--link-decoration…`, `--link-underline-…`, `--link-focus-…`), in the type and size of the text around it; icons before and after in the same size. Works with or without `href`.
- `target` `SAME` (default) or `NEW_TAB`; `NEW_TAB` adds `target="_blank"`, `rel="noopener"`, the hidden text "(opens in a new tab)" (`newTabText`) and, for a text link, the new-tab icon (`newTabIcon`, default on; an own `iconAfter` replaces it). Optional `download` (file name or `true`) and `rel`.
- Clicks: a plain click or Enter calls `onClick` before the page opens (`event.preventDefault()` stays on the page); Ctrl / Cmd / Shift / Alt + click, middle-click and the browser's menu keep the browser's behaviour and do not call `onClick`.
- Disabled link (`disabled`, `setDisabled()`): no `href`, `role="link"`, `aria-disabled="true"`, out of the tab order; `isDisabled()` and `getElement()` work for links.
- New warning `UNSAFE_HREF` (`javascript:`, `data:`, `vbscript:` refused); `OPTION_IGNORED` for `buttonType` with `href`, link options without `href`, `size` / `iconSize` with `LINK`. New export `BUTTON_TARGETS`.
- README: overview, when to use, key features, Structure, Visual options, Business analysis, Configuration, Callbacks, Errors, Accessibility, an example; Styling contract regenerated. Test page `tests/button.html` (new in ui-catalog/tests): `LINK`, address, target and new-tab icon options and a "Links" section.
- `design-system.css` (library and local-styling): the link-token note now says Button `LINK` uses them.

### Showcase app

- `componentPage.js`: the README button is `href:'#/component/{id}/readme'`, `target:'SAME'`.
- `adjustments/button.js`: `newTabText`, `download`, `rel` hidden; in the example a plain click on a same-tab link is reported (`onClick`) and then stopped, so the example does not leave the page.

### Tested

- Test page (Playwright): the README-like link (SECONDARY, SMALL, 34 px high like a button); text links inside a sentence take its 14 px size, underlined, link colour, darker and thicker underline on hover; icons before and after; `NEW_TAB` (`target="_blank"`, `rel="noopener"`, `rel="nofollow noopener"` with own `rel`, hidden text, new-tab icon, own icon replaces it, `newTabIcon:false`); icon link (`aria-label` "Source code (opens in a new tab)", Tooltip); `download`; plain click follows the address and calls `onClick`; the router link (`preventDefault`) stays; Ctrl + click opens a new tab without `onClick`; Enter calls `onClick`, Space does not; disabled link: no address, `role="link"`, `aria-disabled`, skipped by Tab, click does nothing, enable / disable again; `javascript:` refused with `UNSAFE_HREF`; the five visual states of a LINK.
- Showcase: the README button is `<a href="#/component/uploadFiles/readme">` with the same look; plain click opens the README page, Back returns; Ctrl + click opens the README in a new tab. Button page: `target` and `newTabIcon` off without an address, on with one; a `LINK` + `NEW_TAB` example renders the link with hidden text; a same-tab link click is reported (`onClick(PointerEvent(click), instance)`) and the example stays; the States table shows the LINK column in all five states; `npm run check` with no issues for Button.
- All 29 README pages and all test pages open without script errors (the only console messages are the missing Inter font files of the local servers).

## Delivery 108 — 2026-11-03: UploadFiles — new component; Form keeps files

Showcase look: **unchanged** for the existing live examples. New: the UploadFiles page (field "Attachments", PDF or images up to 10 MB; in AUTO a simulated server, 2 s per file, where a name containing "fail" fails). It has no Examples section: the Variants panel starts with `scenario`, which shows the four typical cases (not saved yet with the button only — the default —, not saved yet with the drop area, one saved file that the next one replaces, several saved files). UploadFiles appears under "Complex components" (Button and Loader) and the keyword "inputs". The Output writes `File` values as `File("name", size bytes)`.

### UploadFiles (new)

- `renderUploadFiles(container, config)`; a Form field (`name`, `getValue`, `setValue`, `validate`, `getError`, `setError`, `clearError`, `focus`, `getLabel`, `getLabelPosition`, `getMandatoryState`) plus `isDirty`, `getFiles`, `addFiles`, `removeFile`, `cancelFile`, `retryFile`, `isUploading`, `setDisabled`, `destroy`.
- `uploadMode` `FORM` (default: the value is the list of `File` objects) or `AUTO` (`upload(file, { onProgress, signal })` per file, `maxParallel` 3, a Loader bar and "Uploading 45%", Cancel, Retry; the value is `{ name, size, type, result }`).
- `layout` `BUTTON` (default) or `DROPZONE` (dashed area, highlighted while files are dragged over it); `multiple` (default) or one file that a new one replaces.
- Checks: `accept` (extensions and types), `maxFileSize`, `maxTotalSize`, `maxFiles`; a refused file is listed with its reason ("Larger than 10 MB.") and reported through `onFileRejected`; the same file is not added twice; the limits line ("PDF or images · up to 10 MB each").
- Files already saved: `initialFiles` / `setValue()` with `{ name, size, type, url, … }` (a link; other members such as `id` are kept in the value).
- Optional (off by default): `showPreviews` (image previews), `allowPaste` (Ctrl+V while the field has the focus), `camera` `BACK` / `FRONT` (phones; only when `accept` allows images).
- Errors: `REQUIRED` ("Add a file."), `UPLOADS_PENDING`, `UPLOADS_FAILED`, `EXTERNAL`; callbacks `onValueChange`, `onFileRejected`, `onUploadsComplete` (user actions only).
- Accessibility: the hidden file input is opened by the "Choose files" Button (named by the label, described by the limits, help and error); each file's buttons carry its name; focus moves to the next file after Remove; additions, removals and uploads are announced, refusals and failures at once.
- `tooltipMode` `TITLE` (default, full name of a cut-off file), `TOOLTIP`, `NONE`.
- Files: `uploadFilesIndex.js`, `uploadFilesConfig.js`, `uploadFilesComponent.js`, `uploadFilesHTML.js`, `uploadFilesEvents.js`, `uploadFilesFiles.js`, `uploadFilesState.js`, `uploadFilesErrors.js`, `uploadFiles.css`, `uploadFilesREADME.md`; test page `tests/uploadFiles.html`.

### Form

- Values with files: Form no longer copies values through JSON (a `File` became `{}`); files are kept as they are and compared by name, size, type and date for changes and unsaved data. README: `getValues()` row. Guidelines §10.1: UploadFiles in the list of inputs and the rule "Values are data".

### Tested

- Test page (Playwright): choosing two files (listed with icon, size, "2 files, 5.3 kB", announced); Remove moves the focus to the next file; limits (type, 1 MB, 3 files) refuse 4 of 5 files with their reasons and four `onFileRejected` calls; one file: a refused file keeps the previous one, an accepted one replaces it; `accept` and `capture="environment"` on the input; `validate()` shows "Add a file." and links it to the button, adding a file clears it; `setError()`; paste; drop (highlight while dragging); AUTO with three files at once (progress bars at 30%, then "Uploaded" and one "Not uploaded" with Retry), `UPLOADS_FAILED`, Retry (focus on Cancel), Cancel (focus on Remove, error gone), previews; `TOOLTIP`: the full name of a cut-off file and the Remove button's name.
- Inside a Form: the error summary "Receipts: Add a file.", `getValues()` with the `File`, submit receives the `File` (2000 bytes), not dirty after submit, Reset and Clear all empty the field.
- Showcase: the page, the Output (`File("invoice.pdf", 20000 bytes)`, callbacks), AUTO with DROPZONE, `TOOLTIP`; the four `scenario` cases (button; drop area; one saved file, replaced after choosing "new-contract.pdf", `maxFiles` and `maxTotalSize` off; two saved files); no Examples section; `npm run check` with no issues for UploadFiles.
- Script checks (tokens, Styling contract, labels, console calls, Business analysis wording, tables) with no findings for UploadFiles and Form; all 29 README pages and 29 test pages open without script errors (the only console messages are the missing Inter font files of the local test server).

### To install

Copy the files into the same places; run `npm run sync` and `npm run catalog`. Load `uploadFiles.css`, `button.css` and `loader.css` on pages with UploadFiles (`tooltip.css` with `tooltipMode:'TOOLTIP'`).

## Delivery 107 — 2026-11-03: Tooltip — new component; `tooltipMode` in Button and 18 components

Showcase look: **unchanged** for the existing live examples: every `tooltipMode` default keeps the current behaviour. New: the Tooltip page (an icon button "Save" with its tooltip and shortcut), and `tooltipMode` in the Variants panels of Button (icon button) and the 18 components. Tooltip appears under "Basic components" (no dependency).

### Tooltip (new)

- `renderTooltip(container, { target, text })` for one element, or `{ targets:{ within, selector, text? } }` for a group (all cut-off names of a list); the container goes next to the target, never inside a button or link.
- Shows after 500 ms under the pointer, at once on keyboard focus and when moving from one tooltip to the next; one at a time; stays while the pointer is on it; Escape hides it (focus stays); a click on the target hides it; `onlyWhenTruncated`.
- `placement` TOP (default), BOTTOM, START, END — moves to the other side when there is no room and stays inside the window; drawn above everything (a popover), never cut off by tables or panels; arrow; `tone` INVERSE (default) or SURFACE; `shortcut` ("Ctrl+S"); `longPress` on touch screens (off by default).
- Accessibility: `purpose` DESCRIPTION (`aria-describedby`, default) or LABEL (`aria-labelledby`, for icon-only controls); groups are visual only; WCAG 1.4.13 (hoverable, dismissible, persistent).
- Files: `tooltipIndex.js`, `tooltipConfig.js`, `tooltipComponent.js`, `tooltipPosition.js`, `tooltipEvents.js`, `tooltipHTML.js`, `tooltipErrors.js`, `tooltip.css`, `tooltipREADME.md`; test page `tests/tooltip.html`.

### `tooltipMode` (NONE | TITLE | TOOLTIP)

- **Button:** for icon buttons, default `NONE`: `TITLE` adds the browser's tooltip (`title`) with the button's name; `TOOLTIP` adds a Tooltip that names it (LABEL). A text button ignores it.
- **Components with hints** (default `TITLE`, as before): AppHeader (help and settings links, environment, user link; passed to its Badge, Notification, NotificationsPanel, Breadcrumbs, and as `TOOLTIP` to the search, navigation and announcement buttons), Badge (name and description), Breadcrumbs (labels, the sibling buttons and the "…" menu), Calendar (exact date of a relative date, highlighted days, the navigation and calendar buttons), Notification (a clickable notification's label), NotificationsPanel (the bell), SideNavigation (entries in the rail, after the entry; its buttons), Stepper (hidden labels; icon actions), Table (cut-off cells; icon selection actions). Their icon buttons get a Tooltip only with `TOOLTIP`.
- **Components with icon buttons only** (default `NONE`): Accordion (passed to its panels), ActionMenu (menu button), CollapsiblePanel (icon actions), Message (close, icon actions), Pagination (arrows), SearchBox (clear, icon search button), TextInput (password toggle, icon action), TopNavigation (menu button), TreeView (tools, icon actions, and new: cut-off names).
- With `TOOLTIP`: cut-off text shows its tooltip only when it is cut off; the Tooltip code is loaded only then (an optional dependency, so menu groups do not change); load `tooltip.css`.
- READMEs: a Configuration row, the Tooltip dependency, a Business analysis statement and the new export (`X_TOOLTIP_MODES`) in each; Button's Structure.

### Guidelines and guides

- `framework-component-development-guidelines.md`: §12 the `tooltipMode` rule; §13 the canonical helpers (configuration wrapper, `hintAttribute`, `setHint`, `attachHintTooltip`) and `buildActionButtonConfig()` with a `tooltipMode` parameter (all six copies updated).
- `how-to-use-the-framework.md`: Tooltips.

### Tested

- Tooltip test page (Playwright): hidden at 250 ms, shown at 600 ms, centred 7 px above the button; stays with the pointer on it; Escape hides it and focus stays; the next button's tooltip shows at once and on the END side; Tab shows it at once; a short name shows nothing and a cut-off name shows its full text (`onlyWhenTruncated`); an `aria-disabled` button gets its tooltip; a click hides it; LABEL sets `aria-labelledby`, DESCRIPTION `aria-describedby`; SURFACE, long text wrapping, dark theme.
- Library harness: Table cut-off cell (shown) and a cell that fits (not shown), TreeView cut-off name, SideNavigation rail entry (after the entry), Stepper hidden labels — each in `TOOLTIP`, `TITLE` (`title`) and `NONE` (nothing).
- Showcase sweep of Button, Tooltip and the 18 components: defaults unchanged (same `title`s, no icon titles, no tooltips); `TITLE` adds `title` where documented; `TOOLTIP` replaces every `title` with a tooltip and shows it on hover ("Delete item", "More actions for order 1042", "Other countries", "Choose date", "Close message", "Notifications", "Previous page", "Collapse navigation", AppHeader "Help", the user name "Your profile and settings", the NotificationsPanel bell "Notifications"); hints inside a nested component are shown by that component (one tooltip, never two); no console errors; `npm run check` with no issues for the new options.
- Script checks (tokens, Styling contract, labels, console calls, Business analysis wording, tables) show no new findings; all 28 library test pages and README pages open without console errors.

### To install

Copy the files into the same places; run `npm run catalog`. Load `tooltip.css` on pages that use `tooltipMode:'TOOLTIP'` or Tooltip.

## Delivery 106 — 2026-11-03: Loader in Table, Form, Stepper and TreeView

Showcase look: **changed, approved** for the live examples of Table (server mode: line under the header, rows dimmed while a page loads), Form (a ring with "Saving…" before the buttons while it saves), Stepper (a line above the button bar while a step is checked) and TreeView (a ring next to a loading parent). Nothing changes at rest: the Loaders appear only after 0.4 s of waiting. The `showcase-styling` and `local-styling` copies of the four stylesheets received the same changes (their own lines kept). Stepper now appears under "Complex components" (two dependencies: Button, Loader).

### Table

- While data loads (server pages, `setLoading()`): an EDGE Loader line runs under the column header (sticky below it); the rows already shown stay, dimmed and inert, until the new rows arrive. The first page still shows the "Loading…" row (with the line). The line hides when the rows, an error or an empty result arrive.
- New: a progress row in `thead` (`tr.ui-table-progress`, no height), `.ui-table-loading` on the root, `--ui-table-head-height` (measured). README: dependencies, structure, states, business analysis, accessibility, Styling contract.

### Form

- New option `busyIndicator`: `BUTTONS` (default) — a small ring with "Saving…" (`texts.busy`) before the buttons while the form is busy (a pending `onSubmit`, `setBusy(true)`); `OVERLAY` — a Loader layer over the form that also blocks it (panel at the top, focus into the layer and back); `NONE` — only the disabled main button, as before. New export `FORM_BUSY_INDICATORS`; the README's import line now also lists `FORM_REQUIRED_NOTES` (it was exported but missing there).

### Stepper

- With `canLeave`: a SMALL line just above the button bar while the answer is pending (label "Checking the step…", `texts.checking`, for screen readers). "When to use" points to Loader for the progress of a single action.

### TreeView

- A small ring at the end of a loading parent's row instead of the visible "Loading…" (the text stays for screen readers as the item's description); rebuilt rows get their ring back.

### Message

- "When to use" points to Loader for an action that is still running.

### Showcase

- Form example: Submit is reported, then the form saves for 1.5 s; `busyIndicator` in the Variants panel. Stepper Variants: "Check each step (1.5 s)". Table: choose server mode in the Variants to see the line.

### Tested

- Library test pages (Playwright): Table server mode — first page "Loading…" row with the line, next page keeps the 25 rows dimmed (opacity 0.65) and inert with the line 0 px under the header, line hidden after the data; Form — ring and "Saving…" before Submit after 0.4 s, Submit does not move, the form keeps its height at rest with each `busyIndicator`; `OVERLAY` blocks the form (inert fields, `aria-busy`), focus goes into the layer and back to the first field; Stepper — no Loader without `canLeave`; with a 0.6 s check the line shows 4 px above the bar, the bar does not move, the line hides after the answer; TreeView — ring after 0.4 s, "Loading…" visually hidden but kept, ring gone after the minimum time, the load error still shown as text.
- Script checks for Table, Form, Stepper, TreeView, Message and Loader: tokens exist and are in the Styling contract, error labels used, no console calls outside the error files, Business analysis wording, table columns; library and showcase copies identical; the 27 library test pages and README pages open without console errors.
- Showcase: Table (server mode, reload by sorting: rows dimmed, line shown), Form (ring; `OVERLAY` blocks the form), Stepper ("Check each step": line, then the next step opens), TreeView renders; Loader page lists "Used by: Form, Stepper, Table, TreeView"; `npm run check` reports no issues.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 105 — 2026-11-03: Loader — new component; two design tokens; Styling contract group correction

Showcase look: **unchanged** for the existing live examples. New: the Loader page (live example with its own stylesheet `showcase-styling/loader.css`, Variants, Examples, README). Loader appears under "Basic components" (one dependency, Button) and under the keyword state. The two new design tokens are added to both showcase copies of `design-system.css`; no existing component uses them.

### Loader (new)

- **Indicator:** a bar (default) or a ring, `SMALL`, `MEDIUM` or `LARGE`; progress unknown (a band that grows and shrinks along the bar, or a turning arc) until the application gives a value, then filling; the value as "45%", "12 of 30" or the application's own text (`valueText`); label above, below, after the indicator or hidden (`labelPlacement`).
- **Timing:** appears after `showDelayMs` (400; quicker actions never show, a failure always does), stays at least `minVisibleMs` (600), hides `hideAfterMs` (1500) after done or cancelled; a failure stays until `hide()` or `start()`.
- **End statuses:** done, failed, cancelled — symbol, colour and text (`setStatus`); `track(promise)` sets done or failed by itself.
- **Placement:** `INLINE` (in the page), `EDGE` (a thin line along the top of a region, taking no space), `OVERLAY` (covers a region: blocks the mouse, the keyboard and screen readers from the start, also for content added meanwhile; dims it after the delay; panel in the middle or at the top of the visible part, `indicatorPosition`; focus into the layer and back).
- **Cancel** (`cancellable`, `onCancel`): reported to the application, which ends the action with `setStatus('CANCELLED')`.
- **Screen readers:** a progress bar named by the label; the label when it appears, the progress every quarter (`announceEvery`) and the end are announced; a failure interrupts.
- Files: `loaderIndex.js`, `loaderConfig.js`, `loaderComponent.js`, `loaderState.js`, `loaderHTML.js`, `loaderErrors.js`, `loader.css`, `loaderREADME.md`; test page `tests/loader.html` (a sample orders region; start, progress, track resolved / rejected / quick, done, error, hide; every option; tall region; narrow; right-to-left).
- Showcase: `adjustments/loader.js` (Variants: shape, size, placement, label placement, value text, value, Cancel, panel position, label; EDGE and OVERLAY cover a sample region; after Cancel the example shows "Cancelled" and starts again; Examples: shapes and sizes, texts), `catalog-rules.json` keyword.

### Design system

- `--progress-sweep-duration` (motion: one sweep of an indeterminate bar) and `--scrim-bg` (the layer over a busy region, mixed from `--c-page`, so it follows the dark theme). `how-to-build-a-design-system.md` lists them.

### Styling contract correction (2 READMEs)

- `--spinner-duration` moves from "Sizes" to "States and motion" in SearchBox and Toggle (tokens ending in `-duration` are motion).

### Guides

- `how-to-use-the-framework.md`: Loader's Cancel among the built-in buttons.

### Tested

- Library test page (Playwright): nothing visible before `start()`; a 0.2 s action never appears; after `start()` hidden at 200 ms, shown at 550 ms with the label announced; progress 0→100 with `aria-valuenow` / `aria-valuetext`, then "Report exported", hidden after 1.5 s; a rejected `track()` shows the failure in red and announces it assertively, and it stays; Cancel is disabled after the click, reported once, then "Cancelled"; OVERLAY: from the first moment the region has `aria-busy`, its content is inert, a click on its button hits the layer and focus moves from the filter field into the layer, then to Cancel when shown; content added while blocked is inert too; at the end focus returns to the filter field and nothing stays inert; `destroy()` while blocking releases the region; TOP keeps the panel at the top of a scrolled 40-row region; EDGE is a 4 px line on the region's top edge; all shapes, sizes and label placements, the three end statuses, right-to-left, dark theme, reduced motion (still bar, ring stops); every developer error and warning (including an invalid target and a positioned element between container and target).
- Script checks: every token exists in the design system, every stylesheet token is in the Styling contract and nothing else, every error label is used and documented, no console calls outside the error file, Business analysis statements use only listed roles and verbs, Markdown tables pass the column check; library and showcase copies identical.
- Showcase: the Loader page with Variants (bar, ring, sizes, value, OVERLAY on the sample region with the filter blocked, EDGE, Cancel reported in the Output and the example restarting), the Examples section and the public state (`getState()`) in the Output; `npm run check` reports no issues for Loader; all 27 README pages show every section without console errors.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 104 — 2026-11-02: Stepper — new component; Styling contract correction

Showcase look: **unchanged** for the existing live examples. New: the Stepper page (live example with its own stylesheet `showcase-styling/stepper.css`, Variants, README). Stepper appears under "Basic components" (one dependency, Button) and under the keywords containers, navigation and state.

### Stepper (new)

- **Steps:** label, description, icon, status, optional, disabled, `after` (the steps it waits for); marker number, icon or dot; label after the marker, below it (horizontal) or hidden (tooltip); lines between steps; status text on screen (`statusText`) or for screen readers only.
- **Statuses:** not started, in progress, done, skipped, needs attention, has errors, blocked, cancelled — the consumer keeps the ones it needs (`statuses`); a symbol in the marker and a colour for each; set by the application (`setStepStatus`) or automatically (`autoStatus`: Next/Finish → done, Skip → skipped, a step the user opens → in progress).
- **Navigation:** LINEAR (default; with `after` rules several steps open together — parallel steps — and "Available after: …" tells what a step waits for), FREE, or NONE (informative: no buttons, no clicks, e.g. order tracking).
- **Moving:** Back, Skip (optional steps), Next, Finish (last enabled step; disabled while a required step is not complete); clicks on open steps; arrow keys, Home and End between steps; `canLeave(stepId, action)` before Next and Finish, also as a Promise (the Stepper is busy meanwhile); the new step is announced.
- **Content** (`showContent`, off by default): one panel per step, rendered at start and kept; beside or below the steps, or under the current step (vertical, `INLINE`); focus moves into the panel after a move. Button bar (`showButtons`, on with the content) with the application's own `actions` (§10.2).
- **Narrow containers:** horizontal steps become a compact bar "Step 2 of 5: Payment" with a progress line (`compactWhenNarrow`, below 36rem).
- Files: `stepperIndex.js`, `stepperConfig.js`, `stepperComponent.js`, `stepperState.js`, `stepperHTML.js`, `stepperEvents.js`, `stepperErrors.js`, `stepper.css`, `stepperREADME.md`; test page `tests/stepper.html` (Checkout, Approval with parallel reviews, Order tracking; every option; canLeave with a server delay; right-to-left; narrow).
- Showcase: `adjustments/stepper.js` (Variants: scenario, navigation, orientation, marker, label placement, lines, status text, content and its position, buttons, descriptions, a "Save draft" action), `catalog-rules.json` keywords.

### Styling contract correction (17 READMEs)

- A part styled always and also in some options or states now reads `marker (also current)`; delivery 103 showed only `marker (current)` there, which hid the always-on use. Corrected in AppHeader, Breadcrumbs, Button, Calendar, Chip, CollapsiblePanel, ContentGroup, Message, Notification, SearchBox, Select, SideNavigation, Table, TextArea, TextInput, Toggle and TopNavigation; the rule is in guidelines §15.

### Guidelines and guides

- `framework-component-development-guidelines.md`: §10.2 names Stepper's current step as an action context; §15 the "(also …)" form.
- `how-to-use-the-framework.md`: Stepper among the components with built-in buttons and application buttons.

### Tested

- Library test page (Playwright): Checkout — Next marks done and opens the next step, Back, Skip on the optional step, Finish; Approval — after "Request" three reviews open together, Next passes over complete reviews to the one still to do, Sign-off opens only when all reviews are complete, Finish then reports; canLeave with a 0.6 s answer (busy, refused once with the error status, accepted the second time); FREE, NONE (no buttons, plain entries); horizontal and vertical, number / icon / dot markers, labels after, below and hidden; content separate, beside (vertical) and inline; compact bar at 420px; right-to-left; arrow keys (mirrored in right-to-left, Up / Down when vertical), Home, End; announcements; developer warnings for empty steps, duplicate and invalid steps, unknown and circular `after` rules, unknown statuses, options that do not apply, a failing canLeave, actions without onAction.
- Script checks: every error label is used and documented, no console calls outside the error file, Business analysis statements use only listed roles and verbs, every stylesheet token is in the Styling contract, Markdown tables pass the column check; library and showcase copies identical.
- Showcase: the Stepper page renders with the Variants panel (scenario, navigation, layout, content, actions), the Output shows the configuration and the callbacks; the README page shows all sections; `npm run check` reports no issues for Stepper; the 26 library test pages show their README without errors.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 103 — 2026-11-02: README "For designers" — States, Styling contract by part; Contracts line

Showcase look: **unchanged** for the live examples. Only README text and guides change; the README pages show the new subsections.

### README "For designers" (all 25 components)

- **Visual options:** one column header everywhere, "CSS class or attribute"; only what the Consumer chooses.
- **States (new):** what the component shows at run time (open, current, selected, checked, unavailable, invalid, busy, loading, empty…), moved out of Visual options; "No states of its own." when there are none (Accordion, Badge, Button, Chip, Notification).
- **Styling contract** replaces the "Design tokens" table and the five rule tables (TextInput, TextArea, Select, Calendar, Notification):
  - a standard paragraph (how to restyle with `@layer overrides`, how the parts are named), plus the component's own note where there is one (disabled fields inside a `fieldset`, TextInput height);
  - the tokens of each stylesheet part — **1. Appearance — change freely**, **2. Dimensions — change with care**, **3. Structure — don't change** — grouped by scope (Colours, Typography, Borders and corners, Shadows, States and motion, Spacing, Sizes), each followed by the parts it styles (class names as in Structure; option or state in brackets);
  - **Set by the component — don't change:** the `--ui-…` variables the code writes (e.g. TreeView `--ui-tree-view-level`, Select list position);
  - **Used by the code:** design tokens the JavaScript names (e.g. Table column widths, Select option colours, Toggle track colours).
- Corrected on the way: lists generated from the current stylesheets, so old table entries are gone (e.g. Badge listed `--fw-bold`, now `--fw-ui-strong`; the TreeView label-on-the-left selector was split in two rows).

### README "For developers" (all 25 components)

- **Contracts (new, right after Business analysis):** one line — Styling: three parts · Form field (yes / yes, when … / coordinates the fields / no (container) / no) · Actions (yes with the members / through each panel / no) · Shared behaviour: yes, additions under Accessibility.
- CollapsiblePanel and TreeView: the last row of the Callbacks table was cut off by an empty line and showed as text; joined to the table.

### Guidelines and guides

- `framework-component-development-guidelines.md`: §12 new rule **Three parts (styling contract)**; §15 designer layer (Visual options, States, Styling contract), developer layer (Contracts), the Styling contract and Contracts formats (replace the Design tokens table rule); §18 three new delivery checks.
- `how-to-use-the-framework.md`: the README layout mentions Contracts and the Styling contract.
- `how-to-build-a-design-system.md`: §6 points to the Styling contract.

### Tested

- Script checks: every token used in each stylesheet is listed in its README Styling contract (25 of 25); every README has one States, one Styling contract and one Contracts subsection and no Design tokens table; all Markdown tables pass the column check (READMEs and guides).
- Showcase (Playwright): the 25 README pages show Structure, Visual options, States, Styling contract, Business analysis and Contracts, with the token lists nested and no table text left as a paragraph; component pages still show "When to use | Key features | Dependencies" and the live example; the guidelines, framework and design-system pages show the new rules; no page errors.
- Library test pages (25): the README section shows States, Styling contract and Contracts, with no page errors.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 102 — 2026-11-02: README structure for all 25 components — business summary, When to use, Business analysis, shared behaviour

Showcase look: **unchanged** for the live examples. The component pages now show the README sections "When to use", "Key features" and "Dependencies" (were "Features" and "Dependencies"). This delivery replaces delivery 101 (not installed): it contains its app changes and a new TreeView README.

### README layout (all 25 components)

- **For business:** Overview (one or two sentences), **When to use** (new: when to choose the component and which one to choose instead), **Key features** (three to seven specific capabilities, most important first), Dependencies, Not included. Overviews of Pagination, TextArea and TopNavigation shortened to two sentences.
- **For developers → Business analysis** (new, first subsection): the complete behaviour as statements — a role (User, Component, Consumer, App), then a verb from the fixed list, one fact each; dependent statements indented; grouped by function under bold lines; "(optional)" and "(optional, on by default)"; the roles defined in a block quote under the heading (small and muted in the app).
- **Shared behaviour removed from the READMEs:** keyboard, focus, screen readers, translation, right-to-left, reduced motion, container widths and, for inputs, the label / help / "(Optional)" / "*" and error-timing behaviour. Component-specific additions stay (e.g. "Keyboard additions" in ActionMenu, Accordion, TreeView).

### Guidelines and guides

- `framework-component-development-guidelines.md`: new **§11.1 Shared behaviour (every component)**, including input components; **§15** layer table (When to use, Key features, Business analysis; Accessibility lists only additions); new **§15.1 Business analysis** (roles and their standard definitions, the verb list per role, statement, indentation and grouping rules); §16 design point 14 (shared behaviour); §18 delivery checks for the README layout and the shared behaviour.
- `how-to-use-the-framework.md`: new "What every component does" in §1 and how the READMEs are organised.

### App (showcase)

- `componentPage.js`: README parts "When to use", "Key features", "Dependencies".
- `app.css`: the role-definition block quote of a component README is small and muted (`--fs-caption`, `--c-muted`) on the component page and the README page; `documentPage.js` marks component READMEs with `app-readme-content` (guides keep the normal block-quote look).

### Tested

- Every README: one Business analysis, When to use and Key features present; Key features 3–7, When to use 2–4; every statement starts with a role and a listed verb and ends with a full stop (script check); Markdown tables pass the column check (READMEs and guidelines).
- Showcase: all 25 component pages show "When to use | Key features | Dependencies"; Table README page shows the role definitions at 12px; the guidelines page shows §11.1 and §15.1; library test pages render the READMEs without errors (their simple reader shows sub-statements flat).

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 101 — 2026-11-02: README Features in statement form — TreeView pilot

Showcase look: **unchanged** for the live examples; in the app, the role definitions under a README's "Features" heading are small and muted.

- `treeViewREADME.md`, "Features" rewritten as statements: each starts with a role (User, Component, Consumer, App) and a verb, sub-statements are indented under the statement they depend on, and the statements are grouped by function (Browsing, Selection, Search, Loading on demand, Editing, App actions, Form field, Accessibility). Optional features are marked "(optional)". The roles other than User are defined right under the heading, in a block quote.
- App: `app.css` shows that block quote small and muted (`--fs-caption`, `--c-muted`) on the component page and on the README page; `documentPage.js` marks a component README with the class `app-readme-content` (guides keep the normal block-quote look).
- Note: the library test pages' simple README reader shows the sub-statements as a flat list (test infrastructure only).

### Tested (Playwright)

- Component page: Features with the role definitions (12px, muted, no bar), groups and nested statements; README page: the same definitions; library test page: README renders without errors.

### To install

Copy the files into the same places.

## Delivery 100 — 2026-11-02: CheckboxRadio — segmented control look (`presentation:'SEGMENTED'`)

Showcase look: **unchanged** (the CheckboxRadio live example keeps NATIVE; SEGMENTED is a new choice in Variants).

- New value `SEGMENTED` for `presentation`: the options form one row of joined segments (e.g. "List | Grid | Board", "Day | Week | Month"). SINGLE uses radios (one segment selected), MULTIPLE checkboxes (several pressed); the native inputs stay (visually hidden), so keyboard, screen readers, required checks, errors and Form behaviour are unchanged.
- Look: a thin frame with `--radius-control`; the lines between segments are the frame's background (`--c-border`) through a `--border-thin` gap, so they mirror correctly in right-to-left; segments `--control-height` high, `--gap-toolbar` side padding; hover `--c-surface-hover`; selected segment `--c-accent` fill, `--c-on-accent` text and a bold label (not colour alone); disabled options with the usual reduced opacity; the focus ring is drawn inside the segment.
- Always one row: `direction` does not apply (`OPTION_IGNORED` when given); the row does not wrap — the README recommends a few short options.
- Files: `checkboxRadioConfig.js`, `checkboxRadioHTML.js` (header comment), `checkboxRadio.css` (library, `local-styling`, `showcase-styling`), `checkboxRadioREADME.md` (features, structure, visual options, tokens, configuration), `tests/checkboxRadio.html` (Segmented choice; Direction row disabled with it).

### Tested (Playwright)

- Library test page: SINGLE (radios; one selected segment filled, arrow keys move the selection), MULTIPLE (checkboxes; several pressed), disabled option, keyboard focus ring inside the segment, right-to-left (order and lines mirrored), `OPTION_IGNORED` for `direction`; no other warnings.
- Showcase: Variants offers SEGMENTED, direction becomes inactive, the live example renders as a segmented control; no warnings.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 99 — 2026-11-02: One contract for buttons inside components (guidelines §10.2)

Showcase look: **changed slightly, as approved** — the space between Buttons of one group is now `--gap-inline-items` everywhere: Table selection actions and selection links, CollapsiblePanel header buttons, TreeView toolbar and Calendar's Today / Clear / footer / quick-range groups widen from `--gap-tight` (app 4px → 6px; live examples 4px → 8px, the original token values). Message and Form already used it. Nothing else changes visually.

### Breaking changes (no application uses UI Catalog yet; consumer action listed)

- **CollapsiblePanel:** `buttons` (Button configurations) is **replaced** by `actions:[{ key, label, icon?, iconOnly?, hierarchy?, disabled? }]` + `onAction(key, instance)`; Button ids are generated (`{id}-action-{index}`), TERTIARY by default. `buttons` is ignored with `OPTION_IGNORED`. Markup: `.ui-collapsible-panel-buttons` / `.ui-collapsible-panel-button-host` → `.ui-collapsible-panel-actions` / `.ui-collapsible-panel-action`. Accordion items follow (they are panel configurations).
- **TextInput:** `iconArea.addIconButton` and `iconArea.iconButton.{icon, ariaLabel, onClick}` are **replaced** by `actions` (at most one, always icon-only, `icon` required, named by `label`) + `onAction(key, instance)`; `texts.iconButtonFallback` removed; labels `ICON_BUTTON_ICON_MISSING`, `ICON_BUTTON_LABEL_MISSING`, `ICON_BUTTON_CLICK_MISSING` retired. `iconArea.staticIcon` stays (`OPTIONS_CONFLICT`: the action wins).
- **Table:** Button ids of selection actions are now `{id}-action-{index}` (were `{id}-action-{key}`).

### Unified in every component with application buttons (Message, Table, CollapsiblePanel, TreeView, TextInput)

- Item shape `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }` (Message keeps its own extension `cancel`), callback `onAction(key, context?, instance)` (Table: `selectionActions` / `onSelectionAction(key, selection, table)`), new method `setActionDisabled(key, disabled)`.
- Same normalization (canonical `normalizeActions()` and `buildActionButtonConfig()`, copied identically) and warnings: `INVALID_ACTION`, `DUPLICATE_ACTION_KEY`, `UNKNOWN_ACTION`, `ACTION_HANDLER_MISSING` (Buttons disabled without a callback, except a MODAL Message, which closes), `INVALID_OPTION` (hierarchy), `INVALID_ICON_CLASS`, `OPTION_IGNORED` (`iconOnly` without icon).
- New for Message: `icon`, `iconOnly`, `disabled`, duplicate check, validated hierarchy, `setActionDisabled`. Table: warnings, `iconOnly`, `disabled`, `setActionDisabled`. TreeView: `hierarchy`, `disabled`, `setActionDisabled`.
- Fix found while testing: CollapsiblePanel reported `INVALID_OPTION` for `headingLevel:undefined` (a missing value now takes the default silently, as the guidelines require).

### Guidelines

- `framework-component-development-guidelines.md`: new **§10.2 Buttons inside components** (owned buttons vs application actions, the contract table, presentation rules, single slots, implementation); §10 pass-through example no longer cites buttons; shared labels (§8), spacing (§12), canonical helpers (§13), new-component checklist item 14 (§16), delivery check (§18).
- `how-to-use-the-framework.md`: new "Buttons inside components" in §7, with an example.
- `how-to-build-a-design-system.md` and `design-system.css` (library, local-styling, showcase-styling; comment only): `--gap-inline-items` is also the space between Buttons of one group.

### Showcase

- Variants: CollapsiblePanel "Add button" and TextInput "Show an action button" now use `actions`; pressing is reported as `onAction` in the Output.
- Test pages updated/added in `ui-catalog/tests`: collapsiblePanel (Edit, icon-only Delete, primary Save), accordion (Rich headers), message (an icon on Undo), textInput (action inside the field).

### Tested (Playwright)

- Library test pages (message, table, collapsiblePanel, accordion, treeView, textInput, calendar, form): no page errors, no unexpected warnings (the only 404 is the Inter font file, as before).
- Every warning of the contract, in each of the five components, with invalid, duplicate, icon-less `iconOnly`, invalid hierarchy, missing callback and unknown key; TextInput: two actions, an action without icon, conflict with `staticIcon`; `setActionDisabled` returns and disables.
- Panel: tertiary Edit, icon-only Delete, primary Save, ids `{id}-action-n`, onAction without opening or closing, gap 6px. TextInput: action named by its label, onAction. Table: actions shown with a selection, gap. Message: icon on Undo. Accordion: item onAction.
- Showcase: CollapsiblePanel, TextInput, Message, TreeView report `onAction` in the Output; Table selection actions; no warnings; library and showcase copies identical.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 98 — 2026-11-02: TreeView — application actions and the current-item API

Showcase look: **unchanged** (the TreeView live example starts without actions; "Add actions" in Variants is unticked).

### New in TreeView

- **`actions`** `[{ key, label, icon?, iconOnly? }]`: the application's own Buttons at the start of the toolbar (also without `editable`), acting on the current item; `iconOnly` shows only the icon, the label becoming its accessible name. With editing on, a thin separator divides them from the editing tools. Each Button's description names the current item.
- **`canAct(key, item, instance) → boolean`**: makes an action unavailable for some items (e.g. Print for folders); unavailable items never allow actions.
- **`onAction(key, item, instance)`**: an action was pressed. The application does the work (open, view, print…).
- **`getCurrent()`** returns the current item (the framed one); **`onCurrentChange(item, instance)`** reports user changes of it (click, keyboard, search, closing a parent, edits), never programmatic ones (`reveal`, `setItems`, `filter`, `collapse`, `collapseAll`).
- Warnings `INVALID_ACTION` (no key or label) and `DUPLICATE_ACTION_KEY`; `canAct` / `onAction` without actions and `iconOnly` without an icon give `OPTION_IGNORED`.
- Files: `treeViewConfig.js`, `treeViewErrors.js`, `treeViewHTML.js`, `treeViewComponent.js`, `treeViewIndex.js` (header), `treeView.css` (separator; library and `showcase-styling`), `treeViewREADME.md`, `tests/treeView.html` (option "actions: Open, Print", `getCurrent()` in the status).

### Showcase

- `client/adjustments/treeView.js`: new panel checkbox **Add actions** (unticked): Open and an icon-only Print, Print only for files (canAct); `onAction` and `onCurrentChange` appear in the Output.

### Tested (Playwright)

- Library test page: toolbar order (actions, separator, editing tools); Open and Print on a file, Print unavailable on a folder (canAct), both unavailable on a disabled item; onAction reports key and item; onCurrentChange on click, arrow keys and after a delete; `reveal()` changes the current item silently; NONE: onCurrentChange with onActivate; no warnings.
- Showcase: default example has no toolbar; with Add actions, Open / Print render, Print off on "Invoices", Open reported as onAction with the item, onCurrentChange in the Output; no warnings.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 97 — 2026-11-01: TreeView — the current item is always framed; checkboxes tick only from the box

Showcase look: **changed for TreeView only** (approved: "always"): the selected item of the live example now also has a thin frame. No other component changes.

- **Current item** — the one last clicked or reached with the keyboard, which Tab reaches and the toolbar, F2 and Delete act on — has a thin accent frame (`.ui-tree-view-current`, inset 1px `--c-accent`) in every selection mode, editable or not. With SINGLE the selected item is usually also the current one (fill + frame). Drop markers replace the frame while dragging.
- **MULTIPLE:** a click on the item's name (or icon) only makes it current; a click on the box ticks it (and makes it current); the box has a larger click area (4px around it). Keyboard: Space ticks; Enter only keeps the item current. Value changes only through the box or Space.
- **Toolbar:** every Button's description names the current item (screen readers: "Rename, Invoice 01.xlsx").
- Files: `treeViewComponent.js`, `treeViewHTML.js`, `treeViewEvents.js`, `treeView.css` (library and `showcase-styling`), `treeViewREADME.md` (features, structure, visual options, tokens — also fixes a split `:is()` selector in the tokens table —, callbacks, accessibility).

### Tested (Playwright)

- Library test page: SINGLE starts with the selected item current; MULTIPLE: a name click makes the item current without changing the value; a box click ticks; a click 3px beside the box ticks; Enter does not tick, Space does; Rename acts on the framed item; toolbar description = current item; NONE: the clicked item is framed. No warnings.
- Showcase: the live example frames "Invoice 02.xlsx"; README renders.

### To install

Copy the files into the same places.

## Delivery 96 — 2026-11-01: New component TreeView (core set + editing)

Showcase look: **unchanged** for every existing component. TreeView is new: it appears under Complex components (2 dependencies: Button, Message; keywords data, inputs, navigation); its live example uses the new `showcase-styling/treeView.css`.

### TreeView (library, `components-js/treeView/`, 9 files + `tests/treeView.html`)

- **Browsing:** open/close with an arrow, icons, badges, disabled items, optional guide lines (`guideLines`), indentation by one arrow column per level.
- **Selection** (`selectionMode`): `NONE` (browse; `onActivate`), `SINGLE` (default; one selected item), `MULTIPLE` (checkboxes). `checkCascade` (default `true`): a parent ticks its enabled sub-items, is ticked when all are and partly ticked (dash, `aria-checked="mixed"`) when some are; a disabled unticked item never blocks unticking the branch. `checkedValue`: `ALL` (default), `LEAVES`, `TOP`.
- **Search** (`search`): a field above the tree; matches with their parents, matching text bold, "No matching items" (Message INLINE); `filter(text)` method.
- **Loaded on demand:** `items[].hasChildren` + `loadChildren(item) → Promise<items>`; "Loading…" with `aria-busy`; a failure shows "Could not load. Open again to retry." and opening again retries.
- **Editing** (`editable`): toolbar Buttons Add, Add sub-item, Rename, Delete and icon buttons Move up, Move down, Move into the item above, Move out of the parent (enabled only when they apply); F2 renames in place (Enter saves, Escape cancels), Delete deletes; delete confirmation as a DANGER modal Message naming the number of sub-items (`confirmDelete`, Cancel focused); drag and drop (before / after / inside, with markers); `canMove(move)` refuses moves (refused moves are neither offered in the toolbar nor accepted as drops); `onEdit(change)` with ADD / RENAME / DELETE / MOVE; `getItems()` returns the edited tree.
- **Form field** (only with `SINGLE` / `MULTIPLE`): `name`, `label`, `mandatory` (default `true`; `LABEL_REQUIRED` without a label), `mandatoryIndicator`, `labelPosition`, help, `REQUIRED_SELECTION` / `EXTERNAL` errors and the whole form-field contract (Form summary links focus the tree).
- **Keyboard and accessibility:** WAI-ARIA tree (roving tabindex; Up / Down / Home / End, Right / Left open, close and move — mirrored in right-to-left —, typing letters, `*`, Enter / Space); every drag has a toolbar alternative.
- API: `getItems`, `getItem`, `setItems`, `updateItem`, `expand`, `collapse`, `expandAll`, `collapseAll`, `reveal`, `filter`, `focus`, `destroy` (+ form-field members). Callbacks fire only for user actions.

### Showcase

- `client/components/treeView/` (synced), `client/showcase-styling/treeView.css` (new; the app itself does not use TreeView, so `local-styling` gets none).
- `client/adjustments/treeView.js`: start = the Files sample ("Folder", SINGLE, "Invoice 02.xlsx" selected, icons). Variants: selectionMode, checkCascade (MULTIPLE), guideLines, search, editable, **Show icons** (ticked), **Show badges** (unticked).
- `server/catalog-rules.json`: treeView in the keywords data, inputs and navigation.

### Tested (Playwright)

- Library test page: keyboard (arrows, Home / End, Right / Left, typing, `*`, Enter); SINGLE selection; MULTIPLE cascade with a disabled item, unticking a partly ticked branch, ALL / LEAVES / TOP values; search (2 matches marked, "No matching items", restore on clear); loading on demand (Loading…, failure, retry); NONE activation; editing: add + rename, F2 + Escape, add sub-item, outdent / up / indent, delete with confirmation (Escape keeps, Delete removes, focus moves on), disabled item tools, drag and drop inside / before, `canMove` refusal; Form: required summary, link focus, submit `{ folder:["finance"] }`; right-to-left (arrows and Left / Right mirrored, guide lines); README renders (10 tables, column counts checked); no warnings or page errors.
- Showcase: TreeView page (Complex components, 2 dependencies), live example, Variants fields, MULTIPLE + guide lines + search + editable + badges render, no warnings.
- Checks: every token exists in `design-system.css`; every error label is used; no `console.*` outside `treeViewErrors.js`; all classes prefixed `ui-tree-view`.

### Not included (this version)

Copy / paste, moving several items at once, undo, rendering only the visible rows (very large trees), touch drag and drop (touch users use the toolbar moves).

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 95 — 2026-11-01: SideNavigation — no icon column when no entry has an icon

Showcase look: **unchanged**. The live example has icons, so its icon column stays.

- When no entry of the menu has an icon, the empty icon spaces are removed (all looks: CHEVRON and PLUS_MINUS, every level style): the label follows the + / − directly, or starts at the row padding. A menu where only some entries have icons keeps the column, so labels stay aligned.
- TREE lines then end a small gap before the label.
- CSS only (`:has()` on the navigation, so it also follows `setItems()`): `sideNavigation.css` in the library, `local-styling` and `showcase-styling`; README structure note.

### Tested (Playwright)

- Showcase, Show icons unticked: INDENTATION and TREE with + / −, the label starts 8px after the sign column (was 34px); INDENTATION and TREE with the chevron, labels at the row padding; tree lines end before the labels; no warnings.
- Default example (icons on): unchanged.

### To install

Copy the files into the same places.

## Delivery 94 — 2026-11-01: SideNavigation — expandIndicator (+ / −) and cornerRadius; Variants: icons and corners

Showcase look: **unchanged**. Defaults keep today's look (CHEVRON, MEDIUM = --radius-control, icons shown); the live example and the app menu are the same. The new looks appear only when chosen in Variants (showcase-styling received the new rules only).

### New options (library)

- **`expandIndicator`**: `CHEVRON` (default, the arrow at the end of a parent row) or `PLUS_MINUS`:
  - a + sign before the icon, which becomes − when the branch opens (two CSS bars; the vertical one shrinks, no motion with reduced motion);
  - a parent with its own page: the + / − is its open/close button, placed **before** the link in the markup, so Tab follows the visual order; clicking the label still opens the page;
  - a parent without its own page: the sign is inside the row button (clicking anywhere opens or closes it);
  - rows without a sign keep an empty column of the same width (24px, `--space-lg-3`), so icons and labels stay aligned;
  - works with every level style; with TREE the lines join the signs; while searching every parent shows −; hidden in the rail; none in the rail flyout; right-to-left mirrors;
  - screen readers: unchanged (button name "Expand Projects" / "Collapse Projects" and `aria-expanded`; the sign is hidden).
- **`cornerRadius`**: `NONE`, `SMALL` (`--radius-control-small`), `MEDIUM` (default, `--radius-control`), `LARGE` (`--radius-control-large`), for rows, links, open/close buttons and BACKGROUND lists; the search field and the rail flyout keep `--radius-control`.
- Invalid values: `INVALID_OPTION` warning, the default is used.
- Files: `sideNavigationConfig.js`, `sideNavigationHTML.js`, `sideNavigation.css` (library, `local-styling`, `showcase-styling`), `sideNavigationREADME.md` (features, structure, visual options, tokens, configuration, errors, accessibility), `tests/sideNavigation.html` (Expand indicator and Corner radius choices).

### Variants (showcase)

- `client/adjustments/sideNavigation.js`: panel order levelStyle, expandIndicator, cornerRadius (values shown as their tokens), **Show icons** (ticked at start; unticked removes the icons, and the rail, which needs icons, is not offered: allowRail is sent as false and the allowRail and railCollapsed fields become inactive), allowRail, railCollapsed, search, searchThreshold.

### Tested (Playwright)

- Library test page: PLUS_MINUS with INDENTATION, TREE and BACKGROUND; + on closed and − on open branches; aligned columns; Tab order Dashboard → Approvals → "Collapse Projects" → Projects → …; search shows −; rail hides the signs; cornerRadius NONE / SMALL / LARGE; no warnings.
- Showcase: default live example unchanged (INDENTATION, CHEVRON, MEDIUM, 6 icons); Variants fields in the order above; TREE + PLUS_MINUS + LARGE with icons, and TREE + PLUS_MINUS + NONE without icons (no rail button, no warnings).

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 93 — 2026-11-01: SideNavigation — level style TREE replaces FONT_WEIGHT

Showcase look: **unchanged**. The live example and the app menu keep INDENTATION. The tree lines appear only when TREE is chosen in Variants (showcase-styling received the TREE rules and lost the FONT_WEIGHT rule; nothing else changed there).

### Changed

- `levelStyle` values: `INDENTATION` (default), `TREE`, `BACKGROUND`. `FONT_WEIGHT` (bold top level) was removed.
- **TREE** draws file-tree connector lines (├─, and └─ for the last sub-page) from each parent to its sub-pages:
  - the vertical line runs under the centre of the parent's icon space; the horizontal one ends a small gap before the sub-page's icon, or before its label when it has no icon;
  - one level step = icon width + icon-to-label gap, so a sub-page starts under its parent's label;
  - lines use `--c-border` and `--border-thin`; they are drawn by `::before` / `::after` of the nested items, so the markup and screen-reader output are unchanged;
  - main list only (also in the phone drawer); the rail flyout keeps indentation; right-to-left mirrors (logical positions).
- **Former value:** `levelStyle:'FONT_WEIGHT'` is still accepted without a warning and gives TREE.
- Files:
  - `sideNavigationConfig.js` (allowed values; the former value mapped);
  - `sideNavigation.css` (library, `local-styling`, `showcase-styling`): FONT_WEIGHT rules removed, TREE rules added in parts 1–3;
  - `sideNavigationREADME.md`: features, structure, visual options, design tokens, configuration, note under Errors;
  - `tests/sideNavigation.html`: levelStyle choices Tree lines and FONT_WEIGHT (former value).

### Tested (Playwright)

- Library test page, three levels (Projects → Templates → IT/HR projects): lines at the right positions, └─ on the last sub-page, current and hover rows, no warnings; FONT_WEIGHT gives `ui-side-nav-level-tree` without a warning; right-to-left mirrored.
- Showcase: the Variants levelStyle list offers INDENTATION, TREE, BACKGROUND; Render with TREE draws the lines in the live example; the default example still shows INDENTATION.

### To install

Copy the files into the same places; run `npm run catalog`.

## Delivery 92 — 2026-11-01: SideNavigation Variants — items, currentId and expandedIds removed

Showcase look: **unchanged**. The live example keeps the same menu, with "Active projects" as the current page.

- `client/adjustments/sideNavigation.js`: new `hide:[ 'items', 'currentId', 'expandedIds' ]`. The Variants panel now shows levelStyle, allowRail, railCollapsed, search and searchThreshold. The menu tree and the current page stay fixed in the start values.

### To install

Copy `client/adjustments/sideNavigation.js`, `DECISIONS.md` and `CHANGELOG.md`.

## Delivery 91 — 2026-11-01: To-do — uniqueness of component ids

Showcase look: **unchanged** (records only).

- `DECISIONS.md`, "Open decisions": new item "Uniqueness of component ids (to assess)", with today's behaviour, the four gaps and three options to choose from later.

### To install

Copy `DECISIONS.md` and `CHANGELOG.md`.

## Delivery 90 — 2026-11-01: Typography unified in text roles; rule added to the guidelines

Showcase look: **unchanged**. The live examples use showcase-styling's own design system and app shell; their text stays 16px.

### Why the Search list was still 16px

The list had its own rule, `font-size: var(--fs-body)`, and `--fs-body` was still 16px. Only `<p>` and the .md views used the new 14px token. Running text was sized in four places with two different tokens.

### Changed

- `design-system.css` (library and `local-styling`), section TYPOGRAPHY ROLES: every kind of text is now one **text role** of four tokens, defined together:

  | Role | Family | Size | Weight | Line height |
  | --- | --- | --- | --- | --- |
  | body (all running text) | `--font-body` | `--fs-body` = **14px** `[APP]` | `--fw-body` | `--lh-body` |
  | p | `--font-p` → body | `--fs-p` → body | `--fw-p` → body | `--lh-p` → body |
  | lead (new) | `--font-lead` | `--fs-lead` (`--fs-lg`) | `--fw-lead` | `--lh-lead` |
  | h1–h6 | `--font-hN` | `--fs-hN` (h4–h6 now `--fs-md`, 16px) | `--fw-hN` | **`--lh-hN`** (new, each `--lh-heading`) |
  | ui (component text) | `--font-ui` | `--fs-control`, `--fs-label`, `--fs-caption` | `--fw-ui*` | `--lh-body`, `--lh-compact` |
  | code | `--font-code` | an `em` proportion | — | — |

  - `--fs-body` moved from SEMANTIC TYPOGRAPHY into the roles.
  - The header of the section states the rule and lists the roles.
- `app-shell.css` (library and `local-styling`): each heading reads its own `--lh-hN`; `p` also reads `--lh-p`.
- `client/app/app.css`:
  - removed the separate text sizes (`.app-markdown`, `.app-component-list-text`, `.app-facts dt/dd`); that text now inherits the body role;
  - `.app-lead` uses the new lead role;
  - the header states the rule.
- **Guidelines:** `framework-component-development-guidelines.md`, section 12 "CSS and generated markup", has a new rule "**Typography roles**". `how-to-build-a-design-system.md`, step 3, explains the text roles. Both are also in `client/content/`.
- `DECISIONS.md`: 153.

### Checked (browser)

- Paragraphs, list items, the Search "All components" text and Uses / Used by: 14px, line height 21px, light weight, on Home, Search, Button, buttonREADME.md and Contact.
- h1 32px; h2 24px (Home section titles 20px, their own rule); component labels and buttons unchanged.
- Live example text still 16px. No console errors.

### To install

Copy the files. Nothing to run. A later `npm run sync` also keeps the two guides up to date.

## Delivery 89 — 2026-10-31: Dependencies counted in full (direct and indirect)

Showcase look: **unchanged** (app and catalog builder only).

### Changed

- `server/build-catalog.js`:
  - New step: after reading every component's own imports (direct dependencies), it adds recursively everything those import (indirect dependencies).
  - Each component records:
    - `directDependencies`;
    - `dependencies` (all);
    - `dependencyVia` (for each indirect one, the direct dependency it comes through);
    - `usedBy` (all consumers) and `usedByVia`.
  - Groups, dependency keywords and the printed table use the full list; the table marks indirect ones with `*`.
  - A cycle (components that need each other in a circle) is reported and cannot make the count loop.
- `server/serverErrors.js`: new warning `DEPENDENCY_CYCLE`.
- `server/catalog-rules.json`: help text and group descriptions say "directly or indirectly".
- Component page (`componentPage.js`, `appConfig.js`, `app.css`):
  - **Uses** and **Used by** list direct relations first, then indirect ones followed by "(through X)" in grey. For example, Accordion uses "CollapsiblePanel, Button (through CollapsiblePanel), Chip (through CollapsiblePanel)".
- `DECISIONS.md`: 152.

### Effect on the catalog

| Component | Before | Now |
| --- | --- | --- |
| Accordion | 1 dependency, Basic | **3 dependencies, Complex** (CollapsiblePanel; Button, Chip through it) |
| AppHeader | 8 | 11 (adds ActionMenu through Breadcrumbs; CheckboxRadio and Chip through SearchBox) |
| SearchBox | 3 | 4 (adds Chip through CheckboxRadio) |
| All others | — | unchanged (their dependencies use no further components) |

Basic components: 15, Complex components: 9.

### Checked (browser)

- Accordion: under Complex components; keywords "complex, containers, layout, 3 dependencies".
- Button "Used by" ends with "Accordion (through CollapsiblePanel)". Chip "Used by": CheckboxRadio, CollapsiblePanel, then Accordion, AppHeader and SearchBox with "(through …)".
- No console errors.

### To install

Copy the files, then run `npm run catalog`.

## Delivery 88 — 2026-10-31: New component Accordion (and CollapsiblePanel PLAIN variant)

Showcase look: **unchanged** for existing components. The Accordion live example is new. `showcase-styling/collapsiblePanel.css` gets the rules of the new PLAIN variant, which no existing example uses.

### Added — Accordion (library `components-js/accordion/`, all files new)

- `accordionIndex.js`, `accordionConfig.js`, `accordionComponent.js`, `accordionHTML.js`, `accordionEvents.js`, `accordionErrors.js`, `accordion.css`, `accordionREADME.md`.
- **Composes CollapsiblePanel.** Each item is a CollapsiblePanel configuration plus `content`, passed through unchanged. The Accordion only coordinates.
- **Options:**
  - `expandMode`: **SINGLE** (default) or MULTIPLE;
  - `look`: **JOINED** (default; one frame with lines between items, panels use the new PLAIN variant) or SEPARATE (one card per item);
  - `bordered` (default yes) and `cornerRadius` (default ROUNDED);
  - `headingLevel` (default 3; every header sits inside `<h3>`);
  - `keyboardNavigation` (default on: Up / Down / Home / End between headers, wrapping, skipping disabled items);
  - `onChange(openIds)`, for user changes only.
- **API:** `getOpenIds`, `expand(id)` (SINGLE closes the other item), `collapse(id)`, `expandAll()` (MULTIPLE only), `collapseAll()`, `getPanel(id)`, `getChildren()`, `focus()`, `destroy()`.
- **Form:** a surrounding Form finds fields inside the items through `getChildren()`, also in closed items (checked: both fields validated and collected).
- **Developer messages** (11): CONTAINER_REQUIRED, ID_REQUIRED, UNSAFE_ID, DUPLICATE_ID, ITEMS_REQUIRED, INVALID_OPTION, OPTION_IGNORED, INVALID_ITEM, ITEM_NOT_RENDERED, SINGLE_EXPANDED, UNKNOWN_ITEM.
- **Test page** `ui-catalog/tests/accordion.html`:
  - three item presets: FAQ, rich headers, form fields;
  - every option;
  - API buttons: `expand`, `expandAll`, `collapseAll`, `focus`;
  - shows `getOpenIds`, the last `onChange`, the fields found and developer messages;
  - loads the README.
- **Not included:** "keep one open" (SINGLE mode where the last open item cannot close). The accessible version needs `aria-disabled` on the panel's header, which the Accordion may not set inside another component. It can be added to CollapsiblePanel later.

### Changed — CollapsiblePanel (library)

- New variant **PLAIN**: the default spacing without frame, line, background or shadow, for a panel inside a container's own frame. `bordered` and `cornerRadius` are ignored with it, as with INLINE.
  - Files: `collapsiblePanelConfig.js`, `collapsiblePanelHTML.js`, `collapsiblePanel.css` (also in `local-styling` and `showcase-styling`), `collapsiblePanelREADME.md`.
- `ui-catalog/tests/collapsiblePanel.html`: the PLAIN variant and the Heading level row (delivery 87) added to the configurator.

### Showcase app

- `client/adjustments/accordion.js` (new), Variants panel (decision 118):
  - `expandMode`, `look`, `bordered`, `cornerRadius`;
  - three unticked checkboxes: Show icons, Show descriptions, Show chips;
  - start: four FAQ questions, the first open.
- `client/showcase-styling/accordion.css` (new): the live example's stylesheet.
- `server/catalog-rules.json`: Accordion gets the keywords "containers" and "layout". With one dependency it is in **Basic components**.
- `DECISIONS.md`: 149–151.

### Checked (browser)

- **Test page:**
  - FAQ: 4 `h3` headers, PLAIN panels; opening "Returns" closes "Shipping" and `onChange` gives `[acc-returns]`.
  - Keyboard: Down, End, Down (wraps to the first), Home.
  - `expandAll()` in SINGLE: warning and no change.
  - Rich preset, MULTIPLE, SEPARATE: cards; `expandAll()` opens all four; End skips the disabled item.
  - Form preset: fields found, also inside the lazy item once opened.
  - `destroy()` clears the preview.
  - No page errors.
- **Showcase:** Accordion in the menu under Basic components. The live example renders (4 items, 1 open). Variants: SEPARATE + MULTIPLE + all three checkboxes → icons, descriptions, 2 chips, two items open. The README page has 22 Contents links.
- **Form with an Accordion child:** `getValues()` returns both fields; `validate()` reports both as required, including the one in the closed item.
- **CollapsiblePanel:** its page has no console errors; the test page renders PLAIN with `<h3>`.

### To install

1. Copy the files: `ui-catalog/source/components-js/accordion/` (new), the CollapsiblePanel files, `ui-catalog/tests/accordion.html`, `tests/collapsiblePanel.html`, and the showcase files.
2. Run `npm run sync` and `npm run catalog`.

## Delivery 87 — 2026-10-31: CollapsiblePanel — headingLevel and focus() (for Accordion)

Showcase look: **unchanged**. One structure rule was added to `showcase-styling/collapsiblePanel.css`, as you approved. It applies only when the new `headingLevel` option is used, which no live example does.

### Changed

- Library `components-js/collapsiblePanel/`:
  - **`headingLevel`** (new option): `0` (default) adds no heading, so panels are unchanged. `2`–`6` wraps the header Button (or the static heading of a non-collapsible panel) in `<h2>`…`<h6>`, as the WAI-ARIA accordion pattern asks, so screen-reader users can list and jump between panel headers. It adds no look of its own. An invalid value gives an `INVALID_OPTION` warning and `0`. Files: `collapsiblePanelConfig.js`, `collapsiblePanelHTML.js`, and `COLLAPSIBLE_PANEL_HEADING_LEVELS` exported from `collapsiblePanelIndex.js`.
  - **`focus()`** (new method): moves keyboard focus to the header toggle and returns `true`. It returns `false` for a non-collapsible or disabled panel. Accordion will use it to move between headers. File: `collapsiblePanelComponent.js`.
  - `collapsiblePanel.css`: a structure rule for `.ui-collapsible-panel-heading-level` (no margin, inherited type, flex like the toggle), and the DOM comment updated. The same rule is in `local-styling` and `showcase-styling`.
  - `collapsiblePanelREADME.md`: structure tree, Public API (`focus()`), Configuration (`headingLevel`), Errors and Accessibility.
- `DECISIONS.md`: 147 (Accordion approach) and 148.

### Checked (browser)

- A panel with `headingLevel:3` has the same header size (498 × 79 px), title size and weight as one without. The toggle sits inside `<h3>`.
- Non-collapsible with `headingLevel:4` → `<h4>`. `headingLevel:7` → warning and no heading.
- `focus()` → `true` and focus on the toggle; on a non-collapsible panel → `false`.
- CollapsiblePanel page: no console errors.

### To install

Copy the files, then run `npm run sync` and `npm run catalog`.

## Delivery 86 — 2026-10-31: Home tagline text

Showcase look: **unchanged**.

### Changed

- `client/content/home.md`: the tagline is now "Native Java Script components for predictable, consistent, and AI-friendly application development." (was "JS components for…"). It is still one line, with the repositories two lines below it.

### Checked (browser)

- 1440px: the new text on one line; the paragraph is 3 lines.

### To install

Copy the file. Nothing to run.

## Delivery 85 — 2026-10-31: Home — one-line tagline, repositories two lines below, columns 1/3 and 2/3

Showcase look: **unchanged** (app only).

### Changed

- `client/content/home.md`: the tagline "JS components for predictable, consistent, and AI-friendly application development." is on one line. "Source code repositories: GitHub, GitLab" is two lines below it, with one empty line between them in the same paragraph.
- `client/app/app.css`: Core concepts takes 1/3 of the width and FAQs 2/3 (was half and half). Below 48rem they are still one below the other.
- `DECISIONS.md`: 146.

### Checked (browser)

- 1440px: the paragraph is 3 lines (tagline, empty line, repositories). Columns 312px and 624px.
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run.

## Delivery 84 — 2026-10-31: Home page after your design (Core concepts and FAQs)

Showcase look: **unchanged** (app only).

### Changed

- `client/content/home.md` (rewritten):
  - title "UI Catalog";
  - the tagline in two lines;
  - "Source code repositories: GitHub, GitLab" (plain text for now; a comment shows how to turn the names into links);
  - the marker `<!-- columns -->`;
  - "Core concepts" with the three concepts (bold title, text below), exactly as in your image.
- `client/app/pages/homePage.js` (rewritten):
  - the text before the marker spans the page;
  - after it, two columns: Core concepts on the left and **FAQs** on the right;
  - below 48rem of page width the FAQs go under Core concepts.
- FAQs (`appConfig.js`, `APP_CONFIG.faqs`): six full-width secondary Buttons with the double-chevron-down icon:
  - How to use UI Catalog?
  - How to create a new component?
  - How to build a new Design System?
  - How to adapt UI Catalog to a specific Design System?
  - What are the advantages of a single entry point?
  - What is a component contract?

  For now each opens the guide that answers it:
  - the framework guide for questions 1, 5 and 6;
  - the guidelines for question 2;
  - the design system guide for questions 3 and 4.
- Removed from Home: the definition paragraph, the three guide lines (the guides stay reachable through the FAQs) and the "Code repositories" section (now the one line).
- `client/app/app.css`:
  - Home layout (two columns, section titles at the block-title size, 32px between concepts, FAQ list);
  - a new OVERRIDES section (`@layer overrides`), whose only rule starts the FAQ Buttons' icon and text at the left (Buttons centre their content).
- `DECISIONS.md`: 144, 145.

### Checked (browser)

- 1440px: Core concepts and FAQs side by side; 6 FAQ Buttons, secondary, full width, icon and text at the left. 800px: one below the other.
- "How to create a new component?" opens `#/guidelines`.
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run.

## Delivery 83 — 2026-10-31: 14px for all .md text (lists too)

Showcase look: **unchanged**.

### Why delivery 82 did not show it

Delivery 82 set `--fs-p` (14px) on the `<p>` element only. "Features" (and most of the README text) is a bulleted list (`<li>`), not paragraphs, so it kept the page size of 16px. Real paragraphs were already 14px.

### Changed

- `client/app/app.css`: `.app-markdown` (every displayed .md: Features / Dependencies, README pages, guides, Home) uses `--fs-p`, so paragraphs, list items and quotes are all 14px. Headings, tables (14px already) and code keep their sizes.
- `DECISIONS.md`: 143.

### Checked (browser)

- Button page Features: list items 14px. buttonREADME.md, how-to-use-the-framework.md and Home: paragraphs and list items 14px; h2 stays 24px.
- No console errors (only the known missing Inter font file).

### To install

Copy the file. Nothing to run.

## Delivery 82 — 2026-10-31: Muted README line, README page without big title, rounded primary Buttons, 14px paragraphs

Showcase look: **unchanged**. The live examples use showcase-styling: their primary Buttons keep their corners and their paragraphs 16px.

### Changed

- **Component page** (`app.css`): "For full component description…" (and, on narrow screens, "For experimenting variants…") in `--c-muted` and `--fs-caption` (12px). The Button is unchanged.
- **README page** (`documentPage.js`, `app.css`):
  - The big title (e.g. "buttonREADME.md") is no longer shown. It stays as the page's heading for screen readers (visually hidden) and as the tab title.
  - "Source file: source/components/…" is on the same line as the Buttons, vertically centred. When space is short it wraps (at 1440px over three short lines); below about 500px the Buttons go under it.
- **Primary Buttons** (`local-styling/button.css` and the library's `button.css`): text Buttons have the same corners as secondary and tertiary, `--radius-control-small` (4px). They were square ([APP] 0). The `[APP]` marker is removed: the value is now the library original.
- **Paragraph size** (`local-styling` and the library: `design-system.css`, `app-shell.css`):
  - New typography role **`--fs-p: var(--fs-sm)`**, 14px, marked `[APP]`; the library original is `--fs-body`, 16px.
  - `app-shell.css` applies it to every `<p>`.
  - List items, table cells, headings and component text keep their own sizes.
- `DECISIONS.md`: 140–142.

### Checked (browser)

- Button page: the README line text is rgb(99, 109, 121) at 12px. The Render Button and the README Button both have 4px corners; the live example's primary Button is unchanged.
- Paragraphs (definition, README text) are 14px.
- formREADME.md page: no visible title; the h1 is kept for screen readers; the tab title is "formREADME.md · UI Catalog". The path is centred on the Buttons' line at 1440px and 1920px; at 800px the Buttons wrap below it.
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run.

## Delivery 81 — 2026-10-31: "Show variants" line on narrow screens; 32px spacing in .md files and the component list

Showcase look: **unchanged** (app only).

### Changed

- **Narrow screens** (below 960px), component page (`componentPage.js`, `app.css`, `appConfig.js`):
  - The "Show variants" link at the top of the page is removed.
  - It is now a second line under the README line, in the same format: "For experimenting variants of this component click the button:" and a secondary Button **Show variants** (layer icon) that opens the Variants page.
  - On wide screens the line is hidden: the Variants column is there.
- **Search page, All components** (`app.css`): 32px between components (was 24px), the same as the space before the README line.
- **Every displayed .md file** (`app.css`, `.app-markdown`: README page, guides, Home, Features / Dependencies):
  - 32px after paragraphs, lists, tables, code blocks and quotes (was 12–16px);
  - 32px before every heading (h3 was 24px, h4–h6 16px; h2 was already 32px);
  - the space under a heading is unchanged.
- `DECISIONS.md`: 138, 139.

### Checked (browser)

- 800px wide, Button page: the README line, then "For experimenting variants of this component click the button: | Show variants" (secondary). The Button opens `#/component/button/variants`. At 1440px the line is hidden.
- Search page, Basic components: 32px between components.
- formREADME.md page: 32px between heading and paragraph blocks (H1>H2, P>H3, UL>H3, table>H3 all 32px).
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run.

## Delivery 80 — 2026-10-31: Home page with the definition and three guides; empty search shows 0 results; README line on the right

Showcase look: **unchanged** (app and library documentation only).

### Changed

- **Search page** (`searchPage.js`, `appConfig.js`, `app.css`):
  - With no text and no keyword, the Table is empty: "0 components found." The Table says "No components to show. Type a word or choose a keyword." A keyword alone or a text alone still lists its matches.
  - The page search label: "Search components (as you type - LIVE variant of the searchComponent)".
  - "All components": 24px between components (was 12px).
- **Component page** (`app.css`): "For full component description of the component click the button:" and its Button are aligned right.
- **Home page** (`homePage.js`, `content/home.md`, `appConfig.js`, `app.css`):
  - title "UI Catalog", then your definition (two lines);
  - three lines, each a text and a secondary Button with the file name:
    - **How to use this framework** → `how-to-use-the-framework.md`;
    - **How to add a new component** → `framework-component-development-guidelines.md`;
    - **How to build a new design system** → `how-to-build-a-design-system.md`;
  - "Code repositories", last. The other sections are removed.
  - Each Button opens the file on the document page (`#/framework`, `#/guidelines`, `#/design-system`), with Contents, Download .md / .pdf and Return to the home page.
- **New guides in the library** (`ui-catalog/source/components-js/`, next to the guidelines), each also copied to `client/content/`:
  - `how-to-use-the-framework.md`, for application developers. It covers the files to load, `renderX`, callbacks, errors, forms and the form-field contract, combining components, texts and languages, changing the look, the lifecycle, working with an AI assistant, and a checklist.
  - `how-to-build-a-design-system.md`. It covers the token file, the three token tiers, the steps (colours, typography, spacing, shapes, shared component tokens, dark mode), marking changes, checking, what to do when tokens are not enough, and a checklist.
- `server/sync-components.js`: "npm run sync" now copies all three guides to `client/content/` (before: only the guidelines).
- `markdownReader.js`: a `<br>` or `<br/>` in Markdown becomes a line break (needed for the definition). All other HTML stays text.
- `DECISIONS.md`: 135–137.

### No longer used

- `client/content/how-to-use.md` (the app's "How to use" text) is not shown anywhere now. Keep it or delete it.

### Checked (browser)

- Home: title, definition with its line break, three lines (text and Button vertically centred on one line), Code repositories last. Each Button opens its guide: Contents 13 / 21 / 15 links, path "source/components/<file>", "Return to the home page" works.
- Search: no input → "0 components found." and the empty-Table text; keyword "inputs" alone → 8 components; the new label; 24px between components.
- Button page: the README line is flush right.
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run. A later "npm run sync" keeps the guides up to date.

## Delivery 79 — 2026-10-31: Search page in two sections, Description page removed, smaller header search, softer keyword chips

Showcase look: **unchanged** (app only).

### Changed

- **Header search** (`app.css`, `appShell.js`):
  - The same size as the Variants inputs: 12px text, 32px high, 12px icon.
  - The magnifying-glass Button and Enter always open the **Search** page with the field's text, also when the field is empty (before, an empty field or the same text twice did nothing).
- **Menu** (`appShell.js`, `appConfig.js`): Description removed; **Search** (magnifying glass) below Complex components.
- **Description page removed** (`appRouter.js`, `homePage.js`, `content/home.md`, `content/how-to-use.md`):
  - **Home** now shows home.md, then "How to use the app" (how-to-use.md), then "To build new components, read the component development guidelines:" with a secondary Button **framework-component-development-guidelines.md**.
  - That Button opens the guidelines on the document page (`#/guidelines`). The page has Contents, Download .md / .pdf and **Return to the home page**; the path reads "source/components/framework-component-development-guidelines.md".
  - The component groups moved to the Search page. `#/description` (old bookmarks) shows Home.
  - Texts updated: home.md "How to use it", how-to-use.md "Find a component". The section "Read the documents offline" is removed, because the ".md Reader" download was on the Description page.
- **Search page** (`searchPage.js`, `app.css`, `appConfig.js`), two sections one under the other:
  1. **Search results**:
     - a search field (it searches while you type) holding the header search's text; both fields stay in step;
     - the keyword chips;
     - the count;
     - the results Table.
  2. **All components**:
     - one compact CollapsiblePanel per group, closed, with the group's description and count;
     - inside: each component's name (a link) with its definition below it, in the same size and colour (16px, text colour), then its keyword chips.
     - This section never changes with the search.
- **Keyword chips** (component page and Search page, `componentPage.js`, `searchPage.js`, `app.css`): text and border in `--c-muted` (grey, was black); 8px apart (was 4px).
- **Document page** (`documentPage.js`):
  - **Return to the component** is now the last Button, after Download .pdf.
  - The page also shows the guidelines, using the same layout.
- `DECISIONS.md`: 131–134.

### To delete by hand

- `client/app/pages/descriptionPage.js` is no longer used; delete it.

### Checked (browser)

- Menu: Home, Basic components, Complex components, Search, Contact.
- Header search: 12px text and icon. Empty-field click → `#/search`. "menu" + Enter → `#/search?text=menu`, 2 results, the page field shows "menu". Typing "table" in the page field → address, header field and results follow (1 result).
- Search page: headings "Search results" / "All components". Basic components panel: 15 components, names and definitions 16px in the text colour, 49 chips.
- Component page chips: grey text and border, 8px apart.
- Home: "How to use the app" and the guidelines Button. Guidelines page: 21 Contents links; Buttons Download .md, Download .pdf, Return to the home page. README page: Download .md, Download .pdf, Return to the component.
- `#/description` opens Home. No console errors (only the known missing Inter font file).

### To install

Copy the files and delete `client/app/pages/descriptionPage.js`. Nothing to run.

## Delivery 78 — 2026-10-31: App look in greys; primitive blue where greys run out

Showcase look: **unchanged**. The live examples use showcase-styling (dark blue primary); only the app's own look (local-styling) changes.

### Changed

- `client/local-styling/design-system.css` (each line marked `[APP]`, with the library value in brackets):
  - `--c-primary`: **`--c-grey-90`** (#232930), was the teal-blue #315e71. Everything built on it is now grey: accent (links, active tab, focused border), primary Buttons, Toggle on, chosen calendar day, the primary light / dark variants and the primary gradient.
  - `--c-accent-hover`: **`--c-grey-70`** (#525b66). The derived dark variant would have been almost the same as the accent; this one is clearly lighter (2.1:1 apart), and light text on it stays readable (6.5:1).
  - `--c-selected`: **`--c-blue-20`** (#dbeafe), primitive blue. The greys are already used for surface (grey-05), stripes (grey-10), hover (grey-20) and borders (grey-30), so selected gets its own hue. This covers selected rows, chosen Select options, calendar ranges, selected chips and unread notifications. Dark mode: 35% `--c-blue-60` on the surface.
- `client/local-styling/table.css`: row hover **`--c-surface-hover`** (grey), was `--c-info-soft` (light blue), which would now have been the same as selected.
- Unchanged on purpose:
  - the menu rail dot (`--c-blue-60`, primitive blue);
  - info messages (blue);
  - danger, warning and success colours: they carry meaning (errors, warnings, the red unread counter), always together with an icon or text.
- `DECISIONS.md`: 130. This is an exception to decision 108: the library keeps its colours; only the app is grey.

### Measured (browser, light look)

- Text on selected 17.2:1; secondary text on selected 4.31:1 (the same as before on light blue).
- Accent on the surface 13.8:1; light text on the accent 13.8:1, on accent hover 6.5:1.
- Selected next to hover: they differ by hue (light blue vs grey), not by lightness (1.06:1). Selected items also have a second cue: the Table row checkbox, the Select option tick, the chip tick, and the dot and bold text of unread notifications.
- Search page and Select page checked visually. No console errors (only the known missing Inter font file).

### To install

Copy the two files. Nothing to run.

## Delivery 77 — 2026-10-31: Variants column — Button at the top right, beside the text

Showcase look: **unchanged** (app page only).

### Changed

- `client/app/app.css`: Variants column, area 1, is now one row: the text "Expand to experiment variants of this component!" on the left (it wraps when needed), and the double-chevron Button at the top right beside it, no longer below it. The area is lower (61px).
- `DECISIONS.md`: 129.

### Checked (browser)

- Form page: the Button's top is level with the text's first line, 16px from the right edge, and to the right of the text. The same holds when the panel is open; the Variants header still sticks right below the area.
- No console errors (only the known missing Inter font file).

### To install

Copy the file. Nothing to run.

## Delivery 76 — 2026-10-31: Variants Button on the right; README Button secondary; README page with Contents and "Return to the component"

Showcase look: **unchanged** (app pages only).

### Changed

- Variants column, area 1 (`client/app/pages/componentPage.js`, `app.css`): the double-chevron Button is at the right end of the area, and **SMALL**, the size of the menu's rail Button (12px icon).
- Component page:
  - more space between the Dependencies table and "For full component description…" (`--gap-section`, was `--gap-block`);
  - the **xREADME.md** Button is **secondary** (was tertiary).
- README page (`client/app/pages/documentPage.js`, `app.css`, `appConfig.js`):
  - **Contents** in the right column, where Variants is on the component page. Every heading of the file is a link, nested as in the file (e.g. Form › For business › Overview). A link scrolls to its heading, stops below the sticky header, and moves the focus there. On narrow screens Contents is above the file, with the first two levels only.
  - Header: file name and path on the left. On the right: a new secondary Button **Return to the component** (arrow-left icon; opens the component page), then **Download .md** and **Download .pdf**. When the column is too narrow for both, the Buttons go below the title and stay on the right (at 1440px they are below; at 1920px they share the title's row).
  - Printing (Download .pdf) also hides Contents.
- `client/content/how-to-use.md`: mentions "Return to the component" and Contents.
- `DECISIONS.md`: 127, 128.

### Checked (browser)

- Form page: the Variants Button is 16px from the area's right edge, SMALL, with the same 12px icon as the menu's rail Button. Table to README line: 57px. formREADME.md is secondary.
- formREADME.md page: 23 headings, 23 Contents links in three levels. "Configuration" scrolls to its heading and focuses it. "Return to the component" → `#/component/form`. Buttons: secondary, tertiary, tertiary, aligned right at 800, 1440 and 1920px. At 800px Contents shows 5 links (two levels).
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run.

## Delivery 75 — 2026-10-31: Header logo only, menu icon and dot, dark blue live examples, Variants column in two areas, README page

Showcase look: **changed, as you asked**: the live examples use a dark blue primary (#1c4397) instead of the teal-blue (#315e71). Everything built on the primary follows: primary buttons, links, selected items, focus colours. Nothing else in the live examples changed.

This delivery also contains your own changes of 2026-10-31 (the entry below), so the three files you sent are included with them.

### Changed

- Header (`client/app/appShell.js`, `appConfig.js`): the name "UI Catalog" next to the logo is removed. The logo's alt text "UI Catalog" names the app; the logo links home.
- Menu:
  - `client/app/appShell.js`: Description icon **fa-solid fa-circle-info** (was fa-book-open).
  - `client/local-styling/sideNavigation.css` and the library's `sideNavigation.css` (rail): the dot on Basic / Complex components is **`--c-blue-60`** (#2563eb), was red.
- Live examples: `client/showcase-styling/design-system.css`, `--c-primary` **#1c4397**: `--c-blue-60` mixed with 40% of `--c-grey-95`.
- Variants column (`client/app/pages/componentPage.js`, `app.css`, `appConfig.js`):
  - **Area 1**: the text "Expand to experiment variants of this component!" (same look as the "Source file: …" line) and a tertiary icon Button with a double chevron down, then a bottom line.
  - **Area 2**: the Variants panel as before, hidden when the page opens.
  - The Button opens area 2 and turns into a double chevron up; pressing it again closes area 2. For screen readers it is named "Show the variants" / "Hide the variants" and reports whether it is open.
  - Area 1 and the top of area 2 (Variants, Render) stay at the top while the column scrolls. No line under the Variants header.
  - Narrow screens: unchanged ("Show variants" opens the Variants page).
- Component description area (`componentPage.js`, `app.css`, `markdownReader.js`):
  - only **Features** and **Dependencies** from the README, always visible (no panels);
  - then "For full component description of the component click the button:" with the tertiary Button **xREADME.md** on the same line, vertically centred. It opens the README page.
  - The README's source line and the ".md Reader" Button are no longer on the component page. ".md Reader" stays on the Description page.
- New **README page** (`client/app/pages/documentPage.js`, route `#/component/{id}/readme` in `appRouter.js`):
  - title: the exact file name, e.g. **buttonREADME.md**;
  - below it: "Source file: **source/components/button/buttonREADME.md**";
  - tertiary Buttons **Download .md** (fa-solid fa-download; saves the file) and **Download .pdf** (fa-regular fa-file-pdf; opens the print dialog with only the file's content, where you choose "Save as PDF"; the suggested name is the file name);
  - the file's content below, full width.
  - Print styles in `app.css` hide the header, menu, footer and page header, and wrap long code lines.
- `client/content/how-to-use.md`: the component page and Variants paragraphs describe the new layout and the README page.
- `DECISIONS.md`: 121–126.

### Checked (browser)

- Header: logo only. Menu: Description shows the info icon. Rail: the dot is rgb(37, 99, 235).
- Button page: Variants panel hidden at start; the Button shows a double chevron down. Pressed: the panel opens, the icon turns up, focus stays on the Button. While the column scrolls, area 1 stays at the top and the Variants header sticks right below it with no line.
- AppHeader page: open, tick "Show search", Render → search in the live example; close → the panel is hidden again.
- Features and Dependencies shown for Button. All 23 READMEs have both parts.
- README Button → `#/component/button/readme`. Title buttonREADME.md, path source/components/button/buttonREADME.md, both Buttons tertiary with their icons. Download .md saved buttonREADME.md (15,097 bytes). In print view only the content shows.
- Narrow screen (800px): the Variants page and the README page work.
- No console errors (only the known missing Inter font file).

### To install

Copy the files. Nothing to run. The library file only keeps the library equal to the app look (decision 108).

## Your changes — 2026-10-31 (not a delivery; recorded here)

Showcase look: **unchanged** (app files only).

- `client/app/appShell.js`: header search Button `searchButtonHierarchy` SECONDARY → **TERTIARY**.
- `client/app/appConfig.js`: footer text "Copyright Creative Commons Dan Dragu 2026" → **"2026, Dan Dragu"** (Creative Commons icon kept).
- `client/app/app.css`: footer text colour `--c-muted` → **`--c-text`**; the `.app-side` and `.app-component-side, .app-columns-side` rules spread over several lines, borders unchanged.
- `DECISIONS.md`: 120.

These files are now the base for later deliveries.

## Delivery 74 — 2026-10-27: AppHeader Variants — background removed

Showcase look: **unchanged**. The live example already started on SURFACE, the default, and keeps it.

### Changed

- `client/adjustments/appHeader.js`: **background** removed from the Variants panel; the panel now has only the ten element checkboxes (all unticked at start). The header comment lists background among the hidden options.
- `DECISIONS.md`: 119.

### Checked (browser)

- Variants panel: the ten checkboxes only, all unticked; no background.
- All ticked → Render: every element shown; Sign out switches to Sign in.
- No console errors (only the known missing Inter font file).

### To install

Copy the file. Nothing to run.

## Delivery 73 — 2026-10-27: AppHeader Variants — simple start, elements added with checkboxes

Showcase look: **changed for the AppHeader live example, as you asked**: it now starts with only the application name ("Orders") on the SURFACE background (before: all elements and three levels). No stylesheet or library file changed.

### Changed

- `client/adjustments/appHeader.js`, Variants panel:
  - **background** (SURFACE / BRAND);
  - ten checkboxes, all **unticked at start**, in the order the elements appear:
    - Show a logo
    - Show the environment label ("TEST")
    - Show search
    - Show notifications (bell and panel)
    - Show help and settings links
    - Show the user
    - Show Sign in / Sign out (pressing it switches between the two)
    - Show navigation (second level)
    - Show breadcrumbs (third level)
    - Show an announcement banner
  - Each checkbox adds its element with the content used before (from tests/appHeader.html); the logo is `assets/logo.svg`.
  - Hidden, as they change nothing you can see in the example:
    - skipLinkTarget (appears only with the keyboard);
    - menuHost (an empty place for SideNavigation's menu Button);
    - homeHref (kept: the name is a link home);
    - sticky and autoMeasure (only matter while the page scrolls);
    - the texts, and the element options themselves (logo, search, user, …), which the checkboxes fill in.
- `DECISIONS.md`: 118 (also records the guideline, for use with other components).

### Checked (browser)

- At start: only "Orders"; background SURFACE; all ten checkboxes unticked.
- All ticked → Render: banner, logo, name, TEST, search, bell with 2, help, settings, user, Sign out, navigation and breadcrumbs all shown. Sign out switches to Sign in.
- No console errors (only the known missing Inter font file).

### To install

Copy the file. Nothing to run.

## Delivery 72 — 2026-10-27: NotificationsPanel — items hidden, "See all" off at 7, stronger colours in the live example

Showcase look: **changed for NotificationsPanel, as you asked and chose**: unread rows are light blue (`--c-info-soft`) and the notification icons sit in an accent circle with a light icon. Only `client/showcase-styling/notificationsPanel.css` changed; the library and the app look keep their colours.

### Changed

- `client/adjustments/notificationsPanel.js`:
  - **items** is no longer in the Variants panel; the seven notifications are always used.
  - **seeAllHref** is inactive and unticked when **maxItems is 7** (the panel already shows every notification). Choosing another number makes it active again, with its previous tick.
  - Variants panel now: maxItems, markReadOnOpen, seeAllHref, icon.
- `client/app/customization/customizationPanel.js` (all components): an **inactive checkbox shows unticked**, because its value is not sent. The panel remembers the tick and restores it when the option applies again. This also affects Breadcrumbs (siblingsMenu with maxItems 1) and TextInput (withIcon / withButton for PASSWORD or not EDIT).
- `client/showcase-styling/notificationsPanel.css` (live examples only):
  - unread notifications: `--c-selected` → **`--c-info-soft`**. "2 min ago" on it: 4.31:1 (was 3.67:1);
  - icon circle: `--c-surface-muted` → **`--c-accent`**, icon `--c-accent` → **`--c-on-accent`**. Circle against the demo background: 6.2:1 (was 1.13:1); icon on the circle: 6.65:1;
  - the header comment describes the new colours.
- `DECISIONS.md`: 115, 116, 117.

### Note

`--c-info-soft` brings "2 min ago" close to, but still just below, the 4.5:1 accessibility minimum for small text (4.31:1). Unread rows are also marked by bold text, the dot and ", unread" for screen readers.

### Checked (browser)

- Variants panel: maxItems, markReadOnOpen, seeAllHref, icon; no items, no bell.
- maxItems 7: seeAllHref inactive and unticked; Render → seven notifications, no "See all" link. maxItems 6: ticked again. Unticked by hand, then 7, then 3: stays unticked.
- Breadcrumbs: siblingsMenu unticked with maxItems 1, ticked again with 5.
- Live example colours measured as above; no console errors.

### To install

Copy the files. Nothing to run (showcase-styling is copied directly, not synced).

## Delivery 71 — 2026-10-27: NotificationsPanel Variants — maxItems, "See all" checkbox, icon

Showcase look: **changed for the NotificationsPanel live example only, as you asked**: it starts with seven notifications (five shown, as maxItems is 5 by default), and the live example is 720px high (was 560px) so the panel fits with all seven. No stylesheet or library file changed.

### Changed

- `client/adjustments/notificationsPanel.js`:
  - Seven notifications (four unread, three read). New: "Delivery to Cluj is delayed by one day", "Your password expires in 7 days", "Quarterly report is ready".
  - Variants panel, in this order:
    - **maxItems**: a Select from 1 to 7 (start 5, the default);
    - **markReadOnOpen**;
    - **seeAllHref**: a checkbox **"See all notifications"** (ticked at start). Unticked, the example sends neither the link nor `onSeeAll`, because the component also shows the link when only `onSeeAll` is given;
    - **icon**: a Select for the icon of the button that opens the panel (sent as `bell.icon`): Bell, Bell (outline), Envelope (messages), Inbox (tasks, requests), Megaphone (announcements);
    - **items** (as before).
  - **bell** removed from the panel; the texts stay hidden.
- `DECISIONS.md`: 114.

### Checked (browser)

- The panel lists maxItems, markReadOnOpen, seeAllHref, icon, items; no bell. Start values: 5, ticked, Bell.
- 7 + Envelope + "See all" unticked → Render: the panel shows all seven notifications without scrolling, the button shows the envelope, and there is no "See all" link. The Output shows `maxItems: 7` (a number) and `bell: { icon: "fa-solid fa-envelope" }`.
- No console errors.

### To install

Copy the file. Nothing to run.

## Delivery 70 — 2026-10-27: Popups stay inside the window (NotificationsPanel, Breadcrumbs, TopNavigation)

Showcase look: **changed only for NotificationsPanel**, as you asked: its panel now opens to the right of the bell (it used to open to the left, outside the live example) and the live example is taller (560px), so all four notifications show. The Breadcrumbs and TopNavigation live examples open exactly where they did before (checked). No stylesheet changed.

### Changed

- Library, `ui-catalog/source/components-js/`:
  - New helper **`fitPopupInWindow`**, copied identically into the three components below. When a popup opens (and while the page scrolls or the window is resized), it checks whether the popup fits where its stylesheet puts it. If it does not:
    - it is aligned to the other side of its trigger (end ↔ start);
    - it opens above the trigger when there is no room below and more room above;
    - as a last resort it is kept inside the window, with a shorter list that scrolls.
  - `notificationsPanel/notificationsPanelComponent.js`, `notificationsPanelEvents.js`: the panel (normally below the bell, aligned to its end) uses the helper.
  - `breadcrumbs/breadcrumbsComponent.js`: sibling lists (normally aligned to the level's start) use the helper.
  - `topNavigation/topNavigationComponent.js`, `topNavigationEvents.js`: the dropdown panels and "More" (normally aligned to the item's start) use the helper.
  - READMEs of the three components: one sentence each on where the popup opens near the window's edges.
  - `framework-component-development-guidelines.md`: `fitPopupInWindow` added to the canonical helpers, with a note on when to use it.
- `client/adjustments/notificationsPanel.js`: live example height `--size-md-4` (400px) → `--size-lg-1` (560px). The panel is at most 70% of the window's height, so at 400px the last notification was cut off.
- `DECISIONS.md`: 113.

### Assessment (components whose open state is larger than the closed one)

| Component | Before | Now |
| --- | --- | --- |
| NotificationsPanel | Always to the left of the bell, below it | Fixed (this delivery) |
| Breadcrumbs, sibling list | Always to the right, below | Fixed (this delivery) |
| TopNavigation, dropdowns and "More" | Always to the right, below | Fixed (this delivery) |
| ActionMenu (also the Breadcrumbs "…" and Table actions) | Already fits (delivery 40) | No change |
| Select (custom list), Calendar (popup) | Below or above, kept inside the window | No change |
| SideNavigation flyout (rail) | Beside the rail, kept inside the window's height | No change |
| CollapsiblePanel, SearchBox, Table | Open in the page flow (they push the content down), no popup | Not affected |

### Checked (browser)

- NotificationsPanel live example: before, the panel started 336px left of the window (most of it invisible); now it starts at the bell and is fully visible, with all four notifications and "See all notifications".
- Each of the three components placed in the four corners of a 640 × 400 window: every popup fully inside (near the right edge aligned to the trigger's end; near the bottom opened above).
- Breadcrumbs and TopNavigation live examples: positions identical to before (below, aligned to the start).
- No console errors.

### To install

Copy the files, then run `npm run sync` and `npm run catalog`.

## Delivery 69 — 2026-10-27: Form — LEFT / RIGHT names in Variants; toasts show the time left (BAR); externalMessage explained

Showcase look: **unchanged**. The live example shows its messages above the form, not as toasts; only names in the Variants panel change.

### Changed

- `client/adjustments/form.js`:
  - **labelPosition**: START is shown as **LEFT**, as in TextInput.
  - **buttonsAlign**: START / END are shown as **LEFT / RIGHT**.
  - The values sent stay START / END. In right-to-left languages they mirror.
  - **externalMessage** is removed from the Variants panel; the form keeps its default (messages above the fields).
- Library, `ui-catalog/source/components-js/form/`:
  - `formConfig.js`: new **`externalMessage.remainingIndicator`**: `NONE` | **`BAR` (default)** | `TEXT` | `BAR_AND_TEXT`. It applies to TOAST only; with another placement it is ignored with `OPTION_IGNORED`.
  - `formComponent.js`: a toast that closes by itself (6 s; not DANGER) now passes this value to Message, so by default a thin bar shows the time left.
    - Danger toasts stay until closed and show no indicator.
    - Use `NONE` where an indicator is not recommended, e.g. very frequent, minor confirmations.
  - `formREADME.md`:
    - the `externalMessage` row: the new property, its values and default;
    - "For business" → Features, a new line on where general messages appear (above the fields, as a pop-up in a screen corner, or in another component such as a strip under the header), that a pop-up closes after 6 seconds with a bar showing the time left (it can be switched off), and that danger messages stay.
- `DECISIONS.md`: 112. The reminder "Form toasts and the remaining-time indicator" in Open decisions is closed.

### Checked (browser)

- Form with `placement:'TOAST'`:
  - a SUCCESS message shows the bar;
  - with `remainingIndicator:'NONE'`, no bar;
  - a DANGER message has no bar and stays.
- `placement:'ABOVE'` with `remainingIndicator` gives the `OPTION_IGNORED` warning.
- Variants panel: no externalMessage. labelPosition offers TOP / LEFT; buttonsAlign offers LEFT / RIGHT. The README shows the new line.

### Consumer action

- Copy `client/adjustments/form.js`, and the three files to `ui-catalog/source/components-js/form/`.
- Run `npm run sync`, then reload.


## Delivery 68 — 2026-10-26: library takes the app look; same look for every input field; showcase look protected; link tokens

Replaces deliveries 66 and 67, which were not installed.

Showcase look: **unchanged**. Nothing goes into `client/showcase-styling/`.

### Changed — the library takes the app look

- **`ui-catalog/source`**: all 25 stylesheets (the 23 components, plus `design-system.css` and `app-shell.css`) now have the same values as `client/local-styling/`. Components used in other projects get the look defined in this app:
  - lighter headings h2–h6;
  - smaller control padding, `--space-sm-3` 6px;
  - no shadows;
  - black square primary Button;
  - page colour, `--c-text`, `--c-surface-muted`;
  - the AppHeader, SideNavigation, CollapsiblePanel and ActionMenu app values;
  - the field look.
- The lines marked `[APP]` keep the original value in brackets.
- File headers in the library and in local-styling say that both use the app look and that `showcase-styling` keeps the original values.

### Changed — same look for every input field (library and local-styling)

- **TextArea**, **Calendar** (the field, the native box and the time lists in the popup; library only, the app does not use Calendar) and **Pagination** (the go-to-page field) get the app field look. TextInput, Select (native and custom) and SearchBox already had it.
- All nine field boxes have:
  - only a 1px bottom line;
  - square corners;
  - the `--c-surface` background;
  - an accent line while focused;
  - a height of **40px**. TextInput and SearchBox were 41px, because their box counted the line on top of the 40px; it now counts the line inside (`[APP]`).
- Popups (the Select list, the Calendar month) keep their frame: they are panels, not fields.

### Changed — the showcase look is protected (decisions 109, 110)

- `server/sync-components.js`, `package.json`:
  - `npm run sync` and `npm run setup` **no longer copy into `showcase-styling/`**. Stylesheets missing there are only listed.
  - The new **`npm run sync:showcase`** copies the missing ones, for when you approve.
- `README.md`: the rows "The original library changed" and "Get a fresh copy of one stylesheet".
- `client/content/how-to-use.md`: the live example shows the showcase look (the original look); the library carries the app look.

### Changed — link tokens (decision 111)

- `design-system.css` (library and local-styling), semantic colours: new tokens for every state of a text link:
  - colours: `--c-link`, `--c-link-hover`, `--c-link-active`, `--c-link-visited` (= `--c-link`), `--c-link-disabled`;
  - underline: `--link-decoration`, `--link-decoration-hover`, `--link-underline-offset`, `--link-underline-thickness`, `--link-underline-thickness-hover`;
  - focus: `--link-focus-outline`, `--link-focus-offset`.
- A comment in the file says they are **not used yet** and can be used later to give every text link one behaviour.
- Nothing else changes:
  - visited links look like other links;
  - the app's contents list stays a navigation list, without underline;
  - Message links keep the message colour;
  - Breadcrumbs keeps its own link look.

### Checked (browser)

- In a page with the app look, all nine field boxes measure: borders 0 / 0 / 1px / 0, corners 0, height 40px (TextArea taller: several rows). The line is `--c-border` at rest and `--c-accent` while focused.
- App pages (Home, Description, Contact, Search, a component page): no console errors. The Contact form fields have the bottom line.
- The link tokens resolve: `--c-link-visited` = the accent colour; `--link-focus-outline` = the focus ring; `--link-underline-thickness-hover` = 2px.
- `npm run sync` at the default: "showcase-styling was not synced (default)". Nothing in `showcase-styling/` changed.

### Known

- `npm run setup` / `npm run sync` no longer compare `showcase-styling/`, so its differences from the library are not listed any more.

### Consumer action

- Copy everything:
  - `ui-catalog/source/design-system.css` and `app-shell.css`;
  - the 23 component stylesheets into `ui-catalog/source/components-js/<name>/`;
  - all files of `client/local-styling/`;
  - `server/sync-components.js`, `package.json`, `README.md`, `client/content/how-to-use.md`.
- Do **not** copy anything into `client/showcase-styling/`.
- Hard-reload (Ctrl+F5).


## Delivery 65 — 2026-10-26: Calendar demo — a value in the VIEW state

### Changed

- `client/adjustments/calendar.js`: with state **VIEW** and no value, the live example now gets a sample value that fits the other settings, so the view shows how a value is written (displayFormat, dateFormat, locale):
  - single values (3 March 2026, 14:30): DATE 2026-03-03, DATETIME 2026-03-03T14:30, TIME 14:30, MONTH 2026-03, WEEK 2026-W10;
  - range (DATE, DATETIME): 8 days from 3 March, shortened or lengthened to fit minRangeDays / maxRangeDays;
  - both are moved inside minValue / maxValue.
  - EDIT and the other states are unchanged (empty field). The Output shows the value that was sent.
- `DECISIONS.md`: 107.

### Checked (browser)

- VIEW, DATE: "3 Mar 26". With `ro` and LONG: "3 martie 2026". DATETIME with US: "martie 3, 2026, 2:30 PM".
- Range: "3 Mar 26 – 10 Mar 26". With maxRangeDays 5: "3 Mar 26 – 7 Mar 26". With minValue 2026-04-01: "1 Apr 26 – 5 Apr 26".
- TIME "14:30", MONTH "Mar 26", WEEK "W10 26". EDIT stays empty.
- No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 64 — 2026-10-26: Calendar Variants — 16 options in your order, no help text, locale as a Select

### Changed

- `client/adjustments/calendar.js`:
  - The Variants panel shows only these options, in this order: presentation, type, range, displayFormat, dateFormat, **locale**, minValue, maxValue, minRangeDays, maxRangeDays, showWeekNumbers, showToday, showClear, state, width, labelPosition (TOP / LEFT / INHERIT).
  - Everything else is hidden. The label "Due date", "Today", "Clear" and the weekend / holiday highlights keep their start values.
  - **help** now starts empty (`''`), so the live example has no help text.
  - **locale** is a Select: the page language (default), then seven languages whose calendar looks different. Each option shows how the 3rd of March is written, the month name and Monday:
    - en-GB — 3 Mar 26, March, Mon;
    - de — 3 Mär 26, März, Mo;
    - fr — 3 mars 26, mars, lun.;
    - ro — 3 mar. 26, martie, lun.;
    - hu — 3 márc. 26, március, H;
    - fi — 3 maalis 26, maaliskuu, ma;
    - el — 3 Μαρ 26, Μάρτιος, Δευ.
- App, `customizationPanel.js`: an option label that only adds to its value (e.g. "ro — 3 mar. 26 …") is no longer written into the help text in place of the value.
- `DECISIONS.md`: 106.

### Checked (browser)

- The panel shows exactly the 16 options, in this order. The live example has no help text.
- Calendar opened with `fr`: "octobre 2026", lun. mar. mer. … With `el`: "Οκτώβριος 2026", Δευ Τρί …
- `npm run check`: nothing unknown. No console errors.

### Consumer action

- Copy the two files and reload in a new tab.


## Delivery 63 — 2026-10-25: Table — striped rows visible on any background

### Fixed

- **Problem:** the table rows had no background of their own, so they showed the colour behind the table. The live example area is `--c-page`, the same grey (#eef0f2) as the zebra token `--c-surface-alt`, so the striped rows were invisible there. The same would happen on any page with that background.
- `table.css` (`ui-catalog/source`, `client/showcase-styling`, `client/local-styling`), part 1: the grid now has the surface colour `--c-surface` (#f7f8f9), like the bar above it, so the stripes stand out wherever the table is placed.
- `tableREADME.md`: the `--c-surface` token row.
- `DECISIONS.md`: 105.

### Checked (browser)

- In the live example: the grid is #f7f8f9, every second row #eef0f2, hover light blue, and selected the brand tint.
- No console errors.

### Note

- Your screenshot still shows 16px text: delivery 62 (smaller text, the three row colours) does not seem to be installed yet. This delivery contains the complete `table.css` with both changes.

### Consumer action

- Copy `table.css` to the three folders and the README to `ui-catalog/source/components-js/table/`.
- Run `npm run sync`, then hard-reload (Ctrl+F5).


## Delivery 62 — 2026-10-25: Table — smaller text, three row colours, smaller status icons

### Changed

- `table.css` (`ui-catalog/source`, `client/showcase-styling`, `client/local-styling`), part 1:
  - **Text size**: cells use `--fs-label` (14px; was `--fs-control`, 16px). Column headers use `--fs-caption` (12px; was 14px).
  - **Row colours**, three different ones:
    - every second row (alternateRows): `--c-surface-alt`, light grey (#eef0f2);
    - under the pointer (rowHover): `--c-info-soft`, light blue (#dbeafe; was `--c-surface-hover`, grey);
    - selected: `--c-selected`, the brand tint (#cfd9de). It now **stays under the pointer**, so a selected row never looks unselected.
- `tableREADME.md`: Features line on the row colours; Design tokens (`--fs-label` / `--fs-caption`, `--c-info-soft`, the selected rule), renumbered.
- `client/adjustments/table.js`: the status icons are smaller, `--icon-size-small` (12px; they followed the text size).
- `DECISIONS.md`: 104.

### Checked (browser)

- Cells 14px, headers 12px, status icons 12px.
- Rows: plain transparent; striped #eef0f2; selected the brand tint.
- Hover: #dbeafe on a plain row; a selected row keeps its colour under the pointer.
- No console errors.

### Where to change the colours

- `client/local-styling/table.css`, part 1, the three rules after the comment "rows, three different colours".

### Consumer action

- Copy `table.css` to the three folders, the README to `ui-catalog/source/components-js/table/`, and `client/adjustments/table.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5).


## Delivery 61 — 2026-10-25: locale descriptions rewritten

### Changed

- `tableREADME.md`:
  - "For developers" → Configuration, row `locale`: your text. It names the language whose rules sort text and write numbers, gives the fallback (page language, then browser language), and has two examples: language-specific sorting (Åsa / Örjan) and number format (12,000 / 12.000 / 12 000).
  - "For business" → Features, Sorting: text ignores upper and lower case ("Ana" / "ana"), and numbers inside text are sorted by value ("ORD-9" before "ORD-10").
- `paginationREADME.md`, `textAreaREADME.md`, `calendarREADME.md`: the `locale` row has one example, about the component's own use:
  - Pagination: page 1250 → "1,250" / "1.250" / "1 250";
  - TextArea: "4,800 characters left" / "4.800 characters left";
  - Calendar: "3 Mar 26" / "3 mar. 26" (also the short table of `formatCalendarValue` options).
- `DECISIONS.md`: unchanged.

### Note

- README table cells cannot contain line breaks or bullet lists: the app's Markdown reader writes text in cells as typed. So the two Table examples follow "For example:" on the same line, each starting with "•".

### Checked (browser)

- The Table page shows the new `locale` text in the README and in the Variants help, and the new Sorting line.
- `npm run check`: nothing unknown.

### Consumer action

- Copy the four READMEs to their component folders, run `npm run sync`, and reload.


## Delivery 60 — 2026-10-25: locale — back in the Table Variants with a demo; optional in Pagination, TextArea, Calendar

### Changed

- **Table** (library):
  - `locale` still only sorts text in the browser (CLIENT mode). It now also writes the numbers of the counts line and of "Select all {count} items" in that language: 12,000 / 12.000 / 12 000.
  - Table passes `locale` to its Pagination.
  - README: the `locale` row explains what it does and gives two sorting examples:
    - Swedish puts Å / Ö after Z;
    - Romanian puts Ș after every other S.
  - The row also covers the number example and SERVER mode. There is a new Features line.
  - The Variants help text shows the same description.
- **Pagination** (library): new optional `locale`. Page numbers on the buttons, in their screen-reader names and in the go-to-page error use the language's digit grouping (page 1250: "1,250" / "1.250" / "1 250"). README row.
- **TextArea** (library): new optional `locale` for the counter number ("4.800 characters left" in `de`). README row.
- **Calendar** (library): already had `locale`. Its README row is clearer now, with two examples: "3 Mar 26" / "3 mar. 26", and "3 days ago" / "acum 3 zile". It also says what `locale` does not decide: the day / month / year order (`dateFormat`) and the first day of the week (`firstDayOfWeek`).
- All four components: an invalid language tag gives `INVALID_OPTION`, and the page language is used.
- Components without language rules (Button, Message, Badge, …) do not get `locale`: their words come from `texts`.
- `client/adjustments/table.js`:
  - **locale** is back in the Variants panel: a Select of the page language (default), en, de, sv, ro.
  - The demo has 15 customers, including Åsa Lindqvist, Örjan Berg, Ștefan Ionescu, Sven Olsen and Zoltán Kiss.
  - itemsPerPage starts at 15, so a sort shows the whole order on one page.
- `DECISIONS.md`: 103.

### Checked (browser)

Sorting by Customer:
- `en`: … Lukas, **Örjan**, Sofia, **Ștefan**, Sven, Zoltán (Åsa second).
- `sv`: … Sofia, Ștefan, Sven, Zoltán, **Åsa, Örjan**.
- `ro`: … Sofia, **Sven, Ștefan**, Zoltán.

Number formatting:
- Pagination at page 1250: `en` 1,246 … 1,250; `de` 1.246 … 1.250; `sv` 1 246 … 1 250.
- TextArea `de` with maxLength 5000: "5.000 characters left".
- An invalid tag gives the warning and falls back to the page language.

No other console messages.

### Consumer action

- Copy the library files to their component folders and `client/adjustments/table.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 59 — 2026-10-25: Table — new sort arrows, zebra colour, CLIENT / SERVER explained; Variants with links, actions, status icons

### Changed

- Library, `ui-catalog/source/components-js/table/`:
  - `tableHTML.js`, `tableComponent.js`: **sort icons**:
    - not sorted: `fa-solid fa-up-down`;
    - ascending: `fa-solid fa-arrow-up`;
    - descending: `fa-solid fa-arrow-down`.
    - The icons are set by the JavaScript. The stylesheets only mention them in the header comment, which is updated in all three copies.
  - `table.css` (`ui-catalog/source`, `client/showcase-styling`, `client/local-styling`), part 1:
    - **alternateRows** now uses `--c-surface-alt` (the design system's zebra token). Before, it used `--c-surface-muted`, the same grey as `--c-surface-hover`.
    - The hover rule now comes after the alternate rule. Before, a striped row did not change colour under the pointer.
  - `tableREADME.md`:
    - new section **"CLIENT and SERVER data"**: a comparison table covering where the rows live, who sorts and pages, waiting and errors, item count, text sorting, "Select all", scrolling, and when to use each. A rule of thumb follows the table.
    - The `dataMode` row points to the new section.
    - Visual options (the new icons) and Design tokens (`--c-surface-alt`).
- `client/adjustments/table.js`:
  - **Variants panel**: label, columns, rows, selectionActions and locale are hidden (they keep their start values).
  - Three new checkboxes, unticked at the start:
    - **Show the links column**: "Invoice", a link per row (INV-1031 …);
    - **Show the actions column**: "Actions", all tertiary icon Buttons. One row in three has View; the next View + Edit; the third has more than two actions, so it shows one "more" button with an ActionMenu (View, Edit, Duplicate, Delete). Presses are shown in the Output;
    - **Show status icons**: a coloured icon before each status (New info, Paid accent, Shipped warning, Delivered success, Cancelled danger). The text stays.
  - Customers from 12 European countries: Ana Popescu, Lukas Müller, Chloé Martin, Giulia Bianchi, Javier García, Sofia Andersson, Jan Kowalski, Eva Novotná, Pieter de Vries, Katalin Nagy, João Silva, Maria Papadopoulou.
  - Column priorities:
    - Order and Actions are always shown;
    - Customer, Status and Invoice come next;
    - then Date, which has a short view, then Total.
  - The live example is laid out **900px wide** (scaled down on narrower pages). Before, a 1440px window gave a 592px example, below the 40rem card breakpoint, so the table appeared as cards.
- `DECISIONS.md`: 102.

### Checked (browser)

- Sort icons: ↕ unsorted; ↑ after one click; ↓ after two.
- Alternate rows: even rows #eef0f2; under the pointer #dfe3e7.
- With the three checkboxes ticked:
  - columns: Order, Invoice, Customer, Status (with icons), Actions;
  - actions: 1 / 2 / menu per row;
  - the menu opens next to its button, and an action press appears in the Output.
- At 1440px and 1600px windows, the table shows its columns instead of cards.
- No console errors.

### Known

- The ActionMenu "more" button has the filled background from delivery 40, while the other action buttons are plain tertiary icons. If you want it plain inside tables, remove or scope the trigger background rule in `actionMenu.css`.

### Consumer action

- Copy the four library files to `ui-catalog/source/components-js/table/`, the two stylesheets, and `client/adjustments/table.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 58 — 2026-10-24: App header search — app field look, secondary icon button

### Changed

- `client/local-styling/searchBox.css` (app look only; marked `[APP]`), the same as the app's TextInput and Select:
  - the field has only a bottom line, and square corners;
  - the text height counts one border.
  - The library and `showcase-styling` are unchanged, so the SearchBox live example keeps the library look.
- `client/app/appShell.js`: the header search Button is now `searchButtonVariant:'ICON_BUTTON'` with `searchButtonHierarchy:'SECONDARY'`: a round magnifier button with a border, named "Search".
- `DECISIONS.md`: 101.

### Checked (browser)

- Header: field borders 0 / 1px bottom / 0, corners 0. The button is a secondary icon Button named "Search"; the field and the button are both 40px high.
- Typing "button" and pressing the button opens the Search page with that text.
- No console errors.

### Consumer action

- Copy the two files and hard-reload (Ctrl+F5).


## Delivery 57 — 2026-10-24: SearchBox — no field icon, Search button looks, width; chip check mark after the label

### Changed

- Library, `ui-catalog/source/components-js/searchBox/`:
  - `searchBoxHTML.js`, `searchBox.css`: **the magnifying glass at the start of the field is removed**.
    - While the application is busy (`setBusy(true)`), a spinner now appears at the end of the field instead (`span.ui-search-box-busy-icon`); it is still static with reduced motion.
  - `searchBoxConfig.js`, `searchBoxComponent.js`: new options for the Search Button (with `showSearchButton`; otherwise ignored with `OPTION_IGNORED`):
    - **searchButtonVariant**: `BUTTON` (default) | `ICON_BUTTON`. The icon Button shows the magnifying glass, named "Search" (`texts.search`) for screen readers.
    - **searchButtonHierarchy**: `PRIMARY` (default) | `SECONDARY` | `TERTIARY`.
    - **searchButtonIcon**: boolean, default false, `BUTTON` only. It shows the magnifying glass before "Search", always on the left of the text.
  - New option **width**: `SMALL` | `MEDIUM` | `LARGE` | `FULL` (default) | `FIT_CONTENT`, as TextInput.
    - Class `ui-search-box-width-*`, with the same tokens (`--percentage-s/m/l/full`).
    - With the label on the left, SMALL / MEDIUM / LARGE size the field column.
  - `searchBoxREADME.md`: Features, Structure, Visual options, Configuration (4 rows), Errors, Design tokens.
- Library, `checkboxRadio/checkboxRadioHTML.js`: in the CHIP look, the **check mark of a selected chip is now after the label** (`iconAfter`). This is the same component as the SearchBox scope chips, so both change. README: one Features line.
- `client/adjustments/searchBox.js`: the Variants panel, in this order:
  - labelVisible, searchMode, debounceMs (LIVE only), showSearchButton;
  - then, with the Button: searchButtonVariant, searchButtonHierarchy, and searchButtonIcon (text Button only);
  - labelPosition (TOP / LEFT / INHERIT), autocomplete, landmark, width;
  - **Show search scopes**: a checkbox, unticked at the start, that adds "Everything", "Orders", "Customers".
- `DECISIONS.md`: 100.

### Checked (browser)

- Start: no icon in the field; primary "Search" Button; no scopes.
- Magnifier on, SECONDARY, MEDIUM, scopes: the magnifier is before "Search", the box is 50% wide, and "Orders ✓" shows the check after the label and its hint.
- ICON_BUTTON, TERTIARY, FIT_CONTENT: a magnifier-only Button named "Search"; the magnifier option is greyed out.
- Label on the LEFT with SMALL: the row keeps the full width, and the field column is 25%.
- The app header search has no icon in the field any more.
- No console errors.

### Known

- The header search of the app (AppHeader) loses its magnifier too. To have one on its Button, add `searchButtonIcon:true` (or `searchButtonVariant:'ICON_BUTTON'`) to the `search` settings in `client/app/appShell.js`.

### Consumer action

- Copy the five SearchBox files to `ui-catalog/source/components-js/searchBox/`, the two CheckboxRadio files to `…/checkboxRadio/`, the two stylesheets, and `client/adjustments/searchBox.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 56 — 2026-10-24: CollapsiblePanel Variants — showSummary checkbox

### Changed

- `client/adjustments/collapsiblePanel.js`:
  - New checkbox **showSummary** ("Show summary", unticked at the start), after Add chips. It adds the summary line "Customer since 2019 · 42 orders · last order 12 Oct" under the header, through `summaryRenderer`.
  - It also sets `showSummaryWhenExpanded`, so the line is visible both closed and open.
  - The placeholder "No account information available" (`summaryEmptyText`) is no longer set, so without the checkbox there is no summary line at all.
- `DECISIONS.md`: 99.

### Checked (browser)

- Unticked: no summary line, open or closed.
- Ticked: the line shows open and closed.
- No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 55 — 2026-10-24: CollapsiblePanel — border and corner options; Variants panel with icon, button and chips

### Changed

- Library, `ui-catalog/source/components-js/collapsiblePanel/`:
  - `collapsiblePanelConfig.js`: two new options for the card frame (variant DEFAULT and COMPACT; with INLINE they are ignored with `OPTION_IGNORED`):
    - **bordered**, default false;
    - **cornerRadius**: `NONE` | `ROUNDED`, default `ROUNDED` (`--radius-panel`).
  - `collapsiblePanelHTML.js`: the classes `ui-collapsible-panel-bordered` and `ui-collapsible-panel-square`.
  - `collapsiblePanel.css` (also in `client/showcase-styling`), part 1:
    - **New default look (your choice, as for Message): no thin border.** The card keeps the thick status edge on the left, the background, the shadow and the rounded corners.
    - `bordered` adds the thin border on the other three sides (the previous look).
    - `.ui-collapsible-panel-square` sets the corners to 0.
  - `client/local-styling/collapsiblePanel.css`: the same rules. Your `[APP]` choice (no frame and no status edge) stays as it was, so the app's own panels (Description page, README sections, Output) look the same.
  - `collapsiblePanelREADME.md`:
    - Features: the three variants explained:
      - **Default**: a card, for the main sections of a page;
      - **Inline**: no card, a line below; for lists, FAQs, panels inside another card or form;
      - **Compact**: the card with less spacing, for dense screens and nested panels.
    - The `variant` row explains the same.
    - New rows `bordered` and `cornerRadius`; Structure, Visual options, Design tokens and Errors.
- `client/adjustments/collapsiblePanel.js`: the Variants panel, in this order:
  - collapsible, state, status, variant;
  - **icon**: a Select of NONE (start), `fa-solid fa-user`, `fa-solid fa-id-card`, `fa-solid fa-gear`;
  - **Add button** (checkbox, unticked): the "Edit" Button;
  - **Add chips** (checkbox, unticked): the "Draft" and "3" Chips;
  - **bordered** (start off) and **cornerRadius** (NONE | `--radius-panel`), greyed out for INLINE.
  - Title, description and the summary text keep their start values.
- App, `customizationPanel.js`: a Select whose values include NONE no longer adds a separate "Default ('')" entry.
- `DECISIONS.md`: 98.

### Checked (browser)

- Start: no icon, no Chips, no Button; borders 0 / 0 / 0, left edge 2px, corners 8px.
- Gear icon, Add button, Add chips, bordered on, cornerRadius NONE, status WARNING: icon, 2 Chips, 1 Button, 1px border around, corners 0, orange edge.
- INLINE: bordered and cornerRadius are greyed out; bottom line only.
- `npm run check`: no ambiguous or unknown options. No console errors.

### Consumer action

- Copy the four library files to `ui-catalog/source/components-js/collapsiblePanel/`, the two stylesheets, `client/adjustments/collapsiblePanel.js` and `client/app/customization/customizationPanel.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 54 — 2026-10-24: Breadcrumbs live example — Weather level added

### Changed

- `client/adjustments/breadcrumbs.js`:
  - Path: Home › Europe › Romania › **Weather** › Forecast › Rain (6 levels).
  - maxItems: 6 — all levels (start), 5, 4, 3, 1 — back link only.
- `DECISIONS.md`: 97 updated.

### Checked (browser)

- Start: all 6 levels, and Romania's menu still lists the five countries.
- 5: Home … Weather › Forecast › Rain. 4: Home … Forecast › Rain. 3: Home … Rain. 1: "Back to Forecast".
- No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 53 — 2026-10-24: Breadcrumbs live example — Home › Europe › Romania › Forecast › Rain

### Changed

- `client/adjustments/breadcrumbs.js`:
  - Path: Home › Europe › Romania › Forecast › Rain (5 levels).
  - Romania's sibling menu ("Other countries"): Bulgaria, Hungary, Moldova, Romania (highlighted), Serbia.
  - maxItems: 5 — all levels (start), 4, 3, 1 — back link only ("Back to Forecast").
- `DECISIONS.md`: 97.

### Checked (browser)

- Start: all 5 levels, and the arrow next to Romania opens the five countries with Romania highlighted.
- 4: Home … Forecast › Rain. 3: Home … Rain. 1: "Back to Forecast".
- No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 52 — 2026-10-24: Breadcrumbs Variants — 7 levels, maxItems select with back link, sibling menu

### Changed

- `client/adjustments/breadcrumbs.js`:
  - **Live example**: a path of 7 levels — Home › Sales › Customers › Europe › Romania › Northwind SRL › Order ORD-1042.
  - **Variants panel**, in this order:
    - **maxItems**: a Select, starting at "7 — all levels", with 6, 5, 4 and 3, where the middle levels go into the "…" menu.
    - "1 — back link only": `backLinkOnNarrow` (not in the panel, always on) replaces the path with "Back to Northwind SRL" when the space is narrower than 30rem. So for 1 the example is drawn in a narrow box (`--size-md-4`, 400px), where the back link appears.
    - **separator**, **homeIcon** (on), **showCurrent** (on).
    - **siblingsMenu**: a checkbox, "Add a menu of sibling pages", starting ticked. An arrow button next to "Romania" opens a menu with Hungary, Romania and Serbia, with Romania highlighted. Greyed out for maxItems 1.
  - Hidden: items, backLinkOnNarrow, structuredData, texts.
- App:
  - `preview.css`: `.app-preview-narrow`, the narrow box.
  - `customizationPanel.js`: a Select of numbers no longer adds a "Default (…)" entry when the default is one of its values.
- `server/build-catalog.js`: the definition under a component's name is the README's first sentence. It was cut at "e.g." — for Breadcrumbs it showed only "…to the current page (e.g.". Abbreviations (e.g., i.e., etc., vs.) and full stops inside parentheses no longer end the sentence. Only Breadcrumbs was affected.
- `DECISIONS.md`: 96.

### Checked (browser)

- Start: all 7 levels, house icon, and the arrow button next to Romania.
- 4: Home … Northwind SRL › Order ORD-1042, with the "…" menu. 3: Home … Order ORD-1042.
- 1: "Back to Northwind SRL" only; siblingsMenu is greyed out.
- No console errors.
- The Breadcrumbs definition now shows the whole sentence.

### Consumer action

- Copy the files, run `npm run catalog` (rebuilds `client/data/catalog.json` with the full definition), and reload in a new tab.


## Delivery 51 — 2026-10-24: TextInput Variants — number kind toggle and range for NUMBER

### Changed

- `client/adjustments/textInput.js`: after **type**, three entries that are active for type NUMBER:
  - **validation.numberType**: a Toggle with both values beside the switch (stateDisplay BOTH), REAL on the left and INTEGER on the right. It starts at INTEGER.
  - **validation.minValue** (start 1) and **validation.maxValue** (start 100). Either can be left empty for no limit.
  - The placeholder and the help text follow these choices, e.g. "A whole number from 1 to 100." or "A number (decimals allowed) from 0 to 9.99." With INTEGER, `step:1` is sent too.
  - The action button for NUMBER is now "Reset to the minimum".
- App:
  - `customizationModel.js` and `customizationPanel.js`: a new adjustment key `toggles: { path:{ off, on } }` shows a two-value option as a Toggle with both values written beside it. Any component can use it.
- `DECISIONS.md`: 95.

### Checked (browser)

- TEXT: the three entries are greyed out. NUMBER: they are active, starting at INTEGER / 1 / 100.
- INTEGER: 2.5 gives "Enter an integer."
- REAL, 0 to 9.99: 2.5 is accepted; 12 gives "Maximum value is 9.99."
- No console errors.

### Consumer action

- Copy the three files and reload in a new tab.


## Delivery 50 — 2026-10-24: TextInput Variants panel — five options, icon and button checkboxes, rules per type

### Changed

- `client/adjustments/textInput.js`:
  - **Variants panel**, in this order: state, width, labelPosition (TOP / LEFT / INHERIT), type, passwordToggle, then two checkboxes, each with an explanation underneath:
    - **withIcon** ("Show an icon"): a decorative icon at the end of the field, chosen for the type (TEXT user, EMAIL envelope, NUMBER #, URL globe, TEL phone). It cannot be clicked, and screen readers skip it.
    - **withButton** ("Show an action button"): an action Button at the end of the field, with its own name (TEXT "Search customers", EMAIL "Send a test e-mail", NUMBER "Reset to 1", URL "Open the website", TEL "Copy the number"). Pressing it is shown in the Output.
    - With both ticked, only the Button is shown, as in the component (the Button takes the icon's place). Both are greyed out for PASSWORD and outside EDIT.
  - The **texts** and **validation** groups and all other options are gone from the panel.
  - **Hidden, set for the chosen type**: label, placeholder, help, and the validation rules, switched on:
    - TEXT: 2–40 characters;
    - EMAIL: 6–80;
    - PASSWORD: at least 8;
    - URL: 10–120;
    - TEL: 6–20;
    - NUMBER: a whole number from 1 to 100 (`numberType:'INTEGER'`, `minValue:1`, `maxValue:100`, `step:1`), label "Quantity".
- `DECISIONS.md`: 94.

### Checked (browser)

- The panel shows exactly the seven entries.
- TEXT with the icon: user icon. With the Button: "Search customers"; pressing it shows `iconArea.iconButton.onClick` in the Output.
- NUMBER: `input type=number`, label "Quantity"; entering 150 shows "Maximum value is 100."
- PASSWORD: both checkboxes are greyed out, with the eye toggle; entering "abc" shows "Minimum 8 characters."
- No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 49 — 2026-10-24: Pagination Variants panel without label and texts

### Changed

- `client/adjustments/pagination.js`: the Variants panel shows only these options, in the README order:
  - totalItems, itemsPerPage, currentPage, visiblePageCount, arrowVisibilityThreshold;
  - showGoToPage, goToPageThreshold.
- Removed from the panel: **label** (it keeps its start value "Orders pages", which screen readers hear as the navigation name) and the whole **texts** group (English defaults).
- `DECISIONS.md`: 93.

### Checked (browser)

- The panel shows exactly the seven options.
- Live example: navigation "Orders pages", pages 1 … 3 4 5 6 7 … 24, with the go-to-page field.
- `npm run check`: pagination has 7 options in the panel, nothing unknown. No console errors.

### Consumer action

- Copy the file and reload in a new tab.


## Delivery 48 — 2026-10-24: Message — text one step smaller than the title

### Changed

- `message.css` (`ui-catalog/source`, `client/showcase-styling`, `client/local-styling`):
  - part 1 APPEARANCE: the text (with its link) and the details use `--fs-label` (14px); the title keeps the control size (16px, bold), so it leads. MODAL keeps its larger title (20px). INLINE was already 14px.
  - part 3 STRUCTURE: without a title, the icon lines up with the smaller first text line.
- `messageREADME.md`: Look sentence and the `--fs-label` token row.
- `DECISIONS.md`: 92.

### Checked (browser)

- BLOCK, TOAST, BANNER: title 16px; text, link and details 14px.
- MODAL: title 20px; text 14px.
- INLINE: 14px, as before.

### Consumer action

- Copy `message.css` to the three folders and the README to `ui-catalog/source/components-js/message/`. Run `npm run sync`, then hard-reload (Ctrl+F5).


## Delivery 47 — 2026-10-24: Message — remaining time shown as a bar and/or text; toast buttons fixed

### Changed

- Library, `ui-catalog/source/components-js/message/`:
  - `messageConfig.js`: new option **remainingIndicator**: `NONE` (default, so existing pages do not change) | `BAR` | `TEXT` | `BAR_AND_TEXT`.
    - It applies only to a temporary message (`duration` set) that is not INLINE. Otherwise it is ignored with an `OPTION_IGNORED` warning.
    - New texts: `texts.remaining` ("Closes in {seconds} s"), `texts.paused` ("Paused") and `texts.closesIn` ("Closes by itself in {seconds} seconds.").
  - `messageHTML.js`: a `div.ui-message-remaining` at the end of the body, holding:
    - the bar and/or the text, both hidden from screen readers (they change all the time);
    - one visually hidden sentence, read once with the message.
  - `messageComponent.js`:
    - the indicator is updated every 0.1 s;
    - it stops and shows "Paused" while the pointer is over the message or it has focus;
    - with reduced motion, the bar moves in whole seconds.
  - `message.css` (also in `client/showcase-styling` and `client/local-styling`):
    - part 1 APPEARANCE: small text; bar track and fill in the message's text colour (the type colour), with rounded ends; a lighter fill while paused;
    - part 2 DIMENSIONS: bar thickness `--space-sm-2`; space above the indicator and between bar and text; the text has a fixed minimum width (`--size-md-1`), so the bar does not jump when "Closes in 5 s" becomes "Paused";
    - part 3 STRUCTURE: layout of the indicator, and the BANNER placing it on its own line.
  - `messageREADME.md`: Features, Structure, Visual options, Design tokens, Configuration (`remainingIndicator` and the three texts), Errors, Accessibility.
- `client/adjustments/message.js`: **remainingIndicator** after closeAfterSeconds.
  - It starts at **BAR AND TEXT**.
  - It is active only when "Close after the seconds below" is ticked, and not for INLINE.
  - It is not sent when it does not apply, so the console stays free of warnings.
- `DECISIONS.md`: 91. To-do under Open decisions: assess the indicator for Form's toasts.

### Fixed

- **Message TOAST buttons did nothing** (problem present before this delivery). To announce a toast, the component copied the body's HTML, including the already-drawn buttons. Then it drew the buttons again with the same ids:
  - the console showed `DUPLICATE_ID` for each action;
  - the copied buttons had no click handling.
  
  The body is now built again instead of copied: "Undo" reports `onAction`, and there are no warnings. This also affected messages shown with `show()` or changed with `update()` while visible.

### Checked (browser)

- BLOCK, 6 s, BAR AND TEXT:
  - at 1.5 s: bar at 75% and "Closes in 5 s";
  - with the pointer over the message: "Paused", lighter fill, bar stopped, and the bar keeps its width;
  - after the pointer leaves: it continues, "Closes in 4 s".
- The screen-reader sentence is "Closes by itself in 6 seconds."
- BANNER with TEXT: text only, on its own line. TOAST with BAR: bar only.
- INLINE: the indicator is greyed out and not drawn.
- Reduced motion, 4 s: at 1.3 s the bar is exactly at 3/4 (whole seconds).
- TOAST: 2 working buttons, `onAction` reported, no console warnings or errors.

### Consumer action

- Copy the five library files to `ui-catalog/source/components-js/message/`, the two stylesheets, and `client/adjustments/message.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 46 — 2026-10-24: Message Variants — close after a number of seconds

### Changed

- `client/adjustments/message.js`: two panel options after closable:
  - **autoClose**, a checkbox "Close after the seconds below";
  - **closeAfterSeconds**, a text field starting at 5 (decimals allowed; an empty value or a number of 0 or less uses 5). Active only when autoClose is checked.
  - They are sent as the README option `duration` (seconds × 1000 milliseconds).
  - Both are greyed out for MODAL (it waits for the user) and for DANGER (errors stay until the user acts), as the README says.
  - The timer pauses while the pointer is over the message or it has focus. **Render** shows the message again.
- App: a checkbox can have its own text through `valueLabels` (`customizationPanel.js`, `customizationModel.js`); otherwise it stays "Use <value>".
- `DECISIONS.md`: 90.

### Checked (browser)

- BLOCK, autoClose on, 2 seconds: visible at 0.8 s and gone at 2.8 s. The Output shows `duration: 2000` and `onClose` with reason `TIMEOUT`.
- DANGER: autoClose and closeAfterSeconds are greyed out.
- No console errors.

### Consumer action

- Copy the three files and reload in a new tab.


## Delivery 45 — 2026-10-24: Message MODAL — focus goes to the first button, not to the link

### Fixed

- `ui-catalog/source/components-js/message/messageComponent.js`:
  - **Before:** when a MODAL opened without `defaultAction` (and was not DANGER), the component let the browser choose where focus goes. The browser picks the first focusable element, the "View the order" link, and draws its keyboard focus ring (the dotted line) around it.
  - **Now:** focus goes to the first button, as the README already says. DANGER still focuses the cancel action; `defaultAction` still wins.
  - Other layouts do not move focus when they appear, so they never showed the ring.
- `DECISIONS.md`: 89.

### Checked (browser)

- MODAL INFO: focus on "Undo", and the link has no outline.
- MODAL DANGER: focus on "Close" (the cancel action).
- No console errors.

### Consumer action

- Copy the file to `ui-catalog/source/components-js/message/`, run `npm run sync`, then hard-reload (Ctrl+F5).


## Delivery 44 — 2026-10-24: Message — border and corner options; Variants panel with five options

### Changed

- Library, `ui-catalog/source/components-js/message/`:
  - `messageConfig.js`: two new options, for BLOCK, TOAST and MODAL only (a warning if they are set with INLINE or BANNER):
    - **bordered** (default false);
    - **cornerRadius**: `NONE` | `ROUNDED`, default `ROUNDED` = `--radius-control`.
  - `messageHTML.js`, `messageComponent.js`: the classes `ui-message-bordered` and `ui-message-square`, kept by `update()` too.
  - `message.css` (also in `client/showcase-styling` and `client/local-styling`), part 1:
    - **New default look (your choice): no thin border.** Boxes keep only the thicker coloured left edge (on the start side) and the rounded corners.
    - `.ui-message-bordered` adds the thin border on the other three sides (the previous look).
    - `.ui-message-square` sets the corners to 0.
    - BANNER (bottom line) and INLINE (no box) are unchanged.
  - `messageREADME.md`:
    - Configuration rows `bordered` and `cornerRadius`;
    - Look, Visual options and the `--border-thin` token;
    - Errors (`INVALID_OPTION`, `OPTION_IGNORED`).
- `client/adjustments/message.js`: the Variants panel shows only these options, in this order:
  - layout, type, closable;
  - **bordered**, starting off;
  - **cornerRadius**: NONE | `--radius-control`.
  - Title, text, details, link and actions keep their start values.
- `DECISIONS.md`: 88.

### Checked (browser)

- Start values (BLOCK, bordered off): borders 0 / 0 / 0, left edge 2px, corners 8px.
- bordered on with cornerRadius NONE: borders 1px on top, right and bottom, left edge 2px, corners 0. Same for MODAL.
- INLINE: bordered and cornerRadius are greyed out.
- The AppHeader, Form and Table pages (which use Message) open with no console errors.

### Known

- Every Message box (BLOCK, TOAST, MODAL) in every app now has no thin border unless `bordered:true` is set. This includes the messages inside Form, Table, SearchBox and AppHeader.

### Consumer action

- Copy the five library files to `ui-catalog/source/components-js/message/`, the two stylesheets, and `client/adjustments/message.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5) in a new tab.


## Delivery 43 — 2026-10-24: CheckboxRadio Variants panel with seven options

### Changed

- `client/adjustments/checkboxRadio.js`: the Variants panel shows only these options, in this order:
  - selectionMode, presentation, direction;
  - iconVariant, iconSize (active for presentation ICON);
  - labelPosition (TOP / LEFT / INHERIT);
  - groupLabel, starting at "Priority".
- All other options are hidden. The four options (Alpha, Beta selected, Gamma, Delta disabled), the "Select one option." text and the README defaults keep their start values.
- `DECISIONS.md`: 87.

### Checked (browser)

- The panel shows exactly the seven options, in this order, and groupLabel starts at "Priority".
- presentation ICON with direction HORIZONTAL: rendered with the icon look, side by side, with the legend "Priority".
- `npm run check`: checkboxRadio has 7 options in the panel, nothing unknown. No console errors.

### Consumer action

- Copy the file and reload. Open the page in a new tab to see the start values.


## Delivery 42 — 2026-10-23: Badge — one row of examples, more padding for link and button, new start values

### Changed

- `client/adjustments/badge.js`:
  - **Start values** (Variants panel and live example), as in your screen capture: name "John Doe", description "Super Hero", picture INITIALS, status UNREAD, size MEDIUM, layout HORIZONTAL, interaction BUTTON, background PAGE.
  - **Examples** ("Typical variants"): only one row is left, "Team members and channels":
    - ONLINE, AWAY and BUSY, with the status dot in the **bottom-left** corner;
    - AWAY uses the long name and description ("Alexandra-Maria Constantinescu-Popovici", "Away until 14:00, head of customer operations, Europe"), cut with "…", with the full text as a tooltip;
    - Support channel (icon, 3 unread messages) on the same row.
  - Removed: "Signed-in user in the header", "Other uses", "Text", "Sizes".
- Library, `badge.css` (`ui-catalog/source`, `client/showcase-styling`, `client/local-styling`), part 2 DIMENSIONS: a link or button badge (`.ui-badge-interactive`) has more padding, `--space-sm-3` top and bottom and `--space-md-3` left and right (8px / 12px; before: 4px all round). Display-only badges keep 4px.
- `badgeREADME.md`: Look (more space around link and button badges); Design tokens `--space-sm-3` and `--space-md-3`.
- App, examples: `wide` (delivery 41) is replaced by **`fit:true`**: each example is as wide as its content (at most 210px) and the examples sit side by side, wrapping only when there is no room. The label wraps under its example instead of widening it (`customizationModel.js`, `previewIndex.js`, `preview.css`).
- `DECISIONS.md`: 86.

### Checked (browser)

- On first load, the panel shows John Doe / Super Hero / INITIALS / UNREAD / MEDIUM / HORIZONTAL / BUTTON / PAGE. The live example is a `button` with "JD", the count 3, and 8px 12px padding.
- The examples sit on one row, in a 760px-wide area: Ana Pop, Alexandra-Maria … (cut), Chloé Martin, Support. The dots are bottom-left. Support is a link with the new padding; the three team members are display only, with 4px padding. In a narrow window the row wraps, two per line, with nothing overlapping.
- The Notification examples are unchanged. No console errors.

### Consumer action

- Copy the files:
  - `badge.css` to `ui-catalog/source/components-js/badge/`, `client/showcase-styling/` and `client/local-styling/`;
  - `badgeREADME.md` to `ui-catalog/source/components-js/badge/`;
  - the four app files.
- Then run `npm run sync` and hard-reload (Ctrl+F5).
- The panel keeps your choices while the browser tab is open. To see the new start values, open the page in a new tab.


## Delivery 41 — 2026-10-23: Badge — rebuilt live example, meaningful Variants, Examples section

### Changed

- `client/adjustments/badge.js`, Variants panel, in this order:
  - **name**, **description** (as before);
  - **picture**: INITIALS (taken from the name) | ICON | IMAGE | NONE (text only) — replaces the `notification` object you had to type;
  - **status**: NONE | ONLINE (green circle) | AWAY (orange triangle) | BUSY (red square) | UNREAD (count 3). Status dots sit bottom-right, the count top-right. Greyed out when picture is NONE;
  - **size**, **layout** (as before);
  - **interaction**: LINK (href "#profile") | BUTTON (onClick, reported in the Output when you click the badge) | DISPLAY ONLY;
  - **background**: PAGE | SURFACE (light header bar) | BRAND (brand-coloured header bar; sets colorToken and descriptionColorToken to `--c-on-accent`).
  - Removed from the panel: `notification`, `href`, `colorToken`, `descriptionColorToken` (now produced by the options above).
- Live example: the badge is placed on the chosen background (a bar like a page header for SURFACE and BRAND). The picture for IMAGE is now brown, so it no longer blends into the brand bar.
- New **Examples** section (before the README):
  - signed-in user in the header (light bar, brand bar, small without description);
  - team members (online / away / busy);
  - other uses (record owner as text only, support channel with an icon and an unread count, vertical layout for a team page);
  - text (no marker; a long name and description cut with "…");
  - sizes.
- App (examples, available to every component):
  - `customizationModel.js` and `previewIndex.js`: an example group can have `wide:true` (wider columns, for components with text), and an example can have `surface:'SURFACE'` or `'BRAND'` (shown on a light or brand-coloured bar).
  - `preview.css`: the bar styles; an example can no longer widen its column, so long text is cut by the component instead of overlapping the next example.
- `DECISIONS.md`: 85.

### Checked (browser)

- Panel shows exactly the eight options. status is greyed out for picture NONE.
- IMAGE + AWAY + BUTTON + BRAND: a `button` on the brand bar, light text, orange triangle; clicking it shows onClick in the Output.
- ICON + UNREAD + DISPLAY ONLY + SURFACE + VERTICAL: a `span` (not focusable) on the light bar; the screen reader text is "Ana Pop, Administrator, 3 new".
- NONE + LINK + LARGE: a link to #profile, text only.
- Examples: three per row, no overlap, and the long name is cut with "…". The Notification examples look the same as before.
- `npm run check`: badge has 8 options in the panel, nothing unknown. No console errors.

### Consumer action

- Copy the four files and reload. No `npm run sync` needed (no library file changed).


## Delivery 40 — 2026-10-23: ActionMenu — icon choice, border option, filled trigger, menu opens to the side with room

### Changed

- Library, `ui-catalog/source/components-js/actionMenu/`:
  - `actionMenuConfig.js`: new option **bordered** (default false).
  - `actionMenuComponent.js`:
    - bordered true makes the trigger a secondary icon Button (with a border); false keeps the tertiary one (no border);
    - **horizontal placement** (not done before; only the up/down choice existed): the menu lines up with the trigger's end edge as before; when it does not fit on that side of the window, it lines up with the trigger's start edge instead and opens towards the other side; if it fits on neither side, it is kept inside the window. Mirrored in right-to-left languages.
  - `actionMenu.css` (also in `client/showcase-styling` and `client/local-styling`), part 1: the trigger has a filled background `--c-surface-muted` (it was transparent for tertiary), darker `--c-border` under the pointer and while pressed, so it stands out from the area behind it.
  - `actionMenuREADME.md`: Configuration row `bordered`; Features (left/right placement); Structure; Visual options (border, background); Design tokens (`--c-surface-muted`, `--c-border`).
- `client/adjustments/actionMenu.js`: the Variants panel shows only:
  - **icon**: a Select of four icons — `fa-solid fa-ellipsis-vertical` (default), `fa-solid fa-ellipsis`, `fa-solid fa-bars`, `fa-solid fa-gear`;
  - **size**;
  - **bordered**: on = secondary Button, off = tertiary Button.
  - label, disabled and the six menu items keep their start values.
- `DECISIONS.md`: 84.

### Where to change the trigger background

- `client/local-styling/actionMenu.css`, part 1 APPEARANCE, first two rules:
  - `.ui-action-menu .ui-button { background-color:var(--c-surface-muted); }` — the normal background;
  - `.ui-action-menu .ui-button:hover:not(:disabled), .ui-action-menu .ui-button:active:not(:disabled) { background-color:var(--c-border); }` — under the pointer and pressed.
- Use a token different from the area behind the trigger (the live example area is `--c-page`).

### Checked (browser)

- Variants panel: exactly icon, size, bordered. Render with bordered on and the gear icon: secondary Button with a 1px border and the gear; off: tertiary, no border.
- Trigger background `--c-surface-muted` (#dfe3e7) for both; hover `--c-border` (#c8ced4).
- Placement in a 640px-wide example area, menu 184px wide:
  - trigger 20px from the left edge: the menu starts at the trigger's left edge (before: pushed against the window edge);
  - trigger at the right edge: the menu ends at the trigger's right edge;
  - trigger in the middle: the menu ends at the trigger's right edge (unchanged);
  - trigger 2px from the edge (room on neither side): the menu is kept 4px inside the window.
- `npm run check`: actionMenu has 3 options in the panel, nothing unknown. No console errors.

### Known

- The filled background also shows on the ActionMenu triggers inside Breadcrumbs (the "…" for hidden levels) and AppHeader, because they use the same component. To keep it only in some places, scope the two rules in your local stylesheet.
- Still open from the to-do list: the NotificationsPanel opening direction (a separate component, not changed here).

### Consumer action

- Copy the four library files to `ui-catalog/source/components-js/actionMenu/`, the two stylesheets to `client/showcase-styling/` and `client/local-styling/`, and `client/adjustments/actionMenu.js`.
- Run `npm run sync`, then hard-reload (Ctrl+F5).


## Delivery 39 — 2026-10-23: ContentGroup Variants panel; different content for FIELDSET and SECTION

### Changed

- `client/adjustments/contentGroup.js`:
  - the Variants panel shows only these options, in this order:
    - **label**, starting at "Personal data";
    - **title**, starting empty, active for SECTION;
    - **bordered**, starting on;
    - **semantic**;
    - **headingLevel**, active for SECTION with a title;
    - **direction**.
  - All other options are hidden. The description "Used for your invoices." keeps its start value.
  - The live example's content follows semantic:
    - **FIELDSET:** three TextInputs (first name, last name, e-mail), a group of inputs;
    - **SECTION:** the same person as read-only text (Name, E-mail, City), static content with nothing to fill in.
- `DECISIONS.md`: 83.

### Checked

- FIELDSET: rendered as `fieldset` with 3 inputs.
- SECTION with title "Customer" and HORIZONTAL: rendered as `section` with an `h3` heading, no inputs, and the three items side by side.
- title and headingLevel are greyed out when they do not apply.
- `npm run check`: no unknown option. No console errors or developer warnings.

### Consumer action

- Copy the file and reload.


## Delivery 38 — 2026-10-23: Toggle Variants panel with eight options

### Changed

- `client/adjustments/toggle.js`: the Variants panel shows only these options, in this order:
  - presentation, state, stateText, stateDisplay;
  - **texts.customOn** and **texts.customOff**: the custom pair, starting with "Yes" / "No", active when stateText is CUSTOM;
  - size, labelPosition (TOP / LEFT / INHERIT).
- All other options are hidden. Label and help keep their start values.
- `DECISIONS.md`: 82.

### Checked

- The panel lists exactly the eight options.
- The custom texts are greyed out until stateText is CUSTOM.
- With "Enabled" / "Disabled" and stateDisplay BOTH, the switch shows "Disabled" before it and "Enabled" after it.
- `npm run check`: no unknown option. No console errors.

### Consumer action

- Copy the file and reload.


## Delivery 37 — 2026-10-23: TextArea — help and counter on one line; panel changes

### Changed

- **TextArea (library: ui-catalog source, showcase-styling, local-styling):**
  - the help text now sits in the footer, on the left of the counter, on the same line; long help wraps while the counter stays on the right;
  - a validation error appears on its own line below them;
  - files: `textAreaHTML.js`, `textArea.css` (all copies), and `textAreaREADME.md` (structure and regenerated tables).
- **Variants panel** (`client/adjustments/textArea.js`):
  - mandatory and mandatoryIndicator are removed;
  - **validation.maxLength** is added (it starts at 40) before counterWarningThreshold;
  - showCounter now comes after counterWarningThreshold.
  - Order: state, width, labelPosition, spellcheck, rows, autoGrow, maxRows, resize, validation.maxLength, counterWarningThreshold, showCounter, errorVisibilityDuration.
- `client/app/customization/customizationModel.js`: options listed in `show` keep that order, even dotted ones (`validation.maxLength` is no longer moved into a "validation" group at the end).
- `DECISIONS.md`: 81.

### Checked

- With maxLength 60 and 58 characters typed, label on the left: "Describe the issue in your own words." on the left and "2 characters left" on the right, on the same line.
- Empty field after leaving it: "Required." on its own line below.
- The Select, Button and Notification panels are unchanged. No console errors.

### Consumer action

1. Copy `textAreaHTML.js`, `textArea.css` and `textAreaREADME.md` to `ui-catalog/source/components-js/textArea/`.
2. Copy `textArea.css` to `client/local-styling/` and `client/showcase-styling/`.
3. Copy the two app files, run `npm run sync` and reload.


## Delivery 36 — 2026-10-21: TextArea Variants panel with thirteen options

### Changed

- `client/adjustments/textArea.js`: the Variants panel shows only these options, in this order: state, width, mandatory, mandatoryIndicator, labelPosition (TOP / LEFT / INHERIT), spellcheck, rows, autoGrow, maxRows, resize, showCounter, counterWarningThreshold, errorVisibilityDuration.
- All other options are hidden. Label, help, placeholder and the length rule (validation on, at most 40 characters) keep their start values, so the counter and the length message can be tried.
- `DECISIONS.md`: 80.

### Checked

- The panel lists exactly the thirteen options; maxRows is greyed out until autoGrow is on.
- With counterWarningThreshold 30, typing "Hello there" shows "29 characters left" with the warning style.
- `npm run check`: no unknown option. No console errors.

### Consumer action

- Copy the file and reload.


## Delivery 35 — 2026-10-21: label on the left with a field width; LEFT in the panel; full-width examples

### Fixed (library: ui-catalog source, showcase-styling, local-styling)

- Bug: with labelPosition START and width SMALL (or MEDIUM / LARGE), the whole row (label + field) was only 25 % wide. The 180px label left the field a few pixels, and the help text wrapped word by word.
- Now, with the label on the left, the row keeps the full width and the width option sizes the field column. SMALL is a quarter of the row, and the field never takes more than the room beside the label.
- Files: `select.css`, `textInput.css`, `textArea.css`, `calendar.css` (all copies), with their README style and token tables regenerated.

### Changed

- **Variants panel:** labelPosition shows **LEFT** instead of START, in the list and in the help text; the value sent is still START. This applies to Select, TextInput, TextArea, Calendar, Toggle, CheckboxRadio and SearchBox.
  - New adjustment key `valueLabels` (`customizationModel.js`, `customizationPanel.js`, `README.md`).
- **Live examples:** they use the whole area again. The fixed 640px width from delivery 34 is removed.
- `client/app/preview/preview.css` is included again (from delivery 33). The example area must be a size container, or the label never goes to the left.
- `DECISIONS.md`: 78 (replaced) and 79.

### Checked (your project + deliveries 24–34 + this one; window 1403px, menu collapsed)

- All seven components with LEFT and SMALL: label on the left, 180px; field 196px (a quarter of the 786px row); help text on one line.
- The panel lists TOP / LEFT / INHERIT, and the help text says "on its left (LEFT)".
- TextArea and Calendar case matrices: unchanged apart from the known disabled colours.
- No console errors.

### Note

- With the menu open on a 1316px window, the example area is 480px. That is less than the 36rem (576px) a left label needs, so the label returns on top, as in any narrow Form. Collapse the menu or widen the window to see LEFT.

### Consumer action

1. Copy all files from the package.
2. Run `npm run sync` (copies the READMEs into the app).
3. Reload with Ctrl+F5, so the example frame also loads the new `preview.css`.


## Delivery 34 — 2026-10-21: label on the left visible at any window width

### Fixed

- Delivery 33 was not enough at your window width. The label goes to the left only when the example area is at least 36rem (576px) wide; with the menu and the Variants column open at 1316px, the area is 480px.
- `client/adjustments/` `select.js`, `textInput.js`, `textArea.js`, `calendar.js`, `toggle.js`, `checkboxRadio.js`, `searchBox.js`: `stage:{ width:640 }`.
  - The live example is laid out 640px wide and scaled down when the page column is narrower; Select and Calendar keep their minimum height.
  - This is the same mechanism the navigation components already use.
- `DECISIONS.md`: 78.

### Checked (your project plus deliveries 24–33, window 1316px)

- labelPosition START puts the label on the left in all seven components (example scaled to 82.5%).
- No console errors.

### Consumer action

- Copy the seven files and reload.


## Delivery 33 — 2026-10-20: label on the left (START) works in the live examples

### Fixed

- `client/app/preview/preview.css`: `.app-preview-host` is now a size container (`container-type:inline-size`).
  - Cause: a field puts its label on the left only inside a container at least 36rem wide, such as a Form, a ContentGroup or any element with `container-type:inline-size`. The live example had no such container, so the label always stayed on top.
  - The same applies to TextInput, TextArea, Calendar, Toggle, CheckboxRadio and SearchBox.
- `DECISIONS.md`: 77.

### Checked

- Select with labelPosition START: "Country" on the left, the field next to it, on the same row.
- All 23 live examples with their start settings are pixel-identical with and without the change.
- No console errors.

### Consumer action

- Copy the file and reload.


## Delivery 32 — 2026-10-20: Select Variants panel with seven options

### Changed

- `client/adjustments/select.js`: the Variants panel shows only these options, in this order:
  - **presentation:** NATIVE or CUSTOM; it starts at CUSTOM;
  - **state:** EDIT, VIEW, INACTIVE or INVISIBLE;
  - **width:** SMALL, MEDIUM, LARGE or FULL;
  - **selectionMode:** SINGLE or MULTIPLE;
  - **labelPosition:** TOP, START or INHERIT;
  - **searchable:** CUSTOM only;
  - **showMultipleHint:** NATIVE + MULTIPLE only.
- All other options are hidden. The label "Country", the help text and the grouped country list keep their start values.
- `client/app/customization/customizationModel.js`: new adjustment key `show`. It lists the only options shown, in the given order.
- `README.md` (adjustment key table); `DECISIONS.md`: 76.

### Checked

- The panel lists exactly the seven options in that order.
- searchable is greyed out for NATIVE, and showMultipleHint becomes active for NATIVE + MULTIPLE.
- NATIVE + MULTIPLE + hint renders the list box with "Hold Ctrl or Cmd to select several."
- Button, Chip, Notification, TextInput and Table panels are unchanged.
- No console errors or developer warnings.

### Consumer action

- Copy the files and reload.


## Delivery 31 — 2026-10-20: background checkbox for Notification

### Changed

- `client/adjustments/notification.js`: new last option in the Variants panel, **background**:
  - a checkbox, unchecked at first;
  - checked: the shape gets the background `--c-accent` and the icon or text `--c-on-accent` (contrast 6.6:1 in the showcase look);
  - inactive for IMAGE, because pictures keep their own colours.
- `DECISIONS.md`: 75.

### Checked

- ICON and TEXT with the box checked: background rgb(49, 94, 113), icon or text rgb(247, 248, 249).
- IMAGE: the option is greyed out and nothing is sent.
- No console errors or developer warnings.

### Consumer action

- Copy the file and reload.


## Delivery 30 — 2026-10-20: Notification — long markers grow outward and widen the notification

### Changed (library: ui-catalog source, showcase-styling, local-styling)

- `notificationHTML.js`: the main content is wrapped in a new `span.ui-notification-shape` (the visible shape). The button or span around it keeps its id, classes, name and behaviour.
- `notification.css` (same file in all three places):
  - the look (border, background, colour, corners, hover, focus ring, padding, size) moved from the element to `.ui-notification-shape`;
  - a pill marker at TOP_RIGHT or BOTTOM_RIGHT is now part of the layout. It starts where a round marker starts and grows to the right, and the notification is wider by the pill's extra length;
  - left corners keep the marker starting at the corner and growing to the right, over the content;
  - the corner offsets are measured from inside the shape's border, as before.
- `notificationREADME.md`: structure (new shape element), the marker behaviour, and the regenerated style and token tables.
- `DECISIONS.md`: 74.

### Look

- Round markers and dots: unchanged (pixel-identical on the Examples).
- Pills at a right corner ("12", "99+", "New", "Something New"): they now grow outward instead of over the content.
- The Badge, NotificationsPanel and AppHeader test pages are pixel-identical: they use round markers.

### Breaking for custom CSS

- A rule that styled `.ui-notification` itself (background, border, radius, padding) must now target `.ui-notification > .ui-notification-shape`.

### Checked

- Live example "Full Name" + "Something New":
  - TOP_RIGHT: the marker starts 12px inside the shape's end and ends 85px beyond it; the notification is 79px wider.
  - BOTTOM_RIGHT: the same, at the bottom.
  - TOP_LEFT: starts at the left corner and covers the shape.
- Hover background and keyboard focus ring are on the shape.
- No console errors.

### Consumer action

1. Copy `notification.css`, `notificationHTML.js` and `notificationREADME.md` into `ui-catalog/source/components-js/notification/`.
2. Copy `notification.css` into both `client/local-styling/` and `client/showcase-styling/`.
3. Run `npm run sync` (copies the JS and README into the app) and reload.


## Delivery 29 — 2026-10-20: custom marker text for Notification

### Changed

- `client/adjustments/notification.js`: new last option in the Variants panel, **indicatorText**:
  - a TextInput, starting with "New";
  - active only when indicatorType is TEXT;
  - becomes the marker's text (`indicator.value`).
- `DECISIONS.md`: 73.

### Checked

- "Beta" shows a pill, "!" a circle, and empty text no marker.
- The option is greyed out for COUNT and DOT.
- No console errors or developer warnings.

### Consumer action

- Copy the file and reload.


## Delivery 28 — 2026-10-20: Notification Variants panel with six options

### Changed

- `client/adjustments/notification.js`: the Variants panel shows only six options:
  - **contentType:** ICON, TEXT or IMAGE.
  - **contentIcon:** bell, envelope or user. Active only for ICON.
  - **contentText:** a TextInput, starting with "AP". Active only for TEXT; 1–3 characters show a circle, longer text a pill.
  - **corner:** TOP_RIGHT, TOP_LEFT, BOTTOM_RIGHT or BOTTOM_LEFT.
  - **indicatorType:** COUNT (3), DOT or TEXT ("New").
  - **shape:** CIRCLE, TRIANGLE, SQUARE or DIAMOND. Active only for DOT.
  - IMAGE needs no input: every Render shows a new randomly generated picture (a person shape on a random colour, made in the browser, no file or network).
  - Every README option is hidden. The Output shows the real configuration the component received.
  - The Examples section (delivery 27) is unchanged.
- `client/app/customization/customizationModel.js`: new adjustment key `fields` for panel-only options. They are always sent, and the adjustment's `prepare` turns them into the real configuration.
- `README.md` (adjustment key table); `DECISIONS.md`: 72.

### Checked

- Each content type, each icon, a custom text ("Inbox", shown as a pill), every corner, every marker type and the DIAMOND dot render as chosen.
- Three Renders with IMAGE give three different pictures.
- Inactive options are greyed out.
- `npm run check`: no unknown option. No console errors or developer warnings.

### Consumer action

- Copy the files and reload.
- If the panel shows old values, open the page in a new tab: values are kept per tab.


## Delivery 27 — 2026-10-20: Notification examples before the README

### Changed

- New **Examples** section on component pages, after the states and before the README. It is a frame in the showcase look with groups of examples; under each example are the settings that make it. Any component can have it through the new adjustment key `examples` (`customizationModel.js`, `customizationLoader.js`, `componentPage.js`, `preview/previewIndex.js`, `preview/preview.css`; texts `component.examples*` in `appConfig.js`).
- `client/adjustments/notification.js`: 29 examples in 7 groups:
  - **Main content:** icon, text as a circle, text as a pill, image.
  - **Sizes:** SMALL, MEDIUM, LARGE.
  - **Marker kinds:** COUNT, COUNT above max ("99+"), COUNT 0 (hidden), DOT, TEXT.
  - **Marker colours:** INFO, SUCCESS, WARNING, DANGER, CUSTOM.
  - **Status dots:** circle / triangle / square / diamond with matching colours and meanings.
  - **Marker corners:** all four.
  - **Appearance and behaviour:** border, own colours, display only, disabled.
- `README.md` (adjustment key table); `DECISIONS.md`: 71.

### Checked

- Notification page at 1440px: order live example → output → examples → README; all 29 examples render; labels line up row by row.
- No console errors or developer warnings. Button and Chip pages unchanged.
- `npm run check`: no unknown option.

### Consumer action

- Copy the files and reload.
- This delivery includes `customizationModel.js` from delivery 26. If you copied that one already, copying it again changes nothing.


## Delivery 26 — 2026-10-20: Chip variants (icon checkboxes, colour choices, no remove texts)

### Changed

- `client/adjustments/chip.js`:
  - iconBefore and iconAfter are checkboxes with fixed icons (`fa-solid fa-user`, `fa-solid fa-circle-check`); iconBefore starts checked, as before.
  - backgroundToken and colorToken (CUSTOM type only) are Selects with three tokens each:
    - background: `--c-surface-muted` (default), `--c-info-soft`, `--c-warning-soft`;
    - text: `--c-text` (default), `--c-accent`, `--c-danger-text`.
  - removeLabel and texts.remove are hidden.
- `client/app/customization/customizationModel.js`: new adjustment key `choices: { path: [ values ] }`, which shows a text option as a Select limited to these values.
- `README.md` (the adjustment key table); `DECISIONS.md`: 70.

### Checked

- Contrast in the showcase look: all nine background / text pairs are 5.0:1 or more. The lowest is `--c-danger-text` on `--c-surface-muted`, at 5.0:1.
- Chip page:
  - the panel shows label, prefix, type, iconBefore, iconAfter, bordered, backgroundToken, colorToken and removable;
  - choosing `--c-info-soft` / `--c-danger-text` and checking iconAfter sends both tokens and both icons; the Chip shows them;
  - `npm run check` reports no unknown option.
- No console errors.

### Consumer action

- Copy the two files (and the docs) and reload.


## Delivery 25 — 2026-10-19: footer always present; source line only above the documents

### Changed

- `app/appIndex.js`: if `index.html` has no `<footer id="app-footer">` (for example an older copy of `index.html`), the footer is now created after the working area. Before, the footer depended on that line in `index.html`; without it nothing was shown.
- Source line ("Source file: …" and ".md Reader") only above the content of the two documents:
  - the component README (`pages/componentPage.js`, now between the "README" heading and the panels);
  - the guidelines (`pages/descriptionPage.js`, between "How to generate new components" and the guidelines).
- Source line removed from the home page (`pages/homePage.js`), the contact page (`pages/contactPage.js`) and "How to use the app".
- `content/how-to-use.md`: the ".md Reader" paragraph now matches. `app/app.css`: structure notes only. `DECISIONS.md`: 69 updated.

### Checked (1440 × 900)

- Home and contact: no source line.
- Description: one source line, under "How to generate new components". Button page: one source line, under "README".
- The footer shows on every page. On the home page it sits at the bottom of the screen. It is also present with an `index.html` that has no footer line.
- No console errors.

### Note

- The footer is not fixed: on pages longer than the screen, it appears only after scrolling to the end.

### Consumer action

- Copy the files (including `index.html`) and reload.


## Delivery 24 — 2026-10-19: footer, Description page with two sections and contents, source line and .md Reader

### Changed

- **Footer** (`index.html`, `app/appIndex.js`, `app/app.css`, text in `APP_TEXTS.footer`):
  - Creative Commons icon and "Copyright Creative Commons Dan Dragu 2026".
  - Top line, full width; not fixed: at the bottom of the screen when the content is short, after the content otherwise.
  - The menu line and the right-column line now reach the footer's top line: the body is a column, the working area grows, and the side columns stretch (`max-block-size` instead of `block-size`).
- **Home page** (`pages/homePage.js`, `content/home.md`):
  - only `home.md`, over the full width (`.app-reading-full`);
  - the component groups moved to Description;
  - "How to use it" now points to Description.
- **Description page** (`pages/descriptionPage.js`, new `content/how-to-use.md`):
  - section 1 "How to use the app", with the Basic / Complex components as CollapsiblePanels (name and definition);
  - section 2 "How to generate new components", the guidelines as before;
  - on the right, a Contents column as wide as Variants. Its links open a closed panel and scroll to it. On narrow screens the column comes first and shows only the two sections.
- **Source line before every displayed .md file** (new `app/markdown/markdownSource.js`):
  - shown on home, both Description sections, the component README and contact;
  - "Source file: client/…" in small text, with a ".md Reader" Button (download icon) on the right;
  - the Button downloads `client/assets/markdown-reader.html` (your file, unchanged).
- `app/appConfig.js`:
  - new `content.howToUse`, `projectClientFolder`, `markdownReader`;
  - `homeGroupsMarker` renamed `groupsMarker`;
  - new texts `description.*`, `markdownSource.*` and `footer.*`; the group counts moved from `home` to `description`.
- `app/app.css`: footer, layout stretch, `.app-columns` (shared with the component page rules), source line, contents. The unused `.app-definition > i` rule is removed. The structure notes are updated.
- `README.md`; `DECISIONS.md`: 66–69, and a new to-do list "inconsistencies found in your files". It covers 12 items, 3 of them done here.

### Checked (1440 and 700px)

- Home (short content): the footer is at the bottom of the screen and the menu line ends on its top line.
- Description, Button and Chip pages:
  - scrolled to the end, the menu and right-column lines end on the footer's top line;
  - source lines show the right paths;
  - Contents → "Complex components" opens that panel and scrolls it under the header;
  - ".md Reader" downloads `markdown-reader.html`;
  - no horizontal scroll at 700px.
- No console errors.

### Consumer action

- Copy the files.
- Delete nothing yet; the to-do list in `DECISIONS.md` names the files to delete.
- Reload.


## Delivery 23 — 2026-10-19: definition with icon, no frames around the examples, states across the width

### Changed

- `client/app/pages/componentPage.js`: the definition is again a paragraph below "Uses" / "Used by". It is no longer a row of the list. A book icon (`fa-solid fa-book-open`) comes before the text; screen readers announce the icon as "Definition" (`APP_TEXTS.component.definition`, unchanged).
- `client/app/app.css`:
  - new rule `.app-definition` (icon and text side by side, icon in `--c-muted`);
  - `.app-preview` has no border, so the live example and the states area have no frame line.
- `client/app/preview/preview.css`: the states table uses the full width; the value names and each state are centred in their columns. When the frame is narrower than the table, it scrolls sideways.
- `DECISIONS.md`: 65.

### Checked

- Button page at 1440 and 700px: order Chips → Uses / Used by → icon + definition → live example; no frame line; the states table uses the full width of the stage (592 of 592px) and nothing scrolls at these widths. No console errors.

### Consumer action

- Copy the three files and reload.


## Delivery 22 — 2026-10-19: weight pair, heading sizes per level, InterItalic, black text

### Changed

- `design-system.css` (all copies), section 3b:
  - **Weight pair** `--fw-normal` / `--fw-strong`. Every normal-weight text (body, paragraphs, menu items, fields, panel headers, table cells) and every strong text (labels, buttons, current items, `<strong>`) follows these two lines. To try light / semi-bold, write `var(--fw-light)` and `var(--fw-semi-bold)` there.
  - **Heading sizes per level:** `--fs-h1` … `--fs-h6`, plus `--fs-h1-narrow` / `--fs-h2-narrow`. They start at the earlier sizes.
  - **Italic:** `--font-italic`. The app uses `"InterItalic"` (your italic file); the library keeps `--font-sans`.
  - New primitive `--c-black`; in the app `--c-text: var(--c-black)` (your change, marked `[APP]`).
- `app-shell.css` (all copies): headings use `--fs-hN`; `b`/`strong` use `--fw-strong`; `em`, `i`, `cite`, `dfn` and `var` use `--font-italic`.
- `collapsiblePanel.css`, `select.css` (all copies): their italic texts use `--font-italic`. App only: the CollapsiblePanel title uses the normal weight (`[APP]`).
- `client/app/app.css`: `.app-facts` no longer sets its own light weight.
- Library docs: cssREADME (weight pair, heading sizes, italic role), guidelines section 12, CollapsiblePanel and Select READMEs (token tables). `README.md`, `DECISIONS.md` (61–64).

### Look in the app

- The menu, panel headers ("Output: …", "For business"), the facts list and paragraphs now share one weight: regular, with bold for labels and the current menu item. Paragraphs were light before.
- Text is black.
- Live examples and the library look as before (checked property by property on all library test pages).

### Checked

- With regular / bold, in the app: menu item, CollapsiblePanel title, facts text and paragraph are 400, and the current item and labels are 700.
- After switching the pair to light / semi-bold: the same elements are 300 and 600.
- `em` uses InterItalic in italic style.
- All 23 component pages load without errors.

### Consumer action

- Your `local-styling/design-system.css` is replaced by this one. It already contains `--c-black` and `--c-text: var(--c-black)`. If you changed anything else there since delivery 21, carry it over.
- Copy the files from the package; then `npm run sync` and reload.


## Delivery 21 — 2026-10-19: one font system, all stylesheets in three parts, same files everywhere

### Changed

- **Typography roles** (`design-system.css`, new section "3b. TYPOGRAPHY ROLES"): one family and one weight per heading level, paragraphs, page text, component text (`--font-ui`, `--fw-ui`, `--fw-ui-medium`, `--fw-ui-strong`, `--fw-ui-emphasis`) and code (`--font-code`). Every component now uses these roles and sets the font on its root and its fields, so changing a role reaches the whole app and all components. Your app values are in `local-styling/design-system.css` (light `p` and `h2`–`h6`, marked `[APP]`). The weight list is the same in all copies (100–900).
- **Tag tokens** (new section "3c. TAGS"): Chip, CheckboxRadio (CHIP) and the Notification count use them.
- **All 23 component stylesheets** in three parts with design tokens written in the rules (TextInput as the reference): borders per side, corners per corner, one block per type, short comments per group, the same header text. Library, `showcase-styling` and `local-styling` are the same files; `local-styling` differs only on lines marked `[APP] … (library: …)`. Your values were carried over: AppHeader (gutter, search on the right, taller top level), SideNavigation (inverted current page, icon colour, red rail marker), Select, TextInput, Button, CollapsiblePanel.
- **Disabled label** in every field component (library): label, "*" and text of a disabled field use `--c-muted` (TextInput, Select, TextArea, Calendar, Toggle, CheckboxRadio, SearchBox).
- **System files:** new `app-shell.css` (reset and bare elements only, using the roles) in the library and in both styling folders, linked from `index.html` and `preview.html`. `app.css` keeps only what is particular to the app; `preview.css` lost its reset and base. Layer list: `tokens, reset, base, layout, components, overrides`.
- **Library docs:** `cssREADME.md` rewritten for the new files; guidelines sections 2, 12, 15, 16 and 18 updated; every component README: "Styling contract" (rules of parts 1 and 2) and "Design tokens" regenerated from the new stylesheets (TextInput README includes delivery 20).
- `server/sync-components.js`: also copies `app-shell.css`; copies into `local-styling/` only the stylesheets `index.html` loads and lists unused ones.
- `README.md`, `DECISIONS.md` (54–60; open decisions and to-do lists updated).

### Removed

- `ui-catalog/source/basic-components.css`, `components.css`, `UI-CATALOG-SYSTEM-CSS-NOTICE.md`.
- `client/local-styling/calendar.css` (the app does not use Calendar), `UI-CATALOG-TYPOGRAPHY-RULE.md` (replaced by the library docs).

### Look: what changes on purpose

- Text fields (TextInput, SearchBox, Select search) now use Inter instead of the browser's Arial; their height grows by 2px (38→40px field) because Inter's line is taller.
- Disabled fields: grey label, "*" and text (now also in the live examples).
- Live examples: paragraphs have no margins (app-shell); the NotificationsPanel title keeps 24px line height.
- AppHeader in the app: your value `--control-height + --space-lg-1` had no `calc()`, so the browser ignored it and the logo showed at its own height (35px). It now works: logo 56px, header 1px taller. To return to the earlier look, use `var(--control-height)` in the three `[APP]` lines with `--space-lg-1` of `local-styling/appHeader.css`.

### Checked

- Library: every test page at 1280 and 600px, property by property against the earlier CSS; plus a case matrix (all types, sizes, states, hover and focus) for 17 components. Only the intended changes above differ.
- App: all 23 component pages and the home page against the earlier version (main page and live example): only the intended changes; no console errors (the Inter font files are not in my copy, so they show as missing here only).
- Library and `showcase-styling` byte-identical; `local-styling` differs only on `[APP]` lines; every `var(--…)` resolves; no component uses `--font-sans` or `--fw-*` directly.

### Known

- Inter italic: your `@font-face` names the italic file "InterItalic"; with family "Inter" and `font-style: italic` the browser would use it for italic text (open decision).
- The CheckboxRadio chips keep their gap `--gap-inline-items` (wider than `--tag-gap`), as before.
- Heading sizes still use the earlier size tokens (open decision: one size role per level).

### Consumer action

- `ui-catalog/source`: copy `design-system.css`, `app-shell.css`, `cssREADME.md`, `components-js/` (23 stylesheets, 23 READMEs, the guidelines); delete `basic-components.css`, `components.css`, `UI-CATALOG-SYSTEM-CSS-NOTICE.md`.
- `showcase_ui-catalog`: copy `client/local-styling/`, `client/showcase-styling/`, `client/app/app.css`, `client/app/preview/preview.css`, `client/index.html`, `client/preview.html`, `server/sync-components.js`, `README.md`, `DECISIONS.md`, `CHANGELOG.md`; delete `client/local-styling/calendar.css` and `UI-CATALOG-TYPOGRAPHY-RULE.md`.
- Then `npm run sync` (copies the READMEs and guidelines into the app) and reload.


## Delivery 20 — 2026-10-18: TextInput README — disabled look documented

### Changed

- `ui-catalog/source/components-js/textInput/textInputREADME.md`, "For designers": the description of the disabled look (state INACTIVE or inside a disabled fieldset: muted box, text, label and "*"; error stays red); Visual options, row State; Styling contract: `:disabled` instead of `[disabled]`, new rows for the disabled text, label and "*", and a note on how to change the label colour; Design tokens: `--c-muted` and `--c-surface-muted` selectors. "For developers" → Accessibility: one line on the disabled field and its contrast.

### Known

- The README now describes rules that are in your `local-styling/textInput.css` (delivery 19 and your own `:disabled` rules) but not yet in the library stylesheet (`ui-catalog/source` and `showcase-styling` `textInput.css` still have only the `[disabled]` box rule).

### Consumer action

- Copy the README to `ui-catalog/source/components-js/textInput/`, then `npm run sync` (copies it to `client/components/textInput/`) and reload.


## Delivery 19 — 2026-10-18: TextInput — grey label for a disabled field (local-styling)

### Changed

- `client/local-styling/textInput.css` (your uploaded version + one block): part 1, after the disabled rules, block "DISABLED LABEL": when the field is disabled (state INACTIVE, or inside a disabled fieldset), the label and the "*" use `--c-muted`. Marked `[APP]`. "(Optional)" and help were already muted; the error stays red. Nothing else in your file changed.
- DECISIONS.md: new section "To do: disabled label" with the pattern and one entry per field component (Select, TextArea, Calendar, Toggle, CheckboxRadio, SearchBox).

### Checked

- Disabled by own setting and inside a disabled fieldset: label and "*" `--c-muted`, text and box as before; an enabled field keeps `--c-text` and the red "*". Your file without the block fails the same check (proves the check works).
- Variants panel (Button): `minWidth` inactive → grey label; `label` active → dark. No console errors.

### Consumer action

- Copy `textInput.css` to `client/local-styling/` only (or add the 6-line block yourself after `.ui-text-input-field:disabled { … }`); reload.


## Delivery 18 — 2026-10-18: "Definition" in the facts list

### Changed

- `client/app/pages/componentPage.js`: the facts list below the keywords has a third row "Definition" with the component's summary (the first sentence of the README Overview); the separate summary paragraph is gone (all component pages).
- `client/app/appConfig.js` (one line, not in the package — edit your copy): `definition:'Definition',` after `usedBy:'Used by',` in `APP_TEXTS.component`.

### Checked

- All 23 component pages: the Definition row shows the summary; order title → Chips → Uses / Used by / Definition → live example. No console errors.

### Consumer action

- Copy `componentPage.js`; add the line to `appConfig.js` (without it the row label reads "undefined"); reload.


## Delivery 17 — 2026-10-18: "Uses / Used by" below the keywords, 14px, no frame

### Changed

- `client/app/pages/componentPage.js`: the "Uses / Used by" list moved from after the states table to right below the keyword Chips (all component pages).
- `client/app/app.css`, rule `.app-facts` (one line, not in the package — edit your copy): no border, no rounded corners, no background, no padding; text `--fs-sm` (0.875rem = 14px; `--fs-xs` is 12px).

### Checked

- Table and Button pages at 1440 and 390 px: order title → Chips → Uses / Used by → summary; "Uses", "Used by" and the links 14px; no border, padding 0, transparent background. No console errors.

### Consumer action

- Copy `client/app/pages/componentPage.js`. In `client/app/app.css` replace the `.app-facts { … }` rule with:
  `.app-facts { display:flex; flex-direction:column; gap:var(--gap-inline-items); margin:0; font-size:var(--fs-sm); }   /* no frame; 14px */`
  Reload.


## Delivery 16 — 2026-10-18: ContentGroup without component variables; output panel collapsed

### Changed

- `contentGroup.css`, same file in `client/local-styling/` and `client/showcase-styling/`: three parts like TextInput, design tokens written directly in the rules.
  - Part 1 APPEARANCE: frame border (per side) and corners (per corner), background, no line for `bordered:false`, label / title / description colour, size, weight, line height, disabled dimming.
  - Part 2 DIMENSIONS: space below the group, frame padding, gaps, label padding on the frame line, HORIZONTAL gap and item width before wrapping.
  - Part 3 STRUCTURE: layout, VERTICAL / HORIZONTAL arrangement, narrow-group rule (22rem).
  - Only `--ui-content-group-span` remains: the component writes it on the group from the `span` option.
- `client/app/pages/componentPage.js`: "Output: configuration, state, callbacks and developer messages" is a CollapsiblePanel again (COMPACT), collapsed when the page opens.

### Checked

- Every combination of FIELDSET / SECTION × VERTICAL / HORIZONTAL × bordered / not × enabled / disabled × with / without label, in a grid with span, plus a narrow HORIZONTAL group (25 groups): identical. Only difference: groups with `bordered:false` now report style "solid" and colour `--c-border` for their zero-width borders — not visible. Library test pages (two widths): identical. App (11 pages, two widths): identical.
- Output panel: collapsed on all 23 component pages, opens with a click and shows the full output; after Render it shows the new configuration. No console errors.

### Consumer action

- Copy `contentGroup.css` to both `client/local-styling/` and `client/showcase-styling/`; copy `client/app/pages/componentPage.js`. Reload.


## Delivery 15 — 2026-10-18: CollapsiblePanel without component variables (local-styling and showcase-styling)

### Changed

- `collapsiblePanel.css`, same file in `client/local-styling/` and `client/showcase-styling/`: rules in three parts like TextInput, design tokens written directly in the rules, no `--ui-collapsible-panel-*` variables.
  - Part 1 APPEARANCE: the frame (border per side, the left side being the status edge; corners per corner; background; shadow), the four status colours (border and left edge), the INLINE variant (bottom line only), focus-ring corners, disabled opacity, arrow colour and motion, title weight, description and summary colour / size, the line above the content.
  - Part 2 DIMENSIONS: header, summary and content padding, gaps, COMPACT padding, INLINE without side padding, space between panels of a group.
  - Part 3 STRUCTURE: layout, open / closed, summary hiding, arrow shape and turn, focus ring, the narrow-panel rule (26rem).
- The status edge is now written as the left border (it was "inline start", which moves to the right in right-to-left languages); see the file header.

### Checked

- Library test pages (23 pages, two widths): computed styles identical.
- Every combination of 5 statuses × 3 variants × expanded / collapsed × enabled / disabled, with icon, description, summary, chips and buttons, plus a narrow panel (61 panels): identical, keyboard focus ring identical. Only difference: on INLINE panels the three borders of width 0 now report style "solid" and colour `--c-border` instead of "none" / black — not visible.
- App (11 pages, 1440 and 390 px; README panels, Description page, live examples): 804 panel elements, identical.

### Consumer action

- Copy `collapsiblePanel.css` to both `client/local-styling/` and `client/showcase-styling/`, reload.


## Delivery 14 — 2026-10-17: component page layout (Button page; all pages share the template)

### Changed

- `client/app/pages/componentPage.js`: keyword Chips with a border (Chip option `bordered`); the summary is a normal paragraph (no `app-lead`); no "Live example" heading — the example follows the summary; the output is always visible (ContentGroup with the heading "Output: configuration, state, callbacks and developer messages" instead of a CollapsiblePanel); no "States" heading (the intro sentence stays); "Uses" / "Used by" moved after the states table. Screen readers still get the names "Live example" and "States" for the two sections.
- `client/app/preview/preview.css`: more space between the buttons of the states table (`--gap-toolbar` around each button instead of `--gap-tight`).
- The page template is shared, so every component page gets the new order; nothing else is changed (`app.css`, `appConfig.js`, the panel, the stylesheets are not part of this delivery).

### Checked

- Button page at 1440, 1280 and 390 px: order title → Chips → summary → example → output → states → Uses / Used by → README; the states table still fits the page column at 1440 and 1280 (scrolls sideways on a phone); summary, Uses and Used by all 16px like the other paragraphs.
- All 23 component pages: rendered, one bordered Chip per keyword, output visible, no console errors.

### Consumer action

- Copy `client/app/pages/componentPage.js` and `client/app/preview/preview.css`, reload.


## Delivery 13 — 2026-10-16: local-styling/button.css organised by type (the app's own buttons)

### Changed

- `client/local-styling/button.css`: same structure as `showcase-styling/button.css` (delivery 12). Part 1 has one block per hierarchy: PRIMARY, SECONDARY, TERTIARY, each with its border (per side), corners for text buttons and for icon-buttons (per corner), background, text colour, weight, hover / pressed and disabled. Editing a block changes every button of that type in the app. The `radius` / `iconButtonRadius` classes have no rules (the app sets neither option). Only the header comment differs from the showcase file. The look is unchanged (no `[APP]` values yet).
- In the app today most buttons are TERTIARY (88 of 130 on the checked pages), then PRIMARY (38) and SECONDARY (4).

### Checked

- All app pages at 1440 and 390 px: 130 app buttons (88 TERTIARY, 38 PRIMARY, 4 SECONDARY), computed styles identical to before.
- The part 1 rules are the same as in the showcase file, already checked for every type × size × width × corner, enabled, disabled and under the pointer (delivery 12).

### Consumer action

- Copy `button.css` to `client/local-styling/` only, reload. If you had added the square-PRIMARY rule, put it back as the corner line of the PRIMARY text-button block: `.ui-button-button.ui-button-primary { border-top-left-radius: 0; … }` (mark it `[APP]`).


## Delivery 12 — 2026-10-16: "Variants" instead of "Customize"; Button styled per type in showcase-styling

### Changed

- "Customize" is now "Variants" (panel title, side label "Variants of <name>", phone link "Show variants", page "Variants of <name>"). New address `#/component/<id>/variants`; the old `/customize` address still opens the page. (`client/app/appConfig.js`, `appRouter.js`, `pages/componentPage.js`, `pages/customizePage.js`, `customization/customizationPanel.js`)
- Button Variants panel: radius and iconButtonRadius removed; it shows buttonVariant, hierarchy, size, label, iconBefore, iconAfter, iconSize, width, minWidth. (`client/adjustments/button.js`)
- `client/showcase-styling/button.css` organised by type: part 1 has a PRIMARY, a SECONDARY and a TERTIARY block, each with its border (per side), corners (text button and icon-button, per corner), background, text colour, weight, hover / pressed and disabled. The `ui-button-radius-*` and `ui-button-icon-radius-*` classes have no rules any more. No component variables (only `--ui-button-min-width`, set by the JavaScript). Start look = the library default. `local-styling` is not changed.
- DECISIONS: 45 (roles of local-styling and showcase-styling; replaces 41), 46 (Variants), 47 (per-type showcase button.css). The "Waiting to be promoted" list is now "App-only changes in local-styling". README: Variants panel and where to change a Button type.

### Checked

- Every hierarchy × size × width, enabled and disabled, and icon-buttons: with the default corners (radius SMALL, iconButtonRadius CIRCLE) computed styles are identical to the previous showcase file, also under the pointer; with other corner options only the corners differ (they now follow the type).
- Live examples of all app pages (80 buttons inside Form, Table, AppHeader, TextInput…): identical.
- Test edit: square corners in the PRIMARY block only → States table PRIMARY 0px, SECONDARY / TERTIARY 4px; the app's own buttons (local-styling) unchanged. Reverted.
- Button page: panel titled "Variants" with the 9 options; `#/component/button/variants` and `/customize` both open "Variants of Button"; phone link "Show variants" opens it. All 23 component pages render with the Variants panel, no console errors.

### Consumer action

- Copy the package into `showcase_ui-catalog/` and reload. `app.css` is not part of this delivery (only its comments still say "Customize").


## Delivery 11 — 2026-10-15: component page layout, Button states and Customize panel

### Changed

- Every component page: keywords as Chips under the title (not clickable), then the summary, then "Uses" and "Used by" (links kept). The Facts section is gone (groups are already keywords). (`client/app/pages/componentPage.js`, `client/app/appConfig.js`, `client/app/app.css`)
- Button page, new "States" section below the live example: PRIMARY, SECONDARY, TERTIARY × Default, Hover, Pressed, Keyboard focus, Disabled, with the default settings (label "Continue"). Shown in its own frame with the showcase styling. Hover, pressed and focus are drawn by copying the stylesheet's own `:hover`, `:active` and `:focus-visible` rules with a class in their place, so the table always matches the loaded `showcase-styling/button.css`; the cells cannot be clicked or focused. (`client/app/preview/previewIndex.js`, `client/app/preview/preview.css`, `client/app/customization/previewBridge.js`)
- Button Customize panel: buttonVariant, hierarchy, size, label, iconBefore, iconAfter, iconSize, width, minWidth, radius, iconButtonRadius. iconBefore and iconAfter are checkboxes ("Use fa-solid fa-arrow-right-to-bracket", "Use fa-solid fa-chevron-right"). buttonType, disabled, icon, ariaLabel and description are hidden. (`client/adjustments/button.js`)
- New adjustment keys `checkboxes` and `states` (`client/app/customization/customizationModel.js`, `customizationLoader.js`, `customizationPanel.js`; README "Customization panel").

### Checked

- Button page at 1440, 1280 and 390 px: Chips, Uses / Used by, live example, States table fits the page column (scrolls sideways on a phone), panel with exactly the 11 options. No console errors.
- States: for each hierarchy, a real hover, press and keyboard focus give the same colours, border, outline and opacity as the Hover, Pressed and Keyboard focus cells.
- Panel: unchecking iconBefore sends no iconBefore; ICON_BUTTON makes the two checkboxes inactive and renders the trash icon with "Delete item"; values survive a reload; an old stored icon text is read as checked.
- All 23 component pages at 1440 and 390 px: keyword Chips equal the catalog keywords, Uses / Used by links complete, live example rendered, States only on Button, no console errors. Customize page (phone) shows the same 11 options. `npm run check`: Button 11 options in the panel, no unknown options.

### Consumer action

- Copy the files of the package into `showcase_ui-catalog/` (client/app/…, client/adjustments/button.js, README.md, CHANGELOG.md, DECISIONS.md). `app.css`: if you changed your copy, add only the two new rules instead (`.app-component-keywords:empty { display:none; }` before `.app-customize-link-row`; the `.app-customize-field-checkbox` rule after `.app-customize-fields`) — the other changes are comments. Reload the browser.


## Delivery 10 — 2026-10-15: Button in the TextInput / Select style (local-styling only)

### Changed

- `client/local-styling/button.css`: three style groups (1. APPEARANCE, 2. DIMENSIONS, 3. STRUCTURE), design tokens written directly in the rules, no styling variables (the 30 `--ui-button-*` variables are gone). The look is unchanged (no `[APP]` values).
  - Part 1: border per side (transparent; the hierarchy colours it), font, motion, disabled opacity; PRIMARY / SECONDARY / TERTIARY colours at rest and under the pointer / pressed; text size per control size; corners of both radius options.
  - Part 2: icon-to-label gap; height and left / right padding per size (SMALL and LARGE are `var(--control-height)` minus / plus `var(--gap-inline-items)`); icon-button squares; icon sizes; width options.
  - Part 3: layout, focus ring, `cursor: not-allowed` when disabled, square shape of the icon-button, icon and label behaviour.
- `--ui-button-min-width` remains: the component sets it on the button for width MIN_WIDTH (configuration `minWidth`).

### Checked

- Library test pages (23 pages, two widths, 324 button elements): computed styles identical to the original.
- A test page with every combination (3 hierarchies × 3 sizes × 4 corners × 3 widths, plus icon-buttons with 5 corners; each enabled and disabled; 306 buttons): identical at rest, under the pointer, pressed and with keyboard focus.
- App (11 pages, 1440 and 390 px, 358 button elements, including the buttons inside TextInput, Select, Form, Table, AppHeader…): identical. TextInput and Select disabled checks still pass.

### Consumer action

- Copy `button.css` to `client/local-styling/` only, reload the browser.


## Delivery 9 — 2026-10-15: dependency keywords

### Changed

- `server/build-catalog.js`: every component gets a keyword from its number of dependencies, computed from its imports (as the groups): "no dependency" (7), "1 dependency" (8), "2 dependencies" (5), "3 dependencies" (2), "8 dependencies" (AppHeader). In the keyword chips they come after the other keywords, by number; on the component page they come last.
- `server/catalog-rules.json`: new entry `"dependencyKeywords": { "none": "no dependency", "one": "1 dependency", "many": "{count} dependencies" }` with a line in `_help`. Rename the labels there; remove the entry to stop adding the keywords. Your keywords are unchanged.

### Checked

- `npm run catalog`: table shows the new keyword for all 23 components.
- Search page: chips in the expected order; "no dependency" lists 7, "2 dependencies" lists 5; the Table page link "3 dependencies" opens the search with 2 results; text search "dependencies" finds 8. No console errors.

### Consumer action

- Copy `server/build-catalog.js`. In `server/catalog-rules.json`, add the `dependencyKeywords` line before `"keywords"` (or copy the file if your keywords are the same as in this package), then run `npm run catalog` and `npm start`.


## Delivery 8 — 2026-10-15: Select in the TextInput style (local-styling only)

### Changed

- `client/local-styling/select.css`, rewritten after your `local-styling/textInput.css`: three style groups (1. APPEARANCE, 2. DIMENSIONS, 3. STRUCTURE), design tokens written directly in the rules, no styling variables. Changes against the original look, all marked `[APP]`: the field (native select and custom button) and the list's search field have a bottom border only and square corners; a disabled field also shows grey text (`--c-muted`), as TextInput. The open list keeps its border, corners and shadow.
- `:disabled` is used for the disabled look, so a field disabled by a disabled fieldset around it (e.g. ContentGroup `disabled:true`) looks the same as one disabled by its own setting.
- The variables that remain are set or read by the component's JavaScript: option colours, list position and size, and `--ui-select-popup-limit` (part 2).

### Checked

- Test page, computed styles against the original: only the intended differences (top, left and right border widths 0, corners 0, field 1px lower because the top border is gone).
- NATIVE and CUSTOM fields, enabled, disabled by setting and inside a disabled fieldset: border, corners, background and text as intended. Custom list: opens, search field with bottom line, typing "Ger" + Enter selects Germany. No console errors. TextInput disabled check passes with your `textInput.css`.
- App: Customize panel (8 Select fields) renders without errors.

### Consumer action

- Copy `select.css` to `client/local-styling/` only, reload the browser.


## Delivery 7 — 2026-10-15: TextInput without component variables (pilot)

### Changed

- `textInput.css` (same file in `source`, `showcase-styling` and `local-styling`): no component variables. The rules are grouped in three parts (1. APPEARANCE, 2. DIMENSIONS, 3. STRUCTURE); a class appears in each part that has properties for it, with design tokens written directly in the rules, e.g. `.ui-text-input-control { border-top: var(--border-thin) solid var(--c-border); }`. Borders are written per side (top, right, bottom, left) and corners per corner. States (typing, invalid, disabled) set `border-color` / `background-color` directly. Same look: computed styles identical on the TextInput and Form test pages and on every component element of 11 app pages (two widths).
- `textInputREADME.md`: "Styling contract" lists the rules of parts 1 and 2 (selector, properties); "Design tokens" names the selectors again.
- Replaces the per-side variables of the earlier delivery 7 package (not to be used).

### Known

- The other 22 components, the guidelines (section 12) and cssREADME still describe the variable approach; see DECISIONS.md.

### Consumer action

- Copy `textInput.css` to `ui-catalog/source/components-js/textInput/`, `client/showcase-styling/` and `client/local-styling/`, and `textInputREADME.md` to `ui-catalog/source/components-js/textInput/`; then `npm run sync` and reload.

## Delivery 6 — 2026-10-14: documentation of the styling contract

### Changed (ui-catalog `source`)

- All 23 component READMEs: new `### Styling contract` table (about 650 properties: part, property, default, what it sets) and a regenerated `### Design tokens` table (CSS column: contract properties or part-3 selectors). Rows for tokens the component never used were removed: Form (12), Message (`--icon-size-small`), Notification (`--radius-control-small`), SideNavigation (`--fs-label`), Table (`--c-danger-text`).
- `framework-component-development-guidelines.md`: sections 2 (x.css), 12 (styling contract, contract properties, structure, restyling, standard tokens, header), 15 (README designers layer, both tables), 16 (presentation) and 18 (delivery checks).
- `cssREADME.md`: "Component token contracts" rewritten for the `--ui-<component>-*` contracts and `@layer overrides`; a "Pending update" note at the top.
- New `UI-CATALOG-SYSTEM-CSS-NOTICE.md`: what to update in the four system CSS files, with the decisions to take.
- `sideNavigation.css` (all three copies): the last two direct values became contract properties (`--ui-side-nav-external-size`, `--ui-side-nav-search-padding`); look unchanged.

### Consumer action

- Unzip in the APP FOLDER (files go to `ui-catalog/source` and `showcase_ui-catalog`), then run `npm run setup` in `showcase_ui-catalog` so the app gets the new READMEs and guidelines. If you added the typography bullet to guidelines section 12 yourself, carry it over (this file is based on the version you sent on 2026-10-13).

## Delivery 5 — 2026-10-14: styling contract for all components

### Changed

- All 23 component stylesheets (`showcase-styling/`, `local-styling/`, and the same files for ui-catalog `source`) reorganised into a styling contract: 1. APPEARANCE (change freely), 2. DIMENSIONS (change with care), 3. STRUCTURE (do not change). Parts 1 and 2 are `--ui-<component>-*` properties set from tokens. Same look as before: computed styles identical on all 23 library test pages (two widths) and on 11 app pages (two widths, including the live examples); all live-example interaction tests pass.
- New settings beyond the original values, e.g. hover text colour and current-row hover background (SideNavigation), alignment of the pagination (`--ui-pagination-justify`) and of the header search (`--ui-app-header-search-justify`), group-label upper case (SideNavigation, TopNavigation), animation speed (most components).
- AppHeader: an empty end slot no longer leaves a gap after the search (library change; it was an `[APP]` rule before).
- App copies differ from the library only in values marked `[APP]`: `appHeader.css` (padding ×2 aligned with the working area, search on the right) and `sideNavigation.css` (inverted current item).

### Consumer action

- Copy `showcase-styling/*.css` to `client/showcase-styling/` and to `ui-catalog/source/components-js/<component>/` (the zip has both places), and `local-styling/*.css` to `client/local-styling/`. The two app copies with `[APP]` values must not go to `source` or `showcase-styling`.
- Your own edits to the app copies are replaced: enter them again as values in part 1 or 2 (e.g. `--ui-side-nav-icon-color`, `--ui-app-header-top-padding`, `--ui-app-header-bg`), marked `[APP]`.
- Reload the browser (no command needed).

## Delivery 4 — 2026-10-14: app design

### Changed

- Working area with margins (at least 5% each side, at most 1600px wide); header content aligned with it, search on the right.
- Page background almost white (`--c-grey-05`); no shadows anywhere in the app (live examples unchanged).
- Three columns on component pages: menu and Customize section as full-height columns whose borders start at the header's bottom line.
- Menu text 14px.
- Logo before the app name.
- All text styles gathered in a TYPOGRAPHY section at the top of `app.css`.

### New

- `client/assets/logo.svg`.
- `UI-CATALOG-TYPOGRAPHY-RULE.md`: the typography rule to copy into ui-catalog (guidelines §12, cssREADME, app-shell.css).

### Consumer action

- This delivery replaces two copied stylesheets of the app: `client/local-styling/design-system.css` and `client/local-styling/appHeader.css` (changes marked `[APP]`). If you had edited them, compare first.
- Unzip over the project and reload the browser (no command needed).

## Delivery 3 — 2026-10-13: working examples for all components

### New

- An adjustment file for every component (`client/adjustments/*.js`) with a working start example taken from its test page; all 23 live examples render without developer messages and react to use (menus, popups, values, callbacks).
- Object and list values in the panel are written as in the READMEs (`[ { key:'edit', label:'Edit' } ]`); README examples can be pasted as they are. Errors name the position of the problem.
- Callback arguments of the render functions (e.g. `onValueChange`, `onValidation` of input components) are reported in the output box.
- Adjustment keys `stage` (desktop width scaled to fit; room for popups) and `renderFunction`; `prepare` may be asynchronous and may render into another host (Message toasts).

### Changed

- The README reader understands shorthand option lists (`texts.navigation` / `more`), per-option "Applies when" texts, "not X, not Y", short option names (`addIconButton`) and README-style default values.
- The app's three workarounds for AppHeader and SideNavigation were removed (fixed in ui-catalog).
- Value error label `JSON_INVALID` replaced by `VALUE_INVALID`.

### Consumer action

- If not done yet: delete `appHeader.css`, `collapsiblePanel.css` and `sideNavigation.css` from both `client/local-styling/` and `client/showcase-styling/` (they contain the old styles), then run `npm run setup` so the fixed stylesheets are copied.
- Unzip over the project, run `npm run catalog`, restart `npm start`.

## Delivery 2 — 2026-10-12: component page template (Button), Customize page, Search

### New

- Component page template: live example in a frame with the showcase styling (`client/preview.html`), output box (configuration sent, instance members, public state, last callbacks, developer messages), facts, README in four CollapsiblePanels, sticky customization panel on the right with its own scroll and a Render button (re-renders and scrolls to the top).
- Narrow screens (below 960px): "Customize this example" link to the Customize page (`#/component/<id>/customize`); Render there returns to the component page.
- Customization panel generated from the README Configuration table (`client/app/customization/`), with options that do not apply shown inactive; values kept per browser tab.
- Adjustment file for Button (`client/adjustments/button.js`), start values from `tests/button.html`.
- Search page (`#/search`) with the header search box, keyword chips and a results Table; keywords on component pages link to it.
- `npm run check`: lists, per component, what the adjustment files still need to settle.

### Changed

- `npm run catalog` also records which components have an adjustment file.
- Header: search box added. Component page replaced (the first version showed facts only).

### Known

- Components without an adjustment file (all except Button) show their panel but usually need start values to render (e.g. a label or items); these come with deliveries 3 and 4.

### Consumer action

- Unzip over the project (files replace those of delivery 1), then run `npm run catalog` and restart `npm start`.

## Delivery 1 — 2026-10-11: tools, shell, Home, Description, Contact

### New

- Local web server (`npm start`, http://localhost:3003) using only Node.js built-in modules; serves `client/` and the contact endpoint `POST /api/contact` (validation, size limit, 5 messages per visitor per 15 minutes, messages saved in `server/messages/`).
- `npm run sync`: copies component JavaScript and READMEs from `../ui-catalog/source`; copies CSS and design tokens into `local-styling/` and `showcase-styling/` only when missing; copies the guidelines.
- `npm run catalog`: computes dependencies, groups (Basic 15, Complex 8) and keywords from `server/catalog-rules.json`; writes `client/data/catalog.json`.
- `npm run setup`: sync + catalog.
- App shell built with AppHeader (skip link, name, breadcrumbs) and SideNavigation (menu with Basic/Complex branches, rail on wide screens, remembered menu state, drawer on phones).
- Pages: Home (from `content/home.md` + component groups), Description (guidelines, one CollapsiblePanel per section, Expand all / Collapse all), Contact (Form with TextInput and TextArea), component page (first version: summary, groups, keywords, uses, used by), Page not found.
- Built-in Markdown reader: headings, paragraphs, nested lists, tables, fenced code with language label, block quotes, inline code, bold, italic, safe links.

### Consumer action

- Move `client/`, `server/`, `package.json` and `.env` into `showcase_ui-catalog/`; delete `package-lock.json` and `node_modules/` (Express is not used).
- Delete from `client/vendor/fontawesome-free-7.3.1-web/` everything except `css/`, `webfonts/` and `LICENSE.txt`.
- Run `npm run setup`, then `npm start`.
