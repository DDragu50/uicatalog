# CollapsiblePanel

## For business

### Overview

CollapsiblePanel groups related content under a titled header that the user can open and close. When closed, it can show a short summary so the user still sees the essentials. The header can also carry status Chips and action Buttons.

### When to use

- Use it to group content under a title that the user opens and closes, with a short summary while closed.
- Use Accordion for several panels that work together, and ContentGroup when the content always stays visible.

### Key features

- A header with title, description, icon, status colour, labels and action buttons.
- A short summary of the content while the panel is closed.
- Three layouts: card, inline (separated by lines) and compact.
- Panels that start open or closed, that are always open, or that are temporarily locked.
- Content prepared only when the user first opens the panel.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing, borders and typography. |
| Panel styles (`collapsiblePanel.css`) | Always | Panel appearance. |
| Chip component and `chip.css` | Header Chips are used | Header Chips. |
| Button component and `button.css` | Header actions are used | Header action Buttons. |
| Font Awesome icon library | Header icon is used | Icon glyph. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides the content and the summary, decides the status and what header actions do, and validates the content.

## For designers

### Structure

```text
section#{id}.ui-collapsible-panel[.ui-collapsible-panel-{variant}][.ui-collapsible-panel-bordered][.ui-collapsible-panel-square]  data-state data-status data-show-summary-expanded
├── div.ui-collapsible-panel-header
│   ├── h2–h6.ui-collapsible-panel-heading-level     (only with headingLevel 2–6) around:
│   ├── button.ui-collapsible-panel-toggle          (collapsible)  or  div.ui-collapsible-panel-heading  (not collapsible)
│   │   ├── span.ui-collapsible-panel-chevron       (collapsible only)
│   │   ├── i.ui-collapsible-panel-icon.{icon}      (optional)
│   │   └── span.ui-collapsible-panel-titles
│   │       ├── span.ui-collapsible-panel-title
│   │       └── span.ui-collapsible-panel-description   (optional)
│   ├── div.ui-collapsible-panel-chips              (optional) → Chip list
│   └── div.ui-collapsible-panel-actions            (optional)
│       └── span.ui-collapsible-panel-action → Button   (one per action)
├── div.ui-collapsible-panel-summary
│   └── consumer summary  or  span.ui-collapsible-panel-summary-empty
└── div.ui-collapsible-panel-content                (role="region")
    └── div.ui-collapsible-panel-item               (one per content child)
        └── child component or static HTML
```

State and status are exposed as attributes: `data-state="EXPANDED|COLLAPSED"` hides the content when collapsed; `data-status` drives the side border; `data-show-summary-expanded="false"` hides the summary while expanded. A summary with nothing to show (no `summaryRenderer` and no `summaryEmptyText`, or a renderer returning empty or blank markup) is hidden (`hidden` attribute), so a collapsed panel shows no empty strip under the title. The header wraps below a panel width of `26rem` (container query `panel`). `ui-collapsible-panel-group` is an optional consumer wrapper that stacks several panels with consistent spacing. Chip and Button appearance is owned by those components.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Variant | Default, inline, compact, plain | —, `ui-collapsible-panel-inline`, `ui-collapsible-panel-compact`, `ui-collapsible-panel-plain` |
| Summary while expanded | Hidden, shown | `data-show-summary-expanded="false"`, `"true"` |
| Border (default, compact) | Status edge only (default), thin border around | `ui-collapsible-panel-bordered` |
| Corners (default, compact) | Rounded (default), square | `ui-collapsible-panel-square` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Panel | Expanded, collapsed | `data-state="EXPANDED"`, `data-state="COLLAPSED"` |
| Status | Default, success, warning, error, incomplete | `data-status="DEFAULT"`, `"SUCCESS"`, `"WARNING"`, `"ERROR"`, `"INCOMPLETE"` |

### Styling contract

`collapsiblePanel.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-collapsible-panel-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-border`: collapsible panel (also bordered, status incomplete, inline), content
  - `--c-surface`: collapsible panel
  - `--c-success-border`: collapsible panel (status success)
  - `--c-success`: collapsible panel (status success)
  - `--c-warning-border`: collapsible panel (status warning)
  - `--c-warning`: collapsible panel (status warning)
  - `--c-danger-border`: collapsible panel (status error)
  - `--c-danger`: collapsible panel (status error)
  - `--c-grey-40`: collapsible panel (status incomplete)
  - `--c-text`: chevron
  - `--c-muted`: description, summary empty
- Typography
  - `--font-ui`: header, summary
  - `--fw-ui`: header, summary
  - `--fw-ui-medium`: title
  - `--fs-label`: description, summary
  - `--font-italic`: summary empty
