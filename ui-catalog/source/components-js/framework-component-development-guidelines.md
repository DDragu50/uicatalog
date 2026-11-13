# Framework Component Development Guidelines

## 0. How to use this document

These rules apply to every framework component, new or changed. They are written for developers and for AI assistants that generate complete components, including components that consume other framework components.

- **Sources of truth:** the current component files define the implementation, and `componentREADME.md` defines the usage contract. This document defines how both are built. Uploaded files override older versions from a conversation.
- **Precedence:** the specific rules in sections 3–13 override the general principles in section 1.
- **Ambiguity:** when several reasonable behaviors exist and this document does not decide, ask for a decision instead of choosing silently.
- **Reference implementations:** Button, Chip, TextInput, CollapsiblePanel, CheckboxRadio, ContentGroup, SearchBox, TextArea, Select, Toggle, Calendar, Form, Pagination, ActionMenu, Table, Breadcrumbs, SideNavigation, TopNavigation, AppHeader, Message, Notification and Badge follow these rules. Use them as examples.

## 1. Principles

- **Independence:** a component depends only on the design system, external libraries it declares, and other framework components through their public entry points. There are no shared utility modules between components. Small helpers (section 13) are duplicated identically in each component.
- **Generic scope:** add behavior only when it is reusable across applications. Business rules, server checks, workflows, persistence, analytics and domain formatting belong to the consumer.
- **Native first:** use native elements and semantics (`<button>`, `<input>`, `<fieldset>`/`<legend>`, `label for`, `disabled`, keyboard behavior). Replace or supplement native behavior only when the contract requires control the browser does not give, and document why.
- **Composition:** reuse existing framework components instead of reproducing their markup, styles, validation, accessibility or events. The parent decides where and why a child is used. The child keeps its own behavior and presentation.
- **Minimal contract:** no speculative options, no setters added for symmetry, no component-specific exceptions in generic code.

## 2. Files

Create only files that have a real responsibility; a small component may merge roles. Each file starts with the header defined in section 13.

| File | Header role | Responsibility |
| --- | --- | --- |
| `xIndex.js` | PUBLIC ENTRY POINT | The only import surface; re-exports the public API. The header summarizes signatures and callback rules. |
| `xConfig.js` | CONFIGURATION CONTRACT | Defaults, allowed values, normalization, developer validation (`validateXConfig`). |
| `xComponent.js` | COMPONENT COORDINATOR | Lifecycle, runtime API, error lifecycle, child-component composition. |
| `xHTML.js` | GENERATED MARKUP | Markup from normalized configuration; no DOM access, no events. |
| `xEvents.js` | USER INTERACTIONS | Listener registration; returns or uses an `AbortController`. |
| `xState.js` | RUNTIME STATE | Creation of per-instance runtime state. |
| `xValidation.js` | VALIDATION RULES | Pure validation functions returning `{ valid, errorLabel }`. |
| `xHelpers` (e.g. `calendarDates.js`) | PURE HELPERS | Optional, for complex components: pure domain helpers (e.g. date arithmetic, formatting) without DOM access or state. |
| `xErrors.js` | ERROR CATALOG | User error catalog, developer error and warning catalog, reporter. Required for every component. |
| `x.css` | — | Presentation, plus the header documenting the generated DOM. |
| `xREADME.md` | — | Usage contract (section 15). |
| `xTESTS.md` | — | Test plan: the cases that prove the README, tied to its Business analysis codes, callbacks and error labels (section 14). Its "auto" cases have code in `tests/components/x.test.mjs`. |

The README's `### Files` table lists every file of the folder with its responsibility, the test plan included; `npm run check` reports a file that is missing from it.

## 3. Public API

- Export from `xIndex.js` only what consumers need:
  - `renderX(container, config, ...callbacks)`;
  - `DEFAULT_X_CONFIG`;
  - the enum arrays (`X_SIZES`, …).
- Never export internal helpers (validation functions, event registration, HTML builders, state functions).
- Export markup-only builders (`buildX(config)` returning an HTML string) only for **static** components whose markup is complete without events (e.g. Chip). Interactive components expose only `renderX`.
- `renderX()` returns a runtime instance, or `null` after a developer error (nothing rendered).
- The instance contains `id` and only methods with a real consumer need. Typical members:
  - `getValue()`, which returns a copy for arrays and objects;
  - `getError()`, which returns a copy or `null`;
  - `validate()`, which returns `{ valid, errorLabel }`;
  - `focus()` on every input component, which moves focus to the (first relevant) control and returns whether it succeeded;
  - `destroy()`.
- No `_private` members on the instance. Internal coordination uses closures inside `renderX`.
- Consumer callbacks are arguments of `renderX` or configuration properties. When both exist for the same event, the configuration callback takes precedence and exactly one runs.

## 4. Configuration

- Normalize the configuration once in `mergeXConfig()`. The normalized configuration is never mutated afterwards (freeze it when practical), and initial values remain available in it.
- Validate the normalized configuration in `validateXConfig()`, which reports and returns the developer error label, or `null`.
- **Enumerated values:**
  - Canonical values are UPPER_SNAKE_CASE (`ICON_BUTTON`, `FIT_CONTENT`).
  - Input is accepted case-insensitively, with `-` treated as `_`.
  - A missing value (`undefined`, `null`, `''`) takes the default silently.
  - An invalid supplied value takes the default and produces an `INVALID_OPTION` warning.
  - `''` means "not set" only for optional native attributes (e.g. `inputMode`); otherwise use an explicit value such as `DEFAULT`.
- **Other values:** numbers and class-name strings are validated; invalid supplied values fall back with a warning (`INVALID_OPTION`, `INVALID_ICON_CLASS`).
- **Conditional options:** define for each option when it applies. A supplied option that does not apply is ignored with an `OPTION_IGNORED` warning. Conflicts and precedence are explicit (e.g. `OPTIONS_CONFLICT`).
- **Nesting:** group options that belong to one capability (`validation.*`, `iconArea.*`).
- **UI texts:** every user-visible text owned by the component comes from one optional `texts` object with English defaults. Placeholders use `{name}`. Empty values fall back to the default. User error messages live in `texts.errors.{LABEL}`, or in a named key for a component with a single error.
- **Design tokens as options:** accept design-system token names (`--c-surface`), never literal colors.
- **Mandatory inputs:** every input component has:
  - `mandatory:true` by default (inputs are mandatory unless stated otherwise);
  - `mandatoryIndicator: 'NONE' | 'OPTIONAL_TEXT' | 'MANDATORY_ASTERISK'`, default `NONE`. `OPTIONAL_TEXT` shows `texts.optional` ("(Optional)") next to non-mandatory inputs and is the expected choice when an input is set to `mandatory:false`. `MANDATORY_ASTERISK` shows `*` (`aria-hidden`) next to mandatory inputs. One style is used per form; the asterisk needs a form-level explanation ("* Required field").
- **Meaning of mandatory:** a mandatory input needs a value; a mandatory choice list needs at least one selected option. Several checkboxes that must each be checked are separate lists. Mandatory inputs must have a visible label or group label (developer error otherwise). Error labels keep the word `REQUIRED` (e.g. `REQUIRED`, `REQUIRED_SELECTION`).

