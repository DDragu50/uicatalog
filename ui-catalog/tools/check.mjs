// check.mjs
//
// STATIC CHECKS (decision 193, step 1). No browser, a few seconds. Usage: node tools/check.mjs [component …]
// Per component:
//   files       the eight files exist (xIndex, xConfig, xComponent, xHTML, xErrors, x.css, xREADME.md, xTESTS.md; xEvents
//               optional); the README Files table lists every code and document file of the folder (.js, .css, .md);
//               other components are imported only through their xIndex.js; no console calls outside xErrors.js
//   labels      every catalog label is used in the code; every label the code reports is in the catalog;
//               README Errors tables and catalog list the same labels with the same severity
//   tokens      every token used by the stylesheet exists in design-system.css and is listed in the Styling contract
//   README      tables have the same number of cells per row; Business analysis lines start with an allowed actor and
//               verb and carry a code (<!-- BA-07 -->), codes are unique
//   permanence  labels and codes published by an earlier release still exist (tests/published.json)
//   gallery     the component has an entry in gallery/variants.js
// Exit code 1 when there are findings.

import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { galleryEntries } from './gallery-check.mjs';
import { COMPONENTS, listComponents, readComponentFile, readmeSection, readTables, readCatalog, readReadmeErrors, readBusinessAnalysis, readDesignTokens, readRegistry, printFindings } from './lib.mjs';

const VERBS =
{
    User:'clicks taps presses types pastes selects changes drags hovers leaves',
    Component:'displays hides opens closes selects clears ticks unticks marks adds removes moves sorts changes adapts wraps shortens scrolls keeps checks prevents disables asks requests reports sends submits resets applies announces exposes',
    App:'provides performs stores sends opens adds changes marks disables forbids decides',
    Consumer:'chooses provides enables disables adds'
};
const REQUIRED = [ 'Index.js', 'Config.js', 'Component.js', 'HTML.js', 'Errors.js', '.css', 'README.md', 'TESTS.md' ];

// Returns the JavaScript of a component except its error catalog.
function codeOf( name )
{
    return readdirSync(join(COMPONENTS,name)).filter(file => file.endsWith('.js') && !file.endsWith('Errors.js')).map(file => readComponentFile(name,file.slice(name.length))).join('\n');
}

