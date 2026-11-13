// contract.js
//
// SHARED CONTRACT TEST — BROWSER PART (decision 193, step 2). Loaded by contract.html; driven by tools/contract.mjs,
// which calls window.runContract(meta) and prints the results. Every component is checked against the rules all
// components share (guidelines §11):
//   render      a valid configuration renders, returns an instance with id and destroy(), writes nothing to the console
//   callbacks   no callback fires while rendering or destroying (callbacks report user actions only)
//   destroy     destroy() empties the container and leaves no element with the component's id in the page
//   container   no container → null and [CONTAINER_REQUIRED]
//   id          no id → [ID_REQUIRED]; an unsafe id → [UNSAFE_ID]; an id already in the page → [DUPLICATE_ID]; each null
//   warning     an invalid option value → [INVALID_OPTION] and the component still renders
//   format      every console message reads: Name "id" [LABEL]: message
// A check whose label is not in the component's catalog is reported as "not applicable".

import { CASES } from './cases.js';

// Records console warnings and errors while fn runs; returns { value, messages }.
async function captureConsole( fn )
{
    const messages = [], original = { warn:console.warn, error:console.error };
    console.warn = ( ...args ) => messages.push({ level:'warning', text:args.join(' ') });
    console.error = ( ...args ) => messages.push({ level:'error', text:args.join(' ') });
    try { return { value:await fn(), messages }; }
    finally { Object.assign(console,original); }
}

// Returns a new, empty container in the test area.
function newHost()
{
    const host = document.createElement('div');
    document.querySelector('#hosts').appendChild(host);
    return host;
}

// Loads the module and stylesheet of a component (and of its dependencies, through its own imports).
async function load( name )
{
    if ( !document.querySelector(`link[data-component="${name}"]`) )
    {
        const link = Object.assign(document.createElement('link'),{ rel:'stylesheet', href:`/source/components-js/${name}/${name}.css` });
        link.dataset.component = name;
        document.head.appendChild(link);
    }
    return import(`/source/components-js/${name}/${name}Index.js`);
}

