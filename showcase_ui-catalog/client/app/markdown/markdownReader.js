// markdownReader.js
//
// MARKDOWN READER.
// Converts the Markdown used by the library's READMEs and guidelines into safe HTML: headings, paragraphs,
// nested lists, GitHub pipe tables, fenced code with its language, block quotes, rules, and inline code,
// bold, italic, links and line breaks (<br>). All text is escaped; only links to web, mail, page-internal or relative addresses are kept.

import { APP_TEXTS } from '../appConfig.js';

const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const COMMENT = /^\s*<!--.*-->\s*$/;
// Hidden test codes at the end of README Business analysis lines (decision 193), never shown (only at a line's end,
// so a code quoted inside a sentence or inline code stays visible).
const TEST_CODE = /[ \t]*<!--\s*BA-\d+\s*-->[ \t]*$/gm;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const SAFE_HREF = /^(https?:\/\/|mailto:|#|\.{0,2}\/|[\w-]+(\.[\w-]+)*\.(md|html)(#[\w-]*)?$)/i;

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the number of leading spaces of a line (a tab counts as four).
function indentOf( line ) { return line.replace(/\t/g,'    ').match(/^ */)[0].length; }

// Renders bold, italic, links and line breaks (<br>) in a piece of text that contains no code span.
function renderEmphasis( text )
{
    let html = escapeHTML(text);
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,( match, label, href ) => ( SAFE_HREF.test(href.replace(/&amp;/g,'&')) ? `<a href="${href}">${label}</a>` : label ));
    html = html.replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g,'<strong>$1</strong>');
    html = html.replace(/(^|[^*\w])\*(?=\S)([^*]+?)(?<=\S)\*(?![*\w])/g,'$1<em>$2</em>');
    html = html.replace(/&lt;br\s*\/?&gt;/gi,'<br>');   // an HTML line break (<br> or <br/>) is kept; all other HTML stays text
    return html;
}

// Renders inline Markdown: code spans are kept literally, the text around them gets emphasis and links.
function renderInline( text )
{
    let html = '', last = 0;
    for ( const match of text.matchAll(/(`+)(.+?)\1(?!`)/g) )
    {
        html += renderEmphasis(text.slice(last,match.index));
        const code = /^ .+ $/.test(match[2]) ? match[2].slice(1,-1) : match[2];
        html += `<code>${escapeHTML(code)}</code>`;
        last = match.index + match[0].length;
    }
    return html + renderEmphasis(text.slice(last));
}

// Splits a table row into cells; "\|" is a literal pipe inside a cell (GitHub table syntax).
function splitTableRow( line ) { return line.trim().replace(/^\|/,'').replace(/(?<!\\)\|$/,'').split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g,'|')); }

// Returns the alignment class part of each column from the separator row.
function readAlignments( separator ) { return splitTableRow(separator).map(cell => ( cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'end' : '' )); }