- Borders and corners
  - `--radius-panel`: collapsible panel
  - `--border-thin`: collapsible panel (bordered, inline), content
  - `--radius-sm`: toggle (focus)
- Shadows
  - `--shadow-sm`: collapsible panel
- States and motion
  - `--opacity-disabled`: toggle (disabled)
  - `--transition-1`: chevron

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: header, toggle, heading, actions
  - `--padding-card`: header (also compact), summary (also compact), content (also compact)
  - `--padding-panel`: header, summary, content
  - `--space-sm-1`: titles
  - `--gap-tight`: chips, chip list, summary
  - `--space-sm-3`: header (compact), summary (compact)
  - `--gap-toolbar`: content (compact), collapsible panel (group)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: toggle (focus)
  - `--focus-offset`: toggle (focus)
- Sizes
  - `--percentage-full`: collapsible panel, chips (narrow), actions (narrow)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `collapsiblePanelIndex.js`.
- Check whether the configuration already provides the requested behavior before adding code.
- Never write panel markup, classes or styles by hand; use `renderCollapsiblePanel()`.
- Pass header Chips as configuration objects (`chips`, following the Chip README) and header buttons as actions (`actions` + `onAction`, the shared contract of guidelines §10.2); never create them yourself inside the header.
- Content is the third argument of `renderCollapsiblePanel()`: an ordered `children` array of static HTML strings or functions `(host, panel) => instance` that render a component (e.g. a ContentGroup) into `host` through its own public API. Use `lazyContent:true` when content is expensive.
- The panel never passes options down to content children; configure each child directly.
- Call `refreshSummary()` after the data shown in the summary changes; call `setStatus()` to reflect validation results.
- `onToggle` reports only user toggles; programmatic `expand()`, `collapse()` and `toggle()` do not call it.
- Keep validation and business logic in the consuming code; do not modify panel source for application-specific needs.
- Give each panel a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- String children and `summaryRenderer` output are inserted as HTML. Escape any user-provided or external data first.
- Never remove `aria-expanded`, `aria-controls` or the content region's label.
- Do not use `disabled` to hide content; it only blocks user toggling.

### Example prompts

```text
Create one CollapsiblePanel per checkout step (Address, Delivery, Payment). Show a one-line summary of the entered data when a panel is closed and set the status to SUCCESS or ERROR after validating that step.
```

```text
Add a compact CollapsiblePanel "Advanced options" with an Edit button in the header. Load its content only when the user opens it for the first time.
```

## For developers

### Business analysis

> **Component**: the CollapsiblePanel itself. **Consumer**: the developer who configures the CollapsiblePanel in the application's code. **App**: the running application that uses the CollapsiblePanel; it provides the data, performs the actions and stores the changes.

**Opening and closing**

- User clicks the header. <!-- BA-01 -->
  - Component opens or closes the panel. <!-- BA-02 -->
  - Component reports the new state to the App. <!-- BA-03 -->
- Consumer chooses whether the panel starts open or closed. <!-- BA-04 -->
- Consumer chooses an always-open panel (optional). <!-- BA-05 -->
- App disables the header temporarily (optional). <!-- BA-06 -->
  - Component prevents opening and closing. <!-- BA-07 -->

**Header**

- Consumer provides the title, and a description and an icon (optional). <!-- BA-08 -->
- Component displays a coloured side border for the status: success, warning, error or incomplete. <!-- BA-09 -->
  - App changes the status at any time, e.g. after checking the content. <!-- BA-10 -->
- Consumer provides labels, e.g. "Draft", and action buttons, e.g. "Edit" (optional). <!-- BA-11 -->
  - User clicks an action button. <!-- BA-12 -->
  - Component reports the action to the App, without opening or closing the panel. <!-- BA-13 -->
- Component moves the labels and buttons below the title when the panel is narrow. <!-- BA-14 -->

**Summary** (optional)

- App provides a short summary of the content. <!-- BA-15 -->
  - Component displays it while the panel is closed, and also while it is open when the Consumer chooses it. <!-- BA-16 -->
  - Component displays a placeholder text when the summary is empty. <!-- BA-17 -->

**Layout**

- Consumer chooses the layout: card, inline or compact. <!-- BA-18 -->
  - Component displays the inline layout without a card, separated from the next panel by a line. <!-- BA-19 -->
- Consumer chooses a border and rounded or square corners for the card. <!-- BA-20 -->

**Content**

- Consumer provides the content: text or other components, e.g. groups of fields. <!-- BA-21 -->
- Component displays the content only after the user first opens the panel, which makes pages with many panels faster (optional). <!-- BA-22 -->

**Tooltips**

