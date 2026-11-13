// actionMenu.js
//
// CUSTOMIZATION ADJUSTMENTS (ActionMenu).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/actionMenu.html.
// Variants panel: only icon (a Select of four icons that mean "more actions" or "settings"), size and bordered
// (on: secondary Button with a border; off: tertiary Button), in this order; every other option keeps its start value.

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'icon', 'size', 'bordered', 'tooltipMode' ],
    choices:
    {
        icon:[ 'fa-solid fa-ellipsis-vertical', 'fa-solid fa-ellipsis', 'fa-solid fa-bars', 'fa-solid fa-gear' ]
    },
    // Room for the open menu or popup inside the live example.
    stage:{ minHeight:'--size-md-3' },
    start:
    {
        label:'More actions for order 1042',
        items:
        [
            { key:'edit', label:'Edit', icon:'fa-solid fa-pen' },
            { key:'duplicate', label:'Duplicate', icon:'fa-regular fa-copy' },
            { key:'invoice', label:'Download invoice', icon:'fa-solid fa-file-arrow-down', disabled:true },
            { key:'track', label:'Track shipment', icon:'fa-solid fa-truck', href:'#track' },
            { type:'SEPARATOR' },
            { key:'delete', label:'Delete', icon:'fa-solid fa-trash', danger:true }
        ]
    }
};
