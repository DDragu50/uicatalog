// server.js
//
// LOCAL WEB SERVER.
// Serves the client folder to the browser and answers the contact endpoint. Uses only Node.js built-in modules.
// Start it with "npm start" and open http://localhost:<PORT> (PORT from .env, default 3003).

import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { SERVER_CONFIG } from './serverConfig.js';
import { reportServerIssue } from './serverErrors.js';
import { createContactHandler } from './contactHandler.js';

// File types the server sends; other extensions are not served.
const MIME_TYPES =
{
    '.html':'text/html; charset=utf-8',
    '.js':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8',
    '.json':'application/json; charset=utf-8',
    '.md':'text/markdown; charset=utf-8',
    '.txt':'text/plain; charset=utf-8',
    '.svg':'image/svg+xml',
    '.png':'image/png',
    '.jpg':'image/jpeg',
    '.jpeg':'image/jpeg',
    '.gif':'image/gif',
    '.webp':'image/webp',
    '.ico':'image/x-icon',
    '.woff2':'font/woff2',
    '.woff':'font/woff',
    '.ttf':'font/ttf',
    '.zip':'application/zip'
};

// Security headers sent with every response: same-origin content only, no MIME sniffing.
const SECURITY_HEADERS =
{
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'same-origin',
    'X-Frame-Options':'SAMEORIGIN',
    'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
};

// Sends a short plain-text response (errors of the static server).
function sendText( response, status, text )
{
    response.writeHead(status,{ 'Content-Type':'text/plain; charset=utf-8' });
    response.end(text);
}

// Resolves a URL path to a file inside the client folder; returns null for paths outside it or hidden files.
function resolveClientPath( urlPath )
{
    let decoded = '';
    try { decoded = decodeURIComponent(urlPath); } catch { return null; }
    const filePath = path.resolve(SERVER_CONFIG.clientDir,`.${path.posix.normalize(`/${decoded}`)}`);
    const relative = path.relative(SERVER_CONFIG.clientDir,filePath);
    if ( relative.startsWith('..') || path.isAbsolute(relative) ) { return null; }
    if ( relative.split(path.sep).some(part => part.startsWith('.')) ) { return null; }
    return filePath;
}

// Serves one static file (GET or HEAD); folders serve their index.html.
async function serveStatic( request, response, urlPath )
{
    let filePath = resolveClientPath(urlPath);
    if ( !filePath ) { sendText(response,404,'Not found'); return; }
    let info = await stat(filePath).catch(() => null);
    if ( info?.isDirectory() ) { filePath = path.join(filePath,'index.html'); info = await stat(filePath).catch(() => null); }
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()];
    if ( !info?.isFile() || !type ) { sendText(response,404,'Not found'); return; }
    response.writeHead(200,{ 'Content-Type':type, 'Content-Length':info.size, 'Cache-Control':'no-cache' });
    if ( request.method === 'HEAD' ) { response.end(); return; }
    createReadStream(filePath).on('error',error => { reportServerIssue('REQUEST_FAILED',{ method:request.method, url:urlPath, reason:error.message }); response.destroy(); }).pipe(response);
}

// Routes one request: the contact endpoint, other API paths (404) and static files.
function createRequestHandler()
{
    const handleContact = createContactHandler(SERVER_CONFIG.messagesDir);

    // Handles one request and reports unexpected failures without stopping the server.
    return async function handleRequest( request, response )
    {
        Object.entries(SECURITY_HEADERS).forEach(( [ name, value ] ) => response.setHeader(name,value));
        const urlPath = new URL(request.url ?? '/','http://localhost').pathname;
        try
        {
            if ( urlPath === '/api/contact' ) { if ( request.method === 'POST' ) { await handleContact(request,response); } else { response.setHeader('Allow','POST'); sendText(response,405,'Method not allowed'); } return; }
            if ( urlPath.startsWith('/api/') ) { sendText(response,404,'Not found'); return; }
            if ( request.method !== 'GET' && request.method !== 'HEAD' ) { response.setHeader('Allow','GET, HEAD'); sendText(response,405,'Method not allowed'); return; }
            await serveStatic(request,response,urlPath);
        }
        catch ( error )
        {
            reportServerIssue('REQUEST_FAILED',{ method:request.method, url:urlPath, reason:error.message });
            if ( !response.headersSent ) { sendText(response,500,'Server error'); } else { response.destroy(); }
        }
    };
}

// Starts the server on the configured port and explains port conflicts.
function startServer()
{
    const server = http.createServer(createRequestHandler());
    server.on('error',error =>
    {
        if ( error.code === 'EADDRINUSE' ) { reportServerIssue('PORT_IN_USE',{ port:SERVER_CONFIG.port }); }
        else { reportServerIssue('SERVER_FAILED',{ reason:error.message }); }
        process.exitCode = 1;
    });
    server.listen(SERVER_CONFIG.port,() => console.log(`UI Catalog showcase (${SERVER_CONFIG.environment}) is running at http://localhost:${SERVER_CONFIG.port}  (stop it with Ctrl+C)`));
}

startServer();
