// gallery.js
//
// GALLERY (decision 194). Renders every component of gallery/variants.js through its public entry point and the
// design tokens of source/design-system.css, both read live. Each component loads its own stylesheet; console
// warnings and errors of a component are shown under it, so a broken variant is visible at once.
// Switches: theme (system, light, dark: <html data-theme>) and direction (<html dir>); tokens are measured again after
// a change. Anchors: #component-<name> for each component, #tokens for the tokens.

import { VARIANTS } from './variants.js';

const SOURCE = '../source';

// Escapes text inserted as HTML.
const escapeHTML = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// Loads a component's stylesheet once.
function addStylesheet( name )
{
    const href = `${SOURCE}/components-js/${name}/${name}.css`;
    if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); }
}

// Runs fn while recording console warnings and errors; returns them.
function capture( fn )
{
    const messages = [], original = { warn:console.warn, error:console.error };
    console.warn = ( ...args ) => { messages.push(args.join(' ')); original.warn(...args); };
    console.error = ( ...args ) => { messages.push(args.join(' ')); original.error(...args); };
    try { fn(); } finally { Object.assign(console,original); }
    return messages;
}

// Renders one component section with its variants.
async function renderComponent( name, variants, root )
{
    Object.keys(VARIANTS).forEach(addStylesheet);
    const module = await import(`${SOURCE}/components-js/${name}/${name}Index.js`);
    const render = module[Object.keys(module).find(key => key.startsWith('render'))];
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const section = document.createElement('section');
    section.className = 'gallery-component';
    section.id = `component-${name}`;
    const wide = [ 'appHeader', 'table', 'topNavigation', 'accordion', 'message', 'stepper', 'copyArea', 'notificationsPanel' ].includes(name);
    section.innerHTML = `<h3>${escapeHTML(title)} <a href="${SOURCE}/components-js/${name}/${name}README.md">README</a></h3><div class="gallery-variants${wide ? ' gallery-variants-wide' : ''}"></div>`;
    root.appendChild(section);
    const list = section.querySelector('.gallery-variants');
    const messages = [];
    variants.forEach(( variant, index ) =>
    {
        const item = document.createElement('div');
        item.className = 'gallery-variant';
        item.innerHTML = `<p class="gallery-variant-label">${escapeHTML(variant.label)}</p><div class="gallery-host"></div>`;
        list.appendChild(item);
        const host = item.querySelector('.gallery-host');
        const id = `gallery-${name}-${index + 1}`;
        // A variant that throws shows its error here instead of stopping the page.
        messages.push(...capture(() =>
        {
            try
            {
                if ( variant.collection ) { render(host,variant.collection.map(( chip, chipIndex ) => ( { ...chip, id:`${id}-${chipIndex + 1}` } ))); return; }
                const config = typeof variant.config === 'function' ? variant.config(host) : variant.config;
                render(host,{ ...config, id },...( variant.args ?? [] ));
            }
            catch ( error ) { console.error(`${variant.label}: ${error?.message ?? error}`); }
        }));
    });
    if ( messages.length ) { section.insertAdjacentHTML('beforeend',`<pre class="gallery-messages">${escapeHTML(messages.join('\n'))}</pre>`); }
}

// --- tokens -----------------------------------------------------------------

const probe = document.createElement('div');
probe.style.display = 'none';
document.body.appendChild(probe);

// Returns the computed value of a property set to a token (colours as rgb()).
function computed( property, token ) { probe.style[property] = ''; probe.style[property] = `var(${token})`; return getComputedStyle(probe)[property]; }
// rgb(r, g, b) or color(srgb r g b) (how browsers report color-mix() results, channels 0–1) → [ r, g, b ] in 0–255.
const rgb = value => { const parts = ( value.match(/-?[\d.]+/g) ?? [ 0, 0, 0 ] ).slice(0,3).map(Number); return value.startsWith('color(') ? parts.map(part => part * 255) : parts; };
const hex = parts => `#${parts.map(part => Math.round(part).toString(16).padStart(2,'0')).join('')}`;
function luminance( parts ) { const channel = value => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4; }; const [ r, g, b ] = parts.map(channel); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast( a, b ) { const [ high, low ] = [ luminance(a), luminance(b) ].sort(( x, y ) => y - x); return ( high + 0.05 ) / ( low + 0.05 ); }

