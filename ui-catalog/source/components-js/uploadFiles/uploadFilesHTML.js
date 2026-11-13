// uploadFilesHTML.js
//
// GENERATED MARKUP.
// The field (label, the hidden native file input, the Button host in a plain bar or in the drop area, the limits line,
// help, error), the file list and one list entry (preview or type icon, name, size and status, reason, the Loader host
// and the hosts of the Remove / Cancel / Retry Buttons), the summary line and the live regions.

import { describeAccept, fileIcon, fillText, formatSize } from './uploadFilesFiles.js';

// Escapes text inserted into generated HTML.
export function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

// Returns the limits line: "PDF or images · up to 10 MB each · at most 5 files · up to 20 MB in total" ('' without limits).
export function buildLimitsText( config )
{
    const t = config.texts;
    const text = [ describeAccept(config.accept,t),
        config.maxFileSize ? fillText(t.limitsSize,{ size:formatSize(config.maxFileSize,config.locale) }) : '',
        config.multiple && config.maxFiles ? fillText(t.limitsFiles,{ count:config.maxFiles }) : '',
        config.maxTotalSize ? fillText(t.limitsTotal,{ size:formatSize(config.maxTotalSize,config.locale) }) : '',
        config.allowPaste ? t.paste : '' ].filter(Boolean).join(t.separator);
    return text.charAt(0).toLocaleUpperCase(config.locale || undefined) + text.slice(1);   // "images · …" → "Images · …"
}

// Builds the optional-text or mandatory-asterisk marker and the hidden "required" word.
function buildMarkerHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-upload-files-optional">${escapeHTML(config.texts.optional)}</span>`; }
    const asterisk = config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ? ' <span class="ui-upload-files-mandatory" aria-hidden="true">*</span>' : '';
    return `${asterisk}${config.mandatory ? `<span class="ui-upload-files-visually-hidden"> (${escapeHTML(config.texts.required)})</span>` : ''}`;
}

// Builds the whole field (the list starts empty; entries are added by the component).
export function buildUploadFilesHTML( config )
{
    const id = escapeHTML(config.id), t = config.texts;
    const classes = [ 'ui-upload-files', `ui-upload-files-layout-${toClassPart(config.layout)}`, `ui-upload-files-mode-${toClassPart(config.uploadMode)}`,
        config.labelPosition !== 'INHERIT' ? `ui-upload-files-label-${toClassPart(config.labelPosition)}` : '', config.showPreviews ? 'ui-upload-files-previews' : '' ].filter(Boolean).join(' ');
    const capture = config.camera === 'NONE' ? '' : ` capture="${config.camera === 'BACK' ? 'environment' : 'user'}"`;
    const accept = config.accept.length ? ` accept="${escapeHTML(config.accept.join(','))}"` : '';
    const input = `<input id="${id}-input" class="ui-upload-files-input" type="file" tabindex="-1" aria-hidden="true"${config.multiple ? ' multiple' : ''}${accept}${capture} hidden>`;
    const limits = config.showLimits ? buildLimitsText(config) : '';
    const control = config.layout === 'DROPZONE'
        ? `<div class="ui-upload-files-dropzone"><span class="ui-upload-files-dropzone-icon" aria-hidden="true"><i class="fa-solid fa-cloud-arrow-up"></i></span><span class="ui-upload-files-dropzone-text">${escapeHTML(config.multiple ? t.dropzone : t.dropzoneOne)}</span><span class="ui-upload-files-choose" data-button="choose"></span></div>`
        : '<div class="ui-upload-files-bar"><span class="ui-upload-files-choose" data-button="choose"></span></div>';
    return `<div id="${id}" class="${classes}">`
        + `<span id="${id}-label" class="ui-upload-files-label">${escapeHTML(config.label)}${buildMarkerHTML(config)}</span>`
        + `<div class="ui-upload-files-control">${input}${control}`
        + ( limits ? `<div id="${id}-limits" class="ui-upload-files-limits">${escapeHTML(limits)}</div>` : '' )
        + ( config.help ? `<div id="${id}-help" class="ui-upload-files-help">${escapeHTML(config.help)}</div>` : '' )
        + `<ul class="ui-upload-files-list" aria-label="${escapeHTML(t.list)}" hidden></ul>`
        + `<div class="ui-upload-files-summary" hidden></div>`
        + `<div id="${id}-error" class="ui-upload-files-error" hidden></div></div>`
        + '<div class="ui-upload-files-live ui-upload-files-visually-hidden" aria-live="polite"></div><div class="ui-upload-files-alert ui-upload-files-visually-hidden" aria-live="assertive"></div>'
        + '</div>';
}

// Returns an address that is safe in a link ('' for javascript:, data: and vbscript: addresses).
function safeUrl( value )
{
    const url = String(value ?? '').trim();
    return /^\s*(javascript|data|vbscript):/i.test(url) ? '' : url;
}

// Builds one list entry; its status, reason, progress and Buttons are filled by the component.
export function buildEntryHTML( config, entry )
{
    const id = `${escapeHTML(config.id)}-${entry.key}`;
    const visual = entry.previewUrl && config.showPreviews
        ? `<img class="ui-upload-files-preview" src="${escapeHTML(entry.previewUrl)}" alt="">`
        : `<span class="ui-upload-files-icon" aria-hidden="true"><i class="${fileIcon(entry)}"></i></span>`;
    const url = safeUrl(entry.saved?.url);
    const name = url ? `<a class="ui-upload-files-name" href="${escapeHTML(url)}" target="_blank" rel="noopener"${hintAttribute(config.tooltipMode,entry.name)}>${escapeHTML(entry.name)}</a>` : `<span class="ui-upload-files-name"${hintAttribute(config.tooltipMode,entry.name)}>${escapeHTML(entry.name)}</span>`;
    return `<li id="${id}" class="ui-upload-files-item" data-key="${entry.key}" data-status="${entry.status}">${visual}`
        + `<span class="ui-upload-files-text">${name}<span class="ui-upload-files-meta"><span class="ui-upload-files-size">${entry.size === null || entry.size === undefined ? '' : escapeHTML(formatSize(entry.size,config.locale))}</span><span class="ui-upload-files-status"></span></span><span class="ui-upload-files-reason" hidden></span><span class="ui-upload-files-progress"></span></span>`
        + '<span class="ui-upload-files-actions"><span class="ui-upload-files-action" data-button="retry" hidden></span><span class="ui-upload-files-action" data-button="cancel" hidden></span><span class="ui-upload-files-action" data-button="remove"></span></span>'
        + '</li>';
}
