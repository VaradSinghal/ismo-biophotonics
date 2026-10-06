import { Router } from 'express';
import { auditLogListQuerySchema } from '@biophonics/shared';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './admin.controller';

export function adminRoutes(): Router {
  const router = Router();
  router.use(authenticate, requireRole('ADMIN'));
  router.get('/stats', controller.getStats);
  router.get('/audit-logs', validate({ query: auditLogListQuerySchema }), controller.listAuditLogs);
  return router;
}
