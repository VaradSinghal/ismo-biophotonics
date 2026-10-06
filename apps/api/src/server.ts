import { env } from './config/env';
import { logger } from './lib/logger';
import { createApp } from './app';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening at http://localhost:${env.PORT}`);
  if (!env.isProd) {
    logger.info(`Swagger docs available at http://localhost:${env.PORT}/api/docs`);
  }
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
