# ContentGroup

## For business

### Overview

ContentGroup is a framed block that groups related content the user perceives as one unit: "Personal data", "Address", "Usage settings" or "Important information". It can hold static text, input fields, choice lists and other components, and looks the same whatever it contains.

### When to use

- Use it to frame related content that the user perceives as one unit: "Personal data", "Address", "Usage settings".
- Use CollapsiblePanel when the user opens and closes the content, and Accordion for several such sections.
- Use Form around groups of inputs that are submitted together.

### Key features

- A frame with an optional label in its top border, an optional title and description.
- Content stacked vertically or placed side by side, wrapping when space runs out.
- A whole group of inputs made unavailable at once.
- Groups nested inside groups, wider groups in multi-column layouts.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colors, spacing, borders and typography. |
| ContentGroup styles (`contentGroup.css`) | Always | Group appearance. |
| Styles of the components placed inside | When those components are used | Their own appearance; ContentGroup does not load them. |

### Not included

The application decides what goes into a group and in which order, and provides the multi-column layout a group can span. Validation, error summaries and submitting belong to the form, not to the group.

## For designers

### Structure

```text
fieldset#{id}.ui-content-group.ui-content-group-{direction}.ui-content-group-frame[.ui-content-group-bare]   (FIELDSET: content with inputs)
├── legend#{id}-label.ui-content-group-label                                          (optional; notches the border)
├── p#{id}-description.ui-content-group-description                                   (optional)
└── div.ui-content-group-content
    └── div.ui-content-group-item                                                     (one per child)
        └── child component or static HTML

section#{id}.ui-content-group…   (SECTION: static content)
└── fieldset.ui-content-group-frame  role="none"                                      (visual frame only)
    ├── legend#{id}-label.ui-content-group-label                                      (optional; notches the border)
    ├── h2…h6#{id}-title.ui-content-group-title                                       (optional)
    ├── p#{id}-description.ui-content-group-description                               (optional)
    └── div.ui-content-group-content > div.ui-content-group-item
```

Both semantics use the same frame: a `fieldset` whose `legend` notches the border natively, on any background; for `SECTION` the frame has `role="none"` and the outer `section` carries the semantics. The content area owns the gap between items; child components keep their own margins, so the visible spacing is gap plus child margin. Side by side, items share the row equally and wrap below `--size-md-1`; below a group width of `22rem` they stack. The local property `--ui-content-group-span` sets the number of parent-grid columns (ignored outside a grid). When disabled, inputs dim themselves; the group dims only its label and description.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Semantic | Field group, section | `fieldset.ui-content-group-frame`, `section` > `fieldset.ui-content-group-frame[role="none"]` |
| Label (notch) | Present, absent | `legend.ui-content-group-label`, — |
| Title (section only) | Present, absent | `h2…h6.ui-content-group-title`, — |
| Direction | Vertical, horizontal | `ui-content-group-vertical`, `ui-content-group-horizontal` |
| Border | With, without | —, `ui-content-group-bare` |
| Grid span | 1–12 columns | `style="--ui-content-group-span:N"` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Disabled | On (field group only) | `fieldset[disabled]` |

### Styling contract

`contentGroup.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-content-group-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-border`: frame (also bare), content group (bare)
  - `--c-text`: label, title
  - `--c-muted`: description
- Typography
  - `--font-ui`: label, title, description
  - `--fs-label`: label
  - `--fw-ui-strong`: label, title
  - `--lh-compact`: label, title
  - `--fs-block-title`: title
  - `--fs-caption`: description
- Borders and corners
  - `--border-thin`: frame
  - `--radius-control`: frame
