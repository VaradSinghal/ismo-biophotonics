import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodTypeAny, z } from 'zod';
import { AppError } from '../lib/errors';

type Schemas = { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny };

export const zodIssuesToDetails = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));

/**
 * Validates body/query/params against Zod schemas. Parsed (trimmed, coerced, defaulted)
 * values are stored on `req.validated`; raw input is never passed to the data layer.
 */
export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    const validated: NonNullable<Request['validated']> = {};
    const details: { field: string; message: string }[] = [];

    for (const key of ['params', 'query', 'body'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(key === 'body' ? (req.body ?? {}) : req[key]);
      if (result.success) {
        validated[key] = result.data;
      } else {
        details.push(
          ...zodIssuesToDetails(result.error).map((d) => ({
            ...d,
            field: key === 'body' ? d.field : `${key}.${d.field}`,
          })),
        );
      }
    }

    if (details.length > 0) {
      return next(AppError.badRequest('Request validation failed', details));
    }
    req.validated = validated;
    next();
  };

/** Typed accessors for validated input inside controllers. */
export const body = <S extends ZodTypeAny>(req: Request, _schema: S) =>
  req.validated?.body as z.infer<S>;
export const query = <S extends ZodTypeAny>(req: Request, _schema: S) =>
  req.validated?.query as z.infer<S>;
export const params = <S extends ZodTypeAny>(req: Request, _schema: S) =>
  req.validated?.params as z.infer<S>;
