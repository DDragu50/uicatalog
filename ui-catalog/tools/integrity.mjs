// integrity.mjs
//
// INTEGRITY: FINGERPRINTS OF THE ORIGINAL COMPONENTS (decision 193). Run only on an explicit command.
//   node tools/integrity.mjs save [version]   stores the fingerprints (SHA-256) and a copy of the protected parts
//   node tools/integrity.mjs verify           compares the components with the stored fingerprints, names every change
//   node tools/integrity.mjs restore          puts the protected parts back as stored (at most 3 times per save)
// Protected: every JavaScript file, README and test plan of source/components-js, and part 3 (STRUCTURE) of each
// stylesheet. Parts 1 and 2 of the stylesheets (APPEARANCE, DIMENSIONS) are free to change and not tracked.
// Stored in integrity/: integrity.json (fingerprints, version, date, restores) and snapshot/ (the protected parts).

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, COMPONENTS, listComponents } from './lib.mjs';

const STORE = join(ROOT,'integrity');
const SNAPSHOT = join(STORE,'snapshot');
const INDEX = join(STORE,'integrity.json');
export const MAX_RESTORES = 3;

// Returns the part of a stylesheet from its "3. STRUCTURE" section heading to the end (null when there is none).
export function structurePart( css )
{
    const lines = css.split('\n');
    const heading = lines.findIndex(line => /^\s*3\. STRUCTURE\s+—/.test(line));
    if ( heading < 0 ) { return null; }
    const start = lines.slice(0,heading).findLastIndex(line => /^\s*\/\*\s*=+/.test(line));
    return lines.slice(start < 0 ? heading : start).join('\n');
}

// Returns the protected parts: [{ path (relative to components-js), text }].
export function protectedParts()
{
    const parts = [];
    for ( const name of listComponents() )
    {
        for ( const file of readdirSync(join(COMPONENTS,name)).sort() )
        {
            const text = readFileSync(join(COMPONENTS,name,file),'utf8');
            if ( file.endsWith('.js') || file.endsWith('.md') ) { parts.push({ path:`${name}/${file}`, text }); }
            else if ( file.endsWith('.css') ) { const structure = structurePart(text); if ( structure !== null ) { parts.push({ path:`${name}/${file}#STRUCTURE`, text:structure }); } }
        }
    }
    return parts;
}

const hash = text => createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');

// Stores fingerprints and the snapshot; returns the index.
export function save( version = 'unversioned' )
{
    rmSync(SNAPSHOT,{ recursive:true, force:true });
    const files = {};
    for ( const part of protectedParts() )
    {
        files[part.path] = hash(part.text);
        const target = join(SNAPSHOT,part.path.replace('#STRUCTURE','.structure'));
        mkdirSync(dirname(target),{ recursive:true });
        writeFileSync(target,part.text);
    }
    const index = { version, saved:new Date().toISOString(), restores:0, files };
    mkdirSync(STORE,{ recursive:true });
    writeFileSync(INDEX,`${JSON.stringify(index,null,1)}\n`);
    return index;
}

// Compares with the stored fingerprints; returns { stored, changed, added, removed } (null when nothing is stored).
export function verify()
{
    if ( !existsSync(INDEX) ) { return null; }
    const stored = JSON.parse(readFileSync(INDEX,'utf8'));
    const current = Object.fromEntries(protectedParts().map(part => [ part.path, hash(part.text) ]));
    return {
        stored,
        changed:Object.keys(current).filter(path => stored.files[path] && stored.files[path] !== current[path]),
        added:Object.keys(current).filter(path => !stored.files[path]),
        removed:Object.keys(stored.files).filter(path => !( path in current ))
    };
}

// Puts changed and removed protected parts back (a stylesheet keeps parts 1 and 2); returns the restored paths.
export function restore()
{
    const result = verify();
    if ( !result ) { throw new Error('Nothing stored: run "save" first.'); }
    if ( result.stored.restores >= MAX_RESTORES ) { throw new Error(`Restored ${MAX_RESTORES} times since ${result.stored.saved}: a person decides now (see the integrity section of the guidelines).`); }
    const restored = [];
    for ( const path of [ ...result.changed, ...result.removed ] )
    {
        const saved = readFileSync(join(SNAPSHOT,path.replace('#STRUCTURE','.structure')),'utf8');
        const file = join(COMPONENTS,path.replace('#STRUCTURE',''));
        if ( path.endsWith('#STRUCTURE') )
        {
            const css = readFileSync(file,'utf8'), structure = structurePart(css);
            writeFileSync(file,structure === null ? `${css}\n${saved}` : css.slice(0,css.lastIndexOf(structure)) + saved);
        }
        else { mkdirSync(dirname(file),{ recursive:true }); writeFileSync(file,saved); }
        restored.push(path);
    }
    const index = { ...result.stored, restores:result.stored.restores + 1 };
    writeFileSync(INDEX,`${JSON.stringify(index,null,1)}\n`);
    return { restored, added:result.added, attempt:index.restores };
}

// Prints the result of verify().
export function printVerify( result )
{
    console.log('\nIntegrity');
    if ( !result ) { console.log('  Nothing stored yet (run: npm run integrity:save).'); return 0; }
    console.log(`  Compared with ${result.stored.version} (${result.stored.saved}), ${Object.keys(result.stored.files).length} protected parts.`);
    const list = ( title, paths ) => paths.length && console.log(`  ${title} (${paths.length}):\n${paths.map(path => `    - ${path}`).join('\n')}`);
    list('Changed',result.changed); list('Added',result.added); list('Removed',result.removed);
    const total = result.changed.length + result.added.length + result.removed.length;
    if ( !total ) { console.log('  Unchanged: the components are the stored originals.'); }
    else { console.log(`  Modified: ${total} part(s) differ from the stored originals.`); }
    return total;
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const [ command, version ] = process.argv.slice(2);
    if ( command === 'save' ) { const index = save(version); console.log(`Stored ${Object.keys(index.files).length} fingerprints (${index.version}) in integrity/integrity.json.`); }
    else if ( command === 'verify' ) { process.exitCode = printVerify(verify()) ? 1 : 0; }
    else if ( command === 'restore' )
    {
        try
        {
            const result = restore();
            console.log(`Restore ${result.attempt} of ${MAX_RESTORES}: ${result.restored.length} part(s) put back.${result.restored.map(path => `\n  - ${path}`).join('')}`);
            if ( result.added.length ) { console.log(`New files are not removed; check them: ${result.added.join(', ')}`); }
        }
        catch ( error ) { console.error(error.message); process.exitCode = 1; }
    }
    else { console.log('Usage: node tools/integrity.mjs save [version] | verify | restore'); process.exitCode = 1; }
}
