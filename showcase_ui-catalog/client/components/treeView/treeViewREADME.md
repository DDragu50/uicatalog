# TreeView

## For business

### Overview

TreeView shows information that has parents and children — folders and files, departments and people, categories and products — as a list the user opens level by level. The user can browse it, pick one item or tick several, search it and, when allowed, reorganise it.

### When to use

- Use it for data with parents and children that users browse or choose from: folders and files, departments and people, categories and products.
- Use SideNavigation for the application's page menu, and Table for flat lists of records.

### Key features

- Pick one item, or tick several with checkboxes; ticking a parent ticks everything under it.
- Search the tree; matches stay visible with the levels above them.
- Load large trees level by level, only when a level is opened.
- Reorganise the tree: add, rename, delete and move items (optional).
- Add the application's own actions for the current item, such as Open or Print.
- Use it inside forms like any other field.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| TreeView styles (`treeView.css`) | Always | Tree appearance. |
| Button component and `button.css` | Editing or application actions | Toolbar buttons. |
| Message component and `message.css` | Search or editing | "No matching items" and the delete confirmation. |
| Loader component and `loader.css` | `loadChildren` | The small ring next to a parent whose sub-items load. |
| Font Awesome icon library | Item icons, editing, action icons | Item icons and toolbar icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides the data (and, for levels loaded on demand, fetches them), saves edits (to a server, for example), decides which moves and actions are allowed, and performs its actions (opening, viewing, printing an item). Copy and paste, several items moved at once, undo, renaming checks such as unique names, and showing tens of thousands of items at once are not part of this version.

## For designers

### Structure

```text
div#{id}.ui-tree-view.ui-tree-view-selection-{none|single|multiple}[.ui-tree-view-lines][.ui-tree-view-editable][.ui-tree-view-searching][.ui-tree-view-invalid][.ui-tree-view-label-{top|start}]
├── div.ui-tree-view-label                                   (label; .ui-tree-view-optional / .ui-tree-view-mandatory)
├── div.ui-tree-view-toolbar  role="group"                   (actions or editable)
│   ├── span.ui-tree-view-action → Button                    (one per application action)
│   ├── span.ui-tree-view-toolbar-separator                  (actions and editable)
│   └── span.ui-tree-view-tool → Button                      (editable: Add, Add sub-item, Rename, Delete, Move up, Move down, Move into the item above, Move out of the parent)
├── div.ui-tree-view-search > input.ui-tree-view-search-input (search)
├── div.ui-tree-view-body
│   ├── ul.ui-tree-view-tree  role="tree"
│   │   └── li.ui-tree-view-item  role="treeitem"  [aria-expanded] [aria-selected | aria-checked] [aria-disabled] [aria-busy] [draggable] [hidden]
│   │       ├── div.ui-tree-view-row  [data-drop="before|after|inside"]
│   │       │   ├── span.ui-tree-view-toggle             (arrow; empty space for items without sub-items)
│   │       │   ├── span.ui-tree-view-check              (MULTIPLE)
│   │       │   ├── span.ui-tree-view-icon               (icon)
│   │       │   ├── span.ui-tree-view-text  → mark.ui-tree-view-match (search) or input.ui-tree-view-rename (renaming)
│   │       │   ├── span.ui-tree-view-badge              (badge)
│   │       │   ├── span.ui-tree-view-status             ("Loading…" for screen readers while loading, load error)
│   │       │   └── span.ui-tree-view-loader → Loader (RING, SMALL)   (while sub-items load; not displayed while the ring is hidden)
│   │       └── ul.ui-tree-view-group  role="group"  [hidden]   (sub-items)
│   └── div.ui-tree-view-no-results → Message (INLINE, INFO)
├── div.ui-tree-view-help                                    (help)
├── div.ui-tree-view-error  [hidden]
└── div.ui-tree-view-dialog → Message (MODAL, DANGER)        (delete confirmation)
```

