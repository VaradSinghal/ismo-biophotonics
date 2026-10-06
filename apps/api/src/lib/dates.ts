/**
 * Date helpers for Postgres DATE columns.
 * Prisma maps DATE <-> JS Date at UTC midnight, so we always convert via UTC.
 */

/** `YYYY-MM-DD` -> Date at UTC midnight. */
export const toDbDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/** Undefined stays undefined (field untouched), null clears, string converts. */
export const toDbDateOrNull = (value: string | null | undefined): Date | null | undefined =>
  value === undefined ? undefined : value === null ? null : toDbDate(value);

/** Date (UTC midnight) -> `YYYY-MM-DD`. */
export const fromDbDate = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

/** Today's calendar date (`YYYY-MM-DD`) in the given IANA timezone. */
export function todayInTimezone(timezone: string, now = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Adds whole days to a `YYYY-MM-DD` string. */
export function addDays(date: string, days: number): string {
  const d = toDbDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
