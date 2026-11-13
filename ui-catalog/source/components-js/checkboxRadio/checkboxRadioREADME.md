# CheckboxRadio

## For business

### Overview

CheckboxRadio shows a fixed list of options from which the user picks exactly one (radio buttons) or any number (checkboxes). The same list can look like standard controls, like icons or like selectable chips.

### When to use

- Use it for a choice from a short, fixed list that stays visible: one option (radio buttons) or several (checkboxes).
- Use the segmented look for two to five short options that switch a view or a period, e.g. "List | Grid".
- Use Select when the list is long or space is short, and Toggle for a single on/off setting.

### Key features

- Single choice (radio buttons) or multiple choice (checkboxes).
- Four looks: standard controls, icons, chips or a segmented control.
- Options listed vertically or side by side.
- Options that start selected, unavailable options, and a whole list that is unavailable.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing and typography. |
| CheckboxRadio styles (`checkboxRadio.css`) | Always | List appearance. |
| Chip component and `chip.css` | Chip look | Chip appearance. |
| Font Awesome icon library | Icon or chip look | Icon glyphs. Loaded by the application page. |

### Not included

The application provides the options, decides when the form is checked, stores the selection, applies business rules (e.g. "at least two topics"), explains the asterisk (e.g. "* Required field") and shows the form's error summary, which also announces errors to screen-reader users. Several checkboxes that must each be checked are separate lists.

## For designers

### Structure

```text
fieldset#{id}.ui-checkbox-radio.ui-checkbox-radio-{direction}.ui-checkbox-radio-presentation-{presentation}[.ui-checkbox-radio-invalid]
├── legend.ui-checkbox-radio-group-label                       (required when mandatory)
│   ├── span.ui-checkbox-radio-optional  or  span.ui-checkbox-radio-mandatory   (mandatory indicator)
│   └── span.ui-checkbox-radio-visually-hidden               (mandatory multiple choice: texts.mandatory)
├── div.ui-checkbox-radio-options
│   └── label.ui-checkbox-radio-option  data-selected         (one per option)
│       ├── input.ui-checkbox-radio-input  type=radio|checkbox (visually hidden for icon, chip and segmented looks)
│       ├── span.ui-checkbox-radio-icon.ui-checkbox-radio-icon-size-{size} > i   (icon look)
│       ├── span.ui-checkbox-radio-option-label               (native, icon and segmented looks)
│       └── span.ui-checkbox-radio-chip → Chip                (chip look)
├── div.ui-checkbox-radio-help                                (optional)
└── div.ui-checkbox-radio-error                               (hidden when there is no error; not a live region)
```

The native input stays in every look; icon, chip and segmented visuals follow its checked state. In the segmented look a thin frame joins the options, the lines between them are the frame's background showing through a 1-line gap, and the selected segment has the accent fill, the on-accent text colour and a bold label; focus is drawn inside the segment. Disabled uses native `disabled` on the input or on the `fieldset`, shown with reduced opacity; selected and disabled are independent. Focus is drawn on the option for icon and chip looks. Selected chips use the `--c-selected` background and a check icon; unselected chips use `--c-surface`.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-checkbox-radio-label-top`, `ui-checkbox-radio-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Direction | Vertical, horizontal | `ui-checkbox-radio-vertical`, `ui-checkbox-radio-horizontal` |
| Look | Native, icon, chip, segmented | `ui-checkbox-radio-presentation-native`, `-icon`, `-chip`, `-segmented` (always with `ui-checkbox-radio-horizontal`) |
| Icon size | Small, medium, large | `ui-checkbox-radio-icon-size-small`, `-medium`, `-large` |
| Icon style (unselected → selected) | Regular → regular, regular → solid | `fa-regular` / `fa-solid` on `fa-circle` → `fa-circle-check` (single) or `fa-square` → `fa-square-check` (multiple) |
| Mandatory indicator | None, optional text, mandatory asterisk | no element, `span.ui-checkbox-radio-optional` (non-mandatory lists), `span.ui-checkbox-radio-mandatory` (mandatory lists, `aria-hidden`) |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Validation error | Shown | `ui-checkbox-radio-invalid` |

### Styling contract

