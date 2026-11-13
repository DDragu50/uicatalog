# TextArea

## For business

### Overview

TextArea is a multi-line field for free text such as comments, descriptions, notes or reasons. It behaves like TextInput and adds a remaining-characters counter and a field that grows with its content.

### When to use

- Use it for free text over several lines: comments, descriptions, notes, reasons.
- Use TextInput for single-line values such as names, e-mail addresses or numbers.
- Use a rich-text editor (not part of UI Catalog) when the text needs formatting.

### Key features

- A remaining-characters counter that turns red and bold near the limit.
- A field that grows with its content up to a maximum number of lines, or that the user drags taller.
- Minimum and maximum length; text beyond the maximum is cut off with an explanation.
- Line breaks kept everywhere, also in read-only view; plain text only.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing, borders and typography. |
| TextArea styles (`textArea.css`) | Always | Field appearance. |

### Not included

The application provides business rules, server checks, the explanation of the asterisk ("* Required field"), the form's error summary (which also announces errors to screen-reader users) and translations. It must also confirm that its server counts characters the same way (see Configuration).

## For designers

### Structure

```text
div.ui-text-area-wrapper.ui-text-area-width-{width}
├── label.ui-text-area-label
│   └── span.ui-text-area-optional  or  span.ui-text-area-mandatory   (mandatory indicator)
├── textarea.ui-text-area-field.ui-text-area-resize-{none|vertical}[.ui-text-area-auto-grow]
├── div.ui-text-area-footer                        (help and counter on one line; the error on its own line below)
│   ├── div.ui-text-area-help                      (optional; left, wraps when long)
│   ├── div.ui-text-area-error                     (hidden when there is no error; not a live region)
│   └── div.ui-text-area-counter[.ui-text-area-counter-warning]   (with maxLength; right; aria-hidden)
├── span.ui-text-area-visually-hidden              (limit text for screen readers)
└── span.ui-text-area-visually-hidden  aria-live="polite"   (counter announcements)
```

View state renders `p.ui-text-area-label` and `p.ui-text-area-view-value` (line breaks preserved); hidden state renders nothing. The field border turns to the accent color while focused and to the error color when `aria-invalid="true"`; keyboard focus adds the focus outline; disabled fields have a muted background. Auto-grow sets the local properties `--ui-text-area-height` and `--ui-text-area-overflow` inline.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-text-area-label-top`, `ui-text-area-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Width | Small, medium, large, full | `ui-text-area-width-small`, `-medium`, `-large`, `-full` |
| State | Edit, view, inactive, hidden | edit: default structure; view: `p.ui-text-area-view-value`; inactive: `textarea[disabled]`; hidden: no markup |
| Resize handle | Vertical, none | `ui-text-area-resize-vertical`, `ui-text-area-resize-none` (always none with auto-grow) |
| Auto-grow | On | `ui-text-area-auto-grow` |
| Mandatory indicator | None, optional text, mandatory asterisk | no element, `span.ui-text-area-optional`, `span.ui-text-area-mandatory` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Counter warning | Fewer than N characters left | `ui-text-area-counter-warning` (error color, bold) |
| Error | Shown | `textarea[aria-invalid="true"]`, visible `.ui-text-area-error` |

### Styling contract

