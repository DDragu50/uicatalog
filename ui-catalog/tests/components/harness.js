// harness.js
//
// COMPONENT TEST HARNESS — BROWSER PART (decision 193). The Node test files (tests/components/x.test.mjs) render the
// component here through window.harness and then act like a user through Playwright (real clicks and keys).
//   harness.render(name, config, { callbacks, args })  loads the component (module and stylesheets: its own and those
//       of the components it uses), renders it into #host and keeps the instance in harness.instance.
//       callbacks: names of callbacks to record (each call → harness.calls, arguments made readable); 'onClick:preventDefault'
//       also cancels the event the callback receives;
//       values { $html:'…' } in the configuration become render functions that write that HTML into their host;
//       values { $callback:'name' } (in the configuration or in args, for callbacks passed as render arguments) record
//       their calls under that name like callbacks.
//   harness.call(method, ...args)  calls an instance member and returns its result made readable.
//   harness.messages  console warnings and errors since the page loaded ({ level, text }).

const harness = window.harness = { instance:null, calls:[], messages:[] };

// Records console warnings and errors (the components report through them).
[ 'warn', 'error' ].forEach(level =>
{
    const original = console[level].bind(console);
    console[level] = ( ...args ) => { harness.messages.push({ level:level === 'warn' ? 'warning' : 'error', text:args.join(' ') }); original(...args); };
});

// Returns a value made readable for the Node side (elements and instances become short descriptions).
function readable( value, depth = 0 )
{
    if ( value instanceof Element ) { return `<${value.localName}${value.id ? `#${value.id}` : ''}>`; }
    if ( value instanceof Event ) { return `Event(${value.type})`; }
    if ( typeof value === 'function' ) { return 'function'; }
    if ( Array.isArray(value) ) { return depth > 3 ? '[…]' : value.map(item => readable(item,depth + 1)); }
    if ( value && typeof value === 'object' )
    {
        if ( typeof value.destroy === 'function' && 'id' in value ) { return `instance(${value.id})`; }
        return depth > 3 ? '{…}' : Object.fromEntries(Object.entries(value).map(( [ key, item ] ) => [ key, readable(item,depth + 1) ]));
    }
    return value;
}

// Turns { $html } placeholders into render functions.
function revive( value )
{
    if ( Array.isArray(value) ) { return value.map(revive); }
    if ( value && typeof value === 'object' )
    {
        if ( typeof value.$html === 'string' ) { return host => { host.innerHTML = value.$html; return null; }; }
        if ( typeof value.$callback === 'string' ) { return ( ...callArgs ) => { harness.calls.push({ name:value.$callback, args:readable(callArgs) }); }; }
        return Object.fromEntries(Object.entries(value).map(( [ key, item ] ) => [ key, revive(item) ]));
    }
    return value;
}

// Loads a stylesheet once.
function addStylesheet( href )
{
    if ( document.querySelector(`link[href="${href}"]`) ) { return; }
    document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href }));
}

harness.render = async ( name, config, { callbacks = [], args = [], stylesheets = [] } = {} ) =>
{
    [ name, ...stylesheets ].forEach(sheet => addStylesheet(`/source/components-js/${sheet}/${sheet}.css`));
    const module = await import(`/source/components-js/${name}/${name}Index.js`);
    const render = module[Object.keys(module).find(key => key.startsWith('render'))];
    const full = revive(config);
    // "onClick:preventDefault" records the call and also cancels the event (e.g. an app router keeping a link on the page).
    callbacks.forEach(entry =>
    {
        const [ callback, action ] = entry.split(':');
        full[callback] = ( ...callArgs ) => { if ( action === 'preventDefault' ) { callArgs.find(arg => arg instanceof Event)?.preventDefault(); } harness.calls.push({ name:callback, args:readable(callArgs) }); };
    });
    harness.instance = render(document.querySelector('#host'),full,...revive(args));
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    return harness.instance ? harness.instance.id ?? true : null;
};

harness.call = async ( method, ...args ) => readable(await harness.instance[method](...args));

window.harnessReady = true;
