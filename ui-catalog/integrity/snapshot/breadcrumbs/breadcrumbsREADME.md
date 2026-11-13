# Breadcrumbs

## For business

### Overview

Breadcrumbs show where the user is in the application, as a path from the top level to the current page (e.g. Home › Customers › Northwind › Contracts). Each level above the current page is a link, so users can go back several steps at once.

### When to use

- Use it to show where the user is in a hierarchy of pages and to go back several levels at once, e.g. Home › Customers › Northwind › Contracts.
- Use TopNavigation or SideNavigation for the main menu, and Pagination for pages of one list.

### Key features

- The path from the top level to the current page, each level above it a link.
- Long paths shortened to the first level, "…" and the last levels.
- Optional sibling lists: jump sideways to other pages at the same level.
- A single "Back to {parent}" link on narrow screens.
- Optional data for search engines on public pages.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| Breadcrumbs styles (`breadcrumbs.css`) | Always | Path, separators, back link. |
| ActionMenu component, `actionMenu.css`, Button and `button.css` | Long paths (collapsed levels) | The "…" menu. |
| Button and `button.css` | Levels with siblings | The arrow button (tertiary icon) of sibling dropdowns. |
| Font Awesome icon library | Home icon, collapsed levels, item icons | Icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application builds the path and the sibling lists (from its routes or data), updates them after navigation, and decides whether to add structured data for search engines (public pages only). Sibling lists are passed in full (no loading on demand in this version).

## For designers

### Structure

```text
nav#{id}.ui-breadcrumbs.ui-breadcrumbs-separator-{chevron|slash|arrow|dot}[.ui-breadcrumbs-back-on-narrow]  aria-label="Breadcrumb"   (size container)
├── ol.ui-breadcrumbs-list
│   ├── li.ui-breadcrumbs-item > a.ui-breadcrumbs-link  (icon + span.ui-breadcrumbs-label)
│   ├── li.ui-breadcrumbs-item.ui-breadcrumbs-more > span.ui-breadcrumbs-more-host → ActionMenu "…"   (collapsed levels)
│   ├── li.ui-breadcrumbs-item > … + span.ui-breadcrumbs-siblings-host → Button (tertiary icon, chevron)
│   │                           + ul.ui-breadcrumbs-siblings > li > a.ui-breadcrumbs-sibling[aria-current]   (siblings; hidden until opened)
│   ├── li.ui-breadcrumbs-item > span.ui-breadcrumbs-text                  (level without link)
│   └── li.ui-breadcrumbs-item > span.ui-breadcrumbs-current  aria-current="page"
└── a.ui-breadcrumbs-back  (span.ui-breadcrumbs-back-icon + "Back to …")   (shown below 30rem)
```

Separators are CSS decorations between items (not read by screen readers): a drawn chevron, or the characters "/", "›" or "·" in the muted colour; chevron and arrow mirror in right-to-left languages. Links use the accent colour and are underlined; the current page is bold in the text colour; labels are cut at a maximum width with "…".

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Level | Link, text | `.ui-breadcrumbs-link`, `.ui-breadcrumbs-text` |
| Separator | Chevron, slash, arrow, dot | `.ui-breadcrumbs-separator-chevron`, `-slash`, `-arrow`, `-dot` |
| Collapsed levels | Off, on | —, `.ui-breadcrumbs-more` |
| Narrow container | Path, back link | `.ui-breadcrumbs-back-on-narrow` + container query |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Current level | The last level (the current page) | `.ui-breadcrumbs-current` |

### Styling contract

`breadcrumbs.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-breadcrumbs-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-muted`: item (also separator chevron), text
  - `--c-accent`: link, back
  - `--c-text`: current, sibling
  - `--c-border`: siblings
  - `--c-surface`: siblings
  - `--c-surface-hover`: sibling (hover)
  - `--c-selected`: sibling (current)
- Typography
  - `--font-ui`: breadcrumbs
  - `--fw-ui`: breadcrumbs
  - `--fs-label`: breadcrumbs
  - `--fw-ui-strong`: item (separator dot), current, sibling (current)
- Borders and corners
  - `--border-thin`: item (separator chevron), siblings, back icon
  - `--radius-control-small`: link, sibling
  - `--border-thick`: link (hover)
  - `--radius-control`: siblings
- Shadows
  - `--shadow-md`: siblings
- Sizes
  - `--space-sm-1`: link, back

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: list, item, link, text, current, siblings, sibling, back
  - `--space-sm-2`: siblings
  - `--gap-inline-items`: sibling
