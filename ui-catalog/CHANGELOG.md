# Changelog

What changed in each release of the library, newest first, written for the people who use it in their applications. (The detailed history of how the library was built is in the showcase's CHANGELOG.)

## How to add an entry

1. **One entry per release**, at the top: `## <version> — <date>`. While work is in progress, collect it under `## Unreleased`; `npm run release -- <version>` is run after renaming that heading.
2. **Versions** follow semantic versioning: `MAJOR.MINOR.PATCH`.
   - MAJOR: an application must change something to keep working (an option, label or member removed or renamed, a changed default, a changed look that applications rely on).
   - MINOR: something new that changes nothing for existing applications (a component, an option, a member, a variant).
   - PATCH: fixes only.
3. **Sections, in this order, only those that have content:**
   - `### Action required` — first, always, for every breaking change: what changed, and exactly what to do (old → new). If nothing is required, write "None".
   - `### Added` — new components, options, members, variants, tokens.
   - `### Changed` — behaviour or look that changed without breaking anything.
   - `### Fixed` — bugs fixed: the visible symptom, not the cause.
   - `### Deprecated` — what still works but will be removed in a later MAJOR release, and its replacement.
   - `### Removed` — what is gone (also listed under Action required).
   - `### Verification` — the release record (`reports/release-<version>.md`) and which components are complete or not yet verified.
4. **Each line** names the component first, in the user's words, with the option, member, label or token in code style: `- **Button:** links open in a new tab with target:'NEW_TAB'.`
5. **Not in the changelog:** internal refactoring, file moves that do not change imports, test-only changes, and the showcase app (it has its own changelog).
6. **Labels and Business analysis codes** are never renamed or removed (`tests/published.json`); an obsolete label is listed under Deprecated.

## 1.0.0 — Unreleased

The first public release.

### Action required

None (first release).

### Added

- **Components (30):** Accordion, ActionMenu, AppHeader, Badge, Breadcrumbs, Button, Calendar, CheckboxRadio, Chip, CollapsiblePanel, ContentGroup, CopyArea, Form, Loader, Message, Notification, NotificationsPanel, Pagination, SearchBox, Select, SideNavigation, Stepper, Table, TextArea, TextInput, Toggle, Tooltip, TopNavigation, TreeView, UploadFiles — each with its README (contract, Business analysis, styling contract).
- **Design system:** `design-system.css` (colours with a dark theme, typography roles, spacing, sizes, shapes, cascade layers) and `app-shell.css`; the Inter font.
- **Starter:** a minimal working page to start a project (`starter/`).
- **Gallery:** every component and token, live, with light, dark and right-to-left switches (`npm run gallery`).
- **Quality tools:** static checks, the shared contract test, test plans (`xTESTS.md`) with their tests, integrity check and release records (`TESTING.md`).
- **READMEs:** the "Applies when" column of every Configuration table uses one fixed form (option names and values in code, `+`, `not`; guidelines, Configuration table), so tools can evaluate it; `npm run check` reports any other text.
- **Documents:** `AGENTS.md` for AI tools (rules that win over everything else, a quick reference, a table for choosing components), `DEPENDENCIES.md`, how-to guides for using the framework (also in React, Vue and Svelte) and adapting the design system.
- **AI entry files:** `llms.txt` (an index with one line per component) and `llms-full.txt` (all documentation in one file), written by `npm run llms` and by every release.

### Verification

To be filled by the release: the record `reports/release-1.0.0.md` and the list of complete and not yet verified components.

The 86 manual cases (the look, other browsers, phones, screen readers) were not checked by a person for this release; the release record lists them unticked. They are planned for the next version.
