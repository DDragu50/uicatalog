// button.test.mjs
//
// The "auto" cases of source/components-js/button/buttonTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs): t.render(config, { callbacks, stylesheets }), t.call(member, …), t.calls(name),
// t.messages(), t.page (Playwright), t.assert, t.equal.

const ID = 'save';
const BUTTON = `#${ID}`;
const DEPENDS = { stylesheets:[ 'tooltip' ] };
const hasWarning = async ( t, label ) => ( await t.messages() ).filter(message => message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ id:ID, label:'Save' },{ ...DEPENDS, callbacks:[ 'onClick' ] });
        await t.page.click(BUTTON);
        const calls = await t.calls('onClick');
        t.equal(calls.length,1,'onClick calls');
        t.equal(calls[0].args,[ 'Event(click)', `instance(${ID})` ],'onClick arguments');
    },
    'T-02':async t =>
    {
        await t.render({ id:ID, label:'Save' },{ ...DEPENDS, callbacks:[ 'onClick' ] });
        await t.page.focus(BUTTON);
        await t.page.keyboard.press('Enter');
        await t.page.keyboard.press('Space');
        t.equal(( await t.calls('onClick') ).length,2,'Enter and Space');
    },
    'T-03':async t =>
    {
        await t.page.evaluate(() =>
        {
            const host = document.querySelector('#host'), form = document.createElement('form');
            form.innerHTML = '<input id="field" value="first">';
            form.addEventListener('submit',event => { event.preventDefault(); window.submits = ( window.submits ?? 0 ) + 1; });
            host.replaceWith(form);
            form.appendChild(host);
        });
        await t.render({ id:ID, label:'Send', buttonType:'SUBMIT' },DEPENDS);
        await t.page.click(BUTTON);
        t.equal(await t.page.evaluate(() => window.submits),1,'submitted');
        await t.call('destroy');
        await t.render({ id:ID, label:'Reset', buttonType:'RESET' },DEPENDS);
        await t.page.fill('#field','changed');
        await t.page.click(BUTTON);
        t.equal(await t.page.inputValue('#field'),'first','reset');
    },
    'T-04':async t =>
    {
        await t.render({ id:ID, label:'Read more', href:'#target' },{ ...DEPENDS, callbacks:[ 'onClick' ] });
        t.equal(await t.page.$eval(BUTTON,element => [ element.localName, element.getAttribute('href') ]),[ 'a', '#target' ],'a link');
        await t.page.click(BUTTON);
        t.equal(( await t.calls('onClick') ).length,1,'onClick');
        t.assert(t.page.url().endsWith('#target'),`address ${t.page.url()}`);
    },
    'T-05':async t =>
    {
        await t.render({ id:ID, label:'Guide', href:'https://example.com/guide', target:'NEW_TAB' },DEPENDS);
        const link = await t.page.$eval(BUTTON,element => ( { target:element.getAttribute('target'), rel:element.getAttribute('rel'), icon:Boolean(element.querySelector('.ui-button-icon-new-tab')), hidden:element.querySelector('.ui-button-visually-hidden')?.textContent.trim() } ));
        t.equal(link.target,'_blank','target');
        t.assert(/noopener/.test(link.rel ?? ''),`rel ${link.rel}`);
        t.assert(link.icon,'new-tab icon');
        t.equal(link.hidden,'(opens in a new tab)','hidden text');
    },
    'T-06':async t =>
    {
        await t.render({ id:ID, label:'Orders', href:'#target' },{ ...DEPENDS, callbacks:[ 'onClick:preventDefault' ] });
        const before = t.page.url();
        await t.page.click(BUTTON);
        t.equal(( await t.calls('onClick') ).length,1,'onClick');
        t.equal(t.page.url(),before,'address unchanged');
    },
    'T-07':async t =>
    {
        await t.render({ id:ID, label:'Orders', href:'#target' },{ ...DEPENDS, callbacks:[ 'onClick' ] });
        const before = t.page.url();
        const opened = t.page.context().waitForEvent('page',{ timeout:3000 }).then(() => true,() => false);
        await t.page.click(BUTTON,{ modifiers:[ 'Control' ] });
        t.assert(await opened,'a new tab opened');
        t.equal(( await t.calls('onClick') ).length,0,'onClick not called');
        t.equal(t.page.url(),before,'address unchanged');
    },
    'T-08':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#host').style.fontSize = '20px'; });
        await t.render({ id:ID, label:'terms', hierarchy:'LINK', href:'#terms' },DEPENDS);
        const look = await t.page.$eval(BUTTON,element => ( { link:element.classList.contains('ui-button-link'), size:getComputedStyle(element).fontSize } ));
        t.equal(look,{ link:true, size:'20px' },'link look and size');
    },
    'T-09':async t =>
    {
        await t.render({ id:ID, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-trash', ariaLabel:'Delete' },DEPENDS);
        const button = await t.page.$eval(BUTTON,element => ( { name:element.getAttribute('aria-label'), text:element.textContent.trim(), radius:parseFloat(getComputedStyle(element).borderTopLeftRadius), height:element.getBoundingClientRect().height } ));
        t.equal([ button.name, button.text ],[ 'Delete', '' ],'name and no visible text');
        t.assert(button.radius >= button.height / 2 - 1,`circle (radius ${button.radius}, height ${button.height})`);
    },
    'T-10':async t =>
    {
        await t.render({ id:ID, label:'Next', iconBefore:'fa-solid fa-arrow-right', iconAfter:'fa-solid fa-chevron-right' },DEPENDS);
        const order = await t.page.$eval(BUTTON,element => [ ...element.children ].filter(child => !child.hidden).map(child => ( child.querySelector?.('i') || child.localName === 'i' || child.classList.contains('ui-button-icon') ? 'icon' : child.textContent.trim() || child.className )));
        t.equal(order.filter(item => item === 'icon' || item === 'Next'),[ 'icon', 'Next', 'icon' ],'order');
    },
    'T-11':async t =>
    {
        const heights = [];
        for ( const size of [ 'SMALL', 'MEDIUM', 'LARGE' ] )
        {
            await t.render({ id:ID, label:'Save', size },DEPENDS);
            heights.push(await t.page.$eval(BUTTON,element => element.getBoundingClientRect().height));
            await t.call('destroy');
        }
        t.assert(heights[0] < heights[1] && heights[1] < heights[2],`heights ${heights.join(' < ')}`);
        await t.render({ id:ID, label:'Save', width:'FULL' },DEPENDS);
        const widths = await t.page.evaluate(() => [ document.querySelector('#save').getBoundingClientRect().width, document.querySelector('#host').getBoundingClientRect().width ]);
        t.assert(Math.abs(widths[0] - widths[1]) < 1,`full width ${widths.join(' / ')}`);
        await t.call('destroy');
        const corner = () => t.page.$eval(BUTTON,element => parseFloat(getComputedStyle(element).borderTopLeftRadius));
        await t.render({ id:ID, label:'Save' },DEPENDS);
        t.equal(await corner(),0,'square corners by default');
        await t.call('destroy');
        await t.render({ id:ID, label:'Save', radius:'SMALL' },DEPENDS);
        const small = await corner();
        await t.call('destroy');
        await t.render({ id:ID, label:'Save', radius:'LARGE' },DEPENDS);
        const large = await corner();
        t.assert(small > 0 && large > small,`corners grow: small ${small}px, large ${large}px`);
        await t.call('destroy');
        await t.render({ id:ID, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-trash', ariaLabel:'Delete', iconButtonRadius:'NONE' },DEPENDS);
        t.equal(await corner(),0,'square icon button');
    },
    'T-12':async t =>
    {
        await t.render({ id:ID, label:'Save' },{ ...DEPENDS, callbacks:[ 'onClick' ] });
        await t.call('setDisabled',true);
        t.equal(await t.call('isDisabled'),true,'isDisabled()');
        t.assert(await t.page.isVisible(BUTTON),'still visible');
        await t.page.click(BUTTON,{ force:true });
        t.equal(( await t.calls('onClick') ).length,0,'no call while disabled');
        await t.call('setDisabled',false);
        await t.page.click(BUTTON);
        t.equal(( await t.calls('onClick') ).length,1,'one call after enabling');
    },
    'T-13':async t =>
    {
        await t.page.evaluate(() => { document.querySelector('#before').tabIndex = 0; });
        await t.render({ id:ID, label:'Orders', href:'#target', disabled:true },DEPENDS);
        const link = await t.page.$eval(BUTTON,element => ( { href:element.getAttribute('href'), disabled:element.getAttribute('aria-disabled') } ));
        t.equal(link,{ href:null, disabled:'true' },'no address, unavailable');
        t.assert(await t.page.isVisible(BUTTON),'visible');
        await t.page.focus('#before');
        await t.page.keyboard.press('Tab');
        t.assert(await t.page.evaluate(() => document.activeElement.id !== 'save'),'skipped by Tab');
    },
    'T-14':async t =>
    {
        await t.render({ id:ID, label:'Edit', description:'Order 1042' },DEPENDS);
        const description = () => t.page.$eval(BUTTON,element => ( element.getAttribute('aria-describedby') ?? '' ).split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ').trim());
        t.equal(await description(),'Order 1042','first description');
        await t.call('setDescription','Order 7');
        t.equal(await description(),'Order 7','changed description');
    },
    'T-15':async t =>
    {
        const icon = { id:ID, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-trash', ariaLabel:'Delete' };
        await t.render({ ...icon, tooltipMode:'TITLE' },DEPENDS);
        t.equal(await t.page.getAttribute(BUTTON,'title'),'Delete','TITLE');
        await t.call('destroy');
        await t.render({ ...icon, tooltipMode:'NONE' },DEPENDS);
        t.equal(await t.page.getAttribute(BUTTON,'title'),null,'NONE');
        await t.call('destroy');
        await t.render({ ...icon, tooltipMode:'TOOLTIP' },DEPENDS);
        await t.page.hover(BUTTON);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Delete')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-16':async t =>
    {
        t.equal(await t.render({ id:ID },DEPENDS),null,'nothing rendered');
        t.assert(( await t.messages() ).some(message => message.level === 'error' && /^Button "save" \[LABEL_REQUIRED\]: /.test(message.text)),'console error');
    },
    'T-17':async t =>
    {
        t.equal(await t.render({ id:ID, buttonVariant:'ICON_BUTTON', ariaLabel:'Delete' },DEPENDS),null,'no icon');
        t.equal(await t.render({ id:ID, buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-trash' },DEPENDS),null,'no ariaLabel');
        const errors = ( await t.messages() ).filter(message => message.level === 'error').map(message => /\[([A-Z_]+)\]/.exec(message.text)?.[1]);
        t.equal(errors,[ 'ICON_REQUIRED', 'ARIA_LABEL_REQUIRED' ],'labels');
    },
    'T-18':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Save', iconBefore:'fa-solid fa-<bad>' },DEPENDS),'rendered');
        t.equal(( await hasWarning(t,'INVALID_ICON_CLASS') ).length,1,'warning');
    },
    'T-19':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Go', href:'#go', buttonType:'SUBMIT' },DEPENDS),'link rendered');
        await t.call('destroy');
        t.assert(await t.render({ id:ID, label:'terms', hierarchy:'LINK', href:'#terms', size:'LARGE' },DEPENDS),'LINK rendered');
        t.equal(( await hasWarning(t,'OPTION_IGNORED') ).length,2,'two warnings');
    },
    'T-20':async t =>
    {
        t.assert(await t.render({ id:ID, label:'Run', href:'javascript:alert(1)' },DEPENDS),'rendered');
        t.equal(await t.page.getAttribute(BUTTON,'href'),null,'no address');
        t.equal(( await hasWarning(t,'UNSAFE_HREF') ).length,1,'warning');
    }
};
