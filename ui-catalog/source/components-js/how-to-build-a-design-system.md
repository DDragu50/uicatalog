# How to Build a New Design System

A design system gives every UI Catalog component a new look — colours, fonts, spacing, sizes, corners — without touching component code. This guide explains where each visual decision lives and gives the steps to build your own.

## 1. The idea: one file decides the look

Every visual value is a **token** (a CSS custom property) in `design-system.css`. Component stylesheets never contain literal colours or sizes; they ask for a role, e.g. `background-color:var(--c-surface)` or `padding:var(--padding-card)`. A new design system is therefore mostly **a new `design-system.css`**:

| File | Role | For a new design system |
| --- | --- | --- |
| `design-system.css` | Tokens: every colour, font, space, size, radius, shadow, motion | **Replace or edit** — this is the design system |
| `app-shell.css` | Reset and bare HTML elements (body, headings, paragraphs, links) | Keep; it reads typography roles from the tokens |
| `components-js/<name>/<name>.css` | One stylesheet per component | Keep; change only if a component needs a look the tokens cannot express (section 6) |
| Your `app.css` | Page layout of your application | Yours |

The rule behind it: **a file never contains a decision that belongs to a layer above it.** Components do not choose colours; the token file does not choose selectors.

## 2. The three token tiers

`design-system.css` is organised in three tiers. Only the third is read by other files.

```
1. PRIMITIVES   raw values: grey ramp (--c-grey-05 … --c-grey-95), status hue ramps (red, amber, green, blue),
                brand source colours (--c-primary, --c-support-1…3), font families and sizes, spacing scale
                (--space-sm-1 … --space-xl-n), sizing scale (--size-…), radii, border widths, shadows, motion
2. VARIANTS     values derived from a primitive with color-mix(): --c-primary-light-10 … -light-90,
                --c-primary-dark-10/-20, gradients. Change the source colour and the whole ramp follows.
3. SEMANTIC     roles: --c-surface, --c-text, --c-muted, --c-border, --c-accent, --c-selected, --c-danger-text,
                --fs-label, --fs-control, --fw-ui-strong, --padding-card, --gap-toolbar, --control-height,
                --radius-control… — the only tier component stylesheets use
```

Why roles: a denser design system re-points `--padding-card` to a smaller step of the scale, and every card follows. If components used `--space-lg-1` directly, every unrelated use of that step would move too.

Naming: kebab-case, a category prefix (`--c-` colour, `--fs-` font size, `--fw-` weight, `--space-`, `--size-`, `--radius-`, `--border-`), and never a literal value in a name.

## 3. What to change, in order

### Step 1 — Copy the file

Copy the library's `design-system.css` into your project and load your copy instead. Keep the layer declaration at the top unchanged:

```css
@layer tokens, reset, base, layout, components, overrides;
```

### Step 2 — Colours

1. **Brand:** set `--c-primary` (and the support colours if you use them). The light and dark variants are derived automatically.
2. **Greys:** adjust the grey ramp if your neutral tone differs (cooler, warmer). Keep the order light → dark.
3. **Semantic colours:** point each role at a primitive or variant:
   - surfaces: `--c-page`, `--c-surface`, `--c-surface-muted`, `--c-surface-hover`, `--c-surface-alt`;
   - text: `--c-text`, `--c-muted`; lines: `--c-border`; focus: `--c-focus`;
   - interaction: `--c-accent` (links, active items, primary buttons), `--c-accent-hover`, `--c-on-accent` (text on the accent), `--c-selected` (selected rows and options);
   - status: `--c-danger*`, `--c-warning*`, `--c-success*`, `--c-info*` (accent, text, soft background, border).
4. **Keep states apart.** Hover, selected, stripes and borders must remain distinguishable. If the greys run out, give one state its own hue (e.g. selected in a light blue) and keep a second cue in the component (check mark, bold text, checkbox).
5. **Check contrast:** text 4.5:1 on its background (3:1 for large text), borders and icons that carry meaning 3:1. The gallery (`npm run gallery`, section Design tokens) shows the whole palette from your token file, with each colour's contrast — open it after every change.

### Step 3 — Typography

- **Family:** `--font-sans`, `--font-mono` (load the font files with `@font-face` at the top of the file).
- **Sizes:** the primitive scale (`--fs-xs` … `--fs-3xl`) and the roles `--fs-body`, `--fs-label`, `--fs-caption`, `--fs-control`, heading sizes.
- **Text roles (section "TYPOGRAPHY ROLES"):** each kind of text is one role of four tokens — family, size, weight and line height (`--font-body` / `--fs-body` / `--fw-body` / `--lh-body`; `p`, which points at the body role; `lead`; `h1`–`h6`; `ui` for component text; `code`). Change a role, never a single element: all running text follows the body role, so `--fs-body` alone changes its size everywhere. The **weight pair** `--fw-normal` / `--fw-strong` sets the two weights of all running text in two lines. Component and application stylesheets read only these roles (rule in the component development guidelines, section 12).

