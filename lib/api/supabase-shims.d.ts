declare module '@supabase/supabase-js' {
  export interface Session {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: any;
  }

  export interface User {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface AuthError {
    message: string;
    status?: number;
  }

  export interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    };
    error: AuthError | null;
  }

  export interface SignUpOptions {
    email: string;
    password: string;
    options?: {
      data?: Record<string, unknown>;
    };
  }

  export interface SignInOptions {
    email: string;
    password: string;
  }

  export interface VerifyOtpOptions {
    email: string;
    token: string;
    type: string;
  }

  export interface ResendOptions {
    email: string;
    type: string;
  }

  export interface ResetPasswordOptions {
    email: string;
  }

  export interface UpdateUserOptions {
    password?: string;
    email?: string;
    data?: Record<string, unknown>;
  }

  export interface SupabaseClient {
    auth: {
      signInWithPassword(credentials: SignInOptions): Promise<AuthResponse>;
      signUp(params: SignUpOptions): Promise<AuthResponse>;
      signOut(): Promise<{ error: AuthError | null }>;
      verifyOtp(params: VerifyOtpOptions): Promise<AuthResponse>;
      resend(params: ResendOptions): Promise<{ error: AuthError | null }>;
      resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }>;
      updateUser(params: UpdateUserOptions): Promise<{ error: AuthError | null }>;
      getUser(): Promise<{ data: { user: User | null }; error: AuthError | null }>;
      getSession(): Promise<{ data: { session: Session | null }; error: AuthError | null }>;
    };
  }

  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      storageKey?: string;
      storage?: any;
      flowType?: 'implicit' | 'pkce';
    };
  }

  export function createClient(
    url: string,
    key: string,
    options?: SupabaseClientOptions,
  ): SupabaseClient;
}
