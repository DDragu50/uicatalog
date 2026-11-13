# CopyArea — test plan

This plan proves the CopyArea README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components copyArea` (code: `tests/components/copyArea.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02 | auto | Render `text` with two lines, the second indented. | The code shows both lines exactly (line break and indentation kept) in the code box (`ui-copy-area-code`), in the code font. |
| T-02 | BA-03 | auto | Render three lines with `lineNumbers:true`; select the code. | Three numbered lines; the selection holds the code without the numbers. |
| T-03 | BA-04 | auto | Render 60 lines. | The code box is shorter than its content and scrolls; the box can be reached with Tab. |
| T-04 | BA-05 | auto | Render `textStyle:'PLAIN'` with an order number. | A span in the text font; the Copy button stands on the same line, right after the text. |
| T-05 | BA-06, BA-15, BA-16 | auto | Render `content` with a paragraph, a numbered list with a link and bold text, a screen-reader-only text and a button; click Copy. | The clipboard holds HTML with the list, the link and the bold text, and plain text with "1." and "2."; neither holds the screen-reader-only text or the button's text. |
| T-06 | BA-17, BA-18 | auto | Render `content` with a note marked `data-copy="skip"`; copy. Render `content` with a title and a table marked `data-copy="only"`; copy. | The note is not copied; only the table is copied (cells separated by tabs in the plain text). |
| T-07 | BA-07 | auto | Render a masked key with `copyValue` (the full key); click Copy. | The clipboard holds the full key, not the masked text. |
| T-08 | BA-08, BA-09 | auto | Call `setText('new text')`, copy; call `setCopyValue('value')`, copy; call `setCopyValue(null)`, copy. | The new text is shown and copied; then the value is copied; then the shown text again. |
| T-09 | BA-10, BA-11 | auto | Click the Copy button. | The clipboard holds the text exactly as given. |
| T-10 | BA-12 | auto | Press Tab until the Copy button has the focus; press Enter; wait 2.2 seconds. | The button is named "Copied" with a check icon and keeps the focus; after 2 seconds it is named "Copy" again. |
| T-11 | BA-13 | auto | Click Copy. | The status region says "Copied". |
| T-12 | BA-14, onCopy | auto | Click Copy. | `onCopy` runs once with `{ copied:true, text }` and the instance. |
| T-13 | BA-19, BA-20, BA-22, COPY_FAILED | auto | Make the browser refuse the clipboard; click Copy. | The message "Couldn't copy. The content is selected: press Ctrl+C (Cmd+C on a Mac) to copy it." is shown and announced; the code is selected; `getError()` returns `COPY_FAILED`; `onCopy` runs with `copied:false` and `errorLabel:'COPY_FAILED'`. |
| T-14 | BA-21 | auto | With `copyValue` set, make the browser refuse the clipboard; click Copy. | The message shows the value to copy, and that value is selected. |
| T-15 | BA-23 | auto | After a refused copy, allow the clipboard again; click Copy. | The message is hidden and `getError()` returns `null`. |
| T-16 | BA-24 | auto | Render with `copyButton:'TEXT'`; click Copy. | The button shows the text "Copy", then "Copied". |
| T-17 | BA-25 | auto | Render with `label:'Install command'`. | The code region is named "Install command"; the Copy button is described by "Install command". |
| T-18 | BA-26 | auto | Render with `tooltipMode` `TITLE`, then `NONE`, then `TOOLTIP` and hover the button. | `TITLE`: the button's title is "Copy"; `NONE`: no title; `TOOLTIP`: a Tooltip "Copy" appears. |
| T-19 | CONTENT_REQUIRED | auto | Render with neither `text` nor `content`. | Nothing is rendered; the console shows `CopyArea "…" [CONTENT_REQUIRED]`. |
| T-20 | OPTIONS_CONFLICT | auto | Render with both `text` and `content`. | The content is shown; the console warns `[OPTIONS_CONFLICT]`. |
| T-21 | OPTION_IGNORED | auto | Render `lineNumbers:true` with `textStyle:'PLAIN'`; render `tooltipMode` with `copyButton:'TEXT'`; call `setText()` on an area with `content`. | Each renders (or keeps the content) and the console warns `[OPTION_IGNORED]`. |
| T-22 | INVALID_OPTION | auto | Render `copyValue` as an object. | The shown text is copied; the console warns `[INVALID_OPTION]`. |
| M-01 | BA-02, BA-04, BA-05 | manual | Open the gallery (`npm run gallery`, CopyArea) in the light and the dark theme, from left to right and from right to left, and in a 380 px wide window. | The code box, the single value and the button look as in the design; long code scrolls inside its box; nothing overflows the page. |
| M-02 | BA-15 | manual | Copy the "Formatted content" example of the gallery (CopyArea) and paste it into Word or an e-mail, then into a plain text field. | The document keeps the list, the link and the bold text; the plain field gets clean text with "1." and "2.". |
| M-03 | BA-13 | manual | With a screen reader (NVDA or VoiceOver), copy an example of the gallery (CopyArea). | "Copied" is read without moving the focus. (The failure message is announced through the same status region; T-13 checks its text.) |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/copyArea.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run `npm run test:components copyArea`, `npm test` and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, pasting into other applications, screen readers.
- Test as a user: real clicks and keys through Playwright, the result read from the page, the clipboard and the instance members, never from the component's internal files.
