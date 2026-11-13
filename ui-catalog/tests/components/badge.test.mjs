// badge.test.mjs
//
// The "auto" cases of source/components-js/badge/badgeTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onClick is the third render argument, passed as a { $callback } value in args, or set in
// the configuration through callbacks.

const ID = 'person';
const ROOT = `#${ID}`;
const DEPENDS = { stylesheets:[ 'notification', 'tooltip' ] };
const ANA = { id:ID, name:'Ana Pop', description:'Administrator', notification:{ text:'AP', indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } } };
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const rect = ( t, selector ) => t.page.$eval(selector,element => { const box = element.getBoundingClientRect(); return { left:Math.round(box.left), right:Math.round(box.right), top:Math.round(box.top), bottom:Math.round(box.bottom), width:Math.round(box.width), height:Math.round(box.height) }; });
const colourOf = ( t, token ) => t.page.evaluate(name => { const probe = document.createElement('span'); probe.style.color = `var(${name})`; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; },token);

export const cases =
{
    'T-01':async t =>
    {
        await t.render(ANA,DEPENDS);
        const text = await t.page.$eval(ROOT,element => [ element.querySelector('.ui-badge-name').textContent, element.querySelector('.ui-badge-description').textContent.replace(/^,\s*/,'') ]);
        t.equal(text,[ 'Ana Pop', 'Administrator' ],'name and role');
        t.equal(await t.page.$eval(`${ROOT} .ui-notification-text`,element => element.textContent),'AP','initials');
        await t.call('destroy');
        await t.render({ id:ID, name:'Ana Pop' },DEPENDS);
        t.equal(await t.page.$(`${ROOT} .ui-notification`),null,'text only without a picture');
    },
    'T-02':async t =>
    {
        await t.render({ ...ANA, notification:{ icon:'fa-solid fa-user', indicator:{ kind:'COUNT', value:3, corner:'BOTTOM_LEFT' } } },DEPENDS);
        const place = await t.page.$eval(ROOT,element => { const shape = element.querySelector('.ui-notification-shape').getBoundingClientRect(), mark = element.querySelector('.ui-notification-indicator').getBoundingClientRect(); return { text:element.querySelector('.ui-notification-indicator').textContent, left:mark.left + mark.width / 2 < shape.left + shape.width / 2, bottom:mark.top + mark.height / 2 > shape.top + shape.height / 2 }; });
        t.equal(place,{ text:'3', left:true, bottom:true },'a marker on the picture, in the chosen corner');
    },
    'T-03':async t =>
    {
        await t.render(ANA,DEPENDS);
        const [ picture, text ] = [ await rect(t,`${ROOT} .ui-notification`), await rect(t,`${ROOT} .ui-badge-text`) ];
        t.assert(text.left >= picture.right - 1,'text beside the picture');
        await t.call('destroy');
        await t.render({ ...ANA, layout:'VERTICAL' },DEPENDS);
        const [ above, below ] = [ await rect(t,`${ROOT} .ui-notification`), await rect(t,`${ROOT} .ui-badge-text`) ];
        t.assert(below.top >= above.bottom - 1 && Math.abs(( below.left + below.right ) / 2 - ( above.left + above.right ) / 2) < 3,`centred below it (${JSON.stringify([ above, below ])})`);
    },
    'T-04':async t =>
    {
        const sizes = [];
        for ( const size of [ 'SMALL', 'MEDIUM', 'LARGE' ] )
        {
            await t.render({ ...ANA, size },DEPENDS);
            sizes.push({ picture:( await rect(t,`${ROOT} .ui-notification-shape`) ).height, text:await t.page.$eval(`${ROOT} .ui-badge-name`,element => parseFloat(getComputedStyle(element).fontSize)) });
            await t.call('destroy');
        }
        t.assert(sizes[0].picture < sizes[1].picture && sizes[1].picture < sizes[2].picture,`pictures grow (${JSON.stringify(sizes)})`);
        t.assert(sizes[0].text <= sizes[1].text && sizes[1].text <= sizes[2].text && sizes[0].text < sizes[2].text,'the text grows with them');
    },
    'T-05':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '9rem'; });
        await t.render({ ...ANA, name:'Anastasia Popescu-Vasilescu', description:'Senior regional administrator' },DEPENDS);
        const name = await t.page.$eval(`${ROOT} .ui-badge-name`,element => ( { cut:element.scrollWidth > element.clientWidth, ellipsis:getComputedStyle(element).textOverflow, title:element.getAttribute('title') } ));
        t.equal(name,{ cut:true, ellipsis:'ellipsis', title:'Anastasia Popescu-Vasilescu' },'shortened with "…", the full name as the tooltip');
        t.equal(await t.page.$eval(`${ROOT} .ui-badge-description`,element => element.getAttribute('title')),'Senior regional administrator','and the description');
    },
    'T-06':async t =>
    {
        await t.render({ ...ANA, href:'#profile' },DEPENDS);
        t.equal(await t.page.$eval(ROOT,element => [ element.localName, element.getAttribute('href') ]),[ 'a', '#profile' ],'a link');
        await t.page.click(ROOT);
        t.assert(t.page.url().endsWith('#profile'),'opens the linked page');
        await t.call('destroy');
        await t.render(ANA,{ ...DEPENDS, args:[ { $callback:'onClick' } ] });
        t.equal(await t.page.$eval(ROOT,element => element.localName),'button','a button');
        await t.page.click(ROOT);
        t.equal(( await t.calls('onClick') ).map(call => call.args),[ [ 'Event(click)', `instance(${ID})` ] ],'the click reported');
        await t.call('destroy');
        await t.render(ANA,DEPENDS);
        t.equal(await t.page.$eval(ROOT,element => [ element.localName, element.getAttribute('role') ]),[ 'span', 'group' ],'display only');
    },
    'T-07':async t =>
    {
        await t.render(ANA,DEPENDS);
        await t.call('setName','Ana Popescu');
        await t.call('setDescription','Owner');
        await t.call('setCount',4);
        const now = await t.page.$eval(ROOT,element => ( { name:element.querySelector('.ui-badge-name').textContent, description:element.querySelector('.ui-badge-description').textContent.replace(/^,\s*/,''), marker:element.querySelector('.ui-notification-indicator')?.textContent, spoken:element.textContent.replace(/\s+/g,' ').trim() } ));
        t.equal([ now.name, now.description, now.marker ],[ 'Ana Popescu', 'Owner', '4' ],'changed in place');
        t.assert(now.spoken.includes('4 new'),`the spoken text follows (${now.spoken})`);
        await t.call('setDescription','');
        t.equal(await t.page.$(`${ROOT} .ui-badge-description`),null,'description removed');
        await t.call('setIndicator',null);
        t.equal(await t.page.$(`${ROOT} .ui-notification-indicator`),null,'marker removed');
    },
    'T-08':async t =>
    {
        await t.render({ ...ANA, href:'#me' },DEPENDS);
        const spoken = await t.page.evaluate(id => { const root = document.getElementById(id); const visible = node => !( node.parentElement?.closest('[aria-hidden="true"]') ); const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT); const parts = []; while ( walker.nextNode() ) { if ( visible(walker.currentNode) ) { parts.push(walker.currentNode.textContent); } } return parts.join('').replace(/\s+/g,' ').trim(); },ID);
        t.equal(spoken,'Ana Pop, Administrator, Online','one sentence');
    },
    'T-09':async t =>
    {
        await t.render({ ...ANA, colorToken:'--c-on-accent', descriptionColorToken:'--c-on-accent' },DEPENDS);
        const colours = await t.page.$eval(ROOT,element => [ getComputedStyle(element.querySelector('.ui-badge-name')).color, getComputedStyle(element.querySelector('.ui-badge-description')).color ]);
        const light = await colourOf(t,'--c-on-accent');
        t.equal(colours,[ light, light ],'own text colours');
    },
    'T-10':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '9rem'; });
        const long = { ...ANA, name:'Anastasia Popescu-Vasilescu' };
        await t.render({ ...long, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.$eval(`${ROOT} .ui-badge-name`,element => element.getAttribute('title')),null,'NONE');
        await t.call('destroy');
        await t.render({ ...long, href:'#me', tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(`${ROOT} .ui-badge-name`);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Anastasia')),`TOOLTIP shows the full name (${JSON.stringify(shown)})`);
    },
    'T-11':async t =>
    {
        t.equal(await t.render({ id:ID, name:'' },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[NAME_REQUIRED]')),'console error');
        await t.render(ANA,DEPENDS);
        await t.call('setName','');
        t.equal(await t.page.$eval(`${ROOT} .ui-badge-name`,element => element.textContent),'Ana Pop','setName("") keeps the previous name');
    },
    'T-12':async t =>
    {
        t.assert(await t.render({ id:ID, name:'Ana Pop', notification:{ indicator:{ kind:'COUNT', value:1 } } },DEPENDS),'rendered');
        t.equal(( await warnings(t,'NOTIFICATION_FAILED') ).length,1,'warning');
        t.equal([ await t.page.$(`${ROOT} .ui-notification`), await t.page.$eval(`${ROOT} .ui-badge-name`,element => element.textContent) ],[ null, 'Ana Pop' ],'text only');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, name:'Ana Pop', notification:{ text:'AP', size:'LARGE', clickable:true } },DEPENDS),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'size and clickable are set by Badge');
    }
};
