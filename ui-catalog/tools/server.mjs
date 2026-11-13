// server.mjs
//
// A small static web server (decisions 193, 194): serves the library folder (source/, tests/, gallery/) on this computer
// only. Used by contract.mjs, component-tests.mjs and gallery.mjs; nothing to install.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from './lib.mjs';

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.md':'text/markdown', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };

// Starts the server on a port (0 = any free port); returns { url, close() }.
export function startServer( port = 0 )
{
    const server = createServer(async ( request, response ) =>
    {
        const path = normalize(decodeURIComponent(new URL(request.url,'http://localhost').pathname)).replace(/^([/\\])+/,'');
        // The starter expects the library at starter/ui-catalog/ and the fonts at starter/assets/ (its layout once copied
        // into a project); inside the library both come from source/ and assets/.
        const aliased = path.replace(/^starter[/\\]ui-catalog([/\\]|$)/,'source$1').replace(/^starter[/\\]assets([/\\]|$)/,'assets$1');
        const file = join(ROOT,aliased.endsWith('/') || aliased.endsWith('\\') || aliased === '.' || aliased === '' ? join(aliased,'index.html') : aliased);
        if ( !file.startsWith(ROOT) ) { response.writeHead(403).end(); return; }
        try { const body = await readFile(file); response.writeHead(200,{ 'Content-Type':TYPES[extname(file)] ?? 'application/octet-stream' }).end(body); }
        catch { response.writeHead(404).end('Not found'); }
    });
    return new Promise(( resolve, reject ) => server.once('error',reject).listen(port,'127.0.0.1',() => resolve({ url:`http://127.0.0.1:${server.address().port}`, close:() => new Promise(done => server.close(done)) })));
}

// Opens a Chromium page through Playwright (the only tool the tests need); explains how to install it when missing.
export async function openBrowser()
{
    let playwright;
    try { playwright = await import('playwright'); }
    catch { try { playwright = createRequire(import.meta.url)('playwright'); } catch { /* reported below */ } }
    if ( !playwright ) { console.error('Playwright is not installed. Run: npm install --save-dev playwright && npx playwright install chromium'); process.exit(2); }
    const browser = await playwright.chromium.launch();
    return browser;
}
