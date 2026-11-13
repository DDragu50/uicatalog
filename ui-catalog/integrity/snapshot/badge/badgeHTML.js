// badgeHTML.js
//
// GENERATED MARKUP.
// A link (href), a button (onClick) or a plain group holding the Notification host and the name / description text.
// The accessible name is the visible text plus the Notification indicator's meaning (visually hidden).

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

// Builds the text part: name, optional description, and the hidden indicator meaning.
export function buildTextHTML( name, description, speech, mode = 'TITLE' )
{
    return `<span class="ui-badge-name"${hintAttribute(mode,name)}>${escapeHTML(name)}</span>${description ? `<span class="ui-badge-description"${hintAttribute(mode,description)}><span class="ui-badge-visually-hidden">, </span>${escapeHTML(description)}</span>` : ''}${speech ? `<span class="ui-badge-visually-hidden">, ${escapeHTML(speech)}</span>` : ''}`;
}

// Builds the badge shell.
export function buildBadgeHTML( config )
{
    const id = escapeHTML(config.id);
    const classes = `ui-badge ui-badge-${config.layout.toLowerCase()} ui-badge-size-${config.size.toLowerCase()}${config.href || config.onClick ? ' ui-badge-interactive' : ''}`;
    const colours = [ config.colorToken ? `--ui-badge-color:var(${config.colorToken})` : '', config.descriptionColorToken ? `--ui-badge-description-color:var(${config.descriptionColorToken})` : '' ].filter(Boolean).join(';');
    const style = colours ? ` style="${colours}"` : '';
    const inner = `${config.notification ? '<span class="ui-badge-notification-host"></span>' : ''}<span class="ui-badge-text">${buildTextHTML(config.name,config.description,'',config.tooltipMode)}</span>`;
    if ( config.href ) { return `<a id="${id}" class="${classes}" href="${escapeHTML(config.href)}"${style}>${inner}</a>`; }
    if ( config.onClick ) { return `<button id="${id}" class="${classes}" type="button"${style}>${inner}</button>`; }
    return `<span id="${id}" class="${classes}" role="group" aria-label="${escapeHTML(config.name)}"${style}>${inner}</span>`;
}
