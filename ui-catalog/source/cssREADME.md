# CSS Architecture

Two system files and one stylesheet per component, loaded in this order:

```html
<link rel="stylesheet" href="design-system.css">                     <!-- 1. tokens and the layer list -->
<link rel="stylesheet" href="app-shell.css">                         <!-- 2. reset and bare HTML elements -->
<link rel="stylesheet" href="components-js/button/button.css">       <!-- 3. one file per component used -->
<link rel="stylesheet" href="components-js/textInput/textInput.css">
…
<link rel="stylesheet" href="app/app.css">                           <!-- 4. the project's page layout -->
```

Load only the stylesheets of the components the page uses (and of the components they use, listed in each README under "Files"). Every CSS file in the library is used by something; a file nothing loads is deleted.

## The one rule everything follows

> **A file must never contain a decision that belongs to a layer above it.**

Components never hold literal colours or sizes (that is the token layer's decision); the token layer never holds selectors (what to style is decided above it); the project's layout never styles a component's internals.

## The files

| File | Role | In another project |
|---|---|---|
| `design-system.css` | Tokens only: every visual value, the typography roles, the tag tokens, the cascade-layer list | **Replaced or re-valued** (this is how a project is re-skinned) |
| `app-shell.css` | Reset (box sizing, body margin, media as blocks) and the bare HTML elements: `body`, `h1`–`h6`, `p`, `code`, links, focus. No classes. | Copied unchanged |
| `components-js/<name>/<name>.css` | One component, in three parts (below) | Copied; values changed in parts 1 and 2 only, marked |
| the project's layout file (e.g. `client/app/app.css`) | Page layout: columns, header area, working width, the few element rules particular to the project | Written per project |

The cascade layers are declared once, at the top of `design-system.css`:

```css
@layer tokens, reset, base, layout, components, overrides;
```

| Layer | Who writes into it |
|---|---|
| `tokens` | `design-system.css` |
| `reset`, `base` | `app-shell.css` (and, rarely, the project for an element rule of its own) |
| `layout` | the project's layout file |
| `components` | every component stylesheet |
| `overrides` | a project's corrections, written as the same selector with a new value |

`components` sits above `base`, so a component's own text styles always beat the bare-element styles, without specificity games. No other file may redeclare or reorder this list.

## The token tiers (inside design-system.css)

```
1. PRIMITIVES   grey ramp, status hue ramps, brand sources, spacing/sizing scales, font weights
                → referenced only inside design-system.css
2. VARIANTS     light/dark steps DERIVED from each brand colour with color-mix()
                → change a source colour, its whole ramp regenerates
3. SEMANTIC     roles: --c-surface, --c-danger-text, --padding-panel, --fs-label, --control-height,
                --radius-control, the typography roles and the tag tokens
                → the ONLY tier the other files reference
```

Components ask for a **role**, never a value. `padding: var(--padding-panel)` can be re-pointed by a denser design system; `padding: var(--space-lg-2)` cannot, because every unrelated use of `lg-2` would move with it.

Naming: kebab-case, category prefix, **no literal value in a name**. `--space-lg-2` means "large family, second step"; what it is worth is the token file's private business.

### Typography roles

Which family and weight each kind of text uses is decided once, in `design-system.css` section "3b. TYPOGRAPHY ROLES":

| Role | Used by |
|---|---|
| `--font-body` / `--fw-body` | `body` (`app-shell.css`) |
| `--font-h1` … `--font-h6` / `--fw-h1` … `--fw-h6` | `h1`–`h6` (`app-shell.css`); one family and one weight per level |
| `--font-p` / `--fw-p` | `p` (`app-shell.css`) |
| `--font-ui` | every component's text and form fields |
| `--fw-ui`, `--fw-ui-medium`, `--fw-ui-strong`, `--fw-ui-emphasis` | component text: normal, medium (tags), strong (labels, headers, selected), emphasis |
| `--font-code` | `code`, `kbd`, `pre`, `samp` and code-like component text |

Sizes keep their own tokens (`--fs-page-title` h1, `--fs-section-title` h2, `--fs-block-title` h3, `--fs-body` h4–h6 and body, `--fs-label`, `--fs-control`, `--fs-caption`; narrow screens: `--fs-page-title-narrow`, `--fs-section-title-narrow`).

Components never use `--font-sans`, `--font-mono` or `--fw-bold` / `--fw-regular` … directly: they use the roles, so changing a role reaches every component. Form fields and buttons do not inherit the page font in browsers, so each component sets `font-family: var(--font-ui); font-weight: var(--fw-ui)` on its root and on its fields.

### Tag tokens

Chips (also the chip presentation of CheckboxRadio), notification counts and similar small labels share section "3c. TAGS": `--tag-font-size`, `--tag-font-weight`, `--tag-line-height`, `--tag-radius`, `--tag-border-width`, `--tag-padding-block`, `--tag-padding-inline`, `--tag-gap`. Each component still writes the values in its own rules (patterns stay per component), so a check across the files can confirm that every tag uses the same tokens.

## Component stylesheets

Every component stylesheet has the same shape:

- **Header:** the default generated DOM (the contract the generating JS must produce), its conditional structures, deliberate literals, the variables that remain (below), then the shared **STYLE GROUPS** text.
- **`@layer components { … }`** with three parts, each opened by a banner:

| Part | Holds | Change |
|---|---|---|
| **1. APPEARANCE** | colours, borders, corners, type, shadows, motion, the disabled look | freely: only the look changes |
| **2. DIMENSIONS** | sizes, spacing, widths, gaps, layout sizes in container/media queries | with care: the component keeps working, its size changes |
| **3. STRUCTURE** | layout, behaviour, states, accessibility (focus ring, hidden text) | do not change |

A class can appear in more than one part, each time with different properties. Short comments above each group of rules say what they style.

**Values are tokens written directly in the rules.** There are no styling variables (`--ui-button-bg` …): to change a value, edit it where it is used. Borders are written per side (`border-top`, `border-right`, `border-bottom`, `border-left`) and corners per corner (`border-top-left-radius` …), so a project can change one side or one corner without rewriting a shorthand. Sides are physical: a value set for one side only does not mirror in right-to-left languages. Exception: shapes drawn with borders and turned (chevrons, the back arrow, check marks) keep logical sides, because they must follow the text direction.

**Variables that remain** belong to the component's JavaScript, not to styling, and each header lists its own:

- values the component writes inline from its configuration or from a measurement: e.g. `--ui-chip-custom-bg`, `--ui-badge-color`, `--ui-notification-bg`, `--ui-notification-indicator-bg`, `--ui-toggle-on-bg`, `--ui-message-bg/-color/-border`, `--ui-select-hover-bg`, `--ui-select-popup-top`, `--ui-action-menu-top`, `--ui-calendar-highlight-bg`, `--ui-text-area-height`, `--ui-table-col`, `--ui-content-group-span`, `--ui-form-columns`, `--ui-button-min-width`, `--ui-side-nav-level`;
- the few values the component reads back (`--ui-select-popup-limit`);
- geometry helpers in part 2 when one size drives many rules (`--ui-notification-size`, `--ui-notification-indicator-size`, `--ui-toggle-width`, `--ui-toggle-height`, `--ui-side-nav-indent`).

Where the JavaScript can override a type colour, the rule keeps a hook with the default as fallback: `background-color: var(--ui-message-bg, var(--c-info-soft));`.

**Types are written per type.** A component with types (Button hierarchies, Chip and Message types, Notification indicator types) has one block per type in part 1 with everything that makes that type's look, so changing one type means editing one block.

**Source order matters across the parts.** The parts are in source order 1, 2, 3; a rule with the same specificity later in the file wins. So a shorthand that would reset an earlier value (`font: inherit`, `border: 0`, `background: transparent`) is written in part 1, before the values it must not reset; a structural `inline-size: 100%` that a part-2 media query must override goes in part 2, before that query.

### Disabled fields

The label and the "*" of a disabled field use the secondary text colour; the disabled field's text too. Each input component has a block in part 1 that starts with the comment `DISABLED LABEL —` so the pattern is recognisable in every file:

```css
/* DISABLED LABEL — the label and the "*" of a disabled field use the secondary text colour. … */
.ui-text-input-wrapper:has(.ui-text-input-field:disabled) .ui-text-input-label { color: var(--c-muted); }
.ui-text-input-wrapper:has(.ui-text-input-field:disabled) .ui-text-input-mandatory { color: var(--c-muted); }
```

`:has(…:disabled)` covers both `state: INACTIVE` and a field inside a disabled `<fieldset>` (ContentGroup `disabled: true`).

## Three copies of the same file

An application that shows the library and also uses it (the showcase app) keeps the same stylesheets in three places:

| Copy | Values |
|---|---|
| `ui-catalog/source` | the library's |
| `client/showcase-styling` (live examples) | identical to the source |
| `client/local-styling` (the app itself) | the same file, with the app's values; every changed value carries a comment `[APP] … (library: …)` |

Same selectors, same properties, same order in all three; only values differ, and only where marked. Comparing a local file with the source therefore shows exactly the app's decisions.

## Ownership of the cross-cutting concerns

Each concern has exactly one owner; every other layer stays ignorant of it.

### Typography → tokens for values, roles for choices, the base layer for elements

| What | Owner |
|---|---|
| Families, sizes, weights, line heights | `design-system.css` (token tiers) |
| Which family and weight each kind of text uses | `design-system.css`, typography roles |
| Which size each element uses | `app-shell.css`, `@layer base`, one block |
| Text a component generates | the component, on its `ui-` class (`font-size`, `font-weight` via a role, `line-height`, `margin`) |
| Space between blocks | the container (`gap`); bare elements have no margins |

### Dark mode → the token layer, only

A theme is a **re-pointing of the semantic tier**. Primitives and brand ramps never change; components never know a theme exists. The OS preference is the default (`@media (prefers-color-scheme: dark)`); `<html data-theme="dark">` / `data-theme="light"` always wins, set by the application. The two dark blocks in `design-system.css` carry the identical token set and must be kept in sync.

### Responsiveness → whoever owns the constraint

| Constraint | Owner | Mechanism |
|---|---|---|
| The component's own box is narrow | the component | `@container` (e.g. labels on the left only from 36rem of container width; the table becomes cards) |
| The viewport is small | the page layout; navigation chrome | `@media (max-width)`: the navigation components and AppHeader collapse at 48rem; headings compact at 680px (`app-shell.css`) |
| There is too much data to show | the component's configuration | e.g. per-column priority in Table |

Custom properties do not work inside `@media` or `@container` conditions, so breakpoints are documented literals.

### Accessibility → decomposed, one home per piece

| Piece | Home |
|---|---|
| Contrast (muted text ≥ 4.5:1 in both themes), focus outline (`--focus-outline`, `--focus-offset`), motion durations | `design-system.css` |
| Focus ring, visually hidden text, `prefers-reduced-motion` rules | each component, part 3 |
| Semantics: real controls for anything clickable, ARIA state where visual state exists | the reference markup in each component header, produced by its `xHTML.js` |
| Focus management and announcements | the components' Events files |
| Content: `lang`, headings, labels, alt text | pages |

## The JS/CSS contract

- **Class names are API.** Renaming a class means updating the matching `xHTML.js`.
- **Inline variables** listed in each header are written by the component; the CSS reads them.
- **ARIA and native state** (`aria-expanded`, `aria-current`, `aria-invalid`, `:disabled`, `:checked`) are written by the component and styled by the CSS.

## Conventions

- **kebab-case** for every class and token; component classes and variables start with `ui-` plus the component name.
- **Logical properties** for layout and spacing (`margin-inline-start`, `padding-block`, `inset-inline-end`, `text-align: start`); **physical sides** for borders and corners (see above).
- Allowed literals: `0`, `1`, `100%`, `50%` for circles, `em` proportions of the component's own font size, breakpoints, z-index values, geometric `rotate()`/`scale()`.
- Comments describe content and contracts: what a rule group styles, the markup expected, the variables that remain.

## How to…

**Re-skin a project:** change tokens in `design-system.css` (brand sources regenerate their ramps; typography roles choose family and weight per kind of text).

**Change one component in one project:** edit the value in part 1 or 2 of the project's copy and mark it `[APP] … (library: …)`; or write the same selector with the new value in `@layer overrides`.

**Add a component:** follow the shape above: header with the generated DOM, three parts, tokens and roles in the rules, a `DISABLED LABEL —` block for an input, per-type blocks for types.

**Verify:**
- every `var(--…)` resolves to a token in `design-system.css` or to a variable listed in the component header;
- no component file uses `--font-sans`, `--font-mono` or a `--fw-*` weight directly (only the roles);
- every `font: inherit`, `border: 0` or `background: transparent` that shares a selector with a value in part 1 is in part 1, before that value;
- the source copy and `client/showcase-styling` are byte-identical; `client/local-styling` differs only on lines marked `[APP]`;
- the keyboard walk passes: every interactive part is reachable and operable with Enter or Space.
