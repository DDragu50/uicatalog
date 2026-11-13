// formHTML.js
//
// GENERATED MARKUP.
// The form shell: hosts for the error summary and messages (Message), optional required-field note, content area,
// action-button hosts, the Loader host (busyIndicator) and the confirmation-dialog host.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the action-button hosts for the configured mode; with busyIndicator BUTTONS the Loader host comes first (alone,
// after the content, when there are no buttons).
function buildActionsHTML( config )
{
    const main = config.mode === 'SUBMIT' ? ( config.showSubmit ? '<span data-button="submit"></span>' : '' ) : ( config.liveApply === 'BUTTON' ? '<span data-button="apply"></span>' : '' );
    const hosts = [ main, config.showReset ? '<span data-button="reset"></span>' : '', config.showClear ? '<span data-button="clear"></span>' : '', config.showCancel ? '<span data-button="cancel"></span>' : '' ].join('');
    const loader = config.busyIndicator === 'BUTTONS' ? '<span class="ui-form-loader-host"></span>' : '';
    return hosts ? `<div class="ui-form-actions ui-form-actions-${config.buttonsAlign.toLowerCase()}">${loader}${hosts}</div>` : loader;
}

// Builds the form shell.
export function buildFormHTML( config )
{
    const id = escapeHTML(config.id);
    const classes = [ 'ui-form', `ui-form-mode-${config.mode.toLowerCase()}`, config.labelPosition === 'START' ? 'ui-labels-start' : '' ].filter(Boolean).join(' ');
    const note = config.requiredNote === 'NEVER' ? '' : `<p class="ui-form-required-note"${config.requiredNote === 'AUTO' ? ' hidden' : ''}>${escapeHTML(config.texts.requiredNote)}</p>`;
    return `<form id="${id}" class="${classes}" novalidate style="--ui-form-columns:${config.columns}">`
        + '<div class="ui-form-summary-host"></div><div class="ui-form-message-host"></div>'
        + note
        + '<div class="ui-form-content"></div>'
        + buildActionsHTML(config)
        + ( config.busyIndicator === 'OVERLAY' ? '<div class="ui-form-overlay-host"></div>' : '' )
        + '<div class="ui-form-dialog-host"></div>'
        + '</form>';
}
