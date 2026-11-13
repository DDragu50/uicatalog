// collapsiblePanelState.js
//
// RUNTIME STATE.
// Per-instance expansion state, semantic status and lazy-content flag.

// Creates independent runtime state for one panel instance.
export function createPanelState( config ) { return { state:config.state, status:config.status, contentDrawn:!config.lazyContent || config.state === 'EXPANDED' }; }
