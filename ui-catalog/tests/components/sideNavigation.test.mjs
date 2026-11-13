// sideNavigation.test.mjs
//
// The "auto" cases of source/components-js/sideNavigation/sideNavigationTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Cases that need an element option (drawerToggleHost) render through mount(), which
// evaluates the configuration in the page with record(name) in scope; the instance is still harness.instance.

const ID = 'side';
const NAV = `#${ID}`;
const DEPENDS = { stylesheets:[ 'button', 'message', 'tooltip' ] };
const ITEMS = [
    { id:'dashboard', label:'Dashboard', href:'#dashboard', icon:'fa-solid fa-gauge' },
    { id:'sales', label:'Sales', icon:'fa-solid fa-chart-line', children:[ { id:'orders', label:'Orders', href:'#orders' }, { id:'invoices', label:'Invoices', href:'#invoices', badge:3 } ] },
    { id:'customers', label:'Customers', href:'#customers', icon:'fa-solid fa-users', children:[ { id:'companies', label:'Companies', href:'#companies' }, { id:'contacts', label:'Contacts', href:'#contacts' } ] },
    { type:'SEPARATOR' },
    { type:'GROUP', label:'Administration', children:[ { id:'users', label:'Users', href:'#users', icon:'fa-solid fa-user-gear' }, { id:'audit', label:'Audit log', href:'#audit', icon:'fa-solid fa-list', disabled:true }, { id:'help', label:'Help centre', href:'https://example.com/help', icon:'fa-solid fa-circle-question', external:true } ] }
];
const BASE = { id:ID, items:ITEMS };
const row = id => `${NAV} [data-item-row="${id}"]`;
const toggle = id => `${row(id)} > .ui-side-nav-row [data-toggle="${id}"]`;
const open = id => t => t.page.$eval(`${row(id)} .ui-side-nav-children`,element => element.classList.contains('ui-side-nav-children-open'));
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

