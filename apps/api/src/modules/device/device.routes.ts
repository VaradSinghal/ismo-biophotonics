import { Router } from 'express';
import { deviceRegisterSchema, deviceUnregisterSchema } from '@biophonics/shared';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './device.controller';

export function deviceRoutes(): Router {
  const router = Router();
  router.post('/', authenticate, validate({ body: deviceRegisterSchema }), controller.registerDevice);
  router.delete('/', validate({ body: deviceUnregisterSchema }), controller.unregisterDevice);
  return router;
}
