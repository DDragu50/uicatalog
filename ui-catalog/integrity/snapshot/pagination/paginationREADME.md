# Pagination

## For business

### Overview

Pagination lets the user move through long lists (orders, customers, search results) page by page. It reports which page the user wants; the application loads that page.

### When to use

- Use it to move through long lists page by page: orders, customers, search results.
- Use Table's built-in pagination for tables; use this component for other lists.
- Use scrolling with "Load more" in the application when pages do not matter to the user.

### Key features

- Page numbers with the first and last page always visible and "…" for skipped pages.
- Previous and next arrows for longer lists.
- An optional "Go to page" field for very long lists.
- Hidden when everything fits on one page.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| Pagination styles (`pagination.css`) | Always | Page buttons, go-to-page field. |
| Button component and `button.css` | Always | Previous and next arrows. |
| Font Awesome icon library | Always | Chevron icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application (e.g. Table) loads the requested page, decides how many items a page shows (an "items per page" choice belongs to it), shows range texts such as "26–50 of 143" if wanted, and announces the new page content.

## For designers

### Structure

```text
nav#{id}.ui-pagination  aria-label="{label}"                      (hidden with 0–1 pages)
├── div.ui-pagination-pages
│   ├── button.ui-pagination-page[.ui-pagination-current]         (aria-current="page" on the current page)
│   └── span.ui-pagination-ellipsis  "…"                          (aria-hidden)
├── div.ui-pagination-arrows → Buttons (tertiary icon, chevrons): previous, next   (hidden below arrowVisibilityThreshold)
└── div.ui-pagination-go-to                                        (showGoToPage; hidden below goToPageThreshold)
    ├── label.ui-pagination-go-to-label "Go to page"
    ├── input.ui-pagination-go-to-input  type="text" inputmode="numeric"
    └── span.ui-pagination-go-to-error                             (hidden when there is no error)
```

Page buttons are round, transparent, with a hover background; the current page has a muted background and bold text; keyboard focus draws the focus outline. The go-to-page input has the pagination's control height and a width of about four digits, with the error border when invalid.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Arrows | Shown, hidden | `.ui-pagination-arrows`, `[hidden]` below `arrowVisibilityThreshold` |
| Go to page | Off, shown, hidden | —, `.ui-pagination-go-to`, `[hidden]` below `goToPageThreshold` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Current page | — | `.ui-pagination-current`, `aria-current="page"` |
| Invalid go-to page | Shown | `.ui-pagination-go-to-input[aria-invalid="true"]`, visible `.ui-pagination-go-to-error` |

### Styling contract

