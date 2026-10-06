import type { Request } from 'express';
import rateLimit, { type Options } from 'express-rate-limit';
import type { ApiErrorBody } from '@biophonics/shared';

const WINDOW_MS = 15 * 60 * 1000;

const rateLimitedBody = (message: string): ApiErrorBody => ({
  error: { code: 'RATE_LIMITED', message },
});

const base = (enabled: boolean): Partial<Options> => ({
  windowMs: WINDOW_MS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => !enabled,
});

const normalizedEmail = (req: Request) =>
  typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

export function createRateLimiters(enabled: boolean) {
  return {
    /** 5 failed login attempts per 15 min per IP+email. Successful logins don't count. */
    login: rateLimit({
      ...base(enabled),
      limit: 5,
      skipSuccessfulRequests: true,
      keyGenerator: (req) => `${req.ip}|${normalizedEmail(req)}`,
      message: rateLimitedBody('Too many failed login attempts. Please try again in 15 minutes.'),
    }),
    /** Register / refresh: 20 requests per 15 min per IP. */
    authSensitive: rateLimit({
      ...base(enabled),
      limit: 20,
      message: rateLimitedBody('Too many requests. Please try again later.'),
    }),
    /** Lenient global limit for all API routes. */
    global: rateLimit({
      ...base(enabled),
      limit: 1000,
      message: rateLimitedBody('Too many requests. Please slow down.'),
    }),
  };
}