## 5. Lifecycle and state

- **Container:** a dedicated, consumer-owned mount point. `renderX` replaces its content, and `destroy()` clears it. Components never create, style or remove the container.
- **Required checks before rendering:**
  - a missing container is a `CONTAINER_REQUIRED` error;
  - a missing `id` is an `ID_REQUIRED` error;
  - an existing element with the same id (`document.getElementById`) is a `DUPLICATE_ID` error;
  - collections without DOM ids reject duplicate item ids within the collection.
- **Ids: rules for the Consumer, and what the check does not catch.** The duplicate check runs once, when the component renders, and compares only its own id with the elements already in the page. So the Consumer:
  - renders into a container that is already in the page: two components rendered into containers that are not yet attached can get the same id without an error;
  - gives no other element an id that starts with a component's id followed by `-`: components derive their inner ids from their own (`{id}-input`, `{id}-error`, `{id}-title`, …), which link labels, fields and messages;
  - prefixes ids by page area or feature (`orders-search`, `orders-table`), so parts of a page written separately cannot collide.

  Not caught by the check: an element with the same id added to the page later; a duplicate among containers not yet in the page; a clash with one of the inner ids. After `destroy()` the id is free again and may be reused (intended).
- **State:** per instance, created in `xState.js` and held in the `renderX` closure. No module-level registries. Store only what cannot be derived. Where a native element holds the truth (e.g. `input.checked`, `button.disabled`), read it instead of duplicating it.
- **Render once:** markup is generated once per instance. Runtime changes (value, errors, ARIA attributes, selection visuals, summaries) are applied in place. Never re-render the whole component for a state change, because that loses focus, cursor position and input composition, and re-creates listeners.
- **Destroy order:** abort listeners (one `AbortController` per instance), clear timers, destroy child instances, then clear the container.

## 6. User and programmatic interaction

```text
USER:    native event → interaction rules → accepted value → state → validation → error display → callbacks
SYSTEM:  runtime method → same invariants → state → validation → error display → callbacks only if the contract says so
```

- Both paths preserve the component's invariants (e.g. maximum length applies to the initial value, user input and `setValue()`).
- Programmatic changes do not mark the component dirty and do not fire value-change callbacks.
- A rejected user action is not a value change. A partially accepted action fires the value-change callback only if the stored value actually changed.
- Temporary feedback about a rejected action does not change the effective validation result.

## 7. Validation

- Components validate only generic, unambiguous rules. Business, cross-field and asynchronous validation belong to the consumer.
- **One validation model.** The component or the consumer decides when errors appear (input, blur, explicit `validate()`, programmatic update). The browser never does:
  - never emit `required`, `minlength`, `maxlength` or `pattern`;
  - mark mandatory fields with `aria-required="true"`;
  - keep `min`, `max` and `step` on number inputs only because they drive spinners and keyboards;
  - forms containing framework inputs use `<form novalidate>`.
- **When errors appear:**
  - on explicit `validate()` or a programmatic update;
  - on blur (or when focus leaves a group) only if the user changed the value (dirty). Tabbing through untouched inputs never shows errors;
  - never on render or focus;
  - once visible, a corrective error clears as soon as its cause disappears.
- **Announcing errors belongs to the consumer.** Field errors are not live regions (no `role="alert"`, no `aria-live`); they are linked with `aria-describedby` and read when the user reaches the field. On submit, the consumer:
  - validates every input;
  - builds an error summary at the top of the form (heading plus one link per error, message from `getError()`);
  - moves focus to the summary;
  - makes each link call the input's `focus()`.
  Until a Form component exists, this is application code.
- Validation-result callbacks fire only when the effective result `{ valid, errorLabel }` changes.
- Validation functions are pure and live in `xValidation.js`; display and lifecycle stay in the coordinator.

## 8. Errors and developer messages

Every error has a stable label. `xErrors.js` holds up to two catalogs and one reporter.

| Catalog | Entries | Audience and channel |
| --- | --- | --- |
| `X_ERRORS` | `{ errorLabel, source:'validation' or 'component', severity:'error', visibility }` | End user through the consumer: `getError()`, callbacks, rendered message. Message from `texts`. |
| `X_DEVELOPER_ERRORS` | `{ errorLabel, message, source:'developer', severity:'error' or 'warning', visibility:'console' }` | Developer only: the console. Never exposed through `getError()` or callbacks. |

| Visibility | Meaning |
| --- | --- |
| `corrective` | Visible until the cause is corrected. |
| `temporary` | The component already corrected the cause; visible for a configured duration. |
| `dismissible` | Visible until explicitly dismissed. |
| `console` | Developer error or warning written to the console. |

- **Severity of developer messages:**
  - `error`: the component (or a collection item) is not rendered;
  - `warning`: the value is normalized or ignored and rendering continues.
- **Labels:** UPPER_SNAKE_CASE, unique within the component, never renamed (retire instead).
- **Shared label names for common cases:** `CONTAINER_REQUIRED`, `ID_REQUIRED`, `DUPLICATE_ID`, `INVALID_OPTION`, `INVALID_ICON_CLASS`, `OPTION_IGNORED`, `OPTIONS_CONFLICT`; for application actions (§10.2) `INVALID_ACTION`, `DUPLICATE_ACTION_KEY`, `UNKNOWN_ACTION`, `ACTION_HANDLER_MISSING`. Developer messages use `{name}` placeholders.
- **Reporting:** developer messages are written only through `reportXIssue(errorLabel, values)` (section 13). No `console.warn` or `console.error` calls exist outside `xErrors.js`. Output format: `X "id" [LABEL]: message`.
- **Scope:** the component owns only its current user error. Error history, aggregation and business errors belong to the consumer.
- **Documentation:** document each user error with its trigger, visibility and clearing condition.

## 9. Callbacks

- Add a callback only for an outcome consumers genuinely need to observe. Name it by outcome (`onValueChange`, `onValidation`, `onToggle`, `onRemove`).
- **Arguments:** the payload first, the instance last: `(value, instance)`, `(result, instance)`. Arrays and objects are passed as copies.
- Define and document firing and non-firing cases: user versus programmatic, and disabled states.
- Result callbacks fire only when the effective result changes. Callbacks are never needed for the component's own state.
- When a parent consumes a child's callback internally, expose a parent callback only if the parent-level event is useful.

## 10. Composition

- **Two ways to use another component:**
  - **Declared dependency:** the parent imports the child from its `xIndex.js` and creates it with `renderX` or static `buildX`, because the child is part of the parent's own contract (e.g. CollapsiblePanel header Buttons).
  - **Container children:** the consumer supplies the content (e.g. ContentGroup items, CollapsiblePanel content). The container accepts an ordered `children` array of static HTML strings or render functions `(host, owner) => instance | null`. It creates one item host per child, keeps returned instances, destroys them first in its own `destroy()`, and exposes them (`getChildren()`) when useful.
