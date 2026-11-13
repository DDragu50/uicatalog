// collapsiblePanel.test.mjs
//
// The "auto" cases of source/components-js/collapsiblePanel/collapsiblePanelTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Children are the third render argument (strings, or { $html } render functions);
// summaryRenderer and content that returns an instance go through mount(), which evaluates the source in the page.

const ID = 'shipping';
const ROOT = `#${ID}`;
const TOGGLE = `${ROOT} .ui-collapsible-panel-toggle`;
const DEPENDS = { stylesheets:[ 'chip', 'button', 'tooltip' ] };
const CONTENT = [ '<p id="inside">Delivery address and options.</p>' ];
const BASE = { id:ID, title:'Shipping', description:'Address and delivery', icon:'fa-solid fa-truck' };
const state = t => t.page.$eval(ROOT,element => element.dataset.state);
const contentShown = t => t.page.$eval(`${ROOT} .ui-collapsible-panel-content`,element => getComputedStyle(element).display !== 'none');
const summary = t => t.page.$eval(`${ROOT} .ui-collapsible-panel-summary`,element => ( getComputedStyle(element).display === 'none' ? '' : element.textContent.trim() ));
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

async function mount( t, source, children )
{
    return t.page.evaluate(async ( [ code, kids, id ] ) =>
    {
        [ 'collapsiblePanel', 'chip', 'button' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        const { renderCollapsiblePanel } = await import('/source/components-js/collapsiblePanel/collapsiblePanelIndex.js');
        window.renders = 0;
        window.harness.instance = renderCollapsiblePanel(document.querySelector('#host'),{ id, ...new Function(`return (${code});`)() },new Function(`return (${kids});`)());
        return window.harness.instance ? id : null;
    },[ source, children, ID ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onToggle' ], args:[ CONTENT ] });
        t.equal([ await state(t), await contentShown(t), await t.page.getAttribute(TOGGLE,'aria-expanded') ],[ 'COLLAPSED', false, 'false' ],'closed by default');
        await t.page.click(TOGGLE);
        t.equal([ await state(t), await contentShown(t), await t.page.getAttribute(TOGGLE,'aria-expanded') ],[ 'EXPANDED', true, 'true' ],'opens');
        await t.page.click(TOGGLE);
        t.equal(await state(t),'COLLAPSED','closes');
        t.equal(( await t.calls('onToggle') ).map(call => call.args),[ [ 'EXPANDED', `instance(${ID})` ], [ 'COLLAPSED', `instance(${ID})` ] ],'each new state reported');
        await t.call('expand');
        t.equal(( await t.calls('onToggle') ).length,2,'expand() by code is not reported');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, state:'EXPANDED' },{ ...DEPENDS, args:[ CONTENT ] });
        t.equal(await state(t),'EXPANDED','starts open');
        await t.call('destroy');
        await t.render({ ...BASE, collapsible:false },{ ...DEPENDS, args:[ CONTENT ] });
        t.equal([ await state(t), await t.page.$(TOGGLE), await contentShown(t) ],[ 'EXPANDED', null, true ],'always open, without a toggle');
    },
    'T-03':async t =>
    {
        await t.render({ ...BASE, disabled:true },{ ...DEPENDS, callbacks:[ 'onToggle' ], args:[ CONTENT ] });
        await t.page.click(TOGGLE,{ force:true });
        t.equal([ await state(t), ( await t.calls('onToggle') ).length, await t.page.$eval(TOGGLE,element => element.disabled) ],[ 'COLLAPSED', 0, true ],'the header cannot open or close it');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, headingLevel:3 },{ ...DEPENDS, args:[ CONTENT ] });
        const header = await t.page.$eval(ROOT,element => ( { heading:element.querySelector('h3 .ui-collapsible-panel-toggle') !== null, title:element.querySelector('.ui-collapsible-panel-title').textContent, description:element.querySelector('.ui-collapsible-panel-description').textContent, icon:Boolean(element.querySelector('.ui-collapsible-panel-icon.fa-truck')), region:element.querySelector('.ui-collapsible-panel-content').getAttribute('aria-labelledby') } ));
        t.equal(header,{ heading:true, title:'Shipping', description:'Address and delivery', icon:true, region:`${ID}-title` },'title, description and icon; a heading; the content region named by the title');
    },
    'T-05':async t =>
    {
        const edge = async status => { await t.render({ ...BASE, ...( status ? { status } : {} ) },{ ...DEPENDS, args:[ CONTENT ] }); const colour = await t.page.$eval(ROOT,element => getComputedStyle(element).borderInlineStartColor); await t.call('destroy'); return colour; };
        const colours = { DEFAULT:await edge(null), SUCCESS:await edge('SUCCESS'), WARNING:await edge('WARNING'), ERROR:await edge('ERROR'), INCOMPLETE:await edge('INCOMPLETE') };
        t.equal(new Set(Object.values(colours)).size,5,`a side border per status (${JSON.stringify(colours)})`);
        await t.render(BASE,{ ...DEPENDS, args:[ CONTENT ] });
        t.equal([ await t.call('setStatus','success'), await t.call('getStatus'), await t.page.$eval(ROOT,element => getComputedStyle(element).borderInlineStartColor) ],[ true, 'SUCCESS', colours.SUCCESS ],'the App changes it');
        t.equal(await t.call('setStatus','DONE'),false,'an invalid status is refused');
        t.equal(( await warnings(t,'INVALID_STATUS') ).length,1,'INVALID_STATUS');
    },
    'T-06':async t =>
    {
        await t.render({ ...BASE, chips:[ { label:'Draft' } ], actions:[ { key:'edit', label:'Edit', icon:'fa-solid fa-pen' }, { key:'remove', label:'Remove', icon:'fa-solid fa-trash', iconOnly:true } ] },{ ...DEPENDS, callbacks:[ 'onAction', 'onToggle' ], args:[ CONTENT ] });
        const header = await t.page.$eval(`${ROOT} .ui-collapsible-panel-header`,element => ( { chip:element.querySelector('.ui-chip')?.textContent.trim(), actions:[ ...element.querySelectorAll('.ui-collapsible-panel-action button') ].map(button => button.textContent.trim() || button.getAttribute('aria-label')) } ));
        t.equal(header,{ chip:'Draft', actions:[ 'Edit', 'Remove' ] },'labels and action buttons');
        await t.page.click(`${ROOT} [data-action="edit"] button`);
        t.equal([ ( await t.calls('onAction') ).map(call => call.args), await state(t), ( await t.calls('onToggle') ).length ],[ [ [ 'edit', `instance(${ID})` ] ], 'COLLAPSED', 0 ],'reported without opening the panel');
    },
    'T-07':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '22rem'; });
        await t.render({ ...BASE, chips:[ { label:'Draft' } ], actions:[ { key:'edit', label:'Edit' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ], args:[ CONTENT ] });
        const narrow = await t.page.$eval(ROOT,element => { const title = element.querySelector('.ui-collapsible-panel-toggle').getBoundingClientRect(), extras = element.querySelector('.ui-collapsible-panel-chips').getBoundingClientRect(); return extras.top >= title.bottom - 1; });
        t.equal(narrow,true,'labels and buttons below the title when narrow');
    },
    'T-08':async t =>
    {
        await mount(t,`{ title:'Shipping', summaryRenderer:panel => panel.getState() === 'COLLAPSED' ? 'Standard, Iasi' : 'Editing…' }`,`[ '<p>Content</p>' ]`);
        t.equal(await summary(t),'Standard, Iasi','the summary while closed');
        await t.call('expand');
        t.equal(await summary(t),'','hidden while open');
        await t.call('destroy');
        await mount(t,`{ title:'Shipping', showSummaryWhenExpanded:true, summaryRenderer:panel => 'Standard, Iasi' }`,`[ '<p>Content</p>' ]`);
        await t.call('expand');
        t.equal(await summary(t),'Standard, Iasi','also while open when chosen');
        await t.call('destroy');
        await t.render({ ...BASE, summaryEmptyText:'Not filled in yet' },{ ...DEPENDS, args:[ CONTENT ] });
        t.equal(await summary(t),'Not filled in yet','a placeholder when empty');
    },
    'T-09':async t =>
    {
        const look = async variant => { await t.render({ ...BASE, state:'EXPANDED', ...( variant ? { variant } : {} ) },{ ...DEPENDS, args:[ CONTENT ] }); const result = await t.page.$eval(ROOT,element => ( { background:getComputedStyle(element).backgroundColor, shadow:getComputedStyle(element).boxShadow, bottom:getComputedStyle(element).borderBottomStyle, padding:element.querySelector('.ui-collapsible-panel-header').getBoundingClientRect().height } )); await t.call('destroy'); return result; };
        const card = await look(null), inline = await look('INLINE'), compact = await look('COMPACT');
        t.assert(card.shadow !== 'none' || card.background !== 'rgba(0, 0, 0, 0)','a card');
        t.assert(inline.shadow === 'none' && inline.background === 'rgba(0, 0, 0, 0)' && inline.bottom === 'solid','inline: no card, a line below');
        t.assert(compact.padding < card.padding,`compact: smaller spacing (${compact.padding} < ${card.padding})`);
    },
    'T-10':async t =>
    {
        const frame = async extra => { await t.render({ ...BASE, ...extra },{ ...DEPENDS, args:[ CONTENT ] }); const result = await t.page.$eval(ROOT,element => [ parseFloat(getComputedStyle(element).borderTopWidth), parseFloat(getComputedStyle(element).borderTopLeftRadius) ]); await t.call('destroy'); return result; };
        const plain = await frame({}), bordered = await frame({ bordered:true }), square = await frame({ cornerRadius:'NONE' });
        t.assert(bordered[0] > plain[0],'a border');
        t.assert(plain[1] > 0 && square[1] === 0,'rounded or square corners');
    },
    'T-11':async t =>
    {
        await mount(t,`{ title:'Shipping', lazyContent:true }`,`[ '<p id="static">Text</p>', ( host ) => { window.renders += 1; host.innerHTML = '<input id="street">'; return { id:'street-field', destroy:() => {} }; } ]`);
        t.equal([ await t.page.$('#street'), await t.page.evaluate(() => window.renders), await t.call('getChildren') ],[ null, 0, [] ],'nothing rendered before the first opening');
        await t.call('expand');
        await t.call('collapse');
        await t.call('expand');
        t.equal([ Boolean(await t.page.$('#static')), Boolean(await t.page.$('#street')), await t.page.evaluate(() => window.renders), await t.call('getChildren') ],[ true, true, 1, [ 'instance(street-field)' ] ],'text and components rendered once, on the first opening');
    },
    'T-12':async t =>
    {
        const remove = `${ROOT} [data-action="remove"] button`;
        const config = { ...BASE, actions:[ { key:'remove', label:'Remove', icon:'fa-solid fa-trash', iconOnly:true } ] };
        await t.render({ ...config, tooltipMode:'TITLE' },{ ...DEPENDS, callbacks:[ 'onAction' ], args:[ CONTENT ] });
        t.equal(await t.page.getAttribute(remove,'title'),'Remove','TITLE');
        await t.call('destroy');
        await t.render(config,{ ...DEPENDS, callbacks:[ 'onAction' ], args:[ CONTENT ] });
        t.equal(await t.page.getAttribute(remove,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ ...config, tooltipMode:'TOOLTIP' },{ ...DEPENDS, callbacks:[ 'onAction' ], args:[ CONTENT ] });
        await t.page.hover(remove);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Remove')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-13':async t =>
    {
        t.equal(await t.render({ id:ID, title:'' },{ ...DEPENDS, args:[ CONTENT ] }),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[TITLE_REQUIRED]')),'console error');
    },
    'T-14':async t =>
    {
        t.assert(await t.render({ ...BASE, icon:'fa-solid fa-<bad>', chips:'Draft', actions:[ { key:'a', label:'A' }, { key:'b' }, { key:'a', label:'A again' } ] },{ ...DEPENDS, args:[ [ CONTENT[0], 42 ] ] }),'rendered');
        const counts = {};
        for ( const label of [ 'INVALID_ICON_CLASS', 'INVALID_COLLECTION', 'INVALID_ACTION', 'DUPLICATE_ACTION_KEY', 'ACTION_HANDLER_MISSING', 'INVALID_CHILD' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ INVALID_ICON_CLASS:1, INVALID_COLLECTION:1, INVALID_ACTION:1, DUPLICATE_ACTION_KEY:1, ACTION_HANDLER_MISSING:1, INVALID_CHILD:1 },'one warning each');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'UNKNOWN_ACTION');
    },
    'T-15':async t =>
    {
        t.assert(await t.render({ ...BASE, collapsible:false, disabled:true },{ ...DEPENDS, args:[ CONTENT ] }),'rendered');
        await t.call('destroy');
        t.assert(await t.render({ ...BASE, variant:'INLINE', bordered:true },{ ...DEPENDS, args:[ CONTENT ] }),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    }
};
