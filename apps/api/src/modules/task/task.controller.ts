import type { Request, Response } from 'express';
import { idParamSchema, taskCreateSchema, taskListQuerySchema, taskUpdateSchema } from '@biophonics/shared';
import { currentUserId } from '../../middleware/auth';
import { body, params, query } from '../../middleware/validate';
import * as taskService from './task.service';

export async function createTask(req: Request, res: Response) {
  const data = await taskService.createTask(currentUserId(req), body(req, taskCreateSchema), { ip: req.ip, userId: currentUserId(req) });
  res.status(201).json({ data });
}

export async function getTask(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  const data = await taskService.getTask(currentUserId(req), id);
  res.json({ data });
}

export async function updateTask(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  const data = await taskService.updateTask(currentUserId(req), id, body(req, taskUpdateSchema), { ip: req.ip, userId: currentUserId(req) });
  res.json({ data });
}

export async function deleteTask(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  await taskService.deleteTask(currentUserId(req), id, { ip: req.ip, userId: currentUserId(req) });
  res.status(204).end();
}

export async function listTasks(req: Request, res: Response) {
  const result = await taskService.listTasks(currentUserId(req), query(req, taskListQuerySchema));
  res.json(result);
}
