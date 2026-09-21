'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, status, verificationEmail, verificationCode, verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.emailVerified) {
      router.replace('/onboarding');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user && status !== 'pending_verification') {
      router.replace('/sign-up');
    }
  }, [user, status, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim() || code.trim().length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setIsVerifying(true);
    try {
      const result = await verifyEmail(code.trim());
      if (result.success) {
        setVerified(true);
        setTimeout(() => router.replace('/onboarding'), 1200);
      } else {
        setError(result.error || 'Invalid verification code.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage(null);
    setError(null);
    try {
      await resendVerification();
      setResendMessage('Verification code sent. Check your inbox.');
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!user && status !== 'pending_verification') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify your Codin Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>

          <p className="text-sm text-foreground">We sent a verification code to</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{verificationEmail || user?.email}</p>

          {verified ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Email verified
            </div>
          ) : (
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="h-12 w-full rounded-lg border border-input bg-background px-3 text-center text-lg font-mono tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
                  <p className="mt-1 text-[11px] text-muted-foreground">Enter the code sent to your email</p>
              </div>

              <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={isVerifying}>
                {isVerifying ? 'Verifying…' : 'Verify Email'}
              </Button>
            </form>
          )}

          {!verified && (
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleResend}
                className="w-full text-xs font-medium text-primary hover:underline"
                disabled={isResending}
              >
                {isResending ? 'Sending…' : 'Resend verification code'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/sign-up')}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                Change email
              </button>
            </div>
          )}

          {resendMessage && (
            <p className="mt-4 text-xs text-muted-foreground">{resendMessage}</p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already verified?{' '}
          <button onClick={() => router.push('/onboarding')} className="text-primary hover:underline">
            Continue to workspace
          </button>
        </p>
      </div>
    </div>
  );
}
