# TopNavigation

## For business

### Overview

TopNavigation is the application's main navigation as a horizontal bar, usually inside the page header. It opens the sub-pages of each section in a dropdown panel and adapts to the width of the page.

### When to use

- Use it for the application's main navigation as a horizontal bar in the page header, with up to two levels.
- Use SideNavigation for deeper menus or many sections, and Breadcrumbs to show where the user is in the page hierarchy.
- Use ActionMenu for actions, not for pages.

### Key features

- Main sections in a bar; sub-pages in dropdown panels opened by click or keyboard, never by hover.
- Two panel types per section: a simple list or a wide "mega menu" with columns and descriptions.
- The current page marked, its section highlighted as an underline, a pill or a raised tab.
- Sections that do not fit move into "More"; on phones the bar becomes a menu button.
- Icons, counters, unavailable pages and external links with a "new tab" hint.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| TopNavigation styles (`topNavigation.css`) | Always | Bar, panels, "More", narrow-screen panel. |
| Button component and `button.css` | Always | The menu button on narrow screens. |
| Font Awesome icon library | Always | Menu button, external-link and item icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application loads the pages (e.g. filtered by permissions), converts them to the item format, keeps its own copy for routing, and provides the header layout around the navigation (logo, search, user menu, sticky behaviour). Deeper levels than two belong in SideNavigation.

## For designers

### Structure

```text
nav#{id}.ui-top-nav.ui-top-nav-current-{underline|pill|tab}
├── span.ui-top-nav-menu-host → Button (menu)                          (below 48rem)
├── ul.ui-top-nav-bar
│   ├── li.ui-top-nav-item[.ui-top-nav-current-branch]
│   │   ├── a.ui-top-nav-link | button.ui-top-nav-link.ui-top-nav-trigger (+ span.ui-top-nav-chevron)
│   │   ├── button.ui-top-nav-toggle                                   (section that is also a page)
│   │   └── div.ui-top-nav-panel.ui-top-nav-panel-{list-style|mega}    (hidden until opened)
│   │       ├── LIST: ul.ui-top-nav-panel-list > li > a.ui-top-nav-entry | li.ui-top-nav-group | li.ui-top-nav-separator
│   │       └── MEGA: div.ui-top-nav-column > p.ui-top-nav-group-label + ul > li > a.ui-top-nav-entry (label + description)
│   └── li.ui-top-nav-item.ui-top-nav-more > button.ui-top-nav-more-button + div.ui-top-nav-panel   (when needed)
└── div.ui-top-nav-mobile > ul.ui-top-nav-mobile-list                  (below 48rem, expandable sections)
```

Bar items have the control height and focus outline. Under the pointer each current-page style uses its own shape: underline a muted bar under the item (no background), pill the same pill shape and wider side padding as the current item, tab a background with square bottom corners like the tab. The current section is bold and, depending on the style, underlined with an accent bar, on a soft pill background, or raised as a tab on the bar's bottom line. "More" is an outlined accent pill. Panels are cards with a shadow below their item, aligned to its start (to its end, or above it, when they would not fit in the window); the mega panel spans the navigation's width with a responsive column grid. On narrow screens the bar is replaced by the menu button and a full-width panel.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Current page style | Underline, pill, tab | `ui-top-nav-current-underline`, `-pill`, `-tab` |
| Panel | List, mega menu | `ui-top-nav-panel-list-style`, `ui-top-nav-panel-mega` |
| Overflow | — | `.ui-top-nav-more` (outlined pill) |
| Entry | Link, external, badge | `a.ui-top-nav-entry`, `.ui-top-nav-external`, `.ui-top-nav-badge` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Entry | Current, disabled | `[aria-current="page"]`, `.ui-top-nav-disabled` |

### Styling contract

`topNavigation.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-top-nav-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: link, toggle, entry, mobile (link)
  - `--c-muted`: toggle, icon, description, external, item (current underline + hover), group label, mobile (group)
  - `--c-surface-hover`: link (hover), toggle (hover), entry (hover)
  - `--c-accent`: badge, more button, current branch (current underline), link (current tab + current branch), trigger (current tab + current branch)
  - `--c-on-accent`: badge
  - `--c-selected`: link (current pill + current branch), trigger (current pill + current branch), more button (current branch + more), entry (current), mobile (link + current)
  - `--c-border`: bar (current tab), current branch (current tab), panel, separator, mobile
  - `--c-surface`: current branch (current tab), panel, mobile
- Typography
  - `--font-ui`: top navigation
  - `--fw-ui`: top navigation
  - `--fs-control`: top navigation
  - `--fs-caption`: description, badge, external, group label, mobile (group)
  - `--fw-ui-strong`: badge, more button, link (current branch), trigger (current branch), entry (current), group label, mobile (link + current, group)
- Borders and corners
  - `--radius-control`: link, toggle, current branch (current tab), panel
  - `--radius-pill`: badge, more button, current branch (current underline), link (current pill + current branch, current pill), trigger (current pill + current branch), item (current underline + hover), toggle (current pill)
  - `--border-thin`: more button, bar (current tab), current branch (current tab), panel, separator, mobile
  - `--border-thick`: current branch (current underline), item (current underline + hover)
  - `--radius-control-small`: entry, mobile (link)
- Shadows
  - `--shadow-md`: panel, mobile
- States and motion
  - `--opacity-disabled`: disabled
  - `--transition-1`: chevron

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: bar, link, toggle, badge, panel, entry, group label, separator, mobile (also group)
  - `--gap-inline-items`: link, toggle, item (current underline), entry, group label, mobile (link)
  - `--space-md-3`: link (current pill)
  - `--gap-block`: panel (mega), mobile (sub, group)
- Sizes
  - `--control-height`: link, toggle, entry
  - `--icon-size-large`: badge
  - `--space-sm-3`: chevron
  - `--size-md-2`: panel
  - `--size-lg-4`: panel (mega)
  - `--size-md-1`: panel (mega)
  - `--control-height-touch`: mobile (link)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thick`: link (focus), toggle (focus), entry (focus), mobile (link + focus)
  - `--border-thin`: chevron
