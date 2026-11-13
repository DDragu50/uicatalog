// paginationHTML.js
//
// GENERATED MARKUP.
// The navigation shell (rendered once) and the page-number list (rebuilt when the page or total changes).
// Previous/next are Button instances rendered into their hosts by the coordinator.

import { getVisiblePages } from './paginationState.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds the navigation shell: page list, arrow hosts and the optional go-to-page field.
export function buildPaginationHTML( config )
{
    const id = escapeHTML(config.id);
    const goTo = config.showGoToPage ? `<div class="ui-pagination-go-to"><label class="ui-pagination-go-to-label" for="${id}-go-to">${escapeHTML(config.texts.goToPage)}</label><input id="${id}-go-to" class="ui-pagination-go-to-input" type="text" inputmode="numeric" autocomplete="off" aria-invalid="false"><span id="${id}-go-to-error" class="ui-pagination-go-to-error" hidden></span></div>` : '';
    return `<nav id="${id}" class="ui-pagination" aria-label="${escapeHTML(config.label)}"><div class="ui-pagination-pages"></div><div class="ui-pagination-arrows"><span data-button="previous"></span><span data-button="next"></span></div>${goTo}</nav>`;
}

// Builds the page buttons and ellipses for the current state.
export function buildPagesHTML( config, state )
{
    const number = new Intl.NumberFormat(config.locale);
    return getVisiblePages(state,config.visiblePageCount).map(page =>
    {
        if ( typeof page === 'string' ) { return '<span class="ui-pagination-ellipsis" aria-hidden="true">…</span>'; }
        const current = page === state.currentPage;
        return `<button type="button" class="ui-pagination-page${current ? ' ui-pagination-current' : ''}" data-page="${page}" aria-label="${escapeHTML(config.texts.page.replace('{page}',number.format(page)))}"${current ? ' aria-current="page"' : ''}>${number.format(page)}</button>`;
    }).join('');
}
