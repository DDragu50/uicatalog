# Toggle

## For business

### Overview

Toggle captures one yes/no decision. It comes in two forms: a **switch** (a slider that is on or off, typical for settings that take effect immediately) and a **pair of radio buttons** (e.g. "Yes" / "No", typical for questions that need an explicit answer).

### When to use

- Use the switch for a setting that takes effect immediately, e.g. "Email notifications".
- Use the pair of radio buttons for a yes/no question that needs an explicit answer, e.g. in a form.
- Use CheckboxRadio for more than two options, and a one-option checkbox for consent ("I accept the terms").

### Key features

- Two forms: a switch (always on or off) or a pair of radio buttons ("Yes" / "No").
- Custom value texts, e.g. "Active" / "Inactive", shown as the current value or both values around the switch.
- A busy state while the application saves an immediate change, and a way back when saving fails.
- On and off colours from the design system, two sizes.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours (including the switch tokens), spacing and typography. |
| Toggle styles (`toggle.css`) | Always | Switch and layout. |

### Not included

The application saves immediate changes, shows save errors and reverts the switch when saving fails, explains the asterisk, and shows the form's error summary.

## For designers

### Structure

```text
SWITCH
div.ui-toggle.ui-toggle-switch.ui-toggle-size-{small|medium}[.ui-toggle-display-both][.ui-toggle-busy]
├── label.ui-toggle-label
├── div.ui-toggle-row
│   ├── span.ui-toggle-side.ui-toggle-side-off                      (BOTH; aria-hidden, clickable)
│   ├── span.ui-toggle-control
│   │   ├── input.ui-toggle-input  type="checkbox" role="switch"   (native, transparent, on top of the track)
│   │   └── span.ui-toggle-track > span.ui-toggle-knob             (aria-hidden)
│   ├── span.ui-toggle-side.ui-toggle-side-on                       (BOTH; aria-hidden, clickable)
│   └── span.ui-toggle-state                                        (CURRENT; aria-hidden; not with NONE)
└── div.ui-toggle-help                                              (optional)

RADIO
fieldset.ui-toggle.ui-toggle-radio.ui-toggle-{horizontal|vertical}[.ui-toggle-invalid]  role="radiogroup"
├── legend.ui-toggle-label  (+ span.ui-toggle-optional | span.ui-toggle-mandatory)
├── div.ui-toggle-options
│   └── label.ui-toggle-option > input.ui-toggle-radio-input type="radio" + span.ui-toggle-option-label   (×2)
├── div.ui-toggle-help                                              (optional)
└── div.ui-toggle-error                                             (hidden when there is no error)

VIEW
div.ui-toggle.ui-toggle-view > p.ui-toggle-label + p.ui-toggle-view-value
```

The track colour changes between the local properties `--ui-toggle-off-bg` and `--ui-toggle-on-bg` (mapped to `--toggle-track-off-bg` / `--toggle-track-on-bg` or to the tokens configured per instance) and the knob moves from start to end (logical properties, so it mirrors in right-to-left languages). Keyboard focus draws the focus outline around the track; disabled reduces its opacity. While busy, the knob becomes a spinner (static with reduced motion). With both values visible, "Off" is placed before and "On" after the switch, so the knob moves toward the active value (mirrored in right-to-left languages); the active value is bold in the text colour, the other muted. Radio buttons use native rendering; a shown error colours the question.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-toggle-label-top`, `ui-toggle-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Presentation | Switch, radio buttons | `ui-toggle-switch`, `ui-toggle-radio` |
| Size (switch) | Small, medium | `ui-toggle-size-small`, `ui-toggle-size-medium` |
| State text | None, On/Off, custom | no state text, or its text |
| State display (switch) | Current value, both values | `span.ui-toggle-state`, `ui-toggle-display-both` + `span.ui-toggle-side-*` |
| Track colours (switch) | Design tokens | `--ui-toggle-on-bg`, `--ui-toggle-off-bg` (inline) |
| Direction (radio) | Horizontal, vertical | `ui-toggle-horizontal`, `ui-toggle-vertical` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Value | Off, on | `input:not(:checked)`, `input:checked` |
| Busy (switch) | On | `ui-toggle-busy` |

### Styling contract

