// chipComponent.js
//
// COMPONENT COORDINATOR.
// Static builders and the managed Chip list. The container is a dedicated, consumer-owned mount point.

import { mergeChipConfig, validateChipConfig } from './chipConfig.js';
import { buildChipHTML } from './chipHTML.js';
import { registerChipEvents } from './chipEvents.js';
import { reportChipIssue } from './chipErrors.js';

// Normalizes and validates one Chip; returns null for an invalid Chip (reported by validateChipConfig).
function prepareChipConfig( config )
{
    const merged = mergeChipConfig(config);
    return validateChipConfig(merged) ? null : merged;
}

// Normalizes a Chip collection, omitting invalid Chips and Chips whose id is already used in the collection.
function prepareChipConfigs( configs )
{
    if ( !Array.isArray(configs) ) { reportChipIssue('CONFIGS_NOT_ARRAY'); return null; }
    const ids = new Set();
    return configs.map(prepareChipConfig).filter(config =>
    {
        if ( !config ) { return false; }
        if ( !config.id ) { return true; }
        if ( ids.has(config.id) ) { reportChipIssue('DUPLICATE_ID',{ id:config.id }); return false; }
        ids.add(config.id);
        return true;
    });
}

// Builds static markup for one Chip.
export function buildChip( config )
{
    const merged = prepareChipConfig(config);
    return merged ? buildChipHTML(merged) : '';
}

// Builds static markup for a Chip collection.
export function buildChips( configs = [] )
{
    const merged = prepareChipConfigs(configs);
    return merged ? merged.map(buildChipHTML).join('') : '';
}

// Renders a managed Chip list and returns its runtime API, or null after a developer error.
export function renderChips( container, chips = [], onRemove )
{
    if ( !container ) { reportChipIssue('CONTAINER_REQUIRED'); return null; }
    let configs = prepareChipConfigs(chips);
    if ( !configs ) { return null; }

    // Draws the current Chip collection.
    const draw = () => { container.innerHTML = `<div class="ui-chip-list">${configs.map(buildChipHTML).join('')}</div>`; };
    draw();
    const controller = registerChipEvents(container,id => configs.find(config => config.id === id) ?? null,onRemove);

    return {
        // Replaces the rendered collection using the same configuration contract.
        setChips:( next ) => { const nextConfigs = prepareChipConfigs(next); if ( nextConfigs ) { configs = nextConfigs; draw(); } },
        // Removes the listener and clears the container.
        destroy:() => { controller.abort(); container.innerHTML = ''; }
    };
}
