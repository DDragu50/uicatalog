# Message

## For business

### Overview

Message tells users something about the system or their work: that something succeeded, needs attention, failed, or is simply useful to know. The same message can appear in five ways — a line of text, a box, a strip across the page, a small pop-up in a corner, or a window in the middle of the screen that asks for a decision.

### When to use

- Use it to tell the user that something succeeded, needs attention, failed, or is useful to know.
- Use the modal layout only when the user must read or decide, e.g. "Delete 12 orders?".
- Use a field's own error for input mistakes, Notification for a count on an icon, and Loader for an action that is still running.

### Key features

- Five types with their own colour and icon: information, success, warning, danger and custom.
- Five layouts: inline line, box, page-wide banner, toast in a screen corner, and modal window.
- Optional title, link, list of details and action buttons.
- Permanent, closable or temporary messages, with an optional countdown.
- New messages announced to screen readers: urgent ones at once, others politely.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours of the types, spacing and typography. |
| Message styles (`message.css`) | Always | Layouts. |
| Button component and `button.css` | Close button or actions | Buttons. |
| Font Awesome icon library | Always | Type icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application decides what to say and when, performs the actions (Undo, Retry, Delete), and provides the area where toasts appear (once per page). Remembering closed announcements is done by the application with `onClose`.

## For designers

### Structure

```text
div#{id}.ui-message.ui-message-{inline|block|banner|toast|modal}.ui-message-type-{info|success|warning|danger|custom}  [role="status|alert"]
├── span.ui-message-icon > i                         (type icon; aria-hidden)
├── div.ui-message-body
│   ├── p.ui-message-title                           (optional)
│   ├── p.ui-message-text (+ a.ui-message-link)
│   ├── ul.ui-message-details > li [> a.ui-message-detail-link]   (optional; not in INLINE)
│   ├── div.ui-message-actions > span.ui-message-action → Button   (optional; not in INLINE)
│   └── div.ui-message-remaining                     (remainingIndicator: bar and/or text, aria-hidden; one visually hidden sentence)
└── span.ui-message-close-host → Button (×)          (closable)

MODAL: the same inside a native <dialog> (with a dimmed ::backdrop).
TOAST: inside div.ui-message-region.ui-message-region-{top-left|top-right|bottom-left|bottom-right} in the application's toast area.
```

The title is bold at the control size; the text, its link and the details are one step smaller (`--fs-label`). Block, toast and modal have a thicker coloured start edge and rounded corners; with `bordered` they also have a thin border on the other sides, and `cornerRadius:'NONE'` makes the corners square; banners span the full width with a bottom border; inline has no box. The modal uses the surface colour with the type colour on its edge and icon. Toast regions sit below the application's sticky header (`--page-sticky-offset`) at the top, above other content.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Type | Info, success, warning, danger, custom | `ui-message-type-info`, `-success`, `-warning`, `-danger`, `-custom` (custom colours via `--ui-message-bg/-color/-border`) |
| Layout | Inline, block, banner, toast, modal | `ui-message-inline`, `-block`, `-banner`, `-toast`, `-modal` |
| Toast corner | Top-left, top-right, bottom-left, bottom-right | `ui-message-region-top-left`, … |
| Border (block, toast, modal) | Coloured start edge only (default), full border | `ui-message-bordered` |
| Corners (block, toast, modal) | Rounded (default), square | `ui-message-square` |
| Remaining time (temporary messages) | None (default), bar, text, bar and text | `ui-message-remaining`, `-bar`, `-text` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Remaining time | Paused | `ui-message-remaining-paused` |

### Styling contract

