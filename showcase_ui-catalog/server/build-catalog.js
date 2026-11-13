// build-catalog.js
//
// CATALOG BUILDER ("npm run catalog").
// Reads the component copies in client/components (their imports and READMEs) and server/catalog-rules.json,
// computes dependencies, groups and keywords, writes client/data/catalog.json and prints the result.
// Dependencies are counted in full: the components a component imports (direct) and, recursively, everything those
// import (indirect, "through" a direct one). Groups, dependency keywords, "Uses" and "Used by" all use the full list.
// Optional dependencies (decision 209) are the components loaded only when an option asks for them (a dynamic
// import('../x/xIndex.js'), e.g. Tooltip for tooltipMode TOOLTIP), also through a dependency; they are listed as
// "Can use" / "Can be used by" and do not count for groups or dependency keywords.

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SERVER_CONFIG } from './serverConfig.js';
import { reportServerIssue } from './serverErrors.js';

// Matches imports of another component's public entry point: from '../button/buttonIndex.js'.
const COMPONENT_IMPORT = /from\s+['"]\.\.\/([A-Za-z0-9]+)\/\1Index\.js['"]/g;
// Matches dynamic imports of another component's public entry point: import('../tooltip/tooltipIndex.js').
const OPTIONAL_IMPORT = /import\(\s*['"]\.\.\/([A-Za-z0-9]+)\/\1Index\.js['"]\s*\)/g;

// Returns whether a path exists.
async function exists( target ) { return Boolean(await stat(target).catch(() => null)); }

// Removes inline Markdown marks (code, bold, italic, links) and returns plain text.
function toPlainText( markdown ) { return markdown.replace(/`([^`]+)`/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').trim(); }

// Returns the first sentence of a paragraph.
// Returns the first sentence: up to the first . ! or ? followed by a space or the end, not counting abbreviations
// (e.g., i.e., etc.) or a full stop inside parentheses.
function firstSentence( text )
{
    const ends = /[.!?](?=\s|$)/g;
    let match;
    while ( ( match = ends.exec(text) ) )
    {
        const candidate = text.slice(0,match.index + 1);
        const open = ( candidate.match(/\(/g) ?? [] ).length - ( candidate.match(/\)/g) ?? [] ).length;
        if ( open <= 0 && !/\b(e\.g|i\.e|etc|vs)\.$/i.test(candidate) ) { return candidate; }
    }
    return text;
}

// Reads the display name (# heading) and the first sentence of "### Overview" from a README.
function readReadmeSummary( readme )
{
    const lines = readme.replace(/\r/g,'').split('\n');
    const name = ( lines.find(line => /^#\s+/.test(line)) ?? '' ).replace(/^#\s+/,'').trim();
    const start = lines.findIndex(line => /^###\s+Overview\s*$/.test(line));
    const paragraph = start < 0 ? '' : ( lines.slice(start + 1).find(line => line.trim() && !line.startsWith('#')) ?? '' );
    return { name, summary:firstSentence(toPlainText(paragraph)) };
}

// Reads one component folder: direct dependencies from its imports, name and summary from its README,
// and whether client/adjustments/<id>.js exists.
async function readComponent( id )
{
    const folder = path.join(SERVER_CONFIG.componentsDir,id);
    const files = await readdir(folder);
    const sources = await Promise.all(files.filter(file => file.endsWith('.js')).map(file => readFile(path.join(folder,file),'utf8')));
    const importsOf = pattern => [ ...new Set(sources.flatMap(source => [ ...source.matchAll(pattern) ].map(match => match[1]))) ].filter(name => name !== id).sort();
    const directDependencies = importsOf(COMPONENT_IMPORT);
    const directOptional = importsOf(OPTIONAL_IMPORT).filter(name => !directDependencies.includes(name));
    const readmeFile = path.join(folder,`${id}README.md`);
    if ( !( await exists(readmeFile) ) ) { reportServerIssue('README_MISSING',{ id:'catalog', value:id }); return { id, name:id, summary:'', directDependencies, directOptional, hasAdjustment:false }; }
    const { name, summary } = readReadmeSummary(await readFile(readmeFile,'utf8'));
    return { id, name:name || id, summary, directDependencies, directOptional, hasAdjustment:await exists(path.join(SERVER_CONFIG.adjustmentsDir,`${id}.js`)) };
}

// Completes every component with its full dependency list: the direct imports and, recursively, theirs.
//   dependencies:    all components it needs (direct and indirect), sorted;
//   dependencyVia:   for each indirect dependency, the direct dependency it comes through (the first one, alphabetically);
//   optional:        components loaded only on demand, by itself or by one of its dependencies (not in dependencies);
//   optionalVia:     for each optional one that a dependency loads, that dependency (the first one, alphabetically);
// A cycle (a component that needs itself through others) is reported; the walk stops there, so it cannot loop.
function resolveDependencies( components )
{
    const byId = new Map(components.map(component => [ component.id, component ]));
    const full = new Map();
    // Returns the full dependency set of a component; "trail" holds the components being resolved (cycle detection).
    const resolve = ( id, trail = [] ) =>
    {
        if ( full.has(id) ) { return full.get(id); }
        if ( trail.includes(id) ) { reportServerIssue('DEPENDENCY_CYCLE',{ id:'catalog', value:[ ...trail, id ].join(' → ') }); return new Set(); }
        const result = new Set();
        ( byId.get(id)?.directDependencies ?? [] ).filter(dependency => byId.has(dependency)).forEach(dependency => { result.add(dependency); resolve(dependency,[ ...trail, id ]).forEach(item => result.add(item)); });
        result.delete(id);
        full.set(id,result);
        return result;
    };
    return components.map(component =>
    {
        const dependencies = [ ...resolve(component.id) ].sort();
        const dependencyVia = Object.fromEntries(dependencies.filter(dependency => !component.directDependencies.includes(dependency))
            .map(dependency => [ dependency, component.directDependencies.find(direct => resolve(direct).has(dependency)) ]));
        const ownOptional = ( component.directOptional ?? [] ).filter(id => byId.has(id));
        const optionalOf = id => byId.get(id)?.directOptional ?? [];
        const optional = [ ...new Set([ ...ownOptional, ...dependencies.flatMap(optionalOf) ]) ].filter(id => id !== component.id && !dependencies.includes(id) && byId.has(id)).sort();
        const optionalVia = Object.fromEntries(optional.filter(id => !ownOptional.includes(id)).map(id => [ id, dependencies.find(dependency => optionalOf(dependency).includes(id)) ]));
        return { ...component, dependencies, dependencyVia, optional, optionalVia };
    });
}

// Returns the component ids a group rule selects; unknown hand-picked ids are reported and ignored.
function selectGroupMembers( group, components )
{
    const rule = group.rule ?? {};
    const known = new Set(components.map(component => component.id));
    if ( Array.isArray(rule.components) )
    {
        rule.components.filter(id => !known.has(id)).forEach(id => reportServerIssue('UNKNOWN_COMPONENT',{ id:'catalog', key:`group "${group.id}"`, value:id }));
        return components.filter(component => rule.components.includes(component.id)).map(component => component.id);
    }
    return components.filter(component =>
        ( rule.maxDependencies === undefined || component.dependencies.length <= rule.maxDependencies )
        && ( rule.minDependencies === undefined || component.dependencies.length >= rule.minDependencies )).map(component => component.id);
}

// Returns the dependency keyword of a component from rules.dependencyKeywords ("{count}" is replaced by the number),
// or '' when the rule is missing.
function dependencyKeyword( count, labels )
{
    if ( !labels ) { return ''; }
    const label = count === 0 ? labels.none : count === 1 ? labels.one : labels.many;
    return ( label ?? '' ).replace('{count}',String(count));
}

// Builds the catalog object written to client/data/catalog.json.
function buildCatalog( components, rules )
{
    const known = new Set(components.map(component => component.id));
    const byName = ( a, b ) => a.name.localeCompare(b.name);
    const groups = ( rules.groups ?? [] ).map(group => ( { id:group.id, label:group.label, icon:group.icon ?? '', description:group.description ?? '', components:selectGroupMembers(group,[ ...components ].sort(byName)) } ));
    const keywordRules = rules.keywords ?? {};
    Object.entries(keywordRules).forEach(( [ keyword, ids ] ) => ids.filter(id => !known.has(id)).forEach(id => reportServerIssue('UNKNOWN_COMPONENT',{ id:'catalog', key:`keyword "${keyword}"`, value:id })));
    const entries = [ ...components ].sort(byName).map(component =>
    {
        const groupIds = groups.filter(group => group.components.includes(component.id)).map(group => group.id);
        if ( !groupIds.length ) { reportServerIssue('COMPONENT_WITHOUT_GROUP',{ id:'catalog', value:component.id }); }
        const keywords = Object.entries(keywordRules).filter(( [ , ids ] ) => ids.includes(component.id)).map(( [ keyword ] ) => keyword).sort();
        const consumers = components.filter(other => other.dependencies.includes(component.id));
        const usedBy = consumers.map(other => other.id).sort();
        // for a consumer that needs this component indirectly: the consumer's direct dependency it comes through
        const usedByVia = Object.fromEntries(consumers.filter(other => other.dependencyVia[component.id]).map(other => [ other.id, other.dependencyVia[component.id] ]));
        // components that can load this one on demand (optional dependency), with the dependency it comes through
        const optionalConsumers = components.filter(other => ( other.optional ?? [] ).includes(component.id));
        const optionalUsedBy = optionalConsumers.map(other => other.id).sort();
        const optionalUsedByVia = Object.fromEntries(optionalConsumers.filter(other => other.optionalVia?.[component.id]).map(other => [ other.id, other.optionalVia[component.id] ]));
        const dependencyIds = dependencyKeyword(component.dependencies.length,rules.dependencyKeywords);
        return { ...component, usedBy, usedByVia, optionalUsedBy, optionalUsedByVia, groups:groupIds, keywords:[ ...groupIds, ...keywords, ...( dependencyIds ? [ dependencyIds ] : [] ) ] };
    });
    // Keyword list: the group and hand-picked keywords alphabetically, then the dependency keywords by number.
    const byCount = [ ...entries ].sort(( a, b ) => a.dependencies.length - b.dependencies.length);
    const counted = new Set(byCount.map(entry => dependencyKeyword(entry.dependencies.length,rules.dependencyKeywords)).filter(Boolean));
    const named = [ ...new Set(entries.flatMap(entry => entry.keywords)) ].filter(keyword => !counted.has(keyword)).sort();
    return { generatedAt:new Date().toISOString(), groups, components:entries, keywords:[ ...named, ...counted ] };
}

// Prints the resulting assignment as a readable table.
function printCatalog( catalog )
{
    const withAdjustment = catalog.components.filter(component => component.hasAdjustment).map(component => component.name);
    const names = Object.fromEntries(catalog.components.map(component => [ component.id, component.name ]));
    const rows = catalog.components.map(component => [ component.name, component.dependencies.map(id => `${names[id] ?? id}${component.dependencyVia[id] ? '*' : ''}`).join(', ') || '—', component.groups.join(', ') || '(none)', component.keywords.join(', ') ]);
    const header = [ 'Component', 'Depends on (* = through another)', 'Groups', 'Keywords' ];
    const widths = header.map(( title, index ) => Math.max(title.length,...rows.map(row => row[index].length)));
    const line = row => row.map(( cell, index ) => cell.padEnd(widths[index])).join(' | ');
    console.log([ line(header), widths.map(width => '-'.repeat(width)).join('-|-'), ...rows.map(line) ].join('\n'));
    console.log(`\n${catalog.groups.map(group => `${group.label}: ${group.components.length}`).join(' · ')}`);
    console.log(`Adjustment files: ${withAdjustment.length ? withAdjustment.join(', ') : 'none'}`);
}

// Runs the build and writes the catalog file.
async function buildCatalogFile()
{
    let rules = null;
    try { rules = JSON.parse(await readFile(SERVER_CONFIG.catalogRulesFile,'utf8')); }
    catch ( error ) { reportServerIssue('CATALOG_RULES_INVALID',{ id:'catalog', path:SERVER_CONFIG.catalogRulesFile, reason:error.message }); process.exitCode = 1; return; }

    const entries = await readdir(SERVER_CONFIG.componentsDir,{ withFileTypes:true }).catch(() => []);
    const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    const checks = await Promise.all(folders.map(id => exists(path.join(SERVER_CONFIG.componentsDir,id,`${id}Index.js`))));
    const ids = folders.filter(( id, index ) => checks[index]);
    if ( !ids.length ) { reportServerIssue('COMPONENTS_NOT_FOUND',{ id:'catalog', path:SERVER_CONFIG.componentsDir }); process.exitCode = 1; return; }

    const catalog = buildCatalog(resolveDependencies(await Promise.all(ids.map(readComponent))),rules);
    await mkdir(path.dirname(SERVER_CONFIG.catalogFile),{ recursive:true });
    await writeFile(SERVER_CONFIG.catalogFile,`${JSON.stringify(catalog,null,2)}\n`,'utf8');
    printCatalog(catalog);
    console.log(`\nWritten: ${path.relative(SERVER_CONFIG.projectDir,SERVER_CONFIG.catalogFile)}`);
}

buildCatalogFile().catch(error => { reportServerIssue('SERVER_FAILED',{ id:'catalog', reason:error.message }); process.exitCode = 1; });
