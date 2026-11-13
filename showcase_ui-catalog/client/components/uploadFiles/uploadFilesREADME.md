# UploadFiles

## For business

### Overview

UploadFiles lets the user add files to a form: an invoice, a contract, photos of a damage, a profile picture. The user chooses them with a button, drags them onto a drop area, pastes them or takes a photo with the phone. Each file is checked (type, size, number of files) and listed with its name, size and status. The files are either sent with the form, or uploaded one by one as soon as they are added, with a progress bar per file.

### When to use

- Use it whenever the user attaches files to a record or a request, alone or inside a Form.
- Use `uploadMode:'FORM'` (default) when the files are sent together with the other fields; use `'AUTO'` when each file goes to the server right away (large files, attachments that are saved even if the form is not).
- Use the drop area (`layout:'DROPZONE'`) when attaching files is the main task of the page; keep the button (default) for a field among others.
- Do not use it to import data into a table row by row (that is an import wizard) or to edit images.

### Key features

- A "Choose files" button (default) or a large drop area with the button inside; one file or several.
- Checks before adding: accepted types (".pdf", "image/*"), size per file, total size and number of files; a refused file stays in the list with the reason, a file already in the list is not added twice. The limits are shown under the button ("PDF or images · up to 10 MB each").
- Two ways of sending: with the form (the field holds the files), or upload as soon as added, with a progress bar per file, Cancel, Retry and several uploads at once.
- Files already saved (e.g. when editing a record) are listed first, with a link to open them.
- Optional: image previews, pasting a file (a screenshot) with Ctrl+V, and opening the phone's back or front camera directly.
- A Form field: required check, error under the field and in the Form's error summary, server errors through `setError()`.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours, type and spacing. |
| UploadFiles styles (`uploadFiles.css`) | Always | Drop area, list and states. |
| Button component and `button.css` | Always | "Choose files" and the Remove, Cancel and Retry buttons of each file. |
| Loader component and `loader.css` | `uploadMode` `AUTO` | Progress bar of each file while it uploads. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |
| Font Awesome icon library | Always | File-type icons and button symbols. Loaded by the application page. |

### Not included

The application sends the files (with the form, or in `upload()` for `AUTO`), checks their content on the server (viruses, real file type), deletes files already saved on the server when the user removes them, and shows the form's error summary. Resumable or chunked uploads of very large files, folders, cropping or editing images and a file browser of saved files are not part of this version.

## For designers

### Structure

```text
div.ui-upload-files.ui-upload-files-layout-{button|dropzone}.ui-upload-files-mode-{form|auto}[.ui-upload-files-label-{top|start}][.ui-upload-files-previews]
├── span.ui-upload-files-label  (+ span.ui-upload-files-optional | span.ui-upload-files-mandatory, hidden "(required)")
├── div.ui-upload-files-control
│   ├── input.ui-upload-files-input  type="file" hidden                 (the browser's file picker; opened by the Button)
│   ├── div.ui-upload-files-bar > span.ui-upload-files-choose          (BUTTON: Button "Choose files")
│   │   or div.ui-upload-files-dropzone                                 (DROPZONE)
│   │      ├── span.ui-upload-files-dropzone-icon
│   │      ├── span.ui-upload-files-dropzone-text                       ("Drag files here or")
│   │      └── span.ui-upload-files-choose                              (Button "Choose files")
│   ├── div.ui-upload-files-limits                                      (showLimits; "PDF or images · up to 10 MB each")
│   ├── div.ui-upload-files-help                                        (optional)
│   ├── ul.ui-upload-files-list                                         (hidden while empty)
│   │   └── li.ui-upload-files-item[data-status]
│   │       ├── img.ui-upload-files-preview | span.ui-upload-files-icon (preview with showPreviews, else the file-type icon)
│   │       ├── span.ui-upload-files-text
│   │       │   ├── span.ui-upload-files-name | a.ui-upload-files-name  (a link for a saved file with url; cut off with "…")
│   │       │   ├── span.ui-upload-files-meta > span.ui-upload-files-size + span.ui-upload-files-status
│   │       │   ├── span.ui-upload-files-reason                         (why it was refused or failed)
│   │       │   └── span.ui-upload-files-progress                       (AUTO: Loader bar while uploading)
│   │       └── span.ui-upload-files-actions > span.ui-upload-files-action (Retry, Cancel, Remove icon Buttons)
│   ├── div.ui-upload-files-summary                                     (several files: "3 files, 4.2 MB")
│   └── div.ui-upload-files-error                                       (hidden when there is no error)
└── div.ui-upload-files-live, div.ui-upload-files-alert                 (visually hidden announcements)
```

