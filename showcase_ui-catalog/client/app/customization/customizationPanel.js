// customizationPanel.js
//
// CUSTOMIZATION PANEL (shown as "Variants": it chooses which variant of the component the live example shows).
// Shows one input per configurable option of a component (labels on top, small font), generated from the model:
// enumerated values → Select, yes/no → Toggle, numbers and text → TextInput, objects and lists → TextArea
// (written as in the READMEs, see valueLiteral.js); text options listed in the adjustment's checkboxes → one checkbox
// (CheckboxRadio) that sends a fixed value.
// Options that do not apply to the current choices stay visible but inactive (and are not sent); an inactive checkbox
// shows unticked and gets its tick back when it applies again. The Render Button reports the values.

import { renderButton } from '../../components/button/buttonIndex.js';
import { renderCheckboxRadio } from '../../components/checkboxRadio/checkboxRadioIndex.js';
import { renderContentGroup } from '../../components/contentGroup/contentGroupIndex.js';
import { renderSelect } from '../../components/select/selectIndex.js';
import { renderTextArea } from '../../components/textArea/textAreaIndex.js';
import { renderTextInput } from '../../components/textInput/textInputIndex.js';
import { renderToggle } from '../../components/toggle/toggleIndex.js';
import { APP_TEXTS } from '../appConfig.js';
import { getAppError } from '../appErrors.js';
import { NOT_SET, appliesTo, isChecked } from './customizationModel.js';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns a DOM-safe id for the input of an option.
function fieldId( componentId, path ) { return `customize-${componentId}-${path.replace(/[^A-Za-z0-9]/g,'-')}`; }

