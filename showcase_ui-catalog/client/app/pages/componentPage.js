// componentPage.js
//
// COMPONENT PAGE (template for every component).
// Wide screens: title, keywords (bordered Chips, not clickable), a small list (no frame) with the components it uses and
// the components it is used by (links), its definition (the README summary, after a book icon), the live example (showcase styling, in its own frame, no frame border, no heading) with its
// output (CollapsiblePanel, collapsed at first), the examples when the adjustment file lists them (groups of fixed
// configurations with their settings, a third frame), the states table when the adjustment file asks for it (one column per
// value of an option, one row per state; a second frame, fixed configuration, no heading), then the README's "When to use",
// "Key features" and "Dependencies" (always shown, text exactly as written) and a line with a Button that opens the whole README on its own
// page (#/component/{id}/readme, documentPage.js; secondary Button).
// On the right the Variants column, two areas stacked: 1. a line ("For a cleaner view…" when open, "Expand to experiment…" when
// collapsed) with a small tertiary icon Button at its end (double chevron up / down; the size of the menu's) and a bottom line; 2. the
// Variants panel (the customization panel: it chooses which variant the live example shows; the look itself is set in showcase-styling),
// open at first. The Button collapses or expands it, and the choice is remembered for every component page (localStorage). Area 1
// and the panel's header (Variants, Render) stay at the top while the column scrolls.
// Narrow screens (below 960px): the column is hidden; under the README line, a second line "For experimenting variants…"
// with a secondary Button "Show variants" opens the Variants page instead.

import { renderButton } from '../../components/button/buttonIndex.js';
import { buildChips } from '../../components/chip/chipIndex.js';
import { renderCollapsiblePanel } from '../../components/collapsiblePanel/collapsiblePanelIndex.js';
import { renderMessage } from '../../components/message/messageIndex.js';
import { APP_CONFIG, APP_TEXTS } from '../appConfig.js';
import { getAppError } from '../appErrors.js';
import { componentHref } from '../appShell.js';
import { markdownToHTML, markdownToText, findMarkdownSection } from '../markdown/markdownReader.js';
import { buildConfiguration } from '../customization/customizationModel.js';
import { loadCustomization } from '../customization/customizationLoader.js';
import { renderCustomizationPanel } from '../customization/customizationPanel.js';
import { writeCustomization } from '../customization/customizationStore.js';
import { renderPreviewFrame } from '../customization/previewBridge.js';
import { renderPreviewOutput } from '../customization/previewOutput.js';

// States shown in the "States" section, in column order (labels: APP_TEXTS.component.stateNames).
const STATES = [ 'DEFAULT', 'HOVER', 'PRESSED', 'FOCUS', 'DISABLED' ];
// README parts always shown on the page ("###" headings under "## For business").
const README_PARTS = [ 'When to use', 'Key features', 'Dependencies' ];

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds a comma-separated list of component links, or the "None" text; "via" maps an id to the component an
// indirect relation goes through, shown after the link ("Button (through CollapsiblePanel)"). Direct ones come first.
function buildComponentLinksHTML( ids, catalog, via = {} )
{
    const nameOf = id => catalog.components.find(component => component.id === id)?.name ?? id;
    const ordered = [ ...ids.filter(id => !via[id]), ...ids.filter(id => via[id]) ].filter(id => catalog.components.some(component => component.id === id));
    const links = ordered.map(id => `<a href="${componentHref(id)}">${escapeHTML(nameOf(id))}</a>${via[id] ? ` <span class="app-facts-via">(${escapeHTML(APP_TEXTS.component.through.replace('{name}',nameOf(via[id])))})</span>` : ''}`);
    return links.length ? links.join(', ') : escapeHTML(APP_TEXTS.component.none);
}

// Builds the facts list (uses, used by; "can use" and "can be used by" only when the component has optional
// dependencies or is one), shown below the keywords, followed by the definition (README summary).
function buildRelationsHTML( component, catalog )
{
    const rows =
    [
        [ APP_TEXTS.component.dependsOn, buildComponentLinksHTML(component.dependencies,catalog,component.dependencyVia ?? {}) ],
        [ APP_TEXTS.component.usedBy, buildComponentLinksHTML(component.usedBy ?? [],catalog,component.usedByVia ?? {}) ],
        ...( component.optional?.length ? [ [ APP_TEXTS.component.canUse, buildComponentLinksHTML(component.optional,catalog,component.optionalVia ?? {}) ] ] : [] ),
        ...( component.optionalUsedBy?.length ? [ [ APP_TEXTS.component.canBeUsedBy, buildComponentLinksHTML(component.optionalUsedBy,catalog,component.optionalUsedByVia ?? {}) ] ] : [] )
    ];
    return `<dl class="app-facts">${rows.map(( [ term, value ] ) => `<div class="app-facts-row"><dt>${escapeHTML(term)}</dt><dd>${value}</dd></div>`).join('')}</dl>`
        + `<p class="app-definition"><span>${escapeHTML(component.summary)}</span></p>`;
}

