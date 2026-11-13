// notificationsPanelComponent.js
//
// COMPONENT COORDINATOR.
// A bell (Notification with the unread count) that opens a panel (under the bell, aligned to its end; moved so it stays
// inside the window) with the latest notifications (at most maxItems, in the
// order the application gives them), unread ones highlighted; opening one marks it as read (markReadOnOpen) and reports
// it; "Mark all as read" and "See all" are reported too. The application loads, stores and navigates; the component
// only shows and reports. Composes Notification and Button.

import { mergeNotificationsPanelConfig, validateNotificationsPanelConfig, normalizeItems, normalizeItem } from './notificationsPanelConfig.js';
import { buildNotificationsPanelHTML, buildItemsHTML } from './notificationsPanelHTML.js';
import { registerNotificationsPanelEvents } from './notificationsPanelEvents.js';
import { reportNotificationsPanelIssue } from './notificationsPanelErrors.js';
import { renderNotification } from '../notification/notificationIndex.js';
import { renderButton } from '../button/buttonIndex.js';

// Keeps an open popup inside the window. The popup is placed by its stylesheet (position:absolute, under the element
// it is positioned in, aligned to that element's start or end); this moves it to the other alignment when it does not
// fit on its side of the window, above the element when there is no room below (and more room above), keeps it inside
// the window as a last resort and limits its height when neither side has room. Called on open, scroll and resize.
function fitPopupInWindow( popup, alignEnd )
{
    const GAP = 8;
    [ 'left', 'right', 'top', 'bottom', 'max-block-size' ].forEach(property => popup.style.removeProperty(property));
    const parent = popup.offsetParent;
    if ( !parent || popup.hidden ) { return; }
    const anchor = parent.getBoundingClientRect(), box = popup.getBoundingClientRect(), style = getComputedStyle(popup);
    const marginTop = parseFloat(style.marginTop) || 0, marginLeft = parseFloat(style.marginLeft) || 0;
    const originLeft = anchor.left + parent.clientLeft, originTop = anchor.top + parent.clientTop;
    const width = box.width, height = box.height, gap = Math.max(0,box.top - anchor.bottom);
    const rtl = style.direction === 'rtl';
    const endAligned = rtl ? anchor.left : anchor.right - width, startAligned = rtl ? anchor.right - width : anchor.left;
    const fits = value => value >= GAP && value + width <= window.innerWidth - GAP;
    const [ preferred, other ] = alignEnd ? [ endAligned, startAligned ] : [ startAligned, endAligned ];
    const left = Math.max(GAP,Math.min(fits(preferred) ? preferred : fits(other) ? other : preferred,window.innerWidth - width - GAP));
    const below = window.innerHeight - anchor.bottom - gap - GAP, above = anchor.top - gap - GAP;
    const up = height > below && above > below, room = Math.max(0,up ? above : below);
    const frame = style.boxSizing === 'border-box' ? 0 : height - parseFloat(style.height);
    if ( height > room ) { popup.style.setProperty('max-block-size',`${Math.max(0,room - frame)}px`); }
    const top = up ? anchor.top - gap - Math.min(height,room) : anchor.bottom + gap;
    popup.style.setProperty('left',`${left - originLeft - marginLeft}px`);
    popup.style.setProperty('right','auto');
    popup.style.setProperty('top',`${top - originTop - marginTop}px`);
    popup.style.setProperty('bottom','auto');
}

