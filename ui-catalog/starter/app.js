// app.js
//
// A minimal screen built with UI Catalog components: a header, a small form (text field, list, button), a message
// after saving, and a table. Each component is imported only from its entry point (xIndex.js), rendered into its own
// empty container with a unique id, and configured as its README describes. Replace this with your own screens.

import { renderAppHeader } from './ui-catalog/components-js/appHeader/appHeaderIndex.js';
import { renderTextInput } from './ui-catalog/components-js/textInput/textInputIndex.js';
import { renderSelect } from './ui-catalog/components-js/select/selectIndex.js';
import { renderButton } from './ui-catalog/components-js/button/buttonIndex.js';
import { renderMessage } from './ui-catalog/components-js/message/messageIndex.js';
import { renderTable } from './ui-catalog/components-js/table/tableIndex.js';

const orders = [
    { id:1, number:'ORD-1042', customer:'Ana Pop', country:'Romania', total:'€ 120' },
    { id:2, number:'ORD-1043', customer:'Ion Ionescu', country:'Germany', total:'€ 75' }
];

renderAppHeader(document.querySelector('#header-host'),{ id:'header', appName:'My orders', homeHref:'#', skipLinkTarget:'#main' });

const customer = renderTextInput(document.querySelector('#customer-host'),{ id:'customer', name:'customer', label:'Customer', mandatoryIndicator:'MANDATORY_ASTERISK' });
const country = renderSelect(document.querySelector('#country-host'),{ id:'country', name:'country', label:'Country', mandatory:false, options:[ { value:'Romania', label:'Romania' }, { value:'Germany', label:'Germany' }, { value:'France', label:'France' } ] });

const table = renderTable(document.querySelector('#table-host'),{
    id:'orders', label:'Latest orders',
    columns:[ { field:'number', label:'Order', priority:'ALWAYS' }, { field:'customer', label:'Customer' }, { field:'country', label:'Country' }, { field:'total', label:'Total' } ],
    rows:orders
});

let message = null;

// Saves the order: checks the form, adds a row and confirms with a message.
function save()
{
    message?.destroy();
    if ( !customer.validate().valid ) { return; }
    const order = { id:orders.length + 1, number:`ORD-${1042 + orders.length}`, customer:customer.getValue(), country:country.getValue()[0] ?? '—', total:'€ 0' };   // Select returns a list of values
    orders.unshift(order);
    table.setRows(orders);
    message = renderMessage(document.querySelector('#message-host'),{ id:'saved', type:'SUCCESS', text:`Order ${order.number} for ${order.customer} was saved.` });
    customer.setValue('',{ quiet:true });   // empty again, without showing "Required."
}

renderButton(document.querySelector('#save-host'),{ id:'save', label:'Save order', iconBefore:'fa-solid fa-floppy-disk' },save);
