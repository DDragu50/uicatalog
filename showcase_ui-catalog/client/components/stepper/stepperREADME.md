# Stepper

## For business

### Overview

Stepper shows a task split into ordered steps: where the user is, what is done and what is left. Typical uses are sign-up, checkout, onboarding, approval flows and order tracking.

### When to use

- Use it for a task of about 3 to 7 steps that are done in order, completely or partly (some steps may be done in any order once the steps before them are complete).
- Use it without interaction to show the progress of a process the user only follows (an order, a request under review).
- Use Accordion or CollapsiblePanel for sections without an order; use TopNavigation or SideNavigation to move between pages; use ContentGroup to split one page into groups; use Loader for the progress of a single action (an upload, an export).

### Key features

- Each step with a number, an icon or a dot, a label, an optional description and a status: not started, in progress, done, skipped, needs attention, has errors, blocked or cancelled; the application keeps only the statuses it needs.
- Moves with Back, Next and Finish, and Skip for optional steps; before Next and Finish the application can check the step (also with a server answer).
- Steps in a fixed order, steps open in any order, or rules that open several steps at once after others are complete (parallel steps).
- Horizontal or vertical; in a narrow space the horizontal steps become a compact bar "Step 2 of 5" with a progress line.
- Optionally holds the content of each step (beside, below or under the current step), so the entered data is kept while the user moves.
- Informative mode: the steps only show the progress, without interaction.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, type, lines and spacing. |
| Stepper styles (`stepper.css`) | Always | Steps, markers, lines, content and button bar. |
| Button component and `button.css` | `showButtons` | Back, Skip, Next, Finish and the application's actions. |
| Loader component and `loader.css` | `showButtons` with `canLeave` | The line above the button bar while the application checks a step. |
| Font Awesome icon library | Status symbols, `ICON` markers, action icons | Icon glyphs. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides the steps, checks the values of a step, saves the data and shows its own messages (e.g. with Message). Storing the progress between visits, routing (one address per step) and the content of the steps belong to the application.

## For designers

### Structure

```text
div#{id}.ui-stepper.ui-stepper-{horizontal|vertical}.ui-stepper-marker-{number|icon|dot}.ui-stepper-label-{end|below|hidden}.ui-stepper-navigation-{linear|free|none}[.ui-stepper-connectors][.ui-stepper-compact][.ui-stepper-with-content.ui-stepper-content-{separate|inline}][.ui-stepper-busy]
├── div.ui-stepper-compact-bar                                  (compactWhenNarrow; shown in narrow containers instead of the list)
│   ├── span.ui-stepper-compact-text                            ("Step 2 of 4: Payment")
│   └── span.ui-stepper-compact-track > span.ui-stepper-compact-fill
├── div.ui-stepper-body
│   ├── ol.ui-stepper-list  aria-label
│   │   └── li.ui-stepper-step[.ui-stepper-current][.ui-stepper-complete][.ui-stepper-locked][.ui-stepper-disabled]  data-status="{status}"
│   │       ├── button.ui-stepper-trigger  [aria-current="step"] [disabled]   (div.ui-stepper-trigger with navigation NONE)
│   │       │   ├── span.ui-stepper-marker > span.ui-stepper-number | i (icon or status symbol)
│   │       │   └── span.ui-stepper-text
│   │       │       ├── span.ui-stepper-label > span.ui-stepper-optional   (optional steps)
│   │       │       ├── span.ui-stepper-description                       (description)
│   │       │       └── span.ui-stepper-status                            (visually hidden without statusText)
│   │       ├── span.ui-stepper-connector                                 (connectors; not after the last step)
│   │       └── section.ui-stepper-panel [hidden] > div.ui-stepper-item    (showContent, contentPosition INLINE)
│   └── div.ui-stepper-panels > section.ui-stepper-panel [hidden] > div.ui-stepper-item   (showContent, SEPARATE)
├── div.ui-stepper-buttons                                      (showButtons)
│   ├── span.ui-stepper-loader-host → Loader (SMALL bar just above the bar, label for screen readers)   (canLeave)
│   ├── span.ui-stepper-button[data-button="back"] → Button
│   ├── span.ui-stepper-actions > span.ui-stepper-action → Button  (actions)
│   └── span.ui-stepper-forward > span.ui-stepper-button[data-button="skip|next|finish"] → Button   (the ones that do not apply are hidden)
└── div.ui-stepper-live                                         (polite announcements; not with navigation NONE)
```

