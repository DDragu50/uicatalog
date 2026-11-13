// searchBox.js
//
// CUSTOMIZATION ADJUSTMENTS (SearchBox).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/searchBox.html: search on demand with a button; three scopes (shown on demand).
// Variants panel, in this order: labelVisible, searchMode, debounceMs, showSearchButton with its look
// (searchButtonVariant BUTTON | ICON_BUTTON, searchButtonHierarchy, searchButtonIcon for BUTTON), labelPosition
// (TOP / LEFT / INHERIT), autocomplete, landmark, width, and showScopes — a panel-only checkbox (start unticked) that
// adds the scope chips "Everything", "Orders", "Customers". Every other option keeps its start value.

const PANEL_FIELDS = [ 'showScopes' ];
const SCOPES = [ { value:'all', label:'Everything' }, { value:'orders', label:'Orders', description:'Searches order numbers and references.' }, { value:'customers', label:'Customers' } ];

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'labelVisible', 'searchMode', 'debounceMs', 'showSearchButton', 'searchButtonVariant', 'searchButtonHierarchy', 'searchButtonIcon',
           'labelPosition', 'autocomplete', 'landmark', 'width', 'showScopes', 'tooltipMode' ],
    fields:
    [
        { path:'showScopes', kind:'string', description:'Adds the scope chips "Everything", "Orders", "Customers" under the field: the user picks where to search, and the application receives the choice with the query (onSearch: { query, scopes }). Changing the chip re-runs the current search; "Orders" also shows its own hint.' }
    ],
    checkboxes:{ showScopes:'ON' },
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' }, showScopes:{ ON:'Show search scopes' } },
    // the Search Button options apply with the Button; the magnifier before the text only to the text Button
    appliesWhen:
    {
        searchButtonVariant:values => values.showSearchButton === true,
        searchButtonHierarchy:values => values.showSearchButton === true,
        searchButtonIcon:values => values.showSearchButton === true && ( values.searchButtonVariant ?? 'BUTTON' ) === 'BUTTON'
    },
    start:
    {
        label:'Search orders',
        placeholder:'Order number, customer or product',
        searchMode:'ON_DEMAND',
        showSearchButton:true
    },
    // Adds the scopes when the checkbox is ticked (in place, so the Output shows what the component received).
    prepare:( { config, callbacks } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        if ( panel.showScopes ) { config.scopes = SCOPES.map(scope => ( { ...scope } )); }
        return [ config, ...callbacks ];
    }
};
