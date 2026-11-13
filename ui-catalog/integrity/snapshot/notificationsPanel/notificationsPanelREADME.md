# NotificationsPanel

## For business

### Overview

NotificationsPanel is the bell that tells users something new happened — and, when they click it, shows the latest notifications in a small panel: "Order ORD-1042 was paid", "Ana approved your invoice". Users open a notification to go to its item, mark everything as read, or go to the full list. It is usually placed in the application header (AppHeader), but can be used anywhere.

### When to use

- Use it in the application header to tell users that something new happened and to show the latest notifications.
- Use Notification for a bell or icon with a counter that opens something else, and Message for feedback about the user's own actions.

### Key features

- A bell with the number of unread notifications ("99+" above 99).
- A panel with the latest notifications: icon, text, time, unread ones highlighted.
- Opening a notification marks it as read and leads to its item.
- "Mark all as read" and an optional "See all notifications" link.
- New notifications added while the page is open.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| NotificationsPanel styles (`notificationsPanel.css`) | Always | Panel and list. |
| Notification and `notification.css` | Always | The bell with the count. |
| Button and `button.css` | Always | "Mark all as read". |
| Font Awesome icon library | Always | Bell and notification icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application loads the notifications (e.g. from its server), decides what "read" means and saves it, navigates when one is opened, and provides the full notifications page. Grouping ("Today", "Earlier") is not part of the component: the application decides the order.

## For designers

### Structure

```text
div#{id}.ui-notifications-panel
├── span.ui-notifications-panel-bell-host → Notification (bell, unread count)  aria-haspopup="dialog", aria-expanded
└── div#{id}-panel.ui-notifications-panel-popup  role="dialog"  [hidden]
    ├── div.ui-notifications-panel-header: h2.ui-notifications-panel-title + Button "Mark all as read"
    ├── ul.ui-notifications-panel-list
    │   ├── li > a.ui-notifications-panel-item[.ui-notifications-panel-unread]  (icon, text, time, hidden ", unread")
    │   └── li.ui-notifications-panel-empty                                       (no notifications)
    └── div.ui-notifications-panel-footer > a.ui-notifications-panel-see-all       (seeAllHref / onSeeAll)
```

The panel opens below the bell, aligned to its end, as a card with a shadow. When it would not fit in the window, it is aligned to the bell's start instead, opens above the bell when there is no room below, and as a last resort is kept inside the window (with a shorter, scrolling list). Unread notifications have the selected background, bold text and a small accent dot; times are small and muted; icons sit in a soft circle.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Footer | With or without "See all" | `.ui-notifications-panel-footer` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Notification | Read, unread | `.ui-notifications-panel-item`, `.ui-notifications-panel-unread` |
| List | Notifications, empty | `li > a`, `.ui-notifications-panel-empty` |

### Styling contract

`notificationsPanel.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-notifications-panel-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-border`: popup, header, footer
  - `--c-surface`: popup
  - `--c-text`: popup
  - `--c-surface-hover`: item (hover)
  - `--c-selected`: unread
  - `--c-accent`: unread, icon, see all
  - `--c-surface-muted`: icon
  - `--c-muted`: time, empty
- Typography
  - `--font-ui`: popup, title
  - `--fw-ui`: popup, time
  - `--fs-control`: title
  - `--fw-ui-strong`: title, unread, see all
  - `--lh-body`: title, text
  - `--fs-label`: text, empty, see all
  - `--fs-caption`: time
- Borders and corners
  - `--border-thin`: popup, header, footer
  - `--radius-control`: popup
  - `--radius-control-small`: item, see all
- Shadows
  - `--shadow-md`: popup

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: popup, header, list, footer
  - `--gap-inline-items`: header, item, unread
  - `--gap-block`: header, item, empty, footer
  - `--space-sm-2`: unread
