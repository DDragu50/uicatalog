// lib.mjs
//
// SHARED HELPERS FOR THE QUALITY TOOLS (decision 193).
// Reads the library as plain files: component folders, README sections and tables, error catalogs, design tokens.
// Used by check.mjs, coverage.mjs, contract.mjs, integrity.mjs and release.mjs. Node 18+, no dependencies.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)),'..');
export const SOURCE = join(ROOT,'source');
export const COMPONENTS = join(SOURCE,'components-js');
export const TESTS = join(ROOT,'tests');

// Returns the component names (folders of components-js), sorted.
export function listComponents()
{
    return readdirSync(COMPONENTS).filter(name => statSync(join(COMPONENTS,name)).isDirectory()).sort();
}

// Returns a component file's text ('' when the file does not exist).
export function readComponentFile( name, suffix )
{
    const path = join(COMPONENTS,name,`${name}${suffix}`);
    return existsSync(path) ? readFileSync(path,'utf8') : '';
}

// Returns the text of a README section from its "### Title" heading to the next heading of level 2 or 3 ('' if absent).
export function readmeSection( readme, title )
{
    const start = readme.indexOf(`\n### ${title}`);
    if ( start < 0 ) { return ''; }
    const rest = readme.slice(start + 1);
    const end = rest.slice(4).search(/\n#{2,3} /);
    return end < 0 ? rest : rest.slice(0,end + 4);
}

// Returns the pipe tables of a text as arrays of rows (arrays of trimmed cells), separator rows removed.
export function readTables( text )
{
    const tables = [];
    let current = null;
    for ( const line of text.split('\n') )
    {
        if ( /^\s*\|.*\|\s*$/.test(line) )
        {
            if ( /^\s*\|?[\s:|-]+\|?\s*$/.test(line) ) { continue; }
            const cells = line.trim().replace(/^\|/,'').replace(/(?<!\\)\|$/,'').split(/(?<!\\)\|/).map(cell => cell.trim());
            ( current ??= [] ).push(cells);
        }
        else if ( current ) { tables.push(current); current = null; }
    }
    if ( current ) { tables.push(current); }
    return tables;
}

// Returns the labels of a component's error catalog: [{ label, severity, source }].
export function readCatalog( name )
{
    const text = readComponentFile(name,'Errors.js');
    // One entry per line: { errorLabel:'X', message:'…{key}…', source:'…', severity:'…', … }
    return text.split('\n').filter(line => /errorLabel\s*:\s*'[A-Z]/.test(line)).map(line => ( {
        label:/errorLabel\s*:\s*'([A-Z][A-Z0-9_]*)'/.exec(line)[1],
        severity:/severity\s*:\s*'(\w+)'/.exec(line)?.[1] ?? '',
        source:/source\s*:\s*'(\w+)'/.exec(line)?.[1] ?? ''
    } ));
}

// Returns the labels listed in the README Errors section: [{ label, severity }] (severity '' in tables without one).
export function readReadmeErrors( readme )
{
    const result = [];
    for ( const table of readTables(readmeSection(readme,'Errors')) )
    {
        const header = table[0].map(cell => cell.toLowerCase());
        const severityColumn = header.indexOf('severity');
        table.slice(1).forEach(row => [ ...row[0].matchAll(/`([A-Z][A-Z0-9_]{2,})`/g) ].forEach(match => result.push({ label:match[1], severity:severityColumn >= 0 ? row[severityColumn] : '' })));
    }
    // Labels explained in the section's sentences (e.g. reasons shown next to a file) count as documented too.
    const inTables = new Set(result.map(entry => entry.label));
    const prose = readmeSection(readme,'Errors').split('\n').filter(line => !/^\s*\|/.test(line)).join('\n');
    [ ...prose.matchAll(/`([A-Z][A-Z0-9_]{2,})`/g) ].filter(match => !inTables.has(match[1])).forEach(match => { inTables.add(match[1]); result.push({ label:match[1], severity:'', prose:true }); });
    return result;
}

