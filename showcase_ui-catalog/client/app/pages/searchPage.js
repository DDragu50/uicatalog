// searchPage.js
//
// SEARCH PAGE.
// Two sections, one under the other:
//   1. Search results: a SearchBox (search while typing; its label says so) holding the text of the header search, the
//      keyword chips (CheckboxRadio, chip look) and the matching components in a Table (name, keywords, groups,
//      summary: every word must match). Without a text and a keyword the Table is empty ("0 components found").
//      The page search and the header search show the same text.
//   2. All components: one compact CollapsiblePanel per group (closed; the group's description and count under the
//      title), listing each component's name (a link) and definition in the same size and colour, with its keyword
//      Chips below, as on the component page. This section never changes with the search.
// Addresses: #/search, #/search?text=menu, #/search?keyword=inputs (both may be combined).

import { buildChips } from '../../components/chip/chipIndex.js';
import { renderCheckboxRadio } from '../../components/checkboxRadio/checkboxRadioIndex.js';
import { renderCollapsiblePanel } from '../../components/collapsiblePanel/collapsiblePanelIndex.js';
import { renderSearchBox } from '../../components/searchBox/searchBoxIndex.js';
import { renderTable } from '../../components/table/tableIndex.js';
import { APP_TEXTS } from '../appConfig.js';
import { componentHref } from '../appShell.js';

const ALL = '__all__';

// Escapes text inserted into generated HTML.
function escapeHTML( value ) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

