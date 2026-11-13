// accordionHTML.js
//
// GENERATED MARKUP.
// The Accordion frame and one empty item host per item; each host receives a CollapsiblePanel.

// Escapes consumer text before inserting it into generated markup.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Builds the frame with its item hosts.
export function buildAccordionHTML( config )
{
    const classes = [ 'ui-accordion', `ui-accordion-${toClassPart(config.look)}`, config.bordered ? 'ui-accordion-bordered' : '', config.cornerRadius === 'NONE' ? 'ui-accordion-square' : '' ].filter(Boolean).join(' ');
    const hosts = config.items.map(entry => `<div class="ui-accordion-item" data-index="${entry.index}"></div>`).join('');
    return `<div id="${escapeHTML(config.id)}" class="${classes}" data-expand-mode="${config.expandMode}">${hosts}</div>`;
}
