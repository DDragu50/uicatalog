// buttonConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization, developer warnings and developer errors.
// Messages and labels are defined in buttonErrors.js.

import { reportButtonIssue } from './buttonErrors.js';

export const BUTTON_VARIANTS = [ 'BUTTON', 'ICON_BUTTON' ];
export const BUTTON_TYPES = [ 'BUTTON', 'SUBMIT', 'RESET' ];
// LINK: the look of a text link (link tokens of design-system.css), in the size of the text around it.
export const BUTTON_HIERARCHIES = [ 'PRIMARY', 'SECONDARY', 'TERTIARY', 'LINK' ];
export const BUTTON_SIZES = [ 'SMALL', 'MEDIUM', 'LARGE' ];
export const BUTTON_WIDTHS = [ 'FIT_CONTENT', 'MIN_WIDTH', 'FULL' ];
export const BUTTON_RADII = [ 'NONE', 'SMALL', 'MEDIUM', 'LARGE' ];
export const BUTTON_ICON_RADII = [ 'CIRCLE', 'NONE', 'SMALL', 'MEDIUM', 'LARGE' ];
// How an icon button shows its name on hover and focus: not at all, the browser's tooltip (title), or a Tooltip.
export const BUTTON_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];
// Where a link (href) opens the page: in the same tab, or in a new tab (the browser decides tab or window).
export const BUTTON_TARGETS = [ 'SAME', 'NEW_TAB' ];
// Icon added after the label of a link that opens in a new tab (newTabIcon), unless iconAfter is set.
export const BUTTON_NEW_TAB_ICON = 'fa-solid fa-arrow-up-right-from-square';

export const DEFAULT_BUTTON_CONFIG =
{
    id:'',
    buttonVariant:'BUTTON',
    buttonType:'BUTTON',
    hierarchy:'PRIMARY',
    size:'MEDIUM',
    iconSize:'',
    width:'FIT_CONTENT',
    minWidth:160,
    label:'',
    iconBefore:'',
    iconAfter:'',
    icon:'',
    ariaLabel:'',
    description:'',
    radius:'NONE',
    iconButtonRadius:'CIRCLE',
    tooltipMode:'NONE',
    disabled:false,
    href:'',
    target:'SAME',
    newTabIcon:true,
    newTabText:'(opens in a new tab)',
    download:'',
    rel:'',
    onClick:null
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportButtonIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportButtonIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
}

// Warns when a supplied option is ignored by the icon-button variant.
function warnIgnored( id, userConfig, keys ) { keys.filter(key => userConfig[key] !== undefined && userConfig[key] !== '' && userConfig[key] !== null).forEach(key => reportButtonIssue('OPTION_IGNORED',{ id, key, condition:'buttonVariant="ICON_BUTTON"' })); }

// Returns the address without the schemes that run code or embed content (javascript:, data:, vbscript:); '' when refused.
function normalizeHref( id, value )
{
    const href = String(value ?? '').trim();
    if ( !href ) { return ''; }
    const scheme = href.replace(/[\u0000-\u0020]/g,'').toLowerCase();
    if ( /^(javascript|data|vbscript):/.test(scheme) ) { reportButtonIssue('UNSAFE_HREF',{ id }); return ''; }
    return href;
}

// Warns for each supplied option that has no effect under the given condition.
function warnSupplied( id, userConfig, keys, condition ) { keys.filter(key => userConfig[key] !== undefined && userConfig[key] !== '' && userConfig[key] !== null).forEach(key => reportButtonIssue('OPTION_IGNORED',{ id, key, condition })); }

