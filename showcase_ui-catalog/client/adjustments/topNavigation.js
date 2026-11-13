// topNavigation.js
//
// CUSTOMIZATION ADJUSTMENTS (TopNavigation).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Variants panel (decisions 190, 191): currentStyle first; items, currentId and tooltipMode are hidden; the live example starts as a simple navigation (seven
// pages, no icons, no badges, no second level; Dashboard is the current page). Three panel-only checkboxes add:
//   icons        an icon before each top-level label;
//   badges       counters on Approvals (3) and Team (12);
//   secondLevel  sub-pages: Projects (its own page plus a list), Team (groups, the whole item opens the list) and
//                Products (a MEGA panel with descriptions).
// prepare() builds items from them (and sets currentId); navigation stays in the example.

const PANEL_FIELDS = [ 'icons', 'badges', 'secondLevel' ];
const ICONS = { dashboard:'fa-solid fa-house', approvals:'fa-solid fa-circle-check', projects:'fa-solid fa-folder', team:'fa-solid fa-users', products:'fa-solid fa-box', reports:'fa-solid fa-chart-column', help:'fa-solid fa-circle-question' };
const BADGES = { approvals:3, team:12 };
// Sub-pages of the sections (secondLevel); Team and Products have no own page then (the whole item opens the panel).
const CHILDREN =
{
    projects:{ children:[ { id:'active', label:'Active projects', href:'#projects-active' }, { id:'archive', label:'Archive', href:'#projects-archive' }, { type:'SEPARATOR' }, { id:'new', label:'New project', href:'#projects-new' } ] },
    team:{ href:'', children:[ { type:'GROUP', label:'People', children:[ { id:'members', label:'Team members', href:'#team-members' }, { id:'absences', label:'Absences', href:'#team-absences', disabled:true } ] }, { type:'GROUP', label:'Access', children:[ { id:'roles', label:'Roles and permissions', href:'#team-roles' } ] } ] },
    products:{ href:'', panel:'MEGA', children:[ { type:'GROUP', label:'Hardware', children:[ { id:'laptops', label:'Laptops', href:'#laptops', description:'Business laptops and docks' }, { id:'monitors', label:'Monitors', href:'#monitors', description:'24" to 34" displays' } ] }, { type:'GROUP', label:'Software', children:[ { id:'office', label:'Office suite', href:'#office', description:'Documents, sheets and mail' }, { id:'security', label:'Security', href:'#security', description:'Antivirus and VPN' } ] } ] }
};
const PAGES = [ [ 'dashboard', 'Dashboard' ], [ 'approvals', 'Approvals' ], [ 'projects', 'Projects' ], [ 'team', 'Team' ], [ 'products', 'Products' ], [ 'reports', 'Reports' ], [ 'help', 'Help centre' ] ];

// Returns the items for the chosen checkboxes: simple pages, plus icons, badges and sub-pages when ticked.
function buildItems( { icons, badges, secondLevel } )
{
    return PAGES.map(( [ id, label ] ) =>
    {
        const item = { id, label, href:`#${id}` };
        if ( icons ) { item.icon = ICONS[id]; }
        if ( badges && BADGES[id] ) { item.badge = BADGES[id]; }
        if ( secondLevel && CHILDREN[id] ) { Object.assign(item,structuredClone(CHILDREN[id])); if ( !item.href ) { delete item.href; } }
        return item;
    });
}

export default
{
    // Room for the open menu or popup inside the live example and desktop layout (the component switches at 48rem).
    stage:{ width:1024, minHeight:'--size-md-4' },
    show:[ 'currentStyle', 'icons', 'badges', 'secondLevel' ],
    // tooltipMode (only the narrow-screen menu button) is hidden: the example is always the wide layout (decision 191).
    hide:[ 'items', 'currentId', 'tooltipMode' ],
    fields:
    [
        { path:'icons', kind:'string', defaultValue:'', description:'Adds an icon before each top-level label.' },
        { path:'badges', kind:'string', defaultValue:'', description:'Adds counters (badges) to Approvals and Team.' },
        { path:'secondLevel', kind:'string', defaultValue:'', description:'Adds sub-pages: Projects (own page and a list), Team (groups) and Products (a MEGA panel).' }
    ],
    checkboxes:{ icons:'ICONS', badges:'BADGES', secondLevel:'SECOND_LEVEL' },
    valueLabels:{ icons:{ ICONS:'Show icons' }, badges:{ BADGES:'Show badges' }, secondLevel:{ SECOND_LEVEL:'Show a second level' } },
    // Simple navigation at the start (the checkboxes unticked); items are built by prepare().
    start:{ items:buildItems({}), currentId:'dashboard' },
    // Builds items from the checkboxes (in place, so the Output shows what the component received) and keeps the example
    // on its page: the click is reported and the item becomes current.
    prepare:( { config } ) =>
    {
        const chosen = Object.fromEntries(PANEL_FIELDS.map(path => [ path, Boolean(config[path]) ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        config.items = buildItems(chosen);
        config.currentId = 'dashboard';
        const reportNavigation = config.onNavigate;
        config.onNavigate = ( item, event, navigation ) => { reportNavigation?.(item,event,navigation); if ( !item.external ) { event.preventDefault(); navigation.setCurrent(item.id); } };
        return [ config ];
    }
};
