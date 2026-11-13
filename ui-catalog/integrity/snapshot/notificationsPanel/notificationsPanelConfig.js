// notificationsPanelConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, notification-item normalization and developer validation.

import { reportNotificationsPanelIssue } from './notificationsPanelErrors.js';

export const DEFAULT_NOTIFICATIONS_PANEL_CONFIG =
{
    id:'',
    tooltipMode:'TITLE',
    items:[],
    maxItems:5,
    markReadOnOpen:true,
    seeAllHref:'',
    bell:{},
    texts:{ label:'Notifications', title:'Notifications', unreadCount:'{count} unread', unread:'unread', markAllRead:'Mark all as read', seeAll:'See all notifications', empty:'You have no notifications.' },
    onOpen:null,
    onMarkAllRead:null,
    onSeeAll:null,
    onToggle:null
};

// Keeps valid CSS class tokens (icons).
const iconClass = value => String(value ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');

// Normalizes one notification { id, text, time?, icon?, href?, unread? }; null when invalid.
export function normalizeItem( panelId, item, index )
{
    const id = String(item?.id ?? '').trim(), text = String(item?.text ?? '').trim();
    if ( !id || !text ) { reportNotificationsPanelIssue('INVALID_ITEM',{ id:panelId, value:index }); return null; }
    return { id, text, time:String(item.time ?? '').trim(), icon:iconClass(item.icon), href:String(item.href ?? '').trim(), unread:Boolean(item.unread) };
}

// Normalizes a list of notifications (order kept as given: the application decides it, usually newest first).
export function normalizeItems( panelId, items )
{
    const seen = new Set();
    return ( Array.isArray(items) ? items : [] ).map(( item, index ) => normalizeItem(panelId,item,index)).filter(item =>
    {
        if ( !item ) { return false; }
        if ( seen.has(item.id) ) { reportNotificationsPanelIssue('DUPLICATE_ITEM_ID',{ id:panelId, value:item.id }); return false; }
        seen.add(item.id);
        return true;
    });
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_NOTIFICATIONS_PANEL_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Produces the normalized, immutable configuration consumed by NotificationsPanel.
function mergeNotificationsPanelConfigBase( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const rawMax = userConfig.maxItems;
    const maxItems = rawMax === undefined || rawMax === null || rawMax === '' ? DEFAULT_NOTIFICATIONS_PANEL_CONFIG.maxItems : Number.isInteger(Number(rawMax)) && Number(rawMax) >= 1 ? Number(rawMax) : ( reportNotificationsPanelIssue('INVALID_OPTION',{ id, key:'maxItems', value:rawMax, fallback:DEFAULT_NOTIFICATIONS_PANEL_CONFIG.maxItems }), DEFAULT_NOTIFICATIONS_PANEL_CONFIG.maxItems );
    const fn = key => ( typeof userConfig[key] === 'function' ? userConfig[key] : null );
    return Object.freeze({
        id,
        items:normalizeItems(id,userConfig.items),
        maxItems,
        markReadOnOpen:Boolean(userConfig.markReadOnOpen ?? DEFAULT_NOTIFICATIONS_PANEL_CONFIG.markReadOnOpen),
        seeAllHref:String(userConfig.seeAllHref ?? '').trim(),
        bell:userConfig.bell && typeof userConfig.bell === 'object' ? { ...userConfig.bell } : {},
        texts:normalizeTexts(userConfig.texts),
        onOpen:fn('onOpen'), onMarkAllRead:fn('onMarkAllRead'), onSeeAll:fn('onSeeAll'), onToggle:fn('onToggle')
    });
}


// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const NOTIFICATIONS_PANEL_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeNotificationsPanelConfig( userConfig = {} )
{
    const base = mergeNotificationsPanelConfigBase(userConfig);
    const value = userConfig?.tooltipMode, given = value !== undefined && value !== null && value !== '';
    const tooltipMode = !given ? DEFAULT_NOTIFICATIONS_PANEL_CONFIG.tooltipMode : NOTIFICATIONS_PANEL_TOOLTIP_MODES.includes(String(value).trim().toUpperCase()) ? String(value).trim().toUpperCase()
        : ( reportNotificationsPanelIssue('INVALID_OPTION',{ id:base.id, key:'tooltipMode', value, fallback:DEFAULT_NOTIFICATIONS_PANEL_CONFIG.tooltipMode }), DEFAULT_NOTIFICATIONS_PANEL_CONFIG.tooltipMode );
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_NOTIFICATIONS_PANEL_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateNotificationsPanelConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportNotificationsPanelIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportNotificationsPanelIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportNotificationsPanelIssue('DUPLICATE_ID',{ id }); }
    return null;
}
