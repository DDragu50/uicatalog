# TextInput

## For business

### Overview

TextInput is a single-line field where the user types a value: text, e-mail address, password, web address, phone number or number. It shows a label, optional help text and clear error messages, and can also display a value read-only.

### When to use

- Use it for single-line values: text, e-mail address, password, web address, phone number or number.
- Use TextArea for longer text over several lines, Calendar for dates and times, and Select for a choice from a list.
- Use SearchBox for searching data.

### Key features

- Six types: text, e-mail, password, web address, phone and number.
- Length, number and format rules with their own error messages.
- A show/hide button for passwords.
- An icon or one action button at the end of the field, e.g. "Search" or "Copy".
- Five widths, from small to full width or fitted to the content.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing, borders and typography. |
| TextInput styles (`textInput.css`) | Always | Field appearance. |
| Button component and `button.css` | Password fields or an action button | Password show/hide and trailing action button. |
| Font Awesome icon library | Password fields, icons or action buttons | Icon glyphs. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application provides business rules (e.g. "e-mail already registered"), server checks, value formatting, translations, the explanation of the asterisk (e.g. "* Required field") and the form's error summary, which also announces errors to screen-reader users.

## For designers

### Structure

```text
div.ui-text-input-wrapper.ui-text-input-width-{width}
├── label.ui-text-input-label
│   └── span.ui-text-input-optional  or  span.ui-text-input-mandatory   (mandatory indicator)
├── div.ui-text-input-control
│   ├── input.ui-text-input-field[.ui-text-input-number-no-spinner]
│   └── div.ui-text-input-icon-area                       (optional)
│       ├── i.ui-text-input-static-icon.{icon}            (static icon)
│       └── div.ui-text-input-icon-button-host[.ui-text-input-action] → Button   (password toggle, or the action)
├── div.ui-text-input-help                                (optional)
└── div.ui-text-input-error                               (hidden when there is no error; not a live region)
```

View state renders `div.ui-text-input-wrapper` with `p.ui-text-input-label` and `p.ui-text-input-view-value`. Hidden state renders nothing. The field border turns to the error color when `aria-invalid="true"` and to the accent color while focused. When the field is disabled — state `INACTIVE`, or inside a disabled `fieldset` (e.g. a ContentGroup with `disabled:true`) — the box background turns muted and the typed text, the label and the `*` use the secondary text color; the help text is secondary already and the error message keeps the error color. Number fields hide the spinner unless integer steps greater than 1 are configured.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-text-input-label-top`, `ui-text-input-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Width | Small, medium, large, full, fit content | `ui-text-input-width-small`, `-medium`, `-large`, `-full`, `-fit-content` |
| State | Edit, view, inactive, hidden | edit: default structure; view: `p.ui-text-input-view-value`; inactive: `input[disabled]` (a field inside `fieldset[disabled]` looks the same), muted box, text, label and `*`; hidden: no markup |
| Mandatory indicator | None, optional text, mandatory asterisk | no element, `span.ui-text-input-optional` (non-mandatory fields), `span.ui-text-input-mandatory` (mandatory fields, `aria-hidden`) |
| Number spinner | Hidden | `ui-text-input-number-no-spinner` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Error | Shown | `input[aria-invalid="true"]`, visible `.ui-text-input-error` |

### Styling contract

