// treeViewState.js
//
// RUNTIME STATE.
// The item model (one node per id, children as ordered id lists), the selection (SINGLE: one id; MULTIPLE: ticked
// nodes), the active item (the one that takes Tab focus), errors and the search text. Pure model operations only.

// Creates independent state for one instance.
export function createTreeViewState()
{
    return { nodes:new Map(), roots:[], selectedId:'', activeId:'', isDirty:false, error:null, external:null, searchText:'', domCounter:0, newCounter:0, renamingId:'' };
}

// Returns the ordered child id list of a parent ('' = the top level); the list itself, for in-place changes.
export function childIdsOf( state, parentId ) { return parentId ? state.nodes.get(parentId).children : state.roots; }

// Adds normalized items under a parent at an index (end by default); returns the ids of the added top items.
export function addNodes( state, items, parentId = '', index = null )
{
    const list = childIdsOf(state,parentId);
    const added = items.map(item =>
    {
        state.domCounter += 1;
        state.nodes.set(item.id,{ id:item.id, label:item.label, icon:item.icon, badge:item.badge, disabled:item.disabled, hasChildren:item.hasChildren, loaded:item.loaded, loading:false, loadError:false,
            expanded:item.expanded && item.hasChildren, checked:false, parentId, children:[], domId:`n${state.domCounter}` });
        addNodes(state,item.children,item.id);
        return item.id;
    });
    list.splice(index === null ? list.length : index,0,...added);
    if ( parentId ) { const parent = state.nodes.get(parentId); parent.hasChildren = parent.children.length > 0 || !parent.loaded; }
    return added;
}

// Removes a node and its descendants from the model; returns the removed ids (the node first).
export function removeNode( state, id )
{
    const node = state.nodes.get(id), removed = [ id, ...descendantIds(state,id) ];
    const list = childIdsOf(state,node.parentId);
    list.splice(list.indexOf(id),1);
    removed.forEach(removedId => state.nodes.delete(removedId));
    if ( node.parentId ) { const parent = state.nodes.get(node.parentId); parent.hasChildren = parent.children.length > 0 || !parent.loaded; if ( !parent.hasChildren ) { parent.expanded = false; } }
    return removed;
}

// Moves a node under another parent ('' = top level) at an index of the new list (counted without the node).
export function moveNode( state, id, parentId, index )
{
    const node = state.nodes.get(id);
    const from = childIdsOf(state,node.parentId);
    from.splice(from.indexOf(id),1);
    if ( node.parentId ) { const old = state.nodes.get(node.parentId); old.hasChildren = old.children.length > 0 || !old.loaded; if ( !old.hasChildren ) { old.expanded = false; } }
    childIdsOf(state,parentId).splice(index,0,id);
    node.parentId = parentId;
    if ( parentId ) { state.nodes.get(parentId).hasChildren = true; }
}

// Returns the ids of all descendants of a node, in display order (pre-order).
export function descendantIds( state, id ) { return state.nodes.get(id).children.flatMap(child => [ child, ...descendantIds(state,child) ]); }

// Returns the ancestor ids of a node, nearest first.
export function ancestorIds( state, id ) { const result = []; let parent = state.nodes.get(id)?.parentId; while ( parent ) { result.push(parent); parent = state.nodes.get(parent).parentId; } return result; }

// Returns every id in display order (pre-order), collapsed branches included.
export function allIds( state ) { return state.roots.flatMap(id => [ id, ...descendantIds(state,id) ]); }

// Returns the level of a node (1 = top level).
export function levelOf( state, id ) { return ancestorIds(state,id).length + 1; }

