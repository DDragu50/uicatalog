// notificationsPanel.js
//
// CUSTOMIZATION ADJUSTMENTS (NotificationsPanel).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/notificationsPanel.html, with seven notifications (four unread, three read).
// Variants panel, in this order:
//   maxItems — a Select from 1 to 7 (the number of start notifications; sent as a number by prepare);
//   markReadOnOpen;
//   seeAllHref — a checkbox "See all notifications" (checked sends '#notifications'; unchecked sends nothing and the
//     example drops its onSeeAll report too, since the link also shows with onSeeAll alone);
//   seeAllHref is inactive (shown unticked, not sent) when maxItems is 7: every notification is already in the panel;
//   icon — panel-only Select of the bell icon (sent as bell.icon): bell, bell outline, envelope, inbox, megaphone.
// items (the seven start notifications), bell and the texts are hidden.

const PANEL_FIELDS = [ 'icon' ];
const ITEMS =
[
    { id:'n1', text:'Order ORD-1042 was paid', time:'2 min ago', icon:'fa-solid fa-circle-check', href:'#order-1042', unread:true },
    { id:'n2', text:'Ana Pop approved your invoice', time:'1 hour ago', icon:'fa-solid fa-file-invoice', unread:true },
    { id:'n3', text:'New comment on project Alpha', time:'Yesterday', icon:'fa-regular fa-comment', unread:true },
    { id:'n4', text:'Delivery to Cluj is delayed by one day', time:'Yesterday', icon:'fa-solid fa-truck', unread:true },
    { id:'n5', text:'Maintenance tonight at 22:00', time:'Monday', icon:'fa-solid fa-screwdriver-wrench' },
    { id:'n6', text:'Your password expires in 7 days', time:'Monday', icon:'fa-solid fa-key' },
    { id:'n7', text:'Quarterly report is ready', time:'Last week', icon:'fa-solid fa-chart-column' }
];

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'maxItems', 'markReadOnOpen', 'seeAllHref', 'icon', 'tooltipMode' ],
    choices:{ maxItems:ITEMS.map(( item, index ) => String(index + 1)) },
    checkboxes:{ seeAllHref:'#notifications' },
    // with all seven notifications in the panel there is nothing more to see
    appliesWhen:{ seeAllHref:values => String(values.maxItems ?? '5') !== String(ITEMS.length) },
    fields:
    [
        { path:'icon', kind:'enum', defaultValue:'fa-solid fa-bell',
          allowed:[ 'fa-solid fa-bell', 'fa-regular fa-bell', 'fa-solid fa-envelope', 'fa-solid fa-inbox', 'fa-solid fa-bullhorn' ],
          description:'The icon of the button that opens the panel (bell.icon). Choose one that says what the list holds: a bell for alerts and updates, an envelope for messages, an inbox for tasks or requests, a megaphone for announcements.' }
    ],
    valueLabels:
    {
        seeAllHref:{ '#notifications':'See all notifications' },
        icon:{ 'fa-solid fa-bell':'Bell', 'fa-regular fa-bell':'Bell (outline)', 'fa-solid fa-envelope':'Envelope (messages)', 'fa-solid fa-inbox':'Inbox (tasks, requests)', 'fa-solid fa-bullhorn':'Megaphone (announcements)' }
    },
    // Room for the open panel with all seven notifications (its height is at most 70% of the live example's).
    stage:{ minHeight:'--size-lg-3' },
    start:
    {
        maxItems:'5',
        seeAllHref:'#notifications',
        icon:'fa-solid fa-bell',
        items:ITEMS
    },
    // maxItems as a number; the icon as bell.icon (in place, so the Output shows what the component received).
    prepare:( { config } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        if ( config.maxItems !== undefined ) { config.maxItems = Number(config.maxItems); }
        if ( panel.icon ) { config.bell = { ...config.bell, icon:panel.icon }; }
        // the link also shows with onSeeAll alone: unticked, the example passes neither
        if ( !config.seeAllHref ) { delete config.seeAllHref; delete config.onSeeAll; }
        return [ config ];
    }
};
