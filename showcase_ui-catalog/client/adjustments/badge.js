// badge.js
//
// CUSTOMIZATION ADJUSTMENTS (Badge).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Variants panel: name, description, then five panel-only options (fields) turned into the real configuration by
// prepare(), with size and layout between them:
//   picture INITIALS | ICON | IMAGE | NONE → notification { text (initials from the name) | icon | image } or none;
//   status NONE | ONLINE | AWAY | BUSY | UNREAD → the marker: a status dot (shape and colour together, bottom-right
//     corner) or a count of 3 (top-right); only with a picture;
//   interaction LINK | BUTTON | DISPLAY → href "#profile" | onClick (reported in the Output) | neither;
//   background PAGE | SURFACE | BRAND → where the badge sits in the live example: on the example area, on a light
//     header bar (--c-surface) or on a brand-coloured header bar (--c-accent; name and description in --c-on-accent).
// Every other README option is hidden (colorToken and descriptionColorToken are set by background BRAND).
// Start values (panel and live example): John Doe, Super Hero, initials, UNREAD, MEDIUM, HORIZONTAL, BUTTON, PAGE.
// "Examples" section: one row — team members online / away (long name and description, cut with "…") / busy with the
// status dot bottom-left, and a support channel with an icon and an unread count.

// Small avatar picture (inline SVG, no file needed).
const AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#8a5a2b"/><circle cx="32" cy="25" r="11" fill="#f7f8f9"/><path d="M12 58c3-12 11-18 20-18s17 6 20 18z" fill="#f7f8f9"/></svg>');
const PANEL_FIELDS = [ 'picture', 'status', 'interaction', 'background' ];
// Status markers: shape and colour together (never colour alone), described for screen readers.
const STATUS =
{
    ONLINE:{ kind:'DOT', shape:'CIRCLE', type:'SUCCESS', corner:'BOTTOM_RIGHT', description:'Online' },
    AWAY:{ kind:'DOT', shape:'TRIANGLE', type:'WARNING', corner:'BOTTOM_RIGHT', description:'Away' },
    BUSY:{ kind:'DOT', shape:'SQUARE', type:'DANGER', corner:'BOTTOM_RIGHT', description:'Busy' },
    UNREAD:{ kind:'COUNT', value:3, corner:'TOP_RIGHT' }
};
// Text colours on the brand background (contrast 6.6:1 in the showcase look).
const ON_BRAND = { colorToken:'--c-on-accent', descriptionColorToken:'--c-on-accent' };

// Returns up to two initials of a name ("Ana Pop" → "AP").
function initials( name )
{
    return String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0].toUpperCase()).join('') || '?';
}

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'name', 'description', 'picture', 'status', 'size', 'layout', 'interaction', 'background', 'tooltipMode' ],
    fields:
    [
        { path:'picture', kind:'enum', allowed:[ 'INITIALS', 'ICON', 'IMAGE', 'NONE' ], defaultValue:'INITIALS', description:'What stands for the person or thing: initials (taken from the name), an icon, a picture, or nothing (text only).' },
        { path:'status', kind:'enum', allowed:[ 'NONE', 'ONLINE', 'AWAY', 'BUSY', 'UNREAD' ], defaultValue:'UNREAD', description:'Marker on the picture: a status dot (online circle, away triangle, busy square) or a count of unread items.', appliesText:'picture not NONE' },
        { path:'interaction', kind:'enum', allowed:[ 'LINK', 'BUTTON', 'DISPLAY' ], defaultValue:'BUTTON', description:'LINK opens a page (href); BUTTON runs an action (onClick, shown in the Output); DISPLAY only shows.' },
        { path:'background', kind:'enum', allowed:[ 'PAGE', 'SURFACE', 'BRAND' ], defaultValue:'PAGE', description:'Where the badge sits: on the page, on a light header bar, or on a brand-coloured header bar (light text: colorToken and descriptionColorToken --c-on-accent).' }
    ],
    valueLabels:{ interaction:{ DISPLAY:'DISPLAY ONLY' } },
    appliesWhen:{ status:values => values.picture !== 'NONE' },
    // onClick is set by prepare() for interaction BUTTON only.
    callbacks:{ onClick:false },
    start:{ name:'John Doe', description:'Super Hero', picture:'INITIALS', status:'UNREAD', size:'MEDIUM', layout:'HORIZONTAL', interaction:'BUTTON', background:'PAGE' },
    // Turns the panel-only options into the Badge configuration (in place, so the Output shows what the component received)
    // and places the badge on the chosen background.
    prepare:( { config, host, report } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        const picture = panel.picture === 'ICON' ? { icon:'fa-solid fa-user' } : panel.picture === 'IMAGE' ? { image:AVATAR }
            : panel.picture === 'NONE' ? null : { text:initials(config.name) };
        if ( picture )
        {
            const marker = STATUS[panel.status];
            config.notification = marker ? { ...picture, indicator:{ ...marker } } : picture;
        }
        if ( panel.interaction === 'LINK' ) { config.href = '#profile'; }
        else if ( panel.interaction === 'BUTTON' ) { config.onClick = ( event, instance ) => report('onClick',event,instance); }
        if ( panel.background === 'BRAND' ) { Object.assign(config,ON_BRAND); }
        if ( panel.background === 'PAGE' ) { return [ config ]; }
        const bar = document.createElement('div');
        bar.className = `app-preview-bar app-preview-bar-${panel.background === 'BRAND' ? 'brand' : 'surface'}`;
        host.append(bar);
        return { host:bar, args:[ config ] };
    },
    examples:
    [
        { title:'Team members and channels (status bottom-left: shape and colour together)', fit:true, items:
        [
            { label:'ONLINE', config:{ name:'Ana Pop', description:'Designer', notification:{ text:'AP', indicator:{ ...STATUS.ONLINE, corner:'BOTTOM_LEFT' } } } },
            { label:'AWAY; long name and description cut with "…", full text as tooltip', config:{ name:'Alexandra-Maria Constantinescu-Popovici', description:'Away until 14:00, head of customer operations, Europe', notification:{ text:'AC', indicator:{ ...STATUS.AWAY, corner:'BOTTOM_LEFT' } } } },
            { label:'BUSY', config:{ name:'Chloé Martin', description:'In a call', notification:{ text:'CM', indicator:{ ...STATUS.BUSY, corner:'BOTTOM_LEFT' } } } },
            { label:'support channel: icon, unread messages', config:{ name:'Support', description:'3 unread messages', href:'#support', notification:{ icon:'fa-solid fa-headset', indicator:{ kind:'COUNT', value:3 } } } }
        ] }
    ]
};
