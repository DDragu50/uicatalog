// actionMenuEvents.js
//
// USER INTERACTIONS.
// Menu keyboard and click handling, plus the document-level listeners needed while the menu is open.

// Registers menu item clicks and keyboard navigation.
export function registerActionMenuEvents( menu, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    menu.addEventListener('click',event => { const item = event.target.closest('.ui-action-menu-item'); if ( item ) { handlers.onItem(item,event); } },{ signal });
    menu.addEventListener('keydown',event => handlers.onKeyDown(event),{ signal });
    menu.addEventListener('pointermove',event => { const item = event.target.closest('.ui-action-menu-item'); if ( item && item !== document.activeElement ) { item.focus(); } },{ signal });
    return controller;
}

// Registers outside press, scroll and resize while the menu is open.
export function registerOpenMenuEvents( root, handlers )
{
    const controller = new AbortController();
    const signal = controller.signal;
    document.addEventListener('pointerdown',event => { if ( !root.contains(event.target) ) { handlers.onOutsidePress(); } },{ signal, capture:true });
    window.addEventListener('scroll',() => handlers.onReposition(),{ signal, capture:true, passive:true });
    window.addEventListener('resize',() => handlers.onReposition(),{ signal });
    return controller;
}
