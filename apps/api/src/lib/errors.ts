import type { ErrorCode } from '@biophonics/shared';

export interface ErrorDetail {
  field: string;
  message: string;
}

/** Operational error with an HTTP status and a stable machine-readable code. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: ErrorDetail[]) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }
  static unauthorized(message = 'Authentication required', code: ErrorCode = 'UNAUTHORIZED') {
    return new AppError(401, code, message);
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(403, 'FORBIDDEN', message);
  }
  static notFound(resource = 'Resource') {
    return new AppError(404, 'NOT_FOUND', `${resource} not found`);
  }
  static conflict(message: string, details?: ErrorDetail[]) {
    return new AppError(409, 'CONFLICT', message, details);
  }
}