// Returns the token groups of the light theme: [{ title, tokens:[{ name, value }] }], from the "/* === TITLE" lines.
async function readTokenGroups()
{
    const css = await ( await fetch(`${SOURCE}/design-system.css`) ).text();
    const light = css.split(/\/\*\s*===\s*DARK THEME/)[0];
    const groups = [];
    let current = null;
    for ( const line of light.split('\n') )
    {
        const heading = /\/\*\s*===\s*([^=*]+?)\s*=*\s*(\*\/)?\s*$/.exec(line) ?? /\/\*\s*===\s*([^=*]+?)\s*=+/.exec(line);
        if ( heading ) { current = { title:heading[1].trim(), tokens:[] }; groups.push(current); continue; }
        if ( !current ) { continue; }
        for ( const match of line.replace(/\/\*.*?\*\//g,'').matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g) ) { current.tokens.push({ name:match[1], value:match[2].trim() }); }
    }
    return groups.filter(group => group.tokens.length);
}

// Renders the token groups: colour swatches, or a table with a visual sample.
async function renderTokens( root )
{
    const groups = await readTokenGroups();
    const surface = rgb(computed('backgroundColor','--c-surface'));
    root.innerHTML = '';
    for ( const group of groups )
    {
        const box = document.createElement('div');
        box.className = 'gallery-token-group';
        box.innerHTML = `<h3>${escapeHTML(group.title)}</h3>`;
        // Colours (any token the browser reads as a colour, and the --g- gradients) as swatches; every other token of the
        // group in a table with a visual sample.
        const colours = group.tokens.filter(token => token.name.startsWith('--g-') || computed('backgroundColor',token.name) !== 'rgba(0, 0, 0, 0)');
        const others = group.tokens.filter(token => !colours.includes(token));
        if ( colours.length )
        {
            const grid = document.createElement('div');
            grid.className = 'gallery-swatches';
            grid.innerHTML = colours.map(token =>
            {
                if ( token.name.startsWith('--g-') ) { return `<div class="gallery-swatch"><div class="gallery-swatch-color" style="background:var(${token.name})"></div><div class="gallery-swatch-meta">${escapeHTML(token.name)}<span>gradient</span></div></div>`; }
                const parts = rgb(computed('backgroundColor',token.name));
                const text = contrast(parts,rgb(computed('color','--c-grey-95'))) >= contrast(parts,rgb(computed('color','--c-grey-05'))) ? 'var(--c-grey-95)' : 'var(--c-grey-05)';
                const ratio = contrast(parts,surface);
                return `<div class="gallery-swatch"><div class="gallery-swatch-color" style="background:var(${token.name});color:${text}">${hex(parts)}</div><div class="gallery-swatch-meta">${escapeHTML(token.name)}<span>${escapeHTML(token.value)}</span><span>${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? 'text' : ratio >= 3 ? 'large text, borders' : 'decorative'}</span></div></div>`;
            }).join('');
            box.appendChild(grid);
        }
        if ( others.length )
        {
            const sample = token =>
            {
                if ( /^--(fs|font|fw|lh)-/.test(token.name) ) { const property = { fs:'font-size', font:'font-family', fw:'font-weight', lh:'line-height' }[token.name.split('-')[2]]; return `<span style="${property}:var(${token.name})">Aa Bb 123</span>`; }
                if ( /^--(space|gap|padding|size)-/.test(token.name) ) { return `<span class="gallery-sample-bar" style="inline-size:var(${token.name})"></span>`; }
                if ( /^--radius-/.test(token.name) ) { return `<span class="gallery-sample-box" style="border-radius:var(${token.name})"></span>`; }
                if ( /^--shadow-/.test(token.name) ) { return `<span class="gallery-sample-box" style="box-shadow:var(${token.name})"></span>`; }
                return '';
            };
            box.insertAdjacentHTML('beforeend',`<table class="gallery-token-table"><thead><tr><th>Token</th><th>Value</th><th>Sample</th></tr></thead><tbody>${others.map(token => `<tr><td><code>${escapeHTML(token.name)}</code></td><td><code>${escapeHTML(token.value)}</code></td><td>${sample(token)}</td></tr>`).join('')}</tbody></table>`);
        }
        root.appendChild(box);
    }
}

// --- page -------------------------------------------------------------------

function registerSwitches()
{
    const theme = document.querySelector('#gallery-theme'), direction = document.querySelector('#gallery-direction');
    theme.addEventListener('change',() => { if ( theme.value ) { document.documentElement.dataset.theme = theme.value; } else { delete document.documentElement.dataset.theme; } renderTokens(document.querySelector('#gallery-tokens')); });
    direction.addEventListener('change',() => { document.documentElement.dir = direction.value; });
}

async function start()
{
    const names = Object.keys(VARIANTS).sort();
    document.querySelector('#gallery-contents').innerHTML = names.map(name => `<li><a href="#component-${name}">${escapeHTML(name.charAt(0).toUpperCase() + name.slice(1))}</a></li>`).join('') + '<li><a href="#tokens">Design tokens</a></li>';
    registerSwitches();
    const root = document.querySelector('#gallery-components');
    for ( const name of names )
    {
        try { await renderComponent(name,VARIANTS[name],root); }
        catch ( error ) { root.insertAdjacentHTML('beforeend',`<pre class="gallery-messages">${escapeHTML(name)}: ${escapeHTML(error?.message ?? error)}</pre>`); }
    }
    await renderTokens(document.querySelector('#gallery-tokens'));
    if ( location.hash ) { document.querySelector(location.hash)?.scrollIntoView(); }
    window.galleryReady = true;
}

start();
