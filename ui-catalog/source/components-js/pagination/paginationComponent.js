// paginationComponent.js
//
// COMPONENT COORDINATOR.
// Reports the page the user asks for; never changes the consumer's data. The consumer passes the numbers
// (total items, items per page, current page) and calls update() when they change. Previous/next are tertiary
// icon Buttons (Font Awesome chevrons). The container is a dedicated, consumer-owned mount point.

import { mergePaginationConfig, validatePaginationConfig, normalizeInteger } from './paginationConfig.js';
import { createPaginationState, totalPagesOf } from './paginationState.js';
import { buildPaginationHTML, buildPagesHTML } from './paginationHTML.js';
import { registerPaginationEvents } from './paginationEvents.js';
import { getPaginationError, reportPaginationIssue } from './paginationErrors.js';
import { renderButton } from '../button/buttonIndex.js';

// Renders a Pagination and returns its runtime instance, or null after a developer error.
export function renderPagination( container, config, onPageChange )
{
    if ( !container ) { reportPaginationIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergePaginationConfig(config);
    if ( validatePaginationConfig(merged) ) { return null; }

    container.innerHTML = buildPaginationHTML(merged);
    const root = container.querySelector('.ui-pagination');
    const pages = root.querySelector('.ui-pagination-pages');
    const arrows = root.querySelector('.ui-pagination-arrows');
    const goTo = root.querySelector('.ui-pagination-go-to');
    const input = root.querySelector('.ui-pagination-go-to-input');
    const errorElement = root.querySelector('.ui-pagination-go-to-error');
    const state = createPaginationState(merged);
    const callback = merged.onPageChange ?? ( typeof onPageChange === 'function' ? onPageChange : null );
    const rtl = getComputedStyle(container).direction === 'rtl';
    let controller = null, instance = null;

    // Clamps the current page into 1…totalPages (warning when the consumer passed a page outside).
    function clampPage( warn )
    {
        const last = Math.max(1,totalPagesOf(state));
        if ( state.currentPage > last ) { if ( warn ) { reportPaginationIssue('PAGE_OUT_OF_RANGE',{ id:merged.id, value:state.currentPage, fallback:last }); } state.currentPage = last; }
    }

    // Shows or clears the go-to-page error.
    function renderGoToError()
    {
        if ( !input ) { return; }
        errorElement.textContent = state.goToError?.message ?? '';
        errorElement.hidden = !state.goToError;
        input.setAttribute('aria-invalid',String(Boolean(state.goToError)));
        if ( state.goToError ) { input.setAttribute('aria-describedby',errorElement.id); } else { input.removeAttribute('aria-describedby'); }
    }

    // Redraws the page list and updates arrow and go-to visibility for the current numbers.
    function draw()
    {
        const totalPages = totalPagesOf(state);
        root.hidden = totalPages <= 1;
        pages.innerHTML = buildPagesHTML(merged,state);
        arrows.hidden = totalPages < merged.arrowVisibilityThreshold;
        previous?.setDisabled(state.currentPage <= 1);
        next?.setDisabled(state.currentPage >= totalPages);
        if ( goTo ) { goTo.hidden = totalPages < merged.goToPageThreshold; }
    }

    // Reports a requested page when it is a real, different page (the consumer decides and calls update()).
    function request( page )
    {
        if ( !Number.isInteger(page) || page < 1 || page > totalPagesOf(state) || page === state.currentPage ) { return; }
        callback?.(page,instance);
    }

    // Handles Enter in the go-to-page field: valid pages are requested, invalid input shows an error.
    function goToPage( text )
    {
        const page = Number(String(text).trim());
        const totalPages = totalPagesOf(state);
        if ( !/^\d+$/.test(String(text).trim()) || page < 1 || page > totalPages ) { state.goToError = getPaginationError('INVALID_PAGE',merged,totalPages); renderGoToError(); return; }
        state.goToError = null; renderGoToError();
        input.value = '';
        request(page);
    }

    const previous = renderButton(arrows.querySelector('[data-button="previous"]'),{ id:`${merged.id}-previous`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', icon:rtl ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left', ariaLabel:merged.texts.previous, tooltipMode:merged.iconTooltip },() => request(state.currentPage - 1));
    const next = renderButton(arrows.querySelector('[data-button="next"]'),{ id:`${merged.id}-next`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', icon:rtl ? 'fa-solid fa-chevron-left' : 'fa-solid fa-chevron-right', ariaLabel:merged.texts.next, tooltipMode:merged.iconTooltip },() => request(state.currentPage + 1));

    instance =
    {
        id:merged.id,
        // Returns the current page (1 when there are no pages).
        getPage:() => state.currentPage,
        // Returns the number of pages.
        getTotalPages:() => totalPagesOf(state),
        // Applies new numbers from the consumer ({ totalItems, itemsPerPage, currentPage }, all optional) and redraws.
        update:( numbers = {} ) =>
        {
            state.totalItems = normalizeInteger(merged.id,'totalItems',numbers.totalItems,0,state.totalItems);
            state.itemsPerPage = normalizeInteger(merged.id,'itemsPerPage',numbers.itemsPerPage,1,state.itemsPerPage);
            state.currentPage = normalizeInteger(merged.id,'currentPage',numbers.currentPage,1,state.currentPage);
            clampPage(numbers.currentPage !== undefined);   // a shrinking total simply moves to the last page
            draw();
        },
        // Moves focus to the current page button (or the first control).
        focus:() => { const target = pages.querySelector('[aria-current="page"]') ?? root.querySelector('button, input'); target?.focus(); return Boolean(target) && document.activeElement === target; },
        // Removes listeners and Buttons, then clears the container.
        destroy:() => { controller?.abort(); previous?.destroy(); next?.destroy(); container.innerHTML = ''; }
    };

    clampPage(true);
    draw();
    controller = registerPaginationEvents(root,{ onPage:request, onGoTo:goToPage, onGoToInput:() => { if ( state.goToError ) { state.goToError = null; renderGoToError(); } } });
    return instance;
}
