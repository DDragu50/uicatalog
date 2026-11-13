# Button

## For business

### Overview

Button lets a user start an action, such as saving, submitting a form or opening a dialog. It is shown either with a text label (optionally with icons) or as a compact icon-only button. With an address (`href`) it becomes a link that can look like a button or like a text link, and keeps every browser link feature, such as "Open in a new tab".

### When to use

- Use it for actions the user starts: save, submit, open a dialog.
- Use ActionMenu when there are more actions than room on the screen.
- Give it an address (`href`) for moving to another page, e.g. a "README.md" link that looks like a button; a plain link inside text needs no component.
- Use CheckboxRadio (segmented look) or Toggle for choosing a state.

### Key features

- Three levels of emphasis show which action matters most: primary, secondary, tertiary; a fourth look, link, shows it as a text link.
- A link (`href`) that opens the page in the same tab or in a new tab, with "Open in a new tab" and "Copy link" always available.
- A text button with optional icons, or a compact icon-only button.
- Three sizes, three width behaviours and four corner styles.
- Unavailable state that the application switches on and off, e.g. while saving.
- A description for screen readers when the text alone is ambiguous, e.g. "Edit, Order 1042".

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, sizes, spacing and focus style. |
| Button styles (`button.css`) | Always | Button appearance. |
| Font Awesome icon library | Icons are used | Icon glyphs. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | The tooltip with the icon button's name (the Tooltip module is loaded only then). |

### Not included

The application decides what the action does, which emphasis level fits the screen, the wording of labels, and when a button is enabled or disabled.

## For designers

### Structure

```text
button#{id}.ui-button.ui-button-{variant}.ui-button-{hierarchy}.ui-button-size-{size}.{radius class}[.ui-button-width-{width}]
├── span.ui-button-icon.ui-button-icon-before.ui-button-icon-size-{iconSize}   (optional, text button)
│   └── i.{icon classes}
├── span.ui-button-label                                                      (text button)
├── span.ui-button-icon.ui-button-icon-after.ui-button-icon-size-{iconSize}    (optional, text button)
│   └── i.{icon classes}
├── span.ui-button-visually-hidden  " (opens in a new tab)"                    (link that opens in a new tab, text button)
└── span.ui-button-icon.ui-button-icon-only.ui-button-icon-size-{size}         (icon button only)
    └── i.{icon classes}
a#{id}.ui-button.….ui-button-as-link[href][target][rel][download]             (instead of button when href is set; same content)
span#{id}-description  hidden                                               (optional description, referenced by aria-describedby)
span.ui-tooltip-host → Tooltip                                              (tooltipMode TOOLTIP, icon button; [title] on the button with TITLE)
```

Icons are decorative (`aria-hidden="true"`). The minimum width is passed inline as the local property `--ui-button-min-width`. Disabled buttons use the native `disabled` attribute; a disabled link has no `href`, `role="link"` and `aria-disabled="true"`. A link that opens in a new tab gets the icon `ui-button-icon-new-tab` after its label, unless `iconAfter` is set.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Variant | Text button, icon button | `ui-button-button`, `ui-button-icon-button` |
| Hierarchy | Primary, secondary, tertiary, link | `ui-button-primary`, `ui-button-secondary`, `ui-button-tertiary`, `ui-button-link` |
| Element | Button, link (`href`) | `button`, `a.ui-button-as-link` |
| Size | Small, medium, large | `ui-button-size-small`, `ui-button-size-medium`, `ui-button-size-large` |
| Icon size (text button) | Small, medium, large | `ui-button-icon-size-small`, `ui-button-icon-size-medium`, `ui-button-icon-size-large` |
| Width (text button) | Fit content, minimum width, full | `ui-button-width-fit-content`, `ui-button-width-min-width`, `ui-button-width-full` |
| Corner radius (text button) | None, small, medium, large | `ui-button-radius-none`, `ui-button-radius-small`, `ui-button-radius-medium`, `ui-button-radius-large` |
| Corner radius (icon button) | Circle, none, small, medium, large | `ui-button-icon-radius-circle`, `ui-button-icon-radius-none`, `ui-button-icon-radius-small`, `ui-button-icon-radius-medium`, `ui-button-icon-radius-large` |

