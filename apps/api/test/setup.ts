import { beforeAll, afterAll, afterEach } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

import { prisma } from '../src/lib/prisma';

// In a real project we'd use a separate test DB, but for this task we'll just clean tables.
// Ensure we don't delete production data by accident.
beforeAll(() => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must be run with NODE_ENV=test');
  }
});

afterEach(async () => {
  // Clean DB between tests
  const deleteAuditLogs = prisma.auditLog.deleteMany();
  const deleteTasks = prisma.task.deleteMany();
  const deleteProjects = prisma.project.deleteMany();
  const deleteRefreshTokens = prisma.refreshToken.deleteMany();
  const deleteDeviceTokens = prisma.deviceToken.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteAuditLogs,
    deleteTasks,
    deleteProjects,
    deleteRefreshTokens,
    deleteDeviceTokens,
    deleteUsers,
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
