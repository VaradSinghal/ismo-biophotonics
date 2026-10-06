import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured JSON logger. Secrets are redacted at the logger level so they can't
 * leak through request logging or accidental `logger.info(req.body)` calls.
 */
export const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  base: { service: 'pms-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-cron-secret"]',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.refreshToken',
      '*.accessToken',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  ...(env.isProd || env.isTest
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }),
});
