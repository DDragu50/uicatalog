# Badge

## For business

### Overview

Badge shows who someone is (or what something is) at a glance: a picture, initials or icon — with an optional marker such as an "online" dot or a count — next to a name and an optional role or description. Typical uses: the signed-in user in the header, the owner of a record, members of a team, a support channel with unread messages.

### When to use

- Use it to show who someone is, or what something is, next to its name: the signed-in user, the owner of a record, team members, a support channel.
- Use Notification for an icon or picture with a marker and no name.
- Use Chip for short labels such as a status or a category.

### Key features

- A picture, initials or an icon next to a name and an optional role or description.
- An optional marker on the picture: a count, a dot in four shapes, or a short text.
- Text beside the picture or centred below it, in three sizes.
- A link to a page, a button, or display only.
- Long texts shortened with "…" and shown in full as a tooltip.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, sizes and typography. |
| Badge styles (`badge.css`) | Always | Layout and text. |
| Notification component and `notification.css` | With a picture | Picture, initials or icon and the marker. |
| Font Awesome icon library | Icon pictures | Icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides the person's data (name, role, photo, presence) and the page the link leads to. Groups of overlapping avatars ("+4") are not part of this version.

## For designers

### Structure

```text
a#{id}.ui-badge.ui-badge-{horizontal|vertical}.ui-badge-size-{small|medium|large}.ui-badge-interactive   (link; button with onClick; span[role="group"] display only)
├── span.ui-badge-notification-host → Notification (display only, aria-hidden)          (optional)
└── span.ui-badge-text
    ├── span.ui-badge-name
    ├── span.ui-badge-description                                                       (optional)
    └── span.ui-badge-visually-hidden  ", Online"                                        (marker meaning)
```

The name is bold, the description smaller and muted. Interactive badges (link or button) have more space around the content, a rounded hover background and the focus outline around the whole badge.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Layout | Horizontal, vertical | `ui-badge-horizontal`, `ui-badge-vertical` |
| Size | Small, medium, large | `ui-badge-size-small`, `-medium`, `-large` (also the Notification size) |
| Interaction | Link, button, display only | `a` / `button` with `ui-badge-interactive`, `span[role="group"]` |

### States

No states of its own.

### Styling contract

