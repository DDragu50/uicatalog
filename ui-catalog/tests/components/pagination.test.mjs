// pagination.test.mjs
//
// The "auto" cases of source/components-js/pagination/paginationTESTS.md, by ID. Each case receives t (see
// tools/component-tests.mjs). onPageChange is the third render argument, passed as a { $callback } value in args.

const ID = 'pages';
const NAV = `#${ID}`;
const RECORD = { stylesheets:[ 'button', 'tooltip' ], args:[ { $callback:'onPageChange' } ] };
const BASE = { id:ID, totalItems:1000, itemsPerPage:10 };
const items = t => t.page.$$eval(`${NAV} .ui-pagination-pages > *`,list => list.map(item => item.textContent.trim()));
const page = number => `${NAV} .ui-pagination-page[data-page="${number}"]`;
const reported = async t => ( await t.calls('onPageChange') ).map(call => call.args[0]);
const warnings = async ( t, label ) => ( await t.messages() ).filter(message => message.level === 'warning' && message.text.includes(`[${label}]`));

export const cases =
{
    'T-01':async t =>
    {
        await t.render({ ...BASE, currentPage:35 },RECORD);
        t.equal(await items(t),[ '1', '…', '33', '34', '35', '36', '37', '…', '100' ],'first, last, a window around the current page and "…"');
        t.equal([ await t.call('getPage'), await t.call('getTotalPages') ],[ 35, 100 ],'members');
    },
    'T-02':async t =>
    {
        await t.render({ ...BASE, currentPage:35 },RECORD);
        const current = await t.page.$eval(`${NAV} [aria-current="page"]`,element => ( { text:element.textContent.trim(), name:element.getAttribute('aria-label'), highlighted:element.classList.contains('ui-pagination-current') } ));
        t.equal(current,{ text:'35', name:'Page 35', highlighted:true },'current page highlighted and announced');
        const look = await t.page.evaluate(id => [ ...document.querySelectorAll(`#${id} .ui-pagination-page`) ].map(button => getComputedStyle(button).backgroundColor + getComputedStyle(button).color),ID);
        t.equal(new Set(look).size,2,'one look for the current page, one for the others');
    },
    'T-03':async t =>
    {
        await t.render({ ...BASE, totalItems:10 },RECORD);
        t.assert(await t.page.$eval(NAV,element => element.hidden),'hidden with one page');
        await t.call('update',{ totalItems:11 });
        t.assert(!await t.page.$eval(NAV,element => element.hidden),'shown with two pages');
    },
    'T-04':async t =>
    {
        await t.render({ ...BASE, currentPage:35 },RECORD);
        await t.page.click(page(36));
        t.equal(await reported(t),[ 36 ],'the requested page');
        t.equal(( await t.calls('onPageChange') )[0].args[1],`instance(${ID})`,'with the instance');
        t.equal(await t.call('getPage'),35,'it does not move by itself');
        await t.call('update',{ currentPage:36 });
        t.equal([ await t.call('getPage'), await t.page.$eval(`${NAV} [aria-current="page"]`,element => element.textContent.trim()) ],[ 36, '36' ],'the App provides the page');
        await t.page.click(page(36));
        t.equal(await reported(t),[ 36 ],'clicking the current page reports nothing');
    },
    'T-05':async t =>
    {
        const arrows = () => t.page.$eval(`${NAV} .ui-pagination-arrows`,element => element.hidden);
        await t.render({ ...BASE, totalItems:50 },RECORD);
        t.equal(await arrows(),true,'no arrows with 5 pages');
        await t.call('update',{ totalItems:60 });
        t.equal(await arrows(),false,'arrows from 6 pages');
        await t.call('destroy');
        await t.render({ ...BASE, totalItems:30, arrowVisibilityThreshold:3 },RECORD);
        t.equal(await arrows(),false,'own threshold');
    },
    'T-06':async t =>
    {
        const disabled = () => t.page.evaluate(id => [ `#${id}-previous`, `#${id}-next` ].map(selector => { const element = document.querySelector(selector); return element.disabled || element.getAttribute('aria-disabled') === 'true'; }),ID);
        await t.render({ ...BASE, totalItems:100 },RECORD);
        t.equal(await disabled(),[ true, false ],'previous disabled on the first page');
        await t.call('update',{ currentPage:10 });
        t.equal(await disabled(),[ false, true ],'next disabled on the last page');
        await t.page.click(`#${ID}-next`,{ force:true });
        t.equal(await reported(t),[],'a disabled arrow reports nothing');
    },
    'T-07':async t =>
    {
        await t.render({ ...BASE, currentPage:35 },RECORD);
        await t.page.click(`#${ID}-previous`);
        await t.page.click(`#${ID}-next`);
        t.equal(await reported(t),[ 34, 36 ],'previous and next page');
    },
    'T-08':async t =>
    {
        const field = `#${ID}-go-to`;
        await t.render({ ...BASE, totalItems:50, showGoToPage:true },RECORD);
        t.assert(await t.page.$eval(`${NAV} .ui-pagination-go-to`,element => element.hidden),'no field with 5 pages');
        await t.call('update',{ totalItems:1000 });
        t.assert(!await t.page.$eval(`${NAV} .ui-pagination-go-to`,element => element.hidden),'the field from 6 pages');
        t.equal(await t.page.$eval(`label[for="${ID}-go-to"]`,element => element.textContent.trim()),'Go to page','labelled');
        await t.page.fill(field,'42');
        await t.page.keyboard.press('Enter');
        t.equal(await reported(t),[ 42 ],'Enter reports the page');
    },
    'T-09':async t =>
    {
        const field = `#${ID}-go-to`, error = `#${ID}-go-to-error`;
        await t.render({ ...BASE, showGoToPage:true },RECORD);
        await t.page.fill(field,'150');
        await t.page.keyboard.press('Enter');
        t.equal(await t.page.$eval(error,element => ( element.hidden ? '' : element.textContent.trim() )),'Enter a page from 1 to 100.','impossible number');
        t.equal(await t.page.getAttribute(field,'aria-invalid'),'true','field marked invalid');
        await t.page.fill(field,'abc');
        await t.page.keyboard.press('Enter');
        t.equal(await reported(t),[],'nothing reported for invalid values');
        await t.page.fill(field,'7');
        t.equal(await t.page.$eval(error,element => element.hidden),true,'cleared when the input changes');
    },
    'T-10':async t =>
    {
        await t.render({ ...BASE, currentPage:3 },RECORD);
        const place = await t.page.evaluate(id => { const host = document.querySelector('#host').getBoundingClientRect(); const children = [ ...document.querySelectorAll(`#${id} > *`) ].filter(element => !element.hidden).map(element => element.getBoundingClientRect()); return { end:Math.max(...children.map(rect => rect.right)), host:host.right, start:Math.min(...children.map(rect => rect.left)), hostStart:host.left }; },ID);
        t.assert(Math.abs(place.end - place.host) <= 2 && place.start > place.hostStart + 100,`at the end of the line (${JSON.stringify(place)})`);
    },
    'T-11':async t =>
    {
        await t.render({ ...BASE, label:'Orders, top' },RECORD);
        t.equal(await t.page.$eval(NAV,element => [ element.localName, element.getAttribute('aria-label') ]),[ 'nav', 'Orders, top' ],'a named navigation landmark');
    },
    'T-12':async t =>
    {
        const arrow = `#${ID}-next`;
        await t.render({ ...BASE, tooltipMode:'TITLE' },RECORD);
        t.equal(await t.page.getAttribute(arrow,'title'),'Next page','TITLE');
        await t.call('destroy');
        await t.render({ ...BASE },RECORD);
        t.equal(await t.page.getAttribute(arrow,'title'),null,'NONE by default');
        await t.call('destroy');
        await t.render({ ...BASE, tooltipMode:'TOOLTIP' },RECORD);
        await t.page.hover(arrow);
        await t.wait(900);
        const shown = await t.page.$$eval('.ui-tooltip',tips => tips.filter(tip => getComputedStyle(tip).visibility !== 'hidden' && !tip.hidden).map(tip => tip.textContent.trim()));
        t.assert(shown.some(text => text.startsWith('Next page')),`TOOLTIP shows the name (${JSON.stringify(shown)})`);
    },
    'T-13':async t =>
    {
        await t.render({ ...BASE, totalItems:25000, currentPage:1250, locale:'de' },RECORD);
        t.assert(( await items(t) ).includes('1.250'),`German digit grouping (${( await items(t) ).join(' ')})`);
        await t.call('destroy');
        t.assert(await t.render({ ...BASE, totalItems:1000, currentPage:500 },RECORD),'rendered');
        t.equal(( await warnings(t,'PAGE_OUT_OF_RANGE') ).length,1,'warning');
        t.equal(await t.call('getPage'),100,'the last page is used');
    },
    'T-14':async t =>
    {
        t.assert(await t.render({ ...BASE, goToPageThreshold:3 },RECORD),'rendered');
        t.equal(( await warnings(t,'OPTION_IGNORED') ).length,1,'goToPageThreshold without showGoToPage');
    }
};
