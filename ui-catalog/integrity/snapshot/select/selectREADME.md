# Select

## For business

### Overview

Select lets a user choose one option, or several, from a predefined list: a country, a role, product colours. It comes in two looks: the browser's standard dropdown (the default, simplest and best on phones) and a custom list whose colours follow the design and which can include a search field.

### When to use

- Use it for one or several choices from a list that is too long to show at once: a country, a role, product colours.
- Use CheckboxRadio when the list is short and the options are better visible all the time.
- Use SearchBox for searching data, and TreeView for choices organised in levels.

### Key features

- Single or multiple choice, with options grouped under headings.
- The browser's standard dropdown (default, best on phones) or a custom list in the design's colours.
- An optional search field in the custom list that ignores case and accents ("sao" finds "São Tomé").
- Chosen options summarised in the closed field: "Red, Green, Blue +2".
- The device's own picker on phones and tablets (on by default).

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors (including the option highlight tokens), spacing and typography. |
| Select styles (`select.css`) | Always | Field and list appearance. |

### Not included

The application provides the options, business rules (e.g. "at most three colours"), the explanation of the asterisk, the form's error summary and translations. Loading options from a server, creating new options and minimum/maximum numbers of choices are not part of this version.

## For designers

### Structure

```text
div.ui-select-wrapper.ui-select-width-{width}.ui-select-{native|custom}
├── label.ui-select-label (native)  or  span.ui-select-label (custom)
│   └── span.ui-select-optional  or  span.ui-select-mandatory     (mandatory indicator)
├── NATIVE: div.ui-select-control
│   ├── select.ui-select-native-field[.ui-select-native-multiple]  (placeholder option for single; optgroup for groups)
│   └── span.ui-select-chevron                                      (single only)
├── CUSTOM: button.ui-select-trigger  role="combobox"
│   ├── span.ui-select-value[.ui-select-placeholder] + span.ui-select-more ("+2")   (aria-hidden)
│   ├── span.ui-select-visually-hidden                              (full value for screen readers)
│   └── span.ui-select-chevron
│   div.ui-select-popup  popover (top layer)
│   ├── input.ui-select-search                                      (searchable)
│   ├── div.ui-select-listbox  role="listbox"
│   │   ├── div.ui-select-option.ui-select-option-clear             (non-mandatory single)
│   │   └── div.ui-select-group > div.ui-select-group-label + div.ui-select-option[.ui-select-option-active]
│   │       └── span.ui-select-check + span.ui-select-option-label
│   └── div.ui-select-no-matches
├── div.ui-select-help                                              (help; native multiple hint)
└── div.ui-select-error                                             (hidden when there is no error)
```

View state renders `p.ui-select-label` and `p.ui-select-view-value` (labels joined by commas); hidden state renders nothing. Option colours come from four local properties mapped to design tokens (defaults below); the popover's position and height are set by the component (`--ui-select-popup-*`), capped by `--size-md-3`. Native selects use the browser's own option rendering: their option colours cannot be customised.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-select-label-top`, `ui-select-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Presentation | Native, custom | `ui-select-native`, `ui-select-custom` |
| Width | Small, medium, large, full | `ui-select-width-small`, `-medium`, `-large`, `-full` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Option under pointer or keyboard (custom) | Hover colours, outline for keyboard | `:hover`, `.ui-select-option-active` → `--ui-select-hover-bg`, `--ui-select-hover-color` |
| Chosen option (custom) | Selected colours, check mark | `[aria-selected="true"]` → `--ui-select-selected-bg`, `--ui-select-selected-color` |
| Unavailable option | Reduced opacity | `[aria-disabled="true"]` (custom), `option[disabled]` (native) |
| Error | Shown | `[aria-invalid="true"]` on the select or trigger, visible `.ui-select-error` |

### Styling contract

`select.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-select-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`.