// Renders a NotificationsPanel and returns its runtime instance, or null after a developer error.
export function renderNotificationsPanel( container, config )
{
    if ( !container ) { reportNotificationsPanelIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeNotificationsPanelConfig(config);
    if ( validateNotificationsPanelConfig(merged) ) { return null; }

    container.innerHTML = buildNotificationsPanelHTML(merged);
    const root = container.querySelector('.ui-notifications-panel');
    const popup = root.querySelector('.ui-notifications-panel-popup');
    const list = root.querySelector('.ui-notifications-panel-list');
    const state = { items:merged.items, open:false };
    let bell = null, markButton = null, controller = null, instance = null;

    const unreadCount = () => state.items.filter(item => item.unread).length;

    // Redraws the list, the bell count and the "Mark all as read" state.
    function draw()
    {
        list.innerHTML = buildItemsHTML(merged,state.items);
        const unread = unreadCount();
        bell?.setIndicator({ kind:'COUNT', value:unread, description:unread ? merged.texts.unreadCount.replace('{count}',String(unread > 99 ? '99+' : unread)) : '' });
        markButton?.setDisabled(unread === 0);
    }

    // Opens or closes the panel; opening moves focus to the first notification, closing back to the bell.
    function setOpen( open, returnFocus = false )
    {
        if ( state.open === Boolean(open) ) { return; }
        state.open = Boolean(open);
        popup.hidden = !state.open;
        fitPopupInWindow(popup,true);
        bell?.getElement().setAttribute('aria-expanded',String(state.open));
        if ( state.open ) { ( list.querySelector('a') ?? popup.querySelector('button:not([disabled]), a') )?.focus(); }
        else if ( returnFocus ) { bell?.getElement().focus(); }
        merged.onToggle?.(state.open,instance);
    }

    // A notification was chosen: marked as read (markReadOnOpen), reported; the application navigates (or prevents it).
    function openItem( id, event )
    {
        const item = state.items.find(entry => entry.id === id);
        if ( !item ) { return; }
        if ( merged.markReadOnOpen ) { item.unread = false; }
        merged.onOpen?.({ ...item },event,instance);
        draw();
        setOpen(false,!item.href || event.defaultPrevented);
    }

    // Marks every notification as read and reports it.
    function markAllRead()
    {
        state.items.forEach(item => { item.unread = false; });
        draw();
        merged.onMarkAllRead?.(instance);
        list.querySelector('a')?.focus();
    }

    instance =
    {
        id:merged.id,
        // Replaces the notifications (order as given).
        setNotifications:( items ) => { state.items = normalizeItems(merged.id,items); draw(); },
        // Adds a notification at the top (e.g. pushed by the server).
        addNotification:( item ) => { const next = normalizeItem(merged.id,item,0); if ( next ) { state.items = [ next, ...state.items.filter(entry => entry.id !== next.id) ]; draw(); } },
        // Marks one notification as read (no callback).
        markRead:( id ) => { const item = state.items.find(entry => entry.id === String(id)); if ( item ) { item.unread = false; draw(); } },
        // Marks all notifications as read (no callback).
        markAllRead:() => { state.items.forEach(item => { item.unread = false; }); draw(); },
        // Returns the number of unread notifications.
        getUnreadCount:() => unreadCount(),
        // Returns copies of the notifications.
        getNotifications:() => state.items.map(item => ({ ...item })),
        // Opens or closes the panel.
        open:() => setOpen(true), close:() => setOpen(false),
        // Returns the bell Notification (e.g. for its colours).
        getBell:() => bell,
        // Removes listeners and child components, then clears the container.
        destroy:() => { controller?.abort(); bell?.destroy(); markButton?.destroy(); container.innerHTML = ''; }
    };

    bell = renderNotification(root.querySelector('.ui-notifications-panel-bell-host'),{ icon:'fa-solid fa-bell', label:merged.texts.label, tooltipMode:merged.tooltipMode, ...merged.bell, id:`${merged.id}-bell`, clickable:true },() => setOpen(!state.open));
    bell?.getElement().setAttribute('aria-haspopup','dialog');
    bell?.getElement().setAttribute('aria-controls',popup.id);
    bell?.getElement().setAttribute('aria-expanded','false');
    markButton = renderButton(root.querySelector('.ui-notifications-panel-mark-host'),{ id:`${merged.id}-mark-all`, label:merged.texts.markAllRead, hierarchy:'TERTIARY', size:'SMALL' },() => markAllRead());
    controller = registerNotificationsPanelEvents(root,
    {
        onItem:openItem,
        onSeeAll:event => { if ( !merged.seeAllHref ) { event.preventDefault(); } merged.onSeeAll?.(event,instance); setOpen(false,!merged.seeAllHref); },
        onEscape:event => { if ( state.open ) { event.preventDefault(); setOpen(false,true); } },
        onLeave:() => setOpen(false),
        onReposition:event => { if ( state.open && !popup.contains(event.target) ) { fitPopupInWindow(popup,true); } }
    });
    draw();
    return instance;
}
