# AppHeader

## For business

### Overview

AppHeader is the top area of every application page. It can show an announcement banner, the application's identity, search, the signed-in user and quick links on the first level, the main navigation on a second level, and breadcrumbs on a third level. Every element and every level is optional, and each level can stay visible while the page scrolls.

### When to use

- Use it once per application, as the top area of every page: identity, search, user, main navigation and breadcrumbs.
- Use TopNavigation, SearchBox, Breadcrumbs or Badge alone when the page has its own header layout.

### Key features

- Up to three optional levels: identity and tools; main navigation; breadcrumbs.
- Logo and name, environment label ("TEST"), search, notifications bell with a panel, help, settings, the user and sign in / sign out.
- An optional announcement banner above everything, closable by the user.
- Levels that stay visible while the page scrolls, without the page jumping.
- A "Skip to main content" link and a compact layout on phones.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| AppHeader styles (`appHeader.css`) | Always | Header layout and elements. |
| Button component and `button.css` | Sign in/out | Buttons. |
| Notification and `notification.css` | `notifications`, `user` | Bell with counter; the user's picture. |
| NotificationsPanel and `notificationsPanel.css` | `notifications.items` | Bell with a panel of the latest notifications. |
| Badge and `badge.css` | `user` | The user's name, role and picture. |
| Message and `message.css` | `announcement` | Announcement banner. |
| SearchBox and `searchBox.css` | `search` | Search. |
| TopNavigation and `topNavigation.css` | `navigation` | Second level. |
| Breadcrumbs, ActionMenu and their CSS | `breadcrumbs` | Third level. |
| Font Awesome icon library | Icons used | Icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application decides what the header shows (user, permissions, environment), performs search, sign-in/sign-out and notification handling, and places the SideNavigation (passing the menu host). An organisation switcher is not part of this version.

## For designers

### Structure

```text
div#{id}.ui-app-header.ui-app-header-bg-{surface|brand}[.ui-app-header-pinned]      (keeps the space while pinned)
└── header.ui-app-header-inner  aria-label="Application header"
    ├── a.ui-app-header-skip                                                  (skip link)
    ├── div.ui-app-header-level.ui-app-header-announcement[.ui-app-header-sticky] → Message (BANNER)
    ├── div.ui-app-header-level.ui-app-header-top[.ui-app-header-sticky]
    │   ├── div.ui-app-header-start: span.ui-app-header-menu-host, a.ui-app-header-brand (img.ui-app-header-logo, span.ui-app-header-name), span.ui-app-header-environment
    │   ├── div.ui-app-header-middle: div.ui-app-header-search-host → SearchBox
    │   └── div.ui-app-header-end: span.ui-app-header-notifications-host → Notification (bell + count), a.ui-app-header-icon-link (help, settings),
    │                              span.ui-app-header-user-host → Badge (picture, name, role, link), span.ui-app-header-auth-host → Button
    ├── div.ui-app-header-level.ui-app-header-navigation[.ui-app-header-sticky] → TopNavigation
    └── div.ui-app-header-level.ui-app-header-breadcrumbs[.ui-app-header-sticky] → Breadcrumbs
```

The first level is a row with start, middle and end zones; levels are separated by thin lines. The environment label is a small pill in the tone colours (info, success, warning, danger); the notifications bell is a Notification with a danger-coloured count; the user is a Badge (picture or initials, bold name, muted role). With the brand background both switch to light colours (`--c-on-accent`). When levels are pinned, the header gets a small shadow. With the brand background, the first level uses the accent colour with light text and secondary Buttons.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Background (first level) | Surface, brand | `ui-app-header-bg-surface`, `ui-app-header-bg-brand` |
| Environment tone | Info, success, warning, danger | `ui-app-header-tone-info`, `-success`, `-warning`, `-danger` |
| Sticky level | Per level | `ui-app-header-sticky` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Pinned | While the page scrolls under the sticky levels | `ui-app-header-pinned` |

### Styling contract