`textInput.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-text-input-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

The disabled rules use `:disabled`, so they also apply inside a disabled `fieldset`; the label and `*` of a disabled field use `--c-muted`. The field's minimum height subtracts the top and bottom border widths, so keep them in step.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, field, view value
  - `--c-muted`: optional, field (disabled), label (disabled), mandatory (disabled), help
  - `--c-danger-text`: mandatory, error
  - `--c-border`: control
  - `--c-surface`: control
  - `--c-accent`: control (focus)
  - `--c-danger`: control (invalid)
  - `--c-surface-muted`: control (disabled)
- Typography
  - `--font-ui`: text input, field
  - `--fw-ui`: text input, field, optional
  - `--fs-label`: label, optional, help, error
  - `--fw-ui-strong`: label, mandatory, error
  - `--lh-compact`: label
  - `--fs-control`: field, view value
  - `--lh-body`: help, error
- Borders and corners
  - `--border-thin`: control
- States and motion
  - `--transition-1`: control

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Borders and corners
  - `--border-thin`: control, field
- Spacing
  - `--gap-tight`: text input, icon area
  - `--gap-section`: text input
  - `--gap-inline-items`: label
  - `--padding-control`: field
- Sizes
  - `--control-height`: control, field
  - `--percentage-s`: text input (width small)
  - `--percentage-m`: text input (width medium)
  - `--percentage-l`: text input (width large)
  - `--percentage-full`: text input (width full)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Spacing
  - `--gap-toolbar`: text input (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
- Sizes
  - `--percentage-full`: text input (also label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--form-label-width`: text input (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--percentage-s`: text input (label on the left + width small)
  - `--percentage-m`: text input (label on the left + width medium)
  - `--percentage-l`: text input (label on the left + width large)

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `textInputIndex.js`.
- Application buttons follow the shared actions contract (guidelines §10.2): pass `actions` (`{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`) and handle `onAction(key)`; never create Buttons yourself inside the component. Inside the field only one icon-only action fits.
- Check whether the configuration already provides the requested behavior before adding code.
- Never write input markup, error elements or styles by hand; use `renderTextInput()`.
- Use `type:'TEL'` for phone numbers and `validation.pattern` for fixed formats (postal codes, customer numbers); country-specific phone checks and formatting stay in the consuming code.
- Use `mandatory` and `validation` for generic rules; implement business rules (uniqueness, cross-field checks, server checks) in the consuming code.
- Fields are mandatory by default; set `mandatory:false` explicitly, normally together with `mandatoryIndicator:'OPTIONAL_TEXT'`. Use the same `mandatoryIndicator` for every input of a form, and add the asterisk explanation when using `MANDATORY_ASTERISK`.
- On submit, call `validate()` on every field, build an error summary from `getError()` at the top of the form, move focus to it, and let each summary link call that field's `focus()`. Do not re-implement required, length or number checks.
- Use `onValueChange` for the value and `onValidation` for validity; never read the DOM. Keep the submit Button enabled and validate on submit.
- `setValue()` is programmatic: it does not mark the field dirty and does not call `onValueChange`.
- Put forms that contain TextInputs in `<form novalidate>`; TextInput does not use native browser validation.
- Translate UI texts through `texts`, not by editing the component.
- Give each field a unique `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never remove `aria-invalid`, `aria-describedby`, `aria-required` or the label association.
- Never add native `required`, `minlength` or `maxlength` attributes, and never make field errors live regions (`role="alert"`, `aria-live`); announcing errors is the error summary's job.
- Do not use `INVISIBLE` to hide sensitive values; the value is still in the application state.

### Example prompts

```text
Add mandatory e-mail and password TextInputs to the login form, marked with an asterisk. On submit, validate both, show an error summary above the form with links that focus the fields, and send the form only when both are valid.
```

```text
Add a non-mandatory integer TextInput "Quantity", marked "(optional)", between 1 and 99 with step 1, and show "Quantity must be between 1 and 99" in German when the value is out of range.
```

## For developers

### Business analysis

> **Component**: the TextInput itself. **Consumer**: the developer who configures the TextInput in the application's code. **App**: the running application that uses the TextInput; it provides the data, performs the actions and stores the changes.

**Value**

- User types, pastes or edits the value. <!-- BA-01 -->
  - Component reports each change to the App. <!-- BA-02 -->
- Consumer provides the label, a placeholder and a help text (optional). <!-- BA-03 -->
- Consumer chooses the type: text, e-mail, password, web address, phone or number. <!-- BA-04 -->

**Rules**

- Consumer provides a minimum and a maximum length (optional). <!-- BA-05 -->
  - Component removes characters beyond the maximum and displays a short message. <!-- BA-06 -->
- Consumer provides number rules: whole numbers only, a minimum and a maximum value (optional). <!-- BA-07 -->
  - Component displays step buttons for whole numbers with a step other than 1. <!-- BA-08 -->
- Component prevents characters other than digits, spaces, "+", "-" and brackets in a phone field. <!-- BA-09 -->
  - Component displays the numeric keypad on phones. <!-- BA-10 -->
- Consumer provides a required format with its own error message, e.g. a 6-digit postal code (optional). <!-- BA-11 -->
- Component checks the rules and displays the matching error message. <!-- BA-12 -->

**Password**

- Component displays a show/hide button in a password field (optional, on by default). <!-- BA-13 -->
- User clicks the button. <!-- BA-14 -->
  - Component displays or hides the password. <!-- BA-15 -->

**End of the field** (optional)

- Consumer provides a decorative icon, or one action button, e.g. "Search". <!-- BA-16 -->
- User clicks the action button. <!-- BA-17 -->
  - Component reports the action to the App. <!-- BA-18 -->
  - App performs the action. <!-- BA-19 -->

**Display**

- Consumer chooses one of five widths: small, medium, large, full width or fitted to the content. <!-- BA-20 -->

**Tooltips**

- Consumer chooses how the password toggle and an icon-only action show their names on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional). <!-- BA-21 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: yes, one icon-only action in the field (`actions`, `onAction`) · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTextInput, DEFAULT_TEXTINPUT_CONFIG, TEXTINPUT_TOOLTIP_MODES, TEXTINPUT_STATES, TEXTINPUT_TYPES, TEXTINPUT_WIDTHS, TEXTINPUT_NUMBER_TYPES, TEXTINPUT_INPUT_MODES } from './textInputIndex.js';

