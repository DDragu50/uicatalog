// homePage.js
//
// HOME PAGE.
// content/home.md, in two parts split at its marker line "<!-- columns -->":
//   - before it, across the page: the title, the tagline and the code repositories;
//   - after it, two columns (one below the other in a narrow page): on the left the rest of home.md ("Core concepts"),
//     on the right "FAQs", an Accordion (decision 192): one item per question (APP_CONFIG.faqs), opened to a short answer
//     (Markdown), a prompt for AI tools in a CopyArea when the FAQ has one (decision 215), and a secondary Button with the .md file name that opens the guide on the document page (#/framework,
//     #/guidelines, #/design-system).

import { renderButton } from '../../components/button/buttonIndex.js';
import { renderMessage } from '../../components/message/messageIndex.js';
import { renderAccordion } from '../../components/accordion/accordionIndex.js';
import { renderCopyArea } from '../../components/copyArea/copyAreaIndex.js';
import { APP_CONFIG, APP_TEXTS } from '../appConfig.js';
import { getAppError } from '../appErrors.js';
import { loadContent } from '../appContent.js';
import { markdownToHTML } from '../markdown/markdownReader.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the .md file name of a guide (#/{key}).
function guideFile( key ) { return ( APP_CONFIG.guides.find(guide => guide.key === key)?.content ?? '' ).split('/').pop(); }

// Renders the FAQs as an Accordion: each answer (Markdown), its prompt for an AI tool in a CopyArea when it has one,
// then a Button that opens the guide's .md file (same tab).
function renderFaqs( host )
{
    return renderAccordion(host,
    {
        id:'home-faqs', headingLevel:3,
        items:APP_CONFIG.faqs.map(( faq, index ) =>
        {
            const file = guideFile(faq.guide);
            const content = [ `<div class="app-markdown app-home-faq-answer">${markdownToHTML(faq.answer)}</div>` ];
            if ( faq.prompt ) { content.push(promptHost => renderCopyArea(promptHost,{ id:`home-faq-${index}-prompt`, label:APP_TEXTS.home.prompt, text:faq.prompt })); }
            if ( file ) { content.push(buttonHost => renderButton(buttonHost,{ id:`home-faq-${index}-open`, label:file, hierarchy:'SECONDARY', size:'SMALL', iconBefore:'fa-regular fa-file-lines', href:`#/${faq.guide}`, target:'SAME', description:APP_TEXTS.home.openGuide.replace('{file}',file) })); }
            return { id:`home-faq-${index}`, title:faq.question, content };
        })
    });
}

// Renders the home page into root; returns the page instance.
export async function renderHomePage( root )
{
    const children = [];
    const home = await loadContent(APP_CONFIG.content.home);
    const [ intro, concepts = '' ] = ( home ?? '' ).split(APP_CONFIG.homeColumnsMarker);
    root.innerHTML = '<div class="app-reading app-reading-full app-home">'
        + ( home === null ? `<h1>${escapeHTML(APP_CONFIG.appName)}</h1><div class="app-page-message"></div>` : `<div class="app-markdown app-home-intro">${markdownToHTML(intro)}</div>` )
        + '<div class="app-home-columns">'
        + `<div class="app-markdown app-home-concepts">${markdownToHTML(concepts)}</div>`
        + `<section class="app-home-faqs" aria-labelledby="home-faqs-title"><h2 id="home-faqs-title">${escapeHTML(APP_TEXTS.home.faqsTitle)}</h2>`
        + '<div class="app-home-faq-host"></div></section></div></div>';
    if ( home === null ) { children.push(renderMessage(root.querySelector('.app-page-message'),{ id:'home-content-error', type:'DANGER', text:getAppError('CONTENT_UNAVAILABLE').message })); }
    children.push(renderFaqs(root.querySelector('.app-home-faq-host')));
    return {
        // Removes the components of the page and clears it.
        destroy:() => { children.forEach(child => child?.destroy()); root.replaceChildren(); }
    };
}
