// contentGroupHTML.js
//
// GENERATED MARKUP.
// The group shell only; children are rendered afterwards into their own item hosts.
// Both semantics share one frame: a <fieldset> whose <legend> (the label) notches the border natively.
// For SECTION the frame has role="none", so it is visual only and the outer <section> carries the semantics.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the inner frame content: optional label (notch), optional title (SECTION), optional description, content area.
function buildFrameContent( config, id )
{
    const label = config.label ? `<legend id="${id}-label" class="ui-content-group-label">${escapeHTML(config.label)}</legend>` : '';
    const title = config.title ? `<h${config.headingLevel} id="${id}-title" class="ui-content-group-title">${escapeHTML(config.title)}</h${config.headingLevel}>` : '';
    const description = config.description ? `<p id="${id}-description" class="ui-content-group-description">${escapeHTML(config.description)}</p>` : '';
    return `${label}${title}${description}<div class="ui-content-group-content"></div>`;
}

// Returns the group shell for the configured semantic.
export function buildContentGroupHTML( config )
{
    const id = escapeHTML(config.id);
    const classes = [ 'ui-content-group', `ui-content-group-${config.direction.toLowerCase()}`, config.bordered ? '' : 'ui-content-group-bare' ].filter(Boolean).join(' ');
    const style = ` style="--ui-content-group-span:${config.span}"`;
    const describedBy = config.description ? ` aria-describedby="${id}-description"` : '';
    if ( config.semantic === 'SECTION' )
    {
        const nameId = config.title ? `${id}-title` : config.label ? `${id}-label` : '';
        const labelledBy = nameId ? ` aria-labelledby="${nameId}"` : '';
        return `<section id="${id}" class="${classes}"${style}${labelledBy}${describedBy}><fieldset class="ui-content-group-frame" role="none">${buildFrameContent(config,id)}</fieldset></section>`;
    }
    return `<fieldset id="${id}" class="${classes} ui-content-group-frame"${style}${describedBy}${config.disabled ? ' disabled' : ''}>${buildFrameContent(config,id)}</fieldset>`;
}
