import type { Request, Response } from 'express';
import { AppError } from '../../lib/errors';
import { env } from '../../config/env';
import { sendDueTomorrowNotifications } from './notifications.service';

export async function dueTomorrow(req: Request, res: Response) {
  const secret = req.get('x-cron-secret');
  if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
    throw AppError.unauthorized('Invalid cron secret');
  }

  await sendDueTomorrowNotifications();
  res.status(200).json({ status: 'ok' });
}