`message.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-message-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-info-text`: message
  - `--c-info`: message (block, toast, banner, modal), icon (modal)
  - `--c-info-soft`: message (block, toast, banner)
  - `--c-success-text`: message (type success)
  - `--c-success`: message (block + type success, toast + type success, banner + type success, modal + type success), icon (modal + type success)
  - `--c-success-soft`: message (block + type success, toast + type success, banner + type success)
  - `--c-warning-text`: message (type warning)
  - `--c-warning`: message (block + type warning, toast + type warning, banner + type warning, modal + type warning), icon (modal + type warning)
  - `--c-warning-soft`: message (block + type warning, toast + type warning, banner + type warning)
  - `--c-danger-text`: message (type danger)
  - `--c-danger`: message (block + type danger, toast + type danger, banner + type danger, modal + type danger), icon (modal + type danger)
  - `--c-danger-soft`: message (block + type danger, toast + type danger, banner + type danger)
  - `--c-surface`: message (modal)
  - `--c-text`: message (modal)
  - `--c-border`: message (modal)
  - `--shadow-color`: message (modal + backdrop)
- Typography
  - `--font-ui`: message
  - `--fw-ui`: message
  - `--fs-control`: message
  - `--lh-body`: message
  - `--fs-label`: message (inline), text, details
  - `--fw-ui-strong`: title, link
  - `--fs-caption`: remaining
  - `--fs-block-title`: title (modal)
- Borders and corners
  - `--border-thick`: message (block, toast, modal)
  - `--radius-control`: message (block, toast, modal)
  - `--border-thin`: bordered, message (banner)
  - `--radius-pill`: remaining (bar, fill)
- Shadows
  - `--shadow-md`: message (toast, modal)
- States and motion
  - `--opacity-disabled`: remaining (fill + remaining paused)
- Sizes
  - `--icon-size-medium`: icon

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: message (also block, toast, modal, banner), actions (also modal), region, remaining
  - `--gap-tight`: body (also banner), actions, remaining
  - `--gap-block`: details, message (block, toast, modal, banner), body (banner), region
  - `--space-sm-2`: close host, remaining (bar)
- Sizes
  - `--size-md-4`: region, message (modal)
  - `--size-md-1`: remaining (text)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Typography
  - `--fs-control`: icon
  - `--lh-body`: icon (also inline, modal)
  - `--fs-label`: icon (also inline)
  - `--fs-block-title`: icon (modal)
- States and motion
  - `--focus-outline`: link (focus), detail link (focus), message (focus)
  - `--focus-offset`: link (focus), detail link (focus), message (focus)
- Spacing
  - `--page-sticky-offset`: region (top left, top right)

**Set by the component — don't change**

