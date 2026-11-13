# CopyArea

## For business

### Overview

CopyArea shows content with a Copy button that puts it on the clipboard in one click: code, a value such as an IBAN or an API key, or formatted content such as a standard reply or a table. Typical uses: code examples and install commands, account and payment details, invitation links, order and ticket numbers, texts to paste into an email or a document.

### When to use

- Use it when people need to take content from the screen into another place (a terminal, a payment form, an email, a spreadsheet) without selecting it by hand.
- Use it for one value inside a sentence ("Your order #100482 is on its way") as well as for a block of code or formatted content.
- Use Message for a confirmation that is not tied to copying, and Tooltip for a hint without an action.

### Key features

- One click copies the whole area; the button confirms with "Copied".
- Copies a different value from what is shown when needed, e.g. the full API key behind a masked one, or an IBAN without spaces.
- Formatted content keeps its formatting when pasted into a document or an email, and becomes plain text in a plain field.
- Leaves out hidden parts and controls, and parts the application marks, or copies only a marked part.
- Code in a fixed-width font, with optional line numbers; long content scrolls.
- When the browser refuses the copy, the content is selected so it can be copied with Ctrl+C.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, sizes, typography and the CopyArea tokens. |
| CopyArea styles (`copyArea.css`) | Always | Layout, code and content box. |
| Button component and `button.css` | Always | The Copy button. |
| Font Awesome icon library | Always | Copy and check icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Name of the icon button on hover and keyboard focus (the Tooltip module is loaded only then). |

### Not included

The application provides the content (and builds formatted content itself), the value to copy when it differs from what is shown, and any colouring of code by language. Copying needs a page served over https (or localhost); elsewhere the browser refuses and the content is selected instead.

## For designers

### Structure

```text
div#{id}.ui-copy-area.ui-copy-area-{code|plain|content}.ui-copy-area-button-{icon|text}[.ui-copy-area-line-numbers]   (span for plain)
├── pre.ui-copy-area-body[role="region"][tabindex="0"][dir="ltr"] > code                    (code; lines: span.ui-copy-area-line)
│   or span.ui-copy-area-text                                                        (plain)
│   or div.ui-copy-area-body[role="region"][tabindex="0"] → the application's content  (content)
├── span.ui-copy-area-action[data-button="copy"] → Button (TERTIARY, SMALL)
├── span.ui-copy-area-message[hidden]                                                 (failed copy; code.ui-copy-area-fallback with copyValue)
└── span.ui-copy-area-status.ui-copy-area-visually-hidden[role="status"]
```

Code and content are one bordered box with the button in its top corner; code has its own background. Plain text has no box: the button follows the text on the same line.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Shown content | Code, plain text, content | `ui-copy-area-code`, `ui-copy-area-plain`, `ui-copy-area-content` |
| Line numbers | Off, on (code) | `ui-copy-area-line-numbers`, `span.ui-copy-area-line` |
| Copy button | Icon, text | `ui-copy-area-button-icon`, `ui-copy-area-button-text` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Copied | "Copied" with a check on the button for two seconds | The Button's label or name and icon |
| Copy failed | Message below the area, content selected | `.ui-copy-area-message` without `hidden` |

### Styling contract

`copyArea.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-copy-area-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-border`: copy area (code, content)
  - `--copy-area-bg`: copy area (code)
  - `--copy-area-color`: copy area (code)
  - `--c-text`: copy area (content), text, fallback
  - `--c-muted`: line
  - `--c-danger-text`: message
- Typography
  - `--font-code`: body (code), fallback
  - `--fw-ui`: body (code), text, message
  - `--lh-body`: body (code), text, message
  - `--font-ui`: text, message
  - `--fs-control`: text
  - `--fs-label`: message
