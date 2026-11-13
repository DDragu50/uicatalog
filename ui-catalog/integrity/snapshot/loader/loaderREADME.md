# Loader

## For business

### Overview

Loader shows that a long action is running (an upload, an export, a report, a server check) and, when the application knows it, how far it has got. Typical uses are saving, importing and exporting data, and reloading a table or a form.

### When to use

- Use it for actions that take longer than about half a second; quicker actions finish before it appears.
- Use it as a layer over a table, form or panel when the user must not change that region while it reloads or saves.
- Use Stepper to show the steps of a task the user goes through; use Message for the result of an action (e.g. "Saved") that the user must read later.

### Key features

- A bar or a ring, small, medium or large, that moves while the duration is unknown and fills when the application reports the progress ("45%", "12 of 30" or its own text).
- Appears only when the action takes longer than a short delay and then stays long enough to be seen, so it never flashes.
- Ends with done, failed or cancelled, shown with a symbol, a colour and a text; a failure stays until the application hides it.
- In the page, as a thin line along the top of a region, or as a layer that covers and blocks a region while it loads or saves.
- An optional Cancel button; the application decides whether the action stops.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, type, motion and spacing; `--progress-sweep-duration` and `--scrim-bg`. |
| Loader styles (`loader.css`) | Always | Bar, ring, texts, layer and panel. |
| Button component and `button.css` | `cancellable` | The Cancel button. |
| Font Awesome icon library | Always | Symbols of the end statuses. Loaded by the application page. |

### Not included

The application runs the action, reports its progress, decides what Cancel does and shows the outcome that must stay on the screen (e.g. with Message). Several actions at once in one list, buffered progress (as in video players) and blocking the whole page (a dialog) are not part of this version.

## For designers

### Structure

```text
div#{id}.ui-loader.ui-loader-{bar|ring}.ui-loader-size-{small|medium|large}.ui-loader-placement-{inline|edge|overlay}.ui-loader-label-{above|below|end|hidden}[.ui-loader-indicator-{center|top}][.ui-loader-indeterminate][.ui-loader-shown][.ui-loader-blocking]  data-status="{IDLE|RUNNING|DONE|ERROR|CANCELLED}"
├── div.ui-loader-frame [hidden]                                (hidden while nothing is shown)
│   ├── div.ui-loader-scrim                                     (OVERLAY)
│   └── div.ui-loader-panel
│       ├── div.ui-loader-body
│       │   ├── div.ui-loader-indicator  role="progressbar"  aria-valuenow  aria-valuetext
│       │   │   ├── span.ui-loader-track > span.ui-loader-fill                      (BAR)
│       │   │   └── svg.ui-loader-circle > circle.ui-loader-circle-track, circle.ui-loader-circle-arc ; i.ui-loader-symbol   (RING)
│       │   └── div.ui-loader-text                              (visually hidden with labelPlacement HIDDEN)
│       │       ├── i.ui-loader-symbol                          (BAR; end statuses)
│       │       ├── span.ui-loader-label
│       │       └── span.ui-loader-value                        (known progress)
│       └── span.ui-loader-cancel[data-button="cancel"] → Button   (cancellable; hidden when not running)
├── div.ui-loader-live                                          (polite announcements)
└── div.ui-loader-alert                                         (failure, announced at once)
On the covered element (target): .ui-loader-target [.ui-loader-target-static] (EDGE while shown, OVERLAY while blocking), aria-busy="true" (OVERLAY)
```

The bar is a muted track with an accent fill; while the progress is unknown a band grows from the start and shrinks towards the end. The ring is a muted circle with an accent arc that turns, or fills when the progress is known. At the end the fill takes the success colour (done, with a check), the danger colour (failed, with an exclamation mark, the text in red) or the muted colour (cancelled, with a crossed circle); a ring is replaced by its symbol at the same size. OVERLAY dims the region with the scrim and shows the indicator in a panel with a border.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Shape | Bar, ring | `ui-loader-bar`, `ui-loader-ring` |
| Size | Small (thin line, icon-sized ring), medium, large | `ui-loader-size-small`, `-medium`, `-large` |
| Placement | In the page flow, line along the top of a region, layer covering a region | `ui-loader-placement-inline`, `-edge`, `-overlay` |
| Label placement | Above, below, after the indicator, hidden (screen readers only) | `ui-loader-label-above`, `-below`, `-end`, `-hidden` |
| Panel position (layer) | Middle of the region, top of its visible part | `ui-loader-indicator-center`, `-top` |
| Cancel button | Off, on | —, `.ui-loader-cancel` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Loader | Hidden, shown | `.ui-loader-frame[hidden]`, `ui-loader-shown` |
| Progress | Unknown (moving), known (filling) | `ui-loader-indeterminate`, — |
| Status | Idle, running, done, failed, cancelled | `[data-status="IDLE"]`, `"RUNNING"`, `"DONE"`, `"ERROR"`, `"CANCELLED"` |
| Covered region (layer) | Blocked | `ui-loader-blocking`; on the region `.ui-loader-target`, `[aria-busy="true"]` |

