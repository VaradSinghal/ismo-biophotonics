import { z } from 'zod';
import { SORT_ORDERS } from '../enums';

/** Strict calendar date in `YYYY-MM-DD` form that must also be a real date (rejects 2024-02-30). */
export const dateOnlySchema = z
  .string({ invalid_type_error: 'Must be a date string (YYYY-MM-DD)' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date in YYYY-MM-DD format')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number) as [number, number, number];
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
    );
  }, 'Must be a valid calendar date');

/** Optional, nullable date. `null` explicitly clears the value; empty string is treated as null. */
export const optionalDateSchema = z.preprocess(
  (v) => (v === '' ? null : v),
  dateOnlySchema.nullable().optional(),
);

/** Required non-empty trimmed string. Whitespace-only input is rejected. */
export const requiredText = (field: string, max: number) =>
  z
    .string({ required_error: `${field} is required`, invalid_type_error: `${field} must be text` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`);

/** Optional text; blank strings are normalized to null. */
export const optionalText = (field: string, max: number) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z
      .string({ invalid_type_error: `${field} must be text` })
      .trim()
      .max(max, `${field} must be at most ${max} characters`)
      .nullable()
      .optional(),
  );

export const uuidSchema = z.string().uuid('Must be a valid ID');

export const idParamSchema = z.object({ id: uuidSchema });

/** Search term from a query string: trimmed, blank -> undefined. */
export const searchQuerySchema = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().trim().max(100, 'Search must be at most 100 characters').optional(),
);

/** Treats empty query-string values as absent so `?status=` doesn't fail enum validation. */
export const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be at most 100').default(20),
  order: emptyToUndefined(z.enum(SORT_ORDERS)).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Compares two YYYY-MM-DD strings (lexical comparison is valid for this format). */
export const isDateOnOrAfter = (later: string, earlier: string) => later >= earlier;
