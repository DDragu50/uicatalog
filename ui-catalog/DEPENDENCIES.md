# Dependencies

What UI Catalog needs, in one list. The components themselves import nothing outside the library.

## For applications (what the pages need)

| Dependency | Version | Needed for | Where it comes from | Licence |
| --- | --- | --- | --- | --- |
| A current browser | Chrome or Edge 111+, Firefox 121+, Safari 16.4+ | Everything: ES modules, cascade layers, container queries, `:has()`, `color-mix()` | — | — |
| Inter font | 4.1 (variable, regular and italic) | The text font of the design system | Included: `assets/fonts/Inter-4.1/web/`. `design-system.css` expects it at `../assets/fonts/Inter-4.1/web/` relative to itself. Without it, the system font is used. | SIL Open Font License 1.1 (`assets/fonts/Inter-4.1/web/LICENSE.txt`) |
| Font Awesome Free | 7.0.1 | Every icon (`fa-solid fa-…` classes written by the components) | Not included: link it from a CDN (as the starter does) or copy it into your project for production | Icons CC BY 4.0, fonts SIL OFL 1.1, code MIT |

The automated tests run in Chromium; Firefox and Safari are supported by the features used but not tested automatically yet.

## For maintaining the library (checks, tests, gallery, releases)

| Dependency | Version | Needed for | Installed with |
| --- | --- | --- | --- |
| Node.js | 18 or later | Every `npm run …` command | nodejs.org |
| Playwright | 1.56.0 | `npm test`, `npm run test:components`, `npm run gallery:check`, `status`, `release` | `npm install` in the library folder |
| Chromium for Playwright | matching Playwright | The browser the tests drive | `npx playwright install chromium` |

`npm run check`, `npm run coverage`, `npm run gallery`, `npm run starter` and the integrity commands need only Node.js.
