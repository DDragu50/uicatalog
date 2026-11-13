# TreeView — test plan

This plan proves the TreeView README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components treeView` (code: `tests/components/treeView.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: Documents (a folder icon) with Contracts (counter 2: Contract Acme, Contract Beta) and Invoices; Photos with Holiday; Archive (unavailable); Read me.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-02, BA-03, onExpandChange | auto | Click the arrow of Documents twice. | The top level; then Contracts and Invoices indented under Documents; opening and closing reported. |
| T-02 | BA-04 | auto | Render `guideLines:true` with Documents open. | Guide lines between Documents and its sub-items. |
| T-03 | BA-05 | auto | Open Documents. | A folder icon before Documents; "2" after Contracts. |
| T-04 | BA-06, BA-07 | auto | In an editable tree click Archive and press F2; then in a tree with checkboxes tick it. | Greyed out and unavailable; not selected, not renamed, not draggable; not ticked. |
| T-05 | BA-08, BA-09, BA-10, onCurrentChange | auto | Click Read me. | A thin frame around it; `onCurrentChange` reports it with the instance. |
| T-06 | BA-11, BA-12, BA-13, onActivate | auto | In a browsing-only tree click Read me. | `onActivate` reports Read me; nothing is selected. |
| T-07 | BA-11, BA-15, BA-16, onValueChange | auto | In a one-selection tree click Invoices. | Selected with a filled background and bold text; `onValueChange('invoices')`. |
| T-08 | BA-11, BA-17, BA-18, BA-19, BA-20 | auto | In a tree with checkboxes tick Contracts, then untick Contract Beta. | Contracts and both contracts ticked, Documents partly; then Contracts and Documents partly ticked (a dash); each change reported. |
| T-09 | BA-21, BA-22 | auto | In a tree with checkboxes click the name Read me. | The frame moves to it; it is not ticked; nothing reported. |
| T-10 | BA-23 | auto | Tick Documents with `checkedValue` `ALL`, `LEAVES`, `TOP`. | All five ids; only the end items; only Documents. |
| T-11 | BA-24, BA-25, BA-26, BA-27 | auto | Type "acme" in the search field, then "zzz". | Documents, Contracts, Contract Acme with "Acme" in bold; then "No matching items". |
| T-12 | BA-28, BA-29, BA-30, BA-31, LOAD_FAILED | auto | Open a parent loaded on demand whose first load fails after 0.9 s; open it again. | The App is asked; a small turning ring after a short delay; "Could not load. Open again to retry." on the parent and `[LOAD_FAILED]`; the retry shows the sub-item. |
| T-13 | BA-32, BA-33, BA-34, BA-35, BA-49, onEdit | auto | In an editable tree, with Read me current, click Add, type "Notes" and press Enter; with Photos current click Add sub-item and press Enter. | The eight toolbar buttons; a new item after Read me with its name open; `onEdit` reports ADD, then RENAME; the sub-item is added under Photos. |
| T-14 | BA-36, BA-37, BA-38 | auto | On Read me press F2, type and press Escape; click Rename, type "Read me first" and press Enter. | Escape keeps the old name (nothing reported); Enter keeps the new name (RENAME). |
| T-15 | BA-39, BA-40, BA-41 | auto | With Contracts current press Delete; confirm. | "Delete "Contracts"?" with "Its 2 sub-items are deleted too.", Cancel focused; Contracts and both contracts are removed and reported. |
| T-16 | BA-42, BA-43 | auto | With Invoices current click Move up, Move down, Move into the item above, Move out of the parent. | Invoices moves accordingly; each move reported. |
| T-17 | BA-44, BA-45, BA-46 | auto | Drag Read me onto the middle of Photos and drop it. | The drop marker shows "inside"; Read me is moved into Photos and the move reported. |
| T-18 | BA-47, BA-48 | auto | In a tree Folder, Photos, Read me with a `canMove` that forbids moves into Photos, make Read me current; drag it onto Photos, then onto Folder. | "Move into the item above" is disabled, "Move up" is not; the drop on Photos is not offered and nothing moves; the drop on Folder is offered and moves it. |
| T-19 | BA-51, BA-52, BA-53, BA-55, onAction | auto | Add the actions Open and an icon-only Print (not for folders); make Documents, Archive and Read me current; press Print on Read me. | Print disabled for the folder; both disabled for the unavailable item; `onAction` reports "print" with Read me. |
| T-20 | BA-56 | auto | Put a one-selection tree named "folder" in a Form; select Read me. | The form's values hold `{ folder:'readme' }`. |
| T-21 | BA-57, REQUIRED_SELECTION | auto | Call `validate()` on a required tree; select Read me. | "Select an item.", the tree marked invalid and the label in the error colour; cleared by the selection. |
| T-22 | EXTERNAL | auto | With Read me selected call `setError('This folder is full.')`; select Photos. | The message is shown with label `EXTERNAL`; removed by the user's change. |
| T-23 | BA-58 | auto | Focus the tree and press Right, Right, Down, Left, Left, End, Home. | Documents opens, Contracts, Invoices, back to Documents, Documents closes, Read me, Documents. |
| T-24 | BA-59 | auto | Type "re". | Read me is reached. |
| T-25 | BA-60 | auto | Press "*" on Documents. | Documents and Photos open; reported once (it was reported once per parent before Delivery 128). |
| T-26 | BA-61 | auto | Render `tooltipMode` `TITLE`, the default, then `TOOLTIP` with a long name in a 9rem space and hover it. | `TITLE`: the name as the browser tooltip; default: none; `TOOLTIP`: a Tooltip with the full name. |
| T-27 | LABEL_REQUIRED | auto | Render a required one-selection tree without label. | Nothing is rendered; the console shows `[LABEL_REQUIRED]`. |
| T-28 | LABEL_MISSING, OPTION_IGNORED, INVALID_ICON_CLASS, INVALID_ITEM, DUPLICATE_ITEM_ID, UNKNOWN_ITEM, SINGLE_SELECTED | auto | Render a browsing tree without a name, `checkedValue`, a bad icon class, an item without label and a repeated id; call `expand('nope')`; then a one-selection tree with two selected items. | One warning each; only the first item is selected. |
| T-29 | INVALID_ACTION, DUPLICATE_ACTION_KEY, ACTION_HANDLER_MISSING, UNKNOWN_ACTION | auto | Add actions with a missing label and a repeated key, without `onAction`; call `setActionDisabled('nope', true)`. | One warning each; the call returns false with `[UNKNOWN_ACTION]`. |
| M-01 | BA-14, BA-50, BA-54 | manual | In the showcase, choose an item, edit the tree and press an action of the live example. | The Output panel reports each: the application opens the item, stores the change and performs the action. |
| M-02 | BA-03, BA-04, BA-09, BA-16, BA-20, BA-29, BA-32, BA-45 | manual | Open the gallery (`npm run gallery`, TreeView) in the light and the dark theme and from right to left; drag items with the mouse. | Indentation, guide lines, frames, selection, dashes, the loading ring, the toolbar and drop markers look as in the design; from right to left the tree is mirrored. |
| M-03 | BA-02, BA-18, BA-58 | manual | With a screen reader, move through the tree, open parents and tick items. | Items are read with their level, position, expanded and ticked states. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/treeView.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- TreeView uses Button, Message and Loader: after a change to any of them, run `npm run test:components treeView` and `npm test`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, real dragging and screen readers.
