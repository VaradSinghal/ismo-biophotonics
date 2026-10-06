import type { DashboardStats, ProjectStatus, TaskPriority } from '@biophonics/shared';
import { prisma } from '../../lib/prisma';
import { serializeTask, taskSelect } from '../../lib/serializers';

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [
    projects,
    tasks,
    dueSoonTasks,
  ] = await Promise.all([
    prisma.project.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    }),
    prisma.task.groupBy({
      by: ['status', 'priority'],
      where: { project: { userId } },
      _count: { id: true },
    }),
    prisma.task.findMany({
      where: {
        project: { userId },
        status: { not: 'COMPLETED' },
        dueDate: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }, // Due within 3 days
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      select: taskSelect,
    }),
  ]);

  const projectsByStatus = {
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  } as Record<ProjectStatus, number>;

  let totalProjects = 0;
  for (const group of projects) {
    projectsByStatus[group.status] = group._count.id;
    totalProjects += group._count.id;
  }

  const tasksByPriority = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  } as Record<TaskPriority, number>;

  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;
  let inProgressTasks = 0;

  for (const group of tasks) {
    const count = group._count.id;
    totalTasks += count;
    tasksByPriority[group.priority] += count;

    if (group.status === 'COMPLETED') {
      completedTasks += count;
    } else {
      pendingTasks += count;
      if (group.status === 'IN_PROGRESS') {
        inProgressTasks += count;
      }
    }
  }

  const overdueTasksCount = await prisma.task.count({
    where: {
      project: { userId },
      status: { not: 'COMPLETED' },
      dueDate: { lt: new Date() },
    },
  });

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    projectsInProgress: projectsByStatus.IN_PROGRESS,
    projectsByStatus,
    tasksByPriority,
    overdueTasks: overdueTasksCount,
    dueSoonTasks: dueSoonTasks.map(serializeTask),
  };
}
