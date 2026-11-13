// breadcrumbsHTML.js
//
// GENERATED MARKUP.
// A navigation landmark with an ordered list of links (the current page is text with aria-current="page"),
// an optional "…" host for the ActionMenu of hidden levels, and a back link for narrow containers.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

// Returns which items are shown and which are collapsed: first item, "…", then the last (maxItems - 2) items.
export function collapse( items, maxItems )
{
    if ( !maxItems || items.length <= maxItems ) { return { shown:items.map(( item, index ) => ({ ...item, index })), hidden:[] }; }
    const tail = items.length - ( maxItems - 2 );
    return { shown:[ { ...items[0], index:0 }, { more:true }, ...items.slice(tail).map(( item, index ) => ({ ...item, index:tail + index })) ], hidden:items.slice(1,tail).map(( item, index ) => ({ ...item, index:index + 1 })) };
}

// Builds the siblings Button host and the (hidden) list of pages at the same level; the level itself is marked.
function buildSiblingsHTML( config, item )
{
    if ( !item.siblings?.length ) { return ''; }
    const listId = `${escapeHTML(config.id)}-siblings-${item.index}`;
    const links = item.siblings.map(sibling =>
    {
        const same = sibling.href === item.href || sibling.label === item.label;
        return `<li><a class="ui-breadcrumbs-sibling" href="${escapeHTML(sibling.href)}" data-sibling="${escapeHTML(sibling.href)}" data-sibling-label="${escapeHTML(sibling.label)}"${same ? ' aria-current="true"' : ''}>${escapeHTML(sibling.label)}</a></li>`;
    }).join('');
    return `<span class="ui-breadcrumbs-siblings-host" data-index="${item.index}"></span><ul id="${listId}" class="ui-breadcrumbs-siblings" hidden>${links}</ul>`;
}

// Builds one list entry: a link, the current page, a text-only level, or the "…" host.
function buildItemHTML( config, item, last, count )
{
    if ( item.more ) { return '<li class="ui-breadcrumbs-item ui-breadcrumbs-more"><span class="ui-breadcrumbs-more-host"></span></li>'; }
    const home = config.homeIcon && item.index === 0;
    const icon = home ? '<i class="fa-solid fa-house" aria-hidden="true"></i>' : item.icon ? `<i class="${escapeHTML(item.icon)}" aria-hidden="true"></i>` : '';
    const text = home ? `<span class="ui-breadcrumbs-visually-hidden">${escapeHTML(item.label)}</span>` : `<span class="ui-breadcrumbs-label">${escapeHTML(item.label)}</span>`;
    const title = home ? '' : hintAttribute(config.tooltipMode,item.label);
    const siblings = buildSiblingsHTML(config,item);
    if ( last ) { return `<li class="ui-breadcrumbs-item"><span class="ui-breadcrumbs-current" aria-current="page"${title}>${icon}${text}</span>${siblings}</li>`; }
    const inner = item.href ? `<a class="ui-breadcrumbs-link" href="${escapeHTML(item.href)}" data-index="${item.index}"${title}>${icon}${text}</a>` : `<span class="ui-breadcrumbs-text"${title}>${icon}${text}</span>`;
    return `<li class="ui-breadcrumbs-item">${inner}${siblings}</li>`;
}

// Builds the list and the back link for the current items.
export function buildBreadcrumbsContentHTML( config, items )
{
    const visible = config.showCurrent ? items : items.slice(0,-1);
    const { shown } = collapse(visible,config.maxItems);
    const list = shown.map(( item, position ) => buildItemHTML(config,item,config.showCurrent && position === shown.length - 1,shown.length)).join('');
    const parent = [ ...items.slice(0,-1) ].reverse().find(item => item.href);
    const back = config.backLinkOnNarrow && parent ? `<a class="ui-breadcrumbs-back" href="${escapeHTML(parent.href)}" data-index="${items.indexOf(parent)}"><span class="ui-breadcrumbs-back-icon" aria-hidden="true"></span>${escapeHTML(config.texts.back.replace('{label}',parent.label))}</a>` : '';
    return `<ol class="ui-breadcrumbs-list">${list}</ol>${back}`;
}

// Builds the navigation shell.
export function buildBreadcrumbsHTML( config )
{
    return `<nav id="${escapeHTML(config.id)}" class="ui-breadcrumbs ui-breadcrumbs-separator-${config.separator.toLowerCase()}${config.backLinkOnNarrow ? ' ui-breadcrumbs-back-on-narrow' : ''}" aria-label="${escapeHTML(config.texts.navigation)}"></nav>`;
}

// Builds the schema.org BreadcrumbList (JSON-LD) for search engines: every level (collapsed ones included), absolute
// addresses (relative links resolved against the current page), the current page at its own address.
export function buildStructuredData( items, pageAddress )
{
    const absolute = href => { try { return new URL(href,pageAddress).href; } catch { return ''; } };
    const list = items.map(( item, index ) =>
    {
        const last = index === items.length - 1;
        const address = item.href ? absolute(item.href) : last ? pageAddress : '';
        return { '@type':'ListItem', position:index + 1, name:item.label, ...( address ? { item:address } : {} ) };
    });
    const json = JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:list }).replace(/</g,'\\u003c');
    return `<script type="application/ld+json" class="ui-breadcrumbs-structured-data">${json}</script>`;
}
