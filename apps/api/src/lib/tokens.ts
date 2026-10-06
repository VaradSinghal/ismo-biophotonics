import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@biophonics/shared';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

const JWT_ISSUER = 'pms-api';
const JWT_AUDIENCE = 'pms-clients';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign({ role: payload.role }, env.JWT_ACCESS_SECRET, {
    subject: payload.sub,
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: 'HS256',
  });
}

export type VerifyResult =
  | { ok: true; payload: AccessTokenPayload }
  | { ok: false; reason: 'expired' | 'invalid' };

export function verifyAccessToken(token: string): VerifyResult {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'], // pin algorithm: prevents "alg: none" / algorithm confusion
    });
    if (typeof decoded === 'string' || !decoded.sub) return { ok: false, reason: 'invalid' };
    const role = decoded.role === 'ADMIN' ? 'ADMIN' : 'USER';
    return { ok: true, payload: { sub: decoded.sub, role } };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) return { ok: false, reason: 'expired' };
    return { ok: false, reason: 'invalid' };
  }
}

/** 256-bit opaque refresh token (base64url). */
export const generateRefreshToken = () => crypto.randomBytes(32).toString('base64url');

/** Only the SHA-256 hash is persisted, so a DB leak doesn't expose usable tokens. */
export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
