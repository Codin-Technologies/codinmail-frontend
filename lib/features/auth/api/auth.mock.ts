import type { AuthApi, AuthResult, BootstrapInput, CurrentUser, LoginCredentials, RegisterInput } from './auth.types';

const wait = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoUser: CurrentUser = {
  id: 'usr_demo_001',
  email: 'kelvin@example.com',
  displayName: 'Kelvin Kijazi',
  firstName: 'Kelvin',
  lastName: 'Kijazi',
  status: 'active',
  timezone: 'Africa/Nairobi',
  locale: 'en-US',
  authUserId: 'auth_demo_001',
};

export class MockAuthApi implements AuthApi {
  verificationCode?: string;
  private _currentUser: CurrentUser | null = null;
  private _pendingVerification: { email: string; code: string } | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await wait();
    if (!credentials.email || credentials.password.length < 6) {
      return { success: false, error: 'Enter a valid email and password.' };
    }
    if (credentials.email.toLowerCase() === 'suspended@example.com') {
      return { success: false, error: 'This account is suspended. Contact your administrator.' };
    }
    if (credentials.email.toLowerCase() === 'unverified@example.com') {
      return { success: false, error: 'Please verify your email before signing in.' };
    }
    const user: CurrentUser =
      credentials.email.toLowerCase() === demoUser.email
        ? demoUser
        : {
            ...demoUser,
            id: `usr_${Date.now()}`,
            email: credentials.email.toLowerCase(),
            displayName: credentials.email.split('@')[0],
            firstName: credentials.email.split('@')[0],
            lastName: '',
          };
    this._currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('codin_access_token', `mock_token_${user.id}`);
    }
    return { success: true, user };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    await wait();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user: CurrentUser = {
      id: `usr_${Date.now()}`,
      email: input.email.toLowerCase(),
      displayName: input.displayName ?? `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim(),
      firstName: input.firstName ?? input.name?.split(' ')[0] ?? '',
      lastName: input.lastName ?? input.name?.split(' ').slice(1).join(' ') ?? '',
      status: 'active',
      timezone: 'UTC',
      locale: 'en-US',
      authUserId: `auth_${Date.now()}`,
    };
    this._currentUser = user;
    this.verificationCode = verificationCode;
    this._pendingVerification = { email: input.email.toLowerCase(), code: verificationCode };
    if (typeof window !== 'undefined') {
      localStorage.setItem('codin_access_token', `mock_token_${user.id}`);
    }
    return { success: true, user, error: 'VERIFICATION_REQUIRED' };
  }

  async logout(): Promise<void> {
    await wait(180);
    this._currentUser = null;
    this._pendingVerification = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('codin_access_token');
    }
  }

  async getCurrentUser(): Promise<CurrentUser | null> {
    await wait(180);
    if (typeof window === 'undefined') {
      return null;
    }
    const token = localStorage.getItem('codin_access_token');
    if (!token || !this._currentUser) {
      this._currentUser = null;
      localStorage.removeItem('codin_access_token');
      return null;
    }
    return this._currentUser;
  }

  async bootstrap(input: BootstrapInput): Promise<CurrentUser> {
    await wait(300);
    const user: CurrentUser = {
      id: `usr_${Date.now()}`,
      email: (this._currentUser?.email) ?? 'user@example.com',
      displayName: input.displayName,
      firstName: input.firstName,
      lastName: input.lastName,
      status: 'active',
      timezone: input.timezone ?? 'UTC',
      locale: input.locale ?? 'en-US',
      authUserId: `auth_${Date.now()}`,
    };
    this._currentUser = user;
    return user;
  }

  async verifyEmail(user: CurrentUser, code: string): Promise<AuthResult> {
    await wait(250);
    if (this._pendingVerification && code !== this._pendingVerification.code) {
      return { success: false, error: 'Invalid verification code.' };
    }
    if (!code || code === 'wrong') {
      return { success: false, error: 'Invalid verification code.' };
    }
    this._currentUser = { ...user, status: 'active' };
    this._pendingVerification = null;
    return { success: true, user: this._currentUser };
  }

  async resendVerification(_email: string): Promise<{ success: boolean }> {
    await wait(300);
    return { success: true };
  }

  async forgotPassword(email: string): Promise<{ success: boolean; email: string }> {
    await wait(450);
    return { success: true, email };
  }

  async resetPassword(_token: string, _password: string): Promise<{ success: boolean }> {
    await wait(450);
    return { success: true };
  }
}

export const mockAuthApi = new MockAuthApi();
