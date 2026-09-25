import type { AuthApi, AuthResult, BootstrapInput, CurrentUser, LoginCredentials, RegisterInput } from './auth.types';
import { apiFetch, getAccessToken, setAccessToken } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';

export class CodinAuthApi implements AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: credentials,
      }) as { success: boolean; user?: CurrentUser; token?: string; error?: string };

      if (result.success && result.user) {
        if (result.token) {
          setAccessToken(result.token);
        }
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error ?? 'Login failed' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      const result = await apiFetch('/auth/register', {
        method: 'POST',
        body: {
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          email: input.email,
          password: input.password,
        },
      }) as {
        user?: CurrentUser;
        session?: { accessToken: string; refreshToken: string; expiresAt: number } | null;
        error?: string;
      };

      if (result.user && result.session) {
        setAccessToken(result.session.accessToken);
        return { success: true, user: result.user };
      }
      if (result.user && !result.session) {
        return { success: true, error: 'VERIFICATION_REQUIRED' };
      }
      return { success: false, error: result.error ?? 'Registration failed' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: msg };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Continue clearing local state regardless of server response
    }
    setAccessToken(null);
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    const token = getAccessToken();
    if (!token) return null;
    try {
      const result = await apiFetch('/me') as { user?: CurrentUser } | unknown;
      if (result && typeof result === 'object') {
        const obj = result as Record<string, unknown>;
        if (obj.user && typeof obj.user === 'object') {
          return obj.user as CurrentUser;
        }
      }
      return null;
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        if (err.status === 401) setAccessToken(null);
        return null;
      }
      throw err;
    }
  }

  async bootstrap(input: BootstrapInput): Promise<CurrentUser> {
    const result = await apiFetch('/auth/bootstrap', {
      method: 'POST',
      body: input,
    }) as { user: CurrentUser };
    return result.user;
  }

  async verifyEmail(user: CurrentUser, code: string): Promise<AuthResult> {
    try {
      const result = await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: { email: user.email, token: code },
      }) as { success: boolean; user?: CurrentUser; token?: string; error?: string };

      if (result.success && result.user) {
        if (result.token) {
          setAccessToken(result.token);
        }
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error ?? 'Verification failed' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      return { success: false, error: msg };
    }
  }

  async resendVerification(email: string): Promise<{ success: boolean }> {
    try {
      const result = await apiFetch('/auth/resend-verification', {
        method: 'POST',
        body: { email },
      }) as { success: boolean };
      return { success: result.success ?? false };
    } catch {
      return { success: false };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; email: string }> {
    try {
      const result = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      }) as { success: boolean; email: string };
      return { success: result.success ?? false, email: result.email ?? email };
    } catch {
      return { success: false, email };
    }
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean }> {
    try {
      const result = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      }) as { success: boolean };
      return { success: result.success ?? false };
    } catch {
      return { success: false };
    }
  }
}

export const codinAuthApi = new CodinAuthApi();
