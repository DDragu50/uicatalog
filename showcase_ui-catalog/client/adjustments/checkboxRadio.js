// checkboxRadio.js
//
// CUSTOMIZATION ADJUSTMENTS (CheckboxRadio).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/checkboxRadio.html.
// Variants panel: only selectionMode, presentation, direction, iconVariant, iconSize, labelPosition and groupLabel
// (start "Priority"), in this order; every other option is hidden (the four options, the required-selection text and
// the README defaults keep their start values).

export default
{
    show:[ 'selectionMode', 'presentation', 'direction', 'iconVariant', 'iconSize', 'labelPosition', 'groupLabel' ],
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' } },
    start:
    {
        groupLabel:'Priority',
        selectionMode:'SINGLE',
        options:[ { value:'alpha', label:'Alpha' }, { value:'beta', label:'Beta', selected:true }, { value:'gamma', label:'Gamma' }, { value:'delta', label:'Delta', disabled:true } ],
        'texts.requiredSelection':'Select one option.'
    }
};
