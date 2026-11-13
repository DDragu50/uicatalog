// copyArea.test.mjs
//
// The "auto" cases of source/components-js/copyArea/copyAreaTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs): t.render(config, { callbacks, stylesheets }), t.call(member, …), t.calls(name),
// t.messages(), t.clipboardText(), t.clipboardHTML(), t.refuseClipboard(), t.page (Playwright), t.assert, t.equal.

const ID = 'area';
const BUTTON = `#${ID}-copy`;
const CODE = '#area pre.ui-copy-area-body';
const DEPENDS = { stylesheets:[ 'button', 'tooltip' ] };
const CODE_TEXT = 'first line\n    second line, indented';

// Clicks the Copy button and gives the clipboard a moment.
async function copy( t ) { await t.page.click(BUTTON); await t.wait(150); }

// Renders sample content into a CopyArea.
const contentArea = ( html, extra = {} ) => ( { id:ID, label:'Reply', content:{ $html:html }, ...extra } );

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, text:CODE_TEXT },DEPENDS);
        t.equal(await t.page.textContent(`${CODE} code`),CODE_TEXT,'shown code');
        t.assert(await t.page.$eval('#area',element => element.classList.contains('ui-copy-area-code')),'code box class');
        const font = await t.page.$eval(CODE,element => getComputedStyle(element).fontFamily);
        const bodyFont = await t.page.$eval('body',element => getComputedStyle(element).fontFamily);
        t.assert(font !== bodyFont,`code font differs from the text font (${font})`);
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, text:'a\nb\nc', lineNumbers:true },DEPENDS);
        t.equal(await t.page.$$eval('#area .ui-copy-area-line',lines => lines.length),3,'numbered lines');
        const selected = await t.page.evaluate(() => { const range = document.createRange(); range.selectNodeContents(document.querySelector('#area code')); getSelection().removeAllRanges(); getSelection().addRange(range); return getSelection().toString(); });
        t.equal(selected,'a\nb\nc','selection without numbers');
    },
    'T-03':async t =>
    {
        await t.render({ id:ID, text:Array.from({ length:60 },( _, index ) => `line ${index + 1}`).join('\n') },DEPENDS);
        const box = await t.page.$eval(CODE,element => ( { scroll:element.scrollHeight, client:element.clientHeight, overflow:getComputedStyle(element).overflowY, tab:element.tabIndex } ));
        t.assert(box.scroll > box.client && [ 'auto', 'scroll' ].includes(box.overflow),`scrolls (${JSON.stringify(box)})`);
        t.equal(box.tab,0,'reachable with Tab');
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, textStyle:'PLAIN', text:'#100482' },DEPENDS);
        const layout = await t.page.evaluate(() =>
        {
            const root = document.querySelector('#area'), text = root.querySelector('.ui-copy-area-text').getBoundingClientRect(), button = document.querySelector('#area-copy').getBoundingClientRect();
            return { tag:root.localName, sameLine:button.top < text.bottom && button.bottom > text.top, after:button.left >= text.right - 1 };
        });
        t.equal(layout,{ tag:'span', sameLine:true, after:true },'plain value layout');
    },
    'T-05':async t =>
    {
        await t.render(contentArea('<p>Hello,</p><ol><li>Open <a href="https://example.com/account">your account</a>.</li><li>Choose <strong>Security</strong>.</li></ol><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">Hidden note</span><button type="button">Inner button</button>'),DEPENDS);
        await copy(t);
        const html = await t.clipboardHTML(), text = await t.clipboardText();
        t.assert(/<ol>/.test(html) && /<a href="https:\/\/example.com\/account">/.test(html) && /<strong>Security<\/strong>/.test(html),`formatted copy: ${html}`);
        t.assert(/1\. Open your account\./.test(text) && /2\. Choose Security\./.test(text),`plain copy with numbers: ${JSON.stringify(text)}`);
        t.assert(!/Hidden note|Inner button/.test(html + text),'hidden text and controls left out');
    },
    'T-06':async t =>
    {
        await t.render(contentArea('<p>Reply</p><p data-copy="skip">Internal note</p><p>Regards</p>'),DEPENDS);
        await copy(t);
        t.assert(!( await t.clipboardText() ).includes('Internal note'),'skipped part left out');
        await t.call('destroy');
        await t.render(contentArea('<p>Sales, Q3</p><table data-copy="only"><tr><th>Region</th><th>Orders</th></tr><tr><td>North</td><td>12</td></tr></table>'),DEPENDS);
        await copy(t);
        const text = await t.clipboardText();
        t.assert(!text.includes('Sales, Q3') && /Region\tOrders/.test(text) && /North\t12/.test(text),`only the table: ${JSON.stringify(text)}`);
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, textStyle:'PLAIN', text:'sk_live_••••3f9a', copyValue:'sk_live_51HqJ2xKq7Lm3f9a' },DEPENDS);
        await copy(t);
        t.equal(await t.clipboardText(),'sk_live_51HqJ2xKq7Lm3f9a','copied value');
    },
    'T-08':async t =>
    {
        await t.render({ id:ID, text:'old text' },DEPENDS);
        await t.call('setText','new text');
        t.equal(await t.page.textContent(`${CODE} code`),'new text','shown after setText');
        await copy(t);
        t.equal(await t.clipboardText(),'new text','copied after setText');
        await t.call('setCopyValue','value');
        await copy(t);
        t.equal(await t.clipboardText(),'value','copied after setCopyValue');
        await t.call('setCopyValue',null);
        await copy(t);
        t.equal(await t.clipboardText(),'new text','copied after setCopyValue(null)');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, text:CODE_TEXT },DEPENDS);
        await copy(t);
        t.equal(await t.clipboardText(),CODE_TEXT,'clipboard');
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, text:'npm install ui-catalog' },DEPENDS);
        await t.page.focus(CODE);
        await t.page.keyboard.press('Tab');
        t.equal(await t.page.evaluate(() => document.activeElement.id),`${ID}-copy`,'focus on the Copy button');
        await t.page.keyboard.press('Enter');
        await t.wait(200);
        const copied = await t.page.$eval(BUTTON,element => ( { name:element.getAttribute('aria-label'), check:Boolean(element.querySelector('.fa-check')), focused:document.activeElement === element } ));
        t.equal(copied,{ name:'Copied', check:true, focused:true },'after copying');
        await t.wait(2100);
        t.equal(await t.page.$eval(BUTTON,element => element.getAttribute('aria-label')),'Copy','after two seconds');
    },
    'T-11':async t =>
    {
        await t.render({ id:ID, text:'x' },DEPENDS);
        await copy(t);
        t.equal(( await t.page.textContent('#area .ui-copy-area-status') ).trim(),'Copied','status region');
    },
    'T-12':async t =>
    {
        await t.render({ id:ID, text:'abc' },{ ...DEPENDS, callbacks:[ 'onCopy' ] });
        await copy(t);
        const calls = await t.calls('onCopy');
        t.equal(calls.length,1,'onCopy calls');
        t.equal(calls[0].args,[ { copied:true, text:'abc' }, `instance(${ID})` ],'onCopy arguments');
    },
    'T-13':async t =>
    {
        await t.render({ id:ID, text:'npm install ui-catalog' },{ ...DEPENDS, callbacks:[ 'onCopy' ] });
        await t.refuseClipboard();
        await copy(t);
        const message = 'Couldn\'t copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.';
        t.equal(await t.page.$eval('#area .ui-copy-area-message',element => element.hidden ? '' : element.textContent),message,'visible message');
        t.equal(( await t.page.textContent('#area .ui-copy-area-status') ).trim(),message,'announced');
        t.equal(await t.page.evaluate(() => getSelection().toString()),'npm install ui-catalog','content selected');
        t.equal(( await t.call('getError') ).errorLabel,'COPY_FAILED','getError()');
        const calls = await t.calls('onCopy');
        t.equal(calls[0]?.args[0],{ copied:false, text:'npm install ui-catalog', errorLabel:'COPY_FAILED' },'onCopy result');
    },
    'T-14':async t =>
    {
        await t.render({ id:ID, textStyle:'PLAIN', text:'RO49 AAAA 1B31', copyValue:'RO49AAAA1B31' },DEPENDS);
        await t.refuseClipboard();
        await copy(t);
        t.assert(( await t.page.textContent('#area .ui-copy-area-message') ).includes('RO49AAAA1B31'),'value in the message');
        t.equal(await t.page.evaluate(() => getSelection().toString()),'RO49AAAA1B31','value selected');
    },
    'T-15':async t =>
    {
        await t.render({ id:ID, text:'abc' },DEPENDS);
        const original = await t.page.evaluate(() => { window.keep = { write:navigator.clipboard.write, writeText:navigator.clipboard.writeText }; return true; });
        t.assert(original,'clipboard kept');
        await t.refuseClipboard();
        await copy(t);
        await t.page.evaluate(() => { navigator.clipboard.write = window.keep.write; navigator.clipboard.writeText = window.keep.writeText; });
        await copy(t);
        t.equal(await t.page.$eval('#area .ui-copy-area-message',element => element.hidden),true,'message hidden');
        t.equal(await t.call('getError'),null,'getError()');
    },
    'T-16':async t =>
    {
        await t.render({ id:ID, text:'abc', copyButton:'TEXT' },DEPENDS);
        t.equal(( await t.page.textContent(BUTTON) ).trim(),'Copy','label before');
        await copy(t);
        t.equal(( await t.page.textContent(BUTTON) ).trim(),'Copied','label after');
    },
    'T-17':async t =>
    {
        await t.render({ id:ID, text:'npm install ui-catalog', label:'Install command' },DEPENDS);
        t.equal(await t.page.getAttribute(CODE,'aria-label'),'Install command','region name');
        const description = await t.page.$eval(BUTTON,element => ( element.getAttribute('aria-describedby') ?? '' ).split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' '));
        t.assert(description.includes('Install command'),`button description: ${description}`);
    },
    'T-18':async t =>
    {
        await t.render({ id:ID, text:'abc', tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(BUTTON,'title'),'Copy','TITLE');
        await t.call('destroy');
        await t.render({ id:ID, text:'abc', tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(BUTTON,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ id:ID, text:'abc', tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(BUTTON);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Copy')),`TOOLTIP shows "Copy" (${JSON.stringify(shown)})`);
    },
    'T-19':async t =>
    {
        t.equal(await t.render({ id:ID },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && /^CopyArea "area" \[CONTENT_REQUIRED\]: /.test(message.text)),'console error');
    },
    'T-20':async t =>
    {
        await t.render({ id:ID, text:'shown?', content:{ $html:'<p>Content wins</p>' } },DEPENDS);
        t.assert(( await t.page.textContent('#area') ).includes('Content wins'),'content shown');
        t.assert(( await t.messages() ).some(message => message.level === 'warning' && message.text.includes('[OPTIONS_CONFLICT]')),'warning');
    },
    'T-21':async t =>
    {
        await t.render({ id:ID, text:'abc', textStyle:'PLAIN', lineNumbers:true },DEPENDS);
        await t.call('destroy');
        await t.render({ id:ID, text:'abc', copyButton:'TEXT', tooltipMode:'TOOLTIP' },DEPENDS);
        await t.call('destroy');
        await t.render(contentArea('<p>Kept</p>'),DEPENDS);
        await t.call('setText','ignored');
        t.assert(( await t.page.textContent('#area') ).includes('Kept'),'content kept');
        const warnings = ( await t.messages() ).filter(message => message.text.includes('[OPTION_IGNORED]'));
        t.equal(warnings.length,3,'three OPTION_IGNORED warnings');
    },
    'T-22':async t =>
    {
        await t.render({ id:ID, text:'shown', copyValue:{ secret:true } },DEPENDS);
        await copy(t);
        t.equal(await t.clipboardText(),'shown','shown text copied');
        t.assert(( await t.messages() ).some(message => message.level === 'warning' && message.text.includes('[INVALID_OPTION]') && message.text.includes('copyValue')),'warning');
    }
};
