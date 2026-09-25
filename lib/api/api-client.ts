import { ApiError, isApiErrorResponse } from './api-errors';
import { getApiUrl } from './config';

let cachedAccessToken: string | null = null;

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (cachedAccessToken !== null) return cachedAccessToken;
  try {
    // 1. Check for backend-issued session token
    const backendToken = localStorage.getItem('codin_access_token');
    if (backendToken) return backendToken;

    // 2. Check for Supabase browser client session (persisted by @supabase/supabase-js under 'codin_auth')
    const sbAuthRaw = localStorage.getItem('codin_auth');
    if (sbAuthRaw) {
      try {
        const parsed = JSON.parse(sbAuthRaw);
        if (typeof parsed?.access_token === 'string') {
          return parsed.access_token;
        }
        if (typeof parsed?.currentSession?.access_token === 'string') {
          return parsed.currentSession.access_token;
        }
      } catch {}
    }

    return null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  cachedAccessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token === null) {
      localStorage.removeItem('codin_access_token');
    } else {
      localStorage.setItem('codin_access_token', token);
    }
  } catch {}
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  workspaceId?: string;
}

export interface ApiResponseWrapper {
  ok: boolean;
  status: number;
  data: unknown;
  error?: { code: string; message: string; details?: Record<string, unknown> };
}

export async function apiFetch(
  basePath: string,
  options: RequestOptions = {}
): Promise<unknown> {
  const { method = 'GET', body, params, signal, workspaceId } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(basePath, params, workspaceId);

  const response = await fetch(url, {
    method,
    headers,
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: unknown = undefined;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }

    if (isApiErrorResponse(errorBody)) {
      throw new ApiError(
        errorBody.error.code,
        errorBody.error.message,
        response.status,
        errorBody.error.details
      );
    }

    throw new ApiError(
      `HTTP_${response.status}`,
      `Request failed with status ${response.status}`,
      response.status,
      { raw: errorBody }
    );
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildUrl(basePath: string, params?: Record<string, string | number | boolean>, workspaceId?: string): string {
  const apiUrl = new URL(getApiUrl());
  const basePathname = apiUrl.pathname.replace(/\/+$/, '');
  const normalizedPath = basePath.replace(/^\/+/, '');
  const normalizedBasePath = basePathname.replace(/^\/+/, '');
  const isAbsoluteUrl = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(basePath) || basePath.startsWith('//');
  const pathIncludesBase = normalizedBasePath.length > 0 && (
    normalizedPath === normalizedBasePath ||
    normalizedPath.startsWith(`${normalizedBasePath}/`) ||
    normalizedPath.startsWith(`${normalizedBasePath}?`) ||
    normalizedPath.startsWith(`${normalizedBasePath}#`)
  );

  // Keep absolute URLs as explicit overrides; treat relative paths as belonging to the API prefix.
  const url = isAbsoluteUrl
    ? new URL(basePath, apiUrl)
    : pathIncludesBase
      ? new URL(`/${normalizedPath}`, apiUrl.origin)
      : new URL(normalizedPath, `${apiUrl.origin}${basePathname}/`);

  if (workspaceId && !basePath.includes(workspaceId)) {
    url.searchParams.append('workspaceId', workspaceId);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}
