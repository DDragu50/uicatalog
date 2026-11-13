// stepper.js
//
// CUSTOMIZATION ADJUSTMENTS (Stepper).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/stepper.html (Checkout preset): four steps, "Gift wrap" optional, LINEAR, HORIZONTAL, with
// the button bar so the example can be used at once.
// Variants panel (decision 118: only options with a visible effect; a simple start; extras behind unticked checkboxes):
//   scenario (panel-only: Checkout, Approval with parallel reviews, Order tracking with statuses set by the application),
//   navigation, orientation, marker, labelPlacement, connectors, statusText, showContent, contentPosition, showButtons, then
//   showDescriptions (panel-only checkbox, start ticked) and addActions (panel-only checkbox, start unticked: "Save draft"
//   in the bar) and checkSteps (panel-only checkbox, start unticked: Next and Finish wait 1.5 s for a simulated check, with
//   the Loader line above the bar). Pressing a button is reported in the Output (onStepChange, onStatusChange, onFinish, onAction).
// Hidden: steps (built from the scenario), current (Tracking: "Shipped"), statuses, autoStatus (on), compactWhenNarrow (on;
// the example is wider than 36rem), ariaLabel, texts, actions (set by addActions) and canLeave (set by checkSteps).

import { isChecked } from '../app/customization/customizationModel.js';

const PANEL_FIELDS = [ 'scenario', 'showDescriptions', 'addActions', 'checkSteps' ];
const SCENARIOS =
{
    CHECKOUT:
    [
        { id:'cart', label:'Cart', description:'3 items', icon:'fa-solid fa-cart-shopping' },
        { id:'address', label:'Address', description:'Delivery and invoice', icon:'fa-solid fa-location-dot' },
        { id:'gift', label:'Gift wrap', description:'Paper and card', icon:'fa-solid fa-gift', optional:true },
        { id:'payment', label:'Payment', description:'Card or transfer', icon:'fa-solid fa-credit-card' }
    ],
    APPROVAL:
    [
        { id:'request', label:'Request', description:'Describe the purchase', icon:'fa-solid fa-file-pen' },
        { id:'legal', label:'Legal review', description:'Contract terms', icon:'fa-solid fa-scale-balanced', after:[ 'request' ] },
        { id:'finance', label:'Finance review', description:'Budget', icon:'fa-solid fa-coins', after:[ 'request' ] },
        { id:'security', label:'Security review', description:'Data protection', icon:'fa-solid fa-shield-halved', after:[ 'request' ], optional:true },
        { id:'signoff', label:'Sign-off', description:'Final approval', icon:'fa-solid fa-signature', after:[ 'legal', 'finance', 'security' ] }
    ],
    TRACKING:
    [
        { id:'ordered', label:'Ordered', description:'2 Nov, 09:14', icon:'fa-solid fa-receipt', status:'DONE' },
        { id:'packed', label:'Packed', description:'2 Nov, 15:40', icon:'fa-solid fa-box', status:'DONE' },
        { id:'shipped', label:'Shipped', description:'Delayed at the depot', icon:'fa-solid fa-truck', status:'WARNING' },
        { id:'delivered', label:'Delivered', description:'Expected 5 Nov', icon:'fa-solid fa-house' }
    ]
};

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'scenario', 'navigation', 'orientation', 'marker', 'labelPlacement', 'connectors', 'statusText', 'showContent', 'contentPosition', 'showButtons', 'showDescriptions', 'addActions', 'checkSteps', 'tooltipMode' ],
    fields:
    [
        { path:'scenario', kind:'enum', allowed:[ 'CHECKOUT', 'APPROVAL', 'TRACKING' ], defaultValue:'CHECKOUT', description:'Sample steps: a checkout (one optional step), an approval (three reviews that open together after the request; LINEAR only), or an order tracking with statuses set by the application (best with navigation NONE).' },
        { path:'showDescriptions', kind:'string', description:'Adds a short description under every label (the step\'s description option).' },
        { path:'addActions', kind:'string', description:'Adds the application\'s own "Save draft" button to the bar (actions option); pressing it is reported as onAction in the Output with the current step.' },
        { path:'checkSteps', kind:'string', description:'Next and Finish wait 1.5 s for a simulated server check (canLeave returning a Promise): the Stepper is busy and a line runs above the button bar.' }
    ],
    checkboxes:{ showDescriptions:'ON', addActions:'ON', checkSteps:'ON' },
    valueLabels:{ showDescriptions:{ ON:'Show descriptions' }, addActions:{ ON:'Add actions' }, checkSteps:{ ON:'Check each step (1.5 s)' }, scenario:{ CHECKOUT:'Checkout', APPROVAL:'Approval (parallel steps)', TRACKING:'Order tracking' } },
    appliesWhen:{ addActions:values => values.navigation !== 'NONE' && values.showButtons === true, checkSteps:values => values.navigation !== 'NONE' && values.showButtons === true },
    // "Applies when: Not NONE" refers to navigation (tooltipMode also has the value NONE).
    tokens:{ NONE:'navigation' },
    callbacks:{ canLeave:false },
    stage:{ minHeight:'--size-md-2' },
    start:{ scenario:'CHECKOUT', showDescriptions:'ON', showButtons:true },
    // Builds the steps from the scenario and the panel checkboxes (in place, so the Output shows what the component received).
    prepare:( { config } ) =>
    {
        const scenario = config.scenario ?? 'CHECKOUT', descriptions = isChecked(config.showDescriptions), actions = isChecked(config.addActions), check = isChecked(config.checkSteps);
        PANEL_FIELDS.forEach(path => delete config[path]);
        const linear = ( config.navigation ?? 'LINEAR' ) === 'LINEAR';
        config.steps = SCENARIOS[scenario].map(( { description, after, ...step } ) => (
        {
            ...step,
            ...( descriptions ? { description } : {} ),
            ...( after && linear ? { after } : {} ),
            ...( config.showContent ? { content:[ `<p><strong>${step.label}</strong></p><p>The content of the "${step.label}" step: fields, a summary or a confirmation.</p>` ] } : {} )
        } ));
        if ( scenario === 'TRACKING' ) { config.current = 'shipped'; }
        if ( actions && config.navigation !== 'NONE' && config.showButtons ) { config.actions = [ { key:'draft', label:'Save draft', icon:'fa-solid fa-floppy-disk' } ]; }
        else { delete config.onAction; }
        if ( check && config.navigation !== 'NONE' && config.showButtons ) { config.canLeave = () => new Promise(resolve => setTimeout(() => resolve(true),1500)); }
        return [ config ];
    }
};