// Returns the Business analysis lines: [{ code, actor, verb, text, line }] (code '' when missing).
export function readBusinessAnalysis( readme )
{
    const section = readmeSection(readme,'Business analysis');
    return section.split('\n').map(( text, line ) => ( { text, line } )).filter(entry => /^\s*- /.test(entry.text)).map(entry =>
    {
        const words = /^\s*- (\w+) (\w+)/.exec(entry.text);
        return { code:/<!--\s*(BA-\d+)\s*-->/.exec(entry.text)?.[1] ?? '', actor:words?.[1] ?? '', verb:words?.[2] ?? '', text:entry.text.replace(/\s*<!--.*?-->/g,'').replace(/^\s*- /,'').trim(), line:entry.line };
    });
}

// Returns the callback names of the README Callbacks table (first column, without backticks).
export function readCallbacks( readme )
{
    // Rows name a callback as `onCopy`, `config.onClick` or `renderButton(..., onClick)`, or several in one row
    // (`onReset` / `onClear` / `onCancel`); the same callback once.
    const names = cell => { const found = [ ...cell.matchAll(/\b(on[A-Z]\w*)/g) ].map(match => match[1]); return found.length ? found : [ /`(\w+)`/.exec(cell)?.[1] ].filter(Boolean); };
    return [ ...new Set(readTables(readmeSection(readme,'Callbacks')).flatMap(table => table.slice(1).flatMap(row => names(row[0])))) ];
}

// Returns the design-system token names.
export function readDesignTokens()
{
    const css = readFileSync(join(SOURCE,'design-system.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    return new Set([ ...css.matchAll(/(?<![\w(-])(--[a-z0-9-]+)\s*:/g) ].map(match => match[1]));
}

// Returns the published registry (labels and codes ever released), or null before the first release.
export function readRegistry()
{
    const path = join(TESTS,'published.json');
    return existsSync(path) ? JSON.parse(readFileSync(path,'utf8')) : null;
}

// Prints findings per component and returns the number of findings.
export function printFindings( title, findings )
{
    let total = 0;
    console.log(`\n${title}`);
    for ( const [ name, list ] of Object.entries(findings) )
    {
        if ( !list.length ) { continue; }
        total += list.length;
        console.log(`  ${name}`);
        list.forEach(item => console.log(`    - ${item}`));
    }
    console.log(total ? `  ${total} finding(s).` : '  No findings.');
    return total;
}

// Returns the test plan of a component (xTESTS.md): { exists, cases:[{ id, covers:[], kind, steps, expected }] }.
// Covers lists Business analysis codes (BA-07), callbacks (onCopy) and error labels (COPY_FAILED).
export function readTestPlan( name )
{
    const text = readComponentFile(name,'TESTS.md');
    if ( !text ) { return { exists:false, cases:[] }; }
    const cases = [];
    for ( const table of readTables(text) )
    {
        const header = table[0].map(cell => cell.toLowerCase());
        if ( header[0] !== 'id' || !header.includes('covers') ) { continue; }
        const column = key => header.indexOf(key);
        table.slice(1).forEach(row => cases.push({
            id:row[0].replace(/`/g,''),
            covers:[ ...row[column('covers')].matchAll(/BA-\d+|\b[a-z]+[A-Z]\w*|\b[A-Z][A-Z0-9_]{2,}\b/g) ].map(match => match[0]),
            kind:( row[column('kind')] ?? '' ).toLowerCase(),
            steps:row[column('steps')] ?? '',
            expected:row[column('expected result')] ?? ''
        }));
    }
    return { exists:true, cases };
}

// Labels the shared contract test proves for every component (they need no case in a test plan).
export const CONTRACT_LABELS = [ 'CONTAINER_REQUIRED', 'ID_REQUIRED', 'UNSAFE_ID', 'DUPLICATE_ID', 'INVALID_OPTION' ];
