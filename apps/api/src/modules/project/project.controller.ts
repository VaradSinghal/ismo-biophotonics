import type { Request, Response } from 'express';
import { idParamSchema, projectCreateSchema, projectListQuerySchema, projectUpdateSchema } from '@biophonics/shared';
import { currentUserId } from '../../middleware/auth';
import { body, params, query } from '../../middleware/validate';
import * as projectService from './project.service';

export async function createProject(req: Request, res: Response) {
  const data = await projectService.createProject(currentUserId(req), body(req, projectCreateSchema), { ip: req.ip, userId: currentUserId(req) });
  res.status(201).json({ data });
}

export async function getProject(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  const data = await projectService.getProject(currentUserId(req), id);
  res.json({ data });
}

export async function updateProject(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  const data = await projectService.updateProject(currentUserId(req), id, body(req, projectUpdateSchema), { ip: req.ip, userId: currentUserId(req) });
  res.json({ data });
}

export async function deleteProject(req: Request, res: Response) {
  const { id } = params(req, idParamSchema);
  await projectService.deleteProject(currentUserId(req), id, { ip: req.ip, userId: currentUserId(req) });
  res.status(204).end();
}

export async function listProjects(req: Request, res: Response) {
  const result = await projectService.listProjects(currentUserId(req), query(req, projectListQuerySchema));
  res.json(result);
}
