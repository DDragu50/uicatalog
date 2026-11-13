// documentPage.js
//
// DOCUMENT PAGE (#/component/{id}/readme: a component's README; #/framework, #/guidelines, #/design-system: the guides).
// Shows one .md file whole, in the two columns of the component page:
//   main column: a header with its path in the library (source/components/…) on the left (the file name is the page's
//   h1 for screen readers and the tab title, not shown), and on the right two tertiary Buttons — "Download .md" (saves the file) and "Download .pdf" (the browser's
//   print dialog with only the file's content, where the user chooses "Save as PDF"; the PDF is named after the file) —
//   then a secondary Button "Return to the component" (a guide: "Return to the home page"); then the content;
//   right column (where Variants is on the component page): Contents, every heading of the file as a link, nested as
//   in the file. Narrow screens: Contents above the file, first two levels only.
// README pages (decision 189): every code block is a CopyArea (Copy button; same name as before, e.g. "Code example (js)"),
//   except diagrams (blocks drawn with ├ └ │, e.g. Structure), which keep the plain block.
import { renderButton } from '../../components/button/buttonIndex.js';
import { renderMessage } from '../../components/message/messageIndex.js';
import { renderCopyArea } from '../../components/copyArea/copyAreaIndex.js';
import { APP_CONFIG, APP_TEXTS } from '../appConfig.js';
import { componentHref } from '../appShell.js';
import { loadContent } from '../appContent.js';
import { getAppError } from '../appErrors.js';
import { markdownToHTML } from '../markdown/markdownReader.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Saves text as a file under the given name.
function saveText( text, fileName )
{
    const url = URL.createObjectURL(new Blob([ text ],{ type:'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url),0);
}

// Opens the print dialog for the file's content (print styles in app.css hide the rest of the page); the tab title,
// which browsers offer as the PDF name, is the file name without ".md" while the dialog is open.
function printAsPdf( fileName )
{
    const title = document.title;
    document.title = fileName.replace(/\.md$/i,'');
    document.body.classList.add('app-printing-document');
    const restore = () => { document.title = title; document.body.classList.remove('app-printing-document'); window.removeEventListener('afterprint',restore); };
    window.addEventListener('afterprint',restore);
    window.print();
}

// Gives every heading of the content an id and returns the Contents list (nested lists following the heading levels).
function buildContentsHTML( content )
{
    const headings = [ ...content.querySelectorAll('h1, h2, h3, h4, h5, h6') ];
    let html = '', depth = 0;
    const base = Math.min(...headings.map(heading => Number(heading.tagName[1])));
    headings.forEach(( heading, index ) =>
    {
        heading.id = `document-heading-${index}`;
        heading.setAttribute('tabindex','-1');
        const level = Number(heading.tagName[1]) - base + 1;
        if ( level > depth ) { while ( depth < level ) { html += `<ul class="${depth === 0 ? 'app-toc-list' : 'app-toc-parts'}" data-level="${depth + 1}"><li>`; depth++; } }
        else { while ( depth > level ) { html += '</li></ul>'; depth--; } html += '</li><li>'; }
        html += `<a class="app-toc-link" href="#" data-target="${heading.id}">${escapeHTML(heading.textContent)}</a>`;
    });
    while ( depth > 0 ) { html += '</li></ul>'; depth--; }
    return headings.length ? `<nav class="app-toc app-document-toc" aria-labelledby="document-contents-title"><h2 class="app-toc-title" id="document-contents-title">${escapeHTML(APP_TEXTS.description.contents)}</h2>${html}</nav>` : '';
}

// Diagram blocks (drawn with box-drawing characters) are not worth copying.
const DIAGRAM = /[├└│]/;

// README pages: replaces each code block (except diagrams) with a CopyArea of the same text and name; returns the instances.
function renderCodeCopies( content, key )
{
    return [ ...content.querySelectorAll('.app-markdown-code > pre') ].filter(pre => !DIAGRAM.test(pre.textContent)).map(( pre, index ) =>
    {
        const host = document.createElement('div');
        host.className = 'app-markdown-copy';
        pre.replaceWith(host);
        return renderCopyArea(host,{ id:`document-${key}-code-${index}`, label:pre.getAttribute('aria-label'), text:pre.textContent });
    });
}

// Returns the document shown for a route: a component's README, or a guide from the Home page (no component).
function describeDocument( component, guide )
{
    const texts = APP_TEXTS.document;
    if ( !component )
    {
        const fileName = guide.content.split('/').pop();
        return { key:guide.key, fileName, contentUrl:guide.content, libraryPath:`source/components/${fileName}`, returnHref:'#/', returnLabel:texts.returnToHome, returnDescription:texts.returnHomeDescription };
    }
    const fileName = `${component.id}README.md`;
    return { key:component.id, fileName, contentUrl:`components/${component.id}/${fileName}`, libraryPath:`source/components/${component.id}/${fileName}`,
        returnHref:componentHref(component.id), returnLabel:texts.returnToComponent, returnDescription:texts.returnDescription.replace('{name}',component.name) };
}

// Renders the page of one .md file (a component's README, or the guidelines without a component) into root; returns the page instance.
export async function renderDocumentPage( root, { params } )
{
    const texts = APP_TEXTS.document;
    const { key, fileName, contentUrl, libraryPath, returnHref, returnLabel, returnDescription } = describeDocument(params.component,params.guide);
    const markdown = await loadContent(contentUrl);
    root.innerHTML = '<div class="app-columns app-document"><div class="app-columns-main">'
        + `<header class="app-document-header"><div class="app-document-title"><h1 class="app-visually-hidden">${escapeHTML(fileName)}</h1>`
        + `<p class="app-md-source"><span class="app-md-source-path"><span class="app-md-source-label">${escapeHTML(texts.pathLabel)}:</span> <code>${escapeHTML(libraryPath)}</code></span></p></div>`
        + '<div class="app-document-actions"><span data-action="md"></span><span data-action="pdf"></span><span data-action="return"></span></div></header>'
        + `<div class="app-page-message"></div>${markdown === null ? '' : `<div class="app-markdown app-document-content${params.component ? ' app-readme-content' : ''}">${markdownToHTML(markdown)}</div>`}</div>`
        + `<aside class="app-columns-side app-document-contents" aria-label="${escapeHTML(APP_TEXTS.description.contents)}"></aside></div>`;
    const children = [];
    children.push(renderButton(root.querySelector('[data-action="return"]'),{ id:`document-${key}-return`, label:returnLabel, hierarchy:'SECONDARY', size:'SMALL',
        iconBefore:'fa-solid fa-arrow-left', description:returnDescription },() => { window.location.hash = returnHref; }));
    const content = root.querySelector('.app-document-content'), contents = root.querySelector('.app-document-contents');
    if ( content ) { contents.innerHTML = buildContentsHTML(content); }
    if ( content && params.component ) { children.push(...renderCodeCopies(content,key)); }
    // Contents link: scrolls to its heading and moves the focus there.
    function onContentsClick( event )
    {
        const link = event.target.closest('.app-toc-link');
        if ( !link ) { return; }
        event.preventDefault();
        const target = root.querySelector(`#${CSS.escape(link.dataset.target)}`);
        target?.scrollIntoView({ block:'start' });
        target?.focus({ preventScroll:true });
    }
    contents.addEventListener('click',onContentsClick);
    if ( markdown === null )
    {
        children.push(renderMessage(root.querySelector('.app-page-message'),{ id:`document-${key}-error`, type:'DANGER', text:getAppError('CONTENT_UNAVAILABLE').message }));
    }
    else
    {
        children.push(renderButton(root.querySelector('[data-action="md"]'),{ id:`document-${key}-md`, label:texts.downloadMd, hierarchy:'TERTIARY', size:'SMALL',
            iconBefore:'fa-solid fa-download', description:texts.downloadMdDescription.replace('{file}',fileName) },() => saveText(markdown,fileName)));
        children.push(renderButton(root.querySelector('[data-action="pdf"]'),{ id:`document-${key}-pdf`, label:texts.downloadPdf, hierarchy:'TERTIARY', size:'SMALL',
            iconBefore:'fa-regular fa-file-pdf', description:texts.downloadPdfDescription },() => printAsPdf(fileName)));
    }
    return {
        // Removes the Buttons (or the message) and the Contents listener and clears the page.
        destroy:() => { contents.removeEventListener('click',onContentsClick); children.forEach(child => child?.destroy?.()); root.replaceChildren(); }
    };
}
