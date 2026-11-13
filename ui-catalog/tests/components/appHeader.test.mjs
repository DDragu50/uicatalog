// appHeader.test.mjs
//
// The "auto" cases of source/components-js/appHeader/appHeaderTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Callbacks of composed components (search.onSearch, navigation.onNavigate) are passed as
// { $callback } values inside the configuration.

const ID = 'header';
const ROOT = `#${ID}`;
const DEPENDS = { stylesheets:[ 'button', 'badge', 'notification', 'notificationsPanel', 'searchBox', 'topNavigation', 'breadcrumbs', 'message', 'actionMenu', 'tooltip' ] };
const LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%2300f"/%3E%3C/svg%3E';
const FULL = {
    id:ID, appName:'Orders', homeHref:'#home', logo:{ src:LOGO, alt:'Acme' }, environment:{ label:'TEST', description:'Test environment' },
    help:{ href:'#help' }, settings:{ href:'#settings' }, user:{ name:'Ana Popescu', role:'Sales manager', href:'#me', indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } },
    auth:{ signedIn:true }, notifications:{ count:4 }, skipLinkTarget:'#main'
};
const NAVIGATION = { items:[ { id:'home', label:'Home', href:'#home' }, { id:'orders', label:'Orders', href:'#orders' } ] };
const BREADCRUMBS = { items:[ { label:'Home', href:'#home' }, { label:'Orders' } ] };
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const levels = t => t.page.$$eval(`${ROOT} .ui-app-header-level`,items => items.filter(item => !item.hidden).map(item => item.dataset.level));

