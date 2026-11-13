// customizePage.js
//
// VARIANTS PAGE (narrow screens; address #/component/<id>/variants, earlier #/component/<id>/customize).
// The Variants panel (customization panel) of one component on its own page. Render stores the values and returns to the
// component page, which shows the result at the top.

import { APP_TEXTS } from '../appConfig.js';
import { componentHref } from '../appShell.js';
import { buildConfiguration } from '../customization/customizationModel.js';
import { loadCustomization } from '../customization/customizationLoader.js';
import { renderCustomizationPanel } from '../customization/customizationPanel.js';
import { writeCustomization } from '../customization/customizationStore.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Renders the Variants page into root; returns the page instance.
export async function renderCustomizePage( root, { catalog, params } )
{
    const component = params.component;
    const setup = await loadCustomization(component,catalog);
    const texts = APP_TEXTS.customize;
    root.innerHTML = `<div class="app-reading app-customize-page"><h1>${escapeHTML(texts.pageTitle.replace('{name}',component.name))}</h1>`
        + `<p>${escapeHTML(texts.pageIntro)}</p><p><a href="${componentHref(component.id)}">${escapeHTML(texts.back.replace('{name}',component.name))}</a></p><div class="app-customize-host"></div></div>`;
    const panel = renderCustomizationPanel(root.querySelector('.app-customize-host'),
    {
        componentId:component.id, componentName:component.name, model:setup.model, values:setup.values, title:texts.settings,
        onRender:values =>
        {
            const result = buildConfiguration(setup.model,values);
            if ( result.errors.length ) { panel.showErrors(result.errors); return; }
            writeCustomization(component.id,values);
            window.location.hash = componentHref(component.id);
        }
    });
    return {
        // Removes the panel and clears the page.
        destroy:() => { panel?.destroy(); root.replaceChildren(); }
    };
}