// Produces the normalized configuration consumed by Button.
export function mergeButtonConfig( userConfig = {} )
{
    const config = { ...DEFAULT_BUTTON_CONFIG, ...userConfig };
    const id = config.id = String(config.id ?? '').trim();
    config.buttonVariant = normalizeEnum(id,'buttonVariant',config.buttonVariant,BUTTON_VARIANTS,DEFAULT_BUTTON_CONFIG.buttonVariant);
    config.buttonType = normalizeEnum(id,'buttonType',config.buttonType,BUTTON_TYPES,DEFAULT_BUTTON_CONFIG.buttonType);
    config.hierarchy = normalizeEnum(id,'hierarchy',config.hierarchy,BUTTON_HIERARCHIES,DEFAULT_BUTTON_CONFIG.hierarchy);
    config.size = normalizeEnum(id,'size',config.size,BUTTON_SIZES,DEFAULT_BUTTON_CONFIG.size);
    config.iconSize = normalizeEnum(id,'iconSize',config.iconSize,BUTTON_SIZES,config.size);
    config.width = normalizeEnum(id,'width',config.width,BUTTON_WIDTHS,DEFAULT_BUTTON_CONFIG.width);
    config.radius = normalizeEnum(id,'radius',config.radius,BUTTON_RADII,DEFAULT_BUTTON_CONFIG.radius);
    config.iconButtonRadius = normalizeEnum(id,'iconButtonRadius',config.iconButtonRadius === '50%' ? 'CIRCLE' : config.iconButtonRadius,BUTTON_ICON_RADII,DEFAULT_BUTTON_CONFIG.iconButtonRadius);
    config.tooltipMode = normalizeEnum(id,'tooltipMode',config.tooltipMode,BUTTON_TOOLTIP_MODES,DEFAULT_BUTTON_CONFIG.tooltipMode);
    const minWidth = Number(config.minWidth ?? DEFAULT_BUTTON_CONFIG.minWidth);
    if ( !( Number.isFinite(minWidth) && minWidth > 0 ) ) { reportButtonIssue('INVALID_OPTION',{ id, key:'minWidth', value:config.minWidth, fallback:DEFAULT_BUTTON_CONFIG.minWidth }); }
    config.minWidth = Number.isFinite(minWidth) && minWidth > 0 ? minWidth : DEFAULT_BUTTON_CONFIG.minWidth;
    config.label = String(config.label ?? '').trim();
    config.iconBefore = normalizeIconClass(id,'iconBefore',config.iconBefore);
    config.iconAfter = normalizeIconClass(id,'iconAfter',config.iconAfter);
    config.icon = normalizeIconClass(id,'icon',config.icon);
    config.ariaLabel = String(config.ariaLabel ?? '').trim();
    config.description = String(config.description ?? '').trim();
    config.disabled = Boolean(config.disabled);
    config.onClick = typeof config.onClick === 'function' ? config.onClick : null;

    // Link: a supplied href renders <a>; a refused href (UNSAFE_HREF) still renders the link, without an address.
    config.isLink = String(userConfig.href ?? '').trim() !== '';
    config.href = normalizeHref(id,config.href);
    config.target = normalizeEnum(id,'target',config.target,BUTTON_TARGETS,DEFAULT_BUTTON_CONFIG.target);
    config.newTabIcon = config.newTabIcon !== false;
    config.newTabText = String(config.newTabText ?? '').trim() || DEFAULT_BUTTON_CONFIG.newTabText;
    config.download = config.download === true ? true : String(config.download ?? '').trim();
    config.rel = String(config.rel ?? '').trim().split(/\s+/).filter(token => /^[a-zA-Z0-9_-]+$/.test(token)).join(' ');
    if ( config.isLink )
    {
        if ( userConfig.buttonType !== undefined && config.buttonType !== 'BUTTON' ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'buttonType', condition:'href is set (a link has no form type)' }); }
        config.buttonType = 'BUTTON';
        if ( config.target === 'SAME' ) { warnSupplied(id,{ newTabText:userConfig.newTabText },[ 'newTabText' ],'target="SAME"'); if ( userConfig.newTabIcon === false ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'newTabIcon', condition:'target="SAME"' }); } }
    }
    else
    {
        warnSupplied(id,userConfig,[ 'target', 'newTabText', 'download', 'rel' ],'href is empty');
        if ( userConfig.newTabIcon === false ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'newTabIcon', condition:'href is empty' }); }
    }
    // LINK look: the size of the surrounding text; size and iconSize have no effect.
    if ( config.hierarchy === 'LINK' ) { warnSupplied(id,{ size:userConfig.size, iconSize:userConfig.iconSize },[ 'size', 'iconSize' ],'hierarchy="LINK" (the link takes the size of the text around it)'); }

    if ( config.buttonVariant === 'ICON_BUTTON' )
    {
        warnIgnored(id,userConfig,[ 'label', 'iconBefore', 'iconAfter', 'iconSize', 'radius', 'minWidth' ]);
        if ( userConfig.width !== undefined && config.width !== 'FIT_CONTENT' ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'width', condition:'buttonVariant="ICON_BUTTON"' }); }
        Object.assign(config,{ width:'FIT_CONTENT', iconBefore:'', iconAfter:'', iconSize:config.size });
    }
    else
    {
        if ( userConfig.icon ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'icon', condition:'buttonVariant="BUTTON" (use iconBefore or iconAfter)' }); }
        if ( config.tooltipMode !== 'NONE' ) { reportButtonIssue('OPTION_IGNORED',{ id, key:'tooltipMode', condition:'buttonVariant="BUTTON" (the label is visible)' }); config.tooltipMode = 'NONE'; }
    }
    // A text link that opens in a new tab shows the new-tab icon after its label, unless iconAfter is set.
    config.showsNewTabIcon = config.isLink && config.target === 'NEW_TAB' && config.newTabIcon && config.buttonVariant === 'BUTTON' && !config.iconAfter;
    if ( config.showsNewTabIcon ) { config.iconAfter = BUTTON_NEW_TAB_ICON; }
    return config;
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateButtonConfig( config )
{
    const id = config.id;
    if ( !id ) { return reportButtonIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportButtonIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportButtonIssue('DUPLICATE_ID',{ id }); }
    if ( config.buttonVariant === 'BUTTON' && !config.label ) { return reportButtonIssue('LABEL_REQUIRED',{ id }); }
    if ( config.buttonVariant === 'ICON_BUTTON' && !config.icon ) { return reportButtonIssue('ICON_REQUIRED',{ id }); }
    if ( config.buttonVariant === 'ICON_BUTTON' && !config.ariaLabel ) { return reportButtonIssue('ARIA_LABEL_REQUIRED',{ id }); }
    return null;
}
