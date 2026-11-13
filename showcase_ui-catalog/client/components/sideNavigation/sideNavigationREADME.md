# SideNavigation

## For business

### Overview

SideNavigation is the application's main menu at the side of the screen. It shows the pages as a tree with sections, highlights where the user is, and adapts to the space: it can shrink to icons only, and on phones it becomes a panel that slides in from the side. The application provides the list of pages; SideNavigation only shows it and reports the user's choices.

### When to use

- Use it for the application's main menu at the side of the screen, especially for many pages or more than two levels.
- Use TopNavigation for a few sections in a header bar, Breadcrumbs for the path to the current page, and TreeView for data organised in levels.

### Key features

- Pages as a tree with any number of levels, sections with headings and separators.
- The current page highlighted, with its parents opened.
- A collapsed rail with icons only, and a drawer on phones.
- Three level styles (indentation, tree lines, background), two open/close marks (arrow, + / −) and four corner sizes.
- Icons, counters, unavailable entries, external links and an optional search for large menus.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| SideNavigation styles (`sideNavigation.css`) | Always | Navigation, rail, flyout and drawer. |
| Button component and `button.css` | Always | Rail, close and menu (hamburger) buttons. |
| Message component and `message.css` | `search` | "No matching pages" message. |
| Font Awesome icon library | Always | Button icons and item icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application loads the pages (e.g. from its server, filtered by permissions), converts them to the item format, keeps its own copy for routing, stores the remembered choices, and provides the page layout around the navigation (side area, logo, header). Top navigation is a separate component (TopNavigation, planned).

## For designers

### Structure

```text
nav#{id}.ui-side-nav.ui-side-nav-level-{indentation|tree|background}.ui-side-nav-indicator-{chevron|plus-minus}.ui-side-nav-radius-{none|small|medium|large}[.ui-side-nav-rail][.ui-side-nav-drawer-open][.ui-side-nav-searching]
├── div.ui-side-nav-header → Buttons: rail toggle (desktop), close (drawer)
├── div.ui-side-nav-search > input.ui-side-nav-search-input               (optional)
├── div.ui-side-nav-scroll                                                 (scrolls when needed)
│   ├── ul.ui-side-nav-list.ui-side-nav-root
│   │   ├── li.ui-side-nav-group > span.ui-side-nav-group-label + ul.ui-side-nav-list
│   │   ├── li.ui-side-nav-separator
│   │   └── li.ui-side-nav-item  (--ui-side-nav-level)
│   │       ├── div.ui-side-nav-row[.ui-side-nav-current][.ui-side-nav-has-children]
│   │       │   ├── a.ui-side-nav-link | button.ui-side-nav-link.ui-side-nav-parent | span.ui-side-nav-link.ui-side-nav-disabled
│   │       │   │   └── span.ui-side-nav-icon (icon, or an empty .ui-side-nav-initial space) + span.ui-side-nav-label + span.ui-side-nav-badge + external hint
│   │       │   └── button.ui-side-nav-toggle > span.ui-side-nav-chevron          (parent with own page)
│   │       └── div.ui-side-nav-children[.ui-side-nav-children-open] > ul.ui-side-nav-list
│   └── div.ui-side-nav-no-results → Message (INLINE, INFO)
└── div.ui-side-nav-flyout  popover                                        (rail sub-pages)
div.ui-side-nav-overlay                                                    (drawer backdrop)
```

