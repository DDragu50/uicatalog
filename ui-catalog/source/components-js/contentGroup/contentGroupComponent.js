// contentGroupComponent.js
//
// COMPONENT COORDINATOR.
// Renders the shell, then each child into its own item host, keeps child instances and owns their lifecycle.
// Imports no other framework component. The container is a dedicated, consumer-owned mount point.

import { mergeContentGroupConfig, validateContentGroupConfig } from './contentGroupConfig.js';
import { buildContentGroupHTML } from './contentGroupHTML.js';
import { reportContentGroupIssue } from './contentGroupErrors.js';

const FORM_CONTROLS = 'input, select, textarea';

// Renders ordered children (static HTML strings or render functions) into item hosts; returns the child instances.
function renderChildren( content, children, owner, id )
{
    const list = Array.isArray(children) ? children : ( children === undefined || children === null ? [] : [ children ] );
    return list.map(( child, index ) =>
    {
        if ( typeof child !== 'string' && typeof child !== 'function' ) { reportContentGroupIssue('INVALID_CHILD',{ id, index }); return null; }
        const host = document.createElement('div');
        host.className = 'ui-content-group-item';
        content.appendChild(host);
        if ( typeof child === 'string' ) { host.innerHTML = child; return null; }
        return child(host,owner) ?? null;
    }).filter(Boolean);
}

// Warns about semantic misuse detectable from native elements only (never from other components' classes).
function checkSemantics( config, content )
{
    if ( config.semantic !== 'FIELDSET' ) { return; }
    const controls = [ ...content.querySelectorAll(FORM_CONTROLS) ];
    if ( controls.length === 0 ) { reportContentGroupIssue('FIELDSET_WITHOUT_CONTROLS',{ id:config.id }); return; }
    const groups = content.querySelectorAll('fieldset');
    if ( groups.length === 1 && controls.every(control => groups[0].contains(control)) ) { reportContentGroupIssue('REDUNDANT_GROUP',{ id:config.id }); }
}

// Renders a ContentGroup and returns its runtime instance, or null after a developer error.
export function renderContentGroup( container, config, children = [] )
{
    if ( !container ) { reportContentGroupIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeContentGroupConfig(config);
    if ( validateContentGroupConfig(merged) ) { return null; }

    container.innerHTML = buildContentGroupHTML(merged);
    const content = container.querySelector('.ui-content-group-content');
    let childInstances = [];

    const instance =
    {
        id:merged.id,
        // Returns the child instances returned by render functions (e.g. for a future Form component).
        getChildren:() => [ ...childInstances ],
        // Destroys child instances first, then clears the container.
        destroy:() => { childInstances.forEach(child => child?.destroy?.()); childInstances = []; container.innerHTML = ''; }
    };

    childInstances = renderChildren(content,children,instance,merged.id);
    checkSemantics(merged,content);
    return instance;
}