`textArea.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-text-area-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

The disabled rules use `:disabled`, so they also apply inside a disabled `fieldset`; the label and `*` of a disabled field use `--c-muted`.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, field, view value
  - `--c-muted`: optional, field (disabled), label (disabled), mandatory (disabled), help, counter
  - `--c-danger-text`: mandatory, error, counter (warning)
  - `--c-border`: field
  - `--c-surface`: field
  - `--c-accent`: field (focus)
  - `--c-danger`: field (invalid)
  - `--c-surface-muted`: field (disabled)
- Typography
  - `--font-ui`: text area, field
  - `--fw-ui`: text area, field, optional
  - `--fs-label`: label, optional, help, error, counter
  - `--fw-ui-strong`: label, mandatory, error, counter (warning)
  - `--lh-compact`: label
  - `--fs-control`: field, view value
  - `--lh-body`: field, help, error, counter, view value
- Borders and corners
  - `--border-thin`: field
- States and motion
  - `--transition-1`: field

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: text area, footer
  - `--gap-section`: text area
  - `--gap-inline-items`: label, footer
  - `--padding-control`: field
- Sizes
  - `--control-height`: field
  - `--percentage-s`: text area (width small)
  - `--percentage-m`: text area (width medium)
  - `--percentage-l`: text area (width large)
  - `--percentage-full`: text area (width full)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: field (focus)
  - `--focus-offset`: field (focus)
- Spacing
  - `--gap-toolbar`: text area (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
- Sizes
  - `--percentage-full`: text area (also label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--form-label-width`: text area (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--percentage-s`: text area (label on the left + width small)
  - `--percentage-m`: text area (label on the left + width medium)
  - `--percentage-l`: text area (label on the left + width large)
  - `--control-height`: label (label on the left)

**Set by the component — don't change**

- Variables
  - `--ui-text-area-height`, `--ui-text-area-overflow`: height and scrolling of an auto-growing field (measured while typing)

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `textAreaIndex.js`.
- Use TextArea for every multi-line plain-text field; never write `textarea` markup, counters or error elements by hand.
- Fields are mandatory by default; set `mandatory:false` explicitly, normally with `mandatoryIndicator:'OPTIONAL_TEXT'`. Use the same indicator style for the whole form.
- Set a length limit with `validation:{ enabled:true, maxLength }`; the counter appears automatically. Match `maxLength` to what the server accepts.
- On submit, call `validate()` on every field, build the error summary from `getError()`, and let each summary link call `focus()`.
- Use `onValueChange` for the value and `onValidation` for validity; never read the DOM.
- `setValue()` is programmatic: no dirty flag, no `onValueChange`.
- Put forms in `<form novalidate>`; translate UI texts through `texts`.
- Give each field a unique `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never add formatting (HTML, Markdown rendering) to TextArea values; treat the value as untrusted text and escape it wherever it is displayed.
- Never remove `aria-invalid`, `aria-describedby`, `aria-required` or the label association, and never make the error a live region.
- Never add native `required`, `minlength` or `maxlength` attributes.

### Example prompts

```text
Add a mandatory TextArea "Reason for cancellation" with a maximum of 500 characters and a warning when fewer than 20 characters are left, marked with an asterisk.
```

```text
Add an optional auto-growing TextArea "Internal notes" (3 to 10 lines) to the order form, marked "(Optional)", and show its text read-only with line breaks for users without edit rights.
```

## For developers

### Business analysis

> **Component**: the TextArea itself. **Consumer**: the developer who configures the TextArea in the application's code. **App**: the running application that uses the TextArea; it provides the data, performs the actions and stores the changes.

**Text**

- User types or pastes text over several lines. <!-- BA-01 -->
  - Component reports each change to the App. <!-- BA-02 -->
- Consumer provides the label, a placeholder and a help text (optional). <!-- BA-03 -->
- Component keeps line breaks, also in read-only view. <!-- BA-04 -->
- Component wraps very long words instead of widening the page. <!-- BA-05 -->
- Component keeps the text exactly as typed, without formatting. <!-- BA-06 -->

**Length**

- Consumer provides a maximum length (optional). <!-- BA-07 -->
  - Component displays the characters left below the field, e.g. "12 characters left". <!-- BA-08 -->
  - Component displays the counter in red and bold when fewer than 5 characters are left (the number is chosen by the Consumer). <!-- BA-09 -->
  - Component removes text beyond the maximum and displays a short message. <!-- BA-10 -->
- Consumer provides a minimum length (optional). <!-- BA-11 -->
  - Component checks the length and displays the error message. <!-- BA-12 -->

**Size**

- Consumer provides the starting number of lines. <!-- BA-13 -->
- Component adapts the height of the field to its content, up to a maximum number of lines, then scrolls (optional). <!-- BA-14 -->
- User drags the corner of the field to make it taller (when the field does not grow by itself). <!-- BA-15 -->

**Browser help**

- Component checks the spelling (optional, on by default). <!-- BA-16 -->
- Component displays the browser's suggestions of earlier entries (optional). <!-- BA-17 -->

**Display**

- Consumer chooses one of four widths. <!-- BA-18 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderTextArea, DEFAULT_TEXTAREA_CONFIG, TEXTAREA_STATES, TEXTAREA_WIDTHS, TEXTAREA_MANDATORY_INDICATORS, TEXTAREA_RESIZE_MODES } from './textAreaIndex.js';

