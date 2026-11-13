// tooltip.test.mjs
//
// The "auto" cases of source/components-js/tooltip/tooltipTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Tooltip needs elements as targets, so the cases render it with mount(): the page gets a
// small set of controls before #host (#save, #copy, #icon without a name, #long with cut-off text, a #list of items),
// and the configuration is evaluated in the page; the instance is harness.instance. mount(t, source, id) renders a
// second tooltip into its own host when id is not "tip".

const ID = 'tip';
const BUBBLE = `#${ID}`;
const shown = ( t, id = ID ) => t.page.$eval(`#${id}`,element => element.classList.contains('ui-tooltip-open'));
const box = ( t, selector ) => t.page.$eval(selector,element => { const rect = element.getBoundingClientRect(); return { left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom, width:rect.width, height:rect.height }; });
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);

async function mount( t, source, id = ID )
{
    return t.page.evaluate(async ( [ code, tipId ] ) =>
    {
        if ( !document.querySelector('#controls') )
        {
            const href = '/source/components-js/tooltip/tooltip.css';
            document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href }));
            await new Promise(resolve => { document.querySelector(`link[href="${href}"]`).onload = resolve; });
            const controls = Object.assign(document.createElement('div'),{ id:'controls' });
            controls.style.cssText = 'display:flex;gap:16px;align-items:center;margin:120px 160px;';
            controls.innerHTML = '<button id="save" type="button">Save</button><button id="copy" type="button">Copy</button><button id="icon" type="button">★</button>'
                + '<span id="long" style="display:inline-block;inline-size:80px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">A very long customer name indeed</span>'
                + '<span id="short" style="display:inline-block;inline-size:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">Short</span>'
                + '<ul id="list"><li><button type="button" data-tooltip="Edit order">E</button></li><li><button type="button" data-tooltip="Delete order">D</button></li></ul>';
            document.querySelector('#host').before(controls);
        }
        let host = document.getElementById(`${tipId}-host`);
        if ( !host ) { host = tipId === 'tip' ? document.querySelector('#host') : Object.assign(document.createElement('div'),{ id:`${tipId}-host` }); if ( !host.isConnected ) { document.body.appendChild(host); } }
        const { renderTooltip } = await import('/source/components-js/tooltip/tooltipIndex.js');
        const instance = renderTooltip(host,{ id:tipId, ...new Function(`return (${code});`)() });
        if ( tipId === 'tip' ) { window.harness.instance = instance; } else { window[tipId] = instance; }
        return instance ? tipId : null;
    },[ source, id ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', showDelayMs:400 }`);
        await mount(t,`{ target:document.querySelector('#copy'), text:'Copy the order', showDelayMs:400 }`,'tip2');
        await t.page.hover('#save');
        await t.wait(150);
        t.equal(await shown(t),false,'not at once under the pointer');
        await t.wait(450);
        t.equal([ await shown(t), await t.page.$eval(`${BUBBLE} .ui-tooltip-text`,element => element.textContent) ],[ true, 'Save the order' ],'after a short pause');
        await t.page.hover('#copy');
        await t.wait(80);
        t.equal(await shown(t,'tip2'),true,'at once right after another tooltip');
    },
    'T-02':async t =>
    {
        await mount(t,`{ target:document.querySelector('#copy'), text:'Copy the order', showDelayMs:2000 }`);
        await t.page.focus('#save');
        await t.page.keyboard.press('Tab');
        t.equal(await t.page.evaluate(() => document.activeElement.id),'copy','reached with Tab');
        t.equal(await shown(t),true,'shown at once');
    },
    'T-03':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', showDelayMs:0, hideDelayMs:300, placement:'BOTTOM' }`);
        await t.page.hover('#save');
        await t.wait(100);
        const bubble = await box(t,BUBBLE);
        await t.page.mouse.move(bubble.left + bubble.width / 2,bubble.top + bubble.height / 2,{ steps:3 });
        await t.wait(500);
        t.equal(await shown(t),true,'kept while the pointer is over the tooltip');
        await t.page.mouse.move(5,5);
        await t.wait(150);
        t.equal(await shown(t),true,'not hidden at once after leaving');
        await t.wait(350);
        t.equal(await shown(t),false,'hidden after a short pause');
    },
    'T-04':async t =>
    {
        await mount(t,`{ target:document.querySelector('#copy'), text:'Copy the order' }`);
        await t.page.focus('#save');
        await t.page.keyboard.press('Tab');
        await t.page.keyboard.press('Escape');
        t.equal([ await shown(t), await t.page.evaluate(() => document.activeElement.id) ],[ false, 'copy' ],'Escape hides it, focus stays');
        await t.call('show');
        await t.page.keyboard.press('Tab');
        await t.wait(250);
        t.equal(await shown(t),false,'moving the focus away hides it');
    },
    'T-05':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', showDelayMs:0 }`);
        await t.page.hover('#save');
        await t.wait(50);
        await t.page.click('#save');
        t.equal(await shown(t),false,'a click hides it');
    },
    'T-06':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', showDelayMs:0 }`);
        await mount(t,`{ target:document.querySelector('#copy'), text:'Copy the order', showDelayMs:0 }`,'tip2');
        await t.call('show');
        await t.page.evaluate(() => window.tip2.show());
        t.equal([ await shown(t), await shown(t,'tip2') ],[ false, true ],'one tooltip at a time');
    },
    'T-07':async t =>
    {
        await t.page.setViewportSize({ width:900, height:700 });
        await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', longPress:true }`);
        const session = await t.page.context().newCDPSession(t.page);
        await session.send('Emulation.setTouchEmulationEnabled',{ enabled:true, maxTouchPoints:5 });
        await t.page.evaluate(() => { window.clicks = 0; document.querySelector('#save').addEventListener('click',() => { window.clicks += 1; }); });
        const point = await box(t,'#save');
        const touch = [ { x:point.left + point.width / 2, y:point.top + point.height / 2 } ];
        await session.send('Input.dispatchTouchEvent',{ type:'touchStart', touchPoints:touch });
        await t.wait(650);
        t.equal(await shown(t),true,'a half-second press shows it');
        await session.send('Input.dispatchTouchEvent',{ type:'touchEnd', touchPoints:[] });
        await t.wait(50);
        t.equal(await t.page.evaluate(() => window.clicks),0,'the click that ends the press is not sent');
        await t.wait(1700);
        t.equal(await shown(t),false,'shown for a moment');
    },
    'T-08':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Save', shortcut:'Ctrl+S' }`);
        await t.call('show');
        t.equal(await t.page.$eval(BUBBLE,element => [ element.querySelector('.ui-tooltip-text').textContent, element.querySelector('kbd.ui-tooltip-shortcut').textContent, element.querySelector('kbd').hidden ]),[ 'Save', 'Ctrl+S', false ],'the text and the shortcut after it');
        await t.call('setText','Save all');
        t.equal(( await t.call('getState') ).text,'Save all','setText()');
        await t.call('setDisabled',true);
        t.equal([ await shown(t), await t.call('show') ],[ false, false ],'disabled: hidden and not shown');
        await t.call('setDisabled',false);
        t.equal(await t.call('show'),true,'on again');
    },
    'T-09':async t =>
    {
        const side = async placement => { await mount(t,`{ target:document.querySelector('#save'), text:'Save the order', placement:'${placement}' }`); await t.call('show'); const result = { side:await t.page.getAttribute(BUBBLE,'data-side'), bubble:await box(t,BUBBLE), target:await box(t,'#save') }; await t.call('destroy'); return result; };
        const top = await side('TOP'), bottom = await side('BOTTOM'), start = await side('START'), end = await side('END');
        t.assert(top.bubble.bottom <= top.target.top + 1 && bottom.bubble.top >= bottom.target.bottom - 1,'above, below');
        t.assert(start.bubble.right <= start.target.left + 1 && end.bubble.left >= end.target.right - 1,'before, after');
        await t.page.evaluate(() => { document.querySelector('#controls').style.marginBlockStart = '0px'; window.scrollTo(0,0); });
        await t.page.evaluate(() => { document.body.style.paddingBlockStart = '0px'; document.querySelector('#controls').style.cssText += ';position:fixed;top:0;left:-150px;'; });
        await mount(t,`{ target:document.querySelector('#save'), text:'A rather long text for the save button', placement:'TOP' }`);
        await t.call('show');
        const flipped = { side:await t.page.getAttribute(BUBBLE,'data-side'), bubble:await box(t,BUBBLE) };
        t.equal(flipped.side,'BOTTOM','the opposite side when there is no room');
        t.assert(flipped.bubble.left >= 0,`inside the window (${flipped.bubble.left})`);
    },
    'T-10':async t =>
    {
        const look = async extra => { await mount(t,`{ target:document.querySelector('#save'), text:'Save', ${extra} }`); await t.call('show'); const result = await t.page.$eval(BUBBLE,element => ( { background:getComputedStyle(element).backgroundColor, border:getComputedStyle(element).borderTopStyle, arrow:Boolean(element.querySelector('.ui-tooltip-arrow')) } )); await t.call('destroy'); return result; };
        const dark = await look(''), light = await look(`tone:'SURFACE'`), plain = await look('arrow:false');
        t.assert(dark.background !== light.background && light.border === 'solid','a dark or a light look');
        t.equal([ dark.arrow, plain.arrow ],[ true, false ],'with or without an arrow');
    },
    'T-11':async t =>
    {
        await mount(t,`{ targets:{ within:document.querySelector('#list'), selector:'button' }, showDelayMs:0 }`);
        await t.page.hover('#list li:first-child button');
        await t.wait(80);
        t.equal(await t.page.$eval(`${BUBBLE} .ui-tooltip-text`,element => element.textContent),'Edit order','one tooltip for a group, each with its own text');
        await t.page.evaluate(() => { document.querySelector('#list').insertAdjacentHTML('beforeend','<li><button type="button" data-tooltip="Archive order">A</button></li>'); });
        await t.page.hover('#list li:last-child button');
        await t.wait(150);
        t.equal(await t.page.$eval(`${BUBBLE} .ui-tooltip-text`,element => element.textContent),'Archive order','also for elements added later');
        t.equal(await t.page.getAttribute(BUBBLE,'aria-hidden'),'true','hidden from screen readers');
    },
    'T-12':async t =>
    {
        await mount(t,`{ target:document.querySelector('#long'), text:'A very long customer name indeed', onlyWhenTruncated:true }`);
        t.equal(await t.call('show'),true,'shown when the text is cut off');
        await t.call('destroy');
        await mount(t,`{ target:document.querySelector('#short'), text:'Short', onlyWhenTruncated:true }`);
        t.equal(await t.call('show'),false,'not shown when it fits');
    },
    'T-13':async t =>
    {
        await mount(t,`{ target:document.querySelector('#save'), text:'Saves the order and its lines' }`);
        t.equal(await t.page.getAttribute('#save','aria-describedby'),ID,'the element\'s description');
        await t.call('destroy');
        t.equal(await t.page.getAttribute('#save','aria-describedby'),null,'the link is removed with the tooltip');
        await mount(t,`{ target:document.querySelector('#icon'), text:'Add to favourites', purpose:'LABEL' }`);
        t.equal([ await t.page.getAttribute('#icon','aria-labelledby'), await t.page.getAttribute(BUBBLE,'role') ],[ ID, 'tooltip' ],'the name of an element without another name');
    },
    'T-14':async t =>
    {
        t.equal(await mount(t,`{ text:'Nothing' }`),null,'no target');
        await t.page.evaluate(() => { document.querySelector('#save').appendChild(Object.assign(document.createElement('span'),{ id:'inside-host' })); });
        t.equal(await t.page.evaluate(async () => { const { renderTooltip } = await import('/source/components-js/tooltip/tooltipIndex.js'); return renderTooltip(document.querySelector('#inside-host'),{ id:'tip3', target:document.querySelector('#save'), text:'Inside' }); }),null,'container inside the target');
        t.equal(await errors(t),[ 'TARGET_REQUIRED', 'CONTAINER_IN_TARGET' ],'labels');
    },
    'T-15':async t =>
    {
        t.assert(await mount(t,`{ target:document.querySelector('#save') }`),'rendered without text');
        t.equal([ ( await warnings(t,'TEXT_REQUIRED') ).length, await t.call('show') ],[ 1, false ],'nothing shows until setText()');
        await t.call('destroy');
        t.assert(await mount(t,`{ targets:{ within:document.querySelector('#list'), selector:'button' }, purpose:'LABEL' }`),'group rendered');
        await t.call('setText','Ignored');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'purpose and setText() ignored for a group');
    }
};
