# ActionMenu

## For business

### Overview

ActionMenu is the small "more" button (three dots) that opens a short list of actions, such as Edit, Duplicate, Download or Delete. It keeps screens tidy when a row, card or page header has more actions than there is room for buttons.

### When to use

- Use it when a row, card or page header has more actions than there is room for buttons.
- Use Button when two or three actions fit on the screen; frequent actions stay visible as buttons.
- Use TopNavigation or SideNavigation for moving between pages.

### Key features

- A compact "more" button (three dots, or another icon) that opens a short list of actions.
- Actions with an optional icon, separators between groups, and dangerous actions marked in red.
- Unavailable actions stay visible but cannot be chosen.
- Entries that are links to other pages.
- The list opens where there is room: below or above the button, aligned to its end or start edge.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| ActionMenu styles (`actionMenu.css`) | Always | Menu appearance. |
| Button component and `button.css` | Always | The trigger button. |
| Font Awesome icon library | Always | Trigger and item icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application performs the chosen action (and asks for confirmation for dangerous ones). Nested submenus, checkable items and menus opened by right-click are not part of this version.

## For designers

### Structure

```text
span.ui-action-menu
├── span.ui-action-menu-trigger-host → Button (icon; tertiary, or secondary when bordered) aria-haspopup="menu", aria-expanded
└── ul.ui-action-menu-list  role="menu", popover (top layer)
    ├── li[role="none"] > button.ui-action-menu-item[.ui-action-menu-danger]  role="menuitem" [aria-disabled]
    │   └── span.ui-action-menu-icon + span.ui-action-menu-label
    ├── li[role="none"] > a.ui-action-menu-item  role="menuitem"       (link items)
    └── li.ui-action-menu-separator  role="separator"
```

Items have the control height, a hover/focus background and the focus outline for keyboard users; danger items use the danger text colour; unavailable items keep their place with reduced opacity. Items without an icon keep the icon column, so labels align. The menu position is set by the component (`--ui-action-menu-top`, `--ui-action-menu-left`).

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Trigger size | Small, medium, large | Button sizes |
| Trigger border | Without (tertiary Button), with (secondary Button) | `bordered` |
| Item | Normal, danger | `.ui-action-menu-item`, `.ui-action-menu-danger` |
| Separator | — | `.ui-action-menu-separator` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Trigger under the pointer | Darker background | `.ui-action-menu .ui-button:hover` |
| Item | Unavailable | `[aria-disabled="true"]` |

### Styling contract

`actionMenu.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-action-menu-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface-muted`: button
  - `--c-border`: button (hover, pressed), list, separator
  - `--c-surface`: list
  - `--c-text`: list
  - `--c-surface-hover`: item (hover, focus)
  - `--c-danger-text`: danger
- Typography
  - `--font-ui`: list
  - `--fw-ui`: list
  - `--fs-control`: item
- Borders and corners
  - `--border-thin`: list, separator
  - `--radius-control`: list
  - `--radius-control-small`: item
- Shadows
  - `--shadow-md`: list
