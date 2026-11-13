// selectHTML.js
//
// GENERATED MARKUP.
// NATIVE: a real <select> (options and groups as <option>/<optgroup>).
// CUSTOM: a combobox button plus a listbox in a top-layer popover (ARIA select-only combobox pattern).
// Markup is rendered once; selection, errors and ARIA state are updated in place.

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Groups consecutive options by their group heading, preserving order.
function groupOptions( options )
{
    const groups = [];
    options.forEach(option =>
    {
        const last = groups[groups.length - 1];
        if ( last && last.group === option.group ) { last.options.push(option); } else { groups.push({ group:option.group, options:[ option ] }); }
    });
    return groups;
}

// Builds the optional-text or mandatory-asterisk marker; the asterisk is aria-hidden (aria-required announces it).
function buildMandatoryIndicatorHTML( config )
{
    if ( !config.mandatory && config.mandatoryIndicator === 'OPTIONAL_TEXT' ) { return ` <span class="ui-select-optional">${escapeHTML(config.texts.optional)}</span>`; }
    if ( config.mandatory && config.mandatoryIndicator === 'MANDATORY_ASTERISK' ) { return ' <span class="ui-select-mandatory" aria-hidden="true">*</span>'; }
    return '';
}

// Returns the ids the control is described by (help and the native multiple hint); errors are added at runtime.
export function baseDescribedBy( config, presentation )
{
    const hint = presentation === 'NATIVE' && config.selectionMode === 'MULTIPLE' && config.showMultipleHint;
    return [ config.help ? `${config.id}-help` : '', hint ? `${config.id}-hint` : '' ].filter(Boolean);
}

// Builds the help, hint and error area shared by both presentations.
function buildFooterHTML( config, presentation )
{
    const id = escapeHTML(config.id);
    const help = config.help ? `<div id="${id}-help" class="ui-select-help">${escapeHTML(config.help)}</div>` : '';
    const hint = baseDescribedBy(config,presentation).includes(`${config.id}-hint`) ? `<div id="${id}-hint" class="ui-select-help">${escapeHTML(config.texts.multipleHint)}</div>` : '';
    return `${help}${hint}<div id="${id}-error" class="ui-select-error" hidden></div>`;
}

// Builds a native <select> with placeholder (single), options and optgroups.
function buildNativeHTML( config, values )
{
    const id = escapeHTML(config.id);
    const multiple = config.selectionMode === 'MULTIPLE';
    const option = item => `<option value="${escapeHTML(item.value)}"${values.includes(item.value) ? ' selected' : ''}${item.disabled ? ' disabled' : ''}>${escapeHTML(item.label)}</option>`;
    const body = groupOptions(config.options).map(group => group.group ? `<optgroup label="${escapeHTML(group.group)}">${group.options.map(option).join('')}</optgroup>` : group.options.map(option).join('')).join('');
    const placeholder = multiple ? '' : `<option value=""${values.length ? '' : ' selected'}>${escapeHTML(config.texts.placeholder)}</option>`;
    const describedBy = baseDescribedBy(config,'NATIVE').join(' ');
    const attributes = [ multiple ? `multiple size="${Math.min(8,Math.max(3,config.options.length))}"` : '', 'aria-invalid="false"', config.mandatory ? 'aria-required="true"' : '', describedBy ? `aria-describedby="${describedBy}"` : '', config.state === 'INACTIVE' ? 'disabled' : '' ].filter(Boolean).join(' ');
    return `<label id="${id}-label" class="ui-select-label" for="${id}">${escapeHTML(config.label)}${buildMandatoryIndicatorHTML(config)}</label>`
        + `<div class="ui-select-control"><select id="${id}" name="${escapeHTML(config.name)}" class="ui-select-native-field${multiple ? ' ui-select-native-multiple' : ''}" ${attributes}>${placeholder}${body}</select>${multiple ? '' : '<span class="ui-select-chevron" aria-hidden="true"></span>'}</div>`;
}

// Builds one custom listbox option.
function buildCustomOptionHTML( config, option, values )
{
    const id = escapeHTML(config.id);
    return `<div id="${id}-option-${option.index}" class="ui-select-option" role="option" data-index="${option.index}" aria-selected="${values.includes(option.value)}"${option.disabled ? ' aria-disabled="true"' : ''}><span class="ui-select-check" aria-hidden="true"></span><span class="ui-select-option-label">${escapeHTML(option.label)}</span></div>`;
}

