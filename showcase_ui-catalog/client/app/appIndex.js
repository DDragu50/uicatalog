// appIndex.js
//
// PUBLIC ENTRY POINT.
// Starts the application: loads the component catalog, renders the shell and the footer, and starts the router.
// Loaded by index.html as a module; it exports nothing.

import { APP_CONFIG, APP_TEXTS } from './appConfig.js';
import { getAppError, reportAppIssue } from './appErrors.js';
import { loadContent } from './appContent.js';
import { renderAppShell } from './appShell.js';
import { startRouter } from './appRouter.js';

const EMPTY_CATALOG = { groups:[], components:[], keywords:[] };

// Writes the footer (copyright icon, year, author linked to LinkedIn, and the licence link) into the page footer; creates the footer after
// the working area when index.html has none (e.g. an older copy of index.html).
function renderFooter( found )
{
    let host = found;
    if ( !host )
    {
        host = document.createElement('footer');
        host.id = 'app-footer';
        host.className = 'app-footer';
        const layout = document.querySelector('.app-layout');
        if ( layout ) { layout.after(host); } else { document.body.append(host); }
    }
    const texts = APP_TEXTS.footer;
    host.innerHTML = '<p class="app-footer-text"><i class="fa-regular fa-copyright" role="img"></i><span><span></span> <a class="app-footer-link app-footer-author" target="_blank" rel="noopener"></a></span><span aria-hidden="true">·</span>'
        + '<a class="app-footer-link app-footer-license" target="_blank" rel="noopener"></a></p>';
    host.querySelector('i').setAttribute('aria-label',texts.iconLabel);
    host.querySelector('span span').textContent = texts.year;
    const author = host.querySelector('.app-footer-author');
    author.href = APP_CONFIG.author.href;
    author.title = texts.authorDescription;
    author.textContent = texts.author;
    const link = host.querySelector('.app-footer-license');
    link.href = APP_CONFIG.license.href;
    link.title = texts.licenseDescription;
    link.textContent = texts.license;
}

// Starts the application once; without a catalog the pages still work and a banner explains the empty menus.
async function startApp()
{
    const pageHost = document.querySelector('#app-page-host');
    if ( !pageHost ) { reportAppIssue('CONTAINER_REQUIRED',{ value:'#app-page-host' }); return; }
    const loaded = await loadContent(APP_CONFIG.catalogUrl,'json','CATALOG_LOAD_FAILED');
    const catalog = loaded && Array.isArray(loaded.components) && Array.isArray(loaded.groups) ? loaded : EMPTY_CATALOG;
    const shell = renderAppShell(document.querySelector('#app-header-host'),document.querySelector('#app-side-host'),catalog);
    if ( !shell ) { return; }
    if ( catalog === EMPTY_CATALOG ) { shell.header.showAnnouncement({ type:'DANGER', text:getAppError('CATALOG_UNAVAILABLE').message }); }
    renderFooter(document.querySelector('#app-footer'));
    startRouter(pageHost,shell,catalog);
}

startApp();
