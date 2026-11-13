// copyAreaComponent.js
//
// COMPONENT COORDINATOR.
// An area with a Copy button: code, a plain text or content rendered by the application. The button puts the content
// on the clipboard (code and text as plain text; content as plain text and formatted HTML, without hidden parts,
// controls and parts marked data-copy="skip"; only the parts marked data-copy="only" when there are any; copyValue
// instead of all of it). Success: the button shows "Copied" with a check for COPY_FEEDBACK_MS, and it is announced.
// Failure (no clipboard access, e.g. a page not served over https): a message, the content selected for Ctrl+C, and
// it is announced. Composes Button (declared dependency) for the Copy button.

import { mergeCopyAreaConfig, validateCopyAreaConfig } from './copyAreaConfig.js';
import { buildCopyAreaHTML, buildCodeHTML } from './copyAreaHTML.js';
import { COPY_AREA_ERRORS, reportCopyAreaIssue } from './copyAreaErrors.js';
import { renderButton } from '../button/buttonIndex.js';

const COPY_FEEDBACK_MS = 2000;
const COPY_ICON = 'fa-regular fa-copy';
const COPIED_ICON = 'fa-solid fa-check';
// Elements never copied from content: controls, scripts and parts the application marks or hides.
const SKIPPED = '[data-copy="skip"], [hidden], script, style, template, noscript, button, input, select, textarea, svg, canvas, iframe';
// Attributes kept on copied elements (formatting only: links, images and table structure).
const KEPT_ATTRIBUTES = [ 'href', 'src', 'alt', 'colspan', 'rowspan', 'start' ];

// Returns whether an element of the live content is not shown: not displayed, invisible, or visually hidden (clipped
// to at most 1×1 pixel, the screen-reader-only technique).
function isNotShown( element )
{
    const style = getComputedStyle(element);
    if ( style.display === 'none' || style.visibility === 'hidden' ) { return true; }
    const box = element.getBoundingClientRect();
    return box.width <= 1 && box.height <= 1 && ( style.overflow === 'hidden' || style.clipPath !== 'none' );
}

// Returns a copy of a live node with only what is shown and only formatting attributes, or null when it is skipped.
function cleanCopy( node )
{
    if ( node.nodeType === Node.TEXT_NODE ) { return node.cloneNode(); }
    if ( node.nodeType !== Node.ELEMENT_NODE || node.matches(SKIPPED) || isNotShown(node) ) { return null; }
    const copy = document.createElement(node.localName);
    KEPT_ATTRIBUTES.forEach(name =>
    {
        const value = node.getAttribute(name);
        if ( value !== null && !( ( name === 'href' || name === 'src' ) && /^\s*(javascript|vbscript):/i.test(value) ) ) { copy.setAttribute(name,value); }
    });
    node.childNodes.forEach(child => { const cleaned = cleanCopy(child); if ( cleaned ) { copy.appendChild(cleaned); } });
    return copy;
}

// Writes list markers into the plain-text copy (the browser's plain text has none): "1. " in numbered lists (from
// their start), "- " in other lists.
function addListMarkers( staging )
{
    staging.querySelectorAll('li').forEach(item =>
    {
        const list = item.parentElement;
        const items = [ ...list.children ].filter(element => element.localName === 'li');
        const marker = list.localName === 'ol' ? `${( Number.parseInt(list.getAttribute('start'),10) || 1 ) + items.indexOf(item)}. ` : '- ';
        item.prepend(document.createTextNode(marker));
    });
}

// Writes the payload to the clipboard: plain text and HTML together when there is HTML and the browser allows it,
// otherwise plain text. Rejects when the page has no clipboard access.
function writeClipboard( { text, html } )
{
    const clipboard = navigator.clipboard;
    if ( !clipboard ) { return Promise.reject(new Error('no clipboard')); }
    if ( html && typeof ClipboardItem === 'function' && typeof clipboard.write === 'function' )
    {
        return clipboard.write([ new ClipboardItem({ 'text/plain':new Blob([ text ],{ type:'text/plain' }), 'text/html':new Blob([ html ],{ type:'text/html' }) }) ]);
    }
    return clipboard.writeText(text);
}

