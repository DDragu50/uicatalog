// tooltipConfig.js
//
// CONFIGURATION CONTRACT.
// Defaults, allowed values, normalization and developer validation.
// Messages and labels are defined in tooltipErrors.js.

import { reportTooltipIssue } from './tooltipErrors.js';

// DESCRIPTION: extra information about an element that has its own name (aria-describedby). LABEL: the element's only
// name, e.g. an icon-only control (aria-labelledby). Both only with one target; with targets the tooltip only shows on
// screen the text the elements already carry.
export const TOOLTIP_PURPOSES = [ 'DESCRIPTION', 'LABEL' ];
// Preferred side; START / END follow the text direction. The tooltip moves to the opposite side when there is no room.
export const TOOLTIP_PLACEMENTS = [ 'TOP', 'BOTTOM', 'START', 'END' ];
// INVERSE: dark on light pages (the text colour as background). SURFACE: a light panel with a border.
export const TOOLTIP_TONES = [ 'INVERSE', 'SURFACE' ];

export const DEFAULT_TOOLTIP_CONFIG =
{
    id:'',
    target:null,
    targets:null,              // { within, selector, text? }
    text:'',
    shortcut:'',
    purpose:'DESCRIPTION',
    placement:'TOP',
    arrow:true,
    tone:'INVERSE',
    onlyWhenTruncated:false,
    longPress:false,
    showDelayMs:500,
    hideDelayMs:100,
    disabled:false
};

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportTooltipIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Returns a number of 0 or more; warns and falls back for anything else.
function normalizeDelay( id, key, value, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const number = Number(value);
    if ( Number.isFinite(number) && number >= 0 ) { return number; }
    reportTooltipIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Normalizes targets { within, selector, text? }: within an element, selector a non-empty string; otherwise null.
function normalizeTargets( targets )
{
    if ( !targets || typeof targets !== 'object' || !( targets.within instanceof Element ) || !String(targets.selector ?? '').trim() ) { return null; }
    return Object.freeze({ within:targets.within, selector:String(targets.selector).trim(), text:typeof targets.text === 'function' ? targets.text : null });
}

// Produces the normalized, immutable configuration consumed by Tooltip.
export function mergeTooltipConfig( userConfig = {} )
{
    const id = String(userConfig.id ?? '').trim();
    const target = userConfig.target instanceof Element ? userConfig.target : null;
    const targets = target ? null : normalizeTargets(userConfig.targets);
    if ( target && userConfig.targets !== undefined && userConfig.targets !== null ) { reportTooltipIssue('OPTION_IGNORED',{ id, key:'targets', condition:'target is given' }); }
    let purpose = normalizeEnum(id,'purpose',userConfig.purpose,TOOLTIP_PURPOSES,DEFAULT_TOOLTIP_CONFIG.purpose);
    if ( targets )
    {
        if ( userConfig.purpose !== undefined ) { reportTooltipIssue('OPTION_IGNORED',{ id, key:'purpose', condition:'targets is used (the elements already carry their text)' }); }
        if ( userConfig.text !== undefined ) { reportTooltipIssue('OPTION_IGNORED',{ id, key:'text', condition:'targets is used (use targets.text)' }); }
        purpose = 'DESCRIPTION';
    }
    return Object.freeze({
        id,
        target,
        targets,
        text:targets ? '' : String(userConfig.text ?? '').trim(),
        shortcut:String(userConfig.shortcut ?? '').trim(),
        purpose,
        placement:normalizeEnum(id,'placement',userConfig.placement,TOOLTIP_PLACEMENTS,DEFAULT_TOOLTIP_CONFIG.placement),
        arrow:userConfig.arrow !== false,
        tone:normalizeEnum(id,'tone',userConfig.tone,TOOLTIP_TONES,DEFAULT_TOOLTIP_CONFIG.tone),
        onlyWhenTruncated:Boolean(userConfig.onlyWhenTruncated),
        longPress:Boolean(userConfig.longPress),
        showDelayMs:normalizeDelay(id,'showDelayMs',userConfig.showDelayMs,DEFAULT_TOOLTIP_CONFIG.showDelayMs),
        hideDelayMs:normalizeDelay(id,'hideDelayMs',userConfig.hideDelayMs,DEFAULT_TOOLTIP_CONFIG.hideDelayMs),
        disabled:Boolean(userConfig.disabled)
    });
}

// Returns the developer error label that prevents rendering, otherwise null; the error is reported to the console.
export function validateTooltipConfig( config, container )
{
    const id = config.id;
    if ( !id ) { return reportTooltipIssue('ID_REQUIRED'); }
    if ( !/^[A-Za-z][A-Za-z0-9_:.-]*$/.test(id) ) { return reportTooltipIssue('UNSAFE_ID',{ id }); }
    if ( document.getElementById(id) ) { return reportTooltipIssue('DUPLICATE_ID',{ id }); }
    if ( !config.target && !config.targets ) { return reportTooltipIssue('TARGET_REQUIRED',{ id }); }
    if ( config.target && config.target.contains(container) ) { return reportTooltipIssue('CONTAINER_IN_TARGET',{ id }); }
    if ( config.target && !config.text ) { reportTooltipIssue('TEXT_REQUIRED',{ id }); }
    return null;
}