The disabled rules use `:disabled`, so they also apply inside a disabled `fieldset`; the label and `*` of a disabled field use `--c-muted`.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, view value, native field, trigger, popup, search
  - `--c-muted`: optional, help, native field (disabled), trigger (disabled), label (disabled), mandatory (disabled), chevron, placeholder, more, group label, option (clear), no matches
  - `--c-danger-text`: mandatory, error
  - `--c-border`: native field, trigger, popup, search
  - `--c-surface`: native field, trigger, popup, search
  - `--c-accent`: native field (focus), trigger (focus)
  - `--c-danger`: native field (invalid), trigger (invalid)
  - `--c-surface-muted`: native field (disabled), trigger (disabled)
- Typography
  - `--font-ui`: select, popup
  - `--fw-ui`: select, popup, optional
  - `--fs-label`: label, optional, help, error, group label, no matches
  - `--fw-ui-strong`: label, mandatory, error, more, group label
  - `--lh-compact`: label
  - `--lh-body`: help, error
  - `--fs-control`: view value, native field, trigger, search, option
  - `--font-italic`: option (clear)
- Borders and corners
  - `--border-thin`: native field, trigger, popup, search
  - `--border-thick`: chevron, check (selected)
  - `--radius-control`: popup
  - `--radius-control-small`: option
- Shadows
  - `--shadow-md`: popup