const field = renderTextInput(container, config, onValueChange, onValidation); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The configuration is immutable after rendering; `config.value` remains the initial value.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible label; Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `setError(message)` | `{ valid, errorLabel }` | Shows an external error (server or cross-field rule, label `EXTERNAL`) until the user changes the value or `clearError()` is called; own validation errors take precedence. |
| `clearError()` | — | Removes an external error; own validation errors stay. |
| `getValue()` | string | Current value. |
| `getError()` | object \| null | Copy of the current error `{ errorLabel, message, source, severity, visibility }`. |
| `setValue(value)` | `{ valid, errorLabel }` | Sets the value (truncated to `maxLength` when text validation is enabled), runs final validation and returns its result. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: sets the value without validating, removes any shown error and the changed state. |
| `validate()` | `{ valid, errorLabel }` | Runs final validation, shows or clears the error and returns its result. |
| `isDirty()` | boolean | Whether the user has changed the value. |
| `focus()` | boolean | Moves focus to the input; `false` when there is no focusable input (view, hidden, inactive). |
| `setActionDisabled(key, disabled)` | boolean | Enables or disables the action Button; `false` (with `UNKNOWN_ACTION`) for an unknown key. |
| `destroy()` | — | Removes listeners, timers and the child Button, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value or number produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Native `id` of the input. |
| `name` | string | value of `id` | Text | `EDIT`, `INACTIVE` | Native `name`. |
| `label` | string | `''` | Text | Always | Visible label. |
| `value` | string | `''` | Text | Always | Initial value; truncated to `maxLength` when text validation is enabled. |
| `placeholder` | string | `''` | Text | `EDIT`, `INACTIVE` | Placeholder. |
| `help` | string | `''` | Text | `EDIT`, `INACTIVE` | Help text, linked through `aria-describedby`. |
| `state` | string | `'EDIT'` | `EDIT`, `VIEW`, `INACTIVE`, `INVISIBLE` | Always | Display mode; see Visual options. |
| `type` | string | `'TEXT'` | `TEXT`, `EMAIL`, `PASSWORD`, `NUMBER`, `URL`, `TEL` | Always | Native input type. `TEL` also defaults `inputMode` to `TEL` and `autocomplete` to `'tel'`. |
| `width` | string | `'FULL'` | `SMALL`, `MEDIUM`, `LARGE`, `FULL`, `FIT_CONTENT` | Always | Field width. |
| `mandatory` | boolean | `true` | — | Always | `true`: empty value is a `REQUIRED` error, independent of `validation.enabled`; sets `aria-required`. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `label` | `OPTIONAL_TEXT`: `texts.optional` next to non-mandatory fields (recommended with `mandatory:false`). `MANDATORY_ASTERISK`: `*` next to mandatory fields. `NONE`: no marker. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `trimStart` | boolean | `false` | — | Not `NUMBER` | Removes leading whitespace from user input. |
| `autoFocus` | boolean | `false` | — | `EDIT` | Focuses the input once, after the first render. |
| `autocomplete` | string | `'off'` (`'tel'` for `TEL`) | Native token | `EDIT`, `INACTIVE` | Native `autocomplete`. |
| `inputMode` | string | `''` (none; `TEL` for `TEL`) | `TEXT`, `DECIMAL`, `NUMERIC`, `TEL`, `SEARCH`, `EMAIL`, `URL` | `EDIT`, `INACTIVE` | Native `inputmode` (virtual keyboard). |
| `passwordToggle` | boolean | `true` | — | `PASSWORD` + `EDIT` | Show/hide password Button. |
| `errorVisibilityDuration` | number | `5000` | ms, ≥ 0 | `validation.enabled` + not `NUMBER` | How long `MAX_LENGTH` stays visible. |
| `iconArea.staticIcon` | string | `''` | CSS class names | Not `PASSWORD`, `EDIT` | Decorative trailing icon. |
| `actions` | array | `[]` | `[{ key, label, icon, hierarchy?, disabled? }]` (at most one) | Not `PASSWORD`, `EDIT` | The trailing action Button (guidelines §10.2; a single slot inside the field): always icon-only, named by `label`; `icon` required; TERTIARY by default. Takes precedence over `staticIcon` (`OPTIONS_CONFLICT`). Extra entries, or an action without icon, are ignored (`OPTION_IGNORED`). Without `onAction` it is disabled (`ACTION_HANDLER_MISSING`). |
| `tooltipMode` | string | `'NONE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the password toggle and an icon-only action show their names on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `onAction` | function | `null` | `(key, instance) => {}` | `actions` | The action Button was pressed. |
| `validation.enabled` | boolean | `false` | — | Always | Enables the rules below (not `mandatory`). |
| `validation.minLength` | number | `0` | Integer ≥ 0, ≤ `maxLength` | Not `NUMBER` | Minimum length (`MIN_LENGTH`). Clamped to `maxLength` with a warning. |
| `validation.maxLength` | number | `255` | Integer ≥ 0 | Not `NUMBER` | Maximum length; input is truncated. |
| `validation.numberType` | string | `'REAL'` | `REAL`, `INTEGER` | `NUMBER` | Number kind. |
| `validation.minValue` | number \| null | `null` | Number | `NUMBER` | Minimum value (`MIN_VALUE`). |
| `validation.maxValue` | number \| null | `null` | Number | `NUMBER` | Maximum value (`MAX_VALUE`). |
| `validation.step` | number | `1` | Integer ≥ 1 | `NUMBER` + `INTEGER` | Step; values > 1 show the native spinner. |
| `validation.pattern` | string \| RegExp | `''` (none) | Regular expression, matched against the whole value | Not `NUMBER` | Required format (`PATTERN`); e.g. `'[0-9]{6}'`. An invalid expression is ignored with `INVALID_PATTERN`. |
| `texts.optional` | string | `'(Optional)'` | Text | `mandatory:false` + `OPTIONAL_TEXT` | Optional marker. |
| `texts.showPassword` / `texts.hidePassword` | string | `'Show password'` / `'Hide password'` | Text | `passwordToggle` | Toggle accessible names. |
| `texts.errors.{LABEL}` | string | see Errors | Text with `{minLength}`, `{maxLength}`, `{minValue}`, `{maxValue}` | Always | Message for each user error label. |

For `PASSWORD`, `iconArea.staticIcon` and `actions` are ignored, and for `NUMBER`, `validation.pattern` is ignored, each with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)` | A user edit changes the value, including input truncated to `maxLength` that still changes it. | Initial value, `setValue()`, input rejected without changing the value. |
| `onValidation` | `(result, instance)` with `result = { valid, errorLabel }` | The effective validation result changes (while typing, on blur after a change, on `validate()` or `setValue()`). | The result is unchanged; blur without a change; the temporary `MAX_LENGTH` message alone. |
| `onAction` | `(key, instance)` | The action Button is pressed. | Disabled action; `PASSWORD` fields. |

