// customizationStore.js
//
// CUSTOMIZATION STORE.
// Keeps the panel values of each component for the current browser tab, so the component page and the narrow-screen
// Customize page share them and a reload keeps them. Browser storage may be unavailable: values then live in memory only.

import { APP_CONFIG } from '../appConfig.js';

const memory = new Map();

// Returns the storage key of a component.
function storageKey( componentId ) { return `${APP_CONFIG.customizationStorageKey}.${componentId}`; }

// Returns the stored panel values of a component, or null when nothing was stored.
export function readCustomization( componentId )
{
    if ( memory.has(componentId) ) { return { ...memory.get(componentId) }; }
    try { const stored = JSON.parse(sessionStorage.getItem(storageKey(componentId)) ?? 'null'); return stored && typeof stored === 'object' ? stored : null; }
    catch { return null; }
}

// Stores the panel values of a component.
export function writeCustomization( componentId, values )
{
    memory.set(componentId,{ ...values });
    try { sessionStorage.setItem(storageKey(componentId),JSON.stringify(values)); }
    catch { /* storage unavailable: the values are kept in memory for this visit */ }
}
