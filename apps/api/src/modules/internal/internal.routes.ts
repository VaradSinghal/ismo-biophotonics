import { Router } from 'express';
import * as controller from './internal.controller';

export function internalRoutes() {
  const router = Router();
  router.post('/notifications/due-tomorrow', controller.dueTomorrow);
  return router;
}
