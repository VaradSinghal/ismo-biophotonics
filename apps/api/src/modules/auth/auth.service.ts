import crypto from 'node:crypto';
import type { AuthResponse, LoginInput, PublicUser, RegisterInput } from '@biophonics/shared';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '../../lib/password';
import { prisma } from '../../lib/prisma';
import { publicUserSelect, serializeUser } from '../../lib/serializers';
import { generateRefreshToken, hashToken, signAccessToken } from '../../lib/tokens';
import { audit, type AuditContext } from '../audit/audit.service';

/** A rotated token presented again within this window is treated as a benign race (e.g. two tabs). */
const REUSE_GRACE_MS = 30_000;

export interface IssuedSession extends AuthResponse {
  refreshToken: string;
  refreshExpiresAt: Date;
}

const sessionExpired = () =>
  AppError.unauthorized('Your session has expired. Please log in again.', 'SESSION_EXPIRED');

async function issueSession(user: PublicUser, familyId: string = crypto.randomUUID()): Promise<IssuedSession> {
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), familyId, expiresAt: refreshExpiresAt },
  });

  return {
    user,
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshToken,
    refreshExpiresAt,
  };
}

export async function register(input: RegisterInput, ctx: Omit<AuditContext, 'userId'>) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists', [
      { field: 'email', message: 'An account with this email already exists' },
    ]);
  }

  const user = await prisma.user.create({
    data: { fullName: input.fullName, email: input.email, passwordHash: await hashPassword(input.password) },
    select: publicUserSelect,
  });

  await audit({ userId: user.id, ip: ctx.ip }, 'CREATE', 'User', user.id, {
    fullName: user.fullName,
    email: user.email,
  });

  return issueSession(serializeUser(user));
}

export async function login(input: LoginInput, ctx: Omit<AuditContext, 'userId'>) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...publicUserSelect, passwordHash: true },
  });

  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const valid = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  await audit({ userId: user.id, ip: ctx.ip }, 'LOGIN', 'User', user.id);

  const { passwordHash: _omit, ...publicFields } = user;
  return issueSession(serializeUser(publicFields));
}

/**
 * Rotates a refresh token. Presenting a token that was already rotated (outside the
 * grace window) is treated as theft: the entire token family is revoked.
 */
export async function refresh(rawToken: string | undefined) {
  if (!rawToken) throw sessionExpired();

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: { select: publicUserSelect } },
  });
  if (!stored) throw sessionExpired();

  if (stored.revokedAt) {
    if (Date.now() - stored.revokedAt.getTime() > REUSE_GRACE_MS) {
      await prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw sessionExpired();
  }

  if (stored.expiresAt.getTime() <= Date.now()) throw sessionExpired();

  // Atomic claim: only one concurrent request can rotate this token.
  const claimed = await prisma.refreshToken.updateMany({
    where: { id: stored.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (claimed.count === 0) throw sessionExpired();

  return issueSession(serializeUser(stored.user), stored.familyId);
}

export async function logout(rawToken: string | undefined, ctx: Omit<AuditContext, 'userId'>) {
  if (!rawToken) return;
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    select: { id: true, userId: true, familyId: true },
  });
  if (!stored) return;

  // Revoke the whole family: this device's session chain ends here.
  await prisma.refreshToken.updateMany({
    where: { familyId: stored.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await audit({ userId: stored.userId, ip: ctx.ip }, 'LOGOUT', 'User', stored.userId);
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw AppError.unauthorized('Account no longer exists');
  return serializeUser(user);
}
