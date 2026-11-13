// messageHTML.js
//
// GENERATED MARKUP.
// One structure for all layouts: icon, body (title, text with optional link, details list, action Button hosts)
// and an optional close Button host. MODAL uses a native <dialog>; the others a <div>.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds the remaining-time indicator of a temporary message: a bar and/or a text (both hidden from assistive
// technology, they change constantly) and one visually hidden sentence read with the message ("Closes by itself in 6
// seconds."). The component updates the bar (--ui-message-remaining, 1 → 0) and the text while the time runs.
function buildRemainingHTML( config )
{
    if ( config.remainingIndicator === 'NONE' ) { return ''; }
    const seconds = String(Math.ceil(config.duration / 1000));
    const bar = config.remainingIndicator !== 'TEXT' ? '<span class="ui-message-remaining-bar" aria-hidden="true"><span class="ui-message-remaining-fill"></span></span>' : '';
    const text = config.remainingIndicator !== 'BAR' ? `<span class="ui-message-remaining-text" aria-hidden="true">${escapeHTML(config.texts.remaining.replace('{seconds}',seconds))}</span>` : '';
    return `<div class="ui-message-remaining">${bar}${text}<span class="ui-message-visually-hidden">${escapeHTML(config.texts.closesIn.replace('{seconds}',seconds))}</span></div>`;
}

// Builds the body: title, text (+ link), details, action hosts and the remaining-time indicator.
export function buildBodyHTML( config, content, actions )
{
    const id = escapeHTML(config.id);
    const title = content.title ? `<p id="${id}-title" class="ui-message-title">${escapeHTML(content.title)}</p>` : '';
    const link = content.link ? ` <a class="ui-message-link" href="${escapeHTML(content.link.href)}">${escapeHTML(content.link.label)}</a>` : '';
    const detail = ( item, index ) => ( item.href || item.onClick ? `<li><a class="ui-message-detail-link" href="${escapeHTML(item.href || '#')}" data-detail="${index}">${escapeHTML(item.label)}</a></li>` : `<li>${escapeHTML(item.label)}</li>` );
    const details = content.details.length && config.layout !== 'INLINE' ? `<ul class="ui-message-details">${content.details.map(detail).join('')}</ul>` : '';
    const hosts = actions.length && config.layout !== 'INLINE' ? `<div class="ui-message-actions">${actions.map(action => `<span class="ui-message-action" data-action="${escapeHTML(action.key)}"></span>`).join('')}</div>` : '';
    return `${title}<p id="${id}-text" class="ui-message-text">${escapeHTML(content.text)}${link}</p>${details}${hosts}${buildRemainingHTML(config)}`;
}

// Returns the inline custom-colour properties for CUSTOM messages.
function customStyle( config )
{
    if ( config.type !== 'CUSTOM' ) { return ''; }
    const parts = [ config.backgroundToken ? `--ui-message-bg:var(${config.backgroundToken})` : '', config.colorToken ? `--ui-message-color:var(${config.colorToken})` : '', config.borderToken ? `--ui-message-border:var(${config.borderToken})` : '' ].filter(Boolean);
    return parts.length ? ` style="${parts.join(';')}"` : '';
}

// Returns the classes of the message element: layout, type, and for boxes the border and corner choices.
export function messageClasses( config, content )
{
    return `ui-message ui-message-${config.layout.toLowerCase()} ui-message-type-${content.type.toLowerCase()}`
        + ( config.bordered ? ' ui-message-bordered' : '' ) + ( config.cornerRadius === 'NONE' ? ' ui-message-square' : '' );
}

// Builds the message element (hidden when not visible).
export function buildMessageHTML( config, content, actions )
{
    const id = escapeHTML(config.id);
    const classes = messageClasses(config,content);
    const inner = `<span class="ui-message-icon" aria-hidden="true"><i class="${escapeHTML(content.icon)}"></i></span><div class="ui-message-body">${buildBodyHTML(config,content,actions)}</div>${config.closable ? '<span class="ui-message-close-host"></span>' : ''}`;
    if ( config.layout === 'MODAL' ) { return `<dialog id="${id}" class="${classes}"${customStyle(config)}${content.title ? ` aria-labelledby="${id}-title"` : ''} aria-describedby="${id}-text">${inner}</dialog>`; }
    return `<div id="${id}" class="${classes}"${customStyle(config)}${config.visible ? '' : ' hidden'}>${inner}</div>`;
}
