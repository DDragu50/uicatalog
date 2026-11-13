# UI Catalog showcase

A web app that explains how each component of the ui-catalog library works and how to use it. The app is built with the library's own components.

## Folders

```text
APP FOLDER/
├─ ui-catalog/                 the original library — never modified by this project
│  └─ source/
└─ showcase_ui-catalog/        this project
   ├─ package.json             commands (npm run …); no packages to install
   ├─ .env                     local settings (PORT, NODE_ENV, UI_CATALOG_SOURCE); not published
   ├─ client/                  everything the browser receives
   │  ├─ index.html            the app
   │  ├─ app/                  the app's own code: shell, router, pages, Markdown reader, app.css
   │  ├─ components/           copies of the components' JavaScript and READMEs   (made by npm run sync)
   │  ├─ local-styling/        CSS and design tokens of the components used by the app
   │  ├─ showcase-styling/     CSS and design tokens of the demonstrated components (yours to customize)
   │  ├─ content/              texts you can edit: home.md, contact.md (+ the guidelines, copied by sync)
   │  ├─ data/catalog.json     groups, keywords and dependencies   (made by npm run catalog)
   │  ├─ preview.html          the live example (showcase styling only), shown in a frame on component pages
   │  ├─ adjustments/          one small file per component: what the README cannot say (start values, …)
   │  ├─ assets/logo.svg       the logo in the header
   │  ├─ assets/uicatalog.zip  the public copy of the project, for "Download .zip archive"   (made by npm run public)
   │  ├─ api/                  contact.php + .htaccess: the contact endpoint on Apache/PHP hosting (sends the message by e-mail)
   │  └─ vendor/               Font Awesome
   └─ server/                  runs only on your computer (and later on the publishing server)
      ├─ server.js             local web server + contact endpoint
      ├─ sync-components.js    copies components from ../ui-catalog/source
      ├─ build-catalog.js      computes groups and keywords
      ├─ check-adjustments.js  lists what the adjustment files still need to settle
      ├─ build-public.js       makes the public copy: ../uicatalog/ and client/assets/uicatalog.zip
      ├─ catalog-rules.json    YOUR rules for groups and keywords
      └─ messages/             contact messages received while testing (not published)
```

## First start

You need Node.js 20.12 or newer (`node -v` shows the version).

1. Open a terminal in the `showcase_ui-catalog` folder.
2. Run `npm run setup`. It copies the components from `../ui-catalog/source` and builds the catalog; it prints the list of components with their groups and keywords.
3. Run `npm start`.
4. Open http://localhost:3003 in the browser (the port is `PORT` in `.env`). Stop the server with Ctrl+C.

## Everyday tasks

| Task | What to do |
| --- | --- |
| The original library changed | `npm run setup`, then reload the browser. JavaScript and READMEs are replaced; your CSS is never overwritten (the tool lists the stylesheets that differ from the original). `showcase-styling/` is not touched; stylesheets missing there (e.g. a new component) are listed — copy them with `npm run sync:showcase` after deciding to. |
| Get a fresh copy of one stylesheet | `local-styling/`: delete it, then `npm run sync`. `showcase-styling/` is not synced by default (it keeps the look of the live examples): delete the file and run `npm run sync:showcase` only when you want that component's live example to take the library look. The copy comes from `ui-catalog/source`, which has the app look (the values marked `[APP]`). |
| Change groups or keywords | Edit `server/catalog-rules.json`, then `npm run catalog`. |
| Add a group (e.g. Dashboard) | Add an entry to `groups` in `server/catalog-rules.json` with `"rule": { "components": [ "table", "badge" ] }`, then `npm run catalog`. It appears in the menu and on the home page. |
| Change the home page or contact text | Edit `client/content/home.md` or `client/content/contact.md`. The line `<!-- component-groups -->` in home.md marks where the component groups appear. |
| Make the public copy (repositories and the download zip) | `npm run public`. It copies the project into the folder `uicatalog/` next to `ui-catalog/` and `showcase_ui-catalog/` (the content of the public GitHub and Codeberg repositories; a `.git` folder there is kept) and packs the same files into `client/assets/uicatalog.zip`. Left out: `node_modules/`, `.env`, `server/messages/`, `DECISIONS.md`, `REPOSITORY-ASSESSMENTS.md`, `UI-CATALOG-TYPOGRAPHY-RULE.md`, the library's `UI-CATALOG-SYSTEM-CSS-NOTICE.md`, `ui-catalog/reports/status-*.md`, system and editor files, logs. Run it again after every change you want to publish, then upload `client/` as before. |
| Read contact messages (local) | Open the files in `server/messages/`. |
| Contact form on the public site (Apache with PHP, e.g. cPanel) | `client/api/contact.php` answers `api/contact` (rule in `client/api/.htaccess`) and e-mails each message to `CONTACT_TO` (admin@uicatalog.eu), sent from `CONTACT_FROM` (no-reply@uicatalog.eu); both are set at the top of the file. `admin@uicatalog.eu` must exist in cPanel (Email Accounts or Forwarders). Same checks and limit as the Node server: at most 5 messages per visitor in 15 minutes. Rate-limit records, and any message the mail server refused, go to a folder `uicatalog-contact` next to the site folder (outside the public folder). |
| Add or change an adjustment file | Edit `client/adjustments/<component>.js` (see "Variants panel" below). After adding a new file, run `npm run catalog` so the app loads it; `npm run check` shows what is still unresolved. |
| Change fonts or text sizes of the app | Values: `--font-sans`, `--fs-page-title` (h1), `--fs-section-title` (h2), `--fs-block-title` (h3), `--fs-body` (paragraphs), `--fw-*`, `--lh-*` in `client/local-styling/design-system.css`. Which element uses which value: the TYPOGRAPHY section at the top of `client/app/app.css`. |
| Change the menu text size or row height | In `client/app/app.css`, rule `.app-side`: `--fs-control:var(--fs-label)` is the text size (14px; `var(--fs-body)` = 16px). Add `--control-height:var(--space-xl-1);` for 32px rows (default 40px). |
| Change the working-area margins | `--workspace-margin` (5%) and `--workspace-max-width` (1600px) in `client/local-styling/design-system.css`. |
| Change the logo | Replace `client/assets/logo.svg` (keep the name, or change `logo` in `client/app/appConfig.js`). |
| Restyle one component (app or showcase) | Open its stylesheet in `client/local-styling/` (app) or `client/showcase-styling/` (live examples) and change a value in part 1 APPEARANCE (colours, type, corners) or part 2 DIMENSIONS (sizes, spacing). Leave part 3 STRUCTURE as it is. Mark app changes `[APP]`. |
| Restyle the demonstrated components | Edit `client/showcase-styling/` (design tokens in `design-system.css`, one stylesheet per component). The app itself keeps `client/local-styling/`. No JavaScript changes are needed. |
| Change one Button type in the live examples | `client/showcase-styling/button.css`, part 1: the PRIMARY, SECONDARY or TERTIARY block (border, corners of text buttons and icon-buttons, background, text, hover / pressed, disabled). The States table shows the result. |

