import { z } from 'zod';
import { PROJECT_STATUSES } from '../enums';
import {
  emptyToUndefined,
  isDateOnOrAfter,
  optionalDateSchema,
  optionalText,
  paginationQuerySchema,
  requiredText,
  searchQuerySchema,
} from './common';

const projectStatusSchema = z.enum(PROJECT_STATUSES, {
  errorMap: () => ({ message: `Status must be one of: ${PROJECT_STATUSES.join(', ')}` }),
});

const projectFields = {
  name: requiredText('Project name', 120),
  description: optionalText('Description', 2000),
  status: projectStatusSchema,
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
};

type DateRange = { startDate?: string | null; endDate?: string | null };

/** Adds the `endDate >= startDate` rule (only when both are present in the payload). */
const withDateRangeRule = <T extends z.ZodType<DateRange, z.ZodTypeDef, unknown>>(schema: T) =>
  schema.superRefine((value, ctx) => {
    if (value.startDate && value.endDate && !isDateOnOrAfter(value.endDate, value.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be on or after the start date',
      });
    }
  });

export const projectCreateSchema = withDateRangeRule(
  z.object({
    ...projectFields,
    status: projectStatusSchema.default('NOT_STARTED'),
  }),
);

/** PUT accepts partial bodies; the service re-checks the date rule against stored values. */
export const projectUpdateSchema = withDateRangeRule(
  z
    .object({
      name: projectFields.name.optional(),
      description: projectFields.description,
      status: projectStatusSchema.optional(),
      startDate: projectFields.startDate,
      endDate: projectFields.endDate,
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update'),
);

export const PROJECT_SORT_FIELDS = ['createdAt', 'name', 'status', 'startDate', 'endDate'] as const;

export const projectListQuerySchema = paginationQuerySchema.extend({
  search: searchQuerySchema,
  status: emptyToUndefined(projectStatusSchema),
  sortBy: emptyToUndefined(z.enum(PROJECT_SORT_FIELDS)).default('createdAt'),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
