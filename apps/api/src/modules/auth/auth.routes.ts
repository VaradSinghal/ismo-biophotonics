import { Router } from 'express';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '@biophonics/shared';
import { authenticate } from '../../middleware/auth';
import type { createRateLimiters } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import * as controller from './auth.controller';

export function authRoutes(limiters: ReturnType<typeof createRateLimiters>) {
  const router = Router();

  router.post('/register', limiters.authSensitive, validate({ body: registerSchema }), controller.register);
  router.post('/login', limiters.login, validate({ body: loginSchema }), controller.login);
  router.post('/refresh', limiters.authSensitive, validate({ body: refreshSchema }), controller.refresh);
  // Logout works with just the refresh token so users can log out even after the access token expired.
  router.post('/logout', validate({ body: logoutSchema }), controller.logout);
  router.get('/me', authenticate, controller.me);

  return router;
}
