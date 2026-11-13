// appContent.js
//
// CONTENT LOADING.
// Loads text and JSON files of the application (Markdown pages, catalog) and reports failures.

import { reportAppIssue } from './appErrors.js';

// Loads a file as text or JSON; returns null after reporting the failure with the given developer label.
export async function loadContent( url, format = 'text', errorLabel = 'CONTENT_LOAD_FAILED' )
{
    try
    {
        const response = await fetch(url,{ cache:'no-cache' });
        if ( !response.ok ) { throw new Error(`HTTP ${response.status}`); }
        return format === 'json' ? await response.json() : await response.text();
    }
    catch ( error )
    {
        reportAppIssue(errorLabel,{ url, reason:error.message });
        return null;
    }
}