// Builds the states section (no visible heading; named for assistive technology), or '' when the component has none.
function buildStatesHTML( states )
{
    if ( !states ) { return ''; }
    const texts = APP_TEXTS.component;
    return `<section class="app-component-section" aria-label="${escapeHTML(texts.states)}">`
        + `<p>${escapeHTML(texts.statesIntro.replace('{row}',states.rowPath))}</p><div class="app-preview app-states-preview"></div></section>`;
}

// Builds the examples section (no visible heading; named for assistive technology), or '' when the component has none.
function buildExamplesHTML( examples )
{
    if ( !examples ) { return ''; }
    const texts = APP_TEXTS.component;
    return `<section class="app-component-section" aria-label="${escapeHTML(texts.examples)}">`
        + `<p>${escapeHTML(texts.examplesIntro)}</p><div class="app-preview app-examples-preview"></div></section>`;
}

// Builds the page frame; the component instances are rendered into its hosts afterwards.
function buildPageHTML( component, catalog, parts, states, examples )
{
    const id = component.id, texts = APP_TEXTS.component;
    const partsHTML = parts.map(part => `<div class="app-readme-part"><h2>${escapeHTML(markdownToText(part.heading))}</h2><div class="app-markdown">${markdownToHTML(part.body)}</div></div>`).join('');
    return '<div class="app-component"><div class="app-component-main">'
        + `<h1>${escapeHTML(component.name)}</h1><div class="app-component-keywords" role="group" aria-label="${escapeHTML(texts.keywords)}"></div>`
        + buildRelationsHTML(component,catalog)
        + `<section class="app-component-section" aria-label="${escapeHTML(texts.liveExample)}"><div class="app-preview app-live-preview"></div><div class="app-output-host"></div></section>`
        + buildStatesHTML(states)
        + buildExamplesHTML(examples)
        + `<section class="app-component-section app-readme-summary" aria-label="${escapeHTML(texts.readme)}"><div class="app-page-message"></div>${partsHTML}`
        + `<p class="app-readme-more"><span>${escapeHTML(texts.readmeMore)}</span><span class="app-readme-button-host"></span></p>`
        + `<p class="app-readme-more app-variants-more"><span>${escapeHTML(texts.variantsMore)}</span><span class="app-variants-button-host"></span></p></section>`
        + `</div><aside class="app-component-side" aria-label="${escapeHTML(texts.customizeLabel.replace('{name}',component.name))}">`
        + `<div class="app-variants-intro"><p class="app-variants-intro-text">${escapeHTML(texts.variantsIntro)}</p><span class="app-variants-toggle-host"></span></div>`
        + `<div id="variants-${id}" class="app-customize-host"></div></aside></div>`;
}

// Renders the "States" frame: every allowed value of the rows option in every state, with the fixed configuration.
function renderStates( host, component, setup )
{
    const { states } = setup;
    const frame = renderPreviewFrame(host,{ componentId:component.id, componentName:component.name, stage:setup.stage, title:APP_TEXTS.component.statesFrameTitle.replace('{name}',component.name) });
    const columns = STATES.map(state => ( { state, label:APP_TEXTS.component.stateNames[state] } ));
    frame.render({ configJSON:JSON.stringify(states.config), callbackPaths:[], positionalCallbacks:[], stylesheets:setup.stylesheets, hasAdjustment:false,
        gallery:{ rowPath:states.rowPath, rowValues:states.rowValues, disabledPath:states.disabledPath, columns } });
    return frame;
}

// Renders the "Examples" frame: the adjustment's groups of fixed configurations, each with its label.
function renderExamples( host, component, setup )
{
    const frame = renderPreviewFrame(host,{ componentId:component.id, componentName:component.name, title:APP_TEXTS.component.examplesFrameTitle.replace('{name}',component.name) });
    frame.render({ configJSON:'{}', callbackPaths:[], positionalCallbacks:[], stylesheets:setup.stylesheets, hasAdjustment:false, examples:setup.examples });
    return frame;
}

// Reads whether the Variants column is open (the same for every component page); open when nothing is remembered
// or browser storage is unavailable.
function readVariantsOpen()
{
    try { return localStorage.getItem(APP_CONFIG.variantsStorageKey) !== 'collapsed'; }
    catch { return true; }
}

// Remembers whether the Variants column is open; ignored when browser storage is unavailable.
function writeVariantsOpen( open )
{
    try { localStorage.setItem(APP_CONFIG.variantsStorageKey,open ? 'open' : 'collapsed'); }
    catch { /* storage unavailable: the choice is simply not remembered */ }
}

