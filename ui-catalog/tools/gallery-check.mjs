// gallery-check.mjs
//
// GALLERY CHECK (decision 194). Usage: node tools/gallery-check.mjs
// Opens gallery/index.html in Chromium and reports, per component, a missing entry in gallery/variants.js, console
// messages written while its variants render, and script errors of the page. Part of npm run release and status.
// Exit code 1 when something is reported.

import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listComponents, printFindings } from './lib.mjs';
import { startServer, openBrowser } from './server.mjs';

// Returns the component names that have an entry in gallery/variants.js.
export function galleryEntries()
{
    const text = readFileSync(join(ROOT,'gallery','variants.js'),'utf8');
    return new Set([ ...text.matchAll(/^\s{4}(\w+)\s*:\s*\[/gm) ].map(match => match[1]));
}

// Runs the check; returns { total, findings }.
export async function runGalleryCheck( names = listComponents() )
{
    const entries = galleryEntries(), findings = Object.fromEntries(names.map(name => [ name, entries.has(name) ? [] : [ 'no entry in gallery/variants.js' ] ]));
    const server = await startServer();
    const browser = await openBrowser();
    try
    {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror',error => errors.push(String(error)));
        await page.route('**/cdnjs.cloudflare.com/**',route => route.abort());   // icons are not needed for the check
        await page.goto(`${server.url}/gallery/`);
        await page.waitForFunction(() => window.galleryReady === true,null,{ timeout:120000 });
        const messages = await page.evaluate(() => [ ...document.querySelectorAll('.gallery-messages') ].map(element => ( { id:element.closest('section')?.id ?? '', text:element.textContent } )));
        messages.forEach(message =>
        {
            const name = message.id.replace(/^component-/,'');
            ( findings[name] ??= [] ).push(...message.text.split('\n').filter(Boolean).map(line => `gallery: ${line}`));
        });
        if ( errors.length ) { findings.gallery = errors.map(error => `script error: ${error}`); }
    }
    finally { await browser.close(); await server.close(); }
    return { total:printFindings(`Gallery (${entries.size} components)`,findings), findings };
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const { total } = await runGalleryCheck();
    process.exitCode = total ? 1 : 0;
}
