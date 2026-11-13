// message.test.mjs
//
// The "auto" cases of source/components-js/message/messageTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs).

const ID = 'note';
const BOX = `#${ID}`;
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const action = key => `${BOX} .ui-message-action[data-action="${key}"] button`;
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const visible = t => t.page.$eval(BOX,element => ( element.localName === 'dialog' ? element.open : !element.hidden ));
const frame = t => t.page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

export const cases =
{
    'T-01':async t =>
    {
        const looks = {};
        for ( const type of [ 'INFO', 'SUCCESS', 'WARNING', 'DANGER' ] )
        {
            await t.render({ id:ID, type, text:'Text' },DEPENDS);
            looks[type] = await t.page.$eval(BOX,element => ( { type:[ ...element.classList ].find(name => name.startsWith('ui-message-type-')), icon:element.querySelector('.ui-message-icon i').className, edge:getComputedStyle(element).borderInlineStartColor } ));
            await t.call('destroy');
        }
        t.equal(Object.values(looks).map(look => look.type),[ 'ui-message-type-info', 'ui-message-type-success', 'ui-message-type-warning', 'ui-message-type-danger' ],'type classes');
        t.equal(new Set(Object.values(looks).map(look => look.icon)).size,4,'an icon per type');
        t.equal(new Set(Object.values(looks).map(look => look.edge)).size,4,'a colour per type');
        await t.render({ id:ID, type:'CUSTOM', text:'Text', backgroundToken:'--c-surface-muted', colorToken:'--c-text', borderToken:'--c-border' },DEPENDS);
        const custom = await t.page.$eval(BOX,element => [ getComputedStyle(element).backgroundColor, getComputedStyle(document.documentElement).getPropertyValue('--c-surface-muted').trim() ]);
        t.assert(custom[0] !== 'rgba(0, 0, 0, 0)',`custom background (${custom.join(' / ')})`);
    },
    'T-02':async t =>
    {
        const layouts = {};
        for ( const layout of [ 'INLINE', 'BLOCK', 'BANNER' ] )
        {
            await t.render({ id:ID, layout, text:'Text' },DEPENDS);
            layouts[layout] = await t.page.$eval(BOX,element => ( { layout:element.classList.contains(`ui-message-${element.dataset.layout ?? ''}`) || [ ...element.classList ].find(name => /^ui-message-(inline|block|banner)$/.test(name)), display:getComputedStyle(element).display } ));
            await t.call('destroy');
        }
        t.equal(Object.values(layouts).map(item => item.layout),[ 'ui-message-inline', 'ui-message-block', 'ui-message-banner' ],'layout classes');
    },
    'T-03':async t =>
    {
        await t.render({ id:'toast-a', layout:'TOAST', corner:'TOP_RIGHT', text:'First toast' },DEPENDS);
        await t.render({ id:'toast-b', layout:'TOAST', corner:'TOP_RIGHT', text:'Second toast' },DEPENDS);
        const place = await t.page.evaluate(() =>
        {
            const [ a, b ] = [ '#toast-a', '#toast-b' ].map(selector => document.querySelector(selector).getBoundingClientRect());
            const region = document.querySelector('.ui-message-region-top-right');
            return { region:Boolean(region), fixed:getComputedStyle(region).position, both:region.contains(document.querySelector('#toast-a')) && region.contains(document.querySelector('#toast-b')), stacked:b.top >= a.bottom - 1 || a.top >= b.bottom - 1, right:window.innerWidth - Math.max(a.right,b.right), top:Math.min(a.top,b.top) };
        });
        t.equal([ place.region, place.fixed, place.both, place.stacked ],[ true, 'fixed', true, true ],'stacked in the corner region');
        t.assert(place.right < 80 && place.top < 80,`top right corner (${JSON.stringify(place)})`);
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, layout:'MODAL', title:'Delete order', text:'Delete order 1042?', actions:[ { key:'delete', label:'Delete' }, { key:'cancel', label:'Cancel' } ] },{ ...DEPENDS, callbacks:[ 'onAction', 'onClose' ] });
        const dialog = await t.page.$eval(BOX,element => { const rect = element.getBoundingClientRect(); return { modal:element.matches(':modal'), centre:Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) < 2 && Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2) < 2, name:element.getAttribute('aria-labelledby') }; });
        t.equal([ dialog.modal, dialog.centre, dialog.name ],[ true, true, `${ID}-title` ],'a modal window in the middle, named by its title');
        t.assert(await t.page.evaluate(() => { const rect = document.querySelector('#before').getBoundingClientRect(); return document.elementFromPoint(rect.left + 2,rect.top + 2)?.id !== 'before'; }),'the page behind is blocked');
        await t.page.click(action('delete'));
        t.equal(( await t.calls() ).map(call => [ call.name, call.args[0] ]),[ [ 'onAction', 'delete' ], [ 'onClose', 'ACTION' ] ],'action reported, then closed');
        t.equal(await visible(t),false,'closed');
        await t.call('show');
        await t.page.keyboard.press('Escape');
        t.equal(( await t.calls('onClose') ).at(-1).args,[ 'ESCAPE', `instance(${ID})` ],'Escape closes it and reports the cancel');
        t.equal(await visible(t),false,'closed by Escape');
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, title:'Check the form', text:'Two fields need attention.', link:{ href:'#help', label:'Help' }, details:[ 'Name is required.', { label:'E-mail', href:'#email' } ], actions:[ { key:'retry', label:'Retry' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        const content = await t.page.$eval(BOX,element => ( { title:element.querySelector('.ui-message-title')?.textContent, text:element.querySelector('.ui-message-text')?.firstChild.textContent.trim(), link:element.querySelector('.ui-message-link')?.getAttribute('href'), details:[ ...element.querySelectorAll('.ui-message-details li') ].map(item => item.textContent), detailLink:element.querySelector('.ui-message-detail-link')?.getAttribute('href'), action:element.querySelector('.ui-message-action button')?.textContent.trim() } ));
        t.equal(content,{ title:'Check the form', text:'Two fields need attention.', link:'#help', details:[ 'Name is required.', 'E-mail' ], detailLink:'#email', action:'Retry' },'title, text, link, details and action');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, text:'Upload failed.', actions:[ { key:'retry', label:'Retry' } ] },{ ...DEPENDS, callbacks:[ 'onAction', 'onClose' ] });
        await t.page.click(action('retry'));
        t.equal(( await t.calls() ).map(call => [ call.name, ...call.args ]),[ [ 'onAction', 'retry', `instance(${ID})` ] ],'reported; a block message stays');
        t.equal(await visible(t),true,'still visible');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, layout:'MODAL', type:'DANGER', title:'Delete order', text:'This cannot be undone.', actions:[ { key:'delete', label:'Delete' }, { key:'cancel', label:'Cancel' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        await frame(t);
        t.equal(await t.page.evaluate(() => document.activeElement?.textContent.trim()),'Cancel','Cancel has the focus');
        await t.page.keyboard.press('Enter');
        t.equal(( await t.calls('onAction') ).map(call => call.args[0]),[ 'cancel' ],'an accidental Enter cancels');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, text:'Saved.', closable:true },{ ...DEPENDS, callbacks:[ 'onClose' ] });
        t.equal(await t.page.getAttribute(`#${ID}-close`,'aria-label'),'Close message','close button');
        await t.page.click(`#${ID}-close`);
        t.equal([ await visible(t), ( await t.calls('onClose') ).map(call => call.args[0]) ],[ false, [ 'USER' ] ],'hidden and reported');
        await t.call('show');
        await t.call('hide');
        t.equal(( await t.calls('onClose') ).length,1,'hide() by code is not reported');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, text:'Saved.', duration:600 },{ ...DEPENDS, callbacks:[ 'onClose' ] });
        await t.wait(1000);
        t.equal([ await visible(t), ( await t.calls('onClose') ).map(call => call.args[0]) ],[ false, [ 'TIMEOUT' ] ],'hidden after the time');
        await t.call('destroy');
        await t.render({ id:ID, text:'Saved.', duration:600 },{ ...DEPENDS, callbacks:[ 'onClose' ] });
        await t.page.hover(BOX);
        await t.wait(1000);
        t.equal(await visible(t),true,'kept while the mouse is over it');
        await t.page.mouse.move(0,0);
        await t.wait(1000);
        t.equal(await visible(t),false,'hidden after the mouse leaves');
        await t.call('destroy');
        await t.render({ id:ID, text:'Saved.', duration:600, actions:[ { key:'undo', label:'Undo' } ] },{ ...DEPENDS, callbacks:[ 'onAction', 'onClose' ] });
        await t.page.focus(action('undo'));
        await t.wait(1000);
        t.equal(await visible(t),true,'kept while it has the keyboard focus');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, text:'Saved.', duration:5000, remainingIndicator:'BAR_AND_TEXT' },DEPENDS);
        await frame(t);
        const shown = () => t.page.$eval(BOX,element => ( { bar:Boolean(element.querySelector('.ui-message-remaining-bar')), text:element.querySelector('.ui-message-remaining-text')?.textContent.trim() } ));
        const start = await shown();
        t.assert(start.bar && /^Closes in [45] s$/.test(start.text),`bar and text (${JSON.stringify(start)})`);
        await t.page.hover(BOX);
        await t.wait(300);
        t.equal(( await shown() ).text,'Paused','"Paused" while paused');
    },
    'T-11':async t =>
    {
        await t.render({ id:ID, type:'DANGER', text:'Payment failed.', duration:500 },DEPENDS);
        t.equal(( await warnings(t,'TEMPORARY_DANGER') ).length,1,'warning');
        await t.wait(900);
        t.equal(await visible(t),true,'a danger message stays');
    },
    'T-12':async t =>
    {
        await t.render({ id:ID, text:'Already here.' },DEPENDS);
        t.equal([ await visible(t), await t.page.getAttribute(BOX,'role') ],[ true, null ],'on the page from the start: exposed, not announced');
        await t.call('hide');
        await t.call('show');
        await frame(t);
        t.equal(await t.page.getAttribute(BOX,'role'),'status','information announced politely');
        t.equal(await t.page.$eval(`${BOX} .ui-message-text`,element => element.textContent.trim()),'Already here.','text there to be read');
        await t.call('destroy');
        await t.render({ id:ID, type:'WARNING', text:'Check this.', visible:false },DEPENDS);
        await t.call('show');
        t.equal(await t.page.getAttribute(BOX,'role'),'alert','a warning announced at once');
    },
    'T-13':async t =>
    {
        await t.render({ id:ID, type:'INFO', text:'Saving…' },DEPENDS);
        await t.call('update',{ type:'SUCCESS', text:'Saved.' });
        await frame(t);
        const state = await t.page.$eval(BOX,element => ( { success:element.classList.contains('ui-message-type-success'), text:element.querySelector('.ui-message-text').textContent.trim(), role:element.getAttribute('role') } ));
        t.equal(state,{ success:true, text:'Saved.', role:'status' },'changed in place and announced');
    },
    'T-14':async t =>
    {
        const close = `#${ID}-close`;
        await t.render({ id:ID, text:'Saved.', closable:true, tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(close,'title'),'Close message','TITLE');
        await t.call('destroy');
        await t.render({ id:ID, text:'Saved.', closable:true },DEPENDS);
        t.equal(await t.page.getAttribute(close,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ id:ID, text:'Saved.', closable:true, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(close);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Close message')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-15':async t =>
    {
        t.equal(await t.render({ id:ID, text:'' },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[TEXT_REQUIRED]')),'console error');
    },
    'T-16':async t =>
    {
        t.assert(await t.render({ id:ID, type:'CUSTOM', text:'Text', backgroundToken:'red' },DEPENDS),'rendered');
        t.equal(( await warnings(t,'INVALID_TOKEN') ).length,1,'warning');
    },
    'T-17':async t =>
    {
        t.assert(await t.render({ id:ID, text:'Text', actions:[ { key:'a', label:'A', icon:'fa-solid fa-<bad>' }, { key:'b' }, { key:'a', label:'A again' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] }),'rendered');
        t.equal([ ( await warnings(t,'INVALID_ICON_CLASS') ).length, ( await warnings(t,'INVALID_ACTION') ).length, ( await warnings(t,'DUPLICATE_ACTION_KEY') ).length ],[ 1, 1, 1 ],'one warning each');
        t.equal(await t.page.$$eval(`${BOX} .ui-message-action`,hosts => hosts.map(host => host.dataset.action)),[ 'a' ],'only the valid action');
    },
    'T-18':async t =>
    {
        await t.render({ id:ID, text:'Text', actions:[ { key:'retry', label:'Retry' } ] },DEPENDS);
        t.equal(( await warnings(t,'ACTION_HANDLER_MISSING') ).length,1,'warning without onAction');
        t.assert(await t.page.$eval(action('retry'),element => element.disabled || element.getAttribute('aria-disabled') === 'true'),'the action is disabled');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'warning');
    },
    'T-19':async t =>
    {
        t.assert(await t.render({ id:ID, layout:'MODAL', text:'Text', closable:true },DEPENDS),'modal rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, text:'Text', corner:'BOTTOM_LEFT' },DEPENDS),'block rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    }
};
