# Calendar

## For business

### Overview

Calendar is the field for dates and times: a date, a time, a date with time, a month, a week, or a period from one date (or date and time) to another. By default it is a custom field where the user types the value part by part (like in Chrome) or picks it in a calendar that looks the same in every browser; the browser's own date fields remain available as an alternative.

### When to use

- Use it for dates, times, months, weeks and periods from one date to another.
- Use TextInput for free text and numbers.
- Use Select for a choice from a short list of named periods, e.g. "This quarter".

### Key features

- Dates, times, date with time, months, weeks, and from–to periods.
- Typing part by part, as in Chrome, or picking the value in a calendar that looks the same in every browser.
- European, US or ISO date formats, with 24-hour or AM/PM time.
- Highlighted and unavailable days (weekends, holidays), earliest and latest values, period lengths and time steps.
- Quick choices for periods, such as "Last 7 days", and "Today" and "Clear" buttons.
- Read-only display as exact or relative text ("3 hours ago"), with the same formatting available anywhere in the application.
- The browser's own date fields as an alternative.

### Dependencies

| Dependency | Needed when | Purpose |
| --- | --- | --- |
| Design system (`design-system.css`) | Always | Colours (including the calendar tokens), spacing and typography. |
| Calendar styles (`calendar.css`) | Always | Fields and calendar. |
| Button component and `button.css` | Always | Calendar, navigation, Today/Now, Clear, Done and quick-range buttons. |
| Font Awesome icon library | Always | Calendar and arrow icons. Loaded by the application page. |
| Tooltip component and `tooltip.css` | `tooltipMode` `TOOLTIP` | Tooltips (the Tooltip module is loaded only then). |

### Not included

The application converts between time zones (Calendar works with local date and time as entered), provides the list of holidays, checks business rules such as bookings or availability, explains the asterisk and shows the form's error summary. Relative limits ("only future dates", "at least 18 years ago") are not part of this version.

## For designers

### Structure

```text
CUSTOM (default), single value
div.ui-calendar-wrapper.ui-calendar-width-{width}.ui-calendar-custom[.ui-calendar-invalid]
├── span.ui-calendar-label (+ span.ui-calendar-optional | span.ui-calendar-mandatory)
├── div.ui-calendar-row
│   └── div.ui-calendar-box  role="group"
│       ├── span.ui-calendar-segments
│       │   └── span.ui-calendar-segment[.ui-calendar-segment-empty] role="spinbutton"  + span.ui-calendar-separator
│       └── span.ui-calendar-button-host → Button (tertiary icon, calendar)
├── div.ui-calendar-popup  popover, role="dialog"
│   └── div.ui-calendar-body
│       ├── div.ui-calendar-header → Buttons: previous, zoom title, next
│       ├── table.ui-calendar-grid (days: th.ui-calendar-week-head "Week", th.ui-calendar-week-number, td.ui-calendar-day)
│       │   or table.ui-calendar-zoom-grid (months, years, decades: td.ui-calendar-zoom)
│       ├── div.ui-calendar-time > select.ui-calendar-time-select: hour + minute (+ AM/PM for US)   (TIME, DATETIME)
│       └── div.ui-calendar-footer → Buttons: Today/Now, Clear, Done
├── div.ui-calendar-help
└── div.ui-calendar-error                                                (hidden when there is no error)

Range: fieldset.ui-calendar-wrapper.ui-calendar-range > legend + div.ui-calendar-row
       (span.ui-calendar-part: span.ui-calendar-sublabel "From"/"To" + div.ui-calendar-box) ×2
       + div.ui-calendar-quick-ranges → Buttons

NATIVE: input.ui-calendar-field (browser picker and icon) + span.ui-calendar-actions → Buttons Today/Clear
VIEW:   p.ui-calendar-label + p.ui-calendar-view-value > time (+ span.ui-calendar-relative in BOTH)
```

