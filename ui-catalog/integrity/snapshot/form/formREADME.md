# Form

## For business

### Overview

Form turns a set of input fields into one unit the user can submit, or into a filter panel that updates results. It collects the values, checks all fields at once, shows one clear list of problems, prevents double submits and can warn before unsaved changes are lost. It never sends data itself: the application does that with the values Form hands over.

### When to use

- Use the submit mode for data the user enters and sends: registration, order, profile.
- Use the live mode for filters, settings, calculators and previews that update as the user changes them.
- Use ContentGroup inside a form to group fields, and a single field without Form when nothing is submitted.

### Key features

- Two modes: submit, and live (on Apply or after a short pause).
- One error summary at the top that names each field and jumps to it.
- Checks across fields and messages from the server next to the fields.
- No double submits, and a warning before unsaved changes are lost.
- Optional Reset, Clear all and Cancel buttons; fields in one to four columns.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, spacing and typography. |
| Form styles (`form.css`) | Always | Summary, layout and actions. |
| Button component and `button.css` | Always | Submit, Apply, Reset, Clear all and Cancel. |
| Message component and `message.css` | Always | Error summary, success and other messages, Reset/Clear confirmation. |
| Loader component and `loader.css` | `busyIndicator` `BUTTONS` or `OVERLAY` | What the user sees while the form saves. |
| Input and container components (TextInput, Calendar, ContentGroup, …) | For the fields placed in the form | Rendered by the application; Form does not import them. |

### Not included

The application sends the values to the server, returns server messages to Form, decides cross-field rules, shows filter results (and, if wanted, active filters as chips or in the page address) and handles navigation after submit or cancel. Very special forms (wizards with steps, fields that are not Form fields) are built by the application itself.

## For designers

### Structure

```text
form#{id}.ui-form.ui-form-mode-{submit|live}[.ui-labels-start][.ui-form-busy]   novalidate, size container "form"
├── div#{id}-summary.ui-form-summary   role="group", tabindex="-1"   (hidden without errors)
│   ├── h2.ui-form-summary-title
│   └── ul.ui-form-summary-list > li > a.ui-form-summary-link
├── p.ui-form-required-note                                  (optional)
├── div.ui-form-content   (grid of --ui-form-columns columns)
│   └── div.ui-form-item  (display:contents) → ContentGroup, input or static HTML
├── div.ui-form-actions.ui-form-actions-{start|end}
│   ├── span.ui-form-loader-host → Loader (RING, SMALL, "Saving…" after it)   (busyIndicator BUTTONS; not displayed while the Loader is hidden)
│   └── Buttons: Submit | Apply, Reset to initial values, Clear all, Cancel
└── div.ui-form-overlay-host → Loader (OVERLAY over the form, panel at the top)   (busyIndicator OVERLAY)
```

The summary has a danger border (thicker at the start), a soft danger background and underlined links in the danger text colour. Items use `display:contents`, so a ContentGroup's own column span applies to the form grid. Below a form width of 36rem the grid becomes one column. The class `ui-labels-start` is the shared switch that puts the labels of all fields inside on the left; fields follow it with `labelPosition:'INHERIT'`.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Mode | Submit, live | `ui-form-mode-submit`, `ui-form-mode-live` |
| Columns | 1–4 | `style="--ui-form-columns:N"` |
| Label position | Top, left | —, `ui-labels-start` |
| Buttons alignment | Start, end | `ui-form-actions-start`, `ui-form-actions-end` |
| Busy indicator | Ring before the buttons, layer over the form, none | `.ui-form-loader-host`, `.ui-form-overlay-host`, — |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Busy | On (the Loader shows after its delay) | `ui-form-busy`, `aria-busy="true"` |
| Error summary | Shown | `.ui-form-summary` without `hidden` |

### Styling contract

