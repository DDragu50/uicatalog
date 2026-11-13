// release.mjs
//
// RELEASE RECORD AND STATUS REPORT (decisions 193, 194). Run only on an explicit command.
//   node tools/release.mjs <version>   runs everything; when all passes, stores the fingerprints (integrity/), the
//                                      published labels and codes (tests/published.json) and writes
//                                      reports/release-<version>.md. When something fails, the report is written as
//                                      FAILED and nothing is stored.
//   node tools/release.mjs --status    the same checks and tests on demand, plus the comparison with the stored
//                                      originals; writes reports/status-<date>.md and stores nothing.
// Steps: static checks, coverage, shared contract test, component tests, gallery, integrity. Manual test cases are
// listed in the report as a checklist for a person, and each component gets its completion status (guidelines §14):
//   complete after the manual checks   every automatic step passes for it; only its manual cases remain to be ticked
//   not yet verified                   no test plan yet, or a step reports something for it

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, TESTS, listComponents, readCatalog, readBusinessAnalysis, readComponentFile, readTestPlan } from './lib.mjs';
import { runChecks } from './check.mjs';
import { runCoverage } from './coverage.mjs';
import { writeLlmsFiles } from './llms.mjs';
import { runContract } from './contract.mjs';
import { runComponentTests } from './component-tests.mjs';
import { runGalleryCheck } from './gallery-check.mjs';
import { save, verify, printVerify } from './integrity.mjs';

// Writes the published labels and codes of every component (labels and codes are permanent from now on).
function writeRegistry( version )
{
    const components = Object.fromEntries(listComponents().map(name => [ name, {
        labels:[ ...new Set(readCatalog(name).map(entry => entry.label)) ],
        codes:readBusinessAnalysis(readComponentFile(name,'README.md')).map(line => line.code).filter(Boolean)
    } ]));
    writeFileSync(join(TESTS,'published.json'),`${JSON.stringify({ version, published:new Date().toISOString(), components },null,1)}\n`);
}

