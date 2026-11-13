// treeView.js
//
// CUSTOMIZATION ADJUSTMENTS (TreeView).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/treeView.html (Files preset): a "Folder" tree, SINGLE, "Invoice 02.xlsx" selected.
// Variants panel (decision 118: only options with a visible effect; a simple start; extras behind unticked checkboxes):
//   selectionMode, checkCascade (MULTIPLE), guideLines, search, editable, then showIcons (panel-only checkbox, start
//   ticked: the item icons), showBadges (panel-only checkbox, start unticked: a counter on two folders) and addActions
//   (panel-only checkbox, start unticked: Open and an icon-only Print in the toolbar; Print only for files, through canAct).
// Hidden: items (the fixed sample tree), the form-field options (name, mandatory, mandatoryIndicator, labelPosition,
// checkedValue: no visible effect here), texts, actions (set by addActions), and the functions loadChildren, canMove
// and canAct (the sample tree loads nothing and allows every move; canAct comes with addActions).

import { isChecked } from '../app/customization/customizationModel.js';

const PANEL_FIELDS = [ 'showIcons', 'showBadges', 'addActions' ];
const ACTIONS = [ { key:'open', label:'Open', icon:'fa-solid fa-folder-open' }, { key:'print', label:'Print', icon:'fa-solid fa-print', iconOnly:true } ];
const BADGES = { contracts:2, images:5 };

// The sample tree (folders and files; the Archive is read-only).
const ITEMS =
[
    { id:'docs', label:'Documents', icon:'fa-solid fa-folder', expanded:true, children:[
        { id:'contracts', label:'Contracts', icon:'fa-solid fa-folder', children:[ { id:'c-2025', label:'Contract 2025.pdf', icon:'fa-solid fa-file-pdf' }, { id:'c-2026', label:'Contract 2026.pdf', icon:'fa-solid fa-file-pdf' } ] },
        { id:'invoices', label:'Invoices', icon:'fa-solid fa-folder', expanded:true, children:[ { id:'inv-01', label:'Invoice 01.xlsx', icon:'fa-solid fa-file-excel' }, { id:'inv-02', label:'Invoice 02.xlsx', icon:'fa-solid fa-file-excel', selected:true } ] },
        { id:'notes', label:'Notes.txt', icon:'fa-solid fa-file-lines' }
    ] },
    { id:'images', label:'Images', icon:'fa-solid fa-folder', children:[ { id:'logo', label:'Logo.png', icon:'fa-solid fa-file-image' }, { id:'banner', label:'Banner.png', icon:'fa-solid fa-file-image' } ] },
    { id:'archive', label:'Archive (read-only)', icon:'fa-solid fa-box-archive', disabled:true, children:[ { id:'old', label:'Old report.pdf', icon:'fa-solid fa-file-pdf' } ] }
];

// Returns a copy of the sample tree with or without icons and badges (NONE: no item starts selected).
function sampleItems( items, panel, selecting )
{
    return items.map(( { icon, selected, children, ...item } ) => (
    {
        ...item,
        ...( panel.showIcons ? { icon } : {} ),
        ...( panel.showBadges && BADGES[item.id] ? { badge:BADGES[item.id] } : {} ),
        ...( selected && selecting ? { selected } : {} ),
        ...( children ? { children:sampleItems(children,panel,selecting) } : {} )
    } ));
}

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'selectionMode', 'checkCascade', 'guideLines', 'search', 'editable', ...PANEL_FIELDS, 'tooltipMode' ],
    fields:
    [
        { path:'showIcons', kind:'string', description:'Shows an icon before every item (the item\'s icon option).' },
        { path:'showBadges', kind:'string', description:'Adds a counter to two folders, "Contracts" and "Images" (the item\'s badge option).' },
        { path:'addActions', kind:'string', description:'Adds the application\'s own buttons for the current item to the toolbar (actions option): "Open" and an icon-only "Print", available only for files (canAct). Pressing one is reported as onAction in the Output.' }
    ],
    checkboxes:{ showIcons:'ON', showBadges:'ON', addActions:'ON' },
    valueLabels:{ showIcons:{ ON:'Show icons' }, showBadges:{ ON:'Show badges' }, addActions:{ ON:'Add actions' } },
    tokens:{ NONE:'selectionMode' },
    appliesWhen:
    {
        checkCascade:values => values.selectionMode === 'MULTIPLE',
        onActivate:values => values.selectionMode === 'NONE',
        onValueChange:values => values.selectionMode !== 'NONE',
        onEdit:values => values.editable === true,
        onAction:values => isChecked(values.addActions)
    },
    callbacks:{ loadChildren:false, canMove:false, canAct:false },
    stage:{ minHeight:'--size-md-4' },
    start:{ showIcons:'ON', label:'Folder', mandatory:false },
    // Builds the sample tree from the panel checkboxes (in place, so the Output shows what the component received). The
    // label names the tree in every mode (NONE has no form label, so it becomes ariaLabel).
    prepare:( { config } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, isChecked(config[path]) ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        const selecting = ( config.selectionMode ?? 'SINGLE' ) !== 'NONE';
        config.items = sampleItems(ITEMS,panel,selecting);
        if ( panel.addActions ) { config.actions = ACTIONS.map(action => ( { ...action } )); config.canAct = ( key, item ) => key !== 'print' || !item.hasChildren; } else { delete config.onAction; }
        if ( !selecting ) { config.ariaLabel = config.label; delete config.label; delete config.mandatory; }
        return [ config ];
    }
};