// Renders a pipe table starting at index; returns { html, next }.
function renderTable( lines, index )
{
    const header = splitTableRow(lines[index]);
    const alignments = readAlignments(lines[index + 1]);
    const cell = ( tag, text, column ) => `<${tag}${alignments[column] ? ` class="app-markdown-align-${alignments[column]}"` : ''}>${renderInline(text)}</${tag}>`;
    let next = index + 2, body = '';
    while ( next < lines.length && TABLE_ROW.test(lines[next]) ) { body += `<tr>${splitTableRow(lines[next]).map(( text, column ) => cell('td',text,column)).join('')}</tr>`; next++; }
    const html = `<div class="app-markdown-table" role="region" tabindex="0" aria-label="${escapeHTML(APP_TEXTS.markdown.table)}"><table><thead><tr>${header.map(( text, column ) => cell('th',text,column)).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
    return { html, next };
}

// Renders a fenced code block starting at index; returns { html, next }. The closing fence uses the same characters.
function renderCode( lines, index )
{
    const [ , fence, language ] = lines[index].match(FENCE);
    const code = [];
    let next = index + 1;
    while ( next < lines.length && !( lines[next].trim().startsWith(fence) && FENCE.test(lines[next]) && !lines[next].trim().slice(fence.length).trim() ) ) { code.push(lines[next]); next++; }
    const name = language ? APP_TEXTS.markdown.codeLanguage.replace('{language}',language) : APP_TEXTS.markdown.code;
    const label = language ? `<span class="app-markdown-code-language" aria-hidden="true">${escapeHTML(language)}</span>` : '';
    const html = `<div class="app-markdown-code">${label}<pre role="region" tabindex="0" aria-label="${escapeHTML(name)}"><code${language ? ` data-language="${escapeHTML(language)}"` : ''}>${escapeHTML(code.join('\n'))}</code></pre></div>`;
    return { html, next:Math.min(next + 1,lines.length) };
}

// Removes the common leading indentation of the given lines.
function dedent( lines )
{
    const indents = lines.filter(line => line.trim()).map(indentOf);
    const remove = indents.length ? Math.min(...indents) : 0;
    return lines.map(line => line.replace(/\t/g,'    ').slice(Math.min(remove,indentOf(line))));
}

// Returns the index of the next non-blank line at or after index, or -1.
function nextFilled( lines, index ) { for ( let next = index; next < lines.length; next++ ) { if ( lines[next].trim() ) { return next; } } return -1; }

// Renders a list (ordered or not) starting at index, with nested blocks; returns { html, next }.
function renderList( lines, index, options )
{
    const first = lines[index].match(LIST_ITEM);
    const indent = indentOf(first[1]);
    const ordered = /\d/.test(first[2]);
    const start = ordered ? parseInt(first[2],10) : 1;
    let html = ordered ? `<ol${start !== 1 ? ` start="${start}"` : ''}>` : '<ul>';
    let next = index;
    while ( next < lines.length )
    {
        const item = lines[next].match(LIST_ITEM);
        if ( !item || indentOf(item[1]) !== indent || /\d/.test(item[2]) !== ordered ) { break; }
        const contentIndent = indent + item[2].length + 1;
        const text = [ item[3] ], children = [];
        next++;
        while ( next < lines.length )
        {
            const line = lines[next];
            if ( !line.trim() )
            {
                const filled = nextFilled(lines,next);
                if ( filled < 0 || indentOf(lines[filled]) < contentIndent ) { break; }
                children.push(line); next++; continue;
            }
            if ( indentOf(line) >= contentIndent || ( children.length && indentOf(line) > indent ) ) { children.push(line); next++; continue; }
            if ( !children.length && !LIST_ITEM.test(line) && !FENCE.test(line) && !HEADING.test(line) && !TABLE_ROW.test(line) && !QUOTE.test(line) && indentOf(line) > indent ) { text.push(line.trim()); next++; continue; }
            break;
        }
        html += `<li>${renderInline(text.join(' '))}${children.length ? renderBlocks(dedent(children),options) : ''}</li>`;
        const filled = nextFilled(lines,next);
        if ( filled > next ) { const following = lines[filled].match(LIST_ITEM); if ( following && indentOf(following[1]) === indent && /\d/.test(following[2]) === ordered ) { next = filled; } }
    }
    return { html:`${html}${ordered ? '</ol>' : '</ul>'}`, next };
}

// Returns whether a line starts a block other than a paragraph (used to end paragraphs).
function startsBlock( lines, index ) { const line = lines[index]; return FENCE.test(line) || HEADING.test(line) || RULE.test(line) || LIST_ITEM.test(line) || QUOTE.test(line) || COMMENT.test(line) || ( TABLE_ROW.test(line) && TABLE_SEPARATOR.test(lines[index + 1] ?? '') ); }

// Renders a sequence of Markdown lines as HTML blocks.
function renderBlocks( lines, options )
{
    let html = '', index = 0;
    while ( index < lines.length )
    {
        const line = lines[index];
        if ( !line.trim() || COMMENT.test(line) ) { index++; continue; }
        if ( FENCE.test(line) ) { const block = renderCode(lines,index); html += block.html; index = block.next; continue; }
        const heading = line.match(HEADING);
        if ( heading ) { const level = Math.min(6,Math.max(1,heading[1].length + options.headingOffset)); html += `<h${level}>${renderInline(heading[2])}</h${level}>`; index++; continue; }
        if ( RULE.test(line) ) { html += '<hr>'; index++; continue; }
        if ( TABLE_ROW.test(line) && TABLE_SEPARATOR.test(lines[index + 1] ?? '') ) { const block = renderTable(lines,index); html += block.html; index = block.next; continue; }
        if ( QUOTE.test(line) )
        {
            const quoted = [];
            while ( index < lines.length && QUOTE.test(lines[index]) ) { quoted.push(lines[index].match(QUOTE)[1]); index++; }
            html += `<blockquote>${renderBlocks(quoted,options)}</blockquote>`;
            continue;
        }
        if ( LIST_ITEM.test(line) ) { const block = renderList(lines,index,options); html += block.html; index = block.next; continue; }
        const paragraph = [ line.trim() ];
        index++;
        while ( index < lines.length && lines[index].trim() && !startsBlock(lines,index) ) { paragraph.push(lines[index].trim()); index++; }
        html += `<p>${renderInline(paragraph.join(' '))}</p>`;
    }
    return html;
}

// Converts Markdown into HTML. Option headingOffset shifts heading levels (e.g. -1 turns ### into <h2>).
export function markdownToHTML( markdown, options = {} )
{
    const settings = { headingOffset:Number.isInteger(options.headingOffset) ? options.headingOffset : 0 };
    return renderBlocks(String(markdown ?? '').replace(/\r\n?/g,'\n').replace(TEST_CODE,'').split('\n'),settings);
}

// Converts inline Markdown (e.g. a heading) into plain text.
export function markdownToText( text ) { return String(text ?? '').replace(/`([^`]+)`/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\\\|/g,'|').trim(); }

// Splits a document into its title (# heading), the introduction before the first ## heading,
// and one section per ## heading: { title, intro, sections:[{ heading, body }] }. Fenced code is never split.
export function splitMarkdownSections( markdown )
{
    const lines = String(markdown ?? '').replace(/\r\n?/g,'\n').split('\n');
    const result = { title:'', intro:'', sections:[] };
    const intro = [];
    let current = null, fence = '';
    for ( const line of lines )
    {
        const fenceMatch = line.match(FENCE);
        if ( fenceMatch ) { fence = !fence ? fenceMatch[1] : ( line.trim().startsWith(fence) ? '' : fence ); }
        const heading = fence || fenceMatch ? null : line.match(/^(#{1,2})\s+(.*?)\s*#*\s*$/);
        if ( heading && heading[1] === '#' && !result.title && !current ) { result.title = heading[2]; continue; }
        if ( heading && heading[1] === '##' ) { current = { heading:heading[2], lines:[] }; result.sections.push(current); continue; }
        ( current ? current.lines : intro ).push(line);
    }
    result.intro = intro.join('\n').trim();
    result.sections = result.sections.map(section => ( { heading:section.heading, body:section.lines.join('\n').trim() } ));
    return result;
}

// Returns the part of a document under a heading of the given text and level (e.g. "Features", 3): { heading, body },
// the body running to the next heading of the same or a higher level; null when the heading is not found. Fenced code
// is never split.
export function findMarkdownSection( markdown, text, level )
{
    const lines = String(markdown ?? '').replace(/\r\n?/g,'\n').split('\n');
    let current = null, fence = '';
    for ( const line of lines )
    {
        const fenceMatch = line.match(FENCE);
        if ( fenceMatch ) { fence = !fence ? fenceMatch[1] : ( line.trim().startsWith(fence) ? '' : fence ); }
        const heading = fence || fenceMatch ? null : line.match(HEADING);
        if ( current && heading && heading[1].length <= level ) { break; }
        if ( current ) { current.lines.push(line); continue; }
        if ( heading && heading[1].length === level && markdownToText(heading[2]).toLowerCase() === text.toLowerCase() ) { current = { heading:heading[2], lines:[] }; }
    }
    return current ? { heading:current.heading, body:current.lines.join('\n').trim() } : null;
}