`form.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-form-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-muted`: required note
- Typography
  - `--font-ui`: form
  - `--fw-ui`: form
  - `--fs-label`: required note

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-block`: form
  - `--gap-toolbar`: content
  - `--gap-inline-items`: actions

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- No tokens.

**Set by the component — don't change**

- Variables
  - `--ui-form-columns`: number of columns (from `columns`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `formIndex.js`.
- Build every form and filter panel with Form; never write summary boxes, submit handling, value collection or double-submit protection by hand.
- Pass the content as `children` render functions (ContentGroups for sections, inputs inside them). Give every input a `name`; the values are `{ name: value }`.
- Leave the inputs' `labelPosition` on `INHERIT` and set `labelPosition` on the Form.
- Submit forms: put the saving in `onSubmit(values, form)` and return its promise (the form stays busy until it settles); show server messages with `form.showErrors([{ name, message }])`.
- Cross-field rules go in `onValidate(values)` returning `[{ name, message }]`; single-field rules stay in the inputs' own options.
- Filters: `mode:'LIVE'` with `onChange(values)`; keep the default Apply button, or `liveApply:'AUTO'` with `liveDelayMs` for instant results; offer `showClear` ("Clear all").
- Use `warnUnsavedChanges:true` for forms that edit data.
- Inputs that do not follow the form-field contract are not Form fields: handle them in the application.
- Give each form a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again (it also destroys the children).

### Safety

- Never submit without `onSubmit`'s validation having run; never bypass the summary for errors in submit mode.
- String children are inserted as HTML: escape user-provided or external data first.
- Error messages are shown as text; do not pass HTML.
- Never add native `required`/`pattern` attributes; the form is `novalidate` and validation belongs to the inputs.

### Example prompts

```text
Build a registration Form with sections "Personal data" and "Contact" in two columns, labels on the left, mandatory fields marked with an asterisk and a "* Required field" note; check that both e-mail fields match, submit to the API, and show "e-mail already registered" from the server next to the field.
```

```text
Build a filter panel above the orders table with search, status (multiple choice), period (date range with quick choices) and "only mine"; apply the filters with the Apply button, offer "Clear all", and reload the table with the values.
```

## For developers

### Business analysis

> **Component**: the Form itself. **Consumer**: the developer who configures the Form in the application's code. **App**: the running application that uses the Form; it provides the data, performs the actions and stores the changes.

**Submit mode**

- User clicks Submit. <!-- BA-01 -->
  - Component checks all fields. <!-- BA-02 -->
  - Component reports the values to the App when all fields are valid. <!-- BA-03 -->
  - App sends the values to the server. <!-- BA-04 -->
- Component prevents a second submit while the App saves, and displays the form as busy. <!-- BA-05 -->
  - Component displays a small turning ring with "Saving…" before the buttons when saving takes longer than a short delay (optional, on by default). <!-- BA-06 -->
  - Consumer chooses a layer over the whole form instead, which prevents changes while the App saves (optional). <!-- BA-07 -->
- Component displays a success message after a successful submit, e.g. "Your changes were saved.". <!-- BA-08 -->

**Error summary**

- Component displays a box at the top, "There is a problem", when a field has an error. <!-- BA-09 -->
  - Component displays every problem as a link that names its field, e.g. "E-mail: Required.". <!-- BA-10 -->
  - Component moves the focus to the box, so screen-reader users hear it. <!-- BA-11 -->
- User clicks a link in the summary. <!-- BA-12 -->
  - Component moves the user to the field. <!-- BA-13 -->

**Checks across fields and server messages**

- App provides checks across fields, e.g. "The e-mail addresses do not match.". <!-- BA-14 -->
- App provides messages returned by the server, e.g. "This e-mail address is already registered.". <!-- BA-15 -->
  - Component displays them next to the field and in the summary. <!-- BA-16 -->
  - Component clears them when the user changes the field. <!-- BA-17 -->

**Live mode**

- User changes a field. <!-- BA-18 -->
  - Component reports the values when the user clicks Apply, or after a short pause chosen by the Consumer. <!-- BA-19 -->
  - Component displays problems next to the fields only, and reports nothing until they are corrected. <!-- BA-20 -->

**Buttons**

- Consumer enables "Reset to initial values", "Clear all" and Cancel (optional), aligned at the start or the end. <!-- BA-21 -->
- User clicks Reset or Clear all while there are unsaved changes. <!-- BA-22 -->
  - Component asks "Discard your changes?", with "Keep editing" selected first. <!-- BA-23 -->
  - Component resets or clears without displaying "Required." errors until the user changes a field or submits. <!-- BA-24 -->

**Messages**

- Consumer chooses where general messages appear: above the fields (default), as a pop-up in a screen corner, or in another component, e.g. under the application header. <!-- BA-25 -->
  - Component closes a pop-up after 6 seconds and displays a thin bar with the time left (optional, on by default). <!-- BA-26 -->
  - Component keeps danger messages until the user closes them. <!-- BA-27 -->
- App provides its own messages, e.g. warnings, for the same place. <!-- BA-28 -->

**Layout**

- Consumer chooses one to four columns. <!-- BA-29 -->
  - Component displays one column on narrow screens. <!-- BA-30 -->
- Consumer chooses labels on top or on the left for all fields. <!-- BA-31 -->
  - Component moves the labels on top when there is not enough room. <!-- BA-32 -->
- Component displays a "* Required field" note when the fields use the asterisk. <!-- BA-33 -->

**Unsaved changes** (optional)

- User leaves the page with changes that were not submitted. <!-- BA-34 -->
  - Component asks the browser to confirm leaving the page. <!-- BA-35 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: coordinates the fields · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderForm, DEFAULT_FORM_CONFIG, FORM_MODES, FORM_LIVE_APPLY, FORM_LABEL_POSITIONS, FORM_BUTTONS_ALIGN, FORM_REQUIRED_NOTES, FORM_BUSY_INDICATORS } from './formIndex.js';

const form = renderForm(container, config, children); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it and destroys the children. `children` is an ordered array of static HTML strings or functions `(host, form) => instance`, like ContentGroup.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getChildren()` | array | Top-level child instances. |
| `getFields()` | array | Fields found among the children and inside containers (`getChildren()`), first per name. |
| `getValues()` | object | `{ name: value }` of all fields (copies; files from UploadFiles are the `File` objects themselves). |
| `setValues(values)` | — | Sets the named fields programmatically (e.g. editing a saved record); other fields stay. |
| `submit()` | boolean | Submit mode: validates and submits like the Submit button; live mode: validates and applies. Returns whether it went through. |
| `validate()` | `{ valid, errors }` | Validates fields and cross-field rules; shows the summary in submit mode; `errors` is `[{ name, message }]`. |
| `showErrors(list)` | — | Shows server errors `[{ name, message }]` next to the fields (`setError`) and, in submit mode, in the summary. |
| `showMessage(message)` | — | Shows a non-field Message configuration (`{ type, title?, text, link?, … }`, any type) at `externalMessage.placement`. |
| `clearMessage()` | — | Removes the message shown above the form. |
| `clearErrors()` | — | Removes the errors Form set (cross-field and server) and hides the summary. |
| `reset()` | — | Returns every field to its value at render time; live mode reports the result. |
| `clear()` | — | Empties every field (`''`, `[]`, `false`, `null` or an object of empty members); live mode reports the result. |
| `setBusy(busy)` | — | Blocks Submit/Apply, sets `aria-busy` and runs or hides the Loader (`busyIndicator`). |
| `isDirty()` | boolean | Whether the values differ from the last submit, apply or reset. |
| `focus()` | boolean | Focuses the summary when it shows errors, otherwise the first field. |
| `destroy()` | — | Removes listeners, timers, Buttons and children, clears the container. |

