import { Router } from 'express';
import { idParamSchema, taskCreateSchema, taskListQuerySchema, taskUpdateSchema } from '@biophonics/shared';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as controller from './task.controller';

export function taskRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.post('/', validate({ body: taskCreateSchema }), controller.createTask);
  router.get('/', validate({ query: taskListQuerySchema }), controller.listTasks);
  router.get('/:id', validate({ params: idParamSchema }), controller.getTask);
  router.put('/:id', validate({ params: idParamSchema, body: taskUpdateSchema }), controller.updateTask);
  router.delete('/:id', validate({ params: idParamSchema }), controller.deleteTask);

  return router;
}