## Variants panel (customization panel)

The Variants panel chooses which variant of a component the live example shows; the look itself is set only in `client/showcase-styling/` (the app's own look is `client/local-styling/`; the two sets are never copied into each other). On a phone the panel is a page of its own (`#/component/<id>/variants`). In the code it is still called the customization panel (`customizePage.js`, `customization/`, `app-customize-*`).

The panel on each component page is generated from the README "Configuration" table: enumerated values become a list, yes/no options a switch, numbers and text a field, objects and lists a text box where values are written exactly as in the README examples (`[ { key:'edit', label:'Edit' } ]`; single or double quotes, keys without quotes, comments allowed; functions and variables are not, and a template text such as `/orders/${order.id}` is kept as plain text). Options that do not apply to the current choices (README column "Applies when") stay visible but inactive. Only values that differ from the README default are sent to the live example, so "Configuration sent" shows exactly what makes the example different. Callback options and the callback arguments of the render function (e.g. `onValueChange` in `renderTextInput(container, config, onValueChange, onValidation)`) are reported in the output box.

What the README cannot say goes into `client/adjustments/<component>.js` (all keys optional):

| Key | Meaning | Example |
| --- | --- | --- |
| `start` | Start values (taken from the component's test page) | `start:{ label:'Continue' }` |
| `hide` | Options not shown in the panel (a start value is still sent) | `hide:[ 'buttonType' ]` |
| `tokens` | Which option an "Applies when" value refers to, when several options have it | `tokens:{ BUTTON:'buttonVariant' }` |
| `appliesWhen` | Replaces the README condition of an option | `appliesWhen:{ minWidth:values => values.width === 'MIN_WIDTH' }` |
| `callbacks` | Callback options the live example must not receive | `callbacks:{ summaryRenderer:false }` |
| `uses` | Other components the example renders (their showcase styling is loaded) | `uses:[ 'textInput' ]` |
| `prepare` | Builds the render arguments inside the live example (children, sample data); may return `{ host, args }` to render elsewhere (e.g. the toast area) | `prepare:( { config } ) => [ config, children ]` |
| `stage` | Room and width of the live example: `width` (px; the example is laid out at this width and scaled down to fit, for components that switch layout at 48rem) and `minHeight` (a design token, room for menus and popups) | `stage:{ width:1024, minHeight:'--size-md-4' }` |
| `renderFunction` | The render function to call when it is not `render<Name>` | `renderFunction:'renderChips'` |
| `checkboxes` | Text options shown as one checkbox; checked sends the given value, unchecked sends nothing | `checkboxes:{ iconBefore:'fa-solid fa-arrow-right-to-bracket' }` |
| `states` | Adds a "States" section below the live example: one column per allowed value of the `rows` option, one row per state (default, hover, pressed, keyboard focus, disabled), all with the fixed `config`; `disabledPath` names the option that disables (default `disabled`). Hover, pressed and focus are shown by copying the stylesheets' own `:hover` / `:active` / `:focus` rules, so the look always follows the loaded showcase styling | `states:{ rows:'hierarchy', config:{ label:'Continue' } }` |

