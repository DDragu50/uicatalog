// cases.js
//
// SHARED CONTRACT TEST — ONE SMALL VALID CONFIGURATION PER COMPONENT (decision 193, step 2).
// Each case: the render function's name, a function returning a fresh valid configuration (without id: the test adds
// it), optional extra arguments after the configuration, and the checks that do not apply. A new component adds one
// case here; the test reports a component without a case.
//   skip: 'ids'  the component has no id of its own (Chip collections: each chip has its own id, only when removable)

const items = () => [ { id:'one', label:'One', href:'#one', icon:'fa-solid fa-house' }, { id:'two', label:'Two', href:'#two', icon:'fa-solid fa-folder' } ];

export const CASES =
{
    accordion:{ render:'renderAccordion', config:() => ( { items:[ { id:'a1', title:'First', content:[ '<p>One</p>' ] }, { id:'a2', title:'Second', content:[ '<p>Two</p>' ] } ] } ) },
    actionMenu:{ render:'renderActionMenu', config:() => ( { label:'More actions', items:[ { key:'edit', label:'Edit' }, { key:'delete', label:'Delete' } ] } ) },
    appHeader:{ render:'renderAppHeader', config:() => ( { appName:'Orders', homeHref:'#home' } ) },
    badge:{ render:'renderBadge', config:() => ( { name:'Ana Pop', notification:{ text:'AP' } } ) },
    breadcrumbs:{ render:'renderBreadcrumbs', config:() => ( { items:[ { label:'Home', href:'#home' }, { label:'Orders' } ] } ) },
    button:{ render:'renderButton', config:() => ( { label:'Save' } ) },
    calendar:{ render:'renderCalendar', config:() => ( { label:'Due date' } ) },
    checkboxRadio:{ render:'renderCheckboxRadio', config:() => ( { groupLabel:'Priority', options:[ { value:'a', label:'A' }, { value:'b', label:'B' } ] } ) },
    chip:{ render:'renderChips', config:() => ( { label:'Administrator' } ), collection:true, skip:[ 'ids' ] },
    collapsiblePanel:{ render:'renderCollapsiblePanel', config:() => ( { title:'Account details' } ) },
    contentGroup:{ render:'renderContentGroup', config:() => ( { label:'Personal data', semantic:'SECTION' } ) },
    copyArea:{ render:'renderCopyArea', config:() => ( { text:'npm install ui-catalog' } ) },
    form:{ render:'renderForm', config:() => ( {} ), args:() => [ [ '<p>Fields</p>' ] ] },
    loader:{ render:'renderLoader', config:() => ( { label:'Loading', running:true, showDelayMs:0 } ) },
    message:{ render:'renderMessage', config:() => ( { title:'Saved', text:'Your order was updated.' } ) },
    notification:{ render:'renderNotification', config:() => ( { label:'Notifications', icon:'fa-solid fa-bell' } ) },
    notificationsPanel:{ render:'renderNotificationsPanel', config:() => ( { items:[ { id:'n1', text:'Order paid', time:'now' } ] } ) },
    pagination:{ render:'renderPagination', config:() => ( { totalItems:100, label:'Pages' } ) },
    searchBox:{ render:'renderSearchBox', config:() => ( { label:'Search orders' } ) },
    select:{ render:'renderSelect', config:() => ( { label:'Country', options:[ { value:'ro', label:'Romania' }, { value:'de', label:'Germany' } ] } ) },
    sideNavigation:{ render:'renderSideNavigation', config:() => ( { items:items() } ) },
    stepper:{ render:'renderStepper', config:() => ( { steps:[ { id:'s1', label:'Cart' }, { id:'s2', label:'Address' } ] } ) },
    table:{ render:'renderTable', config:() => ( { label:'Orders', columns:[ { field:'number', label:'Order', priority:'ALWAYS' } ], rows:[ { id:1, number:'ORD-1' } ] } ) },
    textArea:{ render:'renderTextArea', config:() => ( { label:'Comments' } ) },
    textInput:{ render:'renderTextInput', config:() => ( { label:'Customer name' } ) },
    toggle:{ render:'renderToggle', config:() => ( { label:'Email notifications' } ) },
    tooltip:{ render:'renderTooltip', config:( host ) => { const target = document.createElement('button'); target.textContent = 'Save'; host.before(target); return { text:'Save', target }; } },
    topNavigation:{ render:'renderTopNavigation', config:() => ( { items:items() } ) },
    treeView:{ render:'renderTreeView', config:() => ( { label:'Folder', items:[ { id:'docs', label:'Documents', children:[ { id:'cv', label:'CV.pdf' } ] } ] } ) },
    uploadFiles:{ render:'renderUploadFiles', config:() => ( { label:'Attachments' } ) }
};
