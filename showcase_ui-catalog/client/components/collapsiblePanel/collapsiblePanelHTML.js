// collapsiblePanelHTML.js
//
// GENERATED MARKUP.
// Panel-owned structure only; Chip and Button markup is rendered by their own components.

// Escapes consumer text before inserting it into generated markup.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds the optional leading panel icon.
function buildIconHTML( config ) { return config.icon ? `<i class="ui-collapsible-panel-icon ${escapeHTML(config.icon)}" aria-hidden="true"></i>` : ''; }

// Builds the title and optional description.
function buildTitlesHTML( config )
{
    const description = config.description ? `<span class="ui-collapsible-panel-description">${escapeHTML(config.description)}</span>` : '';
    return `<span class="ui-collapsible-panel-titles"><span class="ui-collapsible-panel-title" id="${escapeHTML(config.id)}-title">${escapeHTML(config.title)}</span>${description}</span>`;
}

// Builds empty hosts populated by the Chip component and the action Buttons (one host per action).
function buildComponentsHTML( config )
{
    const chips = config.chips.length ? '<div class="ui-collapsible-panel-chips"></div>' : '';
    const actions = config.actions.length ? `<div class="ui-collapsible-panel-actions">${config.actions.map(action => `<span class="ui-collapsible-panel-action" data-action="${escapeHTML(action.key)}"></span>`).join('')}</div>` : '';
    return `${chips}${actions}`;
}

// Builds the interactive toggle or the static heading; with headingLevel 2–6 it sits inside <h2>…<h6>, so screen
// readers can list and jump between panel headers (WAI-ARIA accordion pattern).
function buildHeaderControlHTML( config )
{
    const inner = `${config.collapsible ? '<span class="ui-collapsible-panel-chevron" aria-hidden="true"></span>' : ''}${buildIconHTML(config)}${buildTitlesHTML(config)}`;
    const control = config.collapsible
        ? `<button type="button" class="ui-collapsible-panel-toggle" aria-expanded="${config.state === 'EXPANDED'}" aria-controls="${escapeHTML(config.id)}-content"${config.disabled ? ' disabled' : ''}>${inner}</button>`
        : `<div class="ui-collapsible-panel-heading">${inner}</div>`;
    return config.headingLevel ? `<h${config.headingLevel} class="ui-collapsible-panel-heading-level">${control}</h${config.headingLevel}>` : control;
}

// Builds the complete panel shell; header components and content children are mounted afterwards.
export function buildPanelHTML( config )
{
    const id = escapeHTML(config.id);
    const variant = config.variant === 'DEFAULT' ? '' : ` ui-collapsible-panel-${config.variant.toLowerCase()}`;
    const frame = ( config.bordered ? ' ui-collapsible-panel-bordered' : '' ) + ( config.cornerRadius === 'NONE' && config.variant !== 'INLINE' && config.variant !== 'PLAIN' ? ' ui-collapsible-panel-square' : '' );
    return `<section id="${id}" class="ui-collapsible-panel${variant}${frame}" data-state="${config.state}" data-status="${config.status}" data-show-summary-expanded="${config.showSummaryWhenExpanded}">`
        + `<div class="ui-collapsible-panel-header">${buildHeaderControlHTML(config)}${buildComponentsHTML(config)}</div>`
        + '<div class="ui-collapsible-panel-summary"></div>'
        + `<div class="ui-collapsible-panel-content" id="${id}-content" role="region" aria-labelledby="${id}-title"></div>`
        + '</section>';
}

// Builds consumer-owned summary markup, or the escaped empty-state text.
export function buildSummaryHTML( config, instance )
{
    if ( config.summaryRenderer ) { const summary = config.summaryRenderer(instance); return summary == null ? '' : String(summary); }
    return config.summaryEmptyText ? `<span class="ui-collapsible-panel-summary-empty">${escapeHTML(config.summaryEmptyText)}</span>` : '';
}
