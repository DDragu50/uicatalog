// contentGroup.js
//
// CUSTOMIZATION ADJUSTMENTS (ContentGroup).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/contentGroup.html ("Personal data").
// Variants panel: only label (start "Personal data"), title (start empty), bordered (start on), semantic, headingLevel
// and direction, in this order; every other option is hidden (description keeps its start value).
// The content (renderContentGroup's third argument) follows semantic, to show the difference between the two:
//   FIELDSET — a group of inputs: three TextInputs (first name, last name, e-mail) the user can change;
//   SECTION  — static content: the same person shown as read-only text (name, e-mail, city), nothing to fill in.

import { renderTextInput } from '../components/textInput/textInputIndex.js';

// Read-only items of the SECTION example (strings are inserted as they are).
const STATIC_ITEMS =
[
    '<p><strong>Name</strong><br>Ana Pop</p>',
    '<p><strong>E-mail</strong><br>ana.pop@example.com</p>',
    '<p><strong>City</strong><br>Bucharest</p>'
];

export default
{
    show:[ 'label', 'title', 'bordered', 'semantic', 'headingLevel', 'direction' ],
    start:{ label:'Personal data', title:'', bordered:true, description:'Used for your invoices.' },
    appliesWhen:
    {
        // README: "SECTION with title" and "Inside a parent grid" (the live example has no parent grid).
        headingLevel:values => values.semantic === 'SECTION' && Boolean(String(values.title ?? '').trim()),
        span:() => false
    },
    uses:[ 'textInput' ],
    prepare:( { config } ) => [ config, config.semantic === 'SECTION' ? STATIC_ITEMS :
    [
        host => renderTextInput(host,{ id:'showcase-first-name', label:'First name', value:'Ana' }),
        host => renderTextInput(host,{ id:'showcase-last-name', label:'Last name', value:'Pop' }),
        host => renderTextInput(host,{ id:'showcase-email', type:'EMAIL', label:'E-mail', value:'ana.pop@example.com' })
    ] ]
};