- Borders and corners
  - `--border-thin`: copy area (code, content)
  - `--radius-panel`: copy area (code, content)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--space-md-3`: body (code), line, message (code, content)
  - `--gap-inline-items`: body (code, content), copy area (plain)
  - `--padding-card`: body (content)
  - `--space-sm-2`: action (code, content)
  - `--gap-tight`: message
- Sizes
  - `--copy-area-max-height`: body (code, content)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- States and motion
  - `--focus-outline`: body (focus)
  - `--focus-offset`: body (focus)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `copyAreaIndex.js`.
- Use `text` for code and single values (`textStyle:'PLAIN'` for values such as an IBAN, an order number or a link), and `content` only for formatted content the application renders.
- Set `copyValue` when what should be pasted differs from what is shown (a masked key, an IBAN without spaces); never show a secret just to copy it.
- Mark parts of formatted content with `data-copy="skip"` (left out) or `data-copy="only"` (copied alone); hidden parts, buttons and fields are left out automatically.
- Give a `label` that says what is copied ("Install command", "IBAN"), so screen-reader users hear "Copy, IBAN".
- React to `onCopy` only for analytics or follow-up actions; the component shows and announces the result itself.
- Give each area a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- `text` and `copyValue` are displayed and copied as text; do not pass HTML in them.
- Build formatted content with your own trusted markup or framework components in the `content` function; never insert untrusted HTML there.
- Do not remove the status region or the region names: they announce the result and make long content reachable by keyboard.

### Example prompts

```text
Show the install command "npm install ui-catalog" in a CopyArea labelled "Install command".
```

```text
On the account page, show the IBAN with spaces and a "Copy" text button that copies it without spaces.
```

```text
Show our standard reply to password questions as formatted content with a Copy button; leave the internal note out of the copy.
```

## For developers

### Business analysis

> **Component**: the CopyArea itself. **Consumer**: the developer who configures the CopyArea in the application's code. **App**: the running application that uses the CopyArea; it provides the data, performs the actions and stores the changes.

**Content**

- Consumer provides a text: code, or a single value such as an IBAN or an order number. <!-- BA-01 -->
- Component displays code in a fixed-width font on its own background, exactly as provided. <!-- BA-02 -->
  - Component displays line numbers (optional). <!-- BA-03 -->
  - Component scrolls code that is taller than the maximum height. <!-- BA-04 -->
- Component displays a single value in the text font, with the Copy button right after it. <!-- BA-05 -->
- Consumer provides content the App renders, e.g. a formatted reply or a table (optional). <!-- BA-06 -->
- Consumer provides a value that is copied instead of what is shown, e.g. the full API key behind a masked one (optional). <!-- BA-07 -->
- App changes the text or the copied value. <!-- BA-08 -->
  - Component displays the change in place. <!-- BA-09 -->

**Copy**

- User clicks the Copy button. <!-- BA-10 -->
  - Component sends the content to the clipboard. <!-- BA-11 -->
  - Component changes the button to "Copied" with a check for two seconds. <!-- BA-12 -->
  - Component announces "Copied". <!-- BA-13 -->
  - Component reports the result to the App. <!-- BA-14 -->
- Component sends formatted content both as formatted text and as plain text, so headings, lists, links and tables stay when pasted into a document and plain text arrives in a plain field. <!-- BA-15 -->
- Component removes hidden parts, buttons and fields from the copy. <!-- BA-16 -->
- Consumer chooses parts of the content that are left out of the copy, e.g. an internal note (optional). <!-- BA-17 -->
- Consumer chooses the only part of the content that is copied, e.g. the table under a title (optional). <!-- BA-18 -->

**Copy refused**

- Component displays "Couldn't copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it." when the browser refuses the copy, e.g. on a page not served over https. <!-- BA-19 -->
  - Component selects the content. <!-- BA-20 -->
  - Component displays the value to copy in the message and selects it, when it differs from what is shown. <!-- BA-21 -->
  - Component announces the message. <!-- BA-22 -->
  - Component hides the message after the next successful copy. <!-- BA-23 -->

**Button**

- Consumer chooses an icon button or a button with the text "Copy" (optional, icon by default). <!-- BA-24 -->
- Consumer provides a label that names the area and describes the button, e.g. "Install command" (optional). <!-- BA-25 -->

**Tooltips**

- Consumer chooses how the name of the icon button shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-26 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: no (container: `getChildren()`) · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderCopyArea, DEFAULT_COPY_AREA_CONFIG, COPY_AREA_TEXT_STYLES, COPY_AREA_BUTTONS, COPY_AREA_TOOLTIP_MODES } from './copyAreaIndex.js';

const area = renderCopyArea(container, config, onCopy); // null after a developer error
```

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `getElement()` | Element | The CopyArea element. |
| `getError()` | object \| null | A copy of the current error (`{ errorLabel, message }`) or `null`. |
| `setText(text)` | — | Changes the shown and copied text (code or plain text; ignored with `content`, `OPTION_IGNORED`). |
| `setCopyValue(value)` | — | Sets the value copied instead of the shown content, or removes it (`null`). |
| `getChildren()` | array | The instance returned by the `content` function (a copy of the list; empty without one). |
| `destroy()` | — | Stops the feedback timer, destroys the Copy button and the content's instance, clears the container. |