- States and motion
  - `--focus-outline`: link (focus), toggle (focus), entry (focus), mobile (link + focus)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `topNavigationIndex.js`.
- Load the navigation data in the application, map it to two-level items `{ id, label, href?, icon?, badge?, disabled?, external?, panel?, children? }` (children may be `{ type:'GROUP', label, children }`, `{ type:'SEPARATOR' }`, and entries with `description` for mega panels), and keep your own copy for the router.
- Render TopNavigation into a flexible area of the page header; the header itself (logo, search, user menu) is built by the application.
- Use `panel:'MEGA'` for sections with many grouped pages; keep the default list otherwise.
- In single-page applications call `event.preventDefault()` in `onNavigate`, route, and call `setCurrent(id or href)`.
- Give each navigation a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Labels, descriptions and badges are displayed as text; do not pass HTML. Build `href`s from trusted routes only.
- Filter items by permission in the application; hiding a page in the menu does not protect it.
- Never remove `aria-current`, `aria-expanded` or the navigation label.

### Example prompts

```text
Add a TopNavigation to the page header with Dashboard, Projects (list panel), Products (mega menu with Hardware, Software and Services columns and short descriptions) and Settings, highlighting the current section with the pill style.
```

## For developers

### Business analysis

> **Component**: the TopNavigation itself. **Consumer**: the developer who configures the TopNavigation in the application's code. **App**: the running application that uses the TopNavigation; it provides the data, performs the actions and stores the changes.

**Sections**

- App provides the pages: main sections and their sub-pages (two levels). <!-- BA-01 -->
- User clicks a section with sub-pages. <!-- BA-02 -->
  - Component opens its panel and closes any other one. <!-- BA-03 -->
- User presses Escape, clicks outside the panel, or leaves it with the keyboard. <!-- BA-04 -->
  - Component closes the panel. <!-- BA-05 -->
- User clicks a page. <!-- BA-06 -->
  - Component reports the page to the App. <!-- BA-07 -->
  - App opens the page. <!-- BA-08 -->

**Panels**

- Consumer chooses the panel type per section: a simple list or a wide "mega menu" with a column per group. <!-- BA-09 -->
- Consumer provides headings or lines that group the sub-pages (optional). <!-- BA-10 -->
- Consumer provides a short description under each page of a mega menu (optional). <!-- BA-11 -->
- Consumer provides a page for a section itself (optional). <!-- BA-12 -->
  - Component displays its name as a link and a small arrow that opens the panel. <!-- BA-13 -->

**Current page**

- Component displays the current page marked. <!-- BA-14 -->
- Component displays its main section highlighted as an underline (default), a pill or a raised tab, chosen by the Consumer. <!-- BA-15 -->

**Width**

- Component moves the last sections into "More" when the bar is too narrow. <!-- BA-16 -->
  - Component displays "More" as an outlined pill, and highlights it when the current page is inside it. <!-- BA-17 -->
  - Component moves the sections back when the width grows. <!-- BA-18 -->
- Component displays a menu button on phones and narrow screens (below 48rem). <!-- BA-19 -->
  - User clicks the menu button. <!-- BA-20 -->
  - Component opens a panel with all sections as expandable blocks, the section of the current page open. <!-- BA-21 -->

**Entries**

- Consumer provides icons and counters for entries (optional). <!-- BA-22 -->
- Component displays an unavailable page and prevents opening it. <!-- BA-23 -->
- Component displays an external link with a visible and spoken "new tab" hint. <!-- BA-24 -->

**Tooltips**

- Consumer chooses how the menu button shows its name on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-25 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTopNavigation, DEFAULT_TOP_NAVIGATION_CONFIG, TOP_NAVIGATION_TOOLTIP_MODES, TOP_NAVIGATION_CURRENT_STYLES, TOP_NAVIGATION_PANELS } from './topNavigationIndex.js';