`pagination.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-pagination-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: page, go to input
  - `--c-surface-hover`: page (hover)
  - `--c-surface-muted`: current
  - `--c-muted`: ellipsis, go to label
  - `--c-border`: go to input
  - `--c-surface`: go to input
  - `--c-accent`: go to input (focus)
  - `--c-danger`: go to input (invalid)
  - `--c-danger-text`: go to error
- Typography
  - `--font-ui`: pagination
  - `--fw-ui`: pagination
  - `--fs-control`: page, ellipsis, go to input
  - `--lh-compact`: page
  - `--fw-ui-strong`: current, go to error
  - `--fs-label`: go to label, go to error
- Borders and corners
  - `--radius-pill`: page
  - `--border-thin`: go to input
- States and motion
  - `--transition-1`: page

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: pagination, pages, arrows, go to, page, go to input
  - `--padding-panel`: pagination
  - `--gap-form-field`: pagination
- Sizes
  - `--control-height`: page, ellipsis, go to input

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: page (focus), go to input (focus)
  - `--focus-offset`: page (focus), go to input (focus)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `paginationIndex.js`.
- Render Pagination once; when the user picks a page, load it and call `pagination.update({ currentPage:page })`; when the list changes (filters, new items per page), call `update({ totalItems, itemsPerPage, currentPage })`. Never re-render Pagination for a page change.
- Pagination never changes data: all loading, sorting and filtering stays in the consumer.
- Keep "items per page" in the consumer (e.g. Table) and pass the number to Pagination.
- Give each pagination a distinct `label` when several are on one page (e.g. "Orders pages, top").
- Enable `showGoToPage` for lists that can have many pages.
- Give each pagination a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove `aria-current`, the navigation label or the arrow names.
- Do not rely on Pagination to validate pages for data access; check requested pages on the server as well.

### Example prompts

```text
Add a Pagination below the customers table with 25 items per page, a "Go to page" field for more than 10 pages, and reload the table when the page changes.
```

```text
Show the same pagination above and below a long results list, with the names "Results pages, top" and "Results pages, bottom", keeping both on the same page.
```

## For developers

### Business analysis

> **Component**: the Pagination itself. **Consumer**: the developer who configures the Pagination in the application's code. **App**: the running application that uses the Pagination; it provides the data, performs the actions and stores the changes.

**Pages**

- App provides the number of pages and the current page. <!-- BA-01 -->
- Component displays the first and the last page, a window of pages around the current one, and "…" where pages are skipped, e.g. "1 … 33 34 35 36 37 … 100". <!-- BA-02 -->
- Component displays the current page highlighted and announces it as the current page. <!-- BA-03 -->
- Component hides itself when everything fits on one page. <!-- BA-04 -->
- User clicks a page number. <!-- BA-05 -->
  - Component reports the requested page to the App. <!-- BA-06 -->
  - App provides the page. <!-- BA-07 -->

**Arrows**

- Component displays previous and next arrows once the list has a set number of pages (6 by default). <!-- BA-08 -->
- Component disables the previous arrow on the first page and the next arrow on the last page. <!-- BA-09 -->
- User clicks an arrow. <!-- BA-10 -->
  - Component reports the previous or next page to the App. <!-- BA-11 -->

**Go to page** (optional)

- Component displays a "Go to page" field once the list has a set number of pages. <!-- BA-12 -->
- User types a page number and presses Enter. <!-- BA-13 -->
  - Component reports the page to the App. <!-- BA-14 -->
  - Component displays "Enter a page from 1 to 100." for an impossible number. <!-- BA-15 -->

**Layout**

- Component displays the bar at the end of the line. <!-- BA-16 -->
- Consumer provides a different name for each pagination on a page, e.g. above and below a table. <!-- BA-17 -->

**Tooltips**

- Consumer chooses how the previous and next arrows show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-18 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderPagination, DEFAULT_PAGINATION_CONFIG, PAGINATION_TOOLTIP_MODES } from './paginationIndex.js';

const pagination = renderPagination(container, config, onPageChange); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getPage()` | number | Current page (1 when there are no pages). |
| `getTotalPages()` | number | Number of pages. |
| `update(numbers)` | — | Applies `{ totalItems, itemsPerPage, currentPage }` (each optional) and redraws; a page beyond the last becomes the last page. |
| `focus()` | boolean | Focuses the current page button (or the first control). |
| `destroy()` | — | Removes listeners and Buttons, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the `<nav>`. |
| `label` | string | `texts.navigation` | Text | Always | Accessible name of the navigation landmark; make it distinct when several paginations are on one page. |
| `totalItems` | number | `0` | Integer ≥ 0 | Always | Number of items being paged. |
| `itemsPerPage` | number | `25` | Integer ≥ 1 | Always | Items per page (decided by the consumer). |
| `currentPage` | number | `1` | Integer ≥ 1 | Always | Current page; beyond the last page it becomes the last page (`PAGE_OUT_OF_RANGE`). |
| `visiblePageCount` | number | `5` | Integer ≥ 3 | Always | Pages shown around the current page (first and last are always shown). |
| `arrowVisibilityThreshold` | number | `6` | Integer ≥ 2 | Always | Previous/next arrows appear from this number of pages. |
| `showGoToPage` | boolean | `false` | — | Always | Adds the go-to-page field. |
| `goToPageThreshold` | number | `6` | Integer ≥ 2 | `showGoToPage` | The field appears from this number of pages. |
| `locale` | string | page language | BCP 47 tag, e.g. `'en'`, `'de'`, `'sv'` | Always | Optional. The language whose rules Pagination uses to write the page numbers. When empty, the page language (`<html lang>`), then the browser language. For example: page 1250 is written “1,250” in English (`en`), “1.250” in German (`de`) and “1 250” in Swedish (`sv`). Table passes its own `locale`. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the previous and next arrows show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.navigation` / `page` / `previous` / `next` / `goToPage` | string | `'Pagination'` / `'Page {page}'` / `'Previous page'` / `'Next page'` / `'Go to page'` | Text (`{page}` in `page`) | Always | Landmark name, page button names, arrow names, go-to label. |
| `texts.errors.INVALID_PAGE` | string | `'Enter a page from 1 to {totalPages}.'` | Text with `{totalPages}` | `showGoToPage` | Go-to-page error. |
| `onPageChange` | function | `null` | `(page, instance) => {}` | Always | Takes precedence over the third `renderPagination()` argument. |

Invalid numbers produce an `INVALID_OPTION` warning and the default (or, in `update()`, the previous value) is used. `goToPageThreshold` without `showGoToPage` is ignored with `OPTION_IGNORED`.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onPageChange` | `(page, instance)` | The user picks a valid, different page: page button, previous/next, go-to-page with Enter. | The current page is clicked, a disabled arrow, an invalid go-to value, `update()`. |

