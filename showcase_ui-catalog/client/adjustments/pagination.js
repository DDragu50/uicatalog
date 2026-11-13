// pagination.js
//
// CUSTOMIZATION ADJUSTMENTS (Pagination).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/pagination.html: 600 items, 25 per page, page 5, go-to-page field.
// Variants panel: only the numbers and the go-to-page field (totalItems, itemsPerPage, currentPage, visiblePageCount,
// arrowVisibilityThreshold, showGoToPage, goToPageThreshold), in the README order; label and the texts group are
// hidden (label keeps its start value "Orders pages", the texts their English defaults).

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'totalItems', 'itemsPerPage', 'currentPage', 'visiblePageCount', 'arrowVisibilityThreshold', 'showGoToPage', 'goToPageThreshold', 'tooltipMode' ],
    start:{ label:'Orders pages', totalItems:600, currentPage:5, showGoToPage:true }
};