Rows have the control height; hover uses the hover background, the current page the selected background with a bold label and accent icon. Badges are small accent pills. Branches open with a short height transition (none with reduced motion). The rail keeps only the top-level icons (a small dot marks parents), and its flyout shows full labels; the drawer slides in from the start side with a backdrop. The navigation fills the height of its container. Expand indicator PLUS_MINUS puts a + / − sign (two bars; the vertical one shrinks when the branch opens) in a column before the icon: inside the parent button, or as the open/close button placed before the link; rows without sub-pages keep an empty column of the same width (`.ui-side-nav-sign-space`), so icons and labels stay aligned; when no entry of the menu has an icon there is no icon column, so the label follows the sign directly; with TREE the lines join the signs. Corner radius applies to rows, links, open/close buttons and BACKGROUND lists (the search field and the rail flyout keep `--radius-control`). Level style TREE draws thin border-coloured lines from each parent to its sub-pages (├─, └─ for the last one), in the main list only; the rail flyout keeps indentation.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Level style | Indentation, tree lines, background | `ui-side-nav-level-indentation`, `-tree` (lines: `::before` / `::after` of nested `.ui-side-nav-item`), `-background` |
| Expand indicator | Chevron, + / − | `ui-side-nav-indicator-chevron` (`.ui-side-nav-chevron`), `ui-side-nav-indicator-plus-minus` (`.ui-side-nav-sign`, `.ui-side-nav-sign-space`) |
| Corner radius | None, small, medium, large | `ui-side-nav-radius-none`, `-small`, `-medium`, `-large` |
| Width | Full, rail | —, `ui-side-nav-rail` |
| Entry | Link, parent | `a.ui-side-nav-link`, `.ui-side-nav-parent` |
| Extras | Badge, external, group, separator | `.ui-side-nav-badge`, `.ui-side-nav-external`, `.ui-side-nav-group`, `.ui-side-nav-separator` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Drawer (below 48rem) | Closed, open | —, `ui-side-nav-drawer-open` + `.ui-side-nav-overlay` |
| Entry | Disabled, current | `.ui-side-nav-disabled`, `.ui-side-nav-current` |

### Styling contract

`sideNavigation.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-side-nav-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface`: side navigation, search input, current, flyout
  - `--c-text`: side navigation, search input, row (hover), current (also hover), icon (also current), flyout
  - `--c-border`: search input, separator, item (level tree + root), flyout
  - `--c-muted`: group label, external, toggle, sign, flyout (title)
  - `--c-surface-hover`: row (hover), current (hover)
  - `--c-accent`: badge
  - `--c-on-accent`: badge
  - `--c-surface-muted`: toggle (hover), children (level background)
  - `--c-blue-60`: icon (rail + root + has children)
  - `--shadow-color`: overlay (narrow)
- Typography
  - `--font-ui`: side navigation
  - `--fw-ui`: side navigation, label
  - `--fs-control`: side navigation
  - `--fs-caption`: group label, badge, external, flyout (title)
  - `--fw-ui-strong`: group label, label (current), badge, flyout (title)
- Borders and corners
  - `--border-thin`: search input, separator, current, flyout
  - `--radius-control`: search input, row, link, toggle, children (level background), flyout
  - `--radius-pill`: badge
  - `--radius-control-small`: row (radius small), link (radius small), toggle (radius small), children (radius small)
  - `--radius-control-large`: row (radius large), link (radius large), toggle (radius large), children (radius large)
- Shadows
  - `--shadow-md`: flyout, side navigation (narrow)
- States and motion
  - `--opacity-disabled`: disabled
  - `--transition-1`: chevron, children, sign, side navigation (narrow, drawer open + narrow, drawer open + right-to-left + narrow)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thin`: item (level tree + root)
  - `--border-thick`: sign
- Spacing
  - `--gap-tight`: header, scroll, group label, separator, badge, flyout (also title), item (level tree + root, level tree + indicator chevron + root, level tree + indicator plus minus + root)
  - `--gap-inline-items`: search, scroll, no results, group, group label, separator, link, side navigation (rail), flyout (title), item (level tree, level background, level tree + root, level tree + indicator chevron + root, level tree + indicator plus minus + root), row (indicator plus minus + root), toggle (indicator plus minus + root)
  - `--padding-control`: search input
  - `--gap-block`: item (also level indentation)
- Sizes
  - `--control-height`: search input, link, toggle, side navigation (rail), item (level tree + root + last, level tree + root)
  - `--ui-side-nav-indent` (defined in this stylesheet): link, row (indicator plus minus + root)
  - `--icon-size-large`: icon (also rail + root + has children), badge, item (level tree, level tree + root, level tree + indicator chevron + root, level tree + indicator plus minus + root)
  - `--space-sm-3`: chevron
  - `--size-md-2`: flyout
  - `--space-lg-3`: sign, sign space, toggle (indicator plus minus + root), item (level tree + indicator plus minus + root)
  - `--space-md-3`: sign, item (level tree + indicator plus minus + root)
  - `--size-md-3`: side navigation (narrow)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thick`: link (focus), toggle (focus)
  - `--border-thin`: chevron
  - `--radius-pill`: icon (rail + root + has children)
