// toggle.js
//
// CUSTOMIZATION ADJUSTMENTS (Toggle).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/toggle.html.
// Variants panel: only presentation, state, stateText, stateDisplay, texts.customOn, texts.customOff (the CUSTOM pair,
// starting with "Yes" / "No"), size and labelPosition, in this order; every other option is hidden (label and help
// keep their start values).

export default
{
    show:[ 'presentation', 'state', 'stateText', 'stateDisplay', 'texts.customOn', 'texts.customOff', 'size', 'labelPosition' ],
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' } },
    start:{ label:'Email notifications', help:'Saved immediately.', 'texts.customOn':'Yes', 'texts.customOff':'No' }
};
