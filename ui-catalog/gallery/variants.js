// variants.js
//
// GALLERY VARIANTS (decision 194). The key variants of every component, as the gallery shows them: { label, config }
// per variant; the gallery adds the id. config may be a function (host) => config when the component needs something
// from the page (Tooltip's target); args are extra arguments after the configuration (Form's children); a Chip
// collection takes a list of chips. A new component adds its entry here; `npm run check` reports a component without one.

const nav = () => [ { id:'dashboard', label:'Dashboard', href:'#dashboard', icon:'fa-solid fa-house' }, { id:'orders', label:'Orders', href:'#orders', icon:'fa-solid fa-box' }, { id:'reports', label:'Reports', href:'#reports', icon:'fa-solid fa-chart-column' } ];
const options = () => [ { value:'ro', label:'Romania' }, { value:'de', label:'Germany' }, { value:'fr', label:'France' } ];
// Item ids must be unique in the page: each variant gets its own prefix.
const panelItems = prefix => [ { id:`${prefix}-shipping`, title:'Shipping address', content:[ '<p>Street 1, Bucharest</p>' ] }, { id:`${prefix}-billing`, title:'Billing address', content:[ '<p>Same as shipping</p>' ] }, { id:`${prefix}-payment`, title:'Payment', content:[ '<p>Card ending 4821</p>' ] } ];
const tree = () => [ { id:'docs', label:'Documents', children:[ { id:'cv', label:'CV.pdf' }, { id:'letter', label:'Letter.docx' } ] }, { id:'photos', label:'Photos', children:[ { id:'beach', label:'Beach.jpg' } ] } ];