The drop area has a dashed border that turns to the accent colour (with the selected background) while files are dragged over it, and red with an error. Each file is a row: preview or icon, name (cut off with "…", full name on hover), size and status, and the buttons on the right. A refused or failed file shows its reason in red; refused and cancelled files have a muted name. With the label on the left, the label aligns with the button.

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-upload-files-label-top`, `ui-upload-files-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Layout | Button, drop area | `ui-upload-files-layout-button`, `ui-upload-files-layout-dropzone` |
| Upload mode | With the form, right away | `ui-upload-files-mode-form`, `ui-upload-files-mode-auto` |
| Previews | Off, on | —, `ui-upload-files-previews` + `img.ui-upload-files-preview` |
| Required marker | None, "(Optional)", asterisk | —, `span.ui-upload-files-optional`, `span.ui-upload-files-mandatory` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| File | Ready, waiting, uploading, uploaded, failed, cancelled, refused | `[data-status="READY"]`, `"WAITING"`, `"UPLOADING"`, `"DONE"`, `"FAILED"`, `"CANCELLED"`, `"REJECTED"` |
| Drop area | Files dragged over it | `ui-upload-files-dragover` |
| Error | Shown | `ui-upload-files-invalid` |
| Disabled | On | `ui-upload-files-disabled` |

### Styling contract

`uploadFiles.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-upload-files-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: upload files, label, dropzone text, name
  - `--c-muted`: optional, limits, help, summary, dropzone icon, icon, meta, name (status rejected, status cancelled), label (disabled), mandatory (disabled), dropzone text (disabled)
  - `--c-danger-text`: mandatory, error, reason, status (status failed), icon (status rejected, status failed)
  - `--c-border`: dropzone, item
  - `--c-surface`: dropzone
  - `--c-accent`: dropzone (dragover)
  - `--c-selected`: dropzone (dragover)
  - `--c-danger`: dropzone (invalid)
  - `--c-surface-muted`: preview, dropzone (disabled)
  - `--c-link`: name
  - `--c-link-hover`: name (hover)
  - `--c-success-text`: status (status done)
- Typography
  - `--font-ui`: upload files
  - `--fw-ui`: upload files, optional
  - `--fs-label`: label, optional, limits, help, summary, error
  - `--fw-ui-strong`: label, mandatory, error
  - `--lh-compact`: label
  - `--lh-body`: limits, help, summary, error
  - `--fs-control`: dropzone text, name
  - `--fs-caption`: meta, reason
- Borders and corners
  - `--border-thin`: dropzone, item
  - `--radius-panel`: dropzone
  - `--radius-sm`: preview
- States and motion
  - `--transition-1`: dropzone
- Sizes
  - `--icon-size-large`: dropzone icon
  - `--icon-size-medium`: icon
  - `--link-decoration`: name
  - `--link-underline-offset`: name

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-section`: upload files
  - `--gap-tight`: upload files, control, dropzone
  - `--gap-inline-items`: label, meta
  - `--padding-panel`: dropzone
  - `--space-sm-2`: item
  - `--gap-toolbar`: item
  - `--space-sm-1`: text, actions
- Sizes
  - `--size-sm-1`: icon, preview

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Spacing
  - `--gap-toolbar`: upload files (label on the left)
- Sizes
  - `--percentage-full`: upload files
  - `--form-label-width`: upload files (label on the left)
  - `--control-height`: label (label on the left)

## For AI-assisted development

### Instructions

