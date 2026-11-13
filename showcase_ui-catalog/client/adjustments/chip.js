// chip.js
//
// CUSTOMIZATION ADJUSTMENTS (Chip).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/chip.html. Chips are rendered as a list:
// renderChips(container, configs, onRemove), so the configuration is passed as a list of one Chip.
// Variants panel: iconBefore and iconAfter are checkboxes with fixed icons; the CUSTOM colours are chosen from three
// tokens each, every background / text pair at least 5:1 contrast in the showcase look (checked 2026-10-20);
// removeLabel and texts.remove (accessible names of the remove action) are hidden.

export default
{
    hide:[ 'removeLabel', 'texts.remove' ],
    checkboxes:
    {
        iconBefore:'fa-solid fa-user',
        iconAfter:'fa-solid fa-circle-check'
    },
    choices:
    {
        backgroundToken:[ '--c-surface-muted', '--c-info-soft', '--c-warning-soft' ],
        colorToken:[ '--c-text', '--c-accent', '--c-danger-text' ]
    },
    renderFunction:'renderChips',
    start:{ label:'Administrator', prefix:'Role:', iconBefore:'fa-solid fa-user' },
    // The live example's id ("showcase-chip") identifies the Chip in onRemove.
    prepare:( { config } ) => [ [ config ] ]
};
