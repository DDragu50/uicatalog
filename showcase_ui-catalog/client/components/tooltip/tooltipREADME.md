# Tooltip

## For business

### Overview

Tooltip shows a short text next to an element when the user points at it or reaches it with the keyboard: the name of an icon-only button ("Delete"), the full text of a cut-off name, or a short explanation ("Fill in the required fields first"). Typical uses are toolbars of icon buttons, navigation rails, table cells and unavailable actions.

### When to use

- Use it for a short, plain text that names or explains an element; the user only reads it.
- Use the element's visible text when there is room, and a field's help text for anything the user needs to fill in a field.
- Use Message for information the user must not miss, and a dialog (Message `MODAL`) for content with buttons or links: a tooltip holds no controls.

### Key features

- Appears after a short pause under the pointer, at once on keyboard focus, and at once when the user moves on to the next tooltip; one at a time.
- Stays while the pointer is on it, hides with Escape (focus stays), when the pointer or focus leaves, or when the element is pressed.
- Above, below, before or after the element, with an arrow; it moves to the other side when there is no room and stays inside the window, never cut off by panels or tables.
- One tooltip for a single element, or for every element of a group (e.g. all cut-off names of a list), optionally only when the text is cut off.
- A keyboard shortcut shown after the text ("Save Ctrl+S"); dark (default) or light look.
- Optional long press on touch screens.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, type, spacing and corners. |
| Tooltip styles (`tooltip.css`) | Always | The bubble, arrow and shortcut; also the hosts other components create (`.ui-tooltip-host`). |

### Not included

The application provides the texts. Buttons, links or other content inside the bubble (a popover), tooltips that follow the pointer and tooltips on chart points are not part of this version.

## For designers

### Structure

```text
div#{id}.ui-tooltip.ui-tooltip-tone-{inverse|surface}[.ui-tooltip-with-arrow][.ui-tooltip-open]  role="tooltip" (aria-hidden="true" with targets)  popover="manual"  data-side="{TOP|BOTTOM|LEFT|RIGHT}"
├── span.ui-tooltip-text
├── kbd.ui-tooltip-shortcut [hidden]          (shortcut)
└── span.ui-tooltip-arrow                     (arrow)
On the target (one element): aria-describedby="{id}" (DESCRIPTION) or aria-labelledby="{id}" (LABEL)
Other components: span.ui-tooltip-host → the Tooltip's container (tooltipMode TOOLTIP; takes no place)
```

