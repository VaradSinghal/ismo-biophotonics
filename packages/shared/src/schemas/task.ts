import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../enums';
import {
  emptyToUndefined,
  optionalDateSchema,
  optionalText,
  paginationQuerySchema,
  requiredText,
  searchQuerySchema,
  uuidSchema,
} from './common';

const taskStatusSchema = z.enum(TASK_STATUSES, {
  errorMap: () => ({ message: `Status must be one of: ${TASK_STATUSES.join(', ')}` }),
});

const taskPrioritySchema = z.enum(TASK_PRIORITIES, {
  errorMap: () => ({ message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}` }),
});

export const taskCreateSchema = z.object({
  projectId: uuidSchema,
  name: requiredText('Task name', 160),
  description: optionalText('Description', 2000),
  priority: taskPrioritySchema.default('MEDIUM'),
  status: taskStatusSchema.default('PENDING'),
  dueDate: optionalDateSchema,
});

/** Partial update. `projectId` moves the task to another project the user owns. */
export const taskUpdateSchema = z
  .object({
    projectId: uuidSchema.optional(),
    name: requiredText('Task name', 160).optional(),
    description: optionalText('Description', 2000),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    dueDate: optionalDateSchema,
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const TASK_SORT_FIELDS = ['createdAt', 'name', 'dueDate', 'priority', 'status'] as const;

export const taskListQuerySchema = paginationQuerySchema.extend({
  projectId: emptyToUndefined(uuidSchema),
  search: searchQuerySchema,
  status: emptyToUndefined(taskStatusSchema),
  priority: emptyToUndefined(taskPrioritySchema),
  sortBy: emptyToUndefined(z.enum(TASK_SORT_FIELDS)).default('createdAt'),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
