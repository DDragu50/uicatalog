// previewOutput.js
//
// LIVE EXAMPLE OUTPUT.
// Shows what the live example reports: whether it rendered, the configuration sent, the instance members,
// its public state, the last callbacks and the developer messages of the last render.

import { APP_TEXTS } from '../appConfig.js';

const MAX_CALLBACKS = 8;

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Builds one titled block of the output box.
function buildBlockHTML( title, body ) { return `<div class="app-output-block"><h3 class="app-output-title">${escapeHTML(title)}</h3>${body}</div>`; }

// Builds a list of code lines, or the "none" text.
function buildLinesHTML( lines, className = '' ) { return lines.length ? `<ul class="app-output-lines">${lines.map(line => `<li class="${className}"><code>${escapeHTML(line)}</code></li>`).join('')}</ul>` : `<p class="app-output-empty">${escapeHTML(APP_TEXTS.output.none)}</p>`; }

// Renders the output box into container; returns { handle(report), destroy() }.
export function renderPreviewOutput( container )
{
    const texts = APP_TEXTS.output;
    const state = { status:'', config:'', members:[], values:[], callbacks:[], messages:[] };

    // Redraws the output box from the collected reports.
    function draw()
    {
        const status = state.status === 'ok' ? texts.rendered : state.status === 'failed' ? texts.notRendered : texts.rendering;
        container.innerHTML = `<div class="app-output app-output-${state.status || 'busy'}">`
            + `<p class="app-output-status">${escapeHTML(status)}</p>`
            + buildBlockHTML(texts.config,buildLinesHTML(state.config ? [ state.config ] : []))
            + buildBlockHTML(texts.members,buildLinesHTML(state.members.length ? [ state.members.join(', ') ] : []))
            + buildBlockHTML(texts.state,buildLinesHTML(state.values.map(entry => `${entry.name} → ${entry.value}`)))
            + buildBlockHTML(texts.callbacks,buildLinesHTML(state.callbacks))
            + buildBlockHTML(texts.messages,buildLinesHTML(state.messages.map(entry => `${entry.level === 'error' ? texts.error : texts.warning}: ${entry.text}`),'app-output-message'))
            + '</div>';
    }

    draw();
    return {
        // Takes one report of the live example and updates the box.
        handle:( report ) =>
        {
            if ( report.kind === 'start' ) { Object.assign(state,{ status:'', config:'', members:[], values:[], callbacks:[], messages:[] }); }
            if ( report.kind === 'rendered' ) { Object.assign(state,{ status:report.ok ? 'ok' : 'failed', config:report.config, members:report.members }); }
            if ( report.kind === 'state' ) { state.values = report.state; }
            if ( report.kind === 'callback' ) { state.callbacks = [ `${report.name}(${report.args.join(', ')})`, ...state.callbacks ].slice(0,MAX_CALLBACKS); }
            if ( report.kind === 'console' ) { state.messages.push({ level:report.level, text:report.text }); }
            draw();
        },
        // Clears the box.
        destroy:() => container.replaceChildren()
    };
}