The marker is a circle with the step number (or the step's icon); a status with a symbol replaces it: done ✓ (filled with the accent colour), skipped (dashed circle), needs attention !, has errors ×, blocked (lock), cancelled (crossed circle, label struck through). The current step has an accent ring and a bold label. The line after a complete step takes the accent colour. Steps that wait for others have a muted label; disabled steps are faded.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Orientation | Horizontal, vertical | `ui-stepper-horizontal`, `ui-stepper-vertical` |
| Marker | Number, icon, dot | `ui-stepper-marker-number`, `-icon`, `-dot` |
| Label placement | After the marker, below the marker (horizontal), hidden (tooltip) | `ui-stepper-label-end`, `-below`, `-hidden` |
| Lines between steps | On, off | `ui-stepper-connectors`, — |
| Status text | Hidden (screen readers only), visible | `.ui-stepper-status` with or without `.ui-stepper-visually-hidden` |
| Narrow container (horizontal) | Compact bar, steps | `ui-stepper-compact` |
| Navigation | In order, free, none | `ui-stepper-navigation-linear`, `-free`, `-none` |
| Content | None, separate area, under the current step (vertical) | —, `ui-stepper-with-content` + `ui-stepper-content-separate`, `-inline` |
| Button bar | Off, on | —, `.ui-stepper-buttons` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Step | Current | `.ui-stepper-current`, `[aria-current="step"]` |
| Step | Complete, waiting for other steps, disabled | `.ui-stepper-complete`, `.ui-stepper-locked`, `.ui-stepper-disabled` |
| Step status | Not started, in progress, done, skipped, needs attention, has errors, blocked, cancelled | `[data-status="NOT_STARTED"]`, `"IN_PROGRESS"`, `"DONE"`, `"SKIPPED"`, `"WARNING"`, `"ERROR"`, `"BLOCKED"`, `"CANCELLED"` |
| Stepper | Busy (waiting for the application's check) | `ui-stepper-busy`, `[aria-busy="true"]` |

### Styling contract

`stepper.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-stepper-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: stepper
  - `--c-surface-hover`: trigger (hover)
  - `--c-border`: marker (also marker dot), connector
  - `--c-surface`: marker
  - `--c-muted`: marker (also status skipped, status blocked, status cancelled), optional, description, status, label (status cancelled, locked)
  - `--c-accent`: marker (current, status in progress, status done, marker dot + status in progress, marker dot + status done, marker dot + current), connector (complete), compact fill
  - `--c-on-accent`: marker (status done)
  - `--c-warning`: marker (status warning, marker dot + status warning)
  - `--c-warning-soft`: marker (status warning)
  - `--c-warning-text`: marker (status warning), status (status warning)
  - `--c-danger`: marker (status error, marker dot + status error)
  - `--c-danger-soft`: marker (status error)
  - `--c-danger-text`: marker (status error), label (status error), status (status error)
  - `--c-surface-muted`: marker (status blocked, status cancelled), compact track
- Typography
  - `--font-ui`: stepper
  - `--fw-ui`: stepper, optional
  - `--fs-control`: stepper
  - `--lh-compact`: stepper
  - `--fs-caption`: marker, status
  - `--fw-ui-strong`: marker, label (current), compact text
  - `--fs-label`: description, compact text
- Borders and corners
  - `--radius-control`: trigger
  - `--border-thin`: marker (also current)
  - `--radius-pill`: compact track, compact fill
- States and motion
  - `--transition-1`: trigger, marker
  - `--opacity-disabled`: trigger (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thick`: connector (horizontal, label below, vertical, vertical + marker dot, horizontal + marker dot, label below + marker dot)
- Spacing
  - `--gap-block`: stepper, step (vertical), body (vertical + content separate, horizontal)
  - `--gap-inline-items`: trigger, connector (horizontal, label below, label below + marker dot), panel (content inline), buttons, actions, forward
  - `--gap-tight`: trigger, connector (horizontal, label below, vertical, vertical + marker dot, horizontal + marker dot, label below + marker dot), panel (content inline), loader host, compact bar
  - `--space-lg-3`: marker, connector (horizontal, label below, vertical), panel (content inline)
  - `--space-md-3`: marker (marker dot), connector (vertical + marker dot, horizontal + marker dot, label below + marker dot)
  - `--space-md-1`: marker (marker dot), connector (vertical + marker dot, horizontal + marker dot, label below + marker dot)
  - `--space-sm-1`: text
  - `--space-sm-2`: text, compact track
  - `--gap-section`: body (vertical + content separate)
- Sizes
  - `--size-md-2`: list (vertical + content separate)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: trigger (focus)
  - `--focus-offset`: trigger (focus)

**Set by the component — don't change**

- Variables
  - `--ui-stepper-progress`: share of complete steps, from 0 to 1 (fills the compact bar)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `stepperIndex.js`.
- Check the configuration before adding code; configure instead of building step markup, Back / Next buttons or progress logic.
- Keep business logic (checking a step, saving, where the data goes) in the application: check a step in `canLeave` and show your messages yourself; don't modify the component for application needs.
- Use `navigation:'LINEAR'` (default) for wizards, `after` rules for steps that open together after others, `FREE` when the order does not matter, `NONE` to show the progress of a process the user only follows (set statuses with `setStepStatus()`).
- Keep only the statuses your process needs (`statuses`); set them from the application with `setStepStatus()` (e.g. `ERROR` when the server rejects a step).
- Respect conditional options: `contentPosition` needs `showContent`; `INLINE` and `labelPlacement:'BELOW'` depend on the orientation; `actions`, `onAction` need `showButtons`; nothing interactive applies with `NONE`.
- Application buttons in the bar follow the shared actions contract (guidelines §10.2): pass `actions` and handle `onAction(key, step)`; never add Buttons inside the component yourself.
- Callbacks report user actions only; `goTo()`, `setStepStatus()` and `setStepDisabled()` never fire them.
- Use unique ids (the Stepper's and the steps' within it), and call `destroy()` before rendering into the same container again.

### Safety

- Labels, descriptions and texts are inserted as text; string `content` is inserted as HTML: escape user-provided or external data first.
- Don't remove `aria-current`, the ordered list or the step buttons' names; don't make steps clickable with other elements.
- Don't trust `canLeave` alone for security: the server must check the data of every step again.

### Example prompts

```text
Turn the checkout page into a Stepper with the steps Cart, Address, Gift wrap (optional) and Payment, each holding its existing fields; Next checks the fields of the current step, Finish submits the order.
```

```text
Show the progress of a purchase request with a vertical Stepper in informative mode: Request, Legal review, Finance review, Sign-off, with statuses loaded from /api/requests/{id}/progress.
```

## For developers

### Business analysis

> **Component**: the Stepper itself. **Consumer**: the developer who configures the Stepper in the application's code. **App**: the running application that uses the Stepper; it provides the data, performs the actions and stores the changes.

**Steps**

- App provides the steps in their order, each with a label. <!-- BA-01 -->
- Consumer provides for each step a description, an icon and a status (optional). <!-- BA-02 -->
- Component displays each step with a marker, its label and its description. <!-- BA-03 -->
- Component marks the current step. <!-- BA-04 -->
- Component displays the status of each step with a symbol, a colour and a text for screen readers. <!-- BA-05 -->
  - Consumer chooses to display the status text on the screen (optional). <!-- BA-06 -->
- Consumer chooses the statuses the steps use. <!-- BA-07 -->
- Consumer chooses an optional step. <!-- BA-08 -->
  - Component displays "(Optional)" after its label. <!-- BA-09 -->

**Moving between steps**

- User clicks Next. <!-- BA-10 -->
  - Component asks the App whether the step is complete (optional). <!-- BA-11 -->
    - Component prevents other moves while the App checks. <!-- BA-12 -->
    - Component displays a thin line above the buttons when the check takes longer than a short delay. <!-- BA-13 -->
    - Component keeps the step open when the App refuses. <!-- BA-14 -->
  - Component marks the step as done (optional, on by default). <!-- BA-15 -->
  - Component opens the next step. <!-- BA-16 -->
  - Component reports the new current step to the App. <!-- BA-17 -->
- User clicks Back. <!-- BA-18 -->
  - Component opens the previous step that is open to the user. <!-- BA-19 -->
- User clicks Skip on an optional step. <!-- BA-20 -->
  - Component marks the step as skipped and opens the next step. <!-- BA-21 -->
- User clicks Finish on the last step. <!-- BA-22 -->
  - Component asks the App whether the step is complete (optional). <!-- BA-23 -->
  - Component reports the completion to the App. <!-- BA-24 -->
  - Component disables Finish while a required step is not complete. <!-- BA-25 -->
- User clicks a step that is open to the user. <!-- BA-26 -->
  - Component opens the step. <!-- BA-27 -->
- Component marks a step it opens as in progress (optional, on by default). <!-- BA-28 -->
- Component reports every status it changes to the App. <!-- BA-29 -->

**Order of the steps**

- Consumer chooses steps in a fixed order (on by default). <!-- BA-30 -->
  - Component opens a step when the steps before it are complete. <!-- BA-31 -->
  - Consumer chooses the steps after which a step opens (optional). <!-- BA-32 -->
    - Component opens several steps at once when they wait for the same steps (parallel steps). <!-- BA-33 -->
    - Component exposes the steps a step waits for. <!-- BA-34 -->
- Consumer chooses steps open in any order (optional). <!-- BA-35 -->
- Consumer chooses informative steps without interaction (optional). <!-- BA-36 -->
- App changes the status of a step. <!-- BA-37 -->
- App opens a step. <!-- BA-38 -->
- App disables a step. <!-- BA-39 -->

**Content and buttons**

- Consumer chooses to display the content of each step (optional). <!-- BA-40 -->
  - Component displays only the content of the current step and keeps the others. <!-- BA-41 -->
  - Consumer chooses the content beside or below the steps, or under the current step (vertical). <!-- BA-42 -->
- Consumer enables the button bar with Back, Skip, Next and Finish (optional, on with the content). <!-- BA-43 -->
- Consumer adds the App's own buttons to the bar (optional). <!-- BA-44 -->
  - User clicks such a button. <!-- BA-45 -->
    - Component reports it to the App with the current step. <!-- BA-46 -->

**Look**

- Consumer chooses horizontal or vertical steps. <!-- BA-47 -->
- Consumer chooses a number, an icon or a dot as the marker. <!-- BA-48 -->
- Consumer chooses the label after the marker, below it, or hidden with a tooltip. <!-- BA-49 -->
- Consumer chooses lines between the steps (on by default). <!-- BA-50 -->
- Component displays a compact bar "Step 2 of 5" with a progress line instead of horizontal steps in a narrow space (optional, on by default). <!-- BA-51 -->

**Keyboard additions**

- User presses the arrow keys, Home or End on a step to move between the steps that are open. <!-- BA-52 -->

**Screen readers**

- Component exposes the steps as an ordered list, with the current step, the status and the steps a step waits for. <!-- BA-53 -->
- Component announces the new step after the User moves. <!-- BA-54 -->

**Tooltips**

- Consumer chooses how the step labels when `labelPlacement` is `HIDDEN` shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-55 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no (container: `getChildren()`) · Actions: yes (`actions`, `onAction`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderStepper, DEFAULT_STEPPER_CONFIG, STEPPER_TOOLTIP_MODES, STEPPER_ORIENTATIONS, STEPPER_MARKERS, STEPPER_LABEL_PLACEMENTS, STEPPER_NAVIGATIONS, STEPPER_CONTENT_POSITIONS, STEPPER_STATUSES } from './stepperIndex.js';

const stepper = renderStepper(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getCurrent()` | string \| null | Id of the current step (`null` when no step is open, e.g. informative steps without `current`). |
| `goTo(id)` | boolean | Opens a step without `canLeave`, without automatic status and without callbacks (also a step that waits for others). `false` for an unknown (`UNKNOWN_STEP`) or disabled step. |
| `getSteps()` | array | A copy of every step: `{ id, label, status, optional, disabled, available, complete, current }`, in display order. |
| `getStepStatus(id)` | string \| null | The step's status; `null` for an unknown id. |
| `setStepStatus(id, status)` | boolean | Sets a status from `statuses` (no callback); returns whether it changed. A status that is not in `statuses`: `INVALID_STATUS`, no change. A status other than `DONE` or `SKIPPED` makes a passed step incomplete again. |
| `setStepDisabled(id, disabled)` | boolean | Enables or disables a step; returns whether it changed. A disabled current step stays open until the user moves. |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables an application action; `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `getChildren()` | array | The instances returned by the content render functions, in step order (a Form finds fields through it). |
| `focus()` | boolean | Moves focus to the step button that takes Tab. |
| `destroy()` | — | Removes the listeners, the Buttons and the content, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root element id. |
| `steps` | array | `[]` | `{ id, label, description?, icon?, status?, optional?, disabled?, after?, content? }` | Always | Required, at least one valid step. Display order. Steps without `id` or `label` and duplicate ids are dropped. |
| `steps[].description` | string | `''` | Text | Always | A short line under the label. |
| `steps[].icon` | string | `''` | CSS class names | `ICON` | The marker of an `ICON` Stepper (the number when empty). |
| `steps[].status` | string | `'NOT_STARTED'` | One of `statuses` | Always | Start status (e.g. restored progress). `DONE` and `SKIPPED` make the step complete. |
| `steps[].optional` | boolean | `false` | — | Always | Shows "(Optional)"; the step can be skipped and does not block Finish. |
| `steps[].disabled` | boolean | `false` | — | Always | The step cannot be opened by the user. |
| `steps[].after` | array \| string | previous step | Step ids | `LINEAR` | The steps that must be complete before this one opens; `[]` opens it from the start. Unknown ids are dropped (`UNKNOWN_STEP`); circular rules are dropped (`CIRCULAR_AFTER`). |
| `steps[].content` | array \| string | `[]` | Static HTML strings or functions `(host, stepper) => instance \| null` | `showContent` | The step's content, rendered at start, one host per child. |
| `current` | string | first open step | A step id | Always | The step that starts open. `NONE`: the stage reached (no step is marked without it). |
| `ariaLabel` | string | `texts.stepper` | Text | Always | Name of the step list. |
| `orientation` | string | `'HORIZONTAL'` | `HORIZONTAL`, `VERTICAL` | Always | Direction of the steps. |
| `marker` | string | `'NUMBER'` | `NUMBER`, `ICON`, `DOT` | Always | What the circle shows; `DOT` shows no number and no status symbol. |
| `labelPlacement` | string | `'END'` | `END`, `BELOW`, `HIDDEN` | Always | `BELOW` only with `HORIZONTAL` (otherwise `END`, `OPTION_IGNORED`). `HIDDEN`: the label is the tooltip and stays for screen readers. |
| `connectors` | boolean | `true` | — | Always | Lines between the steps. |
| `statusText` | boolean | `false` | — | Always | Shows the status text (and "Available after: …") under the label; without it, the text is for screen readers only. |
| `compactWhenNarrow` | boolean | `true` | — | `HORIZONTAL` | Below a container width of 36rem, a compact bar "Step 2 of 5: Payment" with a progress line replaces the steps. |
| `navigation` | string | `'LINEAR'` | `LINEAR`, `FREE`, `NONE` | Always | `LINEAR`: a step opens when the steps it waits for are complete. `FREE`: every enabled step opens. `NONE`: the steps only inform (no buttons, no clicks, no callbacks). |
| `statuses` | array | all statuses | `NOT_STARTED`, `IN_PROGRESS`, `DONE`, `SKIPPED`, `WARNING`, `ERROR`, `BLOCKED`, `CANCELLED` | Always | The statuses this Stepper uses; `NOT_STARTED` is always included. Automatic statuses are set only when listed. |
| `autoStatus` | boolean | `true` | — | Not `NONE` | Next and Finish mark the step `DONE`, Skip `SKIPPED`, a step the user opens `IN_PROGRESS` (when it was `NOT_STARTED`). |
| `showContent` | boolean | `false` | — | Not `NONE` | Renders each step's `content` and shows the current one. |
| `contentPosition` | string | `'SEPARATE'` | `SEPARATE`, `INLINE` | `showContent` + `VERTICAL` | `SEPARATE`: one area beside the steps. `INLINE`: under the current step. `HORIZONTAL` always shows the content below the steps (`INLINE`: `OPTION_IGNORED`). |
| `showButtons` | boolean | value of `showContent` | — | Not `NONE` | The button bar: Back, the actions, Skip (optional steps), Next or Finish (on the last enabled step). |
| `actions` | array | `[]` | `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }` | `showButtons` | Application buttons in the bar after Back (guidelines §10.2); `TERTIARY` by default. Without `onAction` they are disabled (`ACTION_HANDLER_MISSING`). |
| `canLeave` | function | `null` | `(stepId, action, stepper) => boolean \| Promise<boolean>` | Not `NONE` | Asked before Next (`action` `'NEXT'`) and Finish (`'FINISH'`); `false` keeps the step open. A Promise makes the Stepper busy until it settles; a rejected Promise or an exception keeps the step open (`CAN_LEAVE_FAILED`). |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the step labels when `labelPlacement` is `HIDDEN` shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). With `TOOLTIP` it also applies to icon-only actions; with `TITLE` or `NONE` they show nothing (as before). |
| `texts.*` | object | English defaults | Text; `{index}`, `{count}`, `{label}`, `{steps}` placeholders | Always | `stepper`, `stepOf`, `announcement`, `optional`, `availableAfter`, `back`, `next`, `finish`, `skip`, `finishBlocked`, `checking` ("Checking the step…", the Loader's label), `statuses.{STATUS}`. |
| `onStepChange` | function | `null` | `(stepId, { previousId, reason }, stepper) => {}` | Not `NONE` | See Callbacks. |
| `onStatusChange` | function | `null` | `(stepId, status, stepper) => {}` | Not `NONE` | See Callbacks. |
| `onFinish` | function | `null` | `(stepper) => {}` | Not `NONE` | See Callbacks. |
| `onAction` | function | `null` | `(key, step, stepper) => {}` | `actions` | See Callbacks. |

Next opens the first open step after the current one that follows from it or is still to do (complete parallel steps are passed over), otherwise the first open step before it that is still to do. Back opens the nearest open step before the current one. Finish replaces Next on the last enabled step and is disabled (with the description `texts.finishBlocked`) while a required, enabled step other than the current one is not complete. A step is complete when the user passed it with Next, Finish or Skip, or when its status is `DONE` or `SKIPPED`. The bar's Buttons are size `MEDIUM`, like Form's, because they finish a page-level task. With `canLeave`, a Loader line appears just above the bar while a Promise from `canLeave` is pending longer than 0.4 s. Options that do not apply are ignored with `OPTION_IGNORED`.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onStepChange` | `(stepId, { previousId, reason }, stepper)` | The user opens another step; `reason` is `'NEXT'`, `'BACK'`, `'SKIP'` or `'SELECT'` (a click on a step). Runs after `onStatusChange`. | `goTo()`; refused `canLeave`; busy Stepper. |
| `onStatusChange` | `(stepId, status, stepper)` | A user action changes a status automatically (`autoStatus`): `DONE` (Next, Finish), `SKIPPED` (Skip), `IN_PROGRESS` (a step the user opens). | `setStepStatus()`; statuses not in `statuses`. |
| `onFinish` | `(stepper)` | The user presses Finish and `canLeave` agrees (after the step is marked `DONE`). | Finish disabled; refused `canLeave`. |
| `onAction` | `(key, step, stepper)` | An application action is pressed; `step` as an entry of `getSteps()` (the current step). | Disabled actions; busy Stepper. |
| `canLeave` | `(stepId, action, stepper)` | Before Next and Finish (configuration function, not a report). | Back, Skip, clicks on steps, `goTo()`. |

### Errors

Stepper has no user-facing errors: checking a step is the application's job. Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `Stepper "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `STEPS_REQUIRED` | error | `steps` is missing, empty, or has no valid step. |
| `INVALID_OPTION` | warning | Invalid enumerated value, or `statuses` that is not an array; the default is used. |
| `UNKNOWN_STATUS` | warning | A `statuses` entry that is not a status; dropped. |
| `OPTION_IGNORED` | warning | An option that does not apply (see Applies when), `BELOW` or `INLINE` with the other orientation, `after` without `LINEAR`, `content` without `showContent`. |
| `INVALID_ICON_CLASS` | warning | Invalid class names removed from an icon option. |
| `INVALID_STEP` | warning | A step without `id` or `label`; dropped. |
| `DUPLICATE_STEP_ID` | warning | A repeated step id; the later step is dropped. |
| `UNKNOWN_STEP` | warning | An id in `after`, `current`, `goTo()` or another method that is not a step. |
| `INVALID_STATUS` | warning | A status that is not in `statuses` (`steps[].status`: `NOT_STARTED` is used; `setStepStatus()`: no change). |
| `CIRCULAR_AFTER` | warning | `after` rules that lead back to their step; the rule is dropped. |
| `INVALID_CHILD` | warning | Content that is neither a string nor a function; ignored. |
| `CAN_LEAVE_FAILED` | warning | `canLeave` threw or its Promise was rejected; the step stays open. |
| `INVALID_ACTION` | warning | An action without `key` or `label`; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A repeated action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` with an unknown key. |
| `ACTION_HANDLER_MISSING` | warning | `actions` without `onAction`; the action Buttons are rendered disabled. |

### Accessibility

- The steps are an ordered list named by `ariaLabel` (`texts.stepper`); the current step has `aria-current="step"`; each step button is named by its label, "(Optional)" and description, and described by its status and the steps it waits for ("Available after: Legal review").
- Steps that are not open are disabled buttons; one step button is in the Tab order (the current one); Left / Right (Up / Down when vertical, mirrored in right-to-left), Home and End move between the open steps.
- After a user move the new step is announced politely ("Step 2 of 4: Payment"); with content, focus moves to the step's panel (a region named by the step label).
- While `canLeave` answers, the Stepper sets `aria-busy` and ignores clicks; the Buttons keep their focus; after the Loader's delay a line appears above the bar and "Checking the step…" is announced.
- Status is shown by symbol and colour together, and by text for screen readers (or on screen with `statusText`); cancelled steps are also struck through.
- The compact bar keeps the step and the count as text; the progress line is decorative.
- Informative steps (`NONE`) are plain list entries, not buttons.

### Examples

Checkout wizard with content, a server check before Payment is left, and Finish:

```js
const checkout = renderStepper(host,
{
    id:'checkout', showContent:true,
    steps:
    [
        { id:'cart', label:'Cart', content:[ h => renderCart(h) ] },
        { id:'address', label:'Address', content:[ h => ( fields.address = renderTextInput(h,{ id:'street', name:'street', label:'Street' }) ) ] },
        { id:'gift', label:'Gift wrap', optional:true, content:[ '<p>Choose paper and card.</p>' ] },
        { id:'payment', label:'Payment', content:[ h => renderPayment(h) ] }
    ],
    canLeave:( stepId ) => ( stepId === 'address' ? fields.address.validate().valid : stepId === 'payment' ? api.checkCard().then(result => result.ok) : true ),
    onFinish:() => api.placeOrder(),
    texts:{ finish:'Place order' }
});
```

Approval with three reviews in any order after the request, and the sign-off after all of them:

```js
renderStepper(host,
{
    id:'approval', orientation:'VERTICAL', statusText:true, showButtons:true,
    statuses:[ 'IN_PROGRESS', 'DONE', 'ERROR' ],
    steps:
    [
        { id:'request', label:'Request' },
        { id:'legal', label:'Legal review', after:[ 'request' ] },
        { id:'finance', label:'Finance review', after:[ 'request' ] },
        { id:'security', label:'Security review', after:[ 'request' ], optional:true },
        { id:'signoff', label:'Sign-off', after:[ 'legal', 'finance', 'security' ] }
    ],
    onStatusChange:( stepId, status ) => api.saveProgress(stepId,status)
});
```

Order tracking (informative):

```js
const tracking = renderStepper(host,
{
    id:'order-1042', navigation:'NONE', marker:'ICON', statusText:true, current:'shipped',
    statuses:[ 'DONE', 'WARNING' ],
    steps:
    [
        { id:'ordered', label:'Ordered', icon:'fa-solid fa-receipt', status:'DONE' },
        { id:'shipped', label:'Shipped', icon:'fa-solid fa-truck', description:'Delayed at the depot', status:'WARNING' },
        { id:'delivered', label:'Delivered', icon:'fa-solid fa-house' }
    ]
});
tracking.setStepStatus('shipped','DONE'); tracking.goTo('delivered');
```

### Files

| File | Responsibility |
| --- | --- |
| `stepperIndex.js` | Public entry point; the only import surface. |
| `stepperConfig.js` | Defaults, allowed values, normalization of the configuration, steps, statuses and actions, developer validation. |
| `stepperComponent.js` | Lifecycle, moving between steps, `canLeave` (with the Loader line), automatic statuses, content, Buttons, focus and announcements, runtime API. |
| `stepperState.js` | Current step, statuses, disabled and passed steps; which steps are open, where Next and Back lead, whether Finish is allowed; circular rules. |
| `stepperHTML.js` | Step list, markers, compact bar, panels, button bar and the Loader host. |
| `stepperEvents.js` | Clicks on steps and arrow keys between them. |
| `stepperErrors.js` | Developer error and warning catalog. |
| `stepper.css` | Presentation of the steps, markers, lines, compact bar, content and button bar. |
| `stepperTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/stepper.test.mjs`). |