const navigation = renderTopNavigation(container, config, onNavigate); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `setItems(items)` | — | Replaces the items (e.g. after permissions changed). |
| `setCurrent(idOrHref)` | — | Marks the current page and its section. |
| `setBadge(id, badge)` | — | Updates or removes (`''`/`null`) a badge. |
| `close()` | — | Closes any open panel and the narrow-screen panel. |
| `destroy()` | — | Removes listeners and the menu Button, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the `<nav>`. |
| `items` | array | `[]` | See Items | Always | Required. Two-level tree. |
| `currentId` | string | `''` | Item id | Always | Initial current page. |
| `currentStyle` | string | `'UNDERLINE'` | `UNDERLINE`, `PILL`, `TAB` | Always | How the current section is highlighted. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the menu button (narrow screens) shows its name on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.*` | string | English defaults | Text | Always | `navigation` ("Main"), `more` ("More"), `menu` ("Menu"), `subMenu` ("{label} pages", name of a section's arrow button), `newTab`. |
| `onNavigate` | function | `null` | `(item, event, instance) => {}` | Always | Takes precedence over the third argument. |

### Items

| Field | Level | Description |
| --- | --- | --- |
| `id`, `label` | Both | Required; ids unique. |
| `href` | Both | Page address; a section with `href` is a page with a separate arrow button, without it the whole item opens the panel. |
| `icon`, `badge`, `disabled`, `external` | Both | Icon classes, counter, unavailable, opens in a new tab. |
| `panel` | Section | `LIST` (default) or `MEGA`. |
| `children` | Section | Sub-pages, `{ type:'GROUP', label, children }` (a column in mega panels) and `{ type:'SEPARATOR' }`. |
| `description` | Sub-page | Short text under the label in mega panels. |

Sub-items below the second level are ignored with `DEPTH_LIMIT`.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onNavigate` | `({ id, label, href, external }, event, instance)` | A link is chosen in the bar, a panel, "More" or the narrow-screen panel (panels then close). Links navigate unless `event.preventDefault()` is called. | Disabled entries; opening or closing panels. |

### Errors

TopNavigation has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `TopNavigation "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `ITEMS_REQUIRED` | error | No usable top-level item (also in `setItems()`, which then keeps the previous items). |
| `INVALID_ITEM` | warning | An item without id or label; dropped. |
| `DUPLICATE_ITEM_ID` | warning | Duplicate item id; the later item is dropped. |
| `DEPTH_LIMIT` | warning | Sub-items below the second level; ignored. |
| `UNKNOWN_ITEM` | warning | `setCurrent()` or `setBadge()` names no item. |
| `INVALID_OPTION` | warning | Invalid `currentStyle` or `panel`; the default is used. |

### Accessibility

- A `<nav>` landmark with a name; the disclosure navigation pattern: real links, and buttons with `aria-expanded`/`aria-controls` that open panels by click, Enter or Space (ArrowDown opens and moves focus into the panel); Escape closes and returns focus; panels close when focus leaves the navigation.
- No hover-opening, so touch and keyboard users get the same behaviour as mouse users.
- The current page has `aria-current="page"`; its section is highlighted by weight plus underline, background or tab shape (not colour alone).
- Groups are lists labelled by their headings; external links say "(opens in a new tab)".
- Narrow screens: the menu Button reports `aria-expanded`; sections are buttons with `aria-expanded`; Escape closes the panel and returns focus to the menu Button.

### Examples

```js
const navigation = renderTopNavigation(headerNavHost,
{
    id:'top-nav', currentStyle:'PILL', currentId:router.currentId(),
    items:[
        { id:'dashboard', label:'Dashboard', href:'/dashboard' },
        { id:'projects', label:'Projects', href:'/projects', children:[ { id:'active', label:'Active', href:'/projects/active' }, { id:'archive', label:'Archive', href:'/projects/archive' } ] },
        { id:'products', label:'Products', panel:'MEGA', children:[
            { type:'GROUP', label:'Hardware', children:[ { id:'laptops', label:'Laptops', href:'/p/laptops', description:'Business laptops and docks' } ] },
            { type:'GROUP', label:'Software', children:[ { id:'office', label:'Office suite', href:'/p/office', description:'Documents, sheets and mail' } ] }
        ] }
    ]
},( item, event ) => { if ( !item.external ) { event.preventDefault(); router.go(item.href); navigation.setCurrent(item.id); } });
```

### Files

| File | Responsibility |
| --- | --- |
| `topNavigationIndex.js` | Public entry point; the only import surface. |
| `topNavigationConfig.js` | Defaults, two-level item normalization, developer validation. |
| `topNavigationComponent.js` | Drawing, panels, "More" (priority+), narrow-screen panel, menu Button, reports. |
| `topNavigationHTML.js` | Bar, panels, "More" and narrow-screen markup. |
| `topNavigationEvents.js` | Click, keyboard, focus, outside-press, resize and viewport listeners. |
| `topNavigationErrors.js` | Developer error and warning catalog. |
| `topNavigation.css` | Presentation. |
| `topNavigationTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/topNavigation.test.mjs`). |
