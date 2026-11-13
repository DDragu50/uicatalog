// notFoundPage.js
//
// NOT FOUND PAGE.
// Shown for addresses that match no page and for unknown component names.

import { APP_TEXTS } from '../appConfig.js';
import { getAppError } from '../appErrors.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Renders the "page not found" page into root; returns the page instance.
export async function renderNotFoundPage( root )
{
    root.innerHTML = `<div class="app-reading"><h1>${escapeHTML(APP_TEXTS.pages.notFound)}</h1><p>${escapeHTML(getAppError('NOT_FOUND').message)}</p><p><a href="#/">${escapeHTML(APP_TEXTS.notFound.backHome)}</a></p></div>`;
    return {
        // Clears the page.
        destroy:() => root.replaceChildren()
    };
}
