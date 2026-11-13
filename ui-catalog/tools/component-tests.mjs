// component-tests.mjs
//
// COMPONENT TESTS (decision 193). Usage: node tools/component-tests.mjs [component …]
// For every component with a test plan (source/components-js/x/xTESTS.md) and a test file (tests/components/x.test.mjs),
// runs each "auto" case of the plan in Chromium, in a fresh page (tests/components/harness.html), and reports it by its
// ID. "manual" cases are listed for a person to check. A plan case without code, or code without a plan case, fails.
// Exit code 1 when a case fails.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TESTS, listComponents, readTestPlan } from './lib.mjs';
import { startServer, openBrowser } from './server.mjs';

// Builds the helpers a test case receives (t): rendering, instance calls, callbacks, console, clipboard, assertions.
function helpers( page, name )
{
    const t =
    {
        page,
        render:( config, options = {} ) => page.evaluate(( [ component, cfg, opts ] ) => window.harness.render(component,cfg,opts),[ name, config, options ]),
        call:( method, ...args ) => page.evaluate(( [ member, values ] ) => window.harness.call(member,...values),[ method, args ]),
        calls:async ( callback ) => ( await page.evaluate(() => window.harness.calls) ).filter(call => !callback || call.name === callback),
        messages:() => page.evaluate(() => window.harness.messages),
        clipboardText:() => page.evaluate(() => navigator.clipboard.readText()),
        clipboardHTML:() => page.evaluate(async () => { for ( const item of await navigator.clipboard.read() ) { if ( item.types.includes('text/html') ) { return ( await item.getType('text/html') ).text(); } } return ''; }),
        refuseClipboard:() => page.evaluate(() => { const refuse = () => Promise.reject(new DOMException('Refused by the test','NotAllowedError')); navigator.clipboard.write = refuse; navigator.clipboard.writeText = refuse; }),
        wait:ms => page.waitForTimeout(ms),
        assert:( condition, message ) => { if ( !condition ) { throw new Error(message); } },
        equal:( actual, expected, label ) => { if ( JSON.stringify(actual) !== JSON.stringify(expected) ) { throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); } }
    };
    return t;
}

// Runs the component tests; returns { failed, passed, manual, results }.
export async function runComponentTests( names = listComponents() )
{
    const planned = names.filter(name => readTestPlan(name).exists);
    const results = [];
    if ( !planned.length ) { console.log('\nComponent tests\n  No test plans yet.'); return { failed:0, passed:0, manual:0, results }; }
    const server = await startServer();
    const browser = await openBrowser();
    try
    {
        for ( const name of planned )
        {
            const plan = readTestPlan(name);
            const file = join(TESTS,'components',`${name}.test.mjs`);
            const code = existsSync(file) ? ( await import(pathToFileURL(file).href) ).cases ?? {} : {};
            for ( const testCase of plan.cases )
            {
                if ( testCase.kind !== 'auto' ) { results.push({ component:name, id:testCase.id, status:'manual', detail:testCase.expected }); continue; }
                if ( !code[testCase.id] ) { results.push({ component:name, id:testCase.id, status:'fail', detail:`no code for this case in tests/components/${name}.test.mjs` }); continue; }
                const context = await browser.newContext({ permissions:[ 'clipboard-read', 'clipboard-write' ] });
                const page = await context.newPage();
                const pageErrors = [];
                page.on('pageerror',error => pageErrors.push(String(error)));
                try
                {
                    await page.goto(`${server.url}/tests/components/harness.html`);
                    await page.waitForFunction(() => window.harnessReady === true);
                    await code[testCase.id](helpers(page,name));
                    if ( pageErrors.length ) { throw new Error(`script error: ${pageErrors[0]}`); }
                    results.push({ component:name, id:testCase.id, status:'pass', detail:'' });
                }
                catch ( error ) { results.push({ component:name, id:testCase.id, status:'fail', detail:String(error?.message ?? error).split('\n')[0] }); }
                finally { await context.close(); }
            }
            Object.keys(code).filter(id => !plan.cases.some(testCase => testCase.id === id)).forEach(id => results.push({ component:name, id, status:'fail', detail:'code for a case that is not in the test plan' }));
        }
    }
    finally { await browser.close(); await server.close(); }
    const count = status => results.filter(result => result.status === status).length;
    console.log(`\nComponent tests (${planned.length} component(s) with a test plan)`);
    for ( const name of planned )
    {
        const own = results.filter(result => result.component === name);
        console.log(`  ${name}: ${own.filter(result => result.status === 'pass').length} passed, ${own.filter(result => result.status === 'fail').length} failed, ${own.filter(result => result.status === 'manual').length} for a person`);
        own.filter(result => result.status === 'fail').forEach(result => console.log(`    - ${result.id}: ${result.detail}`));
    }
    return { failed:count('fail'), passed:count('pass'), manual:count('manual'), results };
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const { failed } = await runComponentTests(process.argv.slice(2).length ? process.argv.slice(2) : undefined);
    process.exitCode = failed ? 1 : 0;
}