### Styling contract

`loader.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-loader-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: loader
  - `--c-muted`: value, fill (status cancelled), symbol (status cancelled)
  - `--c-surface-muted`: track, circle track
  - `--c-accent`: fill, circle arc
  - `--c-success`: fill (status done)
  - `--c-success-text`: symbol (status done)
  - `--c-danger`: fill (status error)
  - `--c-danger-text`: symbol (status error), label (status error)
  - `--scrim-bg`: scrim
  - `--c-surface`: panel (placement overlay)
  - `--c-border`: panel (placement overlay)
- Typography
  - `--font-ui`: loader
  - `--fw-ui`: loader
  - `--fs-label`: loader
  - `--lh-compact`: loader
  - `--fs-caption`: loader (size small)
  - `--fs-control`: loader (size large)
  - `--fw-ui-strong`: label
- Borders and corners
  - `--radius-pill`: track, fill
  - `--border-thin`: panel (placement overlay)
  - `--radius-panel`: panel (placement overlay)
- Shadows
  - `--shadow-md`: panel (placement overlay)
- States and motion
  - `--transition-1`: fill, circle arc, frame (placement overlay)
  - `--progress-sweep-duration`: fill (indeterminate)
  - `--spinner-duration`: circle (indeterminate)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-inline-items`: panel
  - `--gap-tight`: body, text
  - `--padding-card`: frame (placement overlay), panel (placement overlay, indicator top)
  - `--page-sticky-offset`: panel (indicator top)
- Sizes
  - `--space-md-1`: track
  - `--space-sm-2`: track (size small)
  - `--space-md-3`: track (size large)
  - `--icon-size-medium`: symbol (bar, ring + size small), circle (ring + size small)
  - `--size-md-1`: indicator (bar + label end)
  - `--space-lg-3`: circle, symbol (ring)
  - `--space-xl-3`: circle (ring + size large), symbol (ring + size large)
  - `--size-md-2`: panel (placement overlay + bar)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: indicator (focus)
  - `--focus-offset`: indicator (focus)
  - `--opacity-muted`: fill (indeterminate + reduced motion)

**Set by the component — don't change**

- Variables
  - `--ui-loader-progress`: share done, from 0 to 1 (`setValue()`; 1 at `DONE`); sizes the bar's fill

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `loaderIndex.js`.
- Check the configuration before adding code; configure instead of building spinners, progress bars, delays, overlays or focus handling.
- Keep business logic (running the action, what Cancel stops, the message after a failure) in the application; don't modify the component for application needs.
- Prefer `track(promise)` for actions without progress; use `start()`, `setValue()` and `setStatus()` when the application knows the progress or the end comes from elsewhere (e.g. a server event).
- Use `OVERLAY` only when the region must not be changed while the action runs (a reload, a save); put the Loader's container inside that region (its last child) and pass the region as `target` when it is not the container's parent.
- Respect conditional options: `EDGE` is always a small bar without visible text or Cancel; `indicatorPosition` needs `OVERLAY`; `onCancel` needs `cancellable`; `value` needs `running`.
- `onCancel` reports the user's request; call `setStatus('CANCELLED')` yourself once the action has stopped.
- Use unique ids, and call `destroy()` before rendering into the same container again (it also releases a blocked region).

### Safety

- Labels and texts are inserted as text.
- Don't remove the progress-bar role, its label or the live regions; don't hide the Loader with your own styles while it blocks a region.
- Don't rely on the layer for security: the server must still refuse changes made during an action.

### Example prompts

```text
While the orders table reloads after a filter change, cover it with a Loader layer and keep the filter bar usable.
```

```text
Show the progress of the CSV export with a Loader bar "Exporting report…" with Cancel; update it from the export's progress events and show "Report exported" at the end.
```