### Errors

User errors are shown below the field and returned by `getError()`. Messages come from `texts.errors`.

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `REQUIRED` | Required. | Empty value with `mandatory:true`. | Corrective |
| `MIN_LENGTH` | Minimum {minLength} characters. | Shorter than `minLength`. | Corrective |
| `MAX_LENGTH` | Maximum {maxLength} characters. | Input truncated to `maxLength`. | Temporary (`errorVisibilityDuration`) |
| `INVALID_NUMBER` | Enter a valid number. | `NUMBER` value not numeric. | Corrective |
| `INTEGER_REQUIRED` | Enter an integer. | Decimal value with `INTEGER`. | Corrective |
| `MIN_VALUE` | Minimum value is {minValue}. | Below `minValue`. | Corrective |
| `MAX_VALUE` | Maximum value is {maxValue}. | Above `maxValue`. | Corrective |
| `INVALID_PHONE` | Enter a valid phone number. | `TEL` value (with `validation.enabled`) with characters other than digits, spaces, `+`, `-`, `(`, `)`, or without digits. | Corrective |
| `PATTERN` | Enter a value in the required format. | Value does not match `validation.pattern`. | Corrective |
| `UNIDENTIFIED` | An unidentified error occurred. | Unknown error label. | Dismissible |

Timing: errors are shown on `validate()`, `setValue()` and on blur once the user has changed the value; tabbing through an untouched field shows nothing. While the user types, a visible corrective error is updated or cleared immediately, but new errors are not shown. Number rules are checked only on blur and final validation. Errors are not announced by the field; the consumer's error summary announces them.

