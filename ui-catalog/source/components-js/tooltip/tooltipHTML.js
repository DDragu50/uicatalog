// tooltipHTML.js
//
// GENERATED MARKUP.
// The tooltip bubble: the text, the optional keyboard shortcut and the arrow. It is a manual popover (drawn in the top
// layer, above every other layer and never cut off by its ancestors). With targets it is hidden from screen readers:
// the elements already carry their text.

// Escapes consumer text before inserting it into generated markup.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Builds the tooltip (hidden until shown).
export function buildTooltipHTML( config )
{
    const classes = [ 'ui-tooltip', `ui-tooltip-tone-${toClassPart(config.tone)}`, config.arrow ? 'ui-tooltip-with-arrow' : '' ].filter(Boolean).join(' ');
    const role = config.targets ? 'aria-hidden="true"' : 'role="tooltip"';
    const shortcut = `<kbd class="ui-tooltip-shortcut"${config.shortcut ? '' : ' hidden'}>${escapeHTML(config.shortcut)}</kbd>`;
    const arrow = config.arrow ? '<span class="ui-tooltip-arrow" aria-hidden="true"></span>' : '';
    return `<div id="${escapeHTML(config.id)}" class="${classes}" ${role} popover="manual" data-side="TOP"><span class="ui-tooltip-text"></span>${shortcut}${arrow}</div>`;
}
