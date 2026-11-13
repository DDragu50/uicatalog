// sideNavigationState.js
//
// RUNTIME STATE.
// Per-instance items, current item, open branches, rail and drawer state, and tree helpers.

// Creates independent runtime state from the normalized configuration.
export function createSideNavigationState( config )
{
    return { items:config.items, currentId:config.currentId, expanded:new Set(config.expandedIds), rail:config.railCollapsed && config.allowRail, drawerOpen:false, query:'', flyoutId:null };
}

// Visits every ITEM of the tree with its ancestors (ITEM ids only).
export function walkItems( items, visit, ancestors = [] )
{
    items.forEach(item =>
    {
        if ( item.type === 'ITEM' ) { visit(item,ancestors); walkItems(item.children,visit,[ ...ancestors, item.id ]); }
        else if ( item.type === 'GROUP' ) { walkItems(item.children,visit,ancestors); }
    });
}

// Returns the item with an id (or href), with its ancestors: { item, ancestors } or null.
export function findItem( items, key )
{
    let found = null;
    walkItems(items,( item, ancestors ) => { if ( !found && ( item.id === key || ( item.href && item.href === key ) ) ) { found = { item, ancestors }; } });
    return found;
}

// Returns the top-level ITEMs (directly in the tree or in a top-level group) without an icon.
export function topLevelWithoutIcon( items ) { return items.flatMap(item => ( item.type === 'GROUP' ? item.children : [ item ] )).filter(item => item.type === 'ITEM' && !item.icon); }

// Counts the ITEMs of the tree (for the search threshold).
export function countItems( items ) { let count = 0; walkItems(items,() => { count++; }); return count; }
