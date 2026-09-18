import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockAuthApi } from '@/lib/features/auth/api/auth.mock';
import { CodinAuthApi } from '@/lib/features/auth/api/auth.real';
import { getAuthApi, resetAuthApi, setAuthApi } from '@/lib/features/auth/api/auth.client';
import { getAccessToken, setAccessToken } from '@/lib/api/supabase-client';
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

  describe('API Mode Switching', () => {
    it('returns MockAuthApi by default when mode is not set or is mock', async () => {
      process.env.NEXT_PUBLIC_API_MODE = 'mock';
      const api = await getAuthApi();
      expect(api).toBeInstanceOf(MockAuthApi);
    });

    it('returns CodinAuthApi when mode is set to real', async () => {
      process.env.NEXT_PUBLIC_API_MODE = 'real';
      resetAuthApi();
      const api = await getAuthApi();
      expect(api).toBeInstanceOf(CodinAuthApi);
    });

    it('allows manual override via setAuthApi', async () => {
      const customApi = new MockAuthApi();
      setAuthApi(customApi);
      const api = await getAuthApi();
      expect(api).toBe(customApi);
    });
  });

  describe('MockAuthApi Operations', () => {
    it('handles successful login with demo credentials', async () => {
      const api = new MockAuthApi();
      const result = await api.login({ email: 'kelvin@example.com', password: 'password123' });
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('kelvin@example.com');
    });

    it('rejects login with invalid credentials', async () => {
      const api = new MockAuthApi();
      const result = await api.login({ email: 'unknown@example.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles registration flow and verification simulation', async () => {
      const api = new MockAuthApi();
      const result = await api.register({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      });
      expect(result.success).toBe(true);
      expect(result.error).toBe('VERIFICATION_REQUIRED');
      expect(api.verificationCode).toBeDefined();

      const verifyResult = await api.verifyEmail(
        {
          id: 'usr_new',
          email: 'newuser@example.com',
          name: 'New User',
          displayName: 'New User',
          firstName: 'New',
          lastName: 'User',
          status: 'pending',
          timezone: 'UTC',
          locale: 'en',
          authUserId: 'auth_usr_new',
        },
        api.verificationCode!
      );
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.user?.email).toBe('newuser@example.com');
    });

    it('clears session on logout', async () => {
      const api = new MockAuthApi();
      await api.login({ email: 'kelvin@example.com', password: 'password123' });
      await api.logout();
      const currentUser = await api.getCurrentUser();
      expect(currentUser).toBeNull();
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
