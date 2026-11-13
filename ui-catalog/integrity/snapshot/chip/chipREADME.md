# Chip

## For business

### Overview

Chip is a compact label for short information such as a status, a category, a count or an applied filter. It is either read-only or removable: a removable Chip shows a small "×" the user can activate to ask for its removal.

### When to use

- Use it for short information next to other content: a status, a category, a count or an applied filter.
- Use the removable Chip for filters and selections the user removes one by one.
- Use Button for actions and Badge for people or things with a picture.

### Key features

- Short text with an optional bold prefix ("Owner: John") and optional icons.
- Four status colours (success, warning, danger, info) or custom colours from the design system.
- Removable chips with a small "×".
- Long labels shortened with "…"; several chips wrap as a row.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing and typography. |
| Chip styles (`chip.css`) | Always | Chip appearance. |
| Font Awesome icon library | Icons are used | Icon glyphs. Loaded by the application page. |

### Not included

The application owns the list of items, decides what a removal request means, removes the data, and chooses the colors that carry the right meaning.

## For designers

### Structure

```text
div.ui-chip-list                                   (only when a Chip list is rendered)
└── span.ui-chip.ui-chip-{type}[.ui-chip-bordered]
    ├── i.ui-chip-icon-before.{icon classes}       (optional, aria-hidden)
    ├── span.ui-chip-label
    │   └── b                                      (optional prefix)
    ├── i.ui-chip-icon-after.{icon classes}        (optional, aria-hidden)
    └── button.ui-chip-remove                      (removable only)
        └── span  "×"                              (aria-hidden)
```

Custom Chips receive their colors inline through the local properties `--ui-chip-custom-bg` and `--ui-chip-custom-color`; the text color is also used for the border.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Type | Custom, success, warning, danger, info | `ui-chip-custom`, `ui-chip-success`, `ui-chip-warning`, `ui-chip-danger`, `ui-chip-info` |
| Border | On | `ui-chip-bordered` |
| Removable | On | adds `button.ui-chip-remove` |

### States

No states of its own.

### Styling contract

`chip.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-chip-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface-muted`: chip
  - `--c-text`: chip (also bordered)
  - `--c-success-soft`: chip (success)
  - `--c-success-text`: chip (success)
  - `--c-warning-soft`: chip (warning)
  - `--c-warning-text`: chip (warning)
  - `--c-danger-soft`: chip (danger)
  - `--c-danger-text`: chip (danger)
  - `--c-info-soft`: chip (info)
  - `--c-info-text`: chip (info)
  - `--c-success-border`: chip (bordered + success)
  - `--c-warning-border`: chip (bordered + warning)
  - `--c-danger-border`: chip (bordered + danger)
  - `--c-info-border`: chip (bordered + info)
- Typography
  - `--font-ui`: chip
  - `--fw-ui-emphasis`: bold text
  - `--fs-label`: remove
- Borders and corners
  - `--tag-radius`: chip, remove
- States and motion
  - `--opacity-muted`: remove
