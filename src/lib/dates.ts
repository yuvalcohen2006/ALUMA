/**
 * Format a Postgres `date` without moving it a day.
 *
 * A `date` column comes back as "2026-10-01". `new Date("2026-10-01")` is
 * parsed as UTC midnight per the ECMAScript date-only form, and formatting
 * that in a browser west of Greenwich prints 30 September — so a customer
 * reading their project's next milestone from Europe or the US was shown the
 * wrong day, and only ever by one.
 *
 * Splitting the parts and building a LOCAL date keeps the calendar day the
 * owner typed. Anything that is not a plain date falls through to the normal
 * parse, so a full timestamp still works.
 */
export function formatDateOnly(value: string, locale = "he-IL"): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(locale);
}
