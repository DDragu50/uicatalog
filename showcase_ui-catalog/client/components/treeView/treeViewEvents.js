// treeViewEvents.js
//
// USER INTERACTIONS.
// Listener registration on the tree (keyboard, clicks, focus, drag and drop), the search field and the rename field.
// Handlers receive the treeitem element (li[role="treeitem"]) the event belongs to. Removed through the instance's
// AbortController signal.

// Returns the treeitem an event target belongs to (inside this tree), or null.
function itemOf( tree, target ) { const item = target instanceof Element ? target.closest('li[role="treeitem"]') : null; return item && tree.contains(item) ? item : null; }

// Registers the tree listeners.
export function bindTreeViewEvents( tree, signal, handlers )
{
    tree.addEventListener('keydown',event =>
    {
        if ( event.target.closest('input') ) { return; }   // the rename field handles its own keys
        const item = itemOf(tree,event.target);
        if ( item && handlers.onKey(item,event) ) { event.preventDefault(); }
    },{ signal });
    tree.addEventListener('click',event =>
    {
        if ( event.target.closest('input') ) { return; }
        const row = event.target.closest('.ui-tree-view-row'), item = row ? itemOf(tree,row) : null;
        if ( !item ) { return; }
        if ( event.target.closest('.ui-tree-view-toggle') ) { handlers.onToggleClick(item); }
        else if ( event.target.closest('.ui-tree-view-check') ) { handlers.onCheckClick(item); }
        else { handlers.onRowClick(item); }
    },{ signal });
    tree.addEventListener('focusin',event => { const item = itemOf(tree,event.target); if ( item && event.target === item ) { handlers.onFocusItem(item); } },{ signal });
    tree.addEventListener('dragstart',event => { const item = itemOf(tree,event.target); if ( item ) { handlers.onDragStart(item,event); } },{ signal });
    tree.addEventListener('dragover',event => { const item = itemOf(tree,event.target); if ( item ) { handlers.onDragOver(item,event); } else { handlers.onDragClear(); } },{ signal });
    tree.addEventListener('drop',event => { const item = itemOf(tree,event.target); if ( item ) { handlers.onDrop(item,event); } },{ signal });
    tree.addEventListener('dragleave',event => { if ( !tree.contains(event.relatedTarget) ) { handlers.onDragClear(); } },{ signal });
    tree.addEventListener('dragend',() => handlers.onDragEnd(),{ signal });
}

// Registers the search field listeners: typing filters; Down moves into the tree.
export function bindTreeViewSearchEvents( input, signal, handlers )
{
    input.addEventListener('input',() => handlers.onSearch(input.value),{ signal });
    input.addEventListener('keydown',event => { if ( event.key === 'ArrowDown' && handlers.onSearchDown() ) { event.preventDefault(); } },{ signal });
}

// Registers the rename field listeners: Enter saves, Escape cancels, leaving the field saves.
export function bindTreeViewRenameEvents( input, signal, handlers )
{
    input.addEventListener('keydown',event =>
    {
        if ( event.key === 'Enter' ) { event.preventDefault(); handlers.onCommit(); }
        else if ( event.key === 'Escape' ) { event.preventDefault(); event.stopPropagation(); handlers.onCancel(); }
    },{ signal });
    input.addEventListener('blur',() => handlers.onCommit(),{ signal });
}