- Read this README before writing code. Import only from `uploadFilesIndex.js`.
- Use UploadFiles for every file field; never build file inputs, drop areas or upload progress lists by hand.
- Inside a Form, give the field a `name` and leave `labelPosition` on `INHERIT`. With `uploadMode:'FORM'` the Form's values hold `File` objects: send them with `FormData` (`values.attachments.forEach(file => data.append('attachments', file))`); files already saved come back as the objects you passed.
- With `uploadMode:'AUTO'`, write `upload(file, { onProgress, signal })`: send the file (e.g. `XMLHttpRequest` for progress, or `fetch` with `signal`), call `onProgress(fraction)` with 0–1, resolve with what the server returns (an id, a url) and reject on failure (reject with a string or `{ userMessage }` to show your own reason). The value is `{ name, size, type, result }` per uploaded file.
- Always set `accept` and `maxFileSize` to what the server accepts; the server must check again (the browser's check is a convenience, not security).
- To edit a record, pass the saved files in `initialFiles` (or `setValue()`) as `{ id, name, size, type, url }`; when the user removes one, it disappears from the value: compare with the saved list on submit to delete it on the server.
- Show server errors with `setError(message)`; they clear when the user changes the files.
- Give each field a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again (it stops running uploads).

### Safety

- Never trust the file type or size from the browser: check them again on the server, and never show uploaded files from other users without the server's check.
- Never put a file's name into HTML yourself; UploadFiles escapes it. Saved-file links accept only ordinary addresses (`javascript:` and `data:` addresses are dropped).
- Never remove the label, the button names or the announcements; never signal a file's status by colour alone (the status text stays).

### Example prompts

```text
Add a mandatory field "Invoice" to the expense form that accepts one PDF or image up to 10 MB, and send it with the form.
```

```text
Add a drop area "Photos of the damage" that uploads each photo right away to /api/claims/{id}/photos with a progress bar, shows previews and accepts at most 10 images.
```

```text
On the profile page, let the user take a profile photo with the phone's front camera.
```

## For developers

### Business analysis

> **Component**: the UploadFiles field itself. **Consumer**: the developer who configures the UploadFiles in the application's code. **App**: the running application that uses the UploadFiles; it provides the data, performs the actions and stores the changes.

**Adding files**

- User clicks "Choose files" (or "Choose file" for one file) and picks files in the browser's window. <!-- BA-01 -->
  - Component adds them to the list. <!-- BA-02 -->
- Consumer chooses a drop area instead of the plain button (optional). <!-- BA-03 -->
  - User drags files onto the drop area. <!-- BA-04 -->
  - Component marks the area while the files are over it, then adds them. <!-- BA-05 -->
- Consumer enables pasting (optional). <!-- BA-06 -->
  - User pastes a file, e.g. a screenshot, while the field has the focus. <!-- BA-07 -->
  - Component adds it. <!-- BA-08 -->
- Consumer chooses to open the phone's back or front camera directly, for images (optional). <!-- BA-09 -->
- Component announces the added files to screen readers. <!-- BA-10 -->

**Checking files**

- Consumer chooses the accepted types, the size per file, the total size and the number of files. <!-- BA-11 -->
- Component displays the limits under the button (optional). <!-- BA-12 -->
- Component checks each file before adding it. <!-- BA-13 -->
  - Component keeps a refused file in the list with the reason, e.g. "Larger than 10 MB", and reports it to the App. <!-- BA-14 -->
  - Component removes the refused files when the user adds new ones. <!-- BA-15 -->
- Component prevents adding a file that is already in the list, and announces it. <!-- BA-16 -->
- Consumer chooses one file only. <!-- BA-17 -->
  - Component changes the file when the user adds another one. <!-- BA-18 -->

**List of files**

- Component displays each file with its type icon, or a preview for images (optional), its name, size and status. <!-- BA-19 -->
- Component displays the full name of a long name on hover. <!-- BA-20 -->
- Component displays the number and total size of the files ("3 files, 4.2 MB"). <!-- BA-21 -->
- User clicks Remove on a file. <!-- BA-22 -->
  - Component removes it and moves the focus to the next file. <!-- BA-23 -->
- App provides the files already saved, e.g. when editing a record. <!-- BA-24 -->
  - Component displays them first, with a link to open them. <!-- BA-25 -->

**Sending with the form (FORM)**

- Component keeps the files until the App sends them with the form. <!-- BA-26 -->
- Component reports the changed list to the App. <!-- BA-27 -->

**Uploading right away (AUTO)**

- Component sends each added file to the App, at most a few at a time, chosen by the Consumer. <!-- BA-28 -->
  - App sends it to the server and provides the progress. <!-- BA-29 -->
  - Component displays a progress bar and "Uploading 45%". <!-- BA-30 -->
  - Component displays "Uploaded" when the App reports the end, or "Not uploaded" with the reason when it fails. <!-- BA-31 -->
- User clicks Cancel on an upload. <!-- BA-32 -->
  - Component marks it as cancelled and keeps the file in the list. <!-- BA-33 -->
- User clicks Retry on a failed or cancelled file. <!-- BA-34 -->
  - Component sends it to the App again. <!-- BA-35 -->
- Component reports the uploaded files to the App when all uploads have ended. <!-- BA-36 -->

**Validation**

- Component checks that a required field has a file. <!-- BA-37 -->
- Component checks that no upload is running and none has failed (AUTO). <!-- BA-38 -->
  - Component displays the error message under the field until the user fixes it. <!-- BA-39 -->
- App provides a server error for the field. <!-- BA-40 -->
  - Component displays it until the user changes the files. <!-- BA-41 -->

**Tooltips**

- Consumer chooses how the full names and the buttons' names show on hover and keyboard focus: the browser's tooltip (default), a Tooltip or none (optional). <!-- BA-42 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderUploadFiles, DEFAULT_UPLOAD_FILES_CONFIG, UPLOAD_FILES_MODES, UPLOAD_FILES_LAYOUTS, UPLOAD_FILES_CAMERAS, UPLOAD_FILES_LABEL_POSITIONS, UPLOAD_FILES_MANDATORY_INDICATORS, UPLOAD_FILES_TOOLTIP_MODES } from './uploadFilesIndex.js';

