# UploadFiles — test plan

This plan proves the UploadFiles README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components uploadFiles` (code: `tests/components/uploadFiles.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: small made-up files (`report.pdf`, `notes.txt`, `one.png`, …). In `AUTO` cases the test's `upload` function keeps each call, so the case decides when an upload progresses, ends or fails.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-10, BA-21, BA-27, onValueChange | auto | Click "Choose files" and pick report.pdf (1.2 kB) and notes.txt (300 B). | The browser's window for several files; both listed; "2 files, 1.5 kB"; "2 files added" announced; `onValueChange` reports both `File` objects with the instance. |
| T-02 | BA-03, BA-04, BA-05 | auto | With `layout:'DROPZONE'` drag scan.pdf over the area and drop it. | "Drag files here or" with the button inside; the area is marked while the file is over it, then the file is added. |
| T-03 | BA-06, BA-07, BA-08 | auto | With `allowPaste:true` focus the field and paste a screenshot; then without `allowPaste`. | The limits mention pasting; the screenshot is added; without the option nothing is added. |
| T-04 | BA-09 | auto | Render `camera` `NONE`, `BACK`, `FRONT` for images. | The browser's input asks for no camera, the back one, the front one. |
| T-05 | BA-11, BA-12, BA-13, BA-14, TYPE_NOT_ACCEPTED, FILE_TOO_LARGE, onFileRejected | auto | With PDF or images up to 1 kB, at most 5 files, up to 20 MB in total, pick notes.txt, big.pdf (2 kB) and ok.pdf. | "PDF or images · up to 1 kB each · at most 5 files · up to 20 MB in total"; notes.txt and big.pdf stay "Not added" with "This type of file is not accepted." and "Larger than 1 kB.", announced at once and reported; only ok.pdf is in the value. |
| T-06 | BA-15, TOTAL_TOO_LARGE, TOO_MANY_FILES | auto | With at most 3 files and 2.5 kB in total, pick three files of 1 kB; then one of 400 B; then one more. | The third is refused ("All files together would be larger than 2.5 kB."); it is removed when the next file is added; the fifth is refused ("At most 3 files."). |
| T-07 | BA-16 | auto | Pick report.pdf twice. | It is listed once; "report.pdf is already in the list" is announced; nothing is reported. |
| T-08 | BA-17, BA-18 | auto | With `multiple:false` pick first.pdf, then second.pdf. | "Choose file", one file at a time; second.pdf replaces first.pdf; no summary. |
| T-09 | BA-19, BA-20 | auto | With previews pick photo.png and report.pdf (2.5 MB); then, in a 14rem space, a long name. | A preview for the image, the PDF icon, name and size; the full name as the browser's tooltip; a long name is cut off. |
| T-10 | BA-22, BA-23 | auto | Pick a.pdf, b.pdf, c.pdf; remove b, then c, then a. | "Remove b.pdf"; focus moves to the next file, the one before, then "Choose files"; "b.pdf removed" announced; each change reported. |
| T-11 | BA-24, BA-25 | auto | Render a saved contract.pdf with an address; pick annex.pdf; then `setValue` with a `javascript:` address. | The saved file first, as a link opening in a new tab; kept in the value with its own members; an unsafe address is not a link. |
| T-12 | BA-26 | auto | Put the field named "receipts" in a Form; pick r.pdf; read the form's values. | `receipts` holds the `File` object. |
| T-13 | BA-28, BA-29, BA-30, BA-31, BA-36, UPLOAD_FAILED, onUploadsComplete | auto | With `uploadMode:'AUTO'` and one upload at a time pick one.png and two.png; report 45 %, then the end of one.png; fail two.png with the App's reason; retry it and fail it without a reason. | one.png uploads, two.png "Waiting"; "Uploading 45%" with a progress bar; "Uploaded" and the value reported; two.png starts and shows "Not uploaded" with the App's reason; `onUploadsComplete` once with one.png; then the default reason. |
| T-14 | BA-32, BA-33, BA-34, BA-35 | auto | Pick one.png, click Cancel, then Retry; fail it. | "Upload cancelled", the file kept and its upload stopped, focus on Remove; Retry sends it again, focus on Cancel; a failed file also offers Retry. |
| T-15 | BA-37, BA-39, REQUIRED | auto | Call `validate()` on a required field; pick a.pdf; remove it and leave the field. | "Add a file." under the field (the button is described by it); cleared by the file; shown again when focus leaves after the change. |
| T-16 | BA-38, UPLOADS_PENDING, UPLOADS_FAILED | auto | In `AUTO` pick one.png and call `validate()`; fail the upload; retry it and let it end. | "Wait until the files are uploaded."; then "Some files were not uploaded: upload them again or remove them."; cleared when it is uploaded. |
| T-17 | BA-40, BA-41, EXTERNAL | auto | Call `setError('The server could not read this file.')`; pick a.pdf. | The message is shown with label `EXTERNAL`; removed by the user's change. |
| T-18 | BA-42 | auto | Render the default, `NONE`, then `TOOLTIP` in a 14rem space; hover the long name and its Remove button. | The browser's tooltip; none; a Tooltip with the full name and one with "Remove …". |
| T-19 | LABEL_REQUIRED, UPLOAD_HANDLER_REQUIRED | auto | Render without a label; then `AUTO` without `upload`. | Nothing is rendered; the console shows `[LABEL_REQUIRED]` and `[UPLOAD_HANDLER_REQUIRED]`. |
| T-20 | OPTION_IGNORED, INVALID_ACCEPT, INVALID_FILE_ENTRY, UNKNOWN_FILE, UPLOAD_HANDLER_FAILED | auto | Render one file with `maxFiles` and `upload`, a wrong `accept` entry, a saved file without a name; call `removeFile('nope')`; then `AUTO` with an `upload` that throws and pick a file. | One warning each; the wrong entries are dropped; the file is marked as failed. |
| M-01 | BA-09, BA-29 | manual | On a phone, open the live example with the back camera; in the showcase upload a file in `AUTO`. | The camera opens directly; the Output panel shows the App's upload and its progress. |
| M-02 | BA-05, BA-19, BA-30, BA-31 | manual | Open the gallery (`npm run gallery`, UploadFiles) in the light and the dark theme and from right to left; drag real files from the desktop. | Drop area, list, icons, previews, progress bars and statuses look as in the design. |
| M-03 | BA-10, BA-14, BA-31 | manual | With a screen reader, add, refuse, remove and upload files. | Added, removed and uploaded files are announced politely, refused and failed ones at once. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/uploadFiles.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- UploadFiles uses Button and Loader: after a change to any of them, run `npm run test:components uploadFiles` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, phones, real dragging and screen readers.
