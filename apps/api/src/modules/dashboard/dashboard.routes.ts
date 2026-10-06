import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as controller from './dashboard.controller';

export function dashboardRoutes() {
  const router = Router();
  router.use(authenticate);
  router.get('/', controller.getDashboard);
  return router;
}