const files = renderUploadFiles(container, config); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The configuration is immutable; `config.initialFiles` remains the initial value.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getValue()` | array | A new array. `FORM`: the `File` objects and copies of the saved files; `AUTO`: `{ name, size, type, result }` of the uploaded files and copies of the saved files. Refused, failed, cancelled and running files are not part of it. |
| `setValue(value)` | `{ valid, errorLabel }` | Replaces the list with `File` objects and/or saved files (`{ name, size?, type?, url?, previewUrl?, … }`); not dirty, no callbacks. `AUTO` uploads the `File` objects. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: no validation, the shown error is removed. |
| `validate()` | `{ valid, errorLabel }` | Shows or clears the field error (`EXTERNAL`, `UPLOADS_PENDING`, `UPLOADS_FAILED`, `REQUIRED`, in that order). |
| `getError()` | object \| null | Copy of the current error. |
| `setError(message)` / `clearError()` | — | Shows / removes an external error (label `EXTERNAL`), cleared by the user's next change of the files. |
| `focus()` | boolean | Moves focus to the "Choose files" button. |
| `getLabel()` | string | The label; Form prefixes error-summary entries with it. |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`. |
| `isDirty()` | boolean | Whether the user changed the files. |
| `getFiles()` | array | Copy of every file in the list: `{ key, name, size, type, status, progress (0–100), reason, errorLabel, result, saved }`. |
| `addFiles(files)` | array | Adds `File` objects with the same checks as the user's (no callbacks); returns their entries. |
| `removeFile(key)` | boolean | Removes a file (stops its upload). |
| `cancelFile(key)` / `retryFile(key)` | boolean | `AUTO`: stops a waiting or running upload / uploads a failed or cancelled file again. |
| `isUploading()` | boolean | Whether uploads are waiting or running. |
| `setDisabled(disabled)` | — | Turns choosing, dropping, pasting and removing off or on; running uploads continue. |
| `destroy()` | — | Stops the uploads (their `signal` aborts), removes listeners, Buttons, Loaders, previews and the Tooltip, clears the container. |

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used. Sizes are in bytes (1 MB = 1,000,000 bytes, as the sizes are shown).

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the field; the Buttons and the list items derive their ids from it. |
| `name` | string | value of `id` | Text | Always | Key of the value in a Form. |
| `label` | string | — | Text | Always | Required. The field's label; it also names the "Choose files" button for screen readers. |
| `help` | string | `''` | Text | Always | Help text, linked to the button. |
| `labelPosition` | string | `'TOP'` | `TOP`, `START`, `INHERIT` | Always | Label above the field, on its left, or as set by the surrounding Form/ContentGroup (`INHERIT`). `START` needs a surrounding container at least 36rem wide. |
| `mandatory` | boolean | `true` | — | Always | `true`: an empty field is a `REQUIRED` error. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | Always | Marker next to the label. |
| `uploadMode` | string | `'FORM'` | `FORM`, `AUTO` | Always | `FORM`: the files stay in the browser and are sent with the form. `AUTO`: each file is uploaded through `upload` as soon as it is added. |
| `upload` | function | — | `(file, { onProgress, signal }) => Promise` | `AUTO` | Required with `AUTO`. Uploads one file: call `onProgress(fraction)` (0–1), stop when `signal` aborts (Cancel, Remove, `destroy()`), resolve with the server's result (kept as `result`), reject on failure (a string or `{ userMessage }` replaces the default reason). |
| `maxParallel` | number | `3` | Whole number from 1 | `AUTO` | Uploads running at the same time; the others wait. |
| `layout` | string | `'BUTTON'` | `BUTTON`, `DROPZONE` | Always | The button alone, or a drop area with the button inside. |
| `multiple` | boolean | `true` | — | Always | `false`: one file; a new file replaces it. |
| `accept` | string \| array | `''` (any) | Extensions (`.pdf`) and types (`image/*`, `application/pdf`), comma-separated or an array | Always | Accepted files; also limits the browser's picker. |
| `maxFiles` | number | no limit | Whole number from 1 | `multiple` | Most files in the list. |
| `maxFileSize` | number | no limit | Bytes | Always | Largest file. |
| `maxTotalSize` | number | no limit | Bytes | `multiple` | Largest total of all files. |
| `showLimits` | boolean | `true` | — | Always | Shows the types and limits under the button. |
| `showPreviews` | boolean | `false` | — | Always | Small previews of images instead of the file-type icon (also `previewUrl` of saved files). |
| `allowPaste` | boolean | `false` | — | Always | Adds files pasted (Ctrl+V) while the field has the focus, e.g. screenshots; the limits line mentions it. |
| `camera` | string | `'NONE'` | `NONE`, `BACK`, `FRONT` | Always | When `accept` allows images, on phones: open the back or front camera directly instead of the usual choice (files, gallery, camera). Desktop browsers ignore it. |
| `initialFiles` | array | `[]` | `{ name, size?, type?, url?, previewUrl?, … }` | Always | Files already saved; listed first, as uploaded. Other members (e.g. `id`) are kept and returned by `getValue()`. |
| `disabled` | boolean | `false` | — | Always | Starts disabled. |
| `locale` | string | browser language | BCP 47 language tag | Always | Number format of the sizes. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How cut-off file names show in full on hover: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). The icon buttons (Remove, Cancel, Retry) get a Tooltip only with `TOOLTIP`. |
| `texts.*` | string | English defaults | Text; `{name}`, `{count}`, `{size}`, `{percent}` are filled in | Always | `choose`, `chooseOne`, `dropzone`, `dropzoneOne`, `paste`, `list`, `summary`, `summaryOne`, `optional`, `required`, `remove`, `cancel`, `retry` (button names, with `{name}`), `uploading`, `limitsSize`, `limitsFiles`, `limitsTotal`, `separator`, `or`, `typeGroups.*` (`image`, `video`, `audio`, `text`, `application`), `statuses.*` (one per file status), the announcements `added`, `addedOne`, `removed`, `uploaded`, `allUploaded`, `duplicate`, `notAdded`, `reasons.*` and `errors.*` (below). |
| `onValueChange` | function | — | `(value, instance)` | Always | See Callbacks. |
| `onFileRejected` | function | — | `(file, instance)` | Always | See Callbacks. |
| `onUploadsComplete` | function | — | `(value, instance)` | `AUTO` | See Callbacks. |

