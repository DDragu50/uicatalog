# SearchBox

## For business

### Overview

SearchBox is the field where a user types what to look for. It looks and behaves the same in every browser and every screen of the product. It collects the query and reports it; the application runs the search and shows the results.

### When to use

- Use it where the user types what to look for: a list, a table, the whole application.
- Use Form in live mode for filters with several fields, and TextInput for values that are not searches.

### Key features

- Search while typing (after a short pause) or on request (Enter or a Search button).
- A minimum number of characters, with a hint below it.
- A clear button and Escape to empty the field.
- An optional search scope, e.g. "All fields", "Name", "Company".
- A busy indicator while the application searches.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing, typography, focus and spinner timing. |
| Message component and `message.css` | `setMessage()` | Feedback under the field. |
| SearchBox styles (`searchBox.css`) | Always | Search box appearance. |
| Button component and `button.css` | Always | Clear button and optional Search button. |
| CheckboxRadio and Chip components, `checkboxRadio.css`, `chip.css` | Scopes are used | Scope choice shown as chips. |
| Font Awesome icon library | Always | Magnifier, clear and busy icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application runs the search, cancels outdated requests, shows results, result counts, empty and error states, sorting and pagination, keeps the query in the URL and announces the number of results to screen-reader users. Filters belong to FiltersForm. The application decides the feedback text (e.g. "No results") and shows it under the field with `setMessage()`.

## For designers

### Structure

```text
div#{id}.ui-search-box.ui-search-box-width-{width}[.ui-search-box-busy]  (role="search" when used as the page's search landmark)
├── label.ui-search-box-label[.ui-search-box-visually-hidden]
├── div.ui-search-box-row
│   ├── div.ui-search-box-control
│   │   ├── input#{id}-input.ui-search-box-input  type="search"
│   │   ├── span.ui-search-box-busy-icon > i   (spinner while busy; aria-hidden)
│   │   └── span.ui-search-box-clear-host → Button (icon "×")   (hidden while empty)
│   └── span.ui-search-box-button-host → Button ("Search", optional magnifier) or icon Button (magnifier)   (optional)
├── div.ui-search-box-scopes-host → CheckboxRadio (single choice, chips)   (optional)
└── div#{id}-help.ui-search-box-help           (hint, scope description or minimum-length hint; hidden when empty)
```

The browser's own clear button and search decoration are hidden, so every browser shows the same clear button. The field uses the same tokens as TextInput: accent border while focused, focus outline for keyboard users, muted background when disabled. Clear, Search and scope chips keep the appearance of Button and CheckboxRadio.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-search-box-label-top`, `ui-search-box-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Label | Visible, visually hidden | —, `ui-search-box-visually-hidden` |
| Search button | Without, with; primary, secondary, tertiary; text (with or without magnifier) or icon only | —, `span.ui-search-box-button-host` (Button hierarchy and variant) |
| Width | Small, medium, large, full, fit content | `ui-search-box-width-small`, `-medium`, `-large`, `-full`, `-fit-content` |
| Scopes | Without, with | —, `div.ui-search-box-scopes-host` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Busy | Off, on | —, `ui-search-box-busy` (spinner at the end of the field; static with reduced motion) |

### Styling contract

`searchBox.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-search-box-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, input
  - `--c-border`: control
  - `--c-surface`: control
  - `--c-accent`: control (focus)
  - `--c-surface-muted`: control (disabled)
  - `--c-muted`: input (disabled), label (disabled), busy icon, help
- Typography
  - `--font-ui`: search box, input
  - `--fw-ui`: search box, input
  - `--fs-label`: label, help
  - `--fw-ui-strong`: label
  - `--lh-compact`: label
  - `--fs-control`: input
  - `--lh-body`: help
- Borders and corners
  - `--border-thin`: control, input
- States and motion
  - `--transition-1`: control
  - `--spinner-duration`: icon
- Sizes
  - `--icon-size-medium`: busy icon
  - `--control-height`: input

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thin`: control
- Spacing
  - `--gap-tight`: search box, busy icon, clear host, message host
  - `--gap-inline-items`: row
  - `--padding-control`: input
- Sizes
  - `--control-height`: control
  - `--percentage-s`: search box (width small)
  - `--percentage-m`: search box (width medium)
  - `--percentage-l`: search box (width large)
  - `--percentage-full`: search box (width full)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: control (focus)
  - `--focus-offset`: control (focus)