- States and motion
  - `--focus-outline`: search input (focus), link (focus), toggle (focus)
  - `--focus-offset`: search input (focus)
- Spacing
  - `--gap-block`: flyout
- Sizes
  - `--space-sm-2`: icon (rail + root + has children)

**Set by the component — don't change**

- Variables
  - `--ui-side-nav-level`: depth of each entry (drives the indentation)
  - `--ui-side-nav-flyout-left`, `--ui-side-nav-flyout-top`: position of the rail flyout (measured)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `sideNavigationIndex.js`.
- Load the navigation data in the application, map it to items `{ id, label, href?, icon?, badge?, disabled?, external?, children? }` (plus `{ type:'GROUP', label, children }` and `{ type:'SEPARATOR' }`), and pass them in `items`; keep your own copy for the router.
- Render into a container that has the full height of the side area; the page layout (side area, logo, header) belongs to the application.
- Pass `drawerToggleHost` (an element in the page header) so phones get the menu button.
- In single-page applications call `event.preventDefault()` in `onNavigate`, route, and call `setCurrent(id or href)`.
- Store `onRailChange` and `onExpandChange` results (e.g. in local storage) and pass them back as `railCollapsed` and `expandedIds`.
- Give every top-level item an `icon` if the rail should be available; without them the rail toggle is not shown (`RAIL_NEEDS_ICONS`).
- Give each navigation a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Labels and badges are displayed as text; do not pass HTML. Build `href`s from trusted routes only.
- Filter items by permission in the application; hiding a page in the menu does not protect it.
- Never remove `aria-current`, `aria-expanded` or the navigation label.

### Example prompts

```text
Render the application's SideNavigation from the navigation API response (mapped to items with icons), with sections Finance and Administration, a badge on Approvals, search above 15 entries, the rail and open branches remembered in local storage, and the menu button in the page header on phones.
```

## For developers

### Business analysis

> **Component**: the SideNavigation itself. **Consumer**: the developer who configures the SideNavigation in the application's code. **App**: the running application that uses the SideNavigation; it provides the data, performs the actions and stores the changes.

**Pages**

- App provides the pages as a tree, with sections that have headings, e.g. "Administration", and separators. <!-- BA-01 -->
- Component displays the current page highlighted, and opens its parent levels. <!-- BA-02 -->
- User clicks a page. <!-- BA-03 -->
  - Component reports the page to the App. <!-- BA-04 -->
  - App opens the page. <!-- BA-05 -->
- User clicks the open/close mark of a parent. <!-- BA-06 -->
  - Component opens or closes its sub-pages, independently of other parents. <!-- BA-07 -->
  - Component reports the open parents to the App. <!-- BA-08 -->
- User clicks a parent that is not a page itself. <!-- BA-09 -->
  - Component opens or closes its sub-pages. <!-- BA-10 -->

**Look**

- Consumer chooses how levels are shown: indentation (default), tree lines that join each sub-page to its parent, or a background for deeper levels. <!-- BA-11 -->
- Consumer chooses the open/close mark: an arrow at the end of the row (default) or a + / − sign before the icon. <!-- BA-12 -->
- Consumer chooses the corners of the rows: none, small, medium (default) or large. <!-- BA-13 -->
- Consumer provides icons and counters, e.g. "Approvals 3" (optional). <!-- BA-14 -->
- Component displays an unavailable entry and prevents opening it. <!-- BA-15 -->
- Component displays an external link with a visible and spoken "new tab" hint. <!-- BA-16 -->

**Rail** (optional)

- User clicks the rail button. <!-- BA-17 -->
  - Component displays only the icons of the top-level entries, and reports the change to the App. <!-- BA-18 -->
  - User hovers over an icon. <!-- BA-19 -->
  - Component displays the page name as a tooltip. <!-- BA-20 -->
  - User clicks the icon of a parent. <!-- BA-21 -->
  - Component opens a small panel with its sub-pages next to the icon. <!-- BA-22 -->
- Component displays the rail button only when every top-level entry has an icon. <!-- BA-23 -->

**Phones and narrow screens** (below 48rem)