## For developers

### Business analysis

> **Component**: the Loader itself. **Consumer**: the developer who configures the Loader in the application's code. **App**: the running application that uses the Loader; it provides the data, performs the actions and stores the changes.

**Action**

- App performs a long action. <!-- BA-01 -->
  - Component displays a moving indicator with a label ("Loading…") after a short delay. <!-- BA-02 -->
  - Component keeps the indicator hidden when the action ends within the delay. <!-- BA-03 -->
  - Component keeps the indicator on the screen for a minimum time once displayed. <!-- BA-04 -->
- App provides the progress of the action (optional). <!-- BA-05 -->
  - Component changes the indicator to the share done. <!-- BA-06 -->
  - Component displays the value as a percentage, as "12 of 30", or as the App's own text. <!-- BA-07 -->
- App changes the label while the action runs. <!-- BA-08 -->
- App marks the action as done, failed or cancelled. <!-- BA-09 -->
  - Component displays the end with a symbol, a colour and a text. <!-- BA-10 -->
  - Component hides the indicator after a short time when the action is done or cancelled. <!-- BA-11 -->
  - Component keeps a failed action on the screen until the App hides it or starts again. <!-- BA-12 -->
  - Component displays a failure even when it comes within the delay. <!-- BA-13 -->
- Component marks the action as done or failed when the App's pending result arrives (optional). <!-- BA-14 -->
- App decides to hide the indicator at any time. <!-- BA-15 -->

**Cancel**

- Consumer enables a Cancel button (optional). <!-- BA-16 -->
  - User clicks Cancel. <!-- BA-17 -->
    - Component disables Cancel. <!-- BA-18 -->
    - Component reports the request to the App. <!-- BA-19 -->
    - App decides whether the action stops. <!-- BA-20 -->

**Look**

- Consumer chooses a bar or a ring. <!-- BA-21 -->
- Consumer chooses the size: small, medium or large. <!-- BA-22 -->
- Consumer chooses the label above, below or after the indicator, or hidden. <!-- BA-23 -->
- Consumer chooses the value as a percentage, as a count or none. <!-- BA-24 -->

**Placement**

- Consumer chooses the indicator in the page flow (on by default). <!-- BA-25 -->
- Consumer chooses a thin line along the top edge of a region (optional). <!-- BA-26 -->
- Consumer chooses a layer that covers a region (optional). <!-- BA-27 -->
  - Component prevents clicks, typing and screen-reader access to the region from the start of the action. <!-- BA-28 -->
  - Component prevents access to content the App adds to the region while it is blocked. <!-- BA-29 -->
  - Component displays the region dimmed and the indicator in a panel after the delay. <!-- BA-30 -->
  - Component moves the focus into the layer when it was inside the region. <!-- BA-31 -->
  - Consumer chooses the panel in the middle of the region or at the top of its visible part. <!-- BA-32 -->
  - Component keeps the region blocked until the indicator hides. <!-- BA-33 -->
  - Component moves the focus back to where it was, or to the start of the region. <!-- BA-34 -->

**Screen readers**

- Component exposes the indicator as a progress bar with its label and value. <!-- BA-35 -->
- Component announces the label when the indicator is displayed. <!-- BA-36 -->
- Component announces the progress at every quarter (optional, on by default). <!-- BA-37 -->
- Component announces the end; a failure interrupts other speech. <!-- BA-38 -->
- Component exposes the covered region as busy. <!-- BA-39 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderLoader, DEFAULT_LOADER_CONFIG, LOADER_SHAPES, LOADER_SIZES, LOADER_PLACEMENTS, LOADER_LABEL_PLACEMENTS, LOADER_VALUE_TEXTS, LOADER_INDICATOR_POSITIONS, LOADER_END_STATUSES } from './loaderIndex.js';

