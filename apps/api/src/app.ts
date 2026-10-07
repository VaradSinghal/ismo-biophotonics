import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './lib/logger';
import { createRateLimiters } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import { authRoutes } from './modules/auth/auth.routes';
import { projectRoutes } from './modules/project/project.routes';
import { taskRoutes } from './modules/task/task.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { deviceRoutes } from './modules/device/device.routes';
import { internalRoutes } from './modules/internal/internal.routes';
import { setupOpenAPI } from './config/openapi';
import { initFirebaseAdmin } from './config/firebase';
import { initCronJobs } from './cron/notification.cron';

initFirebaseAdmin();
initCronJobs();

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  
  if (!env.isTest) {
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  }

  const limiters = createRateLimiters(env.RATE_LIMIT_ENABLED);

  app.get('/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

  app.use('/api/auth', authRoutes(limiters));
  app.use('/api/projects', limiters.global, projectRoutes());
  app.use('/api/tasks', limiters.global, taskRoutes());
  app.use('/api/dashboard', limiters.global, dashboardRoutes());
  app.use('/api/admin', limiters.global, adminRoutes());
  app.use('/api/devices', limiters.global, deviceRoutes());
  app.use('/api/internal', internalRoutes()); // Internal sets its own limits/auth

  setupOpenAPI(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
