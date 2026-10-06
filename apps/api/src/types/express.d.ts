import type { UserRole } from '@biophonics/shared';

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. */
      user?: { id: string; role: UserRole };
      /** Parsed and validated input, set by the `validate` middleware. */
      validated?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}

export {};
