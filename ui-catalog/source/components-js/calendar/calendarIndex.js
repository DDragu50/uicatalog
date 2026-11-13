// calendarIndex.js
//
// PUBLIC ENTRY POINT.
// Code outside this folder imports Calendar only from this file.
//
// renderCalendar(container, config, onValueChange, onValidation)
//   Renders a date / time / date-time / month / week field (optionally a from–to range for DATE and DATETIME)
//   into a dedicated, consumer-owned container.
//   Returns { id, getValue, getError, setValue, validate, isDirty, focus, destroy } or null after a developer error.
//   Values are ISO strings ('2026-09-26', '14:30', '2026-09-26T14:30', '2026-09', '2026-W39'; '' when empty);
//   ranges are { from, to }. validate() and setValue() return { valid, errorLabel }.
//
//   onValueChange(value, instance): a user action changed the value.
//   onValidation(result, instance): the effective result { valid, errorLabel } changed.
//
// presentation CUSTOM (default): segmented, Chrome-like typing (EU dd.mm.yyyy, US mm/dd/yyyy or ISO) plus an own
// calendar dialog (days, months, years, decades); ranges use two fields. NATIVE uses the browser's own pickers.
// Native-impossible features (disabled days, first day of week, week numbers) warn and are not applied;
// MONTH and WEEK without a native picker in the browser (Firefox, Safari) are a developer error with NATIVE.
// Local date and time as entered: no time-zone conversion. Enumerated values are canonical UPPER_CASE.
//
// formatCalendarValue(value, options): formats a value as text outside Calendar (e.g. table cells), with its own
// options per call (type, displayFormat, dateFormat, displayMode, referenceTime, locale).
//
// Everything not exported here is internal implementation.

export { renderCalendar } from './calendarComponent.js';
export { DEFAULT_CALENDAR_CONFIG, CALENDAR_TOOLTIP_MODES, CALENDAR_TYPES, CALENDAR_PRESENTATIONS, CALENDAR_STATES, CALENDAR_WIDTHS, CALENDAR_DISPLAY_FORMATS, CALENDAR_DATE_FORMATS, CALENDAR_DISPLAY_MODES, CALENDAR_MANDATORY_INDICATORS, CALENDAR_QUICK_RANGES, CALENDAR_LABEL_POSITIONS } from './calendarConfig.js';
export { formatCalendarValue } from './calendarDates.js';
