// select.test.mjs
//
// The "auto" cases of source/components-js/select/selectTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onValueChange and onValidation are render arguments, passed as { $callback } values.

const ID = 'country';
const FIELD = `#${ID}`;
const RECORD = { args:[ { $callback:'onValueChange' }, { $callback:'onValidation' } ] };
const OPTIONS = [
    { group:'Europe', options:[ { value:'ro', label:'Romania' }, { value:'at', label:'Austria' }, { value:'fr', label:'France' }, { value:'re', label:'Réunion' } ] },
    { group:'Americas', options:[ { value:'ca', label:'Canada' }, { value:'br', label:'Brazil', disabled:true } ] }
];
const FLAT = [ 'Romania', 'Austria', 'France', 'Réunion', 'Canada', 'Denmark', 'Estonia' ].map(label => ( { value:label.slice(0,2).toLowerCase(), label } ));
const BASE = { id:ID, label:'Country', options:OPTIONS };
const CUSTOM = { ...BASE, presentation:'CUSTOM', touchPresentation:'AS_CONFIGURED' };
const option = label => `#${ID}-listbox .ui-select-option:has(.ui-select-option-label:text-is("${label}"))`;
const changes = async t => ( await t.calls('onValueChange') ).map(call => call.args[0]);
const shownError = t => t.page.$eval(`#${ID}-error`,element => ( element.hidden ? '' : element.textContent.trim() ));
const open = t => t.page.click(FIELD);
const expanded = t => t.page.getAttribute(FIELD,'aria-expanded');
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
const colourOf = ( t, token ) => t.page.evaluate(name => { const probe = document.createElement('span'); probe.style.color = `var(${name})`; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; },token);

