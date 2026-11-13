// previewIndex.js
//
// LIVE EXAMPLE (runs inside preview.html, in a frame of the component page).
// Renders one component with the showcase styling, wires its callbacks so they are reported, and reports the
// instance's public state, the developer messages and the page height to the component page.
// The component page talks to it through window.showcasePreview: connect(handler), render(request).
// A request with a gallery renders the "States" table instead: one column per value of an option, one row per state.
// Hover, pressed and keyboard focus cannot be set from code, so each :hover, :active and :focus / :focus-visible rule of
// the loaded component stylesheets is copied once with a class in place of the state (e.g. .ui-button-primary:hover:not(:disabled)
// → .ui-button-primary.app-state-hover:not(:disabled)), in the same layer, right after the original; the gallery puts the class on
// the component element. The look therefore always follows the stylesheets actually loaded. The gallery cells are inert.

import { reportAppIssue } from '../appErrors.js';

// Zero-argument getters reported as "state" when the instance has them.
const STATE_GETTERS = [ 'getValue', 'getError', 'getState', 'getStatus', 'isDisabled', 'isDirty', 'isRail', 'getExpandedIds', 'getItems', 'getValues', 'getSelection', 'getSort', 'getPage', 'getItemsPerPage', 'getVisibleColumns', 'getLabelPosition', 'getMandatoryState' ];

// State pseudo-classes and the classes that stand in for them in the gallery (:focus-within is not a focus state of the element).
const FORCED_STATES = [ { pattern:/:hover(?![\w-])/g, className:'app-state-hover' }, { pattern:/:active(?![\w-])/g, className:'app-state-pressed' }, { pattern:/:focus(?:-visible)?(?![\w-])/g, className:'app-state-focus' } ];
// Classes put on the component element for each gallery column (pressed is also hovered).
const STATE_CLASSES = { DEFAULT:[], HOVER:[ 'app-state-hover' ], PRESSED:[ 'app-state-hover', 'app-state-pressed' ], FOCUS:[ 'app-state-focus' ], DISABLED:[] };

const stage = document.querySelector('#preview-stage');
const forcedSheets = new WeakSet();
let report = () => {};
let instance = null, version = 0, galleryInstances = [];