- Sizes
  - `--tag-border-width`: chip
  - `--tag-font-size`: chip
  - `--tag-font-weight`: chip
  - `--tag-line-height`: chip

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--tag-gap`: list, chip
  - `--tag-padding-block`: chip
  - `--tag-padding-inline`: chip
  - `--space-sm-1`: chip
- Sizes
  - `--space-lg-1`: remove

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: remove (focus)
  - `--focus-offset`: remove (focus)

**Set by the component — don't change**

- Variables
  - `--ui-chip-custom-bg`, `--ui-chip-custom-color`: colours of a `CUSTOM` chip (from `backgroundToken`, `colorToken`)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--c-surface-muted`, `--c-text`: default colours of a `CUSTOM` chip (`backgroundToken`, `colorToken`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `chipIndex.js`.
- Check whether the configuration already provides the requested behavior before adding code.
- Never write Chip markup, classes or styles by hand; use `buildChip()`, `buildChips()` or `renderChips()`.
- Use `buildChip()` / `buildChips()` only for read-only Chips. Removable Chips need `renderChips()`, which registers the remove action.
- Chip only reports a removal request. Update the application data yourself and call `setChips()` with the new list.
- Keep application logic in the consuming code; do not modify Chip source for application-specific needs.
- Use a semantic type (`SUCCESS`, `WARNING`, `DANGER`, `INFO`) when the color carries meaning; use `CUSTOM` with design-system token names otherwise.
- Composite components pass Chip configurations to the Chip API and never reproduce Chip behavior.

### Safety

- Never pass literal colors (`#fff`, `rgb()`) as tokens; only design-system token names such as `--c-surface-muted`.
- Never pass HTML in `label` or `prefix`; they are displayed as text.
- Never remove the remove button's accessible name; provide `removeLabel` or a `texts.remove` template in the user's language.

### Example prompts

```text
Show the active filters above the table as removable Chips with the filter name as prefix. When a Chip is removed, clear that filter, reload the table and update the Chip list.
```

```text
Show the order status in the order header as a Chip: SUCCESS for "Delivered", WARNING for "Delayed", DANGER for "Cancelled".
```

## For developers

### Business analysis

> **Component**: the Chip itself. **Consumer**: the developer who configures the Chip in the application's code. **App**: the running application that uses the Chip; it provides the data, performs the actions and stores the changes.

**Content**

- Consumer provides the text, and a bold prefix (optional), e.g. "Owner: John". <!-- BA-01 -->
- Consumer provides an icon at the start, at the end, or both (optional). <!-- BA-02 -->
- Component shortens a long label with "…". <!-- BA-03 -->
- Component displays several chips as a wrapping row. <!-- BA-04 -->

**Look**

- Consumer chooses a status colour (success, warning, danger, info) or custom colours from the design system. <!-- BA-05 -->
- Consumer enables a border (optional). <!-- BA-06 -->

**Removal**

- Consumer enables removal (optional). <!-- BA-07 -->
  - Component displays a "×" after the text. <!-- BA-08 -->
- User clicks the "×". <!-- BA-09 -->
  - Component reports the removal request to the App. <!-- BA-10 -->
  - App decides whether the item is removed. <!-- BA-11 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { buildChip, buildChips, renderChips, DEFAULT_CHIP_CONFIG, CHIP_TYPES } from './chipIndex.js';

const html = buildChip(config);                          // static markup, '' after a developer error
const listHtml = buildChips(configs);                    // static markup of several Chips
const list = renderChips(container, configs, onRemove);  // managed list, null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. Invalid Chips are omitted from collections; valid ones are still rendered.

| Member of `renderChips()` result | Returns | Description |
| --- | --- | --- |
| `setChips(configs)` | — | Replaces the rendered collection. |
| `destroy()` | — | Removes the listener and clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | `''` | Non-empty, unique within the list | `removable` | Required with `removable`: identifies the Chip in `onRemove`. |
| `label` | string | `''` | Text | Always | Required. Visible text. |
| `prefix` | string | `''` | Text | Always | Bold text before the label. |
| `type` | string | `'CUSTOM'` | `CUSTOM`, `SUCCESS`, `WARNING`, `DANGER`, `INFO` | Always | Color scheme. |
| `iconBefore` | string | `''` | CSS class names | Always | Decorative icon at the start. |
| `iconAfter` | string | `''` | CSS class names | Always | Decorative icon at the end, before the remove button. |
| `bordered` | boolean | `false` | — | Always | Shows a border in the text color. |
| `backgroundToken` | string | `'--c-surface-muted'` | Design-system token name | `CUSTOM` | Background color. |
| `colorToken` | string | `'--c-text'` | Design-system token name | `CUSTOM` | Text color; also the border color. |
| `removable` | boolean | `false` | — | Always | Adds the remove action. |
| `removeLabel` | string | `''` | Text | `removable` | Accessible name of the remove action; overrides `texts.remove`. |
| `texts.remove` | string | `'Remove {label}'` | Text with `{label}` (prefix + label) | `removable` | Default accessible name template. |
| `onRemove` | function | `null` | `(id, chipElement) => {}` | `removable` | Chip-owned removal callback; see Callbacks. |

Token options for non-`CUSTOM` types and remove options for non-removable Chips are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `config.onRemove` | `(id, chipElement)` | The user activates the remove action of a Chip rendered by `renderChips()`. | The Chip was built with `buildChip()`/`buildChips()`. |
| `renderChips(..., onRemove)` | `(id, chipElement)` | Same as above, only when the Chip has no own `onRemove`. | The Chip has its own `onRemove`. |

Exactly one callback runs per request. Chip never removes itself; the consumer updates its data and calls `setChips()`.

### Errors

Chip has no user-facing errors. Developer errors omit the invalid Chip (or the whole list for `CONTAINER_REQUIRED` / `CONFIGS_NOT_ARRAY`); warnings are logged and rendering continues. Console format: `Chip "id or label" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed to `renderChips()`. |
| `CONFIGS_NOT_ARRAY` | error | The Chip collection is not an array. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `ID_REQUIRED_WHEN_REMOVABLE` | error | Removable Chip without `id`. |
| `INVALID_BACKGROUND_TOKEN` | error | `backgroundToken` is not a token name (`CUSTOM`). |
| `INVALID_COLOR_TOKEN` | error | `colorToken` is not a token name (`CUSTOM`). |
| `DUPLICATE_ID` | error | Another Chip in the collection has the same id. |
| `INVALID_OPTION` | warning | Invalid `type`; `CUSTOM` is used. |
| `INVALID_ICON_CLASS` | warning | Invalid class names removed from `iconBefore` or `iconAfter`. |
| `OPTION_IGNORED` | warning | Token or remove options that do not apply; the removed `icon` option (use `iconBefore` or `iconAfter`). |

### Accessibility

- The remove action is a native `<button>` with an accessible name (`removeLabel` or `texts.remove`); the "×" glyph and both icons are `aria-hidden` (their meaning must be in the label).
- Status colors are paired with text; do not rely on color alone to convey meaning.
- The consumer provides the surrounding context (e.g. a heading "Active filters").

### Examples

Removable filter Chips kept in sync with application data:

```js
let filters = [ { key:'status', name:'Status', value:'Open' }, { key:'owner', name:'Owner', value:'John' } ];

const toChips = () => filters.map(filter => ({ id:filter.key, prefix:`${filter.name}:`, label:filter.value, removable:true, bordered:true }));

const chips = renderChips(filterBar,toChips(),( id ) =>
{
    filters = filters.filter(filter => filter.key !== id);
    reloadTable(filters);
    chips.setChips(toChips());
});
```

### Files

| File | Responsibility |
| --- | --- |
| `chipIndex.js` | Public entry point; the only import surface. |
| `chipConfig.js` | Defaults, allowed values, normalization, developer validation, remove label. |
| `chipComponent.js` | Static builders, managed list lifecycle and runtime API. |
| `chipHTML.js` | Markup generation. |
| `chipEvents.js` | Delegated remove-action listener. |
| `chipErrors.js` | Developer error and warning catalog. |
| `chip.css` | Presentation. |
| `chipTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/chip.test.mjs`). |
