// readmeConfigReader.js
//
// README CONFIGURATION READER.
// Reads the "### Configuration" table of a component README (GitHub pipe table, guideline §15) into parameter
// definitions: path, input kind, default, allowed values, description and the "Applies when" terms.
// Pure functions without DOM access; also used by server/check-adjustments.js.

import { parseValueLiteral } from './valueLiteral.js';

const ENUM_TOKEN = /^[A-Z][A-Z0-9_]*$/;
const SIMPLE_PATH = /^[A-Za-z]\w*(\.[A-Za-z]\w*)*$/;

// Splits a table row into cells; "\|" is a literal pipe inside a cell (GitHub table syntax).
function splitRow( line ) { return line.trim().replace(/^\|/,'').replace(/(?<!\\)\|$/,'').split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g,'|')); }

// Returns the backticked parts of a cell, in order.
function codeParts( text ) { return [ ...String(text).matchAll(/`([^`]+)`/g) ].map(match => match[1].trim()); }

// Removes inline Markdown marks and returns plain text.
function toPlainText( text ) { return String(text ?? '').replace(/`([^`]+)`/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').trim(); }

// Returns the lines of the table that follows "### Configuration" (up to the first non-table line after it).
function findConfigurationLines( readme )
{
    const lines = String(readme ?? '').replace(/\r\n?/g,'\n').split('\n');
    const start = lines.findIndex(line => /^###\s+Configuration\s*$/.test(line));
    if ( start < 0 ) { return { table:[], notes:[] }; }
    const table = [], notes = [];
    for ( let index = start + 1; index < lines.length && !/^#{1,3}\s/.test(lines[index]); index++ )
    {
        if ( /^\s*\|/.test(lines[index]) ) { if ( notes.length && table.length ) { break; } table.push(lines[index]); }
        else if ( lines[index].trim() && table.length ) { notes.push(lines[index].trim()); }
    }
    return { table, notes };
}

// Parses a default cell: the first backticked literal ('TEXT', 160, false, null, [ … ] …); text such as "value of `size`" means "no fixed default".
export function parseDefault( text )
{
    const match = String(text ?? '').trim().match(/^`([^`]*)`/);
    if ( !match ) { return undefined; }
    const literal = match[1].trim();
    if ( /^'.*'$/.test(literal) || /^".*"$/.test(literal) ) { return literal.slice(1,-1); }
    if ( literal === 'true' || literal === 'false' ) { return literal === 'true'; }
    if ( literal === 'null' ) { return null; }
    if ( /^-?\d+(\.\d+)?$/.test(literal) ) { return Number(literal); }
    try { return parseValueLiteral(literal); } catch { return undefined; }
}

// Returns the input kind for a README type and its allowed values: enum, boolean, number, string, json, function or element.
export function kindOf( type, allowed )
{
    const value = String(type ?? '').toLowerCase().replace(/\s+/g,' ').trim();
    if ( value.includes('function') ) { return 'function'; }
    if ( value.includes('element') ) { return 'element'; }
    if ( allowed.length >= 2 && value.startsWith('string') && !value.includes('object') && !value.includes('array') ) { return 'enum'; }
    if ( value === 'boolean' ) { return 'boolean'; }
    if ( /^number( \| null)?$/.test(value) ) { return 'number'; }
    if ( value.startsWith('string') && !value.includes('object') && !value.includes('array') ) { return 'string'; }
    return 'json';
}

// Splits an "Applies when" cell into terms joined by "+": { text, negate, tokens, freeText }. "Always" gives no terms.
export function parseAppliesWhen( text )
{
    const clean = String(text ?? '').trim();
    if ( !clean || /^always\b/i.test(clean) ) { return []; }
    return clean.split(/\s\+\s|,\s+(?=not\s)/i).map(part =>
    {
        const negate = /^\s*not\s/i.test(part);
        const tokens = codeParts(part);
        const rest = part.replace(/`[^`]+`/g,'').replace(/^\s*not\s/i,'').replace(/\b(and|or)\b/gi,'').replace(/[\s,()]/g,'');
        return { text:part.trim(), negate, tokens, freeText:rest.length > 0 || tokens.length === 0 };
    });
}

// Reads the Configuration table of a README; returns { params, skipped, notes }.
// params: [{ path, type, kind, defaultValue, defaultText, allowed, appliesText, terms, description }]
// skipped: rows that are not a single editable option (patterns such as texts.*, texts.errors.{LABEL}, options[].value).
export function readConfigurationTable( readme )
{
    const { table, notes } = findConfigurationLines(readme);
    const result = { params:[], skipped:[], notes };
    if ( table.length < 2 ) { return result; }
    const header = splitRow(table[0]).map(cell => cell.toLowerCase());
    const column = name => header.findIndex(cell => cell.startsWith(name));
    const index = { path:column('parameter'), type:column('type'), defaultValue:column('default'), allowed:column('allowed'), applies:column('applies'), description:column('usage') };
    table.slice(2).forEach(line =>
    {
        const cells = splitRow(line);
        const cell = key => ( index[key] >= 0 ? cells[index[key]] ?? '' : '' );
        // "`texts.navigation` / `more`" is shorthand for texts.navigation and texts.more.
        const written = codeParts(cell('path'));
        const parent = written[0]?.includes('.') ? written[0].slice(0,written[0].lastIndexOf('.') + 1) : '';
        const paths = written.map(( path, position ) => ( position && parent && !path.includes('.') ? `${parent}${path}` : path ));
        const defaults = cell('defaultValue').split(/\s+\/\s+/);
        const allowed = [ ...new Set(codeParts(cell('allowed')).filter(token => ENUM_TOKEN.test(token))) ];
        paths.forEach(( path, position ) =>
        {
            if ( !SIMPLE_PATH.test(path) ) { result.skipped.push({ path, reason:'pattern' }); return; }
            const defaultText = paths.length > 1 && defaults.length === paths.length ? defaults[position] : cell('defaultValue');
            const appliesParts = cell('applies').split(/\s+\/\s+/);
            const appliesText = index.applies < 0 ? 'Always' : ( paths.length > 1 && appliesParts.length === paths.length ? appliesParts[position] : cell('applies') );
            result.params.push(
            {
                path, type:cell('type'), kind:kindOf(cell('type'),allowed), defaultValue:parseDefault(defaultText), defaultText:toPlainText(defaultText),
                allowed, appliesText, terms:parseAppliesWhen(appliesText),
                description:toPlainText(cell('description'))
            });
        });
    });
    return result;
}

// Returns the callback arguments of the render function as written in "### Public API",
// e.g. renderTextInput(container, config, onValueChange, onValidation) → [ 'onValueChange', 'onValidation' ].
export function readRenderCallbacks( readme )
{
    const section = String(readme ?? '').split(/^### Public API\s*$/m)[1]?.split(/^### /m)[0] ?? '';
    const match = section.match(/render[A-Z]\w*\(([^)]*)\)/);
    if ( !match ) { return []; }
    return match[1].split(',').map(part => part.trim()).slice(2).map(name => ( /^on[A-Z]\w*$/.test(name) ? name : '' ));
}
