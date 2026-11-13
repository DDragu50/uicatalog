// notificationsPanel.test.mjs
//
// The "auto" cases of source/components-js/notificationsPanel/notificationsPanelTESTS.md, by ID. Each case receives t
// (see tools/component-tests.mjs). 'onOpen:preventDefault' (in callbacks) also stops the link.

const ID = 'inbox';
const ROOT = `#${ID}`;
const POPUP = `#${ID}-panel`;
const BELL = `#${ID}-bell`;
const DEPENDS = { stylesheets:[ 'notification', 'button', 'tooltip' ] };
const ITEMS = [
    { id:'n1', text:'Order 1042 shipped', time:'5 minutes ago', icon:'fa-solid fa-truck', href:'#n1', unread:true },
    { id:'n2', text:'Invoice 77 paid', time:'1 hour ago', icon:'fa-solid fa-receipt', href:'#n2', unread:true },
    { id:'n3', text:'New comment', time:'Yesterday', href:'#n3' },
    { id:'n4', text:'Report ready', time:'2 days ago', href:'#n4' },
    { id:'n5', text:'Password changed', time:'Last week', href:'#n5' },
    { id:'n6', text:'Welcome', time:'Last month', href:'#n6' }
];
const BASE = { id:ID, items:ITEMS };
const bellButton = `${ROOT} .ui-notifications-panel-bell-host button`;
const counter = t => t.page.$eval(ROOT,element => element.querySelector('.ui-notification-indicator')?.textContent ?? null);
const isOpen = t => t.page.$eval(POPUP,element => !element.hidden);
const listed = t => t.page.$$eval(`${POPUP} .ui-notifications-panel-item`,items => items.map(item => ( { id:item.dataset.item, unread:item.classList.contains('ui-notifications-panel-unread') } )));
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,DEPENDS);
        t.equal([ await counter(t), await t.call('getUnreadCount') ],[ '2', 2 ],'the number of unread notifications on the bell');
        await t.call('setNotifications',ITEMS.map(( item, index ) => ( { ...item, id:`m${index}`, unread:true } )).concat(Array.from({ length:100 },( _, i ) => ( { id:`x${i}`, text:`Item ${i}`, unread:true } ))));
        t.equal(await counter(t),'99+','"99+" above 99');
        await t.call('markAllRead');
        t.equal(await counter(t),null,'nothing when all are read');
    },
    'T-02':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onToggle' ] });
        await t.page.click(bellButton);
        t.equal([ await isOpen(t), await t.page.evaluate(() => document.activeElement?.dataset.item) ],[ true, 'n1' ],'opens, focus on the first notification');
        t.equal(( await t.calls('onToggle') ).map(call => call.args[0]),[ true ],'onToggle reports it');
    },
    'T-03':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#after').innerHTML = '<button id="next" type="button">Next control</button>'; });
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onToggle' ] });
        await t.page.click(bellButton);
        await t.page.keyboard.press('Escape');
        t.equal([ await isOpen(t), await t.page.evaluate(() => document.activeElement?.closest('.ui-notifications-panel-bell-host') !== null) ],[ false, true ],'Escape closes it, focus back on the bell');
        await t.page.click(bellButton);
        await t.page.click('#after');
        t.equal(await isOpen(t),false,'a click outside closes it');
        await t.page.click(bellButton);
        await t.page.focus(`${POPUP} [data-item="n5"]`);
        await t.page.keyboard.press('Tab');
        t.equal([ await isOpen(t), await t.page.evaluate(() => document.activeElement?.id) ],[ false, 'next' ],'leaving it with the keyboard closes it');
        t.equal(( await t.calls('onToggle') ).map(call => call.args[0]),[ true, false, true, false, true, false ],'each change reported');
    },
    'T-04':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.call('open');
        const rows = await t.page.$$eval(`${POPUP} .ui-notifications-panel-item`,items => items.map(item => ( { icon:Boolean(item.querySelector('.ui-notifications-panel-icon i')), text:item.querySelector('.ui-notifications-panel-text').firstChild.textContent, time:item.querySelector('.ui-notifications-panel-time')?.textContent } )));
        t.equal(rows.length,5,'the latest 5 by default');
        t.equal(rows[0],{ icon:true, text:'Order 1042 shipped', time:'5 minutes ago' },'icon, text and time, in the given order');
        await t.call('destroy');
        await t.render({ ...BASE, maxItems:3 },DEPENDS);
        await t.call('open');
        t.equal(( await listed(t) ).map(item => item.id),[ 'n1', 'n2', 'n3' ],'own number');
    },
    'T-05':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.call('open');
        const look = await t.page.$$eval(`${POPUP} .ui-notifications-panel-item`,items => items.slice(0,3).map(item => getComputedStyle(item).backgroundColor + getComputedStyle(item).fontWeight));
        t.assert(look[0] === look[1] && look[1] !== look[2],`unread highlighted (${look.join(' / ')})`);
        await t.call('setNotifications',[]);
        t.equal(await t.page.$eval(`${POPUP} .ui-notifications-panel-empty`,element => element.textContent.trim()),'You have no notifications.','an empty list');
    },
    'T-06':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onOpen:preventDefault' ] });
        await t.call('open');
        await t.page.click(`${POPUP} [data-item="n2"]`);
        const call = ( await t.calls('onOpen') )[0];
        t.equal([ call.args[0].id, call.args[0].unread, call.args[1], call.args[2] ],[ 'n2', false, 'Event(click)', `instance(${ID})` ],'reported, already marked as read');
        t.equal(await t.call('getUnreadCount'),1,'one unread left');
        await t.call('destroy');
        await t.render({ ...BASE, markReadOnOpen:false },{ ...DEPENDS, callbacks:[ 'onOpen:preventDefault' ] });
        await t.call('open');
        await t.page.click(`${POPUP} [data-item="n1"]`);
        t.equal(await t.call('getUnreadCount'),2,'markReadOnOpen:false keeps it unread');
    },
    'T-07':async t =>
    {
        await t.render(BASE,{ ...DEPENDS, callbacks:[ 'onMarkAllRead' ] });
        await t.call('open');
        await t.page.click(`${POPUP} .ui-notifications-panel-mark-host button`);
        t.equal([ await t.call('getUnreadCount'), ( await listed(t) ).every(item => !item.unread), await counter(t) ],[ 0, true, null ],'all marked as read');
        t.equal(( await t.calls('onMarkAllRead') ).map(call => call.args),[ [ `instance(${ID})` ] ],'reported');
        await t.call('setNotifications',ITEMS);
        await t.call('markAllRead');
        t.equal(( await t.calls('onMarkAllRead') ).length,1,'markAllRead() by code is not reported');
    },
    'T-08':async t =>
    {
        await t.render({ ...BASE, seeAllHref:'#all' },{ ...DEPENDS, callbacks:[ 'onSeeAll' ] });
        await t.call('open');
        const link = `${POPUP} .ui-notifications-panel-see-all`;
        t.equal(await t.page.$eval(link,element => [ element.textContent.trim(), element.getAttribute('href') ]),[ 'See all notifications', '#all' ],'a link to the full list');
        await t.page.click(link);
        t.equal(( await t.calls('onSeeAll') ).map(call => call.args),[ [ 'Event(click)', `instance(${ID})` ] ],'reported');
    },
    'T-09':async t =>
    {
        await t.render(BASE,DEPENDS);
        await t.call('addNotification',{ id:'n0', text:'Payment failed', unread:true });
        await t.call('open');
        t.equal([ await counter(t), ( await listed(t) )[0].id ],[ '3', 'n0' ],'the new count and the new one on top');
        await t.call('addNotification',{ id:'n0', text:'Payment retried' });
        t.equal(await t.page.$eval(`${POPUP} [data-item="n0"]`,element => element.textContent.includes('Payment retried')),true,'the same id is replaced');
    },
    'T-10':async t =>
    {
        await t.render(BASE,DEPENDS);
        t.equal(await t.page.getAttribute(bellButton,'title'),'Notifications','TITLE by default');
        await t.call('destroy');
        await t.render({ ...BASE, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(bellButton,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ ...BASE, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(bellButton);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Notifications')),`TOOLTIP shows the label (${JSON.stringify(shown)})`);
    },
    'T-11':async t =>
    {
        t.assert(await t.render({ id:ID, items:[ ITEMS[0], { id:'bad' }, { ...ITEMS[0], text:'Again' } ], maxItems:0 },DEPENDS),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ITEM') ).length, ( await warnings(t,'DUPLICATE_ITEM_ID') ).length, ( await warnings(t,'INVALID_OPTION') ).length ],[ 1, 1, 1 ],'one warning each');
        t.equal(( await t.call('getNotifications') ).map(item => item.text),[ 'Order 1042 shipped' ],'only the valid notification');
    }
};
