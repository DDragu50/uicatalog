// notificationsPanelHTML.js
//
// GENERATED MARKUP.
// Bell host (Notification), and the panel (non-modal dialog): header with title and "Mark all as read", the list of the
// latest notifications (links), an empty state, and the "See all" footer.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds the shell.
export function buildNotificationsPanelHTML( config )
{
    const id = escapeHTML(config.id), t = config.texts;
    const footer = config.seeAllHref || config.onSeeAll ? `<div class="ui-notifications-panel-footer"><a class="ui-notifications-panel-see-all" href="${escapeHTML(config.seeAllHref || '#')}">${escapeHTML(t.seeAll)}</a></div>` : '';
    return `<div id="${id}" class="ui-notifications-panel"><span class="ui-notifications-panel-bell-host"></span>`
        + `<div id="${id}-panel" class="ui-notifications-panel-popup" role="dialog" aria-labelledby="${id}-title" hidden>`
        + `<div class="ui-notifications-panel-header"><h2 id="${id}-title" class="ui-notifications-panel-title">${escapeHTML(t.title)}</h2><span class="ui-notifications-panel-mark-host"></span></div>`
        + '<ul class="ui-notifications-panel-list"></ul>'
        + footer
        + '</div></div>';
}

// Builds the visible notifications (at most maxItems), or the empty state.
export function buildItemsHTML( config, items )
{
    if ( !items.length ) { return `<li class="ui-notifications-panel-empty">${escapeHTML(config.texts.empty)}</li>`; }
    return items.slice(0,config.maxItems).map(item =>
    {
        const icon = `<span class="ui-notifications-panel-icon" aria-hidden="true">${item.icon ? `<i class="${escapeHTML(item.icon)}"></i>` : ''}</span>`;
        const text = `<span class="ui-notifications-panel-text">${escapeHTML(item.text)}${item.time ? `<span class="ui-notifications-panel-time">${escapeHTML(item.time)}</span>` : ''}${item.unread ? `<span class="ui-notifications-panel-visually-hidden">, ${escapeHTML(config.texts.unread)}</span>` : ''}</span>`;
        return `<li><a class="ui-notifications-panel-item${item.unread ? ' ui-notifications-panel-unread' : ''}" href="${escapeHTML(item.href || '#')}" data-item="${escapeHTML(item.id)}">${icon}${text}</a></li>`;
    }).join('');
}
