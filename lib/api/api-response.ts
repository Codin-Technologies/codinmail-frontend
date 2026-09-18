export interface ApiResponse<T = unknown> {
  data: T;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  if (typeof obj !== 'object' || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  if (typeof rec.error !== 'object' || rec.error === null) return false;
  const err = rec.error as Record<string, unknown>;
  return typeof err.code === 'string' && typeof err.message === 'string';
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