### Form-field contract

Form finds fields by duck typing, never by importing or inspecting them. A field is any child instance (at any depth through `getChildren()`) with `getValue()`, `setValue()`, `validate()` and `focus()`; it needs a `name` to be included. Form also uses `getError()` and `getLabel()` (summary entries "{label}: {message}"), `getLabelPosition()` (mixed-position warning), `getMandatoryState()` (automatic required-field note) and, when present, `setError()` / `clearError()` (cross-field and server errors). The full contract is in the guidelines (§10.1). TextInput, TextArea, Select, CheckboxRadio, Toggle, Calendar and SearchBox follow it; SearchBox has no `setError()`, so its external errors appear in the summary only. Lazy CollapsiblePanel content is found only after the panel was first expanded.

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the `<form>`. |
| `mode` | string | `'SUBMIT'` | `SUBMIT`, `LIVE` | Always | Submit with summary, or live reporting of changes. |
| `columns` | number | `1` | Integer 1–4 | Always | Grid columns (one column below a form width of 36rem). |
| `labelPosition` | string | `'TOP'` | `TOP`, `START` | Always | `START` adds the shared class `ui-labels-start`: labels of all `INHERIT` fields on the left. |
| `liveApply` | string | `'BUTTON'` | `BUTTON`, `AUTO` | `LIVE` | Report on the Apply button, or automatically after `liveDelayMs`. |
| `liveDelayMs` | number | `300` | Integer 0–10000 | `LIVE` + `AUTO` | Pause after the last change before reporting. |
| `showSubmit` | boolean | `true` | — | `SUBMIT` | Submit button. |
| `showReset` | boolean | `false` | — | Always | "Reset to initial values" button. |
| `showClear` | boolean | `false` | — | Always | "Clear all" button. |
| `showCancel` | boolean | `false` | — | Always | Cancel button (`onCancel`). |
| `buttonsAlign` | string | `'END'` | `START`, `END` | Always | Alignment of the buttons. |
| `warnUnsavedChanges` | boolean | `false` | — | Always | The browser asks for confirmation before leaving the page while `isDirty()` (the browser shows its own text). |
| `requiredNote` | string | `'AUTO'` | `AUTO`, `ALWAYS`, `NEVER` (`true`/`false` = `ALWAYS`/`NEVER`) | Always | "* Required field" note above the fields: `AUTO` shows it when at least one field shows the mandatory asterisk (`getMandatoryState()`), also for fields rendered later. |
| `confirmReset` | boolean | `true` | — | Always | Reset and Clear ask before discarding unsaved changes (WARNING modal; "Keep editing" focused). |
| `quietReset` | boolean | `true` | — | Always | Reset and Clear set values without validating (`setValue(value, { quiet:true })`): no errors until the user changes a field or submits. |
| `showSubmitSuccess` | boolean | `true` | — | `SUBMIT` | After a successful submit (a returned promise resolves, and `onSubmit` did not return / resolve `false`), shows `texts.submitSuccess` as a SUCCESS message. |
| `busyIndicator` | string | `'BUTTONS'` | `BUTTONS`, `OVERLAY`, `NONE` | Always | What the user sees while the form is busy (a pending `onSubmit` promise, `setBusy(true)`), after the Loader's delay (0.4 s): `BUTTONS` a small ring with `texts.busy` before the buttons (after the content when there are no buttons); `OVERLAY` a Loader layer over the form that also blocks it (focus moves into the layer and back); `NONE` only the disabled main button. |
| `externalMessage` | object | `{ placement:'ABOVE', remainingIndicator:'BAR' }` | `{ placement, toastArea?, onMessage?, remainingIndicator? }` | Always | Where non-field messages (submit success, `showMessage()`) appear: `ABOVE` the fields, `TOAST` (in `toastArea`), or `EXTERNAL` — handed to `onMessage(message, form)` for another component to show (e.g. `appHeader.showAnnouncement(message)`). `remainingIndicator` (`NONE`, `BAR`, `TEXT`, `BAR_AND_TEXT`; default `BAR`, TOAST only): how a toast that closes by itself (6 s; not DANGER) shows the time left, through Message's `remainingIndicator`; use `NONE` where an indicator is not wanted (e.g. very frequent, minor confirmations). |
| `texts.*` | string | English defaults | Text | Always | `submit`, `apply`, `reset` ("Reset to initial values"), `clear` ("Clear all"), `cancel`, `summaryTitle` ("There is a problem"), `summaryText` ("Correct the following and try again."), `submitSuccess` ("Your changes were saved."), `confirmTitle`, `confirmText`, `confirmDiscard`, `confirmKeep`, `summaryItem` ("{label}: {message}", one summary entry), `requiredNote` ("* Required field"), `busy` ("Saving…", the Loader's label). |
| `onSubmit` | function | `null` | `(values, form) => void \| Promise` | `SUBMIT` | Called with valid values; a returned promise keeps the form busy until it settles. |
| `onChange` | function | `null` | `(values, form) => void` | `LIVE` | Called with valid values on Apply or after the pause. |
| `onValidate` | function | `null` | `(values, form) => [{ name, message }] \| null` | Always | Cross-field rules, run after all fields are valid. |
| `onReset` / `onClear` / `onCancel` | function | `null` | `(form) => void` | Always | Called after reset, after clear, or on Cancel. |

Live-only options in submit mode, submit-only options in live mode and `liveDelayMs` with `liveApply:'BUTTON'` are ignored with `OPTION_IGNORED`.

With the default `requiredNote:'AUTO'`, the note appears only when a field shows the asterisk. Summary entries name their field: "E-mail: Required." (label from `getLabel()`; entries for unknown fields show the message alone). Reset and Clear ask first when the values differ from the last submitted, applied or reset ones (`confirmReset`); programmatic `reset()` and `clear()` never ask. With `quietReset` (default) they call `setValue(value, { quiet:true })` on each field, so no errors appear; with `quietReset:false` fields validate and empty mandatory fields show their error at once. Both also remove the error summary and the message above the form.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onSubmit` | `(values, form)` | Submit button, Enter in a single-line field or `submit()`, with all fields and cross-field rules valid. | Errors exist (the summary is shown instead); the form is busy. |
| `onChange` | `(values, form)` | Live mode: Apply, the pause after a change (`AUTO`), reset or clear — with all fields valid. | Errors exist (shown next to the fields); the form is busy. |
| `onValidate` | `(values, form)` | During submit, apply or `validate()`, after all fields are valid. | Any field is invalid. |
| `onReset` / `onClear` / `onCancel` | `(form)` | The matching button or method. | — |

### Errors

Form has no user errors of its own: it shows its fields' errors, cross-field errors from `onValidate` and server errors from `showErrors()`. Before each submit or apply, the cross-field and server errors that Form set are removed and checked again. Developer errors prevent rendering (`renderForm()` returns `null`); warnings are logged and rendering continues. Console format: `Form "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_OPTION` | warning | Invalid enumerated value or number; the default is used. |
| `MESSAGE_TARGET_MISSING` | warning | `externalMessage.placement` `TOAST` without `toastArea`, or `EXTERNAL` without `onMessage`; messages are shown above the form. |
| `OPTION_IGNORED` | warning | Option that does not apply to the mode. |
| `INVALID_CHILD` | warning | A child is neither a string nor a function; ignored. |
| `FIELD_WITHOUT_NAME` | warning | A field without `name`; not included in the values. |
| `DUPLICATE_FIELD_NAME` | warning | Two fields with the same name; only the first is used. |
| `MIXED_LABEL_POSITIONS` | warning | Fields report different label positions. |
| `UNKNOWN_FIELD` | warning | An `onValidate` or `showErrors` entry names no field; shown in the summary only. |

### Accessibility

- A real `<form novalidate>`; Enter in a single-line field submits (or applies) through the Submit/Apply Button.
- The error summary is a DANGER Message (an alert): on a failed submit, focus moves to it so screen readers read it once, and each entry is a link that moves focus to its field. Success and other messages are announced politely (Message); the Reset/Clear confirmation is a modal dialog with "Keep editing" focused. Fields show their own messages linked through `aria-describedby`.
- `aria-busy` while saving; the main button is disabled so it cannot be pressed twice; the Loader announces "Saving…" when it appears (`OVERLAY` also makes the form inert).
- Label position and columns fall back to a single, labels-on-top layout in narrow containers.
- Field names and messages should be specific ("Enter your e-mail address"), because the summary shows the fields' messages as they are.

### Examples

Registration with sections, cross-field rule, server errors and busy state:

```js
const form = renderForm(formHost,
{
    id:'signup', columns:2, labelPosition:'START', showReset:true, warnUnsavedChanges:true,
    onValidate:( values ) => ( values.email !== values.emailConfirm ? [ { name:'emailConfirm', message:'The e-mail addresses do not match.' } ] : null ),
    onSubmit:async ( values, form ) =>
    {
        const response = await api.register(values);
        if ( response.errors ) { form.showErrors(response.errors); }   // e.g. [{ name:'email', message:'This e-mail address is already registered.' }]
    }
},
[
    host => renderContentGroup(host,{ id:'personal', label:'Personal data' },[
        h => renderTextInput(h,{ id:'first-name', name:'firstName', label:'First name', mandatoryIndicator:'MANDATORY_ASTERISK', texts:{ errors:{ REQUIRED:'Enter your first name.' } } }),
        h => renderCalendar(h,{ id:'birth-date', name:'birthDate', label:'Birth date', mandatory:false })
    ]),
    host => renderContentGroup(host,{ id:'contact', label:'Contact' },[
        h => renderTextInput(h,{ id:'email', name:'email', label:'E-mail', type:'EMAIL', mandatoryIndicator:'MANDATORY_ASTERISK' }),
        h => renderTextInput(h,{ id:'email-confirm', name:'emailConfirm', label:'Repeat e-mail', type:'EMAIL', mandatoryIndicator:'MANDATORY_ASTERISK' })
    ])
]);
```

Filter panel (live mode) reloading a table:

```js
renderForm(filterHost,{ id:'order-filters', mode:'LIVE', columns:4, showClear:true, showReset:true, onChange:( values ) => loadOrders(values) },
[
    host => renderSearchBox(host,{ id:'filter-q', name:'q', label:'Search', searchMode:'ON_DEMAND' }),
    host => renderSelect(host,{ id:'filter-status', name:'status', label:'Status', mandatory:false, selectionMode:'MULTIPLE', presentation:'CUSTOM', options:statusOptions }),
    host => renderCalendar(host,{ id:'filter-period', name:'period', label:'Period', range:true, mandatory:false, quickRanges:[ 'LAST_7_DAYS', 'LAST_1_MONTH' ] }),
    host => renderToggle(host,{ id:'filter-mine', name:'onlyMine', label:'Only mine' })
]);
```

The same live mode serves settings pages, calculators and previews: set `liveApply:'AUTO'` for instant results.

Success message in the application header (any non-field message can go the same way):

```js
renderForm(formHost,{ id:'profile', externalMessage:{ placement:'EXTERNAL', onMessage:( message ) => header.showAnnouncement(message) },
    onSubmit:values => api.saveProfile(values) },children);
```

### Files

| File | Responsibility |
| --- | --- |
| `formIndex.js` | Public entry point; the only import surface. |
| `formConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `formComponent.js` | Field discovery, values, validation, summary, submit/apply, reset/clear, busy state with the Loader, change detection, unsaved-changes warning, Buttons. |
| `formHTML.js` | Form shell, button and Loader hosts. |
| `formEvents.js` | Submit, summary links, change detection and unsaved-changes listeners. |
| `formErrors.js` | Developer error and warning catalog. |
| `form.css` | Presentation. |
| `formTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/form.test.mjs`). |