`upload`, `maxParallel` and `onUploadsComplete` with `FORM`, `maxFiles` and `maxTotalSize` with one file, and `camera` when `accept` allows no images are ignored with an `OPTION_IGNORED` warning.

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)`, `value` as `getValue()` | The user adds or removes files, or one of the user's uploads ends (`AUTO`). | `setValue()`, `addFiles()`, `removeFile()`, the initial render; files refused or still uploading (they are not part of the value). |
| `onFileRejected` | `(file, instance)`, `file` as in `getFiles()` with `errorLabel` and `reason` | The user adds a file that is refused (type, size, total size, number of files). | `addFiles()`; duplicates (they are ignored). |
| `onUploadsComplete` | `(value, instance)` | `AUTO`: the last running upload of a batch started by the user ends (uploaded, failed or cancelled). | Uploads started by `setValue()` or `addFiles()`. |

### Errors

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `UPLOADS_PENDING` | Wait until the files are uploaded. | `AUTO`: validation while uploads wait or run. | Corrective |
| `UPLOADS_FAILED` | Some files were not uploaded: upload them again or remove them. | `AUTO`: validation with failed uploads. | Corrective |
| `REQUIRED` | Add a file. | Mandatory field without files; shown on `validate()`, `setValue()`, or when focus leaves the field after a change; cleared as soon as a file is added. | Corrective |

Reasons shown next to a file (`texts.reasons`, the file's `errorLabel`): `TYPE_NOT_ACCEPTED` ("This type of file is not accepted."), `FILE_TOO_LARGE` ("Larger than {size}."), `TOTAL_TOO_LARGE` ("All files together would be larger than {size}."), `TOO_MANY_FILES` ("At most {count} files."), `UPLOAD_FAILED` ("The upload failed. Try again.", or the App's reason).

Developer errors prevent rendering (`renderUploadFiles()` returns `null`); warnings are logged and rendering continues. Console format: `UploadFiles "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `UPLOAD_HANDLER_REQUIRED` | error | `uploadMode:'AUTO'` without an `upload` function. |
| `INVALID_OPTION` | warning | Invalid enumerated value or limit. |
| `OPTION_IGNORED` | warning | Option that does not apply (see Configuration). |
| `INVALID_ACCEPT` | warning | An `accept` entry is neither an extension nor a type; it is dropped. |
| `INVALID_FILE_ENTRY` | warning | An entry of `initialFiles` or `setValue()` is neither a `File` nor an object with a `name`; it is dropped. |
| `UPLOAD_HANDLER_FAILED` | warning | `upload()` threw or returned no Promise; the file is marked as failed. |
| `UNKNOWN_FILE` | warning | `removeFile()`, `cancelFile()` or `retryFile()` with a key that is not in the list. |

