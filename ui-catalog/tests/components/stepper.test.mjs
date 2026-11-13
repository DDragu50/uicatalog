// stepper.test.mjs
//
// The "auto" cases of source/components-js/stepper/stepperTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Stepper's configuration holds functions (canLeave, callbacks, content), so the cases render
// it with mount(): the configuration is JavaScript source evaluated in the page, with record(name) in scope (a callback
// recorded like the harness does; it returns window.answers[name](...) when a case sets one). The instance is
// harness.instance.

const ID = 'checkout';
const ROOT = `#${ID}`;
const STEPS = `[ { id:'account', label:'Account', description:'Who you are' }, { id:'address', label:'Address' }, { id:'payment', label:'Payment', optional:true }, { id:'review', label:'Review' } ]`;
const RECORDERS = `onStepChange:record('onStepChange'), onStatusChange:record('onStatusChange'), onFinish:record('onFinish')`;
const button = name => `${ROOT} [data-button="${name}"] button`;
const step = index => `#${ID}-step-${index}`;
const current = t => t.call('getCurrent');
const statusOf = ( t, id ) => t.call('getStepStatus',id);
const reports = async t => ( await t.calls() ).filter(call => [ 'onStepChange', 'onStatusChange', 'onFinish' ].includes(call.name)).map(call => [ call.name, ...call.args.slice(0,2) ]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

async function mount( t, source, setup = '' )
{
    return t.page.evaluate(async ( [ code, id, prepare ] ) =>
    {
        [ 'stepper', 'button', 'loader', 'tooltip' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        await Promise.all([ ...document.querySelectorAll('link[rel="stylesheet"]') ].map(link => ( link.sheet ? null : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; }) )));
        const { renderStepper } = await import('/source/components-js/stepper/stepperIndex.js');
        const plain = value => JSON.parse(JSON.stringify(value ?? null));
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${id})` : plain(arg) )) }); return window.answers?.[name]?.(...args); };
        new Function(prepare)();
        window.harness.instance = renderStepper(document.querySelector('#host'),{ id, ...new Function('record',`return (${code});`)(record) });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return window.harness.instance ? id : null;
    },[ source, ID, setup ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ marker:'ICON', steps:[ { id:'account', label:'Account', description:'Who you are', icon:'fa-solid fa-user' }, { id:'address', label:'Address', status:'DONE' }, { id:'review', label:'Review' } ] }`);
        const steps = await t.page.$$eval(`${ROOT} .ui-stepper-step`,items => items.map(item => ( { label:item.querySelector('.ui-stepper-label').textContent, description:item.querySelector('.ui-stepper-description')?.textContent ?? '', marker:item.querySelector('.ui-stepper-marker').innerHTML.includes('fa-user'), current:item.querySelector('.ui-stepper-trigger').getAttribute('aria-current') } )));
        t.equal(steps.map(item => item.label),[ 'Account', 'Address', 'Review' ],'the steps in order');
        t.equal([ steps[0].description, steps[0].marker ],[ 'Who you are', true ],'a description and an icon marker');
        t.equal(steps.map(item => item.current),[ 'step', null, null ],'the current step marked');
        t.equal(await statusOf(t,'address'),'DONE','a restored status');
    },
    'T-02':async t =>
    {
        await mount(t,`{ steps:${STEPS}.map(item => item.id === 'account' ? { ...item, status:'DONE' } : item.id === 'address' ? { ...item, status:'ERROR' } : item) }`);
        const look = await t.page.$$eval(`${ROOT} .ui-stepper-step`,items => items.slice(0,3).map(item => ( { symbol:Boolean(item.querySelector('.ui-stepper-marker i')), colour:getComputedStyle(item.querySelector('.ui-stepper-marker')).backgroundColor + getComputedStyle(item.querySelector('.ui-stepper-marker')).color, text:item.querySelector('[id$="-status"]').textContent, shown:item.querySelector('[id$="-status"]').getBoundingClientRect().width > 2 } )));
        t.equal(look.map(item => [ item.symbol, item.text, item.shown ]),[ [ true, 'Done', false ], [ true, 'Has errors', false ], [ false, 'Available after: Address', false ] ],'a symbol and a text for screen readers');
        t.equal(new Set(look.map(item => item.colour)).size,3,'a colour per status');
        await t.call('destroy');
        await mount(t,`{ statusText:true, steps:${STEPS}.map(item => item.id === 'account' ? { ...item, status:'DONE' } : item) }`);
        t.assert(await t.page.$eval(`${step(0)}-status`,element => element.getBoundingClientRect().width > 2),'the status text on the screen when chosen');
        await t.call('destroy');
        await mount(t,`{ statuses:[ 'DONE' ], steps:${STEPS}.map(item => item.id === 'address' ? { ...item, status:'WARNING' } : item) }`);
        t.equal([ await statusOf(t,'address'), ( await warnings(t,'INVALID_STATUS') ).length, await t.call('setStepStatus','account','ERROR') ],[ 'NOT_STARTED', 1, false ],'only the chosen statuses are used');
    },
    'T-03':async t =>
    {
        await mount(t,`{ steps:${STEPS} }`);
        t.equal(await t.page.$eval(`${step(2)} .ui-stepper-label`,element => element.textContent),'Payment (Optional)','"(Optional)" after the label');
    },
    'T-04':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, ${RECORDERS} }`);
        await t.page.click(button('next'));
        t.equal([ await current(t), await statusOf(t,'account'), await statusOf(t,'address') ],[ 'address', 'DONE', 'IN_PROGRESS' ],'the step marked as done, the next one opened (in progress)');
        t.equal(await reports(t),[ [ 'onStatusChange', 'account', 'DONE' ], [ 'onStatusChange', 'address', 'IN_PROGRESS' ], [ 'onStepChange', 'address', { previousId:'account', reason:'NEXT' } ] ],'every status, then the new step reported');
    },
    'T-05':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, canLeave:record('canLeave'), ${RECORDERS} }`,`window.answers = { canLeave:() => new Promise(resolve => setTimeout(() => resolve(window.allow === true),1200)) };`);
        const before = await statusOf(t,'account');
        await t.page.click(button('next'));
        t.equal(( await t.calls('canLeave') ).map(call => call.args.slice(0,2)),[ [ 'account', 'NEXT' ] ],'the App is asked');
        t.equal(await t.page.getAttribute(ROOT,'aria-busy'),'true','busy while the App checks');
        await t.page.click(button('next'));
        t.equal(( await t.calls('canLeave') ).length,1,'other moves are ignored while it checks');
        await t.wait(700);
        t.assert(await t.page.$eval(`${ROOT} .ui-stepper-loader-host .ui-loader`,element => element.classList.contains('ui-loader-shown')),'a thin line above the buttons after a short delay');
        await t.wait(700);
        t.equal([ await current(t), await statusOf(t,'account') ],[ 'account', before ],'kept open, status unchanged, when the App refuses');
        await t.page.evaluate(() => { window.allow = true; });
        await t.page.click(button('next'));
        await t.wait(1400);
        t.equal(await current(t),'address','moves when the App agrees');
    },
    'T-06':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, ${RECORDERS} }`);
        await t.page.click(button('next'));
        await t.page.click(button('back'));
        t.equal([ await current(t), ( await t.calls('onStepChange') ).at(-1).args[1] ],[ 'account', { previousId:'address', reason:'BACK' } ],'Back opens the previous step');
    },
    'T-07':async t =>
    {
        await mount(t,`{ steps:${STEPS}, current:'payment', navigation:'FREE', showButtons:true, ${RECORDERS} }`);
        t.assert(await t.page.isVisible(button('skip')),'Skip on an optional step');
        await t.page.click(button('skip'));
        t.equal([ await statusOf(t,'payment'), await current(t), ( await t.calls('onStepChange') ).at(-1).args[1] ],[ 'SKIPPED', 'review', { previousId:'payment', reason:'SKIP' } ],'marked as skipped, the next step opened');
    },
    'T-08':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, canLeave:record('canLeave'), ${RECORDERS} }`,`window.answers = { canLeave:() => true };`);
        await t.call('goTo','review');
        const finish = await t.page.$eval(button('finish'),element => ( { disabled:element.disabled || element.getAttribute('aria-disabled') === 'true', described:( element.getAttribute('aria-describedby') ?? '' ).split(' ').map(id => document.getElementById(id)?.textContent).join(' ') } ));
        t.assert(finish.disabled && finish.described.includes('Complete the other steps first'),`Finish disabled while a required step is not complete (${JSON.stringify(finish)})`);
        await t.call('setStepStatus','account','DONE');
        await t.call('setStepStatus','address','DONE');
        await t.page.click(button('finish'));
        t.equal(( await t.calls('canLeave') ).map(call => call.args.slice(0,2)),[ [ 'review', 'FINISH' ] ],'the App is asked');
        t.equal([ await statusOf(t,'review'), ( await t.calls('onFinish') ).map(call => call.args) ],[ 'DONE', [ [ `instance(${ID})` ] ] ],'the completion reported');
    },
    'T-09':async t =>
    {
        await mount(t,`{ steps:${STEPS}, navigation:'FREE', ${RECORDERS} }`);
        await t.page.click(step(2));
        t.equal([ await current(t), await statusOf(t,'payment'), ( await t.calls('onStepChange') ).at(-1).args[1] ],[ 'payment', 'IN_PROGRESS', { previousId:'account', reason:'SELECT' } ],'a click opens the step (in progress)');
        await t.call('destroy');
        await mount(t,`{ steps:${STEPS}, navigation:'FREE', autoStatus:false, ${RECORDERS} }`);
        await t.page.click(step(2));
        t.equal(await statusOf(t,'payment'),'NOT_STARTED','autoStatus:false leaves the status');
    },
    'T-10':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true }`);
        const open = () => t.page.$$eval(`${ROOT} .ui-stepper-trigger`,items => items.map(item => !item.disabled));
        t.equal(await open(),[ true, false, false, false ],'a fixed order: later steps wait');
        await t.page.click(button('next'));
        t.equal(await open(),[ true, true, false, false ],'a step opens when the steps before it are complete');
    },
    'T-11':async t =>
    {
        await mount(t,`{ statusText:true, showButtons:true, steps:[ { id:'account', label:'Account' }, { id:'docs', label:'Documents', after:'account' }, { id:'photo', label:'Photo', after:'account' }, { id:'review', label:'Review', after:[ 'docs', 'photo' ] } ] }`);
        t.equal(await t.page.$eval(`${step(3)}-status`,element => element.textContent),'Available after: Documents, Photo','the steps a step waits for');
        await t.page.click(button('next'));
        t.equal(( await t.call('getSteps') ).map(item => item.available),[ true, true, true, false ],'parallel steps open together');
    },
    'T-12':async t =>
    {
        await mount(t,`{ steps:${STEPS}, navigation:'FREE' }`);
        t.equal(await t.page.$$eval(`${ROOT} .ui-stepper-trigger`,items => items.map(item => !item.disabled)),[ true, true, true, true ],'any order');
    },
    'T-13':async t =>
    {
        await mount(t,`{ steps:${STEPS}.map(item => item.id === 'account' ? { ...item, status:'DONE' } : item), navigation:'NONE', current:'address', showButtons:true }`);
        const informative = await t.page.evaluate(id => ( { buttons:document.querySelectorAll(`#${id} .ui-stepper-buttons`).length, triggers:[ ...document.querySelectorAll(`#${id} .ui-stepper-trigger`) ].map(item => item.localName), live:document.querySelectorAll(`#${id} [aria-live]`).length } ),ID);
        t.equal(informative,{ buttons:0, triggers:[ 'div', 'div', 'div', 'div' ], live:0 },'informative steps without interaction');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,1,'showButtons ignored');
    },
    'T-14':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, ${RECORDERS} }`);
        t.equal(await t.call('setStepStatus','address','WARNING'),true,'the App changes a status');
        t.equal(await t.call('goTo','review'),true,'the App opens a step');
        t.equal(await current(t),'review','opened');
        t.equal(await t.call('setStepDisabled','payment',true),true,'the App disables a step');
        t.equal(( await t.call('getSteps') ).find(item => item.id === 'payment').disabled,true,'disabled');
        t.equal(await reports(t),[],'nothing reported for the App\'s own changes');
    },
    'T-15':async t =>
    {
        await mount(t,`{ steps:${STEPS}.map(( item, index ) => ( { ...item, content:[ '<label for="f' + index + '">Field ' + index + '</label><input id="f' + index + '">' ] } )), showContent:true }`);
        const panels = () => t.page.$$eval(`${ROOT} .ui-stepper-panel`,items => items.map(item => !item.hidden));
        t.equal(await panels(),[ true, false, false, false ],'only the current step\'s content');
        await t.page.fill('#f0','Ana');
        await t.page.click(button('next'));
        t.equal(await panels(),[ false, true, false, false ],'the next step\'s content');
        await t.page.click(button('back'));
        t.equal(await t.page.inputValue('#f0'),'Ana','the others are kept');
        const beside = await t.page.evaluate(id => { const list = document.querySelector(`#${id} .ui-stepper-list`).getBoundingClientRect(), panel = document.querySelector(`#${id} .ui-stepper-panel:not([hidden])`).getBoundingClientRect(); return panel.top >= list.bottom - 1; },ID);
        t.equal(beside,true,'horizontal: below the steps');
        await t.call('destroy');
        await mount(t,`{ orientation:'VERTICAL', contentPosition:'INLINE', steps:${STEPS}.map(( item, index ) => ( { ...item, content:[ '<p>Content ' + index + '</p>' ] } )), showContent:true }`);
        t.equal(await t.page.$eval(`${ROOT} .ui-stepper-panel:not([hidden])`,element => element.closest('.ui-stepper-step')?.dataset.step),'account','vertical inline: under the current step');
    },
    'T-16':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showContent:true, actions:[ { key:'save', label:'Save draft' } ], onAction:record('onAction') }`);
        t.equal(await t.page.$$eval(`${ROOT} .ui-stepper-buttons button`,items => items.filter(item => item.getClientRects().length).map(item => item.textContent.trim())),[ 'Back', 'Save draft', 'Next' ],'the bar with the content: Back, the App\'s button, Next');
        await t.page.click(`${ROOT} .ui-stepper-action button`);
        const call = ( await t.calls('onAction') )[0];
        t.equal([ call.args[0], call.args[1].id, call.args[1].current, call.args[2] ],[ 'save', 'account', true, `instance(${ID})` ],'reported with the current step');
    },
    'T-17':async t =>
    {
        const layout = async extra => { await mount(t,`{ steps:${STEPS}, ${extra} }`); const result = await t.page.evaluate(id => { const root = document.getElementById(id); const items = [ ...root.querySelectorAll('.ui-stepper-step') ].map(item => item.getBoundingClientRect()); const marker = root.querySelector('.ui-stepper-marker').getBoundingClientRect(), label = root.querySelector('.ui-stepper-text').getBoundingClientRect(); return { stacked:items[1].top > items[0].bottom - 1, number:root.querySelector('.ui-stepper-number')?.textContent ?? null, below:label.top >= marker.bottom - 1, hiddenTitle:root.querySelector('.ui-stepper-trigger').getAttribute('title'), connectors:root.querySelectorAll('.ui-stepper-connector').length }; },ID); await t.call('destroy'); return result; };
        const horizontal = await layout(''), vertical = await layout(`orientation:'VERTICAL'`), dot = await layout(`marker:'DOT'`), below = await layout(`labelPlacement:'BELOW'`), hidden = await layout(`labelPlacement:'HIDDEN'`), bare = await layout('connectors:false');
        t.equal([ horizontal.stacked, vertical.stacked ],[ false, true ],'horizontal or vertical steps');
        t.equal([ horizontal.number, dot.number ],[ '1', null ],'a number or a dot');
        t.equal([ horizontal.below, below.below, hidden.hiddenTitle ],[ false, true, 'Account' ],'the label after, below, or hidden with a tooltip');
        t.equal([ horizontal.connectors, bare.connectors ],[ 3, 0 ],'lines between the steps, or none');
    },
    'T-18':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '30rem'; });
        await mount(t,`{ steps:${STEPS} }`);
        const compact = await t.page.$eval(ROOT,element => ( { bar:getComputedStyle(element.querySelector('.ui-stepper-compact-bar')).display !== 'none', text:element.querySelector('.ui-stepper-compact-text').textContent, list:getComputedStyle(element.querySelector('.ui-stepper-list')).display } ));
        t.equal(compact,{ bar:true, text:'Step 1 of 4: Account', list:'none' },'a compact bar instead of the steps in a narrow space');
    },
    'T-19':async t =>
    {
        await mount(t,`{ steps:${STEPS}, navigation:'FREE' }`);
        await t.call('focus');
        const path = [];
        for ( const key of [ 'ArrowRight', 'ArrowRight', 'End', 'Home', 'ArrowLeft' ] ) { await t.page.keyboard.press(key); path.push(await t.page.evaluate(() => document.activeElement.closest('.ui-stepper-step')?.dataset.step)); }
        t.equal(path,[ 'address', 'payment', 'review', 'account', 'review' ],'arrows, Home and End move between open steps');
    },
    'T-20':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true }`);
        t.equal(await t.page.$eval(`${ROOT} .ui-stepper-list`,element => [ element.localName, element.getAttribute('aria-label') ]),[ 'ol', 'Progress' ],'an ordered list');
        await t.page.click(button('next'));
        await t.wait(100);
        t.equal(await t.page.$eval(`${ROOT} .ui-stepper-live`,element => element.textContent.trim()),'Step 2 of 4: Address','the new step announced');
    },
    'T-21':async t =>
    {
        await mount(t,`{ steps:${STEPS}, labelPlacement:'HIDDEN', tooltipMode:'NONE' }`);
        t.equal(await t.page.getAttribute(step(0),'title'),null,'NONE');
        await t.call('destroy');
        await mount(t,`{ steps:${STEPS}, labelPlacement:'HIDDEN', tooltipMode:'TOOLTIP' }`);
        await t.page.hover(step(0));
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Account')),`TOOLTIP shows the label (${JSON.stringify(shown)})`);
    },
    'T-22':async t =>
    {
        t.equal(await mount(t,`{ steps:[] }`),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[STEPS_REQUIRED]')),'console error');
    },
    'T-23':async t =>
    {
        t.assert(await mount(t,`{ statuses:[ 'DONE', 'FINISHED' ], marker:'ICON', labelPlacement:'BELOW', orientation:'VERTICAL', steps:[ { id:'a', label:'A', icon:'fa-solid fa-<bad>', content:'<p>x</p>' }, { id:'b' }, { id:'a', label:'Again' }, { id:'c', label:'C', after:[ 'nope', 'd' ] }, { id:'d', label:'D', after:'c' } ], current:'nope' }`),'rendered');
        const counts = {};
        for ( const label of [ 'UNKNOWN_STATUS', 'OPTION_IGNORED', 'INVALID_ICON_CLASS', 'INVALID_STEP', 'DUPLICATE_STEP_ID', 'UNKNOWN_STEP', 'CIRCULAR_AFTER' ] ) { counts[label] = ( await warnings(t,label) ).length > 0; }
        t.equal(Object.values(counts).every(Boolean),true,`each warning (${JSON.stringify(counts)})`);
        await t.call('destroy');
        t.assert(await mount(t,`{ showContent:true, steps:[ { id:'a', label:'A', content:[ '<p>ok</p>', 42 ] } ] }`),'rendered');
        t.equal(( await warnings(t,'INVALID_CHILD') ).length,1,'INVALID_CHILD');
    },
    'T-24':async t =>
    {
        await mount(t,`{ steps:${STEPS}, showButtons:true, canLeave:() => { throw new Error('check failed'); } }`);
        await t.page.click(button('next'));
        await t.wait(100);
        t.equal([ await current(t), ( await warnings(t,'CAN_LEAVE_FAILED') ).length ],[ 'account', 1 ],'the step stays open');
    },
    'T-25':async t =>
    {
        t.assert(await mount(t,`{ steps:${STEPS}, showButtons:true, actions:[ { key:'save', label:'Save' }, { key:'x' }, { key:'save', label:'Save again' } ] }`),'rendered');
        const counts = {};
        for ( const label of [ 'INVALID_ACTION', 'DUPLICATE_ACTION_KEY', 'ACTION_HANDLER_MISSING' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ INVALID_ACTION:1, DUPLICATE_ACTION_KEY:1, ACTION_HANDLER_MISSING:1 },'one warning each');
        t.assert(await t.page.$eval(`${ROOT} .ui-stepper-action button`,element => element.disabled || element.getAttribute('aria-disabled') === 'true'),'the action is disabled without onAction');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'UNKNOWN_ACTION');
    }
};
