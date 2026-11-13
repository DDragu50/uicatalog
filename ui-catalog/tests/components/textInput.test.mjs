// textInput.test.mjs
//
// The "auto" cases of source/components-js/textInput/textInputTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs): t.render(config, { callbacks, args, stylesheets }), t.call(member, …), t.calls(name),
// t.messages(), t.page (Playwright), t.assert, t.equal. onValueChange and onValidation are render arguments, so they
// are passed as { $callback } values in args.

const ID = 'city';
const FIELD = `#${ID}`;
const ERROR = `#${ID}-error`;
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const RECORD = { ...DEPENDS, args:[ { $callback:'onValueChange' }, { $callback:'onValidation' } ] };
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const shownError = t => t.page.$eval(ERROR,element => ( element.hidden ? '' : element.textContent.trim() ));
const blur = t => t.page.click('#after');

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, label:'City' },RECORD);
        await t.page.click(FIELD);
        await t.page.keyboard.type('Ias');
        await t.page.keyboard.insertText('i');
        const calls = await t.calls('onValueChange');
        t.equal(calls.length,4,'one call per change (typed and pasted)');
        t.equal(calls[3].args,[ 'Iasi', `instance(${ID})` ],'value and instance');
        t.equal(await t.call('getValue'),'Iasi','getValue()');
        t.equal(await t.call('isDirty'),true,'isDirty()');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, label:'City', placeholder:'e.g. Iasi', help:'Where the parcel goes.' },DEPENDS);
        const field = await t.page.evaluate(id =>
        {
            const input = document.getElementById(id);
            return { label:document.querySelector(`label[for="${id}"]`)?.textContent.trim(), placeholder:input.placeholder, help:( input.getAttribute('aria-describedby') ?? '' ).split(' ').map(ref => document.getElementById(ref)?.textContent.trim()).join(' ') };
        },ID);
        t.equal(field,{ label:'City', placeholder:'e.g. Iasi', help:'Where the parcel goes.' },'label, placeholder, help');
    },
    'T-03':async t =>
    {
        const types = {};
        for ( const type of [ 'TEXT', 'EMAIL', 'PASSWORD', 'URL', 'TEL', 'NUMBER' ] )
        {
            await t.render({ id:ID, label:'Value', type },DEPENDS);
            types[type] = await t.page.getAttribute(FIELD,'type');
            await t.call('destroy');
        }
        t.equal(types,{ TEXT:'text', EMAIL:'email', PASSWORD:'password', URL:'url', TEL:'tel', NUMBER:'number' },'native types');
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, label:'Code', mandatory:false, errorVisibilityDuration:400, validation:{ enabled:true, minLength:3, maxLength:5 } },RECORD);
        await t.page.click(FIELD);
        await t.page.keyboard.type('abcdefg');
        t.equal(await t.page.inputValue(FIELD),'abcde','characters beyond the maximum removed');
        t.equal(await shownError(t),'Maximum 5 characters.','short message');
        await t.wait(700);
        t.equal(await shownError(t),'','the message disappears after errorVisibilityDuration');
        await t.page.fill(FIELD,'ab');
        await blur(t);
        t.equal(await shownError(t),'Minimum 3 characters.','minimum length on blur');
        const error = await t.call('getError');
        t.equal([ error.errorLabel, error.message, error.visibility ],[ 'MIN_LENGTH', 'Minimum 3 characters.', 'corrective' ],'getError()');
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, label:'Quantity', type:'NUMBER', validation:{ enabled:true, numberType:'INTEGER', minValue:1, maxValue:10 } },DEPENDS);
        const label = async value => ( await t.call('setValue',value) ).errorLabel;
        t.equal([ await label('2.5'), await label('0'), await label('11'), await label('4') ],[ 'INTEGER_REQUIRED', 'MIN_VALUE', 'MAX_VALUE', null ],'integer, minimum, maximum, valid');
        await t.call('setValue','0');
        t.equal(await shownError(t),'Minimum value is 1.','message with the limit');
        await t.call('destroy');
        await t.render({ id:ID, label:'Price', type:'NUMBER', validation:{ enabled:true } },DEPENDS);
        t.equal(( await t.call('setValue','1e') ).errorLabel,'INVALID_NUMBER','not a number');
        t.equal(await shownError(t),'Enter a valid number.','its message');
    },
    'T-06':async t =>
    {
        const look = () => t.page.$eval(FIELD,element => ( { step:element.getAttribute('step'), spinner:!element.classList.contains('ui-text-input-number-no-spinner') } ));
        await t.render({ id:ID, label:'Boxes', type:'NUMBER', validation:{ enabled:true, numberType:'INTEGER', step:5 } },DEPENDS);
        t.equal(await look(),{ step:'5', spinner:true },'step buttons for whole numbers in steps of 5');
        await t.call('destroy');
        await t.render({ id:ID, label:'Price', type:'NUMBER' },DEPENDS);
        t.equal(await look(),{ step:null, spinner:false },'no step buttons for decimal numbers');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, label:'Phone', type:'TEL', validation:{ enabled:true } },DEPENDS);
        t.equal(await t.page.$eval(FIELD,element => [ element.inputMode, element.autocomplete ]),[ 'tel', 'tel' ],'numeric keypad and phone autofill');
        await t.page.click(FIELD);
        await t.page.keyboard.type('+40 (721) 555-123');
        await blur(t);
        t.equal(await shownError(t),'','digits, spaces, "+", "-" and brackets are accepted');
        await t.page.fill(FIELD,'0721 abc');
        await blur(t);
        t.equal(await shownError(t),'Enter a valid phone number.','other characters are refused');
        t.equal(( await t.call('getError') ).errorLabel,'INVALID_PHONE','label');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, label:'Postal code', validation:{ enabled:true, pattern:'[0-9]{6}' }, texts:{ errors:{ PATTERN:'Enter the 6 digits of the postal code.' } } },DEPENDS);
        t.equal(( await t.call('setValue','70012') ).errorLabel,'PATTERN','5 digits');
        t.equal(await shownError(t),'Enter the 6 digits of the postal code.','own message');
        t.equal(( await t.call('setValue','700123') ).valid,true,'6 digits');
        t.equal(await shownError(t),'','error removed');
    },
    'T-09':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#before').tabIndex = 0; document.querySelector('#after').tabIndex = 0; });
        await t.render({ id:ID, label:'City' },RECORD);
        await t.page.focus('#before');
        await t.page.keyboard.press('Tab');
        await t.page.keyboard.press('Tab');
        t.equal(await shownError(t),'','tabbing through an untouched field shows nothing');
        await t.page.click(FIELD);
        await t.page.keyboard.type('a');
        await t.page.keyboard.press('Backspace');
        await blur(t);
        t.equal(await shownError(t),'Required.','empty mandatory field after a change');
        t.equal(await t.page.getAttribute(FIELD,'aria-invalid'),'true','aria-invalid');
        const results = ( await t.calls('onValidation') ).map(call => call.args[0]);
        t.equal(results.at(-1),{ valid:false, errorLabel:'REQUIRED' },'onValidation reports the result');
        await t.page.click(FIELD);
        await t.page.keyboard.type('Iasi');
        t.equal(await shownError(t),'','a visible error clears while typing');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:true, errorLabel:null },'onValidation reports the change');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, label:'Password', type:'PASSWORD' },DEPENDS);
        const toggle = `#${ID}-password-toggle`;
        const read = () => t.page.evaluate(( [ field, button ] ) => ( { type:document.querySelector(field).type, pressed:document.querySelector(button).getAttribute('aria-pressed'), name:document.querySelector(button).getAttribute('aria-label'), focus:document.activeElement.id } ),[ FIELD, toggle ]);
        t.equal(( await read() ).type,'password','hidden at first');
        await t.page.click(toggle);
        t.equal(await read(),{ type:'text', pressed:'true', name:'Hide password', focus:ID },'shown, focus back in the field');
        await t.page.click(`#${ID}-password-toggle`);
        t.equal(await read(),{ type:'password', pressed:'false', name:'Show password', focus:ID },'hidden again');
        await t.call('destroy');
        await t.render({ id:ID, label:'Password', type:'PASSWORD', passwordToggle:false },DEPENDS);
        t.equal(await t.page.$(toggle),null,'no button with passwordToggle:false');
    },
    'T-11':async t =>
    {
        await t.render({ id:ID, label:'City', iconArea:{ staticIcon:'fa-solid fa-location-dot' } },DEPENDS);
        t.equal(await t.page.$eval('.ui-text-input-static-icon',element => [ element.classList.contains('fa-location-dot'), element.getAttribute('aria-hidden') ]),[ true, 'true' ],'decorative icon');
    },
    'T-12':async t =>
    {
        await t.render({ id:ID, label:'Search', actions:[ { key:'search', label:'Search', icon:'fa-solid fa-magnifying-glass' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        const button = '.ui-text-input-action button';
        t.equal(await t.page.getAttribute(button,'aria-label'),'Search','icon button named by its label');
        await t.page.click(button);
        t.equal(( await t.calls('onAction') ).map(call => call.args),[ [ 'search', `instance(${ID})` ] ],'onAction with the key');
        t.equal(await t.call('setActionDisabled','search',true),true,'setActionDisabled()');
        await t.page.click(button,{ force:true });
        t.equal(( await t.calls('onAction') ).length,1,'a disabled action reports nothing');
    },
    'T-13':async t =>
    {
        const widths = {};
        for ( const width of [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ] )
        {
            await t.render({ id:ID, label:'City', width },DEPENDS);
            widths[width] = await t.page.$eval(FIELD,element => element.getBoundingClientRect().width);
            await t.call('destroy');
        }
        const host = await t.page.$eval('#host',element => element.getBoundingClientRect().width);
        t.assert(widths.SMALL < widths.MEDIUM && widths.MEDIUM < widths.LARGE && widths.LARGE <= widths.FULL,`widths ${JSON.stringify(widths)}`);
        t.assert(Math.abs(widths.FULL - host) < 2,`full width ${widths.FULL} / ${host}`);
        await t.render({ id:ID, label:'City', width:'FIT_CONTENT', value:'Iasi' },DEPENDS);
        t.assert(await t.page.$eval(FIELD,element => element.getBoundingClientRect().width) < widths.FULL,'fitted to the content');
    },
    'T-14':async t =>
    {
        const toggle = `#${ID}-password-toggle`;
        const field = { id:ID, label:'Password', type:'PASSWORD' };
        await t.render({ ...field, tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(toggle,'title'),'Show password','TITLE');
        await t.call('destroy');
        await t.render({ ...field, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(toggle,'title'),null,'NONE: no browser tooltip');
        await t.call('destroy');
        await t.render({ ...field, tooltipMode:'TOOLTIP' },DEPENDS);
        t.equal(await t.page.getAttribute(toggle,'title'),null,'TOOLTIP: no browser tooltip as well');
        await t.page.hover(toggle);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Show password')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-15':async t =>
    {
        await t.render({ id:ID, label:'User name', value:'dan' },RECORD);
        t.equal(await t.call('setError','This name is taken.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await shownError(t),'This name is taken.','shown');
        await t.page.click(FIELD);
        await t.page.keyboard.type('a');
        t.equal(await shownError(t),'','removed when the user changes the value');
        await t.call('setError','Taken again.');
        await t.call('clearError');
        t.equal(await shownError(t),'','clearError()');
    },
    'T-16':async t =>
    {
        // Internal fallback: no public way leads to an unknown label, so the error function itself is asked.
        const error = await t.page.evaluate(async () =>
        {
            const { getTextInputError } = await import('/source/components-js/textInput/textInputErrors.js');
            const { mergeTextInputConfig } = await import('/source/components-js/textInput/textInputConfig.js');
            return getTextInputError('NOT_A_LABEL',mergeTextInputConfig({ id:'x' }));
        });
        t.equal([ error.errorLabel, error.message, error.visibility ],[ 'UNIDENTIFIED', 'An unidentified error occurred.', 'dismissible' ],'fallback');
    },
    'T-17':async t =>
    {
        t.assert(await t.render({ id:ID, label:'City', iconArea:{ staticIcon:'fa-solid fa-<bad>' } },DEPENDS),'rendered');
        t.equal(( await warnings(t,'INVALID_ICON_CLASS') ).length,1,'warning');
    },
    'T-18':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Code', validation:{ enabled:true, minLength:10, maxLength:5 } },DEPENDS),'rendered');
        t.equal(( await warnings(t,'MIN_LENGTH_CLAMPED') ).length,1,'warning');
        t.equal(( await t.call('setValue','abcd') ).errorLabel,'MIN_LENGTH','minimum is now 5');
    },
    'T-19':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Password', type:'PASSWORD', iconArea:{ staticIcon:'fa-solid fa-key' } },DEPENDS),'password rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,1,'icon ignored in a password field');
        await t.call('destroy');
        await t.render({ id:ID, label:'Search', iconArea:{ staticIcon:'fa-solid fa-key' }, actions:[ { key:'search', label:'Search', icon:'fa-solid fa-magnifying-glass' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        t.equal(( await warnings(t,'OPTIONS_CONFLICT') ).length,1,'conflict warning');
        t.equal([ await t.page.$('.ui-text-input-static-icon'), Boolean(await t.page.$('.ui-text-input-action button')) ],[ null, true ],'the action is shown');
    },
    'T-20':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Code', validation:{ enabled:true, pattern:'[0-9' } },DEPENDS),'rendered');
        t.equal(( await warnings(t,'INVALID_PATTERN') ).length,1,'warning');
        t.equal(( await t.call('setValue','abc') ).valid,true,'pattern ignored');
    },
    'T-21':async t =>
    {
        await t.render({ id:ID, label:'Search', actions:[ { key:'search', icon:'fa-solid fa-magnifying-glass' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        t.equal(( await warnings(t,'INVALID_ACTION') ).length,1,'action without label dropped');
        t.equal(await t.page.$('.ui-text-input-action'),null,'no action button');
        await t.call('destroy');
        await t.render({ id:ID, label:'Search', actions:[ { key:'search', label:'Search', icon:'fa-solid fa-magnifying-glass' }, { key:'search', label:'Find', icon:'fa-solid fa-binoculars' } ] },{ ...DEPENDS, callbacks:[ 'onAction' ] });
        t.equal(( await warnings(t,'DUPLICATE_ACTION_KEY') ).length,1,'duplicate key dropped');
        t.equal(await t.page.getAttribute('.ui-text-input-action button','aria-label'),'Search','the first action stays');
    },
    'T-22':async t =>
    {
        await t.render({ id:ID, label:'Search', actions:[ { key:'search', label:'Search', icon:'fa-solid fa-magnifying-glass' } ] },DEPENDS);
        t.equal(( await warnings(t,'ACTION_HANDLER_MISSING') ).length,1,'warning without onAction');
        t.assert(await t.page.$eval('.ui-text-input-action button',element => element.disabled || element.getAttribute('aria-disabled') === 'true'),'the action is disabled');
        t.equal(await t.call('setActionDisabled','nope',true),false,'unknown key');
        t.equal(( await warnings(t,'UNKNOWN_ACTION') ).length,1,'warning for an unknown key');
    }
};