### Configuration

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. |
| `text` | string | `''` | Text (kept exactly, line breaks and spaces included) | not `content` | What is shown and copied. Required unless `content` is set. |
| `textStyle` | string | `'CODE'` | `CODE`, `PLAIN` | `text` | `CODE`: fixed-width font in a box that scrolls; `PLAIN`: a single value in the text font, with the button after it (can stand inside running text). |
| `lineNumbers` | boolean | `false` | — | `textStyle:CODE` | Numbers each line (not selected, not copied). |
| `content` | function | `null` | `(host, instance) => instance \| null` | Always | Renders formatted content into `host`; copied as plain text and HTML without hidden parts, buttons, fields and `[data-copy="skip"]`; only the `[data-copy="only"]` parts when there are any. A returned instance is destroyed with the CopyArea. |
| `copyValue` | string | `null` | Text (numbers are converted) | Always | Copied instead of the shown content (as plain text); shown in the message only when the copy fails. |
| `label` | string | `''` | Text | Always | Names the code or content area (default `texts.region`) and describes the Copy button for screen readers. |
| `copyButton` | string | `'ICON'` | `ICON`, `TEXT` | Always | Icon button named "Copy", or a text button "Copy" with the icon. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | `copyButton:ICON` | How the icon button's name shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). |
| `texts.copy` | string | `'Copy'` | Text | Always | Name or label of the button. |
| `texts.copied` | string | `'Copied'` | Text | Always | Name or label after a successful copy; also announced. |
| `texts.failed` | string | `'Couldn't copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.'` | Text | Always | Message when the browser refuses the copy; also announced. |
| `texts.region` | string | `'Content to copy'` | Text | Always | Name of the code or content area when there is no `label`. |
| `onCopy` | function | `null` | `(result, instance) => {}` | Always | Takes precedence over the third argument. |

`text` together with `content`: `content` is shown (`OPTIONS_CONFLICT`). `textStyle` with `content`, `lineNumbers` without `textStyle:CODE` and `tooltipMode` with `copyButton:TEXT` are ignored (`OPTION_IGNORED`). Invalid enum values fall back to the default (`INVALID_OPTION`).

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onCopy` | `({ copied, text, errorLabel? }, instance)` | The user clicks the Copy button: `copied:true` after a successful copy, `copied:false` and `errorLabel:'COPY_FAILED'` when the browser refuses it. `text` is the plain text that was (or would have been) copied. | `setText()` and `setCopyValue()`. |

### Errors

| Label | Default message | Trigger | Visibility | Clearing |
| --- | --- | --- | --- | --- |
| `COPY_FAILED` | "Couldn't copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it." (`texts.failed`) | The browser refuses the copy (no clipboard access, e.g. not https). | corrective: below the area, announced; the content (or `copyValue`) is selected | The next successful copy. |

Developer errors prevent rendering; warnings are logged and rendering continues. Console format: `CopyArea "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `CONTENT_REQUIRED` | error | Neither a non-empty `text` nor a `content` function. |
| `OPTIONS_CONFLICT` | warning | `text` and `content` together; `content` is shown. |
| `INVALID_OPTION` | warning | Invalid `textStyle`, `copyButton`, `tooltipMode`, `content` (not a function) or `copyValue` (not text); also `setCopyValue()` with a value that is not text. |
| `OPTION_IGNORED` | warning | `textStyle` with `content`; `lineNumbers` without `textStyle:CODE`; `tooltipMode` with `copyButton:TEXT`; `setText()` with `content`. |

### Accessibility

- Code and content areas are named regions (`label`, else `texts.region`) reachable with Tab, so long content can be scrolled with the keyboard.
- The Copy button is named "Copy" and described by the label ("Copy, Install command"); after a copy its name is "Copied" and the focus stays on it.
- The result ("Copied", or the failure message) is announced through a polite status region.
- Line numbers are drawn by the stylesheet: they are not read, selected or copied.
- Code stays left-to-right on right-to-left pages; the button moves to the other side with the page.

### Examples

```js
// A masked API key: the full key is copied, never shown.
renderCopyArea(keyHost,{ id:'api-key', label:'API key', textStyle:'PLAIN', text:`${key.slice(0,8)}••••••••${key.slice(-4)}`, copyValue:key });

// Formatted content: only the table is copied, with its formatting.
renderCopyArea(reportHost,{ id:'q3-sales', label:'Sales table', copyButton:'TEXT', content:host =>
{
    host.innerHTML = `<p>Sales by region, Q3</p><table data-copy="only">${rowsHTML}</table>`;   // rowsHTML built from trusted data
    return null;
}, onCopy:( result ) => analytics.track('copy',{ copied:result.copied }) });
```

### Files

| File | Responsibility |
| --- | --- |
| `copyAreaIndex.js` | Public entry point; the only import surface. |
| `copyAreaConfig.js` | Defaults, normalization, developer validation. |
| `copyAreaComponent.js` | Copy button, clipboard, cleaned copy of content, feedback, announcements, runtime API. |
| `copyAreaHTML.js` | Area, code lines and message markup. |
| `copyAreaErrors.js` | User error, developer error and warning catalog. |
| `copyArea.css` | Presentation. |
| `copyAreaTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/copyArea.test.mjs`). |
