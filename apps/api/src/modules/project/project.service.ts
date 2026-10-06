import type { Prisma } from '@prisma/client';
import type { ProjectCreateInput, ProjectListQuery, ProjectUpdateInput } from '@biophonics/shared';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { paginationMeta, projectSelect, serializeProject } from '../../lib/serializers';
import { toDbDateOrNull } from '../../lib/dates';
import { audit, type AuditContext } from '../audit/audit.service';

function toSortColumn(sortBy: string): Prisma.ProjectOrderByWithRelationInput {
  switch (sortBy) {
    case 'name': return { name: 'asc' }; // Names are usually asc
    case 'status': return { status: 'asc' };
    case 'startDate': return { startDate: 'desc' };
    case 'endDate': return { endDate: 'desc' };
    case 'createdAt':
    default:
      return { createdAt: 'desc' };
  }
}

export async function createProject(userId: string, input: ProjectCreateInput, ctx: AuditContext) {
  const project = await prisma.project.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: toDbDateOrNull(input.startDate),
      endDate: toDbDateOrNull(input.endDate),
    },
    select: projectSelect,
  });

  await audit(ctx, 'CREATE', 'Project', project.id, { name: project.name, status: project.status });
  return serializeProject(project);
}

export async function getProject(userId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, userId },
    select: projectSelect,
  });
  if (!project) throw AppError.notFound('Project');

  // Also get completed task count for this specific project
  const completedTaskCount = await prisma.task.count({
    where: { projectId: id, status: 'COMPLETED' },
  });

  return serializeProject(project, completedTaskCount);
}

export async function updateProject(userId: string, id: string, input: ProjectUpdateInput, ctx: AuditContext) {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: projectSelect });
  if (!existing) throw AppError.notFound('Project');

  const start = input.startDate !== undefined ? input.startDate : existing.startDate?.toISOString().slice(0, 10);
  const end = input.endDate !== undefined ? input.endDate : existing.endDate?.toISOString().slice(0, 10);

  if (start && end && end < start) {
    throw AppError.badRequest('Validation failed', [{ field: 'endDate', message: 'End date must be on or after the start date' }]);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: toDbDateOrNull(input.startDate),
      endDate: toDbDateOrNull(input.endDate),
    },
    select: projectSelect,
  });

  await audit(ctx, 'UPDATE', 'Project', project.id, { status: project.status });
  return serializeProject(project);
}

export async function deleteProject(userId: string, id: string, ctx: AuditContext) {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw AppError.notFound('Project');

  await prisma.project.delete({ where: { id } });
  await audit(ctx, 'DELETE', 'Project', id);
}

export async function listProjects(userId: string, query: ProjectListQuery) {
  const where: Prisma.ProjectWhereInput = {
    userId,
    status: query.status,
    name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
  };

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: query.sortBy ? toSortColumn(query.sortBy) : { createdAt: 'desc' },
      select: projectSelect,
    }),
  ]);

  const projectIds = projects.map((p) => p.id);
  const completedCounts = await prisma.task.groupBy({
    by: ['projectId'],
    where: { projectId: { in: projectIds }, status: 'COMPLETED' },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(completedCounts.map((c) => [c.projectId, c._count.id]));

  return {
    data: projects.map((p) => serializeProject(p, countMap[p.id] ?? 0)),
    meta: paginationMeta(query.page, query.limit, total),
  };
}
