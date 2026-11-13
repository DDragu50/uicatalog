// appConfig.js
//
// CONFIGURATION CONTRACT.
// Application settings (addresses of data and content files, contact rules) and every user-visible text the app owns.
// Addresses are relative, so the app also works when it is published in a sub-folder of a website.

// Application settings.
export const APP_CONFIG = Object.freeze(
{
    appName:'UI Catalog',
    // Logo in the header, without the app name next to it: its alt text names the app (link to the home page).
    logo:Object.freeze({ src:'assets/logo.svg', alt:'UI Catalog' }),
    // Release mark next to the logo (AppHeader environment label; INFO tone, restyled in app.css).
    release:Object.freeze({ label:'beta', description:'Beta version', tone:'INFO' }),
    catalogUrl:'data/catalog.json',
    content:Object.freeze(
    {
        home:'content/home.md',
        contact:'content/contact.md',
        guidelines:'content/framework-component-development-guidelines.md'
    }),
    // Licence of the code, linked from the footer: a copy of ui-catalog/LICENSE made by "npm run sync".
    license:Object.freeze({ href:'content/LICENSE.txt' }),
    // The author's LinkedIn page, linked from the footer and the contact page.
    author:Object.freeze({ href:'https://www.linkedin.com/in/dan-dragu-b215951a/' }),
    // Marker line in home.md: the text before it spans the page; after it, the left column (Core concepts) beside the FAQs.
    homeColumnsMarker:'<!-- columns -->',
    // content/contact.md: what follows this line goes in the right-hand column of the contact page (beside the form).
    contactAsideMarker:'<!-- aside -->',
    // Guides shown on the document page #/{key} (content copied from the library's components-js folder by "npm run sync").
    guides:Object.freeze([
        Object.freeze({ key:'framework', content:'content/how-to-use-the-framework.md' }),
        Object.freeze({ key:'guidelines', content:'content/framework-component-development-guidelines.md' }),
        Object.freeze({ key:'design-system', content:'content/how-to-build-a-design-system.md' })
    ]),
    // Home page FAQs (an Accordion): question, short answer and the guide that explains it (a Button opens its .md file
    // on the document page #/{guide}).
    // Home page FAQs: question, answer (Markdown), optional guide (opens its .md file) and optional prompt for an AI tool
    // (shown in a CopyArea). Order and texts: decision 215.
    faqs:Object.freeze([
        Object.freeze({ question:'How to use UI Catalog?', guide:'framework',
            answer:'Give your AI tool the files in this order:\n\n1. `AGENTS.md`: the rules, a quick reference and a table for choosing components.\n2. `source/components-js/how-to-use-the-framework.md`: how to load, render and combine components.\n3. The `README.md` of each component the screen needs.\n\nA tool that reads a single file can read `llms-full.txt` instead. Then describe the screen:',
            prompt:'Read AGENTS.md, then source/components-js/how-to-use-the-framework.md,\nthen the README of each UI Catalog component you need.\nBuild [describe the screen] with these components.\nConfigure them only through their options, texts and callbacks;\nnever change their files.\nBefore you finish, check that the browser console\nshows no UI Catalog errors.' }),
        Object.freeze({ question:'How to adapt the components to my design system?', guide:'design-system',
            answer:'Change the values of the tokens in `design-system.css`: colours, fonts, spacing, sizes and corners. Every component follows.\n\nWhere a component should look different, edit its `.css` file and choose other semantic tokens from those defined in `design-system.css`. Change only parts 1 and 2 of the file (appearance and dimensions); part 3 (structure) stays as it is.' }),
        Object.freeze({ question:'How to create a new component?', guide:'guidelines',
            answer:'Write a few requirements for the new component, then ask your AI assistant to create its files following, in this order:\n\n1. `AGENTS.md`\n2. `source/components-js/framework-component-development-guidelines.md`\n3. The `README.md` and the test plan (`xTESTS.md`) of a similar component, as an example.\n\n`npm run check` and `npm run coverage` then confirm that nothing is missing.',
            prompt:'Read AGENTS.md, then source/components-js/framework-component-development-guidelines.md,\nthen the README and the test plan of [a similar component].\nCreate a new UI Catalog component named [name]\nwith these requirements:\n[requirements]\nWrite every file the guidelines require,\nincluding the README contract and the test plan.\nThen run npm run check and npm run coverage\nand report the results.' }),
        Object.freeze({ question:'Can it be used commercially?',
            answer:'Yes: MIT licence, no conditions. Keep the copyright notice.' }),
        Object.freeze({ question:'How is it different from shadcn/ui?',
            answer:'**shadcn/ui** provides React components that you copy into your project and change, with no guarantee of consistency during AI-assisted development. **UI Catalog** provides plain JavaScript components that keep the same behaviour once configured, with validation, error timing and callbacks built in, and a tested contract for each.' })
    ]),
    // Folder of the browser files inside the project: shown before a content address to give a .md file's full path.
    projectClientFolder:'client/',
    // The single-file Markdown reader offered for download next to every displayed .md file.
    markdownReader:Object.freeze({ href:'assets/markdown-reader.html', fileName:'markdown-reader.html' }),
    contactEndpoint:'api/contact',
    // Same limits as the server (server/serverConfig.js, CONTACT_RULES).
    contact:Object.freeze({ nameMaxLength:100, emailMaxLength:254, emailPattern:'[^\\s@]+@[^\\s@]+\\.[^\\s@]+', subjectMaxLength:150, messageMinLength:10, messageMaxLength:5000 }),
    storageKey:'ui-catalog-showcase.navigation',
    // Remembers whether the Variants column is open or collapsed; one setting for every component page.
    variantsStorageKey:'ui-catalog-showcase.variants',
    customizationStorageKey:'ui-catalog-showcase.customization'
});

