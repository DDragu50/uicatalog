// appHeaderIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports AppHeader only from this file.
//
// renderAppHeader(container, config)
//   Renders the application header and returns { id, setUser, setSignedIn, setNotificationCount,
//   getMenuHost, getAnnouncement, getSearchBox, getTopNavigation, getBreadcrumbs, destroy }, or null after a developer error.
//
// Every element is optional and shown only when configured. Announcement: a BANNER Message above the header.
// Level 1: menu host, logo, application name, environment badge, search (SearchBox), notifications, help, settings, user, sign in/out.
// Level 2: navigation (TopNavigation). Level 3: breadcrumbs (Breadcrumbs). Each level can be sticky
// (config.sticky.announcement / .top / .navigation / .breadcrumbs); pinned levels publish their height as --page-sticky-offset.
//
// Everything not exported here is internal implementation.

export { renderAppHeader } from './appHeaderComponent.js';
export { DEFAULT_APP_HEADER_CONFIG, APP_HEADER_TOOLTIP_MODES, APP_HEADER_TONES, APP_HEADER_BACKGROUNDS } from './appHeaderConfig.js';
