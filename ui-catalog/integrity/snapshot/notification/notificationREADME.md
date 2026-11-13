# Notification

## For business

### Overview

Notification is a small round element — an icon, a picture or a short text — with an optional marker in one corner that draws attention: a number ("3 new messages"), a coloured dot ("online", "something new") or a short word ("NEW"). It can be a button (e.g. the bell that opens notifications) or just a display (e.g. a person's photo with an "online" dot).

### When to use

- Use it for an icon, a picture or initials with a marker that draws attention: the bell with "3", a photo with an "online" dot.
- Use Badge when a name or role goes next to the picture.
- Use Chip for labels and statuses inside text.

### Key features

- An icon, a picture or short text, as a circle (or a pill for longer text).
- An optional corner marker: a count ("99+" above 99), a dot in four shapes, or a short text.
- Marker colours for information, success, warning, danger, or the product's own.
- Clickable, like a small icon button, or display only.
- Count and marker updated in place.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, sizes and typography. |
| Notification styles (`notification.css`) | Always | Shapes, sizes, marker. |
| Font Awesome icon library | Icon content | Icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application decides what the marker shows (e.g. the number of unread notifications, a person's presence) and what happens on click (e.g. opening a notifications panel). Inline labels, statuses and tags are BadgeChip's job. AppHeader's bell and user avatar will switch to Notification in a later update.

## For designers

### Structure

```text
button#{id}.ui-notification.ui-notification-content-{icon|image|text}.ui-notification-size-{small|medium|large}.{ui-notification-circle|ui-notification-pill-main}[.ui-notification-bordered]
  aria-label="{label}[, {marker meaning}]"                       (display only: span[role="img"])
├── span.ui-notification-shape                                   (the visible shape: background, border, corners, focus ring)
│   └── span.ui-notification-icon > i  |  img.ui-notification-image  |  span.ui-notification-text   (aria-hidden)
└── span.ui-notification-indicator.ui-notification-indicator-{count|dot|text}.ui-notification-type-{…}.ui-notification-corner-{…}
      [.ui-notification-pill]  [.ui-notification-shape-{circle|triangle|square|diamond}]            (aria-hidden)
```

Clickable notifications look like tertiary icon buttons: transparent, accent-coloured icon, hover background, focus outline, reduced opacity when disabled. Text content sits on the selected (soft accent) background. Per-instance colours (`colorToken`, `backgroundToken`) replace these for icon and text content; on hover they darken slightly. The marker overlaps its corner by a third of its size and has a ring in the surface colour so it stays distinct from the content. A pill marker at a right corner starts where a round marker starts and grows outwards: the notification is wider by the pill's extra length (a round marker or dot changes nothing). At a left corner a pill starts at the corner and grows over the shape.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Main content | Icon, image, text | `ui-notification-content-icon`, `-image`, `-text` |
| Main shape | Circle, pill (text longer than 3 characters) | `ui-notification-circle`, `ui-notification-pill-main` |
| Size | Small, medium, large | `ui-notification-size-small`, `-medium`, `-large` |
| Border | Without, with | —, `ui-notification-bordered` |
| Main colours | Default, per instance | —, `--ui-notification-color` / `--ui-notification-bg` (from `colorToken` / `backgroundToken`) |
| Marker kind | Count, dot, text | `ui-notification-indicator-count`, `-dot`, `-text` |
| Marker shape (text) | Circle, pill | —, `ui-notification-pill` |
| Marker shape (dot) | Circle, triangle, square, diamond | `ui-notification-shape-circle`, `-triangle`, `-square`, `-diamond` |
| Marker colour | Info, success, warning, danger, custom | `ui-notification-type-*` (custom: `--ui-notification-indicator-bg/-color`) |
| Corner | Top-right, top-left, bottom-right, bottom-left | `ui-notification-corner-top-right`, … |

### States

No states of its own.

### Styling contract

`notification.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-notification-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-accent`: shape (also hover)
  - `--c-border`: shape (bordered)
  - `--c-selected`: shape (content text)
  - `--c-text`: shape (content text, hover), type warning
  - `--c-surface-hover`: shape (hover)
  - `--c-danger`: indicator, type danger
  - `--c-on-accent`: indicator
  - `--c-surface`: indicator
  - `--c-info`: type info
  - `--c-success`: type success
  - `--c-warning`: type warning
- Typography
  - `--font-ui`: notification
  - `--fw-ui`: notification
  - `--fs-label`: text
  - `--fw-ui-strong`: text, indicator
  - `--fs-caption`: text (size small)
- Borders and corners
  - `--border-thin`: shape (also diamond)
  - `--radius-pill`: shape (pill main)
  - `--tag-radius`: indicator
  - `--border-thick`: indicator
- States and motion
  - `--transition-1`: shape
  - `--opacity-disabled`: notification (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: notification (size small, size large), shape (pill main)
  - `--space-sm-1`: shape (content image + bordered)
- Sizes
  - `--control-height`: notification (also size small, size large)
  - `--icon-size-medium`: notification
  - `--icon-size-small`: notification (size small)
  - `--icon-size-large`: notification (size large)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thin`: corner top right, corner top left, corner bottom right, corner bottom left, pill (corner top right, corner bottom right)
- States and motion
  - `--focus-outline`: shape (focus)
  - `--focus-offset`: shape (focus)
- Sizes
  - `--ui-notification-size` (defined in this stylesheet): notification, shape (also circle)
  - `--ui-notification-indicator-size` (defined in this stylesheet): indicator (also dot), pill (also corner top right, corner bottom right), corner top right, corner top left, corner bottom right, corner bottom left, shape (triangle)

**Set by the component — don't change**

- Variables
  - `--ui-notification-bg`, `--ui-notification-color`: main colours (from `backgroundToken`, `colorToken`)
  - `--ui-notification-indicator-bg`, `--ui-notification-indicator-color`: marker colours (from the marker's `backgroundToken`, `colorToken`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `notificationIndex.js`.
- Always give a `label` naming the thing, not the marker ("Notifications", "Ana Pop"); the marker's meaning is added automatically ("3 new") or from `indicator.description` ("Online").
- Use `clickable:false` for pure displays (e.g. an avatar in a list); use the default clickable version when it opens something.
- Use counts for quantities, dots for states (always with a `description`), short text for labels such as "NEW".
- Update the marker with `setCount()` or `setIndicator()` instead of rendering again.
- Give each notification a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Texts are displayed as text; do not pass HTML. Use image addresses from trusted sources.
- Do not rely on colour or shape alone: give dots a `description`.
- With `colorToken`/`backgroundToken`, choose a pair with enough contrast (at least 4.5:1 for text, 3:1 for icons).

### Example prompts

```text
Add a bell Notification to the header with the number of unread notifications (danger count, 99+ above 99) that opens the notifications panel on click.
```

```text
Show each team member as a display-only Notification with their photo (or initials) and a green circle dot "Online" or a grey square "Away" at the bottom-right.
```

## For developers

### Business analysis

> **Component**: the Notification itself. **Consumer**: the developer who configures the Notification in the application's code. **App**: the running application that uses the Notification; it provides the data, performs the actions and stores the changes.

**Content**

- Consumer provides an icon, a picture or a short text, e.g. initials. <!-- BA-01 -->
  - Component displays an icon or a picture as a circle. <!-- BA-02 -->
  - Component displays text up to three characters as a circle, and longer text as a pill. <!-- BA-03 -->
- Consumer chooses one of three sizes. <!-- BA-04 -->
  - Component adapts the marker to the size. <!-- BA-05 -->
- Consumer enables a thin border around the shape (optional). <!-- BA-06 -->
- Consumer chooses own colours for the icon and the text, e.g. white initials on the brand colour (optional). <!-- BA-07 -->

**Marker** (optional)

- Consumer chooses a count, a dot or a short text. <!-- BA-08 -->
  - Component displays a count of one digit as a circle and longer counts as a pill. <!-- BA-09 -->
  - Component displays "99+" for counts above 99, and hides the marker at 0. <!-- BA-10 -->
  - Component displays a dot as a circle, a triangle, a square or a diamond. <!-- BA-11 -->
- Consumer chooses the marker colour: information, success, warning, danger or own colours. <!-- BA-12 -->
- Component displays the marker in the top-right corner, or in another corner chosen by the Consumer. <!-- BA-13 -->
  - Component displays a long marker at a right corner outside the shape, so the notification becomes wider. <!-- BA-14 -->

**Interaction**

- Consumer chooses clickable or display only. <!-- BA-15 -->
- User clicks a clickable notification. <!-- BA-16 -->
  - Component reports the click to the App. <!-- BA-17 -->
  - App performs the action, e.g. opens a notifications panel. <!-- BA-18 -->

**Changes**

- App changes the count or the marker. <!-- BA-19 -->
  - Component displays the change in place. <!-- BA-20 -->

**Screen readers**

- Component announces the name together with the meaning of the marker, e.g. "Notifications, 3 new". <!-- BA-21 -->

**Tooltips**

- Consumer chooses how the label of a clickable notification shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-22 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderNotification, DEFAULT_NOTIFICATION_CONFIG, NOTIFICATION_TOOLTIP_MODES, NOTIFICATION_SIZES, NOTIFICATION_INDICATOR_KINDS, NOTIFICATION_SHAPES, NOTIFICATION_TYPES, NOTIFICATION_CORNERS } from './notificationIndex.js';

const notification = renderNotification(container, config, onClick); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getElement()` | Element | The button (clickable) or span (display only). |
| `setIndicator(changes)` | — | Changes the marker (partial object, merged with the current one) or removes it (`null`). |
| `setCount(count)` | — | Sets a count marker (0 hides it). A count marker keeps its settings; a dot or text marker is replaced by a new count (only its corner stays). |
| `getIndicator()` | object \| null | Copy of the current marker. |
| `getIndicatorSpeech()` | string | The marker's spoken meaning ("3 new", "Online") or `''`; for components that show a Notification inside their own accessible name (e.g. Badge). |
| `setDisabled(disabled)` | — | Enables or disables a clickable notification. |
| `destroy()` | — | Removes listeners, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `label` | string | — | Text | Always | Required accessible name (also the tooltip of clickable ones). |
| `icon` / `image` / `text` | string | — | Font Awesome classes / image URL / text (≤ 12 characters) | Always | Main content, one of the three is required (priority image, icon, text; `CONTENT_CONFLICT`). Text of 1–3 characters is a circle, longer a pill. |
| `size` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE` | Always | Same sizes as icon Buttons; the marker scales. |
| `clickable` | boolean | `true` | — | Always | Native button (tertiary look) or display only (`role="img"`). |
| `disabled` | boolean | `false` | — | `clickable` | Disables the button. |
| `border` | boolean | `false` | — | Always | Thin border (border colour) around the main shape; same size with or without. |
| `colorToken` | string | — | Design-token name (e.g. `'--c-on-accent'`) | `icon`, `text` | Colour of the icon or text; default accent (icon) or text colour (text). |
| `backgroundToken` | string | — | Design-token name (e.g. `'--c-accent'`) | `icon`, `text` | Background of the main shape; default transparent (icon) or selected (text). |
| `indicator` | object | `null` | See Indicator | Always | Corner marker. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the label of a clickable notification shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.count` | string | `'{count} new'` | Text with `{count}` | `indicator` | Spoken meaning of counts. |
| `onClick` | function | `null` | `(event, instance) => {}` | `clickable` | Takes precedence over the third argument. |

### Indicator

| Field | Default | Allowed values | Description |
| --- | --- | --- | --- |
| `kind` | `'COUNT'` | `COUNT`, `DOT`, `TEXT` | What the marker shows. |
| `value` | `0` / `''` | Number (COUNT) or short text (TEXT) | Hidden for 0 or empty text; DOT has no value. |
| `max` | `99` | Integer ≥ 1 | Counts above it show "{max}+". |
| `shape` | `'CIRCLE'` | `CIRCLE`, `TRIANGLE`, `SQUARE`, `DIAMOND` | DOT only; text markers are circles (one character) or pills. |
| `type` | `'DANGER'` | `INFO`, `SUCCESS`, `WARNING`, `DANGER`, `CUSTOM` | Colour, same types as Chip and Message. |
| `backgroundToken` / `colorToken` | — | Design-token names | CUSTOM colours. |
| `corner` | `'TOP_RIGHT'` | `TOP_RIGHT`, `TOP_LEFT`, `BOTTOM_RIGHT`, `BOTTOM_LEFT` | Position (logical: mirrored in right-to-left). |
| `description` | — | Text | Spoken meaning; required in practice for dots ("Online"); for counts it replaces `texts.count`. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onClick` | `(event, instance)` | A clickable notification is activated (click, Enter, Space). | Display-only or disabled notifications. |

### Errors

Notification has no user errors of its own. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Notification "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `CONTENT_REQUIRED` | error | No icon, image or text. |
| `CONTENT_CONFLICT` | warning | Several main contents; one is used. |
| `TEXT_TOO_LONG` | warning | Main text longer than 12 characters. |
| `INVALID_TOKEN` | warning | A colour (`colorToken`, `backgroundToken`, indicator tokens) that is not a design-token name; the default is used. |
| `INVALID_OPTION` | warning | Invalid size, kind, shape, type or corner; the default is used. |
| `OPTION_IGNORED` | warning | `disabled` without `clickable`; `shape` for COUNT or TEXT markers; `colorToken`/`backgroundToken` with image content. |

### Accessibility

- Clickable: a native `<button>` named by `aria-label` = label plus the marker's meaning ("Notifications, 3 new"); keyboard and focus outline as any button; the label is also the tooltip.
- Display only: `role="img"` with the same accessible name.
- The main content and the marker are hidden from assistive technology (`aria-hidden`); their meaning is in the name.
- Marker changes update the name; they are not announced by themselves (announce important changes with Message if needed).
- Colour and shape are never the only information: give dots a `description`.

### Examples

```js
const bell = renderNotification(bellHost,{ id:'bell', label:'Notifications', icon:'fa-solid fa-bell', indicator:{ kind:'COUNT', value:unread } },() => openNotificationsPanel());
bell.setCount(unread + 1);

renderNotification(avatarHost,{ id:`user-${user.id}`, label:user.name, image:user.photo, clickable:false, size:'LARGE',
    indicator:{ kind:'DOT', shape:'CIRCLE', type:'SUCCESS', corner:'BOTTOM_RIGHT', description:'Online' } });
```

### Files

| File | Responsibility |
| --- | --- |
| `notificationIndex.js` | Public entry point; the only import surface. |
| `notificationConfig.js` | Defaults, content and indicator normalization, developer validation. |
| `notificationComponent.js` | Rendering, accessible name, indicator updates, click. |
| `notificationHTML.js` | Element and indicator markup, count text, spoken meaning. |
| `notificationEvents.js` | Click listener. |
| `notificationErrors.js` | Developer error and warning catalog. |
| `notification.css` | Presentation. |
| `notificationTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/notification.test.mjs`). |