- States and motion
  - `--opacity-disabled`: item (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: list, separator
  - `--gap-inline-items`: item
- Sizes
  - `--size-md-1`: list
  - `--size-md-3`: list
  - `--control-height`: item
  - `--icon-size-medium`: icon

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thin`: item (focus)
- States and motion
  - `--focus-outline`: item (focus)

**Set by the component — don't change**

- Variables
  - `--ui-action-menu-left`, `--ui-action-menu-top`: position of the open list (measured)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `actionMenuIndex.js`.
- Use ActionMenu when more than two or three actions would not fit as icon Buttons; keep the most frequent actions as visible Buttons and put the rest in the menu.
- Give the trigger a specific name (`label`), e.g. "More actions for order 1042", especially in tables with one menu per row.
- Handle the chosen `key` in `onAction(key)`; ask for confirmation before dangerous actions.
- Give each menu a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again (Table does this for cells rendered with `render()`).

### Safety

- Labels are displayed as text; do not pass HTML. Link `href`s come from the application: never build them from untrusted input without validation.
- Never remove the menu roles, `aria-haspopup` or `aria-expanded`.

### Example prompts

```text
Add an ActionMenu to each order row with Duplicate, Download invoice, Track shipment (link), a separator and Delete (danger); disable Archive for open orders.
```

## For developers

### Business analysis

> **Component**: the ActionMenu itself. **Consumer**: the developer who configures the ActionMenu in the application's code. **App**: the running application that uses the ActionMenu; it provides the data, performs the actions and stores the changes.

**Menu**

- User clicks the "more" button. <!-- BA-01 -->
  - Component opens the list of actions below the button, or above it when there is no room below. <!-- BA-02 -->
  - Component displays the list aligned with the end edge of the button, or with its start edge when there is no room. <!-- BA-03 -->
- User clicks an action. <!-- BA-04 -->
  - Component closes the list. <!-- BA-05 -->
  - Component reports the chosen action to the App. <!-- BA-06 -->
  - App performs the action. <!-- BA-07 -->
- User presses Escape, presses Tab, or clicks outside the list. <!-- BA-08 -->
  - Component closes the list without reporting an action. <!-- BA-09 -->

**Actions**

- Consumer provides the actions, each with a label and an optional icon. <!-- BA-10 -->
- Consumer adds separators between groups of actions (optional). <!-- BA-11 -->
- Component displays a dangerous action, e.g. "Delete", in the danger colour. <!-- BA-12 -->
- Component displays an unavailable action and prevents choosing it. <!-- BA-13 -->
- Component opens a link entry as a page link. <!-- BA-14 -->

**Keyboard additions**

- User presses the arrow keys, Home or End to move between actions. <!-- BA-15 -->
- User types the first letter of an action to move to it. <!-- BA-16 -->

**Button**

- Consumer provides the name of the button, e.g. "More actions for order 1042". <!-- BA-17 -->
- Consumer chooses the icon, the size and whether the button has a border. <!-- BA-18 -->
- Consumer disables the whole menu (optional). <!-- BA-19 -->

**Tooltips**

- Consumer chooses how the menu button shows its name on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-20 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderActionMenu, DEFAULT_ACTION_MENU_CONFIG, ACTION_MENU_TOOLTIP_MODES, ACTION_MENU_SIZES } from './actionMenuIndex.js';

const menu = renderActionMenu(container, config, onAction); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id (the trigger Button's id). |
| `open()` | — | Opens the menu and focuses the first available item. |
| `close()` | — | Closes the menu. |
| `focus()` | boolean | Moves focus to the trigger. |
| `destroy()` | — | Closes the menu, removes listeners and the trigger Button, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the trigger. |
| `label` | string | `'More actions'` | Text | Always | Accessible name of the trigger. |
| `icon` | string | `'fa-solid fa-ellipsis-vertical'` | Font Awesome classes | Always | Trigger icon. |
| `size` | string | `'SMALL'` | `SMALL`, `MEDIUM`, `LARGE` | Always | Trigger size. |
| `bordered` | boolean | `false` | — | Always | `true`: the trigger is a secondary icon Button (with a border); `false`: a tertiary one (no border). |
| `disabled` | boolean | `false` | — | Always | Disables the trigger. |
| `items` | array | `[]` | `{ key, label, icon?, disabled?, danger?, href?, target? }` or `{ type:'SEPARATOR' }` | Always | Required, at least one item. Keys unique; items with `href` are links. Leading, trailing and double separators are removed. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the menu button shows its name on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `onAction` | function | `null` | `(key, instance) => {}` | Always | Takes precedence over the third `renderActionMenu()` argument. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onAction` | `(key, instance)` | An available item is chosen by click, Enter or Space (links also navigate). | Unavailable items; closing with Escape, Tab or an outside click. |

### Errors

ActionMenu has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `ActionMenu "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `ITEMS_REQUIRED` | error | No usable item. |
| `INVALID_ITEM` | warning | An item without key or label; dropped. |
| `DUPLICATE_ITEM_KEY` | warning | Duplicate key; dropped. |
| `INVALID_OPTION` | warning | Invalid `size`; the default is used. |

### Accessibility

- ARIA menu button pattern: the trigger has `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`; the list has `role="menu"` labelled by the trigger; entries are `role="menuitem"` (buttons or links), unavailable ones `aria-disabled="true"`.
- Opening focuses the first available item (ArrowUp on the trigger: the last); arrows wrap, Home/End jump, typing a letter jumps to the next matching item, Escape closes and returns focus to the trigger, Tab closes and moves on.
- Danger items are distinguished by colour and by their label (e.g. "Delete"), never by colour alone.

### Examples

```js
renderActionMenu(host,
{
    id:`more-${order.id}`, label:`More actions for order ${order.id}`,
    items:[
        { key:'duplicate', label:'Duplicate', icon:'fa-regular fa-copy' },
        { key:'invoice', label:'Download invoice', icon:'fa-solid fa-file-arrow-down' },
        { key:'track', label:'Track shipment', icon:'fa-solid fa-truck', href:`/orders/${order.id}/tracking` },
        { type:'SEPARATOR' },
        { key:'delete', label:'Delete', icon:'fa-solid fa-trash', danger:true }
    ]
},( key ) => handleOrderAction(key,order));
```

### Files

| File | Responsibility |
| --- | --- |
| `actionMenuIndex.js` | Public entry point; the only import surface. |
| `actionMenuConfig.js` | Defaults, item normalization, developer validation. |
| `actionMenuComponent.js` | Trigger Button, open/close, positioning, keyboard, type-ahead. |
| `actionMenuHTML.js` | Menu markup. |
| `actionMenuEvents.js` | Menu and open-menu listeners. |
| `actionMenuErrors.js` | Developer error and warning catalog. |
| `actionMenu.css` | Presentation. |
| `actionMenuTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/actionMenu.test.mjs`). |