const loader = renderLoader(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. Nothing is visible until `start()`, `track()` or `running:true`.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `start(label?)` | — | Starts the action: `RUNNING`, progress unknown, shown after `showDelayMs`; `OVERLAY` blocks the target at once. Also restarts a running or ended Loader. `label` replaces the configured label for this action. |
| `setValue(value, text?)` | boolean | Sets the progress (clamped to 0–`max`) and an optional value text that replaces "45%" or "12 of 30"; `null` makes the progress unknown again. `false` with `INVALID_VALUE` (not a number) or `NOT_RUNNING`. |
| `setLabel(text)` | — | Changes the label (empty: the configured label or `texts.loading`). |
| `setStatus(status, text?)` | boolean | Ends the action with `'DONE'`, `'ERROR'` or `'CANCELLED'` and an optional text (default `texts.done`, `texts.error`, `texts.cancelled`). `false` with `INVALID_STATUS` or `NOT_RUNNING`. |
| `hide()` | — | Hides the Loader (after the rest of `minVisibleMs`) and releases the target; a running action becomes `IDLE`, and a pending `track()` no longer changes it. |
| `track(promise, texts?)` | Promise | `start(texts.label)`, then `DONE` (`texts.done`) when the Promise resolves or `ERROR` (`texts.error`) when it is rejected; returns the same Promise. Ignored after a later `start()`, `setStatus()` or `hide()`. Not a Promise: `INVALID_PROMISE`. |
| `getState()` | object | `{ status, visible, value, max, label }`: `status` `IDLE`, `RUNNING`, `DONE`, `ERROR` or `CANCELLED`; `value` `null` while the progress is unknown; `label` the text shown (the end text after the end). |
| `destroy()` | — | Clears the timers, releases the target, removes the Cancel Button, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root element id. |
| `shape` | string | `'BAR'` | `BAR`, `RING` | Not `EDGE` | Bar or ring. |
| `size` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE` | Not `EDGE` | Bar thickness, ring size and text size. `SMALL`: a thin line, or a ring of icon size. |
| `placement` | string | `'INLINE'` | `INLINE`, `EDGE`, `OVERLAY` | Always | `INLINE`: in the container, in the page flow. `EDGE`: a thin line along the top of the target, taking no space (always `BAR`, `SMALL`, label `HIDDEN`, no Cancel). `OVERLAY`: a layer that covers and blocks the target. |
| `target` | Element | the container's parent | An element that contains the container | Not `INLINE` | The region covered (`OVERLAY`) or edged (`EDGE`). Not an element, or not containing the container: `INVALID_TARGET` (nothing rendered). |
| `label` | string | `texts.loading` | Text | Always | The label while the action runs; `start(label)` and `track(promise, { label })` replace it for one action. |
| `labelPlacement` | string | `'ABOVE'` (`BAR`), `'END'` (`RING`) | `ABOVE`, `BELOW`, `END`, `HIDDEN` | Not `EDGE` | Where the label and the value go. `HIDDEN`: for screen readers only. |
| `valueText` | string | `'PERCENT'` | `PERCENT`, `COUNT`, `NONE` | Not `EDGE` | The visible value of known progress: "45%", "12 of 30" (`value` of `max`) or none. Screen readers always get the value. |
| `max` | number | `100` | Greater than 0 | Always | The value of a complete action (e.g. the number of files). |
| `running` | boolean | `false` | — | Always | Starts at once when rendered (e.g. the first load of a page), as `start()`. |
| `value` | number | `null` | 0–`max` | `running` | The progress at the start; `null`: unknown. |
| `cancellable` | boolean | `false` | — | Not `EDGE` | Shows a Cancel button while the action runs. Without `onCancel` it is not shown (`CANCEL_HANDLER_MISSING`). |
| `indicatorPosition` | string | `'CENTER'` | `CENTER`, `TOP` | `OVERLAY` | Panel in the middle of the target, or at the top of its visible part (below a sticky page header) for tall, scrolled regions. |
| `showDelayMs` | number | `400` | 0 or more | Always | Time before the Loader appears; actions that end sooner are never shown (a failure is shown at once). The `OVERLAY` blocking starts at once. |
| `minVisibleMs` | number | `600` | 0 or more | Always | Shortest time on the screen once shown. |
| `hideAfterMs` | number | `1500` | 0 or more | Always | Time the end is shown after `DONE` or `CANCELLED`; `ERROR` stays until `hide()` or `start()`. |
| `announceEvery` | number | `25` | 0–100 | Always | Progress announced to screen readers every this many percent; `0`: only the start and the end. |
| `texts.*` | object | English defaults | Text; `{value}`, `{max}` placeholders | Always | `loading`, `done`, `error`, `cancelled`, `cancel`, `percent` (`'{value}%'`), `count` (`'{value} of {max}'`). |
| `onCancel` | function | `null` | `(loader) => {}` | `cancellable` | See Callbacks. |

`OVERLAY` blocks the target from `start()` to the hiding: the layer takes the pointer, everything else in the target becomes `inert` (also content added meanwhile), the target gets `aria-busy="true"` and focus inside it moves into the layer (to Cancel once shown). When the target is not positioned, the component makes it `position:relative` while it blocks or edges it (`.ui-loader-target-static`); a positioned element between the container and the target takes the layer instead (`POSITIONED_ANCESTOR`). Options that do not apply are ignored with `OPTION_IGNORED`.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onCancel` | `(loader)` | The user presses Cancel while the action runs (once per action: Cancel is then disabled). | `setStatus('CANCELLED')`; `hide()`; a Loader that is not running. |

### Errors

Loader has no user-facing errors: the failure of the action is shown with `setStatus('ERROR', text)` or `track()`. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Loader "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_TARGET` | error | `EDGE` or `OVERLAY` without a target that contains the container (also a container without a parent). |
| `INVALID_OPTION` | warning | Invalid enumerated value or number; the default is used. |
| `OPTION_IGNORED` | warning | An option that does not apply (see Applies when), e.g. `RING`, a size or a label placement with `EDGE`. |
| `POSITIONED_ANCESTOR` | warning | A positioned element between the container and the target; the layer covers that element. |
| `CANCEL_HANDLER_MISSING` | warning | `cancellable` without `onCancel`; Cancel is not shown. |
| `INVALID_VALUE` | warning | `value` or `setValue()` with something that is not a number. |
| `INVALID_STATUS` | warning | `setStatus()` with a status other than `DONE`, `ERROR`, `CANCELLED`. |
| `NOT_RUNNING` | warning | `setValue()` or `setStatus()` while the Loader is not running. |
| `INVALID_PROMISE` | warning | `track()` without a Promise. |

### Accessibility

- The indicator is a progress bar named by the label; known progress sets `aria-valuenow` and `aria-valuetext` ("45%", "12 of 30" or the application's text); unknown progress has no value.
- The label is announced politely when the Loader appears (not for actions that end before), the progress every `announceEvery` percent and the end; a failure is announced assertively.
- `OVERLAY` makes the target `inert` and `aria-busy`, so keyboard and screen-reader users cannot change it either; focus moves into the layer (the indicator, then Cancel) and back to the element that had it, or to the first focusable element of the target.
- End statuses use a symbol and a text besides the colour.
- With reduced motion the moving band becomes a still, lighter bar and the ring stops turning.

### Examples

Saving with a ring next to the button bar:

```js
const saving = renderLoader(document.getElementById('save-status'), { id:'save-status', shape:'RING', size:'SMALL' });
saveButton.onclick = () => saving.track(api.saveProfile(),{ label:'Saving…', done:'Saved', error:'Could not save. Try again.' });
```

Export with progress and Cancel:

```js
const exporting = renderLoader(host,
{
    id:'export', label:'Exporting report…', cancellable:true,
    onCancel:loader => job.cancel().then(() => loader.setStatus('CANCELLED'))
});
exporting.start();
job.onProgress = ( done, total ) => exporting.setValue(done / total * 100);
job.onEnd = ok => exporting.setStatus(ok ? 'DONE' : 'ERROR',ok ? 'Report exported' : 'The export failed');
```

A layer over the orders table while it reloads (the container is the last child of the table's section):

```js
const reloading = renderLoader(document.getElementById('orders-busy'), { id:'orders-busy', placement:'OVERLAY', indicatorPosition:'TOP', label:'Loading orders…' });
filter.onchange = () => reloading.track(loadOrders(filter.value).then(rows => table.setData(rows)));
```

### Files

| File | Responsibility |
| --- | --- |
| `loaderIndex.js` | Public entry point; the only import surface. |
| `loaderConfig.js` | Defaults, allowed values, normalization, developer validation, the target. |
| `loaderComponent.js` | Lifecycle, timing (delay, minimum time, hiding), statuses, `track()`, blocking of the target and focus, announcements, Cancel Button, runtime API. |
| `loaderState.js` | Status, visibility, value, texts, timers and the token of the tracked Promise. |
| `loaderHTML.js` | Indicator (bar or ring), texts, Cancel host, scrim and live regions. |
| `loaderErrors.js` | Developer error and warning catalog. |
| `loader.css` | Presentation of the bar, ring, texts, end statuses, line, layer and panel. |
| `loaderTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/loader.test.mjs`). |
