# UI Catalog

Plain JavaScript components that AI tools configure, not rewrite: the same behaviour on every screen.

Website: [uicatalog.eu](https://uicatalog.eu)

## What is inside

| Folder | What it is |
| --- | --- |
| `ui-catalog/` | The library: 30 components, their contracts (README files), test plans, tests and tools. Start with `ui-catalog/README.md`. AI tools start with `ui-catalog/AGENTS.md` or `ui-catalog/llms.txt`. |
| `showcase_ui-catalog/` | The website that shows every component with live examples and its documentation. See `showcase_ui-catalog/README.md`. |

## Quick start

The library needs no build. To use it in a project, follow the quick start in `ui-catalog/README.md`.

To run the checks and tests of the library, install Node.js 20.12 or later, then run these commands:

```
cd ui-catalog
npm install
npm test
```

To run the website on your computer, run these commands and open http://localhost:3003:

```
cd showcase_ui-catalog
npm run setup
npm start
```

## Licence

MIT. See `LICENSE`.