- States and motion
  - `--transition-1`: native field, trigger
  - `--opacity-disabled`: option (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: select, trigger, popup (also open), group label, option, no matches
  - `--gap-section`: select
  - `--gap-inline-items`: label, native field, trigger, chevron, group label, option, check, no matches
  - `--padding-control`: native field, trigger, search
  - `--gap-toolbar`: check
- Sizes
  - `--control-height`: native field, trigger, search
  - `--size-md-3`: popup
  - `--percentage-s`: select (width small)
  - `--percentage-m`: select (width medium)
  - `--percentage-l`: select (width large)
  - `--percentage-full`: select (width full)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thin`: option (active)
- States and motion
  - `--focus-outline`: native field (focus), trigger (focus), search (focus), option (active)
  - `--focus-offset`: native field (focus), trigger (focus), search (focus)
- Spacing
  - `--gap-toolbar`: select (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
- Sizes
  - `--percentage-full`: select (also label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--ui-select-popup-limit` (defined in this stylesheet; the component reads it): popup
  - `--form-label-width`: select (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--percentage-s`: select (label on the left + width small)
  - `--percentage-m`: select (label on the left + width medium)
  - `--percentage-l`: select (label on the left + width large)

**Set by the component — don't change**

- Variables
  - `--ui-select-hover-bg`, `--ui-select-hover-color`: colours of the option under the pointer (from `optionHoverBackgroundToken`, `optionHoverColorToken`)
  - `--ui-select-selected-bg`, `--ui-select-selected-color`: colours of the chosen option (from `optionSelectedBackgroundToken`, `optionSelectedColorToken`)
  - `--ui-select-popup-left`, `--ui-select-popup-top`, `--ui-select-popup-width`, `--ui-select-popup-max-height`: position and size of the list (measured)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--select-option-hover-bg`, `--select-option-hover-color`: default colours of the option under the pointer
  - `--select-option-selected-bg`, `--select-option-selected-color`: default colours of the chosen option

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `selectIndex.js`.
- Use Select for every dropdown or list choice; never write `select` markup, listboxes or popups by hand. For 2–5 always-visible options consider CheckboxRadio instead.
- The value is always an array: `[]`, `['RO']` or `['RED', 'BLUE']`, also for single choice.
- Keep `presentation:'NATIVE'` unless option colours or search are required; then use `'CUSTOM'`. A native multiple select is always an open list box on desktop; for a collapsed one-line field with several choices use `'CUSTOM'`.
- Change option colours only through the four `option…Token` options with design-token names (e.g. `optionSelectedBackgroundToken:'--c-accent'` with `optionSelectedColorToken:'--c-on-accent'`), and always change background and text together for contrast.
- Use `searchable:true` for long lists (roughly more than 10 options).
- Fields are mandatory by default; set `mandatory:false` explicitly, normally with `mandatoryIndicator:'OPTIONAL_TEXT'`.
- On submit, call `validate()`, build the error summary from `getError()` and let each link call `focus()`.
- Give each select a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never pass literal colours; only design-token names.
- Never pass HTML in labels or group names; they are displayed as text.
- Never remove `role`, `aria-expanded`, `aria-activedescendant`, `aria-selected` or the label association of the custom presentation.

### Example prompts

```text
Add a mandatory custom Select "Country" with the countries grouped by continent, searchable, marked with an asterisk, and validate it on submit.
```

```text
Add a multiple-choice custom Select "Colours" whose chosen options use the accent colour (accent background, on-accent text), and store the chosen values whenever they change.
```

## For developers

### Business analysis

> **Component**: the Select itself. **Consumer**: the developer who configures the Select in the application's code. **App**: the running application that uses the Select; it provides the data, performs the actions and stores the changes.

**Choice**

- Consumer provides the options, grouped under headings (optional), e.g. "Europe", "Americas". <!-- BA-01 -->
- Consumer chooses single choice or multiple choice. <!-- BA-02 -->
- Component displays "Select an option" while nothing is chosen. <!-- BA-03 -->
- User selects an option. <!-- BA-04 -->
  - Component reports the new value to the App. <!-- BA-05 -->
- User selects the empty option of a single choice that is not required. <!-- BA-06 -->
- Consumer disables single options (optional). <!-- BA-07 -->

**Standard look**

- Component displays the browser's own dropdown, or a list box for multiple choice. <!-- BA-08 -->
- Consumer provides a hint for multiple choice, e.g. "Hold Ctrl or Cmd to select several" (optional). <!-- BA-09 -->

**Custom look** (optional)

- User clicks the field. <!-- BA-10 -->
  - Component opens the list below the field, or above it when there is no room below. <!-- BA-11 -->
  - Component keeps the list visible over panels and scrolling areas. <!-- BA-12 -->
- Component displays the chosen options and the option under the mouse or the keyboard in design colours chosen by the Consumer. <!-- BA-13 -->
  - Component displays a check mark on chosen options and an outline on the keyboard position. <!-- BA-14 -->
- Component keeps the list open while the user chooses several options. <!-- BA-15 -->
- Component displays the chosen options in the closed field, shortened when space runs out, e.g. "Red, Green, Blue +2". <!-- BA-16 -->
- Consumer enables a search field at the top of the list (optional). <!-- BA-17 -->
  - User types in the search field. <!-- BA-18 -->
  - Component hides the options that do not match, ignoring upper and lower case and accents. <!-- BA-19 -->
  - Component displays "No matching options" when nothing matches. <!-- BA-20 -->
- User types the first letters of an option to move to it. <!-- BA-21 -->

**Phones and tablets**

- Component displays the device's own picker instead of the custom list (optional, on by default). <!-- BA-22 -->

**Required**

- Component checks that a required select has a value. <!-- BA-23 -->
  - Component displays the error message. <!-- BA-24 -->

**Display**

- Consumer chooses one of four widths. <!-- BA-25 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderSelect, DEFAULT_SELECT_CONFIG, SELECT_STATES, SELECT_WIDTHS, SELECT_SELECTION_MODES, SELECT_PRESENTATIONS, SELECT_TOUCH_PRESENTATIONS, SELECT_MANDATORY_INDICATORS } from './selectIndex.js';

const country = renderSelect(container, config, onValueChange, onValidation); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The configuration is immutable; the initial selection stays in `config.options[].selected`.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible label; Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `setError(message)` | `{ valid, errorLabel }` | Shows an external error (server or cross-field rule, label `EXTERNAL`) until the user changes the value or `clearError()` is called; own validation errors take precedence. |
| `clearError()` | — | Removes an external error; own validation errors stay. |
| `getValue()` | array | New array with the selected values, in option order. |
| `getError()` | object \| null | Copy of the current error `{ errorLabel, message, source, severity, visibility }`. |
| `setValue(values)` | `{ valid, errorLabel }` | Sets the selection (array or single value; `SINGLE` keeps the first; unknown values ignored with `UNKNOWN_VALUE`), runs final validation. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: sets the value without validating, removes any shown error and the changed state. |
| `validate()` | `{ valid, errorLabel }` | Runs final validation, shows or clears the error. |
| `isDirty()` | boolean | Whether the user has changed the selection. |
| `focus()` | boolean | Moves focus to the select or combobox; `false` in view, hidden or inactive state. |
| `destroy()` | — | Closes the list, removes listeners, observers and timers, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the select or trigger. |
| `name` | string | value of `id` | Text | `NATIVE` | Native `name`. |
| `label` | string | `''` | Text | Always | Visible label and accessible name. |
| `help` | string | `''` | Text | `EDIT`, `INACTIVE` | Help text, linked through `aria-describedby`. |
| `state` | string | `'EDIT'` | `EDIT`, `VIEW`, `INACTIVE`, `INVISIBLE` | Always | Display mode. |
| `width` | string | `'FULL'` | `SMALL`, `MEDIUM`, `LARGE`, `FULL` | Always | Field width. |
| `selectionMode` | string | `'SINGLE'` | `SINGLE`, `MULTIPLE` | Always | One or several choices. |
| `presentation` | string | `'NATIVE'` | `NATIVE`, `CUSTOM` | Always | Browser dropdown or custom list. |
| `touchPresentation` | string | `'NATIVE'` | `NATIVE`, `AS_CONFIGURED` | `CUSTOM` | On touch-first devices (`pointer: coarse`), `NATIVE` uses the device picker; custom colours and search then do not apply. |
| `options` | array | `[]` | `{ value, label, disabled?, selected? }` or `{ group, options:[…] }` | Always | Required, at least one option. Values unique (duplicates dropped with a warning); with `SINGLE`, at most one `selected:true`. |
| `mandatory` | boolean | `true` | — | Always | `true`: an empty selection is a `REQUIRED` error; sets `aria-required`. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `label` | Marker next to the label. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `searchable` | boolean | `false` | — | `CUSTOM` | Search field that filters options by label (case- and accent-insensitive). |
| `showMultipleHint` | boolean | `false` | — | `NATIVE` + `MULTIPLE` | Shows `texts.multipleHint` below the list box. |
| `autoFocus` | boolean | `false` | — | `EDIT` | Focuses the control once, after the first render. |
| `optionHoverBackgroundToken` / `optionHoverColorToken` | string | `'--select-option-hover-bg'` / `'--select-option-hover-color'` | Design-token name | `CUSTOM` | Colours of the option under the pointer or keyboard. |
| `optionSelectedBackgroundToken` / `optionSelectedColorToken` | string | `'--select-option-selected-bg'` / `'--select-option-selected-color'` | Design-token name | `CUSTOM` | Colours of chosen options. |
| `texts.placeholder` | string | `'Select an option'` | Text | Always | Shown while nothing is chosen. |
| `texts.optional` | string | `'(Optional)'` | Text | `mandatory:false` + `OPTIONAL_TEXT` | Optional marker. |
| `texts.clear` | string | `'Clear selection'` | Text | `CUSTOM` + `SINGLE` + not `mandatory` | Entry that empties the selection. |
| `texts.search` / `texts.noMatches` | string | `'Search options'` / `'No matching options'` | Text | `searchable` | Search field name and empty-result message. |
| `texts.more` | string | `'+{count}'` | Text with `{count}` | `CUSTOM` + `MULTIPLE` | Suffix for labels that do not fit in the closed field. |
| `texts.multipleHint` | string | `'Hold Ctrl or Cmd to select several.'` | Text | `showMultipleHint` | Native multiple hint. |
| `texts.errors.REQUIRED` | string | `'Select an option.'` | Text | `mandatory` | Required message. |

Native multiple selects are always-open list boxes on desktop (browsers cannot collapse them); use `CUSTOM` for a collapsed field. Custom-only options (`searchable`, `touchPresentation`, the colour tokens) with `NATIVE`, and `showMultipleHint` outside a native multiple select, are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(values, instance)`, `values` a new array | A user action changes the selection (native change, choosing or toggling in the custom list, the clear entry). | Initial render, `setValue()`, reopening or closing the list without a change. |
| `onValidation` | `(result, instance)` with `result = { valid, errorLabel }` | The effective validation result changes (user change, blur, `validate()`, `setValue()`). | The result is unchanged. |

### Errors

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `REQUIRED` | Select an option. | Empty selection with `mandatory:true`; shown on blur after a change, `validate()` or `setValue()`. | Corrective |
| `UNIDENTIFIED` | An unidentified error occurred. | Unknown error label. | Dismissible |

Developer errors prevent rendering (`renderSelect()` returns `null`); warnings are logged and rendering continues. Console format: `Select "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `OPTIONS_REQUIRED` | error | No options. |
| `OPTION_VALUE_REQUIRED` | error | An option without `value`. |
| `OPTION_LABEL_REQUIRED` | error | An option without `label`. |
| `MULTIPLE_INITIAL_SELECTION` | error | More than one `selected:true` with `SINGLE`. |
| `INVALID_OPTION` | warning | Invalid enumerated value or token name; the default is used. |
| `OPTION_IGNORED` | warning | Option that does not apply to the presentation or selection mode. |
| `DUPLICATE_OPTION_VALUE` | warning | Duplicate option value dropped. |
| `UNKNOWN_VALUE` | warning | `setValue()` received values that are not options; ignored. |

### Accessibility

- `NATIVE`: a real `select` with `label for`; the browser provides keyboard use and announcements.
- `CUSTOM`: the ARIA select-only combobox pattern — a `button role="combobox"` (with `aria-expanded`, `aria-controls`, `aria-activedescendant`) and a `role="listbox"` of `role="option"` items with `aria-selected`/`aria-disabled`; groups use `role="group"` named by their heading; `aria-multiselectable` for multiple choice. The closed field's full value is available to screen readers even when shortened visually.
- With search, focus moves to the search field (`role="combobox"`, `aria-autocomplete="list"`) while arrow keys move through the options; "No matching options" is announced once.
- Keyboard: arrows, Home/End, type-ahead, Enter/Space choose, Escape closes and returns focus, Tab closes and moves on. The active option has an outline besides its colour; chosen options have a check mark.
- Mandatory status via `aria-required`; errors linked through `aria-describedby` and `aria-invalid`, not announced by the field (the consumer's error summary does that).

### Examples

Searchable country select with groups, restored from saved data, validated on submit:

```js
const country = renderSelect(countryHost,
{
    id:'delivery-country',
    label:'Country',
    presentation:'CUSTOM',
    searchable:true,
    mandatoryIndicator:'MANDATORY_ASTERISK',
    options:[
        { group:'Europe', options:[ { value:'RO', label:'Romania' }, { value:'PT', label:'Portugal' } ] },
        { group:'Africa', options:[ { value:'ST', label:'São Tomé and Príncipe' } ] }
    ],
    texts:{ errors:{ REQUIRED:'Select the delivery country.' } }
},( values ) => { order.country = values[0] ?? null; });

country.setValue(savedOrder.country ? [ savedOrder.country ] : []);   // programmatic: no onValueChange

form.addEventListener('submit',event => { if ( !country.validate().valid ) { event.preventDefault(); showErrorSummary([ { message:country.getError().message, focus:country.focus } ]); } });
```

Custom colours for chosen options (background and text changed together):

```js
renderSelect(host,{ id:'colours', label:'Colours', selectionMode:'MULTIPLE', presentation:'CUSTOM', mandatory:false,
    optionSelectedBackgroundToken:'--c-accent', optionSelectedColorToken:'--c-on-accent',
    options:[ { value:'RED', label:'Red' }, { value:'BLUE', label:'Blue' }, { value:'GREEN', label:'Green' } ] });
```

### Files

| File | Responsibility |
| --- | --- |
| `selectIndex.js` | Public entry point; the only import surface. |
| `selectConfig.js` | Defaults, allowed values, option and group normalization, developer validation. |
| `selectComponent.js` | Lifecycle, selection, error lifecycle, custom listbox (open/close, positioning, keyboard, type-ahead, search), runtime API. |
| `selectHTML.js` | Native and custom markup (rendered once). |
| `selectEvents.js` | Native, custom and open-list listener registration. |
| `selectState.js` | Per-instance runtime state. |
| `selectValidation.js` | Required-selection rule. |
| `selectErrors.js` | User error catalog and developer error and warning catalog. |
| `select.css` | Presentation. |
| `selectTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/select.test.mjs`). |
