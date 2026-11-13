// select.js
//
// CUSTOMIZATION ADJUSTMENTS (Select).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/select.html: a country list with groups, custom list with search.
// Variants panel: only presentation, state, width, selectionMode, labelPosition, searchable and showMultipleHint, in this
// order; every other option is hidden (label, help and the options list keep their start values).

export default
{
    show:[ 'presentation', 'state', 'width', 'selectionMode', 'labelPosition', 'searchable', 'showMultipleHint' ],
    // "Applies when: NATIVE" refers to presentation (touchPresentation also has the value NATIVE).
    tokens:{ NATIVE:'presentation' },
    // Room for the open menu or popup inside the live example.
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' } },
    stage:{ minHeight:'--size-md-4' },
    start:
    {
        label:'Country',
        help:'Where the order is delivered.',
        presentation:'CUSTOM',
        searchable:true,
        options:
        [
            { group:'Europe', options:[ { value:'ro', label:'Romania', selected:true }, { value:'hu', label:'Hungary' }, { value:'de', label:'Germany' }, { value:'fr', label:'France' } ] },
            { group:'America', options:[ { value:'us', label:'United States' }, { value:'ca', label:'Canada' }, { value:'br', label:'Brazil', disabled:true } ] }
        ]
    }
};
