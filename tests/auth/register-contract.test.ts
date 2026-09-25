import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAccessToken } from '@/lib/api/api-client';
import { CodinAuthApi } from '@/lib/features/auth/api/auth.real';
import type { CurrentUser, RegisterInput } from '@/lib/features/auth/api/auth.types';

const user: CurrentUser = {
  id: 'user-1',
  authUserId: 'auth-user-1',
  email: 'kelvin@example.com',
  firstName: 'Kelvin',
  lastName: 'Kijazi',
  displayName: 'Kelvin Kijazi',
  status: 'active',
  timezone: 'Africa/Dar_es_Salaam',
  locale: 'en-TZ',
};

describe('CodinAuthApi registration contract', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.codin.co.tz');
    localStorage.clear();
    setAccessToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    localStorage.clear();
  });

  it('sends the backend registration fields and excludes form-only fields', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({
        user,
        session: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: 1_900_000_000,
        },
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const input = {
      firstName: 'Kelvin',
      lastName: 'Kijazi',
      displayName: 'Kelvin Kijazi',
      email: 'kelvin@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
      codinId: 'kelvin.kijazi',
    } as RegisterInput;

    const result = await new CodinAuthApi().register(input);

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      firstName: 'Kelvin',
      lastName: 'Kijazi',
      displayName: 'Kelvin Kijazi',
      email: 'kelvin@example.com',
      password: 'StrongPass123',
    });
    expect(result).toEqual({ success: true, user });
    expect(localStorage.getItem('codin_access_token')).toBe('access-token');
  });

  it('marks a registration without a session as pending email verification', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ user, session: null }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await new CodinAuthApi().register({
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email,
      password: 'StrongPass123',
    });

    expect(result).toEqual({ success: true, error: 'VERIFICATION_REQUIRED' });
    expect(localStorage.getItem('codin_access_token')).toBeNull();
  });
});
