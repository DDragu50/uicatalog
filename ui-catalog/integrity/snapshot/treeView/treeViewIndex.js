// treeViewIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports TreeView only from this file.
//
// renderTreeView(container, config, onValueChange)
//   Renders an ARIA tree into a dedicated, consumer-owned container and returns
//   { id, getItems, getItem, getCurrent, setItems, updateItem, expand, collapse, expandAll, collapseAll, reveal, filter, focus, destroy }
//   plus, when selectionMode is SINGLE or MULTIPLE, the form-field members
//   { name, getValue, setValue, validate, getError, setError, clearError, isDirty, getLabel, getLabelPosition, getMandatoryState };
//   or null after a developer error.
//
// config.items: [{ id, label, icon?, badge?, disabled?, expanded?, selected?, hasChildren?, children? }].
// Callbacks fire only for user actions: onValueChange(value, instance) (config.onValueChange takes precedence over the
// third argument), onActivate(item, instance) (selectionMode NONE), onExpandChange(expandedIds, instance),
// onEdit(change, instance) (editable), onCurrentChange(item, instance), onAction(key, item, instance) (config.actions: the
// application's toolbar buttons acting on the current item). config.loadChildren(item, instance) returns a promise of items;
// config.canMove(move, instance) and config.canAct(key, item, instance) return whether a move or an action is allowed.
//
// Enumerated values are canonical UPPER_CASE and accepted case-insensitively.
//
// Everything not exported here is internal implementation.

export { renderTreeView } from './treeViewComponent.js';
export { DEFAULT_TREE_VIEW_CONFIG, TREE_VIEW_TOOLTIP_MODES, TREE_VIEW_SELECTION_MODES, TREE_VIEW_CHECKED_VALUES, TREE_VIEW_LABEL_POSITIONS, TREE_VIEW_MANDATORY_INDICATORS } from './treeViewConfig.js';