- States and motion
  - `--opacity-disabled`: label (disabled), description (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--space-lg-1`: content group, frame
  - `--gap-tight`: frame, content
  - `--space-sm-2`: label
  - `--gap-form-field`: content (horizontal)
- Sizes
  - `--size-md-1`: item (horizontal)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Spacing
  - `--gap-tight`: content (horizontal + narrow)

**Set by the component — don't change**

- Variables
  - `--ui-content-group-span`: columns spanned in a parent grid (from `span`)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `contentGroupIndex.js`.
- Use ContentGroup for any group of related content; never write grouping markup (`fieldset`, `legend`, section headings) by hand.
- Choose `semantic:'FIELDSET'` when the group contains inputs (text may be mixed in) and `semantic:'SECTION'` for static content only.
- Name every group: `label` (border notch) for field groups; `label` and/or `title` (heading) for sections. `title` does not exist for field groups.
- Pass content as an ordered `children` array: static HTML strings, or functions `(host, group) => instance` that render a framework component into `host` through that component's own public API.
- Each child component is configured through its own README. ContentGroup never passes options down to children; configure every child directly.
- Do not wrap a single CheckboxRadio in a FIELDSET group; the list is already a named group.
- To put the labels of all fields in a group on the left, add the shared class `ui-labels-start` to the group's container element (fields with `labelPosition:'INHERIT'` follow it); inside a Form, use the Form's `labelPosition`.
- Keep business logic, validation and submitting in the consuming code; do not modify ContentGroup for application needs.
- Give each group a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again; it also destroys the children.

### Safety

- String children are inserted as HTML: escape any user-provided or external data first.
- Never use `SECTION` for content with inputs, or `FIELDSET` for static text only; the announcement to screen-reader users would be wrong.
- Never add special handling for particular child component types in ContentGroup.

### Example prompts

```text
Build a registration form with three ContentGroups: "Personal data" with first name, last name and optional e-mail TextInputs; "Address" with street, number, postal code and town side by side, spanning two grid columns; and "Usage settings" with an explanatory sentence and two CheckboxRadio lists.
```

```text
Put a SECTION ContentGroup labelled "Notice" with the title "Important information" and a short delivery notice inside the checkout CollapsiblePanel, above the address group.
```

## For developers

### Business analysis

> **Component**: the ContentGroup itself. **Consumer**: the developer who configures the ContentGroup in the application's code. **App**: the running application that uses the ContentGroup; it provides the data, performs the actions and stores the changes.

**Frame**

- Consumer provides a label (optional). <!-- BA-01 -->
  - Component displays the label in a gap of the frame's top border. <!-- BA-02 -->
- Consumer provides a title for a group of static content (optional). <!-- BA-03 -->
- Consumer provides a description (optional). <!-- BA-04 -->
- Component displays the frame with or without a border. <!-- BA-05 -->

**Content**

- Consumer provides the content: static text, inputs, lists and other components. <!-- BA-06 -->
- Consumer chooses vertical or side-by-side content. <!-- BA-07 -->
  - Component wraps side-by-side content when space runs out. <!-- BA-08 -->
  - Component displays the content vertically in narrow places, such as sidebars or dialogs. <!-- BA-09 -->
- Consumer adds groups inside groups (optional). <!-- BA-10 -->
- Consumer chooses a width of two columns for a group in a multi-column layout (optional). <!-- BA-11 -->

**Availability**

- App disables the group. <!-- BA-12 -->
  - Component disables every input inside at once. <!-- BA-13 -->

**Screen readers**

- Component announces a group of inputs as one named group, e.g. "Address, group". <!-- BA-14 -->
- Component exposes a group of static text as a named section, reachable by heading navigation when it has a title. <!-- BA-15 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no (container: `getChildren()`) · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderContentGroup, DEFAULT_CONTENT_GROUP_CONFIG, CONTENT_GROUP_SEMANTICS, CONTENT_GROUP_DIRECTIONS } from './contentGroupIndex.js';

const group = renderContentGroup(container, config, children); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. ContentGroup imports no other framework component.

`children` is an ordered array (a single item is accepted as a one-item array). Each item is:

| Child | Behavior |
| --- | --- |
| string | Trusted static HTML inserted into its own item host. |
| function `(host, group) => instance \| null` | Called once with an empty item host; renders anything into it. A returned object is kept as a child instance and its `destroy()` is called when the group is destroyed. |

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getChildren()` | array | Copy of the child instances returned by render functions, in order; lets a Form find fields inside the group. |
| `destroy()` | — | Destroys child instances, then clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Root id and prefix of internal ids. |
| `label` | string | `''` | Text | Always | Text in the border notch (`legend`). Names a `FIELDSET` group; names a `SECTION` when there is no title. Missing: `NAME_MISSING` warning when the group has no other name. |
| `title` | string | `''` | Text | `SECTION` | Heading inside the frame; names the section and makes it reachable through heading navigation. |
| `description` | string | `''` | Text | Always | Explanation below the label and title, linked through `aria-describedby`. |
| `semantic` | string | `'FIELDSET'` | `FIELDSET`, `SECTION` | Always | `FIELDSET`: content with inputs. `SECTION`: static content. |
| `headingLevel` | number | `3` | Integer 2–6 | `SECTION` + `title` | Heading level; choose it to keep the page outline correct. |
| `direction` | string | `'VERTICAL'` | `VERTICAL`, `HORIZONTAL` | Always | Item arrangement. |
| `span` | number | `1` | Integer 1–12 | Always | Parent-grid columns occupied, when the group is inside a parent grid. |
| `bordered` | boolean | `true` | — | Always | `false` removes border and padding. |
| `disabled` | boolean | `false` | — | `FIELDSET` | Disables every input inside (native `fieldset[disabled]`). |

`disabled` with `SECTION`, `title` with `FIELDSET` (use `label`) and `headingLevel` without a title are ignored with an `OPTION_IGNORED` warning.

### Errors

ContentGroup has no user-facing errors. Developer errors prevent rendering (`renderContentGroup()` returns `null`); warnings are logged and rendering continues. Children report their own errors. Console format: `ContentGroup "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `INVALID_OPTION` | warning | Invalid enumerated value, `headingLevel` or `span`; the default is used. |
| `OPTION_IGNORED` | warning | `disabled` with `SECTION`, `title` with `FIELDSET`, or `headingLevel` without a title. |
| `NAME_MISSING` | warning | A `FIELDSET` without `label`, or a `SECTION` without `label` and `title`: the group has no accessible name. |
| `INVALID_CHILD` | warning | A child is neither a string nor a function; ignored. |
| `FIELDSET_WITHOUT_CONTROLS` | warning | A `FIELDSET` group contains no `input`, `select` or `textarea` after rendering. |
| `REDUNDANT_GROUP` | warning | All inputs of a `FIELDSET` group are inside one nested `fieldset` (e.g. a single CheckboxRadio). |

The last two checks inspect native elements only, never other components' classes.

### Accessibility

- `FIELDSET`: native `fieldset` named by its `legend` (the label); `disabled` disables all inputs natively.
- `SECTION`: `section` labelled by its title (a real heading, in heading navigation) or, without a title, by its label; the inner frame is `role="none"`, so it adds no extra group.
- The description is linked with `aria-describedby`.
- The consumer chooses the right `semantic` and `headingLevel`, and makes the content itself accessible.

### Examples

Registration form sections with child components owned by the group:

```js
import { renderContentGroup } from './contentGroup/contentGroupIndex.js';
import { renderTextInput } from './textInput/textInputIndex.js';
import { renderCheckboxRadio } from './checkboxRadio/checkboxRadioIndex.js';

const address = renderContentGroup(addressHost,{ id:'address', label:'Address', direction:'HORIZONTAL', span:2 },
[
    host => renderTextInput(host,{ id:'street', label:'Street' }),
    host => renderTextInput(host,{ id:'number', label:'Number' }),
    host => renderTextInput(host,{ id:'postal-code', label:'Postal code' }),
    host => renderTextInput(host,{ id:'town', label:'Town' })
]);

const settings = renderContentGroup(settingsHost,{ id:'settings', label:'Usage settings' },
[
    '<p>Choose how we contact you.</p>',
    host => renderCheckboxRadio(host,{ id:'channels', groupLabel:'Channels', options:[ { value:'email', label:'Email' }, { value:'sms', label:'SMS' } ] }),
    host => renderCheckboxRadio(host,{ id:'frequency', groupLabel:'Frequency', selectionMode:'SINGLE', options:[ { value:'daily', label:'Daily' }, { value:'weekly', label:'Weekly' } ] })
]);

// Validate all inputs of the groups on submit (until a Form component exists):
const inputs = [ ...address.getChildren(), ...settings.getChildren() ];
const valid = inputs.map(input => input.validate()).every(result => result.valid);
```

A ContentGroup inside a CollapsiblePanel:

```js
renderCollapsiblePanel(panelHost,{ id:'step-address', title:'Delivery address', state:'EXPANDED' },
[
    host => renderContentGroup(host,{ id:'delivery-address', label:'Address' },[ groupHost => renderTextInput(groupHost,{ id:'delivery-street', label:'Street' }) ])
]);
```

### Files

| File | Responsibility |
| --- | --- |
| `contentGroupIndex.js` | Public entry point; the only import surface. |
| `contentGroupConfig.js` | Defaults, allowed values, normalization, developer validation. |
| `contentGroupComponent.js` | Lifecycle, child rendering and ownership, semantic checks, runtime API. |
| `contentGroupHTML.js` | Group shell markup. |
| `contentGroupErrors.js` | Developer error and warning catalog. |
| `contentGroup.css` | Presentation. |
| `contentGroupTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/contentGroup.test.mjs`). |
