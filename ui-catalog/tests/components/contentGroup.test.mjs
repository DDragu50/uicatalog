// contentGroup.test.mjs
//
// The "auto" cases of source/components-js/contentGroup/contentGroupTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). Children are the third render argument: strings (static HTML) go through args as they
// are; mount() renders with real functions when a case needs child instances.

const ID = 'address';
const ROOT = `#${ID}`;
const FIELDS = [ '<label for="street">Street</label> <input id="street">', '<label for="city">City</label> <input id="city">', '<label for="zip">Postal code</label> <input id="zip">' ];
const items = t => t.page.$$eval(`${ROOT} .ui-content-group-item`,list => list.map(item => { const rect = item.getBoundingClientRect(); return { top:Math.round(rect.top), left:Math.round(rect.left) }; }));
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const rows = list => new Set(list.map(item => item.top)).size;

// Renders a group whose children are created by real functions (source evaluated in the page).
async function mount( t, configSource, childrenSource )
{
    return t.page.evaluate(async ( [ config, children, id ] ) =>
    {
        const href = '/source/components-js/contentGroup/contentGroup.css';
        if ( !document.querySelector(`link[href="${href}"]`) ) { document.head.appendChild(Object.assign(document.createElement('link'),{ rel:'stylesheet', href })); }
        const { renderContentGroup } = await import('/source/components-js/contentGroup/contentGroupIndex.js');
        window.destroyed = [];
        window.harness.instance = renderContentGroup(document.querySelector('#host'),{ id, ...new Function(`return (${config});`)() },new Function('renderContentGroup',`return (${children});`)(renderContentGroup));
        return window.harness.instance ? id : null;
    },[ configSource, childrenSource, ID ]);
}

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, label:'Address' },{ args:[ FIELDS ] });
        const notch = await t.page.$eval(ROOT,element => { const legend = element.querySelector('legend'), frame = element.getBoundingClientRect(), rect = legend.getBoundingClientRect(); return { text:legend.textContent, onBorder:rect.top < frame.top + 2 && rect.bottom > frame.top }; });
        t.equal(notch,{ text:'Address', onBorder:true },'the label sits in a gap of the top border');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, semantic:'SECTION', title:'Delivery', headingLevel:2, description:'Where we bring the parcel.' },{ args:[ [ '<p>Monday to Friday.</p>' ] ] });
        const section = await t.page.$eval(ROOT,element => ( { tag:element.localName, heading:element.querySelector('h2')?.textContent, name:document.getElementById(element.getAttribute('aria-labelledby'))?.textContent, description:document.getElementById(element.getAttribute('aria-describedby'))?.textContent } ));
        t.equal(section,{ tag:'section', heading:'Delivery', name:'Delivery', description:'Where we bring the parcel.' },'a named section with its heading and description');
    },
    'T-03':async t =>
    {
        await t.render({ id:ID, label:'Address', description:'As on your ID card.' },{ args:[ FIELDS ] });
        t.equal(await t.page.$eval(ROOT,element => document.getElementById(element.getAttribute('aria-describedby'))?.textContent),'As on your ID card.','the description describes the group');
    },
    'T-04':async t =>
    {
        const border = async bordered => { await t.render({ id:ID, label:'Address', bordered },{ args:[ FIELDS ] }); const style = await t.page.$eval(ROOT,element => [ getComputedStyle(element).borderTopWidth, getComputedStyle(element).paddingLeft ]); await t.call('destroy'); return style; };
        const [ framed, plain ] = [ await border(true), await border(false) ];
        t.assert(parseFloat(framed[0]) > 0 && parseFloat(plain[0]) === 0,`with or without a border (${framed[0]} / ${plain[0]})`);
        t.assert(parseFloat(framed[1]) > parseFloat(plain[1]),'no padding without the border');
    },
    'T-05':async t =>
    {
        await mount(t,`{ label:'Address' }`,`[ '<p class="static">Static text</p>', ( host, group ) => { host.innerHTML = '<label for="street">Street</label> <input id="street">'; return { id:'child-1', destroy:() => window.destroyed.push('child-1') }; }, ( host ) => { host.innerHTML = '<ul><li>One</li></ul>'; return null; } ]`);
        const content = await t.page.$eval(ROOT,element => [ ...element.querySelectorAll('.ui-content-group-item') ].map(item => item.firstElementChild?.localName));
        t.equal(content,[ 'p', 'label', 'ul' ],'static text, an input and a list, in order');
        t.equal(await t.call('getChildren'),[ 'instance(child-1)' ],'child instances kept');
        await t.call('destroy');
        t.equal(await t.page.evaluate(() => [ window.destroyed, document.querySelector('#host').innerHTML ]),[ [ 'child-1' ], '' ],'children destroyed with the group');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, label:'Address' },{ args:[ FIELDS ] });
        const vertical = await items(t);
        t.assert(vertical[0].top < vertical[1].top && vertical[1].top < vertical[2].top,'vertical by default');
        await t.call('destroy');
        await t.render({ id:ID, label:'Address', direction:'HORIZONTAL' },{ args:[ FIELDS ] });
        t.equal(rows(await items(t)),1,'side by side');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '30rem'; });
        await t.render({ id:ID, label:'Address', direction:'HORIZONTAL' },{ args:[ [ ...FIELDS, ...FIELDS.map(field => field.replace(/"(street|city|zip)"/g,'"$1-2"')) ] ] });
        t.assert(rows(await items(t)) > 1,'wraps when space runs out');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '18rem'; });
        await t.render({ id:ID, label:'Address', direction:'HORIZONTAL' },{ args:[ FIELDS ] });
        const narrow = await items(t);
        t.equal([ rows(narrow), new Set(narrow.map(item => item.left)).size ],[ 3, 1 ],'one below the other in a narrow place');
    },
    'T-07':async t =>
    {
        await mount(t,`{ label:'Customer' }`,`[ ( host ) => renderContentGroup(host,{ id:'inner', label:'Address' },[ '<label for="street">Street</label> <input id="street">' ]) ]`);
        t.equal(await t.page.evaluate(() => document.querySelector('#inner').parentElement.closest('.ui-content-group')?.id),ID,'a group inside a group');
        t.equal(( await warnings(t,'FIELDSET_WITHOUT_CONTROLS') ).length,0,'the outer group sees the inputs of the inner one');
    },
    'T-08':async t =>
    {
        await t.page.evaluate(() => { const host = document.querySelector('#host'); host.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);'; });
        await t.render({ id:ID, label:'Address', span:2 },{ args:[ FIELDS ] });
        const widths = await t.page.evaluate(id => [ document.getElementById(id).getBoundingClientRect().width, document.querySelector('#host').getBoundingClientRect().width ],ID);
        t.assert(Math.abs(widths[0] - widths[1] / 2) < 4,`two of four columns (${widths.join(' / ')})`);
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, label:'Address', disabled:true },{ args:[ FIELDS ] });
        t.equal(await t.page.$$eval(`${ROOT} input`,inputs => inputs.map(input => input.matches(':disabled'))),[ true, true, true ],'every input inside disabled at once');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, label:'Address' },{ args:[ FIELDS ] });
        const group = await t.page.$eval(ROOT,element => [ element.localName, element.querySelector(':scope > legend').textContent ]);
        t.equal(group,[ 'fieldset', 'Address' ],'a group of inputs named "Address"');
    },
    'T-11':async t =>
    {
        t.assert(await t.render({ id:ID, semantic:'SECTION', disabled:true, label:'Notes' },{ args:[ [ '<p>Text</p>' ] ] }),'section rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Address', title:'Address' },{ args:[ FIELDS ] }),'fieldset rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    },
    'T-12':async t =>
    {
        t.assert(await t.render({ id:ID },{ args:[ FIELDS ] }),'rendered');
        t.equal(( await warnings(t,'NAME_MISSING') ).length,1,'a group without a name');
    },
    'T-13':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Address' },{ args:[ [ FIELDS[0], 42 ] ] }),'rendered');
        t.equal(( await warnings(t,'INVALID_CHILD') ).length,1,'warning');
        t.equal(await t.page.$$eval(`${ROOT} .ui-content-group-item`,list => list.length),1,'the invalid child is ignored');
    },
    'T-14':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Address' },{ args:[ [ '<p>No inputs here.</p>' ] ] }),'rendered');
        t.equal(( await warnings(t,'FIELDSET_WITHOUT_CONTROLS') ).length,1,'a fieldset without inputs');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Delivery' },{ args:[ [ '<fieldset><legend>Speed</legend><input type="radio" name="s" id="s1"><label for="s1">Fast</label></fieldset>' ] ] }),'rendered');
        t.equal(( await warnings(t,'REDUNDANT_GROUP') ).length,1,'all inputs in one nested fieldset');
    }
};