// Runs every check for one component; returns [{ check, status, detail }] (status: pass | fail | n/a).
async function checkComponent( name, meta )
{
    const testCase = CASES[name];
    if ( !testCase ) { return [ { check:'case', status:'fail', detail:'no case in tests/contract/cases.js' } ]; }
    const module = await load(name);
    const render = module[testCase.render];
    const results = [];
    const add = ( check, ok, detail = '' ) => results.push({ check, status:ok === null ? 'n/a' : ok ? 'pass' : 'fail', detail });
    const has = label => meta.labels.includes(label);
    const id = `contract-${name}`;
    // Calls the render function with a configuration (a collection takes a list of configurations).
    const call = ( host, config ) => ( testCase.collection ? render(host,config ? [ config ] : config) : render(host,config,...( testCase.args?.() ?? [] )) );
    const formatOk = messages => messages.every(message => new RegExp(`^${meta.displayName}( "[^"]*")? \\[[A-Z][A-Z0-9_]*\\]: `).test(message.text));
    const allMessages = [];

    // render + destroy: a valid configuration, nothing written to the console
    const host = newHost();
    const rendered = await captureConsole(() => call(host,{ ...testCase.config(host), id }));
    allMessages.push(...rendered.messages);
    const instance = rendered.value;
    const instanceOk = testCase.collection ? host.children.length > 0 : Boolean(instance && instance.id === id && typeof instance.destroy === 'function');
    add('render',instanceOk && host.children.length > 0 && !rendered.messages.length,rendered.messages.map(message => message.text).join(' · ') || ( instanceOk ? '' : 'no instance or empty container' ));
    await new Promise(resolve => setTimeout(resolve,50));
    const destroyed = await captureConsole(() => ( instance?.destroy ? instance.destroy() : ( host.innerHTML = '' ) ));
    allMessages.push(...destroyed.messages);
    const leftovers = testCase.skip?.includes('ids') ? [] : [ ...document.querySelectorAll(`[id^="${id}"]`) ].map(element => `#${element.id}`);
    add('destroy',host.innerHTML.trim() === '' && !leftovers.length,leftovers.length ? `left in the page: ${leftovers.slice(0,4).join(', ')}` : host.innerHTML.trim() ? 'container not empty' : '');
    host.remove();

    // callbacks: every README callback is given; none may fire while rendering or destroying (warnings about callbacks
    // that do not apply to this configuration are expected here and not counted)
    if ( meta.callbacks.length )
    {
        const fired = [], spyHost = newHost();
        const spyConfig = { ...testCase.config(spyHost), id:`${id}-spy` };
        meta.callbacks.forEach(callback => { spyConfig[callback] = () => fired.push(callback); });
        const spied = await captureConsole(async () => { const value = call(spyHost,spyConfig); await new Promise(resolve => setTimeout(resolve,50)); value?.destroy?.(); return value; });
        allMessages.push(...spied.messages);
        add('callbacks',!fired.length,fired.length ? `fired without a user action: ${[ ...new Set(fired) ].join(', ')}` : '');
        spyHost.remove();
    }
    else { add('callbacks',null); }

    // container
    if ( has('CONTAINER_REQUIRED') )
    {
        const result = await captureConsole(() => call(null,{ ...testCase.config(newHost()), id:`${id}-none` }));
        allMessages.push(...result.messages);
        add('container',!result.value && result.messages.some(message => message.text.includes('[CONTAINER_REQUIRED]')),result.messages.map(message => message.text).join(' · '));
    }
    else { add('container',null); }

    // ids
    const idCheck = async ( check, label, makeId, prepare ) =>
    {
        if ( testCase.skip?.includes('ids') || !has(label) ) { add(check,null); return; }
        const box = newHost();
        const cleanup = prepare?.();
        const config = testCase.config(box);
        const value = makeId();
        if ( value !== undefined ) { config.id = value; }
        const result = await captureConsole(() => call(box,config));
        allMessages.push(...result.messages);
        add(check,!result.value && result.messages.some(message => message.text.includes(`[${label}]`)),result.messages.map(message => message.text).join(' · ') || 'rendered without an error');
        result.value?.destroy?.();
        cleanup?.();
        box.remove();
    };
    await idCheck('id missing','ID_REQUIRED',() => undefined);
    await idCheck('id unsafe','UNSAFE_ID',() => '9 unsafe');
    await idCheck('id duplicate','DUPLICATE_ID',() => `${id}-taken`,() => { const taken = Object.assign(document.createElement('span'),{ id:`${id}-taken` }); document.body.appendChild(taken); return () => taken.remove(); });

    // warning keeps rendering
    if ( has('INVALID_OPTION') && meta.invalidOption )
    {
        const box = newHost();
        const result = await captureConsole(() => call(box,{ ...testCase.config(box), id:`${id}-warn`, [meta.invalidOption]:'NOT_A_VALUE' }));
        allMessages.push(...result.messages);
        add('warning',Boolean(result.value) && box.children.length > 0 && result.messages.some(message => message.level === 'warning' && message.text.includes('[INVALID_OPTION]')),`${meta.invalidOption}: ${result.messages.map(message => message.text).join(' · ') || 'no warning'}`);
        result.value?.destroy?.();
        box.remove();
    }
    else { add('warning',null,meta.invalidOption ? '' : 'no enumerated option'); }

    add('format',allMessages.length ? formatOk(allMessages) : null,allMessages.filter(message => !formatOk([ message ])).map(message => message.text).slice(0,2).join(' · '));
    return results;
}

// Runs the checks for every component in meta; returns { component: [results] }.
window.runContract = async ( meta ) =>
{
    const report = {};
    for ( const [ name, componentMeta ] of Object.entries(meta) )
    {
        try { report[name] = await checkComponent(name,componentMeta); }
        catch ( error ) { report[name] = [ { check:'run', status:'fail', detail:String(error?.stack ?? error).slice(0,300) } ]; }
    }
    return report;
};
window.contractReady = true;