- Consumer chooses how icon-only actions show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-23 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no (container: `getChildren()`) · Actions: yes (`actions`, `onAction`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderCollapsiblePanel, DEFAULT_COLLAPSIBLE_PANEL_CONFIG, COLLAPSIBLE_PANEL_TOOLTIP_MODES, COLLAPSIBLE_PANEL_STATES, COLLAPSIBLE_PANEL_STATUSES, COLLAPSIBLE_PANEL_VARIANTS, COLLAPSIBLE_PANEL_HEADING_LEVELS } from './collapsiblePanelIndex.js';

const panel = renderCollapsiblePanel(container, config, children); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The panel imports no content component.

`children` (the panel content) is an ordered array; a single string is accepted as one child. Children are rendered once: on render, or on the first expansion with `lazyContent:true`.

| Child | Behavior |
| --- | --- |
| string | Trusted static HTML inserted into its own item host. |
| function `(host, panel) => instance \| null` | Called once with an empty item host; renders anything into it. A returned object is kept and its `destroy()` is called when the panel is destroyed. |

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getState()` | string | `EXPANDED` or `COLLAPSED`. |
| `getStatus()` | string | Current status. |
| `expand()` / `collapse()` / `toggle()` | boolean | Changes the state; `false` when not collapsible or already in that state. Works even when `disabled`. |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables a header action Button; `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `setStatus(status)` | boolean | Sets the status (case-insensitive); `false` and `INVALID_STATUS` warning for an invalid value. |
| `focus()` | boolean | Moves keyboard focus to the header toggle; `false` when the panel is not collapsible or is disabled (e.g. Accordion moves between headers with it). |
| `refreshSummary()` | — | Re-renders the summary (hidden while it is empty). |
| `getChildren()` | array | Copy of the content child instances returned by render functions (empty until first expanded with `lazyContent`); lets a Form find fields inside the panel. |
| `destroy()` | — | Removes the listener, destroys header Chips and Buttons and content children, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root element id and prefix of internal ids. |
| `title` | string | — | Text | Always | Required. Header title and name of the content region. |
| `description` | string | `''` | Text | Always | Secondary header text. |
| `icon` | string | `''` | CSS class names | Always | Decorative header icon. |
| `collapsible` | boolean | `true` | — | Always | `false`: always expanded, no toggle. |
| `state` | string | `'COLLAPSED'` | `EXPANDED`, `COLLAPSED` | `collapsible` | Initial state. Forced to `EXPANDED` when not collapsible. |
| `disabled` | boolean | `false` | — | `collapsible` | Blocks user toggling only. |
| `status` | string | `'DEFAULT'` | `DEFAULT`, `SUCCESS`, `WARNING`, `ERROR`, `INCOMPLETE` | Always | Initial status. |
| `variant` | string | `'DEFAULT'` | `DEFAULT`, `INLINE`, `COMPACT`, `PLAIN` (`''` = `DEFAULT`) | Always | Layout. `DEFAULT`: a card (surface, shadow, comfortable spacing). `PLAIN`: the default spacing without any frame, line, background or shadow, for a panel that sits inside a frame drawn by its container (e.g. Accordion's joined look); the status is not shown. `INLINE`: no card — no background, shadow, side spacing or side edges, only a line below; for lists of panels or panels inside another container. `COMPACT`: the card with smaller spacing, for dense layouts. |
| `bordered` | boolean | `false` | — | `DEFAULT`, `COMPACT` | `true`: a thin border around the card as well; `false`: only the thick status edge on the start side. |
| `cornerRadius` | string | `'ROUNDED'` | `NONE`, `ROUNDED` | `DEFAULT`, `COMPACT` | `ROUNDED`: corners with the `--radius-panel` token; `NONE`: square corners. |
| `chips` | array | `[]` | Chip configurations | Always | Rendered through the Chip API; Chip rules apply. |
| `actions` | array | `[]` | `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }` | Always | Header buttons (guidelines §10.2), after the Chips; TERTIARY by default; `iconOnly` shows only the icon (the label is its name). Pressing one never opens or closes the panel. Without `onAction` they are disabled (`ACTION_HANDLER_MISSING`). The former `buttons` option is ignored (`OPTION_IGNORED`). |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How icon-only actions show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `onAction` | function | `null` | `(key, instance) => {}` | `actions` | A header action Button was pressed. |
| `summaryRenderer` | function | `null` | `(instance) => string` | Always | Summary HTML (trusted); called on render, on every state change and on `refreshSummary()`. |
| `summaryEmptyText` | string | `''` | Text | not `summaryRenderer` | Placeholder summary text. |
| `showSummaryWhenExpanded` | boolean | `false` | — | Always | Keeps the summary visible while expanded. |
| `lazyContent` | boolean | `false` | — | `collapsible` | Renders the content children on the first expansion instead of on render. |
| `headingLevel` | number | `0` | `0`, `2`–`6` | Always | `2`–`6` wraps the header toggle (or the static heading) in `<h2>`…`<h6>`, so screen-reader users can list and jump between panel headers; it adds no look. `0`: no heading element. Choose the level that fits the page outline (e.g. `3` under an `h2`). An invalid value gives `INVALID_OPTION` and `0`. |
| `onToggle` | function | `null` | `(state, instance) => {}` | `collapsible` | See Callbacks. |

When `collapsible:false`, `state:'COLLAPSED'`, `disabled`, `lazyContent` and `onToggle` are ignored with an `OPTION_IGNORED` warning; with `variant:'INLINE'` or `'PLAIN'`, so are `bordered` and `cornerRadius`.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onToggle` | `(state, instance)` | The user successfully toggles the panel; `state` is the new state. | Programmatic `expand()`, `collapse()`, `toggle()`; disabled or non-collapsible panel. |
| `onAction` | `(key, instance)` | A header action Button is pressed. | Disabled actions; the panel is not opened or closed. |

Header Chip callbacks are defined in their own configurations.

### Errors

CollapsiblePanel has no user-facing errors. Developer errors prevent rendering (`renderCollapsiblePanel()` returns `null`); warnings are logged and rendering continues. Chip and Button report their own configuration errors. Console format: `CollapsiblePanel "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `TITLE_REQUIRED` | error | `title` is empty. |
| `INVALID_OPTION` | warning | Invalid enumerated value or `headingLevel`; the default is used. |
| `INVALID_ICON_CLASS` | warning | Invalid class names removed from `icon` or an action icon. |
| `INVALID_COLLECTION` | warning | `chips` is not an array; ignored. |
| `INVALID_ACTION` | warning | An action without key or label; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A duplicate action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` names no action. |
| `ACTION_HANDLER_MISSING` | warning | Actions without `onAction`; their Buttons are rendered disabled. |
| `OPTION_IGNORED` | warning | Option that does not apply: to a non-collapsible panel, or `bordered`/`cornerRadius` with INLINE or PLAIN. |
| `INVALID_CHILD` | warning | A content child is neither a string nor a function; ignored. |
| `INVALID_STATUS` | warning | `setStatus()` received an invalid value; status unchanged. |

### Accessibility

- The toggle is a native `<button>` with `aria-expanded` and `aria-controls` pointing to the content. With `headingLevel`, it sits inside a heading (`<h2>`…`<h6>`), as in the WAI-ARIA accordion pattern; use it whenever panels are stacked or the title names a section of the page.
- The content is a `role="region"` labelled by the title; a non-collapsible panel uses a plain heading container.
- Chevron and icon are `aria-hidden`. Status is visual only; add a Chip or text when the status must be announced.
- The consumer ensures content and summary markup are accessible.

### Examples

Step panel with a ContentGroup as lazy content, a summary and validation status:

```js
const address = { street:'', city:'' };

const panel = renderCollapsiblePanel(stepHost,
{
    id:'step-address',
    title:'Delivery address',
    status:'INCOMPLETE',
    lazyContent:true,
    summaryRenderer:() => address.city ? `${escapeHTML(address.street)}, ${escapeHTML(address.city)}` : 'No address entered yet.', // escapeHTML: application helper
    actions:[ { key:'edit', label:'Edit', icon:'fa-solid fa-pen' } ],
    onAction:( key, panel ) => { if ( key === 'edit' ) { panel.expand(); } }
},[ host => renderContentGroup(host,{ id:'address-fields', label:'Address', direction:'HORIZONTAL' },
    [
        groupHost => renderTextInput(groupHost,{ id:'address-street', label:'Street' },( value ) => { address.street = value; }),
        groupHost => renderTextInput(groupHost,{ id:'address-city', label:'City' },( value ) => { address.city = value; })
    ]) ]);

function onAddressSaved( valid )
{
    panel.setStatus(valid ? 'SUCCESS' : 'ERROR');
    panel.refreshSummary();
    if ( valid ) { panel.collapse(); }
}
```

### Files

| File | Responsibility |
| --- | --- |
| `collapsiblePanelIndex.js` | Public entry point; the only import surface. |
| `collapsiblePanelConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `collapsiblePanelComponent.js` | Lifecycle, state transitions, Chip composition, action Buttons, content children, runtime API. |
| `collapsiblePanelHTML.js` | Panel shell (empty content region) and summary markup. |
| `collapsiblePanelEvents.js` | Toggle listener on the panel's own button. |
| `collapsiblePanelState.js` | Per-instance runtime state. |
| `collapsiblePanelErrors.js` | Developer error and warning catalog. |
| `collapsiblePanel.css` | Presentation. |
| `collapsiblePanelTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/collapsiblePanel.test.mjs`). |
