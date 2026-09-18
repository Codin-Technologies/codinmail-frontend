import { ApiError, isApiErrorResponse } from './api-errors';
import { getApiUrl } from './config';
import { getAccessToken } from './supabase-client';

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
  const url = new URL(basePath, getApiUrl());

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