// Returns the catalog rows matching a text (every word must appear somewhere) and a keyword; none without either.
function findComponents( catalog, text, keyword )
{
    if ( !String(text ?? '').trim() && !keyword ) { return []; }
    const labels = Object.fromEntries(catalog.groups.map(group => [ group.id, group.label ]));
    const words = String(text ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    return catalog.components
        .filter(component => !keyword || component.keywords.includes(keyword))
        .filter(component =>
        {
            const haystack = [ component.name, component.summary, ...component.keywords, ...component.groups.map(id => labels[id] ?? id) ].join(' ').toLowerCase();
            return words.every(word => haystack.includes(word));
        })
        .map(component => ( { id:component.id, name:component.name, groups:component.groups.map(id => labels[id] ?? id).join(', '), keywords:component.keywords.join(', '), summary:component.summary } ));
}

// Builds the result summary sentence.
function describeResults( count, text, keyword )
{
    const texts = APP_TEXTS.search;
    const found = count === 0 ? texts.foundNone : count === 1 ? texts.foundSingular : texts.found.replace('{count}',count);
    const filters = [ text ? texts.forText.replace('{text}',text) : '', keyword ? texts.withKeyword.replace('{keyword}',keyword) : '' ].filter(Boolean).join(' ');
    return filters ? `${found} ${filters}.` : `${found}.`;
}

// Returns the description shown under a group title: the group's description and its component count.
function describeGroup( group )
{
    const texts = APP_TEXTS.description;
    const count = group.components.length === 1 ? texts.componentCountSingular : texts.componentCount.replace('{count}',group.components.length);
    return group.description ? `${group.description} ${count}.` : `${count}.`;
}

// Builds the list of a group's components: name (link), definition, keyword Chips (bordered, as on the component page).
function buildComponentListHTML( group, catalog )
{
    const items = group.components.map(id => catalog.components.find(component => component.id === id)).filter(Boolean)
        .map(component => `<li class="app-component-list-item"><span class="app-component-list-text"><a class="app-component-list-link" href="${componentHref(component.id)}">${escapeHTML(component.name)}</a>`
            + `<span class="app-component-list-summary">${escapeHTML(component.summary)}</span></span>`
            + `<span class="app-component-keywords" role="group" aria-label="${escapeHTML(APP_TEXTS.component.keywords)}">${buildChips(component.keywords.map(keyword => ( { label:keyword, bordered:true, colorToken:'--c-muted' } )))}</span></li>`);
    return `<ul class="app-component-list">${items.join('')}</ul>`;
}

// Renders the search page into root; returns the page instance.
export async function renderSearchPage( root, { catalog, query, replaceAddress, shell } )
{
    const texts = APP_TEXTS.search;
    let text = ( query.get('text') ?? '' ).trim();
    let keyword = catalog.keywords.includes(query.get('keyword')) ? query.get('keyword') : '';
    root.innerHTML = `<div class="app-search"><h1>${escapeHTML(texts.title)}</h1>`
        + `<section class="app-search-section" aria-labelledby="search-results-title"><h2 id="search-results-title">${escapeHTML(texts.resultsTitle)}</h2>`
        + '<div class="app-search-box"></div><div class="app-search-keywords"></div><p class="app-search-summary" aria-live="polite"></p><div class="app-search-results"></div></section>'
        + `<section class="app-search-section" aria-labelledby="search-all-title"><h2 id="search-all-title">${escapeHTML(texts.allTitle)}</h2>`
        + `<ul class="app-panel-list" aria-label="${escapeHTML(APP_TEXTS.description.groupsLabel)}">${catalog.groups.map(group => `<li class="app-panel-list-item" id="search-group-${escapeHTML(group.id)}"></li>`).join('')}</ul></section></div>`;
    const summary = root.querySelector('.app-search-summary');
    const children = [];

    const table = renderTable(root.querySelector('.app-search-results'),
    {
        id:'search-results', label:texts.tableLabel, displayMode:'SCROLL', stickyHeader:false, rows:findComponents(catalog,text,keyword),
        texts:{ noData:texts.noResults },
        columns:
        [
            { field:'name', label:texts.columns.name, priority:'ALWAYS', width:'M', render:( host, row ) => { host.innerHTML = `<a href="${componentHref(row.id)}">${escapeHTML(row.name)}</a>`; return null; } },
            { field:'groups', label:texts.columns.groups, width:'M', priority:2 },
            { field:'keywords', label:texts.columns.keywords, width:'XL', priority:3, sortable:false },
            { field:'summary', label:texts.columns.summary, width:'XL', priority:1, sortable:false }
        ]
    });
    children.push(table);

    // Shows the results for the current text and keyword and updates the summary and the address (without reloading the page).
    function showResults()
    {
        const rows = findComponents(catalog,text,keyword);
        table?.setRows(rows);
        summary.textContent = describeResults(rows.length,text,keyword);
        const parameters = new URLSearchParams();
        if ( text ) { parameters.set('text',text); }
        if ( keyword ) { parameters.set('keyword',keyword); }
        replaceAddress(`#/search${parameters.size ? `?${parameters}` : ''}`);
    }

    // Section 1: the page search (the header search shows the same text).
    const headerSearch = shell?.header?.getSearchBox?.() ?? null;
    headerSearch?.setValue({ query:text });
    const searchBox = renderSearchBox(root.querySelector('.app-search-box'),
    {
        id:'search-page-box', label:texts.pageLabel, placeholder:texts.headerPlaceholder, searchMode:'LIVE', width:'LARGE',
        onSearch:( { query:value } ) => { text = value; headerSearch?.setValue({ query:text }); showResults(); }
    });
    searchBox?.setValue({ query:text });
    children.push(searchBox);
    children.push(renderCheckboxRadio(root.querySelector('.app-search-keywords'),
    {
        id:'search-keywords', name:'keyword', groupLabel:texts.keywordLabel, selectionMode:'SINGLE', presentation:'CHIP', direction:'HORIZONTAL', mandatory:false, labelPosition:'TOP',
        options:[ { value:ALL, label:texts.allKeywords, selected:!keyword }, ...catalog.keywords.map(entry => ( { value:entry, label:entry, selected:entry === keyword } )) ]
    },values => { keyword = values[0] && values[0] !== ALL ? values[0] : ''; showResults(); }));
    summary.textContent = describeResults(findComponents(catalog,text,keyword).length,text,keyword);

    // Section 2: every group, closed.
    catalog.groups.forEach(group => children.push(renderCollapsiblePanel(root.querySelector(`#search-group-${CSS.escape(group.id)}`),
        { id:`search-group-panel-${group.id}`, title:group.label, description:describeGroup(group), variant:'COMPACT', state:'COLLAPSED' },[ buildComponentListHTML(group,catalog) ])));

    return {
        // Removes the search box, chips, table and panels and clears the page.
        destroy:() => { children.forEach(child => child?.destroy?.()); root.replaceChildren(); }
    };
}
