'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';
import { getSupabaseClient } from '@/lib/api/supabase-client';
import { setAccessToken, getAccessToken } from '@/lib/api/api-client';
import { getAuthApi } from '@/lib/features/auth/api/auth.client';
import type { CurrentUser } from '@/lib/features/auth/api/auth.types';

type VerifyViewState =
  | 'pending_confirmation'          // Registration successful / waiting for user to click email link
  | 'verifying'                     // Verification link callback is currently being processed
  | 'verified'                      // Email verified successfully
  | 'already_verified'              // User was already verified
  | 'expired_or_invalid'            // Link expired or invalid
  | 'unauthenticated_after_callback'// Link processed but user not authenticated
  | 'error';                        // Generic or network error

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status, verificationEmail, resendVerification, setUser, clearError } = useAuth();

  const [viewState, setViewState] = useState<VerifyViewState>('pending_confirmation');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [manualEmailInput, setManualEmailInput] = useState('');
  const processedRef = useRef(false);

  // Initialize display email from context or session storage
  useEffect(() => {
    let email = verificationEmail || user?.email;
    if (!email && typeof window !== 'undefined') {
      try {
        email = sessionStorage.getItem('codin_pending_verification_email') || '';
      } catch {}
    }
    if (email) {
      setDisplayEmail(email);
    }
  }, [verificationEmail, user?.email]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if user is already verified
  useEffect(() => {
    if (processedRef.current) return;

    // Check if URL has callback parameters first
    const hasHash = typeof window !== 'undefined' && window.location.hash.length > 1;
    const hasSearchCallback =
      searchParams.has('code') ||
      searchParams.has('token_hash') ||
      searchParams.has('token') ||
      searchParams.has('error') ||
      searchParams.has('access_token');

    if (!hasHash && !hasSearchCallback) {
      if (user && (user.emailVerified || user.status === 'active')) {
        setViewState('already_verified');
      }
    }
  }, [user, searchParams]);

  // Process Supabase Auth Verification Callback (Link Flow)
  const processCallback = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Parse parameters from both query string and hash fragment
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    const error = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDescription =
      searchParams.get('error_description') || hashParams.get('error_description');

    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const tokenType = searchParams.get('type') || hashParams.get('type') || 'signup';
    const rawToken = searchParams.get('token');

    const hasCallbackParams = Boolean(
      error || errorCode || errorDescription || accessToken || code || tokenHash || rawToken
    );

    if (!hasCallbackParams) {
      // Normal visit without callback params: show pending confirmation or already verified
      if (user && (user.emailVerified || user.status === 'active')) {
        setViewState('already_verified');
      } else {
        setViewState('pending_confirmation');
      }
      return;
    }

    // Set view state to verifying while processing the callback
    setViewState('verifying');
    setErrorMessage(null);

    // 1. Handle error returned by Supabase
    if (error || errorCode || errorDescription) {
      const isExpiredOrInvalid =
        errorCode === 'otp_expired' ||
        errorCode === 'expired_token' ||
        errorCode === '403' ||
        errorCode === '401' ||
        /expired|invalid/i.test(errorDescription || '') ||
        /expired|invalid/i.test(error || '');

      if (isExpiredOrInvalid) {
        setViewState('expired_or_invalid');
        setErrorMessage(
          errorDescription || 'The email verification link has expired or has already been used.'
        );
      } else {
        setViewState('error');
        setErrorMessage(errorDescription || error || 'Email verification failed.');
      }

      // Clean URL fragment/params for security
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }

    try {
      const supabase = getSupabaseClient();
      let sessionEstablished = false;
      let confirmedEmail = '';
      let sbUser: any = null;

      // 2. Handle PKCE code flow (?code=...)
      if (code && supabase) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          const isExpired = /expired|invalid/i.test(exchangeError.message);
          if (isExpired) {
            setViewState('expired_or_invalid');
            setErrorMessage(exchangeError.message);
          } else {
            setViewState('error');
            setErrorMessage(exchangeError.message);
          }
          return;
        }
        if (data.session) {
          setAccessToken(data.session.access_token);
          sessionEstablished = true;
          sbUser = data.user;
          confirmedEmail = data.user?.email || '';
        }
      }

      // 3. Handle Token Hash flow (?token_hash=...&type=...)
      else if (tokenHash && supabase) {
        const { data, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (tokenType as any) || 'signup',
        });
        if (otpError) {
          const isExpired = /expired|invalid/i.test(otpError.message);
          if (isExpired) {
            setViewState('expired_or_invalid');
            setErrorMessage(otpError.message);
          } else {
            setViewState('error');
            setErrorMessage(otpError.message);
          }
          return;
        }
        if (data.session) {
          setAccessToken(data.session.access_token);
          sessionEstablished = true;
          sbUser = data.user;
          confirmedEmail = data.user?.email || '';
        }
      }

      // 4. Handle Implicit Hash Fragment flow (#access_token=...&refresh_token=...)
      else if (accessToken) {
        if (supabase) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
          } catch (sbErr) {
            console.warn('Supabase setSession notice:', sbErr);
          }
        }
        setAccessToken(accessToken);
        sessionEstablished = true;

        // Try extracting user from JWT
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          if (payload.email) confirmedEmail = payload.email;
        } catch {}
      }

      // 5. Handle raw token parameter (?token=...) via backend verify-email
      else if (rawToken) {
        const api = await getAuthApi();
        const email = displayEmail || verificationEmail || '';
        const verifyResult = await api.verifyEmail(
          {
            id: '',
            email,
            displayName: '',
            firstName: '',
            lastName: '',
            status: 'pending',
            timezone: '',
            locale: '',
            authUserId: '',
          },
          rawToken
        );

        if (verifyResult.success && verifyResult.user) {
          sessionEstablished = true;
          confirmedEmail = verifyResult.user.email;
          setUser(verifyResult.user);
        } else {
          setViewState('expired_or_invalid');
          setErrorMessage(verifyResult.error || 'Verification code or link is invalid.');
          return;
        }
      }

      // Clean URL fragment/params from the address bar
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 6. Retrieve current Supabase authentication state and confirm email is verified
      let isEmailVerified = false;

      if (supabase) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            sbUser = userData.user;
            confirmedEmail = sbUser.email || confirmedEmail;
            if (sbUser.email_confirmed_at || sbUser.confirmed_at) {
              isEmailVerified = true;
            }
          }
        } catch (err) {
          console.warn('Supabase getUser check:', err);
        }
      }

      // If Supabase redirected to redirect_to with access_token from verification link, email is confirmed
      if (accessToken || sessionEstablished) {
        isEmailVerified = true;
      }

      if (confirmedEmail) {
        setDisplayEmail(confirmedEmail);
      }

      // 7. Sync with backend user profile
      const api = await getAuthApi();
      let currentUser = await api.getCurrentUser();

      // If user profile is not yet bootstrapped in backend, bootstrap with Supabase metadata
      if (!currentUser && getAccessToken()) {
        try {
          const firstName = sbUser?.user_metadata?.first_name || '';
          const lastName = sbUser?.user_metadata?.last_name || '';
          const displayName =
            sbUser?.user_metadata?.full_name ||
            sbUser?.user_metadata?.display_name ||
            (confirmedEmail ? confirmedEmail.split('@')[0] : 'User');

          currentUser = await api.bootstrap({
            firstName: firstName || 'User',
            lastName: lastName || '',
            displayName,
          });
        } catch (bootstrapErr) {
          console.warn('Bootstrap note during verification:', bootstrapErr);
        }
      }

      // 8. Confirm user is authenticated after callback
      if (!currentUser && !getAccessToken()) {
        setViewState('unauthenticated_after_callback');
        return;
      }

      // 9. Mark email as verified and update AuthContext
      if (currentUser) {
        const verifiedUser: CurrentUser = {
          ...currentUser,
          emailVerified: true,
          status: 'active',
        };
        setUser(verifiedUser);
      } else if (getAccessToken()) {
        const fallbackUser: CurrentUser = {
          id: sbUser?.id || 'verified-user',
          authUserId: sbUser?.id || 'verified-user',
          email: confirmedEmail || 'verified@example.com',
          firstName: sbUser?.user_metadata?.first_name || 'User',
          lastName: sbUser?.user_metadata?.last_name || '',
          displayName:
            sbUser?.user_metadata?.full_name || (confirmedEmail ? confirmedEmail.split('@')[0] : 'User'),
          status: 'active',
          timezone: 'Africa/Dar_es_Salaam',
          locale: 'en-TZ',
          emailVerified: true,
        };
        setUser(fallbackUser);
      }

      // Clear pending verification email from sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('codin_pending_verification_email');
        } catch {}
      }

      setViewState('verified');

      // 10. Automatically route into the existing onboarding flow after a short delay
      setTimeout(() => {
        router.replace('/onboarding');
      }, 1400);
    } catch (err) {
      console.error('Verification error:', err);
      setViewState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Verification failed. Please try again.'
      );
    }
  }, [searchParams, user, displayEmail, verificationEmail, setUser, router]);

  // Run callback processing once on mount
  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    processCallback();
  }, [processCallback]);

  // Handle Resend Verification Link
  const handleResend = async () => {
    const emailToUse = displayEmail || manualEmailInput.trim() || verificationEmail || user?.email;
    if (!emailToUse) {
      setErrorMessage('Please provide an email address to resend the verification link.');
      return;
    }

    setIsResending(true);
    setResendSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await resendVerification(emailToUse);
      if (result.success) {
        setResendSuccessMessage(`Verification link sent! Check your inbox at ${emailToUse}.`);
        setResendCooldown(60);
      } else {
        setErrorMessage(result.error || 'Failed to resend verification email. Please try again.');
      }
    } catch {
      setErrorMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-sm">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {viewState === 'verified' && 'Email Verified!'}
            {viewState === 'verifying' && 'Verifying your email…'}
            {viewState === 'already_verified' && 'Already Verified'}
            {viewState === 'pending_confirmation' && 'Check your email'}
            {viewState === 'expired_or_invalid' && 'Verification link expired'}
            {viewState === 'unauthenticated_after_callback' && 'Sign In Required'}
            {viewState === 'error' && 'Verification Issue'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {viewState === 'verified' && 'Your Codin account is ready'}
            {viewState === 'verifying' && 'Please wait while we confirm your email verification link'}
            {viewState === 'already_verified' && 'Your account email is already confirmed'}
            {viewState === 'pending_confirmation' &&
              'Click the verification link we sent to confirm your account'}
            {viewState === 'expired_or_invalid' &&
              'This link is no longer valid. Request a new one below.'}
            {viewState === 'unauthenticated_after_callback' &&
              'Email verified. Please log in with your credentials.'}
            {viewState === 'error' && 'We could not complete your verification'}
          </p>
        </div>

        {/* State Card */}
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          {/* STATE 1: VERIFYING (Link being processed) */}
          {viewState === 'verifying' && (
            <div className="py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Processing verification link…</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Validating authentication credentials with Supabase
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: VERIFIED (Verification successful) */}
          {viewState === 'verified' && (
            <div className="py-6 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Email verified successfully!</p>
                <p className="text-xs text-muted-foreground">
                  Redirecting you to complete your onboarding…
                </p>
              </div>
              <Button
                onClick={() => router.replace('/onboarding')}
                className="w-full gap-2 text-sm font-semibold"
              >
                Continue to Onboarding
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STATE 3: ALREADY VERIFIED */}
          {viewState === 'already_verified' && (
            <div className="py-6 space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Your email is already verified</p>
                <p className="text-xs text-muted-foreground">
                  You are all set to continue to your workspace.
                </p>
              </div>
              <Button
                onClick={() => router.replace('/onboarding')}
                className="w-full gap-2 text-sm font-semibold"
              >
                Continue to Workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STATE 4: PENDING CONFIRMATION (Registration successful / confirmation email sent) */}
          {viewState === 'pending_confirmation' && (
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">We sent a verification link to</p>
                <p className="mt-1 text-sm font-semibold text-foreground break-all">
                  {displayEmail || 'your email address'}
                </p>
              </div>

              <div className="rounded-lg bg-muted/60 p-3.5 text-left text-xs text-muted-foreground space-y-1.5 border border-border/40">
                <p className="font-medium text-foreground">Next steps:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>Open the email sent from Codin Mail.</li>
                  <li>Click the verification link in the message.</li>
                  <li>You will be redirected back here and logged in automatically.</li>
                </ol>
              </div>

              {resendSuccessMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{resendSuccessMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full text-xs font-medium gap-2 h-10"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending verification link…
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend link in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend verification link
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => router.push('/sign-up')}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change email address
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: EXPIRED OR INVALID LINK */}
          {viewState === 'expired_or_invalid' && (
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Link expired or already used</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email verification links are valid for a limited time and can only be clicked once.
                </p>
              </div>

              {!displayEmail && (
                <div>
                  <label className="mb-1.5 block text-left text-xs font-medium text-foreground">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={manualEmailInput}
                    onChange={(e) => setManualEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              {resendSuccessMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{resendSuccessMessage}</span>
                </div>
              )}

              {errorMessage && !resendSuccessMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full text-xs font-semibold gap-2 h-10"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend link in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Send new verification link
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/sign-in')}
                  className="w-full text-xs h-10"
                >
                  Back to Sign in
                </Button>
              </div>
            </div>
          )}

          {/* STATE 6: UNAUTHENTICATED AFTER CALLBACK */}
          {viewState === 'unauthenticated_after_callback' && (
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Email verified!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your verification link was accepted. Please sign in with your email and password to
                  continue.
                </p>
              </div>

              <Button
                onClick={() => router.push('/sign-in')}
                className="w-full gap-2 text-sm font-semibold h-10"
              >
                Sign in to your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STATE 7: GENERIC ERROR */}
          {viewState === 'error' && (
            <div className="space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">Verification failed</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {errorMessage || 'An unexpected error occurred while verifying your email.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full text-xs font-semibold gap-2 h-10"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend link in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend verification link
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/sign-in')}
                  className="w-full text-xs h-10"
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Contact support or sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