// Every user-visible text owned by the application (English).
export const APP_TEXTS = Object.freeze(
{
    documentTitle:'{page} · UI Catalog',
    navigation:Object.freeze({ label:'Main', home:'Home', search:'Search', contact:'Contact' }),
    pages:Object.freeze({ home:'Home', description:'Description', contact:'Contact', search:'Search', variants:'Variants', notFound:'Page not found' }),
    description:Object.freeze(
    {
        howToUse:'How to use the app',
        newComponents:'How to generate new components',
        contents:'Contents',
        groupsLabel:'Component groups',
        componentCount:'{count} components',
        componentCountSingular:'1 component',
        expandAll:'Expand all',
        collapseAll:'Collapse all',
        sectionsLabel:'Guideline sections'
    }),
    markdownSource:Object.freeze(
    {
        reader:'.md Reader',
        readerDescription:'Downloads markdown-reader.html: one HTML file that opens and reads any .md file in your browser, offline.',
        pathLabel:'Source file'
    }),
    home:Object.freeze({ faqsTitle:'FAQs', openGuide:'Opens {file}', prompt:'Prompt for your AI tool' }),
    document:Object.freeze(
    {
        pathLabel:'Source file',
        returnToComponent:'Return to the component',
        returnDescription:'Back to the {name} page',
        returnToHome:'Return to the home page',
        returnHomeDescription:'Back to the Home page',
        downloadMd:'Download .md',
        downloadMdDescription:'Saves {file} as a Markdown file',
        downloadPdf:'Download .pdf',
        downloadPdfDescription:'Opens the print dialog with the file only: choose "Save as PDF"'
    }),
    footer:Object.freeze({ year:'2026', author:'Dan Dragu', authorDescription:'Opens the LinkedIn page of Dan Dragu in a new tab', iconLabel:'Copyright', license:'MIT License', licenseDescription:'Opens the licence text (MIT) in a new tab' }),
    component:Object.freeze(
    {
        keywords:'Keywords',
        dependsOn:'Uses',
        definition: 'Definition',
        usedBy:'Used by',
        // optional dependencies: loaded only when an option asks for them (e.g. Tooltip for tooltipMode TOOLTIP)
        canUse:'Can use',
        canBeUsedBy:'Can be used by',
        through:'through {name}',
        none:'None',
        liveExample:'Live example',
        frameTitle:'Live example of {name}',
        output:'Output: configuration, state, callbacks and developer messages',
        states:'States',
        statesIntro:'Every {row} in every state, with the default settings (the Variants panel does not change them).',
        statesFrameTitle:'States of {name}',
        examples:'Examples',
        examplesIntro:'Typical variants, each with its settings written under it (the Variants panel does not change them).',
        examplesFrameTitle:'Examples of {name}',
        stateNames:Object.freeze({ DEFAULT:'Default', HOVER:'Hover', PRESSED:'Pressed', FOCUS:'Keyboard focus', DISABLED:'Disabled' }),
        readme:'README',
        readmeMore:'For full component description of the component click the button:',
        variantsMore:'For experimenting variants of this component click the button:',
        variantsIntro:'For a cleaner view you can collapse this section',
        variantsIntroCollapsed:'Expand to experiment variants of this component!',
        variantsShow:'Show the variants',
        variantsHide:'Hide the variants',
        customizeLink:'Show variants',
        customizeLabel:'Variants of {name}'
    }),
    customize:Object.freeze(
    {
        title:'Variants',
        settings:'Settings',
        render:'Render',
        renderDescription:'Shows {name} again with these settings',
        pageTitle:'Variants of {name}',
        pageIntro:'Choose a variant, then choose Render to see it.',
        back:'Back to {name}',
        appliesWhen:'Applies when: {condition}.',
        checkboxOption:'Use {value}',
        notSet:'Default ({default})',
        noDefault:'not set',
        noOptions:'This component has no variants to choose.',
        valueHelp:'Write the value as in the README examples (objects { }, lists [ ], text in quotes).'
    }),
    output:Object.freeze(
    {
        rendering:'Rendering…',
        rendered:'Rendered.',
        notRendered:'Not rendered: the component reported a developer error (see the developer messages).',
        config:'Configuration sent',
        members:'Instance members',
        state:'Public state',
        callbacks:'Last callbacks (newest first)',
        messages:'Developer messages',
        warning:'Warning',
        error:'Error',
        none:'None'
    }),
    search:Object.freeze(
    {
        title:'Search',
        resultsTitle:'Search results',
        allTitle:'All components',
        headerLabel:'Search components',
        headerPlaceholder:'Search components',
        tableLabel:'Components found',
        keywordLabel:'Keyword',
        allKeywords:'All',
        found:'{count} components found',
        foundSingular:'1 component found',
        foundNone:'0 components found',
        forText:'for "{text}"',
        withKeyword:'with the keyword "{keyword}"',
        noResults:'No components to show. Type a word or choose a keyword.',
        pageLabel:'Search components (as you type - LIVE variant of the searchComponent)',
        columns:Object.freeze({ name:'Component', groups:'Groups', keywords:'Keywords', summary:'Description' })
    }),
    notFound:Object.freeze({ backHome:'Go to the home page' }),
    markdown:Object.freeze({ newTab:'(opens in a new tab)', code:'Code example', codeLanguage:'Code example ({language})', table:'Table' }),
    contact:Object.freeze(
    {
        name:'Your name',
        email:'Your e-mail address',
        emailHelp:'We use it only to answer your message.',
        subject:'Subject',
        message:'Message',
        submit:'Send message',
        success:'Thank you. Your message was sent.',
        errors:Object.freeze(
        {
            nameRequired:'Enter your name.',
            emailRequired:'Enter your e-mail address.',
            emailInvalid:'Enter an e-mail address in the format name@example.com.',
            messageRequired:'Enter your message.',
            messageTooShort:'Enter at least {minLength} characters.',
            tooLong:'Enter at most {maxLength} characters.'
        })
    }),
    errors:Object.freeze(
    {
        NOT_FOUND:'This page does not exist. It may have been moved, or the address may contain a typo.',
        CONTENT_UNAVAILABLE:'This content could not be loaded. Reload the page to try again.',
        CATALOG_UNAVAILABLE:'The list of components could not be loaded, so the component menus are empty. Reload the page to try again.',
        CONTACT_RATE_LIMITED:'You have sent several messages in a short time. Wait a few minutes and try again.',
        CONTACT_FAILED:'Your message could not be sent. Check your connection and try again.',
        VALUE_INVALID:'Enter the value as in the README, for example [ { key:\'edit\', label:\'Edit\' } ]; functions and variables cannot be used',
        NUMBER_INVALID:'Enter a number.'
    })
});
