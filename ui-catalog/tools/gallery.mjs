// gallery.mjs
//
// GALLERY AND STARTER SERVER (decision 194). Usage: npm run gallery | npm run starter
// Serves the library on http://127.0.0.1:4173 (the next free port when it is taken), opens gallery/index.html (or
// starter/index.html with the argument "starter") in the default browser and keeps running until Ctrl+C. The pages
// read source/ live: edit, reload, see the result.

import { spawn } from 'node:child_process';
import { startServer } from './server.mjs';

let server = null;
for ( let port = 4173; !server && port < 4193; port++ ) { try { server = await startServer(port); } catch { /* port taken: try the next */ } }
if ( !server ) { server = await startServer(0); }
const page = process.argv.includes('starter') ? 'starter' : 'gallery';
const url = `${server.url}/${page}/`;
console.log(`UI Catalog ${page}: ${url}\nPress Ctrl+C to stop.`);
if ( !process.argv.includes('--no-open') )
{
    const [ command, ...args ] = process.platform === 'win32' ? [ 'cmd', '/c', 'start', '', url ] : process.platform === 'darwin' ? [ 'open', url ] : [ 'xdg-open', url ];
    try { spawn(command,args,{ stdio:'ignore', detached:true }).on('error',() => {}).unref(); } catch { /* no browser to open: the address above works */ }
}
