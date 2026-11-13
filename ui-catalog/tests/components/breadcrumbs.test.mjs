// breadcrumbs.test.mjs
//
// The "auto" cases of source/components-js/breadcrumbs/breadcrumbsTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onNavigate is the third render argument; 'onNavigate:preventDefault' (in callbacks) also
// stops the link, as a single-page application does.

const ID = 'trail';
const NAV = `#${ID}`;
const DEPENDS = { stylesheets:[ 'button', 'actionMenu', 'tooltip' ] };
const PATH = [ { label:'Home', href:'#home' }, { label:'Customers', href:'#customers' }, { label:'Acme GmbH', href:'#acme' }, { label:'Orders', href:'#orders' }, { label:'Order 1042' } ];
const LONG = [ { label:'Home', href:'#home' }, { label:'Sales', href:'#sales' }, { label:'Europe', href:'#europe' }, { label:'Customers', href:'#customers' }, { label:'Acme GmbH', href:'#acme' }, { label:'Orders', href:'#orders' }, { label:'Order 1042' } ];
const visibleText = t => t.page.$$eval(`${NAV} .ui-breadcrumbs-list > li`,items => items.map(item => ( item.classList.contains('ui-breadcrumbs-more') ? '…' : item.querySelector('.ui-breadcrumbs-label, .ui-breadcrumbs-visually-hidden')?.textContent.trim() )));
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, items:PATH },DEPENDS);
        const levels = await t.page.$$eval(`${NAV} .ui-breadcrumbs-list > li`,items => items.map(item => { const link = item.querySelector('a'), current = item.querySelector('[aria-current="page"]'); return { text:item.textContent.trim(), link:link?.getAttribute('href') ?? null, current:Boolean(current), bold:current ? Number(getComputedStyle(current).fontWeight) >= 600 : false }; }));
        t.equal(levels.map(level => [ level.text, level.link, level.current ]),[ [ 'Home', '#home', false ], [ 'Customers', '#customers', false ], [ 'Acme GmbH', '#acme', false ], [ 'Orders', '#orders', false ], [ 'Order 1042', null, true ] ],'levels as links, the current page as text');
        t.assert(levels.at(-1).bold,'the current page in bold');
        t.equal(await t.page.$eval(NAV,element => [ element.localName, element.getAttribute('aria-label') ]),[ 'nav', 'Breadcrumb' ],'a navigation landmark');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, items:PATH, homeIcon:true },DEPENDS);
        t.equal(await t.page.$eval(`${NAV} li:first-child a`,element => [ Boolean(element.querySelector('.fa-house')), element.textContent.trim() ]),[ true, 'Home' ],'a house icon; the label stays for screen readers');
    },
    'T-03':async t =>
    {
        const separator = async value => { await t.render({ id:ID, items:PATH, ...( value ? { separator:value } : {} ) },DEPENDS); const content = await t.page.$eval(`${NAV} li:nth-child(2)`,element => getComputedStyle(element,'::before').content); await t.call('destroy'); return content; };
        const chevron = await separator(null);
        t.assert(chevron !== 'none','a chevron by default');
        t.equal([ await separator('SLASH'), await separator('ARROW'), await separator('DOT') ].map(item => item.replace(/\s*\/\s*""$/,'')),[ '"/"', '"›"', '"·"' ],'"/", "›", "·"');
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, items:PATH },DEPENDS);
        await t.page.click(`${NAV} a[href="#customers"]`);
        t.assert(t.page.url().endsWith('#customers'),'the page opens');
        await t.call('destroy');
        await t.render({ id:ID, items:PATH },{ ...DEPENDS, args:[ { $callback:'onNavigate' } ] });
        await t.page.click(`${NAV} a[href="#acme"]`);
        const call = ( await t.calls('onNavigate') )[0];
        t.equal([ call.args[0], call.args[1], call.args[2] ],[ { label:'Acme GmbH', href:'#acme', index:2 }, 'Event(click)', `instance(${ID})` ],'reported to the App');
        await t.call('destroy');
        await t.page.evaluate(() => { location.hash = ''; });
        await t.render({ id:ID, items:PATH, onNavigate:{ $callback:'unused' } },{ ...DEPENDS, callbacks:[ 'onNavigate:preventDefault' ] });
        await t.page.click(`${NAV} a[href="#orders"]`);
        t.assert(!t.page.url().endsWith('#orders'),'the App takes over navigation');
        await t.page.click(`${NAV} [aria-current="page"]`);
        t.equal(( await t.calls('onNavigate') ).length,2,'the current page reports nothing');
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, items:LONG },{ ...DEPENDS, args:[ { $callback:'onNavigate' } ] });
        t.equal(await visibleText(t),[ 'Home', '…', 'Acme GmbH', 'Orders', 'Order 1042' ],'first level, "…", last levels');
        await t.page.click(`${NAV} .ui-breadcrumbs-more button`);
        const hidden = await t.page.$$eval('[role="menuitem"]',items => items.filter(item => item.offsetParent !== null).map(item => item.textContent.trim()));
        t.equal(hidden,[ 'Sales', 'Europe', 'Customers' ],'a menu with the hidden levels');
        await t.call('destroy');
        await t.render({ id:ID, items:LONG, maxItems:0 },DEPENDS);
        t.equal(( await visibleText(t) ).length,7,'maxItems:0 never shortens');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, items:[ { label:'Home', href:'#home' }, { label:'International Business Machines Corporation Europe Holdings', href:'#ibm' }, { label:'Now' } ] },DEPENDS);
        const label = await t.page.$eval(`${NAV} a[href="#ibm"]`,element => { const text = element.querySelector('.ui-breadcrumbs-label'); return { cut:text.scrollWidth > text.clientWidth, ellipsis:getComputedStyle(text).textOverflow, title:element.getAttribute('title') }; });
        t.equal(label,{ cut:true, ellipsis:'ellipsis', title:'International Business Machines Corporation Europe Holdings' },'shortened with "…", the full name as the tooltip');
    },
    'T-07':async t =>
    {
        const siblings = [ { label:'Acme GmbH', href:'#acme' }, { label:'Beta SA', href:'#beta' }, { label:'Gamma Ltd', href:'#gamma' } ];
        await t.render({ id:ID, items:PATH.map(item => ( item.label === 'Acme GmbH' ? { ...item, siblings, siblingsLabel:'Other customers' } : item )) },{ ...DEPENDS, args:[ { $callback:'onNavigate' } ] });
        const arrow = `${NAV} .ui-breadcrumbs-siblings-host button`;
        t.equal(await t.page.getAttribute(arrow,'aria-label'),'Other customers','a small arrow button next to the level');
        await t.page.click(arrow);
        const list = await t.page.evaluate(id => { const list = document.querySelector(`#${id} .ui-breadcrumbs-siblings`); const level = list.parentElement.getBoundingClientRect(), rect = list.getBoundingClientRect(); return { open:!list.hidden, below:rect.top >= level.bottom - 2, items:[ ...list.querySelectorAll('a') ].map(link => [ link.textContent.trim(), link.getAttribute('aria-current') ]) }; },ID);
        t.equal(list,{ open:true, below:true, items:[ [ 'Acme GmbH', 'true' ], [ 'Beta SA', null ], [ 'Gamma Ltd', null ] ] },'the list below the level, its own page highlighted');
        await t.page.click(`${NAV} .ui-breadcrumbs-siblings a[href="#beta"]`);
        t.equal(( await t.calls('onNavigate') ).at(-1).args[0],{ label:'Beta SA', href:'#beta', index:null, sibling:true },'a sibling reported');
        t.equal(await t.page.$eval(`${NAV} .ui-breadcrumbs-siblings`,element => element.hidden),true,'the list closes');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#before').style.marginBlockStart = `${window.innerHeight - 120}px`; });
        await t.render({ id:ID, items:PATH.map(item => ( item.label === 'Acme GmbH' ? { ...item, siblings } : item )) },DEPENDS);
        await t.page.evaluate(id => document.getElementById(id).scrollIntoView({ block:'end' }),ID);
        await t.page.click(arrow);
        t.assert(await t.page.evaluate(id => { const list = document.querySelector(`#${id} .ui-breadcrumbs-siblings`); return list.getBoundingClientRect().bottom <= list.parentElement.getBoundingClientRect().top + 2; },ID),'above the level near the edge of the window');
    },
    'T-08':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '25rem'; });
        await t.render({ id:ID, items:PATH },DEPENDS);
        const narrow = await t.page.$eval(NAV,element => ( { list:getComputedStyle(element.querySelector('.ui-breadcrumbs-list')).display, back:element.querySelector('.ui-breadcrumbs-back')?.textContent.trim(), href:element.querySelector('.ui-breadcrumbs-back')?.getAttribute('href'), visible:element.querySelector('.ui-breadcrumbs-back')?.offsetParent !== null } ));
        t.equal(narrow,{ list:'none', back:'Back to Orders', href:'#orders', visible:true },'"Back to Orders" instead of the path below 30rem');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, items:PATH, structuredData:true },DEPENDS);
        const data = JSON.parse(await t.page.$eval(`${NAV} ~ script.ui-breadcrumbs-structured-data, script.ui-breadcrumbs-structured-data`,element => element.textContent));
        t.equal([ data['@type'], data.itemListElement.length, data.itemListElement[0].position, data.itemListElement[1].name ],[ 'BreadcrumbList', 5, 1, 'Customers' ],'the path as structured data');
    },
    'T-10':async t =>
    {
        const link = `${NAV} a[href="#customers"]`;
        await t.render({ id:ID, items:PATH, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(link,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ id:ID, items:[ { label:'Home', href:'#home' }, { label:'International Business Machines Corporation Europe Holdings', href:'#ibm' }, { label:'Now' } ], tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(`${NAV} a[href="#ibm"]`);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('International Business')),`TOOLTIP shows the full label (${JSON.stringify(shown)})`);
    },
    'T-11':async t =>
    {
        t.equal(await t.render({ id:ID, items:[] },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[ITEMS_REQUIRED]')),'console error');
        await t.render({ id:ID, items:PATH },DEPENDS);
        await t.call('update',[]);
        t.equal(( await t.call('getItems') ).length,5,'update([]) keeps the previous path');
        await t.call('update',[ { label:'Home', href:'#home' }, { label:'Settings' } ]);
        t.equal(await visibleText(t),[ 'Home', 'Settings' ],'update() replaces the path');
    },
    'T-12':async t =>
    {
        t.assert(await t.render({ id:ID, items:[ { label:'Home', href:'#home' }, { href:'#x' }, { label:'Customers' }, { label:'Now', siblings:[ { label:'Then' }, { label:'Later', href:'#later' } ] } ] },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ITEM') ).length, ( await warnings(t,'LINK_MISSING') ).length, ( await warnings(t,'INVALID_SIBLING') ).length ],[ 1, 1, 1 ],'one warning each');
        t.equal(await t.page.$eval(`${NAV} li:nth-child(2)`,element => [ element.querySelector('a'), element.querySelector('.ui-breadcrumbs-text')?.textContent.trim() ]),[ null, 'Customers' ],'a level without link shown as text');
    }
};
