// toggle.test.mjs
//
// The "auto" cases of source/components-js/toggle/toggleTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onValueChange and onValidation are render arguments, passed as { $callback } values.

const ID = 'news';
const SWITCH = `#${ID}`;
const RECORD = { args:[ { $callback:'onValueChange' }, { $callback:'onValidation' } ] };
const changes = async t => ( await t.calls('onValueChange') ).map(call => call.args[0]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const shownError = t => t.page.$eval(`#${ID}-error`,element => ( element.hidden ? '' : element.textContent.trim() ));
const radio = key => `#${ID}-${key}`;
const option = key => `label[for="${ID}-${key}"]`;

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, label:'Newsletter' },RECORD);
        t.equal(await t.page.getAttribute(SWITCH,'role'),'switch','a switch');
        await t.page.click(SWITCH);
        t.equal(await t.page.isChecked(SWITCH),true,'on after a click');
        await t.page.focus(SWITCH);
        await t.page.keyboard.press('Space');
        t.equal(await t.page.isChecked(SWITCH),false,'off after Space');
        t.equal(await changes(t),[ true, false ],'each change reported');
        t.equal(( await t.calls('onValueChange') )[0].args[1],`instance(${ID})`,'with the instance');
        t.equal([ await t.call('getValue'), await t.call('isDirty') ],[ false, true ],'getValue(), isDirty()');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, label:'Newsletter' },RECORD);
        const look = () => t.page.$eval(SWITCH,element => { const root = element.closest('.ui-toggle'); const knob = root.querySelector('.ui-toggle-knob').getBoundingClientRect(), track = root.querySelector('.ui-toggle-track'); return { text:root.querySelector('.ui-toggle-state').textContent.trim(), knob:Math.round(knob.left), colour:getComputedStyle(track).backgroundColor }; });
        const off = await look();
        await t.page.click(SWITCH);
        await t.wait(300);
        const on = await look();
        t.equal([ off.text, on.text ],[ 'Off', 'On' ],'state text');
        t.assert(on.knob > off.knob && on.colour !== off.colour,`knob moves and colour changes (${JSON.stringify([ off, on ])})`);
        await t.call('destroy');
        await t.render({ id:ID, label:'Newsletter', stateText:'CUSTOM', texts:{ customOn:'Yes', customOff:'No' } },RECORD);
        t.equal(await t.page.$eval(`${SWITCH} ~ * .ui-toggle-state, .ui-toggle-state`,element => element.textContent.trim()),'No','own pair');
    },
    'T-03':async t =>
    {
        await t.render({ id:ID, label:'Newsletter', stateDisplay:'BOTH' },RECORD);
        const sides = () => t.page.$$eval('.ui-toggle-side',items => items.map(item => ( { text:item.textContent.trim(), weight:Number(getComputedStyle(item).fontWeight) } )));
        const [ offSide, onSide ] = await sides();
        t.equal([ offSide.text, onSide.text ],[ 'Off', 'On' ],'Off – switch – On');
        t.assert(offSide.weight > onSide.weight,'the active value emphasized');
        await t.page.click('.ui-toggle-side-on');
        t.equal([ await t.page.isChecked(SWITCH), await changes(t) ],[ true, [ true ] ],'clicking a value selects it');
        await t.page.click('.ui-toggle-side-on');
        t.equal(await changes(t),[ true ],'clicking the active value changes nothing');
    },
    'T-04':async t =>
    {
        const measure = async ( size, extra = {} ) => { await t.render({ id:ID, label:'Newsletter', size, ...extra },RECORD); const result = await t.page.$eval('.ui-toggle-track',element => ( { height:element.getBoundingClientRect().height, colour:getComputedStyle(element).backgroundColor } )); await t.call('destroy'); return result; };
        const small = await measure('SMALL'), medium = await measure('MEDIUM');
        t.assert(small.height < medium.height,`two sizes (${small.height} < ${medium.height})`);
        const own = await measure('MEDIUM',{ offBackgroundToken:'--c-danger' });
        const danger = await t.page.evaluate(() => { const probe = document.createElement('span'); probe.style.color = 'var(--c-danger)'; document.body.appendChild(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; });
        t.equal(own.colour,danger,'own off colour from the design system');
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, label:'Newsletter' },RECORD);
        await t.call('setBusy',true);
        t.equal(await t.page.getAttribute(SWITCH,'aria-busy'),'true','busy');
        await t.page.click(SWITCH,{ force:true });
        t.equal([ await t.page.isChecked(SWITCH), await changes(t) ],[ false, [] ],'no change while busy');
        await t.call('setBusy',false);
        await t.page.click(SWITCH);
        t.equal(await changes(t),[ true ],'changes again after the busy state');
        await t.call('setValue',false);
        t.equal([ await t.page.isChecked(SWITCH), await changes(t) ],[ false, [ true ] ],'the App changes it back without a report');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO' },RECORD);
        const options = await t.page.$$eval(`#${ID} .ui-toggle-option`,items => items.map(item => ( { text:item.textContent.trim(), type:item.querySelector('input').type, top:Math.round(item.getBoundingClientRect().top) } )));
        t.equal(options.map(item => [ item.text, item.type ]),[ [ 'On', 'radio' ], [ 'Off', 'radio' ] ],'two radio buttons "On" / "Off"');
        t.equal(options[0].top,options[1].top,'side by side');
        t.equal([ await t.page.isChecked(radio('on')), await t.page.isChecked(radio('off')), await t.call('getValue') ],[ false, false, null ],'nothing selected at first');
        await t.call('destroy');
        await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO', direction:'VERTICAL', stateText:'CUSTOM', texts:{ customOn:'Yes', customOff:'No' } },RECORD);
        const stacked = await t.page.$$eval(`#${ID} .ui-toggle-option`,items => items.map(item => [ item.textContent.trim(), Math.round(item.getBoundingClientRect().top) ]));
        t.assert(stacked[0][0] === 'Yes' && stacked[1][0] === 'No' && stacked[1][1] > stacked[0][1],`own pair, stacked (${JSON.stringify(stacked)})`);
        await t.page.click(option('off'));
        t.equal([ await t.call('getValue'), await changes(t) ],[ false, [ false ] ],'an answer');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO' },RECORD);
        t.equal(await t.call('validate'),{ valid:false, errorLabel:'REQUIRED' },'validate() without an answer');
        t.equal(await shownError(t),'Select an answer.','message');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:false, errorLabel:'REQUIRED' },'onValidation');
        await t.page.click(option('on'));
        t.equal(await shownError(t),'','cleared when the user chooses an answer');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:true, errorLabel:null },'onValidation reports the change');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, label:'Newsletter', state:'VIEW', value:true },RECORD);
        t.equal(await t.page.$eval('.ui-toggle-view-value',element => element.textContent.trim()),'On','value as text');
        await t.call('destroy');
        await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO', state:'VIEW', value:null },RECORD);
        t.equal(await t.page.$eval('.ui-toggle-view-value',element => element.textContent.trim()),'—','no answer');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO', value:true },RECORD);
        t.equal(await t.call('setError','Not allowed for this account.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await shownError(t),'Not allowed for this account.','shown');
        await t.page.click(option('off'));
        t.equal(await shownError(t),'','removed when the user changes the value');
        await t.call('setError','Again.');
        await t.call('clearError');
        t.equal(await shownError(t),'','clearError()');
    },
    'T-10':async t =>
    {
        // Internal fallback: no public way leads to an unknown label, so the error function itself is asked.
        const error = await t.page.evaluate(async () =>
        {
            const { getToggleError } = await import('/source/components-js/toggle/toggleErrors.js');
            const { mergeToggleConfig } = await import('/source/components-js/toggle/toggleConfig.js');
            return getToggleError('NOT_A_LABEL',mergeToggleConfig({ id:'x', label:'X' }));
        });
        t.equal([ error.errorLabel, error.message, error.visibility ],[ 'UNIDENTIFIED', 'An unidentified error occurred.', 'dismissible' ],'fallback');
    },
    'T-11':async t =>
    {
        t.equal(await t.render({ id:ID, label:'' },RECORD),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && message.text.includes('[LABEL_REQUIRED]')),'console error');
    },
    'T-12':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Newsletter', direction:'VERTICAL' },RECORD),'switch rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Do you agree?', presentation:'RADIO', size:'SMALL' },RECORD),'radio rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,2,'two warnings');
    },
    'T-13':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Newsletter', stateText:'CUSTOM', texts:{ customOn:'Yes' } },RECORD),'rendered');
        t.equal(( await warnings(t,'CUSTOM_TEXTS_MISSING') ).length,1,'warning');
        t.equal(await t.page.$eval('.ui-toggle-state',element => element.textContent.trim()),'Off','falls back to On / Off');
    }
};