- Sizes
  - `--size-md-4`: popup
  - `--space-sm-3`: unread
  - `--size-sm-1`: icon

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thick`: item (focus), see all (focus)
- States and motion
  - `--focus-outline`: item (focus), see all (focus)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `notificationsPanelIndex.js`.
- Load the notifications in the application and pass them in the order to show (newest first): `{ id, text, time?, icon?, href?, unread? }`; `time` is display text ("5 minutes ago", e.g. from Calendar's `formatCalendarValue`).
- Save "read" in `onOpen` and `onMarkAllRead`; push new notifications with `addNotification()`.
- In single-page applications call `event.preventDefault()` in `onOpen` and route yourself.
- Inside AppHeader, pass the same configuration (without `id`) as `notifications`.
- Give each panel a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Texts are displayed as text; do not pass HTML. Build links from trusted routes only.
- Only show notifications the user is allowed to see (filter on the server).

### Example prompts

```text
Add a NotificationsPanel to the header with the user's latest 5 notifications from the API, marking a notification as read on the server when it is opened and linking "See all" to /notifications.
```

## For developers

### Business analysis

> **Component**: the NotificationsPanel itself. **Consumer**: the developer who configures the NotificationsPanel in the application's code. **App**: the running application that uses the NotificationsPanel; it provides the data, performs the actions and stores the changes.

**Bell**

- Component displays the number of unread notifications on the bell, "99+" above 99, and nothing when all are read. <!-- BA-01 -->
- User clicks the bell. <!-- BA-02 -->
  - Component opens the panel and moves the focus to the first notification. <!-- BA-03 -->
- User presses Escape, clicks outside the panel, or leaves it with the keyboard. <!-- BA-04 -->
  - Component closes the panel and moves the focus back to the bell. <!-- BA-05 -->

**Panel**

- App provides the notifications in the order to display, usually newest first. <!-- BA-06 -->
- Component displays the latest notifications, 5 by default (the number is chosen by the Consumer), each with an icon, a text and a time, e.g. "5 minutes ago". <!-- BA-07 -->
- Component displays unread notifications highlighted. <!-- BA-08 -->
- Component displays "You have no notifications." when the list is empty. <!-- BA-09 -->

**Reading**

- User clicks a notification. <!-- BA-10 -->
  - Component marks it as read (optional, on by default) and reports it to the App. <!-- BA-11 -->
  - App opens its item. <!-- BA-12 -->
- User clicks "Mark all as read". <!-- BA-13 -->
  - Component marks all notifications as read and reports it to the App. <!-- BA-14 -->
  - App stores the read state. <!-- BA-15 -->
- Consumer provides a link to the full list, "See all notifications" (optional). <!-- BA-16 -->

**New notifications**

- App adds a notification while the page is open. <!-- BA-17 -->
  - Component displays the new count and list. <!-- BA-18 -->

**Tooltips**

- Consumer chooses how the bell's label shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-19 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderNotificationsPanel, DEFAULT_NOTIFICATIONS_PANEL_CONFIG, NOTIFICATIONS_PANEL_TOOLTIP_MODES } from './notificationsPanelIndex.js';

const panel = renderNotificationsPanel(container, config); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `setNotifications(items)` | — | Replaces the notifications. |
| `addNotification(item)` | — | Adds one at the top (replacing one with the same id). |
| `markRead(id)` / `markAllRead()` | — | Marks as read (no callback). |
| `getUnreadCount()` | number | Unread notifications. |
| `getNotifications()` | array | Copies of the notifications. |
| `open()` / `close()` | — | Opens or closes the panel. |
| `getBell()` | instance | The bell Notification. |
| `destroy()` | — | Removes listeners and child components, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `items` | array | `[]` | `{ id, text, time?, icon?, href?, unread? }` | Always | Notifications in display order; ids unique. |
| `maxItems` | number | `5` | Integer ≥ 1 | Always | How many are shown in the panel. |
| `markReadOnOpen` | boolean | `true` | — | Always | Opening a notification marks it as read. |
| `seeAllHref` | string | `''` | URL | Always | "See all notifications" link (also shown with `onSeeAll` only). |
| `bell` | object | `{}` | Notification options (e.g. `colorToken`, `size`) | Always | Look of the bell; `id`, `clickable` and the indicator are set by the panel. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the bell's label shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). Passed to the bell (a Notification) unless `bell.tooltipMode` sets it. |
| `texts.*` | string | English defaults | Text | Always | `label` ("Notifications", bell name), `title`, `unreadCount` ("{count} unread"), `unread`, `markAllRead`, `seeAll`, `empty`. |
| `onOpen` | function | `null` | `(item, event, instance) => {}` | Always | A notification was opened (after marking it read); links navigate unless `event.preventDefault()`. |
| `onMarkAllRead` | function | `null` | `(instance) => {}` | Always | "Mark all as read" was pressed. |
| `onSeeAll` | function | `null` | `(event, instance) => {}` | Always | "See all" was chosen. |
| `onToggle` | function | `null` | `(open, instance) => {}` | Always | The panel opened or closed. |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onOpen` | `(item, event, instance)` | A notification is chosen. | `markRead()` by code. |
| `onMarkAllRead` | `(instance)` | "Mark all as read" is pressed. | `markAllRead()` by code. |
| `onSeeAll` | `(event, instance)` | "See all" is chosen. | — |
| `onToggle` | `(open, instance)` | The panel opens or closes. | — |

### Errors

NotificationsPanel has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `NotificationsPanel "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_ITEM` | warning | A notification without id or text; dropped. |
| `DUPLICATE_ITEM_ID` | warning | Duplicate notification id; the later one is dropped. |
| `INVALID_OPTION` | warning | Invalid `maxItems`; the default is used. |

### Accessibility

- The bell is a button named with the unread count ("Notifications, 3 unread"), with `aria-haspopup="dialog"`, `aria-controls` and `aria-expanded`.
- The panel is a non-modal dialog labelled by its title; opening moves focus to the first notification, Escape closes it and returns focus to the bell; leaving it with Tab or clicking outside closes it.
- Notifications are links; unread ones add ", unread" for screen readers (not only colour and bold).

### Examples

```js
const panel = renderNotificationsPanel(bellHost,
{
    id:'inbox', seeAllHref:'/notifications',
    items:( await api.notifications({ limit:5 }) ).map(n => ({ id:n.id, text:n.title, time:formatCalendarValue(n.createdAt,{ type:'DATETIME', displayMode:'RELATIVE' }), href:n.link, unread:!n.read })),
    onOpen:( item ) => api.markRead(item.id),
    onMarkAllRead:() => api.markAllRead()
});
socket.on('notification',n => panel.addNotification({ id:n.id, text:n.title, time:'just now', href:n.link, unread:true }));
```

### Files

| File | Responsibility |
| --- | --- |
| `notificationsPanelIndex.js` | Public entry point; the only import surface. |
| `notificationsPanelConfig.js` | Defaults, notification normalization, developer validation. |
| `notificationsPanelComponent.js` | Bell, panel, read state, focus, reports. |
| `notificationsPanelHTML.js` | Shell and list markup. |
| `notificationsPanelEvents.js` | Item, "See all", Escape, focus and outside-press listeners. |
| `notificationsPanelErrors.js` | Developer error and warning catalog. |
| `notificationsPanel.css` | Presentation. |
| `notificationsPanelTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/notificationsPanel.test.mjs`). |