The segmented field looks like the other inputs (accent border while a part is focused, error border when invalid, muted background when inactive); the focused part is shown with the selected colours. Day cells: `ui-calendar-selected` (accent background, bold), `ui-calendar-in-range` (soft background between From and To), `ui-calendar-today` (inset outline), `ui-calendar-outside` (other months, muted), `ui-calendar-highlight` (background from the group's token via `--ui-calendar-highlight-bg`) and `aria-disabled="true"` (reduced opacity, struck through). Selection and range styles take precedence over highlights. The dialog position is set by the component (`--ui-calendar-popup-top`, `--ui-calendar-popup-left`).

### Visual options

| Option | Values | CSS class or attribute |
| --- | --- | --- |
| Label position | Top, left | `ui-calendar-label-top`, `ui-calendar-label-start`, or `INHERIT` inside an element with `ui-labels-start` |
| Presentation | Custom, browser | `ui-calendar-custom`, `ui-calendar-native` |
| Range | Off, on | —, `ui-calendar-range` with two `.ui-calendar-box` |
| Width | Small, medium, large, full | `ui-calendar-width-small`, `-medium`, `-large`, `-full` |
| Date format (custom) | EU, US, ISO | order of `.ui-calendar-segment` parts and separators (`.`, `/`, `-`), AM/PM part for US times |
| Week numbers (custom) | Off, on (always for WEEK) | `th.ui-calendar-week-head`, `th.ui-calendar-week-number` |
| Highlighted days (custom) | Default weekend, custom groups | `.ui-calendar-highlight` + inline `--ui-calendar-highlight-bg` |
| Read-only display | Exact, relative, both | `time`, `time` with hidden exact text, `time` + `.ui-calendar-relative` |

### States

| State | Values | CSS class or attribute |
| --- | --- | --- |
| Zoom level (custom) | Days, months, years, decades | `table.ui-calendar-grid` or `table.ui-calendar-zoom-grid` |
| Day (custom) | Selected, in range, today, other month, unavailable | `.ui-calendar-selected`, `.ui-calendar-in-range`, `.ui-calendar-today`, `.ui-calendar-outside`, `[aria-disabled="true"]` |
| Error | Shown | `.ui-calendar-invalid`, `[aria-invalid="true"]`, visible `.ui-calendar-error` |

### Styling contract

`calendar.css` has three parts, marked in the stylesheet. Restyle by writing the same selector with a new value in your own stylesheet, inside `@layer overrides` (preferred: library updates keep your changes), or by changing a value in your copy of the stylesheet. After each token come the parts it styles, named by their class without `ui-calendar-` (as in Structure), with the option or state in brackets (joined by “+” when they apply together). Text uses the typography roles of `design-system.css`; border sides are physical (top, right, bottom, left).

The disabled rules use `:disabled`, so they also apply inside a disabled `fieldset`; the label and `*` of a disabled field use `--c-muted`.

**1. Appearance — change freely** (colours, type, borders, corners, motion: only the look changes)

- Colours
  - `--c-text`: label, view value, field, box, popup, time select
  - `--c-danger-text`: label (invalid), mandatory, error
  - `--c-muted`: optional, help, relative, sublabel, field (disabled), box (disabled), label (disabled), mandatory (disabled), segment (empty), separator, header cell, outside, week head, week number
  - `--c-border`: field, box, popup, time select
  - `--c-surface`: field, box, popup, time select
  - `--c-accent`: field (focus), box (focus), today
  - `--c-danger`: field (invalid), box (invalid)
  - `--c-surface-muted`: field (disabled), box (disabled)
  - `--calendar-selected-bg`: segment (focus), selected (also hover)
  - `--calendar-selected-color`: segment (focus, empty + focus), selected
  - `--calendar-day-hover-bg`: day (hover), zoom (hover)
  - `--calendar-range-bg`: in range
  - `--calendar-range-color`: in range
- Typography
  - `--font-ui`: calendar, popup, day, zoom, time select
  - `--fw-ui`: calendar, popup, day, zoom, time select, optional, week head, week number
  - `--fs-label`: label, help, error, sublabel, day, zoom
  - `--fw-ui-strong`: label, error, header cell, today, selected
  - `--lh-compact`: label
  - `--lh-body`: help, error
  - `--fs-control`: view value, field, box
  - `--fs-caption`: header cell, week head, week number
- Borders and corners
  - `--border-thin`: field, box, popup, today, time select
  - `--radius-control-small`: segment, day, zoom
  - `--radius-control`: popup
- Shadows
  - `--shadow-md`: popup
- States and motion
  - `--transition-1`: field, box
  - `--opacity-disabled`: day (disabled), zoom (disabled)

**2. Dimensions — change with care** (sizes and spacing: the component keeps working, its size changes)

- Spacing
  - `--gap-tight`: calendar, part, box, time, time select
  - `--gap-section`: calendar
  - `--gap-inline-items`: row, actions, quick ranges, footer, popup, body, header
  - `--padding-control`: field, box
  - `--space-sm-2`: box
  - `--space-sm-1`: segment, grid
  - `--gap-toolbar`: week head, week number, calendar (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)
- Sizes
  - `--control-height`: field, box, day, zoom, time select, label (label on the left)
  - `--percentage-s`: calendar (width small, label on the left + width small)
  - `--percentage-m`: calendar (width medium, label on the left + width medium)
  - `--percentage-l`: calendar (width large, label on the left + width large)
  - `--percentage-full`: calendar (width full, label on the left + width small, label on the left + width medium, label on the left + width large)
  - `--form-label-width`: calendar (label on the left, label on the left + width small, label on the left + width medium, label on the left + width large)

**3. Structure — don't change** (layout, behaviour, states, accessibility)

- Borders and corners
  - `--border-thin`: day (focus), zoom (focus)
- States and motion
  - `--focus-outline`: field (focus), day (focus), zoom (focus), time select (focus)
  - `--focus-offset`: field (focus), time select (focus)

**Set by the component — don't change**

- Variables
  - `--ui-calendar-highlight-bg`: background of a highlighted day (from `highlights`)
  - `--ui-calendar-popup-left`, `--ui-calendar-popup-top`: position of the calendar dialog (measured)

**Used by the code** (the component's code names these tokens; change the token to change the result)

- Tokens
  - `--calendar-weekend-bg`: default weekend highlight (`highlights`)
  - `--calendar-highlight-bg`: highlight group without its own `backgroundToken`

## For AI-assisted development

### Instructions

- Inside a Form, give the field a `name` (the key of its value) and leave `labelPosition` on `INHERIT`, so the Form (or a ContentGroup with the class `ui-labels-start`) decides label placement for all fields. Show server or cross-field messages with `setError(message)`; they clear when the user changes the value.
- Read this README before writing code. Import only from `calendarIndex.js`.
- Use Calendar for every date, time, month or week input and for from–to periods; never write date inputs, pickers, date parsing or date validation by hand.
- Values are ISO strings (`'2026-09-26'`, `'14:30'`, `'2026-09-26T14:30'`, `'2026-09'`, `'2026-W39'`, `''` when empty or incomplete); ranges are `{ from, to }`. Convert to other formats or time zones in the application.
- Keep the default `presentation:'CUSTOM'`; use `'NATIVE'` only when the browser's own fields are explicitly wanted. With `NATIVE`, `MONTH`/`WEEK` fail with `NATIVE_TYPE_UNSUPPORTED` in Firefox and Safari, and custom-only options are ignored with `NOT_SUPPORTED_NATIVE` — do not ignore these messages.
- Choose `dateFormat` (`EU`, `US`, `ISO`) for the audience and `locale` for month and weekday names.
- Pass public holidays as a highlight group (`{ dates:[ { date, label } ], backgroundToken }`) and, if they must not be chosen, also in `disabledDates`.
- Calendars are mandatory by default; set `mandatory:false` explicitly. On submit, call `validate()` and use `getError()`/`focus()` in the error summary.
- To show Calendar values as text elsewhere (table cells, detail pages, e-mails), use `formatCalendarValue(value, options)` instead of formatting dates by hand; pass the same `dateFormat`/`displayFormat` the application uses.
- Give each calendar a unique, DOM-safe `id` and call `destroy()` before rendering into the same container again.

### Safety

- Never pass literal colours; only design-token names (`backgroundToken`).
- Never remove the spin-button roles and labels of the segments, the grid roles, `aria-selected`, `aria-disabled`, `aria-current` or the dialog labelling.
- Never convert times between time zones inside the component; do it explicitly in the application.
- Holiday labels are displayed as text; do not pass HTML.

### Example prompts

```text
Add a mandatory Calendar "Delivery date" in European format where weekends and the public holidays of the year are unavailable and shaded, with a Today button and an asterisk, and validate it on submit.
```

```text
Add a "Period" date range in US format to the report filters with quick choices for the last 7 days, last month and last 3 months, at most one year long, and reload the report when both dates are set.
```

## For developers

### Business analysis

> **Component**: the Calendar itself. **Consumer**: the developer who configures the Calendar in the application's code. **App**: the running application that uses the Calendar; it provides the data, performs the actions and stores the changes.

**Values**

- Consumer chooses the kind of value: date, time, date and time, month, week, or a period of dates or of dates with times. <!-- BA-01 -->
  - Component displays a period as two fields, "From" and "To". <!-- BA-02 -->
- Consumer chooses the format: European "dd.mm.yyyy" with 24-hour time, US "mm/dd/yyyy" with AM/PM, or ISO "yyyy-mm-dd". <!-- BA-03 -->

**Typing**

- User types digits in a part of the field, e.g. the day. <!-- BA-04 -->
  - Component moves to the next part when the part is full. <!-- BA-05 -->
- User presses the up or down arrow in a part. <!-- BA-06 -->
  - Component changes the part by one step. <!-- BA-07 -->
- User presses Backspace in a part. <!-- BA-08 -->
  - Component clears the part. <!-- BA-09 -->
- User pastes a whole date. <!-- BA-10 -->
  - Component displays the date in all parts. <!-- BA-11 -->
- User leaves the field after typing, using the arrows or Backspace, or pasting. <!-- BA-42 -->
  - Component reports the new value to the App once, not after every key. <!-- BA-43 -->

**Calendar**

- User clicks the calendar button. <!-- BA-12 -->
  - Component opens the calendar at the current value, or at today. <!-- BA-13 -->
- User clicks the calendar's title. <!-- BA-14 -->
  - Component displays months, then years, then decades, for distant dates. <!-- BA-15 -->
- User selects a day. <!-- BA-16 -->
  - Component closes the calendar and displays the value in the field. <!-- BA-17 -->
- Component displays the first day of the week as Monday, or Sunday when the Consumer chooses it. <!-- BA-18 -->
- Component displays week numbers (optional). <!-- BA-19 -->
- Component displays the hour as a list of 00–23 for European and ISO formats, and as a list of 1–12 with AM/PM for the US format. <!-- BA-20 -->

**Days and limits**

- Component displays Saturday and Sunday shaded (optional, on by default). <!-- BA-21 -->
- Consumer provides highlighted days with a colour and a name, e.g. public holidays (optional). <!-- BA-22 -->
  - User hovers over a highlighted day. <!-- BA-23 -->
  - Component displays its name as a tooltip. <!-- BA-24 -->
- Consumer provides unavailable days (optional). <!-- BA-25 -->
  - Component prevents selecting them. <!-- BA-26 -->
- Consumer provides the earliest and the latest value, the minimum and maximum length of a period, and the time step, e.g. 15 minutes (optional). <!-- BA-27 -->

**Buttons**

- Consumer enables the "Today" (or "Now") and "Clear" buttons (optional). <!-- BA-28 -->
- Consumer enables quick choices for periods, counted from today: last or next 7 days, month, 3 months, 6 months, year (optional). <!-- BA-29 -->
  - User clicks a quick choice. <!-- BA-30 -->
  - Component displays the period in both fields. <!-- BA-31 -->

**Errors**

- Component checks the value: missing, invalid, too early or too late, unavailable day, period incomplete, in the wrong order, too short or too long. <!-- BA-32 -->
  - Component displays the matching error message. <!-- BA-33 -->

**Read-only display**

- Component displays the value short ("12 Aug 26") or long ("12 August 2026"). <!-- BA-34 -->
- Component displays the value as exact text, relative text ("3 hours ago", "in 2 weeks"), or both. <!-- BA-35 -->
- Consumer provides the moment that relative text starts from (default: now). <!-- BA-36 -->
- Consumer chooses the same formatting for other places, e.g. table cells, each place with its own format. <!-- BA-37 -->

**Browser alternative**

- Consumer chooses the browser's own date fields instead of the custom field (optional). <!-- BA-38 -->
  - Component displays the field without the custom features. <!-- BA-39 -->
  - Component displays month and week fields only in browsers that offer them (Chrome and Edge). <!-- BA-40 -->

**Tooltips**

- Consumer chooses how the exact date of a relative date and the names of highlighted days shows on hover and keyboard focus: the browser's tooltip, a Tooltip or none (optional, on by default with the browser). <!-- BA-41 -->

### Contracts

**Contracts:** Styling: three parts (Styling contract) · Form field: yes · Actions: no · Shared behaviour: yes, additions under Accessibility

### Public API

```js
import { renderCalendar, formatCalendarValue, DEFAULT_CALENDAR_CONFIG, CALENDAR_TOOLTIP_MODES, CALENDAR_TYPES, CALENDAR_PRESENTATIONS, CALENDAR_STATES, CALENDAR_WIDTHS, CALENDAR_DISPLAY_FORMATS, CALENDAR_DATE_FORMATS, CALENDAR_DISPLAY_MODES, CALENDAR_MANDATORY_INDICATORS, CALENDAR_QUICK_RANGES } from './calendarIndex.js';

const due = renderCalendar(container, config, onValueChange, onValidation); // null after a developer error
```

`container` is a dedicated, consumer-owned element. Rendering replaces its content; `destroy()` clears it. The configuration is immutable; `config.value` remains the initial value.

| Member | Returns | Description |
| --- | --- | --- |
| `id` | string | The configured id. |
| `name` | string | The configured `name` (the key of the value in a Form). |
| `getLabelPosition()` | `'TOP'` \| `'START'` | Effective label position (`INHERIT` resolved from the surroundings). |
| `getLabel()` | string | The visible label; Form prefixes error-summary entries with it. |
| `getMandatoryState()` | object | `{ mandatory, indicator }`; Form shows "* Required field" when an asterisk is shown. |
| `setError(message)` | `{ valid, errorLabel }` | Shows an external error (server or cross-field rule, label `EXTERNAL`) until the user changes the value or `clearError()` is called; own validation errors take precedence. |
| `clearError()` | — | Removes an external error; own validation errors stay. |
| `getValue()` | string \| `{ from, to }` | ISO value (`''` when empty or incomplete); ranges return a copy of `{ from, to }`. |
| `getError()` | object \| null | Copy of the current error `{ errorLabel, message, source, severity, visibility }`. |
| `setValue(value)` | `{ valid, errorLabel }` | Sets the value programmatically (invalid ISO values ignored with `INVALID_OPTION`); no dirty flag, no `onValueChange`. |
| `setValue(value, { quiet:true })` | object | Quiet variant used by Form's quiet reset: sets the value without validating, removes any shown error and the changed state. |
| `validate()` | `{ valid, errorLabel }` | Runs final validation, shows or clears the error. |
| `isDirty()` | boolean | Whether the user has changed the value. |
| `focus()` | boolean | Moves focus to the first segment (custom) or the first input (native). |
| `destroy()` | — | Closes the dialog, destroys the Buttons, removes listeners, clears the container. |

### formatCalendarValue()

A function (not an instance member) that formats a Calendar value as plain text anywhere, with the same rules as Calendar's read-only view. Options are given **per call**, so every place can use its own format (e.g. a table column's long view and its compact view).

```js
formatCalendarValue(value, options) // → string ('' for empty or invalid values)
```

| Option | Default | Allowed values | Description |
| --- | --- | --- | --- |
| `type` | `'DATE'` | `DATE`, `TIME`, `DATETIME`, `MONTH`, `WEEK` | Kind of value. |
| `displayFormat` | `'SHORT'` | `SHORT`, `LONG` | "12 Aug 26" or "12 August 2026". |
| `dateFormat` | `'EU'` | `EU`, `US`, `ISO` | Order of day and month, 24-hour or AM/PM time. |
| `displayMode` | `'EXACT'` | `EXACT`, `RELATIVE`, `BOTH` | Exact text, relative text ("3 days ago") or both ("12 Aug 26 (3 days ago)"). |
| `referenceTime` | now | ISO date-time or Date | Reference for relative text. |
| `locale` | page language | BCP 47 tag | Month names and relative wording, e.g. “3 mar. 26” in Romanian (`ro`). |
| `texts` | English | `{ weekShort, weekLong }` | Week templates ("W{week} {year}", "Week {week}, {year}"). |

`value` is an ISO string of the type, or `{ from, to }` for ranges ("1 Mar 26 – 15 Mar 26").

### Configuration

Enumerated values are canonical UPPER_CASE and accepted case-insensitively. An invalid value produces an `INVALID_OPTION` warning and the default is used.

| Parameter | Type | Default | Allowed values / format | Applies when | Usage / description |
| --- | --- | --- | --- | --- | --- |
| `id` | string | — | Starts with a letter; letters, digits, `_ : . -`; unique in the document | Always | Required. Id of the field group (custom), the input (native) or the range fieldset. |
| `name` | string | value of `id` | Text | `NATIVE` | Native `name` (ranges: `{name}-from`, `{name}-to`). |
| `label` | string | — | Text | Always | Required. Label or range legend. |
| `help` | string | `''` | Text | `EDIT`, `INACTIVE` | Help text, linked through `aria-describedby`. |
| `type` | string | `'DATE'` | `DATE`, `TIME`, `DATETIME`, `MONTH`, `WEEK` | Always | Kind of value. |
| `presentation` | string | `'CUSTOM'` | `CUSTOM`, `NATIVE` | Always | Segmented field with own calendar, or browser fields. |
| `range` | boolean | `false` | — | `DATE`, `DATETIME` | "From" and "To" fields; value `{ from, to }`. |
| `dateFormat` | string | `'EU'` | `EU` (`dd.mm.yyyy`, 24 h), `US` (`mm/dd/yyyy`, AM/PM), `ISO` (`yyyy-mm-dd`) | Always | Order and separators of the parts, time style and displayed text (the editing order needs `CUSTOM`; the browser's own fields follow the browser). |
| `state` | string | `'EDIT'` | `EDIT`, `VIEW`, `INACTIVE`, `INVISIBLE` | Always | Display mode. |
| `width` | string | `'MEDIUM'` | `SMALL`, `MEDIUM`, `LARGE`, `FULL` | Always | Field width. |
| `value` | string \| object | `''` | ISO value of the type; `{ from, to }` for ranges | Always | Initial value; invalid values are ignored with a warning. |
| `minValue` / `maxValue` | string | `''` | ISO value of the type | Always | Earliest / latest allowed value (`MIN_VALUE`, `MAX_VALUE`); also disables days in the calendar. |
| `minRangeDays` / `maxRangeDays` | number \| null | `null` | Integer ≥ 1 | `range` | Minimum / maximum period length in days, both ends included. |
| `timeStep` | number | `1` | Integer 1–60 (minutes) | `TIME`, `DATETIME` | Minute steps of the calendar's time lists and native pickers. |
| `showToday` | boolean | `false` | — | Always | "Today" button ("Now" for `TIME`/`DATETIME`). |
| `showClear` | boolean | `false` | — | Always | "Clear" button. |
| `quickRanges` | array | `[]` | `LAST_7_DAYS`, `NEXT_7_DAYS`, `LAST_1_MONTH`, `NEXT_1_MONTH`, `LAST_3_MONTHS`, `NEXT_3_MONTHS`, `LAST_6_MONTHS`, `NEXT_6_MONTHS`, `LAST_1_YEAR`, `NEXT_1_YEAR` | `range` | Rolling quick choices from `referenceTime` (today included); `DATETIME` uses 00:00–23:59. |
| `firstDayOfWeek` | number | `1` | `0` (Sunday), `1` (Monday) | `CUSTOM`, not `WEEK` | First column of the calendar (a week always starts on Monday). |
| `showWeekNumbers` | boolean | `false` (always on for `WEEK`) | — | `CUSTOM` | "Week" column with ISO week numbers. |
| `highlights` | array | `[ { daysOfWeek:[6, 0], backgroundToken:'--calendar-weekend-bg' } ]` | `{ daysOfWeek?:[0–6], dates?:['YYYY-MM-DD' \| { date, label }], label?, backgroundToken? }` | `CUSTOM` | Emphasized days; the first matching group wins; labels become tooltips and part of the day's accessible name; `[]` removes all highlights. |
| `disabledDaysOfWeek` | array | `[]` | `0`–`6` (Sunday–Saturday) | `CUSTOM` | Unavailable weekdays (`DISABLED_DATE`). |
| `disabledDates` | array | `[]` | `'YYYY-MM-DD'` | `CUSTOM` | Unavailable days. |
| `displayFormat` | string | `'SHORT'` | `SHORT` ("12 Aug 26"), `LONG` ("12 August 2026") | Always | Text in the view state and error messages (order follows `dateFormat`). |
| `displayMode` | string | `'EXACT'` | `EXACT`, `RELATIVE`, `BOTH` | `VIEW` | Exact text, relative text ("3 hours ago") or both ("12 Aug 26 (3 hours ago)"). |
| `referenceTime` | string \| Date \| null | `null` (now) | ISO date-time or Date | Always | Reference for relative texts, quick ranges, "today" in the calendar, the "Today"/"Now" button and arrow-key defaults. |
| `locale` | string | page language | BCP 47 tag, e.g. `'en-GB'`, `'ro'` | Always | Optional. The language of the month and weekday names and of the relative texts. When empty, the page language (`<html lang>`), then the browser language. For example: the 3rd of March is shown as “3 Mar 26” in English (`en-GB`) and “3 mar. 26” in Romanian (`ro`). The order of day, month and year comes from `dateFormat` and the first day of the week from `firstDayOfWeek`. |
| `mandatory` | boolean | `true` | — | Always | `true`: empty is `REQUIRED`; a half-filled range is `RANGE_INCOMPLETE` in any case. |
| `mandatoryIndicator` | string | `'NONE'` | `NONE`, `OPTIONAL_TEXT`, `MANDATORY_ASTERISK` | `label` | Marker next to the label. |
| `labelPosition` | string | `'INHERIT'` | `TOP`, `START`, `INHERIT` | Always | Label above the field (`TOP`), on its left (`START`), or as set by the surrounding Form/ContentGroup (`INHERIT`: left inside an element with the class `ui-labels-start`, otherwise on top). `START` needs a surrounding container at least 36rem wide (Form, ContentGroup, CollapsiblePanel, or any element with `container-type:inline-size`); narrower, the label moves on top. |
| `autoFocus` | boolean | `false` | — | `EDIT` | Focuses the first segment or input once, after the first render. |
| `tooltipMode` | string | `'TITLE'` | `NONE`, `TITLE`, `TOOLTIP` | Always | How the exact date of a relative date and the names of highlighted days shows on hover and keyboard focus: not at all, the browser's tooltip (`title`, mouse only) or a Tooltip (also on keyboard focus; needs `tooltip.css`, the Tooltip module is loaded only then). With `TOOLTIP` it also applies to the previous, next and calendar buttons; with `TITLE` or `NONE` they show nothing (as before). |
| `texts.*` | string | English defaults | Text | Always | Labels (`from`, `to`, `today`, `now`, `clear`, `done`, `openCalendar`, navigation names), segment names and placeholders (`day`, `month`, `year`, `hour`, `minute`, `period`, `week`, `placeholderDay` …), `weekShort`/`weekLong`, one text per quick range, and `errors.{LABEL}`. |

Custom-only options with `NATIVE` (`firstDayOfWeek`, `showWeekNumbers`, `highlights`, `disabledDaysOfWeek`, `disabledDates`, and `dateFormat` for editing) produce `NOT_SUPPORTED_NATIVE`; they are not applied (the view state still uses `dateFormat`). `range` for other types, range options without `range`, `timeStep` for types without time and a Sunday start for `WEEK` are ignored with `OPTION_IGNORED`.

### Keyboard (custom)

| Where | Keys |
| --- | --- |
| Segment | Digits (auto-advance), ↑/↓ change the part (starting from today when empty), Home/End minimum/maximum, Backspace/Delete empty the part, ←/→ and separator keys (`.` `/` `-` `:` `,` space) move between parts, Tab moves on, `a`/`p` set AM/PM, Ctrl/Cmd+V pastes a whole value, Alt+↓ opens the calendar. |
| Day grid | Arrows by day and week, Home/End start/end of week, Page Up/Down by month, Shift+Page Up/Down by year, Enter/Space choose, Escape closes. |
| Month / year / decade grid | Arrows by item (±4 vertically), Page Up/Down by year / decade / century, Enter/Space zoom in (or choose a month for `MONTH`), Escape closes. |

### Presentation support

| Feature | `CUSTOM` (default) | `NATIVE` |
| --- | --- | --- |
| DATE, TIME, DATETIME | Yes | All current browsers |
| MONTH, WEEK | Yes | Chrome and Edge only (`NATIVE_TYPE_UNSUPPORTED` elsewhere, not rendered) |
| Typing | Segmented, in `dateFormat` | Browser field, in the browser's language |
| Ranges | "From"/"To" fields, each with its calendar | "From"/"To" browser fields |
| Quick ranges, Today/Clear, limits, time steps | Yes | Yes |
| Zoom levels, week start, week numbers, highlights, unavailable days, own look | Yes | No (`NOT_SUPPORTED_NATIVE`) |

### Callbacks

| Callback | Arguments | Fires when | Does not fire when |
| --- | --- | --- | --- |
| `onValueChange` | `(value, instance)` | The effective value changes through the user. Typing, the arrows, Backspace and paste in the field (and the browser's own fields): once, when focus leaves the field, if the value differs from the last one reported. Picking in the calendar, time lists, Today/Clear, quick ranges: at once. | Each key while focus stays in the field (`getValue()` already returns the typed value), a value that ends as it was, `setValue()`, navigation and zooming in the calendar. |
| `onValidation` | `(result, instance)` with `result = { valid, errorLabel }` | The effective result changes; for typing in the field, when focus leaves it. | The result is unchanged; each key while focus stays in the field. |

### Errors

| Label | Default message | Trigger | Visibility |
| --- | --- | --- | --- |
| `EXTERNAL` | Message passed to `setError()`. | `setError(message)`, e.g. from a Form (server errors, cross-field rules). | Corrective |
| `REQUIRED` | Enter a date. | Empty with `mandatory:true`. | Corrective |
| `INVALID_DATE` | Enter a valid date. | Incomplete or impossible value (partly filled parts, 31.02., unparseable native input). | Corrective |
| `MIN_VALUE` | Enter {minValue} or later. | Before `minValue`. | Corrective |
| `MAX_VALUE` | Enter {maxValue} or earlier. | After `maxValue`. | Corrective |
| `DISABLED_DATE` | This date is not available. | An unavailable day typed or set programmatically. | Corrective |
| `RANGE_INCOMPLETE` | Enter both dates. | Only one end of a range. | Corrective |
| `RANGE_ORDER` | The end must not be before the start. | `to` before `from`. | Corrective |
| `RANGE_TOO_SHORT` | Choose at least {minRangeDays} days. | Shorter than `minRangeDays`. | Corrective |
| `RANGE_TOO_LONG` | Choose at most {maxRangeDays} days. | Longer than `maxRangeDays`. | Corrective |
| `UNIDENTIFIED` | An unidentified error occurred. | Unknown error label. | Dismissible |

Errors are shown on `validate()`, `setValue()` and when the user leaves the component after changing it (or with incomplete input); they are updated while the user corrects them and are not announced by the field. Developer errors prevent rendering (`renderCalendar()` returns `null`); warnings are logged and rendering continues. Console format: `Calendar "id" [LABEL]: message`.

| Label | Severity | Cause |
| --- | --- | --- |
| `CONTAINER_REQUIRED` | error | No container passed. |
| `ID_REQUIRED` | error | `id` is empty. |
| `UNSAFE_ID` | error | `id` is not DOM-safe. |
| `DUPLICATE_ID` | error | An element with the same id already exists in the document. |
| `LABEL_REQUIRED` | error | `label` is empty. |
| `NATIVE_TYPE_UNSUPPORTED` | error | `NATIVE` `MONTH`/`WEEK` in a browser without that picker; use `CUSTOM` or another type. |
| `INVALID_OPTION` | warning | Invalid enumerated value, number, ISO value, highlight group, token name, `referenceTime`, `locale` tag (the page language is used) or `setValue()` argument. |
| `OPTION_IGNORED` | warning | Option that does not apply to the type or range setting. |
| `NOT_SUPPORTED_NATIVE` | warning | Custom-only feature configured with `NATIVE`; not applied. |
| `UNKNOWN_QUICK_RANGE` | warning | Unknown quick-range key; dropped. |

### Accessibility

- Custom field: a `role="group"` named by the label (and "From"/"To"), whose parts are labelled spin buttons (`aria-valuenow`, `aria-valuetext`, min/max, `aria-required`, `aria-invalid`), so screen readers announce e.g. "Day, 12". The calendar button is a Button with a translated name ("Choose date").
- Calendar dialog: non-modal `role="dialog"` labelled by the field label; days, months, years and decades form a `role="grid"` with `aria-selected`, `aria-disabled`, `aria-current="date"` and a full date (plus highlight label) as each cell's name; weekday headers carry full names. Navigation and zoom controls are Buttons; the zoom title shows its purpose as a tooltip.
- Unavailable days are shown by reduced opacity and strike-through and announced as unavailable; the selected day has colour plus bold text; highlight colours are complemented by labels.
- Native: real date/time inputs with `label for` (ranges: a fieldset with "From"/"To" labels).
- `RELATIVE` view keeps the exact date for screen readers (hidden text) and as a tooltip.
- Errors are linked through `aria-describedby` and `aria-invalid`; announcing them is the consumer's error summary's job.

### Examples

Delivery date without weekends and public holidays, validated on submit:

```js
const holidays = [ { date:'2026-12-25', label:'Christmas' }, { date:'2026-12-26', label:'Boxing Day' } ];

const delivery = renderCalendar(deliveryHost,
{
    id:'delivery-date', label:'Delivery date', locale:'en-GB',
    minValue:'2026-10-01', maxValue:'2026-12-31',
    disabledDaysOfWeek:[ 0, 6 ], disabledDates:holidays.map(holiday => holiday.date),
    highlights:[ { dates:holidays, backgroundToken:'--c-danger-soft' }, { daysOfWeek:[ 6, 0 ], backgroundToken:'--calendar-weekend-bg' } ],
    showToday:true, mandatoryIndicator:'MANDATORY_ASTERISK', texts:{ errors:{ REQUIRED:'Choose a delivery date.' } }
},( value ) => { order.deliveryDate = value; });

form.addEventListener('submit',event => { if ( !delivery.validate().valid ) { event.preventDefault(); showErrorSummary([ { message:delivery.getError().message, focus:delivery.focus } ]); } });
```

Report period in US format with quick choices, reloading the report when both dates are set:

```js
renderCalendar(periodHost,{ id:'report-period', label:'Period', range:true, dateFormat:'US', mandatory:false, maxRangeDays:366,
    quickRanges:[ 'LAST_7_DAYS', 'LAST_1_MONTH', 'LAST_3_MONTHS' ], showClear:true },
( { from, to } ) => { if ( from && to ) { loadReport(from,to); } });
```

Dates in a table column, long view and compact view (each with its own format):

```js
{ field:'date', label:'Date', type:'DATE', width:'M',
  format:value => formatCalendarValue(value,{ displayFormat:'LONG', dateFormat:'EU' }),
  compact:{ width:'S', format:value => formatCalendarValue(value,{ displayFormat:'SHORT', dateFormat:'EU' }) } }
```

Read-only "last login" as exact and relative text:

```js
renderCalendar(loginHost,{ id:'last-login', label:'Last login', type:'DATETIME', state:'VIEW', displayMode:'BOTH', value:user.lastLogin });
```

### Files

| File | Responsibility |
| --- | --- |
| `calendarIndex.js` | Public entry point; the only import surface (`renderCalendar`, `formatCalendarValue`, constants). |
| `calendarConfig.js` | Defaults, allowed values, normalization (highlights, texts), native support detection, developer validation. |
| `calendarComponent.js` | Lifecycle, value and error lifecycle, segment editing, calendar dialog (zoom levels, keyboard, ranges, time), Button composition. |
| `calendarHTML.js` | Custom, native and view markup; dialog body builders. |
| `calendarEvents.js` | Native, custom and open-dialog listener registration. |
| `calendarState.js` | Per-instance runtime state. |
| `calendarValidation.js` | Validation rules (pure functions). |
| `calendarSegments.js` | Pure helpers: segment layouts per type and format, typing and stepping rules, conversion to and from ISO values, paste parsing. |
| `calendarDates.js` | Pure helpers: date arithmetic, ISO values and weeks, exact and relative formatting, quick ranges.; `formatCalendarValue()`. |
| `calendarErrors.js` | User error catalog and developer error and warning catalog. |
| `calendar.css` | Presentation. |
| `calendarTESTS.md` | Test plan: the cases that prove this README (automatic ones in `tests/components/calendar.test.mjs`). |
