// copyArea.js
//
// CUSTOMIZATION ADJUSTMENTS (CopyArea).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/copyArea.html: a short code example labelled "Example code".
// Variants panel: first the panel-only option shownContent, turned into the real configuration by prepare():
//   TEXT      the text below (textStyle CODE or PLAIN, lineNumbers for CODE);
//   CONTENT   formatted sample content (a standard reply with a numbered list, a link and an internal note that is
//             left out of the copy, data-copy="skip"), rendered by the content function.
// then text, textStyle, lineNumbers, label, copyValue, copyButton, tooltipMode. Hidden: id, content (set by prepare())
// and texts. The Copy button really copies (the showcase runs on localhost); the Output shows onCopy.
// No Examples section (decision 188): the cases are tried in the Variants panel.

// Formatted sample content for shownContent CONTENT (trusted markup written here).
const SAMPLE_REPLY = '<p>Hello,</p><p>Thank you for your message. To reset your password:</p><ol><li>Open <a href="#account">your account</a>.</li><li>Choose <strong>Security</strong>, then <strong>Reset password</strong>.</li></ol><p data-copy="skip"><em>Internal note (not copied): send only to verified customers.</em></p><p>Kind regards,<br>Support team</p>';
const CODE_SAMPLE = "import { renderCopyArea } from './copyAreaIndex.js';\n\nrenderCopyArea(host, { id:'install', label:'Install command', text:'npm install ui-catalog' });";

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'shownContent', 'text', 'textStyle', 'lineNumbers', 'label', 'copyValue', 'copyButton', 'tooltipMode' ],
    hide:[ 'content' ],
    // content is a render function set by prepare() for shownContent CONTENT, never reported as a callback.
    callbacks:{ content:false },
    fields:
    [
        { path:'shownContent', kind:'enum', allowed:[ 'TEXT', 'CONTENT' ], defaultValue:'TEXT', description:'TEXT shows the text below; CONTENT shows formatted sample content (a standard reply with a list and a link; its internal note is left out of the copy).' }
    ],
    appliesWhen:
    {
        text:values => values.shownContent !== 'CONTENT',
        textStyle:values => values.shownContent !== 'CONTENT',
        lineNumbers:values => values.shownContent !== 'CONTENT' && values.textStyle !== 'PLAIN'
    },
    start:{ shownContent:'TEXT', text:CODE_SAMPLE, label:'Example code' },
    // Turns shownContent into the CopyArea configuration (in place, so the Output shows what the component received).
    prepare:( { config, callbacks } ) =>
    {
        const shown = config.shownContent;
        delete config.shownContent;
        if ( shown === 'CONTENT' )
        {
            [ 'text', 'textStyle', 'lineNumbers' ].forEach(path => delete config[path]);
            config.content = host => { host.innerHTML = SAMPLE_REPLY; return null; };
        }
        return [ config, ...callbacks ];
    }
};
