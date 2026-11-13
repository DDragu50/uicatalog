// topNavigationHTML.js
//
// GENERATED MARKUP.
// The bar (top items with LIST or MEGA dropdown panels), the "More" item for top items that do not fit, and the
// narrow-screen panel (the whole tree as expandable sections). DOM ids are generated per instance.

// Escapes text inserted into generated HTML.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds icon, label, optional description (mega), badge and external hint of an entry.
function contentHTML( config, item, withDescription )
{
    const icon = item.icon ? `<span class="ui-top-nav-icon" aria-hidden="true"><i class="${escapeHTML(item.icon)}"></i></span>` : '';
    const description = withDescription && item.description ? `<span class="ui-top-nav-description">${escapeHTML(item.description)}</span>` : '';
    const badge = item.badge ? `<span class="ui-top-nav-badge">${escapeHTML(item.badge)}</span>` : '';
    const external = item.external ? `<span class="ui-top-nav-external" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></span><span class="ui-top-nav-visually-hidden"> ${escapeHTML(config.texts.newTab)}</span>` : '';
    return `${icon}<span class="ui-top-nav-text"><span class="ui-top-nav-label">${escapeHTML(item.label)}</span>${description}</span>${badge}${external}`;
}

// Builds a link (or a disabled entry) for any level.
export function linkHTML( config, item, currentId, className, withDescription = false )
{
    if ( item.disabled ) { return `<span class="${className} ui-top-nav-disabled" aria-disabled="true">${contentHTML(config,item,withDescription)}</span>`; }
    const current = item.id === currentId ? ' aria-current="page"' : '';
    return `<a class="${className}" href="${escapeHTML(item.href || '#')}" data-item="${escapeHTML(item.id)}"${current}${item.external ? ' target="_blank" rel="noopener"' : ''}>${contentHTML(config,item,withDescription)}</a>`;
}

// Builds dropdown entries (links, group headings with their links, separators) as list items.
function entriesHTML( config, entries, currentId, groupIdBase )
{
    return entries.map(( entry, index ) =>
    {
        if ( entry.type === 'SEPARATOR' ) { return '<li class="ui-top-nav-separator" role="separator"></li>'; }
        if ( entry.type === 'GROUP' ) { const headingId = `${groupIdBase}-g${index}`; return `<li class="ui-top-nav-group"><span id="${headingId}" class="ui-top-nav-group-label">${escapeHTML(entry.label)}</span><ul class="ui-top-nav-panel-list" aria-labelledby="${headingId}">${entry.children.map(child => `<li>${linkHTML(config,child,currentId,'ui-top-nav-entry')}</li>`).join('')}</ul></li>`; }
        return `<li>${linkHTML(config,entry,currentId,'ui-top-nav-entry')}</li>`;
    }).join('');
}

// Builds a dropdown panel: LIST (one column) or MEGA (a column per group, loose entries first).
function panelHTML( config, top, panelId, currentId )
{
    if ( top.panel === 'MEGA' )
    {
        const loose = top.children.filter(entry => entry.type === 'ITEM');
        const groups = top.children.filter(entry => entry.type === 'GROUP');
        const column = ( label, entries, index ) => `<div class="ui-top-nav-column">${label ? `<p id="${panelId}-c${index}" class="ui-top-nav-group-label">${escapeHTML(label)}</p>` : ''}<ul class="ui-top-nav-panel-list"${label ? ` aria-labelledby="${panelId}-c${index}"` : ''}>${entries.map(entry => `<li>${linkHTML(config,entry,currentId,'ui-top-nav-entry',true)}</li>`).join('')}</ul></div>`;
        return `<div id="${panelId}" class="ui-top-nav-panel ui-top-nav-panel-mega" hidden>${loose.length ? column('',loose,0) : ''}${groups.map(( group, index ) => column(group.label,group.children,index + 1)).join('')}</div>`;
    }
    return `<div id="${panelId}" class="ui-top-nav-panel ui-top-nav-panel-list-style" hidden><ul class="ui-top-nav-panel-list">${entriesHTML(config,top.children,currentId,panelId)}</ul></div>`;
}

// Returns whether a top item is, or contains, the current page.
export function isCurrentBranch( top, currentId ) { return top.id === currentId || top.children.some(entry => entry.id === currentId || ( entry.type === 'GROUP' && entry.children.some(child => child.id === currentId) )); }

