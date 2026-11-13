// message.js
//
// CUSTOMIZATION ADJUSTMENTS (Message).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values come from the Configuration section of tests/message.html. A TOAST is rendered into the
// live example's shared toast area (as an application does), every other layout into the example's own host.
// Variants panel: only layout, type, closable, two panel-only options (fields), bordered (start off) and cornerRadius
// (NONE, or ROUNDED shown as the token --radius-control), in this order; every other option keeps its start value
// (title, text, details, link, actions). The panel-only options are turned into duration by prepare():
//   autoClose (checkbox) and closeAfterSeconds (text, start 5) → duration = seconds × 1000 milliseconds; not for MODAL
//   (it waits for the user) or DANGER (errors stay until the user acts), as in the README;
//   remainingIndicator (start BAR AND TEXT) after them, active with autoClose and not for INLINE.

const PANEL_FIELDS = [ 'autoClose', 'closeAfterSeconds' ];
// The live example's duration applies only where the README allows it.
const canAutoClose = values => values.layout !== 'MODAL' && values.type !== 'DANGER';

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'layout', 'type', 'closable', 'autoClose', 'closeAfterSeconds', 'remainingIndicator', 'bordered', 'cornerRadius', 'tooltipMode' ],
    fields:
    [
        { path:'autoClose', kind:'string', description:'Closes the message by itself after the number of seconds below (paused while the pointer is over it or it has focus). Render shows it again.', appliesText:'Not MODAL, not DANGER' },
        { path:'closeAfterSeconds', kind:'string', defaultValue:'5', description:'Seconds before the message closes (a number greater than 0; decimals allowed, e.g. 2.5). Sent as duration in milliseconds.', appliesText:'autoClose on' }
    ],
    // "autoClose" is a checkbox: checked sends 'ON'.
    checkboxes:{ autoClose:'ON' },
    valueLabels:{ cornerRadius:{ ROUNDED:'--radius-control' }, autoClose:{ ON:'Close after the seconds below' }, remainingIndicator:{ BAR_AND_TEXT:'BAR AND TEXT' } },
    appliesWhen:
    {
        autoClose:canAutoClose,
        closeAfterSeconds:values => canAutoClose(values) && Boolean(values.autoClose),
        remainingIndicator:values => canAutoClose(values) && Boolean(values.autoClose) && values.layout !== 'INLINE'
    },
    // Room for the open menu or popup inside the live example.
    stage:{ minHeight:'--size-md-3' },
    start:
    {
        title:'Changes saved',
        text:'Your order ORD-1042 was updated.',
        closable:true,
        bordered:false,
        closeAfterSeconds:'5',
        remainingIndicator:'BAR_AND_TEXT',
        details:[ 'Delivery address changed', 'Invoice sent again' ],
        link:{ href:'#order-1042', label:'View the order' },
        actions:[ { key:'undo', label:'Undo' }, { key:'cancel', label:'Close', cancel:true } ]
    },
    // Turns the panel-only options into duration (in place, so the Output shows what the component received).
    prepare:( { config, toastArea } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        const seconds = Number(String(panel.closeAfterSeconds ?? '').replace(',','.'));
        if ( panel.autoClose && canAutoClose(config) ) { config.duration = Math.round(( Number.isFinite(seconds) && seconds > 0 ? seconds : 5 ) * 1000); }
        // the indicator only goes with a duration (and not INLINE); otherwise it is not sent, so no warning
        if ( !config.duration || config.layout === 'INLINE' ) { delete config.remainingIndicator; }
        return config.layout === 'TOAST' ? { host:toastArea, args:[ config ] } : [ config ];
    }
};
