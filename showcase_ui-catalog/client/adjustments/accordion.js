// accordion.js
//
// CUSTOMIZATION ADJUSTMENTS (Accordion).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/accordion.html (FAQ preset): four questions, the first one open, SINGLE, JOINED.
// Variants panel (decision 118: only options with a visible effect; a simple start; extras behind unticked checkboxes):
//   expandMode, look, bordered, cornerRadius (ROUNDED shown as the token --radius-panel), then three panel-only
//   checkboxes that add to every item what CollapsiblePanel offers: showIcons (an icon), showDescriptions (a short
//   description under the title), showChips (a Chip after the title, e.g. "New").
// Hidden: items (the four questions), headingLevel and keyboardNavigation (no visible effect; both on by default).

const PANEL_FIELDS = [ 'showIcons', 'showDescriptions', 'showChips' ];
const ITEMS =
[
    { id:'faq-shipping', title:'How fast do you ship?', icon:'fa-solid fa-truck', description:'Delivery times', chip:'Popular', state:'EXPANDED', content:[ '<p>Orders ship within 2 working days; delivery takes 1–3 more days.</p>' ] },
    { id:'faq-returns', title:'Can I return an order?', icon:'fa-solid fa-rotate-left', description:'Returns and refunds', content:[ '<p>Yes, within 30 days, free of charge. The refund arrives within 5 days.</p>' ] },
    { id:'faq-payment', title:'How can I pay?', icon:'fa-solid fa-credit-card', description:'Payment methods', chip:'New', content:[ '<p>By card, bank transfer or invoice (business customers).</p>' ] },
    { id:'faq-warranty', title:'What does the warranty cover?', icon:'fa-solid fa-shield-halved', description:'Warranty terms', content:[ '<p>Two years on all products, for defects in material and workmanship.</p>' ] }
];

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'expandMode', 'look', 'bordered', 'cornerRadius', ...PANEL_FIELDS, 'tooltipMode' ],
    fields:
    [
        { path:'showIcons', kind:'string', description:'Adds an icon before every title (the item\'s icon option, CollapsiblePanel).' },
        { path:'showDescriptions', kind:'string', description:'Adds a short description under every title (the item\'s description option).' },
        { path:'showChips', kind:'string', description:'Adds a Chip after two titles, "Popular" and "New" (the item\'s chips option), e.g. to mark new answers.' }
    ],
    checkboxes:{ showIcons:'ON', showDescriptions:'ON', showChips:'ON' },
    valueLabels:{ showIcons:{ ON:'Show icons' }, showDescriptions:{ ON:'Show descriptions' }, showChips:{ ON:'Show chips' }, cornerRadius:{ ROUNDED:'--radius-panel' } },
    stage:{ minHeight:'--size-md-4' },
    start:{ expandMode:'SINGLE', look:'JOINED' },
    // Builds the items from the panel checkboxes (in place, so the Output shows what the component received).
    prepare:( { config } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        config.items = ITEMS.map(( { icon, description, chip, ...item } ) => (
        {
            ...item,
            ...( panel.showIcons ? { icon } : {} ),
            ...( panel.showDescriptions ? { description } : {} ),
            ...( panel.showChips && chip ? { chips:[ { label:chip, bordered:true } ] } : {} )
        } ));
        return [ config ];
    }
};