`appHeader.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-app-header-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-surface`: inner, skip
  - `--c-text`: inner
  - `--c-border`: inner, level
  - `--c-accent`: skip, top (bg brand)
  - `--c-info-soft`: tone info
  - `--c-info-text`: tone info
  - `--c-success-soft`: tone success
  - `--c-success-text`: tone success
  - `--c-warning-soft`: tone warning
  - `--c-warning-text`: tone warning
  - `--c-danger-soft`: tone danger
  - `--c-danger-text`: tone danger
  - `--c-surface-hover`: icon link (hover)
  - `--c-on-accent`: top (bg brand), icon link (bg brand + top + hover)
- Typography
  - `--font-ui`: app header
  - `--fw-ui`: app header
  - `--fw-ui-strong`: skip, name, environment
  - `--fs-block-title`: name
  - `--fs-caption`: environment
- Borders and corners
  - `--border-thin`: inner, level
  - `--radius-control`: skip, brand
  - `--radius-pill`: environment, icon link
- Shadows
  - `--shadow-sm`: inner (pinned)
- Sizes
  - `--icon-size-medium`: icon link

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: skip, top, environment
  - `--gap-inline-items`: skip, top, start, end, environment
  - `--workspace-gutter`: level (also narrow)
  - `--gap-block`: top, middle
  - `--space-sm-2`: navigation, breadcrumbs, logo
  - `--space-xl-1`: brand
  - `--space-sm-1`: environment
- Sizes
  - `--control-height`: top, logo, icon link
  - `--space-lg-1`: top, icon link
  - `--size-md-2`: middle, search host
  - `--size-md-1`: logo
  - `--size-md-4`: search host

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: skip (focus), brand (focus), icon link (focus)
  - `--focus-offset`: skip (focus), brand (focus), icon link (focus)

**Set by the component — don't change**