// Ticks or unticks a node. With cascade, enabled loaded descendants follow and every ancestor is recomputed (ticked when
// all its children are ticked). Returns whether any node changed.
export function setChecked( state, id, checked, cascade )
{
    const before = allIds(state).map(nodeId => state.nodes.get(nodeId).checked).join();
    const node = state.nodes.get(id);
    node.checked = checked;
    if ( cascade )
    {
        descendantIds(state,id).forEach(childId => { const child = state.nodes.get(childId); if ( !child.disabled ) { child.checked = checked; } });
        recomputeBranch(state,id);
        ancestorIds(state,id).forEach(parentId => recomputeNode(state,parentId));
    }
    return before !== allIds(state).map(nodeId => state.nodes.get(nodeId).checked).join();
}

// Cascade: a parent with children is ticked exactly when all its children are ticked (bottom-up for a whole branch).
export function recomputeBranch( state, id ) { state.nodes.get(id).children.forEach(child => recomputeBranch(state,child)); recomputeNode(state,id); }

// Cascade: recomputes a parent and all its ancestors after its children changed (added, removed, moved).
export function recomputeAncestors( state, parentId ) { [ parentId, ...( parentId ? ancestorIds(state,parentId) : [] ) ].filter(Boolean).forEach(id => recomputeNode(state,id)); }

// Cascade: recomputes one parent from its children (nodes without children keep their own state).
function recomputeNode( state, id ) { const node = state.nodes.get(id); if ( node.children.length ) { node.checked = node.children.every(child => state.nodes.get(child).checked); } }

// Returns 'true', 'false' or 'mixed' for a node (mixed: not ticked, with ticked descendants; cascade only).
export function checkStateOf( state, id, cascade )
{
    const node = state.nodes.get(id);
    if ( node.checked ) { return 'true'; }
    return cascade && descendantIds(state,id).some(child => state.nodes.get(child).checked) ? 'mixed' : 'false';
}

// The tick a user action on a node gives. Cascade with descendants: untick when every enabled end item of the branch
// is ticked (parents follow their children, so a disabled unticked item must not keep the branch from unticking),
// otherwise tick; without descendants (or cascade): the opposite of the node's tick.
export function nextCheckedOf( state, id, cascade )
{
    const enabled = cascade ? descendantIds(state,id).filter(nodeId => !state.nodes.get(nodeId).disabled && state.nodes.get(nodeId).children.length === 0) : [];
    return enabled.length ? !enabled.every(nodeId => state.nodes.get(nodeId).checked) : !state.nodes.get(id).checked;
}

// Returns the value: SINGLE the selected id or ''; MULTIPLE the ticked ids in display order (ALL), only those without
// children (LEAVES), or only those whose parent is not ticked (TOP).
export function getTreeValue( state, config )
{
    if ( config.selectionMode === 'SINGLE' ) { return state.selectedId; }
    const ticked = allIds(state).filter(id => state.nodes.get(id).checked);
    if ( config.checkedValue === 'LEAVES' ) { return ticked.filter(id => state.nodes.get(id).children.length === 0); }
    if ( config.checkedValue === 'TOP' ) { return ticked.filter(id => !state.nodes.get(state.nodes.get(id).parentId)?.checked); }
    return ticked;
}

// Returns a public copy of one item: { id, label, icon, badge, disabled, parentId, level, hasChildren }.
export function itemCopy( state, id )
{
    const node = state.nodes.get(id);
    return { id, label:node.label, icon:node.icon, badge:node.badge, disabled:node.disabled, parentId:node.parentId, level:levelOf(state,id), hasChildren:node.hasChildren };
}

// Returns the current tree as plain item objects (the shape config.items accepts), e.g. to save an edited tree.
export function treeCopy( state, ids = state.roots )
{
    return ids.map(id =>
    {
        const node = state.nodes.get(id), item = { id, label:node.label };
        if ( node.icon ) { item.icon = node.icon; }
        if ( node.badge ) { item.badge = node.badge; }
        if ( node.disabled ) { item.disabled = true; }
        if ( node.children.length ) { item.children = treeCopy(state,node.children); } else if ( !node.loaded ) { item.hasChildren = true; }
        return item;
    });
}
