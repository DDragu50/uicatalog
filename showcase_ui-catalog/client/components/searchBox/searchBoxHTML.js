// searchBoxHTML.js
//
// GENERATED MARKUP.
// The search box shell; Clear/Search Buttons and the scope list are rendered into their hosts afterwards.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the search box shell.
function buildMarkup( config )
{
    const id = escapeHTML(config.id);
    const role = config.landmark ? ' role="search"' : '';
    const labelClass = config.labelVisible ? 'ui-search-box-label' : 'ui-search-box-label ui-search-box-visually-hidden';
    const button = config.showSearchButton ? '<span class="ui-search-box-button-host"></span>' : '';
    const scopes = config.scopes.length ? '<div class="ui-search-box-scopes-host"></div>' : '';
    return `<div id="${id}" class="ui-search-box ui-search-box-width-${config.width.toLowerCase().replace(/_/g,'-')}"${role}>`
        + `<label class="${labelClass}" for="${id}-input">${escapeHTML(config.label)}</label>`
        + '<div class="ui-search-box-row">'
        + '<div class="ui-search-box-control">'
        + `<input id="${id}-input" class="ui-search-box-input" type="search" autocomplete="${escapeHTML(config.autocomplete)}" enterkeyhint="search" spellcheck="false" placeholder="${escapeHTML(config.placeholder)}" aria-describedby="${id}-help"${config.disabled ? ' disabled' : ''}>`
        + '<span class="ui-search-box-busy-icon" aria-hidden="true" hidden><i class="fa-solid fa-spinner"></i></span>'
        + '<span class="ui-search-box-clear-host" hidden></span>'
        + '</div>'
        + button
        + '</div>'
        + scopes
        + `<div id="${id}-help" class="ui-search-box-help"></div>`
        + '<div class="ui-search-box-message-host"></div>'
        + '</div>';
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-search-box-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildSearchBoxHTML( config ) { return withLabelPosition(buildMarkup(config),config); }
