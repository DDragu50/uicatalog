// textArea.test.mjs
//
// The "auto" cases of source/components-js/textArea/textAreaTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs): t.render(config, { callbacks, args, stylesheets }), t.call(member, …), t.calls(name),
// t.messages(), t.page (Playwright), t.assert, t.equal. onValueChange and onValidation are render arguments, so they
// are passed as { $callback } values in args.

const ID = 'notes';
const FIELD = `#${ID}`;
const ERROR = `#${ID}-error`;
const COUNTER = `#${ID}-counter`;
const RECORD = { args:[ { $callback:'onValueChange' }, { $callback:'onValidation' } ] };
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));
const shownError = t => t.page.$eval(ERROR,element => ( element.hidden ? '' : element.textContent.trim() ));
const blur = t => t.page.click('#after');
const height = t => t.page.$eval(FIELD,element => element.getBoundingClientRect().height);

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, label:'Notes' },RECORD);
        await t.page.click(FIELD);
        await t.page.keyboard.type('Line one');
        await t.page.keyboard.press('Enter');
        await t.page.keyboard.insertText('two');
        const calls = await t.calls('onValueChange');
        t.equal(calls.length,10,'one call per change (typed and pasted)');
        t.equal(calls.at(-1).args,[ 'Line one\ntwo', `instance(${ID})` ],'value and instance');
        t.equal(await t.call('getValue'),'Line one\ntwo','getValue()');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, label:'Notes', placeholder:'Anything we should know?', help:'Visible to the courier.' },{});
        const field = await t.page.evaluate(id =>
        {
            const area = document.getElementById(id);
            return { label:document.querySelector(`label[for="${id}"]`)?.textContent.trim(), placeholder:area.placeholder, help:( area.getAttribute('aria-describedby') ?? '' ).split(' ').map(ref => document.getElementById(ref)?.textContent.trim()).filter(Boolean).join(' ') };
        },ID);
        t.equal(field.label,'Notes','label');
        t.equal(field.placeholder,'Anything we should know?','placeholder');
        t.assert(field.help.includes('Visible to the courier.'),`help describes the field (${field.help})`);
    },
    'T-03':async t =>
    {
        await t.render({ id:ID, label:'Notes', state:'VIEW', value:'First line\nSecond line' },{});
        const view = await t.page.$eval('.ui-text-area-view-value',element => ( { lines:Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight)), text:element.textContent } ));
        t.equal(view,{ lines:2, text:'First line\nSecond line' },'two lines in the read-only view');
    },
    'T-04':async t =>
    {
        const word = 'x'.repeat(300);
        await t.render({ id:ID, label:'Notes', width:'SMALL', value:word },{});
        t.assert(await t.page.$eval(FIELD,element => element.scrollWidth <= element.clientWidth),'the field does not scroll sideways');
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', state:'VIEW', value:word },{});
        t.assert(await t.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),'the page does not widen');
    },
    'T-05':async t =>
    {
        const text = '<b>bold</b>  two  spaces';
        await t.render({ id:ID, label:'Notes', mandatory:false },{});
        await t.page.click(FIELD);
        await t.page.keyboard.insertText(text);
        t.equal(await t.call('getValue'),text,'kept exactly as typed');
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', state:'VIEW', value:text },{});
        t.equal(await t.page.$eval('.ui-text-area-view-value',element => [ element.textContent, element.children.length ]),[ text, 0 ],'shown as plain text');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, label:'Notes', mandatory:false, validation:{ enabled:true, maxLength:20 } },{});
        const counter = () => t.page.$eval(COUNTER,element => [ element.textContent.trim(), element.classList.contains('ui-text-area-counter-warning') ]);
        t.equal(await counter(),[ '20 characters left', false ],'at first');
        await t.page.click(FIELD);
        await t.page.keyboard.type('a'.repeat(16));
        t.equal(await counter(),[ '4 characters left', true ],'warning below 5');
        await t.page.keyboard.type('aaa');
        t.equal(await counter(),[ '1 character left', true ],'singular');
        const look = await t.page.$eval(COUNTER,element => ( { color:getComputedStyle(element).color, weight:Number(getComputedStyle(element).fontWeight) } ));
        const normal = await t.page.$eval('.ui-text-area-label',element => Number(getComputedStyle(element).fontWeight));
        t.assert(look.weight > 400 || look.weight > normal,`bold (${look.weight})`);
        t.assert(/^rgb\((\d+), (\d+), (\d+)\)$/.test(look.color) && Number(RegExp.$1) > Number(RegExp.$2) && Number(RegExp.$1) > Number(RegExp.$3),`red (${look.color})`);
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', mandatory:false, counterWarningThreshold:10, validation:{ enabled:true, maxLength:20 } },{});
        await t.page.click(FIELD);
        await t.page.keyboard.type('a'.repeat(11));
        t.equal(await counter(),[ '9 characters left', true ],'own threshold');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, label:'Notes', mandatory:false, errorVisibilityDuration:400, validation:{ enabled:true, maxLength:5 } },RECORD);
        await t.page.click(FIELD);
        await t.page.keyboard.insertText('abcdefg');
        t.equal(await t.page.inputValue(FIELD),'abcde','text beyond the maximum removed');
        t.equal(await shownError(t),'Maximum 5 characters.','short message');
        await t.wait(700);
        t.equal(await shownError(t),'','the message disappears');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, label:'Notes', validation:{ enabled:true, minLength:10 } },{});
        await t.page.click(FIELD);
        await t.page.keyboard.type('short');
        t.equal(await shownError(t),'','no new error while typing');
        await blur(t);
        t.equal(await shownError(t),'Minimum 10 characters.','checked on leaving');
        t.equal(( await t.call('getError') ).errorLabel,'MIN_LENGTH','getError()');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, label:'Notes' },RECORD);
        await t.page.click(FIELD);
        await t.page.keyboard.type('  ');
        await blur(t);
        t.equal(await shownError(t),'Required.','spaces only count as empty');
        t.equal(await t.page.getAttribute(FIELD,'aria-invalid'),'true','aria-invalid');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:false, errorLabel:'REQUIRED' },'onValidation');
        await t.page.click(FIELD);
        await t.page.keyboard.type('ok');
        t.equal(await shownError(t),'','cleared while typing');
        t.equal(( await t.calls('onValidation') ).at(-1).args[0],{ valid:true, errorLabel:null },'onValidation reports the change');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, label:'Notes', rows:2 },{});
        const two = await height(t);
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', rows:6 },{});
        const six = await height(t);
        t.assert(six > two * 2,`6 lines are taller than 2 (${two} / ${six})`);
    },
    'T-11':async t =>
    {
        await t.render({ id:ID, label:'Notes', mandatory:false, rows:2, autoGrow:true, maxRows:4 },{});
        const start = await height(t);
        await t.page.click(FIELD);
        await t.page.keyboard.insertText('1\n2\n3');
        await t.wait(50);
        const three = await height(t);
        await t.page.keyboard.insertText('\n4\n5\n6\n7');
        await t.wait(50);
        const seven = await height(t);
        t.assert(three > start,`grows with the text (${start} → ${three})`);
        t.assert(seven > three && seven < start * 2.5,`stops at 4 lines (${seven})`);
        t.assert(await t.page.$eval(FIELD,element => element.scrollHeight > element.clientHeight && getComputedStyle(element).overflowY === 'auto'),'then scrolls');
    },
    'T-12':async t =>
    {
        const resize = () => t.page.$eval(FIELD,element => getComputedStyle(element).resize);
        await t.render({ id:ID, label:'Notes' },{});
        t.equal(await resize(),'vertical','handle by default');
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', autoGrow:true },{});
        t.equal(await resize(),'none','no handle when the field grows by itself');
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', resize:'NONE' },{});
        t.equal(await resize(),'none','no handle with resize NONE');
    },
    'T-13':async t =>
    {
        const help = () => t.page.$eval(FIELD,element => [ element.spellcheck, element.getAttribute('autocomplete') ]);
        await t.render({ id:ID, label:'Notes' },{});
        t.equal(await help(),[ true, 'off' ],'spelling on, suggestions off by default');
        await t.call('destroy');
        await t.render({ id:ID, label:'Notes', spellcheck:false, autocomplete:'on' },{});
        t.equal(await help(),[ false, 'on' ],'spelling off, suggestions on');
    },
    'T-14':async t =>
    {
        const widths = {};
        for ( const width of [ 'SMALL', 'MEDIUM', 'LARGE', 'FULL' ] )
        {
            await t.render({ id:ID, label:'Notes', width },{});
            widths[width] = await t.page.$eval(FIELD,element => element.getBoundingClientRect().width);
            await t.call('destroy');
        }
        const host = await t.page.$eval('#host',element => element.getBoundingClientRect().width);
        t.assert(widths.SMALL < widths.MEDIUM && widths.MEDIUM < widths.LARGE && widths.LARGE <= widths.FULL,`widths ${JSON.stringify(widths)}`);
        t.assert(Math.abs(widths.FULL - host) < 2,`full width ${widths.FULL} / ${host}`);
    },
    'T-15':async t =>
    {
        await t.render({ id:ID, label:'Notes', value:'Leave at the door' },RECORD);
        t.equal(await t.call('setError','The courier cannot read this.'),{ valid:false, errorLabel:'EXTERNAL' },'setError()');
        t.equal(await shownError(t),'The courier cannot read this.','shown');
        await t.page.click(FIELD);
        await t.page.keyboard.type('.');
        t.equal(await shownError(t),'','removed when the user changes the value');
        await t.call('setError','Again.');
        await t.call('clearError');
        t.equal(await shownError(t),'','clearError()');
    },
    'T-16':async t =>
    {
        // Internal fallback: no public way leads to an unknown label, so the error function itself is asked.
        const error = await t.page.evaluate(async () =>
        {
            const { getTextAreaError } = await import('/source/components-js/textArea/textAreaErrors.js');
            const { mergeTextAreaConfig } = await import('/source/components-js/textArea/textAreaConfig.js');
            return getTextAreaError('NOT_A_LABEL',mergeTextAreaConfig({ id:'x' }));
        });
        t.equal([ error.errorLabel, error.message, error.visibility ],[ 'UNIDENTIFIED', 'An unidentified error occurred.', 'dismissible' ],'fallback');
    },
    'T-17':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Notes', autoGrow:true, resize:'VERTICAL' },{}),'auto-grow rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Notes', maxRows:8 },{}),'fixed field rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'Notes', counterWarningThreshold:3 },{}),'no validation rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,3,'three warnings');
    },
    'T-18':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Notes', validation:{ enabled:true, minLength:30, maxLength:20 } },{}),'rendered');
        t.equal(( await warnings(t,'MIN_LENGTH_CLAMPED') ).length,1,'warning');
        t.equal(( await t.call('setValue','a'.repeat(19)) ).errorLabel,'MIN_LENGTH','the minimum is now 20');
    },
    'T-19':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Notes', rows:6, autoGrow:true, maxRows:3 },{}),'rendered');
        t.equal(( await warnings(t,'MAX_ROWS_CLAMPED') ).length,1,'warning');
    }
};
