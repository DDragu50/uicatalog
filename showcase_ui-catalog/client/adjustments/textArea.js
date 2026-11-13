// textArea.js
//
// CUSTOMIZATION ADJUSTMENTS (TextArea).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/textArea.html.
// Variants panel: only state, width, labelPosition, spellcheck, rows, autoGrow, maxRows, resize, validation.maxLength,
// counterWarningThreshold, showCounter and errorVisibilityDuration, in this order; every other option is hidden
// (label, help, placeholder and validation on keep their start values; maxLength starts at 40).

export default
{
    show:[ 'state', 'width', 'labelPosition', 'spellcheck', 'rows', 'autoGrow', 'maxRows', 'resize', 'validation.maxLength', 'counterWarningThreshold', 'showCounter', 'errorVisibilityDuration' ],
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' } },
    start:
    {
        label:'Comments',
        help:'Describe the issue in your own words.',
        placeholder:'Type here',
        rows:3,
        'validation.enabled':true,
        'validation.maxLength':40
    }
};
