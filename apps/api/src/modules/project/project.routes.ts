import { Router } from 'express';
import { idParamSchema, projectCreateSchema, projectListQuerySchema, projectUpdateSchema } from '@biophonics/shared';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './project.controller';

export function projectRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.post('/', validate({ body: projectCreateSchema }), controller.createProject);
  router.get('/', validate({ query: projectListQuerySchema }), controller.listProjects);
  router.get('/:id', validate({ params: idParamSchema }), controller.getProject);
  router.put('/:id', validate({ params: idParamSchema, body: projectUpdateSchema }), controller.updateProject);
  router.delete('/:id', validate({ params: idParamSchema }), controller.deleteProject);

  return router;
}