- Variables
  - `--ui-app-header-space`: height kept in the page while the header is pinned (measured)
  - `--ui-app-header-left`, `--ui-app-header-width`: position and width of the pinned header (measured)
  - `--page-sticky-offset`: on the page: height of the sticky levels; Message toasts and Table read it

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--c-accent`, `--c-on-accent`: user Badge and its marker on the brand background

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `appHeaderIndex.js`.
- Configure only the elements the application needs; everything is optional. Pass SearchBox, TopNavigation and Breadcrumbs options in `search`, `navigation` and `breadcrumbs` (their `id` is set by AppHeader).
- Render AppHeader once, above the page content, in a container that spans the page width; set `skipLinkTarget` to the id of the main content (`'#main'`).
- With SideNavigation, set `menuHost:true` and pass `header.getMenuHost()` as SideNavigation's `drawerToggleHost`.
- Update the header at runtime (`getAnnouncement().update(…)`, `setUser`, `setSignedIn`, `setNotificationCount`, `getTopNavigation().setCurrent(…)`, `getBreadcrumbs().update(…)`) instead of rendering it again.
- Keep sticky levels few (usually the first level, sometimes navigation) to leave room for content on small screens.
- Give the header a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- All texts are displayed as text; do not pass HTML. Build links from trusted routes only.
- Hiding elements does not secure anything: check permissions on the server.
- Keep the skip link and the header's landmark name.

### Example prompts

```text
Add an AppHeader with the logo and name "Orders", a TEST badge in the test environment, search for orders, the signed-in user's name and role linking to their profile, a settings shortcut and sign out; second level TopNavigation with Dashboard, Orders and Reports; third level breadcrumbs; keep the first two levels sticky.
```

## For developers

### Business analysis

> **Component**: the AppHeader itself. **Consumer**: the developer who configures the AppHeader in the application's code. **App**: the running application that uses the AppHeader; it provides the data, performs the actions and stores the changes.

**First level** (every element optional)

- Component displays the logo and the application name, linked to the home page. <!-- BA-01 -->
- Component displays an environment label, e.g. "TEST". <!-- BA-02 -->
- Component displays the search field. <!-- BA-03 -->
  - User types a search and presses Enter or the search button. <!-- BA-04 -->
  - Component reports the search to the App. <!-- BA-05 -->
  - App performs the search. <!-- BA-06 -->
- Component displays the notifications bell with a counter. <!-- BA-07 -->
  - User clicks the bell. <!-- BA-08 -->
  - Component opens the panel with the latest notifications, or reports the click to the App. <!-- BA-09 -->
- Component displays the help and settings shortcuts. <!-- BA-10 -->
- Component displays the signed-in user with a photo or initials, the name, the role and a marker, e.g. "Online", linked to the user's page. <!-- BA-11 -->
- Component displays "Sign in" or "Sign out". <!-- BA-12 -->
  - User clicks it. <!-- BA-13 -->
  - Component reports the request to the App. <!-- BA-14 -->
  - App performs the sign-in or sign-out. <!-- BA-15 -->
- Component displays a place for the side navigation's menu button on phones. <!-- BA-16 -->
- Consumer chooses a light or a brand-coloured first level. <!-- BA-17 -->

**Other levels** (optional)

- Component displays the main navigation on the second level. <!-- BA-18 -->
- Component displays the breadcrumbs on the third level. <!-- BA-19 -->

**Announcement** (optional)

- App provides an announcement, e.g. "Planned maintenance tonight at 22:00". <!-- BA-20 -->
  - Component displays it as a full-width banner above everything. <!-- BA-21 -->
- User clicks the close button of the announcement. <!-- BA-22 -->
  - Component reports the close to the App. <!-- BA-23 -->

**Scrolling**

- Consumer chooses which levels stay visible while the page scrolls. <!-- BA-24 -->
  - Component keeps those levels at the top and lets the others scroll away. <!-- BA-25 -->
  - Component keeps the page from jumping, and places other sticky elements, e.g. table headers, below the header. <!-- BA-26 -->

**Keyboard additions**

- Component displays a "Skip to main content" link as the first stop on the page. <!-- BA-27 -->

**Phones and narrow screens**

- Component hides the application name next to a logo, and the name and role of the user. <!-- BA-28 -->
- Component moves the search field to its own line. <!-- BA-29 -->

**Tooltips**

- Consumer chooses how the names of the help and settings links and the environment's description shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-30 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderAppHeader, DEFAULT_APP_HEADER_CONFIG, APP_HEADER_TOOLTIP_MODES, APP_HEADER_TONES, APP_HEADER_BACKGROUNDS } from './appHeaderIndex.js';

const header = renderAppHeader(container, config); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getAnnouncement()` | instance \| null | The announcement Message (`show()`, `hide()`, `update()`), e.g. to change its text or show it again. |
| `showAnnouncement(message)` | — | Shows any Message configuration (`{ type, text, title?, link?, … }`) in the announcement banner, replacing the current one; announced. The collector for other components' `externalMessage.onMessage` (e.g. a Form's success message). |
| `setUser(user)` | — | Shows, changes or removes (`null`) the user Badge. |
| `setSignedIn(signedIn)` | — | Switches the Button between "Sign in" and "Sign out". |
| `setNotificationCount(count)` | — | Updates the counter (0 hides it; above 99 shows "99+"). |
| `getMenuHost()` | Element \| null | Host for SideNavigation's menu Button. |
| `getUserBadge()` / `getNotifications()` | instance \| null | The user Badge (`setIndicator`, `setDescription`, …) and the bell Notification — or the NotificationsPanel (`setNotifications`, `addNotification`, …) when `notifications.items` is configured. |
| `getSearchBox()` / `getTopNavigation()` / `getBreadcrumbs()` | instance \| null | The composed components, for runtime updates. |
| `destroy()` | — | Removes listeners and child components, restores `--page-sticky-offset`, clears the container. |

### Configuration

