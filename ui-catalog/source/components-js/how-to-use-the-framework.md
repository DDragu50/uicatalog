# How to Use This Framework

This guide is for developers (and AI assistants) who build an application with UI Catalog components. To begin quickly, copy the library's `starter/` folder (a minimal working page); AI tools read `AGENTS.md` at the library root first. `npm run gallery` shows every component and token as they are. It explains how to load the files, render a component, react to the user, combine components and change the look. Each component's README is the contract for that component; this guide explains what all of them have in common.

## 1. What you get

- **Plain JavaScript and CSS.** ES modules, no framework, no build step. Any page that can load a `<script type="module">` can use the components.
- **One entry point per component.** Code outside a component folder imports only from `xIndex.js` (e.g. `buttonIndex.js`). Everything else in the folder is internal and may change.
- **One contract per component.** `xREADME.md` lists the configuration options, the instance members, the callbacks, the developer errors and the accessibility behaviour. If the README does not mention something, it is not part of the contract.
- **Predictable behaviour.** Every component follows the same rules for configuration, errors, callbacks and destroying, so after one component you know how the others work.

### What every component does

You can rely on this in every component; the READMEs do not repeat it (the full list is in the component development guidelines, §11.1):

- Mouse, touch and keyboard use, with a visible focus indicator; names, roles and states for screen readers.
- Every visible text comes from `texts` (English by default), so you can translate it; right-to-left languages are mirrored.
- The look comes from the design-system tokens (also the dark theme); motion stops when the user prefers reduced motion; the component adapts to the width of its container.
- Configuration mistakes are reported in the developer console; callbacks report only user actions.
- Input components also share the form behaviour: label, help text, "(Optional)" or "*", errors that appear when the user leaves a changed field or when the form is checked, and the editable / read-only / unavailable / hidden states.

Each README starts with **For business** (what the component is, when to use it, its key features) and gives the complete behaviour, step by step, under **For developers → Business analysis**. Right after it, **Contracts** says in one line which shared contracts the component follows (styling, form field, actions, shared behaviour). **For designers** shows the generated markup, the visual options, the states and the **Styling contract**: the tokens of each stylesheet part and what they style.

## 2. Files to load on a page

Stylesheets, in this order:

```html
<link rel="stylesheet" href="ui-catalog/design-system.css">      <!-- 1. tokens: every colour, size, font -->
<link rel="stylesheet" href="ui-catalog/app-shell.css">          <!-- 2. reset and bare HTML elements -->
<link rel="stylesheet" href="ui-catalog/components-js/button/button.css">         <!-- 3. one file per component used -->
<link rel="stylesheet" href="ui-catalog/components-js/textInput/textInput.css">
<link rel="stylesheet" href="vendor/fontawesome/css/all.min.css">                   <!-- icons -->
<link rel="stylesheet" href="css/app.css">                                         <!-- your page layout (layer "layout") -->
```

- Load the stylesheet of every component you use, **and of the components it uses**. A component's README lists them under "Dependencies" (e.g. TextInput needs `button.css` when it shows an action button).
- `design-system.css` declares the cascade layers once: `tokens, reset, base, layout, components, overrides`. Put your page layout in `@layer layout` and your corrections of component styles in `@layer overrides`. Never redeclare the list.
- Icons are Font Awesome classes (`fa-solid fa-pen`). Load Font Awesome yourself; the components only write the classes.

Scripts: import what you need from the entry points.

```js
import { renderButton } from './ui-catalog/components-js/button/buttonIndex.js';
import { renderTextInput } from './ui-catalog/components-js/textInput/textInputIndex.js';
```

## 3. Rendering a component

Every interactive component has one function, `renderX(container, config, ...callbacks)`:

```js
const save = renderButton(document.querySelector('#save-host'),
    { id:'save', label:'Save', hierarchy:'PRIMARY', iconBefore:'fa-solid fa-floppy-disk' },
    () => saveOrder());
```

