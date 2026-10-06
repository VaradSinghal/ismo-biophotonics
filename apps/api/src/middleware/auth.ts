import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@biophonics/shared';
import { AppError } from '../lib/errors';
import { verifyAccessToken } from '../lib/tokens';

/**
 * Requires a valid `Authorization: Bearer <accessToken>` header.
 * Expired tokens return `TOKEN_EXPIRED` so clients know to try a refresh.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized());
  }

  const result = verifyAccessToken(header.slice('Bearer '.length).trim());
  if (!result.ok) {
    return next(
      result.reason === 'expired'
        ? AppError.unauthorized('Access token expired', 'TOKEN_EXPIRED')
        : AppError.unauthorized('Invalid access token'),
    );
  }

  req.user = { id: result.payload.sub, role: result.payload.role };
  next();
}

/** Role guard; must run after `authenticate`. */
export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };

/** Returns the authenticated user id or throws (for use in controllers behind `authenticate`). */
export function currentUserId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}
