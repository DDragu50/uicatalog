# Testing UI Catalog

How the components are checked, tested, looked at and recorded (decisions 193, 194). The components themselves stay plain JavaScript and CSS with no build step; everything here is for whoever maintains the library — a person or an AI tool.

## The idea in short

- **The README is the contract.** Each Business analysis line has a hidden, permanent code at its end (`<!-- BA-07 -->`, invisible on the page).
- **The test plan is the proof.** `xTESTS.md`, next to each README, lists test cases in plain language; each case names the codes, callbacks and error labels it proves. `npm run coverage` checks that nothing in the README is left without a case.
- **The machine checks what it can, a person checks the rest.** "auto" cases run in a real browser; "manual" cases (the look, pasting into other applications, screen readers) appear in the release report as a checklist.
- **During development** the usual testing is enough. **Before a release** one command runs everything and writes a dated record.
- **The gallery shows the real look.** `npm run gallery` opens one page with every component in its key variants and every design token, read live from `source/`, with light, dark and right-to-left switches.
- **Completion rule** (guidelines §14): a component is complete only when everything its README promises is verified — by a passing automatic test wherever a script can judge it, and by a recorded check by a person where only a person can. The release record lists every component as complete or not yet verified.

## Setting up (once)

Requires Node.js 18 or later. In the library folder:

```text
npm install
npx playwright install chromium
```

Playwright is a free tool (by Microsoft) that drives a real browser from a script: it opens a page, clicks, types and reads the result. Only the tests use it; applications that use the components do not need it.

## Commands

| Command | What it does | Time |
| --- | --- | --- |
| `npm run check` | Static checks of every component: the eight files (with the test plan) and their roles, every file in the README Files table, the "Applies when" form, imports only through entry points, error labels the same in the code, the catalog and the README (same severity), design tokens and the Styling contract, README tables, Business analysis wording and codes, published labels and codes still present. | seconds |
| `npm run coverage` | Every Business analysis code, callback and error label of a component with a test plan is covered by a case. | seconds |
| `npm test` | Shared contract test on every component in Chromium: renders and destroys cleanly, no callback without a user action, `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID`, warnings keep rendering, console message format. | about a minute |
| `npm run test:components [name …]` | The "auto" cases of the test plans, by ID. | about a minute per component |
| `npm run gallery` | Opens the gallery (all components and tokens, live) in your browser; Ctrl+C stops it. | instant |
| `npm run gallery:check` | Every component has gallery variants and renders them without console messages or script errors. | about 10 seconds |
| `npm run status` | All of the above (except opening the gallery) plus the comparison with the stored originals and the completion status of every component; writes `reports/status-<date>.md`; stores nothing. | a few minutes |
| `npm run release -- <version>` | All of the above; when everything passes, stores the fingerprints and the published labels and codes and writes `reports/release-<version>.md`. When something fails, the report says FAILED and nothing is stored. | a few minutes |
| `npm run integrity:verify` | Names every protected part that differs from the stored originals. | seconds |
| `npm run integrity:restore` | Puts the changed protected parts back (at most 3 times per release; then a person decides). | seconds |
| `npm run integrity:save -- <version>` | Stores the fingerprints without a release (normally done by `release`). | seconds |
| `npm run llms` | Writes `llms.txt` (an index for AI tools) and `llms-full.txt` (all documentation in one file) from `AGENTS.md`, the guides and the READMEs; `release` writes them too. | seconds |

Exit code 1 means something failed, so the commands can also run in an automatic pipeline later.

## What is stored, and where

| File | Contents | Written by |
| --- | --- | --- |
| `integrity/integrity.json` | SHA-256 fingerprint of every protected part, the version and the date | `release`, `integrity:save` |
| `integrity/snapshot/` | A copy of the protected parts, used by `integrity:restore` | `release`, `integrity:save` |
| `tests/published.json` | Every error label and Business analysis code published so far; they may not be renamed or removed | `release` |
| `reports/release-<version>.md` | The release record: results, failures, completion status per component, the checklist for a person | `release` |
| `reports/status-<date>.md` | The same, on demand | `status` |

**Protected parts:** every JavaScript file, README and test plan of `source/components-js`, and part 3 (STRUCTURE) of each stylesheet. Parts 1 and 2 of a stylesheet (APPEARANCE, DIMENSIONS) are free to change: styling is encouraged and not tracked. Plain files, no database.

## Folders

| Folder | Contents |
| --- | --- |
| `source/` | The product: design system, app shell, components (each with its README and test plan). |
| `tests/` | Only what scripts run: `contract/` (shared contract test), `components/` (harness and test code), `published.json`. |
| `gallery/` | The gallery page and its variant list (`variants.js`). |
| `tools/` | The commands above. |
| `integrity/`, `reports/` | Written only by `npm run release` (and `status` for reports). Keep them in Git: they are the release record. |

## Integrity loop (for applications built by AI tools)

1. A release stores the fingerprints of the original components.
2. An AI tool builds an application with the components.
3. `npm run integrity:verify` reports whether it altered a protected part, and which one.
4. If it did: `npm run integrity:restore` puts the originals back (styling changes stay), and the tool builds the application again without touching the components.
5. Repeat from 3, at most 3 times; after that a person decides (a library change through DECISIONS, or an application change).

## Writing a test plan (xTESTS.md)

- One table: `ID | Covers | Kind | Steps | Expected result`. IDs `T-01`… for "auto", `M-01`… for "manual". Covers names Business analysis codes (`BA-07`), callbacks (`onCopy`) and error labels (`COPY_FAILED`).
- Steps and expected results are written as a user and a reader would: what is done, what is seen or announced, what the application receives. Manual cases that look at the component point to the gallery.
- The labels the shared contract test proves (`CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID`, `INVALID_OPTION`) need no case.
- Each "auto" case has code with the same ID in `tests/components/<name>.test.mjs`; the tests act through real clicks and keys and read the page, the clipboard and the instance members, never the component's internal files.
- Components with a plan: CopyArea, Button, TextInput, TextArea, CheckboxRadio, Table, Pagination, Message, Loader, Toggle, Select, ContentGroup, Form, Breadcrumbs, TopNavigation, SideNavigation, AppHeader, Notification, Badge, NotificationsPanel, Tooltip, ActionMenu, Chip, CollapsiblePanel, Accordion, Stepper, SearchBox, TreeView, UploadFiles, Calendar — all 30 components. A new component gets its plan in the same delivery that adds it.
- Callbacks passed as render arguments (for example `onValueChange` and `onValidation` of the form fields) are recorded by passing `{ $callback:'name' }` in `args` (see `tests/components/harness.js`).
- An internal fallback that no public way reaches (the `UNIDENTIFIED` user error) is the only case where a test may call a component file directly; the plan says so.

## Rules for people and AI tools

- A change of behaviour changes the README line, the test plan and the test code in the same change.
- A new Business analysis line gets the next free code; codes and error labels are never reused, renamed or removed (an obsolete label is retired: kept in the catalog and marked so).
- To fix a bug: first a case that fails because of the bug, then the fix; the case stays.
- Before saying a change is finished: `npm run check`, `npm test` and the component's tests pass; report their results.