export const VARIANTS =
{
    accordion:[
        { label:'Joined, one open at a time', config:{ items:panelItems('joined') } },
        { label:'Separate, rounded, several open', config:{ items:panelItems('separate'), look:'SEPARATE', cornerRadius:'ROUNDED', expandMode:'MULTIPLE' } }
    ],
    actionMenu:[
        { label:'Medium', config:{ label:'More actions', items:[ { key:'edit', label:'Edit' }, { key:'copy', label:'Duplicate' }, { key:'delete', label:'Delete' } ] } },
        { label:'Small', config:{ label:'Row actions', size:'SMALL', items:[ { key:'open', label:'Open' }, { key:'archive', label:'Archive' } ] } }
    ],
    appHeader:[
        { label:'Surface', config:{ appName:'Orders', homeHref:'#home' } },
        { label:'Brand background', config:{ appName:'Orders', homeHref:'#home', background:'BRAND' } }
    ],
    badge:[
        { label:'Horizontal, medium', config:{ name:'Ana Pop', description:'Sales manager', notification:{ text:'AP' } } },
        { label:'Vertical, large', config:{ name:'Ion Ionescu', description:'Designer', size:'LARGE', layout:'VERTICAL', notification:{ icon:'fa-solid fa-user' } } }
    ],
    breadcrumbs:[
        { label:'Chevron', config:{ items:[ { label:'Home', href:'#home' }, { label:'Orders', href:'#orders' }, { label:'Order 1042' } ] } },
        { label:'Slash', config:{ separator:'SLASH', items:[ { label:'Home', href:'#home' }, { label:'Settings', href:'#settings' }, { label:'Users' } ] } }
    ],
    button:[
        { label:'Primary', config:{ label:'Save' } },
        { label:'Secondary, icon before', config:{ label:'Export', hierarchy:'SECONDARY', iconBefore:'fa-solid fa-download' } },
        { label:'Tertiary', config:{ label:'Cancel', hierarchy:'TERTIARY' } },
        { label:'Link look', config:{ label:'Read the terms', hierarchy:'LINK', href:'#terms' } },
        { label:'Icon button', config:{ buttonVariant:'ICON_BUTTON', icon:'fa-solid fa-trash', ariaLabel:'Delete' } },
        { label:'Disabled', config:{ label:'Submit', disabled:true } },
        { label:'Small', config:{ label:'Small', size:'SMALL' } },
        { label:'Large', config:{ label:'Large', size:'LARGE', hierarchy:'SECONDARY' } },
        { label:'Full width', config:{ label:'Continue', width:'FULL' } },
        { label:'Link, opens in a new tab', config:{ label:'Guide', hierarchy:'LINK', href:'https://example.com/guide', target:'NEW_TAB' } },
        { label:'Disabled link', config:{ label:'Orders', hierarchy:'LINK', href:'#orders', disabled:true } }
    ],
    calendar:[
        { label:'Date', config:{ label:'Due date' } },
        { label:'Date and time', config:{ label:'Meeting', type:'DATETIME' } }
    ],
    checkboxRadio:[
        { label:'Radio buttons', config:{ groupLabel:'Priority', options:[ { value:'low', label:'Low' }, { value:'high', label:'High' } ] } },
        { label:'Checkboxes, horizontal', config:{ groupLabel:'Channels', selectionMode:'MULTIPLE', direction:'HORIZONTAL', options:[ { value:'mail', label:'E-mail' }, { value:'sms', label:'SMS' }, { value:'push', label:'Push' } ] } },
        { label:'Segmented', config:{ groupLabel:'View', presentation:'SEGMENTED', options:[ { value:'day', label:'Day' }, { value:'week', label:'Week' }, { value:'month', label:'Month' } ] } }
    ],
    chip:[
        { label:'Types', collection:[ { label:'Custom' }, { label:'Paid', type:'SUCCESS' }, { label:'Pending', type:'WARNING' }, { label:'Overdue', type:'DANGER' }, { label:'New', type:'INFO' } ] }
    ],
    collapsiblePanel:[
        { label:'Expanded', config:{ title:'Account details', state:'EXPANDED' } },
        { label:'Collapsed, status', config:{ title:'Payment', state:'COLLAPSED', status:'SUCCESS' } }
    ],
    contentGroup:[
        { label:'Section', config:{ label:'Personal data', semantic:'SECTION' } }
    ],
    copyArea:[
        { label:'Code with line numbers', config:{ label:'Install command', lineNumbers:true, text:'npm install\nnpx playwright install chromium' } },
        { label:'Single value', config:{ label:'IBAN', textStyle:'PLAIN', copyButton:'TEXT', text:'RO49 AAAA 1B31 0075 9384 0000', copyValue:'RO49AAAA1B31007593840000' } },
        { label:'Formatted content', config:{ label:'Standard reply', content:host => { host.innerHTML = '<p>Hello,</p><p>To reset your password:</p><ol><li>Open <a href="https://example.com/account">your account</a>.</li><li>Choose <strong>Security</strong>, then <strong>Reset password</strong>.</li></ol><p data-copy="skip"><em>Internal note (not copied): send only to verified customers.</em></p><p>Kind regards,<br>Support team</p>'; return null; } } }
    ],
    form:[
        { label:'Submit form', config:{}, args:[ [ '<p>Fields go here.</p>' ] ] }
    ],
    loader:[
        { label:'Bar', config:{ label:'Loading orders', running:true, showDelayMs:0 } },
        { label:'Ring', config:{ label:'Saving', shape:'RING', running:true, showDelayMs:0 } }
    ],
    message:[
        { label:'Info, inline', config:{ type:'INFO', text:'Your changes are saved automatically.' } },
        { label:'Success, block', config:{ type:'SUCCESS', layout:'BLOCK', title:'Order sent', text:'We e-mailed the confirmation.' } },
        { label:'Warning, banner', config:{ type:'WARNING', layout:'BANNER', text:'Maintenance on Sunday 02:00–04:00.' } },
        { label:'Danger, block', config:{ type:'DANGER', layout:'BLOCK', title:'Payment failed', text:'Check the card details.' } }
    ],
    notification:[
        { label:'Icon', config:{ label:'Notifications', icon:'fa-solid fa-bell' } },
        { label:'Initials, large', config:{ label:'Ana Pop', text:'AP', size:'LARGE' } }
    ],
    notificationsPanel:[
        { label:'Bell with list', config:{ items:[ { id:'n1', text:'Order 1042 was paid', time:'now' }, { id:'n2', text:'New comment on Report Q3', time:'1 h' } ] } }
    ],
    pagination:[
        { label:'100 items', config:{ totalItems:100, label:'Pages' } }
    ],
    searchBox:[
        { label:'Search button', config:{ label:'Search orders' } },
        { label:'Search on demand, icon button', config:{ label:'Search people', searchMode:'ON_DEMAND', showSearchButton:true, searchButtonVariant:'ICON_BUTTON' } }
    ],
    select:[
        { label:'Single', config:{ label:'Country', options:options() } },
        { label:'Multiple, custom list', config:{ label:'Countries', selectionMode:'MULTIPLE', presentation:'CUSTOM', options:options() } }
    ],
    sideNavigation:[
        { label:'Indentation', config:{ items:nav(), currentId:'orders' } },
        { label:'Tree lines', config:{ items:[ ...nav(), { id:'settings', label:'Settings', icon:'fa-solid fa-gear', children:[ { id:'users', label:'Users', href:'#users' }, { id:'roles', label:'Roles', href:'#roles' } ] } ], levelStyle:'TREE', expandedIds:[ 'settings' ] } }
    ],
    stepper:[
        { label:'Horizontal', config:{ steps:[ { id:'cart', label:'Cart', status:'DONE' }, { id:'address', label:'Address' }, { id:'payment', label:'Payment' } ], current:'address' } },
        { label:'Vertical', config:{ orientation:'VERTICAL', steps:[ { id:'s1', label:'Request', status:'DONE' }, { id:'s2', label:'Approval' }, { id:'s3', label:'Delivery' } ], current:'s2' } }
    ],
    table:[
        { label:'Rows with pagination', config:{ label:'Orders', columns:[ { field:'number', label:'Order', priority:'ALWAYS' }, { field:'customer', label:'Customer' }, { field:'total', label:'Total' } ], rows:[ { id:1, number:'ORD-1042', customer:'Ana Pop', total:'€ 120' }, { id:2, number:'ORD-1043', customer:'Ion Ionescu', total:'€ 75' }, { id:3, number:'ORD-1044', customer:'Maria Rusu', total:'€ 310' } ] } }
    ],
    textArea:[
        { label:'Edit', config:{ label:'Comments' } },
        { label:'View', config:{ label:'Notes', state:'VIEW', value:'Delivered to the front desk.' } }
    ],
    textInput:[
        { label:'Text, required', config:{ label:'Customer name', mandatoryIndicator:'MANDATORY_ASTERISK' } },
        { label:'Password', config:{ label:'Password', type:'PASSWORD' } },
        { label:'Label at the start', config:{ label:'City', labelPosition:'START' } }
    ],
    toggle:[
        { label:'Switch', config:{ label:'E-mail notifications' } },
        { label:'Radio presentation', config:{ label:'Dark mode', presentation:'RADIO' } }
    ],
    tooltip:[
        { label:'Description on hover and focus', config:host => { const target = document.createElement('button'); target.type = 'button'; target.className = 'gallery-target'; target.textContent = 'Hover or focus me'; host.before(target); return { text:'Saves the order as a draft', target }; } }
    ],
    topNavigation:[
        { label:'Underline', config:{ items:nav(), currentId:'dashboard' } },
        { label:'Pill', config:{ items:nav(), currentId:'orders', currentStyle:'PILL' } },
        { label:'Tab', config:{ items:nav(), currentId:'reports', currentStyle:'TAB' } }
    ],
    treeView:[
        { label:'Single selection', config:{ label:'Folders', selectionMode:'SINGLE', items:tree() } },
        { label:'Multiple selection', config:{ label:'Files to share', selectionMode:'MULTIPLE', items:tree() } }
    ],
    uploadFiles:[
        { label:'Button', config:{ label:'Attachments' } },
        { label:'Drop zone', config:{ label:'Invoices', layout:'DROPZONE' } }
    ]
};