`toggle.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-toggle-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, view value, state, side (on + display both + checked, off + display both), option
  - `--c-muted`: optional, help, label (disabled), mandatory (disabled), side
  - `--c-danger-text`: mandatory, error, label (invalid)
  - `--toggle-knob-bg`: knob
  - `--c-border`: knob (busy)
  - `--c-accent`: knob (busy)
- Typography
  - `--font-ui`: toggle
  - `--fw-ui`: toggle, optional
  - `--fs-label`: label, help, error
  - `--fw-ui-strong`: label, error, side (on + display both + checked, off + display both)
  - `--lh-compact`: label
  - `--lh-body`: help, error
  - `--fs-control`: view value, state, side, option
- Borders and corners
  - `--radius-pill`: track, knob
  - `--border-thick`: knob (busy)
- Shadows
  - `--shadow-sm`: knob
- States and motion
  - `--transition-1`: track, knob
  - `--opacity-disabled`: track (disabled), side (display both + disabled), option (disabled)
  - `--spinner-duration`: knob (busy)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thick`: knob (also checked)
- Spacing
  - `--gap-tight`: toggle, options (vertical)
  - `--gap-section`: toggle
  - `--gap-inline-items`: row, option
  - `--gap-toolbar`: options
- Sizes
  - `--toggle-track-width`: toggle (size medium)
  - `--toggle-track-height`: toggle (size medium)
  - `--toggle-track-width-small`: toggle (size small)
  - `--toggle-track-height-small`: toggle (size small)
  - `--ui-toggle-height` (defined in this stylesheet): knob (also checked)
  - `--ui-toggle-width` (defined in this stylesheet): knob (checked)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: track (focus)
  - `--focus-offset`: track (focus)
- Spacing
  - `--gap-toolbar`: toggle (label on the left)
- Sizes
  - `--ui-toggle-width` (defined in this stylesheet): control
  - `--ui-toggle-height` (defined in this stylesheet): control
  - `--form-label-width`: toggle (label on the left)

**Set by the component — don't change**