Pagination does not move to the page by itself: the consumer loads the page and calls `update({ currentPage })`, so the display never shows a page that failed to load.

### Errors

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `INVALID_PAGE` | Enter a page from 1 to {totalPages}. | Enter in the go-to-page field with a non-number or a page outside 1…totalPages. | Corrective (cleared when the input changes or a valid page is entered) |

Developer errors prevent rendering (`renderPagination()` returns `null`); warnings are logged and rendering continues. Console format: `Pagination "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_OPTION` | warning | Invalid number (the default or previous value is used) or `locale` tag (the page language is used). |
| `OPTION_IGNORED` | warning | `goToPageThreshold` without `showGoToPage`. |
| `PAGE_OUT_OF_RANGE` | warning | A `currentPage` passed by the consumer is beyond the last page; the last page is used. |

### Accessibility

- A `<nav>` landmark with a configurable name; page buttons are native buttons named "Page N", the current one with `aria-current="page"`; "…" is hidden from screen readers.
- Previous/next are Buttons with names ("Previous page", "Next page"), disabled at the ends; icons mirror in right-to-left languages.
- The go-to-page field has a visible label; an invalid value sets `aria-invalid` and links the message through `aria-describedby`.
- Visible focus on every control. Announcing the new page content is the consumer's task.

### Examples

A list reloading on page change, with go-to-page for long lists:

```js
let currentPage = 1;

const pagination = renderPagination(pagesHost,
{
    id:'customer-pages', label:'Customer pages', totalItems:total, itemsPerPage:25, currentPage,
    showGoToPage:true, goToPageThreshold:10
},async ( page, instance ) =>
{
    const rows = await loadCustomers(page);     // the consumer loads the page …
    renderRows(rows);
    currentPage = page;
    instance.update({ currentPage:page });      // … and then moves the pagination
});

// Filters changed: new total, back to page 1.
function onFiltersChanged( newTotal ) { pagination.update({ totalItems:newTotal, currentPage:1 }); }
```

### Files

| File | Responsibility |
| --- | --- |
| `paginationIndex.js` | Public entry point; the only import surface. |
| `paginationConfig.js` | Defaults, normalization, developer validation. |
| `paginationComponent.js` | Lifecycle, page requests, go-to-page, update, arrow Buttons. |
| `paginationHTML.js` | Navigation shell and page list markup. |
| `paginationEvents.js` | Page-button and go-to-page listeners. |
| `paginationState.js` | Per-instance numbers and the page-window calculation. |
| `paginationErrors.js` | Go-to-page error and developer error and warning catalog. |
| `pagination.css` | Presentation. |
| `paginationTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/pagination.test.mjs`). |
