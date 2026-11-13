// previewBridge.js
//
// LIVE EXAMPLE FRAME.
// Creates the frame that shows preview.html (showcase styling only, separate from the app's styling), sends it
// render requests and passes its reports on. The frame grows with its content (--app-preview-height); with a stage
// width (adjustment file) it is laid out at that width and scaled down to fit the page (--app-preview-scale).
// The same frame also shows the "States" section of the component page (request.gallery, see previewIndex.js).

import { APP_TEXTS } from '../appConfig.js';
import { reportAppIssue } from '../appErrors.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Renders the live-example frame into container; returns { render(request), destroy() }. onReport receives every report;
// title: the frame's accessible name (default: "Live example of <name>").
export function renderPreviewFrame( container, { componentId, componentName, stage = {}, title = APP_TEXTS.component.frameTitle.replace('{name}',componentName), onReport = () => {} } )
{
    container.innerHTML = `<iframe class="app-preview-frame" src="preview.html" title="${escapeHTML(title)}"></iframe>`;
    const frame = container.querySelector('iframe');
    let ready = false, pending = null, destroyed = false, height = 0;

    // Applies the stage width: the frame keeps its layout width and is scaled down when the page is narrower.
    function applySize()
    {
        const available = container.clientWidth;
        const scale = stage.width && available && available < stage.width ? available / stage.width : 1;
        container.style.setProperty('--app-preview-width',stage.width && scale < 1 ? `${stage.width}px` : '100%');
        container.style.setProperty('--app-preview-scale',String(scale));
        container.style.setProperty('--app-preview-height',`${Math.ceil(height)}px`);
        container.style.setProperty('--app-preview-box-height',`${Math.ceil(height * scale)}px`);
    }
    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(container);

    // Handles one report of the frame; size reports resize the frame, the others go to onReport.
    function handleReport( report )
    {
        if ( destroyed ) { return; }
        if ( report.kind === 'size' ) { height = report.height; applySize(); return; }
        onReport(report);
    }

    // Connects to the frame once it has loaded and sends the waiting request.
    function onLoad()
    {
        const preview = frame.contentWindow?.showcasePreview;
        if ( !preview ) { reportAppIssue('PREVIEW_UNAVAILABLE',{ value:componentId }); return; }
        ready = true;
        preview.connect(handleReport);
        if ( pending ) { preview.render(pending); pending = null; }
    }

    frame.addEventListener('load',onLoad);
    return {
        // Renders the component with a request { configJSON, callbackPaths, stylesheets, hasAdjustment, gallery? } (queued until the frame is ready).
        render:( request ) => { const full = { ...request, componentId, minHeight:stage.minHeight ?? '' }; if ( ready ) { frame.contentWindow.showcasePreview.render(full); } else { pending = full; } },
        // Disconnects and removes the frame.
        destroy:() => { destroyed = true; resizeObserver.disconnect(); frame.removeEventListener('load',onLoad); container.replaceChildren(); }
    };
}