// Returns the help text of an option: its README description and, when it has one, its "Applies when" condition
// (values renamed by the adjustment's valueLabels are shown with their panel names).
function buildHelp( field )
{
    const applies = field.appliesText && !/^always$/i.test(field.appliesText.trim()) ? APP_TEXTS.customize.appliesWhen.replace('{condition}',field.appliesText.replace(/`/g,'')) : '';
    const text = [ field.description, applies ].filter(Boolean).join(' ');
    // a label that only adds to its value (e.g. 'ro — 3 mar. 26') is not written into the help text
    return Object.entries(field.valueLabels ?? {}).filter(( [ value, shown ] ) => !String(shown).startsWith(value)).reduce(( result, [ value, shown ] ) => result.replace(new RegExp(`\\b${value}\\b`,'g'),shown),text);
}

// Renders the input of one option into its host with the given value and state; returns the input instance.
function renderField( host, componentId, field, value, applies, onChange )
{
    const common = { id:fieldId(componentId,field.path), name:field.path, label:field.path, help:buildHelp(field), state:applies ? 'EDIT' : 'INACTIVE', labelPosition:'TOP' };
    if ( field.checkboxValue !== undefined )
    {
        const option = { value:'on', label:field.valueLabels?.[field.checkboxValue] ?? APP_TEXTS.customize.checkboxOption.replace('{value}',String(field.checkboxValue)), selected:applies && isChecked(value) };
        return renderCheckboxRadio(host,{ id:common.id, name:common.name, groupLabel:field.path, help:common.help, selectionMode:'MULTIPLE', presentation:'NATIVE',
            mandatory:false, mandatoryIndicator:'NONE', labelPosition:'TOP', disabled:!applies, options:[ option ] },onChange);
    }
    if ( field.kind === 'boolean' ) { return renderToggle(host,{ ...common, presentation:'SWITCH', size:'SMALL', value:value === true },onChange); }
    // two values shown on both sides of a switch (adjustment toggles): off value before, on value after
    if ( field.toggleValues )
    {
        const { off, on } = field.toggleValues;
        return renderToggle(host,{ ...common, presentation:'SWITCH', size:'SMALL', stateText:'CUSTOM', stateDisplay:'BOTH', texts:{ customOff:off, customOn:on }, value:value === on },onChange);
    }
    const optional = { mandatory:false, mandatoryIndicator:'NONE' };
    if ( field.kind === 'enum' )
    {
        // no "Default" entry when the default is one of the values, or is empty and the list has its own NONE
        const notSet = field.allowed.map(String).includes(String(field.defaultValue)) || ( !String(field.defaultValue ?? '') && field.allowed.includes('NONE') ) ? [] : [ { value:NOT_SET, label:APP_TEXTS.customize.notSet.replace('{default}',field.defaultText || APP_TEXTS.customize.noDefault) } ];
        const options = [ ...notSet, ...field.allowed.map(allowed => ( { value:allowed, label:field.valueLabels?.[allowed] ?? allowed } )) ].map(option => ( { ...option, selected:option.value === value } ));
        return renderSelect(host,{ ...common, ...optional, options },onChange);
    }
    if ( field.kind === 'json' ) { return renderTextArea(host,{ ...common, ...optional, help:[ common.help, APP_TEXTS.customize.valueHelp ].filter(Boolean).join(' '), value:String(value ?? ''), rows:3, autoGrow:true, maxRows:16, spellcheck:false },onChange); }
    return renderTextInput(host,{ ...common, ...optional, type:field.kind === 'number' ? 'NUMBER' : 'TEXT', value:String(value ?? '') },onChange);
}

// Reads the current panel value of one input.
function readValue( record )
{
    if ( !record.instance ) { return record.value; }
    if ( record.field.checkboxValue !== undefined && !record.applies ) { return isChecked(record.value); }   // inactive: shown unticked, value kept
    const value = record.instance.getValue();
    if ( record.field.checkboxValue !== undefined ) { return value.length > 0; }
    if ( record.field.toggleValues ) { return value === true ? record.field.toggleValues.on : record.field.toggleValues.off; }
    return record.field.kind === 'enum' ? ( value[0] ?? NOT_SET ) : value;
}

// Renders the panel into container; returns { getValues(), showErrors(errors), destroy() }.
// options: { componentId, componentName, model, values, title, headingLevel, onRender(values) }
export function renderCustomizationPanel( container, { componentId, componentName, model, values, title = APP_TEXTS.customize.title, headingLevel = 2, onRender } )
{
    const fields = model.fields.filter(field => !field.hidden);
    const groups = [ ...new Set(fields.map(field => field.group)) ];
    const hostsHTML = list => list.map(field => `<div class="app-customize-field${field.checkboxValue !== undefined ? ' app-customize-field-checkbox' : ''}" data-path="${escapeHTML(field.path)}"></div>`).join('');
    container.innerHTML = `<div class="app-customize"><div class="app-customize-header"><h${headingLevel} class="app-customize-title">${escapeHTML(title)}</h${headingLevel}><span class="app-customize-render"></span></div>`
        + `<div class="app-customize-fields">${hostsHTML(fields.filter(field => !field.group))}${groups.filter(Boolean).map(group => `<div class="app-customize-group" data-group="${escapeHTML(group)}"></div>`).join('')}</div>`
        + ( fields.length ? '' : `<p class="app-customize-empty">${escapeHTML(APP_TEXTS.customize.noOptions)}</p>` ) + '</div>';
    const children = [];
    groups.filter(Boolean).forEach(group => children.push(renderContentGroup(container.querySelector(`[data-group="${group}"]`),
        { id:`customize-${componentId}-group-${group}`, semantic:'SECTION', title:group, headingLevel:Math.min(6,headingLevel + 1) },[ hostsHTML(fields.filter(field => field.group === group)) ])));

    const records = fields.map(field => ( { field, value:values[field.path], applies:true, instance:null, host:container.querySelector(`.app-customize-field[data-path="${field.path}"]`) } ));

    // Returns the current values of all inputs, keyed by option path.
    const getValues = () => ( { ...values, ...Object.fromEntries(records.map(record => [ record.field.path, readValue(record) ])) } );

    // Re-renders the inputs whose applicability changed (destroy and render again: the inputs have no state setter).
    function refreshApplicability()
    {
        const current = getValues();
        records.forEach(record =>
        {
            const applies = appliesTo(model,record.field.path,current);
            if ( applies === record.applies && record.instance ) { return; }
            record.value = readValue(record);
            record.instance?.destroy();
            record.applies = applies;
            record.instance = renderField(record.host,componentId,record.field,record.value,applies,refreshApplicability);
        });
    }

    records.forEach(record => { record.applies = appliesTo(model,record.field.path,values); });
    records.forEach(record => { record.instance = renderField(record.host,componentId,record.field,record.value,record.applies,refreshApplicability); });
    const renderHost = container.querySelector('.app-customize-render');
    const button = renderButton(renderHost,{ id:`customize-${componentId}-render`, label:APP_TEXTS.customize.render, hierarchy:'PRIMARY', size:'LARGE', iconBefore:'', description:APP_TEXTS.customize.renderDescription.replace('{name}',componentName) },() => onRender(getValues()));

    return {
        getValues,
        // Shows value errors next to their inputs ([{ path, errorLabel, detail? }]) and moves focus to the first one.
        showErrors:( errors ) =>
        {
            errors.forEach(error => records.find(record => record.field.path === error.path)?.instance?.setError?.(`${getAppError(error.errorLabel).message}${error.detail ? ` (${error.detail})` : ''}`));
            records.find(record => record.field.path === errors[0]?.path)?.instance?.focus();
        },
        // Removes the inputs, groups and Button and clears the panel.
        destroy:() => { records.forEach(record => record.instance?.destroy()); children.forEach(child => child?.destroy()); button?.destroy(); container.replaceChildren(); }
    };
}
