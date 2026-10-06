import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@biophonics/shared';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { zodIssuesToDetails } from './validate';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
};

function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return AppError.badRequest('Validation failed', zodIssuesToDetails(err));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return AppError.conflict('A record with this value already exists');
    if (err.code === 'P2025') return AppError.notFound();
    if (err.code === 'P2003') return AppError.badRequest('Related record does not exist');
  }

  // body-parser errors (malformed JSON, payload too large)
  if (typeof err === 'object' && err !== null && 'type' in err) {
    const type = (err as { type?: string }).type;
    if (type === 'entity.parse.failed') return AppError.badRequest('Malformed JSON body');
    if (type === 'entity.too.large') return new AppError(413, 'VALIDATION_ERROR', 'Request body too large');
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again later.');
}

/**
 * Central error handler. Maps known errors to the standard envelope and logs
 * unexpected ones. Internal details/stack traces are never sent to clients.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = toAppError(err);

  if (appError.status >= 500) {
    req.log?.error({ err }, 'Unhandled error');
  } else {
    req.log?.debug({ code: appError.code, status: appError.status }, appError.message);
  }

  const body: ApiErrorBody = {
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      requestId: String(req.id ?? ''),
    },
  };

  if (!env.isProd && appError.status >= 500 && err instanceof Error) {
    (body.error as Record<string, unknown>).debug = err.message;
  }

  res.status(appError.status).json(body);
};
