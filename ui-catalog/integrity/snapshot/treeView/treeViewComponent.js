// treeViewComponent.js
//
// COMPONENT COORDINATOR.
// Renders the ARIA tree once and applies every change in place: open/close, selection (SINGLE) or ticks (MULTIPLE,
// optionally cascading), search, children loaded on demand, and — when editable — add, rename, delete and move
// (toolbar Buttons, drag and drop). Structural edits rebuild only the tree list, from the model. One treeitem takes
// Tab focus (roving tabindex). Buttons, Messages and Loaders (a small ring next to a parent whose children load) are
// declared dependencies created through their entry points.
// The container is a dedicated, consumer-owned mount point.

import { mergeTreeViewConfig, validateTreeViewConfig, normalizeTreeItems, normalizeIconClass } from './treeViewConfig.js';
import { buildTreeViewHTML, buildNodesHTML, buildRowHTML, buildTextHTML } from './treeViewHTML.js';
import { bindTreeViewEvents, bindTreeViewSearchEvents, bindTreeViewRenameEvents } from './treeViewEvents.js';
import { createTreeViewState, childIdsOf, addNodes, removeNode, moveNode, descendantIds, ancestorIds, allIds, levelOf, setChecked, recomputeBranch, recomputeAncestors, checkStateOf, nextCheckedOf, getTreeValue, itemCopy, treeCopy } from './treeViewState.js';
import { validateTreeSelection } from './treeViewValidation.js';
import { getTreeViewError, reportTreeViewIssue } from './treeViewErrors.js';
import { renderButton } from '../button/buttonIndex.js';
import { renderMessage } from '../message/messageIndex.js';
import { renderLoader } from '../loader/loaderIndex.js';

// Toolbar tools: key → text key, icon, whether the Button shows its text (the move tools are icon buttons).
const TOOLS =
[
    [ 'add', 'add', 'fa-solid fa-plus', true ], [ 'add-child', 'addChild', 'fa-solid fa-turn-down', true ], [ 'rename', 'rename', 'fa-solid fa-pen', true ], [ 'delete', 'delete', 'fa-solid fa-trash-can', true ],
    [ 'move-up', 'moveUp', 'fa-solid fa-arrow-up', false ], [ 'move-down', 'moveDown', 'fa-solid fa-arrow-down', false ], [ 'indent', 'indent', 'fa-solid fa-indent', false ], [ 'outdent', 'outdent', 'fa-solid fa-outdent', false ]
];

// Returns the ids of the items marked selected in a normalized item tree, in display order.
function selectedIdsOf( items ) { return items.flatMap(item => [ ...( item.selected ? [ item.id ] : [] ), ...selectedIdsOf(item.children) ]); }

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// tooltipMode TOOLTIP (guidelines §12): one Tooltip for the elements with data-tooltip that belong to this component
// (the nearest component around them; hints inside a nested component are left to it), in a host after the component;
// the Tooltip module is loaded only then (if it cannot be loaded, the browser reports it and the hints stay without a
// tooltip). Returns the function that removes it.
function attachHintTooltip( container, id, mode, options = {} )
{
    if ( mode !== 'TOOLTIP' ) { return () => {}; }
    const scope = container.firstElementChild;
    scope?.setAttribute('data-tooltip-scope',id);
    const host = document.createElement('span');
    host.className = 'ui-tooltip-host';
    container.appendChild(host);
    let tooltip = null, removed = false;
    import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
    {
        if ( removed ) { return; }
        tooltip = renderTooltip(host,{ id:`${id}-tooltip`, targets:{ within:container, selector:'[data-tooltip]', text:element => ( element.closest('[data-tooltip-scope]') === scope ? element.getAttribute('data-tooltip') : '' ) }, ...options });
    }).catch(() => {});
    return () => { removed = true; tooltip?.destroy(); host.remove(); scope?.removeAttribute('data-tooltip-scope'); };
}

