import type { AuthApi, AuthResult, BootstrapInput, CurrentUser, LoginCredentials, RegisterInput } from './auth.types';
import { apiFetch } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';
import { getSupabaseClient, getAccessToken, setAccessToken } from '@/lib/api/supabase-client';

export class CodinAuthApi implements AuthApi {
  verificationCode?: string;

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await (supabase as any).auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user || !data.session) {
      return { success: false, error: error?.message ?? 'Login failed' };
    }

    setAccessToken(data.session.access_token);

    const me = await this.getCurrentUser();
    if (!me) {
      const user = await this.bootstrap({
        firstName: data.user.user_metadata?.first_name ?? credentials.email.split('@')[0],
        lastName: data.user.user_metadata?.last_name ?? '',
        displayName: data.user.user_metadata?.full_name ?? credentials.email.split('@')[0],
      });
      return { success: true, user };
    }

    return { success: true, user: me };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await (supabase as any).auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName ?? input.name?.split(' ')[0] ?? '',
          last_name: input.lastName ?? input.name?.split(' ').slice(1).join(' ') ?? '',
          full_name: input.displayName ?? input.name ?? input.email.split('@')[0],
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user && !data.session) {
      return { success: true, error: 'VERIFICATION_REQUIRED' };
    }

    if (data.session) {
      setAccessToken(data.session.access_token);
      const user = await this.getCurrentUser();
      if (!user) {
        const bootstrapped = await this.bootstrap({
          firstName: input.firstName ?? input.name?.split(' ')[0] ?? '',
          lastName: input.lastName ?? '',
          displayName: input.displayName ?? input.name ?? input.email.split('@')[0],
        });
        return { success: true, user: bootstrapped };
      }
      return { success: true, user };
    }

    return { success: true };
  }

  async logout(): Promise<void> {
    const supabase = await getSupabaseClient();
    if (supabase) {
      await (supabase as any).auth.signOut();
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
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await (supabase as any).auth.verifyOtp({
      email: user.email,
      token: code,
      type: 'email',
    });

    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Invalid verification code' };
    }

    if (data.session) {
      setAccessToken(data.session.access_token);
    }

    const updatedUser = await this.getCurrentUser();
    return { success: !!updatedUser, user: updatedUser ?? undefined };
  }

  async resendVerification(email: string): Promise<{ success: boolean }> {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { error } = await (supabase as any).auth.resend({
      email,
      type: 'signup',
    });

    return { success: !error };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; email: string }> {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { error } = await (supabase as any).auth.resetPasswordForEmail(email);
    return { success: !error, email };
  }

  async resetPassword(_token: string, password: string): Promise<{ success: boolean }> {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { error } = await (supabase as any).auth.updateUser({
      password: password,
    });

    return { success: !error };
  }
}

export const codinAuthApi = new CodinAuthApi();