`badge.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-badge-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: badge
  - `--c-muted`: description
  - `--c-surface-hover`: badge (interactive + hover)
- Typography
  - `--font-ui`: badge
  - `--fw-ui`: badge
  - `--lh-compact`: text
  - `--fs-label`: name, description (size large)
  - `--fw-ui-strong`: name
  - `--fs-caption`: description, name (size small)
  - `--fs-fine`: description (size small)
  - `--fs-control`: name (size large)
- Borders and corners
  - `--radius-pill`: badge
  - `--radius-control`: badge (vertical)
- States and motion
  - `--transition-1`: badge (interactive)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: badge
  - `--space-sm-2`: badge
  - `--space-sm-3`: badge (interactive)
  - `--space-md-3`: badge (interactive)
  - `--gap-tight`: badge (vertical)
- Sizes
  - `--size-md-2`: text

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: badge (interactive + focus)
  - `--focus-offset`: badge (interactive + focus)

**Set by the component — don't change**

- Variables
  - `--ui-badge-color`, `--ui-badge-description-color`: name and description colours (from `colorToken`, `descriptionColorToken`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `badgeIndex.js`.
- Pass the picture in `notification` as a Notification configuration without `id`, `size`, `clickable` or `onClick` (Badge sets them): `{ image }`, `{ text:'AP' }` or `{ icon }`, plus an optional `indicator`.
- Give dot markers a `description` ("Online", "Away"), so the spoken sentence is complete.
- Use `href` when the badge leads to a page (e.g. the user's profile); `onClick` when it opens something on the page; neither for display only.
- Change the marker through `badge.setIndicator()` / `badge.setCount()` (not through the Notification directly), so the spoken text follows.
- Give each badge a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Texts are displayed as text; do not pass HTML. Use image and link addresses from trusted sources.

### Example prompts

```text
Show the signed-in user as a Badge with photo, name and role, a green "Online" dot (top-right, the default corner), linking to the profile page.
```

## For developers

### Business analysis

> **Component**: the Badge itself. **Consumer**: the developer who configures the Badge in the application's code. **App**: the running application that uses the Badge; it provides the data, performs the actions and stores the changes.

**Content**

- Consumer provides the name, and a role or description (optional), e.g. "Administrator". <!-- BA-01 -->
- Consumer provides a picture, initials or an icon (optional). <!-- BA-02 -->
  - Component displays a marker on the picture: a count, a dot or a short text (optional). <!-- BA-03 -->
  - Component displays the marker in the top-right corner, or in another corner chosen by the Consumer. <!-- BA-04 -->
- Component displays the text beside the picture, or centred below it (optional). <!-- BA-05 -->
- Consumer chooses one of three sizes. <!-- BA-06 -->
  - Component adapts the picture and the text together. <!-- BA-07 -->
- Component shortens long texts with "…". <!-- BA-08 -->
  - User hovers over a shortened text. <!-- BA-09 -->
  - Component displays the full text as a tooltip. <!-- BA-10 -->

**Interaction**

- Consumer chooses link, button or display only. <!-- BA-11 -->
- User clicks a link badge. <!-- BA-12 -->
  - Component opens the linked page. <!-- BA-13 -->
- User clicks a button badge. <!-- BA-14 -->
  - Component reports the click to the App. <!-- BA-15 -->
  - App performs the action. <!-- BA-16 -->

**Changes**

- App changes the name, the description or the marker. <!-- BA-17 -->
  - Component displays the change in place. <!-- BA-18 -->

**Screen readers**

- Component announces the badge as one sentence, e.g. "Ana Pop, Administrator, Online". <!-- BA-19 -->

**Colours**

- Consumer chooses own text colours, e.g. light text on a brand-coloured header (optional). <!-- BA-20 -->

**Tooltips**

- Consumer chooses how the full name and description shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-21 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderBadge, DEFAULT_BADGE_CONFIG, BADGE_TOOLTIP_MODES, BADGE_LAYOUTS, BADGE_SIZES } from './badgeIndex.js';

const badge = renderBadge(container, config, onClick); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getElement()` | Element | The link, button or group. |
| `getNotification()` | instance \| null | The composed Notification. |
| `setName(name)` | — | Changes the name. |
| `setDescription(description)` | — | Changes or removes (`''`) the role/description. |
| `setIndicator(changes)` | — | Changes or removes (`null`) the Notification's marker; the spoken text follows. |
| `setCount(count)` | — | Sets a count marker (0 hides it); the spoken text follows. |
| `destroy()` | — | Removes listeners and the Notification, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `name` | string | — | Text | Always | Required. |
| `description` | string | `''` | Text | Always | Optional role or description. |
| `notification` | object | `null` | Notification configuration (without `id`, `size`, `clickable`, `onClick`) | Always | Picture, initials or icon, with an optional `indicator`; `label` defaults to `name`. Without it, the badge shows text only. |
| `size` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE` | Always | Size of the Notification and the text. |
| `layout` | string | `'HORIZONTAL'` | `HORIZONTAL`, `VERTICAL` | Always | Text beside or below the picture. |
| `href` | string | `''` | URL | Always | Makes the badge a link. |
| `colorToken` | string | — | Design-token name | Always | Text colour of the name (e.g. `'--c-on-accent'` on a brand background); hover tints follow it. |
| `descriptionColorToken` | string | — | Design-token name | Always | Colour of the description (default muted). |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the full name and description (`TOOLTIP`: only when they are cut off) shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `onClick` | function | `null` | `(event, instance) => {}` | Always | Makes the badge a button (with `href`: reported before navigation). Takes precedence over the third argument. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onClick` | `(event, instance)` | The badge (button or link) is activated. | Display-only badges. |

### Errors

Badge has no user errors of its own. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Badge "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `NAME_REQUIRED` | error | `name` is empty (also in `setName()`, which then keeps the previous name). |
| `NOTIFICATION_FAILED` | warning | The Notification could not be rendered; the badge shows text only. |
| `INVALID_OPTION` | warning | Invalid size, layout or colour token; the default is used. |
| `OPTION_IGNORED` | warning | `notification.clickable`, `notification.onClick` or `notification.size` (set by Badge); `onClick` together with `href`. |

### Accessibility

- One interactive element: the whole badge is the link or button; the Notification inside is display-only and hidden from assistive technology, so there are no nested controls or double names.
- The accessible name is the visible text plus the marker's meaning: "Ana Pop, Administrator, Online" (separators are visually hidden). Display-only badges are a named group.
- Tooltips give the full name and description when they are cut.

### Examples

```js
const me = renderBadge(userHost,{ id:'me', name:user.name, description:user.role, href:'/profile',
    notification:{ image:user.photo, indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } } });
me.setIndicator({ shape:'SQUARE', type:'WARNING', description:'Away' });
```

### Files

| File | Responsibility |
| --- | --- |
| `badgeIndex.js` | Public entry point; the only import surface. |
| `badgeConfig.js` | Defaults, normalization, developer validation. |
| `badgeComponent.js` | Composition with Notification, spoken text, updates, click. |
| `badgeHTML.js` | Badge and text markup. |
| `badgeEvents.js` | Click listener. |
| `badgeErrors.js` | Developer error and warning catalog. |
| `badge.css` | Presentation. |
| `badgeTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/badge.test.mjs`). |
