// actionMenuComponent.js
//
// COMPONENT COORDINATOR.
// An icon Button (three dots by default; tertiary, or secondary with a border when bordered) opens a popover menu of
// actions and links (ARIA menu button pattern): arrow keys, Home/End, type-ahead, Enter/Space, Escape and Tab; opens
// below or above, and aligned to the trigger's end or start, depending on the space. The container is a dedicated,
// consumer-owned mount point.

import { mergeActionMenuConfig, validateActionMenuConfig } from './actionMenuConfig.js';
import { buildActionMenuHTML } from './actionMenuHTML.js';
import { registerActionMenuEvents, registerOpenMenuEvents } from './actionMenuEvents.js';
import { reportActionMenuIssue } from './actionMenuErrors.js';
import { renderButton } from '../button/buttonIndex.js';

const GAP = 4;

// Renders an ActionMenu and returns its runtime instance, or null after a developer error.
export function renderActionMenu( container, config, onAction )
{
    if ( !container ) { reportActionMenuIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeActionMenuConfig(config);
    if ( validateActionMenuConfig(merged) ) { return null; }

    container.innerHTML = buildActionMenuHTML(merged);
    const root = container.querySelector('.ui-action-menu');
    const menu = root.querySelector('.ui-action-menu-list');
    const items = [ ...menu.querySelectorAll('.ui-action-menu-item') ];
    const callback = merged.onAction ?? ( typeof onAction === 'function' ? onAction : null );
    let open = false, openController = null, controller = null, typed = '', typedTimer = null, instance = null;

    const enabled = () => items.filter(item => item.getAttribute('aria-disabled') !== 'true');

    // Positions the menu below the trigger (or above without room), aligned to the trigger's end; when the menu does
    // not fit on that side of the window, it is aligned to the trigger's start (opens towards the other side); as a last
    // resort it is kept inside the window.
    function position()
    {
        const rect = trigger.getElement().getBoundingClientRect();
        if ( rect.bottom < 0 || rect.top > window.innerHeight ) { close(false); return; }
        const height = menu.offsetHeight, width = menu.offsetWidth;
        const top = window.innerHeight - rect.bottom - GAP < height && rect.top > height ? rect.top - GAP - height : rect.bottom + GAP;
        const rtl = getComputedStyle(root).direction === 'rtl';
        const endAligned = rtl ? rect.left : rect.right - width, startAligned = rtl ? rect.right - width : rect.left;
        const fits = value => value >= GAP && value + width <= window.innerWidth - GAP;
        const preferred = fits(endAligned) ? endAligned : fits(startAligned) ? startAligned : endAligned;
        const left = Math.max(GAP,Math.min(preferred,window.innerWidth - width - GAP));
        menu.style.setProperty('--ui-action-menu-top',`${top}px`);
        menu.style.setProperty('--ui-action-menu-left',`${left}px`);
    }

    // Opens the menu and focuses the first (or last) enabled item.
    function openMenu( focusLast = false )
    {
        if ( open || merged.disabled ) { return; }
        open = true;
        trigger.getElement().setAttribute('aria-expanded','true');
        if ( typeof menu.showPopover === 'function' ) { menu.showPopover(); } else { menu.classList.add('ui-action-menu-open'); }
        position();
        const list = enabled();
        ( focusLast ? list[list.length - 1] : list[0] )?.focus();
        openController = registerOpenMenuEvents(root,{ onOutsidePress:() => close(false), onReposition:position });
    }

    // Closes the menu; optionally returns focus to the trigger.
    function close( returnFocus )
    {
        if ( !open ) { return; }
        open = false;
        openController?.abort();
        trigger.getElement().setAttribute('aria-expanded','false');
        if ( typeof menu.hidePopover === 'function' ) { menu.hidePopover(); } else { menu.classList.remove('ui-action-menu-open'); }
        if ( returnFocus ) { trigger.getElement().focus(); }
    }

    // Runs an item: actions report their key; links navigate (the report still happens before navigation).
    function choose( item, event )
    {
        if ( item.getAttribute('aria-disabled') === 'true' ) { event?.preventDefault(); return; }
        close(true);
        callback?.(item.dataset.key,instance);
    }

    // Moves focus among enabled items (wrapping), or jumps by type-ahead.
    function handleKeyDown( event )
    {
        const list = enabled(), index = list.indexOf(document.activeElement);
        const move = target => { event.preventDefault(); list[target]?.focus(); };
        if ( event.key === 'ArrowDown' ) { move(( index + 1 ) % list.length); }
        else if ( event.key === 'ArrowUp' ) { move(( index - 1 + list.length ) % list.length); }
        else if ( event.key === 'Home' ) { move(0); }
        else if ( event.key === 'End' ) { move(list.length - 1); }
        else if ( event.key === 'Escape' ) { event.preventDefault(); close(true); }
        else if ( event.key === 'Tab' ) { close(false); }
        else if ( event.key === ' ' && document.activeElement?.matches('a') ) { event.preventDefault(); document.activeElement.click(); }
        else if ( event.key.length === 1 && /\S/.test(event.key) )
        {
            clearTimeout(typedTimer);
            typed += event.key.toLowerCase();
            typedTimer = setTimeout(() => { typed = ''; },500);
            const match = [ ...list.slice(index + 1), ...list.slice(0,index + 1) ].find(item => item.textContent.trim().toLowerCase().startsWith(typed));
            if ( match ) { event.preventDefault(); match.focus(); }
        }
    }

    const trigger = renderButton(root.querySelector('.ui-action-menu-trigger-host'),{ id:merged.id, buttonVariant:'ICON_BUTTON', hierarchy:merged.bordered ? 'SECONDARY' : 'TERTIARY', size:merged.size, icon:merged.icon, ariaLabel:merged.label, disabled:merged.disabled, tooltipMode:merged.iconTooltip },() => ( open ? close(true) : openMenu() ));
    trigger.getElement().setAttribute('aria-haspopup','menu');
    trigger.getElement().setAttribute('aria-expanded','false');
    trigger.getElement().setAttribute('aria-controls',menu.id);
    trigger.getElement().addEventListener('keydown',event => { if ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) { event.preventDefault(); openMenu(event.key === 'ArrowUp'); } });

    instance =
    {
        id:merged.id,
        // Opens the menu (e.g. from a keyboard shortcut).
        open:() => openMenu(),
        // Closes the menu.
        close:() => close(false),
        // Moves focus to the trigger.
        focus:() => { trigger.getElement().focus(); return document.activeElement === trigger.getElement(); },
        // Closes the menu, removes listeners and the trigger Button, then clears the container.
        destroy:() => { close(false); clearTimeout(typedTimer); controller?.abort(); trigger.destroy(); container.innerHTML = ''; }
    };

    controller = registerActionMenuEvents(menu,{ onItem:choose, onKeyDown:handleKeyDown });
    return instance;
}