- Component hides the menu and displays a menu button in the page header. <!-- BA-24 -->
  - User clicks the menu button. <!-- BA-25 -->
  - Component opens the menu as a drawer from the side, above the header, and keeps the focus inside it. <!-- BA-26 -->
  - Component closes the drawer when the user clicks the close button, presses Escape, clicks outside it, or chooses a page. <!-- BA-27 -->

**Search** (optional)

- Component displays a search field when the menu has more than a number of entries chosen by the Consumer. <!-- BA-28 -->
  - User types in the field. <!-- BA-29 -->
  - Component hides the pages that do not match, except their parents. <!-- BA-30 -->
  - Component displays and announces "No matching pages" when nothing matches. <!-- BA-31 -->

**Height**

- Component scrolls only the menu when it is taller than the available height. <!-- BA-32 -->

**Remembered choices**

- App stores the rail state and the open parents, and provides them again on the next visit. <!-- BA-33 -->

**Tooltips**

- Consumer chooses how the entry names in the rail shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-34 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderSideNavigation, DEFAULT_SIDE_NAVIGATION_CONFIG, SIDE_NAVIGATION_TOOLTIP_MODES, SIDE_NAVIGATION_LEVEL_STYLES } from './sideNavigationIndex.js';

const navigation = renderSideNavigation(container, config, onNavigate); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `setItems(items)` | — | Replaces the tree (e.g. after permissions changed). |
| `setCurrent(idOrHref)` | — | Marks the current page and opens its parents. |
| `setBadge(id, badge)` | — | Updates or removes (`''`/`null`) a badge. |
| `getExpandedIds()` | array | Ids of the open branches. |
| `isRail()` / `setRail(rail)` | boolean / — | Rail state; setting it programmatically is not reported. |
| `openDrawer()` / `closeDrawer()` | — | Opens or closes the drawer (narrow screens only). |
| `destroy()` | — | Removes listeners and Buttons, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the `<nav>`. |
| `items` | array | `[]` | See Items | Always | Required. The navigation tree. |
| `currentId` | string | `''` | Item id | Always | Initial current page. |
| `levelStyle` | string | `'INDENTATION'` | `INDENTATION`, `TREE`, `BACKGROUND` | Always | How levels are shown; `TREE` joins each sub-page to its parent with lines. |
| `expandIndicator` | string | `'CHEVRON'` | `CHEVRON`, `PLUS_MINUS` | Always | Open/close mark of parents: an arrow at the end of the row, or a + / − sign before the icon. |
| `cornerRadius` | string | `'MEDIUM'` | `NONE`, `SMALL`, `MEDIUM`, `LARGE` | Always | Corners of the rows: none, `--radius-control-small`, `--radius-control`, `--radius-control-large`. |
| `allowRail` | boolean | `true` | — | Always | Shows the rail toggle on screens wider than 48rem, when every top-level item has an icon. |
| `railCollapsed` | boolean | `false` | — | `allowRail` | Initial rail state (remembered choice). |
| `expandedIds` | array | `[]` | Item ids | Always | Initially open branches (remembered choice); parents of the current page open anyway. |
| `search` | boolean | `false` | — | Always | Enables the search field … |
| `searchThreshold` | number | `15` | Integer ≥ 0 | `search` | … shown only with more entries than this. |
| `drawerToggleHost` | Element | `null` | Element in the page header | Always | Where the menu (hamburger) Button is rendered; used below 48rem, hidden on wider screens. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the entry names in the rail (`TOOLTIP`: after the entry) shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). With `TOOLTIP` it also applies to the rail, close and menu buttons; with `TITLE` or `NONE` they show nothing (as before). |
| `texts.*` | string | English defaults | Text | Always | `navigation` ("Main"), `expand`/`collapse` ("Expand {label}"), `collapseRail`, `expandRail`, `openDrawer`, `closeDrawer`, `search`, `noResults`, `newTab`. |
| `onNavigate` | function | `null` | `(item, event, instance) => {}` | Always | Takes precedence over the third argument. |
| `onRailChange` | function | `null` | `(rail, instance) => {}` | Always | The user switched the rail. |
| `onExpandChange` | function | `null` | `(expandedIds, instance) => {}` | Always | The user opened or closed a branch. |