Every option is optional; an element is shown only when configured.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `skipLinkTarget` | string | `''` | `'#main'` | Always | "Skip to main content" link to this target. |
| `menuHost` | boolean | `false` | — | Always | Adds the host for SideNavigation's menu Button (start of the first level). |
| `logo` | object | `null` | `{ src, alt }` | Always | Logo image; `alt` is used when there is no `appName` (`LOGO_ALT_MISSING`). |
| `appName` | string | `''` | Text | Always | Application name. |
| `homeHref` | string | `''` | URL | `logo` or `appName` | Makes logo and name a link to the home page. |
| `environment` | object | `null` | `{ label, description?, tone? }` | Always | Environment label, e.g. `{ label:'TEST', description:'Test environment' }`; tone default `WARNING`. |
| `announcement` | object | `null` | Message configuration (without `id` and `layout`) | Always | Banner above the header (Message `BANNER`), closable by default; when closed its level is removed and sticky heights are recalculated. |
| `search` | object | `null` | SearchBox configuration (without `id`) | Always | Search; `label` defaults to "Search", shown to screen readers only. |
| `notifications` | object | `null` | `{ count }` or NotificationsPanel configuration `{ items, maxItems?, … }` (without `id`) | Always | `{ count }`: a bell (Notification) with a count; clicks call `onNotifications`. With `items`: a NotificationsPanel — bell with the unread count and a panel of the latest notifications (see NotificationsPanel). |
| `help` / `settings` | object | `null` | `{ href, label? }` | Always | Icon links to help and to the application settings. |
| `user` | object | `null` | `{ name, role?, href?, avatar?, indicator? }` | Always | The user as a Badge: photo (`avatar` URL) or initials, name, role; `indicator` is a Notification indicator (e.g. `{ kind:'DOT', type:'SUCCESS', description:'Online' }`); a link to the user's page when `href` is set. |
| `auth` | object | `null` | `{ signedIn }` | Always | Sign in / Sign out Button (`onSignIn`, `onSignOut`). |
| `navigation` | object | `null` | TopNavigation configuration (without `id`) | Always | Second level. |
| `breadcrumbs` | object | `null` | Breadcrumbs configuration (without `id`) | Always | Third level. |
| `sticky` | object | all `false` | `{ announcement, top, navigation, breadcrumbs }` | Always | Levels that stay pinned at the top while scrolling; a level that is not configured is ignored. |
| `autoMeasure` | boolean | `true` | — | Always | Re-measures the header when a level changes height (see Sticky levels); `false` turns this off. Has an effect only when a level is sticky. |
| `background` | string | `'SURFACE'` | `SURFACE`, `BRAND` | Always | First-level background. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the names of the help and settings links and the environment's description shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). It is passed to the user Badge (the "Your profile and settings" hint is on AppHeader's own host around it), the notifications and the Breadcrumbs, and (as `TOOLTIP` only) to the icon buttons of the search, the navigation and the announcement, unless their own configuration sets `tooltipMode`. |
| `texts.*` | string | English defaults | Text | Always | Each is used when its element is shown: `header`, `skipLink`, `settings`, `help`, `notifications`, `notificationsCount` ("{count} new"), `signIn`, `signOut`, `userPage`. |
| `onSignIn` / `onSignOut` | function | `null` | `(instance) => {}` | `auth` | Sign in / Sign out Button callbacks. |
| `onNotifications` | function | `null` | `(instance) => {}` | `notifications` | Notifications Button callback; only for `notifications` `{ count }` (with `items` the NotificationsPanel handles clicks). |

### Sticky levels

Each level with `sticky:true` is pinned at the top once the first sticky level scrolls past the top of the viewport (at scroll position 0 nothing is pinned, so all levels are visible); the other levels then scroll away (levels below the pinned ones are hidden while pinned). The root keeps the header's full height, so content does not jump, and `--page-sticky-offset` is set to the pinned height.

