# Accordion

## For business

### Overview

Accordion stacks several sections of which only the titles are visible; the user opens a section to read or edit its content, such as frequently asked questions, the parts of a settings page or the steps of a long form.

### When to use

- Use it for several sections of which the user reads or edits one or a few at a time: frequently asked questions, parts of a settings page, steps of a long form.
- Use a single CollapsiblePanel for one section that opens and closes on its own.
- Use ContentGroup when all sections stay visible.

### Key features

- One section open at a time (default), or sections that open and close independently.
- Two looks: one frame with lines between the sections, or one card per section.
- Each section with the possibilities of a CollapsiblePanel: icon, description, labels, buttons, status colour, summary while closed.
- Section titles as headings that screen-reader users jump between.
- Fields inside the sections take part in the surrounding form, also while their section is closed.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, lines, corners and spacing. |
| Accordion styles (`accordion.css`) | Always | Frame, dividers and space between sections. |
| CollapsiblePanel component and `collapsiblePanel.css` | Always | Each section is a CollapsiblePanel. |
| Chip and Button components and their styles | A section has labels or buttons in its header | Through CollapsiblePanel. |
| Font Awesome icon library | Sections have icons | Icon glyphs. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides the sections and their content, loads content from a server if needed, and decides which section opens first. Saving which sections were open between visits, drag-and-drop reordering and nested accordions with their own behaviour belong to the application.

## For designers

### Structure

```text
div#{id}.ui-accordion.ui-accordion-{joined|separate}[.ui-accordion-bordered][.ui-accordion-square]  data-expand-mode="SINGLE|MULTIPLE"
└── div.ui-accordion-item  data-index="{n}"   (one per item)
    └── CollapsiblePanel: section.ui-collapsible-panel[.ui-collapsible-panel-plain]   (JOINED: variant PLAIN)
        ├── div.ui-collapsible-panel-header > h{2–6}.ui-collapsible-panel-heading-level > button.ui-collapsible-panel-toggle
        ├── div.ui-collapsible-panel-summary
        └── div.ui-collapsible-panel-content  (role="region")
```

JOINED: the Accordion draws the frame (surface, corners, shadow, optional border) and a line between items; every panel is variant `PLAIN` (no frame of its own). SEPARATE: every panel is a card (its own `variant`, default `DEFAULT`) with `bordered` and `cornerRadius` from the Accordion; the Accordion only sets the gap. The panels keep their own look in both: the Accordion never styles the inside of a panel.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Look | Joined, separate | `ui-accordion-joined`, `ui-accordion-separate` |
| Bordered | Yes, no | `ui-accordion-bordered` (JOINED); SEPARATE: the panel's `ui-collapsible-panel-bordered` |
| Corners | Rounded, none | — , `ui-accordion-square` (JOINED); SEPARATE: the panel's `ui-collapsible-panel-square` |

### States

No states of its own.

### Styling contract

`accordion.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-accordion-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface`: accordion (joined)
  - `--c-border`: accordion (joined + bordered), item (joined)
- Borders and corners
  - `--radius-panel`: accordion (joined)
  - `--border-thin`: accordion (joined + bordered), item (joined)
