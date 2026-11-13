// loader.test.mjs
//
// The "auto" cases of source/components-js/loader/loaderTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Short times keep the cases quick: shown after 100 ms, at least 300 ms on screen, the end
// shown for 300 ms, unless a case says otherwise. Cases that need a region (EDGE, OVERLAY) or an element as target
// render through mount(), which puts #host inside <section id="region"> (with a button before it) and evaluates the
// configuration in the page; the instance is still harness.instance.

const ID = 'busy';
const ROOT = `#${ID}`;
const TIMES = { showDelayMs:100, minVisibleMs:300, hideAfterMs:300 };
const DEPENDS = { stylesheets:[ 'button' ] };
const state = t => t.call('getState');
const shown = t => t.page.$eval(ROOT,element => element.classList.contains('ui-loader-shown') && !element.querySelector('.ui-loader-frame').hidden);
const text = ( t, selector ) => t.page.$eval(`${ROOT} ${selector}`,element => element.textContent.trim());
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

// Wraps #host in a region (optionally inside a positioned box) and renders the Loader from configuration source.
async function mount( t, source, { tall = false, positioned = false } = {} )
{
    return t.page.evaluate(async ( [ code, id, flags ] ) =>
    {
        if ( !document.querySelector('#region') )
        {
            const host = document.querySelector('#host');
            const region = Object.assign(document.createElement('section'),{ id:'region' });
            region.innerHTML = `<button id="inside" type="button">Inside</button><p>Region content</p>`;
            if ( flags.tall ) { region.style.blockSize = '1600px'; }
            host.replaceWith(region);
            if ( flags.positioned ) { const box = Object.assign(document.createElement('div'),{ id:'box' }); box.style.position = 'relative'; box.appendChild(host); region.appendChild(box); }
            else { region.appendChild(host); }
        }
        [ 'loader', 'button' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        const { renderLoader } = await import('/source/components-js/loader/loaderIndex.js');
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${id})` : arg )) }); };
        const config = new Function('record',`return (${code});`)(record);
        window.harness.instance = renderLoader(document.querySelector('#host'),{ id, ...config });
        return window.harness.instance ? id : null;
    },[ source, ID, { tall, positioned } ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:300 },DEPENDS);
        await t.call('start');
        await t.wait(100);
        t.equal(await shown(t),false,'not yet shown');
        await t.wait(400);
        t.equal(await shown(t),true,'shown after the delay');
        t.equal(await text(t,'.ui-loader-label'),'Loading…','label');
        t.assert(await t.page.$eval(ROOT,element => element.classList.contains('ui-loader-indeterminate')),'moving indicator');
        await t.call('destroy');
        await t.render({ id:ID, ...TIMES, showDelayMs:300 },DEPENDS);
        await t.call('start');
        await t.wait(100);
        await t.call('setStatus','DONE');
        await t.wait(600);
        t.equal([ await shown(t), ( await state(t) ).visible ],[ false, false ],'an action that ends within the delay is never shown');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, showDelayMs:0, minVisibleMs:800 },DEPENDS);
        await t.call('start');
        await t.wait(100);
        await t.call('hide');
        await t.wait(300);
        t.equal(await shown(t),true,'kept for the minimum time');
        await t.wait(700);
        t.equal(await shown(t),false,'then hidden');
    },
    'T-03':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0 },DEPENDS);
        await t.call('start');
        t.equal(await t.call('setValue',45),true,'setValue()');
        const progress = await t.page.$eval(`${ROOT} .ui-loader-indicator`,element => ( { now:element.getAttribute('aria-valuenow'), determinate:!element.closest('.ui-loader').classList.contains('ui-loader-indeterminate') } ));
        t.equal(progress,{ now:'45', determinate:true },'the share done');
        t.equal(await text(t,'.ui-loader-value'),'45%','as a percentage');
        await t.call('setValue',3,'3 files left');
        t.equal(await text(t,'.ui-loader-value'),'3 files left','the App\'s own text');
        await t.call('destroy');
        await t.render({ id:ID, ...TIMES, showDelayMs:0, valueText:'COUNT', max:30 },DEPENDS);
        await t.call('start');
        await t.call('setValue',12);
        t.equal(await text(t,'.ui-loader-value'),'12 of 30','as a count');
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0 },DEPENDS);
        await t.call('start');
        await t.call('setLabel','Uploading photos');
        t.equal(await text(t,'.ui-loader-label'),'Uploading photos','new label');
    },
    'T-05':async t =>
    {
        for ( const [ status, words ] of [ [ 'DONE', 'Done' ], [ 'CANCELLED', 'Cancelled' ] ] )
        {
            await t.render({ id:ID, ...TIMES, showDelayMs:0 },DEPENDS);
            await t.call('start');
            await t.wait(350);
            t.equal(await t.call('setStatus',status),true,`setStatus(${status})`);
            const end = await t.page.$eval(ROOT,element => ( { status:element.dataset.status, symbol:element.querySelector('.ui-loader-symbol').className.trim() !== 'ui-loader-symbol', label:element.querySelector('.ui-loader-label').textContent.trim() } ));
            t.equal(end,{ status, symbol:true, label:words },`${status}: symbol, colour (status) and text`);
            await t.wait(600);
            t.equal(await shown(t),false,`${status}: hidden after a short time`);
            await t.call('destroy');
        }
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:1000 },DEPENDS);
        await t.call('start');
        await t.wait(100);
        await t.call('setStatus','ERROR','Upload failed');
        t.equal(await shown(t),true,'a failure is shown at once, even within the delay');
        t.equal(await text(t,'.ui-loader-label'),'Upload failed','its text');
        await t.wait(1200);
        t.equal(await shown(t),true,'and stays');
        await t.call('start');
        t.equal(( await state(t) ).status,'RUNNING','until the App starts again');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0 },DEPENDS);
        await t.page.evaluate(() => { window.harness.instance.track(new Promise(resolve => setTimeout(resolve,150)),{ label:'Saving' }); });
        t.equal(( await state(t) ).label,'Saving','started with the label');
        await t.wait(300);
        t.equal(( await state(t) ).status,'DONE','done when the result arrives');
        await t.page.evaluate(() => window.harness.instance.track(new Promise(( resolve, reject ) => setTimeout(() => reject(new Error('no')),150))).catch(() => {}));
        await t.wait(300);
        t.equal(( await state(t) ).status,'ERROR','failed when the result is a failure');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0, minVisibleMs:0 },DEPENDS);
        await t.call('start');
        await t.call('hide');
        await t.wait(100);
        t.equal([ await shown(t), ( await state(t) ).status ],[ false, 'IDLE' ],'hidden at any time');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0, cancellable:true },{ ...DEPENDS, callbacks:[ 'onCancel' ] });
        await t.call('start');
        const cancel = `${ROOT} .ui-loader-cancel button`;
        t.equal(await text(t,'.ui-loader-cancel button'),'Cancel','a Cancel button');
        await t.page.click(cancel);
        t.equal(( await t.calls('onCancel') ).map(call => call.args),[ [ `instance(${ID})` ] ],'reported once');
        t.assert(await t.page.$eval(cancel,element => element.disabled || element.getAttribute('aria-disabled') === 'true'),'Cancel disabled');
        t.equal(( await state(t) ).status,'RUNNING','the App decides whether the action stops');
        await t.call('setStatus','CANCELLED');
        t.equal(( await t.calls('onCancel') ).length,1,'setStatus(CANCELLED) is not reported');
    },
    'T-10':async t =>
    {
        const measure = async ( shape, size ) =>
        {
            await t.render({ id:ID, ...TIMES, showDelayMs:0, shape, size },DEPENDS);
            await t.call('start');
            const result = await t.page.$eval(`${ROOT} .ui-loader-indicator`,element => ( { ring:Boolean(element.querySelector('svg.ui-loader-circle')), bar:Boolean(element.querySelector('.ui-loader-track')), height:element.getBoundingClientRect().height } ));
            await t.call('destroy');
            return result;
        };
        const bars = [ await measure('BAR','SMALL'), await measure('BAR','MEDIUM'), await measure('BAR','LARGE') ];
        const rings = [ await measure('RING','SMALL'), await measure('RING','MEDIUM'), await measure('RING','LARGE') ];
        t.assert(bars.every(item => item.bar && !item.ring) && rings.every(item => item.ring && !item.bar),'a bar or a ring');
        t.assert(bars[0].height < bars[1].height && bars[1].height < bars[2].height,`bar sizes ${bars.map(item => item.height).join(' < ')}`);
        t.assert(rings[0].height < rings[1].height && rings[1].height < rings[2].height,`ring sizes ${rings.map(item => item.height).join(' < ')}`);
    },
    'T-11':async t =>
    {
        const place = async labelPlacement =>
        {
            await t.render({ id:ID, ...TIMES, showDelayMs:0, labelPlacement },DEPENDS);
            await t.call('start');
            const result = await t.page.$eval(ROOT,element => { const label = element.querySelector('.ui-loader-text').getBoundingClientRect(), bar = element.querySelector('.ui-loader-indicator').getBoundingClientRect(); return { above:label.bottom <= bar.top + 1, below:label.top >= bar.bottom - 1, after:label.left >= bar.right - 1, hidden:element.querySelector('.ui-loader-text').classList.contains('ui-loader-visually-hidden') }; });
            await t.call('destroy');
            return result;
        };
        t.assert(( await place('ABOVE') ).above,'above');
        t.assert(( await place('BELOW') ).below,'below');
        t.assert(( await place('END') ).after,'after');
        t.assert(( await place('HIDDEN') ).hidden,'hidden (for screen readers only)');
    },
    'T-12':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0, valueText:'NONE' },DEPENDS);
        await t.call('start');
        await t.call('setValue',40);
        t.equal([ await text(t,'.ui-loader-value'), await t.page.getAttribute(`${ROOT} .ui-loader-indicator`,'aria-valuetext') ],[ '', '40%' ],'no visible value; screen readers still get it');
    },
    'T-13':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0 },DEPENDS);
        const before = await t.page.$eval('#after',element => element.getBoundingClientRect().top);
        await t.call('start');
        const after = await t.page.$eval('#after',element => element.getBoundingClientRect().top);
        t.assert(after > before + 10,`in the page flow: the text after it moves down (${before} → ${after})`);
    },
    'T-14':async t =>
    {
        await mount(t,`{ placement:'EDGE', showDelayMs:0, minVisibleMs:300, hideAfterMs:300 }`);
        await t.call('start');
        const edge = await t.page.evaluate(id => { const region = document.querySelector('#region').getBoundingClientRect(), line = document.querySelector(`#${id} .ui-loader-indicator`).getBoundingClientRect(); return { top:Math.abs(line.top - region.top) <= 1, thin:line.height <= 6, wide:Math.abs(line.width - region.width) <= 2, space:document.querySelector('#host').getBoundingClientRect().height }; },ID);
        t.equal(edge,{ top:true, thin:true, wide:true, space:0 },'a thin line along the top edge, taking no space');
    },
    'T-15':async t =>
    {
        await mount(t,`{ placement:'OVERLAY', showDelayMs:300, minVisibleMs:0, hideAfterMs:300 }`);
        await t.page.focus('#inside');
        await t.call('start');
        const blocked = await t.page.evaluate(id => ( { busy:document.querySelector('#region').getAttribute('aria-busy'), inert:document.querySelector('#inside').inert, focus:document.activeElement?.id, shown:document.querySelector(`#${id}`).classList.contains('ui-loader-shown') } ),ID);
        t.equal(blocked,{ busy:'true', inert:true, focus:`${ID}-indicator`, shown:false },'blocked at once, focus moved into the layer, not yet shown');
        await t.page.evaluate(() => { const added = Object.assign(document.createElement('button'),{ id:'added', textContent:'Added' }); document.querySelector('#region').prepend(added); });
        await t.wait(50);
        t.equal(await t.page.$eval('#added',element => element.closest('[inert]') !== null),true,'content added while blocked is blocked');
        await t.wait(400);
        const layer = await t.page.evaluate(id => { const region = document.querySelector('#region').getBoundingClientRect(), scrim = document.querySelector(`#${id} .ui-loader-scrim`).getBoundingClientRect(); return { shown:document.querySelector(`#${id}`).classList.contains('ui-loader-shown'), covers:Math.abs(scrim.width - region.width) <= 2 && Math.abs(scrim.height - region.height) <= 2, dimmed:getComputedStyle(document.querySelector(`#${id} .ui-loader-scrim`)).backgroundColor !== 'rgba(0, 0, 0, 0)' }; },ID);
        t.equal(layer,{ shown:true, covers:true, dimmed:true },'after the delay the region is dimmed with the indicator in a panel');
        await t.call('hide');
        await t.wait(100);
        const released = await t.page.evaluate(() => ( { busy:document.querySelector('#region').getAttribute('aria-busy'), inert:document.querySelector('#inside').inert || document.querySelector('#added').inert, focus:document.activeElement?.id } ));
        t.equal(released,{ busy:null, inert:false, focus:'inside' },'released when the indicator hides; focus back where it was');
    },
    'T-16':async t =>
    {
        const panelTop = async position =>
        {
            await mount(t,`{ placement:'OVERLAY', indicatorPosition:'${position}', showDelayMs:0, minVisibleMs:0 }`,{ tall:true });
            await t.call('start');
            await t.wait(50);
            const result = await t.page.evaluate(id => { const region = document.querySelector('#region').getBoundingClientRect(), panel = document.querySelector(`#${id} .ui-loader-panel`).getBoundingClientRect(); return { fromTop:Math.round(panel.top - Math.max(region.top,0)), middle:Math.round(Math.abs(( panel.top + panel.bottom ) / 2 - ( region.top + region.bottom ) / 2)) }; },ID);
            await t.call('destroy');
            return result;
        };
        const center = await panelTop('CENTER'), top = await panelTop('TOP');
        t.assert(center.middle <= 2,`CENTER: in the middle of the region (${JSON.stringify(center)})`);
        t.assert(top.fromTop < 200 && top.fromTop >= 0,`TOP: at the top of the visible part (${JSON.stringify(top)})`);
    },
    'T-17':async t =>
    {
        await t.render({ id:ID, ...TIMES, showDelayMs:0, label:'Uploading' },DEPENDS);
        await t.call('start');
        await t.wait(50);
        const exposed = await t.page.$eval(`${ROOT} .ui-loader-indicator`,element => ( { role:element.getAttribute('role'), name:document.getElementById(element.getAttribute('aria-labelledby'))?.textContent.trim() } ));
        t.equal(exposed,{ role:'progressbar', name:'Uploading' },'a progress bar named by its label');
        t.equal(await text(t,'.ui-loader-live'),'Uploading','the label announced when shown');
        await t.call('setValue',10);
        t.equal(await text(t,'.ui-loader-live'),'Uploading','no announcement before a quarter');
        await t.call('setValue',30);
        t.equal(await text(t,'.ui-loader-live'),'Uploading 30%','announced at a quarter');
        await t.call('setStatus','ERROR','Upload failed');
        t.equal(await text(t,'.ui-loader-alert'),'Upload failed','a failure interrupts other speech');
        await t.call('start');
        await t.wait(50);
        await t.call('setStatus','DONE');
        t.equal(await text(t,'.ui-loader-live'),'Done','the end announced');
    },
    'T-18':async t =>
    {
        t.equal(await mount(t,`{ placement:'EDGE', target:document.querySelector('#after') }`),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[INVALID_TARGET]')),'console error');
    },
    'T-19':async t =>
    {
        t.assert(await mount(t,`{ placement:'EDGE', shape:'RING' }`),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,1,'RING with EDGE');
    },
    'T-20':async t =>
    {
        t.assert(await mount(t,`{ placement:'OVERLAY', target:document.querySelector('#region') }`,{ positioned:true }),'rendered');
        t.equal(( await warnings(t,'POSITIONED_ANCESTOR') ).length,1,'warning');
    },
    'T-21':async t =>
    {
        t.assert(await t.render({ id:ID, ...TIMES, showDelayMs:0, cancellable:true },DEPENDS),'rendered');
        await t.call('start');
        t.equal(( await warnings(t,'CANCEL_HANDLER_MISSING') ).length,1,'warning');
        t.equal(await t.page.$(`${ROOT} .ui-loader-cancel button`),null,'no Cancel button');
    },
    'T-22':async t =>
    {
        await t.render({ id:ID, ...TIMES },DEPENDS);
        t.equal(await t.call('setValue',10),false,'not running');
        t.equal(( await warnings(t,'NOT_RUNNING') ).length,1,'NOT_RUNNING');
        await t.call('start');
        t.equal(await t.call('setValue','abc'),false,'not a number');
        t.equal(( await warnings(t,'INVALID_VALUE') ).length,1,'INVALID_VALUE');
    },
    'T-23':async t =>
    {
        await t.render({ id:ID, ...TIMES },DEPENDS);
        await t.call('start');
        t.equal(await t.call('setStatus','FINISHED'),false,'unknown status');
        t.equal(( await warnings(t,'INVALID_STATUS') ).length,1,'INVALID_STATUS');
        await t.page.evaluate(() => window.harness.instance.track(42));
        t.equal(( await warnings(t,'INVALID_PROMISE') ).length,1,'INVALID_PROMISE');
    }
};