### Items

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Required, unique. |
| `label` | string | Required. |
| `href` | string | Page address; parents with `href` are pages with a separate open/close button, parents without it open and close on click. |
| `icon` | string | Font Awesome classes; required on all top-level entries for the rail (sub-pages may have none). |
| `badge` | string \| number | Counter shown next to the label. |
| `disabled` | boolean | Shown but not selectable. |
| `external` | boolean | Opens in a new tab with a hint. |
| `children` | array | Sub-items. |
| `type` | string | `'GROUP'` (with `label` and `children`) or `'SEPARATOR'`. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onNavigate` | `({ id, label, href, external }, event, instance)` | A link is chosen (the drawer and flyout then close). Links navigate unless `event.preventDefault()` is called. | Disabled entries; parents opened in the rail (they show the flyout). |
| `onRailChange` | `(rail, instance)` | The user switches the rail. | `setRail()`. |
| `onExpandChange` | `(expandedIds, instance)` | The user opens or closes a branch. | Parents opened automatically for the current page. |

### Errors

SideNavigation has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `SideNavigation "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `ITEMS_REQUIRED` | error | No usable item (also in `setItems()`, which then keeps the previous tree). |
| `INVALID_ITEM` | warning | An item without id or label (or a group without label); dropped. |
| `DUPLICATE_ITEM_ID` | warning | Duplicate item id; the later item is dropped. |
| `RAIL_NEEDS_ICONS` | warning | `allowRail` with top-level items without icon; the rail is not offered. |
| `UNKNOWN_ITEM` | warning | `setCurrent()` or `setBadge()` names no item. |
| `INVALID_OPTION` | warning | Invalid `levelStyle`, `expandIndicator`, `cornerRadius` or `searchThreshold`; the default is used. |

The former `levelStyle` value `FONT_WEIGHT` (bold top level) was removed; it is still accepted without a warning and gives `TREE`.

### Accessibility

- A `<nav>` landmark with a name, nested lists, real links (open-in-new-tab works) and buttons with `aria-expanded`/`aria-controls` (the disclosure navigation pattern: Tab moves through entries, Enter/Space open and close).
- The current page has `aria-current="page"`; closed branches are not reachable with Tab.
- With the + / − sign, a parent that is also a page has its open/close button before the link, so Tab reaches the button first, in the visual order; the sign itself is hidden from screen readers (the button keeps its name, e.g. "Expand Projects", and `aria-expanded`).
- Groups are lists labelled by their heading; external links say "(opens in a new tab)".
- Rail: entries keep their names for screen readers (labels are only hidden visually) and show tooltips; parents open a flyout, Escape closes it and returns focus.
- Drawer: the menu Button reports `aria-expanded`; opening moves focus into the drawer, Tab stays inside, Escape or the close button closes it and returns focus to the menu Button.

### Examples

```js
const saved = JSON.parse(localStorage.getItem('navigation') ?? '{}');
const items = mapNavigation(await api.navigation());   // application-specific mapping

const navigation = renderSideNavigation(sideArea,
{
    id:'main-nav', items, currentId:router.currentId(), search:true,
    railCollapsed:saved.rail ?? false, expandedIds:saved.expanded ?? [],
    drawerToggleHost:document.querySelector('#menu-button-host'),
    onRailChange:( rail ) => save({ rail }),
    onExpandChange:( expanded ) => save({ expanded })
},( item, event ) => { if ( !item.external ) { event.preventDefault(); router.go(item.href); navigation.setCurrent(item.id); } });
```

### Files

| File | Responsibility |
| --- | --- |
| `sideNavigationIndex.js` | Public entry point; the only import surface. |
| `sideNavigationConfig.js` | Defaults, item-tree normalization, developer validation. |
| `sideNavigationComponent.js` | Drawing, current page, branches, rail and flyout, drawer, search, Buttons, reports. |
| `sideNavigationHTML.js` | Shell and item-tree markup. |
| `sideNavigationEvents.js` | Click, search, keyboard, outside-press and viewport listeners. |
| `sideNavigationState.js` | Per-instance state and tree helpers. |
| `sideNavigationErrors.js` | Developer error and warning catalog. |
| `sideNavigation.css` | Presentation. |
| `sideNavigationTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/sideNavigation.test.mjs`). |
