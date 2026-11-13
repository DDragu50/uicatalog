// collapsiblePanel.js
//
// CUSTOMIZATION ADJUSTMENTS (CollapsiblePanel).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/collapsiblePanel.html; the panel content
// (renderCollapsiblePanel's third argument) is a fixed static example.
// Variants panel, in this order: collapsible, state, status, variant, icon (a Select: NONE or three icons; start
// NONE), addButton and addChips (panel-only checkboxes, start unticked: the "Edit" action and the "Draft" / "3"
// Chips in the header), showSummary (panel-only checkbox, start unticked: a summary line under the header, open or
// closed — summaryRenderer plus showSummaryWhenExpanded), bordered (start off) and cornerRadius (NONE, or ROUNDED shown
// as the token --radius-panel). Every other option keeps its start value (title, description); no placeholder summary.

const PANEL_FIELDS = [ 'addButton', 'addChips', 'showSummary' ];
const SUMMARY = 'Customer since 2019 · 42 orders · last order 12 Oct';
const CHIPS = [ { id:'draft-chip', label:'Draft', type:'WARNING', bordered:true }, { id:'count-chip', label:'3', type:'CUSTOM', bordered:true } ];
const ACTIONS = [ { key:'edit', label:'Edit', icon:'fa-solid fa-pen' } ];

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'collapsible', 'state', 'status', 'variant', 'icon', 'addButton', 'addChips', 'showSummary', 'bordered', 'cornerRadius', 'tooltipMode' ],
    choices:{ icon:[ 'NONE', 'fa-solid fa-user', 'fa-solid fa-id-card', 'fa-solid fa-gear' ] },
    fields:
    [
        { path:'addButton', kind:'string', description:'Adds an "Edit" Button at the end of the header (actions option; guidelines §10.2). Pressing it is reported as onAction in the Output and does not open or close the panel.' },
        { path:'addChips', kind:'string', description:'Adds two Chips after the title, "Draft" and "3" (chips option), e.g. a state and a count.' },
        { path:'showSummary', kind:'string', description:'Adds a short summary line under the header ("Customer since 2019 · 42 orders · last order 12 Oct"), written by the application through summaryRenderer. Normally it shows only while the panel is closed; here it stays visible when open too (showSummaryWhenExpanded), so you can see it in both states.' }
    ],
    checkboxes:{ addButton:'ON', addChips:'ON', showSummary:'ON' },
    // README "DEFAULT, COMPACT" means the variant (status has a DEFAULT value too)
    appliesWhen:{ bordered:values => values.variant !== 'INLINE', cornerRadius:values => values.variant !== 'INLINE' },
    valueLabels:{ addButton:{ ON:'Add button' }, addChips:{ ON:'Add chips' }, showSummary:{ ON:'Show summary' }, cornerRadius:{ ROUNDED:'--radius-panel' } },
    start:
    {
        title:'Account details',
        description:'Review and manage account information',
        icon:'NONE',
        state:'EXPANDED',
        bordered:false
    },
    // A summary renderer that only reports would leave the summary empty; the README option stays documented.
    callbacks:{ summaryRenderer:false, onAction:false },
    // Turns the panel-only options into the configuration (in place, so the Output shows what the component received).
    prepare:( { config, report } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        if ( !config.icon || config.icon === 'NONE' ) { delete config.icon; }
        if ( panel.addButton ) { config.actions = ACTIONS.map(action => ( { ...action } )); config.onAction = ( key, instance ) => report('onAction',key,instance); }
        if ( panel.addChips ) { config.chips = CHIPS.map(chip => ( { ...chip } )); }
        if ( panel.showSummary ) { config.summaryRenderer = () => SUMMARY; config.showSummaryWhenExpanded = true; }
        return [ config, [ '<p><strong>Expanded account content</strong></p><p>Customer since 2019 · 42 orders · Preferred delivery: courier.</p>' ] ];
    }
};