export const cases =
{
    'T-01':async t =>
    {
        await t.render(BASE,RECORD);
        const groups = await t.page.$$eval(`${FIELD} optgroup`,items => items.map(item => [ item.label, item.children.length ]));
        t.equal(groups,[ [ 'Europe', 4 ], [ 'Americas', 2 ] ],'options grouped under headings, in the browser\'s own dropdown');
        await t.call('destroy');
        await t.render(CUSTOM,RECORD);
        await open(t);
        t.equal(await t.page.$$eval(`#${ID}-listbox .ui-select-group-label`,items => items.map(item => item.textContent.trim())),[ 'Europe', 'Americas' ],'headings in the custom list');
    },
    'T-02':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.page.$eval(FIELD,element => element.options[element.selectedIndex].textContent.trim()),'Select an option','placeholder in the native field');
        await t.call('destroy');
        await t.render({ ...BASE, selectionMode:'MULTIPLE' },RECORD);
        t.equal(await t.page.$eval(FIELD,element => [ element.localName, element.multiple ]),[ 'select', true ],'multiple choice is a list box');
        await t.call('destroy');
        await t.render(CUSTOM,RECORD);
        t.equal(await t.page.$eval(`${FIELD} .ui-select-value`,element => element.textContent.trim()),'Select an option','placeholder in the custom field');
    },
    'T-03':async t =>
    {
        await t.render(BASE,RECORD);
        await t.page.selectOption(FIELD,'at');
        t.equal(( await t.calls('onValueChange') ).map(call => call.args),[ [ [ 'at' ], `instance(${ID})` ] ],'native: reported');
        await t.call('destroy');
        await t.render(CUSTOM,RECORD);
        await open(t);
        await t.page.click(option('France'));
        t.equal(( await changes(t) ).at(-1),[ 'fr' ],'custom: reported');
        t.equal([ await expanded(t), await t.call('getValue') ],[ 'false', [ 'fr' ] ],'single choice closes the list');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, mandatory:false },RECORD);
        await t.page.selectOption(FIELD,'ro');
        await t.page.selectOption(FIELD,'');
        t.equal(await changes(t),[ [ 'ro' ], [] ],'native: the empty option clears it');
        await t.call('destroy');
        await t.render({ ...CUSTOM, mandatory:false },RECORD);
        await open(t);
        await t.page.click(option('Romania'));
        await open(t);
        await t.page.click(`#${ID}-option-clear`);
        t.equal(( await changes(t) ).slice(-2),[ [ 'ro' ], [] ],'custom: "Clear selection" clears it');
    },
    'T-05':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.page.$eval(`${FIELD} option[value="br"]`,element => element.disabled),true,'native option disabled');
        await t.call('destroy');
        await t.render(CUSTOM,RECORD);
        await open(t);
        t.equal(await t.page.getAttribute(option('Brazil'),'aria-disabled'),'true','custom option disabled');
        await t.page.click(option('Brazil'),{ force:true });
        t.equal([ await t.call('getValue'), await changes(t) ],[ [], [] ],'cannot be chosen');
    },
    'T-06':async t =>
    {
        await t.render({ ...BASE, selectionMode:'MULTIPLE', showMultipleHint:true },RECORD);
        const hint = await t.page.evaluate(id => { const field = document.getElementById(id); const hint = document.getElementById(`${id}-hint`); return { text:hint?.textContent.trim(), linked:( field.getAttribute('aria-describedby') ?? '' ).includes(`${id}-hint`), below:hint.getBoundingClientRect().top >= field.getBoundingClientRect().bottom - 1 }; },ID);
        t.equal(hint,{ text:'Hold Ctrl or Cmd to select several.', linked:true, below:true },'hint below the list box');
    },
    'T-07':async t =>
    {
        await t.render(CUSTOM,RECORD);
        await open(t);
        const below = await t.page.evaluate(id => { const field = document.getElementById(id).getBoundingClientRect(), popup = document.getElementById(`${id}-popup`).getBoundingClientRect(); return [ document.getElementById(id).getAttribute('aria-expanded'), popup.top >= field.bottom - 1 ]; },ID);
        t.equal(below,[ 'true', true ],'opens below the field');
        await t.page.keyboard.press('Escape');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#before').style.marginBlockStart = `${window.innerHeight - 140}px`; });
        await t.render(CUSTOM,RECORD);
        await t.page.evaluate(id => document.getElementById(id).scrollIntoView({ block:'end' }),ID);
        await open(t);
        const above = await t.page.evaluate(id => document.getElementById(`${id}-popup`).getBoundingClientRect().bottom <= document.getElementById(id).getBoundingClientRect().top + 1,ID);
        t.assert(above,'opens above when there is no room below');
    },
    'T-08':async t =>
    {
        await t.page.evaluate(() => { const host = document.querySelector('#host'); host.style.cssText = 'overflow:hidden;block-size:120px;'; });
        await t.render(CUSTOM,RECORD);
        await open(t);
        const free = await t.page.evaluate(id => { const host = document.querySelector('#host').getBoundingClientRect(), popup = document.getElementById(`${id}-popup`); const rect = popup.getBoundingClientRect(); const hit = document.elementFromPoint(rect.left + rect.width / 2,rect.bottom - 6); return { outside:rect.bottom > host.bottom, onTop:popup.contains(hit) }; },ID);
        t.equal(free,{ outside:true, onTop:true },'the list shows over a clipping area');
    },
    'T-09':async t =>
    {
        await t.render({ ...CUSTOM, options:OPTIONS.map(group => ( { ...group, options:group.options.map(item => ( item.value === 'at' ? { ...item, selected:true } : item )) } )), optionSelectedBackgroundToken:'--c-success', optionHoverBackgroundToken:'--c-warning' },RECORD);
        await open(t);
        const read = label => t.page.$eval(option(label),element => ( { background:getComputedStyle(element).backgroundColor, check:getComputedStyle(element.querySelector('.ui-select-check')).borderBlockEndStyle, outline:getComputedStyle(element).outlineStyle } ));
        const chosen = await read('Austria');
        t.equal([ chosen.background, chosen.check ],[ await colourOf(t,'--c-success'), 'solid' ],'chosen option: own colour and a check mark');
        await t.page.hover(option('Canada'));
        t.equal(( await read('Canada') ).background,await colourOf(t,'--c-warning'),'option under the mouse: own colour');
        await t.page.keyboard.press('ArrowDown');
        const active = await t.page.evaluate(id => document.getElementById(document.getElementById(id).getAttribute('aria-activedescendant'))?.querySelector('.ui-select-option-label').textContent,ID);
        t.assert(active,'a keyboard position');
        t.assert(( await read(active) ).outline !== 'none','the keyboard position has an outline');
    },
    'T-10':async t =>
    {
        await t.render({ ...CUSTOM, options:FLAT, selectionMode:'MULTIPLE', width:'SMALL' },RECORD);
        await open(t);
        for ( const label of [ 'Romania', 'Austria', 'France', 'Canada', 'Denmark' ] ) { await t.page.click(option(label)); }
        t.equal(await expanded(t),'true','the list stays open while choosing several');
        t.equal(( await changes(t) ).length,5,'each choice reported');
        await t.page.keyboard.press('Escape');
        const closed = await t.page.$eval(FIELD,element => ( { value:element.querySelector('.ui-select-value').textContent.trim(), more:element.querySelector('.ui-select-more').textContent.trim(), full:element.querySelector('.ui-select-visually-hidden')?.textContent.trim() } ));
        t.assert(closed.value.startsWith('Romania') && /^\+\d$/.test(closed.more),`shortened: "${closed.value}" ${closed.more}`);
        t.assert(closed.full.includes('Denmark'),'the full value for screen readers');
    },
    'T-11':async t =>
    {
        await t.render({ ...CUSTOM, searchable:true },RECORD);
        await open(t);
        const shown = () => t.page.$$eval(`#${ID}-listbox .ui-select-option:not([hidden])`,items => items.map(item => item.textContent.trim()));
        await t.page.fill(`#${ID}-search`,'reu');
        t.equal(await shown(t),[ 'Réunion' ],'accents ignored');
        await t.page.fill(`#${ID}-search`,'AUS');
        t.equal(await shown(t),[ 'Austria' ],'upper and lower case ignored');
        await t.page.fill(`#${ID}-search`,'xyz');
        t.equal(await t.page.$eval(`#${ID}-listbox ~ .ui-select-no-matches, #${ID}-popup .ui-select-no-matches`,element => ( element.hidden ? '' : element.textContent.trim() )),'No matching options','nothing matches');
    },
    'T-12':async t =>
    {
        await t.render(CUSTOM,RECORD);
        await t.page.focus(FIELD);
        await t.page.keyboard.type('fr');
        const active = await t.page.evaluate(id => document.getElementById(document.getElementById(id).getAttribute('aria-activedescendant') ?? '')?.textContent.trim(),ID);
        t.equal(active,'France','the first letters move to the option');
    },
    'T-13':async t =>
    {
        const session = await t.page.context().newCDPSession(t.page);
        await session.send('Emulation.setTouchEmulationEnabled',{ enabled:true, maxTouchPoints:5 });
        await session.send('Emulation.setEmitTouchEventsForMouse',{ enabled:true });
        const coarse = await t.page.evaluate(() => matchMedia('(pointer: coarse)').matches);
        t.assert(coarse,'touch-first device emulated');
        await t.render({ ...BASE, presentation:'CUSTOM' },RECORD);
        t.equal(await t.page.$eval(FIELD,element => element.localName),'select','the device\'s own picker by default');
        await t.call('destroy');
        await t.render(CUSTOM,RECORD);
        t.equal(await t.page.$eval(FIELD,element => element.localName),'button','the custom list with AS_CONFIGURED');
    },
    'T-14':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED' },'validate() without a value');
        t.equal(await shownError(t),'Select an option.','message');
        t.equal(await t.page.getAttribute(FIELD,'aria-invalid'),'true','marked invalid');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:false, errorLabel:'REQUIRED' },'onValidation');
        await t.page.selectOption(FIELD,'ro');
        t.equal(await shownError(t),'','cleared by a choice');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:true, errorLabel:null },'onValidation reports the change');
    },
    'T-15':async t =>
    {
        const widths = {};
        for ( const width of [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ] )
        {
            await t.render({ ...BASE, width },RECORD);
            widths[width] = await t.page.$eval(FIELD,element => element.getBoundingClientRect().width);
            await t.call('destroy');
        }
        const host = await t.page.$eval('#host',element => element.getBoundingClientRect().width);
        t.assert(widths.SMALL < widths.MEDIUM && widths.MEDIUM < widths.LARGE && widths.LARGE <= widths.FULL,`widths ${JSON.stringify(widths)}`);
        t.assert(Math.abs(widths.FULL - host) < 2,`full width ${widths.FULL} / ${host}`);
    },
    'T-16':async t =>
    {
        await t.render({ ...BASE, options:[ { value:'ro', label:'Romania', selected:true }, { value:'at', label:'Austria' } ] },RECORD);
        t.equal(await t.call('setError','We do not ship there.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await shownError(t),'We do not ship there.','shown');
        await t.page.selectOption(FIELD,'at');
        t.equal(await shownError(t),'','removed when the user changes the value');
        await t.call('setError','Again.');
        await t.call('clearError');
        t.equal(await shownError(t),'','clearError()');
    },
    'T-17':async t =>
    {
        // Internal fallback: no public way leads to an unknown label, so the error function itself is asked.
        const error = await t.page.evaluate(async () =>
        {
            const { getSelectError } = await import('/source/components-js/select/selectErrors.js');
            const { mergeSelectConfig } = await import('/source/components-js/select/selectConfig.js');
            return getSelectError('NOT_A_LABEL',mergeSelectConfig({ id:'x', options:[ { value:'a', label:'A' } ] }));
        });
        t.equal([ error.errorLabel, error.message, error.visibility ],[ 'UNIDENTIFIED', 'An unidentified error occurred.', 'dismissible' ],'fallback');
    },
    'T-18':async t =>
    {
        t.equal(await t.render({ ...BASE, options:[] },RECORD),null,'no options');
        t.equal(await t.render({ ...BASE, options:[ { label:'Romania' } ] },RECORD),null,'option without value');
        t.equal(await t.render({ ...BASE, options:[ { value:'ro' } ] },RECORD),null,'option without label');
        t.equal(await t.render({ ...BASE, options:[ { value:'ro', label:'Romania', selected:true }, { value:'at', label:'Austria', selected:true } ] },RECORD),null,'two starting selections');
        t.equal(await errors(t),[ 'OPTIONS_REQUIRED', 'OPTION_VALUE_REQUIRED', 'OPTION_LABEL_REQUIRED', 'MULTIPLE_INITIAL_SELECTION' ],'labels');
    },
    'T-19':async t =>
    {
        t.assert(await t.render({ ...BASE, searchable:true, options:[ { value:'ro', label:'Romania' }, { value:'ro', label:'Romania again' } ] },RECORD),'rendered');
        t.equal([ ( await warnings(t,'OPTION_IGNORED') ).length, ( await warnings(t,'DUPLICATE_OPTION_VALUE') ).length ],[ 1, 1 ],'search ignored with NATIVE; duplicate dropped');
        t.equal(await t.page.$$eval(`${FIELD} option[value="ro"]`,items => items.length),1,'one Romania');
        await t.call('setValue',[ 'xx' ]);
        t.equal(( await warnings(t,'UNKNOWN_VALUE') ).length,1,'unknown value ignored');
        t.equal(await t.call('getValue'),[],'nothing selected');
    }
};