- Sizes
  - `--space-sm-3`: item (separator chevron), back icon
  - `--size-md-2`: link, text, current
  - `--size-md-1`: siblings
  - `--size-md-3`: siblings

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thin`: sibling (focus)
- States and motion
  - `--focus-outline`: link (focus), back (focus), sibling (focus)
  - `--focus-offset`: link (focus), back (focus)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `breadcrumbsIndex.js`.
- Use Breadcrumbs on pages below the top level of a hierarchy; do not use them as the main navigation or to show the browsing history.
- Pass the path from the top level to the current page; every level except the current one needs an `href`.
- Add `siblings` only to levels where users often move sideways (customers, projects, contracts), with a specific `siblingsLabel`; keep lists short (they are not searchable).
- In single-page applications, call `event.preventDefault()` in `onNavigate` and route yourself; call `update(items)` after each navigation.
- Give each breadcrumb trail a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Labels are displayed as text; do not pass HTML. Build `href`s from trusted routes only.
- Never remove `aria-current="page"` or the navigation label.

### Example prompts

```text
Add breadcrumbs above the contract page (Home › Customers › {customer} › Contracts › {contract}) with a house icon for Home, collapsing long paths, and a back link on phones.
```

## For developers

### Business analysis

> **Component**: the Breadcrumbs itself. **Consumer**: the developer who configures the Breadcrumbs in the application's code. **App**: the running application that uses the Breadcrumbs; it provides the data, performs the actions and stores the changes.

**Path**

- App provides the path from the top level to the current page. <!-- BA-01 -->
- Component displays each level above the current page as a link, and the current page in bold, not as a link. <!-- BA-02 -->
- Component displays a house icon for the first level (optional). <!-- BA-03 -->
- Consumer chooses the separator: a small chevron (default), "/", "›" or "·". <!-- BA-04 -->
- User clicks a level. <!-- BA-05 -->
  - Component opens the page, or reports it to the App when the App takes over navigation. <!-- BA-06 -->

**Long paths**

- Component shortens a long path to the first level, a "…" button and the last levels. <!-- BA-07 -->
  - User clicks "…". <!-- BA-08 -->
  - Component opens a menu with the hidden levels. <!-- BA-09 -->
- Component shortens long level names with "…". <!-- BA-10 -->
  - User hovers over a shortened name. <!-- BA-11 -->
  - Component displays the full name as a tooltip. <!-- BA-12 -->

**Siblings** (optional)

- App provides, per level, the other pages at the same place in the hierarchy. <!-- BA-13 -->
  - Component displays a small arrow button next to the level. <!-- BA-14 -->
  - User clicks the arrow. <!-- BA-15 -->
  - Component opens the list below the level, or above it near the edge of the window, with the level's own page highlighted. <!-- BA-16 -->

**Narrow screens**

- Component displays a single "Back to {parent}" link instead of the path when less than 30rem is available. <!-- BA-17 -->

**Search engines** (optional)

- Component adds the path as structured data, so search results show it instead of a plain address. <!-- BA-18 -->

**Tooltips**

- Consumer chooses how the full label of each level shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-19 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderBreadcrumbs, DEFAULT_BREADCRUMBS_CONFIG, BREADCRUMBS_TOOLTIP_MODES, BREADCRUMBS_SEPARATORS } from './breadcrumbsIndex.js';

const breadcrumbs = renderBreadcrumbs(container, config, onNavigate); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getItems()` | array | Copy of the current path. |
| `update(items)` | — | Replaces the path (e.g. after navigation in a single-page application). |
| `destroy()` | — | Removes listeners and the ActionMenu, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the `<nav>`. |
| `items` | array | `[]` | `{ label, href?, icon?, siblings?, siblingsLabel? }` | Always | Required. Top level first, current page last; levels without `href` are text (`LINK_MISSING`). `siblings` = `[{ label, href }]` (pages at the same level, the level itself included and highlighted); `siblingsLabel` names the arrow button (e.g. "Other customers"). |
| `maxItems` | number | `5` | `0` (never collapse) or integer ≥ 3 | Always | Beyond this number, the middle levels go into the "…" menu (first level and last `maxItems - 2` levels stay). |
| `separator` | string | `'CHEVRON'` | `CHEVRON`, `SLASH` ("/"), `ARROW` ("›"), `DOT` ("·") | Always | Separator between levels; accepted case-insensitively. |
| `homeIcon` | boolean | `false` | — | Always | Shows the first level as a house icon (its label stays available to screen readers). |
| `showCurrent` | boolean | `true` | — | Always | Shows the current page as the last level. |
| `backLinkOnNarrow` | boolean | `true` | — | Always | Below 30rem, shows "Back to {parent}" instead of the path. |
| `structuredData` | boolean | `false` | — | Always | Adds the path for search engines (schema.org `BreadcrumbList` as JSON-LD, invisible to users); see Structured data. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the full label of each level (`TOOLTIP`: only when it is cut off) shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). With `TOOLTIP` it also applies to the buttons that open the sibling lists and the "…" menu button; with `TITLE` or `NONE` they show nothing (as before). |
| `texts.navigation` / `more` / `back` / `siblings` | string | `'Breadcrumb'` / `'Show hidden levels'` / `'Back to {label}'` / `'Pages next to {label}'` | Text (`{label}` in `back` and `siblings`) | Always | Landmark name, "…" button name, back link, default name of sibling arrow buttons. |
| `onNavigate` | function | `null` | `(item, event, instance) => {}` | Always | Takes precedence over the third `renderBreadcrumbs()` argument. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onNavigate` | `({ label, href, index, sibling? }, event, instance)` | A level link, the back link, a level in the "…" menu (`event` is `null` there, it navigates as a link), or a sibling (`sibling:true`, `index:null`); the sibling list then closes. | The current page or a level without link is clicked; opening or closing a sibling list. |

### Errors

Breadcrumbs has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Breadcrumbs "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `ITEMS_REQUIRED` | error | No item with a label (also in `update()`, which then keeps the previous path). |
| `INVALID_ITEM` | warning | An item without label; dropped. |
| `LINK_MISSING` | warning | A level above the current page without `href`; shown as text. |
| `INVALID_SIBLING` | warning | A sibling without label or href; dropped. |
| `INVALID_OPTION` | warning | Invalid `maxItems` or `separator`; the default is used. |

### Accessibility

- A `<nav>` landmark named "Breadcrumb" containing an ordered list; the current page has `aria-current="page"`.
- Separators are CSS decorations and are not read (text separators have an empty alternative text); the home icon keeps its label as hidden text.
- The "…" button is an ActionMenu (menu button pattern) listing the hidden levels as links.
- Sibling arrows are Buttons with names ("Other customers") and `aria-expanded`/`aria-controls` (disclosure pattern, as navigation links rather than a command menu); opening focuses the level's own entry (`aria-current="true"`), Escape closes and returns focus, a click outside or leaving with Tab closes the list.
- Links and the back link have visible focus; truncated labels keep the full text as a tooltip.

### Structured data

With `structuredData:true` Breadcrumbs also writes the path in a format search engines read (schema.org `BreadcrumbList`, JSON-LD) into a hidden `<script type="application/ld+json">` next to the trail. Users never see it; search engines may show the path in their results instead of the page address.

How it is built:

- every level, including levels collapsed into "…";
- full addresses: relative links are completed from the current page address (`"orders"` on `https://shop.example.com/catalog/` → `https://shop.example.com/catalog/orders`);
- the current page (no link in the trail) uses the current page address;
- it is rewritten by `update()`.