An icon button's icon size always follows the button size. The link look takes the type and size of the text around it, so size and icon size have no effect on it.

### States

No states of its own.

### Styling contract

`button.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-button-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-accent`: button (primary, secondary, secondary + hover, secondary + pressed)
  - `--c-grey-95`: button (primary)
  - `--c-on-accent`: button (primary, primary + hover, primary + pressed)
  - `--c-accent-hover`: button (primary + hover, primary + pressed)
  - `--c-surface`: button (secondary)
  - `--c-surface-hover`: button (secondary + hover, secondary + pressed, tertiary + hover, tertiary + pressed)
  - `--c-text`: button (secondary + hover, secondary + pressed, tertiary, tertiary + hover, tertiary + pressed)
  - `--c-link`: button (link)
  - `--c-link-visited`: button (link + as link)
  - `--c-link-hover`: button (link + hover)
  - `--c-link-active`: button (link + pressed)
  - `--c-link-disabled`: button (link + disabled)
- Typography
  - `--font-ui`: button
  - `--lh-compact`: button, icon
  - `--fs-caption`: button (size small)
  - `--fs-label`: button (size medium)
  - `--fs-control`: button (size large)
  - `--fw-ui-strong`: button (primary, secondary, tertiary)
- Borders and corners
  - `--border-thin`: button (primary, secondary, tertiary)
  - `--radius-control-small`: button (radius small, icon radius small)
  - `--radius-control`: button (radius medium, icon radius medium)
  - `--radius-control-large`: button (radius large, icon radius large)
- States and motion
  - `--transition-1`: button
  - `--opacity-disabled`: button (primary + disabled, secondary + disabled, tertiary + disabled)
- Sizes
  - `--link-decoration`: label (link)
  - `--link-underline-thickness`: label (link)
  - `--link-underline-offset`: label (link)
  - `--link-decoration-hover`: label (link + hover, link + pressed)
  - `--link-underline-thickness-hover`: label (link + hover, link + pressed)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: button (also size small, size large), icon (button + size small, button + size large)
  - `--gap-toolbar`: button (size small)
  - `--padding-card`: button (size medium)
  - `--padding-panel`: button (size large)
- Sizes
  - `--control-height`: button (size small, size medium, size large), icon (button + size small, button + size medium, button + size large)
  - `--icon-size-small`: icon (size small, icon button + size small)
  - `--icon-size-medium`: icon (size medium, icon button + size medium)
  - `--icon-size-large`: icon (size large, icon button + size large)
  - `--percentage-full`: button (width fit content, width min width, width full)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: button (focus)
  - `--focus-offset`: button (focus)
- Sizes
  - `--link-focus-outline`: button (link + focus)
  - `--link-focus-offset`: button (link + focus)

**Set by the component — don't change**

