import type { CookieOptions, Request, Response } from 'express';
import { loginSchema, refreshSchema, registerSchema, type AuthResponse } from '@biophonics/shared';
import { env } from '../../config/env';
import { currentUserId } from '../../middleware/auth';
import { body } from '../../middleware/validate';
import * as authService from './auth.service';

export const REFRESH_COOKIE = 'pms_rt';

const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.COOKIE_SAMESITE,
  path: '/api/auth',
});

/** Mobile clients identify themselves and receive the refresh token in the body. */
const isMobileClient = (req: Request) => req.get('x-client')?.toLowerCase() === 'mobile';

const readRefreshToken = (req: Request): string | undefined =>
  isMobileClient(req)
    ? body(req, refreshSchema)?.refreshToken
    : (req.cookies?.[REFRESH_COOKIE] as string | undefined);

/** Sends the session: cookie for web, body for mobile. */
function sendSession(req: Request, res: Response, session: authService.IssuedSession, status = 200) {
  const payload: AuthResponse = {
    user: session.user,
    accessToken: session.accessToken,
    expiresIn: session.expiresIn,
  };

  if (isMobileClient(req)) {
    payload.refreshToken = session.refreshToken;
  } else {
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      ...cookieOptions(),
      expires: session.refreshExpiresAt,
    });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json({ data: payload });
}

export async function register(req: Request, res: Response) {
  const session = await authService.register(body(req, registerSchema), { ip: req.ip });
  sendSession(req, res, session, 201);
}

export async function login(req: Request, res: Response) {
  const session = await authService.login(body(req, loginSchema), { ip: req.ip });
  sendSession(req, res, session);
}

export async function refresh(req: Request, res: Response) {
  try {
    const session = await authService.refresh(readRefreshToken(req));
    sendSession(req, res, session);
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(readRefreshToken(req), { ip: req.ip });
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  res.json({ data: await authService.me(currentUserId(req)) });
}
