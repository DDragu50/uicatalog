// textInput.js
//
// CUSTOMIZATION ADJUSTMENTS (TextInput).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Variants panel: only state, width, labelPosition (TOP / LEFT / INHERIT), type and passwordToggle, then two panel-only
// checkboxes (fields) that prove the icon area: withIcon (a decorative icon) and withButton (an action Button; reported
// in the Output when pressed). The "texts" and "validation" groups and every other option are hidden.
// For type NUMBER the panel also shows validation.numberType (a Toggle REAL | INTEGER, both values beside the switch),
// validation.minValue and validation.maxValue (start INTEGER, 1, 100), after type.
// prepare() completes the configuration for the chosen type (not shown in the panel): label, placeholder, help, and
// the validation rules switched on — text types: length limits (password: at least 8); NUMBER: the kind and range from
// the panel (help text written from them); and the icon or Button that suits the type.

const PANEL_FIELDS = [ 'withIcon', 'withButton' ];

// Per type: texts, validation rules (enabled), decorative icon and action Button.
const BY_TYPE =
{
    TEXT:{ label:'Customer name', placeholder:'e.g. Ana Pop', help:'2 to 40 characters.', validation:{ enabled:true, minLength:2, maxLength:40 },
        icon:'fa-solid fa-user', button:{ key:'search', icon:'fa-solid fa-magnifying-glass', label:'Search customers' } },
    EMAIL:{ label:'E-mail', placeholder:'name@example.com', help:'The address for invoices.', validation:{ enabled:true, minLength:6, maxLength:80 },
        icon:'fa-solid fa-envelope', button:{ key:'test', icon:'fa-solid fa-paper-plane', label:'Send a test e-mail' } },
    PASSWORD:{ label:'Password', placeholder:'', help:'At least 8 characters.', validation:{ enabled:true, minLength:8, maxLength:64 } },
    NUMBER:{ label:'Quantity', placeholder:'', help:'', validation:{ enabled:true },
        icon:'fa-solid fa-hashtag', button:{ key:'reset', icon:'fa-solid fa-rotate-left', label:'Reset to the minimum' } },
    URL:{ label:'Website', placeholder:'https://example.com', help:'The full address, with https://.', validation:{ enabled:true, minLength:10, maxLength:120 },
        icon:'fa-solid fa-globe', button:{ key:'open', icon:'fa-solid fa-arrow-up-right-from-square', label:'Open the website' } },
    TEL:{ label:'Phone', placeholder:'+40 712 345 678', help:'6 to 20 digits, spaces allowed.', validation:{ enabled:true, minLength:6, maxLength:20 },
        icon:'fa-solid fa-phone', button:{ key:'copy', icon:'fa-solid fa-copy', label:'Copy the number' } }
};

// NUMBER: the kind and range chosen in the panel, with a placeholder and a help text written from them
// (numberType REAL, the README default, is not sent by the panel; minValue / maxValue may be empty: no limit).
function describeNumber( sent )
{
    const integer = sent.numberType === 'INTEGER';
    const min = Number.isFinite(sent.minValue) ? sent.minValue : null, max = Number.isFinite(sent.maxValue) ? sent.maxValue : null;
    const kind = integer ? 'A whole number' : 'A number (decimals allowed)';
    const range = min !== null && max !== null ? ` from ${min} to ${max}` : min !== null ? ` of at least ${min}` : max !== null ? ` of at most ${max}` : '';
    return {
        placeholder:min !== null && max !== null ? `${min}–${max}` : '',
        help:`${kind}${range}.`,
        validation:{ enabled:true, numberType:integer ? 'INTEGER' : 'REAL', ...( min !== null ? { minValue:min } : {} ), ...( max !== null ? { maxValue:max } : {} ), ...( integer ? { step:1 } : {} ) }
    };
}

// The icon area exists only for an editable field that is not a password.
const iconAreaApplies = values => values.type !== 'PASSWORD' && ( values.state ?? 'EDIT' ) === 'EDIT';

export default
{
    // tooltipMode TOOLTIP loads the Tooltip module: its showcase styling is loaded too.
    uses:[ 'tooltip' ],
    show:[ 'state', 'width', 'labelPosition', 'type', 'validation.numberType', 'validation.minValue', 'validation.maxValue', 'passwordToggle', 'withIcon', 'withButton', 'tooltipMode' ],
    toggles:{ 'validation.numberType':{ off:'REAL', on:'INTEGER' } },
    fields:
    [
        { path:'withIcon', kind:'string', description:'A decorative icon inside the field, at its end (iconArea.staticIcon), chosen to suit the type, e.g. an envelope for EMAIL. It only shows what the field is for: it cannot be clicked and screen readers skip it.', appliesText:'Not PASSWORD, EDIT' },
        { path:'withButton', kind:'string', description:'An action Button inside the field, at its end (actions option, one icon-only action; guidelines §10.2), e.g. "Search" for TEXT or "Reset to 1" for NUMBER. It can be clicked and reached with Tab, has its own name for screen readers, and pressing it is shown in the Output. With both ticked, only the Button is shown: it takes the place of the icon.', appliesText:'Not PASSWORD, EDIT' }
    ],
    checkboxes:{ withIcon:'ON', withButton:'ON' },
    // labelPosition START is shown as LEFT in the Variants panel (the value sent stays START).
    valueLabels:{ labelPosition:{ START:'LEFT' }, withIcon:{ ON:'Show an icon' }, withButton:{ ON:'Show an action button' } },
    appliesWhen:{ withIcon:iconAreaApplies, withButton:iconAreaApplies },
    callbacks:{ onAction:false },
    start:{ width:'MEDIUM', type:'TEXT', 'validation.numberType':'INTEGER', 'validation.minValue':1, 'validation.maxValue':100 },
    // Completes the configuration for the chosen type (in place, so the Output shows what the component received).
    prepare:( { config, report } ) =>
    {
        const panel = Object.fromEntries(PANEL_FIELDS.map(path => [ path, config[path] ]));
        PANEL_FIELDS.forEach(path => delete config[path]);
        const sent = config.validation ?? {};
        delete config.iconArea; delete config.actions; delete config.validation;
        const setup = BY_TYPE[config.type ?? 'TEXT'] ?? BY_TYPE.TEXT;
        Object.assign(config,{ label:setup.label, placeholder:setup.placeholder, help:setup.help, validation:{ ...setup.validation } });
        if ( config.type === 'NUMBER' ) { Object.assign(config,describeNumber(sent)); }
        if ( !iconAreaApplies(config) ) { return [ config ]; }
        if ( panel.withButton && setup.button )
        {
            config.actions = [ { ...setup.button } ];
            config.onAction = ( key, instance ) => report('onAction',key,instance);
        }
        else if ( panel.withIcon && setup.icon ) { config.iconArea = { staticIcon:setup.icon }; }
        return [ config ];
    }
};
