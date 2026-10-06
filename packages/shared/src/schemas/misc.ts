import { z } from 'zod';
import { AUDIT_ACTIONS } from '../enums';
import { emptyToUndefined, paginationQuerySchema } from './common';

/** FCM device registration from the mobile app. */
export const deviceRegisterSchema = z.object({
  token: z.string().trim().min(10, 'Invalid device token').max(4096),
  platform: z.enum(['android', 'ios']).default('android'),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, 'Must be a valid IANA timezone (e.g. Asia/Kolkata)'),
});

export const deviceUnregisterSchema = z.object({
  token: z.string().trim().min(10).max(4096),
});

export const auditLogListQuerySchema = paginationQuerySchema.extend({
  action: emptyToUndefined(z.enum(AUDIT_ACTIONS)),
  entityType: emptyToUndefined(z.enum(['User', 'Project', 'Task'])),
});

export type DeviceRegisterInput = z.infer<typeof deviceRegisterSchema>;
export type AuditLogListQuery = z.infer<typeof auditLogListQuerySchema>;