// Renders a CopyArea and returns its runtime instance, or null after a developer error.
export function renderCopyArea( container, config, onCopy )
{
    if ( !container ) { reportCopyAreaIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeCopyAreaConfig({ ...config, onCopy:config?.onCopy ?? onCopy });
    if ( validateCopyAreaConfig(merged) ) { return null; }

    container.innerHTML = buildCopyAreaHTML(merged);
    const root = container.querySelector('.ui-copy-area');
    const body = root.querySelector('pre.ui-copy-area-body code, .ui-copy-area-text, div.ui-copy-area-body');
    const actionHost = root.querySelector('.ui-copy-area-action');
    const message = root.querySelector('.ui-copy-area-message');
    const status = root.querySelector('.ui-copy-area-status');
    const state = { text:merged.text, copyValue:merged.copyValue, error:null, copied:false, timer:0, destroyed:false };
    let button = null, child = null, instance = null;

    // Writes a text into the status region (a repeated text gets a trailing no-break space, so it is announced again).
    function announce( text ) { status.textContent = text && text === status.textContent ? `${text} ` : text; }

    // Renders the Copy button: "Copy" with the copy icon, or "Copied" with a check after a successful copy; keeps the focus.
    function drawButton()
    {
        const hadFocus = actionHost.contains(document.activeElement);
        button?.destroy();
        const icon = state.copied ? COPIED_ICON : COPY_ICON, name = state.copied ? merged.texts.copied : merged.texts.copy;
        const base = { id:`${merged.id}-copy`, hierarchy:'TERTIARY', size:'SMALL', description:merged.label, onClick:handleCopy };
        button = renderButton(actionHost,merged.copyButton === 'ICON' ? { ...base, buttonVariant:'ICON_BUTTON', icon, ariaLabel:name, tooltipMode:merged.tooltipMode } : { ...base, label:name, iconBefore:icon });
        if ( hadFocus ) { button?.getElement().focus(); }
    }

    // Returns what is copied: copyValue, the text, or the shown content as plain text and HTML.
    function payload()
    {
        if ( state.copyValue !== null ) { return { text:state.copyValue, html:'' }; }
        if ( merged.mode !== 'CONTENT' ) { return { text:state.text, html:'' }; }
        const marked = [ ...body.querySelectorAll('[data-copy="only"]') ].filter(element => !element.parentElement.closest('[data-copy="only"]'));
        const staging = document.createElement('div');
        staging.className = 'ui-copy-area-staging';
        staging.setAttribute('aria-hidden','true');
        ( marked.length ? marked.map(element => cleanCopy(element)) : [ ...body.childNodes ].map(node => cleanCopy(node)) ).filter(Boolean).forEach(node => staging.appendChild(node));
        root.appendChild(staging);
        const html = staging.innerHTML;
        addListMarkers(staging);
        const result = { text:staging.innerText.replace(/\n{3,}/g,'\n\n').trim(), html };
        staging.remove();
        return result;
    }

    // Selects the content after a failed copy, so the user can copy it with Ctrl+C: the shown content, or copyValue
    // written in the message (it is not shown in the area).
    function selectForManualCopy()
    {
        const target = state.copyValue !== null ? message.querySelector('.ui-copy-area-fallback') : body;
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Shows "Copied" on the button for COPY_FEEDBACK_MS (a new copy starts the time again).
    function showCopied()
    {
        clearTimeout(state.timer);
        state.copied = true;
        drawButton();
        state.timer = setTimeout(() => { if ( state.destroyed ) { return; } state.copied = false; drawButton(); },COPY_FEEDBACK_MS);
    }

    // Shows the failure message (with copyValue to select, when set).
    function showFailure()
    {
        state.error = { errorLabel:COPY_AREA_ERRORS.COPY_FAILED.errorLabel, message:merged.texts.failed };
        message.textContent = merged.texts.failed;
        if ( state.copyValue !== null ) { const fallback = document.createElement('code'); fallback.className = 'ui-copy-area-fallback'; fallback.textContent = state.copyValue; message.append(' ',fallback); }
        message.hidden = false;
    }

    // Copies the content (user action): shows and announces the result, then reports it.
    function handleCopy()
    {
        const data = payload();
        writeClipboard(data).then(() =>
        {
            if ( state.destroyed ) { return; }
            state.error = null;
            message.hidden = true;
            message.textContent = '';
            showCopied();
            announce(merged.texts.copied);
            merged.onCopy?.({ copied:true, text:data.text },instance);
        },() =>
        {
            if ( state.destroyed ) { return; }
            if ( state.copied ) { clearTimeout(state.timer); state.copied = false; drawButton(); }
            showFailure();
            selectForManualCopy();
            announce(merged.texts.failed);
            merged.onCopy?.({ copied:false, text:data.text, errorLabel:'COPY_FAILED' },instance);
        });
    }

    instance =
    {
        id:merged.id,
        // Returns the CopyArea element.
        getElement:() => root,
        // Returns a copy of the current error ({ errorLabel, message }) or null.
        getError:() => ( state.error ? { ...state.error } : null ),
        // Changes the shown and copied text (code or plain text; content is changed by the application).
        setText:( text ) =>
        {
            if ( merged.mode === 'CONTENT' ) { reportCopyAreaIssue('OPTION_IGNORED',{ id:merged.id, key:'setText()', condition:'content is set (change the content itself)' }); return; }
            state.text = String(text ?? '');
            if ( merged.mode === 'CODE' ) { body.innerHTML = buildCodeHTML(state.text,merged.lineNumbers); } else { body.textContent = state.text; }
        },
        // Sets the value copied instead of the shown content, or removes it (null).
        setCopyValue:( value ) =>
        {
            if ( value === null || value === undefined ) { state.copyValue = null; return; }
            if ( typeof value === 'string' || typeof value === 'number' ) { state.copyValue = String(value); return; }
            reportCopyAreaIssue('INVALID_OPTION',{ id:merged.id, key:'setCopyValue()', value:typeof value, fallback:'the current value' });
        },
        // Returns the instance returned by the content render function (a copy of the list), for coordinators.
        getChildren:() => ( child ? [ child ] : [] ),
        // Stops the feedback timer, removes the Copy button and the content's instance, then clears the container.
        destroy:() => { state.destroyed = true; clearTimeout(state.timer); button?.destroy(); child?.destroy?.(); container.innerHTML = ''; }
    };

    drawButton();
    if ( merged.content ) { child = merged.content(body,instance) ?? null; }
    return instance;
}