Rows indent by one arrow column per level; the selected item (SINGLE) has the selected background and a bold text; ticked and partly ticked boxes are filled with the accent colour (check mark or dash). Guide lines run under the parent's arrow. While dragging, a line before or after a row, or a framed row (inside), shows where the item will go. The current item (`.ui-tree-view-current`, one at a time) has a thin accent frame in every selection mode. Focus is shown on the row.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Selection | None, single, multiple | `ui-tree-view-selection-none`, `-single`, `-multiple` (`.ui-tree-view-check`) |
| Guide lines | Off, on | —, `ui-tree-view-lines` |
| Toolbar | Application actions, editing tools | `.ui-tree-view-toolbar` with `.ui-tree-view-action` hosts, `.ui-tree-view-toolbar-separator`, `.ui-tree-view-tool` hosts |
| Editing | Off, on | —, `ui-tree-view-editable` |
| Search | Off, on | —, `.ui-tree-view-search` |
| Label position | Inherit, top, start | —, `ui-tree-view-label-top`, `ui-tree-view-label-start` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Search | Searching | `ui-tree-view-searching` |
| Item | Open, current, selected, ticked, partly ticked, disabled, loading, load error | `[aria-expanded="true"]`, `.ui-tree-view-current`, `[aria-selected="true"]`, `[aria-checked="true"]`, `[aria-checked="mixed"]`, `[aria-disabled="true"]`, `[aria-busy="true"]`, `.ui-tree-view-load-error` |
| Drag and drop | Dragged item, drop before / after / inside | `.ui-tree-view-dragging`, `.ui-tree-view-row[data-drop="before\|after\|inside"]` |

### Styling contract

`treeView.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-tree-view-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: tree view, search input, row (selected), rename
  - `--c-muted`: optional, toggle, check, icon, status, help
  - `--c-danger-text`: mandatory, status (load error), label (invalid), error
  - `--c-border`: search input, toolbar separator, group (lines)
  - `--c-surface`: search input, check, rename
  - `--c-surface-hover`: row (hover)
  - `--c-selected`: row (selected, drop inside)
  - `--c-accent`: check (checked, partly checked), badge, rename, row (current, drop before, drop after, drop inside)
  - `--c-on-accent`: check (checked, partly checked), badge
- Typography
  - `--font-ui`: tree view
  - `--fw-ui`: tree view, optional
  - `--fs-control`: tree view
  - `--lh-compact`: tree view
  - `--fs-label`: label, help, error
  - `--fw-ui-strong`: label, text (selected), badge, error
  - `--fw-ui-emphasis`: match
  - `--fs-caption`: badge, status
  - `--lh-body`: help, error
- Borders and corners
  - `--border-thin`: search input, toggle, check, rename, row (current)
  - `--radius-control`: search input, row
  - `--radius-control-small`: check, rename
  - `--border-thick`: check (checked), row (drop before, drop after, drop inside)
  - `--radius-pill`: badge
- States and motion
  - `--opacity-disabled`: row (disabled, dragging)
  - `--transition-1`: toggle

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thin`: toolbar separator, group (lines)
  - `--border-thick`: check (partly checked)
- Spacing
  - `--gap-tight`: tree view, toolbar separator, no results, row, badge, rename, group (lines)
  - `--gap-inline-items`: toolbar, row, toggle
  - `--padding-control`: search input
  - `--space-lg-3`: row, toggle, group (lines)
