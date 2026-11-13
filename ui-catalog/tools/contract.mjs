// contract.mjs
//
// SHARED CONTRACT TEST (decision 193, step 2). Usage: node tools/contract.mjs [component …]
// Opens tests/contract/contract.html in Chromium and checks every component against the rules all components share
// (see tests/contract/contract.js). What it needs per component comes from the component's own files: the labels of
// its error catalog, the callbacks of its README Callbacks table, an enumerated option of its Configuration table,
// and its name as written in console messages. Exit code 1 when a check fails.

import { listComponents, readComponentFile, readCatalog, readCallbacks, readTables, readmeSection } from './lib.mjs';
import { startServer, openBrowser } from './server.mjs';
import { pathToFileURL } from 'node:url';

// Returns the first top-level option whose allowed values are UPPER_CASE words (used to trigger INVALID_OPTION).
function enumeratedOption( readme )
{
    for ( const table of readTables(readmeSection(readme,'Configuration')) )
    {
        const header = table[0].map(cell => cell.toLowerCase());
        const allowed = header.findIndex(cell => cell.startsWith('allowed'));
        if ( allowed < 0 ) { continue; }
        const row = table.slice(1).find(cells => /^`[a-zA-Z]+`$/.test(cells[0]) && /`[A-Z][A-Z_]+`.*`[A-Z][A-Z_]+`/.test(cells[allowed] ?? ''));
        if ( row ) { return row[0].replace(/`/g,''); }
    }
    return '';
}

// Returns what the browser part needs to know about each component.
export function contractMeta( names )
{
    return Object.fromEntries(names.map(name =>
    {
        const readme = readComponentFile(name,'README.md');
        return [ name, {
            labels:readCatalog(name).map(entry => entry.label),
            callbacks:readCallbacks(readme).filter(callback => /^on[A-Z]/.test(callback)),
            invalidOption:enumeratedOption(readme),
            displayName:/const text = `([A-Za-z]+)/.exec(readComponentFile(name,'Errors.js'))?.[1] ?? name
        } ];
    }));
}

// Runs the contract test; returns { failed, report }.
export async function runContract( names = listComponents() )
{
    const server = await startServer();
    const browser = await openBrowser();
    try
    {
        const page = await browser.newPage();
        const pageErrors = [];
        page.on('pageerror',error => pageErrors.push(String(error)));
        await page.goto(`${server.url}/tests/contract/contract.html`);
        await page.waitForFunction(() => window.contractReady === true);
        const report = await page.evaluate(meta => window.runContract(meta),contractMeta(names));
        let failed = 0, passed = 0;
        console.log(`\nShared contract test (${names.length} components)`);
        for ( const [ name, results ] of Object.entries(report) )
        {
            const failures = results.filter(result => result.status === 'fail');
            passed += results.filter(result => result.status === 'pass').length;
            failed += failures.length;
            if ( failures.length ) { console.log(`  ${name}`); failures.forEach(result => console.log(`    - ${result.check}: ${result.detail}`)); }
        }
        if ( pageErrors.length ) { failed += pageErrors.length; console.log(`  Script errors in the page:\n${pageErrors.map(error => `    - ${error}`).join('\n')}`); }
        console.log(`  ${passed} passed, ${failed} failed.`);
        return { failed, passed, report, pageErrors };
    }
    finally { await browser.close(); await server.close(); }
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const { failed } = await runContract(process.argv.slice(2).length ? process.argv.slice(2) : undefined);
    process.exitCode = failed ? 1 : 0;
}