// File roles: required files, the README Files table, imports through entry points, console calls.
function checkFiles( name, readme = '' )
{
    const findings = REQUIRED.filter(suffix => !readComponentFile(name,suffix)).map(suffix => `missing file ${name}${suffix}`);
    const listed = new Set([ ...readmeSection(readme,'Files').matchAll(/^\|\s*`([^`]+)`/gm) ].map(match => match[1]));
    readdirSync(join(COMPONENTS,name)).filter(file => /\.(js|css|md)$/.test(file) && file !== `${name}README.md` && !listed.has(file))
        .forEach(file => findings.push(`${file} is not listed in the README Files table`));
    for ( const file of readdirSync(join(COMPONENTS,name)).filter(file => file.endsWith('.js')) )
    {
        const text = readComponentFile(name,file.slice(name.length));
        for ( const match of text.matchAll(/(?:from\s*|import\s*\(\s*)'\.\.\/(\w+)\/(\w+)\.js'/g) )
        {
            if ( match[2] !== `${match[1]}Index` ) { findings.push(`${file} imports ${match[1]}/${match[2]}.js; use ${match[1]}Index.js`); }
        }
        if ( !file.endsWith('Errors.js') && /console\.(log|warn|error|info)\(/.test(text) ) { findings.push(`${file} writes to the console directly; report through the error catalog`); }
    }
    return findings;
}

// Error labels: catalog, code and README agree.
function checkLabels( name, readme )
{
    const findings = [];
    const catalog = readCatalog(name);
    const code = `${codeOf(name)}\n${readComponentFile(name,'Errors.js').split('\n').filter(line => !/errorLabel\s*:/.test(line)).join('\n')}`;
    const known = new Set(catalog.map(entry => entry.label));
    catalog.filter(entry => !code.includes(`'${entry.label}'`) && !new RegExp(`\\.${entry.label}\\b`).test(code)).forEach(entry => findings.push(`label ${entry.label} is in the catalog but not used by the code`));
    const reported = new Set([ ...code.matchAll(/report\w*\(\s*'([A-Z][A-Z0-9_]+)'/g), ...code.matchAll(/errorLabel\s*:\s*'([A-Z][A-Z0-9_]+)'/g) ].map(match => match[1]));
    [ ...reported ].filter(label => !known.has(label)).forEach(label => findings.push(`label ${label} is used by the code but not in the catalog`));
    const documented = readReadmeErrors(readme);
    const documentedLabels = new Set(documented.map(entry => entry.label));
    catalog.filter(entry => !documentedLabels.has(entry.label)).forEach(entry => findings.push(`label ${entry.label} is in the catalog but not in the README Errors section`));
    // Only table rows claim a label; a word in capitals inside a sentence may be an option value.
    [ ...new Set(documented.filter(entry => !entry.prose).map(entry => entry.label)) ].filter(label => !known.has(label)).forEach(label => findings.push(`label ${label} is in the README Errors section but not in the catalog`));
    documented.filter(entry => entry.severity && known.has(entry.label)).forEach(entry =>
    {
        const severities = catalog.filter(item => item.label === entry.label).map(item => item.severity);
        if ( !severities.includes(entry.severity) ) { findings.push(`label ${entry.label}: README severity "${entry.severity}", catalog "${severities.join('/')}"`); }
    });
    return findings;
}

// Tokens: exist in the design system and are listed in the Styling contract (both ways).
function checkTokens( name, readme, tokens )
{
    const css = readComponentFile(name,'.css').replace(/\/\*[\s\S]*?\*\//g,'');   // comments are not rules
    // Custom properties set by the component itself (--ui-…) are its own variables, not design tokens.
    const used = new Set([ ...css.matchAll(/var\((--[a-z0-9-]+)/g) ].map(match => match[1]).filter(token => !token.startsWith('--ui-')));
    const contract = readmeSection(readme,'Styling contract').split('**Set by the component')[0].split('**Used by the code')[0];
    const listed = new Set([ ...contract.matchAll(/`(--[a-z0-9-]+)`/g) ].map(match => match[1]).filter(token => !token.startsWith('--ui-')));
    return [
        ...[ ...used ].filter(token => !tokens.has(token)).map(token => `token ${token} is used by the stylesheet but not defined in design-system.css`),
        ...[ ...used ].filter(token => !listed.has(token)).map(token => `token ${token} is used by the stylesheet but not in the Styling contract`),
        ...[ ...listed ].filter(token => !used.has(token)).map(token => `token ${token} is in the Styling contract but not used by the stylesheet`)
    ];
}

// Returns whether an "Applies when" cell follows the fixed form (guidelines, Configuration table): "Always", or terms
// joined by " + " (or ", not"), each made only of code tokens, "not", "and", "or", commas and brackets.
function isFormalCondition( text )
{
    const clean = String(text ?? '').trim();
    if ( /^always$/i.test(clean) ) { return true; }
    return clean !== '' && clean.split(/\s\+\s|,\s+(?=not\s)/i).every(part => /`[^`]+`/.test(part)
        && part.replace(/`[^`]+`/g,'').replace(/^\s*not\s/i,'').replace(/\b(and|or)\b/gi,'').replace(/[\s,()]/g,'') === '');
}

// README: table shape, "Applies when" form, Business analysis wording and codes.
function checkReadme( readme )
{
    const findings = [];
    readTables(readme).filter(table => table[0].includes('Applies when')).forEach(table =>
    {
        const column = table[0].indexOf('Applies when');
        table.slice(1).forEach(row => { if ( row[column] !== undefined && !/^-+$/.test(row[column].trim()) && !isFormalCondition(row[column]) ) { findings.push(`"Applies when" of ${row[0]} is not in the fixed form (guidelines, Configuration table): "${row[column].slice(0,60)}"`); } });
    });
    readTables(readme).forEach(table => { const size = table[0].length; table.forEach(( row, index ) => { if ( row.length !== size ) { findings.push(`table "${table[0].join(' | ').slice(0,50)}…" row ${index + 1} has ${row.length} cells, expected ${size}`); } }); });
    const lines = readBusinessAnalysis(readme), seen = new Set();
    lines.forEach(line =>
    {
        if ( !VERBS[line.actor]?.split(' ').includes(line.verb) ) { findings.push(`Business analysis wording: "${line.text.slice(0,70)}"`); }
        if ( !line.code ) { findings.push(`Business analysis line without a code: "${line.text.slice(0,70)}"`); }
        else if ( seen.has(line.code) ) { findings.push(`Business analysis code ${line.code} is used twice`); }
        seen.add(line.code);
    });
    return findings;
}

// Permanence: labels and codes of the last release still exist.
function checkPermanence( name, readme, registry )
{
    const published = registry?.components?.[name];
    if ( !published ) { return []; }
    const labels = new Set(readCatalog(name).map(entry => entry.label));
    const codes = new Set(readBusinessAnalysis(readme).map(line => line.code));
    return [
        ...published.labels.filter(label => !labels.has(label)).map(label => `label ${label} was published in ${registry.version} and is now missing (labels are retired, never renamed or removed)`),
        ...published.codes.filter(code => !codes.has(code)).map(code => `code ${code} was published in ${registry.version} and is now missing (codes are permanent)`)
    ];
}

// Runs every check on the given components and returns the number of findings.
export function runChecks( names = listComponents() )
{
    const tokens = readDesignTokens(), registry = readRegistry(), gallery = galleryEntries(), findings = {};
    for ( const name of names )
    {
        const readme = readComponentFile(name,'README.md');
        findings[name] = [ ...checkFiles(name,readme), ...checkLabels(name,readme), ...checkTokens(name,readme,tokens), ...checkReadme(readme), ...checkPermanence(name,readme,registry), ...( gallery.has(name) ? [] : [ 'no entry in gallery/variants.js (guidelines §14)' ] ) ];
    }
    return { total:printFindings(`Static checks (${names.length} components)`,findings), findings };
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const { total } = runChecks(process.argv.slice(2).length ? process.argv.slice(2) : undefined);
    process.exitCode = total ? 1 : 0;
}