- Sizes
  - `--icon-size-large`: toolbar separator, icon, badge
  - `--control-height`: search input
  - `--space-sm-3`: toggle
  - `--icon-size-medium`: check, icon
  - `--space-sm-2`: check (checked)
  - `--space-md-1`: check (checked, partly checked)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thick`: row (focus)
- States and motion
  - `--focus-outline`: search input (focus), rename (focus), row (focus)
  - `--focus-offset`: search input (focus), rename (focus)
- Spacing
  - `--space-sm-2`: check
  - `--gap-toolbar`: tree view (label on the left)
- Sizes
  - `--form-label-width`: tree view (label on the left)

**Set by the component — don't change**

- Variables
  - `--ui-tree-view-level`: depth of each item (drives the indentation and the guide lines)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `treeViewIndex.js`.
- Check the configuration before adding code; configure instead of reproducing markup, styles, keyboard handling, selection, validation or drag and drop.
- Keep business logic (where the data comes from, saving edits, naming rules) in the application; don't modify the component for application needs — propose reusable framework changes instead.
- Application buttons follow the shared actions contract (guidelines §10.2): pass `actions` (`{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`) and handle `onAction(key, item)`; never create Buttons yourself inside the component.
- For operations on an item (open, view, print, download…), add them as `actions` and do the work in `onAction(key, item)`; use `canAct` to make an action unavailable for some items; read the current item with `getCurrent()` or follow it with `onCurrentChange` when your own controls live outside the tree.
- Respect conditional options: `checkCascade` and `checkedValue` need `MULTIPLE`; `canAct` and `onAction` need `actions`; form-field options and members exist only when `selectionMode` is `SINGLE` or `MULTIPLE`; `onActivate` only with `NONE`; `confirmDelete`, `canMove` and `onEdit` only with `editable`.
- Callbacks report user actions only; programmatic methods (`setValue`, `setItems`, `expand`, …) never fire them.
- Use unique ids (the tree's and the items' within the tree) and call `destroy()` before rendering into the same container again.
- Map your data to items `{ id, label, icon?, badge?, disabled?, expanded?, selected?, hasChildren?, children? }`; for large trees pass `hasChildren:true` without `children` and return the children from `loadChildren`.
- To save an edited tree, use `getItems()` (or apply each `onEdit` change); new items get generated ids (`{id}-new-{n}`) — map them to your own ids in `onEdit`.
- Give a selection tree a visible `label` (required when mandatory); a browsing tree without a label needs `ariaLabel`.

### Safety

- Item labels and texts are inserted as text, never as HTML; don't put markup in them expecting it to render.
- Don't remove the ARIA roles and states (`tree`, `treeitem`, `group`, `aria-expanded`, `aria-selected`, `aria-checked`) or the roving `tabindex`; keyboard and screen-reader use depend on them.
- Don't put interactive elements inside item rows; actions belong in the toolbar (editable) or outside the tree.
- Don't change the tree's DOM from outside; use `setItems()` and `updateItem()`.

### Example prompts

- "Show our document folders as a TreeView with icons; load each folder's content from `/api/folders/{id}` when it is opened, and open the selected document in the preview pane."
- "Add a permissions tree to the role form: modules → screens → actions with cascading checkboxes; the form should send only the end items."
- "Make the category tree editable for administrators: save every change through `onEdit`, and forbid moving categories under 'Archived'."

## For developers

### Business analysis

> **Component**: the TreeView itself. **Consumer**: the developer who configures the TreeView in the application's code. **App**: the running application that uses the TreeView; it provides the data, performs the actions and stores the changes.

**Browsing**

- App provides the items as a tree of parents and sub-items. <!-- BA-01 -->
- User clicks the arrow before a parent to open or close its sub-items. <!-- BA-02 -->
  - Component displays the sub-items indented under their parent. <!-- BA-03 -->
  - Component displays guide lines between a parent and its sub-items (optional). <!-- BA-04 -->
- Component displays an icon before an item and a counter after it (optional), e.g. "Contracts 2". <!-- BA-05 -->
- Component displays unavailable items greyed out. <!-- BA-06 -->
  - Component prevents selecting, ticking, editing and moving an unavailable item. <!-- BA-07 -->
- User clicks an item to make it the current item. <!-- BA-08 -->
  - Component displays a thin frame around the current item. <!-- BA-09 -->
  - Component reports the current item to the App. <!-- BA-10 -->

**Selection**

- Consumer chooses one of three modes: browsing only, one selected item, or several ticked items. <!-- BA-11 -->
- User clicks an item in a browsing-only tree. <!-- BA-12 -->
  - Component reports the item to the App. <!-- BA-13 -->
  - App opens the item, e.g. a file. <!-- BA-14 -->
- User clicks an item in a one-selection tree. <!-- BA-15 -->
  - Component selects the item and displays it with a filled background and bold text. <!-- BA-16 -->
- User clicks the checkbox of an item in a tree with checkboxes. <!-- BA-17 -->
  - Component ticks or unticks the item. <!-- BA-18 -->
  - Component ticks all sub-items of a parent that the user ticks (optional, on by default). <!-- BA-19 -->
    - Component displays a dash in the checkbox of a partly ticked parent. <!-- BA-20 -->
- User clicks the name of an item in a tree with checkboxes. <!-- BA-21 -->
  - Component moves the current-item frame to it without ticking it. <!-- BA-22 -->
- Consumer chooses which ticked items form the value: all of them, only the end items, or only the top-most ones. <!-- BA-23 -->

**Search** (optional)

- User types text in the search field above the tree. <!-- BA-24 -->
  - Component hides the items that do not match, except the parents of matching items. <!-- BA-25 -->
  - Component displays the matching text in bold. <!-- BA-26 -->
  - Component displays "No matching items" when nothing matches. <!-- BA-27 -->

**Loading on demand** (optional)

- User clicks the arrow of a parent whose sub-items are not loaded yet. <!-- BA-28 -->
  - Component requests the sub-items from the App and displays a small turning ring next to the parent when loading takes longer than a short delay. <!-- BA-29 -->
  - Component displays an error on the parent when loading fails. <!-- BA-30 -->
    - User clicks the arrow again to retry. <!-- BA-31 -->

**Editing** (optional)

- Component displays a toolbar with the buttons Add, Add sub-item, Rename, Delete, Move up, Move down, Move into the item above and Move out of the parent. <!-- BA-32 -->
  - Component applies the toolbar buttons to the current item. <!-- BA-33 -->
- User clicks Add, or Add sub-item. <!-- BA-34 -->
  - Component adds an item after the current item, or under it, and opens its name for renaming. <!-- BA-35 -->
- User clicks Rename, or presses F2. <!-- BA-36 -->
  - Component opens the name of the current item for renaming. <!-- BA-37 -->
  - User presses Enter to keep the new name, or Escape to keep the old one. <!-- BA-38 -->
- User clicks Delete, or presses the Delete key. <!-- BA-39 -->
  - Component asks for confirmation and states how many sub-items are removed with it (optional, on by default). <!-- BA-40 -->
  - Component removes the current item and its sub-items. <!-- BA-41 -->
- User clicks a move button. <!-- BA-42 -->
  - Component moves the current item. <!-- BA-43 -->
- User drags an item with the mouse and drops it before, after or inside another item. <!-- BA-44 -->
  - Component displays where the item will go. <!-- BA-45 -->
  - Component moves the item. <!-- BA-46 -->
- App forbids the moves that break its rules (optional). <!-- BA-47 -->
  - Component disables the move buttons and the drops that are forbidden. <!-- BA-48 -->
- Component reports each change to the App. <!-- BA-49 -->
  - App stores the changes. <!-- BA-50 -->

**App actions** (optional)

- Consumer adds the App's own buttons to the toolbar, e.g. Open, View, Print. <!-- BA-51 -->
- User clicks an action button. <!-- BA-52 -->
  - Component reports the action and the current item to the App. <!-- BA-53 -->
  - App performs the action. <!-- BA-54 -->
- Component disables an action button for an unavailable item, and where the App forbids the action, e.g. Print for a folder. <!-- BA-55 -->

**Form field**

- Component sends the selected or ticked items with the form. <!-- BA-56 -->
- Component checks that a required tree has a selection. <!-- BA-57 -->

**Keyboard additions**

- User presses the arrow keys, Home or End to move between items, and the right or left arrow to open or close a parent. <!-- BA-58 -->
- User types the first letters of an item to move to it. <!-- BA-59 -->
- User presses "*" to open all parents at the same level. <!-- BA-60 -->

**Tooltips**

- Consumer chooses how the full name of each item shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-61 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes, when `selectionMode` is `SINGLE` or `MULTIPLE` · Actions: yes (`actions`, `onAction`, `canAct`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTreeView, DEFAULT_TREE_VIEW_CONFIG, TREE_VIEW_TOOLTIP_MODES, TREE_VIEW_SELECTION_MODES, TREE_VIEW_CHECKED_VALUES, TREE_VIEW_LABEL_POSITIONS, TREE_VIEW_MANDATORY_INDICATORS } from './treeViewIndex.js';

const tree = renderTreeView(container, config, onValueChange); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getItems()` | array | The current tree as items (`config.items` shape: `id`, `label`, `icon`, `badge`, `disabled`, `children`, or `hasChildren` for levels not loaded yet). |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables an application action (it is also unavailable while the current item does not allow it); `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `getCurrent()` | object \| null | The current item (framed; last clicked or reached with the keyboard), as `getItem()`. |
| `getItem(id)` | object \| null | `{ id, label, icon, badge, disabled, parentId, level, hasChildren }` (`parentId` `''` at the top level). |
| `setItems(items)` | — | Replaces the whole tree; the selection comes from the new items' `selected`. No callbacks. |
| `updateItem(id, changes)` | boolean | Changes `label`, `icon`, `badge` (`''` removes it) or `disabled` of one item in place. |
| `expand(id)` / `collapse(id)` | boolean | Opens (loading children when needed) or closes a parent; `false` when nothing changed. |
| `expandAll()` / `collapseAll()` | boolean | Opens every loaded parent / closes every parent. |
| `reveal(id)` | boolean | Opens the item's parents, makes it the item Tab reaches and scrolls it into view. |
| `filter(text)` | — | Filters as the search field does (`''` shows everything); works without the field too. |
| `focus()` | boolean | Focuses the selected item, or the first shown one. |
| `destroy()` | — | Removes listeners, timers, Buttons and Messages; clears the container. |

Form-field members (only when `selectionMode` is `SINGLE` or `MULTIPLE`; the form-field contract):

| Member | Returns | Description |
| --- | --- | --- |
| `name` | string | The configured `name` (default: `id`). |
| `getValue()` | string \| array | SINGLE: the selected id (`''` when none). MULTIPLE: a new array of ticked ids in display order, as `checkedValue` says. |
| `setValue(value, options?)` | `{ valid, errorLabel }` | Sets the selection (an id, or an array of ids to tick, cascading when set); unknown ids are ignored. No `onValueChange`, not dirty. `{ quiet:true }`: no validation, any shown error removed. |
| `validate()` | `{ valid, errorLabel }` | Runs the required check; shows or clears the error. |
| `getError()` | object \| null | Copy of the current error. |
| `setError(message)` / `clearError()` | `{ valid, errorLabel }` / — | Shows / removes an external error (`EXTERNAL`), cleared by the next user change. |
| `isDirty()` | boolean | Whether the user changed the value. |
| `getLabel()` / `getLabelPosition()` / `getMandatoryState()` | string / `'TOP'` \| `'START'` / object | Label, effective label position, `{ mandatory, indicator }`. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root id and prefix of internal ids. |
| `items` | array | `[]` | Item objects (below) | Always | The tree. Items without id or label, and duplicate ids, are dropped with their children. |
| `items[].id` / `items[].label` | string | — | Non-empty; ids unique in the tree | Always | Identity (value, callbacks) and visible text. |
| `items[].icon` | string | `''` | Font Awesome classes | Always | Icon before the text. |
| `items[].badge` | string \| number | `''` | Text | Always | Counter after the text. |
| `items[].disabled` | boolean | `false` | — | Always | Shown, focusable and openable, but cannot be selected, ticked, edited or dragged. |
| `items[].expanded` | boolean | `false` | — | Always | A parent starts open (ignored for items without children). |
| `items[].selected` | boolean | `false` | — | Not `NONE` | Starts selected (SINGLE: the first one; its parents open) or ticked (MULTIPLE). |
| `items[].hasChildren` | boolean | `false` | — | `loadChildren` | A parent whose children are loaded when it is first opened. |
| `items[].children` | array | `[]` | Item objects | Always | Sub-items. |
| `selectionMode` | string | `'SINGLE'` | `NONE`, `SINGLE`, `MULTIPLE` | Always | `NONE`: browse and activate; `SINGLE`: one selected item; `MULTIPLE`: checkboxes. |
| `checkCascade` | boolean | `true` | — | `MULTIPLE` | Ticking a parent ticks its enabled sub-items; a parent is ticked when all its sub-items are, partly ticked (`mixed`) when some are. `false`: independent boxes. |
| `checkedValue` | string | `'ALL'` | `ALL`, `LEAVES`, `TOP` | `MULTIPLE` + `checkCascade` | Value: every ticked id, only ticked items without sub-items, or only ticked items whose parent is not ticked. |
| `label` | string | `''` | Text | Always | Visible label naming the tree. Required when `mandatory` (`LABEL_REQUIRED`). |
| `ariaLabel` | string | `''` | Text | not `label` | Accessible name without a visible label; without both, `texts.tree` is used (`LABEL_MISSING`). |
| `help` | string | `''` | Text | Always | Help text below the tree, linked through `aria-describedby`. |
| `name` | string | value of `id` | Text | Not `NONE` | Key of the value in a Form. |
| `mandatory` | boolean | `true` | — | Not `NONE` | A selected (or ticked) item is required. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | Not `NONE`, `label` | `(Optional)` next to a non-mandatory label, or `*` next to a mandatory one. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Not `NONE` | Label above, on the left (containers at least 36rem wide), or as the surrounding Form/ContentGroup says (`ui-labels-start`). |
| `guideLines` | boolean | `false` | — | Always | Vertical lines joining sub-items to their parent. |
| `search` | boolean | `false` | — | Always | Search field above the tree. |
| `editable` | boolean | `false` | — | Always | Toolbar (add, add sub-item, rename, delete, move), F2 and Delete keys, drag and drop. |
| `confirmDelete` | boolean | `true` | — | `editable` | Ask before deleting (DANGER modal, Cancel focused). |
| `actions` | array | `[]` | `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }` | Always | Application buttons (guidelines §10.2) at the start of the toolbar, acting on the current item (`onAction`); TERTIARY by default; `iconOnly` shows only the icon (the label is its name; needs `icon`). Keys unique; entries without key or label are dropped. Without `onAction` they are disabled (`ACTION_HANDLER_MISSING`). |
| `canAct` | function | `null` | `(key, item, instance) => boolean` | `actions` | Whether an action is available for an item (called whenever the current item changes); unavailable items never allow actions. |
| `loadChildren` | function | `null` | `(item, instance) => Promise<items>` | Always | For items with `hasChildren`: loads a parent's children on first opening; a rejected promise shows `texts.loadError` (opening again retries). |
| `canMove` | function | `null` | `(move, instance) => boolean` | `editable` | Allows or refuses a move `{ id, parentId, index, previousParentId, previousIndex }` (toolbar and drag and drop; refused moves are not offered). |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the full name of each item (`TOOLTIP`: only when it is cut off) and the names of the icon-only tools and actions show on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.*` | string | English defaults | Text | Always | `tree` ("Tree"), `optional`, `search`, `noResults`, `loading` (status text and the Loader's label), `loadError`, `toolbar`, `add`, `addChild`, `rename`, `delete`, `moveUp`, `moveDown`, `indent`, `outdent`, `newItem` ("New item"), `renameField` ("New name for {label}"), `deleteTitle` ("Delete "{label}"?"), `deleteText`, `deleteTextChildren` ("Its {count} sub-items are deleted too. …"), `deleteConfirm`, `cancel`, `errors.REQUIRED_SELECTION` ("Select an item."). |
| `onValueChange` | function | `null` | `(value, instance) => {}` | Not `NONE` | Takes precedence over the third `renderTreeView()` argument. |
| `onActivate` | function | `null` | `(item, instance) => {}` | `NONE` | An item was chosen. |
| `onExpandChange` | function | `null` | `(expandedIds, instance) => {}` | Always | The user opened or closed a parent. |
| `onEdit` | function | `null` | `(change, instance) => {}` | `editable` | The user changed the tree. |
| `onCurrentChange` | function | `null` | `(item, instance) => {}` | Always | The user made another item current (`item` as `getCurrent()`, or `null`). |
| `onAction` | function | `null` | `(key, item, instance) => {}` | `actions` | An application action was pressed for the current item. |

Options that do not apply are ignored with an `OPTION_IGNORED` warning (e.g. `checkedValue` without `MULTIPLE` or with `checkCascade:false`, `ariaLabel` with `label`, `hasChildren` without `loadChildren`, `canAct` / `onAction` without `actions`, `iconOnly` without `icon`).

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)`; a copy | A user action changes the value: selecting, ticking, and edits or loading that change it (deleting a selected item, adding under a ticked parent, children of a ticked parent loaded). | `setValue()`, `setItems()`, clicks on disabled items, a click on an item's name in MULTIPLE (it only makes the item current), a click that leaves the value unchanged. |
| `onActivate` | `(item, instance)`; `item` as `getItem()` | `NONE`: click, Enter or Space on an enabled item (a click on a parent also opens or closes it). | Disabled items. |
| `onExpandChange` | `(expandedIds, instance)` | The user opens or closes a parent (arrow, keys, click in `NONE`, `*`). | `expand()`, `collapse()`, `expandAll()`, `collapseAll()`, `reveal()`, searching. |
| `onEdit` | `(change, instance)` | After each user edit: `{ type:'ADD', id, parentId, index, label }`, `{ type:'RENAME', id, label, previousLabel }`, `{ type:'DELETE', id, parentId, index, ids }` (ids: the item and its sub-items), `{ type:'MOVE', id, parentId, index, previousParentId, previousIndex }`. | Cancelled renames or deletes, refused moves, programmatic methods. |
| `onCurrentChange` | `(item, instance)` | The current item changes through a user action: click, keyboard, search hiding the current item, closing its parent, an edit (add, delete, move). | `reveal()`, `setItems()`, `filter()`, `collapse()`, `collapseAll()` (they change it silently; `getCurrent()` tells). |
| `onAction` | `(key, item, instance)` | An action Button is pressed (the current item is enabled and `canAct` allows it). | Unavailable actions (disabled Buttons). |

A new item is added with `texts.newItem` (an `ADD` change) and then renamed by the user (a `RENAME` change when the name differs).

### Errors

| Label | Default message | Trigger | Visibility | Clearing |
| --- | --- | --- | --- | --- |
| `REQUIRED_SELECTION` | Select an item. | `mandatory` with an empty value, on `validate()` or a programmatic `setValue()` | Corrective: label in error colour, message below, `aria-invalid` on the tree | A valid `validate()`, or a user change that fixes it. |
| `EXTERNAL` | The given message | `setError(message)` (Form: server or cross-field errors) | Corrective | A user change of the value, or `clearError()`. |

The error never appears on render or focus and is not announced by the component. A failed load shows `texts.loadError` on the item (not an error of the field). Developer errors prevent rendering (`renderTreeView()` returns `null`); warnings are logged and rendering continues. Console format: `TreeView "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | A mandatory selection tree without `label`. |
| `LABEL_MISSING` | warning | No `label` and no `ariaLabel`; `texts.tree` names the tree. |
| `INVALID_OPTION` | warning | Invalid enumerated value; the default is used. |
| `OPTION_IGNORED` | warning | An option that does not apply (see Configuration). |
| `INVALID_ICON_CLASS` | warning | An icon with invalid class tokens; they are dropped. |
| `INVALID_ITEM` | warning | An item without id or label; dropped with its children. |
| `DUPLICATE_ITEM_ID` | warning | A duplicate item id (also among loaded children); the later item is dropped with its children. |
| `SINGLE_SELECTED` | warning | Several `selected` items with `SINGLE`; only the first is selected. |
| `INVALID_ACTION` | warning | An action without key or label; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A duplicate action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` names no action. |
| `ACTION_HANDLER_MISSING` | warning | Actions without `onAction`; their Buttons are rendered disabled. |
| `UNKNOWN_ITEM` | warning | A method names no item. |
| `LOAD_FAILED` | warning | `loadChildren` rejected or did not return an array. |

### Accessibility

- WAI-ARIA tree pattern: `role="tree"` named by the label (or `aria-label`), `treeitem`s with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, sub-lists `role="group"`; SINGLE uses `aria-selected`, MULTIPLE `aria-multiselectable` and `aria-checked` (`mixed` for partly ticked); disabled items `aria-disabled` (still focusable); loading `aria-busy` with the status text ("Loading…", for screen readers only) as description; the ring is a Loader, announced when it appears.
- One item is in the Tab order (roving `tabindex`). Up / Down move between shown items, Right opens a parent or moves to its first sub-item, Left closes it or moves to the parent (mirrored in right-to-left), Home / End jump, typing letters jumps to a matching item, `*` opens all siblings, Enter and Space select (SINGLE) or activate (NONE); in MULTIPLE Space ticks (Enter and a click on the name only make the item current; a click on the box ticks); F2 renames and Delete deletes (editable). The item that has Tab focus is the current item.
- Editing has a pointer-free path for every drag: the toolbar's move buttons (keyboard and single clicks). The toolbar Buttons (actions and editing tools) name the current item in their description (e.g. "Rename", described "Invoice 01.xlsx"). The rename field is named "New name for {label}"; the delete confirmation is a modal dialog with Cancel focused.
- Required trees have `aria-required`; errors are linked with `aria-describedby` and `aria-invalid`.
- Partly ticked and ticked boxes differ by shape (dash, check mark), not only by colour; search matches are bold.

### Examples

```js
// Lazy folders; the selected file opens in the preview.
const files = renderTreeView(host,
{
    id:'files', label:'Documents', mandatory:false, search:true, guideLines:true,
    items:folders.map(folder => ( { id:folder.id, label:folder.name, icon:'fa-solid fa-folder', hasChildren:true } )),
    loadChildren:async ( item ) => ( await fetch(`/api/folders/${item.id}`).then(response => response.json()) ).map(entry =>
        ( { id:entry.id, label:entry.name, icon:entry.folder ? 'fa-solid fa-folder' : 'fa-solid fa-file', hasChildren:entry.folder } )),
    onValueChange:( id ) => showPreview(id)
});
```

```js
// Browse-only documents with actions on the current item; Print only for files.
renderTreeView(host,
{
    id:'docs', ariaLabel:'Documents', selectionMode:'NONE', items:documentTree,
    actions:[ { key:'open', label:'Open', icon:'fa-solid fa-folder-open' }, { key:'print', label:'Print', icon:'fa-solid fa-print', iconOnly:true } ],
    canAct:( key, item ) => key !== 'print' || !item.hasChildren,
    onAction:( key, item ) => ( key === 'open' ? openDocument(item.id) : printDocument(item.id) )
});
```

```js
// Permissions inside a Form: cascading checkboxes, only end items sent.
renderForm(formHost,{ id:'role', onSubmit:( values ) => saveRole(values) },
[
    host => renderTreeView(host,{ id:'permissions', name:'permissions', label:'Permissions', selectionMode:'MULTIPLE', checkedValue:'LEAVES', items:permissionTree })
]);
```

```js
// Editable categories: every change is saved; nothing can be moved into "Archived".
renderTreeView(host,
{
    id:'categories', ariaLabel:'Categories', selectionMode:'NONE', editable:true, items:categories,
    canMove:( move ) => move.parentId !== 'archived',
    onEdit:( change ) => api.post('/categories/changes',change)
});
```

### Files

| File | Responsibility |
| --- | --- |
| `treeViewIndex.js` | Public entry point. |
| `treeViewConfig.js` | Defaults, allowed values, item normalization, developer validation. |
| `treeViewComponent.js` | Lifecycle, runtime API, keyboard, selection, search, loading (with the Loader ring), editing, drag and drop, Buttons and Messages. |
| `treeViewHTML.js` | Shell, treeitems and rows. |
| `treeViewEvents.js` | Tree, search-field and rename-field listeners. |
| `treeViewState.js` | Item model and selection state; model operations (add, remove, move, cascade, value). |
| `treeViewValidation.js` | Required check. |
| `treeViewErrors.js` | User and developer error catalogs, reporter. |
| `treeView.css` | Appearance; header documents the generated DOM. |
| `treeViewTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/treeView.test.mjs`). |
