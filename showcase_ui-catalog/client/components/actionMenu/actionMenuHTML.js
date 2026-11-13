// actionMenuHTML.js
//
// GENERATED MARKUP.
// Trigger host (Button) and a popover menu (role="menu") of menuitems: buttons for actions, links for navigation.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds one menu item (or separator).
function buildItemHTML( item )
{
    if ( item.type === 'SEPARATOR' ) { return '<li class="ui-action-menu-separator" role="separator"></li>'; }
    const classes = `ui-action-menu-item${item.danger ? ' ui-action-menu-danger' : ''}`;
    const icon = item.icon ? `<span class="ui-action-menu-icon" aria-hidden="true"><i class="${escapeHTML(item.icon)}"></i></span>` : '<span class="ui-action-menu-icon" aria-hidden="true"></span>';
    const content = `${icon}<span class="ui-action-menu-label">${escapeHTML(item.label)}</span>`;
    const common = `class="${classes}" role="menuitem" tabindex="-1" data-key="${escapeHTML(item.key)}"${item.disabled ? ' aria-disabled="true"' : ''}`;
    const element = item.type === 'LINK'
        ? `<a ${common} href="${escapeHTML(item.href)}"${item.target ? ` target="${escapeHTML(item.target)}" rel="noopener"` : ''}>${content}</a>`
        : `<button type="button" ${common}>${content}</button>`;
    return `<li role="none">${element}</li>`;
}

// Builds the trigger host and the menu popover.
export function buildActionMenuHTML( config )
{
    const id = escapeHTML(config.id);
    return `<span class="ui-action-menu"><span class="ui-action-menu-trigger-host"></span><ul id="${id}-menu" class="ui-action-menu-list" role="menu" aria-labelledby="${id}" popover="manual">${config.items.map(buildItemHTML).join('')}</ul></span>`;
}
