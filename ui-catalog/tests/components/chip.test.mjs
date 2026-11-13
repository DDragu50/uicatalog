// chip.test.mjs
//
// The "auto" cases of source/components-js/chip/chipTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). The harness renders through renderChips(container, configs, onRemove): the "config" is
// the collection, and onRemove is passed as a { $callback } value in args.

const LIST = '#host .ui-chip-list';
const RECORD = { args:[ { $callback:'onRemove' } ] };
const chip = index => `#host .ui-chip:nth-of-type(${index})`;
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
const colourOf = ( t, token ) => t.page.evaluate(name => { const probe = document.createElement('span'); probe.style.color = `var(${name})`; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; },token);

export const cases =
{
    'T-01':async t =>
    {
        await t.render([ { label:'John', prefix:'Owner:' } ],RECORD);
        t.equal(await t.page.$eval(`${chip(1)} .ui-chip-label`,element => [ element.textContent, element.querySelector('b')?.textContent, Number(getComputedStyle(element.querySelector('b')).fontWeight) >= 600 ]),[ 'Owner: John', 'Owner:', true ],'text with a bold prefix');
    },
    'T-02':async t =>
    {
        await t.render([ { label:'Shipped', iconBefore:'fa-solid fa-truck', iconAfter:'fa-solid fa-check' } ],RECORD);
        const order = await t.page.$eval(chip(1),element => [ ...element.children ].map(child => ( child.classList.contains('ui-chip-label') ? 'label' : child.className.split(' ')[0] )));
        t.equal(order,[ 'ui-chip-icon-before', 'label', 'ui-chip-icon-after' ],'icons at the start and at the end');
    },
    'T-03':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '8rem'; });
        await t.render([ { label:'A very long customer segment name' } ],RECORD);
        t.equal(await t.page.$eval(`${chip(1)} .ui-chip-label`,element => [ element.scrollWidth > element.clientWidth, getComputedStyle(element).textOverflow ]),[ true, 'ellipsis' ],'shortened with "…"');
    },
    'T-04':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '16rem'; });
        await t.render([ 'Retail', 'Banking', 'Insurance', 'Logistics', 'Energy' ].map(label => ( { label } )),RECORD);
        const tops = await t.page.$$eval('#host .ui-chip',items => items.map(item => Math.round(item.getBoundingClientRect().top)));
        t.assert(new Set(tops).size > 1 && tops[0] === tops[1],`a row that wraps (${tops.join(', ')})`);
    },
    'T-05':async t =>
    {
        await t.render([ 'SUCCESS', 'WARNING', 'DANGER', 'INFO' ].map(type => ( { label:type, type } )).concat([ { label:'Own', backgroundToken:'--c-accent', colorToken:'--c-on-accent' } ]),RECORD);
        const colours = await t.page.$$eval('#host .ui-chip',items => items.map(item => getComputedStyle(item).backgroundColor));
        t.equal(new Set(colours.slice(0,4)).size,4,'a colour per status');
        t.equal([ colours[4], await t.page.$eval(chip(5),element => getComputedStyle(element).color) ],[ await colourOf(t,'--c-accent'), await colourOf(t,'--c-on-accent') ],'own colours from the design system');
    },
    'T-06':async t =>
    {
        await t.render([ { label:'Plain' }, { label:'Framed', bordered:true } ],RECORD);
        const borders = await t.page.$$eval('#host .ui-chip',items => items.map(item => [ getComputedStyle(item).borderTopColor, getComputedStyle(item).color ]));
        t.assert(borders[1][0] === borders[1][1] && borders[0][0] !== borders[1][0],`a border in the text colour (${JSON.stringify(borders)})`);
    },
    'T-07':async t =>
    {
        await t.render([ { id:'c1', label:'Retail', prefix:'Segment:', removable:true }, { id:'c2', label:'Banking', removable:true, removeLabel:'Remove the banking filter' } ],RECORD);
        const remove = await t.page.$$eval('#host .ui-chip-remove',buttons => buttons.map(button => [ button.textContent.trim(), button.getAttribute('aria-label') ]));
        t.equal(remove,[ [ '×', 'Remove Segment: Retail' ], [ '×', 'Remove the banking filter' ] ],'a "×" after the text, named');
        await t.page.click(`${chip(2)} .ui-chip-remove`);
        const call = ( await t.calls('onRemove') )[0];
        t.equal(call.args,[ 'c2', '<span>' ],'the removal request reported');
        t.equal(await t.page.$$eval('#host .ui-chip',items => items.length),2,'the chip is not removed by itself');
        await t.call('setChips',[ { id:'c1', label:'Retail', removable:true } ]);
        t.equal(await t.page.$$eval('#host .ui-chip',items => items.map(item => item.textContent.replace('×','').trim())),[ 'Retail' ],'the App decides: setChips()');
    },
    'T-08':async t =>
    {
        t.equal(await t.render('not a list',RECORD),null,'not a list');
        t.equal(await t.page.evaluate(async () => { const { renderChips } = await import('/source/components-js/chip/chipIndex.js'); return renderChips(null,[]); }),null,'no container');
        t.assert(await t.render([ { label:'' }, { label:'X', removable:true }, { label:'Bad bg', backgroundToken:'red' }, { label:'Bad colour', colorToken:'blue' }, { id:'d', label:'One', removable:true }, { id:'d', label:'Two', removable:true }, { label:'Fine' } ],RECORD),'the valid chips render');
        t.equal(await errors(t),[ 'CONFIGS_NOT_ARRAY', 'CONTAINER_REQUIRED', 'LABEL_REQUIRED', 'ID_REQUIRED_WHEN_REMOVABLE', 'INVALID_BACKGROUND_TOKEN', 'INVALID_COLOR_TOKEN', 'DUPLICATE_ID' ],'errors');
        t.equal(await t.page.$$eval('#host .ui-chip',items => items.map(item => item.textContent.replace('×','').trim())),[ 'One', 'Fine' ],'invalid chips are omitted');
    },
    'T-09':async t =>
    {
        t.assert(await t.render([ { label:'A', type:'GREEN' }, { label:'B', iconBefore:'fa-solid fa-<bad>' }, { label:'C', type:'SUCCESS', backgroundToken:'--c-accent' } ],RECORD),'rendered');
        t.equal([ ( await warnings(t,'INVALID_OPTION') ).length, ( await warnings(t,'INVALID_ICON_CLASS') ).length, ( await warnings(t,'OPTION_IGNORED') ).length ],[ 1, 1, 1 ],'one warning each');
    }
};
