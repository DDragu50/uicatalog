// checkboxRadioEvents.js
//
// USER INTERACTIONS.
// Delegated native "change" and "focusout" listeners; removed through the instance AbortController.

// Calls onChange when an option input changes, and onLeave when focus moves outside the group.
export function bindCheckboxRadioEvents( root, signal, onChange, onLeave )
{
    root.addEventListener('change',event => { if ( event.target.matches('.ui-checkbox-radio-input') ) { onChange(); } },{ signal });
    root.addEventListener('focusout',event => { if ( !root.contains(event.relatedTarget) ) { onLeave(); } },{ signal });
}