// Renders the component page into root; returns the page instance.
export async function renderComponentPage( root, { catalog, params } )
{
    const component = params.component;
    const setup = await loadCustomization(component,catalog);
    const parts = setup.readme === null ? [] : README_PARTS.map(name => findMarkdownSection(setup.readme,name,3)).filter(Boolean);
    root.innerHTML = buildPageHTML(component,catalog,parts,setup.states,setup.examples);
    const children = [];
    let output = null;

    // keyword Chips: static, bordered, in the muted colour (text and border), spaced by the app (.app-component-keywords)
    root.querySelector('.app-component-keywords').innerHTML = buildChips(component.keywords.map(keyword => ( { label:keyword, bordered:true, colorToken:'--c-muted' } )));
    const outputPanel = renderCollapsiblePanel(root.querySelector('.app-output-host'),{ id:`output-${component.id}`, title:APP_TEXTS.component.output, variant:'COMPACT', state:'COLLAPSED' },
        [ host => { output = renderPreviewOutput(host); return output; } ]);
    children.push(outputPanel);
    const preview = renderPreviewFrame(root.querySelector('.app-live-preview'),{ componentId:component.id, componentName:component.name, stage:setup.stage, onReport:report => output?.handle(report) });
    children.push(preview);
    if ( setup.states ) { children.push(renderStates(root.querySelector('.app-states-preview'),component,setup)); }
    if ( setup.examples ) { children.push(renderExamples(root.querySelector('.app-examples-preview'),component,setup)); }

    // Sends panel values to the live example; returns false (and shows the errors) when a value cannot be used.
    function renderExample( values, panel )
    {
        const result = buildConfiguration(setup.model,values);
        if ( result.errors.length ) { panel?.showErrors(result.errors); return false; }
        preview.render({ configJSON:JSON.stringify(result.config), callbackPaths:result.callbackPaths, positionalCallbacks:setup.model.positionalCallbacks, stylesheets:setup.stylesheets, hasAdjustment:setup.hasAdjustment });
        return true;
    }

    const panel = renderCustomizationPanel(root.querySelector('.app-customize-host'),
    {
        componentId:component.id, componentName:component.name, model:setup.model, values:setup.values,
        onRender:values => { if ( renderExample(values,panel) ) { writeCustomization(component.id,values); window.scrollTo(0,0); } }
    });
    children.push(panel);
    renderExample(setup.values,panel);

    if ( setup.readme === null ) { children.push(renderMessage(root.querySelector('.app-page-message'),{ id:`readme-${component.id}-error`, type:'DANGER', text:getAppError('CONTENT_UNAVAILABLE').message })); }
    // a link that looks like a button (decision 185): opens the README in the same tab; "Open in a new tab" works too
    const readmeButton = renderButton(root.querySelector('.app-readme-button-host'),{ id:`readme-${component.id}-open`, label:`${component.id}README.md`, hierarchy:'SECONDARY', size:'SMALL',
        href:`${componentHref(component.id)}/readme`, target:'SAME' });
    children.push(readmeButton);
    // narrow screens (the Variants column is hidden): a line with a Button that opens the Variants page
    children.push(renderButton(root.querySelector('.app-variants-button-host'),{ id:`variants-${component.id}-open`, label:APP_TEXTS.component.customizeLink, hierarchy:'SECONDARY', size:'SMALL',
        iconBefore:'fa-solid fa-layer-group' },() => { window.location.hash = `${componentHref(component.id)}/variants`; }));

    // Variants column: area 1 keeps its height in --app-variants-intro-height (the panel header sticks below it);
    // its Button shows or hides area 2 (the panel) and swaps its double chevron.
    const side = root.querySelector('.app-component-side'), intro = root.querySelector('.app-variants-intro'), variants = root.querySelector('.app-customize-host');
    const measure = () => side.style.setProperty('--app-variants-intro-height',`${intro.offsetHeight}px`);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(intro);
    measure();
    let toggle = null;
    const introText = root.querySelector('.app-variants-intro-text');
    // Draws the Button and the line for the open or collapsed state; refocuses the Button after a press.
    function drawToggle( open, focus )
    {
        toggle?.destroy();
        variants.hidden = !open;
        introText.textContent = open ? APP_TEXTS.component.variantsIntro : APP_TEXTS.component.variantsIntroCollapsed;
        toggle = renderButton(root.querySelector('.app-variants-toggle-host'),{ id:`variants-${component.id}-toggle`, buttonVariant:'ICON_BUTTON', hierarchy:'TERTIARY', size:'SMALL',
            icon:open ? 'fa-solid fa-angles-up' : 'fa-solid fa-angles-down', ariaLabel:open ? APP_TEXTS.component.variantsHide : APP_TEXTS.component.variantsShow },
            () => { writeVariantsOpen(!open); drawToggle(!open,true); });
        toggle?.getElement().setAttribute('aria-expanded',String(open));
        toggle?.getElement().setAttribute('aria-controls',variants.id);
        if ( focus ) { toggle?.getElement().focus(); }
    }
    drawToggle(readVariantsOpen(),false);

    return {
        // Removes the keywords, the live example, the states, the panel and the Buttons and clears the page.
        destroy:() => { observer?.disconnect(); toggle?.destroy(); children.forEach(child => child?.destroy?.()); root.replaceChildren(); }
    };
}