Developer errors prevent rendering (`renderTextInput()` returns `null`); warnings are logged and rendering continues. Console format: `TextInput "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_OPTION` | warning | Invalid enumerated value or number; the default is used. |
| `INVALID_ICON_CLASS` | warning | Invalid class names removed from an icon option. |
| `MIN_LENGTH_CLAMPED` | warning | `minLength` greater than `maxLength`. |
| `OPTION_IGNORED` | warning | `iconArea.staticIcon` or `actions` with `PASSWORD`, `validation.pattern` with `NUMBER`, more than one action, or an action without icon. |
| `OPTIONS_CONFLICT` | warning | `iconArea.staticIcon` and `actions` both set; the action is shown. |
| `INVALID_ACTION` | warning | An action without key or label; dropped. |
| `DUPLICATE_ACTION_KEY` | warning | A duplicate action key; the later action is dropped. |
| `UNKNOWN_ACTION` | warning | `setActionDisabled()` names no action. |
| `ACTION_HANDLER_MISSING` | warning | An action without `onAction`; its Button is rendered disabled. |
| `INVALID_PATTERN` | warning | `validation.pattern` is not a valid regular expression; ignored. |

### Accessibility

- The label is linked with `for`; mandatory fields have `aria-required="true"`. The asterisk is `aria-hidden` (announced through `aria-required`); the optional text is part of the label.
- Help and visible error are linked through `aria-describedby`; an error sets `aria-invalid="true"`. The error is read when the user reaches the field; it is not a live region, so leaving a field or submitting never produces a burst of announcements.
- The consumer provides the error summary (announced, with links) and uses `focus()` to move the user to a field.
- The password toggle is a Button with `aria-pressed` and a translated accessible name; focus returns to the input after toggling.
- Errors are updated in place, so focus, cursor position and typing are never interrupted.
- A disabled field (native `disabled`, also through a disabled `fieldset`) is announced as unavailable; its label and text use `--c-muted`, which keeps about 4.9:1 contrast on the page background (above the 4.5:1 minimum).

