// form.js
//
// CUSTOMIZATION ADJUSTMENTS (Form).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/form.html (registration); the fields (renderForm's third argument) are built here.
// Submit is reported in the Output, then the example saves for 1.5 s (as tests/form.html), so the busy indicator
// (busyIndicator: a ring before the buttons, or a layer over the form) can be seen.

import { renderSelect } from '../components/select/selectIndex.js';
import { renderTextInput } from '../components/textInput/textInputIndex.js';
import { renderToggle } from '../components/toggle/toggleIndex.js';

const star = { mandatoryIndicator:'MANDATORY_ASTERISK' };

export default
{
    // "Applies when: AUTO" refers to liveApply (requiredNote also has the value AUTO).
    tokens:{ AUTO:'liveApply' },
    // Panel names as in TextInput: labelPosition START → LEFT; buttonsAlign START / END → LEFT / RIGHT (the values sent
    // stay START / END; in right-to-left languages they mirror).
    valueLabels:{ labelPosition:{ START:'LEFT' }, buttonsAlign:{ START:'LEFT', END:'RIGHT' } },
    // externalMessage (where non-field messages appear) is set by developers; the README "For business" explains it.
    hide:[ 'externalMessage' ],
    start:{ showReset:true },
    uses:[ 'textInput', 'select', 'toggle' ],
    prepare:( { config } ) =>
    {
        const reportSubmit = config.onSubmit;
        if ( typeof reportSubmit === 'function' ) { config.onSubmit = ( values, form ) => { reportSubmit(values,form); return new Promise(resolve => setTimeout(resolve,1500)); }; }
        return [ config,
    [
        host => renderTextInput(host,{ id:'showcase-first-name', name:'firstName', label:'First name', ...star }),
        host => renderTextInput(host,{ id:'showcase-email', name:'email', label:'E-mail', type:'EMAIL', value:'ana@example.com', ...star }),
        host => renderSelect(host,{ id:'showcase-country', name:'country', label:'Country', ...star, options:[ { value:'RO', label:'Romania' }, { value:'DE', label:'Germany' } ] }),
        host => renderToggle(host,{ id:'showcase-newsletter', name:'newsletter', label:'Send me the newsletter' })
    ] ];
    }
};
