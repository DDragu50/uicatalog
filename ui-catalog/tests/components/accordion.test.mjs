// accordion.test.mjs
//
// The "auto" cases of source/components-js/accordion/accordionTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Item content that renders fields, and the Form around the accordion, go through mount(),
// which evaluates the source in the page; the accordion instance is harness.instance.

const ID = 'faq';
const ROOT = `#${ID}`;
const DEPENDS = { stylesheets:[ 'collapsiblePanel', 'chip', 'button', 'tooltip' ] };
const ITEMS = [
    { id:'q1', title:'How do I order?', content:[ '<p>Choose a product.</p>' ] },
    { id:'q2', title:'How do I pay?', content:[ '<p>By card.</p>' ] },
    { id:'q3', title:'When does it arrive?', content:[ '<p>In two days.</p>' ] }
];
const BASE = { id:ID, items:ITEMS };
const toggle = id => `#${id} .ui-collapsible-panel-toggle`;
const open = t => t.call('getOpenIds');
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

async function mount( t, source, withForm = false )
{
    return t.page.evaluate(async ( [ code, id, form ] ) =>
    {
        [ 'accordion', 'collapsiblePanel', 'chip', 'button', 'form', 'textInput', 'message', 'loader' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        const [ { renderAccordion }, { renderTextInput }, { renderForm } ] = await Promise.all([ 'accordion', 'textInput', 'form' ].map(name => import(`/source/components-js/${name}/${name}Index.js`)));
        const config = new Function('renderTextInput',`return (${code});`)(renderTextInput);
        if ( !form ) { window.harness.instance = renderAccordion(document.querySelector('#host'),{ id, ...config }); return window.harness.instance ? id : null; }
        window.form = renderForm(document.querySelector('#host'),{ id:'order-form', showSubmit:false },[ host => ( window.harness.instance = renderAccordion(host,{ id, ...config }) ) ]);
        return window.harness.instance ? id : null;
    },[ source, ID, withForm ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onChange' ] });
        t.equal(await t.page.$$eval(`${ROOT} .ui-collapsible-panel-title`,items => items.map(item => item.textContent)),[ 'How do I order?', 'How do I pay?', 'When does it arrive?' ],'the sections in order');
        await t.page.click(toggle('q1'));
        t.equal(await open(t),[ 'q1' ],'a click opens a section');
        await t.page.click(toggle('q2'));
        t.equal(await open(t),[ 'q2' ],'one at a time: the open one closes first');
        await t.page.click(toggle('q2'));
        t.equal(await open(t),[],'and closes');
        t.equal(( await t.calls('onChange') ).map(call => call.args),[ [ [ 'q1' ], `instance(${ID})` ], [ [ 'q2' ], `instance(${ID})` ], [ [], `instance(${ID})` ] ],'the open sections reported');
        await t.call('expand','q3');
        t.equal(( await t.calls('onChange') ).length,3,'expand() by code is not reported');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, expandMode:'MULTIPLE', items:ITEMS.map(item => ( item.id === 'q3' ? { ...item, state:'EXPANDED' } : item )) },DEPENDS);
        t.equal(await open(t),[ 'q3' ],'chosen sections start open');
        await t.page.click(toggle('q1'));
        await t.page.click(toggle('q2'));
        t.equal(await open(t),[ 'q1', 'q2', 'q3' ],'independent sections');
        await t.call('collapseAll');
        t.equal(await open(t),[],'collapseAll()');
        t.equal(await t.call('expandAll'),true,'expandAll()');
    },
    'T-03':async t =>
    {
        const look = async extra => { await t.render({ ...BASE, ...extra },DEPENDS); const result = await t.page.evaluate(id => { const root = document.getElementById(id); const panels = [ ...root.querySelectorAll('.ui-collapsible-panel') ].map(panel => panel.getBoundingClientRect()); const line = getComputedStyle(root.querySelectorAll('.ui-accordion-item')[1]).borderTopStyle; return { gap:Math.round(panels[1].top - panels[0].bottom), frame:getComputedStyle(root).borderTopStyle, line, radius:parseFloat(getComputedStyle(root).borderTopLeftRadius), cardRadius:parseFloat(getComputedStyle(root.querySelector('.ui-collapsible-panel')).borderTopLeftRadius) }; },ID); await t.call('destroy'); return result; };
        const joined = await look({}), separate = await look({ look:'SEPARATE' }), square = await look({ cornerRadius:'NONE' }), bare = await look({ bordered:false });
        t.assert(joined.frame === 'solid' && joined.gap <= 1,`one frame with a line between the sections (${JSON.stringify(joined)})`);
        t.assert(separate.gap > 4 && separate.cardRadius > 0,`one card per section with space between (${JSON.stringify(separate)})`);
        t.assert(joined.radius > 0 && square.radius === 0,'rounded or square corners');
        t.assert(bare.frame !== 'solid' || parseFloat(bare.frame) === 0,'without a border');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, items:[ { ...ITEMS[0], icon:'fa-solid fa-cart-shopping', description:'Step by step', chips:[ { label:'New', type:'INFO' } ], actions:[ { key:'share', label:'Share' } ], status:'SUCCESS', summaryEmptyText:'Two steps' }, ITEMS[1] ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        const first = await t.page.$eval('#q1',element => ( { icon:Boolean(element.querySelector('.fa-cart-shopping')), description:element.querySelector('.ui-collapsible-panel-description')?.textContent, chip:element.querySelector('.ui-chip')?.textContent.trim(), action:element.querySelector('.ui-collapsible-panel-action button')?.textContent.trim(), status:element.dataset.status, summary:element.querySelector('.ui-collapsible-panel-summary').textContent.trim() } ));
        t.equal(first,{ icon:true, description:'Step by step', chip:'New', action:'Share', status:'SUCCESS', summary:'Two steps' },'icon, description, label, button, status and summary while closed');
    },
    'T-05':async t =>
    {
        await t.render({ ...BASE, items:[ ITEMS[0], { ...ITEMS[1], disabled:true }, ITEMS[2] ] },DEPENDS);
        await t.page.focus(toggle('q1'));
        const path = [];
        for ( const key of [ 'ArrowDown', 'ArrowDown', 'Home', 'End', 'ArrowUp' ] ) { await t.page.keyboard.press(key); path.push(await t.page.evaluate(() => document.activeElement.closest('.ui-collapsible-panel')?.id)); }
        t.equal(path,[ 'q3', 'q1', 'q1', 'q3', 'q1' ],'arrows (wrapping), Home and End move between titles, skipping the disabled one');
    },
    'T-06':async t =>
    {
        await t.render({ ...BASE, headingLevel:4 },DEPENDS);
        t.equal(await t.page.$$eval(`${ROOT} h4 .ui-collapsible-panel-toggle`,items => items.map(item => item.getAttribute('aria-expanded'))),[ 'false', 'false', 'false' ],'each title is a heading of the chosen level with its state');
        await t.page.click(toggle('q2'));
        t.equal(await t.page.getAttribute(toggle('q2'),'aria-expanded'),'true','the open state');
    },
    'T-07':async t =>
    {
        await mount(t,`{ items:[ { id:'who', title:'Who', content:[ host => renderTextInput(host,{ id:'name', label:'Name', value:'Ana' }) ] }, { id:'where', title:'Where', lazyContent:true, content:[ host => renderTextInput(host,{ id:'city', label:'City', value:'Iasi' }) ] } ] }`,true);
        t.equal(await t.page.evaluate(() => window.form.getValues()),{ name:'Ana' },'fields of a closed section belong to the form');
        await t.call('expand','where');
        t.equal(await t.page.evaluate(() => window.form.getValues()),{ name:'Ana', city:'Iasi' },'fields that load on first opening are added once opened');
    },
    'T-08':async t =>
    {
        const share = '#q1 [data-action="share"] button';
        const items = [ { ...ITEMS[0], actions:[ { key:'share', label:'Share', icon:'fa-solid fa-share', iconOnly:true } ], onAction:{ $callback:'onAction' } }, ITEMS[1] ];
        await t.render({ id:ID, items, tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(share,'title'),'Share','TITLE');
        await t.call('destroy');
        await t.render({ id:ID, items },DEPENDS);
        t.equal(await t.page.getAttribute(share,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ id:ID, items, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(share);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Share')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-09':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onChange' ] });
        t.equal(await t.page.evaluate(id => { const first = document.querySelector('#q1 .ui-collapsible-panel-toggle'); return { panel:window.harness.instance.getPanel('q1')?.id, children:window.harness.instance.getChildren().length }; },ID),{ panel:'q1', children:3 },'getPanel(), getChildren()');
        await t.page.evaluate(() => { window.toggles = []; });
        await t.call('destroy');
        await t.page.evaluate(async id =>
        {
            const { renderAccordion } = await import('/source/components-js/accordion/accordionIndex.js');
            window.harness.instance = renderAccordion(document.querySelector('#host'),{ id, onChange:openIds => window.toggles.push([ 'change', openIds.join() ]), items:[ { id:'q1', title:'One', onToggle:state => window.toggles.push([ 'toggle', state ]) }, { id:'q2', title:'Two' } ] });
        },ID);
        await t.page.click(toggle('q1'));
        t.equal(await t.page.evaluate(() => window.toggles),[ [ 'toggle', 'EXPANDED' ], [ 'change', 'q1' ] ],'the item\'s own onToggle runs before onChange');
    },
    'T-10':async t =>
    {
        t.equal(await t.render({ id:ID, items:[] },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[ITEMS_REQUIRED]')),'console error');
    },
    'T-11':async t =>
    {
        t.assert(await t.render({ id:ID, items:[ { ...ITEMS[0], state:'EXPANDED', headingLevel:2, bordered:true }, 'not an item', { id:'q2' }, { ...ITEMS[2], state:'EXPANDED' } ] },DEPENDS),'rendered');
        const counts = {};
        for ( const label of [ 'OPTION_IGNORED', 'INVALID_ITEM', 'ITEM_NOT_RENDERED', 'SINGLE_EXPANDED' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ OPTION_IGNORED:2, INVALID_ITEM:1, ITEM_NOT_RENDERED:1, SINGLE_EXPANDED:1 },'warnings');
        t.equal(await open(t),[ 'q1' ],'only the first stays open');
        t.equal(await t.call('expand','nope'),false,'unknown id');
        t.equal(( await warnings(t,'UNKNOWN_ITEM') ).length,1,'UNKNOWN_ITEM');
        t.equal(await t.call('expandAll'),false,'expandAll() in one-at-a-time mode');
    }
};