- Shadows
  - `--shadow-sm`: accordion (joined)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-toolbar`: accordion (separate)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- No tokens.

## For AI-assisted development

### Instructions

- Read this README and the CollapsiblePanel README before writing code. Import only from `accordionIndex.js`.
- Each item is a CollapsiblePanel configuration (`id`, `title`, `description`, `icon`, `chips`, `actions` + `onAction` (header buttons, guidelines §10.2), `status`, `state`, `disabled`, `lazyContent`, `summaryRenderer`, …) plus `content`, the panel's children. Configure the item instead of writing panel markup.
- Set `headingLevel` to fit the page outline (e.g. `3` under an `h2`); it applies to every item.
- Use `expandMode:'MULTIPLE'` when users compare sections or work in several at once; keep `SINGLE` for FAQs and step-by-step content.
- Use `onChange(openIds)` to react to the user (e.g. load content, remember open sections); `expand()`, `collapse()`, `expandAll()` and `collapseAll()` never call it.
- Put fields inside items through render functions; a surrounding Form finds them through `getChildren()`. With `lazyContent`, fields exist only after their section was first opened.
- Keep business logic (what the sections contain, which one opens) in the consuming code; don't modify the component for application needs.
- Give the Accordion and every item a unique `id`, and call `destroy()` before rendering into the same container again.

### Safety

- String `content` and `summaryRenderer` output are inserted as HTML: escape user-provided or external data first.
- Never remove the headings, `aria-expanded` or `aria-controls`, and never replace the header buttons with clickable non-buttons.
- Don't style the inside of the panels from the Accordion's container; restyle CollapsiblePanel or use `@layer overrides`.

### Example prompts

```text
Add an FAQ Accordion under the "Help" heading (h2) with four questions; only one answer open at a time, the first one open.
```

```text
Split the long settings page into an Accordion in MULTIPLE mode with the sections Account, Notifications and Privacy, each holding its fields, inside the existing Form, so Save validates all fields, also in closed sections.
```

## For developers

### Business analysis

> **Component**: the Accordion itself. **Consumer**: the developer who configures the Accordion in the application's code. **App**: the running application that uses the Accordion; it provides the data, performs the actions and stores the changes.

**Sections**

- App provides the sections and their content. <!-- BA-01 -->
- User clicks the title of a section. <!-- BA-02 -->
  - Component opens or closes the section. <!-- BA-03 -->
  - Component closes the open section first (one-at-a-time mode, on by default). <!-- BA-04 -->
  - Component reports the open sections to the App. <!-- BA-05 -->
- Consumer chooses sections that open and close independently (optional). <!-- BA-06 -->
- Consumer chooses which sections start open. <!-- BA-07 -->

**Look**

- Consumer chooses one frame with a line between the sections, or one card per section with space between them. <!-- BA-08 -->
- Consumer chooses a border and rounded or square corners. <!-- BA-09 -->
- Consumer provides for each section an icon, a short description, labels, buttons, a status colour and a summary while closed (optional). <!-- BA-10 -->

**Keyboard additions**

- User presses the up or down arrow, Home or End on a title to move between the titles. <!-- BA-11 -->

**Screen readers**

- Component exposes each title as a heading, at a level chosen by the Consumer, with the open or closed state. <!-- BA-12 -->

**Forms**

- Component adds the fields of all sections to a surrounding form, also while their section is closed. <!-- BA-13 -->
  - Component adds fields that load on first opening once their section is opened. <!-- BA-14 -->

**Tooltips**

- Consumer chooses how the panels' icon-only actions show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-15 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no (container: `getChildren()`) · Actions: through each panel (an item's `actions`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderAccordion, DEFAULT_ACCORDION_CONFIG, ACCORDION_TOOLTIP_MODES, ACCORDION_EXPAND_MODES, ACCORDION_LOOKS, ACCORDION_CORNER_RADII } from './accordionIndex.js';

const accordion = renderAccordion(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. Accordion renders each item with `renderCollapsiblePanel()` into its own item host.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getOpenIds()` | array | Ids of the open items, in display order (a non-collapsible item is always open). |
| `expand(id)` | boolean | Opens an item; SINGLE closes the open one. `false` when the id is unknown (`UNKNOWN_ITEM`), the item is not collapsible or already open. Works on disabled items. |
| `collapse(id)` | boolean | Closes an item; `false` when unknown, not collapsible or already closed. |
| `expandAll()` | boolean | MULTIPLE: opens every item; returns whether any changed. SINGLE: `false` and `OPTION_IGNORED`. |
| `collapseAll()` | boolean | Closes every collapsible item; returns whether any changed. |
| `getPanel(id)` | object \| null | The item's CollapsiblePanel instance (e.g. for `setStatus()` or `refreshSummary()`). |
| `getChildren()` | array | The CollapsiblePanel instances in display order; a Form finds fields through their own `getChildren()`. |
| `focus()` | boolean | Moves focus to the first header that can take it. |
| `destroy()` | — | Removes the keyboard listener and the panels (and their content), clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root element id. |
| `items` | array | `[]` | CollapsiblePanel configurations plus `content` | Always | Required, at least one. Display order. Each item needs its own unique `id` and a `title` (CollapsiblePanel rules). |
| `items[].content` | array \| string | `[]` | Static HTML strings or functions `(host, panel) => instance \| null` | Always | The panel's children, passed to `renderCollapsiblePanel()` unchanged. |
| `expandMode` | string | `'SINGLE'` | `SINGLE`, `MULTIPLE` | Always | `SINGLE`: opening an item closes the open one. `MULTIPLE`: items open and close independently. |
| `look` | string | `'JOINED'` | `JOINED`, `SEPARATE` | Always | `JOINED`: one frame with a line between items (items use CollapsiblePanel `PLAIN`). `SEPARATE`: one card per item, with a gap. |
| `bordered` | boolean | `true` | — | Always | JOINED: the thin line around the frame. SEPARATE: passed to every card unless the item sets its own. |
| `cornerRadius` | string | `'ROUNDED'` | `NONE`, `ROUNDED` | Always | JOINED: corners of the frame. SEPARATE: passed to every card unless the item sets its own. |
| `headingLevel` | number | `3` | Integer 2–6 | Always | Heading level of every item header (CollapsiblePanel `headingLevel`). |
| `keyboardNavigation` | boolean | `true` | — | Always | Up / Down (wrapping), Home / End move focus between headers; disabled and non-collapsible items are skipped. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the panels' icon-only actions (passed to each CollapsiblePanel) show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `onChange` | function | `null` | `(openIds, instance) => {}` | Always | See Callbacks. |

