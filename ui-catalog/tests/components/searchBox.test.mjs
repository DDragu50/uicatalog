// searchBox.test.mjs
//
// The "auto" cases of source/components-js/searchBox/searchBoxTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onSearch is the third render argument (a { $callback } value in args); onInput is set in
// the configuration through callbacks.

const ID = 'find';
const INPUT = `#${ID}-input`;
const DEPENDS = { stylesheets:[ 'button', 'checkboxRadio', 'chip', 'message', 'tooltip' ] };
const RECORD = { ...DEPENDS, args:[ { $callback:'onSearch' } ], callbacks:[ 'onInput' ] };
const BASE = { id:ID, label:'Search customers' };
const SCOPES = [ { value:'all', label:'All fields' }, { value:'name', label:'Name', description:'Searches first and last names.' }, { value:'company', label:'Company' } ];
const searches = async t => ( await t.calls('onSearch') ).map(call => call.args[0]);
const help = t => t.page.$eval(`#${ID}-help`,element => element.textContent.trim());
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ ...BASE, debounceMs:200 },RECORD);
        await t.page.click(INPUT);
        await t.page.keyboard.type('acme');
        t.equal(await searches(t),[],'nothing while typing');
        await t.wait(400);
        t.equal(await searches(t),[ { query:'acme', scopes:[] } ],'reported after a short pause');
        t.equal(( await t.calls('onSearch') )[0].args[1],`instance(${ID})`,'with the instance');
        t.equal(( await t.calls('onInput') ).map(call => call.args[0]),[ 'a', 'ac', 'acm', 'acme' ],'onInput on every edit');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, searchMode:'ON_DEMAND', showSearchButton:true },RECORD);
        await t.page.fill(INPUT,'acme');
        await t.wait(500);
        t.equal(await searches(t),[],'on request: nothing while typing');
        await t.page.click(`#${ID}-submit`);
        await t.page.fill(INPUT,'beta');
        await t.page.press(INPUT,'Enter');
        t.equal(( await searches(t) ).map(item => item.query),[ 'acme', 'beta' ],'the Search button and Enter');
        await t.call('destroy');
        await t.render({ ...BASE, debounceMs:2000 },RECORD);
        await t.page.fill(INPUT,'gamma');
        await t.page.press(INPUT,'Enter');
        t.equal(( await searches(t) ).at(-1).query,'gamma','Enter in while-typing mode too');
    },
    'T-03':async t =>
    {
        await t.render({ ...BASE, searchMode:'ON_DEMAND' },RECORD);
        await t.page.fill(INPUT,'  acme  ');
        await t.page.press(INPUT,'Enter');
        await t.page.press(INPUT,'Enter');
        await t.page.fill(INPUT,'acme ');
        await t.page.press(INPUT,'Enter');
        t.equal(await searches(t),[ { query:'acme', scopes:[] } ],'spaces removed; the same search not repeated');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, minLength:3, debounceMs:0 },RECORD);
        await t.page.fill(INPUT,'ac');
        await t.page.press(INPUT,'Enter');
        t.equal([ await searches(t), await help(t) ],[ [], 'Type at least 3 characters.' ],'too short: no search, a hint');
        await t.page.fill(INPUT,'acm');
        await t.page.press(INPUT,'Enter');
        t.equal(( await searches(t) ).map(item => item.query),[ 'acm' ],'long enough');
    },
    'T-05':async t =>
    {
        await t.page.evaluate(() => { const host = document.querySelector('#host'); const form = document.createElement('form'); form.addEventListener('submit',event => { event.preventDefault(); window.submits = ( window.submits ?? 0 ) + 1; }); host.replaceWith(form); form.appendChild(host); });
        await t.render({ ...BASE, searchMode:'ON_DEMAND' },RECORD);
        await t.page.fill(INPUT,'acme');
        await t.page.press(INPUT,'Enter');
        t.equal([ await t.page.evaluate(() => window.submits ?? 0), ( await searches(t) ).length ],[ 0, 1 ],'Enter searches and does not submit the form');
    },
    'T-06':async t =>
    {
        await t.render({ ...BASE, help:'Name, company or e-mail.', placeholder:'e.g. Acme' },RECORD);
        const field = await t.page.evaluate(id => { const input = document.getElementById(`${id}-input`); return { label:document.querySelector(`label[for="${id}-input"]`)?.textContent, placeholder:input.placeholder, help:( input.getAttribute('aria-describedby') ?? '' ).split(' ').map(ref => document.getElementById(ref)?.textContent.trim()).filter(Boolean).join(' ') }; },ID);
        t.equal(field,{ label:'Search customers', placeholder:'e.g. Acme', help:'Name, company or e-mail.' },'label, hint and placeholder');
        await t.call('destroy');
        await t.render({ ...BASE, labelVisible:false },RECORD);
        t.equal(await t.page.$eval(`label[for="${INPUT.slice(1)}"]`,element => element.getBoundingClientRect().width <= 1),true,'the label can be visually hidden');
    },
    'T-07':async t =>
    {
        await t.render({ ...BASE, debounceMs:0 },RECORD);
        const clear = `#${ID}-clear`;
        t.equal(await t.page.$eval(`#${ID} .ui-search-box-clear-host`,element => element.hidden),true,'no clear button while empty');
        await t.page.fill(INPUT,'acme');
        await t.wait(50);
        t.equal(await t.page.getAttribute(clear,'aria-label'),'Clear search','"×" as soon as there is text');
        await t.page.click(clear);
        t.equal([ await t.page.inputValue(INPUT), await t.page.evaluate(id => document.activeElement.id,ID) ],[ '', `${ID}-input` ],'cleared, the cursor stays in the field');
        await t.page.fill(INPUT,'beta');
        await t.wait(50);
        await t.page.press(INPUT,'Escape');
        t.equal(await t.page.inputValue(INPUT),'','Escape clears too');
        t.equal(( await searches(t) ).map(item => item.query),[ 'acme', '', 'beta', '' ],'each change reported');
    },
    'T-08':async t =>
    {
        await t.render(BASE,RECORD);
        await t.call('setBusy',true);
        t.equal(await t.page.evaluate(id => [ !document.querySelector(`#${id} .ui-search-box-busy-icon`).hidden, document.getElementById(id).getAttribute('aria-busy') ?? document.getElementById(`${id}-input`).getAttribute('aria-busy') ],ID),[ true, 'true' ],'a busy indicator at the end of the field');
        await t.call('setMessage','No results for "xyz".');
        await t.wait(50);
        t.equal(await t.page.$eval(`#${ID} .ui-search-box-message-host`,element => element.textContent.trim()),'No results for "xyz".','a message under the field');
        await t.call('setMessage',null);
        t.equal(await t.page.$eval(`#${ID} .ui-search-box-message-host`,element => element.textContent.trim()),'','removed');
    },
    'T-09':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.page.getAttribute(INPUT,'autocomplete'),'off','no browser suggestions by default');
        await t.call('destroy');
        await t.render({ ...BASE, autocomplete:'on' },RECORD);
        t.equal(await t.page.getAttribute(INPUT,'autocomplete'),'on','the browser\'s suggestions when chosen');
    },
    'T-10':async t =>
    {
        const widths = {};
        for ( const width of [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ] )
        {
            await t.render({ ...BASE, width },RECORD);
            widths[width] = await t.page.$eval(INPUT,element => element.getBoundingClientRect().width);
            await t.call('destroy');
        }
        t.assert(widths.SMALL < widths.MEDIUM && widths.MEDIUM < widths.LARGE && widths.LARGE < widths.FULL,`widths ${JSON.stringify(widths)}`);
        await t.render({ ...BASE, width:'FIT_CONTENT' },RECORD);
        t.assert(await t.page.$eval(INPUT,element => element.getBoundingClientRect().width) < widths.FULL,'fitted to the content');
    },
    'T-11':async t =>
    {
        await t.render({ ...BASE, scopes:SCOPES, defaultScope:'company', debounceMs:0 },RECORD);
        const chips = await t.page.$$eval(`#${ID}-scope .ui-checkbox-radio-option`,items => items.map(item => [ item.textContent.trim(), item.querySelector('input').checked ]));
        t.equal(chips,[ [ 'All fields', false ], [ 'Name', false ], [ 'Company', true ] ],'the scopes, the default selected');
        await t.page.fill(INPUT,'acme');
        await t.wait(50);
        await t.page.click(`label[for="${ID}-scope-option-1"]`);
        t.equal(await help(t),'Searches first and last names.','the scope\'s hint');
        t.equal(( await searches(t) ).at(-1),{ query:'acme', scopes:[ 'name' ] },'the current search reported again with the new scope');
        t.equal(await t.call('getValue'),{ query:'acme', scopes:[ 'name' ] },'getValue()');
    },
    'T-12':async t =>
    {
        const look = async extra => { await t.render({ ...BASE, showSearchButton:true, ...extra },RECORD); const result = await t.page.$eval(`#${ID}-submit`,element => ( { classes:element.className, text:element.textContent.trim(), name:element.getAttribute('aria-label'), icon:Boolean(element.querySelector('.fa-magnifying-glass')) } )); await t.call('destroy'); return result; };
        const primary = await look({}), secondary = await look({ searchButtonHierarchy:'SECONDARY' }), tertiary = await look({ searchButtonHierarchy:'TERTIARY' });
        t.assert(/primary/.test(primary.classes) && /secondary/.test(secondary.classes) && /tertiary/.test(tertiary.classes),'primary, secondary or tertiary');
        t.equal([ primary.text, primary.icon ],[ 'Search', false ],'the text "Search"');
        const withIcon = await look({ searchButtonIcon:true }), iconOnly = await look({ searchButtonVariant:'ICON_BUTTON' });
        t.equal([ withIcon.text, withIcon.icon ],[ 'Search', true ],'with a magnifying glass before it');
        t.equal([ iconOnly.text, iconOnly.name, iconOnly.icon ],[ '', 'Search', true ],'the magnifying glass only');
    },
    'T-13':async t =>
    {
        const config = { ...BASE, showSearchButton:true, searchButtonVariant:'ICON_BUTTON' };
        await t.render({ ...config, tooltipMode:'TITLE' },RECORD);
        t.equal(await t.page.getAttribute(`#${ID}-submit`,'title'),'Search','TITLE');
        await t.call('destroy');
        await t.render(config,RECORD);
        t.equal(await t.page.getAttribute(`#${ID}-submit`,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ ...config, tooltipMode:'TOOLTIP' },RECORD);
        await t.page.hover(`#${ID}-submit`);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Search')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-14':async t =>
    {
        t.equal(await t.render({ id:ID, label:'' },RECORD),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[LABEL_REQUIRED]')),'console error');
    },
    'T-15':async t =>
    {
        t.assert(await t.render({ ...BASE, searchMode:'ON_DEMAND', debounceMs:100, scopes:[ ...SCOPES, { value:'x' }, { value:'name', label:'Again' } ], defaultScope:'nope' },RECORD),'rendered');
        const counts = {};
        for ( const label of [ 'OPTION_IGNORED', 'INVALID_SCOPE', 'DUPLICATE_SCOPE_VALUE', 'UNKNOWN_SCOPE' ] ) { counts[label] = ( await warnings(t,label) ).length; }
        t.equal(counts,{ OPTION_IGNORED:1, INVALID_SCOPE:1, DUPLICATE_SCOPE_VALUE:1, UNKNOWN_SCOPE:1 },'one warning each');
        t.equal(( await t.call('getValue') ).scopes,[ 'all' ],'the first scope is used');
    }
};
