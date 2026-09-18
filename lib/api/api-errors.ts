export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof ApiError;

export function isApiErrorResponse(err: unknown): err is { error: { code: string; message: string; details?: Record<string, unknown> } } {
  if (typeof err !== 'object' || err === null) return false;
  const rec = err as Record<string, unknown>;
  const error = rec.error;
  if (typeof error !== 'object' || error === null) return false;
  const errorObj = error as Record<string, unknown>;
  return typeof errorObj.code === 'string' && typeof errorObj.message === 'string';
}

export function isNotFoundError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 404;
  return false;
}

export function isUnauthorizedError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 401;
  return false;
}

export function isForbiddenError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 403;
  return false;
}

export function isConflictError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 409;
  return false;
}

export function isValidationError(err: unknown): boolean {
  if (isApiError(err)) return err.status === 422 || err.status === 400;
  return false;
}