// Renders an interactive TreeView and returns its runtime instance, or null after a developer error.
export function renderTreeView( container, config, onValueChange = null )
{
    if ( !container ) { reportTreeViewIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeTreeViewConfig(config);
    if ( validateTreeViewConfig(merged) ) { return null; }

    container.innerHTML = buildTreeViewHTML(merged);
    const root = container.querySelector('.ui-tree-view');
    const tree = root.querySelector('.ui-tree-view-tree');
    const state = createTreeViewState();
    const controller = new AbortController();
    const valueCallback = merged.onValueChange ?? ( typeof onValueChange === 'function' ? onValueChange : null );
    const selecting = merged.selectionMode !== 'NONE', multiple = merged.selectionMode === 'MULTIPLE', cascade = merged.checkCascade;
    const tools = {}, actionButtons = [];
    // The Loader ring of each parent that is (or was) loading: id → { host, loader }.
    const loaders = new Map();
    const disabledActions = new Set(merged.actions.filter(action => action.disabled).map(action => action.key));
    let reportedCurrent = '';
    let noResults = null, dialog = null, destroyed = false, typed = '', typedTimer = 0, drag = null, instance = null;

    // ----- model ↔ DOM helpers -----

    // Returns the treeitem element of an id, or null.
    const itemElement = id => { const node = state.nodes.get(id); return node ? root.ownerDocument.getElementById(`${merged.id}-${node.domId}`) : null; };
    // Returns the ids of the treeitems that are currently shown (not in a closed branch, not filtered out), in order.
    const visibleIds = () => [ ...tree.querySelectorAll('li[role="treeitem"]') ].filter(element => element.getClientRects().length > 0).map(element => element.dataset.item);
    // Returns the value as the instance reports it (a copy).
    const currentValue = () => { const value = getTreeValue(state,merged); return Array.isArray(value) ? [ ...value ] : value; };
    // Returns the ids of the open parents, in display order.
    const expandedIds = () => allIds(state).filter(id => state.nodes.get(id).expanded);
    // Returns whether focus is inside the tree list.
    const focusInTree = () => tree.contains(document.activeElement);

    // Writes aria-checked (true, false or mixed) on every treeitem (MULTIPLE).
    function syncChecks() { if ( multiple ) { allIds(state).forEach(id => itemElement(id)?.setAttribute('aria-checked',checkStateOf(state,id,cascade))); } }

    // Rebuilds the tree list from the model (structural edits, setItems); keeps search marks, ticks and focus.
    function rebuildTree()
    {
        const hadFocus = focusInTree();
        if ( state.activeId && !state.nodes.has(state.activeId) ) { state.activeId = ''; }
        if ( !state.activeId ) { state.activeId = state.selectedId || state.roots[0] || ''; }
        tree.innerHTML = buildNodesHTML(merged,state,state.roots);
        syncChecks();
        applySearch(state.searchText);
        keepActiveVisible();
        state.nodes.forEach(( node, id ) => { if ( node.loading ) { showStatus(id); } });   // the rebuilt rows get their ring again
        if ( hadFocus ) { itemElement(state.activeId)?.focus(); }
        updateToolbar();
    }

    // Makes an item the current one: it takes Tab focus, shows the current-item frame and is the toolbar's target;
    // moves focus to it when asked.
    function setActive( id, focus = false )
    {
        if ( !state.nodes.has(id) ) { return; }
        if ( state.activeId !== id ) { const previous = itemElement(state.activeId); previous?.setAttribute('tabindex','-1'); previous?.classList.remove('ui-tree-view-current'); state.activeId = id; }
        const element = itemElement(id);
        element?.setAttribute('tabindex','0');
        element?.classList.add('ui-tree-view-current');
        if ( focus ) { element?.focus(); }
        updateToolbar();
    }

    // Reports a changed current item through onCurrentChange after a user action (user:false only records it, for
    // programmatic changes such as reveal() or setItems()).
    function syncCurrent( user )
    {
        if ( state.activeId === reportedCurrent ) { return; }
        reportedCurrent = state.activeId;
        if ( user ) { merged.onCurrentChange?.(state.nodes.has(reportedCurrent) ? itemCopy(state,reportedCurrent) : null,instance); }
    }

    // Keeps a shown item active when the active one disappears (filtered out, closed branch, deleted).
    function keepActiveVisible() { const shown = visibleIds(); if ( shown.length && !shown.includes(state.activeId) ) { setActive(shown[0]); } }

    // ----- validation -----

    // Shows or clears the error: tree aria-invalid, error text, described-by (help, then error).
    function renderValidation()
    {
        const invalid = Boolean(state.error), error = root.querySelector('.ui-tree-view-error');
        root.classList.toggle('ui-tree-view-invalid',invalid);
        error.textContent = state.error?.message ?? '';
        error.hidden = !invalid;
        const describedBy = [ merged.help ? `${merged.id}-help` : '', invalid ? error.id : '' ].filter(Boolean).join(' ');
        if ( invalid ) { tree.setAttribute('aria-invalid','true'); } else { tree.removeAttribute('aria-invalid'); }
        if ( describedBy ) { tree.setAttribute('aria-describedby',describedBy); } else { tree.removeAttribute('aria-describedby'); }
    }

    // Runs validation and shows or clears the error; returns { valid, errorLabel }.
    function runValidation()
    {
        let result = validateTreeSelection(merged,getTreeValue(state,merged));
        if ( result.valid && state.external ) { result = { valid:false, errorLabel:'EXTERNAL' }; }
        state.error = result.valid ? null : getTreeViewError(result.errorLabel,merged,result.errorLabel === 'EXTERNAL' ? state.external : '');
        renderValidation();
        return result;
    }

    // After a user change of the value: dirty, external error removed, a corrected error cleared, onValueChange if changed.
    function userValueChange( previous )
    {
        const value = currentValue();
        if ( JSON.stringify(previous) === JSON.stringify(value) ) { return; }
        state.isDirty = true;
        state.external = null;
        if ( state.error && validateTreeSelection(merged,value).valid ) { state.error = null; renderValidation(); }
        valueCallback?.(value,instance);
    }

    // ----- open / close and loading -----

    // Opens or closes a parent; children not loaded yet are loaded first. user: reported through onExpandChange.
    function setExpanded( id, expanded, user = false )
    {
        const node = state.nodes.get(id), element = itemElement(id);
        const shownOpen = element ? element.getAttribute('aria-expanded') === 'true' : node?.expanded;   // a search can show a branch open
        if ( !node?.hasChildren || node.loading || ( node.expanded === expanded && shownOpen === expanded ) ) { return false; }
        node.expanded = expanded;
        element?.setAttribute('aria-expanded',String(expanded));
        const group = element?.querySelector(':scope > .ui-tree-view-group');
        if ( group ) { group.hidden = !expanded; }
        if ( expanded && !node.loaded ) { loadChildren(id); }
        if ( !expanded ) { keepActiveVisible(); }
        if ( user ) { merged.onExpandChange?.(expandedIds(),instance); }
        return true;
    }

    // Writes the loading or error status of a parent (status text, aria-busy) and runs or hides its Loader ring (shown after
    // the Loader's delay, in place of the "Loading…" text, which stays for screen readers).
    function showStatus( id )
    {
        const node = state.nodes.get(id), element = itemElement(id);
        if ( !element ) { return; }
        const status = element.querySelector(':scope > .ui-tree-view-row .ui-tree-view-status');
        status.textContent = node.loading ? merged.texts.loading : node.loadError ? merged.texts.loadError : '';
        let entry = loaders.get(id);
        if ( entry && !entry.host.isConnected ) { entry.loader?.destroy(); loaders.delete(id); entry = null; }
        if ( node.loading && !entry )
        {
            const host = document.createElement('span');
            host.className = 'ui-tree-view-loader';
            status.after(host);
            entry = { host, loader:renderLoader(host,{ id:`${merged.id}-${node.domId}-loader`, shape:'RING', size:'SMALL', labelPlacement:'HIDDEN', label:merged.texts.loading }) };
            loaders.set(id,entry);
        }
        if ( node.loading ) { entry?.loader?.start(); } else { entry?.loader?.hide(); }
        if ( node.loading ) { element.setAttribute('aria-busy','true'); } else { element.removeAttribute('aria-busy'); }
        element.classList.toggle('ui-tree-view-load-error',node.loadError);
    }

    // Loads the children of a parent through loadChildren, then shows them (or the error; opening again retries).
    async function loadChildren( id )
    {
        const node = state.nodes.get(id);
        node.loading = true; node.loadError = false;
        showStatus(id);
        let items = null, failure = null;
        try { items = await merged.loadChildren(itemCopy(state,id),instance); } catch ( error ) { failure = error; }
        if ( destroyed || !state.nodes.has(id) ) { return; }
        node.loading = false;
        if ( failure || !Array.isArray(items) )
        {
            reportTreeViewIssue('LOAD_FAILED',{ id:merged.id, value:id, reason:failure?.message ?? 'the promise did not resolve to an array' });
            node.loadError = true; node.expanded = false;
            itemElement(id)?.setAttribute('aria-expanded','false');
            showStatus(id);
            return;
        }
        const previous = currentValue();
        addNodes(state,normalizeTreeItems(merged.id,items,true,new Set(state.nodes.keys())),id);
        node.loaded = true;
        if ( multiple && cascade && node.checked ) { descendantIds(state,id).forEach(child => { if ( !state.nodes.get(child).disabled ) { state.nodes.get(child).checked = true; } }); recomputeBranch(state,id); }
        node.hasChildren = node.children.length > 0;
        if ( !node.hasChildren ) { node.expanded = false; }
        rebuildBranch(id);
        showStatus(id);
        if ( selecting ) { userValueChange(previous); }
    }

    // Rebuilds one parent's sub-list (after its children were loaded).
    function rebuildBranch( id )
    {
        const node = state.nodes.get(id), element = itemElement(id);
        if ( !element ) { return; }
        element.querySelector(':scope > .ui-tree-view-group')?.remove();
        if ( node.hasChildren ) { element.setAttribute('aria-expanded',String(node.expanded)); element.insertAdjacentHTML('beforeend',`<ul class="ui-tree-view-group" role="group"${node.expanded ? '' : ' hidden'}>${buildNodesHTML(merged,state,node.children,levelOf(state,id) + 1)}</ul>`); }
        else { element.removeAttribute('aria-expanded'); }
        syncChecks();
        applySearch(state.searchText);
        updateToolbar();
    }

    // ----- selection -----

    // SINGLE: selects an enabled item. user: dirty, validation follow-up and onValueChange.
    function select( id, user )
    {
        const node = state.nodes.get(id);
        if ( !node || ( user && node.disabled ) ) { return; }
        const previous = currentValue();
        itemElement(state.selectedId)?.setAttribute('aria-selected','false');
        state.selectedId = id;
        itemElement(id)?.setAttribute('aria-selected','true');
        if ( user ) { userValueChange(previous); }
    }

    // MULTIPLE: ticks or unticks an enabled item (cascading when set) as the user did.
    function toggleCheck( id )
    {
        const node = state.nodes.get(id);
        if ( !node || node.disabled ) { return; }
        const previous = currentValue();
        setChecked(state,id,nextCheckedOf(state,id,cascade),cascade);
        syncChecks();
        userValueChange(previous);
    }

    // The user's main action on an item (row click, Enter, Space): NONE activates (and a click opens or closes a parent),
    // SINGLE selects, MULTIPLE ticks only with Space (a row click or Enter only makes the item current; the box ticks).
    function act( id, fromKeyboard, key = '' )
    {
        if ( merged.selectionMode === 'SINGLE' ) { select(id,true); return; }
        if ( multiple ) { if ( key === ' ' ) { toggleCheck(id); } return; }
        const node = state.nodes.get(id);
        if ( node.disabled ) { return; }
        if ( !fromKeyboard && node.hasChildren ) { setExpanded(id,!node.expanded,true); }
        merged.onActivate?.(itemCopy(state,id),instance);
    }

    // ----- search -----

    // Shows only the items whose text contains the search text, with their parents (opened to show them); marks the
    // matching text. An empty text restores the tree.
    function applySearch( text )
    {
        state.searchText = String(text ?? '').trim();
        const needle = state.searchText.toLowerCase();
        root.classList.toggle('ui-tree-view-searching',Boolean(needle));
        const matches = new Set(needle ? allIds(state).filter(id => state.nodes.get(id).label.toLowerCase().includes(needle)) : []);
        // returns whether an item is shown; post-order, so a parent knows about its children
        const walk = id =>
        {
            const node = state.nodes.get(id), element = itemElement(id);
            const childShown = node.children.map(walk).some(Boolean);
            const shown = !needle || matches.has(id) || childShown;
            if ( !element ) { return shown; }
            element.hidden = !shown;
            element.querySelector(':scope > .ui-tree-view-row .ui-tree-view-text').innerHTML = buildTextHTML(node.label,matches.has(id) ? state.searchText : '');
            const group = element.querySelector(':scope > .ui-tree-view-group');
            if ( group ) { const open = needle ? childShown : node.expanded; group.hidden = !open; element.setAttribute('aria-expanded',String(open)); }
            return shown;
        };
        state.roots.forEach(walk);
        if ( merged.search || needle )
        {
            noResults ??= renderMessage(root.querySelector('.ui-tree-view-no-results'),{ id:`${merged.id}-no-results`, type:'INFO', layout:'INLINE', text:merged.texts.noResults, visible:false });
            if ( needle && matches.size === 0 ) { noResults?.show(); } else { noResults?.hide(); }
        }
        keepActiveVisible();
    }

    // ----- editing -----

    // Returns the move a target position gives, or null when it is not allowed (into itself, into a branch not loaded,
    // refused by canMove). position: BEFORE / AFTER (a sibling of target) or INSIDE (last child of target; '' = top end).
    function planMove( id, targetId, position )
    {
        const node = state.nodes.get(id), target = targetId ? state.nodes.get(targetId) : null;
        if ( !node || node.disabled || ( target && ( targetId === id || ancestorIds(state,targetId).includes(id) ) ) ) { return null; }
        if ( position === 'INSIDE' && target && ( target.disabled || !target.loaded ) ) { return null; }
        const parentId = position === 'INSIDE' ? targetId : target.parentId;
        const siblings = childIdsOf(state,parentId).filter(sibling => sibling !== id);
        const index = position === 'INSIDE' ? siblings.length : siblings.indexOf(targetId) + ( position === 'AFTER' ? 1 : 0 );
        const previousParentId = node.parentId, previousIndex = childIdsOf(state,previousParentId).indexOf(id);
        if ( parentId === previousParentId && index === previousIndex ) { return null; }
        const move = { id, parentId, index, previousParentId, previousIndex };
        return !merged.canMove || merged.canMove({ ...move },instance) ? move : null;
    }

    // Applies a planned move (user action): model, cascade, tree list, focus, onEdit and onValueChange.
    function applyMove( move )
    {
        const previous = currentValue();
        moveNode(state,move.id,move.parentId,move.index);
        if ( move.parentId ) { state.nodes.get(move.parentId).expanded = true; }
        if ( cascade ) { recomputeAncestors(state,move.previousParentId); recomputeAncestors(state,move.parentId); }
        state.activeId = move.id;
        rebuildTree();
        itemElement(move.id)?.focus();
        merged.onEdit?.({ type:'MOVE', ...move },instance);
        if ( selecting ) { userValueChange(previous); }
    }

    // Returns the move of a toolbar tool for the active item, or null when it does not apply.
    function toolMove( tool )
    {
        const id = state.activeId, node = state.nodes.get(id);
        if ( !node ) { return null; }
        const siblings = childIdsOf(state,node.parentId), index = siblings.indexOf(id);
        if ( tool === 'move-up' ) { return index > 0 ? planMove(id,siblings[index - 1],'BEFORE') : null; }
        if ( tool === 'move-down' ) { return index < siblings.length - 1 ? planMove(id,siblings[index + 1],'AFTER') : null; }
        if ( tool === 'indent' ) { return index > 0 ? planMove(id,siblings[index - 1],'INSIDE') : null; }
        return node.parentId ? planMove(id,node.parentId,'AFTER') : null;
    }

    // Adds a new item after the active one (or at the top level end), or as the active item's last child, then renames it.
    function addItem( asChild )
    {
        const active = state.nodes.get(state.activeId);
        if ( asChild && ( !active || active.disabled || !active.loaded ) ) { return; }
        const parentId = asChild ? state.activeId : active?.parentId ?? '';
        const index = asChild ? active.children.length : active ? childIdsOf(state,parentId).indexOf(state.activeId) + 1 : state.roots.length;
        let id = '';
        do { state.newCounter += 1; id = `${merged.id}-new-${state.newCounter}`; } while ( state.nodes.has(id) );
        const previous = currentValue();
        addNodes(state,[ { id, label:merged.texts.newItem, icon:'', badge:'', disabled:false, expanded:false, selected:false, hasChildren:false, loaded:true, children:[] } ],parentId,index);
        if ( parentId ) { state.nodes.get(parentId).expanded = true; }
        if ( cascade ) { recomputeAncestors(state,parentId); }
        state.activeId = id;
        rebuildTree();
        merged.onEdit?.({ type:'ADD', id, parentId, index, label:merged.texts.newItem },instance);
        if ( selecting ) { userValueChange(previous); }
        startRename(id);
    }

    // Replaces an item's text with a field holding its name (Enter or leaving saves, Escape cancels).
    function startRename( id )
    {
        const node = state.nodes.get(id), element = itemElement(id);
        if ( !node || node.disabled || !element || state.renamingId ) { return; }
        state.renamingId = id;
        element.removeAttribute('draggable');
        const text = element.querySelector(':scope > .ui-tree-view-row .ui-tree-view-text');
        text.innerHTML = '<input class="ui-tree-view-rename" type="text" autocomplete="off">';
        const input = text.querySelector('input');
        input.value = node.label;
        input.setAttribute('aria-label',merged.texts.renameField.replace('{label}',node.label));
        bindTreeViewRenameEvents(input,controller.signal,{ onCommit:() => endRename(input.value), onCancel:() => endRename(null) });
        updateToolbar();
        input.focus();
        input.select();
    }

    // Ends renaming: saves a new non-empty name (onEdit RENAME) or keeps the old one; focus returns to the item.
    function endRename( value )
    {
        const id = state.renamingId, node = state.nodes.get(id);
        if ( !id ) { return; }
        state.renamingId = '';
        if ( !node ) { return; }
        const label = String(value ?? '').trim(), previousLabel = node.label, element = itemElement(id);
        if ( label && label !== previousLabel ) { node.label = label; }
        if ( element )
        {
            element.querySelector(':scope > .ui-tree-view-row .ui-tree-view-text').innerHTML = buildTextHTML(node.label,'');
            if ( merged.editable && !node.disabled ) { element.setAttribute('draggable','true'); }
            applySearch(state.searchText);
            if ( root.contains(document.activeElement) || document.activeElement === document.body ) { element.focus(); }
        }
        updateToolbar();
        if ( node.label !== previousLabel ) { merged.onEdit?.({ type:'RENAME', id, label:node.label, previousLabel },instance); }
    }

    // Deletes an item with its sub-items (user action): focus moves to the next, previous or parent item.
    function deleteItem( id )
    {
        const node = state.nodes.get(id);
        if ( !node || node.disabled ) { return; }
        const parentId = node.parentId, siblings = childIdsOf(state,parentId), index = siblings.indexOf(id);
        const next = siblings[index + 1] ?? siblings[index - 1] ?? parentId;
        const previous = currentValue();
        const ids = removeNode(state,id);
        if ( ids.includes(state.selectedId) ) { state.selectedId = ''; }
        if ( cascade ) { recomputeAncestors(state,parentId); }
        state.activeId = next || state.roots[0] || '';
        rebuildTree();
        itemElement(state.activeId)?.focus();
        merged.onEdit?.({ type:'DELETE', id, parentId, index, ids },instance);
        syncCurrent(true);
        if ( selecting ) { userValueChange(previous); }
    }

    // Asks before deleting (confirmDelete: a DANGER modal Message, Cancel focused), or deletes at once.
    function requestDelete( id )
    {
        const node = state.nodes.get(id);
        if ( !node || node.disabled ) { return; }
        if ( !merged.confirmDelete ) { deleteItem(id); return; }
        const count = descendantIds(state,id).length;
        dialog?.destroy();
        dialog = renderMessage(root.querySelector('.ui-tree-view-dialog'),{ id:`${merged.id}-confirm`, type:'DANGER', layout:'MODAL', title:merged.texts.deleteTitle.replace('{label}',node.label),
            text:count ? merged.texts.deleteTextChildren.replace('{count}',String(count)) : merged.texts.deleteText,
            actions:[ { key:'delete', label:merged.texts.deleteConfirm }, { key:'cancel', label:merged.texts.cancel, cancel:true } ],
            onAction:key => { if ( key === 'delete' ) { setTimeout(() => deleteItem(id),0); } },
            onClose:reason => setTimeout(() => { dialog?.destroy(); dialog = null; if ( reason !== 'ACTION' || state.nodes.has(id) ) { itemElement(state.activeId)?.focus(); } },0) });
    }

    // Enables the toolbar Buttons that apply to the current item and names it in their description (screen readers hear
    // e.g. "Rename, Invoice 01.xlsx").
    function updateToolbar()
    {
        const node = state.nodes.get(state.activeId), usable = Boolean(node) && !node.disabled && !state.renamingId;
        actionButtons.forEach(( button, index ) =>
        {
            button?.setDescription(node?.label ?? '');
            const action = merged.actions[index];
            button?.setDisabled(!usable || !merged.onAction || disabledActions.has(action.key) || ( merged.canAct ? !merged.canAct(action.key,itemCopy(state,state.activeId),instance) : false ));
        });
        if ( !merged.editable || !tools.add ) { return; }
        Object.values(tools).forEach(tool => tool.setDescription(node?.label ?? ''));
        tools.add.setDisabled(Boolean(state.renamingId));
        tools['add-child'].setDisabled(!usable || !node.loaded);
        tools.rename.setDisabled(!usable);
        tools.delete.setDisabled(!usable);
        [ 'move-up', 'move-down', 'indent', 'outdent' ].forEach(tool => tools[tool].setDisabled(!usable || !toolMove(tool)));
    }

    // Runs a toolbar tool on the active item.
    function runTool( tool )
    {
        const id = state.activeId;
        if ( tool === 'add' || tool === 'add-child' ) { addItem(tool === 'add-child'); return; }
        if ( tool === 'rename' ) { startRename(id); return; }
        if ( tool === 'delete' ) { requestDelete(id); return; }
        const move = toolMove(tool);
        if ( move ) { applyMove(move); }
        syncCurrent(true);
    }

    // Runs an application action on the current item (onAction); unavailable items never reach it (Button disabled).
    function runAction( index )
    {
        const node = state.nodes.get(state.activeId);
        if ( !node || node.disabled ) { return; }
        merged.onAction?.(merged.actions[index].key,itemCopy(state,state.activeId),instance);
    }

    // ----- drag and drop -----

    // Returns the drop position for a pointer over an item: the upper quarter BEFORE, the lower quarter AFTER, else INSIDE.
    function dropPosition( element, event )
    {
        const box = element.querySelector(':scope > .ui-tree-view-row').getBoundingClientRect(), y = event.clientY - box.top;
        return y < box.height / 4 ? 'BEFORE' : y > box.height * 3 / 4 ? 'AFTER' : 'INSIDE';
    }

    // Removes the drop marker.
    function clearDropMarker() { tree.querySelectorAll('[data-drop]').forEach(row => row.removeAttribute('data-drop')); }

    // ----- keyboard -----

    // Moves focus to the next item whose text starts with the typed letters (typing within a short pause adds letters).
    function typeAhead( key )
    {
        clearTimeout(typedTimer);
        typed += key.toLowerCase();
        typedTimer = setTimeout(() => { typed = ''; },500);
        const shown = visibleIds(), start = shown.indexOf(state.activeId);
        const order = [ ...shown.slice(start + ( typed.length === 1 ? 1 : 0 )), ...shown.slice(0,start + ( typed.length === 1 ? 1 : 0 )) ];
        const found = order.find(id => state.nodes.get(id).label.toLowerCase().startsWith(typed));
        if ( found ) { setActive(found,true); }
        return true;
    }

    // Handles a key on an item (ARIA tree pattern); returns whether the key was used.
    function handleKey( element, event )
    {
        const id = element.dataset.item, node = state.nodes.get(id), shown = visibleIds(), position = shown.indexOf(id);
        if ( event.altKey || event.ctrlKey || event.metaKey ) { return false; }
        switch ( event.key )
        {
            case 'ArrowDown': if ( position < shown.length - 1 ) { setActive(shown[position + 1],true); } return true;
            case 'ArrowUp': if ( position > 0 ) { setActive(shown[position - 1],true); } return true;
            case 'Home': setActive(shown[0],true); return true;
            case 'End': setActive(shown[shown.length - 1],true); return true;
            case 'ArrowRight':
            case 'ArrowLeft':
            {
                const forward = ( event.key === 'ArrowRight' ) !== ( getComputedStyle(tree).direction === 'rtl' );
                const open = element.getAttribute('aria-expanded') === 'true';
                if ( forward ) { if ( node.hasChildren && !open ) { setExpanded(id,true,true); } else if ( open && shown[position + 1] && node.children.includes(shown[position + 1]) ) { setActive(shown[position + 1],true); } }
                else if ( open ) { setExpanded(id,false,true); } else if ( node.parentId ) { setActive(node.parentId,true); }
                return true;
            }
            case 'Enter': act(id,true,'Enter'); return true;
            case ' ': act(id,true,' '); return true;
            case '*': if ( childIdsOf(state,node.parentId).map(sibling => setExpanded(sibling,true)).includes(true) ) { merged.onExpandChange?.(expandedIds(),instance); } return true;   // one report
            case 'F2': if ( merged.editable ) { startRename(id); return true; } return false;
            case 'Delete': if ( merged.editable ) { requestDelete(id); return true; } return false;
            default: return event.key.length === 1 && event.key !== ' ' ? typeAhead(event.key) : false;
        }
    }

    // ----- instance -----

    // Finds a node by id; reports unknown ids.
    function find( id ) { const key = String(id ?? ''); if ( state.nodes.has(key) ) { return key; } reportTreeViewIssue('UNKNOWN_ITEM',{ id:merged.id, value:id }); return ''; }

    // Loads a fresh item tree into the model (render and setItems): selection from the items' selected flags.
    function loadItems( items )
    {
        state.nodes.clear(); state.roots.length = 0; state.selectedId = ''; state.activeId = '';
        addNodes(state,items);
        const selected = selectedIdsOf(items);
        if ( !selecting && selected.length ) { reportTreeViewIssue('OPTION_IGNORED',{ id:merged.id, key:'items[].selected', condition:'selectionMode="NONE"' }); }
        if ( merged.selectionMode === 'SINGLE' && selected.length )
        {
            if ( selected.length > 1 ) { reportTreeViewIssue('SINGLE_SELECTED',{ id:merged.id, value:selected[0] }); }
            state.selectedId = selected[0];
            ancestorIds(state,selected[0]).forEach(parentId => { state.nodes.get(parentId).expanded = true; });
        }
        if ( multiple ) { selected.forEach(id => setChecked(state,id,true,cascade)); }
        state.activeId = state.selectedId || state.roots[0] || '';
    }

    const fieldMembers = selecting ?
    {
        name:merged.name,
        // Returns the effective label position: TOP or START (INHERIT follows an ancestor with the class ui-labels-start).
        getLabelPosition:() => ( merged.labelPosition !== 'INHERIT' ? merged.labelPosition : container.closest('.ui-labels-start') ? 'START' : 'TOP' ),
        // Returns the visible label (form-field contract: Form prefixes summary messages with it).
        getLabel:() => merged.label,
        // Returns { mandatory, indicator } (form-field contract).
        getMandatoryState:() => ({ mandatory:merged.mandatory, indicator:merged.mandatoryIndicator }),
        // Returns the value: SINGLE the selected id ('' when none); MULTIPLE a new array of ticked ids (see checkedValue).
        getValue:() => currentValue(),
        // Sets the value programmatically (no onValueChange, not dirty) and returns { valid, errorLabel }; unknown ids are
        // ignored. MULTIPLE ticks each id (cascading when set). options.quiet: no validation, any shown error removed.
        setValue:( value, options = {} ) =>
        {
            const wanted = ( Array.isArray(value) ? value : [ value ] ).filter(entry => entry !== undefined && entry !== null && entry !== '').map(String).filter(entry => state.nodes.has(entry));
            if ( multiple ) { allIds(state).forEach(id => { state.nodes.get(id).checked = false; }); wanted.forEach(id => setChecked(state,id,true,cascade)); syncChecks(); }
            else { itemElement(state.selectedId)?.setAttribute('aria-selected','false'); state.selectedId = wanted[0] ?? ''; itemElement(state.selectedId)?.setAttribute('aria-selected','true'); }
            if ( options?.quiet ) { state.external = null; state.isDirty = false; state.error = null; renderValidation(); return validateTreeSelection(merged,getTreeValue(state,merged)); }
            return runValidation();
        },
        // Returns whether the user has changed the value.
        isDirty:() => state.isDirty,
        // Returns a copy of the current error, or null.
        getError:() => ( state.error ? { ...state.error } : null ),
        // Runs validation and shows or clears the error; returns { valid, errorLabel }.
        validate:() => runValidation(),
        // Shows an external error (server or cross-field rule) until the user changes the value or clearError() is called.
        setError:( message ) => { state.external = String(message ?? '').trim() || null; return runValidation(); },
        // Removes an external error (own validation errors stay).
        clearError:() => { const shown = state.error?.errorLabel === 'EXTERNAL'; state.external = null; if ( shown ) { runValidation(); } }
    } : {};

    instance =
    {
        id:merged.id,
        ...fieldMembers,
        // Returns the current tree as item objects (config.items shape), e.g. to save an edited tree.
        getItems:() => treeCopy(state),
        // Returns a copy of one item { id, label, icon, badge, disabled, parentId, level, hasChildren }, or null.
        getItem:( id ) => ( state.nodes.has(String(id)) ? itemCopy(state,String(id)) : null ),
        // Enables or disables an application action (it is also unavailable while the current item does not allow it);
        // returns whether the key exists.
        setActionDisabled:( key, disabled ) =>
        {
            const action = merged.actions.find(entry => entry.key === String(key));
            if ( !action ) { reportTreeViewIssue('UNKNOWN_ACTION',{ id:merged.id, value:key }); return false; }
            if ( disabled ) { disabledActions.add(action.key); } else { disabledActions.delete(action.key); }
            updateToolbar();
            return true;
        },
        // Returns a copy of the current item (the framed one: last clicked or reached with the keyboard), or null.
        getCurrent:() => ( state.nodes.has(state.activeId) ? itemCopy(state,state.activeId) : null ),
        // Replaces the whole tree (programmatic: no callbacks); the selection comes from the new items' selected flags.
        setItems:( items ) => { loadItems(normalizeTreeItems(merged.id,items,Boolean(merged.loadChildren))); rebuildTree(); syncCurrent(false); if ( state.error ) { runValidation(); } },
        // Changes label, icon, badge or disabled of one item in place; returns whether the item exists.
        updateItem:( id, changes = {} ) =>
        {
            const key = find(id);
            if ( !key ) { return false; }
            const node = state.nodes.get(key), element = itemElement(key);
            if ( changes.label !== undefined && String(changes.label).trim() ) { node.label = String(changes.label).trim(); }
            if ( changes.icon !== undefined ) { node.icon = normalizeIconClass(merged.id,'icon',changes.icon); }
            if ( changes.badge !== undefined ) { node.badge = changes.badge === null || changes.badge === '' ? '' : String(changes.badge); }
            if ( changes.disabled !== undefined ) { node.disabled = Boolean(changes.disabled); }
            if ( element )
            {
                element.querySelector(':scope > .ui-tree-view-row').innerHTML = buildRowHTML(merged,state,key);
                if ( node.disabled ) { element.setAttribute('aria-disabled','true'); element.removeAttribute('draggable'); } else { element.removeAttribute('aria-disabled'); if ( merged.editable ) { element.setAttribute('draggable','true'); } }
                applySearch(state.searchText);
                showStatus(key);
            }
            updateToolbar();
            return true;
        },
        // Opens a parent (loading its children when needed); programmatic: no onExpandChange. Returns whether it changed.
        expand:( id ) => { const key = find(id); return key ? setExpanded(key,true) : false; },
        // Closes a parent; returns whether it changed.
        collapse:( id ) => { const key = find(id); const changed = key ? setExpanded(key,false) : false; syncCurrent(false); return changed; },
        // Opens every loaded parent (children not loaded yet stay closed); returns whether any changed.
        expandAll:() => allIds(state).filter(id => state.nodes.get(id).loaded).map(id => setExpanded(id,true)).some(Boolean),
        // Closes every parent; returns whether any changed.
        collapseAll:() => { const changed = allIds(state).map(id => setExpanded(id,false)).some(Boolean); syncCurrent(false); return changed; },
        // Opens the parents of an item, makes it the active item and scrolls it into view; returns whether it exists.
        reveal:( id ) =>
        {
            const key = find(id);
            if ( !key ) { return false; }
            ancestorIds(state,key).reverse().forEach(parentId => setExpanded(parentId,true));
            setActive(key);
            syncCurrent(false);
            itemElement(key)?.scrollIntoView({ block:'nearest' });
            return true;
        },
        // Filters the tree as the search field does ('' shows everything); the search field shows the same text.
        filter:( text ) => { const input = root.querySelector('.ui-tree-view-search-input'); if ( input ) { input.value = String(text ?? ''); } applySearch(text); syncCurrent(false); },
        // Moves focus to the active item (the selected one, or the first shown); returns whether it succeeded.
        focus:() => { keepActiveVisible(); const element = itemElement(state.activeId); element?.focus(); return Boolean(element) && document.activeElement === element; },
        // Removes listeners, timers, Buttons and Messages, then clears the container.
        destroy:() => { removeHintTooltip(); destroyed = true; controller.abort(); loaders.forEach(entry => entry.loader?.destroy()); loaders.clear(); clearTimeout(typedTimer); Object.values(tools).forEach(tool => tool?.destroy()); actionButtons.forEach(button => button?.destroy()); noResults?.destroy(); dialog?.destroy(); container.innerHTML = ''; }
    };

    loadItems(merged.items);
    tree.innerHTML = buildNodesHTML(merged,state,state.roots);
    syncChecks();
    if ( merged.search ) { applySearch(''); }
    keepActiveVisible();

    reportedCurrent = state.activeId;
    merged.actions.forEach(( action, index ) =>
    {
        const host = root.querySelector(`.ui-tree-view-action[data-action="${index}"]`);
        actionButtons.push(renderButton(host,buildActionButtonConfig(`${merged.id}-action-${index}`,action,'TERTIARY',action.disabled,merged.iconTooltip),() => runAction(index)));
    });
    updateToolbar();
    if ( merged.editable )
    {
        TOOLS.forEach(( [ key, textKey, icon, withText ] ) =>
        {
            const host = root.querySelector(`.ui-tree-view-tool[data-tool="${key}"]`);
            tools[key] = renderButton(host,withText
                ? { id:`${merged.id}-${key}`, hierarchy:'TERTIARY', size:'SMALL', label:merged.texts[textKey], iconBefore:icon }
                : { id:`${merged.id}-${key}`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL', icon, ariaLabel:merged.texts[textKey], tooltipMode:merged.iconTooltip },() => runTool(key));
        });
        updateToolbar();
    }

    // Wraps a user-event handler so a changed current item is reported afterwards (onCurrentChange).
    const reporting = handler => ( ...args ) => { const result = handler(...args); syncCurrent(true); return result; };
    bindTreeViewEvents(tree,controller.signal,
    {
        onKey:reporting(handleKey),
        onToggleClick:reporting(element => { const id = element.dataset.item; setActive(id,true); setExpanded(id,element.getAttribute('aria-expanded') !== 'true',true); }),
        onRowClick:reporting(element => { const id = element.dataset.item; setActive(id,true); act(id,false); }),
        onCheckClick:reporting(element => { const id = element.dataset.item; setActive(id,true); toggleCheck(id); }),
        onFocusItem:reporting(element => setActive(element.dataset.item)),
        onDragStart:( element, event ) =>
        {
            const id = element.dataset.item, node = state.nodes.get(id);
            if ( !merged.editable || node.disabled || state.renamingId ) { event.preventDefault(); return; }
            drag = id;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain',node.label);
            element.classList.add('ui-tree-view-dragging');
        },
        onDragOver:( element, event ) =>
        {
            if ( !drag ) { return; }
            const position = dropPosition(element,event), move = planMove(drag,element.dataset.item,position);
            clearDropMarker();
            if ( !move ) { event.dataTransfer.dropEffect = 'none'; return; }
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            element.querySelector(':scope > .ui-tree-view-row').setAttribute('data-drop',position.toLowerCase());
        },
        onDrop:( element, event ) =>
        {
            if ( !drag ) { return; }
            event.preventDefault();
            const move = planMove(drag,element.dataset.item,dropPosition(element,event));
            clearDropMarker();
            tree.querySelector('.ui-tree-view-dragging')?.classList.remove('ui-tree-view-dragging');
            drag = null;
            if ( move ) { applyMove(move); }
            syncCurrent(true);
        },
        onDragClear:clearDropMarker,
        onDragEnd:() => { clearDropMarker(); tree.querySelector('.ui-tree-view-dragging')?.classList.remove('ui-tree-view-dragging'); drag = null; }
    });
    const searchInput = root.querySelector('.ui-tree-view-search-input');
    if ( searchInput ) { bindTreeViewSearchEvents(searchInput,controller.signal,{ onSearch:reporting(applySearch), onSearchDown:reporting(() => { const shown = visibleIds(); if ( !shown.length ) { return false; } setActive(shown.includes(state.activeId) ? state.activeId : shown[0],true); return true; }) }); }
    const removeHintTooltip = attachHintTooltip(container,merged.id,merged.tooltipMode,{ onlyWhenTruncated:true });
    return instance;
}
