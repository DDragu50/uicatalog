// button.js
//
// CUSTOMIZATION ADJUSTMENTS (Button).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/button.html.
// Variants panel: buttonVariant, hierarchy, size, label, iconBefore and iconAfter (checkboxes), iconSize, width, minWidth.
// The other options are hidden; icon and ariaLabel keep their start values so ICON_BUTTON still renders. radius and
// iconButtonRadius are hidden because the corners belong to each hierarchy in showcase-styling/button.css.
// "States" section: every hierarchy in every state, as a text button labelled "Continue" with the README defaults.
// Links (decision 185): href, target and newTabIcon are in the panel, at its end (decision 186; target and newTabIcon only with an address);
// newTabText, download and rel are hidden. href starts empty, so the example starts as a button. In the example a
// plain click on a link that opens in the same tab is reported and then stopped, so the example stays on the page;
// Ctrl / Cmd + click, the browser's menu and NEW_TAB open the address in a new tab.

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    // "Applies when: BUTTON" refers to buttonVariant (buttonType also has the value BUTTON).
    tokens:{ BUTTON:'buttonVariant' },
    // Panel order: the link options (href, target, newTabIcon) come last (decision 186).
    show:[ 'buttonVariant', 'hierarchy', 'size', 'label', 'iconBefore', 'iconAfter', 'iconSize', 'width', 'minWidth', 'tooltipMode', 'href', 'target', 'newTabIcon' ],
    hide:[ 'buttonType', 'disabled', 'icon', 'ariaLabel', 'description', 'radius', 'iconButtonRadius', 'newTabText', 'download', 'rel' ],
    checkboxes:
    {
        iconBefore:'fa-solid fa-arrow-right-to-bracket',
        iconAfter:'fa-solid fa-chevron-right'
    },
    start:
    {
        label:'Continue',
        iconBefore:'fa-solid fa-arrow-right-to-bracket',
        iconAfter:'fa-solid fa-chevron-right',
        icon:'fa-solid fa-trash',
        ariaLabel:'Delete item'
    },
    states:
    {
        rows:'hierarchy',
        config:{ label:'Continue' }
    },
    // A plain click on a same-tab link: reported (onClick), then stopped so the example does not leave the page.
    prepare:( { config, host, callbacks } ) =>
    {
        host.addEventListener('click',event =>
        {
            const link = event.target.closest?.('a[href]');
            const plain = event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
            if ( link && plain && link.getAttribute('target') !== '_blank' ) { event.preventDefault(); }
        });
        return [ config, ...callbacks ];
    }
};
