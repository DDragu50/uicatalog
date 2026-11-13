// sync-components.js
//
// COMPONENT COPY TOOL ("npm run sync").
// Copies the components from the original library (../ui-catalog/source, never modified) into the app:
//   - JavaScript and README  → client/components/<name>/      always replaced (exact copies of the original);
//   - CSS and design tokens  → client/local-styling/, ONLY when missing, so your styling is never overwritten
//                              (differences from the original are listed); system files: design-system.css and
//                              app-shell.css. local-styling receives only the stylesheets client/index.html loads
//                              (every CSS file is used or deleted); a local stylesheet the app does not load is listed
//                              for deletion;
//   - client/showcase-styling/ (the look of the live examples) is NOT synced by default (decision 109): stylesheets
//                              missing there are only listed. "npm run sync:showcase" (or "npm run sync -- --showcase")
//                              copies the missing ones — use it only after approving that the live examples change;
//   - the guides             → client/content/                 always replaced (the component development guidelines,
//                              how-to-use-the-framework.md and how-to-build-a-design-system.md);
//   - the licence            → client/content/LICENSE.txt      always replaced (ui-catalog/LICENSE, linked from the footer).

import { copyFile, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { SERVER_CONFIG } from './serverConfig.js';
import { reportServerIssue } from './serverErrors.js';

const GUIDE_FILES = [ 'framework-component-development-guidelines.md', 'how-to-use-the-framework.md', 'how-to-build-a-design-system.md' ];
const SYSTEM_STYLESHEETS = [ 'design-system.css', 'app-shell.css' ];

// Returns whether a path exists.
async function exists( target ) { return Boolean(await stat(target).catch(() => null)); }

// Returns whether two files have identical content.
async function sameContent( first, second ) { const [ a, b ] = await Promise.all([ readFile(first), readFile(second) ]); return a.equals(b); }

// Lists the component folders of the original library (folders that contain <name>Index.js).
async function listSourceComponents( componentsSource )
{
    const entries = await readdir(componentsSource,{ withFileTypes:true });
    const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    const checks = await Promise.all(folders.map(name => exists(path.join(componentsSource,name,`${name}Index.js`))));
    return folders.filter(( name, index ) => checks[index]);
}

// Mirrors the JavaScript and README files of one component; removes copies of files that no longer exist in the original.
async function syncComponentCode( name, componentsSource, report )
{
    const sourceFolder = path.join(componentsSource,name);
    const targetFolder = path.join(SERVER_CONFIG.componentsDir,name);
    await mkdir(targetFolder,{ recursive:true });
    const sourceFiles = ( await readdir(sourceFolder) ).filter(file => file.endsWith('.js') || file.endsWith('.md'));
    for ( const file of sourceFiles )
    {
        const target = path.join(targetFolder,file);
        const changed = !( await exists(target) ) || !( await sameContent(path.join(sourceFolder,file),target) );
        if ( changed ) { await copyFile(path.join(sourceFolder,file),target); report.code.push(`${name}/${file}`); }
    }
    const stale = ( await readdir(targetFolder) ).filter(file => !sourceFiles.includes(file));
    for ( const file of stale ) { await rm(path.join(targetFolder,file)); report.removed.push(`${name}/${file}`); }
}

// Returns the local-styling file names that client/index.html loads.
async function listAppStylesheets()
{
    const html = await readFile(path.join(SERVER_CONFIG.clientDir,'index.html'),'utf8').catch(() => '');
    return new Set([ ...html.matchAll(/href="local-styling\/([^"]+\.css)"/g) ].map(match => match[1]));
}

// Copies one stylesheet into a styling folder only when it is missing (local-styling: only when the app loads it);
// records when the kept copy differs from the original.
async function syncStylesheet( source, stylingDir, label, report, used )
{
    const target = path.join(stylingDir,path.basename(source));
    if ( used && !used.has(path.basename(source)) ) { if ( await exists(target) ) { report.unused.push(`${label}/${path.basename(source)}`); } return; }
    if ( !( await exists(target) ) ) { await mkdir(stylingDir,{ recursive:true }); await copyFile(source,target); report.styles.push(`${label}/${path.basename(source)}`); return; }
    if ( !( await sameContent(source,target) ) ) { report.different.push(`${label}/${path.basename(source)}`); }
}

// Prints one titled list, or nothing when it is empty.
function printList( title, items ) { if ( items.length ) { console.log(`\n${title} (${items.length}):`); items.forEach(item => console.log(`  ${item}`)); } }

// Runs the copy and prints what changed.
async function syncComponents()
{
    const componentsSource = path.join(SERVER_CONFIG.sourceDir,'components-js');
    if ( !( await exists(componentsSource) ) ) { reportServerIssue('SOURCE_NOT_FOUND',{ id:'sync', path:componentsSource }); process.exitCode = 1; return; }

    const report = { code:[], removed:[], styles:[], different:[], unused:[] };
    const appStylesheets = await listAppStylesheets();
    const components = await listSourceComponents(componentsSource);
    // showcase-styling only on request (--showcase); otherwise its missing stylesheets are listed, nothing is copied
    const withShowcase = process.argv.includes('--showcase');
    const stylingFolders = [ [ SERVER_CONFIG.appStylingDir,'local-styling' ], ...( withShowcase ? [ [ SERVER_CONFIG.showcaseStylingDir,'showcase-styling' ] ] : [] ) ];
    const showcaseMissing = [];
    const noteShowcase = async source => { if ( !withShowcase && !( await exists(path.join(SERVER_CONFIG.showcaseStylingDir,path.basename(source))) ) ) { showcaseMissing.push(`showcase-styling/${path.basename(source)}`); } };
    for ( const name of components )
    {
        await syncComponentCode(name,componentsSource,report);
        const css = path.join(componentsSource,name,`${name}.css`);
        if ( await exists(css) ) { for ( const [ dir, label ] of stylingFolders ) { await syncStylesheet(css,dir,label,report,dir === SERVER_CONFIG.appStylingDir ? appStylesheets : null); } await noteShowcase(css); }
    }
    for ( const file of SYSTEM_STYLESHEETS ) { for ( const [ dir, label ] of stylingFolders ) { await syncStylesheet(path.join(SERVER_CONFIG.sourceDir,file),dir,label,report); } await noteShowcase(path.join(SERVER_CONFIG.sourceDir,file)); }

    await mkdir(SERVER_CONFIG.contentDir,{ recursive:true });
    for ( const file of GUIDE_FILES )
    {
        const guide = path.join(componentsSource,file), target = path.join(SERVER_CONFIG.contentDir,file);
        if ( await exists(guide) && ( !( await exists(target) ) || !( await sameContent(guide,target) ) ) ) { await copyFile(guide,target); report.code.push(`content/${file}`); }
    }
    const license = path.join(path.dirname(SERVER_CONFIG.sourceDir),'LICENSE'), licenseTarget = path.join(SERVER_CONFIG.contentDir,'LICENSE.txt');
    if ( await exists(license) && ( !( await exists(licenseTarget) ) || !( await sameContent(license,licenseTarget) ) ) ) { await copyFile(license,licenseTarget); report.code.push('content/LICENSE.txt'); }

    console.log(`Source: ${SERVER_CONFIG.sourceDir}`);
    console.log(`Components found: ${components.length} (${components.join(', ')})`);
    printList('Copied or updated (code, READMEs, guides)',report.code);
    printList('Removed (no longer in the original)',report.removed);
    printList('Stylesheets copied (were missing)',report.styles);
    printList('Stylesheets kept although the original differs (your styling, or the original changed)',report.different);
    printList('Stylesheets the app does not load (delete them; not copied when missing)',report.unused);
    printList('Missing in showcase-styling, NOT copied (the live examples of these components are unstyled; after approving, run "npm run sync:showcase")',showcaseMissing);
    if ( !withShowcase ) { console.log('\nshowcase-styling was not synced (default). The live examples keep their look.'); }
    if ( !report.code.length && !report.removed.length && !report.styles.length ) { console.log('\nEverything was already up to date.'); }
    console.log('\nNext: run "npm run catalog" when components or their imports changed.');
}

syncComponents().catch(error => { reportServerIssue('SERVER_FAILED',{ id:'sync', reason:error.message }); process.exitCode = 1; });
