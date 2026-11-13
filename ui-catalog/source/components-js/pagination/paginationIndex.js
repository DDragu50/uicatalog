// paginationIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Pagination only from this file.
//
// renderPagination(container, config, onPageChange)
//   Renders page navigation into a dedicated, consumer-owned container and returns
//   { id, getPage, getTotalPages, update, focus, destroy }, or null after a developer error.
//
//   onPageChange(page, instance)   config.onPageChange takes precedence.
//     Reports a valid, different page chosen by the user (page button, previous/next, go-to-page).
//     Pagination never changes the consumer's data or its own current page: the consumer loads the page
//     and calls instance.update({ currentPage }) (and totalItems / itemsPerPage when they change).
//
// Everything not exported here is internal implementation.

export { renderPagination } from './paginationComponent.js';
export { DEFAULT_PAGINATION_CONFIG, PAGINATION_TOOLTIP_MODES } from './paginationConfig.js';