export const cases =
{
    'T-01':async t =>
    {
        await t.render(FULL,DEPENDS);
        const brand = await t.page.$eval(`${ROOT} .ui-app-header-brand`,element => ( { href:element.getAttribute('href'), logo:Boolean(element.querySelector('img.ui-app-header-logo')), name:element.querySelector('.ui-app-header-name')?.textContent } ));
        t.equal(brand,{ href:'#home', logo:true, name:'Orders' },'logo and name, linked to the home page');
        const environment = await t.page.$eval(`${ROOT} .ui-app-header-environment`,element => [ element.textContent.trim(), element.getAttribute('title') ]);
        t.equal(environment[0].startsWith('TEST'),true,'an environment label');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, appName:'Orders', search:{ label:'Search orders', showSearchButton:true, onSearch:{ $callback:'onSearch' } } },DEPENDS);
        t.assert(await t.page.isVisible(`#${ID}-search-input`),'a search field');
        await t.page.fill(`#${ID}-search-input`,'1042');
        await t.page.keyboard.press('Enter');
        const call = ( await t.calls('onSearch') )[0];
        t.equal([ call.args[0].query, call.args[1] ],[ '1042', `instance(${ID}-search)` ],'the search reported');
        await t.page.fill(`#${ID}-search-input`,'1043');
        await t.page.click(`${ROOT} .ui-search-box-button-host button`);
        t.equal(( await t.calls('onSearch') ).at(-1).args[0].query,'1043','also with the search button');
    },
    'T-03':async t =>
    {
        await t.render({ ...FULL, notifications:{ count:4 } },{ ...DEPENDS, callbacks:[ 'onNotifications' ] });
        const bell = await t.page.$eval(`${ROOT} .ui-app-header-notifications-host`,element => element.textContent.replace(/\s+/g,' ').trim());
        t.assert(/4/.test(bell),`a bell with a counter (${bell})`);
        await t.page.click(`${ROOT} .ui-app-header-notifications-host button, ${ROOT} .ui-app-header-notifications-host [role="button"]`);
        t.equal(( await t.calls('onNotifications') ).map(call => call.args),[ [ `instance(${ID})` ] ],'the click reported');
        await t.call('setNotificationCount',120);
        t.assert(( await t.page.$eval(`${ROOT} .ui-app-header-notifications-host`,element => element.textContent) ).includes('99+'),'above 99: "99+"');
        await t.call('destroy');
        await t.render({ ...FULL, notifications:{ items:[ { id:'n1', text:'Order 1042 shipped', unread:true }, { id:'n2', text:'Invoice paid' } ] } },DEPENDS);
        await t.page.click(`${ROOT} .ui-app-header-notifications-host button, ${ROOT} .ui-app-header-notifications-host [role="button"]`);
        await t.wait(200);
        const panel = await t.page.evaluate(() => [ ...document.querySelectorAll('.ui-notifications-panel-item, .ui-notifications-panel li') ].filter(item => item.getClientRects().length).map(item => item.textContent.trim()));
        t.assert(panel.some(text => text.includes('Order 1042 shipped')),`the panel with the latest notifications (${JSON.stringify(panel)})`);
    },
    'T-04':async t =>
    {
        await t.render(FULL,DEPENDS);
        const links = await t.page.$$eval(`${ROOT} .ui-app-header-icon-link`,items => items.map(item => [ item.getAttribute('href'), item.getAttribute('aria-label') ]));
        t.equal(links,[ [ '#help', 'Help' ], [ '#settings', 'Application settings' ] ],'help and settings shortcuts');
    },
    'T-05':async t =>
    {
        await t.render(FULL,DEPENDS);
        const user = await t.page.$eval(`${ROOT} .ui-app-header-user-host`,element => ( { text:element.textContent.replace(/\s+/g,' ').trim(), link:element.querySelector('a')?.getAttribute('href'), initials:element.querySelector('.ui-notification-text')?.textContent.trim() === 'AP' } ));
        t.assert(user.text.includes('Ana Popescu') && user.text.includes('Sales manager') && user.text.includes('Online'),`name, role and marker (${user.text})`);
        t.equal([ user.link, user.initials ],[ '#me', true ],'initials, linked to the user\'s page');
        await t.call('setUser',{ name:'Bo Lind', avatar:LOGO });
        t.assert(await t.page.$(`${ROOT} .ui-app-header-user-host img`),'a photo when given');
        await t.call('setUser',null);
        t.equal(await t.page.$eval(`${ROOT} .ui-app-header-user-host`,element => element.textContent.trim()),'','removed');
    },
    'T-06':async t =>
    {
        await t.render({ ...FULL, auth:{ signedIn:false } },{ ...DEPENDS, callbacks:[ 'onSignIn', 'onSignOut' ] });
        const auth = `#${ID}-auth`;
        t.equal(await t.page.$eval(auth,element => element.textContent.trim()),'Sign in','"Sign in"');
        await t.page.click(auth);
        await t.call('setSignedIn',true);
        t.equal(await t.page.$eval(auth,element => element.textContent.trim()),'Sign out','"Sign out" after the App signs in');
        await t.page.click(auth);
        t.equal(( await t.calls() ).map(call => [ call.name, call.args[0] ]),[ [ 'onSignIn', `instance(${ID})` ], [ 'onSignOut', `instance(${ID})` ] ],'each request reported');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, appName:'Orders', menuHost:true },DEPENDS);
        const host = await t.call('getMenuHost');
        t.equal(host,'<span>','a place for the menu button');
        t.assert(await t.page.$eval(`${ROOT} .ui-app-header-start`,element => element.firstElementChild.classList.contains('ui-app-header-menu-host')),'at the start of the first level');
    },
    'T-08':async t =>
    {
        const background = async value => { await t.render({ ...FULL, ...( value ? { background:value } : {} ) },DEPENDS); const colour = await t.page.$eval(`${ROOT} .ui-app-header-top`,element => getComputedStyle(element).backgroundColor); await t.call('destroy'); return colour; };
        const light = await background(null), brand = await background('BRAND');
        const accent = await t.page.evaluate(() => { const probe = document.createElement('span'); probe.style.color = 'var(--c-accent)'; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; });
        t.assert(light !== brand && brand === accent,`light first level, or brand-coloured (${light} / ${brand})`);
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, appName:'Orders', navigation:{ ...NAVIGATION, onNavigate:{ $callback:'onNavigate' } }, breadcrumbs:BREADCRUMBS },DEPENDS);
        t.equal(await levels(t),[ 'top', 'navigation', 'breadcrumbs' ],'navigation on the second level, breadcrumbs on the third');
        t.assert(await t.page.$(`${ROOT} .ui-app-header-navigation .ui-top-nav`) && await t.page.$(`${ROOT} .ui-app-header-breadcrumbs .ui-breadcrumbs`),'the composed components');
        await t.page.evaluate(() => document.addEventListener('click',event => { if ( event.target.closest('a[data-item]') ) { event.preventDefault(); } },{ once:true }));
        await t.page.click(`${ROOT} a[data-item="orders"]`);
        t.equal(( await t.calls('onNavigate') ).map(call => call.args[0].id),[ 'orders' ],'callbacks passed through');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, appName:'Orders', announcement:{ type:'WARNING', text:'Planned maintenance tonight at 22:00' } },{ ...DEPENDS, callbacks:[ 'onSignIn' ] });
        const banner = await t.page.evaluate(id => { const level = document.querySelector(`#${id} .ui-app-header-announcement`); const top = document.querySelector(`#${id} .ui-app-header-top`); return { first:level.getBoundingClientRect().bottom <= top.getBoundingClientRect().top + 1, full:Math.abs(level.getBoundingClientRect().width - document.getElementById(id).getBoundingClientRect().width) < 2, text:level.querySelector('.ui-message-text')?.textContent.trim(), banner:Boolean(level.querySelector('.ui-message-banner')) }; },ID);
        t.equal(banner,{ first:true, full:true, text:'Planned maintenance tonight at 22:00', banner:true },'a full-width banner above everything');
        await t.call('showAnnouncement',{ type:'SUCCESS', text:'Saved.' });
        await t.wait(50);
        t.equal(await t.page.$eval(`${ROOT} .ui-app-header-announcement .ui-message-text`,element => element.textContent.trim()),'Saved.','showAnnouncement() replaces it');
    },
    'T-11':async t =>
    {
        await t.render({ id:ID, appName:'Orders', announcement:{ type:'INFO', text:'New release', onClose:{ $callback:'onClose' } } },DEPENDS);
        await t.page.click(`${ROOT} .ui-app-header-announcement button[aria-label="Close message"]`);
        t.equal(( await t.calls('onClose') ).map(call => call.args[0]),[ 'USER' ],'the close reported');
        t.equal(await levels(t),[ 'top' ],'its level removed');
    },
    'T-12':async t =>
    {
        await t.page.evaluate(() => { document.body.style.paddingBlockEnd = '300vh'; });
        await t.render({ id:ID, appName:'Orders', navigation:NAVIGATION, breadcrumbs:BREADCRUMBS, sticky:{ navigation:true } },DEPENDS);
        const before = await t.page.$eval('#after',element => element.getBoundingClientRect().top + window.scrollY);
        await t.page.evaluate(() => window.scrollTo(0,600));
        await t.wait(150);
        const pinned = await t.page.evaluate(id => { const root = document.getElementById(id); const nav = root.querySelector('.ui-app-header-navigation').getBoundingClientRect(); const top = root.querySelector('.ui-app-header-top').getBoundingClientRect(); return { pinned:root.classList.contains('ui-app-header-pinned'), navTop:Math.round(nav.top), topGone:top.bottom <= 1 || root.querySelector('.ui-app-header-top').getClientRects().length === 0 || getComputedStyle(root.querySelector('.ui-app-header-top')).display === 'none', offset:getComputedStyle(document.documentElement).getPropertyValue('--page-sticky-offset').trim(), navHeight:Math.round(nav.height) }; },ID);
        t.equal([ pinned.pinned, pinned.navTop, pinned.topGone ],[ true, 0, true ],'the navigation stays at the top, the others scroll away');
        t.equal(pinned.offset,`${pinned.navHeight}px`,'other sticky elements are placed below it');
        const after = await t.page.$eval('#after',element => element.getBoundingClientRect().top + window.scrollY);
        t.equal(Math.round(after),Math.round(before),'the page does not jump');
        await t.call('destroy');
        t.equal(await t.page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--page-sticky-offset').trim()),'0px','destroy() restores the offset');
    },
    'T-13':async t =>
    {
        await t.render(FULL,DEPENDS);
        await t.page.focus('body');
        await t.page.keyboard.press('Tab');
        const skip = await t.page.evaluate(() => [ document.activeElement?.textContent.trim(), document.activeElement?.getAttribute('href') ]);
        t.equal(skip,[ 'Skip to main content', '#main' ],'the first stop on the page');
    },
    'T-14':async t =>
    {
        await t.page.setViewportSize({ width:600, height:800 });
        await t.render({ ...FULL, search:{ label:'Search', onSearch:{ $callback:'onSearch' } } },DEPENDS);
        const narrow = await t.page.evaluate(id => { const root = document.getElementById(id); const name = root.querySelector('.ui-app-header-name'); const user = root.querySelector('.ui-app-header-user-host'); const search = root.querySelector('.ui-app-header-search-host').getBoundingClientRect(); const brand = root.querySelector('.ui-app-header-brand').getBoundingClientRect(); const visible = element => element && element.getClientRects().length > 0 && getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().width > 4; return { name:visible(name), userName:[ ...user.querySelectorAll('*') ].some(element => element.children.length === 0 && /Ana Popescu|Sales manager/.test(element.textContent) && visible(element)), forReaders:/Ana Popescu/.test(user.textContent), searchOwnLine:search.top >= brand.bottom - 1 }; },ID);
        t.equal(narrow,{ name:false, userName:false, forReaders:true, searchOwnLine:true },'the name next to the logo and the user\'s name and role hide; the search moves to its own line');
    },
    'T-15':async t =>
    {
        await t.render({ ...FULL, tooltipMode:'TITLE' },DEPENDS);
        t.equal([ await t.page.getAttribute(`${ROOT} .ui-app-header-help`,'title'), await t.page.getAttribute(`${ROOT} .ui-app-header-environment`,'title') ],[ 'Help', 'Test environment' ],'TITLE (the default)');
        await t.call('destroy');
        await t.render({ ...FULL, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(`${ROOT} .ui-app-header-help`,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ ...FULL, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(`${ROOT} .ui-app-header-settings`);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Application settings')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-16':async t =>
    {
        t.equal(await t.render({ id:ID },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[CONTENT_REQUIRED]')),'console error');
    },
    'T-17':async t =>
    {
        t.assert(await t.render({ id:ID, logo:{ src:LOGO }, menuHost:true, background:'BRAND', sticky:{ breadcrumbs:true } },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'LOGO_ALT_MISSING') ).length, ( await warnings(t,'BRAND_MENU_HOST') ).length, ( await warnings(t,'OPTION_IGNORED') ).length ],[ 1, 1, 1 ],'one warning each');
    }
};
