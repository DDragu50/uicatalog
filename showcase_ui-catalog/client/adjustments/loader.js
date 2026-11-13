// loader.js
//
// CUSTOMIZATION ADJUSTMENTS (Loader).
// What the README Configuration table cannot say by itself; everything else is generated from the README.
// Start values follow tests/loader.html: a running bar with the label "Loading orders…", Cancel on, no delay (the example
// appears at once). The example cannot call the Loader's methods, so it shows a running action: give a value to see a
// known progress; Cancel is reported in the Output, then the example shows "Cancelled" and starts again after 2 s.
// Variants panel (decision 118: only options with a visible effect; a simple start):
//   shape, size, placement, labelPlacement, valueText, value, cancellable, indicatorPosition, label.
// Hidden: target (EDGE and OVERLAY cover a sample region built by prepare), running (on), max (100), showDelayMs (0 here),
// minVisibleMs, hideAfterMs, announceEvery, ariaLabel and texts.

// A sample region (orders list with a filter) that EDGE and OVERLAY Loaders edge or cover; the Loader's container is its last child.
function buildRegion( host )
{
    const region = document.createElement('section');
    region.setAttribute('aria-label','Orders');
    region.style.cssText = 'display:flex; flex-direction:column; gap:var(--gap-block); padding:var(--padding-card); border:var(--border-thin) solid var(--c-border); border-radius:var(--radius-panel); background-color:var(--c-surface);';
    region.innerHTML = '<div style="display:flex; gap:var(--gap-inline-items); align-items:center;"><label for="showcase-loader-filter">Filter</label><input id="showcase-loader-filter" type="text"></div>'
        + `<ul style="margin:0;">${[ 1040, 1041, 1042, 1043, 1044 ].map(number => `<li>Order ${number}</li>`).join('')}</ul>`;
    const container = document.createElement('div');
    region.append(container);
    host.append(region);
    return container;
}

export default
{
    show:[ 'shape', 'size', 'placement', 'labelPlacement', 'valueText', 'value', 'cancellable', 'indicatorPosition', 'label' ],
    start:{ running:true, showDelayMs:0, label:'Loading orders…', cancellable:true },
    examples:
    [
        { title:'Shapes and sizes (progress 45%)', items:
        [
            { label:'BAR SMALL', config:{ running:true, showDelayMs:0, size:'SMALL', value:45, label:'Uploading photos…' } },
            { label:'BAR MEDIUM', config:{ running:true, showDelayMs:0, value:45, label:'Uploading photos…' } },
            { label:'BAR LARGE', config:{ running:true, showDelayMs:0, size:'LARGE', value:45, label:'Uploading photos…' } },
            { label:'RING SMALL', config:{ running:true, showDelayMs:0, shape:'RING', size:'SMALL', value:45, label:'Saving…' } },
            { label:'RING MEDIUM', config:{ running:true, showDelayMs:0, shape:'RING', value:45, label:'Saving…' } },
            { label:'RING LARGE', config:{ running:true, showDelayMs:0, shape:'RING', size:'LARGE', value:45, label:'Saving…' } }
        ] },
        { title:'Texts', items:
        [
            { label:'progress unknown (moving band)', config:{ running:true, showDelayMs:0, label:'Loading orders…' } },
            { label:'valueText COUNT', config:{ running:true, showDelayMs:0, valueText:'COUNT', max:30, value:12, label:'Importing contacts…' } },
            { label:'labelPlacement END', config:{ running:true, showDelayMs:0, labelPlacement:'END', value:70, label:'Exporting' } },
            { label:'RING, labelPlacement BELOW', config:{ running:true, showDelayMs:0, shape:'RING', labelPlacement:'BELOW', label:'Checking the address…' } }
        ] }
    ],
    // EDGE and OVERLAY: the Loader goes into a sample region. Cancel is reported, then the example ends with CANCELLED and
    // starts again after 2 s (as an application would after stopping its action).
    prepare:( { config, host } ) =>
    {
        const reportCancel = config.onCancel;
        if ( typeof reportCancel === 'function' )
        {
            config.onCancel = loader =>
            {
                reportCancel(loader);
                setTimeout(() => { loader.setStatus('CANCELLED'); setTimeout(() => { if ( loader.getState().status === 'CANCELLED' ) { loader.start(); if ( config.value !== undefined ) { loader.setValue(config.value); } } },2000); },300);
            };
        }
        const placement = config.placement ?? 'INLINE';
        return placement === 'INLINE' ? [ config ] : { host:buildRegion(host), args:[ config ] };
    }
};
