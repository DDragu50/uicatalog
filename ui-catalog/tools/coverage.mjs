// coverage.mjs
//
// COVERAGE CHECK (decision 193). Usage: node tools/coverage.mjs [component …]
// For every component with a test plan (xTESTS.md), checks that each Business analysis code of its README, each
// callback of its Callbacks table and each label of its error catalog is covered by at least one case of the plan
// (the labels the shared contract test proves for every component count as covered), that every reference in the
// plan exists, and that the plan's case IDs are unique. Components without a plan are listed; they do not fail.
// Exit code 1 when a plan leaves something uncovered.

import { listComponents, readComponentFile, readBusinessAnalysis, readCallbacks, readCatalog, readTestPlan, CONTRACT_LABELS, printFindings } from './lib.mjs';
import { pathToFileURL } from 'node:url';

// Returns { findings, summary } for one component with a plan.
function coverageOf( name )
{
    const readme = readComponentFile(name,'README.md');
    const plan = readTestPlan(name);
    const codes = readBusinessAnalysis(readme).map(line => line.code).filter(Boolean);
    const callbacks = readCallbacks(readme);
    const labels = readCatalog(name).map(entry => entry.label);
    const covered = new Set(plan.cases.flatMap(testCase => testCase.covers));
    const contract = new Set(CONTRACT_LABELS.filter(label => labels.includes(label)));
    const required = [ ...codes, ...callbacks, ...new Set(labels) ];
    const findings = [];
    required.filter(item => !covered.has(item) && !contract.has(item)).forEach(item => findings.push(`${item} is not covered by any test case`));
    const known = new Set(required);
    plan.cases.forEach(testCase => testCase.covers.filter(item => !known.has(item)).forEach(item => findings.push(`${testCase.id} covers ${item}, which is not in the README or the error catalog`)));
    const ids = plan.cases.map(testCase => testCase.id);
    ids.filter(( id, index ) => ids.indexOf(id) !== index).forEach(id => findings.push(`test case ${id} is listed twice`));
    plan.cases.filter(testCase => ![ 'auto', 'manual' ].includes(testCase.kind)).forEach(testCase => findings.push(`${testCase.id}: kind must be "auto" or "manual"`));
    const auto = plan.cases.filter(testCase => testCase.kind === 'auto').length;
    return { findings, summary:{ behaviours:codes.length, callbacks:callbacks.length, labels:new Set(labels).size, cases:plan.cases.length, auto, manual:plan.cases.length - auto, uncovered:findings.filter(item => item.endsWith('not covered by any test case')).length } };
}

// Runs the coverage check; returns { total, summaries, withoutPlan }.
export function runCoverage( names = listComponents() )
{
    const findings = {}, summaries = {}, withoutPlan = [];
    for ( const name of names )
    {
        if ( !readTestPlan(name).exists ) { withoutPlan.push(name); continue; }
        const result = coverageOf(name);
        findings[name] = result.findings;
        summaries[name] = result.summary;
    }
    const total = printFindings(`Coverage (${Object.keys(summaries).length} component(s) with a test plan)`,findings);
    Object.entries(summaries).forEach(( [ name, summary ] ) => console.log(`  ${name}: ${summary.behaviours} behaviours, ${summary.callbacks} callback(s), ${summary.labels} error labels → ${summary.cases} cases (${summary.auto} auto, ${summary.manual} manual), ${summary.uncovered} uncovered`));
    if ( withoutPlan.length ) { console.log(`  No test plan yet (${withoutPlan.length}): ${withoutPlan.join(', ')}`); }
    return { total, summaries, withoutPlan };
}

if ( import.meta.url === pathToFileURL(process.argv[1]).href )
{
    const { total } = runCoverage(process.argv.slice(2).length ? process.argv.slice(2) : undefined);
    process.exitCode = total ? 1 : 0;
}
