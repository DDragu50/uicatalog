// appHeaderHTML.js
//
// GENERATED MARKUP.
// A placeholder root (keeps the header's space while levels are pinned) with the <header>: optional skip link, the
// announcement level (Message, BANNER),
// the top level (start: menu host, logo, application name, environment; middle: search; end:
// notifications, help, settings, user, sign in/out), the navigation level and the breadcrumbs level.
// Announcement (Message), search (SearchBox), notifications (Notification), user (Badge), navigation (TopNavigation),
// breadcrumbs (Breadcrumbs) and Buttons are rendered into their hosts by the coordinator.

// Escapes text inserted into generated HTML.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}


// Builds an icon link (help, settings).
function iconLinkHTML( link, fallbackLabel, icon, className, mode )
{
    if ( !link ) { return ''; }
    const label = link.label || fallbackLabel;
    return `<a class="ui-app-header-icon-link ${className}" href="${escapeHTML(link.href)}" aria-label="${escapeHTML(label)}"${hintAttribute(mode,label)}><i class="${icon}" aria-hidden="true"></i></a>`;
}

// Builds the top level (only the configured elements).
function buildTopHTML( config )
{
    const t = config.texts;
    const brandInner = `${config.logo ? `<img class="ui-app-header-logo" src="${escapeHTML(config.logo.src)}" alt="${escapeHTML(config.appName ? '' : config.logo.alt)}">` : ''}${config.appName ? `<span class="ui-app-header-name">${escapeHTML(config.appName)}</span>` : ''}`;
    const brand = config.logo || config.appName ? ( config.homeHref ? `<a class="ui-app-header-brand" href="${escapeHTML(config.homeHref)}">${brandInner}</a>` : `<span class="ui-app-header-brand">${brandInner}</span>` ) : '';
    const environment = config.environment ? `<span class="ui-app-header-environment ui-app-header-tone-${config.environment.tone.toLowerCase()}"${hintAttribute(config.tooltipMode,config.environment.description)}><span aria-hidden="true">${escapeHTML(config.environment.label)}</span><span class="ui-app-header-visually-hidden">${escapeHTML(config.environment.description)}</span></span>` : '';
    const start = `<div class="ui-app-header-start">${config.menuHost ? '<span class="ui-app-header-menu-host"></span>' : ''}${brand}${environment}</div>`;
    const middle = `<div class="ui-app-header-middle">${config.search ? '<div class="ui-app-header-search-host"></div>' : ''}</div>`;
    const notifications = config.notifications ? '<span class="ui-app-header-notifications-host"></span>' : '';
    const end = `<div class="ui-app-header-end">${notifications}${iconLinkHTML(config.help,t.help,'fa-solid fa-circle-question','ui-app-header-help',config.tooltipMode)}${iconLinkHTML(config.settings,t.settings,'fa-solid fa-gear','ui-app-header-settings',config.tooltipMode)}${config.user ? '<span class="ui-app-header-user-host"></span>' : ''}${config.auth ? '<span class="ui-app-header-auth-host"></span>' : ''}</div>`;
    return `<div class="ui-app-header-level ui-app-header-top${config.sticky.top ? ' ui-app-header-sticky' : ''}" data-level="top">${start}${middle}${end}</div>`;
}

// Builds the whole header.
export function buildAppHeaderHTML( config, showTop )
{
    const id = escapeHTML(config.id);
    const skip = config.skipLinkTarget ? `<a class="ui-app-header-skip" href="${escapeHTML(config.skipLinkTarget)}">${escapeHTML(config.texts.skipLink)}</a>` : '';
    const announcement = `<div class="ui-app-header-level ui-app-header-announcement${config.sticky.announcement ? ' ui-app-header-sticky' : ''}" data-level="announcement"${config.announcement ? '' : ' hidden'}><div class="ui-app-header-announcement-host"></div></div>`;   // always present: showAnnouncement() can fill it
    const navigation = config.navigation ? `<div class="ui-app-header-level ui-app-header-navigation${config.sticky.navigation ? ' ui-app-header-sticky' : ''}" data-level="navigation"><div class="ui-app-header-navigation-host"></div></div>` : '';
    const breadcrumbs = config.breadcrumbs ? `<div class="ui-app-header-level ui-app-header-breadcrumbs${config.sticky.breadcrumbs ? ' ui-app-header-sticky' : ''}" data-level="breadcrumbs"><div class="ui-app-header-breadcrumbs-host"></div></div>` : '';
    return `<div id="${id}" class="ui-app-header ui-app-header-bg-${config.background.toLowerCase()}"><header class="ui-app-header-inner" aria-label="${escapeHTML(config.texts.header)}">${skip}${announcement}${showTop ? buildTopHTML(config) : ''}${navigation}${breadcrumbs}</header></div>`;
}