The bubble is drawn above every other layer (the browser's top layer), positioned in the window next to its target. `INVERSE` uses the text colour as background and the surface colour as text (dark on light pages, light in the dark theme); `SURFACE` is a light panel with a thin border and a small shadow. The shortcut is set in the code font, in a thin frame. The arrow is a small turned square on the side facing the target.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Tone | Inverse, surface | `ui-tooltip-tone-inverse`, `-surface` |
| Arrow | On, off | `ui-tooltip-with-arrow`, — |
| Placement | Top, bottom, start, end | `data-side` (the physical side used: `TOP`, `BOTTOM`, `LEFT`, `RIGHT`) |
| Shortcut | Off, on | `.ui-tooltip-shortcut[hidden]`, `.ui-tooltip-shortcut` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Tooltip | Shown | `ui-tooltip-open`, `:popover-open` |
| Side | Moved to the other side for lack of room | `data-side` differs from the placement |

### Styling contract

`tooltip.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-tooltip-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: tooltip (tone inverse, tone surface), arrow (tone inverse, tone surface)
  - `--c-surface`: tooltip (tone inverse, tone surface), arrow (tone inverse, tone surface)
  - `--c-border`: tooltip (tone surface), arrow (tone surface + side top, tone surface + side bottom, tone surface + side left, tone surface + side right)
- Typography
  - `--font-ui`: tooltip
  - `--fw-ui`: tooltip
  - `--fs-caption`: tooltip, shortcut
  - `--lh-compact`: tooltip
  - `--font-code`: shortcut
- Borders and corners
  - `--radius-xs`: tooltip, shortcut
  - `--border-thin`: tooltip (tone surface), arrow (tone surface + side top, tone surface + side bottom, tone surface + side left, tone surface + side right), shortcut
- Shadows
  - `--shadow-sm`: tooltip (tone surface)
- States and motion
  - `--transition-1`: tooltip
  - `--opacity-muted`: shortcut

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: tooltip
  - `--space-sm-2`: tooltip, shortcut
- Sizes
  - `--size-md-2`: tooltip
  - `--space-md-1`: tooltip, arrow

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- No tokens.

**Set by the component — don't change**

- Variables
  - `--ui-tooltip-left`, `--ui-tooltip-top`: position of the tooltip in the window (measured from the target)
  - `--ui-tooltip-arrow`: distance of the arrow from the tooltip's left or top edge, so it points at the target (measured)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--space-md-1`: read: gap between the target and the tooltip, and margin from the window edges
  - `--space-md-3`: read: smallest distance of the arrow from a corner

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `tooltipIndex.js`.
- Check the configuration before adding code; configure instead of building hover bubbles, delays, positioning or Escape handling.
- Give the tooltip its own container next to the target, never inside a button or link (`CONTAINER_IN_TARGET`); for many elements use one Tooltip with `targets` and `data-tooltip` or `targets.text`.
- Use `purpose:'LABEL'` only when the tooltip is the element's only name (icon-only controls); otherwise keep `DESCRIPTION`.
- Keep the text short and plain; never put information the user must act on only in a tooltip (touch users may never see it).
- For an unavailable control that explains why, use `aria-disabled="true"` instead of `disabled` (a `disabled` element receives no pointer or focus events).
- In other components, prefer their `tooltipMode` option to adding Tooltips yourself.
- Use unique ids, and call `destroy()` before rendering into the same container again.

### Safety

- Texts are inserted as text.
- Don't remove `role="tooltip"` or the `aria-describedby` / `aria-labelledby` link the component sets.
- Don't hide essential instructions or errors in a tooltip.

### Example prompts

```text
Give every icon button in the report toolbar a tooltip with its name and keyboard shortcut.
```

```text
Show the full customer name in a tooltip when it is cut off in the narrow list on the dashboard.
```

## For developers

### Business analysis

> **Component**: the Tooltip itself. **Consumer**: the developer who configures the Tooltip in the application's code. **App**: the running application that uses the Tooltip; it provides the data, performs the actions and stores the changes.

**Showing and hiding**

- User hovers over the element. <!-- BA-01 -->
  - Component displays the tooltip after a short pause. <!-- BA-02 -->
  - Component displays it at once when another tooltip was just displayed. <!-- BA-03 -->
- User presses Tab to reach the element. <!-- BA-04 -->
  - Component displays the tooltip at once. <!-- BA-05 -->
- User hovers over the tooltip. <!-- BA-06 -->
  - Component keeps the tooltip. <!-- BA-07 -->
- User presses Escape. <!-- BA-08 -->
  - Component hides the tooltip and keeps the focus where it is. <!-- BA-09 -->
- User leaves the element and the tooltip, or moves the focus away. <!-- BA-10 -->
  - Component hides the tooltip after a short pause. <!-- BA-11 -->
- User clicks the element. <!-- BA-12 -->
  - Component hides the tooltip. <!-- BA-13 -->
- Component displays one tooltip at a time. <!-- BA-14 -->
- Consumer enables long press on touch screens (optional). <!-- BA-15 -->
  - User presses the element for half a second. <!-- BA-16 -->
    - Component displays the tooltip for a moment and prevents the click that ends the press. <!-- BA-17 -->

**Content and position**

- App provides the text of the tooltip. <!-- BA-18 -->
- Consumer provides a keyboard shortcut shown after the text (optional). <!-- BA-19 -->
- Consumer chooses the side: above, below, before or after the element. <!-- BA-20 -->
  - Component moves the tooltip to the opposite side when there is no room. <!-- BA-21 -->
  - Component keeps the tooltip inside the window. <!-- BA-22 -->
- Consumer chooses a dark or a light look, with or without an arrow. <!-- BA-23 -->
- Consumer chooses one tooltip for a group of elements, each with its own text (optional). <!-- BA-24 -->
- Consumer chooses to display the tooltip only when the element's text is cut off (optional). <!-- BA-25 -->
- App changes the text. <!-- BA-26 -->
- App disables the tooltip. <!-- BA-27 -->

**Screen readers**

- Component exposes the tooltip as the element's description, or as its name for elements that have no other name. <!-- BA-28 -->
- Component hides a group's tooltip from screen readers, because the elements already carry their text. <!-- BA-29 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTooltip, DEFAULT_TOOLTIP_CONFIG, TOOLTIP_PURPOSES, TOOLTIP_PLACEMENTS, TOOLTIP_TONES } from './tooltipIndex.js';

const tooltip = renderTooltip(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element next to the target (not inside it when the target is a button or link). Rendering replaces its content; `destroy()` clears it and removes the link from the target.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `setText(text)` | — | Changes the text (`target`); an empty text hides the tooltip. With `targets`: `OPTION_IGNORED`. |
| `show(element?)` | boolean | Shows the tooltip now (next to `target`, or next to `element` with `targets`); `false` without text, when disabled, or when `onlyWhenTruncated` and nothing is cut off. |
| `hide()` | — | Hides the tooltip now. |
| `setDisabled(disabled)` | — | Turns the tooltip off (it hides and no longer shows) or on. |
| `getState()` | object | `{ visible, text, disabled }`. |
| `destroy()` | — | Removes the listeners and the link from the target, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the bubble (also the value of the target's `aria-describedby` / `aria-labelledby`). |
| `target` | Element | `null` | An element | Always | The element the tooltip belongs to. Required unless `targets` is given (`TARGET_REQUIRED`). |
| `targets` | object | `null` | `{ within, selector, text? }` | not `target` | One tooltip for every element matching `selector` inside `within` (also added later). The text is `text(element)`, else the element's `data-tooltip`, else its own text. The tooltip is visual only: the elements must carry their text for screen readers. |
| `text` | string | `''` | Text | `target` | The text; without it the tooltip does not show (`TEXT_REQUIRED`) until `setText()`. |
| `shortcut` | string | `''` | Text, e.g. `'Ctrl+S'` | Always | A keyboard shortcut shown after the text. |
| `purpose` | string | `'DESCRIPTION'` | `DESCRIPTION`, `LABEL` | `target` | `DESCRIPTION`: the target's description (`aria-describedby`). `LABEL`: its name (`aria-labelledby`), for elements without another name. |
| `placement` | string | `'TOP'` | `TOP`, `BOTTOM`, `START`, `END` | Always | Preferred side; `START` / `END` follow the text direction. The opposite side is used when there is no room. |
| `arrow` | boolean | `true` | — | Always | An arrow pointing at the target. |
| `tone` | string | `'INVERSE'` | `INVERSE`, `SURFACE` | Always | Dark bubble (the text colour as background) or a light panel with a border. |
| `onlyWhenTruncated` | boolean | `false` | — | Always | Shows only when the element's text (or the text of an element inside it) is cut off. |
| `longPress` | boolean | `false` | — | Always | On touch screens a press of half a second shows the tooltip for 1.5 s; the click that ends the press is not sent and no context menu opens. |
| `showDelayMs` | number | `500` | 0 or more | Always | Pause before showing under the pointer (keyboard focus and the next tooltip right after another: at once). |
| `hideDelayMs` | number | `100` | 0 or more | Always | Pause before hiding after the pointer leaves (time to move onto the tooltip). |
| `disabled` | boolean | `false` | — | Always | Starts turned off (`setDisabled()` turns it on). |

The tooltip shows on keyboard focus only when the browser shows a focus ring (`:focus-visible`), not after a mouse click. Elements with `disabled` receive no events, so use `aria-disabled="true"` on an unavailable control that needs an explanation. Options that do not apply are ignored with `OPTION_IGNORED`.

### Errors

Tooltip has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Tooltip "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `TARGET_REQUIRED` | error | Neither `target` (an element) nor valid `targets` (`within` an element, a `selector`). |
| `CONTAINER_IN_TARGET` | error | The container is inside the target. |
| `INVALID_OPTION` | warning | Invalid enumerated value or delay; the default is used. |
| `OPTION_IGNORED` | warning | An option that does not apply (`targets` with `target`, `purpose` or `text` with `targets`, `setText()` with `targets`). |
| `TEXT_REQUIRED` | warning | `target` without `text`; nothing shows until `setText()`. |

### Accessibility

- One target: `role="tooltip"`, linked from the target with `aria-describedby` (`DESCRIPTION`) or `aria-labelledby` (`LABEL`) for the whole life of the component, so screen readers read it whether it is shown or not.
- `targets`: the bubble is `aria-hidden` (the elements already carry their text, e.g. a cut-off name).
- Follows WCAG 1.4.13: the pointer can move onto the tooltip, Escape hides it without moving focus (and stops the Escape from reaching other components, e.g. a dialog), and it stays until the pointer or focus leaves.
- The tooltip never takes focus and holds no controls.
- With reduced motion it appears without fading.

### Examples

An icon button named by its tooltip, with a shortcut:

```js
renderButton(saveHost,{ id:'save', buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-floppy-disk', ariaLabel:'Save' });
renderTooltip(saveTipHost,{ id:'save-tip', target:document.getElementById('save'), text:'Save', shortcut:'Ctrl+S', purpose:'LABEL' });
```

(Button can do this itself: `tooltipMode:'TOOLTIP'`.)

Full names in a narrow list, only when cut off:

```js
renderTooltip(listTipHost,{ id:'names-tip', targets:{ within:list, selector:'.name' }, onlyWhenTruncated:true });
```

Why an action is unavailable, also on touch screens:

```js
publish.setAttribute('aria-disabled','true');
renderTooltip(publishTipHost,{ id:'publish-tip', target:publish, text:'Fill in the required fields first', longPress:true });
```

### Files

| File | Responsibility |
| --- | --- |
| `tooltipIndex.js` | Public entry point; the only import surface. |
| `tooltipConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `tooltipComponent.js` | Lifecycle, showing and hiding (delays, one at a time, Escape, long press), the text, the link from the target, positioning, runtime API. |
| `tooltipPosition.js` | Side, opposite side, shift inside the window and arrow offset (pure). |
| `tooltipEvents.js` | Pointer, focus, touch, Escape, scroll and resize listeners; the document events that keep one tooltip at a time. |
| `tooltipHTML.js` | Bubble markup. |
| `tooltipErrors.js` | Developer error and warning catalog. |
| `tooltip.css` | Presentation of the bubble, arrow and shortcut; the hosts of other components. |
| `tooltipTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/tooltip.test.mjs`). |
