import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '@/lib/api/api-client';

describe('apiFetch URL construction', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.codin.co.tz');
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ['/auth/register', 'https://api.codin.co.tz/api/v1/auth/register'],
    ['auth/register', 'https://api.codin.co.tz/api/v1/auth/register'],
  ])('resolves %s under the configured API prefix', async (path, expectedUrl) => {
    await apiFetch(path);

    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
  });

  it.each([
    ['/auth/register?foo=bar', 'https://api.codin.co.tz/api/v1/auth/register?foo=bar'],
    ['/auth/register?foo=bar#form', 'https://api.codin.co.tz/api/v1/auth/register?foo=bar#form'],
  ])('preserves query strings and fragments for %s', async (path, expectedUrl) => {
    await apiFetch(path);

    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
  });

  it('does not duplicate the API prefix when a path already includes it', async () => {
    await apiFetch('/api/v1/auth/register');

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.href).toBe('https://api.codin.co.tz/api/v1/auth/register');
    expect(requestUrl.pathname.match(/\/api\/v1/g)).toHaveLength(1);
  });

  it('keeps absolute URLs as explicit API base overrides', async () => {
    await apiFetch('https://uploads.example.com/files/1');

    expect(fetchMock).toHaveBeenCalledWith('https://uploads.example.com/files/1', expect.any(Object));
  });

  it.each([
    '/auth/register',
    '/auth/login',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/refresh',
    '/auth/logout',
    '/auth/bootstrap',
  ])('keeps %s under /api/v1 without duplicating the prefix', async (path) => {
    await apiFetch(path);

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestUrl.origin).toBe('https://api.codin.co.tz');
    expect(requestUrl.pathname).toBe(`/api/v1${path}`);
    expect(requestUrl.pathname.match(/\/api\/v1/g)).toHaveLength(1);
  });
});
