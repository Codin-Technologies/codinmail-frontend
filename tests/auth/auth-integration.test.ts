import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodinAuthApi } from '@/lib/features/auth/api/auth.real';
import { getAuthApi, resetAuthApi, setAuthApi } from '@/lib/features/auth/api/auth.client';
import { getAccessToken, setAccessToken } from '@/lib/api/api-client';
import { apiFetch } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    setAccessToken(null);
    resetAuthApi();
    delete process.env.NEXT_PUBLIC_API_MODE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Centralization', () => {
    it('sets and retrieves the access token from storage', () => {
      expect(getAccessToken()).toBeNull();
      setAccessToken('test-token-xyz');
      expect(getAccessToken()).toBe('test-token-xyz');
      expect(localStorage.getItem('codin_access_token')).toBe('test-token-xyz');

      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
      expect(localStorage.getItem('codin_access_token')).toBeNull();
    });
  });

  describe('Auth API', () => {
    it('returns CodinAuthApi from getAuthApi', async () => {
      const api = await getAuthApi();
      expect(api).toBeInstanceOf(CodinAuthApi);
    });

    it('allows manual override via setAuthApi', async () => {
      const customApi = new CodinAuthApi();
      setAuthApi(customApi);
      const api = await getAuthApi();
      expect(api).toBe(customApi);
    });
  });

  describe('CodinAuthApi Session & 401 Handling', () => {
    it('purges token and returns null when getCurrentUser receives 401', async () => {
      setAccessToken('expired-token');
      const api = new CodinAuthApi();

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const user = await api.getCurrentUser();
      expect(user).toBeNull();
      expect(getAccessToken()).toBeNull();
    });

    it('returns user when getCurrentUser succeeds with valid session', async () => {
      setAccessToken('valid-token');
      const api = new CodinAuthApi();

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: {
              id: 'usr_123',
              email: 'active@example.com',
              name: 'Active User',
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );

      const user = await api.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe('active@example.com');
      expect(getAccessToken()).toBe('valid-token');
    });
  });
});
