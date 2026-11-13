// contactPage.js
//
// CONTACT PAGE.
// Shows content/contact.md and a contact Form. contact.md is split at its marker line "<!-- aside -->": before it
// (title and invitation) across the page; then two columns, the Form on the left and the rest of contact.md (about the
// author, LinkedIn link) on the right, one below the other in a narrow page. Links to other sites open in a new tab.
// The Form (TextInput and TextArea fields) that sends the message to the server
// (POST api/contact: server/contactHandler.js locally, client/api/contact.php on the public site). Server checks are shown next to the fields; other outcomes are shown as Form messages.

import { renderForm } from '../../components/form/formIndex.js';
import { renderMessage } from '../../components/message/messageIndex.js';
import { renderTextArea } from '../../components/textArea/textAreaIndex.js';
import { renderTextInput } from '../../components/textInput/textInputIndex.js';
import { APP_CONFIG, APP_TEXTS } from '../appConfig.js';
import { getAppError, reportAppIssue } from '../appErrors.js';
import { loadContent } from '../appContent.js';
import { markExternalLinks } from '../markdown/externalLinks.js';
import { markdownToHTML } from '../markdown/markdownReader.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the field message for an error label reported by the server ({ name, errorLabel, values }).
function describeServerError( error )
{
    const texts = APP_TEXTS.contact.errors;
    const messages =
    {
        REQUIRED:{ name:texts.nameRequired, email:texts.emailRequired, message:texts.messageRequired }[error.name] ?? texts.messageRequired,
        INVALID_EMAIL:texts.emailInvalid,
        MIN_LENGTH:texts.messageTooShort,
        MAX_LENGTH:texts.tooLong
    };
    return ( messages[error.errorLabel] ?? getAppError('CONTACT_FAILED').message ).replace(/\{(\w+)\}/g,( match, key ) => String(error.values?.[key] ?? match));
}

// Sends the form values to the server; resolves true when the message was accepted (Form then shows the success message).
async function sendContactMessage( values, form )
{
    let response = null, result = null;
    try
    {
        response = await fetch(APP_CONFIG.contactEndpoint,{ method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(values) });
        result = await response.json().catch(() => null);
    }
    catch ( error ) { reportAppIssue('CONTACT_REQUEST_FAILED',{ reason:error.message }); form.showMessage({ type:'DANGER', text:getAppError('CONTACT_FAILED').message }); return false; }

    if ( response.ok && result?.ok ) { form.clear(); return true; }
    if ( result?.errorLabel === 'VALIDATION' && Array.isArray(result.errors) ) { form.showErrors(result.errors.map(error => ( { name:error.name, message:describeServerError(error) } ))); return false; }
    reportAppIssue('CONTACT_REQUEST_FAILED',{ reason:`HTTP ${response.status} ${result?.errorLabel ?? ''}`.trim() });
    const error = getAppError(response.status === 429 ? 'CONTACT_RATE_LIMITED' : 'CONTACT_FAILED');
    form.showMessage({ type:response.status === 429 ? 'WARNING' : 'DANGER', text:error.message });
    return false;
}

// Builds the four field render functions of the contact form.
function buildFields()
{
    const rules = APP_CONFIG.contact, texts = APP_TEXTS.contact;
    return [
        host => renderTextInput(host,{ id:'contact-name', name:'name', label:texts.name, autocomplete:'name', mandatoryIndicator:'MANDATORY_ASTERISK', validation:{ enabled:true, maxLength:rules.nameMaxLength }, texts:{ errors:{ REQUIRED:texts.errors.nameRequired } } }),
        host => renderTextInput(host,{ id:'contact-email', name:'email', type:'EMAIL', label:texts.email, help:texts.emailHelp, autocomplete:'email', mandatoryIndicator:'MANDATORY_ASTERISK', validation:{ enabled:true, maxLength:rules.emailMaxLength, pattern:rules.emailPattern }, texts:{ errors:{ REQUIRED:texts.errors.emailRequired, PATTERN:texts.errors.emailInvalid } } }),
        host => renderTextInput(host,{ id:'contact-subject', name:'subject', label:texts.subject, mandatory:false, mandatoryIndicator:'MANDATORY_ASTERISK', validation:{ enabled:true, maxLength:rules.subjectMaxLength } }),
        host => renderTextArea(host,{ id:'contact-message', name:'message', label:texts.message, rows:6, autoGrow:true, maxRows:16, spellcheck:true, mandatoryIndicator:'MANDATORY_ASTERISK', validation:{ enabled:true, minLength:rules.messageMinLength, maxLength:rules.messageMaxLength }, texts:{ errors:{ REQUIRED:texts.errors.messageRequired, MIN_LENGTH:texts.errors.messageTooShort } } })
    ];
}

// Renders the contact page into root; returns the page instance.
export async function renderContactPage( root )
{
    const children = [];
    const markdown = await loadContent(APP_CONFIG.content.contact);
    const [ intro, aside = '' ] = ( markdown ?? '' ).split(APP_CONFIG.contactAsideMarker);
    root.innerHTML = '<div class="app-reading app-contact-page"><div class="app-markdown app-contact-intro"></div><div class="app-page-message"></div>'
        + '<div class="app-contact-columns"><div class="app-contact-form"></div><div class="app-markdown app-contact-aside"></div></div></div>';
    if ( markdown === null )
    {
        root.querySelector('.app-contact-intro').innerHTML = `<h1>${escapeHTML(APP_TEXTS.pages.contact)}</h1>`;
        children.push(renderMessage(root.querySelector('.app-page-message'),{ id:'contact-content-error', type:'WARNING', text:getAppError('CONTENT_UNAVAILABLE').message }));
    }
    else
    {
        root.querySelector('.app-contact-intro').innerHTML = markdownToHTML(intro);
        root.querySelector('.app-contact-aside').innerHTML = markdownToHTML(aside);
        markExternalLinks(root.querySelector('.app-contact-page'));
    }

    children.push(renderForm(root.querySelector('.app-contact-form'),
    {
        id:'contact-form', texts:{ submit:APP_TEXTS.contact.submit, submitSuccess:APP_TEXTS.contact.success },
        onSubmit:( values, form ) => sendContactMessage(values,form)
    },buildFields()));
    return {
        // Removes the form and its fields and clears the page.
        destroy:() => { children.forEach(child => child?.destroy()); root.replaceChildren(); }
    };
}