### Accessibility

- The browser's file input stays hidden; the "Choose files" Button opens it. The button is named by the field's label and its own text (`aria-labelledby`) and described by the limits, the help and a shown error (`aria-describedby`).
- The drop area is a convenience for the mouse: everything it does is also possible with the button (and pasting with the keyboard).
- The list is a list named "Chosen files"; each file's buttons are named with the file ("Remove report.pdf"). After Remove, focus goes to the next file's Remove button, or back to "Choose files"; after Cancel to Remove, after Retry to Cancel.
- Added, removed and uploaded files are announced politely; refused files and failed uploads are announced at once (`aria-live="assertive"`). Each upload's Loader has its own name ("Uploading report.pdf") and its progress.
- A file's status is always a text, never colour alone; refused and failed files also show their reason in text.
- Errors under the field are not announced by the field; the consumer's error summary (Form) does that.

### Examples

Sent with the form:

```js
renderForm(formHost,{ id:'expense', onSubmit:values =>
{
    const data = new FormData();
    data.append('amount',values.amount);
    values.receipts.forEach(file => data.append('receipts',file));   // File objects
    return fetch('/api/expenses',{ method:'POST', body:data });
} },[ host => renderUploadFiles(host,{ id:'receipts', label:'Receipts', accept:'.pdf,image/*', maxFileSize:10000000, maxFiles:5 }) ]);
```

Uploaded right away, with progress:

```js
function upload( file, { onProgress, signal } )
{
    return new Promise(( resolve, reject ) =>
    {
        const request = new XMLHttpRequest();
        request.open('POST',`/api/claims/${claimId}/photos`);
        request.upload.onprogress = event => onProgress(event.loaded / event.total);
        request.onload = () => ( request.status < 300 ? resolve(JSON.parse(request.responseText)) : reject({ userMessage:'The server refused this photo.' }) );
        request.onerror = () => reject(new Error('network'));
        signal.addEventListener('abort',() => request.abort());
        const data = new FormData(); data.append('photo',file); request.send(data);
    });
}
renderUploadFiles(host,{ id:'damage-photos', label:'Photos of the damage', uploadMode:'AUTO', upload, layout:'DROPZONE', accept:'image/*', maxFiles:10, showPreviews:true });
```

Editing a record with files already saved:

```js
renderUploadFiles(host,{ id:'contract', label:'Signed contract', multiple:false, accept:'.pdf', initialFiles:[ { id:'c-17', name:'contract.pdf', size:482000, type:'application/pdf', url:'/files/c-17' } ] });
```

### Files

| File | Responsibility |
| --- | --- |
| `uploadFilesIndex.js` | Public entry point; the only import surface. |
| `uploadFilesConfig.js` | Defaults, allowed values, texts, normalization (accept list, limits, saved files), developer validation. |
| `uploadFilesComponent.js` | Lifecycle, checks, list, upload queue, validation, runtime API. |
| `uploadFilesHTML.js` | Field, list-item and limits markup. |
| `uploadFilesEvents.js` | File picker, drag and drop, paste and focus leave. |
| `uploadFilesFiles.js` | Pure helpers: accept list, type checks, sizes, icons. |
| `uploadFilesState.js` | Per-instance runtime state (files, statuses, dirty, error). |
| `uploadFilesErrors.js` | User errors, file reasons, developer errors and warnings. |
| `uploadFiles.css` | Presentation. |
| `uploadFilesTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/uploadFiles.test.mjs`). |
