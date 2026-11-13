// notification.test.mjs
//
// The "auto" cases of source/components-js/notification/notificationTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onClick is the third render argument, passed as a { $callback } value in args.

const ID = 'bell';
const ROOT = `#${ID}`;
const DEPENDS = { stylesheets:[ 'tooltip' ] };
const RECORD = { ...DEPENDS, args:[ { $callback:'onClick' } ] };
const BELL = { id:ID, label:'Notifications', icon:'fa-solid fa-bell' };
const LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="8" height="8"%3E%3Crect width="8" height="8" fill="%23f00"/%3E%3C/svg%3E';
const shape = t => t.page.$eval(`${ROOT} .ui-notification-shape`,element => { const rect = element.getBoundingClientRect(); return { width:Math.round(rect.width), height:Math.round(rect.height), radius:parseFloat(getComputedStyle(element).borderTopLeftRadius) }; });
const marker = t => t.page.$eval(ROOT,element => { const mark = element.querySelector('.ui-notification-indicator'); if ( !mark ) { return null; } const rect = mark.getBoundingClientRect(); return { text:mark.textContent, width:Math.round(rect.width), height:Math.round(rect.height), classes:mark.className }; });
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
const colourOf = ( t, token ) => t.page.evaluate(name => { const probe = document.createElement('span'); probe.style.color = `var(${name})`; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; },token);

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BELL,RECORD);
        const icon = await shape(t);
        t.assert(Math.abs(icon.width - icon.height) < 1 && icon.radius >= icon.width / 2 - 1,`an icon as a circle (${JSON.stringify(icon)})`);
        await t.call('destroy');
        await t.render({ id:ID, label:'Ana', image:LOGO },RECORD);
        t.assert(await t.page.$(`${ROOT} img.ui-notification-image`),'a picture');
        const picture = await shape(t);
        t.assert(picture.radius >= picture.width / 2 - 1,'as a circle');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, label:'Ana Popescu', text:'AP' },RECORD);
        const initials = await shape(t);
        t.assert(Math.abs(initials.width - initials.height) < 1,`up to three characters: a circle (${JSON.stringify(initials)})`);
        await t.call('destroy');
        await t.render({ id:ID, label:'Beta', text:'BETA' },RECORD);
        const pill = await shape(t);
        t.assert(pill.width > pill.height + 2,`longer text: a pill (${JSON.stringify(pill)})`);
    },
    'T-03':async t =>
    {
        const sizes = [];
        for ( const size of [ 'SMALL', 'MEDIUM', 'LARGE' ] )
        {
            await t.render({ ...BELL, size, indicator:{ kind:'COUNT', value:3 } },RECORD);
            sizes.push({ shape:( await shape(t) ).height, marker:( await marker(t) ).height });
            await t.call('destroy');
        }
        t.assert(sizes[0].shape < sizes[1].shape && sizes[1].shape < sizes[2].shape,`three sizes (${JSON.stringify(sizes)})`);
        t.assert(sizes[0].marker <= sizes[1].marker && sizes[1].marker <= sizes[2].marker && sizes[0].marker < sizes[2].marker,'the marker follows the size');
    },
    'T-04':async t =>
    {
        const outline = async border => { await t.render({ ...BELL, border },RECORD); const result = await t.page.$eval(`${ROOT} .ui-notification-shape`,element => [ getComputedStyle(element).borderTopColor, getComputedStyle(element).borderTopStyle, Math.round(element.getBoundingClientRect().width) ]); await t.call('destroy'); return result; };
        const plain = await outline(false), framed = await outline(true);
        t.assert(framed[0] !== plain[0] && framed[0] !== 'rgba(0, 0, 0, 0)',`a thin border (${framed.join(' ')} / ${plain.join(' ')})`);
        t.equal(framed[2],plain[2],'same size with or without');
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, label:'Ana', text:'AP', colorToken:'--c-on-accent', backgroundToken:'--c-accent' },RECORD);
        const look = await t.page.$eval(`${ROOT} .ui-notification-shape`,element => [ getComputedStyle(element.querySelector('.ui-notification-text')).color, getComputedStyle(element).backgroundColor ]);
        t.equal(look,[ await colourOf(t,'--c-on-accent'), await colourOf(t,'--c-accent') ],'own colours for the text and the shape');
    },
    'T-06':async t =>
    {
        await t.render({ ...BELL, indicator:{ kind:'COUNT', value:3 } },RECORD);
        const one = await marker(t);
        t.assert(one.text === '3' && Math.abs(one.width - one.height) < 1,`one digit: a circle (${JSON.stringify(one)})`);
        await t.call('setCount',42);
        const two = await marker(t);
        t.assert(two.text === '42' && two.width > two.height,`longer counts: a pill (${JSON.stringify(two)})`);
        await t.call('setCount',120);
        t.equal(( await marker(t) ).text,'99+','above 99: "99+"');
        await t.call('setCount',0);
        t.equal(await marker(t),null,'hidden at 0');
    },
    'T-07':async t =>
    {
        const shapes = {};
        for ( const kind of [ 'CIRCLE', 'TRIANGLE', 'SQUARE', 'DIAMOND' ] )
        {
            await t.render({ ...BELL, indicator:{ kind:'DOT', shape:kind, description:'New' } },RECORD);
            shapes[kind] = await t.page.$eval(`${ROOT} .ui-notification-indicator`,element => [ element.classList.contains(`ui-notification-shape-${element.className.match(/ui-notification-shape-(\w+)/)[1]}`) && element.className.match(/ui-notification-shape-(\w+)/)[1], getComputedStyle(element).borderTopLeftRadius, getComputedStyle(element).clipPath, getComputedStyle(element).transform ].join('|'));
            await t.call('destroy');
        }
        t.equal(new Set(Object.values(shapes)).size,4,`four different dots (${JSON.stringify(shapes)})`);
        t.assert(Object.keys(shapes).every(kind => shapes[kind].startsWith(kind.toLowerCase())),'each with its own shape');
    },
    'T-08':async t =>
    {
        await t.render({ ...BELL, indicator:{ kind:'TEXT', value:'NEW', type:'SUCCESS' } },RECORD);
        const text = await marker(t);
        t.equal([ text.text, /ui-notification-type-success/.test(text.classes) ],[ 'NEW', true ],'a short text marker');
        const colours = {};
        for ( const type of [ 'INFO', 'SUCCESS', 'WARNING', 'DANGER' ] )
        {
            await t.call('destroy');
            await t.render({ ...BELL, indicator:{ kind:'COUNT', value:2, type } },RECORD);
            colours[type] = await t.page.$eval(`${ROOT} .ui-notification-indicator`,element => getComputedStyle(element).backgroundColor);
        }
        t.equal(new Set(Object.values(colours)).size,4,'a colour per type');
        await t.call('destroy');
        await t.render({ ...BELL, indicator:{ kind:'COUNT', value:2, type:'CUSTOM', backgroundToken:'--c-accent', colorToken:'--c-on-accent' } },RECORD);
        t.equal(await t.page.$eval(`${ROOT} .ui-notification-indicator`,element => getComputedStyle(element).backgroundColor),await colourOf(t,'--c-accent'),'own colours');
    },
    'T-09':async t =>
    {
        const place = async corner => { await t.render({ ...BELL, indicator:{ kind:'COUNT', value:3, ...( corner ? { corner } : {} ) } },RECORD); const result = await t.page.$eval(ROOT,element => { const box = element.querySelector('.ui-notification-shape').getBoundingClientRect(), mark = element.querySelector('.ui-notification-indicator').getBoundingClientRect(); return { right:mark.left + mark.width / 2 > box.left + box.width / 2, top:mark.top + mark.height / 2 < box.top + box.height / 2 }; }); await t.call('destroy'); return result; };
        t.equal(await place(null),{ right:true, top:true },'top right by default');
        t.equal(await place('BOTTOM_LEFT'),{ right:false, top:false },'another corner');
        await t.render({ ...BELL, indicator:{ kind:'TEXT', value:'BETA' } },RECORD);
        const wide = await t.page.$eval(ROOT,element => { const root = element.getBoundingClientRect(), box = element.querySelector('.ui-notification-shape').getBoundingClientRect(), mark = element.querySelector('.ui-notification-indicator').getBoundingClientRect(); return { outside:mark.right > box.right + 1, wider:root.width > box.width + 1 }; });
        t.equal(wide,{ outside:true, wider:true },'a long marker outside the shape; the notification becomes wider');
    },
    'T-10':async t =>
    {
        await t.render(BELL,RECORD);
        t.equal(await t.page.$eval(ROOT,element => element.localName),'button','clickable by default');
        await t.page.click(ROOT);
        await t.page.focus(ROOT);
        await t.page.keyboard.press('Enter');
        t.equal(( await t.calls('onClick') ).map(call => call.args),[ [ 'Event(click)', `instance(${ID})` ], [ 'Event(click)', `instance(${ID})` ] ],'click and Enter reported');
        await t.call('setDisabled',true);
        await t.page.click(ROOT,{ force:true });
        t.equal(( await t.calls('onClick') ).length,2,'disabled: nothing');
        await t.call('destroy');
        await t.render({ ...BELL, clickable:false },RECORD);
        t.equal(await t.page.$eval(ROOT,element => [ element.localName, element.getAttribute('role') ]),[ 'span', 'img' ],'display only');
    },
    'T-11':async t =>
    {
        await t.render({ ...BELL, indicator:{ kind:'COUNT', value:3 } },RECORD);
        t.equal(await t.page.getAttribute(ROOT,'aria-label'),'Notifications, 3 new','name with the meaning of the marker');
        await t.call('setIndicator',{ value:5 });
        t.equal([ ( await marker(t) ).text, await t.page.getAttribute(ROOT,'aria-label'), await t.call('getIndicatorSpeech') ],[ '5', 'Notifications, 5 new', '5 new' ],'changed in place');
        await t.call('setIndicator',{ kind:'DOT', description:'Online', type:'SUCCESS' });
        t.equal(await t.page.getAttribute(ROOT,'aria-label'),'Notifications, Online','a dot with its meaning');
        await t.call('setCount',2);
        t.equal([ ( await marker(t) ).text, await t.page.getAttribute(ROOT,'aria-label') ],[ '2', 'Notifications, 2 new' ],'a count after a dot: the dot\'s meaning does not stay');
        await t.call('setIndicator',null);
        t.equal([ await marker(t), await t.page.getAttribute(ROOT,'aria-label') ],[ null, 'Notifications' ],'removed');
    },
    'T-12':async t =>
    {
        await t.render(BELL,RECORD);
        t.equal(await t.page.getAttribute(ROOT,'title'),'Notifications','TITLE by default');
        await t.call('destroy');
        await t.render({ ...BELL, tooltipMode:'NONE' },RECORD);
        t.equal(await t.page.getAttribute(ROOT,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ ...BELL, tooltipMode:'TOOLTIP' },RECORD);
        await t.page.hover(ROOT);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Notifications')),`TOOLTIP shows the label (${JSON.stringify(shown)})`);
    },
    'T-13':async t =>
    {
        t.equal(await t.render({ id:ID, icon:'fa-solid fa-bell' },RECORD),null,'no label');
        t.equal(await t.render({ id:ID, label:'Empty' },RECORD),null,'no content');
        t.equal(await errors(t),[ 'LABEL_REQUIRED', 'CONTENT_REQUIRED' ],'labels');
    },
    'T-14':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Ana', icon:'fa-solid fa-user', text:'AP', colorToken:'red' },RECORD),'rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Beta', text:'A very long text here' },RECORD),'rendered');
        t.equal([ ( await warnings(t,'CONTENT_CONFLICT') ).length, ( await warnings(t,'TEXT_TOO_LONG') ).length, ( await warnings(t,'INVALID_TOKEN') ).length ],[ 1, 1, 1 ],'one warning each');
        await t.call('destroy');
        t.assert(await t.render({ ...BELL, clickable:false, disabled:true },RECORD),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,1,'disabled without clickable');
    }
};
