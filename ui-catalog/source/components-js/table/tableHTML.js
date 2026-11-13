// tableHTML.js
//
// GENERATED MARKUP.
// Shell (counts/actions bar, table with colgroup, header and the progress row holding the Loader host, footer with the
// pagination host) rendered once; the layout-dependent parts (column widths and column headers) are built separately so
// that the coordinator can replace them when the layout is decided again; header states and the body are updated by the
// coordinator. Cells rendered by column.render() are hosts.

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

const WIDTH_TOKEN = { S:'--table-column-s', M:'--table-column-m', L:'--table-column-l', XL:'--table-column-xl' };

// Returns the width token of a column in its current (full or compact) view.
export function columnWidthToken( column, compact ) { return WIDTH_TOKEN[compact && column.compact ? column.compact.width : column.width]; }

// Builds the layout-dependent parts: the col elements (widths) and the header cells of the visible columns.
export function buildColumnsHTML( config, layout )
{
    const cols = [ config.selectable ? '<col style="--ui-table-col:var(--table-column-select)">' : '', '<col style="--ui-table-col:var(--table-column-counter)">', ...layout.columns.map(column => `<col style="--ui-table-col:var(${columnWidthToken(column,layout.compact.has(column.field))})">`) ].join('');
    const heads = layout.columns.map(column =>
    {
        const content = column.sortable
            ? `<button type="button" class="ui-table-sort" data-sort="${escapeHTML(column.field)}"><span>${escapeHTML(column.label)}</span><span class="ui-table-sort-icon" aria-hidden="true"><i class="fa-solid fa-up-down"></i></span></button>`
            : `<span class="ui-table-heading">${escapeHTML(column.label)}</span>`;
        return `<th scope="col" class="ui-table-align-${column.alignment.toLowerCase()}" data-field="${escapeHTML(column.field)}"${column.sortable ? ' aria-sort="none"' : ''}>${content}</th>`;
    }).join('');
    return { cols, heads };
}

// Builds the shell for the visible columns decided by the layout.
export function buildTableShellHTML( config, layout )
{
    const id = escapeHTML(config.id);
    const classes = [ 'ui-table', config.stickyHeader ? 'ui-table-sticky' : '', layout.cards ? 'ui-table-cards' : '', config.rowHover ? 'ui-table-hover' : '', config.alternateRows ? 'ui-table-alternate' : '' ].filter(Boolean).join(' ');
    const { cols, heads } = buildColumnsHTML(config,layout);
    const selectHead = config.selectable ? `<th class="ui-table-select-cell" scope="col"><input type="checkbox" class="ui-table-select-page" aria-label="${escapeHTML(config.texts.selectPage)}"></th>` : '';
    const actions = config.selectable ? `<span class="ui-table-selection-links"><span data-button="select-all"></span><span data-button="clear-selection"></span></span><span class="ui-table-actions">${config.selectionActions.map(action => `<span class="ui-table-action" data-action="${escapeHTML(action.key)}"></span>`).join('')}</span>` : '';
    return `<div id="${id}" class="${classes}">`
        + `<div class="ui-table-bar"><span class="ui-table-counts"></span>${actions}</div>`
        + `<table class="ui-table-grid"${config.label ? ` aria-label="${escapeHTML(config.label)}"` : ''}><colgroup>${cols}</colgroup><thead><tr>${selectHead}<th scope="col" class="ui-table-counter">${escapeHTML(config.texts.rowNumber)}</th>${heads}</tr><tr class="ui-table-progress" role="none"><td class="ui-table-progress-cell" role="none" colspan="${( config.selectable ? 1 : 0 ) + 1 + layout.columns.length}"><div class="ui-table-loader-host"></div></td></tr></thead><tbody></tbody></table>`
        + '<div class="ui-table-footer"><div class="ui-table-pagination-host"></div></div>'
        + '</div>';
}

// Builds a full-width message row: plain text (loading) or a host for a Message (empty, load error).
export function buildMessageRowHTML( span, text, kind, withHost = false )
{
    const content = withHost ? '<div class="ui-table-message-host"></div>' : `<span class="ui-table-message-text">${escapeHTML(text)}</span>`;
    return `<tr class="ui-table-message ui-table-message-${kind}"><td colspan="${span}">${content}</td></tr>`;
}

// Builds one data row; cells of render() columns stay empty hosts ([data-render]) filled by the coordinator.
export function buildRowHTML( config, layout, row, number, selected )
{
    const select = config.selectable ? `<td class="ui-table-select-cell"><input type="checkbox" class="ui-table-select-row" aria-label="${escapeHTML(config.texts.selectRow.replace('{number}',String(number)))}"${selected ? ' checked' : ''}></td>` : '';
    const cells = layout.columns.map(column =>
    {
        const attributes = `class="ui-table-align-${column.alignment.toLowerCase()}${column.always ? ' ui-table-always' : ''}" data-label="${escapeHTML(column.label)}" data-field="${escapeHTML(column.field)}"`;
        if ( column.render ) { return `<td ${attributes} data-render></td>`; }
        const compact = layout.compact.has(column.field) && column.compact?.format;
        const value = row?.[column.field];
        const empty = value === null || value === undefined || value === '';
        const text = empty ? '' : String(( compact ? column.compact.format(value,row) : column.format ? column.format(value,row) : value ) ?? '');
        return `<td ${attributes}>${column.truncate ? `<span class="ui-table-truncate"${hintAttribute(config.tooltipMode,text)}>${escapeHTML(text)}</span>` : escapeHTML(text)}</td>`;
    }).join('');
    return `<tr data-row-key="${escapeHTML(String(row?.id))}"${selected ? ' class="ui-table-row-selected"' : ''}>${select}<td class="ui-table-counter" data-label="${escapeHTML(config.texts.rowNumber)}">${number}</td>${cells}</tr>`;
}

// Builds a measuring row with placeholder text in every visible cell (used once to size rows per page).
export function buildProbeRowHTML( config, layout )
{
    const select = config.selectable ? '<td class="ui-table-select-cell"><input type="checkbox" tabindex="-1"></td>' : '';
    return `<tr>${select}<td class="ui-table-counter">0</td>${layout.columns.map(column => `<td data-label="${escapeHTML(column.label)}"><span class="ui-table-truncate">Mg</span></td>`).join('')}</tr>`;
}
