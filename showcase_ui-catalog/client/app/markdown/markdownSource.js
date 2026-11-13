// markdownSource.js
//
// SOURCE LINE OF A DISPLAYED .md FILE.
// Shown just before every Markdown file the app displays: the file's full path in the project (small text) and,
// on the right, a Button ".md Reader" that downloads a single HTML file able to open and read any .md file.

import { renderButton } from '../../components/button/buttonIndex.js';
import { APP_CONFIG, APP_TEXTS } from '../appConfig.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the full project path of a content address (e.g. content/home.md → client/content/home.md).
export function projectPath( contentUrl ) { return `${APP_CONFIG.projectClientFolder}${String(contentUrl ?? '').replace(/^\.?\//,'')}`; }

// Starts the download of the Markdown reader (same-origin file, saved under its own name).
function downloadReader()
{
    const link = document.createElement('a');
    link.href = APP_CONFIG.markdownReader.href;
    link.download = APP_CONFIG.markdownReader.fileName;
    document.body.append(link);
    link.click();
    link.remove();
}

// Renders the source line into host for the content address contentUrl; returns { destroy }.
export function renderMarkdownSource( host, { id, contentUrl } )
{
    const texts = APP_TEXTS.markdownSource;
    host.classList.add('app-md-source');
    host.innerHTML = `<span class="app-md-source-path"><span class="app-md-source-label">${escapeHTML(texts.pathLabel)}:</span> <code>${escapeHTML(projectPath(contentUrl))}</code></span><span class="app-md-source-action"></span>`;
    const button = renderButton(host.querySelector('.app-md-source-action'),
        { id:`${id}-reader`, label:texts.reader, hierarchy:'SECONDARY', size:'SMALL', iconBefore:'fa-solid fa-download', description:texts.readerDescription },downloadReader);
    return {
        // Removes the Button and clears the line.
        destroy:() => { button?.destroy(); host.replaceChildren(); host.classList.remove('app-md-source'); }
    };
}
