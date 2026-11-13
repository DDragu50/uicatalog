// externalLinks.js
//
// LINKS TO OTHER SITES IN MARKDOWN CONTENT.
// Makes every link to another site (http or https) inside host open in a new tab, and marks it: an icon after the text
// (arrow out of a square; hidden from screen readers) and the hidden words "(opens in a new tab)" for screen readers.
// Used by the Home page (repository links) and the Contact page (LinkedIn link).

import { APP_TEXTS } from '../appConfig.js';

// Marks the links to other sites inside host; returns host.
export function markExternalLinks( host )
{
    for ( const link of host?.querySelectorAll('a[href^="http://"], a[href^="https://"]') ?? [] )
    {
        if ( new URL(link.href).origin === location.origin ) { continue; }
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.classList.add('app-external-link');
        link.insertAdjacentHTML('beforeend','<i class="fa-solid fa-arrow-up-right-from-square app-external-link-icon" aria-hidden="true"></i>');
        const hidden = document.createElement('span');
        hidden.className = 'app-visually-hidden';
        hidden.textContent = ` ${APP_TEXTS.markdown.newTab}`;
        link.append(hidden);
    }
    return host;
}
