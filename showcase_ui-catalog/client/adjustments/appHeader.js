// appHeader.js
//
// CUSTOMIZATION ADJUSTMENTS (AppHeader).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// The live example starts simple: the application name ("Orders", a link home) on the SURFACE background. Every other
// element is discovered through a panel-only checkbox (start unticked) that adds it with the content of
// tests/appHeader.html.
// Variants panel, only options that change what is seen: the checkboxes, in the order the elements appear (first
// level from start to end, then the levels below and the banner above):
//   showLogo, showEnvironment, showSearch, showNotifications, showHelpSettings, showUser, showSignIn,
//   showNavigation (second level), showBreadcrumbs (third level), showAnnouncement (banner above the header).
// Hidden (no visible effect in the example, or set by the example): background (stays SURFACE, the default),
// skipLinkTarget (seen only with the keyboard), menuHost (an empty place for SideNavigation's Button), homeHref,
// sticky and autoMeasure (scrolling), the texts and the element options themselves (logo, search, user, …), which the
// checkboxes fill in. Sign in / Sign out switch the Button.

// Element added by each checkbox (README option and its value).
const ELEMENTS =
{
    showLogo:{ logo:{ src:'assets/logo.svg', alt:'Orders' } },
    showEnvironment:{ environment:{ label:'TEST', description:'Test environment', tone:'WARNING' } },
    showSearch:{ search:{ label:'Search orders', placeholder:'Search orders', searchMode:'ON_DEMAND' } },
    showNotifications:{ notifications:{ items:[ { id:'n1', text:'Order ORD-1042 was paid', time:'2 min ago', icon:'fa-solid fa-circle-check', unread:true }, { id:'n2', text:'Ana Pop approved your invoice', time:'1 hour ago', icon:'fa-solid fa-file-invoice', unread:true } ], seeAllHref:'#notifications' } },
    showHelpSettings:{ help:{ href:'#help' }, settings:{ href:'#settings' } },
    showUser:{ user:{ name:'Ana Pop', role:'Administrator', href:'#me', indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } } },
    showSignIn:{ auth:{ signedIn:true } },
    showNavigation:{ navigation:{ currentId:'orders', items:[ { id:'dashboard', label:'Dashboard', href:'#dashboard' }, { id:'orders', label:'Orders', href:'#orders' }, { id:'customers', label:'Customers', children:[ { id:'list', label:'All customers', href:'#customers' }, { id:'groups', label:'Customer groups', href:'#groups' } ] }, { id:'reports', label:'Reports', href:'#reports' } ] } },
    showBreadcrumbs:{ breadcrumbs:{ items:[ { label:'Home', href:'#home' }, { label:'Orders', href:'#orders' }, { label:'Order 1042' } ] } },
    showAnnouncement:{ announcement:{ type:'WARNING', text:'Planned maintenance tonight 22:00–23:00. Save your work before then.', link:{ href:'#status', label:'Details' } } }
};
const PANEL_FIELDS = Object.keys(ELEMENTS);

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ ...PANEL_FIELDS, 'tooltipMode' ],
    fields:
    [
        { path:'showLogo', kind:'string', description:'Adds a logo before the application name (logo option). With the name present the image is decorative; without a name its alt text names the application.' },
        { path:'showEnvironment', kind:'string', description:'Adds the environment label "TEST" after the name (environment option), so nobody mistakes a test system for the live one.' },
        { path:'showSearch', kind:'string', description:'Adds a search field in the middle of the first level (search option, a SearchBox).' },
        { path:'showNotifications', kind:'string', description:'Adds a bell with the unread count that opens the latest notifications (notifications option, a NotificationsPanel).' },
        { path:'showHelpSettings', kind:'string', description:'Adds icon links to the help and to the application settings (help and settings options).' },
        { path:'showUser', kind:'string', description:'Adds the signed-in user: initials, name, role and an "Online" dot, as a link to the user\'s page (user option, a Badge).' },
        { path:'showSignIn', kind:'string', description:'Adds the Sign out Button (auth option); pressing it switches to Sign in and back, as an application would.' },
        { path:'showNavigation', kind:'string', description:'Adds the second level: the main navigation, with a dropdown under "Customers" (navigation option, a TopNavigation).' },
        { path:'showBreadcrumbs', kind:'string', description:'Adds the third level: the path to the current page (breadcrumbs option, Breadcrumbs).' },
        { path:'showAnnouncement', kind:'string', description:'Adds a closable banner above the header for news that concerns everyone, e.g. planned maintenance (announcement option, a Message BANNER).' }
    ],
    checkboxes:Object.fromEntries(PANEL_FIELDS.map(path => [ path, 'ON' ])),
    valueLabels:
    {
        showLogo:{ ON:'Show a logo' },
        showEnvironment:{ ON:'Show the environment label' },
        showSearch:{ ON:'Show search' },
        showNotifications:{ ON:'Show notifications' },
        showHelpSettings:{ ON:'Show help and settings links' },
        showUser:{ ON:'Show the user' },
        showSignIn:{ ON:'Show Sign in / Sign out' },
        showNavigation:{ ON:'Show navigation (second level)' },
        showBreadcrumbs:{ ON:'Show breadcrumbs (third level)' },
        showAnnouncement:{ ON:'Show an announcement banner' }
    },
    // Room for the open menu or popup inside the live example and desktop layout (the component switches at 48rem).
    stage:{ width:1024, minHeight:'--size-lg-1' },
    start:
    {
        appName:'Orders',
        homeHref:'#home'
    },
    // Adds the ticked elements (in place, so the Output shows what the component received); Sign in / Sign out: the
    // application (here the example) switches the Button, as the README describes.
    prepare:( { config } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        PANEL_FIELDS.filter(path => panel[path]).forEach(path => Object.assign(config,structuredClone(ELEMENTS[path])));
        if ( config.auth )
        {
            const reportSignIn = config.onSignIn, reportSignOut = config.onSignOut;
            config.onSignIn = header => { reportSignIn?.(header); header.setSignedIn(true); };
            config.onSignOut = header => { reportSignOut?.(header); header.setSignedIn(false); };
        }
        else { delete config.onSignIn; delete config.onSignOut; }
        if ( !config.notifications ) { delete config.onNotifications; }
        return [ config ];
    }
};
