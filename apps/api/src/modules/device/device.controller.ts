import type { Request, Response } from 'express';
import { deviceRegisterSchema, deviceUnregisterSchema } from '@biophonics/shared';
import { currentUserId } from '../../middleware/auth';
import { body } from '../../middleware/validate';
import * as deviceService from './device.service';

export async function registerDevice(req: Request, res: Response) {
  await deviceService.registerDevice(currentUserId(req), body(req, deviceRegisterSchema));
  res.status(204).end();
}

export async function unregisterDevice(req: Request, res: Response) {
  // Can be called anonymously or authenticated (e.g. at logout)
  await deviceService.unregisterDevice(body(req, deviceUnregisterSchema).token);
  res.status(204).end();
}
