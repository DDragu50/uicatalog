// topNavigation.test.mjs
//
// The "auto" cases of source/components-js/topNavigation/topNavigationTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onNavigate is the third render argument; 'onNavigate:preventDefault' (in callbacks) also
// stops the link, as a single-page application does.

const ID = 'main-nav';
const NAV = `#${ID}`;
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const ITEMS = [
    { id:'home', label:'Home', href:'#home' },
    { id:'products', label:'Products', children:[ { id:'laptops', label:'Laptops', href:'#laptops' }, { id:'phones', label:'Phones', href:'#phones' }, { type:'SEPARATOR' }, { type:'GROUP', label:'Extras', children:[ { id:'cases', label:'Cases', href:'#cases' } ] } ] },
    { id:'solutions', label:'Solutions', panel:'MEGA', children:[ { type:'GROUP', label:'By industry', children:[ { id:'retail', label:'Retail', href:'#retail', description:'Shops and chains' }, { id:'banking', label:'Banking', href:'#banking' } ] }, { type:'GROUP', label:'By size', children:[ { id:'startups', label:'Startups', href:'#startups' } ] } ] },
    { id:'support', label:'Support', href:'#support', children:[ { id:'contact', label:'Contact', href:'#contact' }, { id:'docs', label:'Docs', href:'https://example.com/docs', external:true } ] },
    { id:'careers', label:'Careers', href:'#careers', icon:'fa-solid fa-briefcase', badge:'3' },
    { id:'blog', label:'Blog', href:'#blog', disabled:true },
    { id:'about', label:'About us', href:'#about' }
];
const BASE = { id:ID, items:ITEMS };
const TOP = { home:0, products:1, solutions:2, support:3 };
const top = id => `${NAV} .ui-top-nav-bar > li[data-top="${TOP[id]}"]`;
const trigger = label => `${NAV} .ui-top-nav-bar button.ui-top-nav-link:has-text("${label}"), ${NAV} .ui-top-nav-bar .ui-top-nav-toggle[aria-label*="${label}"]`;
const openPanels = t => t.page.$$eval(`${NAV} .ui-top-nav-panel`,panels => panels.filter(panel => !panel.hidden).map(panel => panel.id));
const reported = async t => ( await t.calls('onNavigate') ).map(call => call.args[0].id);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,DEPENDS);
        const bar = await t.page.$$eval(`${NAV} .ui-top-nav-bar > li:not([hidden])`,items => items.map(item => item.querySelector('.ui-top-nav-label')?.textContent.trim()));
        t.equal(bar.slice(0,4),[ 'Home', 'Products', 'Solutions', 'Support' ],'the main sections');
        await t.page.click(trigger('Products'));
        t.equal(await t.page.$$eval(`${NAV} .ui-top-nav-panel:not([hidden]) a`,links => links.map(link => link.textContent.trim())),[ 'Laptops', 'Phones', 'Cases' ],'its sub-pages');
    },
    'T-02':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.page.click(trigger('Products'));
        t.equal(await openPanels(t),[ `${ID}-p1` ],'the panel opens');
        t.equal(await t.page.getAttribute(`${NAV} [data-toggle="${ID}-p1"]`,'aria-expanded'),'true','announced as expanded');
        await t.page.click(trigger('Solutions'));
        t.equal(await openPanels(t),[ `${ID}-p2` ],'any other one closes');
    },
    'T-03':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.page.click(trigger('Products'));
        await t.page.keyboard.press('Escape');
        t.equal(await openPanels(t),[],'Escape closes it');
        await t.page.click(trigger('Products'));
        await t.page.click('#after');
        t.equal(await openPanels(t),[],'a click outside closes it');
        await t.page.click(trigger('Products'));
        await t.page.focus(`${NAV} a[data-item="cases"]`);
        await t.page.keyboard.press('Tab');
        t.equal(await openPanels(t),[],'leaving it with the keyboard closes it');
    },
    'T-04':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate:preventDefault' ] });
        await t.page.click(trigger('Products'));
        await t.page.click(`${NAV} a[data-item="phones"]`);
        const call = ( await t.calls('onNavigate') )[0];
        t.equal([ call.args[0], call.args[1], call.args[2] ],[ { id:'phones', label:'Phones', href:'#phones', external:false }, 'Event(click)', `instance(${ID})` ],'the page reported');
        t.equal(await openPanels(t),[],'the panel closes');
        t.assert(!t.page.url().endsWith('#phones'),'the App opens the page');
    },
    'T-05':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.page.click(trigger('Products'));
        const list = await t.page.$eval(`#${ID}-p1`,panel => ( { list:panel.classList.contains('ui-top-nav-panel-list-style'), separator:Boolean(panel.querySelector('[role="separator"]')), group:panel.querySelector('.ui-top-nav-group-label')?.textContent.trim() } ));
        t.equal(list,{ list:true, separator:true, group:'Extras' },'a simple list with a line and a heading');
        await t.page.click(trigger('Solutions'));
        const mega = await t.page.$eval(`#${ID}-p2`,panel => ( { mega:panel.classList.contains('ui-top-nav-panel-mega'), columns:[ ...panel.querySelectorAll('.ui-top-nav-column') ].map(column => column.querySelector('.ui-top-nav-group-label')?.textContent.trim()), tops:[ ...panel.querySelectorAll('.ui-top-nav-column') ].map(column => Math.round(column.getBoundingClientRect().top)), description:panel.querySelector('a[data-item="retail"] .ui-top-nav-description')?.textContent.trim() } ));
        t.equal([ mega.mega, mega.columns, mega.description ],[ true, [ 'By industry', 'By size' ], 'Shops and chains' ],'a mega menu with a column per group and descriptions');
        t.equal(new Set(mega.tops).size,1,'columns side by side');
    },
    'T-06':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate:preventDefault' ] });
        const support = await t.page.$eval(top('support'),item => ( { link:item.querySelector('a[data-item="support"]')?.getAttribute('href'), arrow:item.querySelector('.ui-top-nav-toggle')?.getAttribute('aria-label') } ));
        t.equal(support,{ link:'#support', arrow:'Support pages' },'the section name is a link, with a small arrow button');
        await t.page.click(`${NAV} .ui-top-nav-toggle[aria-label="Support pages"]`);
        t.equal(await openPanels(t),[ `${ID}-p3` ],'the arrow opens the panel');
        await t.page.keyboard.press('Escape');
        await t.page.click(`${NAV} a[data-item="support"]`);
        t.equal(await reported(t),[ 'support' ],'the name opens the section page');
    },
    'T-07':async t =>
    {
        await t.render({ ...BASE, currentId:'phones' },DEPENDS);
        await t.page.click(trigger('Products'));
        t.equal(await t.page.getAttribute(`${NAV} a[data-item="phones"]`,'aria-current'),'page','the current page marked');
        t.assert(await t.page.$eval(top('products'),item => item.classList.contains('ui-top-nav-current-branch')),'its section highlighted');
        const marks = {};
        for ( const currentStyle of [ 'UNDERLINE', 'PILL', 'TAB' ] )
        {
            await t.call('destroy');
            await t.render({ ...BASE, currentId:'phones', currentStyle },DEPENDS);
            marks[currentStyle] = await t.page.$eval(`${top('products')} .ui-top-nav-link`,element => { const style = getComputedStyle(element), after = getComputedStyle(element,'::after'); return [ style.backgroundColor, style.borderTopLeftRadius, after.content !== 'none' ? after.backgroundColor + after.height : style.borderBottomWidth ].join('|'); });
        }
        t.equal(new Set(Object.values(marks)).size,3,`three different highlights (${JSON.stringify(marks)})`);
    },
    'T-08':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '34rem'; });
        await t.render({ ...BASE, currentId:'about' },DEPENDS);
        await t.wait(100);
        const more = await t.page.$eval(`${NAV} .ui-top-nav-more`,item => ( { shown:!item.hidden, current:item.classList.contains('ui-top-nav-current-branch'), border:getComputedStyle(item.querySelector('button')).borderTopStyle, radius:parseFloat(getComputedStyle(item.querySelector('button')).borderTopLeftRadius) } ));
        t.equal([ more.shown, more.current, more.border ],[ true, true, 'solid' ],'"More" shown as an outlined pill, highlighted when it holds the current page');
        t.assert(more.radius > 8,'pill corners');
        await t.page.click(`${NAV} .ui-top-nav-more-button`);
        const inside = await t.page.$$eval(`#${ID}-more-panel a, #${ID}-more-panel .ui-top-nav-group-label`,items => items.map(item => item.textContent.trim()));
        t.assert(inside.some(text => text.startsWith('About us')),`the last sections are inside (${inside.join(', ')})`);
        await t.page.keyboard.press('Escape');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = ''; });
        await t.wait(300);
        t.equal(await t.page.$eval(`${NAV} .ui-top-nav-more`,item => item.hidden),true,'sections move back when the width grows');
    },
    'T-09':async t =>
    {
        await t.page.setViewportSize({ width:700, height:800 });
        await t.render({ ...BASE, currentId:'phones' },DEPENDS);
        const menu = `${NAV} .ui-top-nav-menu-host button`;
        t.equal([ await t.page.isVisible(menu), await t.page.isVisible(`${NAV} .ui-top-nav-bar`) ],[ true, false ],'a menu button instead of the bar below 48rem');
        await t.page.click(menu);
        const panel = await t.page.$eval(`#${ID}-mobile`,element => ( { open:!element.hidden, sections:[ ...element.querySelectorAll('.ui-top-nav-mobile-section') ].map(button => [ button.querySelector('.ui-top-nav-label').textContent.trim(), button.getAttribute('aria-expanded') ]) } ));
        t.equal(panel.open,true,'the panel opens');
        t.equal(panel.sections.find(section => section[0] === 'Products')?.[1],'true','the section of the current page is open');
        t.assert(panel.sections.filter(section => section[1] === 'true').length === 1,'the others are closed');
    },
    'T-10':async t =>
    {
        await t.render(BASE,DEPENDS);
        const careers = await t.page.$eval(`${NAV} a[data-item="careers"]`,link => ( { icon:Boolean(link.querySelector('.ui-top-nav-icon .fa-briefcase')), badge:link.querySelector('.ui-top-nav-badge')?.textContent } ));
        t.equal(careers,{ icon:true, badge:'3' },'icon and counter');
        await t.call('setBadge','careers','5');
        t.equal(await t.page.$eval(`${NAV} a[data-item="careers"] .ui-top-nav-badge`,element => element.textContent),'5','setBadge()');
        await t.call('setBadge','careers','');
        t.equal(await t.page.$(`${NAV} a[data-item="careers"] .ui-top-nav-badge`),null,'removed');
    },
    'T-11':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate' ] });
        const blog = await t.page.$eval(`${NAV} .ui-top-nav-bar [aria-disabled="true"]`,element => [ element.localName, element.textContent.trim() ]);
        t.equal(blog,[ 'span', 'Blog' ],'shown as unavailable, not as a link');
        await t.page.click(`${NAV} .ui-top-nav-bar [aria-disabled="true"]`);
        t.equal(await reported(t),[],'cannot be opened');
    },
    'T-12':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.page.click(`${NAV} .ui-top-nav-toggle[aria-label="Support pages"]`);
        const docs = await t.page.$eval(`${NAV} a[data-item="docs"]`,link => ( { target:link.getAttribute('target'), rel:link.getAttribute('rel'), icon:Boolean(link.querySelector('.ui-top-nav-external')), spoken:link.querySelector('.ui-top-nav-visually-hidden')?.textContent.trim() } ));
        t.equal([ docs.target, docs.rel, docs.icon ],[ '_blank', 'noopener', true ],'a new tab, with a visible hint');
        t.assert(/new tab/i.test(docs.spoken ?? ''),`a spoken hint (${docs.spoken})`);
    },
    'T-13':async t =>
    {
        await t.page.setViewportSize({ width:700, height:800 });
        const menu = `${NAV} .ui-top-nav-menu-host button`;
        await t.render({ ...BASE, tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(menu,'title'),'Menu','TITLE');
        await t.call('destroy');
        await t.render(BASE,DEPENDS);
        t.equal(await t.page.getAttribute(menu,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ ...BASE, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(menu);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Menu')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-14':async t =>
    {
        t.equal(await t.render({ id:ID, items:[] },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[ITEMS_REQUIRED]')),'console error');
        await t.render(BASE,DEPENDS);
        await t.call('setItems',[]);
        t.assert(await t.page.$(`${NAV} a[data-item="home"]`),'setItems([]) keeps the previous items');
    },
    'T-15':async t =>
    {
        t.assert(await t.render({ id:ID, items:[ { id:'home', label:'Home', href:'#home' }, { label:'No id' }, { id:'home', label:'Home again', href:'#h2' }, { id:'deep', label:'Deep', children:[ { id:'one', label:'One', href:'#one', children:[ { id:'two', label:'Two', href:'#two' } ] } ] } ] },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ITEM') ).length, ( await warnings(t,'DUPLICATE_ITEM_ID') ).length, ( await warnings(t,'DEPTH_LIMIT') ).length ],[ 1, 1, 1 ],'one warning each');
        await t.call('setCurrent','nope');
        await t.call('setBadge','nope','1');
        t.equal(( await warnings(t,'UNKNOWN_ITEM') ).length,2,'unknown item, twice');
    }
};