- **Container discovery:** every component that renders children through render functions exposes `getChildren()` (a copy of the returned instances), so coordinators such as Form can find fields at any depth without knowing the container type.
- **Form-field contract:** every input component follows the contract in §10.1, so Form can coordinate it.
- **Shared areas:** a component may add its elements to a shared, application-provided area instead of replacing its content only when several instances must coexist there (e.g. Message toasts in the toast area); `destroy()` then removes only its own elements.
- **Global CSS properties:** a component may set a documented page-level custom property only when it owns that concern and restores it on `destroy()` (e.g. AppHeader sets `--page-sticky-offset`).
- **New components:** check whether a new input can honour the form-field contract (§10.1). If it cannot, document it in its README as "not a Form field — build it yourself": the application handles its value, validation and errors next to the Form.
- **Containers stay independent:** a container never imports, configures or special-cases child component types. Checks on content inspect native elements only (`input`, `fieldset`, …), never other components' classes.
- Give each child instance its own dedicated container (a host element), because child containers are also cleared on destroy.
- Pass child configuration objects through unchanged (e.g. `chips:[…]`). Map to a subset only when the parent's contract requires it. Children report their own configuration errors. Buttons are the exception: application buttons follow the actions contract (§10.2), never pass-through Button configurations.
- The parent owns the child's lifecycle: create after the parent markup exists, destroy in the parent's `destroy()`. When a child must change and has no API for it, destroy and re-render that child only.
- Parent CSS may control child placement (gap, alignment, wrapping) but never the child's internal appearance.
- Interactive embedded actions use the Button component, never ad-hoc clickable elements (§10.2). Static icons and interactive actions in the same area are mutually exclusive, with documented precedence.


### 10.1 Form-field contract

Form is a **coordinator**: it never imports, inspects or styles its fields. It finds them among its children (and inside containers through `getChildren()`) and talks to them only through the members below, found by duck typing. Every input component (TextInput, TextArea, Select, CheckboxRadio, Toggle, Calendar, SearchBox, UploadFiles, and future ones) exposes them on its instance, with the same meaning everywhere.

| Member | Required | Returns / does | How Form uses it |
| --- | --- | --- | --- |
| `name` | Yes | The configured `name` option (defaults to `id`). | Key of the field's value in `getValues()`; fields without a name are skipped (`FIELD_WITHOUT_NAME`). |
| `getValue()` | Yes | A copy of the current value. | Collects values; detects changes and unsaved data. |
| `setValue(value)` | Yes | Sets the value programmatically (no `onValueChange`, not dirty) and returns `{ valid, errorLabel }`. | `setValues()`, Reset (initial values) and Clear all (empty values of the same shape). |
| `validate()` | Yes | Runs final validation, shows or clears the field's error, returns `{ valid, errorLabel }`. | Submit and Apply: one call per field. |
| `getError()` | Yes | A copy of the current error (`{ errorLabel, message, … }`) or `null`. | Text of the field's entry in the error summary. |
| `focus()` | Yes | Moves focus into the field; returns whether it succeeded. | Error-summary links; `form.focus()`. |
| `getLabel()` | Yes | The field's visible label text (or group label). | Prefixes summary entries: "{label}: {message}" (`texts.summaryItem`), so the summary names the field. |
| `getLabelPosition()` | Yes | `'TOP'` or `'START'` (the option `labelPosition: 'TOP' \| 'START' \| 'INHERIT'` resolved; `INHERIT` = left inside an element with the shared class `ui-labels-start`, left only while the nearest size container is at least 36rem wide). | `MIXED_LABEL_POSITIONS` warning when fields differ. |
| `getMandatoryState()` | Yes | `{ mandatory, indicator }` with `indicator` `'NONE' \| 'OPTIONAL_TEXT' \| 'MANDATORY_ASTERISK'`. | `requiredNote:'AUTO'`: shows "* Required field" when at least one field is mandatory with the asterisk. |
| `setError(message)` / `clearError()` | Optional | Shows / removes an external error (label `EXTERNAL`), cleared by a user change. Components without an error display (e.g. SearchBox) omit them. | Cross-field rules (`onValidate`) and server errors (`showErrors()`); without them, the error appears only in the summary. |

Rules:

- **Same meaning everywhere:** a member behaves identically in every input component; component-specific behaviour stays behind it (e.g. CheckboxRadio's `getLabel()` returns its group label).
- **No other access:** Form must not read configuration objects, DOM, classes or internal state of a field; everything it needs is in the table. If a new need appears, extend the contract here and in all input components at once.
- **Options behind the members:** every input component offers the options the contract reflects: `name`, `label` (or group label), `labelPosition`, `mandatory` and `mandatoryIndicator`.
- **Values are data:** a value is made of strings, numbers, booleans, `null`, arrays and plain objects, plus files (`File` / `Blob`, e.g. UploadFiles). Form copies plain values and keeps files as they are (never copied); it compares files by name, size, type and date.
- **Containers:** components that render children through render functions expose `getChildren()`; content rendered lazily (e.g. a collapsed CollapsiblePanel) is found once rendered.
- **Checking a new input:** implement every required member; if one cannot be implemented meaningfully, the component is not a Form field (see §10, New components).
### 10.2 Buttons inside components

Every Button a component shows is created through the Button entry point (`renderButton`), in its own host. There are two kinds, and each has one contract.

**Owned buttons** belong to the component's own behaviour (Form's Submit / Reset / Clear all / Cancel, the close × of a Message, SearchBox's Search button, Calendar's Today / Clear, a rail toggle). They are switched on with a named boolean option (`showReset`, `showSearchButton`, `showToday`), named through `texts`, and report through a named callback (`onCancel`, `onSearch`). The component fixes their variant, size and order; at most a documented option changes one visual aspect (e.g. `searchButtonHierarchy`).

**Application actions** are buttons whose meaning the application decides (Edit, Export, Open, Print, Undo…). Every component that accepts them uses the same contract:

| Part | Contract |
| --- | --- |
| Option | `actions` — an array of `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`. A component with more than one group prefixes the name by context (`selectionActions` / `onSelectionAction`). |
| `key` | Non-empty, unique in the group; reported to the callback. |
| `label` | Non-empty visible text; with `iconOnly` it becomes the accessible name (never a separate `ariaLabel`). |
| `icon` | Font Awesome classes before the label (`INVALID_ICON_CLASS` for invalid tokens). |
| `iconOnly` | Only the icon is shown; needs `icon` (otherwise `OPTION_IGNORED` and the label is shown). |
| `hierarchy` | `PRIMARY`, `SECONDARY`, `TERTIARY`; missing: the component's documented default; invalid: `INVALID_OPTION` and the default. |
| `disabled` | Initial state; changed at runtime with `setActionDisabled(key, disabled)` (returns whether the key exists; unknown keys: `UNKNOWN_ACTION`). |
| Callback | `onAction(key, context?, instance)` (configuration property): `context` only when the action acts on something the component owns (TreeView: the current item; Stepper: the current step; Table: the selection), the instance last. |
| Without a callback | `ACTION_HANDLER_MISSING` warning and the Buttons are rendered disabled — unless pressing has a documented built-in effect (a MODAL Message closes). |
| Availability by context | When an action's availability depends on a changing context (e.g. the current item), the component offers `canAct(key, context, instance) → boolean` and applies it whenever the context changes; an action is enabled only when it is not disabled, the context allows actions and `canAct` agrees. |
| Target description | When the actions act on a changing target, each Button's description (`setDescription`) names it, so screen readers hear e.g. "Rename, Invoice 01.xlsx". |
| Errors | `INVALID_ACTION` (no key or label; dropped), `DUPLICATE_ACTION_KEY` (the later one dropped), plus the shared `INVALID_OPTION`, `INVALID_ICON_CLASS`, `OPTION_IGNORED`, `UNKNOWN_ACTION`, `ACTION_HANDLER_MISSING`. |
| Extensions | A component may add item keys for its own semantics only (Message `cancel`), documented in its README; never Button options (`id`, `size`, `width`, `onClick`). |