`checkboxRadio.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-checkbox-radio-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: checkbox radio, option (presentation segmented)
  - `--c-muted`: optional, group label (disabled), mandatory (disabled), help
  - `--c-danger-text`: mandatory, group label (invalid), error
  - `--c-accent`: icon (presentation icon + checked), option (presentation segmented + checked)
  - `--c-border`: options (presentation segmented)
  - `--c-surface`: option (presentation segmented)
  - `--c-surface-hover`: option (presentation segmented + hover)
  - `--c-on-accent`: option (presentation segmented + checked)
- Typography
  - `--font-ui`: checkbox radio
  - `--fw-ui`: checkbox radio, optional
  - `--fs-label`: group label, help, error
  - `--fw-ui-strong`: group label, option label (presentation segmented + checked), error
  - `--lh-compact`: group label
  - `--lh-body`: help, error
- Borders and corners
  - `--radius-control`: option (presentation icon + focus), options (presentation segmented)
  - `--tag-radius`: option (presentation chip + focus)
  - `--border-thin`: options (presentation segmented)
- States and motion
  - `--opacity-disabled`: option (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thin`: options (horizontal + presentation segmented)
- Spacing
  - `--gap-tight`: group label, options (vertical), help, error
  - `--gap-toolbar`: options (horizontal), option (presentation segmented)
  - `--gap-inline-items`: options (horizontal + presentation chip), option
