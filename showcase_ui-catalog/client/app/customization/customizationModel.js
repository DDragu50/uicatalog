// customizationModel.js
//
// CUSTOMIZATION MODEL.
// Combines the README Configuration table with the component's adjustment file (client/adjustments/<id>.js) into
// the list of panel fields, decides which options apply to the current values, and builds the configuration sent
// to the live example. Object and list values are written as in the READMEs (valueLiteral.js).
// Pure functions without DOM access; also used by server/check-adjustments.js.
//
// Adjustment file (all keys optional):
//   start:       { path: value }         start values (taken from the test page), override README defaults
//   hide:        [ path ]                options not shown in the panel (a start value is still sent)
//   show:        [ path ]                the only options shown, in this order, without groups (all others hidden; start values still sent)
//   tokens:      { VALUE: path }         which option an ambiguous "Applies when" value refers to (e.g. BUTTON → buttonVariant)
//   appliesWhen: { path: values => bool } replaces the README condition of an option
//   callbacks:   { path: false }         callback options the live example must not receive
//   uses:        [ componentId ]         other components rendered by prepare() (their showcase styling is loaded)
//   checkboxes:  { path: value }         text options shown as a checkbox; checked sends value (e.g. an icon class), unchecked sends nothing;
//                                        the checkbox text is "Use <value>", or valueLabels[path][value] when given
//   valueLabels: { path: { VALUE: 'Shown' } }  panel names for values of an option (the value sent is unchanged), also
//                                        used in that option's help text, e.g. { labelPosition:{ START:'LEFT' } }
//   toggles:     { path: { off, on } }   an option with two values shown as a Toggle with both values written beside the
//                                        switch (stateDisplay BOTH), e.g. { 'validation.numberType':{ off:'REAL', on:'INTEGER' } }
//   choices:     { path: [ values ] }    text options shown as a Select with only these values (e.g. design tokens with a
//                                        tested contrast); include the README default so it can be chosen again
//   states:      { rows: path, config, disabledPath }  "States" section of the component page: one column per allowed value of
//                                        the rows option, one row per state (default, hover, pressed, keyboard focus, disabled);
//                                        config: the fixed configuration shown; disabledPath: the option that disables (default 'disabled')
//   fields:      [ { path, kind, allowed, defaultValue, description, appliesText } ]  panel-only options that are not in the
//                                        README (kind 'enum' or 'string'); always sent with their value, so prepare() can turn
//                                        them into the real configuration; their conditions go in appliesWhen
//   examples:    [ { title, fit, items:[ { label, config, surface } ] } ]  "Examples" section of the component page (after the
//                                        states, before the README): groups of fixed configurations, each shown with its label; plain data
//                                        only; fit: true sizes each example to its content, side by side, wrapping when there is no room
//                                        (components with text, e.g. Badge), instead of equal columns;
//                                        surface 'SURFACE' or 'BRAND' places the example on a light or brand-coloured bar
//   stage:       { width, minHeight }    live example at a fixed width in px (scaled down to fit), e.g. for components
//                                        that switch layout at the 48rem breakpoint; minHeight: a design-token name
//                                        giving menus and popups room inside the example
//   prepare:     ( { config, host, callbacks, toastArea, report } ) => [ ...renderArguments ] or { host, args }; may be async;
//                runs inside the live example (see previewIndex.js), e.g. to add children or sample data

import { formatValueLiteral, parseValueLiteral } from './valueLiteral.js';

// Value of an enum field that sends nothing (the component's default applies).
export const NOT_SET = '__not-set__';

const ENUM_TOKEN = /^[A-Z][A-Z0-9_]*$/;

// Returns whether a checkbox panel value is checked (true, or a non-empty text kept from an earlier version of the panel).
export function isChecked( value ) { return value === true || ( typeof value === 'string' && value.trim() !== '' ); }

// Converts a "param:value" literal (true, false, numbers, text) into its value.
function parseLiteral( text ) { if ( text === 'true' || text === 'false' ) { return text === 'true'; } if ( /^-?\d+(\.\d+)?$/.test(text) ) { return Number(text); } return text.replace(/^'(.*)'$/,'$1'); }

// Resolves one "Applies when" token into an atom { path, equals } or { path, isSet }; records problems in issues.
function resolveToken( token, param, params, adjustment, issues )
{
    if ( token.includes(':') )
    {
        const [ path, value ] = token.split(':').map(part => part.trim());
        if ( params.has(path) ) { return { path, equals:parseLiteral(value) }; }
    }
    const byName = params.has(token) ? token : [ ...params.keys() ].filter(path => path.endsWith(`.${token}`)).reduce(( found, path, index, list ) => ( list.length === 1 ? path : found ),'');
    if ( byName ) { return params.get(byName).kind === 'boolean' ? { path:byName, equals:true } : { path:byName, isSet:true }; }
    if ( ENUM_TOKEN.test(token) )
    {
        const chosen = adjustment.tokens?.[token];
        if ( chosen && params.get(chosen)?.allowed.includes(token) ) { return { path:chosen, equals:token }; }
        const candidates = [ ...params.values() ].filter(other => other.kind === 'enum' && other.path !== param.path && other.allowed.includes(token)).map(other => other.path);
        if ( candidates.length === 1 ) { return { path:candidates[0], equals:token }; }
        issues.push({ path:param.path, type:candidates.length ? 'AMBIGUOUS_VALUE' : 'UNKNOWN_VALUE', value:token, candidates });
        return null;
    }
    issues.push({ path:param.path, type:'UNKNOWN_VALUE', value:token, candidates:[] });
    return null;
}

