// tooltip.js
//
// CUSTOMIZATION ADJUSTMENTS (Tooltip).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/tooltip.html: an icon button "Save" named by its tooltip (purpose LABEL) with the shortcut
// "Ctrl+S". The example builds the button (target) and puts the Tooltip's container next to it. Point at the button
// or reach it with Tab.
// Variants panel: text, shortcut, purpose, placement, tone, arrow, longPress, showDelayMs.
// Hidden: target (the sample button), targets (a group of elements; see the README), onlyWhenTruncated (the sample text
// is never cut off), hideDelayMs and disabled.

import { renderButton } from '../components/button/buttonIndex.js';

export default
{
    show:[ 'text', 'shortcut', 'purpose', 'placement', 'tone', 'arrow', 'longPress', 'showDelayMs' ],
    start:{ text:'Save', shortcut:'Ctrl+S', purpose:'LABEL' },
    uses:[ 'button' ],
    // The example always has a target (set by prepare, not by the panel): text and purpose always apply, targets never.
    appliesWhen:{ text:() => true, purpose:() => true, targets:() => false },
    stage:{ minHeight:'--size-md-1' },
    // Renders the sample icon button in the middle of the example and hands the Tooltip its container next to it.
    prepare:( { config, host } ) =>
    {
        host.style.cssText = 'display:flex; justify-content:center; align-items:center; min-block-size:var(--size-md-1);';
        const buttonHost = document.createElement('span'), tipHost = document.createElement('span');
        host.append(buttonHost,tipHost);
        renderButton(buttonHost,{ id:'showcase-tooltip-target', buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-floppy-disk', ariaLabel:'Save', hierarchy:'SECONDARY' });
        config.target = document.getElementById('showcase-tooltip-target');
        return { host:tipHost, args:[ config ] };
    }
};