// Describes a value for the output box in a short, readable form.
function describe( value, depth = 0 )
{
    if ( value === instance && value ) { return 'instance'; }
    if ( value === undefined ) { return 'undefined'; }
    if ( value === null || typeof value === 'boolean' || typeof value === 'number' ) { return String(value); }
    if ( typeof value === 'string' ) { return JSON.stringify(value); }
    if ( typeof value === 'function' ) { return 'function'; }
    if ( value instanceof Event ) { return `${value.constructor.name}(${value.type})`; }
    if ( value instanceof Element ) { return `<${value.tagName.toLowerCase()}${value.id ? `#${value.id}` : ''}>`; }
    if ( typeof File !== 'undefined' && value instanceof File ) { return `File(${JSON.stringify(value.name)}, ${value.size} bytes)`; }
    if ( typeof value.destroy === 'function' ) { return 'instance'; }
    if ( depth > 2 ) { return Array.isArray(value) ? '[…]' : '{…}'; }
    if ( Array.isArray(value) ) { return `[${value.map(item => describe(item,depth + 1)).join(', ')}]`; }
    return `{ ${Object.entries(value).map(( [ key, item ] ) => `${key}: ${describe(item,depth + 1)}`).join(', ')} }`;
}

// Reports the results of the instance's state getters.
function reportState()
{
    if ( !instance ) { report({ kind:'state', state:[] }); return; }
    const state = STATE_GETTERS.filter(name => typeof instance[name] === 'function').map(name =>
    {
        try { return { name:`${name}()`, value:describe(instance[name]()) }; }
        catch ( error ) { return { name:`${name}()`, value:`threw ${error.message}` }; }
    });
    report({ kind:'state', state });
}

// Writes a value at a dotted path of an object, creating intermediate objects.
function setPath( target, path, value )
{
    const parts = path.split('.');
    const last = parts.pop();
    const parent = parts.reduce(( node, part ) => { node[part] = node[part] && typeof node[part] === 'object' ? node[part] : {}; return node[part]; },target);
    parent[last] = value;
}

// Adds the showcase stylesheets the component needs (once each) and waits until they are loaded.
function ensureStylesheets( names )
{
    const pending = names.filter(name => !document.querySelector(`link[data-component="${name}"]`)).map(name => new Promise(resolve =>
    {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `showcase-styling/${name}.css`;
        link.dataset.component = name;
        link.addEventListener('load',resolve,{ once:true });
        link.addEventListener('error',resolve,{ once:true });
        document.head.insertBefore(link,document.querySelector('link[href="app/preview/preview.css"]'));
    }));
    return Promise.all(pending);
}

// Splits a selector list at its top-level commas.
function splitSelectors( text )
{
    const parts = [];
    let depth = 0, start = 0;
    [ ...text ].forEach(( character, index ) =>
    {
        if ( character === '(' || character === '[' ) { depth += 1; }
        else if ( character === ')' || character === ']' ) { depth -= 1; }
        else if ( character === ',' && depth === 0 ) { parts.push(text.slice(start,index).trim()); start = index + 1; }
    });
    parts.push(text.slice(start).trim());
    return parts;
}

// Returns a copy of one selector with the state pseudo-classes replaced by classes, or '' when it has none.
function forceSelector( selector )
{
    let result = selector;
    FORCED_STATES.forEach(( { pattern, className } ) => { result = result.replace(pattern,`.${className}`); });
    return result === selector ? '' : result;
}

// Adds the forced-state copy of every state rule in a list of rules (a stylesheet, a layer, a media or container block).
function addForcedRules( list )
{
    for ( let index = list.cssRules.length - 1; index >= 0; index -= 1 )
    {
        const rule = list.cssRules[index];
        if ( rule instanceof CSSStyleRule )
        {
            const selectors = splitSelectors(rule.selectorText).map(forceSelector).filter(Boolean);
            if ( selectors.length ) { list.insertRule(`${selectors.join(', ')} { ${rule.style.cssText} }`,index + 1); }
        }
        else if ( rule.cssRules ) { addForcedRules(rule); }
    }
}

// Adds the forced-state rules to every loaded component stylesheet (once per stylesheet).
function forceStateRules()
{
    document.querySelectorAll('link[data-component]').forEach(link =>
    {
        if ( !link.sheet || forcedSheets.has(link.sheet) ) { return; }
        forcedSheets.add(link.sheet);
        try { addForcedRules(link.sheet); }
        catch ( error ) { reportAppIssue('PREVIEW_RENDER_FAILED',{ value:link.dataset.component, reason:error.message }); }
    });
}

// Returns the render function of a component module: the adjustment's choice, render<Name>, or the only render… export.
function findRenderFunction( module, componentId, adjustment )
{
    if ( adjustment.renderFunction ) { return module[adjustment.renderFunction]; }
    const expected = `render${componentId.charAt(0).toUpperCase()}${componentId.slice(1)}`;
    if ( typeof module[expected] === 'function' ) { return module[expected]; }
    const candidates = Object.keys(module).filter(name => /^render[A-Z]/.test(name) && typeof module[name] === 'function');
    return module[candidates[0]];
}

// Renders the "States" table: request.gallery = { rowPath, rowValues, disabledPath, columns:[{ state, label }] } — one column per
// value of the rowPath option (e.g. each hierarchy), one row per state (columns, in order); configJSON is the fixed configuration of every cell.
async function renderGallery( request )
{
    const current = ++version;
    galleryInstances.forEach(entry => entry?.destroy?.());
    galleryInstances = [];
    stage.replaceChildren();
    report({ kind:'start' });
    await ensureStylesheets(request.stylesheets);
    const module = await import(`../../components/${request.componentId}/${request.componentId}Index.js`);
    if ( current !== version ) { return; }
    forceStateRules();
    const { rowPath, rowValues, disabledPath, columns } = request.gallery;
    const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const table = document.createElement('table');
    table.className = 'app-states-table';
    table.innerHTML = `<thead><tr><td></td>${rowValues.map(value => `<th scope="col">${escape(value)}</th>`).join('')}</tr></thead>`
        + `<tbody>${columns.map(column => `<tr><th scope="row">${escape(column.label)}</th>${rowValues.map(() => '<td><div class="app-states-cell" inert></div></td>').join('')}</tr>`).join('')}</tbody>`;
    stage.append(table);
    const renderFunction = findRenderFunction(module,request.componentId,{});
    const base = JSON.parse(request.configJSON);
    table.querySelectorAll('tbody tr').forEach(( row, stateIndex ) => row.querySelectorAll('.app-states-cell').forEach(( cell, valueIndex ) =>
    {
        const { state } = columns[stateIndex];
        const config = { ...base, [rowPath]:rowValues[valueIndex], id:`states-${request.componentId}-${valueIndex}-${stateIndex}` };
        if ( state === 'DISABLED' ) { config[disabledPath] = true; }
        const created = renderFunction(cell,config) ?? null;
        galleryInstances.push(created);
        const element = created?.getElement?.() ?? cell.firstElementChild;
        element?.classList.add(...( STATE_CLASSES[state] ?? [] ));
    }));
    report({ kind:'rendered', ok:galleryInstances.every(Boolean), members:[], config:describe(base) });
}

// Renders the "Examples": request.examples = [ { title, items:[ { label, config, surface } ] } ] — one group per title, each
// example with its label (the settings that make it); configurations are fixed data from the adjustment file; surface
// 'SURFACE' or 'BRAND' places the example on a light or brand-coloured bar.
async function renderExamples( request )
{
    const current = ++version;
    galleryInstances.forEach(entry => entry?.destroy?.());
    galleryInstances = [];
    stage.replaceChildren();
    report({ kind:'start' });
    await ensureStylesheets(request.stylesheets);
    const module = await import(`../../components/${request.componentId}/${request.componentId}Index.js`);
    if ( current !== version ) { return; }
    const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const wrapper = document.createElement('div');
    wrapper.className = 'app-examples';
    wrapper.innerHTML = request.examples.map(( group, groupIndex ) => `<section class="app-examples-group" aria-labelledby="examples-title-${groupIndex}">`
        + `<h2 class="app-examples-title" id="examples-title-${groupIndex}">${escape(group.title)}</h2><ul class="app-examples-list${group.fit ? ' app-examples-list-fit' : ''}">`
        + group.items.map(item => `<li class="app-examples-item"><div class="app-examples-cell${item.surface ? ` app-preview-bar app-preview-bar-${item.surface.toLowerCase()}` : ''}"></div><span class="app-examples-label">${escape(item.label)}</span></li>`).join('')
        + '</ul></section>').join('');
    stage.append(wrapper);
    const renderFunction = findRenderFunction(module,request.componentId,{});
    wrapper.querySelectorAll('.app-examples-group').forEach(( section, groupIndex ) => section.querySelectorAll('.app-examples-cell').forEach(( cell, itemIndex ) =>
    {
        const config = { ...request.examples[groupIndex].items[itemIndex].config, id:`example-${request.componentId}-${groupIndex}-${itemIndex}` };
        galleryInstances.push(renderFunction(cell,config) ?? null);
    }));
    report({ kind:'rendered', ok:galleryInstances.every(Boolean), members:[], config:describe(request.examples) });
}

// Renders a component: request = { componentId, configJSON, callbackPaths, positionalCallbacks, stylesheets, hasAdjustment, minHeight }.
// Callback options (callbackPaths) and callback arguments of the render function (positionalCallbacks) are reported.
async function render( request )
{
    if ( request.gallery ) { return renderGallery(request); }
    if ( request.examples ) { return renderExamples(request); }
    const current = ++version;
    instance?.destroy?.();
    instance = null;
    stage.replaceChildren();
    document.querySelector('#toast-area').replaceChildren();
    if ( /^--[a-z0-9-]+$/.test(request.minHeight ?? '') ) { stage.style.setProperty('--app-preview-stage-min-height',`var(${request.minHeight})`); }
    else { stage.style.removeProperty('--app-preview-stage-min-height'); }
    report({ kind:'start' });
    await ensureStylesheets(request.stylesheets);
    const module = await import(`../../components/${request.componentId}/${request.componentId}Index.js`);
    const adjustment = request.hasAdjustment ? ( await import(`../../adjustments/${request.componentId}.js`) ).default ?? {} : {};
    if ( current !== version ) { return; }
    const host = document.createElement('div');
    host.className = 'app-preview-host';
    stage.append(host);
    const config = { ...JSON.parse(request.configJSON), id:`showcase-${request.componentId}` };
    const reportCallback = ( name, ...args ) => { report({ kind:'callback', name, args:args.map(arg => describe(arg)) }); queueMicrotask(reportState); };
    request.callbackPaths.forEach(path => setPath(config,path,( ...args ) => reportCallback(path,...args)));
    const renderFunction = findRenderFunction(module,request.componentId,adjustment);
    const callbacks = ( request.positionalCallbacks ?? [] ).map(name => ( name ? ( ...args ) => reportCallback(name,...args) : undefined ));
    const prepared = typeof adjustment.prepare === 'function' ? await adjustment.prepare({ config, host, callbacks, toastArea:document.querySelector('#toast-area'), report:reportCallback }) : [ config, ...callbacks ];
    if ( current !== version ) { return; }
    const target = Array.isArray(prepared) ? { host, args:prepared } : { host:prepared?.host ?? host, args:prepared?.args ?? [ config ] };
    instance = renderFunction(target.host,...target.args) ?? null;
    const members = instance ? Object.keys(instance).map(name => ( typeof instance[name] === 'function' ? `${name}()` : name )) : [];
    report({ kind:'rendered', ok:Boolean(instance), members, config:describe(config) });
    reportState();
}

// Mirrors developer warnings and errors into the output box (preview infrastructure only; the console still receives them).
[ 'warn', 'error' ].forEach(level =>
{
    const original = console[level].bind(console);
    console[level] = ( ...args ) => { report({ kind:'console', level, text:args.map(String).join(' ') }); original(...args); };
});

// Reports the page height so the frame can grow with the example.
new ResizeObserver(() => report({ kind:'size', height:document.documentElement.scrollHeight })).observe(document.body);

window.showcasePreview =
{
    // Sets the function that receives every report ({ kind, … }).
    connect:( handler ) => { report = typeof handler === 'function' ? handler : () => {}; report({ kind:'size', height:document.documentElement.scrollHeight }); },
    // Renders a component (see render()).
    render:( request ) => render(request).catch(error => reportAppIssue('PREVIEW_RENDER_FAILED',{ value:request.componentId, reason:error.message }))
};