// Builds the bar with all top items and the (initially hidden) "More" item.
export function buildBarHTML( config, items, currentId )
{
    const id = escapeHTML(config.id);
    const tops = items.map(( top, index ) =>
    {
        const panelId = `${id}-p${index}`, hasPanel = top.children.length > 0, branch = isCurrentBranch(top,currentId);
        const chevron = '<span class="ui-top-nav-chevron" aria-hidden="true"></span>';
        let main;
        if ( hasPanel && !top.href && !top.disabled ) { main = `<button type="button" class="ui-top-nav-link ui-top-nav-trigger" data-toggle="${panelId}" aria-expanded="false" aria-controls="${panelId}">${contentHTML(config,top,false)}${chevron}</button>`; }
        else { main = linkHTML(config,top,currentId,'ui-top-nav-link') + ( hasPanel && !top.disabled ? `<button type="button" class="ui-top-nav-toggle" data-toggle="${panelId}" aria-expanded="false" aria-controls="${panelId}" aria-label="${escapeHTML(config.texts.subMenu.replace('{label}',top.label))}">${chevron}</button>` : '' ); }
        return `<li class="ui-top-nav-item${branch ? ' ui-top-nav-current-branch' : ''}" data-top="${index}">${main}${hasPanel ? panelHTML(config,top,panelId,currentId) : ''}</li>`;
    }).join('');
    const more = `<li class="ui-top-nav-item ui-top-nav-more" hidden><button type="button" class="ui-top-nav-link ui-top-nav-trigger ui-top-nav-more-button" data-toggle="${id}-more-panel" aria-expanded="false" aria-controls="${id}-more-panel"><span class="ui-top-nav-label">${escapeHTML(config.texts.more)}</span><span class="ui-top-nav-chevron" aria-hidden="true"></span></button><div id="${id}-more-panel" class="ui-top-nav-panel ui-top-nav-panel-list-style ui-top-nav-panel-end" hidden><ul class="ui-top-nav-panel-list"></ul></div></li>`;
    return `${tops}${more}`;
}

// Builds the "More" panel entries for the top items that do not fit (parents become groups).
export function buildMoreEntriesHTML( config, tops, currentId )
{
    return tops.map(( top, index ) =>
    {
        if ( !top.children.length ) { return `<li>${linkHTML(config,top,currentId,'ui-top-nav-entry')}</li>`; }
        const headingId = `${escapeHTML(config.id)}-m${index}`;
        const own = top.href ? [ { ...top } ] : [];
        const leaves = [ ...own, ...top.children.flatMap(entry => ( entry.type === 'GROUP' ? entry.children : entry.type === 'ITEM' ? [ entry ] : [] )) ];
        return `<li class="ui-top-nav-group"><span id="${headingId}" class="ui-top-nav-group-label">${escapeHTML(top.label)}</span><ul class="ui-top-nav-panel-list" aria-labelledby="${headingId}">${leaves.map(leaf => `<li>${linkHTML(config,leaf,currentId,'ui-top-nav-entry')}</li>`).join('')}</ul></li>`;
    }).join('');
}

// Builds the narrow-screen panel: every top item, parents as expandable sections.
export function buildMobileHTML( config, items, currentId )
{
    const id = escapeHTML(config.id);
    return items.map(( top, index ) =>
    {
        if ( !top.children.length ) { return `<li>${linkHTML(config,top,currentId,'ui-top-nav-mobile-link')}</li>`; }
        const sectionId = `${id}-s${index}`, open = isCurrentBranch(top,currentId);
        const own = top.href ? `<li>${linkHTML(config,top,currentId,'ui-top-nav-mobile-link ui-top-nav-mobile-sub')}</li>` : '';
        const entries = top.children.map(entry => ( entry.type === 'GROUP' ? `<li class="ui-top-nav-mobile-group">${escapeHTML(entry.label)}</li>${entry.children.map(child => `<li>${linkHTML(config,child,currentId,'ui-top-nav-mobile-link ui-top-nav-mobile-sub')}</li>`).join('')}` : entry.type === 'ITEM' ? `<li>${linkHTML(config,entry,currentId,'ui-top-nav-mobile-link ui-top-nav-mobile-sub')}</li>` : '' )).join('');
        return `<li><button type="button" class="ui-top-nav-mobile-link ui-top-nav-mobile-section" data-section="${sectionId}" aria-expanded="${open}" aria-controls="${sectionId}">${contentHTML(config,top,false)}<span class="ui-top-nav-chevron" aria-hidden="true"></span></button><ul id="${sectionId}" class="ui-top-nav-mobile-list"${open ? '' : ' hidden'}>${own}${entries}</ul></li>`;
    }).join('');
}

// Builds the navigation shell.
export function buildTopNavigationHTML( config )
{
    const id = escapeHTML(config.id);
    return `<nav id="${id}" class="ui-top-nav ui-top-nav-current-${config.currentStyle.toLowerCase()}" aria-label="${escapeHTML(config.texts.navigation)}">`
        + '<span class="ui-top-nav-menu-host"></span>'
        + '<ul class="ui-top-nav-bar"></ul>'
        + `<div id="${id}-mobile" class="ui-top-nav-mobile" hidden><ul class="ui-top-nav-mobile-list"></ul></div>`
        + '</nav>';
}