### Step 4 — Spacing and sizes

- The **scale** (`--space-sm-1` … `--space-xl-n`, `--size-sm-1` …) is the raw ruler.
- The **roles** decide density: `--padding-page`, `--padding-panel`, `--padding-card`, `--padding-control`, `--gap-section`, `--gap-block`, `--gap-form-field`, `--gap-toolbar`, `--gap-inline-items`, `--gap-tight`, `--control-height`, `--control-height-touch`.
- A compact system lowers the roles by one step; a touch-friendly one raises `--control-height` and the gaps.
- `--gap-inline-items` is also the space between the Buttons of one group inside components (dialog actions, panel headers, toolbars, table selection actions), so changing it changes all of them together.

### Step 5 — Shapes, depth and motion

- Corners: `--radius-*` primitives and roles such as `--radius-control`, `--radius-control-small`, `--radius-panel`, `--radius-pill`.
- Lines: `--border-thin`, `--border-thick`, `--border-heavy`.
- Depth: `--shadow-sm`, `--shadow-md` (`none` for a flat design).
- Motion: `--transition-1`, `--spinner-duration` (one turn of a busy ring), `--progress-sweep-duration` (one sweep of an indeterminate progress bar).
- Covered regions: `--scrim-bg`, the layer over a region that is busy (Loader); it is mixed from `--c-page`, so it follows the dark theme.
- Focus ring: `--focus-outline`, `--focus-offset`.

### Step 6 — Shared component tokens

Some looks are shared by several components and have their own tokens in the semantic tier:

- **Tags** (`--tag-*`): Chip, the CheckboxRadio chip look and the Notification count pill.
- **Select options** (`--select-option-*`), **Toggle** (`--toggle-*`), **Calendar** (`--calendar-*`), **Table columns** (`--table-column-*`), **icon sizes** (`--icon-size-small / -medium / -large`).

### Step 7 — Dark mode

A theme only **re-points semantic tokens**; primitives and components never change. `design-system.css` has two dark blocks with the same token set: one under `@media (prefers-color-scheme: dark)` (the system preference) and one under `[data-theme="dark"]` (forced by the application). Edit both identically. `data-theme="light"` on `<html>` forces the light look.

## 4. Marking your changes

When your design system starts from the library file, mark every changed line, so later library updates are easy to merge:

```css
--c-primary: var(--c-grey-90);   /* [APP] (library: #315e71) */
```

The showcase app uses the marker `[APP]` with the original value in brackets; use your own marker (e.g. `[BRAND]`) the same way.

## 5. Checking the result

1. Open the gallery (`npm run gallery`): every swatch and every component reads the tokens directly.
2. Open a page with all components (in the showcase app: the live examples, States and Examples of each component) in light and dark mode.
3. Check: text contrast, focus ring visible on every background, hover / selected / disabled distinguishable, status messages recognisable, nothing overflowing at 680px and 960px.
4. Keep the console free of warnings.

## 6. When tokens are not enough

Some looks cannot be expressed with tokens (e.g. buttons with only an underline, fields with only a bottom line). Then change the component stylesheet, carefully:

- Each component stylesheet has **three parts**: 1. APPEARANCE (colours, borders, corners, type — change freely), 2. DIMENSIONS (sizes, spacing — change with care), 3. STRUCTURE (layout, states, accessibility — do not change). The **Styling contract** in each component README (For designers) lists the tokens of each part and what they style, so you can find what to re-point before opening the stylesheet.
- Prefer **overrides** to edits: write the same selector with the new value in your own stylesheet inside `@layer overrides`. Library updates then never overwrite your look.
- Never write literal values; use tokens, adding a new token to `design-system.css` when needed.
- Never use `@media (max-width)` in a component; components adapt to their own width with container queries.

## 7. Checklist

1. Copy `design-system.css`; keep the layer list.
2. Set brand and grey primitives; re-point semantic colours; check contrast in the gallery.
3. Set fonts, the typography roles and the weight pair.
4. Set spacing and sizing roles for the density you want.
5. Set radii, borders, shadows, motion and the focus ring.
6. Adjust the shared component tokens (tags, Select options, Toggle, Calendar, icons).
7. Re-point the same tokens in both dark blocks.
8. Mark changed lines; put unavoidable component changes in `@layer overrides`.
9. Review every component in light and dark mode.
