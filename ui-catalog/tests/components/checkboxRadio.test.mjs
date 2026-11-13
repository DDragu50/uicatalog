// checkboxRadio.test.mjs
//
// The "auto" cases of source/components-js/checkboxRadio/checkboxRadioTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs): t.render(config, { callbacks, args, stylesheets }), t.call(member, …), t.calls(name),
// t.messages(), t.page (Playwright), t.assert, t.equal. onValueChange is a render argument, so it is passed as a
// { $callback } value in args.

const ID = 'delivery';
const GROUP = `#${ID}`;
const ERROR = `#${ID}-error`;
const RECORD = { stylesheets:[ 'chip' ], args:[ { $callback:'onValueChange' } ] };
const OPTIONS = [ { value:'post', label:'Post' }, { value:'courier', label:'Courier' }, { value:'pickup', label:'Pick-up point' } ];
const BASE = { id:ID, groupLabel:'Delivery', options:OPTIONS };
const option = index => `label[for="${ID}-option-${index}"]`;
const input = index => `#${ID}-option-${index}`;
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const errors = async t => ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
const shownError = t => t.page.$eval(ERROR,element => ( element.hidden ? '' : element.textContent.trim() ));
const tops = t => t.page.$$eval(`${GROUP} .ui-checkbox-radio-option`,items => items.map(item => Math.round(item.getBoundingClientRect().top)));
const look = ( t, index ) => t.page.$eval(option(index),element => ( { background:getComputedStyle(element.querySelector('.ui-chip') ?? element).backgroundColor, weight:Number(getComputedStyle(element.querySelector('.ui-checkbox-radio-option-label') ?? element).fontWeight) } ));

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ ...BASE, selectionMode:'SINGLE' },RECORD);
        t.equal(await t.page.getAttribute(input(0),'type'),'radio','single choice uses radio buttons');
        await t.page.click(option(0));
        await t.page.click(option(1));
        t.equal(await t.call('getValue'),[ 'courier' ],'the previous option is cleared');
        t.equal(await t.page.isChecked(input(0)),false,'Post no longer selected');
        t.equal(( await t.calls('onValueChange') ).map(call => call.args),[ [ [ 'post' ], `instance(${ID})` ], [ [ 'courier' ], `instance(${ID})` ] ],'one report per change');
    },
    'T-02':async t =>
    {
        await t.render(BASE,RECORD);
        t.equal(await t.page.getAttribute(input(0),'type'),'checkbox','multiple choice (the default) uses checkboxes');
        await t.page.click(option(0));
        await t.page.click(option(2));
        await t.page.click(option(0));
        t.equal(await t.call('getValue'),[ 'pickup' ],'selected and cleared');
        t.equal(( await t.calls('onValueChange') ).map(call => call.args[0]),[ [ 'post' ], [ 'post', 'pickup' ], [ 'pickup' ] ],'values in option order');
        t.equal(await t.call('isDirty'),true,'isDirty()');
    },
    'T-03':async t =>
    {
        const icon = index => t.page.$eval(`${option(index)} .ui-checkbox-radio-icon i`,element => element.className);
        await t.render({ ...BASE, selectionMode:'SINGLE', presentation:'ICON' },RECORD);
        await t.page.click(option(1));
        t.equal([ await icon(0), await icon(1) ],[ 'fa-regular fa-circle', 'fa-regular fa-circle-check' ],'circles for single choice');
        await t.call('destroy');
        await t.render({ ...BASE, presentation:'ICON', iconVariant:'REGULAR_SOLID' },RECORD);
        await t.page.click(option(1));
        t.equal([ await icon(0), await icon(1) ],[ 'fa-regular fa-square', 'fa-solid fa-square-check' ],'squares for multiple choice, filled when selected');
        const size = async iconSize =>
        {
            await t.call('destroy');
            await t.render({ ...BASE, presentation:'ICON', iconSize },RECORD);
            return t.page.$eval(`${option(0)} .ui-checkbox-radio-icon`,element => parseFloat(getComputedStyle(element).fontSize));
        };
        const sizes = [ await size('SMALL'), await size('MEDIUM'), await size('LARGE') ];
        t.assert(sizes[0] < sizes[1] && sizes[1] < sizes[2],`icon sizes ${sizes.join(' < ')}`);
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, presentation:'CHIP', direction:'HORIZONTAL' },RECORD);
        await t.page.click(option(1));
        const chips = await t.page.$$eval(`${GROUP} .ui-chip`,items => items.map(item => ( { background:getComputedStyle(item).backgroundColor, check:Boolean(item.querySelector('.fa-check')) } )));
        t.equal(chips.map(chip => chip.check),[ false, true, false ],'check mark on the selected chip');
        t.assert(chips[1].background !== chips[0].background,`tinted background (${chips[1].background} / ${chips[0].background})`);
    },
    'T-05':async t =>
    {
        await t.render({ ...BASE, selectionMode:'SINGLE', presentation:'SEGMENTED' },RECORD);
        await t.page.click(option(1));
        t.equal(new Set(await tops(t)).size,1,'one row');
        const [ plain, selected ] = [ await look(t,0), await look(t,1) ];
        t.assert(selected.background !== plain.background,`selected segment filled (${selected.background})`);
        t.assert(selected.weight > plain.weight,`selected segment in bold (${selected.weight} > ${plain.weight})`);
        const gaps = await t.page.$$eval(`${GROUP} .ui-checkbox-radio-option`,items => items.slice(1).map(( item, index ) => Math.round(item.getBoundingClientRect().left - items[index].getBoundingClientRect().right)));
        t.assert(gaps.every(gap => gap <= 2),`joined segments (gaps ${gaps.join(', ')})`);
    },
    'T-06':async t =>
    {
        await t.render(BASE,RECORD);
        const vertical = await tops(t);
        t.assert(vertical[0] < vertical[1] && vertical[1] < vertical[2],'vertical list by default');
        await t.call('destroy');
        await t.render({ ...BASE, direction:'HORIZONTAL' },RECORD);
        t.equal(new Set(await tops(t)).size,1,'side by side');
        await t.call('destroy');
        await t.page.evaluate(() => { document.querySelector('#host').style.inlineSize = '12rem'; });
        await t.render({ ...BASE, direction:'HORIZONTAL' },RECORD);
        t.assert(new Set(await tops(t)).size > 1,'wraps when space runs out');
        t.assert(await t.page.$eval('#host',element => element.scrollWidth <= element.clientWidth),'nothing sticks out');
    },
    'T-07':async t =>
    {
        await t.render({ ...BASE, options:[ OPTIONS[0], { ...OPTIONS[1], selected:true }, { ...OPTIONS[2], selected:true } ] },RECORD);
        t.equal(await t.call('getValue'),[ 'courier', 'pickup' ],'starts selected');
        t.equal([ await t.page.isChecked(input(0)), await t.page.isChecked(input(1)), await t.page.isChecked(input(2)) ],[ false, true, true ],'shown selected');
        t.equal(( await t.calls('onValueChange') ).length,0,'no report for the initial selection');
    },
    'T-08':async t =>
    {
        await t.render({ ...BASE, options:[ OPTIONS[0], { ...OPTIONS[1], selected:true, disabled:true }, OPTIONS[2] ] },RECORD);
        await t.page.click(option(1),{ force:true });
        t.equal(await t.call('getValue'),[ 'courier' ],'the unavailable option keeps its selection');
        t.equal(( await t.calls('onValueChange') ).length,0,'no report');
        await t.call('destroy');
        await t.render({ ...BASE, disabled:true },RECORD);
        t.equal(await t.page.$$eval(`${GROUP} input`,items => items.every(item => item.matches(':disabled'))),true,'the whole list is unavailable');
        await t.page.click(option(0),{ force:true });
        t.equal(await t.call('getValue'),[],'nothing changes');
    },
    'T-09':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#before').tabIndex = 0; document.querySelector('#after').tabIndex = 0; });
        await t.render(BASE,RECORD);
        await t.page.focus('#before');
        for ( let step = 0; step < 4; step += 1 ) { await t.page.keyboard.press('Tab'); }
        t.equal(await shownError(t),'','tabbing through shows nothing');
        await t.page.click(option(0));
        await t.page.click(option(0));
        await t.page.click('#after');
        t.equal(await shownError(t),'Select an option.','error after leaving an emptied list');
        const colours = await t.page.evaluate(id => [ getComputedStyle(document.getElementById(`${id}-label`)).color, getComputedStyle(document.getElementById(`${id}-error`)).color ],ID);
        t.equal(colours[0],colours[1],'group title in the error colour');
        t.equal(await t.page.getAttribute(input(0),'aria-invalid'),'true','options marked invalid');
        t.equal(( await t.call('getError') ).errorLabel,'REQUIRED_SELECTION','getError()');
        await t.page.click(option(2));
        t.equal(await shownError(t),'','cleared when the user selects an option');
        await t.call('destroy');
        await t.render(BASE,RECORD);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED_SELECTION' },'validate() on an empty required list');
    },
    'T-10':async t =>
    {
        await t.render({ ...BASE, options:[ { ...OPTIONS[0], selected:true }, OPTIONS[1], OPTIONS[2] ] },RECORD);
        t.equal(await t.call('setError','Courier is not available today.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await shownError(t),'Courier is not available today.','shown');
        await t.page.click(option(1));
        t.equal(await shownError(t),'','removed when the user changes the selection');
        await t.call('setError','Again.');
        await t.call('clearError');
        t.equal(await shownError(t),'','clearError()');
    },
    'T-11':async t =>
    {
        t.equal(await t.render({ ...BASE, options:[] },RECORD),null,'no options');
        t.equal(await t.render({ ...BASE, options:[ { label:'Post' } ] },RECORD),null,'option without value');
        t.equal(await t.render({ ...BASE, options:[ { value:'post' } ] },RECORD),null,'option without label');
        t.equal(await errors(t),[ 'OPTIONS_REQUIRED', 'OPTION_VALUE_REQUIRED', 'OPTION_LABEL_REQUIRED' ],'labels');
    },
    'T-12':async t =>
    {
        t.equal(await t.render({ ...BASE, selectionMode:'SINGLE', options:OPTIONS.map(item => ( { ...item, selected:true } )) },RECORD),null,'two starting selections in a single-choice list');
        t.equal(await t.render({ id:ID, options:OPTIONS },RECORD),null,'required list without title');
        t.equal(await errors(t),[ 'MULTIPLE_INITIAL_SELECTION', 'GROUP_LABEL_REQUIRED' ],'labels');
    },
    'T-13':async t =>
    {
        t.assert(await t.render({ ...BASE, options:[ ...OPTIONS, { value:'post', label:'Post again' } ] },RECORD),'rendered');
        t.equal(( await warnings(t,'DUPLICATE_OPTION_VALUE') ).length,1,'duplicate warning');
        t.equal(await t.page.$$eval(`${GROUP} .ui-checkbox-radio-option`,items => items.length),3,'the duplicate is dropped');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, mandatory:false, options:OPTIONS },RECORD),'optional list without title rendered');
        t.equal(( await warnings(t,'GROUP_LABEL_MISSING') ).length,1,'missing title warning');
    },
    'T-14':async t =>
    {
        t.assert(await t.render({ ...BASE, iconSize:'LARGE' },RECORD),'standard look rendered');
        await t.call('destroy');
        t.assert(await t.render({ ...BASE, presentation:'SEGMENTED', direction:'VERTICAL' },RECORD),'segmented rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    }
};
