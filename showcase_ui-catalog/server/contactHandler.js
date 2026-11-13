// contactHandler.js
//
// CONTACT ENDPOINT.
// Receives a contact message (POST /api/contact), validates it, limits how often one visitor can send,
// and stores it as a JSON file in server/messages. On the public site (Apache with PHP) client/api/contact.php answers
// the same address with the same rules and sends the message by e-mail (decision 216).

import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { CONTACT_RULES } from './serverConfig.js';
import { reportServerIssue } from './serverErrors.js';

// Validates one field against its rule and returns an error { name, errorLabel, values } or null.
function validateField( name, value, rule )
{
    if ( value === '' ) { return rule.mandatory ? { name, errorLabel:'REQUIRED', values:{} } : null; }
    if ( rule.maxLength && value.length > rule.maxLength ) { return { name, errorLabel:'MAX_LENGTH', values:{ maxLength:rule.maxLength } }; }
    if ( rule.minLength && value.length < rule.minLength ) { return { name, errorLabel:'MIN_LENGTH', values:{ minLength:rule.minLength } }; }
    if ( rule.pattern && !rule.pattern.test(value) ) { return { name, errorLabel:'INVALID_EMAIL', values:{} }; }
    return null;
}

// Validates a received message; returns { valid, errors, message } with trimmed text values.
export function validateContactMessage( body )
{
    const source = body && typeof body === 'object' ? body : {};
    const message = Object.fromEntries(Object.keys(CONTACT_RULES.fields).map(name => [ name, typeof source[name] === 'string' ? source[name].replace(/\r\n?/g,'\n').trim() : '' ]));
    const errors = Object.entries(CONTACT_RULES.fields).map(( [ name, rule ] ) => validateField(name,message[name],rule)).filter(Boolean);
    return { valid:errors.length === 0, errors, message };
}

// Sends a JSON response with the given status.
function sendJSON( response, status, payload )
{
    response.writeHead(status,{ 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
    response.end(JSON.stringify(payload));
}

// Reads the request body up to the size limit; resolves the text, or null when the limit is exceeded.
function readBody( request, maxBytes )
{
    return new Promise(( resolve, reject ) =>
    {
        const chunks = [];
        let size = 0, tooLarge = false;
        request.on('data',chunk => { size += chunk.length; if ( size > maxBytes ) { tooLarge = true; } else { chunks.push(chunk); } });
        request.on('end',() => resolve(tooLarge ? null : Buffer.concat(chunks).toString('utf8')));
        request.on('error',reject);
    });
}

// Creates the contact handler with its own rate-limit memory and storage folder.
export function createContactHandler( messagesDir )
{
    const sentByVisitor = new Map();

    // Returns whether this visitor may send now, and records the attempt when allowed.
    function allowVisitor( visitor, now )
    {
        const recent = ( sentByVisitor.get(visitor) ?? [] ).filter(time => now - time < CONTACT_RULES.rateLimitWindowMs);
        if ( recent.length >= CONTACT_RULES.rateLimitMax ) { sentByVisitor.set(visitor,recent); return false; }
        sentByVisitor.set(visitor,[ ...recent, now ]);
        return true;
    }

    // Stores one valid message as a JSON file and returns the file name.
    async function storeMessage( message, receivedAt )
    {
        await mkdir(messagesDir,{ recursive:true });
        const fileName = `${receivedAt.replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}.json`;
        await writeFile(path.join(messagesDir,fileName),JSON.stringify({ receivedAt, ...message },null,2),'utf8');
        return fileName;
    }

    // Handles POST /api/contact: checks the request, validates, applies the rate limit and stores the message.
    return async function handleContact( request, response )
    {
        if ( !String(request.headers['content-type'] ?? '').toLowerCase().startsWith('application/json') ) { sendJSON(response,415,{ ok:false, errorLabel:'INVALID_REQUEST' }); return; }
        const text = await readBody(request,CONTACT_RULES.maxBodyBytes);
        if ( text === null ) { sendJSON(response,413,{ ok:false, errorLabel:'INVALID_REQUEST' }); return; }
        let body = null;
        try { body = JSON.parse(text); } catch { sendJSON(response,400,{ ok:false, errorLabel:'INVALID_REQUEST' }); return; }
        const result = validateContactMessage(body);
        if ( !result.valid ) { sendJSON(response,400,{ ok:false, errorLabel:'VALIDATION', errors:result.errors }); return; }
        const now = Date.now();
        if ( !allowVisitor(request.socket.remoteAddress ?? 'unknown',now) ) { sendJSON(response,429,{ ok:false, errorLabel:'TOO_MANY_REQUESTS' }); return; }
        try { await storeMessage(result.message,new Date(now).toISOString()); sendJSON(response,200,{ ok:true }); }
        catch ( error ) { reportServerIssue('CONTACT_STORE_FAILED',{ reason:error.message }); sendJSON(response,500,{ ok:false, errorLabel:'SERVER_ERROR' }); }
    };
}
