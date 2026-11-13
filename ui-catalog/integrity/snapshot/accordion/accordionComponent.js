// accordionComponent.js
//
// COMPONENT COORDINATOR.
// Stacks CollapsiblePanels (declared dependency, created through its public entry point) and coordinates them:
// SINGLE mode closes the open item when another one is opened; JOINED draws one frame with dividers around PLAIN
// panels, SEPARATE stacks the panels as cards; every header sits inside a heading of one level; Up / Down / Home / End
// move between headers. The Accordion never styles or reads the inside of a panel. The container is a dedicated,
// consumer-owned mount point.

import { mergeAccordionConfig, validateAccordionConfig } from './accordionConfig.js';
import { buildAccordionHTML } from './accordionHTML.js';
import { registerAccordionEvents } from './accordionEvents.js';
import { reportAccordionIssue } from './accordionErrors.js';
import { renderCollapsiblePanel } from '../collapsiblePanel/collapsiblePanelIndex.js';

// Builds the CollapsiblePanel configuration of one item: the item's own options, plus what the Accordion owns.
function buildPanelConfig( config, panel, onToggle )
{
    const result = { ...panel, headingLevel:config.headingLevel, onToggle };
    if ( panel.tooltipMode === undefined && config.iconTooltip !== 'NONE' ) { result.tooltipMode = config.iconTooltip; }   // the panels' icon actions
    if ( config.look === 'JOINED' )
    {
        delete result.bordered; delete result.cornerRadius;
        result.variant = 'PLAIN';
        return result;
    }
    const variant = String(panel.variant ?? 'DEFAULT').toUpperCase();
    if ( variant !== 'INLINE' && variant !== 'PLAIN' ) { result.bordered = panel.bordered ?? config.bordered; result.cornerRadius = panel.cornerRadius ?? config.cornerRadius; }
    return result;
}

// Renders an Accordion and returns its runtime instance, or null after a developer error.
export function renderAccordion( container, config )
{
    if ( !container ) { reportAccordionIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeAccordionConfig(config);
    if ( validateAccordionConfig(merged) ) { return null; }

    container.innerHTML = buildAccordionHTML(merged);
    const root = container.querySelector('.ui-accordion');
    const entries = [];   // { index, id, panel } in display order
    let controller = null, instance = null;

    const openIds = () => entries.filter(entry => entry.panel.getState() === 'EXPANDED').map(entry => entry.id);

    // SINGLE mode: closes every item except the given one (programmatic: no callbacks).
    function closeOthers( keep )
    {
        if ( merged.expandMode !== 'SINGLE' ) { return; }
        entries.filter(entry => entry !== keep).forEach(entry => entry.panel.collapse());
    }

    // Moves focus from the header of the item at an index to another header; returns whether it handled the key.
    function navigate( index, key )
    {
        if ( !merged.keyboardNavigation ) { return false; }
        const position = entries.findIndex(entry => entry.index === index);
        if ( position < 0 ) { return false; }
        const count = entries.length;
        const order = key === 'Home' ? entries.map(( _, step ) => step)
            : key === 'End' ? entries.map(( _, step ) => count - 1 - step)
            : entries.map(( _, step ) => ( key === 'ArrowDown' ? position + 1 + step : position - 1 - step + count * 2 ) % count);
        // the first header that can take focus (disabled and non-collapsible items have no focusable header)
        return order.some(step => entries[step].panel.focus());
    }

    // Finds the entry of an item id; reports unknown ids.
    function find( id )
    {
        const entry = entries.find(item => item.id === String(id));
        if ( !entry ) { reportAccordionIssue('UNKNOWN_ITEM',{ id:merged.id, value:id }); }
        return entry ?? null;
    }

    instance =
    {
        id:merged.id,
        // Returns the ids of the open items, in display order.
        getOpenIds:() => openIds(),
        // Opens an item (SINGLE: closes the others); returns false when unknown, not collapsible or already open.
        expand:( id ) => { const entry = find(id); if ( !entry ) { return false; } const changed = entry.panel.expand(); if ( entry.panel.getState() === 'EXPANDED' ) { closeOthers(entry); } return changed; },
        // Closes an item; returns false when unknown, not collapsible or already closed.
        collapse:( id ) => { const entry = find(id); return entry ? entry.panel.collapse() : false; },
        // Opens every item (MULTIPLE only); returns whether any item changed.
        expandAll:() =>
        {
            if ( merged.expandMode === 'SINGLE' ) { reportAccordionIssue('OPTION_IGNORED',{ id:merged.id, key:'expandAll()', condition:'expandMode="SINGLE"' }); return false; }
            return entries.map(entry => entry.panel.expand()).some(Boolean);
        },
        // Closes every item; returns whether any item changed.
        collapseAll:() => entries.map(entry => entry.panel.collapse()).some(Boolean),
        // Returns the CollapsiblePanel instance of an item (e.g. for setStatus()), or null.
        getPanel:( id ) => entries.find(entry => entry.id === String(id))?.panel ?? null,
        // Returns the CollapsiblePanel instances in display order; a Form finds fields through their getChildren().
        getChildren:() => entries.map(entry => entry.panel),
        // Moves focus to the first header that can take it; returns whether it succeeded.
        focus:() => entries.some(entry => entry.panel.focus()),
        // Removes the listener and the panels, then clears the container.
        destroy:() => { controller?.abort(); entries.splice(0).forEach(entry => entry.panel.destroy()); container.innerHTML = ''; }
    };

    merged.items.forEach(item =>
    {
        const host = root.querySelector(`.ui-accordion-item[data-index="${item.index}"]`);
        let entry = null;
        // A user toggle: the item's own onToggle first, then SINGLE coordination, then onChange.
        const onToggle = ( state, panel ) =>
        {
            item.panel.onToggle?.(state,panel);
            if ( state === 'EXPANDED' ) { closeOthers(entry); }
            merged.onChange?.(openIds(),instance);
        };
        const panel = renderCollapsiblePanel(host,buildPanelConfig(merged,item.panel,onToggle),item.content);
        if ( !panel ) { reportAccordionIssue('ITEM_NOT_RENDERED',{ id:merged.id, index:item.index }); host.remove(); return; }
        entry = { index:item.index, id:panel.id, panel };
        entries.push(entry);
    });
    controller = registerAccordionEvents(root,{ onNavigate:navigate });
    return instance;
}
