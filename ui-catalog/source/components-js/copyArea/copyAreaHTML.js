// copyAreaHTML.js
//
// GENERATED MARKUP.
// The area (code, plain text or the host of the application's content), the host of the Copy button, the message
// shown when the copy fails and the status region that announces the result. Texts are inserted as text, never as HTML.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Builds the inner HTML of the code element: the escaped text, one span per line when line numbers are shown.
export function buildCodeHTML( text, lineNumbers )
{
    if ( !lineNumbers ) { return escapeHTML(text); }
    return String(text).split('\n').map(line => `<span class="ui-copy-area-line">${escapeHTML(line)}</span>`).join('\n');
}

// Builds the shown part: a scrollable code block (always left-to-right, also on right-to-left pages), a plain text, or
// the host of the application's content.
function buildBodyHTML( config )
{
    const name = escapeHTML(config.label || config.texts.region);
    if ( config.mode === 'CONTENT' ) { return `<div class="ui-copy-area-body" role="region" tabindex="0" aria-label="${name}"></div>`; }
    if ( config.mode === 'PLAIN' ) { return `<span class="ui-copy-area-text">${escapeHTML(config.text)}</span>`; }
    return `<pre class="ui-copy-area-body" role="region" tabindex="0" aria-label="${name}" dir="ltr"><code>${buildCodeHTML(config.text,config.lineNumbers)}</code></pre>`;
}

// Builds the CopyArea markup (a span for a plain text, so it can stand inside running text; otherwise a div); the
// Copy button is rendered into its host by the component.
export function buildCopyAreaHTML( config )
{
    const tag = config.mode === 'PLAIN' ? 'span' : 'div';
    const classes = [ 'ui-copy-area', `ui-copy-area-${toClassPart(config.mode)}`, `ui-copy-area-button-${toClassPart(config.copyButton)}`, config.lineNumbers ? 'ui-copy-area-line-numbers' : '' ].filter(Boolean).join(' ');
    return `<${tag} id="${escapeHTML(config.id)}" class="${classes}">`
        + buildBodyHTML(config)
        + '<span class="ui-copy-area-action" data-button="copy"></span>'
        + '<span class="ui-copy-area-message" hidden></span>'
        + '<span class="ui-copy-area-status ui-copy-area-visually-hidden" role="status"></span>'
        + `</${tag}>`;
}
