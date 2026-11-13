// stepperState.js
//
// INTERNAL STATE.
// The current step, each step's status and disabled state, the steps the user passed (Next or Skip) and the busy flag,
// plus the rules derived from them: which steps are complete, which are open (available), where Next and Back lead,
// and whether Finish is allowed. No DOM access.

// Statuses that complete a step (its followers open in LINEAR navigation).
const COMPLETE_STATUSES = [ 'DONE', 'SKIPPED' ];

// Returns the ids a step waits for when it has no "after" rule: the nearest step before it that is not disabled.
function previousEnabled( steps, index, isDisabled )
{
    for ( let position = index - 1; position >= 0; position -= 1 ) { if ( !isDisabled(steps[position].id) ) { return [ steps[position].id ]; } }
    return [];
}

// Drops every "after" rule that leads back to its own step (directly or through other steps); report(stepId) per rule.
// The default rule (the previous step) always points backwards, so only "after" rules can close a circle.
export function dropCircularRules( steps, report )
{
    const byId = new Map(steps.map(step => [ step.id, step ]));
    const waitsFor = step => step.after ?? ( step.index > 0 ? [ steps[step.index - 1].id ] : [] );
    let changed = true;
    while ( changed )
    {
        changed = false;
        for ( const step of steps.filter(entry => entry.after) )
        {
            const seen = new Set(), stack = [ ...waitsFor(step) ];
            let circular = false;
            while ( stack.length && !circular )
            {
                const id = stack.pop();
                if ( id === step.id ) { circular = true; }
                else if ( !seen.has(id) ) { seen.add(id); stack.push(...waitsFor(byId.get(id))); }
            }
            if ( circular ) { report(step.id); step.after = null; changed = true; break; }
        }
    }
}

// Creates the runtime state from the normalized configuration.
export function createStepperState( config )
{
    const state =
    {
        current:null,
        busy:false,
        status:new Map(config.steps.map(step => [ step.id, step.status ])),
        disabled:new Map(config.steps.map(step => [ step.id, step.disabled ])),
        passed:new Set()
    };
    const steps = config.steps;
    const isDisabled = id => state.disabled.get(id) === true;

    // Returns the ids a step waits for (LINEAR): its "after" rule, or the previous enabled step.
    const prerequisites = step => step.after ?? previousEnabled(steps,step.index,isDisabled);
    // Returns whether a step is complete: passed by the user, or DONE / SKIPPED.
    const isComplete = id => state.passed.has(id) || COMPLETE_STATUSES.includes(state.status.get(id));
    // Returns whether the user can open a step now.
    const isAvailable = step =>
    {
        if ( config.navigation === 'NONE' || isDisabled(step.id) ) { return false; }
        if ( config.navigation === 'FREE' || step.id === state.current || isComplete(step.id) ) { return true; }
        return prerequisites(step).every(isComplete);
    };
    const indexOf = id => steps.findIndex(step => step.id === id);

    Object.assign(state,
    {
        steps, isDisabled, isComplete, isAvailable, prerequisites, indexOf,
        // Returns the step object of an id, or null.
        find:( id ) => steps.find(step => step.id === String(id)) ?? null,
        // Returns the steps a locked step still waits for (LINEAR), in display order.
        waitingFor:( step ) => config.navigation === 'LINEAR' && !isDisabled(step.id) && !isAvailable(step) ? prerequisites(step).filter(id => !isComplete(id)).map(id => steps[indexOf(id)]) : [],
        // Returns the first step to open at start: the first available one (NONE: none).
        firstOpen:() => ( config.navigation === 'NONE' ? null : steps.find(step => isAvailable(step))?.id ?? null ),
        // Returns the last enabled step (Finish is shown there).
        lastEnabled:() => [ ...steps ].reverse().find(step => !isDisabled(step.id)) ?? null,
        // Returns where Next leads: the first open step after the current one that follows from it or is still to do
        // (complete parallel steps are passed over), else the first open step before it that is still to do.
        nextTarget:() =>
        {
            const position = indexOf(state.current);
            const todo = step => isAvailable(step) && !isComplete(step.id);
            return steps.slice(position + 1).find(step => todo(step) || ( isAvailable(step) && prerequisites(step).includes(state.current) ))
                ?? steps.slice(0,position).find(todo) ?? null;
        },
        // Returns where Back leads: the nearest open step before the current one.
        backTarget:() => [ ...steps.slice(0,Math.max(indexOf(state.current),0)) ].reverse().find(isAvailable) ?? null,
        // Returns whether Finish is allowed: every required, enabled step other than the current one is complete.
        canFinish:() => steps.every(step => step.id === state.current || step.optional || isDisabled(step.id) || isComplete(step.id))
    });
    return state;
}