- Variables
  - `--ui-message-bg`, `--ui-message-color`, `--ui-message-border`: custom colours (from `backgroundToken`, `colorToken`, `borderToken`)
  - `--ui-message-remaining`: remaining part of the display time, from 1 to 0

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `messageIndex.js`.
- Choose the layout by importance: INLINE for small notes, BLOCK for results with next steps, BANNER for page- or application-wide announcements (AppHeader's `announcement`), TOAST for short feedback, MODAL only when the user must read or decide.
- Choose the type by meaning, not colour; never make DANGER temporary.
- For toasts, add one empty element to the page (the toast area) and pass it as the container of every toast; give each toast a unique id.
- Application buttons follow the shared actions contract (guidelines §10.2): pass `actions` (`{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`) and handle `onAction(key)`; never create Buttons yourself inside the component.
- For confirmations, use MODAL with two actions (the confirming one first, then Cancel with key `cancel` or `cancel:true`) and act in `onAction(key)`; Escape reports `onClose('ESCAPE')`, which means "cancel". In DANGER confirmations Cancel has the focus when the modal opens, so pressing Enter by mistake does not confirm.
- Update a visible message with `update()` instead of rendering a new one.
- Call `destroy()` when the message is no longer needed.

### Safety

- All texts are displayed as text; do not pass HTML. Build link addresses from trusted routes only.
- Do not use temporary messages for information the user must keep (errors, codes, instructions).
- Keep modal messages rare; never open several at once.

### Example prompts

```text
Show a success toast "Order sent" for 5 seconds with an Undo action, in the top-right corner.
```

```text
Before deleting the selected orders, ask with a danger modal "Delete 12 orders?" with Delete and Cancel, and delete only on Delete.
```

## For developers

### Business analysis

> **Component**: the Message itself. **Consumer**: the developer who configures the Message in the application's code. **App**: the running application that uses the Message; it provides the data, performs the actions and stores the changes.

**Type and layout**

- Consumer chooses the type: information, success, warning, danger or custom. <!-- BA-01 -->
  - Component displays the colour and the icon of the type. <!-- BA-02 -->
- Consumer chooses the layout: inline, block, banner, toast or modal. <!-- BA-03 -->
  - Component displays a toast in a corner of the screen and stacks several toasts. <!-- BA-04 -->
  - Component displays a modal window in the middle of the screen and blocks the page behind it. <!-- BA-05 -->

**Content**

- Consumer provides the text, and a title, a link, a list of details and action buttons (optional). <!-- BA-06 -->
- User clicks an action button. <!-- BA-07 -->
  - Component reports the action to the App. <!-- BA-08 -->
  - App performs the action. <!-- BA-09 -->
  - Component closes a modal message. <!-- BA-10 -->
- User presses Escape in a modal message. <!-- BA-11 -->
  - Component closes it and reports the cancel to the App. <!-- BA-12 -->
- Component selects "Cancel" first in a dangerous confirmation, so an accidental Enter never confirms. <!-- BA-13 -->

**Visibility**

- Consumer chooses permanent, closable, temporary, or closable and temporary. <!-- BA-14 -->
- User clicks the close button of a closable message. <!-- BA-15 -->
  - Component hides the message and reports the close to the App. <!-- BA-16 -->
- Component hides a temporary message after the set time. <!-- BA-17 -->
  - Component keeps it visible while the mouse is over it or it has the keyboard focus. <!-- BA-18 -->
  - Component displays the time left as a bar, a text ("Closes in 4 s"), or both (optional). <!-- BA-19 -->
- Component keeps a danger message visible until the user or the App closes it. <!-- BA-20 -->

**Screen readers**

- Component announces information and success messages politely, and warnings and danger messages at once. <!-- BA-21 -->
- Component exposes messages that are already on the page when it opens, without announcing them. <!-- BA-22 -->

**Changes**

- App changes the type and the text of a message. <!-- BA-23 -->
  - Component displays the change in place and announces it when the message is visible. <!-- BA-24 -->

**Tooltips**

- Consumer chooses how the close button and icon-only actions show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-25 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: yes (`actions`, `onAction`; adds `cancel`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderMessage, DEFAULT_MESSAGE_CONFIG, MESSAGE_TOOLTIP_MODES, MESSAGE_TYPES, MESSAGE_LAYOUTS, MESSAGE_CORNERS } from './messageIndex.js';

const message = renderMessage(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element; rendering replaces its content and `destroy()` clears it. **Exception — TOAST:** `container` is the shared toast area provided once by the application; each toast is added to a corner region inside it (nothing is replaced) and `destroy()` removes only that toast (and the region when empty).

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `show()` | — | Shows the message (again): announced, timer restarted; a MODAL opens. |
| `hide()` | — | Hides the message (not reported through `onClose`). |
| `isVisible()` | boolean | Whether the message is visible. |
| `focus()` | boolean | Moves focus to the message (e.g. an error summary after a failed submit). |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables an action Button; `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `update(changes)` | — | Changes `type`, `title`, `text`, `details`, `link` or `icon` in place; announced when visible. |
| `destroy()` | — | Removes timers, listeners and Buttons; removes the message. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `type` | string | `'INFO'` | `INFO`, `SUCCESS`, `WARNING`, `DANGER`, `CUSTOM` | Always | Meaning, colour and default icon. |
| `layout` | string | `'BLOCK'` | `INLINE`, `BLOCK`, `BANNER`, `TOAST`, `MODAL` | Always | How the message is shown. |
| `title` | string | `''` | Text | Always | Optional title (names the MODAL). |
| `text` | string | — | Text | Always | Required. |
| `details` | array | `[]` | Strings, or `{ label, href?, onClick? }` | Not `INLINE` | Short list under the text; entries with `href` or `onClick` are links (e.g. to form fields in an error summary). `onClick(event, instance)`; without `href` the link does not navigate. |
| `link` | object | `null` | `{ href, label }` | Always | Link after the text. |
| `actions` | array | `[]` | `{ key, label, icon?, iconOnly?, hierarchy?, disabled?, cancel? }` | Not `INLINE` | Application buttons (guidelines §10.2; `onAction`); MODAL without actions gets "OK". Default hierarchy: first MODAL action primary, others secondary. `iconOnly` shows only the icon (the label is its name). Message's own extension: `cancel:true` marks the safe choice (also assumed for key `cancel`). Without `onAction` the Buttons are disabled (`ACTION_HANDLER_MISSING`), except in a MODAL, where pressing closes it. |
| `defaultAction` | string | `''` | An action `key` | `MODAL` | Action focused when the modal opens. Default: for `DANGER` the cancel action (`cancel:true`, or key `cancel`; otherwise the last action), for other types the first button. |
| `closable` | boolean | `false` | — | Not `MODAL` | Close Button (×); reported as `onClose('USER')`. |
| `bordered` | boolean | `false` | — | `BLOCK`, `TOAST`, `MODAL` | `true`: a thin border around the box as well; `false`: only the thicker coloured start edge. |
| `cornerRadius` | string | `'ROUNDED'` | `NONE`, `ROUNDED` | `BLOCK`, `TOAST`, `MODAL` | `ROUNDED`: corners with the `--radius-control` token; `NONE`: square corners. |
| `duration` | number | `0` | Milliseconds (0 = permanent) | Not `MODAL`, not `DANGER` | Temporary: hides after this time, paused while hovered or focused; reported as `onClose('TIMEOUT')`. |
| `remainingIndicator` | string | `'NONE'` | `NONE`, `BAR`, `TEXT`, `BAR_AND_TEXT` | `duration`, not `INLINE` | Shows the remaining time: a bar that shrinks, a text (`texts.remaining`, `texts.paused` while paused), or both. Screen readers hear `texts.closesIn` once, with the message. |
| `visible` | boolean | `true` | — | Always | Initial visibility (`show()` later). |
| `corner` | string | `'TOP_LEFT'` | `TOP_LEFT`, `TOP_RIGHT`, `BOTTOM_LEFT`, `BOTTOM_RIGHT` | `TOAST` | Corner of the toast region. |
| `icon` | string | per type | Font Awesome classes | Always | Replaces the type icon. |
| `backgroundToken` / `colorToken` / `borderToken` | string | INFO colours | Design-token names | `CUSTOM` | Custom colours. |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the close button and icon-only actions show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.close` / `texts.ok` | string | `'Close message'` / `'OK'` | Text | Always | Close Button name; default MODAL action. |
| `texts.remaining` / `texts.paused` / `texts.closesIn` | string | `'Closes in {seconds} s'` / `'Paused'` / `'Closes by itself in {seconds} seconds.'` | Text; `{seconds}` is replaced | `remainingIndicator` | Visible remaining time; shown while paused; sentence for screen readers. |
| `onClose` | function | `null` | `(reason, instance) => {}` | Always | `USER`, `TIMEOUT`, `ESCAPE` (MODAL: means cancel) or `ACTION` (MODAL closed by an action). |
| `onAction` | function | `null` | `(key, instance) => {}` | `actions` | An action Button was pressed (a MODAL then closes). |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onClose` | `(reason, instance)` | The user closes it, the time runs out, Escape closes a MODAL, or a MODAL action closes it. | `hide()` or `destroy()` by code. |
| `onAction` | `(key, instance)` | An action Button is pressed. | — |

### Errors

Message has no user errors of its own. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Message "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container (for TOAST: no toast area). |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `TEXT_REQUIRED` | error | `text` is empty. |
| `TEMPORARY_DANGER` | warning | `duration` with `DANGER`; ignored. |
| `INVALID_TOKEN` | warning | A custom colour that is not a design-token name. |
| `INVALID_ACTION` | warning | An action without key or label; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A duplicate action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` names no action. |
| `ACTION_HANDLER_MISSING` | warning | Actions without `onAction`; their Buttons are rendered disabled. |
| `INVALID_ICON_CLASS` | warning | An action icon with invalid class tokens; they are dropped. |
| `INVALID_OPTION` | warning | Invalid type, layout, corner, cornerRadius, remainingIndicator or duration; the default is used. |
| `OPTION_IGNORED` | warning | Option that does not apply (e.g. `closable`/`duration` with MODAL, `corner` without TOAST, `bordered`/`cornerRadius` with INLINE or BANNER, `remainingIndicator` without `duration` or with INLINE, colours without CUSTOM, details/actions with INLINE). |

### Accessibility

- New messages (shown with `show()`, updated while visible, and every toast) are live regions: `role="status"` (polite) for INFO, SUCCESS and CUSTOM, `role="alert"` (immediate) for WARNING and DANGER. Messages visible when the page is rendered are not announced; they are read in place.
- The type is conveyed by icon and wording as well as colour.
- Temporary messages pause while hovered or focused, so they can be read and their buttons used (WCAG timing).
- Remaining time (`remainingIndicator`): the bar and the changing text are hidden from assistive technology (they would be read every second); instead the message includes one visually hidden sentence, `texts.closesIn` ("Closes by itself in 6 seconds."), read with it. With reduced motion the bar moves in whole seconds.
- MODAL uses the native `<dialog>`: focus moves into it (to Cancel in DANGER confirmations, to `defaultAction` when given, otherwise to the first button) and stays there, the page behind is inert, focus returns afterwards; it is named by its title and described by its text; Escape closes it (reported as `ESCAPE`, i.e. cancel); a click outside does not close it.
- Close and action controls are Buttons with names ("Close message").

### Examples

Toast area (once per page) and a temporary success toast with Undo:

```js
// <div id="toast-area"></div> somewhere in the page
renderMessage(document.querySelector('#toast-area'),{ id:`toast-${Date.now()}`, type:'SUCCESS', layout:'TOAST', corner:'TOP_RIGHT',
    text:'Order ORD-1042 sent.', duration:5000, closable:true, actions:[ { key:'undo', label:'Undo' } ] },
);
```

Confirmation before a dangerous action:

```js
renderMessage(dialogHost,{ id:'confirm-delete', type:'DANGER', layout:'MODAL', title:'Delete 12 orders?', text:'This cannot be undone.',
    actions:[ { key:'delete', label:'Delete 12 orders' }, { key:'cancel', label:'Cancel' } ],   // Cancel is focused (DANGER)
    onAction:( key ) => { if ( key === 'delete' ) { deleteOrders(selection); } } });
```

Announcement in AppHeader:

```js
renderAppHeader(headerHost,{ id:'app-header', appName:'Orders',
    announcement:{ type:'WARNING', text:'Planned maintenance tonight 22:00–23:00.', link:{ href:'/status', label:'Details' }, onClose:() => rememberClosed('maintenance-0930') } });
```

### Files

| File | Responsibility |
| --- | --- |
| `messageIndex.js` | Public entry point; the only import surface. |
| `messageConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `messageComponent.js` | Rendering per layout, toast regions, show/hide, timer, announcements, modal, Buttons. |
| `messageHTML.js` | Message and body markup. |
| `messageEvents.js` | Timer pause and modal Escape listeners. |
| `messageErrors.js` | Developer error and warning catalog. |
| `message.css` | Presentation. |
| `messageTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/message.test.mjs`). |
