// breadcrumbs.js
//
// CUSTOMIZATION ADJUSTMENTS (Breadcrumbs).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Live example: a path of 6 levels (Home › Europe › Romania › Weather › Forecast › Rain); Romania has a menu of its sibling
// countries (Bulgaria, Hungary, Moldova, Romania, Serbia).
// Variants panel, in this order:
//   maxItems — a Select: 6 (all levels visible), 5, 4, 3 (the middle levels go into the "…" menu, an ActionMenu),
//     and 1 — the back link only: backLinkOnNarrow (hidden, always on) replaces the path with "Back to {parent}"
//     below 30rem, so for 1 the example is drawn in a narrow box (--size-md-4) where the back link appears;
//   separator; homeIcon; showCurrent;
//   siblingsMenu — panel-only checkbox: adds the sibling-pages menu (an ActionMenu-style dropdown) to the "Romania" level.
// items, backLinkOnNarrow, structuredData and the texts are hidden.

const PANEL_FIELDS = [ 'siblingsMenu' ];
const ROMANIA_SIBLINGS = [ { label:'Bulgaria', href:'#bulgaria' }, { label:'Hungary', href:'#hungary' }, { label:'Moldova', href:'#moldova' }, { label:'Romania', href:'#romania' }, { label:'Serbia', href:'#serbia' } ];

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'maxItems', 'separator', 'homeIcon', 'showCurrent', 'siblingsMenu', 'tooltipMode' ],
    // maxItems as a Select (sent as a number by prepare); 1 shows the back link (see above).
    choices:{ maxItems:[ '6', '5', '4', '3', '1' ] },
    valueLabels:{ maxItems:{ 6:'6 — all levels', 1:'1 — back link only' }, siblingsMenu:{ ON:'Add a menu of sibling pages' } },
    fields:
    [
        { path:'siblingsMenu', kind:'string', description:'Adds a small arrow button next to "Romania" that opens a menu of the pages at the same level (Bulgaria, Hungary, Moldova, Romania, Serbia), so the user can jump sideways; Romania is highlighted in it. It is visible while Romania is (maxItems 6). The "…" button of a shortened path (maxItems 5, 4 or 3) is also such a menu.', appliesText:'maxItems not 1' }
    ],
    checkboxes:{ siblingsMenu:'ON' },
    appliesWhen:{ siblingsMenu:values => String(values.maxItems) !== '1' },
    // Room for the open menu or popup inside the live example.
    stage:{ minHeight:'--size-md-3' },
    start:
    {
        maxItems:'6',
        homeIcon:true,
        showCurrent:true,
        siblingsMenu:'ON',
        backLinkOnNarrow:true,
        items:
        [
            { label:'Home', href:'#home' },
            { label:'Europe', href:'#europe' },
            { label:'Romania', href:'#romania' },
            { label:'Weather', href:'#weather' },
            { label:'Forecast', href:'#forecast' },
            { label:'Rain' }
        ]
    },
    // Turns the panel values into the Breadcrumbs configuration (in place, so the Output shows what the component received).
    prepare:( { config, host } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        const levels = Number(config.maxItems ?? 6);
        config.backLinkOnNarrow = true;
        if ( panel.siblingsMenu && levels !== 1 )
        {
            config.items = config.items.map(item => ( item.label === 'Romania' ? { ...item, siblings:ROMANIA_SIBLINGS, siblingsLabel:'Other countries' } : item ));
        }
        if ( levels === 1 )
        {
            // the back link replaces the path in a narrow container: draw the example in a narrow box
            delete config.maxItems;
            const box = document.createElement('div');
            box.className = 'app-preview-narrow';
            host.append(box);
            return { host:box, args:[ config ] };
        }
        config.maxItems = levels >= config.items.length ? 0 : levels;
        return [ config ];
    }
};