const notes = renderTextArea(container, config, onValueChange, onValidation); // null after a developer error
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
| `getValue()` | string | Current value (line breaks as `\n`). |
| `getError()` | object \| null | Copy of the current error `{ errorLabel, message, source, severity, visibility }`. |
| `setValue(value)` | `{ valid, errorLabel }` | Sets the value (truncated to `maxLength` when validation is enabled), updates counter and height, runs final validation. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: sets the value without validating, removes any shown error and the changed state. |
| `validate()` | `{ valid, errorLabel }` | Runs final validation, shows or clears the error. |
| `isDirty()` | boolean | Whether the user has changed the value. |
| `focus()` | boolean | Moves focus to the field; `false` in view, hidden or inactive state. |
| `destroy()` | — | Removes listeners, timers and the resize observer, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Native `id` of the textarea. |
| `name` | string | value of `id` | Text | `EDIT`, `INACTIVE` | Native `name`. |
| `label` | string | `''` | Text | Always | Visible label. |
| `value` | string | `''` | Text | Always | Initial value; truncated to `maxLength` when validation is enabled. |
| `placeholder` | string | `''` | Text | `EDIT`, `INACTIVE` | Placeholder. |
| `help` | string | `''` | Text | `EDIT`, `INACTIVE` | Help text, linked through `aria-describedby`. |
| `state` | string | `'EDIT'` | `EDIT`, `VIEW`, `INACTIVE`, `INVISIBLE` | Always | Display mode. |
| `width` | string | `'FULL'` | `SMALL`, `MEDIUM`, `LARGE`, `FULL` | Always | Field width. |
| `mandatory` | boolean | `true` | — | Always | `true`: empty (or whitespace-only) value is a `REQUIRED` error; sets `aria-required`. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `label` | Marker next to the label. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `autoFocus` | boolean | `false` | — | `EDIT` | Focuses the field once, after the first render. |
| `autocomplete` | string | `'off'` | Native token list | `EDIT`, `INACTIVE` | `'off'`: no browser suggestions of earlier entries; `'on'` allows them. |
| `spellcheck` | boolean | `true` | — | `EDIT`, `INACTIVE` | Browser spellcheck. |
| `rows` | number | `4` | Integer 1–50 | Always | Initial visible lines (minimum height with auto-grow). |
| `autoGrow` | boolean | `false` | — | `EDIT`, `INACTIVE` | Grows with the content up to `maxRows`, then scrolls; forces `resize:'NONE'`. |
| `maxRows` | number | `12` | Integer 1–100, ≥ `rows` | `autoGrow` | Maximum lines before scrolling (`MAX_ROWS_CLAMPED` when smaller than `rows`). |
| `resize` | string | `'VERTICAL'` | `VERTICAL`, `NONE` | Not `autoGrow` | User resize handle. |
| `validation.enabled` | boolean | `false` | — | Always | Enables length rules and the counter (not `mandatory`). |
| `validation.minLength` | number | `0` | Integer ≥ 0, ≤ `maxLength` | `validation.enabled` | Minimum length (`MIN_LENGTH`). |
| `validation.maxLength` | number | `1000` | Integer ≥ 1 | `validation.enabled` | Maximum length; longer input is truncated. |
| `showCounter` | boolean | `true` | — | `validation.enabled` + `EDIT` | Shows the remaining-characters counter. |
| `counterWarningThreshold` | number | `5` | Integer ≥ 0 | `showCounter` | Warning style when fewer than this many characters are left. |
| `errorVisibilityDuration` | number | `5000` | ms, 0–60000 | `validation.enabled` | How long `MAX_LENGTH` stays visible. |
| `locale` | string | page language | BCP 47 tag, e.g. `'en'`, `'de'` | `showCounter` | Optional. The language whose rules TextArea uses to write the number in the counter. When empty, the page language (`<html lang>`), then the browser language. For example: with `maxLength:5000`, the counter reads “4,800 characters left” in English (`en`) and “4.800 characters left” in German (`de`). |
| `texts.optional` | string | `'(Optional)'` | Text | `mandatory:false` + `OPTIONAL_TEXT` | Optional marker. |
| `texts.counter` / `texts.counterSingular` | string | `'{remaining} characters left'` / `'{remaining} character left'` | Text with `{remaining}` | `showCounter` | Counter text (singular for exactly 1). |
| `texts.limit` | string | `'Maximum {maxLength} characters.'` | Text with `{maxLength}` | `validation.enabled` | Limit description for screen readers. |
| `texts.errors.{LABEL}` | string | see Errors | Text with `{minLength}`, `{maxLength}` | Always | Message for each user error label. |

