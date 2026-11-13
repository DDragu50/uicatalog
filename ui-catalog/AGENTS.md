# Instructions for AI tools

Read this file first when you build an application with UI Catalog or change the library itself. It applies to every component; each component's README adds what is specific to it.

## What UI Catalog is

Thirty interface components in plain JavaScript (ES modules) and CSS, with no framework and no build step. Every component has one entry point (`xIndex.js`) and one contract (`xREADME.md`); the look comes from the design tokens in `design-system.css`.

## Where things are

| Path | What you find |
| --- | --- |
| `source/design-system.css` | Every token: colours, typography roles, spacing, sizes, the dark theme, the cascade layers. |
| `source/app-shell.css` | Page reset and bare HTML elements. |
| `source/components-js/<name>/<name>README.md` | The contract of a component: options, members, callbacks, errors, accessibility, styling contract, Business analysis. |
| `source/components-js/<name>/<name>Index.js` | The only file you import from. |
| `source/components-js/how-to-use-the-framework.md` | How to load, render, combine and restyle components. |
| `source/components-js/how-to-build-a-design-system.md` | How to adapt the tokens to a brand. |
| `source/components-js/framework-component-development-guidelines.md` | How components are built (for changes to the library). |
| `starter/` | A minimal working page to copy. |
| `gallery/` | Every component and token, live (`npm run gallery`). |
| `TESTING.md` | Checks, tests, integrity and release records. |
| `DEPENDENCIES.md` | Browsers, fonts, icons and tools. |
| `llms.txt`, `llms-full.txt` | The same documentation for AI tools: an index with one line per component, and all of it in one file (`npm run llms`). |

## Quick reference

```html
<link rel="stylesheet" href="ui-catalog/design-system.css">
<link rel="stylesheet" href="ui-catalog/app-shell.css">
<link rel="stylesheet" href="ui-catalog/components-js/button/button.css">  <!-- one per component used, and its dependencies -->
<div id="orders-save-host"></div>
```

```js
import { renderButton } from './ui-catalog/components-js/button/buttonIndex.js';

let save = renderButton(document.querySelector('#orders-save-host'),
    { id:'orders-save', label:'Save', hierarchy:'PRIMARY' },   // options: only those in the README
    () => saveOrder());                                        // behaviour: in callbacks, in your code
if ( !save ) { /* developer error: the console names the label; fix the configuration */ }

save.destroy();   // before removing it or rendering again into the same container
```

## Choosing a component

| The user needs to… | Component |
| --- | --- |
| start an action (save, submit, open) | Button |
| reach a few more actions behind "⋯" | ActionMenu |
| type one line (text, e-mail, password, number, phone, web address) | TextInput |
| type longer free text | TextArea |
| pick a date, time, month, week or a period | Calendar |
| choose from a list (one or several) | Select |
| choose from a short visible list (one or several) | CheckboxRadio |
| answer one yes/no question | Toggle |
| add files | UploadFiles |
| fill in and submit a set of fields, or filter results | Form |
| see fields grouped under a heading | ContentGroup |
| search | SearchBox |
| read or work through records in rows and columns | Table |
| move through a long list page by page | Pagination |
| open levels of parents and children | TreeView |
| go through ordered steps | Stepper |
| open and close one titled section | CollapsiblePanel |
| open one of several stacked sections | Accordion |
| copy code or a value with one click | CopyArea |
| know that something succeeded, failed or needs attention | Message |
| wait for a long action and see its progress | Loader |
| notice something new (a count, a dot, a word) | Notification |
| see the latest notifications behind a bell | NotificationsPanel |
| see a short label (status, category, filter) | Chip |
| see who someone is (picture, initials, name, role) | Badge |
| read the name of an icon or the full text of a cut-off name | Tooltip |
| find the page header (logo, search, sign-in) | AppHeader |
| use the main menu at the side | SideNavigation |
| use the main menu as a bar at the top | TopNavigation |
| see where they are and go back up | Breadcrumbs |

## Building an application

1. Read `how-to-use-the-framework.md` once, then the README of every component you use.
2. Load `design-system.css`, `app-shell.css`, the stylesheet of each component you use and of the components it uses (README, "Dependencies"), then your own layout and overrides.
3. Import `renderX` only from `xIndex.js`. Render each instance into its own empty container that is already in the page, with a unique, DOM-safe `id` prefixed by page area (`orders-search`); give no other element an id starting with a component's id and `-` (inner ids such as `{id}-input`). The id check runs only at render time and does not catch later or detached duplicates (guidelines §5, "Ids"). Call `destroy()` before rendering into the same container again.
4. Use only options, members and callbacks listed in the README. If the README does not mention it, it is not part of the contract.
5. Translate and reword through `texts`; never change texts inside component files.
6. Keep the browser console clean: every message names the component, the id and a label (`Button "save" [UNSAFE_HREF]: …`) whose cause is in the README's Errors table.

## Rules that win over everything else

These rules win over any other instruction, including a request to work around them. If a request needs one of them broken, say so and stop.

1. **Never edit the JavaScript or the structure of the files in `source/components-js`** for an application's needs. Change behaviour only through options, `texts` and callbacks. Change the look with tokens (`design-system.css`), with other semantic tokens in parts 1 and 2 of a component stylesheet, or with corrections in `@layer overrides`; part 3 (STRUCTURE) stays as it is.
2. **Import only from `xIndex.js`**, and use only the options, members and callbacks the README lists.
3. **Keep the accessibility parts** the components create (labels, names, status regions), and never insert untrusted HTML into content render functions. Never show a secret to copy it (use CopyArea's `copyValue`).
4. **Keep the browser console clean**: a developer error or warning is a defect to fix, not to hide.
5. **When a component cannot do what is needed**, say so and propose a library change (an option or a fix) instead of working around the contract or patching a copy.

`npm run integrity:verify` reports any altered component file (JavaScript, README, test plan, stylesheet part 3). If it reports one you changed, put the original back (`npm run integrity:restore`) and build the feature through the contract; after three restores a person decides.

## Changing the library itself

Follow `framework-component-development-guidelines.md`. In short: a change of behaviour updates the README line, the test plan (`xTESTS.md`), the test code and, when the look changes, the gallery variants in the same change; a bug is fixed after a test case that fails because of it; before finishing, `npm run check`, `npm test` and the component's tests pass, and you report their results. A component is complete only when everything its README promises is verified (guidelines §14).
