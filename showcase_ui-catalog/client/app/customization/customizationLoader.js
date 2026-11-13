// customizationLoader.js
//
// CUSTOMIZATION LOADING.
// Loads what a component page needs: the README, the adjustment file (client/adjustments/<id>.js, optional),
// the customization model, the panel values (stored for this tab, else the start values) and the showcase
// stylesheets the live example needs (the component, its dependencies and the components its adjustment uses).

import { reportAppIssue } from '../appErrors.js';
import { loadContent } from '../appContent.js';
import { readConfigurationTable, readRenderCallbacks } from './readmeConfigReader.js';
import { createCustomizationModel } from './customizationModel.js';
import { readCustomization } from './customizationStore.js';

// Loads the adjustment module of a component when the catalog lists one (npm run catalog); returns { found, adjustment }.
async function loadAdjustment( component )
{
    if ( !component.hasAdjustment ) { return { found:false, adjustment:{} }; }
    const url = `adjustments/${component.id}.js`;
    try { const module = await import(`../../adjustments/${component.id}.js`); return { found:true, adjustment:module.default ?? {} }; }
    catch ( error ) { reportAppIssue('ADJUSTMENT_LOAD_FAILED',{ url, reason:error.message }); return { found:false, adjustment:{} }; }
}

// Returns the component and all components it uses (directly or through others), plus extra ones, for the stylesheets.
function collectStylesheets( componentId, catalog, extra )
{
    const result = new Set();
    const visit = id => { if ( result.has(id) ) { return; } result.add(id); ( catalog.components.find(entry => entry.id === id)?.dependencies ?? [] ).forEach(visit); };
    [ componentId, ...extra ].forEach(visit);
    return [ ...result ];
}

// Loads everything the component page and the Customize page need;
// returns { readme, model, values, hasAdjustment, stylesheets, stage, states } (stage: the adjustment's { width?, minHeight? };
// states: the "States" section, see customizationModel.js, or null).
export async function loadCustomization( component, catalog )
{
    const [ readme, { found, adjustment } ] = await Promise.all([ loadContent(`components/${component.id}/${component.id}README.md`), loadAdjustment(component) ]);
    const model = createCustomizationModel(readConfigurationTable(readme ?? ''),adjustment,readRenderCallbacks(readme));
    const stored = readCustomization(component.id) ?? {};
    const values = { ...model.startValues, ...Object.fromEntries(Object.entries(stored).filter(( [ path ] ) => Object.hasOwn(model.startValues,path))) };
    return { readme, model, values, hasAdjustment:found, stylesheets:collectStylesheets(component.id,catalog,adjustment.uses ?? []), stage:adjustment.stage ?? {}, states:model.states, examples:model.examples };
}
