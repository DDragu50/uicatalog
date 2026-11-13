// chipHTML.js
//
// GENERATED MARKUP.
// Converts normalized, validated configuration into Chip markup; no DOM access or events.

import { removeLabelFor } from './chipConfig.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Generates an optional decorative icon (position: 'before' at the start, 'after' at the end).
function buildChipIcon( icon, position ) { return icon ? `<i class="ui-chip-icon-${position} ${escapeHTML(icon)}" aria-hidden="true"></i>` : ''; }

// Generates the visible label with its optional bold prefix.
function buildChipLabel( config ) { return `<span class="ui-chip-label">${config.prefix ? `<b>${escapeHTML(config.prefix)}</b> ` : ''}${escapeHTML(config.label)}</span>`; }

// Generates the optional accessible remove action.
function buildChipRemoveButton( config )
{
    if ( !config.removable ) { return ''; }
    return `<button type="button" class="ui-chip-remove" data-chip-remove="${escapeHTML(config.id)}" aria-label="${escapeHTML(removeLabelFor(config))}"><span aria-hidden="true">&times;</span></button>`;
}

// Generates the custom design-token mapping.
function buildCustomStyle( config ) { return config.type === 'CUSTOM' ? ` style="--ui-chip-custom-bg:var(${config.backgroundToken});--ui-chip-custom-color:var(${config.colorToken})"` : ''; }

// Generates one Chip.
export function buildChipHTML( config )
{
    const classes = [ 'ui-chip', `ui-chip-${config.type.toLowerCase()}`, config.bordered ? 'ui-chip-bordered' : '' ].filter(Boolean).join(' ');
    const id = config.id ? ` data-chip-id="${escapeHTML(config.id)}"` : '';
    return `<span class="${classes}"${id}${buildCustomStyle(config)}>${buildChipIcon(config.iconBefore,'before')}${buildChipLabel(config)}${buildChipIcon(config.iconAfter,'after')}${buildChipRemoveButton(config)}</span>`;
}
