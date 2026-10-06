import type { Prisma } from '@prisma/client';
import type { Project, PublicUser, Task } from '@biophonics/shared';
import { fromDbDate } from './dates';

/**
 * Explicit allow-list serializers. Responses are built field-by-field so sensitive
 * columns (passwordHash, token hashes) can never leak by accident.
 */

export const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const serializeUser = (u: UserRow): PublicUser => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt.toISOString(),
});

export const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  startDate: true,
  endDate: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { tasks: true } },
} satisfies Prisma.ProjectSelect;

type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectSelect }>;

export const serializeProject = (p: ProjectRow, completedTaskCount = 0): Project => ({
  id: p.id,
  name: p.name,
  description: p.description,
  status: p.status,
  startDate: fromDbDate(p.startDate),
  endDate: fromDbDate(p.endDate),
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
  taskCount: p._count.tasks,
  completedTaskCount,
});

export const taskSelect = {
  id: true,
  projectId: true,
  name: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  project: { select: { id: true, name: true } },
} satisfies Prisma.TaskSelect;

type TaskRow = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

export const serializeTask = (t: TaskRow): Task => ({
  id: t.id,
  projectId: t.projectId,
  project: t.project,
  name: t.name,
  description: t.description,
  priority: t.priority,
  status: t.status,
  dueDate: fromDbDate(t.dueDate),
  completedAt: t.completedAt ? t.completedAt.toISOString() : null,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

export const paginationMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
