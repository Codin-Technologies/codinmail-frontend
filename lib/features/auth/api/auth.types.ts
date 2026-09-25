export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'pending_verification';

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  status: string;
  timezone: string;
  locale: string;
  avatarUrl?: string | null;
  authUserId: string;
  name?: string;
  codinId?: string;
  emailVerified?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
}

export interface BootstrapInput {
  firstName: string;
  lastName: string;
  displayName: string;
  timezone?: string;
  locale?: string;
}

export interface AuthResult {
  success: boolean;
  user?: CurrentUser;
  error?: string;
  requiresVerification?: boolean;
}

export interface AuthSession {
  user: CurrentUser;
  accessToken: string;
}

export interface AuthApi {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(input: RegisterInput): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<CurrentUser | null>;
  bootstrap(input: BootstrapInput): Promise<CurrentUser>;
  verifyEmail(user: CurrentUser, code: string): Promise<AuthResult>;
  resendVerification(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }>;
  forgotPassword(email: string): Promise<{ success: boolean; email: string }>;
  resetPassword(token: string, password: string): Promise<{ success: boolean }>;
  verificationCode?: string;
}