- **`container`** is a dedicated, empty element that you own. The component replaces its content; give every instance its own container.
- **`config`** is a plain object. `id` is required and must be unique in the document. Every other option has a default (see the README's Configuration table). The configuration is read once: to change an option that has no setter, `destroy()` and render again.
- **Ids:** the component checks its id only once, when it renders, against the elements already in the page. So render into a container that is already in the page; give no other element an id that starts with a component's id followed by `-` (components create inner ids such as `{id}-input` and `{id}-error`); and prefix ids by page area (`orders-search`, `orders-table`). The check does not catch an element with the same id added later, a duplicate among containers not yet in the page, or a clash with an inner id. After `destroy()` the id may be used again.
- **The return value** is the instance (its members are in the README's Public API table), or `null` when the configuration has a developer error; nothing is rendered then.
- **Static components** (e.g. Chip) also offer `buildX(config)`, which returns HTML text without events: `host.innerHTML = buildChips([ { label:'Draft' } ])`.

Enumerated values are UPPER_CASE (`'PRIMARY'`, `'ON_DEMAND'`) and accepted in any case. Allowed values are exported as arrays (`BUTTON_HIERARCHIES`, …) for building settings screens.

## 4. Reacting to the user: callbacks

- Callbacks are either **arguments** of `renderX` (`renderButton(host, config, onClick)`) or **configuration properties** (`onSearch`, `onSubmit`). When both exist for the same event, the configuration callback wins and only one runs.
- Callbacks report **user actions**. Programmatic calls (`setValue()`, `clear()`, `markRead()`) do not fire callbacks, so your code never reacts to its own changes. Each README's Callbacks table says when a callback fires and when it does not.
- Callbacks receive copies of values, never the component's internal objects. Read the current state through instance members (`getValue()`, `getError()`), never from the DOM.

```js
const field = renderTextInput(host,{ id:'email', name:'email', label:'E-mail', type:'EMAIL' },
    value => draft.email = value,                 // onValueChange: every user change
    result => submitButton.setDisabled(false));   // onValidation: { valid, errorLabel }
```

## 5. Errors: for users and for developers

- **User errors** (a required field left empty, a date out of range) are shown by the component itself, with texts you can translate through `texts` (e.g. `texts:{ errors:{ REQUIRED:'Enter your e-mail address.' } }`).
- **Developer errors** (a missing `id`, an invalid option value) are written to the browser console in one format: `TextInput "email" [INVALID_OPTION]: …`. An **error** stops rendering (`renderX` returns `null`); a **warning** keeps rendering with the default value. The README's Errors table lists every label and its cause. Keep the console clean before you ship.

## 6. Forms and validation

Input components (TextInput, TextArea, Select, CheckboxRadio, Toggle, Calendar, SearchBox) share one **form-field contract**: `name`, `getValue()`, `setValue()`, `validate()`, `getError()`, `focus()`, `getLabel()`. Form uses only these, so any input works inside a Form, at any depth:

```js
renderForm(host,{ id:'signup', columns:2, onSubmit:values => api.register(values) },
[
    h => renderTextInput(h,{ id:'first-name', name:'firstName', label:'First name' }),
    h => renderTextInput(h,{ id:'email', name:'email', label:'E-mail', type:'EMAIL' })
]);
```

- Form validates every field on submit, shows an error summary with links to the fields, prevents double submits and can warn about unsaved changes.
- Generic rules (required, length, number range, pattern) are options of the fields. **Business rules** (uniqueness, cross-field checks, server answers) stay in your code: return them from `onValidate`, or show server errors with `form.showErrors([...])`.
- Fields are mandatory by default; set `mandatory:false` for optional ones.

## 7. Combining components

- **Containers** (ContentGroup, CollapsiblePanel, Form) take an ordered list of children: HTML text, or render functions `host => renderX(host, config)`. The container creates one host per child and destroys the children when it is destroyed.
- **Composed components** create their own children (AppHeader creates SearchBox, NotificationsPanel, TopNavigation, Breadcrumbs). You pass the child's configuration through unchanged, e.g. `search:{ label:'Search orders', searchMode:'ON_DEMAND' }`, and reach the child through a getter such as `header.getSearchBox()`.
- A parent may place its children (gap, alignment); it never restyles them.

### Buttons inside components

Components never take Button configurations from you. There are two kinds of buttons:

- **Built-in buttons** belong to the component (Form's Submit and Reset, a Message's ×, Calendar's Today, Stepper's Back and Next, Loader's Cancel): switch them on with a named option (`showReset:true`), rename them through `texts`, react through a named callback (`onCancel`).
- **Your buttons** (Edit, Export, Open, Print…) are given the same way in every component that accepts them — Message, Table (selection), CollapsiblePanel (header), TreeView (toolbar), Stepper (button bar), TextInput (inside the field):

```js
const panel = renderCollapsiblePanel(host,
{
    id:'address', title:'Delivery address',
    actions:[ { key:'edit', label:'Edit', icon:'fa-solid fa-pen' }, { key:'remove', label:'Remove', icon:'fa-solid fa-trash-can', iconOnly:true } ],
    onAction:( key, panel ) => ( key === 'edit' ? editAddress() : removeAddress() )
});
panel.setActionDisabled('remove',true);   // e.g. while saving
```

- **Tooltips:** icon-only buttons and hints (cut-off text, hidden labels) show their text on hover as each component's `tooltipMode` says: `NONE`, `TITLE` (the browser's tooltip, mouse only) or `TOOLTIP` (the Tooltip component: also on keyboard focus, styled, it can be hovered and closed with Escape). The default keeps the current behaviour, so nothing changes until you choose. With `TOOLTIP` load `tooltip.css`; the Tooltip code is loaded by the component itself. For your own elements use `renderTooltip(container, { target, text })` with its container next to the element.

Each action is `{ key, label, icon?, iconOnly?, hierarchy?, disabled? }`: `key` is what your callback receives, `label` is the text (or, with `iconOnly`, the name screen readers announce). The callback is `onAction(key, …, instance)` (Table: `selectionActions` and `onSelectionAction(key, selection)`); without it the buttons stay disabled. `setActionDisabled(key, disabled)` changes availability later; TreeView adds `canAct(key, item)` for availability that depends on the current item. The README of each component states its default hierarchy and what its callback receives.

## 8. Changing texts and languages

Every visible text has an English default and can be replaced through the `texts` option: `texts:{ clear:'Löschen', search:'Suchen' }`. Number and date formats follow the `locale` option where a component offers it (Table, Calendar, Pagination, TextArea); empty means the page language. Do not edit component files to translate.

## 9. Changing the look

- **Globally:** change tokens in `design-system.css` (colours, fonts, spacing, sizes, corners). Every component follows. See "How to build a new design system".
- **One component everywhere:** each component stylesheet has three parts. Change values in part 1 (APPEARANCE) or part 2 (DIMENSIONS); never part 3 (STRUCTURE). Better: write the same selector with the new value in your own stylesheet, in `@layer overrides`, so you can update the library files later without losing your changes.
- **One instance:** use the component's own options first (`hierarchy`, `size`, `bordered`, `cornerRadius`, `colorToken`…).

## 10. Lifecycle

- Call `instance.destroy()` before removing a component or rendering again into the same container. It removes listeners, timers and child components and clears the container.
- Components that add something to the page outside their container (Message toasts, AppHeader's `--page-sticky-offset`) remove it on `destroy()`.

### In React, Vue or Svelte

The same files work in any framework; no wrapper is needed. Three rules: render after the framework has put the container in the page, keep the instance, and `destroy()` it when the framework removes the component.

```jsx
// React
function SaveButton({ onSave })
{
    const host = useRef(null);
    useEffect(() => { const save = renderButton(host.current,{ id:'orders-save', label:'Save' },onSave); return () => save?.destroy(); },[]);
    return <div ref={host} />;
}
```

```vue
<!-- Vue -->
<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
const host = ref(null); let save = null;
onMounted(() => { save = renderButton(host.value,{ id:'orders-save', label:'Save' },() => emit('save')); });
onBeforeUnmount(() => save?.destroy());
</script>
<template><div ref="host"></div></template>
```

```svelte
<!-- Svelte -->
<script>
import { onMount } from 'svelte';
let host;
onMount(() => { const save = renderButton(host,{ id:'orders-save', label:'Save' },saveOrder); return () => save?.destroy(); });
</script>
<div bind:this={host}></div>
```

Let the framework own the container, not its content: do not render framework elements inside a component's container. A change of an option that has no setter means `destroy()` and render again.

## 11. Working with an AI assistant

Every README has a section "For AI-assisted development" with instructions, safety rules and example prompts. Give the assistant, in this order: `AGENTS.md` (rules, quick reference, the table for choosing components), this guide, and the README of each component involved. Tools that read a single file can use `llms-full.txt`. A prompt that works:

```text
Read AGENTS.md, then source/components-js/how-to-use-the-framework.md, then the README of each UI Catalog component you need. Build [describe the screen] with these components. Configure them only through their options, texts and callbacks; never change their files. Before you finish, check that the browser console shows no UI Catalog errors.
```

To create a new component, give it `AGENTS.md`, then the component development guidelines, then the README and test plan of a similar component as an example.

## 12. Checklist for a new page

1. Load `design-system.css`, `app-shell.css`, the stylesheets of the components used and of their dependencies, and Font Awesome.
2. Create one empty container per component instance.
3. Import `renderX` from each `xIndex.js`; give every instance a unique `id`.
4. Handle user actions in callbacks; read state through instance members.
5. Keep business rules, data loading and navigation in your code.
6. Check the console: no developer errors or warnings.
7. Call `destroy()` when the page or the component goes away.
