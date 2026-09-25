import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyEmailPage from '@/app/verify-email/page';
import { getVerificationRedirectUrl, PRODUCTION_VERIFICATION_URL } from '@/lib/api/auth-config';

const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

const mockResendVerification = vi.fn().mockResolvedValue({ success: true });
const mockSetUser = vi.fn();
const mockClearError = vi.fn();

let mockAuthState: {
  user: any;
  status: string;
  verificationEmail: string | null;
  resendVerification: typeof mockResendVerification;
  setUser: typeof mockSetUser;
  clearError: typeof mockClearError;
} = {
  user: null,
  status: 'pending_verification',
  verificationEmail: 'test@codin.co.tz',
  resendVerification: mockResendVerification,
  setUser: mockSetUser,
  clearError: mockClearError,
};

vi.mock('@/lib/stores/auth-context', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('@/lib/api/api-client', () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn().mockReturnValue('mock-access-token'),
}));

vi.mock('@/lib/features/auth/api/auth.client', () => ({
  getAuthApi: vi.fn().mockResolvedValue({
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 'usr-1',
      email: 'test@codin.co.tz',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      status: 'active',
      timezone: 'Africa/Dar_es_Salaam',
      locale: 'en-TZ',
      authUserId: 'auth-1',
      emailVerified: true,
    }),
    bootstrap: vi.fn().mockResolvedValue({
      id: 'usr-1',
      email: 'test@codin.co.tz',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      status: 'active',
      timezone: 'Africa/Dar_es_Salaam',
      locale: 'en-TZ',
      authUserId: 'auth-1',
      emailVerified: true,
    }),
    verifyEmail: vi.fn().mockResolvedValue({
      success: true,
      user: {
        id: 'usr-1',
        email: 'test@codin.co.tz',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        status: 'active',
        timezone: 'Africa/Dar_es_Salaam',
        locale: 'en-TZ',
        authUserId: 'auth-1',
        emailVerified: true,
      },
    }),
    resendVerification: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

describe('Verification Redirect URL configuration', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses https://app.codin.co.tz/verify-email in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(getVerificationRedirectUrl()).toBe(PRODUCTION_VERIFICATION_URL);
    expect(getVerificationRedirectUrl()).not.toBe('http://localhost:3000/verify-email');
  });

  it('never returns http://localhost:3000 in production even if env points to localhost', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    expect(getVerificationRedirectUrl()).toBe(PRODUCTION_VERIFICATION_URL);
    expect(getVerificationRedirectUrl()).not.toContain('localhost');
  });

  it('preserves localhost in development when running locally', () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    expect(getVerificationRedirectUrl()).toBe('http://localhost:3000/verify-email');
  });
});

describe('VerifyEmailPage Link Verification UI', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
    mockSearchParams = new URLSearchParams();
    window.location.hash = '';

    mockAuthState = {
      user: null,
      status: 'pending_verification',
      verificationEmail: 'test@codin.co.tz',
      resendVerification: mockResendVerification,
      setUser: mockSetUser,
      clearError: mockClearError,
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders "Check your email" with no verification-code input for post-registration', () => {
    render(<VerifyEmailPage />);

    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('test@codin.co.tz')).toBeInTheDocument();
    expect(screen.getByText(/Click the verification link we sent/i)).toBeInTheDocument();

    // Verify there is NO code input field
    expect(screen.queryByPlaceholderText(/Enter 6-digit code/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /code/i })).not.toBeInTheDocument();

    // Has Resend verification link button
    expect(screen.getByRole('button', { name: /Resend verification link/i })).toBeInTheDocument();
  });

  it('handles resending the verification email link', async () => {
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    const resendBtn = screen.getByRole('button', { name: /Resend verification link/i });
    await user.click(resendBtn);

    expect(mockResendVerification).toHaveBeenCalledWith('test@codin.co.tz');
    await waitFor(() => {
      expect(screen.getByText(/Verification link sent! Check your inbox/i)).toBeInTheDocument();
    });
  });

  it('processes hash fragment callback from Supabase verification link (#access_token=...) and redirects to onboarding', async () => {
    // Supabase redirects to /verify-email#access_token=mock-jwt&refresh_token=mock-refresh&type=signup
    const fakeJwtPayload = btoa(JSON.stringify({ sub: 'auth-1', email: 'test@codin.co.tz' }));
    window.location.hash = `#access_token=header.${fakeJwtPayload}.signature&refresh_token=refresh-xyz&type=signup`;

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    });

    expect(mockSetUser).toHaveBeenCalledWith(
      expect.objectContaining({
        emailVerified: true,
      })
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    }, { timeout: 2000 });
  });

  it('handles expired/invalid verification link errors from callback', async () => {
    mockSearchParams = new URLSearchParams('error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification link expired')).toBeInTheDocument();
      expect(screen.getByText(/Link expired or already used/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Send new verification link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Sign in/i })).toBeInTheDocument();
  });

  it('displays already verified state if user is already authenticated and emailVerified', () => {
    mockAuthState = {
      user: {
        id: 'usr-1',
        email: 'test@codin.co.tz',
        emailVerified: true,
        status: 'active',
      },
      status: 'authenticated',
      verificationEmail: null,
      resendVerification: mockResendVerification,
      setUser: mockSetUser,
      clearError: mockClearError,
    };

    render(<VerifyEmailPage />);

    expect(screen.getByText('Already Verified')).toBeInTheDocument();
    expect(screen.getByText(/Your email is already verified/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Workspace/i })).toBeInTheDocument();
  });
});
