// paginationState.js
//
// RUNTIME STATE.
// Per-instance numbers (total items, items per page, current page) and the page-window calculation.

// Creates independent runtime state from the configuration's initial numbers.
export function createPaginationState( config ) { return { totalItems:config.totalItems, itemsPerPage:config.itemsPerPage, currentPage:config.currentPage, goToError:null }; }

// Returns the number of pages (0 without items).
export function totalPagesOf( state ) { return Math.ceil(state.totalItems / state.itemsPerPage); }

// Returns the pages to show: first, last, a window around the current page and 'ellipsis-start' / 'ellipsis-end' markers.
export function getVisiblePages( state, visiblePageCount )
{
    const totalPages = totalPagesOf(state), current = state.currentPage;
    if ( totalPages <= visiblePageCount + 2 ) { return Array.from({ length:totalPages },( _, index ) => index + 1); }
    const side = Math.floor(visiblePageCount / 2);
    let start = Math.max(2,current - side), end = Math.min(totalPages - 1,current + side);
    if ( current <= side + 2 ) { start = 2; end = Math.min(totalPages - 1,visiblePageCount); }
    if ( current >= totalPages - side - 1 ) { start = Math.max(2,totalPages - visiblePageCount + 1); end = totalPages - 1; }
    const pages = [ 1 ];
    if ( start > 2 ) { pages.push('ellipsis-start'); }
    for ( let page = start; page <= end; page++ ) { pages.push(page); }
    if ( end < totalPages - 1 ) { pages.push('ellipsis-end'); }
    pages.push(totalPages);
    return pages;
}