### Examples

Login form with an error summary (the summary markup and styles belong to the application):

```js
const fields = [
    { label:'E-mail', instance:renderTextInput(emailHost,{ id:'login-email', label:'E-mail', type:'EMAIL', mandatoryIndicator:'MANDATORY_ASTERISK', autocomplete:'username', texts:{ errors:{ REQUIRED:'Enter your e-mail address.' } } }) },
    { label:'Password', instance:renderTextInput(passwordHost,{ id:'login-password', label:'Password', type:'PASSWORD', mandatoryIndicator:'MANDATORY_ASTERISK', autocomplete:'current-password', texts:{ errors:{ REQUIRED:'Enter your password.' } } }) }
];

loginForm.addEventListener('submit',event =>
{
    const invalid = fields.filter(field => !field.instance.validate().valid);
    if ( invalid.length === 0 ) { summary.hidden = true; return; }
    event.preventDefault();
    summary.innerHTML = `<h2 id="summary-title" tabindex="-1">There is a problem</h2><ul>${invalid.map(( field,index ) => `<li><a href="#" data-index="${index}">${field.instance.getError().message}</a></li>`).join('')}</ul>`;
    summary.hidden = false;
    summary.querySelectorAll('a').forEach(link => link.addEventListener('click',linkEvent => { linkEvent.preventDefault(); invalid[link.dataset.index].instance.focus(); }));
    summary.querySelector('#summary-title').focus();
});
```

Moving focus to the summary heading makes screen readers read it once. The form also contains the line "* Required field" and uses `<form novalidate>`.

Phone number and postal code with a required format:

```js
renderTextInput(phoneHost,{ id:'phone', label:'Phone', type:'TEL', validation:{ enabled:true, maxLength:20 } });
renderTextInput(postalHost,{ id:'postal-code', label:'Postal code', validation:{ enabled:true, pattern:'[0-9]{6}' }, texts:{ errors:{ PATTERN:'Enter the 6-digit postal code.' } } });
```

Translated number rules:

```js
renderTextInput(host,
{
    id:'quantity', label:'Menge', type:'NUMBER', inputMode:'NUMERIC', mandatory:false, mandatoryIndicator:'OPTIONAL_TEXT',
    validation:{ enabled:true, numberType:'INTEGER', minValue:1, maxValue:99 },
    texts:{ optional:'(optional)', errors:{ INTEGER_REQUIRED:'Bitte eine ganze Zahl eingeben.', MIN_VALUE:'Mindestens {minValue}.', MAX_VALUE:'Höchstens {maxValue}.' } }
});
```

### Files

| File | Responsibility |
| --- | --- |
| `textInputIndex.js` | Public entry point; the only import surface. |
| `textInputConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `textInputComponent.js` | Lifecycle, error lifecycle, child Button composition, runtime API. |
| `textInputHTML.js` | Markup generation (rendered once). |
| `textInputEvents.js` | Input and blur listener registration. |
| `textInputState.js` | Per-instance runtime state. |
| `textInputValidation.js` | Validation rules (pure functions). |
| `textInputErrors.js` | User error catalog and developer error and warning catalog. |
| `textInput.css` | Presentation. |
| `textInputTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/textInput.test.mjs`). |
