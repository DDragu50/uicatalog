// appHeaderConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation. Every element is optional; an element is
// shown when its option is given. Search, navigation and breadcrumbs pass their own component configuration.

import { reportAppHeaderIssue } from './appHeaderErrors.js';

export const APP_HEADER_TONES = [ 'INFO', 'SUCCESS', 'WARNING', 'DANGER' ];
export const APP_HEADER_BACKGROUNDS = [ 'SURFACE', 'BRAND' ];

export const DEFAULT_APP_HEADER_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    skipLinkTarget:'',
    menuHost:false,
    logo:null,
    appName:'',
    homeHref:'',
    environment:null,
    announcement:null,
    search:null,
    notifications:null,
    help:null,
    settings:null,
    user:null,
    auth:null,
    navigation:null,
    breadcrumbs:null,
    sticky:{ announcement:false, top:false, navigation:false, breadcrumbs:false },
    autoMeasure:true,
    background:'SURFACE',
    texts:{ header:'Application header', skipLink:'Skip to main content', settings:'Application settings', help:'Help', notifications:'Notifications', notificationsCount:'{count} new', signIn:'Sign in', signOut:'Sign out', userPage:'Your profile and settings' },
    onSignIn:null,
    onSignOut:null,
    onNotifications:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase();
    if ( allowed.includes(normalized) ) { return normalized; }
    reportAppHeaderIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a trimmed string.
const text = value => String(value ?? '').trim();

// Returns a plain object option or null.
const objectOrNull = value => ( value && typeof value === 'object' && !Array.isArray(value) ? value : null );

// Normalizes the user { name, role?, href?, avatar?, indicator? } (shown as a Badge; indicator = Notification indicator, e.g. "Online").
export function normalizeUser( user )
{
    const source = objectOrNull(user);
    return source && text(source.name) ? { name:text(source.name), role:text(source.role), href:text(source.href), avatar:text(source.avatar), indicator:objectOrNull(source.indicator) } : null;
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_APP_HEADER_CONFIG.texts).map(( [ key, fallback ] ) => [ key, text(source[key]) || fallback ]));
}

// Produces the normalized, immutable configuration consumed by AppHeader.
function mergeAppHeaderConfigBase( userConfig = {} )
{
    const id = text(userConfig.id);
    const logo = objectOrNull(userConfig.logo) && text(userConfig.logo.src) ? { src:text(userConfig.logo.src), alt:text(userConfig.logo.alt) } : null;
    const link = value => ( objectOrNull(value) && text(value.href) ? { href:text(value.href), label:text(value.label) } : null );
    const environment = objectOrNull(userConfig.environment) && text(userConfig.environment.label) ? { label:text(userConfig.environment.label), description:text(userConfig.environment.description) || text(userConfig.environment.label), tone:normalizeEnum(id,'environment.tone',userConfig.environment.tone,APP_HEADER_TONES,'WARNING') } : null;
    const auth = objectOrNull(userConfig.auth) ? { signedIn:Boolean(userConfig.auth.signedIn) } : null;
    // notifications: { count } = bell only; { items, … } = NotificationsPanel (bell + list of the latest notifications).
    const notificationsSource = objectOrNull(userConfig.notifications);
    const notifications = notificationsSource ? ( Array.isArray(notificationsSource.items) ? { panel:{ ...notificationsSource }, count:0 } : { panel:null, count:Math.max(0,Math.trunc(Number(notificationsSource.count) || 0)) } ) : null;
    const sticky = objectOrNull(userConfig.sticky) ?? {};
    const config =
    {
        id,
        skipLinkTarget:text(userConfig.skipLinkTarget),
        menuHost:Boolean(userConfig.menuHost),
        logo,
        appName:text(userConfig.appName),
        homeHref:text(userConfig.homeHref),
        environment,
        announcement:objectOrNull(userConfig.announcement),
        search:objectOrNull(userConfig.search),
        notifications,
        help:link(userConfig.help),
        settings:link(userConfig.settings),
        user:normalizeUser(userConfig.user),
        auth,
        navigation:objectOrNull(userConfig.navigation),
        breadcrumbs:objectOrNull(userConfig.breadcrumbs),
        sticky:{ announcement:Boolean(sticky.announcement), top:Boolean(sticky.top), navigation:Boolean(sticky.navigation), breadcrumbs:Boolean(sticky.breadcrumbs) },
        autoMeasure:userConfig.autoMeasure === undefined ? DEFAULT_APP_HEADER_CONFIG.autoMeasure : Boolean(userConfig.autoMeasure),
        background:normalizeEnum(id,'background',userConfig.background,APP_HEADER_BACKGROUNDS,DEFAULT_APP_HEADER_CONFIG.background),
        texts:normalizeTexts(userConfig.texts),
        onSignIn:typeof userConfig.onSignIn === 'function' ? userConfig.onSignIn : null,
        onSignOut:typeof userConfig.onSignOut === 'function' ? userConfig.onSignOut : null,
        onNotifications:typeof userConfig.onNotifications === 'function' ? userConfig.onNotifications : null
    };
    if ( logo && !logo.alt && !config.appName ) { reportAppHeaderIssue('LOGO_ALT_MISSING',{ id }); }
    if ( config.background === 'BRAND' && config.menuHost ) { reportAppHeaderIssue('BRAND_MENU_HOST',{ id }); }
    if ( userConfig.status !== undefined ) { reportAppHeaderIssue('OPTION_IGNORED',{ id, key:'status', condition:'the status message was replaced by announcement (a BANNER Message)' }); }
    if ( sticky.announcement && !config.announcement ) { reportAppHeaderIssue('OPTION_IGNORED',{ id, key:'sticky.announcement', condition:'there is no announcement' }); }
    if ( sticky.navigation && !config.navigation ) { reportAppHeaderIssue('OPTION_IGNORED',{ id, key:'sticky.navigation', condition:'there is no navigation' }); }
    if ( sticky.breadcrumbs && !config.breadcrumbs ) { reportAppHeaderIssue('OPTION_IGNORED',{ id, key:'sticky.breadcrumbs', condition:'there are no breadcrumbs' }); }
    return Object.freeze(config);
}

// Returns whether the top level has any content.
export const hasTopLevel = config => Boolean(config.menuHost || config.logo || config.appName || config.environment || config.search || config.notifications || config.help || config.settings || config.user || config.auth);


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const APP_HEADER_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeAppHeaderConfig( userConfig = {} )
{
    const base = mergeAppHeaderConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,APP_HEADER_TOOLTIP_MODES,DEFAULT_APP_HEADER_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_APP_HEADER_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateAppHeaderConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportAppHeaderIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportAppHeaderIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportAppHeaderIssue('DUPLICATE_ID',{ id }); }
    if ( !hasTopLevel(config) && !config.navigation && !config.breadcrumbs && !config.announcement ) { return reportAppHeaderIssue('CONTENT_REQUIRED',{ id }); }
    return null;
}