- Sizes
  - `--control-height`: option (presentation segmented)
  - `--icon-size-small`: icon (size small)
  - `--icon-size-medium`: icon (size medium)
  - `--icon-size-large`: icon (size large)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thick`: option (presentation segmented + focus)
- States and motion
  - `--focus-outline`: option (presentation icon + focus, presentation chip + focus, presentation segmented + focus)
  - `--focus-offset`: option (presentation icon + focus, presentation chip + focus)
- Spacing
  - `--gap-toolbar`: checkbox radio (label on the left)
- Sizes
  - `--form-label-width`: checkbox radio (label on the left)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--c-selected`: chip look: background of a chosen option
  - `--c-surface`: chip look: background of the other options
  - `--c-text`: chip look: text

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `checkboxRadioIndex.js`.
- Check whether the configuration already provides the requested behavior before adding code.
- Never write radio/checkbox markup, icon toggling, chip visuals or error display by hand; use `renderCheckboxRadio()`.
- The value is always an array, also for single choice: `[]` or `['value']`. Never convert it to a scalar inside the component.
- Lists are mandatory by default (at least one option selected) and then need `groupLabel`. Set `mandatory:false` explicitly, normally together with `mandatoryIndicator:'OPTIONAL_TEXT'`. Rules such as "at least two" belong to the consuming code; checkboxes that must each be checked go in separate lists.
- Use the same `mandatoryIndicator` for every input of a form, and add the asterisk explanation when using `MANDATORY_ASTERISK`.
- On submit, call `validate()`, add failed lists to the form's error summary (message from `getError()`) and let each summary link call `focus()`.
- Use `onValueChange` to observe the selection; do not use it for validation.
- Choose the icon look with `iconVariant`; there is no separate selected/unselected style option.
- Keep business logic in the consuming code; do not modify component source for application-specific needs.
- Give each list a unique `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove the native inputs, `legend`, `aria-invalid` or `aria-describedby`; they provide semantics and keyboard support.
- Never make the error a live region (`role="alert"`, `aria-live`); announcing errors is the error summary's job.
- Never pass HTML in `label` or `groupLabel`; they are displayed as text.
- Without `groupLabel`, provide an accessible group name through the surrounding context (e.g. a labelled FieldGroup).

### Example prompts

```text
Add a mandatory single-choice "Payment method" with Card and Bank transfer as native radios, and a mandatory one-option checkbox "I accept the terms". Validate both on submit and list failures in the form's error summary.
```

```text
Show the newsletter topics News, Sports and Technology as horizontal chips with multiple choice, preselect News, and save the selected topics whenever the selection changes.
```

## For developers

### Business analysis

> **Component**: the CheckboxRadio itself. **Consumer**: the developer who configures the CheckboxRadio in the application's code. **App**: the running application that uses the CheckboxRadio; it provides the data, performs the actions and stores the changes.

**Choice**

- Consumer chooses single choice or multiple choice. <!-- BA-01 -->
- User clicks an option in a single-choice list. <!-- BA-02 -->
  - Component selects the option and clears the previous one. <!-- BA-03 -->
- User clicks an option in a multiple-choice list. <!-- BA-04 -->
  - Component selects or clears the option. <!-- BA-05 -->
- Component reports each change of the selection to the App. <!-- BA-06 -->

**Look**

- Consumer chooses one of four looks: standard controls, icons, chips or segmented. <!-- BA-07 -->
  - Component displays icons as circles for single choice and squares for multiple choice. <!-- BA-08 -->
  - Component displays a selected chip with a tinted background and a check mark. <!-- BA-09 -->
  - Component displays the segmented look as one row of joined buttons, the selected ones filled and in bold. <!-- BA-10 -->
- Consumer chooses the icon style, outline or filled when selected, and one of three icon sizes (icon look). <!-- BA-11 -->
- Consumer chooses a vertical list or options side by side (all looks except segmented). <!-- BA-12 -->
  - Component wraps side-by-side options when space runs out. <!-- BA-13 -->

**Options**

- Consumer provides the options and the options that start selected. <!-- BA-14 -->
- Consumer disables single options or the whole list (optional). <!-- BA-15 -->
  - Component keeps the selection of an unavailable option. <!-- BA-16 -->

**Required**

- Component checks that at least one option is selected in a required list. <!-- BA-17 -->
  - Component displays the group title in the error colour and the error message. <!-- BA-18 -->
  - Component clears the error when the user selects an option. <!-- BA-19 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderCheckboxRadio, DEFAULT_CHECKBOX_RADIO_CONFIG, CHECKBOX_RADIO_SELECTION_MODES, CHECKBOX_RADIO_PRESENTATIONS, CHECKBOX_RADIO_DIRECTIONS, CHECKBOX_RADIO_ICON_VARIANTS, CHECKBOX_RADIO_ICON_SIZES } from './checkboxRadioIndex.js';

const list = renderCheckboxRadio(container, config, onValueChange); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. No setters are provided: selection changes come from the user; for another configuration, destroy and render again.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible group label (`groupLabel`); Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `setError(message)` | `{ valid, errorLabel }` | Shows an external error (server or cross-field rule, label `EXTERNAL`) until the user changes the value or `clearError()` is called; own validation errors take precedence. |
| `clearError()` | — | Removes an external error; own validation errors stay. |
| `getValue()` | array | New array with the selected values, in option order. |
| `setValue(values, options?)` | object | Sets the selection programmatically (no `onValueChange`, not dirty) and returns `{ valid, errorLabel }`; `{ quiet:true }` (Form's quiet reset) skips validation and removes any shown error. |
| `isDirty()` | boolean | Whether the user has changed the selection. |
| `getError()` | object \| null | Copy of the current error `{ errorLabel, message, source, severity, visibility }`. |
| `validate()` | `{ valid, errorLabel }` | Runs the required-selection check, shows or clears the error. Always valid when `mandatory:false`. |
| `focus()` | boolean | Focuses the selected enabled option, else the first enabled one; `false` when all options are disabled. |
| `destroy()` | — | Removes the listener and clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. `fieldset` id and prefix of internal ids. |
| `name` | string | value of `id` | Text | Always | Native `name` shared by all inputs. |
| `groupLabel` | string | `''` | Text | Always | Group title (`legend`). Required when `mandatory:true` (`GROUP_LABEL_REQUIRED`); otherwise missing gives a `GROUP_LABEL_MISSING` warning. |
| `help` | string | `''` | Text | Always | Help text below the options, linked to the group and every input through `aria-describedby`. |
| `selectionMode` | string | `'MULTIPLE'` | `SINGLE`, `MULTIPLE` | Always | `SINGLE`: radios; `MULTIPLE`: checkboxes. |
| `presentation` | string | `'NATIVE'` | `NATIVE`, `ICON`, `CHIP`, `SEGMENTED` | Always | Look; never changes values, validation or callbacks. `SEGMENTED`: one row of joined segments, for a few short options (it does not wrap). |
| `direction` | string | `'VERTICAL'` | `VERTICAL`, `HORIZONTAL` | Not `SEGMENTED` | Option arrangement (`SEGMENTED` is always one row). |
| `iconVariant` | string | `'REGULAR_REGULAR'` | `REGULAR_REGULAR`, `REGULAR_SOLID` | `ICON` | Icon style unselected → selected. |
| `iconSize` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE` | `ICON` | Icon size (shared `--icon-size-*` tokens). |
| `options` | array | `[]` | Option objects (below) | Always | Required, at least one. |
| `options[].value` | string | — | Non-empty, unique | Always | Programmatic value. Duplicates are dropped (first kept) with a warning. |
| `options[].label` | string | — | Non-empty text | Always | Visible text and accessible name. |
| `options[].selected` | boolean | `false` | — | Always | Initial selection; at most one with `SINGLE`. |
| `options[].disabled` | boolean | `false` | — | Always | Option cannot be changed; keeps its selection. |
| `mandatory` | boolean | `true` | — | Always | `true`: at least one option must be selected. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `groupLabel` | `OPTIONAL_TEXT`: `texts.optional` next to non-mandatory lists (recommended with `mandatory:false`). `MANDATORY_ASTERISK`: `*` next to mandatory lists. `NONE`: no marker. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `texts.optional` | string | `'(Optional)'` | Text | `mandatory:false` + `OPTIONAL_TEXT` | Optional marker. |
| `texts.mandatory` | string | `'Mandatory'` | Text | `mandatory` + `MULTIPLE` | Visually hidden text in the legend (checkbox groups cannot use `aria-required`). |
| `texts.requiredSelection` | string | `'Select an option.'` | Text | `mandatory:true` | Message of `REQUIRED_SELECTION`. |
| `disabled` | boolean | `false` | — | Always | Disables all options (native `fieldset[disabled]`). |