- Variables
  - `--ui-toggle-on-bg`, `--ui-toggle-off-bg`: track colours (from `onBackgroundToken`, `offBackgroundToken`)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--toggle-track-on-bg`, `--toggle-track-off-bg`: default track colours (`onBackgroundToken`, `offBackgroundToken`)

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `toggleIndex.js`.
- Use Toggle for every single yes/no decision; never build switches or yes/no radio pairs by hand.
- Use `presentation:'SWITCH'` for settings (always on or off) and `'RADIO'` for questions that need an explicit answer (value `null` until answered).
- For immediate-effect switches: in `onValueChange`, call `setBusy(true)`, save, then `setBusy(false)`; on failure call `setValue(previousValue)` (no `onValueChange`) and show the error in the page.
- RADIO questions are mandatory by default; set `mandatory:false` explicitly. On submit call `validate()` and use `getError()`/`focus()` in the error summary.
- Choose the texts with `stateText` (`ON_OFF`, `CUSTOM` with `texts.customOn`/`texts.customOff` — e.g. "Yes"/"No" —, or `NONE` for switches) and translate through `texts`. Use `stateDisplay:'BOTH'` to show both values around the switch.
- Change track colours only through `onBackgroundToken`/`offBackgroundToken` with design-token names; keep enough contrast against the surface.
- Give each toggle a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove `role="switch"`, the label association or the radio group's legend.
- Never signal the state by colour alone; keep the knob movement (and state text when the label does not make the state obvious). Never pass literal colours.
- Never leave a switch showing a value that failed to save: revert it with `setValue()`.

### Example prompts

```text
Add a switch "Email notifications" to the settings page that saves immediately through the API, shows the busy state while saving and switches back with an error message if the save fails.
```

```text
Add a mandatory Yes/No question "Do you have a company car?" as two radio buttons marked with an asterisk, and validate it on submit.
```

## For developers

### Business analysis

> **Component**: the Toggle itself. **Consumer**: the developer who configures the Toggle in the application's code. **App**: the running application that uses the Toggle; it provides the data, performs the actions and stores the changes.

**Switch**

- User clicks the switch, or presses Space. <!-- BA-01 -->
  - Component changes the switch to on or off. <!-- BA-02 -->
  - Component reports the new value to the App. <!-- BA-03 -->
- Component displays the state by the knob position and colour, and by a text (optional): "On" / "Off" or a pair chosen by the Consumer, e.g. "Yes" / "No". <!-- BA-04 -->
- Consumer chooses the current value only, or both values around the switch ("Off – switch – On", the active one emphasized). <!-- BA-05 -->
  - User clicks a value. <!-- BA-06 -->
  - Component selects it. <!-- BA-07 -->
- Consumer chooses the on and off colours from the design system, and one of two sizes. <!-- BA-08 -->

**Saving immediate changes**

- App marks the switch as busy while it saves. <!-- BA-09 -->
  - Component prevents another change until the App ends the busy state. <!-- BA-10 -->
- App changes the switch back when saving fails. <!-- BA-11 -->

**Radio buttons**

- Component displays two radio buttons side by side or stacked, labelled "On" / "Off" or a pair chosen by the Consumer. <!-- BA-12 -->
- Component selects nothing until the user or the App sets an answer. <!-- BA-13 -->
- Component checks that a required question has an answer. <!-- BA-14 -->
  - Component displays the error message until the user chooses an answer. <!-- BA-15 -->

**Read-only display**

- Component displays the value as text, e.g. "On", or "—" when there is no answer. <!-- BA-16 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderToggle, DEFAULT_TOGGLE_CONFIG, TOGGLE_PRESENTATIONS, TOGGLE_STATES, TOGGLE_STATE_TEXTS, TOGGLE_STATE_DISPLAYS, TOGGLE_SIZES, TOGGLE_DIRECTIONS, TOGGLE_MANDATORY_INDICATORS } from './toggleIndex.js';

const toggle = renderToggle(container, config, onValueChange, onValidation); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The configuration is immutable; `config.value` remains the initial value.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible label; Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `setError(message)` | `{ valid, errorLabel }` | Shows an external error (server or cross-field rule, label `EXTERNAL`) until the user changes the value or `clearError()` is called; own validation errors take precedence. |
| `clearError()` | — | Removes an external error; own validation errors stay. |
| `getValue()` | boolean \| null | `true`, `false`, or `null` (radio unanswered). |
| `getError()` | object \| null | Copy of the current error (radio `REQUIRED` only). |
| `setValue(value)` | `{ valid, errorLabel }` | Sets the value programmatically (`null` only for radio); no dirty flag, no `onValueChange`. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: sets the value without validating, removes any shown error and the changed state. |
| `validate()` | `{ valid, errorLabel }` | Radio: shows or clears the required error. Switch: always valid. |
| `isDirty()` | boolean | Whether the user has changed the value. |
| `focus()` | boolean | Moves focus to the switch, or to the chosen (else first) radio. |
| `setBusy(busy)` | — | Switch: shows the busy state, sets `aria-busy` and blocks toggling. |
| `destroy()` | — | Removes listeners, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the switch input or of the radio group. |
| `name` | string | value of `id` | Text | Always | Native `name`. |
| `label` | string | — | Text | Always | Required. Switch label or question (radio group label). |
| `help` | string | `''` | Text | Always | Help text, linked through `aria-describedby`. |
| `presentation` | string | `'SWITCH'` | `SWITCH`, `RADIO` | Always | Switch or two radio buttons. |
| `state` | string | `'EDIT'` | `EDIT`, `VIEW`, `INACTIVE`, `INVISIBLE` | Always | Display mode. |
| `value` | boolean \| null | `false` (switch), `null` (radio) | `true`, `false`; `null` only for radio | Always | Initial value. |
| `stateText` | string | `'ON_OFF'` | `NONE`, `ON_OFF`, `CUSTOM` | Always | Switch state text or radio labels; `NONE` only for switches. |
| `stateDisplay` | string | `'CURRENT'` | `CURRENT`, `BOTH` | `SWITCH` + not `stateText:NONE` | `CURRENT`: the current value next to the switch. `BOTH`: off value before, on value after the switch; both clickable. |
| `onBackgroundToken` / `offBackgroundToken` | string | `'--toggle-track-on-bg'` / `'--toggle-track-off-bg'` | Design-token name | `SWITCH` | Track colours when on / off. |
| `size` | string | `'MEDIUM'` | `SMALL`, `MEDIUM` | `SWITCH` | Switch size. |
| `direction` | string | `'HORIZONTAL'` | `HORIZONTAL`, `VERTICAL` | `RADIO` | Radio arrangement. |
| `mandatory` | boolean | `true` | — | `RADIO` | `true`: unanswered is a `REQUIRED` error. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `RADIO` | Marker next to the question. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `autoFocus` | boolean | `false` | — | `EDIT` | Focuses the control once, after the first render. |
| `texts.on` / `texts.off` | string | `'On'` / `'Off'` | Text | `stateText:ON_OFF`, `VIEW` | State texts (in `VIEW` also with `NONE`). |
| `texts.customOn` / `texts.customOff` | string | `''` | Text, both required | `CUSTOM` | Custom pair; missing texts fall back with `CUSTOM_TEXTS_MISSING`. |
| `texts.optional` | string | `'(Optional)'` | Text | `RADIO`, `mandatory:false` + `OPTIONAL_TEXT` | Optional marker. |
| `texts.unanswered` | string | `'—'` | Text | `VIEW` | Shown for `null`. |
| `texts.errors.REQUIRED` | string | `'Select an answer.'` | Text | `RADIO` + `mandatory` | Required message. |

`mandatory`, `mandatoryIndicator` and `direction` with a switch; `size`, `stateDisplay` and the colour tokens with radios; `stateText:'NONE'` with radios and `stateDisplay:'BOTH'` with `stateText:'NONE'` are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)`, `value` `true` / `false` | The user flips the switch (also by clicking a visible value) or picks an answer. | `setValue()`, clicks while busy, clicking the already active value, initial render. |
| `onValidation` | `(result, instance)` with `result = { valid, errorLabel }` | The effective result changes (radio answered, `validate()`, `setValue()`). | The result is unchanged; switches (always valid) after the first report. |