// Builds the custom combobox trigger and its popover listbox.
function buildCustomHTML( config, values )
{
    const id = escapeHTML(config.id);
    const multiple = config.selectionMode === 'MULTIPLE';
    const describedBy = baseDescribedBy(config,'CUSTOM').join(' ');
    const style = ` style="--ui-select-hover-bg:var(${config.optionHoverBackgroundToken});--ui-select-hover-color:var(${config.optionHoverColorToken});--ui-select-selected-bg:var(${config.optionSelectedBackgroundToken});--ui-select-selected-color:var(${config.optionSelectedColorToken})"`;
    const clear = !multiple && !config.mandatory ? `<div id="${id}-option-clear" class="ui-select-option ui-select-option-clear" role="option" data-index="-1" aria-selected="false"><span class="ui-select-check" aria-hidden="true"></span><span class="ui-select-option-label">${escapeHTML(config.texts.clear)}</span></div>` : '';
    const groups = groupOptions(config.options).map(( group, index ) => group.group
        ? `<div class="ui-select-group" role="group" aria-labelledby="${id}-group-${index}"><div id="${id}-group-${index}" class="ui-select-group-label" role="presentation">${escapeHTML(group.group)}</div>${group.options.map(option => buildCustomOptionHTML(config,option,values)).join('')}</div>`
        : group.options.map(option => buildCustomOptionHTML(config,option,values)).join('')).join('');
    const search = config.searchable ? `<input id="${id}-search" class="ui-select-search" type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="${id}-listbox" aria-label="${escapeHTML(config.texts.search)}" placeholder="${escapeHTML(config.texts.search)}" autocomplete="off" spellcheck="false">` : '';
    const trigger = [ 'type="button"', 'role="combobox"', 'aria-haspopup="listbox"', 'aria-expanded="false"', `aria-controls="${id}-listbox"`, `aria-labelledby="${id}-label"`, 'aria-invalid="false"', config.mandatory ? 'aria-required="true"' : '', describedBy ? `aria-describedby="${describedBy}"` : '', config.state === 'INACTIVE' ? 'disabled' : '' ].filter(Boolean).join(' ');
    return `<span id="${id}-label" class="ui-select-label">${escapeHTML(config.label)}${buildMandatoryIndicatorHTML(config)}</span>`
        + `<button id="${id}" class="ui-select-trigger" ${trigger}><span class="ui-select-value" aria-hidden="true"></span><span class="ui-select-more" aria-hidden="true"></span><span id="${id}-value-text" class="ui-select-visually-hidden"></span><span class="ui-select-chevron" aria-hidden="true"></span></button>`
        + `<div id="${id}-popup" class="ui-select-popup" popover="manual"${style}>${search}<div id="${id}-listbox" class="ui-select-listbox" role="listbox" aria-labelledby="${id}-label" tabindex="-1"${multiple ? ' aria-multiselectable="true"' : ''}>${clear}${groups}</div><div class="ui-select-no-matches" hidden>${escapeHTML(config.texts.noMatches)}</div><span class="ui-select-visually-hidden" aria-live="polite"></span></div>`;
}

// Builds Select markup for the configured state and effective presentation; INVISIBLE renders nothing.
function buildMarkup( config, presentation, values )
{
    if ( config.state === 'INVISIBLE' ) { return ''; }
    const width = `ui-select-width-${toClassPart(config.width)}`;
    if ( config.state === 'VIEW' )
    {
        const labels = config.options.filter(option => values.includes(option.value)).map(option => option.label).join(', ');
        return `<div class="ui-select-wrapper ${width}"><p class="ui-select-label">${escapeHTML(config.label)}</p><p class="ui-select-view-value">${escapeHTML(labels)}</p></div>`;
    }
    const body = presentation === 'CUSTOM' ? buildCustomHTML(config,values) : buildNativeHTML(config,values);
    return `<div class="ui-select-wrapper ${width} ui-select-${presentation.toLowerCase()}">${body}${buildFooterHTML(config,presentation)}</div>`;
}

// Adds the explicit label-position class to the root element; INHERIT adds none (the ancestor class ui-labels-start decides).
function withLabelPosition( html, config ) { return !html || config.labelPosition === 'INHERIT' ? html : html.replace('class="',`class="ui-select-label-${config.labelPosition.toLowerCase()} `); }

// Returns the component markup with its label-position class.
export function buildSelectHTML( config, presentation, values ) { return withLabelPosition(buildMarkup(config, presentation, values),config); }
