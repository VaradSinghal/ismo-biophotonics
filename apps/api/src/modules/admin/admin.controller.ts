import type { Request, Response } from 'express';
import { auditLogListQuerySchema } from '@biophonics/shared';
import { query } from '../../middleware/validate';
import * as adminService from './admin.service';

export async function getStats(_req: Request, res: Response) {
  const data = await adminService.getStats();
  res.json({ data });
}

export async function listAuditLogs(req: Request, res: Response) {
  const result = await adminService.listAuditLogs(query(req, auditLogListQuerySchema));
  res.json(result);
}
