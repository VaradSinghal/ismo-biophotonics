import type { Request, Response } from 'express';
import { currentUserId } from '../../middleware/auth';
import * as dashboardService from './dashboard.service';

export async function getDashboard(req: Request, res: Response) {
  const data = await dashboardService.getDashboardStats(currentUserId(req));
  res.json({ data });
}