Accordion sets on every item: `headingLevel` and `onToggle` (wrapped: the item's own `onToggle` still runs first). With `look:'JOINED'` it also sets `variant:'PLAIN'` and drops the item's `bordered` and `cornerRadius`. Item options it sets are ignored with `OPTION_IGNORED`: `items[n].headingLevel` always, `items[n].variant/bordered/cornerRadius` with JOINED. In SINGLE mode, when several items start with `state:'EXPANDED'`, only the first keeps it (`SINGLE_EXPANDED`).

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onChange` | `(openIds, instance)` | The user opens or closes an item (after SINGLE has closed the other one); `openIds` as `getOpenIds()`. | `expand()`, `collapse()`, `expandAll()`, `collapseAll()`; disabled or non-collapsible items. |
| `items[].onToggle` | `(state, panel)` | As in CollapsiblePanel: the user toggles that item; runs before `onChange`. | As in CollapsiblePanel; an item closed by SINGLE coordination. |

### Errors

Accordion has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Accordion "id" [LABEL]: message`. Errors in an item's configuration are reported by CollapsiblePanel.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `ITEMS_REQUIRED` | error | `items` is missing, empty, or has no valid item. |
| `INVALID_OPTION` | warning | Invalid `expandMode`, `look`, `cornerRadius` or `headingLevel`; the default is used. |
| `OPTION_IGNORED` | warning | An item option the Accordion sets itself (see Configuration), or `expandAll()` in SINGLE mode. |
| `INVALID_ITEM` | warning | An item that is not an object; dropped. |
| `ITEM_NOT_RENDERED` | warning | CollapsiblePanel refused an item (e.g. missing id or title, duplicate id); the item is left out. |
| `SINGLE_EXPANDED` | warning | SINGLE mode with several items starting open; only the first stays open. |
| `UNKNOWN_ITEM` | warning | `expand()` or `collapse()` with an id that is not an item. |

### Accessibility

- Follows the WAI-ARIA accordion pattern: each header is a native `<button>` with `aria-expanded` and `aria-controls`, inside a heading of level `headingLevel`, so screen-reader users can list the headers and jump between them.
- Each open section is a region labelled by its title (CollapsiblePanel); closed content is hidden and never reached with Tab.
- Tab and Shift+Tab move through headers and the open content; Enter and Space toggle (native button); Up / Down / Home / End move between headers when `keyboardNavigation` is on (it acts only while a header has focus).
- Opening or closing is announced through `aria-expanded`; no live region is needed.
- Status colours are visual only (CollapsiblePanel); add a Chip or text when a status must be announced.

### Examples

FAQ in SINGLE mode, with an open item and its answer loaded when first opened:

```js
const faq = renderAccordion(faqHost,
{
    id:'faq', headingLevel:3,
    items:
    [
        { id:'faq-shipping', title:'How fast do you ship?', state:'EXPANDED', content:[ '<p>Within 2 working days.</p>' ] },
        { id:'faq-returns', title:'Can I return an order?', lazyContent:true, content:[ host => { host.textContent = 'Loading…'; api.answer('returns').then(text => { host.textContent = text; }); return null; } ] }
    ],
    onChange:( openIds ) => analytics.track('faq-open',openIds)
});
```

Settings sections with fields, MULTIPLE mode, separate cards, inside a Form:

```js
renderForm(formHost,{ id:'settings', onSubmit:values => api.saveSettings(values) },
[
    host => renderAccordion(host,
    {
        id:'settings-sections', expandMode:'MULTIPLE', look:'SEPARATE',
        items:
        [
            { id:'section-account', title:'Account', icon:'fa-solid fa-user', state:'EXPANDED', content:[ h => renderTextInput(h,{ id:'name', name:'name', label:'Name' }) ] },
            { id:'section-privacy', title:'Privacy', icon:'fa-solid fa-lock', content:[ h => renderToggle(h,{ id:'public', name:'publicProfile', label:'Public profile' }) ] }
        ]
    })
]);
```

### Files

| File | Responsibility |
| --- | --- |
| `accordionIndex.js` | Public entry point; the only import surface. |
| `accordionConfig.js` | Defaults, allowed values, normalization of the configuration and the items, developer validation. |
| `accordionComponent.js` | Lifecycle, CollapsiblePanel composition, SINGLE coordination, keyboard movement, runtime API. |
| `accordionHTML.js` | Frame and item hosts. |
| `accordionEvents.js` | Keyboard listener (Up / Down / Home / End on headers). |
| `accordionErrors.js` | Developer error and warning catalog. |
| `accordion.css` | Presentation of the frame, dividers and gap. |
| `accordionTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/accordion.test.mjs`). |
