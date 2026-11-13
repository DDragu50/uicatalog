# Calendar — test plan

This plan proves the Calendar README. Every Business analysis line (its hidden code, e.g. `BA-07`), every callback and every error label is covered by at least one case below; `npm run coverage` checks that nothing is missing. Cases marked **auto** run with `npm run test:components calendar` (code: `tests/components/calendar.test.mjs`); cases marked **manual** are checked by a person before a release.

The shared contract test (`npm test`) already proves, for every component, rendering and `destroy()`, that no callback fires without a user action, and the labels `CONTAINER_REQUIRED`, `ID_REQUIRED`, `UNSAFE_ID`, `DUPLICATE_ID` and `INVALID_OPTION`; they are not repeated here.

The test data: "today" is fixed with `referenceTime` to Wednesday 12 August 2026, 10:00; the field is "Due date" in the European format unless a case says otherwise.

## Test cases

| ID | Covers | Kind | Steps | Expected result |
| --- | --- | --- | --- | --- |
| T-01 | BA-01, BA-03 | auto | Render each kind of value: date (European, US, ISO), time (European, US), date and time, month, week. | `dd.mm.yyyy`, `mm/dd/yyyy`, `yyyy-mm-dd`, `hh:mm`, `hh:mm --`, `dd.mm.yyyy, hh:mm`, `mm.yyyy`, `Week ww, yyyy`. |
| T-02 | BA-02 | auto | Render a period from 3 to 14 August. | "From" and "To" fields with their dates; the value `{ from, to }`. |
| T-03 | BA-04, BA-05, BA-42, BA-43, onValueChange, onValidation | auto | Click the day and type "12082026"; leave the field. | After "12" the month part has the focus; "12.08.2026" and `getValue()` returns it; nothing reported while focus stays; on leaving, `onValueChange('2026-08-12')` once with the instance and `onValidation` with a valid result. |
| T-04 | BA-06, BA-07, BA-43 | auto | On 12.08.2026 press Up in the day, then Down twice; leave the field. | 13, then 11 August; only 11 August is reported, when focus leaves. |
| T-05 | BA-08, BA-09, INVALID_DATE | auto | On 12.08.2026 press Backspace in the month; leave the field. | "12.mm.2026", the value empty; reported when focus leaves, with "Enter a valid date." |
| T-06 | BA-10, BA-11, BA-43 | auto | Paste "24.12.2026" in the day; leave the field. | "24.12.2026" in all parts; reported when focus leaves. |
| T-07 | BA-12, BA-13, BA-16, BA-17 | auto | Open the calendar; choose 20 August; set 4 March 2025 and open it again. | "August 2026" with today marked; the day closes it and fills the field; it opens at March 2025 on the 4th. |
| T-08 | BA-14, BA-15 | auto | Click the title three times; then choose 1980s, 1985, June. | Months, years, decades (the title is then disabled); June 1985 is reached in three clicks. |
| T-09 | BA-18, BA-19 | auto | Open the default calendar; then with `firstDayOfWeek:0` and week numbers. | Monday first; Sunday first after the "Week" column, with 31, 32 … |
| T-10 | BA-20, BA-27 | auto | Open a date-and-time calendar in the European format; then in the US format with a 15-minute step. | Hours 00–23; then 12, 1 … 11 with AM/PM, minutes 00, 15, 30, 45. |
| T-11 | BA-21, BA-22, BA-23, BA-24 | auto | Open a calendar with shaded weekends and "Founders Day" on 14 August; then with `highlights:[]`. | Saturday and the 14th in their colours; "Founders Day" as the browser's tooltip and in the day's name; no shading when removed. |
| T-12 | BA-25, BA-26, DISABLED_DATE | auto | Make 20 August and Sundays unavailable; click the 20th; set it from the App. | Both unavailable; the click does nothing; "This date is not available." |
| T-13 | BA-27, MIN_VALUE, MAX_VALUE | auto | Limit to 5–25 August; open; set 1 August, then 1 September. | Days outside unavailable; "Enter 5 Aug 26 or later."; "Enter 25 Aug 26 or earlier." |
| T-14 | BA-28 | auto | With Today and Clear click Today, then Clear; render a time with Today. | 12 August (the "today" of `referenceTime`, also marked in the calendar; before Delivery 128 the button used the computer's date), then empty (both reported); "Now" for times. |
| T-15 | BA-29, BA-30, BA-31 | auto | Render a period with "Last 7 days" and "Next month"; click "Last 7 days". | Both buttons; 06.08.2026 – 12.08.2026 in the fields, today included; reported. |
| T-16 | BA-32, BA-33, REQUIRED, RANGE_INCOMPLETE, RANGE_ORDER, RANGE_TOO_SHORT, RANGE_TOO_LONG | auto | Validate an empty field; in a period of 3–10 days set one end, the wrong order, 2 days, 20 days, then 5 days. | "Enter a date."; "Enter both dates."; "The end must not be before the start."; "Choose at least 3 days."; "Choose at most 10 days."; no error. |
| T-17 | EXTERNAL | auto | Call `setError('This day is fully booked.')`; press Up in the day. | The message is shown with label `EXTERNAL`; removed by the user's change. |
| T-18 | BA-34 | auto | Show 12 August short, long, in the US format, and an empty value. | "12 Aug 26", "12 August 2026", "Aug 12, 26", "—". |
| T-19 | BA-35, BA-36, BA-41 | auto | Show 26 August relative, both, relative to 9 September, with `tooltipMode` `NONE` and `TOOLTIP`; hover it. | "in 2 weeks" with "26 Aug 26" as the browser's tooltip; "26 Aug 26 (in 2 weeks)"; "2 weeks ago"; no tooltip; a Tooltip "26 Aug 26". |
| T-20 | BA-37 | auto | Call `formatCalendarValue` with different options. | Each call has its own format: short, long, US date and time, a period, a week, relative, Romanian; '' for nonsense. |
| T-21 | BA-38, BA-39, BA-40, NOT_SUPPORTED_NATIVE | auto | Render the browser's date field with week numbers and an unavailable day; type a date and leave the field; render a month field. | A browser date field, no segments and no calendar; two `[NOT_SUPPORTED_NATIVE]` warnings; the date reported when focus leaves; in Chromium a month field. |
| T-22 | BA-40, NATIVE_TYPE_UNSUPPORTED | auto | In a page whose browser has no week field, render the browser's week field. | Nothing is rendered; `[NATIVE_TYPE_UNSUPPORTED]`. |
| T-23 | LABEL_REQUIRED | auto | Render without a label. | Nothing is rendered; the console shows `[LABEL_REQUIRED]`. |
| T-24 | OPTION_IGNORED, UNKNOWN_QUICK_RANGE | auto | Render a time period with `minRangeDays`; then a period with an unknown quick range. | Two `[OPTION_IGNORED]` warnings; the unknown quick range is dropped with a warning. |
| T-26 | BA-42, BA-43 | auto | On 12.08.2026 press Up then Down and leave; type the year 2027 and leave; in a period type both dates, moving from From to To, and leave; pick a day in the To calendar. | Nothing reported for a value that ends as it was; 2027 reported once, not per digit; both dates reported once, not when moving between From and To; picking in the calendar is reported at once. |
| T-25 | UNIDENTIFIED | auto | Ask the error catalogue for an unknown label. | "An unidentified error occurred.", dismissible. |
| M-01 | BA-12, BA-15, BA-21, BA-22 | manual | Open the gallery (`npm run gallery`, Calendar) in the light and the dark theme and from right to left. | Field, calendar, zoom levels, weekends, highlights, unavailable days and time lists look as in the design. |
| M-02 | BA-38, BA-40 | manual | Open the live example with the browser's own fields in Firefox and Safari. | Date, time and date-and-time fields work; month and week fields are not offered. |
| M-03 | BA-04, BA-16, BA-24 | manual | With a screen reader, type a date, open the calendar and move through the days. | The parts, the days with their names (e.g. a holiday) and the chosen value are read. |

## Instructions for AI tools

- Treat the README as the contract and this file as its proof: a change of behaviour changes the README line, this plan and `tests/components/calendar.test.mjs` in the same change.
- A new Business analysis line gets the next free code (never reuse or renumber a code) and at least one case here; a new callback or error label also gets a case.
- Calendar uses Button: after a change to it, run `npm run test:components calendar` and `npm test`. Table formats dates with `formatCalendarValue`: after a change to it, also run `npm run test:components table`.
- To fix a bug: first add a case (or a step to a case) that fails because of the bug, then fix the component, then run the tests and `npm run check`; keep the case.
- Prefer **auto** cases; use **manual** only for what a script cannot judge: the look, other browsers and screen readers.