- Spacing
  - `--gap-toolbar`: search box (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
- Sizes
  - `--percentage-full`: search box (also label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--form-label-width`: search box (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--percentage-s`: search box (label on the left + width small)
  - `--percentage-m`: search box (label on the left + width medium)
  - `--percentage-l`: search box (label on the left + width large)

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields.
- Read this README before writing code. Import only from `searchBoxIndex.js`.
- Use SearchBox for every keyword search; never build search fields, clear buttons or magnifier icons by hand, and do not use TextInput for search.
- SearchBox reports `{ query, scopes }` through `onSearch`; implement matching, requests, results and URL handling in the page.
- Use `searchMode:'LIVE'` for fast, local searches and `'ON_DEMAND'` (with `showSearchButton:true`) for expensive server searches.
- Call `setBusy(true)` when a request starts and `setBusy(false)` when it ends; ignore responses of outdated requests in the page.
- Restore a query (e.g. from the URL) with `setValue()`; it fires no callback, so run that search yourself.
- Announce the number of results in the page (a polite live region), not in SearchBox.
- Give each search box a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove the label: with `labelVisible:false` it is still the accessible name.
- Never treat the query as trusted: escape it before inserting it into HTML, and encode it in URLs and requests.
- Do not rely on browser-specific search features (native "×", the `search` event).

### Example prompts

```text
Add a SearchBox "Search people" above the users table with scopes All fields, Name and Company. Filter the table in memory while the user types, and announce "N results" in a polite live region.
```

```text
Add an on-demand SearchBox with a Search button for the product catalogue. Call the search API on search, show the busy indicator during the request, and keep the query in the URL so reloading restores it.
```

## For developers

### Business analysis

> **Component**: the SearchBox itself. **Consumer**: the developer who configures the SearchBox in the application's code. **App**: the running application that uses the SearchBox; it provides the data, performs the actions and stores the changes.

**Searching**

- User types in the field. <!-- BA-01 -->
  - Component reports the search to the App after a short pause (while-typing mode). <!-- BA-02 -->
- User presses Enter or clicks the Search button. <!-- BA-03 -->
  - Component reports the search to the App (on-request mode, and in both modes for Enter). <!-- BA-04 -->
  - App performs the search and displays the results. <!-- BA-05 -->
- Component removes spaces at the start or end of the search. <!-- BA-06 -->
- Component prevents repeating the same search. <!-- BA-07 -->
- Component prevents a search below a minimum number of characters. <!-- BA-08 -->
  - Component displays a short hint with the number of characters needed. <!-- BA-09 -->
- Component prevents Enter from submitting a surrounding form. <!-- BA-10 -->

**Field**

- Consumer provides the label, a hint text and a placeholder (optional). <!-- BA-11 -->
- Component displays a clear button ("×") as soon as the field has text. <!-- BA-12 -->
  - User clicks it, or presses Escape. <!-- BA-13 -->
  - Component clears the field and keeps the cursor in it. <!-- BA-14 -->
- App marks the search as busy. <!-- BA-15 -->
  - Component displays a busy indicator at the end of the field. <!-- BA-16 -->
- App provides a message under the field, e.g. "No results". <!-- BA-17 -->
- Component displays the browser's suggestions of earlier entries (optional). <!-- BA-18 -->
- Consumer chooses the width: small, medium, large, full (default) or fitted to the content. <!-- BA-19 -->

**Scope** (optional)

- Consumer provides the scopes, e.g. "All fields", "Name", "Company". <!-- BA-20 -->
- User selects a scope. <!-- BA-21 -->
  - Component displays the hint text of the scope. <!-- BA-22 -->
  - Component reports the current search again with the new scope. <!-- BA-23 -->

**Search button** (optional)

- Consumer chooses the emphasis: primary, secondary or tertiary. <!-- BA-24 -->
- Consumer chooses the text "Search", with a magnifying glass before it (optional), or the magnifying glass only. <!-- BA-25 -->

**Tooltips**

- Consumer chooses how the clear button and the icon search button show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-26 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderSearchBox, DEFAULT_SEARCH_BOX_CONFIG, SEARCH_BOX_TOOLTIP_MODES, SEARCH_BOX_MODES } from './searchBoxIndex.js';

const search = renderSearchBox(container, config, onSearch); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible label; Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `validate()` | `{ valid:true, errorLabel:null }` | Always valid (form-field contract). |
| `getError()` | `null` | SearchBox never has an error (form-field contract). |
| `getValue()` | `{ query, scopes }` | The current effective search (what a search now would report). |
| `setValue({ query, scopes })` | — | Sets text and/or scope programmatically (either may be omitted); fires no callback. |
| `setValue(value, options)` | — | `options` (e.g. `{ quiet:true }` from Form's quiet reset) are accepted for the form-field contract; SearchBox never shows errors. |
| `clear()` | — | Empties the field programmatically; fires no callback. |
| `setMessage(message)` | — | Shows a Message under the field (INLINE): a string (INFO) or a Message configuration `{ type, text, … }`; `null` removes it. Announced when it appears. For results feedback such as "No results for 'xyz'." or "Search failed." |
| `focus()` | boolean | Moves focus to the field; returns whether it received focus. |
| `setBusy(busy)` | — | Shows or hides the busy indicator and sets `aria-busy`. |
| `destroy()` | — | Removes listeners, timers, Buttons and the scope list, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root id; the input is `{id}-input`. |
| `label` | string | — | Text | Always | Required. Label and accessible name. |
| `labelVisible` | boolean | `true` | — | Always | `false` hides the label visually only. |
| `placeholder` | string | `''` | Text | Always | Example text inside the empty field. |
| `help` | string | `''` | Text | Always | Hint below the field; replaced by the selected scope's `description` when it has one. |
| `searchMode` | string | `'LIVE'` | `LIVE`, `ON_DEMAND` | Always | `LIVE`: search while typing (debounced) and on Enter. `ON_DEMAND`: search on Enter or the Search button. |
| `debounceMs` | number | `300` | Integer 0–5000 | `LIVE` | Pause after typing before the search is reported. |
| `minLength` | number | `1` | Integer 1–50 | Always | Shorter queries count as empty (`''`) and show `texts.minLength`. |
| `showSearchButton` | boolean | `false` | — | Always | Adds a Search Button; recommended with `ON_DEMAND`. |
| `searchButtonVariant` | string | `'BUTTON'` | `BUTTON`, `ICON_BUTTON` | `showSearchButton` | `BUTTON`: the text `texts.search`; `ICON_BUTTON`: the magnifying glass only, named by `texts.search`. |
| `searchButtonHierarchy` | string | `'PRIMARY'` | `PRIMARY`, `SECONDARY`, `TERTIARY` | `showSearchButton` | Button hierarchy. |
| `searchButtonIcon` | boolean | `false` | — | `showSearchButton` + `BUTTON` | Shows the magnifying glass before the text. |
| `autocomplete` | string | `'off'` | `'off'`, `'on'` or another native token list | Always | Native `autocomplete`: `'off'` asks the browser not to suggest earlier entries; `'on'` lets it suggest previous searches from its history. Browsers may partly ignore `'off'`. |
| `scopes` | array | `[]` | `{ value, label, description? }` | Always | Where to search; shown as single-choice chips. Invalid or duplicate entries are dropped with a warning. |
| `defaultScope` | string | first scope | A scope `value` | `scopes` | Initially selected scope; unknown values fall back to the first scope (`UNKNOWN_SCOPE`). |
| `landmark` | boolean | `false` | — | Always | Adds `role="search"`; use it only for the page's main search. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `width` | string | `'FULL'` | `SMALL`, `MEDIUM`, `LARGE`, `FULL`, `FIT_CONTENT` | Always | Width of the search box, as TextInput (with the label on the left, SMALL / MEDIUM / LARGE size the field column). |
| `disabled` | boolean | `false` | — | Always | Disables field, buttons and scopes. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the clear button and the icon search button show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.clear` | string | `'Clear search'` | Text | Always | Clear button name. |
| `texts.search` | string | `'Search'` | Text | `showSearchButton` | Search button label (the name of the icon button). |
| `texts.scopeLabel` | string | `'Search in'` | Text | `scopes` | Scope group label. |
| `texts.minLength` | string | `'Type at least {minLength} characters.'` | Text with `{minLength}` | not `minLength:1` | Minimum-length hint. |
| `onSearch` | function | `null` | `({ query, scopes }, instance) => {}` | Always | Search callback; takes precedence over the third `renderSearchBox()` argument. |
| `onInput` | function | `null` | `(text, instance) => {}` | Always | Every user edit of the raw text, including clearing. |

`debounceMs` with `ON_DEMAND`, `defaultScope` without scopes, the `searchButton*` options without `showSearchButton`, and `searchButtonIcon` with `ICON_BUTTON` are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onSearch` | `({ query, scopes }, instance)`; `query` trimmed, `''` below `minLength` or after clearing; `scopes` `[]` or `[value]` | A user action changes the effective search: typing (`LIVE`, after the pause), Enter, the Search button, the clear button or Escape, a scope change while a query is present. | The effective search is unchanged (repeated Enter, extra spaces); during IME composition; `setValue()`, `clear()`. |
| `onInput` | `(text, instance)` | Every user edit of the raw text, including the clear button and Escape. | Programmatic `setValue()` or `clear()`. |

### Errors

SearchBox has no user-facing errors. Developer errors prevent rendering (`renderSearchBox()` returns `null`); warnings are logged and rendering continues. Console format: `SearchBox "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `INVALID_OPTION` | warning | Invalid `searchMode`, `debounceMs`, `minLength`, `autocomplete`, `width`, `searchButtonVariant` or `searchButtonHierarchy`; the default is used. |
| `OPTION_IGNORED` | warning | `debounceMs` with `ON_DEMAND`, `defaultScope` without scopes, `searchButton*` without `showSearchButton`, or `searchButtonIcon` with `ICON_BUTTON`. |
| `INVALID_SCOPE` | warning | A scope without `value` or `label`; dropped. |
| `DUPLICATE_SCOPE_VALUE` | warning | Duplicate scope value; dropped. |
| `UNKNOWN_SCOPE` | warning | `defaultScope` or `setValue()` names a scope that does not exist; the first scope is used. |

### Accessibility

- Native `input type="search"` (announced as a search field) with a real `label`, visible or visually hidden.
- The hint, scope description and minimum-length hint are linked through `aria-describedby`.
- Clear and Search are real Buttons with translated names; the clear button is removed from the tab order while the field is empty, and focus returns to the field after clearing.
- Keyboard: Enter searches, Escape clears (when the field is empty, Escape is left to the page, e.g. to close a dialog).
- Busy state sets `aria-busy`; the spinner respects `prefers-reduced-motion`. The result count is announced by the page.
- `role="search"` only with `landmark:true`, so pages do not get duplicate search landmarks.

### Examples

Live search with scopes, busy indicator and protection against outdated responses:

```js
let requestId = 0;

const search = renderSearchBox(searchHost,
{
    id:'people-search',
    label:'Search people',
    placeholder:'Name or company',
    minLength:2,
    scopes:[ { value:'ALL', label:'All fields' }, { value:'NAME', label:'Name', description:'Searched in first name, last name and full name.' }, { value:'COMPANY', label:'Company' } ]
},async ( { query, scopes }, instance ) =>
{
    const current = ++requestId;
    instance.setBusy(true);
    const people = query ? await fetchPeople(query,scopes[0]) : [];
    if ( current !== requestId ) { return; }            // a newer search has started
    instance.setBusy(false);
    renderResults(people);
    resultStatus.textContent = `${people.length} results`;   // polite live region owned by the page
});

// Restore from the URL without firing onSearch, then run the search yourself:
const params = new URLSearchParams(location.search);
if ( params.has('q') ) { search.setValue({ query:params.get('q'), scopes:[ params.get('in') ] }); }
```

### Files

| File | Responsibility |
| --- | --- |
| `searchBoxIndex.js` | Public entry point; the only import surface. |
| `searchBoxConfig.js` | Defaults, allowed values, normalization, scopes, developer validation. |
| `searchBoxComponent.js` | Lifecycle, effective query, debounce, reporting, clear, scope and busy state, Button/CheckboxRadio composition. |
| `searchBoxHTML.js` | Search box shell markup. |
| `searchBoxEvents.js` | Input, Enter, Escape and IME composition handling. |
| `searchBoxState.js` | Per-instance runtime state. |
| `searchBoxErrors.js` | Developer error and warning catalog. |
| `searchBox.css` | Presentation. |
| `searchBoxTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/searchBox.test.mjs`). |