// Resolves the README terms of one option into a condition [{ negate, atoms }]; free-text terms are ignored and reported.
function resolveCondition( param, params, adjustment, issues )
{
    if ( typeof adjustment.appliesWhen?.[param.path] === 'function' ) { return adjustment.appliesWhen[param.path]; }
    return param.terms.map(term =>
    {
        if ( term.freeText ) { issues.push({ path:param.path, type:'FREE_TEXT_CONDITION', value:term.text, candidates:[] }); return null; }
        const atoms = term.tokens.map(token => resolveToken(token,param,params,adjustment,issues)).filter(Boolean);
        return atoms.length ? { negate:term.negate, atoms } : null;
    }).filter(Boolean);
}

// Returns the panel value for a start value: text for numbers and JSON, NOT_SET for enums without a valid value.
function toPanelValue( field, value )
{
    if ( field.checkboxValue !== undefined ) { return isChecked(value); }
    if ( field.kind === 'enum' ) { return field.allowed.includes(value) ? value : NOT_SET; }
    if ( field.kind === 'boolean' ) { return value === true; }
    if ( value === undefined || value === null ) { return ''; }
    if ( field.kind === 'json' ) { return formatValueLiteral(value); }
    return String(value);
}

// Builds the model of one component from its README table, its render callbacks and its adjustment file.
// Returns { fields, issues, startValues, fixedValues, positionalCallbacks, states, examples } — fields: [{ path, kind, allowed, defaultValue,
// defaultText, description, group, hidden, callback, condition }]; positionalCallbacks: the render function's callback
// arguments in order ('' where none, or where a configuration callback of the same name takes precedence).
export function createCustomizationModel( table, adjustment = {}, renderCallbacks = [] )
{
    const issues = [];
    const extra = ( adjustment.fields ?? [] ).map(field => (
    {
        path:field.path, type:field.kind ?? 'string', kind:field.kind === 'enum' ? 'enum' : 'string', allowed:[ ...( field.allowed ?? [] ) ],
        defaultValue:field.defaultValue, defaultText:String(field.defaultValue ?? ''), appliesText:field.appliesText ?? 'Always', terms:[],
        description:field.description ?? '', virtual:true
    } ));
    const allParams = [ ...table.params, ...extra ];
    const params = new Map(allParams.map(param => [ param.path, param ]));
    const shown = Array.isArray(adjustment.show) ? adjustment.show : null;
    const hidden = new Set([ 'id', ...( adjustment.hide ?? [] ) ]);
    [ ...( adjustment.hide ?? [] ), ...( shown ?? [] ), ...Object.keys(adjustment.start ?? {}), ...Object.keys(adjustment.appliesWhen ?? {}), ...Object.keys(adjustment.callbacks ?? {}),
      ...Object.keys(adjustment.checkboxes ?? {}), ...Object.keys(adjustment.toggles ?? {}), ...Object.keys(adjustment.choices ?? {}), ...( adjustment.states?.rows ? [ adjustment.states.rows ] : [] ) ]
        .filter(path => !params.has(path)).forEach(path => issues.push({ path, type:'UNKNOWN_OPTION', value:path, candidates:[] }));
    if ( shown ) { allParams.forEach(param => { if ( !shown.includes(param.path) ) { hidden.add(param.path); } }); }
    const ordered = shown ? [ ...shown.map(path => allParams.find(param => param.path === path)).filter(Boolean), ...allParams.filter(param => !shown.includes(param.path)) ] : allParams;
    const fields = ordered.map(param => (
    {
        path:param.path, kind:Array.isArray(adjustment.choices?.[param.path]) ? 'enum' : param.kind,
        allowed:Array.isArray(adjustment.choices?.[param.path]) ? [ ...adjustment.choices[param.path] ] : param.allowed, defaultValue:param.defaultValue, defaultText:param.defaultText,
        description:param.description, appliesText:param.appliesText, virtual:param.virtual === true, valueLabels:adjustment.valueLabels?.[param.path] ?? null,
        checkboxValue:Object.hasOwn(adjustment.checkboxes ?? {},param.path) ? adjustment.checkboxes[param.path] : undefined,
        toggleValues:adjustment.toggles?.[param.path] ?? null,
        // options listed in show keep the given order, so a dotted option (validation.maxLength) is not moved into a group
        group:param.path.includes('.') && !shown?.includes(param.path) ? param.path.split('.')[0] : '',
        hidden:hidden.has(param.path) || param.kind === 'function' || param.kind === 'element',
        callback:param.kind === 'function' && adjustment.callbacks?.[param.path] !== false,
        condition:resolveCondition(param,params,adjustment,issues)
    } ));
    const start = adjustment.start ?? {};
    const startValues = Object.fromEntries(fields.filter(field => field.kind !== 'function' && field.kind !== 'element')
        .map(field => [ field.path, toPanelValue(field,Object.hasOwn(start,field.path) ? start[field.path] : field.defaultValue) ]));
    const positionalCallbacks = renderCallbacks.map(name => ( name && !params.has(name) ? name : '' ));
    const rows = adjustment.states?.rows ? params.get(adjustment.states.rows) : null;
    const states = rows ? { rowPath:rows.path, rowValues:rows.allowed, config:adjustment.states.config ?? {}, disabledPath:adjustment.states.disabledPath ?? 'disabled' } : null;
    const examples = Array.isArray(adjustment.examples) && adjustment.examples.length
        ? adjustment.examples.map(group => ( { title:String(group.title ?? ''), fit:group.fit === true, items:( group.items ?? [] ).map(item => ( { label:String(item.label ?? ''), config:item.config ?? {}, surface:[ 'SURFACE', 'BRAND' ].includes(item.surface) ? item.surface : '' } )) } )) : null;
    return { fields, issues, startValues, positionalCallbacks, states, examples, fixedValues:Object.fromEntries(Object.entries(start).filter(( [ path ] ) => hidden.has(path))) };
}

