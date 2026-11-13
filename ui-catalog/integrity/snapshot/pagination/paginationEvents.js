// paginationEvents.js
//
// USER INTERACTIONS.
// One delegated click listener for the page buttons and the go-to-page input (Enter, typing); removed through the
// returned AbortController. Previous/next are Buttons with their own callbacks.

// Registers the page-button and go-to-page listeners.
export function registerPaginationEvents( root, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    root.addEventListener('click',event => { const button = event.target.closest('.ui-pagination-page'); if ( button ) { handlers.onPage(Number(button.dataset.page)); } },{ signal });
    const input = root.querySelector('.ui-pagination-go-to-input');
    input?.addEventListener('keydown',event => { if ( event.key === 'Enter' ) { event.preventDefault(); handlers.onGoTo(input.value); } },{ signal });
    input?.addEventListener('input',() => handlers.onGoToInput(),{ signal });
    return controller;
}
