// sideNavigation.js
//
// CUSTOMIZATION ADJUSTMENTS (SideNavigation).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/sideNavigation.html. The live example is wide, so the drawer (below 48rem) is not
// shown at desktop width; the navigation sits in a side column of fixed height, as in an application page;
// links are kept in the example (navigation is prevented and reported).
// Variants panel, in this order: levelStyle, expandIndicator, cornerRadius (SMALL / MEDIUM / LARGE shown as their tokens),
// showIcons (panel-only checkbox, start ticked: the item icons; unticked removes them, and the rail, which needs icons, is
// then not offered: allowRail is sent as false), allowRail, railCollapsed, search, searchThreshold.
// Hidden: items, currentId and expandedIds (the example's tree and its current page are fixed).

import { isChecked } from '../app/customization/customizationModel.js';

// Returns a copy of the item tree without icons.
const removeIcons = items => items.map(( { icon, ...item } ) => ( item.children ? { ...item, children:removeIcons(item.children) } : item ));

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'levelStyle', 'expandIndicator', 'cornerRadius', 'showIcons', 'allowRail', 'railCollapsed', 'search', 'searchThreshold', 'tooltipMode' ],
    fields:[ { path:'showIcons', kind:'string', description:'Shows the icons of the entries (the item\'s icon option). Without icons the rail is not offered.' } ],
    checkboxes:{ showIcons:'ON' },
    valueLabels:{ showIcons:{ ON:'Show icons' }, cornerRadius:{ SMALL:'--radius-control-small', MEDIUM:'--radius-control', LARGE:'--radius-control-large' } },
    // Desktop layout (the component becomes a drawer below 48rem).
    stage:{ width:1024 },
    start:
    {
        showIcons:'ON',
        currentId:'active',
        items:
        [
            { id:'dashboard', label:'Dashboard', href:'#dashboard', icon:'fa-solid fa-house' },
            { id:'approvals', label:'Approvals', href:'#approvals', icon:'fa-solid fa-check-double', badge:3 },
            { id:'projects', label:'Projects', href:'#projects', icon:'fa-solid fa-folder', children:[ { id:'active', label:'Active projects', href:'#projects-active' }, { id:'archive', label:'Archive', href:'#projects-archive' } ] },
            { id:'team', label:'Team', icon:'fa-solid fa-users', children:[ { id:'members', label:'Team members', href:'#team-members' }, { id:'absences', label:'Absences', href:'#team-absences', disabled:true } ] },
            { type:'SEPARATOR' },
            { type:'GROUP', label:'Administration', children:[ { id:'users', label:'Users', href:'#users', icon:'fa-solid fa-user-gear' }, { id:'help', label:'Help centre', href:'https://example.com/help', icon:'fa-solid fa-circle-question', external:true } ] }
        ]
    },
    appliesWhen:{ allowRail:values => isChecked(values.showIcons), railCollapsed:values => isChecked(values.showIcons) && values.allowRail === true },
    // Removes the icons when "Show icons" is unticked; keeps the example on its page: the click is reported and the item
    // becomes current.
    prepare:( { config, host } ) =>
    {
        const showIcons = isChecked(config.showIcons);
        delete config.showIcons;
        if ( !showIcons ) { config.items = removeIcons(config.items); config.allowRail = false; }
        const reportNavigation = config.onNavigate;
        config.onNavigate = ( item, event, navigation ) => { reportNavigation?.(item,event,navigation); if ( !item.external ) { event.preventDefault(); navigation.setCurrent(item.id); } };
        const side = document.createElement('div');
        side.className = 'app-preview-side';
        host.append(side);
        return { host:side, args:[ config ] };
    }
};
