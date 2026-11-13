# UI Catalog

Thirty interface components in plain JavaScript and CSS — no framework, no build step — with a contract (README) for each one, a design system you can adapt to your brand, and automated checks that prove what each README promises. Built to be used by developers and by AI assistants.

See and try every component at **uicatalog.eu**.

## Quick start

1. Download a release (the zip on uicatalog.eu or the tag on the repository) and unpack it.
2. Copy `starter/` as your project, `source/` into it as `ui-catalog/`, and `assets/` next to it (details in `starter/README.md`).
3. Serve the folder with any static web server and open it; then read `source/components-js/how-to-use-the-framework.md`.

Using an AI assistant? Point it to `AGENTS.md` first; tools that read a single file can use `llms-full.txt`.

```js
import { renderButton } from './ui-catalog/components-js/button/buttonIndex.js';

const save = renderButton(document.querySelector('#orders-save-host'),   // an empty container already in the page
    { id:'orders-save', label:'Save', hierarchy:'PRIMARY' },              // options from the component's README
    () => saveOrder());                                                   // your code reacts to the user
// null after a developer error (the console names it); save.destroy() before rendering again
```

## What is inside

| Path | Contents |
| --- | --- |
| `source/` | The design system (`design-system.css`), the page base (`app-shell.css`) and the components (`components-js/`), each with its README and test plan |
| `assets/` | The Inter font |
| `starter/` | A minimal working page to start from |
| `gallery/` | Every component and design token, live (`npm run gallery`) |
| `tests/`, `tools/` | Automated checks and tests (see `TESTING.md`) |
| `AGENTS.md` | Instructions for AI tools: rules, a quick reference and a table for choosing components |
| `llms.txt`, `llms-full.txt` | The documentation for AI tools: an index, and everything in one file |
| `DEPENDENCIES.md` | Browsers, fonts, icons and tools |
| `CHANGELOG.md` | What changed in each release, and what to do when you upgrade |

## Feedback and change requests

Report a bug or ask for an option through the repository's issues, or through the contact page on uicatalog.eu. Please name the component, the id, the console message (e.g. `Button "save" [UNSAFE_HREF]`) and what you expected.

## Licence

MIT — free to use, copy, modify and distribute, also commercially; keep the copyright notice (see `LICENSE`).
