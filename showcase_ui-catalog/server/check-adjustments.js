// check-adjustments.js
//
// ADJUSTMENT CHECK TOOL ("npm run check").
// For every component, reads the README Configuration table and the adjustment file (client/adjustments/<id>.js)
// exactly as the app does, and lists what still needs a decision in the adjustment file:
//   AMBIGUOUS_VALUE      an "Applies when" value belongs to several options (add tokens: { VALUE:'option' });
//   UNKNOWN_VALUE        an "Applies when" value matches no option;
//   FREE_TEXT_CONDITION  an "Applies when" text the app cannot evaluate (the option stays editable; add appliesWhen if needed);
//   UNKNOWN_OPTION       the adjustment file names an option the README does not have.
// It also reports when client/data/catalog.json does not yet know about an adjustment file (run "npm run catalog").

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SERVER_CONFIG } from './serverConfig.js';
import { reportServerIssue } from './serverErrors.js';
import { readConfigurationTable } from '../client/app/customization/readmeConfigReader.js';
import { createCustomizationModel } from '../client/app/customization/customizationModel.js';

// Returns whether a path exists.
async function exists( target ) { return Boolean(await stat(target).catch(() => null)); }

// Loads an adjustment file; returns { found, adjustment } (a broken file is reported and treated as missing).
async function loadAdjustment( id )
{
    const file = path.join(SERVER_CONFIG.adjustmentsDir,`${id}.js`);
    if ( !( await exists(file) ) ) { return { found:false, adjustment:{} }; }
    try { const module = await import(`${pathToFileURL(file).href}?check=${Date.now()}`); return { found:true, adjustment:module.default ?? {} }; }
    catch ( error ) { reportServerIssue('ADJUSTMENT_INVALID',{ id:'check', path:file, reason:error.message }); return { found:false, adjustment:{} }; }
}

// Checks one component and returns its summary row and issues.
async function checkComponent( id, catalog )
{
    const readme = await readFile(path.join(SERVER_CONFIG.componentsDir,id,`${id}README.md`),'utf8').catch(() => '');
    const table = readConfigurationTable(readme);
    const { found, adjustment } = await loadAdjustment(id);
    const model = createCustomizationModel(table,adjustment);
    const listed = catalog?.components.find(component => component.id === id)?.hasAdjustment ?? false;
    const count = type => model.issues.filter(issue => issue.type === type).length;
    return {
        row:[ id, String(table.params.length), String(model.fields.filter(field => !field.hidden).length), found ? ( listed ? 'yes' : 'yes (run npm run catalog)' ) : '—', String(count('AMBIGUOUS_VALUE') + count('UNKNOWN_VALUE')), String(count('FREE_TEXT_CONDITION')), String(count('UNKNOWN_OPTION')) ],
        issues:model.issues
    };
}

// Prints rows as an aligned text table.
function printTable( header, rows )
{
    const widths = header.map(( title, index ) => Math.max(title.length,...rows.map(row => row[index].length)));
    const line = row => row.map(( cell, index ) => cell.padEnd(widths[index])).join(' | ');
    console.log([ line(header), widths.map(width => '-'.repeat(width)).join('-|-'), ...rows.map(line) ].join('\n'));
}

// Runs the check for all components and prints the summary and the details.
async function checkAdjustments()
{
    const entries = await readdir(SERVER_CONFIG.componentsDir,{ withFileTypes:true }).catch(() => []);
    const ids = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    if ( !ids.length ) { reportServerIssue('COMPONENTS_NOT_FOUND',{ id:'check', path:SERVER_CONFIG.componentsDir }); process.exitCode = 1; return; }
    const catalog = JSON.parse(await readFile(SERVER_CONFIG.catalogFile,'utf8').catch(() => 'null'));
    const results = await Promise.all(ids.map(id => checkComponent(id,catalog)));
    printTable([ 'Component', 'Options', 'In panel', 'Adjustment file', 'Unresolved values', 'Free-text conditions', 'Unknown options' ],results.map(result => result.row));
    results.filter(result => result.issues.length).forEach(( result ) =>
    {
        console.log(`\n${result.row[0]}`);
        result.issues.forEach(issue => console.log(`  ${issue.type.padEnd(20)} ${issue.path}: ${issue.value}${issue.candidates.length ? `  (options: ${issue.candidates.join(', ')})` : ''}`));
    });
}

checkAdjustments().catch(error => { reportServerIssue('SERVER_FAILED',{ id:'check', reason:error.message }); process.exitCode = 1; });
