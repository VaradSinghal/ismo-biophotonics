import type { Prisma } from '@prisma/client';
import type { TaskCreateInput, TaskListQuery, TaskUpdateInput } from '@biophonics/shared';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { paginationMeta, serializeTask, taskSelect } from '../../lib/serializers';
import { toDbDateOrNull } from '../../lib/dates';
import { audit, type AuditContext } from '../audit/audit.service';

/** Verifies that the user owns the project (tasks have no direct userId). */
async function verifyProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) throw AppError.notFound('Project');
}

/** Verifies that the user owns the task's project. */
async function verifyTaskOwnership(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId } },
    select: { id: true },
  });
  if (!task) throw AppError.notFound('Task');
}

function toSortColumn(sortBy: string): Prisma.TaskOrderByWithRelationInput {
  switch (sortBy) {
    case 'name': return { name: 'asc' };
    case 'dueDate': return { dueDate: 'asc' }; // Earliest first
    case 'priority': return { priority: 'desc' }; // HIGH first
    case 'status': return { status: 'asc' }; // PENDING first
    case 'createdAt':
    default:
      return { createdAt: 'desc' };
  }
}

export async function createTask(userId: string, input: TaskCreateInput, ctx: AuditContext) {
  await verifyProjectOwnership(userId, input.projectId);

  const task = await prisma.task.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: toDbDateOrNull(input.dueDate),
      completedAt: input.status === 'COMPLETED' ? new Date() : null,
    },
    select: taskSelect,
  });

  await audit(ctx, 'CREATE', 'Task', task.id, { name: task.name, status: task.status });
  return serializeTask(task);
}

export async function getTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, project: { userId } },
    select: taskSelect,
  });
  if (!task) throw AppError.notFound('Task');
  return serializeTask(task);
}

export async function updateTask(userId: string, id: string, input: TaskUpdateInput, ctx: AuditContext) {
  await verifyTaskOwnership(userId, id);
  if (input.projectId) {
    await verifyProjectOwnership(userId, input.projectId);
  }

  const existing = await prisma.task.findUniqueOrThrow({ where: { id }, select: { status: true, completedAt: true } });
  
  let completedAt = existing.completedAt;
  if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
    completedAt = new Date();
  } else if (input.status !== undefined && input.status !== 'COMPLETED') {
    completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate !== undefined ? toDbDateOrNull(input.dueDate) : undefined,
      completedAt,
    },
    select: taskSelect,
  });

  await audit(ctx, 'UPDATE', 'Task', task.id, { status: task.status });
  return serializeTask(task);
}

export async function deleteTask(userId: string, id: string, ctx: AuditContext) {
  await verifyTaskOwnership(userId, id);

  await prisma.task.delete({ where: { id } });
  await audit(ctx, 'DELETE', 'Task', id);
}

export async function listTasks(userId: string, query: TaskListQuery) {
  const where: Prisma.TaskWhereInput = {
    project: { userId }, // Scoped to user's projects
    projectId: query.projectId,
    status: query.status,
    priority: query.priority,
    name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
  };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: query.sortBy ? toSortColumn(query.sortBy) : { createdAt: 'desc' },
      select: taskSelect,
    }),
  ]);

  return {
    data: tasks.map(serializeTask),
    meta: paginationMeta(query.page, query.limit, total),
  };
}