Presentation, for both kinds:

- **Size:** `SMALL` inside components (a component that fixes another size documents why).
- **Markup:** the group is `div` or `span.ui-x-actions` (or the component's toolbar), each Button in its own host `span.ui-x-action` (owned buttons: hosts with `data-button="{name}"`). Button ids are generated from the component id (`{id}-action-{index}`), never supplied by the application.
- **Spacing and wrapping:** the gap between Buttons of one group is `--gap-inline-items`, owned by the group (`gap`, never margins), and the group wraps (`flex-wrap:wrap`).
- **Single slots:** a component with room for one application button (TextInput inside its field) still takes `actions` (at most one, icon-only; extra entries: `OPTION_IGNORED`).
- **Implementation:** normalize with the canonical `normalizeActions()` and build each Button with `buildActionButtonConfig()` (§13); document `actions`, `onAction`, `setActionDisabled` and the action errors in the README with the wording of this section.

## 11. Accessibility

Target WCAG 2.2 AA behavior. Final page conformance also depends on the consumer.

- Use native semantics, and give every interactive control an accessible name. An icon-only control requires `ariaLabel`, or a warned fallback from `texts`.
- Associate labels, help and errors programmatically (`for`, `aria-labelledby`, `aria-describedby`). A visible error sets `aria-invalid="true"`; it is not announced by the component (section 7).
- Mandatory status is announced by `aria-required="true"` where the role supports it; otherwise by visually hidden text from `texts` (e.g. in a checkbox group's `legend`). The visual asterisk is always `aria-hidden`.
- Expose state (`aria-expanded`, `aria-pressed`, `aria-required`) and keep keyboard operation and a visible focus indicator.
- Mark decorative icons `aria-hidden`; never hide a container that may hold interactive content.
- Never convey meaning by color alone; add shape, text or an icon.
- When the native control is visually replaced (icons, chips), keep it in the DOM, focusable, and visually hidden with the clip technique, not `display:none`.

### 11.1 Shared behaviour (every component)

Every component provides the behaviour below. It is part of the framework contract, is checked before delivery (§18), and is **not** repeated in READMEs: a README mentions only additions (e.g. TreeView's typing-to-jump) or documented deviations.

**All components**

- User operates the component with a mouse, a touch screen or the keyboard (Tab to reach it, Enter or Space to activate, Escape to close what it opened).
- Component displays a visible focus indicator on the focused control.
- Component exposes names, roles and states to screen readers; decorative icons are hidden from them, and meaning never depends on colour alone.
- Consumer provides every user-visible text through `texts` (English by default), so the component can be translated.
- Component mirrors its layout in right-to-left languages.
- Component follows the design system: colours, type, spacing and corners come from tokens, including the dark theme.
- Component replaces motion with an instant change when the user prefers reduced motion.
- Component adapts to the width of its container (container queries), not only to the window.
- Component reports configuration mistakes to the developer console and keeps working with safe defaults where possible.
- Component reports user actions through callbacks; programmatic changes never fire them.

**Input components** (the form-field contract, §10.1)

- Component displays a label, an optional help text, and an "(Optional)" text or a "*" mark when the Consumer chooses one.
- Component checks the value when the user leaves the field after changing it, or when the App checks the form; moving through with Tab never displays errors.
- Component displays the error below the field until the user corrects it.
- Component displays a field in four states: editable, read-only, unavailable or hidden (where the input supports them).
- App moves the user to the field from the form's error summary.

## 12. CSS and generated markup

- **Prefix:** every class and every component-local custom property uses `ui-` plus the component name in kebab-case (`ui-text-input-field`, `--ui-chip-custom-bg`). Class parts derived from enums are lowercase kebab-case (`FIT_CONTENT` → `-fit-content`).
- **Layer:** all rules sit inside `@layer components { … }`.
- **Tokens:** use only design-system tokens that exist. Before referencing a token, verify it in `design-system.css`; a missing custom property silently invalidates the declaration. When no fitting token exists, add a semantic token to the design system instead of a literal.
- **Allowed literals:**
  - `0`, `1`, `100%`, and `50%` for circles;
  - `em` proportions relative to the component's own font size, documented in the CSS header;
  - media-query breakpoints, because custom properties do not work in media queries.
- **Standard tokens:** focus uses `--focus-outline` and `--focus-offset`, disabled uses `--opacity-disabled`, error text uses `--c-danger-text`.
- **Typography roles:** every text gets its family, size, weight and line height only from a text role of `design-system.css` ("TEXT ROLES"): `--font-<role>`, `--fs-<role>`, `--fw-<role>`, `--lh-<role>`, defined together for each kind of text (body, p, lead, h1–h6, ui, code). Never use typography primitives (`--font-sans`, `--fs-sm`, `--fw-bold`) or literals, except `em` proportions documented in the CSS header. Running text (paragraphs, list items, descriptions) inherits the body role and gets no size or weight of its own; component text uses the ui roles (`--font-ui`, `--fs-control` / `--fs-label` / `--fs-caption`, `--fw-ui*`, `--lh-body` / `--lh-compact`). A new kind of text gets a new role in the design system, never a local value. The same rule applies to an application's own stylesheets (e.g. `app.css`).
- **State in CSS:** state is expressed through native attributes and pseudo-classes (`:disabled`, `:checked`, `[aria-invalid="true"]`, `:focus-visible`), `data-*` attributes or modifier classes, not inline styles. Inline styles only carry per-instance values as local custom properties.
- **Spacing ownership:** each spacing relationship has its own rule on its owner. Use `gap` on the container, not margins that imitate gaps. Buttons of one group are `--gap-inline-items` apart (§10.2).
- **Header:** every CSS file starts with a header showing the default generated DOM, its conditional structures, and any deliberate literal.
- **Tooltips (`tooltipMode`):** a component that shows hints on hover — names of icon-only Buttons, cut-off text, hidden labels — has the option `tooltipMode` with the values `NONE`, `TITLE` (the browser's `title`, mouse only) and `TOOLTIP` (the Tooltip component: also on keyboard focus and long press, styled, WCAG 1.4.13), exported as `X_TOOLTIP_MODES`. The default keeps what the component did before: `TITLE` where it used `title`, `NONE` where it showed nothing. Icon-only Buttons receive it as Button's `tooltipMode` (through `buildActionButtonConfig()` for actions); in a component whose own hints default to `TITLE`, its icon Buttons get only `TOOLTIP` (with `TITLE` or `NONE` they show nothing, as before). Hints in the markup are written with `hintAttribute()` (`title`, `data-tooltip` or nothing); with `TOOLTIP` one Tooltip (`targets`, selector `[data-tooltip]`, `onlyWhenTruncated` for cut-off text) is created in a `span.ui-tooltip-host` after the component's root by `attachHintTooltip()`; it marks the root with `data-tooltip-scope` and shows only the hints whose nearest marked root is its own (hints inside a nested component are left to that component; an outer component puts a hint about a nested component on its own host element around it). The Tooltip module is imported dynamically (`import('../tooltip/tooltipIndex.js')`), only with `TOOLTIP`: it is an optional dependency, listed in the README Dependencies table as needed when `tooltipMode` is `TOOLTIP`, and not counted as a static import. A component that renders other components passes `tooltipMode` to them unless their own configuration sets it.
- **Three parts (styling contract):** after the header, the rules are grouped in three parts, each opened by a comment: `1. APPEARANCE — change freely` (colours, type, borders, corners, motion: only the look changes), `2. DIMENSIONS — change with care` (sizes and spacing: the component keeps working, its size changes) and `3. STRUCTURE — do not change` (layout, behaviour, states, accessibility). A class can appear in several parts, each time with other properties. Variables the component's JavaScript writes are named `--ui-x-…`, documented in the header and never set by a stylesheet. The README's Styling contract (§15) lists the tokens of each part.

## 13. JavaScript conventions

- **File header** in every JS file:

```js
// xConfig.js
//
// CONFIGURATION CONTRACT.
// One or two lines on the file's responsibility.
```

- **Function comments:** one concise comment immediately before every function, stating its role.
- **Layout:** compact code; complete statements on one line when readable; no commented-out code; no duplicate event registration.
- **Canonical helpers:** copy these helpers identically into the component files that need them (replace `X`). `fitPopupInWindow` is for popups positioned absolute inside the component (NotificationsPanel, Breadcrumbs siblings, TopNavigation dropdowns); top-layer popovers (ActionMenu, Select, Calendar, SideNavigation flyout) place themselves with position:fixed:

```js
// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Converts a canonical enum value into its lowercase kebab-case CSS class part.
function toClassPart( value ) { return value.toLowerCase().replace(/_/g,'-'); }

// Returns the canonical UPPER_CASE value; warns and falls back when a supplied value is not allowed.
function normalizeEnum( id, key, value, allowed, fallback )
{
    if ( value === undefined || value === null || value === '' ) { return fallback; }
    const normalized = String(value).trim().toUpperCase().replace(/-/g,'_');
    if ( allowed.includes(normalized) ) { return normalized; }
    reportXIssue('INVALID_OPTION',{ id, key, value, fallback });
    return fallback;
}

// Keeps valid CSS class tokens and warns when invalid tokens are dropped.
function normalizeIconClass( id, key, value )
{
    const tokens = String(value ?? '').trim().split(/\s+/).filter(Boolean);
    const valid = tokens.filter(token => /^[a-zA-Z0-9_-]+$/.test(token));
    if ( valid.length !== tokens.length ) { reportXIssue('INVALID_ICON_CLASS',{ id, key }); }
    return valid.join(' ');
}

// Normalizes application actions { key, label, icon?, iconOnly?, hierarchy?, disabled? } (§10.2): entries without key or
// label and duplicate keys are dropped; invalid icon classes and hierarchies fall back with a warning. path is the option
// name (e.g. 'actions'); defaultHierarchy '' leaves a missing hierarchy to the component (an invalid one becomes SECONDARY).
function normalizeActions( id, path, actions, defaultHierarchy )
{
    const seen = new Set();
    return ( Array.isArray(actions) ? actions : [] ).map(( action, index ) =>
    {
        const key = String(action?.key ?? '').trim(), label = String(action?.label ?? '').trim();
        if ( !key || !label ) { reportXIssue('INVALID_ACTION',{ id, key:path, value:index }); return null; }
        if ( seen.has(key) ) { reportXIssue('DUPLICATE_ACTION_KEY',{ id, key:path, value:key }); return null; }
        seen.add(key);
        const icon = normalizeIconClass(id,`${path}[${index}].icon`,action.icon);
        if ( action.iconOnly && !icon ) { reportXIssue('OPTION_IGNORED',{ id, key:`${path}[${index}].iconOnly`, condition:'the action has no icon' }); }
        return { key, label, icon, iconOnly:Boolean(action.iconOnly) && Boolean(icon), hierarchy:action.hierarchy === undefined || action.hierarchy === null || action.hierarchy === '' ? defaultHierarchy : normalizeEnum(id,`${path}[${index}].hierarchy`,action.hierarchy,[ 'PRIMARY', 'SECONDARY', 'TERTIARY' ],defaultHierarchy || 'SECONDARY'), disabled:Boolean(action.disabled) };
    }).filter(Boolean);
}

// Returns the Button configuration of a normalized application action (§10.2): SMALL, the action's hierarchy or the
// component's default; icon-only actions are icon buttons named by their label, shown on hover as tooltipMode says.
function buildActionButtonConfig( id, action, defaultHierarchy, disabled = action.disabled, tooltipMode = 'NONE' )
{
    const base = { id, hierarchy:action.hierarchy || defaultHierarchy, size:'SMALL', disabled };
    return action.iconOnly ? { ...base, buttonVariant:'ICON_BUTTON', icon:action.icon, ariaLabel:action.label, tooltipMode } : { ...base, label:action.label, iconBefore:action.icon };
}

// Keeps an open popup inside the window. The popup is placed by its stylesheet (position:absolute, under the element
// it is positioned in, aligned to that element's start or end); this moves it to the other alignment when it does not
// fit on its side of the window, above the element when there is no room below (and more room above), keeps it inside
// the window as a last resort and limits its height when neither side has room. Called on open, scroll and resize.
function fitPopupInWindow( popup, alignEnd )
{
    const GAP = 8;
    [ 'left', 'right', 'top', 'bottom', 'max-block-size' ].forEach(property => popup.style.removeProperty(property));
    const parent = popup.offsetParent;
    if ( !parent || popup.hidden ) { return; }
    const anchor = parent.getBoundingClientRect(), box = popup.getBoundingClientRect(), style = getComputedStyle(popup);
    const marginTop = parseFloat(style.marginTop) || 0, marginLeft = parseFloat(style.marginLeft) || 0;
    const originLeft = anchor.left + parent.clientLeft, originTop = anchor.top + parent.clientTop;
    const width = box.width, height = box.height, gap = Math.max(0,box.top - anchor.bottom);
    const rtl = style.direction === 'rtl';
    const endAligned = rtl ? anchor.left : anchor.right - width, startAligned = rtl ? anchor.right - width : anchor.left;
    const fits = value => value >= GAP && value + width <= window.innerWidth - GAP;
    const [ preferred, other ] = alignEnd ? [ endAligned, startAligned ] : [ startAligned, endAligned ];
    const left = Math.max(GAP,Math.min(fits(preferred) ? preferred : fits(other) ? other : preferred,window.innerWidth - width - GAP));
    const below = window.innerHeight - anchor.bottom - gap - GAP, above = anchor.top - gap - GAP;
    const up = height > below && above > below, room = Math.max(0,up ? above : below);
    const frame = style.boxSizing === 'border-box' ? 0 : height - parseFloat(style.height);
    if ( height > room ) { popup.style.setProperty('max-block-size',`${Math.max(0,room - frame)}px`); }
    const top = up ? anchor.top - gap - Math.min(height,room) : anchor.bottom + gap;
    popup.style.setProperty('left',`${left - originLeft - marginLeft}px`);
    popup.style.setProperty('right','auto');
    popup.style.setProperty('top',`${top - originTop - marginTop}px`);
    popup.style.setProperty('bottom','auto');
}

// Merges consumer UI texts with defaults; empty texts fall back to defaults.
function normalizeTexts( texts )
{
    const source = texts && typeof texts === 'object' ? texts : {};
    return Object.fromEntries(Object.entries(DEFAULT_X_CONFIG.texts).map(( [ key, fallback ] ) => [ key, String(source[key] ?? '').trim() || fallback ]));
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportXIssue( errorLabel, values = {} )
{
    const definition = X_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `X${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}
```

- **Tooltip helpers** (§12, components with `tooltipMode`): the configuration wrapper in `xConfig.js` (the existing merge becomes `mergeXConfigBase`; components without `normalizeEnum` report `INVALID_OPTION` inline), `hintAttribute` in `xHTML.js` for hints written in the markup, `setHint` for hints set at run time, and `attachHintTooltip` in `xComponent.js` (called before `return instance`, its result called first in `destroy()`):

```js
// How the component shows hints on hover and keyboard focus — the names of its icon buttons and its own hints (cut-off
// text, hidden labels): NONE, TITLE (the browser's tooltip) or TOOLTIP (a Tooltip, loaded only then). The same values
// in every component (guidelines §12).
export const X_TOOLTIP_MODES = [ 'NONE', 'TITLE', 'TOOLTIP' ];

// Produces the normalized, immutable configuration consumed by the component: the base configuration plus tooltipMode
// (the component's own hints) and iconTooltip (its icon buttons: tooltipMode, except TITLE in a component whose hints
// use TITLE by default: there its icon buttons keep showing nothing, as before).
export function mergeXConfig( userConfig = {} )
{
    const base = mergeXConfigBase(userConfig);
    const value = userConfig?.tooltipMode;
    const tooltipMode = normalizeEnum(base.id,'tooltipMode',value,X_TOOLTIP_MODES,DEFAULT_X_CONFIG.tooltipMode);
    const config = { ...base, tooltipMode, iconTooltip:tooltipMode === 'TITLE' && DEFAULT_X_CONFIG.tooltipMode === 'TITLE' ? 'NONE' : tooltipMode };
    return Object.isFrozen(base) ? Object.freeze(config) : config;
}

// Returns an element's hint attribute for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function hintAttribute( mode, text )
{
    const value = String(text ?? '').trim();
    if ( !value || mode === 'NONE' ) { return ''; }
    return ` ${mode === 'TITLE' ? 'title' : 'data-tooltip'}="${escapeHTML(value)}"`;
}

// Sets or removes an element's hint for tooltipMode (guidelines §12): title (TITLE), data-tooltip (TOOLTIP: the
// component's Tooltip shows it) or nothing (NONE, or no text).
function setHint( element, mode, text )
{
    const value = String(text ?? '').trim();
    element.removeAttribute('title');
    element.removeAttribute('data-tooltip');
    if ( value && mode !== 'NONE' ) { element.setAttribute(mode === 'TITLE' ? 'title' : 'data-tooltip',value); }
}

// tooltipMode TOOLTIP (guidelines §12): one Tooltip for the elements with data-tooltip that belong to this component
// (the nearest component around them; hints inside a nested component are left to it), in a host after the component;
// the Tooltip module is loaded only then (if it cannot be loaded, the browser reports it and the hints stay without a
// tooltip). Returns the function that removes it.
function attachHintTooltip( container, id, mode, options = {} )
{
    if ( mode !== 'TOOLTIP' ) { return () => {}; }
    const scope = container.firstElementChild;
    scope?.setAttribute('data-tooltip-scope',id);
    const host = document.createElement('span');
    host.className = 'ui-tooltip-host';
    container.appendChild(host);
    let tooltip = null, removed = false;
    import('../tooltip/tooltipIndex.js').then(( { renderTooltip } ) =>
    {
        if ( removed ) { return; }
        tooltip = renderTooltip(host,{ id:`${id}-tooltip`, targets:{ within:container, selector:'[data-tooltip]', text:element => ( element.closest('[data-tooltip-scope]') === scope ? element.getAttribute('data-tooltip') : '' ) }, ...options });
    }).catch(() => {});
    return () => { removed = true; tooltip?.destroy(); host.remove(); scope?.removeAttribute('data-tooltip-scope'); };
}
```

- **Coordinator skeleton** (`xComponent.js`):

```js
// Renders an interactive X and returns its runtime instance, or null after a developer error.
export function renderX( container, config, onValueChange )
{
    if ( !container ) { reportXIssue('CONTAINER_REQUIRED'); return null; }
    const merged = mergeXConfig(config);
    if ( validateXConfig(merged) ) { return null; }

    container.innerHTML = buildXHTML(merged);
    const root = container.querySelector('.ui-x');
    const state = createXState(merged);
    const controller = new AbortController();
    const children = [];                       // child instances, each rendered into its own host
    let instance = null;

    // …in-place update functions and event handlers (closures over state)…

    instance =
    {
        id:merged.id,
        // Returns a copy of the current value.
        getValue:() => [ ...state.values ],
        // Removes listeners, timers and children, then clears the container.
        destroy:() => { controller.abort(); children.forEach(child => child?.destroy()); container.innerHTML = ''; }
    };
    bindXEvents(root,controller.signal,handlers);
    return instance;
}
```

## 14. Verification and completion

**A component is complete only when everything its README promises is verified: by a passing automatic test wherever a script can judge it, and by a recorded check by a person where only a person can.** In practice, all of these hold for it:

1. `npm run check` reports no findings;
2. the shared contract test passes (`npm test`);
3. its test plan covers every Business analysis code, callback and error label (`npm run coverage`: nothing uncovered);
4. all its "auto" test cases pass (`npm run test:components`);
5. its "manual" test cases are ticked in the latest release record (`reports/release-<version>.md`);
6. it appears in the gallery (`gallery/variants.js`) and renders there without console messages.

A component that does not meet them yet is listed as **not yet verified** in the release record. The mechanism (commands, what is stored where, the integrity loop) is in `TESTING.md` at the library root; these are the rules for a component.

- **Codes.** Every Business analysis line ends with a hidden, permanent code: ` <!-- BA-07 -->`. A new line takes the next free number; codes are never reused, renumbered or removed while published (`tests/published.json`).
- **Test plan.** `xTESTS.md` has one table `ID | Covers | Kind | Steps | Expected result`. Covers names codes, callbacks and error labels; every one of them is covered by at least one case, except the labels the shared contract test proves for every component. Kind is `auto` (code in `tests/components/x.test.mjs`, same ID) or `manual` (only what a script cannot judge: the look in the gallery, other applications, screen readers).
- **Test code.** It acts as a user (real clicks and keys through Playwright) and reads only the page, the clipboard and the instance members, never the component's internal files.
- **Gallery.** The component's key variants are listed in `gallery/variants.js`: its main variants, each enum option that changes the look, and a disabled or error state when there is one. The gallery is where people look at the library's real look (`npm run gallery`, with light, dark and right-to-left switches).
- **Same change.** A change of behaviour updates the README line, the test plan, the test code and, when the look changes, the gallery variants together.
- **Bugs.** First a case that fails because of the bug, then the fix; the case stays.
- **Shared contract.** A new component adds its smallest valid configuration to `tests/contract/cases.js`.
- **Before finishing:** `npm run check`, `npm test` and the component's tests pass. A release is recorded only with `npm run release -- <version>`, on explicit request.

## 15. README

`xREADME.md` is the usage contract. It serves four audiences in this fixed order, and each audience finds what it needs in its own layer.

| Layer | Heading | Subsections (in order) | Content |
| --- | --- | --- | --- |
| Business | `## For business` | `### Overview`, `### When to use`, `### Key features`, `### Dependencies`, `### Not included` | Plain language, with no parameter names, code or classes. Overview: one or two sentences — what it is and typical uses (its first sentence is the component's summary in catalogs). When to use: when to choose it and which component to choose instead in similar cases. Key features: three to seven capabilities specific to the component, most important first, one short sentence each, no shared behaviour (§11.1). Dependencies table: dependency, needed when, purpose. Not included: what the application provides. |
| Designers | `## For designers` | `### Structure`, `### Visual options`, `### States`, `### Styling contract` | Generated HTML hierarchy as a class tree (`text` block), conditional parts and state attributes. Visual options: what the Consumer chooses. States: what the component shows at run time. Styling contract: the tokens of each stylesheet part (see below). |
| AI-assisted development | `## For AI-assisted development` | `### Instructions`, `### Safety`, `### Example prompts` | Direct instructions, general then component-specific (see below). Safety: prohibited actions. Two or three realistic prompts. |
| Developers | `## For developers` | `### Business analysis`, `### Contracts`, `### Public API`, `### Configuration`, `### Callbacks`, `### Errors`, `### Accessibility`, `### Examples`, `### Files` | Business analysis: the complete behaviour as statements (§15.1). Contracts: the shared contracts line (see below). Then the complete technical contract. Examples show only non-trivial usage (at least one). Accessibility lists only what the component adds to §11.1. |

Omit subsections that have no content, except States ("No states of its own.") and Contracts, which every README has.

**General AI instructions** (each README states them, adapted to the component):
- read the README first and import only from `xIndex.js`;
- check the configuration before adding code, and configure instead of reproducing markup, styles, validation, errors or events;
- keep business logic in the consumer, and don't modify the component for application needs (propose reusable framework changes instead);
- respect conditional options, user/programmatic differences and callback semantics;
- use unique ids (rules in §5, "Ids"), and call `destroy()` before rendering into the same container again.

**Safety** covers inserting untrusted HTML, removing accessibility attributes, bypassing native semantics and breaking invariants.

**Configuration table** columns: `Parameter`, `Type`, `Default`, `Allowed values / format`, `Applies when`, `Usage / description`. Nested paths are written in full (`validation.maxLength`). Ignored options, precedence, conflicts and fallbacks are stated once, below the table.

**Applies when** uses a fixed form, so tools (and the showcase's Variants panel) can evaluate it: `Always`, or terms joined by ` + `, which must all hold. A term is one or more code tokens separated by commas, of which at least one must hold, optionally preceded by `not`; `, not` also starts a new term (`` `CUSTOM`, not `WEEK` ``). A token is an option path (`` `label` ``: true for a boolean, set for any other option), a path with a value (`` `stateText:NONE` ``), or an allowed value in capitals that belongs to one option only (`` `PASSWORD` ``). Nothing else goes in the cell: a requirement ("required with …"), a screen size or a condition on the data goes in `Usage / description`, and the cell says `Always` when no option decides it. `npm run check` reports any other text.

**Callbacks table** columns: `Callback`, `Arguments`, `Fires when`, `Does not fire when`.

**Errors:** a user error table (`Label`, default message, trigger, visibility, clearing) and a developer table (`Label`, `Severity`, `Cause`). Developer console messages are not repeated.

**Visual options and States tables** have the same columns: `Option` (or `State`), `Values`, `CSS class or attribute`. An option is chosen by the Consumer in the configuration (look, size, label position, what is shown). A state is what the component shows at run time because of the user, the data or the App (open, current, selected, checked, unavailable, invalid, busy, loading, empty); disabled is a state even when it is configured.

**Styling contract** (there is no separate token table) starts with the standard paragraph (the component's file name and class prefix replace `x.css` and `ui-x-`):

```md
`x.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-x-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).
```

The border sentence is left out when the Appearance part uses logical border sides. Component-specific notes follow in one paragraph (e.g. which rules also apply inside a disabled `fieldset`). Then, in this order and only when not empty:

- `**1. Appearance — change freely**`, `**2. Dimensions — change with care**`, `**3. Structure — don't change**`, each followed by its tokens grouped under `- Colours`, `- Typography`, `- Borders and corners`, `- Shadows`, `- States and motion`, `- Spacing`, `- Sizes`, `- Layers` (a part without tokens: `- No tokens.`). One line per token: `` - `--token`: part, part (option or state) ``; a part styled always and also in some options or states is written `part (also option, state)`. A token used in two parts is listed in both, each time with what it styles there. Local variables declared in the stylesheet are listed like tokens, marked "(defined in this stylesheet)".
- `**Set by the component — don't change**`: the `--ui-x-…` variables the JavaScript writes, with what they carry and where it comes from (an option, or "measured").
- `**Used by the code**`: design tokens named in the component's JavaScript (defaults passed to child components, values read or written), with their purpose.

Every token referenced in the stylesheet appears in the Styling contract, and nothing else; tokens written only in error messages are not listed.

**Contracts** (first subsection after Business analysis) is one line, always in this form and order:

```md
**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility
```

- **Styling** (§12): always "three parts (Styling contract)".
- **Form field** (§10.1): "yes", "yes, when …" (only in some modes), "coordinates the fields" (Form), "no (container: `getChildren()`)" for containers, or "no".
- **Actions** (§10.2): "yes (`actions`, `onAction`)" with any extra members (`canAct`) or prefixed names (`selectionActions`), "through each panel" when items carry them, or "no".
- **Shared behaviour** (§11.1): "yes, additions under Accessibility"; a documented deviation is named here ("yes, except …").

**Writing rules:**
- **No repetition:** state each fact once, in the layer that needs it most, and use tables for enumerable facts.
- **No filler:** no marketing language, no prose restating tables, no trivial examples.
- **Headings:** `#` for the component name, `##` for layers, `###` for subsections, `####` only if unavoidable; no numbering.
- **Code blocks:** fences always name their language.

**Markdown format:**
- **Table syntax:** GitHub-Flavored Markdown pipe tables only. Every header, separator and row is on one physical line, starts and ends with `|`, and uses `| --- |` separators (`| ---: |` for numbers). Escape a literal pipe in a cell as `\|`. Never use Pandoc simple, grid or multiline tables.
- **Line wrapping:** use one physical line per paragraph and per list item, with no fixed-width wrapping. Multiline content appears only in fenced code blocks.
- **Verification:** inspect the Markdown source, not only the rendering: check literal pipe syntax and consistent column counts.

### 15.1 Business analysis

The behaviour of the component as short statements, for analysts, testers, developers and AI assistants. It describes **what happens**; the Configuration and Callbacks tables describe **how to set it up**, so statements name no options, parameters or classes.

- **Roles.** Each statement starts with one role: **User** (the person using the screen), **Component** (the component itself), **Consumer** (the developer who configures the component in the application's code) or **App** (the running application that uses the component; it provides the data, performs the actions and stores the changes). "App" is used everywhere, never "System".
- **Role definitions.** Directly under the heading, a block quote defines the roles other than User, with this text (the component's name replaces `{Name}`): `> **Component**: the {Name} itself. **Consumer**: the developer who configures the {Name} in the application's code. **App**: the running application that uses the {Name}; it provides the data, performs the actions and stores the changes.`
- **Verbs.** After the role comes one verb in the present tense, from this list only (one verb per meaning, no synonyms, never "can", "should" or "shall"):

| Role | Verbs |
| --- | --- |
| User | clicks (also taps), presses (a key), types, pastes, selects (an option, a date, a value), changes (a value), drags (and drops), hovers, leaves (a field) |
| Component | displays, hides, opens, closes, selects, clears, ticks (and unticks), marks, adds, removes, moves, sorts, changes, adapts, wraps, shortens, scrolls, keeps, checks, prevents, disables, asks, requests, reports, sends, submits, resets, applies, announces (spoken at once), exposes (available to screen readers without being announced) |
| App | provides, performs, stores, sends, opens, adds, changes, marks, disables, forbids, decides |
| Consumer | chooses, provides, enables, disables, adds |

- **One fact per statement**, a complete sentence ending with a full stop. User-visible texts appear in quotes ("No matching items").
- **Dependent statements** are indented under the statement they follow from (`  - ` per level), e.g. what the Component does after a User action.
- **Codes.** Each statement ends with its hidden test code (` <!-- BA-07 -->`, §14); renderers do not show it.
- **Groups.** Statements are grouped by function under a bold line (`**Search**`); a group or statement enabled by the Consumer ends with "(optional)", and "(optional, on by default)" when it starts enabled.
- **No shared behaviour.** Keyboard, screen-reader, translation, right-to-left and validation-timing behaviour from §11.1 is not repeated; component-specific additions are stated in their group.

## 16. Designing a new component

Settle these points before writing code, and ask when a point has several reasonable answers.

1. **Boundary:** the reusable problem, and what is excluded (the consumer's part).
2. **Existing components:** which existing framework components already cover part of the behavior. Compose them.
3. **User view:** what the user sees and does, including accepted, rejected and automatically corrected actions.
4. **Configuration:** options, defaults, enums, conditions, conflicts, precedence and texts.
5. **Native capabilities:** which are reused, and why any are replaced.
6. **Programmatic behavior:** initial values and runtime methods, including how invariants apply.
7. **State:** the minimum runtime state and where the truth lives (native element or state).
8. **Validation:** generic rules and when each one runs.
9. **Errors:** user errors (trigger, visibility, clearing) and developer errors and warnings, with labels.
10. **Callbacks:** outcome, arguments, firing and non-firing cases.
11. **Accessibility:** semantics, names, relationships and state attributes.
12. **Presentation:** structure, classes, verified tokens and spacing ownership.
13. **Dependencies:** framework components, design system and external libraries, and who owns each child's lifecycle.
14. **Shared behaviour:** how the component meets §11.1 (keyboard, screen readers, texts, right-to-left, reduced motion, container widths; for inputs, the form-field behaviour), and which additions it brings.
15. **Buttons:** which buttons are owned (named options, `texts`) and which are application actions (`actions` + `onAction`, §10.2).

Build order: implementation files, then the gallery variants and manual verification of configurations and interactions in the gallery, then the README (written last, from the stabilized behavior), then the test plan with its test code (§14).

## 17. Changing an existing component

1. Read the current files, the README and the public contracts of the component's dependencies.
2. Find inconsistencies among configuration, markup, events, state, validation, errors, CSS, README, test plan and test code.
3. Define the target behavior before coding, keeping user interaction, programmatic interaction, validation, temporary feedback and callbacks separate.
4. Decide where the capability belongs: this component, a child component, a new component or the consumer.
5. Update every affected surface coherently: implementation, `xIndex.js` header, README, test plan, test code and gallery variants.
6. Avoid unrelated refactoring.

## 18. Delivery

- **Isolated change** (one or two exact spots): give precise location guidance (file, section or line, the text to find, the replacement).
- **Larger change:** deliver the complete file.
- **Changelog:** list breaking changes separately from fixes and improvements, with the consumer action required.
- **Scope:** don't change unrelated files or agreed behavior silently. Changes to other components (e.g. references in comments) are reported, not made silently.
- **Before delivery, verify** (`npm run check` covers the items marked ✓; `npm test` and `npm run test:components` cover the behaviour):
  - ✓ every referenced token exists in `design-system.css`;
  - ✓ every reported label exists in its catalog, no catalog entry is unused, and the README Errors section lists the same labels with the same severity;
  - ✓ every Business analysis line has its code, and every code, callback and label is covered by the test plan (when the component has one);
  - ✓ no `console.warn` or `console.error` calls exist outside `xErrors.js`;
  - there are no class names or selectors without the `ui-` prefix, and no stale names from renames;
  - no internal helper is exported from `xIndex.js`;
  - application buttons follow §10.2 (`actions`, `onAction`, `setActionDisabled`, the action errors, `--gap-inline-items`), with no pass-through Button configurations;
  - the component renders in the gallery without page errors or console messages;
  - the completion rule of §14 holds, or the component is reported as not yet verified;
  - ✓ README tables pass the Markdown format rules;
  - the README has Overview, When to use and Key features (§15), Business analysis (§15.1) with the role definitions and only listed verbs, and repeats nothing from the shared behaviour (§11.1);
  - the stylesheet has the three parts (§12), and the README's Styling contract lists every token of each part, the variables set by the component and the tokens used by the code, and nothing else (§15);
  - Visual options hold only what the Consumer chooses, and States what the component shows at run time (§15);
  - the Contracts line matches the code: form-field members (§10.1), actions (§10.2), the three CSS parts (§12) and the shared behaviour (§11.1);
  - the component provides the shared behaviour of §11.1.
