import type { AdminStats, AuditLogListQuery } from '@biophonics/shared';
import { prisma } from '../../lib/prisma';
import { paginationMeta } from '../../lib/serializers';

export async function getStats(): Promise<AdminStats> {
  const [
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    newUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    newUsersLast7Days: newUsers,
  };
}

export async function listAuditLogs(query: AuditLogListQuery) {
  const where = {
    action: query.action,
    entityType: query.entityType,
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    }),
  ]);

  return {
    data: logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
    meta: paginationMeta(query.page, query.limit, total),
  };
}
