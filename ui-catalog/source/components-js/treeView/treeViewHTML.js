// treeViewHTML.js
//
// GENERATED MARKUP.
// The shell (label, toolbar hosts, search field, the ARIA tree, no-results host, help, error, dialog host) and the
// items: one treeitem per node with its row (open/close arrow, checkbox, icon, text, badge, status) and, for parents, a
// group of sub-items. DOM ids are generated per instance ({id}-{domId}); item ids stay in data-item.

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

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Returns the optional text or the mandatory asterisk shown after the label.
function buildRequirementHTML( config )
{
    if ( !config.mandatory ) { return config.mandatoryIndicator === 'OPTIONAL_TEXT' ? ` <span class="ui-tree-view-optional">${escapeHTML(config.texts.optional)}</span>` : ''; }
    return config.mandatoryIndicator === 'MANDATORY_ASTERISK' ? ' <span class="ui-tree-view-mandatory" aria-hidden="true">*</span>' : '';
}

// Builds the shell; the tree list is filled with buildNodesHTML().
export function buildTreeViewHTML( config )
{
    const id = escapeHTML(config.id);
    const classes = [ 'ui-tree-view', `ui-tree-view-selection-${toClassPart(config.selectionMode)}`, config.guideLines ? 'ui-tree-view-lines' : '', config.editable ? 'ui-tree-view-editable' : '',
        config.labelPosition !== 'INHERIT' ? `ui-tree-view-label-${toClassPart(config.labelPosition)}` : '' ].filter(Boolean).join(' ');
    const label = config.label ? `<div id="${id}-label" class="ui-tree-view-label">${escapeHTML(config.label)}${buildRequirementHTML(config)}</div>` : '';
    const name = config.label ? ` aria-labelledby="${id}-label"` : ` aria-label="${escapeHTML(config.ariaLabel || config.texts.tree)}"`;
    const actions = config.actions.map(( action, index ) => `<span class="ui-tree-view-action" data-action="${index}"></span>`).join('');
    const tools = config.editable ? [ 'add', 'add-child', 'rename', 'delete', 'move-up', 'move-down', 'indent', 'outdent' ].map(key => `<span class="ui-tree-view-tool" data-tool="${key}"></span>`).join('') : '';
    const separator = actions && tools ? '<span class="ui-tree-view-toolbar-separator" aria-hidden="true"></span>' : '';
    const toolbar = actions || tools ? `<div class="ui-tree-view-toolbar" role="group" aria-label="${escapeHTML(config.texts.toolbar)}">${actions}${separator}${tools}</div>` : '';
    const search = config.search ? `<div class="ui-tree-view-search"><input id="${id}-search" class="ui-tree-view-search-input" type="search" autocomplete="off" aria-label="${escapeHTML(config.texts.search)}" placeholder="${escapeHTML(config.texts.search)}" aria-controls="${id}-tree"></div>` : '';
    const multiple = config.selectionMode === 'MULTIPLE' ? ' aria-multiselectable="true"' : '';
    const required = config.mandatory ? ' aria-required="true"' : '';
    const help = config.help ? `<div id="${id}-help" class="ui-tree-view-help">${escapeHTML(config.help)}</div>` : '';
    const describedBy = config.help ? ` aria-describedby="${id}-help"` : '';
    return `<div id="${id}" class="${classes}">${label}${toolbar}${search}<div class="ui-tree-view-body">`
        + `<ul id="${id}-tree" class="ui-tree-view-tree" role="tree"${name}${multiple}${required}${describedBy}></ul><div class="ui-tree-view-no-results"></div></div>`
        + `${help}<div id="${id}-error" class="ui-tree-view-error" hidden></div><div class="ui-tree-view-dialog"></div></div>`;
}

// Returns the text of an item, with the parts matching the search text marked.
export function buildTextHTML( label, searchText )
{
    if ( !searchText ) { return escapeHTML(label); }
    const lower = label.toLowerCase(), needle = searchText.toLowerCase(), parts = [];
    let from = 0, at = lower.indexOf(needle);
    while ( at >= 0 ) { parts.push(escapeHTML(label.slice(from,at)),`<mark class="ui-tree-view-match">${escapeHTML(label.slice(at,at + needle.length))}</mark>`); from = at + needle.length; at = lower.indexOf(needle,from); }
    parts.push(escapeHTML(label.slice(from)));
    return parts.join('');
}

// Returns the inside of a row: open/close arrow space, checkbox (MULTIPLE), icon, text, badge and status.
export function buildRowHTML( config, state, id )
{
    const node = state.nodes.get(id), domId = `${escapeHTML(config.id)}-${node.domId}`;
    const check = config.selectionMode === 'MULTIPLE' ? '<span class="ui-tree-view-check" aria-hidden="true"></span>' : '';
    const icon = node.icon ? `<span class="ui-tree-view-icon" aria-hidden="true"><i class="${escapeHTML(node.icon)}"></i></span>` : '';
    const badge = node.badge ? `<span class="ui-tree-view-badge">${escapeHTML(node.badge)}</span>` : '';
    return `<span class="ui-tree-view-toggle" aria-hidden="true"></span>${check}${icon}<span id="${domId}-text" class="ui-tree-view-text"${hintAttribute(config.tooltipMode,node.label)}>${buildTextHTML(node.label,state.searchText)}</span>${badge}<span id="${domId}-status" class="ui-tree-view-status"></span>`;
}

// Builds the treeitems of an ordered id list at a level (1 = top), with their sub-items.
export function buildNodesHTML( config, state, ids, level = 1 )
{
    return ids.map(( id, index ) =>
    {
        const node = state.nodes.get(id), domId = `${escapeHTML(config.id)}-${node.domId}`;
        const attributes = [ `id="${domId}"`, 'role="treeitem"', 'class="ui-tree-view-item"', `data-item="${escapeHTML(id)}"`, `aria-level="${level}"`, `aria-setsize="${ids.length}"`, `aria-posinset="${index + 1}"`,
            `aria-labelledby="${domId}-text"`, `aria-describedby="${domId}-status"`, `tabindex="${id === state.activeId ? 0 : -1}"`, `style="--ui-tree-view-level:${level - 1}"` ];
        if ( id === state.activeId ) { attributes[2] = 'class="ui-tree-view-item ui-tree-view-current"'; }
        if ( node.hasChildren ) { attributes.push(`aria-expanded="${node.expanded}"`); }
        if ( config.selectionMode === 'SINGLE' ) { attributes.push(`aria-selected="${id === state.selectedId}"`); }
        if ( config.selectionMode === 'MULTIPLE' ) { attributes.push(`aria-checked="${node.checked}"`); }
        if ( node.disabled ) { attributes.push('aria-disabled="true"'); }
        if ( config.editable && !node.disabled ) { attributes.push('draggable="true"'); }
        const group = node.hasChildren ? `<ul class="ui-tree-view-group" role="group"${node.expanded ? '' : ' hidden'}>${buildNodesHTML(config,state,node.children,level + 1)}</ul>` : '';
        return `<li ${attributes.join(' ')}><div class="ui-tree-view-row">${buildRowHTML(config,state,id)}</div>${group}</li>`;
    }).join('');
}