async function mount( t, source )
{
    return t.page.evaluate(async ( [ code, id ] ) =>
    {
        [ 'sideNavigation', 'button', 'message', 'tooltip' ].forEach(sheet => { const href = `/source/components-js/${sheet}/${sheet}.css`; if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); } });
        if ( !document.querySelector('#page-header') ) { document.body.prepend(Object.assign(document.createElement('header'),{ id:'page-header', innerHTML:'<span id="menu-host"></span> Header' })); }
        const { renderSideNavigation } = await import('/source/components-js/sideNavigation/sideNavigationIndex.js');
        const record = name => ( ...args ) => { window.harness.calls.push({ name, args:args.map(arg => ( arg && typeof arg.destroy === 'function' ? `instance(${id})` : arg instanceof Event ? `Event(${arg.type})` : arg )) }); };
        window.harness.instance = renderSideNavigation(document.querySelector('#host'),{ id, ...new Function('record',`return (${code});`)(record) });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return window.harness.instance ? id : null;
    },[ source, ID ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,DEPENDS);
        const tree = await t.page.$eval(NAV,element => ( { group:element.querySelector('.ui-side-nav-group-label')?.textContent.trim(), separator:Boolean(element.querySelector('[role="separator"]')), top:[ ...element.querySelectorAll('.ui-side-nav-root > .ui-side-nav-item > .ui-side-nav-row .ui-side-nav-label') ].map(label => label.textContent.trim()) } ));
        t.equal(tree,{ group:'Administration', separator:true, top:[ 'Dashboard', 'Sales', 'Customers' ] },'pages as a tree with a heading and a separator');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, currentId:'invoices' },DEPENDS);
        t.equal(await t.page.getAttribute(`${NAV} a[data-item="invoices"]`,'aria-current'),'page','the current page marked');
        t.assert(await t.page.$eval(`${row('invoices')} > .ui-side-nav-row`,element => element.classList.contains('ui-side-nav-current') && getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)'),'and highlighted');
        t.equal(await open('sales')(t),true,'its parent opened');
    },
    'T-03':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate:preventDefault' ] });
        await t.page.click(`${NAV} a[data-item="dashboard"]`);
        const call = ( await t.calls('onNavigate') )[0];
        t.equal([ call.args[0], call.args[1], call.args[2] ],[ { id:'dashboard', label:'Dashboard', href:'#dashboard', external:false }, 'Event(click)', `instance(${ID})` ],'the page reported');
        t.assert(!t.page.url().endsWith('#dashboard'),'the App opens the page');
    },
    'T-04':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onExpandChange' ] });
        await t.page.click(toggle('customers'));
        await t.page.click(toggle('sales'));
        t.equal([ await open('customers')(t), await open('sales')(t) ],[ true, true ],'parents open independently');
        t.equal(( await t.calls('onExpandChange') ).map(call => call.args[0]),[ [ 'customers' ], [ 'customers', 'sales' ] ],'the open parents reported');
        t.equal(await t.call('getExpandedIds'),[ 'customers', 'sales' ],'getExpandedIds()');
        await t.page.click(toggle('customers'));
        t.equal([ await open('customers')(t), await open('sales')(t) ],[ false, true ],'one closes, the other stays');
    },
    'T-05':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate' ] });
        const sales = await t.page.$eval(`${row('sales')} > .ui-side-nav-row > .ui-side-nav-parent`,element => [ element.localName, element.getAttribute('aria-expanded') ]);
        t.equal(sales,[ 'button', 'false' ],'a parent that is not a page is a button');
        await t.page.click(`${row('sales')} > .ui-side-nav-row > .ui-side-nav-parent`);
        t.equal([ await open('sales')(t), ( await t.calls('onNavigate') ).length ],[ true, 0 ],'clicking it opens its sub-pages without navigating');
        await t.page.click(`${row('sales')} > .ui-side-nav-row > .ui-side-nav-parent`);
        t.equal(await open('sales')(t),false,'and closes them');
    },
    'T-06':async t =>
    {
        const look = async extra => { await t.render({ ...BASE, currentId:'orders', ...extra },DEPENDS); const result = await t.page.$eval(row('orders'),element => { const row = element.querySelector('.ui-side-nav-row'); return { classes:element.closest('nav').className, indent:Math.round(element.querySelector('.ui-side-nav-label').getBoundingClientRect().left), background:getComputedStyle(element.closest('.ui-side-nav-children')).backgroundColor, lines:getComputedStyle(row,'::before').content !== 'none' || getComputedStyle(element,'::before').content !== 'none' }; }); await t.call('destroy'); return result; };
        const indentation = await look({}), tree = await look({ levelStyle:'TREE' }), background = await look({ levelStyle:'BACKGROUND' });
        t.assert(indentation.classes.includes('ui-side-nav-level-indentation') && tree.classes.includes('ui-side-nav-level-tree') && background.classes.includes('ui-side-nav-level-background'),'three level styles');
        t.assert(tree.lines,'tree lines join the sub-page to its parent');
        t.assert(background.background !== indentation.background,'a background for deeper levels');
    },
    'T-07':async t =>
    {
        await t.render(BASE,DEPENDS);
        const chevron = await t.page.$eval(`${row('sales')} > .ui-side-nav-row`,element => ( { chevron:Boolean(element.querySelector('.ui-side-nav-chevron')), atEnd:element.querySelector('.ui-side-nav-chevron').getBoundingClientRect().left > element.querySelector('.ui-side-nav-label').getBoundingClientRect().right } ));
        t.equal(chevron,{ chevron:true, atEnd:true },'an arrow at the end of the row by default');
        await t.call('destroy');
        await t.render({ ...BASE, expandIndicator:'PLUS_MINUS' },DEPENDS);
        const sign = await t.page.$eval(`${row('sales')} > .ui-side-nav-row`,element => { const sign = element.querySelector('.ui-side-nav-sign'); return { sign:Boolean(sign), before:sign.getBoundingClientRect().right <= element.querySelector('.ui-side-nav-icon').getBoundingClientRect().left + 1 }; });
        t.equal(sign,{ sign:true, before:true },'a + / − sign before the icon');
    },
    'T-08':async t =>
    {
        const radius = async cornerRadius => { await t.render({ ...BASE, currentId:'dashboard', ...( cornerRadius ? { cornerRadius } : {} ) },DEPENDS); const value = await t.page.$eval(`${row('dashboard')} .ui-side-nav-link`,element => parseFloat(getComputedStyle(element.closest('.ui-side-nav-row')).borderTopLeftRadius) || parseFloat(getComputedStyle(element).borderTopLeftRadius)); await t.call('destroy'); return value; };
        const none = await radius('NONE'), small = await radius('SMALL'), medium = await radius(null), large = await radius('LARGE');
        t.assert(none === 0 && small > 0 && medium > small && large > medium,`corners none < small < medium (default) < large (${[ none, small, medium, large ].join(', ')})`);
    },
    'T-09':async t =>
    {
        await t.render({ ...BASE, currentId:'invoices' },DEPENDS);
        const entry = await t.page.$eval(`${NAV} a[data-item="invoices"]`,element => element.querySelector('.ui-side-nav-badge')?.textContent);
        t.equal(entry,'3','a counter');
        t.assert(await t.page.$(`${row('dashboard')} .ui-side-nav-icon .fa-gauge`),'an icon');
        await t.call('setBadge','invoices',7);
        t.equal(await t.page.$eval(`${NAV} a[data-item="invoices"] .ui-side-nav-badge`,element => element.textContent),'7','setBadge()');
    },
    'T-10':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onNavigate' ] });
        t.equal(await t.page.$eval(`${row('audit')} [aria-disabled="true"]`,element => [ element.localName, element.textContent.trim() ]),[ 'span', 'Audit log' ],'unavailable, not a link');
        await t.page.click(`${row('audit')} [aria-disabled="true"]`);
        t.equal(( await t.calls('onNavigate') ).length,0,'cannot be opened');
        const help = await t.page.$eval(`${NAV} a[data-item="help"]`,link => ( { target:link.getAttribute('target'), icon:Boolean(link.querySelector('.ui-side-nav-external')), spoken:link.querySelector('.ui-side-nav-visually-hidden')?.textContent.trim() } ));
        t.equal([ help.target, help.icon ],[ '_blank', true ],'an external link with a visible hint');
        t.assert(/new tab/i.test(help.spoken ?? ''),`and a spoken hint (${help.spoken})`);
    },
    'T-11':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onRailChange', 'onNavigate:preventDefault' ] });
        const width = () => t.page.$eval(NAV,element => element.getBoundingClientRect().width);
        const wide = await width();
        await t.page.click(`#${ID}-rail`);
        t.equal([ await t.call('isRail'), ( await t.calls('onRailChange') ).map(call => call.args) ],[ true, [ [ true, `instance(${ID})` ] ] ],'rail on, reported');
        const rail = await t.page.$eval(NAV,element => ( { width:element.getBoundingClientRect().width, labels:[ ...element.querySelectorAll('.ui-side-nav-root > .ui-side-nav-item .ui-side-nav-label') ].filter(label => label.getClientRects().length && label.getBoundingClientRect().width > 2).length } ));
        t.assert(rail.width < wide / 2 && rail.labels === 0,`only the icons (${JSON.stringify(rail)})`);
        t.equal(await t.page.getAttribute(`${row('dashboard')} > .ui-side-nav-row`,'title'),'Dashboard','the page name as a tooltip');
        await t.page.click(`${row('sales')} > .ui-side-nav-row [data-toggle="sales"]`);
        const flyout = await t.page.$eval(`#${ID}-flyout`,element => ( { open:element.matches(':popover-open') || element.classList.contains('ui-side-nav-flyout-open'), title:element.querySelector('.ui-side-nav-flyout-title')?.textContent, links:[ ...element.querySelectorAll('a') ].map(link => link.textContent.trim()), beside:element.getBoundingClientRect().left >= document.getElementById('side').getBoundingClientRect().right - 1 } ));
        t.equal(flyout,{ open:true, title:'Sales', links:[ 'Orders', 'Invoices3' ], beside:true },'a small panel with its sub-pages next to the icon');
        await t.call('setRail',false);
        t.equal(( await t.calls('onRailChange') ).length,1,'setRail() is not reported');
    },
    'T-12':async t =>
    {
        await t.render({ ...BASE, items:[ ...ITEMS.slice(0,2), { id:'plain', label:'No icon', href:'#plain' } ] },DEPENDS);
        t.equal(await t.page.$(`#${ID}-rail`),null,'no rail button when a top-level entry has no icon');
        t.equal(( await warnings(t,'RAIL_NEEDS_ICONS') ).length,1,'warning');
    },
    'T-13':async t =>
    {
        await t.page.setViewportSize({ width:700, height:800 });
        await mount(t,`{ items:${JSON.stringify(ITEMS)}, drawerToggleHost:document.querySelector('#menu-host'), onNavigate:( item, event ) => { event.preventDefault(); record('onNavigate')(item); } }`);
        const menu = '#menu-host button';
        t.equal([ await t.page.isVisible(menu), await t.page.$eval(NAV,element => element.getBoundingClientRect().right <= 0 || getComputedStyle(element).visibility === 'hidden' || !element.getClientRects().length) ],[ true, true ],'the menu is hidden, a menu button in the page header');
        await t.page.click(menu);
        const drawer = await t.page.evaluate(id => { const nav = document.getElementById(id); const rect = nav.getBoundingClientRect(); const header = document.querySelector('#page-header').getBoundingClientRect(); const hit = document.elementFromPoint(header.left + 5,header.top + 5); return { open:nav.classList.contains('ui-side-nav-drawer-open'), fromSide:rect.left <= 1, above:nav.contains(hit) || hit?.classList.contains('ui-side-nav-overlay'), focus:nav.contains(document.activeElement) }; },ID);
        t.equal(drawer,{ open:true, fromSide:true, above:true, focus:true },'a drawer from the side, above the header, with the focus inside');
        for ( let step = 0; step < 25; step += 1 ) { await t.page.keyboard.press('Tab'); }
        t.equal(await t.page.evaluate(id => document.getElementById(id).contains(document.activeElement),ID),true,'Tab keeps the focus inside');
        await t.page.keyboard.press('Escape');
        t.equal(await t.page.$eval(NAV,element => element.classList.contains('ui-side-nav-drawer-open')),false,'Escape closes it');
        await t.page.click(menu);
        await t.page.click('.ui-side-nav-overlay',{ position:{ x:650, y:400 } });
        t.equal(await t.page.$eval(NAV,element => element.classList.contains('ui-side-nav-drawer-open')),false,'a click outside closes it');
        await t.page.click(menu);
        await t.page.click(`#${ID}-close`);
        t.equal(await t.page.$eval(NAV,element => element.classList.contains('ui-side-nav-drawer-open')),false,'the close button closes it');
        await t.page.click(menu);
        await t.page.click(`${NAV} a[data-item="dashboard"]`);
        t.equal(await t.page.$eval(NAV,element => element.classList.contains('ui-side-nav-drawer-open')),false,'choosing a page closes it');
    },
    'T-14':async t =>
    {
        await t.render({ ...BASE, search:true, searchThreshold:5 },DEPENDS);
        const field = `#${ID}-search`;
        t.assert(await t.page.isVisible(field),'a search field with more entries than the threshold');
        await t.page.fill(field,'invo');
        const shown = await t.page.$$eval(`${NAV} .ui-side-nav-item`,items => items.filter(item => item.getClientRects().length > 0).map(item => item.querySelector('.ui-side-nav-label').textContent.trim()));
        t.equal(shown,[ 'Sales', 'Invoices' ],'only the matches and their parents');
        await t.page.fill(field,'xyz');
        await t.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const empty = await t.page.$eval(`${NAV} .ui-side-nav-no-results`,element => ( { text:element.textContent.trim(), live:element.querySelector('[role="status"], [aria-live]') !== null || element.closest('[aria-live]') !== null } ));
        t.equal(empty,{ text:'No matching pages', live:true },'"No matching pages", announced');
        await t.call('destroy');
        await t.render({ ...BASE, search:true },DEPENDS);
        t.equal(await t.page.$(field),null,'no search field below the default threshold (15)');
    },
    'T-15':async t =>
    {
        await t.page.setViewportSize({ width:1280, height:400 });
        await t.page.evaluate(() => { const host = document.querySelector('#host'); host.style.cssText = 'block-size:260px;display:flex;'; });
        await t.render({ ...BASE, expandedIds:[ 'sales', 'customers' ] },DEPENDS);
        const scroll = await t.page.$eval(`${NAV} .ui-side-nav-scroll`,element => ( { scrolls:element.scrollHeight > element.clientHeight, overflow:getComputedStyle(element).overflowY } ));
        t.equal([ scroll.scrolls, [ 'auto', 'scroll' ].includes(scroll.overflow) ],[ true, true ],'only the menu scrolls');
        t.assert(await t.page.$eval(NAV,element => element.getBoundingClientRect().height <= 261),'the menu stays within the available height');
    },
    'T-16':async t =>
    {
        await t.render({ ...BASE, railCollapsed:true, expandedIds:[ 'customers' ] },DEPENDS);
        t.equal(await t.call('isRail'),true,'the stored rail state is used');
        await t.call('setRail',false);
        t.equal(await open('customers')(t),true,'the stored open parents are used');
    },
    'T-17':async t =>
    {
        const link = `${row('dashboard')} > .ui-side-nav-row`;
        await t.render({ ...BASE, railCollapsed:true, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(link,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ ...BASE, railCollapsed:true, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(link);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Dashboard')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-18':async t =>
    {
        t.equal(await t.render({ id:ID, items:[] },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[ITEMS_REQUIRED]')),'console error');
        t.assert(await t.render({ id:ID, items:[ ...ITEMS.slice(0,1), { label:'No id', href:'#x' }, { id:'dashboard', label:'Again', href:'#again', icon:'fa-solid fa-gauge' } ] },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ITEM') ).length, ( await warnings(t,'DUPLICATE_ITEM_ID') ).length ],[ 1, 1 ],'one warning each');
        await t.call('setCurrent','nope');
        await t.call('setBadge','nope',1);
        t.equal(( await warnings(t,'UNKNOWN_ITEM') ).length,2,'unknown item, twice');
        await t.call('setItems',[]);
        t.assert(await t.page.$(`${NAV} a[data-item="dashboard"]`),'setItems([]) keeps the previous tree');
    }
};