Counting: characters are counted as the browser counts them (`value.length`): a line break counts 1; some emoji and combined characters count 2. Line breaks are normalized to `\n`. `resize` with auto-grow, `maxRows` without auto-grow and counter options without validation are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)` | A user edit changes the value, including input truncated to `maxLength` that still changes it. | Initial value, `setValue()`, input rejected without changing the value, during IME composition. |
| `onValidation` | `(result, instance)` with `result = { valid, errorLabel }` | The effective validation result changes (while typing, on blur after a change, on `validate()` or `setValue()`). | The result is unchanged; blur without a change; the temporary `MAX_LENGTH` message alone. |

### Errors

User errors are shown below the field and returned by `getError()`. Messages come from `texts.errors`.

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `REQUIRED` | Required. | Empty or whitespace-only value with `mandatory:true`. | Corrective |
| `MIN_LENGTH` | Minimum {minLength} characters. | Shorter than `minLength`. | Corrective |
| `MAX_LENGTH` | Maximum {maxLength} characters. | Input truncated to `maxLength`. | Temporary (`errorVisibilityDuration`) |
| `UNIDENTIFIED` | An unidentified error occurred. | Unknown error label. | Dismissible |

Timing: errors are shown on `validate()`, `setValue()` and on blur once the user has changed the value. While typing, a visible corrective error is updated or cleared immediately, but new errors are not shown.

Developer errors prevent rendering (`renderTextArea()` returns `null`); warnings are logged and rendering continues. Console format: `TextArea "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_OPTION` | warning | Invalid enumerated value, number, `autocomplete` or `locale` tag; the default (for `locale`, the page language) is used. |
| `OPTION_IGNORED` | warning | `resize` with `autoGrow`, `maxRows` without `autoGrow`, or counter options without validation. |
| `MIN_LENGTH_CLAMPED` | warning | `minLength` greater than `maxLength`. |
| `MAX_ROWS_CLAMPED` | warning | `maxRows` smaller than `rows`. |

### Accessibility

- Native `textarea` linked to its label with `for`; mandatory fields have `aria-required="true"`; the asterisk is `aria-hidden`.
- Help, the limit ("Maximum N characters.") and a visible error are linked through `aria-describedby`; an error sets `aria-invalid="true"` and is read when the user reaches the field (not a live region).
- The visual counter is `aria-hidden`; screen readers hear one polite announcement when the warning zone is entered and one when the limit is reached, not on every keystroke.
- The warning is shown by color and bold weight together with the count in words.
- `dir="auto"` aligns right-to-left text correctly; IME composition is never interrupted by truncation or validation.

### Examples

Reason field with a larger warning zone, validated on submit with other inputs:

```js
const reason = renderTextArea(reasonHost,
{
    id:'cancel-reason',
    label:'Reason for cancellation',
    mandatoryIndicator:'MANDATORY_ASTERISK',
    rows:3, autoGrow:true, maxRows:8,
    validation:{ enabled:true, minLength:10, maxLength:500 },
    counterWarningThreshold:20,
    texts:{ errors:{ REQUIRED:'Enter a reason for the cancellation.', MIN_LENGTH:'Enter at least {minLength} characters.' } }
},( value ) => { order.cancelReason = value; });

cancelForm.addEventListener('submit',event =>
{
    const invalid = [ reason, confirmCheckbox ].filter(field => !field.validate().valid);
    if ( invalid.length ) { event.preventDefault(); showErrorSummary(invalid.map(field => ({ message:field.getError().message, focus:field.focus }))); }
});
```

### Files

| File | Responsibility |
| --- | --- |
| `textAreaIndex.js` | Public entry point; the only import surface. |
| `textAreaConfig.js` | Defaults, allowed values, normalization, truncation, developer validation. |
| `textAreaComponent.js` | Lifecycle, error lifecycle, counter, auto-grow, runtime API. |
| `textAreaHTML.js` | Markup generation (rendered once). |
| `textAreaEvents.js` | Input (IME-aware) and blur listener registration. |
| `textAreaState.js` | Per-instance runtime state. |
| `textAreaValidation.js` | Validation rules (pure functions). |
| `textAreaErrors.js` | User error catalog and developer error and warning catalog. |
| `textArea.css` | Presentation. |
| `textAreaTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/textArea.test.mjs`). |