`iconVariant` / `iconSize` without `ICON`, and `direction` with `SEGMENTED`, are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(values, instance)`, `values` a new array | A user action changes the selection. | Initial render, `validate()`, `destroy()`, clicks on disabled options. |

It fires after the visuals are updated and a corrected error is cleared.

### Errors

| Label | Trigger | Visibility | Clearing |
| --- | --- | --- | --- |
| `EXTERNAL` | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective | A user change of the value, or `clearError()`. |
| `REQUIRED_SELECTION` | `mandatory:true` with `[]`, on `validate()` or when the user leaves the list after changing it | Corrective: group label in error color, message shown, inputs get `aria-invalid` | A successful validation, or any user selection while visible. |

The error never appears on render, on focus, or when the user tabs through without changing anything, and is not announced by the component. Developer errors prevent rendering (`renderCheckboxRadio()` returns `null`); warnings are logged and rendering continues. Console format: `CheckboxRadio "id" [LABEL]: message`.

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
| `GROUP_LABEL_REQUIRED` | error | `mandatory:true` without `groupLabel`. |
| `INVALID_OPTION` | warning | Invalid enumerated value; the default is used. |
| `DUPLICATE_OPTION_VALUE` | warning | Duplicate option value dropped. |
| `GROUP_LABEL_MISSING` | warning | `mandatory:false` without `groupLabel`. |
| `OPTION_IGNORED` | warning | `iconVariant` or `iconSize` without the icon look. |

### Accessibility

- Native radios and checkboxes in every look: keyboard behavior (Tab, arrow keys between radios, Space) and screen-reader semantics come from the browser.
- The group is a `fieldset` named by the `legend` (`aria-labelledby`); single choice uses `role="radiogroup"`. Mandatory status is announced by `aria-required="true"` (single choice) or by the visually hidden `texts.mandatory` in the legend (multiple choice); the asterisk is `aria-hidden`. Native `required` is not used.
- Each option is a `label` wrapping its input. Icons are `aria-hidden`; selection is shown by shape (check mark), not by color alone.
- The help text is linked to the group and every input through `aria-describedby`; a visible error is added to that reference and read when the user reaches the list; it is not a live region. The consumer's error summary announces errors and uses `focus()` to move the user to the list.

### Examples

Required payment method and terms acceptance, validated on submit and reported in the form's error summary (`showErrorSummary` is application code, see the TextInput README):

```js
const payment = renderCheckboxRadio(paymentHost,
{
    id:'payment-method',
    groupLabel:'Payment method',
    selectionMode:'SINGLE',
    mandatoryIndicator:'MANDATORY_ASTERISK',
    texts:{ requiredSelection:'Select a payment method.' },
    options:[ { value:'card', label:'Card' }, { value:'transfer', label:'Bank transfer' } ]
},( values ) => { order.paymentMethod = values[0] ?? null; });

const terms = renderCheckboxRadio(termsHost,
{
    id:'terms',
    groupLabel:'Terms and conditions',
    mandatoryIndicator:'MANDATORY_ASTERISK',
    texts:{ requiredSelection:'Accept the terms and conditions to continue.' },
    options:[ { value:'accepted', label:'I accept the terms and conditions' } ]
});

checkoutForm.addEventListener('submit',event =>
{
    const invalid = [ payment, terms ].filter(list => !list.validate().valid);
    if ( invalid.length ) { event.preventDefault(); showErrorSummary(invalid.map(list => ({ message:list.getError().message, focus:list.focus }))); }
});
```

### Files

| File | Responsibility |
| --- | --- |
| `checkboxRadioIndex.js` | Public entry point; the only import surface. |
| `checkboxRadioConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `checkboxRadioComponent.js` | Lifecycle, change coordination, validation display, runtime API. |
| `checkboxRadioHTML.js` | Markup, icon classes and Chip composition. |
| `checkboxRadioEvents.js` | Delegated change and focus-leave listeners. |
| `checkboxRadioState.js` | Per-instance selection and error. |
| `checkboxRadioValidation.js` | Required-selection rule. |
| `checkboxRadioErrors.js` | User error catalog and developer error and warning catalog. |
| `checkboxRadio.css` | Presentation. |
| `checkboxRadioTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/checkboxRadio.test.mjs`). |