- Variables
  - `--ui-button-min-width`: minimum width (from `minWidth`, width `MIN_WIDTH`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `buttonIndex.js`.
- Check whether the configuration already provides the requested behavior before adding code.
- Render every button through `renderButton()`; never write button markup, classes or styles by hand.
- When several buttons share the same text (e.g. "Edit" in every table row), give each a `description` naming its item; never change the visible text only for screen readers.
- Keep application logic in the click callback or the consuming code, never in Button files.
- Do not modify Button source for application-specific needs; propose a framework change only for a reusable missing capability.
- Use `buttonVariant:'ICON_BUTTON'` with a meaningful `ariaLabel` for icon-only actions.
- Use `buttonType:'SUBMIT'` or `'RESET'` only for real form actions; the default `BUTTON` never submits.
- For moving to another page use `href` (a real link), never `onClick` with `window.location`: only a link offers "Open in a new tab". Choose `target:'NEW_TAB'` only when the user must keep the current page.
- For many repeated buttons (table rows), prefer one centralized `onClick` passed to `renderButton()` over per-button callbacks.
- Give each button a unique `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove or replace `ariaLabel` on icon buttons.
- Never simulate disabled state with CSS or by ignoring clicks; use `disabled` or `setDisabled()`.
- Never pass HTML in `label`; it is displayed as text.
- Never pass `javascript:`, `data:` or `vbscript:` addresses in `href`; they are refused (`UNSAFE_HREF`).

### Example prompts

```text
Add a primary "Save" Button and a tertiary "Cancel" Button to the form footer. Disable Save while the save request is running and re-enable it when the request finishes.
```

```text
Turn the "Guide" Button into a link to /guide that opens in a new tab, with the look of a text link.
```

```text
Add a small tertiary icon Button with a trash icon to every table row. Handle all delete clicks in one callback that reads the row from the button id.
```

## For developers

### Business analysis

> **Component**: the Button itself. **Consumer**: the developer who configures the Button in the application's code. **App**: the running application that uses the Button; it provides the data, performs the actions and stores the changes.

**Action**

- User clicks the button. <!-- BA-01 -->
  - Component reports the click to the App. <!-- BA-02 -->
  - App performs the action. <!-- BA-03 -->
- Component submits or resets the form it belongs to, when the Consumer chooses that type. <!-- BA-04 -->

- User clicks a link. <!-- BA-05 -->
  - Component reports the click to the App. <!-- BA-06 -->
  - Component opens the page at the address in the same tab or in a new tab, as the Consumer chooses. <!-- BA-07 -->
  - App decides to stay on the page and performs the action itself, e.g. its own page change (optional). <!-- BA-08 -->
- User presses Ctrl or Cmd while clicking a link, or selects "Open in a new tab" in the browser's menu. <!-- BA-09 -->
  - Component keeps the browser's behaviour and sends nothing to the App. <!-- BA-10 -->

**Look**

- Consumer chooses the emphasis: primary, secondary, tertiary or link. <!-- BA-11 -->
  - Component adapts the link look to the size of the text around it. <!-- BA-12 -->
- Consumer chooses a text button or an icon-only button. <!-- BA-13 -->
  - Component displays an icon before or after the text (optional). <!-- BA-14 -->
  - Component displays an icon-only button as a circle by default. <!-- BA-15 -->
- Consumer chooses one of three sizes, one of three width behaviours and one of four corner styles. <!-- BA-16 -->
- Consumer provides an address, so the button is a link (optional). <!-- BA-17 -->
  - Component displays an icon after the text of a link that opens in a new tab (optional). <!-- BA-18 -->
  - Component announces that the link opens in a new tab. <!-- BA-19 -->

**Availability**

- App disables and enables the button, e.g. while a save is in progress. <!-- BA-20 -->
  - Component keeps a disabled button visible and prevents clicking it. <!-- BA-21 -->
  - Component removes the address of a disabled link and keeps it visible. <!-- BA-22 -->

**Screen readers**

- Consumer provides a description that follows the name, e.g. "Edit, Order 1042" (optional). <!-- BA-23 -->
- App changes the description at any time. <!-- BA-24 -->

**Tooltips**

- Consumer chooses how an icon button shows its name on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-25 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderButton, DEFAULT_BUTTON_CONFIG, BUTTON_VARIANTS, BUTTON_TYPES, BUTTON_HIERARCHIES, BUTTON_SIZES, BUTTON_WIDTHS, BUTTON_RADII, BUTTON_ICON_RADII, BUTTON_TOOLTIP_MODES, BUTTON_TARGETS } from './buttonIndex.js';

const instance = renderButton(container, config, onClick); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getElement()` | HTMLButtonElement \| HTMLAnchorElement | The native button, or the `<a>` of a link, for integrations that need it (e.g. form APIs). |
| `isDisabled()` | boolean | Current disabled state. |
| `setDisabled(disabled)` | — | Enables or disables the button; a link loses or gets back its address. |
| `setDescription(description)` | — | Sets, changes or removes (`''`) the description read by screen readers after the name. |
| `destroy()` | — | Removes the listener and clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively (`'icon-button'` = `'ICON_BUTTON'`). An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Native `id` of the button. |
| `buttonVariant` | string | `'BUTTON'` | `BUTTON`, `ICON_BUTTON` | Always | Text button or icon-only button. |
| `buttonType` | string | `'BUTTON'` | `BUTTON`, `SUBMIT`, `RESET` | not `href` | Native `type`. A link ignores it (`OPTION_IGNORED`). |
| `hierarchy` | string | `'PRIMARY'` | `PRIMARY`, `SECONDARY`, `TERTIARY`, `LINK` | Always | Emphasis level. `LINK`: the look of a text link (link tokens), in the type and size of the text around it; works with and without `href`. |
| `size` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE` | Always | Control height, padding and font size. No effect with `LINK` (`OPTION_IGNORED` when supplied). |
| `href` | string | `''` | URL or path | Always | Optional. Makes the button a link (`<a>`): the browser's "Open in a new tab", "Copy link" and Ctrl / Cmd + click work. `javascript:`, `data:` and `vbscript:` addresses are refused (`UNSAFE_HREF`; the link has no address). |
| `target` | string | `'SAME'` | `SAME`, `NEW_TAB` | `href` | Where the page opens on a plain click: the same tab, or a new tab (`target="_blank"`, `rel="noopener"`, hidden text `newTabText`). |
| `newTabIcon` | boolean | `true` | — | `href` + `NEW_TAB` | Shows the new-tab icon after the label of a text link. An `iconAfter` replaces it. |
| `newTabText` | string | `'(opens in a new tab)'` | Text | `href` + `NEW_TAB` | Hidden text read by screen readers after the name (added to `ariaLabel` for an icon link). |
| `download` | string \| boolean | `''` | File name, or `true` | `href` | Optional. The browser saves the file instead of opening it (`true`: with its own name). |
| `rel` | string | `''` | Link types, e.g. `'nofollow'` | `href` | Optional. Extra `rel` values; `NEW_TAB` always adds `noopener`. |
| `disabled` | boolean | `false` | — | Always | Initial native disabled state. |
| `onClick` | function | `null` | `(event, instance) => {}` | Always | Button-owned click callback; see Callbacks. |
| `label` | string | `''` | Text | `BUTTON` | Required for text buttons. |
| `iconBefore` | string | `''` | CSS class names | `BUTTON` | Icon before the label. |
| `iconAfter` | string | `''` | CSS class names | `BUTTON` | Icon after the label. |
| `iconSize` | string | value of `size` | `SMALL`, `MEDIUM`, `LARGE` | `BUTTON` | Size of the label icons. With `LINK` the icons take the text size. |
| `width` | string | `'FIT_CONTENT'` | `FIT_CONTENT`, `MIN_WIDTH`, `FULL` | `BUTTON` | Width behavior. |
| `minWidth` | number | `160` | Positive number (px) | `BUTTON` + `MIN_WIDTH` | Minimum width. |
| `radius` | string | `'NONE'` | `NONE`, `SMALL`, `MEDIUM`, `LARGE` | `BUTTON` | Corner radius. Square by default, so buttons read as actions next to rounded chips and tags. |
| `icon` | string | `''` | CSS class names | `ICON_BUTTON` | Required. The only visible content. |
| `ariaLabel` | string | `''` | Text | `ICON_BUTTON` | Required. Accessible name of the icon button. |
| `description` | string | `''` | Text | Always | Optional, per instance. Extra information read by screen readers after the button's name (e.g. "Order 1042" for one of several "Edit" buttons); not visible. |
| `iconButtonRadius` | string | `'CIRCLE'` | `CIRCLE`, `NONE`, `SMALL`, `MEDIUM`, `LARGE` (`'50%'` accepted as `CIRCLE`) | `ICON_BUTTON` | Corner radius of the icon button. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | `ICON_BUTTON` | How the icon button shows its name (`ariaLabel`) on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (purpose `LABEL`; also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). A text button ignores it (`OPTION_IGNORED` for `TITLE` or `TOOLTIP`). |

Options supplied for the other variant are ignored with an `OPTION_IGNORED` warning. Icon class names are limited to letters, digits, `_` and `-`; other tokens are removed with an `INVALID_ICON_CLASS` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `config.onClick` | `(event, instance)` | The enabled button is activated (click, tap, Enter, Space); a link on a plain click, tap or Enter, before the page opens. | The button is disabled. A link: Ctrl / Cmd / Shift / Alt + click, middle-click, the browser's menu, Space. |
| `renderButton(..., onClick)` | `(event, instance)` | Same as above, only when `config.onClick` is absent. | `config.onClick` is present, or the button is disabled. |

Exactly one callback runs per activation. Neither callback changes native `SUBMIT` or `RESET` behavior. For a link, the callback may call `event.preventDefault()` to stay on the page (e.g. an app router); otherwise the page opens as `target` says.

### Errors

Button has no user-facing errors. Developer errors prevent rendering (`renderButton()` returns `null`); warnings are logged and rendering continues. Console format: `Button "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed to `renderButton()`. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | Text button without `label`. |
| `ICON_REQUIRED` | error | Icon button without `icon`. |
| `ARIA_LABEL_REQUIRED` | error | Icon button without `ariaLabel`. |
| `INVALID_OPTION` | warning | Invalid enumerated value or `minWidth`; the default is used. |
| `INVALID_ICON_CLASS` | warning | Invalid class names removed from an icon option. |
| `OPTION_IGNORED` | warning | Option supplied for the other variant, a link option without `href`, `buttonType` with `href`, or `size` / `iconSize` with `LINK`. |
| `UNSAFE_HREF` | warning | `href` with a `javascript:`, `data:` or `vbscript:` address; the link has no address. |

### Accessibility

- Native `<button>`: keyboard activation, focus and form semantics come from the browser.
- Icon buttons require `ariaLabel`; icons are always `aria-hidden`.
- The visible text (or `ariaLabel`) stays the accessible name; `description` adds extra context through `aria-describedby`, read after the name, so the spoken name always matches what is seen (WCAG "label in name").
- Disabled uses native `disabled`, so the button is removed from the tab order and announced as unavailable.
- A link is a native `<a href>`: Enter opens it (Space does not, as for every link) and the browser's link commands stay available. A disabled link has no `href`, so it leaves the tab order; `role="link"` and `aria-disabled="true"` announce it as an unavailable link.
- A link that opens in a new tab says so: hidden text after the name (`newTabText`) and, for a text link, the new-tab icon.
- Focus is shown with `--focus-outline`.

### Examples

Disable a button while an asynchronous action runs:

```js
renderButton(footer,
{
    id:'save-profile',
    label:'Save',
    iconBefore:'fa-solid fa-floppy-disk',
    onClick:async ( event, instance ) =>
    {
        instance.setDisabled(true);
        try { await saveProfile(); }
        finally { instance.setDisabled(false); }
    }
});
```

A link that looks like a button, and one in the look of a text link that opens in a new tab:

```js
renderButton(readmeHost, { id:'readme-open', label:'buttonREADME.md', hierarchy:'SECONDARY', size:'SMALL', href:'#/component/button/readme' });
renderButton(guideHost, { id:'guide-open', label:'Style guide', hierarchy:'LINK', href:'https://example.com/guide', target:'NEW_TAB' });
```

One centralized handler for buttons repeated in table rows:

```js
const buttons = rows.map(row => renderButton(rowActionsHost(row),
    { id:`delete-${row.id}`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon:'fa-solid fa-trash', ariaLabel:`Delete ${row.name}` },
    ( event, instance ) => deleteRow(instance.id.replace('delete-',''))));

// When the table is rebuilt:
buttons.forEach(button => button?.destroy());
```

### Files

| File | Responsibility |
| --- | --- |
| `buttonIndex.js` | Public entry point; the only import surface. |
| `buttonConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `buttonComponent.js` | Lifecycle and runtime API. |
| `buttonHTML.js` | Markup generation. |
| `buttonEvents.js` | Click listener registration (links: plain clicks only). |
| `buttonErrors.js` | Developer error and warning catalog. |
| `button.css` | Presentation. |
| `buttonTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/button.test.mjs`). |
