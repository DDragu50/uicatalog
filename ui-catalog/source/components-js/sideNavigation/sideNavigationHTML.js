// sideNavigationHTML.js
//
// GENERATED MARKUP.
// Navigation shell (header with the rail/drawer Button hosts, optional search, scroll area, flyout popover) and
// the item tree: links, parents (link + expand button, or a row button without own page), groups, separators.
// DOM ids are generated per instance ({navId}-n{number}); item ids stay in data-item.

// Escapes text inserted into generated HTML.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds the shell.
export function buildSideNavigationHTML( config, showSearch )
{
    const id = escapeHTML(config.id);
    const classes = [ 'ui-side-nav', `ui-side-nav-level-${config.levelStyle.toLowerCase().replace(/_/g,'-')}`, `ui-side-nav-indicator-${config.expandIndicator.toLowerCase().replace(/_/g,'-')}`, `ui-side-nav-radius-${config.cornerRadius.toLowerCase()}` ].join(' ');
    const search = showSearch ? `<div class="ui-side-nav-search"><input id="${id}-search" class="ui-side-nav-search-input" type="search" autocomplete="off" aria-label="${escapeHTML(config.texts.search)}" placeholder="${escapeHTML(config.texts.search)}"></div>` : '';
    return `<nav id="${id}" class="${classes}" aria-label="${escapeHTML(config.texts.navigation)}">`
        + '<div class="ui-side-nav-header"><span class="ui-side-nav-rail-host"></span><span class="ui-side-nav-close-host"></span></div>'
        + search
        + `<div class="ui-side-nav-scroll"><ul class="ui-side-nav-list ui-side-nav-root"></ul><div class="ui-side-nav-no-results"></div></div>`
        + `<div id="${id}-flyout" class="ui-side-nav-flyout" popover="manual" role="group"></div>`
        + '</nav><div class="ui-side-nav-overlay" hidden></div>';
}

// Builds the visual start of an entry: the icon, or an empty space of the same width (keeps labels aligned).
function buildIconHTML( item )
{
    return item.icon ? `<span class="ui-side-nav-icon" aria-hidden="true"><i class="${escapeHTML(item.icon)}"></i></span>` : '<span class="ui-side-nav-icon ui-side-nav-initial" aria-hidden="true"></span>';
}

// Builds the label, badge and external-link hint.
function buildContentHTML( config, item )
{
    const badge = item.badge ? `<span class="ui-side-nav-badge">${escapeHTML(item.badge)}</span>` : '';
    const external = item.external ? `<span class="ui-side-nav-external" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></span><span class="ui-side-nav-visually-hidden"> ${escapeHTML(config.texts.newTab)}</span>` : '';
    return `${buildIconHTML(item)}<span class="ui-side-nav-label">${escapeHTML(item.label)}</span>${badge}${external}`;
}

// Builds a list of entries; view = { domId(item), expanded(id), currentId, flat } (flat: all open, no toggles — flyout).
// expandIndicator PLUS_MINUS (main list only): the open/close sign stands before the icon — inside the parent button, or
// as the separate toggle placed before the link (so the keyboard order follows the visual order); other rows get an
// empty space of the same width, so icons and labels stay aligned.
export function buildItemsHTML( config, items, view, level = 0 )
{
    return items.map(item =>
    {
        if ( item.type === 'SEPARATOR' ) { return '<li class="ui-side-nav-separator" role="separator"></li>'; }
        if ( item.type === 'GROUP' )
        {
            const groupId = `${view.domId(item)}`;
            return `<li class="ui-side-nav-group"><span id="${groupId}" class="ui-side-nav-group-label">${escapeHTML(item.label)}</span><ul class="ui-side-nav-list" aria-labelledby="${groupId}">${buildItemsHTML(config,item.children,view,level)}</ul></li>`;
        }
        const domId = view.domId(item), hasChildren = item.children.length > 0, open = view.flat || view.expanded(item.id), current = item.id === view.currentId;
        const plusMinus = config.expandIndicator === 'PLUS_MINUS' && !view.flat;
        const sign = '<span class="ui-side-nav-sign" aria-hidden="true"></span>', space = plusMinus ? '<span class="ui-side-nav-sign-space" aria-hidden="true"></span>' : '';
        const content = buildContentHTML(config,item);
        const chevron = '<span class="ui-side-nav-chevron" aria-hidden="true"></span>';
        const toggleName = escapeHTML(( open ? config.texts.collapse : config.texts.expand ).replace('{label}',item.label));
        let main;
        if ( item.disabled ) { main = `<span class="ui-side-nav-link ui-side-nav-disabled" aria-disabled="true">${space}${content}</span>`; }
        else if ( item.href ) { main = `<a class="ui-side-nav-link" href="${escapeHTML(item.href)}" data-item="${escapeHTML(item.id)}"${current ? ' aria-current="page"' : ''}${item.external ? ' target="_blank" rel="noopener"' : ''}>${hasChildren && plusMinus ? '' : space}${content}</a>`; }
        else if ( hasChildren && !view.flat ) { main = `<button type="button" class="ui-side-nav-link ui-side-nav-parent" data-toggle="${escapeHTML(item.id)}" aria-expanded="${open}" aria-controls="${domId}-children">${plusMinus ? `${sign}${content}` : `${content}${chevron}`}</button>`; }
        else { main = `<span class="ui-side-nav-link ui-side-nav-heading">${space}${content}</span>`; }
        const toggle = hasChildren && item.href && !item.disabled && !view.flat ? `<button type="button" class="ui-side-nav-toggle" data-toggle="${escapeHTML(item.id)}" aria-expanded="${open}" aria-controls="${domId}-children" aria-label="${toggleName}">${plusMinus ? sign : chevron}</button>` : '';
        const children = hasChildren ? `<div id="${domId}-children" class="ui-side-nav-children${open ? ' ui-side-nav-children-open' : ''}"><ul class="ui-side-nav-list">${buildItemsHTML(config,item.children,view,level + 1)}</ul></div>` : '';
        return `<li class="ui-side-nav-item" data-item-row="${escapeHTML(item.id)}" style="--ui-side-nav-level:${level}"><div class="ui-side-nav-row${current ? ' ui-side-nav-current' : ''}${hasChildren ? ' ui-side-nav-has-children' : ''}" data-row="${escapeHTML(item.id)}" title="">${plusMinus ? `${toggle}${main}` : `${main}${toggle}`}</div>${children}</li>`;
    }).join('');
}