### Errors

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `REQUIRED` | Select an answer. | Mandatory radio unanswered; shown on `validate()`, `setValue()`, or when the user leaves the question after changing it; cleared as soon as an answer is chosen. | Corrective |
| `UNIDENTIFIED` | An unidentified error occurred. | Unknown error label. | Dismissible |

Developer errors prevent rendering (`renderToggle()` returns `null`); warnings are logged and rendering continues. Console format: `Toggle "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `INVALID_OPTION` | warning | Invalid enumerated value, token name, `value` or `setValue()` argument. |
| `OPTION_IGNORED` | warning | Option that does not apply to the presentation. |
| `CUSTOM_TEXTS_MISSING` | warning | `stateText:'CUSTOM'` without both custom texts. |

### Accessibility

- Switch: native `input type="checkbox"` with `role="switch"` (announced as "switch, on/off"), label linked with `for`, Space toggles; the visual track and state texts (also the clickable values of `BOTH`, a pointer convenience) are `aria-hidden` so the state is not read twice; `aria-busy` while saving.
- Radio: native radios in a `fieldset` with `role="radiogroup"` named by the question (legend), `aria-required` when mandatory; help and a visible error are linked to the radios through `aria-describedby` with `aria-invalid`.
- State is shown by knob position and colour (and optional text), never colour alone; the off track meets 3:1 contrast against the surface.
- Errors are not announced by the field; the consumer's error summary does that.

### Examples

Immediate-effect setting with busy state and revert on failure:

```js
renderToggle(settingHost,{ id:'email-notifications', label:'Email notifications', value:user.emailNotifications },async ( value, toggle ) =>
{
    toggle.setBusy(true);
    try { await saveSetting('emailNotifications',value); }
    catch { toggle.setValue(!value); showPageError('The setting could not be saved.'); }
    finally { toggle.setBusy(false); }
});
```

Mandatory question validated on submit:

```js
const companyCar = renderToggle(questionHost,{ id:'company-car', label:'Do you have a company car?', presentation:'RADIO', stateText:'CUSTOM', texts:{ customOn:'Yes', customOff:'No' }, mandatoryIndicator:'MANDATORY_ASTERISK' });
form.addEventListener('submit',event => { if ( !companyCar.validate().valid ) { event.preventDefault(); showErrorSummary([ { message:companyCar.getError().message, focus:companyCar.focus } ]); } });
```

### Files

| File | Responsibility |
| --- | --- |
| `toggleIndex.js` | Public entry point; the only import surface. |
| `toggleConfig.js` | Defaults, allowed values, state texts, normalization, developer validation. |
| `toggleComponent.js` | Lifecycle, switch behaviour and busy state, radio error lifecycle, runtime API. |
| `toggleHTML.js` | Switch, radio and view markup. |
| `toggleEvents.js` | Switch change, busy guard and value clicks; radio change and focus leave. |
| `toggleState.js` | Per-instance runtime state (value, dirty, busy, error). |
| `toggleErrors.js` | User error catalog and developer error and warning catalog. |
| `toggle.css` | Presentation. |
| `toggleTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/toggle.test.mjs`). |
