// actionMenu.test.mjs
//
// The "auto" cases of source/components-js/actionMenu/actionMenuTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onAction is the third render argument, passed as a { $callback } value in args.

const ID = 'more';
const TRIGGER = `#${ID}`;
const MENU = `#${ID}-menu`;
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const RECORD = { ...DEPENDS, args:[ { $callback:'onAction' } ] };
const ITEMS = [
    { key:'edit', label:'Edit', icon:'fa-solid fa-pen' },
    { key:'copy', label:'Duplicate', icon:'fa-solid fa-copy' },
    { key:'archive', label:'Archive', disabled:true },
    { type:'SEPARATOR' },
    { key:'open', label:'Open invoice', href:'#invoice' },
    { key:'delete', label:'Delete', icon:'fa-solid fa-trash', danger:true }
];
const BASE = { id:ID, label:'More actions for order 1042', items:ITEMS };
const isOpen = t => t.page.$eval(MENU,element => element.matches(':popover-open'));
const active = t => t.page.evaluate(() => document.activeElement?.dataset.key ?? document.activeElement?.id);
const item = key => `${MENU} [data-key="${key}"]`;
const box = ( t, selector ) => t.page.$eval(selector,element => { const rect = element.getBoundingClientRect(); return { left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom }; });
const reported = async t => ( await t.calls('onAction') ).map(call => call.args[0]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.cssText = 'display:flex;justify-content:center;'; });
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        const [ button, list ] = [ await box(t,TRIGGER), await box(t,MENU) ];
        t.equal([ await isOpen(t), await t.page.getAttribute(TRIGGER,'aria-expanded') ],[ true, 'true' ],'opens');
        t.assert(list.top >= button.bottom - 1,'below the button');
        t.assert(Math.abs(list.right - button.right) < 2,`aligned with the end edge (${list.right} / ${button.right})`);
        t.equal(await active(t),'edit','focus on the first available action');
    },
    'T-02':async t =>
    {
        await t.page.evaluate(() => { const host = document.querySelector('#host'); host.style.cssText = 'display:flex;justify-content:flex-start;'; document.querySelector('#before').style.marginBlockStart = `${window.innerHeight - 110}px`; });
        await t.render(BASE,RECORD);
        await t.page.evaluate(id => document.getElementById(id).scrollIntoView({ block:'end' }),ID);
        await t.page.click(TRIGGER);
        const [ button, list ] = [ await box(t,TRIGGER), await box(t,MENU) ];
        t.assert(list.bottom <= button.top + 1,'above the button when there is no room below');
        t.assert(Math.abs(list.left - button.left) < 2 && list.left >= 0,`aligned with the start edge when there is no room at the end (${list.left} / ${button.left})`);
    },
    'T-03':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        await t.page.click(item('copy'));
        t.equal([ await isOpen(t), await reported(t) ],[ false, [ 'copy' ] ],'closes and reports the action');
        t.equal(( await t.calls('onAction') )[0].args[1],`instance(${ID})`,'with the instance');
        await t.page.click(TRIGGER);
        await t.page.keyboard.press('ArrowDown');
        await t.page.keyboard.press('Enter');
        t.equal(await reported(t),[ 'copy', 'copy' ],'Enter chooses too');
    },
    'T-04':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        await t.page.keyboard.press('Escape');
        t.equal([ await isOpen(t), await active(t) ],[ false, ID ],'Escape closes it, focus back on the button');
        await t.page.click(TRIGGER);
        await t.page.keyboard.press('Tab');
        t.equal(await isOpen(t),false,'Tab closes it');
        await t.page.click(TRIGGER);
        await t.page.click('#after');
        t.equal([ await isOpen(t), await reported(t) ],[ false, [] ],'a click outside closes it; nothing reported');
    },
    'T-05':async t =>
    {
        await t.render({ ...BASE, items:[ { type:'SEPARATOR' }, ...ITEMS, { type:'SEPARATOR' }, { type:'SEPARATOR' } ] },RECORD);
        await t.page.click(TRIGGER);
        const entries = await t.page.$$eval(`${MENU} > li`,items => items.map(item => ( item.querySelector('[role="separator"]') || item.getAttribute('role') === 'separator' ? '—' : item.querySelector('.ui-action-menu-label').textContent + ( item.querySelector('.ui-action-menu-icon i') ? '*' : '' ) )));
        t.equal(entries,[ 'Edit*', 'Duplicate*', 'Archive', '—', 'Open invoice', 'Delete*' ],'labels and icons; one separator between groups (leading, trailing and double ones removed)');
    },
    'T-06':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        const colours = await t.page.evaluate(( [ menu ] ) => { const colour = key => getComputedStyle(document.querySelector(`${menu} [data-key="${key}"]`)).color; const probe = document.createElement('span'); probe.style.color = 'var(--c-danger-text)'; document.body.appendChild(probe); const danger = getComputedStyle(probe).color; probe.remove(); return { edit:colour('edit'), delete:colour('delete'), danger }; },[ MENU ]);
        t.assert(colours.delete !== colours.edit && colours.delete === colours.danger,`"Delete" in the danger colour (${JSON.stringify(colours)})`);
    },
    'T-07':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        t.equal(await t.page.getAttribute(item('archive'),'aria-disabled'),'true','shown as unavailable');
        await t.page.click(item('archive'),{ force:true });
        t.equal([ await reported(t), await isOpen(t) ],[ [], true ],'cannot be chosen');
    },
    'T-08':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        t.equal(await t.page.$eval(item('open'),element => [ element.localName, element.getAttribute('href') ]),[ 'a', '#invoice' ],'a page link');
        await t.page.click(item('open'));
        t.equal([ await reported(t), t.page.url().endsWith('#invoice') ],[ [ 'open' ], true ],'reported and the page opens');
    },
    'T-09':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.click(TRIGGER);
        const path = [];
        for ( const key of [ 'ArrowDown', 'ArrowDown', 'ArrowDown', 'End', 'Home', 'ArrowUp' ] ) { await t.page.keyboard.press(key); path.push(await active(t)); }
        t.equal(path,[ 'copy', 'open', 'delete', 'delete', 'edit', 'delete' ],'arrows, Home and End move between available actions (skipping Archive), wrapping around');
        await t.page.keyboard.press('d');
        t.equal(await active(t),'copy','the first letter moves to the next matching action');
        await t.wait(1000);
        await t.page.keyboard.press('d');
        t.equal(await active(t),'delete','and on to the next one');
    },
    'T-10':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.page.getAttribute(TRIGGER,'aria-label'),'More actions for order 1042','the button\'s name');
        const look = async extra => { await t.call('destroy'); await t.render({ ...BASE, ...extra },RECORD); return t.page.$eval(TRIGGER,element => ( { icon:element.querySelector('i')?.className, height:Math.round(element.getBoundingClientRect().height), border:getComputedStyle(element).borderTopStyle !== 'none' && parseFloat(getComputedStyle(element).borderTopWidth) > 0 && getComputedStyle(element).borderTopColor !== 'rgba(0, 0, 0, 0)' } )); };
        const small = await look({}), large = await look({ size:'LARGE', icon:'fa-solid fa-ellipsis', bordered:true });
        t.equal([ small.icon, large.icon ],[ 'fa-solid fa-ellipsis-vertical', 'fa-solid fa-ellipsis' ],'own icon');
        t.assert(large.height > small.height,'own size');
        t.equal([ small.border, large.border ],[ false, true ],'with or without a border');
    },
    'T-11':async t =>
    {
        await t.render({ ...BASE, disabled:true },RECORD);
        await t.page.click(TRIGGER,{ force:true });
        t.equal([ await t.page.$eval(TRIGGER,element => element.disabled), await isOpen(t) ],[ true, false ],'the whole menu disabled');
    },
    'T-12':async t =>
    {
        await t.render({ ...BASE, tooltipMode:'TITLE' },RECORD);
        t.equal(await t.page.getAttribute(TRIGGER,'title'),'More actions for order 1042','TITLE');
        await t.call('destroy');
        await t.render(BASE,RECORD);
        t.equal(await t.page.getAttribute(TRIGGER,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ ...BASE, tooltipMode:'TOOLTIP' },RECORD);
        await t.page.hover(TRIGGER);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('More actions')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-13':async t =>
    {
        t.equal(await t.render({ id:ID, items:[ { type:'SEPARATOR' } ] },RECORD),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[ITEMS_REQUIRED]')),'console error');
        t.assert(await t.render({ id:ID, items:[ ITEMS[0], { key:'x' }, { key:'edit', label:'Edit again' } ] },RECORD),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ITEM') ).length, ( await warnings(t,'DUPLICATE_ITEM_KEY') ).length ],[ 1, 1 ],'one warning each');
    }
};
