// notification.js
//
// CUSTOMIZATION ADJUSTMENTS (Notification).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Variants panel: only six panel-only options (fields), turned into the real configuration by prepare():
//   contentType ICON | TEXT | IMAGE → icon / text / image; contentIcon (three icons) and contentText (TextInput) for
//   ICON and TEXT; IMAGE shows a randomly generated picture on every render (no input); corner → indicator.corner;
//   indicatorType COUNT | DOT | TEXT → indicator.kind (count 3, dot "New activity"); shape for DOT → indicator.shape;
//   indicatorText (TextInput, "New") for TEXT → indicator.value; background (checkbox, icon and text only) → backgroundToken
//   --c-accent with colorToken --c-on-accent. Every README option is hidden; label is always "Notifications".
// "Examples" section: the relevant cases side by side — content, sizes, marker kinds, colours, dot shapes, corners,
// appearance and behaviour — each labelled with the settings that make it.

// Small avatar picture for the image examples (inline SVG, no file needed).
const AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#2f5d73"/><circle cx="32" cy="25" r="11" fill="#f7f8f9"/><path d="M12 58c3-12 11-18 20-18s17 6 20 18z" fill="#f7f8f9"/></svg>');
const BELL = 'fa-solid fa-bell';
const ICONS = [ 'fa-solid fa-bell', 'fa-solid fa-envelope', 'fa-solid fa-user' ];
const PANEL_FIELDS = [ 'contentType', 'contentIcon', 'contentText', 'corner', 'indicatorType', 'shape', 'indicatorText', 'background' ];
// Background of the shape when the "background" checkbox is checked, with a text/icon colour of good contrast (6.6:1 in the showcase look).
const BACKGROUND = { backgroundToken:'--c-accent', colorToken:'--c-on-accent' };