With `autoMeasure` (default), AppHeader re-measures itself when a level changes height — e.g. `getBreadcrumbs().update()` switching to the narrow back link, `getSearchBox().setMessage()`, a wrapping navigation or late-loading fonts — at most once per animation frame. While pinned, only the visible sticky levels are re-measured (the offset and the reserved space follow them); a hidden level that changed is measured again when it reappears on unpinning. With `autoMeasure:false` the header is measured only on render, window resize, `setUser()` and announcement changes (the behaviour before this option). AppHeader does this itself because CSS `position:sticky` only works inside the element's parent, and the container is owned by the application.

### Callbacks

| Callback | Arguments | Fires when |
| --- | --- | --- |
| `onSignIn` / `onSignOut` | `(instance)` | The Sign in / Sign out Button is pressed (the application signs in or out and calls `setSignedIn`). |
| `onNotifications` | `(instance)` | The notifications Button is pressed. |
| `search.onSearch`, `navigation.onNavigate`, `breadcrumbs.onNavigate` | See SearchBox, TopNavigation, Breadcrumbs | Passed through to the composed components. |

### Errors

AppHeader has no user-facing errors. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `AppHeader "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `CONTENT_REQUIRED` | error | No element and no level configured. |
| `LOGO_ALT_MISSING` | warning | A logo without `alt` and without `appName`. |
| `BRAND_MENU_HOST` | warning | `BRAND` background with `menuHost`: SideNavigation's tertiary menu Button may be hard to see. |
| `INVALID_OPTION` | warning | Invalid tone or background; the default is used. |
| `OPTION_IGNORED` | warning | Sticky option for a level that is not configured; the removed `status` option (use `announcement`). |

### Accessibility

- A `<header>` landmark named "Application header"; the skip link is the first focusable element and becomes visible on focus.
- The announcement is a Message banner: read in place when present at load; announced when shown or updated later.
- The environment label has a spoken description; the notifications bell (Notification) includes the count in its name ("Notifications, 3 new"); the user Badge reads as one sentence ("Ana Pop, Administrator, Online"); icon links have names and tooltips; the user link has a tooltip ("Your profile and settings").
- Pinned levels keep their order and focus; hidden (non-sticky) levels are not reachable while pinned.

### Examples

```js
const header = renderAppHeader(headerHost,
{
    id:'app-header', skipLinkTarget:'#main', menuHost:true,
    logo:{ src:'/logo.svg', alt:'Orders' }, appName:'Orders', homeHref:'/',
    environment:isTest ? { label:'TEST', description:'Test environment' } : null,
    search:{ label:'Search orders', placeholder:'Search orders', searchMode:'ON_DEMAND', onSearch:( { query } ) => router.go(`/search?q=${encodeURIComponent(query)}`) },
    settings:{ href:'/settings' }, user:{ name:user.name, role:user.role, href:'/me', avatar:user.photo, indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } }, auth:{ signedIn:true },
    navigation:{ items:topItems, currentId, onNavigate:routeTo },
    breadcrumbs:{ items:path, onNavigate:routeTo },
    sticky:{ top:true, navigation:true },
    announcement:{ type:'INFO', text:'New: export to Excel is available.', onClose:() => rememberClosed('export-news') },
    onSignOut:() => auth.signOut()
});

renderSideNavigation(sideHost,{ id:'side-nav', items:sideItems, drawerToggleHost:header.getMenuHost() });
header.getAnnouncement()?.update({ type:'WARNING', text:'Maintenance tonight at 22:00' });
```

### Files

| File | Responsibility |
| --- | --- |
| `appHeaderIndex.js` | Public entry point; the only import surface. |
| `appHeaderConfig.js` | Defaults, normalization of the optional elements, developer validation. |
| `appHeaderComponent.js` | Composition of SearchBox, TopNavigation, Breadcrumbs and Buttons; runtime updates; pinning of sticky levels. |
| `appHeaderHTML.js` | Header, levels and element markup. |
| `appHeaderEvents.js` | Scroll and resize listeners for pinning. |
| `appHeaderErrors.js` | Developer error and warning catalog. |
| `appHeader.css` | Presentation. |
| `appHeaderTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/appHeader.test.mjs`). |
