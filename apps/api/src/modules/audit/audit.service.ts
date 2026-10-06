import type { AuditAction, Prisma } from '@prisma/client';
import { logger } from '../../lib/logger';
import { prisma } from '../../lib/prisma';

export interface AuditContext {
  userId: string | null;
  ip?: string | null;
}

type AuditEntity = 'User' | 'Project' | 'Task';

const SENSITIVE_KEYS = new Set(['password', 'passwordHash', 'token', 'tokenHash', 'refreshToken']);

/** Removes sensitive keys and converts Dates so audit payloads are safe and JSON-friendly. */
function sanitize(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return JSON.parse(
    JSON.stringify(value, (key, v) => (SENSITIVE_KEYS.has(key) ? undefined : v)),
  ) as Prisma.InputJsonValue;
}

/** Returns only the fields that changed between two snapshots (shallow). */
export function diff<T extends Record<string, unknown>>(before: T, after: T) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    const a = before[key] instanceof Date ? (before[key] as Date).toISOString() : before[key];
    const b = after[key] instanceof Date ? (after[key] as Date).toISOString() : after[key];
    if (key !== 'updatedAt' && JSON.stringify(a) !== JSON.stringify(b)) {
      changes[key] = { from: a, to: b };
    }
  }
  return changes;
}

/**
 * Writes an audit log entry. Failures are logged but never break the user's request:
 * auditing is important, but not more important than the operation itself.
 */
export async function audit(
  ctx: AuditContext,
  action: AuditAction,
  entityType: AuditEntity,
  entityId: string | null,
  changes?: unknown,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: ctx.userId,
        action,
        entityType,
        entityId,
        changes: sanitize(changes),
        ip: ctx.ip ?? null,
      },
    });
  } catch (err) {
    logger.error({ err, action, entityType, entityId }, 'Failed to write audit log');
  }
}