Example — the configuration:

```js
renderBreadcrumbs(pathHost,{ id:'path', structuredData:true,
    items:[ { label:'Home', href:'/' }, { label:'Laptops', href:'/laptops' }, { label:'ThinkBook 14' } ] });
```

on `https://shop.example.com/laptops/thinkbook-14` produces:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shop.example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Laptops", "item": "https://shop.example.com/laptops" },
    { "@type": "ListItem", "position": 3, "name": "ThinkBook 14", "item": "https://shop.example.com/laptops/thinkbook-14" }
  ]
}
```

Use it on public pages that search engines index (shops, documentation, public portals); it brings nothing on pages behind a login. Search engines also need the page itself to be crawlable; check the result with the search engine's rich-results test.

### Examples

```js
const breadcrumbs = renderBreadcrumbs(pathHost,
{
    id:'page-path', homeIcon:true,
    items:[ { label:'Home', href:'/' }, { label:'Customers', href:'/customers' }, { label:customer.name, href:`/customers/${customer.id}` }, { label:'Contracts' } ]
},( item, event ) => { event?.preventDefault(); router.go(item.href); });

// After the router moved on:
breadcrumbs.update(newPath);
```

### Files

| File | Responsibility |
| --- | --- |
| `breadcrumbsIndex.js` | Public entry point; the only import surface. |
| `breadcrumbsConfig.js` | Defaults, item normalization, developer validation. |
| `breadcrumbsComponent.js` | Drawing, collapse with ActionMenu, navigation reports, update. |
| `breadcrumbsHTML.js` | Navigation, list, collapse calculation and back link markup. |
| `breadcrumbsErrors.js` | Developer error and warning catalog. |
| `breadcrumbs.css` | Presentation. |
| `breadcrumbsTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/breadcrumbs.test.mjs`). |