// Returns a randomly generated picture (inline SVG): a person shape on a random background colour.
function randomImage()
{
    const hue = Math.floor(Math.random() * 360);
    const head = 20 + Math.floor(Math.random() * 8);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="hsl(${hue} 45% 38%)"/>`
        + `<circle cx="32" cy="${head + 2}" r="${9 + Math.floor(Math.random() * 4)}" fill="hsl(${( hue + 180 ) % 360} 60% 92%)"/>`
        + `<path d="M12 60c3-12 11-18 20-18s17 6 20 18z" fill="hsl(${( hue + 180 ) % 360} 60% 92%)"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    hide:[ 'label', 'icon', 'image', 'text', 'size', 'clickable', 'disabled', 'border', 'colorToken', 'backgroundToken', 'indicator', 'texts.count' ],
    fields:
    [
        { path:'contentType', kind:'enum', allowed:[ 'ICON', 'TEXT', 'IMAGE' ], defaultValue:'ICON', description:'Main content: an icon, a short text or a picture (a random one on every render).' },
        { path:'contentIcon', kind:'enum', allowed:ICONS, defaultValue:BELL, description:'Icon of the main content.', appliesText:'contentType ICON' },
        { path:'contentText', kind:'string', defaultValue:'AP', description:'Text of the main content: 1–3 characters show a circle, longer text a pill (at most 12 characters).', appliesText:'contentType TEXT' },
        { path:'corner', kind:'enum', allowed:[ 'TOP_RIGHT', 'TOP_LEFT', 'BOTTOM_RIGHT', 'BOTTOM_LEFT' ], defaultValue:'TOP_RIGHT', description:'Corner of the marker (mirrored in right-to-left languages).' },
        { path:'indicatorType', kind:'enum', allowed:[ 'COUNT', 'DOT', 'TEXT' ], defaultValue:'COUNT', description:'What the marker shows: a count (3), a dot or a short text ("New"); indicator.kind in the README.' },
        { path:'shape', kind:'enum', allowed:[ 'CIRCLE', 'TRIANGLE', 'SQUARE', 'DIAMOND' ], defaultValue:'CIRCLE', description:'Shape of the dot.', appliesText:'indicatorType DOT' },
        { path:'indicatorText', kind:'string', defaultValue:'New', description:'Text of the marker: one character shows a circle, longer text a pill. Empty text hides the marker.', appliesText:'indicatorType TEXT' },
        { path:'background', kind:'string', description:'Fills the shape: --c-accent background with --c-on-accent icon or text (contrast 6.6:1). Not for pictures.', appliesText:'contentType ICON or TEXT' }
    ],
    // "background" is a checkbox: checked sends the background token (the colours are set in prepare).
    checkboxes:{ background:BACKGROUND.backgroundToken },
    appliesWhen:
    {
        contentIcon:values => values.contentType === 'ICON',
        contentText:values => values.contentType === 'TEXT',
        shape:values => values.indicatorType === 'DOT',
        indicatorText:values => values.indicatorType === 'TEXT',
        background:values => values.contentType !== 'IMAGE'
    },
    start:{ contentType:'ICON', contentIcon:BELL, contentText:'AP', corner:'TOP_RIGHT', indicatorType:'COUNT', shape:'CIRCLE', indicatorText:'New' },
    // Turns the panel-only options into the Notification configuration (in place, so the Output shows what the component received).
    prepare:( { config, callbacks } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        config.label = 'Notifications';
        if ( panel.contentType === 'IMAGE' ) { config.image = randomImage(); }
        else if ( panel.contentType === 'TEXT' ) { config.text = String(panel.contentText ?? '').trim() || 'AP'; }
        else { config.icon = panel.contentIcon || BELL; }
        if ( panel.background && panel.contentType !== 'IMAGE' ) { Object.assign(config,BACKGROUND); }
        const kind = panel.indicatorType || 'COUNT';
        config.indicator = { kind, corner:panel.corner || 'TOP_RIGHT',
            ...( kind === 'COUNT' ? { value:3 } : kind === 'TEXT' ? { value:String(panel.indicatorText ?? '').trim(), type:'INFO' } : { shape:panel.shape || 'CIRCLE', description:'New activity' } ) };
        return [ config, ...callbacks ];
    },
    examples:
    [
        { title:'Main content', items:
        [
            { label:'icon', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3 } } },
            { label:'text (1–3 characters: circle)', config:{ label:'Ana Pop', text:'AP', indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } } },
            { label:'text (longer: pill)', config:{ label:'Inbox', text:'Inbox', indicator:{ kind:'COUNT', value:12 } } },
            { label:'image', config:{ label:'Ana Pop', image:AVATAR, indicator:{ kind:'DOT', type:'SUCCESS', description:'Online' } } }
        ] },
        { title:'Sizes', items:
        [
            { label:'size SMALL', config:{ label:'Notifications', icon:BELL, size:'SMALL', indicator:{ kind:'COUNT', value:3 } } },
            { label:'size MEDIUM (default)', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3 } } },
            { label:'size LARGE', config:{ label:'Notifications', icon:BELL, size:'LARGE', indicator:{ kind:'COUNT', value:3 } } }
        ] },
        { title:'Marker kinds', items:
        [
            { label:'COUNT 3', config:{ label:'Messages', icon:'fa-solid fa-envelope', indicator:{ kind:'COUNT', value:3 } } },
            { label:'COUNT 120, max 99 → "99+"', config:{ label:'Messages', icon:'fa-solid fa-envelope', indicator:{ kind:'COUNT', value:120, max:99 } } },
            { label:'COUNT 0 (hidden)', config:{ label:'Messages', icon:'fa-solid fa-envelope', indicator:{ kind:'COUNT', value:0 } } },
            { label:'DOT', config:{ label:'Updates', icon:'fa-solid fa-rotate', indicator:{ kind:'DOT', description:'New updates' } } },
            { label:'TEXT "New"', config:{ label:'Releases', icon:'fa-solid fa-gift', indicator:{ kind:'TEXT', value:'New', type:'INFO' } } }
        ] },
        { title:'Marker colours (type)', items:
        [
            { label:'INFO', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:5, type:'INFO' } } },
            { label:'SUCCESS', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:5, type:'SUCCESS' } } },
            { label:'WARNING', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:5, type:'WARNING' } } },
            { label:'DANGER (default)', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:5, type:'DANGER' } } },
            { label:'CUSTOM (accent colours)', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:5, type:'CUSTOM', backgroundToken:'--c-accent', colorToken:'--c-on-accent' } } }
        ] },
        { title:'Status dots (shape and colour together, never colour alone)', items:
        [
            { label:'CIRCLE, SUCCESS: online', config:{ label:'Ana Pop', text:'AP', indicator:{ kind:'DOT', shape:'CIRCLE', type:'SUCCESS', corner:'BOTTOM_RIGHT', description:'Online' } } },
            { label:'TRIANGLE, WARNING: away', config:{ label:'Bogdan Ionescu', text:'BI', indicator:{ kind:'DOT', shape:'TRIANGLE', type:'WARNING', corner:'BOTTOM_RIGHT', description:'Away' } } },
            { label:'SQUARE, DANGER: busy', config:{ label:'Chloé Martin', text:'CM', indicator:{ kind:'DOT', shape:'SQUARE', type:'DANGER', corner:'BOTTOM_RIGHT', description:'Busy' } } },
            { label:'DIAMOND, INFO: in a meeting', config:{ label:'Dan Pop', text:'DP', indicator:{ kind:'DOT', shape:'DIAMOND', type:'INFO', corner:'BOTTOM_RIGHT', description:'In a meeting' } } }
        ] },
        { title:'Marker corner', items:
        [
            { label:'TOP_RIGHT (default)', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3, corner:'TOP_RIGHT' } } },
            { label:'TOP_LEFT', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3, corner:'TOP_LEFT' } } },
            { label:'BOTTOM_RIGHT', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3, corner:'BOTTOM_RIGHT' } } },
            { label:'BOTTOM_LEFT', config:{ label:'Notifications', icon:BELL, indicator:{ kind:'COUNT', value:3, corner:'BOTTOM_LEFT' } } }
        ] },
        { title:'Appearance and behaviour', items:
        [
            { label:'border', config:{ label:'Notifications', icon:BELL, border:true, indicator:{ kind:'COUNT', value:3 } } },
            { label:'own colours (accent)', config:{ label:'Notifications', icon:BELL, backgroundToken:'--c-accent', colorToken:'--c-on-accent', indicator:{ kind:'COUNT', value:3 } } },
            { label:'clickable false (display only)', config:{ label:'3 new notifications', icon:BELL, clickable:false, indicator:{ kind:'COUNT', value:3 } } },
            { label:'disabled', config:{ label:'Notifications', icon:BELL, disabled:true, indicator:{ kind:'COUNT', value:3 } } }
        ] }
    ]
};
