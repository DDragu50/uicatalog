# Starter

A minimal application page built with UI Catalog: a header, a small form (text field, list, button), a confirmation message and a table. Copy it to start a new project.

## Try it inside the library

```text
npm run starter
```

It opens this page in your browser; inside the library, `ui-catalog/` and `assets/` are served from `source/` and `assets/`.

## Start a project from it

1. Copy this `starter` folder to where your project lives and rename it (e.g. `my-app`).
2. Copy the library's `source` folder into it and rename the copy to `ui-catalog`.
3. Copy the library's `assets` folder (the Inter font) into it, next to `ui-catalog`.
4. Serve the folder with any static web server (the components are JavaScript modules, which browsers load only from a server), e.g. `npx serve my-app`, and open it.

```text
my-app/
├── index.html          the page: stylesheets in order, then app.js
├── app.js              your screen: imports components from their entry points
├── css/app.css         your page layout (@layer layout)
├── css/overrides.css   your corrections of component styles (@layer overrides)
├── ui-catalog/         copy of the library's source/ — never edit it
└── assets/fonts/       copy of the library's assets/ (Inter font)
```

## Next steps

- Change the look in `ui-catalog/design-system.css` (tokens) — see `how-to-build-a-design-system.md`.
- Add a component: link its stylesheet (and those of the components it uses — its README, "Dependencies"), import `renderX` from its `xIndex.js`, render it into its own empty container with a unique `id`.
- Working with an AI assistant: point it to `AGENTS.md` in the library first.