// Builds the Markdown report.
function buildReport( { title, version, date, checks, coverage, contract, components, gallery, integrity, stored, passed } )
{
    const lines = [ `# ${title}`, '', `Date: ${date} · Version: ${version} · Result: **${passed ? 'PASSED' : 'FAILED'}**`, '' ];
    lines.push('| Step | Result |','| --- | --- |');
    lines.push(`| Static checks (${listComponents().length} components) | ${checks.total ? `${checks.total} finding(s)` : 'no findings'} |`);
    lines.push(`| Coverage of the test plans | ${coverage.total ? `${coverage.total} finding(s)` : 'complete'}; ${Object.keys(coverage.summaries).length} component(s) with a plan, ${coverage.withoutPlan.length} without |`);
    lines.push(`| Shared contract test | ${contract.passed} passed, ${contract.failed} failed |`);
    lines.push(`| Component tests | ${components.passed} passed, ${components.failed} failed, ${components.manual} for a person |`);
    lines.push(`| Gallery | ${gallery.total ? `${gallery.total} finding(s)` : 'every component renders without messages'} |`);
    lines.push(`| Integrity | ${integrity === null ? 'nothing stored yet' : integrity ? `${integrity} part(s) differ from the stored originals` : 'the components are the stored originals'}${stored ? '; fingerprints stored now' : ''} |`,'');
    const failures = [];
    Object.entries(checks.findings).forEach(( [ name, list ] ) => list.forEach(item => failures.push(`${name} — check: ${item}`)));
    Object.entries(contract.report ?? {}).forEach(( [ name, results ] ) => results.filter(result => result.status === 'fail').forEach(result => failures.push(`${name} — contract ${result.check}: ${result.detail}`)));
    components.results.filter(result => result.status === 'fail').forEach(result => failures.push(`${result.component} — ${result.id}: ${result.detail}`));
    Object.entries(gallery.findings).forEach(( [ name, list ] ) => list.forEach(item => failures.push(`${name} — ${item}`)));
    if ( failures.length ) { lines.push('## Failures','',...failures.map(item => `- ${item}`),''); }
    lines.push('## Completion (guidelines §14)','','| Component | Status | Reason |','| --- | --- | --- |');
    listComponents().forEach(name =>
    {
        const reasons = [];
        if ( checks.findings[name]?.length ) { reasons.push(`${checks.findings[name].length} check finding(s)`); }
        if ( ( contract.report?.[name] ?? [] ).some(result => result.status === 'fail') ) { reasons.push('contract test fails'); }
        if ( coverage.withoutPlan.includes(name) ) { reasons.push('no test plan yet'); }
        else if ( coverage.summaries[name]?.uncovered ) { reasons.push(`${coverage.summaries[name].uncovered} item(s) not covered`); }
        const failed = components.results.filter(result => result.component === name && result.status === 'fail').length;
        if ( failed ) { reasons.push(`${failed} test case(s) fail`); }
        if ( gallery.findings[name]?.length ) { reasons.push('gallery messages'); }
        const manual = components.results.filter(result => result.component === name && result.status === 'manual').length;
        lines.push(`| ${name} | ${reasons.length ? 'not yet verified' : manual ? 'complete after the manual checks below' : 'complete'} | ${reasons.join('; ') || ( manual ? `${manual} manual case(s)` : '' )} |`);
    });
    lines.push('');
    const manual = components.results.filter(result => result.status === 'manual');
    if ( manual.length )
    {
        lines.push('## Checked by a person','','Tick each case after checking it; note the browser and the date.','');
        manual.forEach(result =>
        {
            const testCase = readTestPlan(result.component).cases.find(item => item.id === result.id);
            lines.push(`- [ ] ${result.component} ${result.id}: ${testCase?.steps ?? ''} → ${testCase?.expected ?? ''}`);
        });
        lines.push('');
    }
    if ( coverage.withoutPlan.length ) { lines.push('## Components without a test plan','',coverage.withoutPlan.join(', '),''); }
    return lines.join('\n');
}

// Runs every step; returns the report path and whether everything passed.
export async function runRelease( { version, status } )
{
    const date = new Date().toISOString().slice(0,10);
    if ( !status ) { writeLlmsFiles(); }   // a release ships llms.txt and llms-full.txt written from its own READMEs
    const checks = runChecks();
    const coverage = runCoverage();
    const contract = await runContract();
    const components = await runComponentTests();
    const gallery = await runGalleryCheck();
    const integrityResult = verify();
    const integrity = integrityResult ? printVerify(integrityResult) : ( console.log('\nIntegrity\n  Nothing stored yet.'), null );
    const passed = !checks.total && !coverage.total && !contract.failed && !components.failed && !gallery.total;
    let stored = false;
    if ( !status && passed ) { save(version); writeRegistry(version); stored = true; }
    mkdirSync(join(ROOT,'reports'),{ recursive:true });
    const file = join(ROOT,'reports',status ? `status-${date}.md` : `release-${version}.md`);
    writeFileSync(file,buildReport({ title:status ? 'UI Catalog — status report' : `UI Catalog — release ${version}`, version:status ? integrityResult?.stored.version ?? 'unreleased' : version, date, checks, coverage, contract, components, gallery, integrity, stored, passed }));
    console.log(`\n${passed ? 'PASSED' : 'FAILED'} — report: ${file}${status ? '' : passed ? ' (fingerprints and published labels stored)' : ' (nothing stored)'}`);
    return { file, passed };
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const argument = process.argv[2];
    if ( !argument ) { console.log('Usage: node tools/release.mjs <version> | --status'); process.exitCode = 1; }
    else { const { passed } = await runRelease(argument === '--status' ? { status:true } : { version:argument }); process.exitCode = passed ? 0 : 1; }
}