// Returns the effective value of a field for conditions: the panel value, or the README default when not set.
function effectiveValue( field, values )
{
    const value = values[field.path];
    if ( value === undefined || value === NOT_SET || value === '' ) { return field.defaultValue; }
    if ( field.kind === 'number' ) { return Number(value); }
    return value;
}

// Returns whether an option applies to the given panel values (its own condition and those of the options it depends on).
export function appliesTo( model, path, values, visited = new Set() )
{
    const field = model.fields.find(entry => entry.path === path);
    if ( !field || visited.has(path) ) { return true; }
    visited.add(path);
    if ( typeof field.condition === 'function' ) { return Boolean(field.condition(values)); }
    return field.condition.every(term =>
    {
        const result = term.atoms.some(atom =>
        {
            const target = model.fields.find(entry => entry.path === atom.path);
            if ( !target || !appliesTo(model,atom.path,values,new Set(visited)) ) { return false; }
            const value = effectiveValue(target,values);
            return atom.isSet ? value !== undefined && value !== null && value !== '' : value === atom.equals;
        });
        return term.negate ? !result : result;
    });
}

// Writes a value at a dotted path of an object, creating intermediate objects.
function setPath( target, path, value )
{
    const parts = path.split('.');
    const last = parts.pop();
    const parent = parts.reduce(( node, part ) => { node[part] = node[part] && typeof node[part] === 'object' ? node[part] : {}; return node[part]; },target);
    parent[last] = value;
}

// Returns whether a converted value equals the README default (such values are not sent: the result is the same).
function isDefault( field, value ) { return field.defaultValue !== undefined && JSON.stringify(value) === JSON.stringify(field.defaultValue); }

// Builds the configuration for the live example from panel values: only options that apply and differ from the README
// default are sent (start values and fixed values of hidden options included).
// Returns { config, callbackPaths, errors:[{ path, errorLabel, detail? }] }; the id is added by the live example.
export function buildConfiguration( model, values )
{
    const config = {}, callbackPaths = [], errors = [];
    const send = ( field, value ) => { if ( field.virtual || !isDefault(field,value) ) { setPath(config,field.path,value); } };
    model.fields.forEach(field =>
    {
        if ( field.path === 'id' || !appliesTo(model,field.path,values) ) { return; }
        if ( field.kind === 'function' ) { if ( field.callback ) { callbackPaths.push(field.path); } return; }
        if ( field.kind === 'element' ) { return; }
        if ( field.hidden ) { if ( Object.hasOwn(model.fixedValues,field.path) ) { setPath(config,field.path,structuredClone(model.fixedValues[field.path])); } return; }
        const value = values[field.path];
        if ( field.checkboxValue !== undefined ) { if ( isChecked(value) ) { send(field,field.checkboxValue); } return; }
        if ( field.kind === 'enum' ) { if ( value && value !== NOT_SET ) { send(field,value); } return; }
        if ( field.kind === 'boolean' ) { send(field,value === true); return; }
        const text = String(value ?? '').trim();
        if ( !text ) { return; }
        if ( field.kind === 'number' ) { const number = Number(text); if ( Number.isFinite(number) ) { send(field,number); } else { errors.push({ path:field.path, errorLabel:'NUMBER_INVALID' }); } return; }
        if ( field.kind === 'json' ) { try { send(field,parseValueLiteral(text)); } catch ( error ) { errors.push({ path:field.path, errorLabel:'VALUE_INVALID', detail:error.message }); } return; }
        send(field,String(value));
    });
    return { config, callbackPaths, errors };
}
