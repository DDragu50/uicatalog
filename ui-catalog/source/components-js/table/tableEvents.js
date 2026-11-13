// tableEvents.js
//
// USER INTERACTIONS.
// Sort buttons, the page and row checkboxes. Row clicks do nothing: actions live in the cells (links, Buttons,
// ActionMenu) rendered by the consumer. Listeners are removed through the returned AbortController.

// Registers the table listeners.
export function registerTableEvents( root, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    root.addEventListener('click',event => { const sort = event.target.closest('.ui-table-sort'); if ( sort ) { handlers.onSort(sort.dataset.sort); } },{ signal });
    root.addEventListener('change',event =>
    {
        if ( event.target.matches('.ui-table-select-page') ) { handlers.onSelectPage(event.target.checked); }
        if ( event.target.matches('.ui-table-select-row') ) { handlers.onSelectRow(event.target.closest('tr').dataset.rowKey,event.target.checked); }
    },{ signal });
    return controller;
}
