'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { user, status, register, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [codinId, setCodinId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isCheckingCodinId, setIsCheckingCodinId] = useState(false);
  const [codinIdAvailable, setCodinIdAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'pending_verification') {
      router.replace('/verify-email');
    }
  }, [status, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (codinId.trim().length >= 3) {
        setIsCheckingCodinId(true);
        setTimeout(() => {
          const taken = ['admin', 'support', 'help', 'kelvin'];
          const available = !taken.includes(codinId.trim().toLowerCase());
          setCodinIdAvailable(available);
          setIsCheckingCodinId(false);
          if (!available) {
            setLocalErrors((prev) => ({ ...prev, codinId: 'This Codin ID is already taken.' }));
          } else {
            setLocalErrors((prev) => {
              const next = { ...prev };
              delete next.codinId;
              return next;
            });
          }
        }, 600);
      } else {
        setCodinIdAvailable(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [codinId]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!codinId.trim() || codinId.trim().length < 3) errors.codinId = 'Codin ID must be at least 3 characters.';
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: 1, label: 'Weak' };
    if (score <= 3) return { level: 2, label: 'Fair' };
    if (score <= 4) return { level: 3, label: 'Good' };
    return { level: 4, label: 'Strong' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), codinId: codinId.trim(), password });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = !name.trim() || !email.trim() || !codinId.trim() || !password || !confirmPassword;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your Codin Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">One identity for all your workspaces</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kelvin Kijazi"
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.name ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.name && <p className="mt-1 text-xs text-destructive">{localErrors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kelvin@example.com"
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.email ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.email && <p className="mt-1 text-xs text-destructive">{localErrors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Codin ID</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input
                type="text"
                value={codinId}
                onChange={(e) => setCodinId(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
                placeholder="kelvin.kijazi"
                className={`h-10 w-full rounded-lg border bg-background pl-8 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.codinId ? 'border-destructive' : 'border-input'}`}
                required
              />
              {codinId.trim().length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingCodinId ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : codinIdAvailable === true ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : codinIdAvailable === false ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : null}
                </div>
              )}
            </div>
            {localErrors.codinId && <p className="mt-1 text-xs text-destructive">{localErrors.codinId}</p>}
            {codinIdAvailable === true && !localErrors.codinId && (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Available
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.password ? 'border-destructive' : 'border-input'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full ${level <= strength.level ? (strength.level <= 2 ? 'bg-destructive' : strength.level === 3 ? 'bg-amber-500' : 'bg-emerald-600') : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{strength.label}</p>
              </div>
            )}
            {localErrors.password && <p className="mt-1 text-xs text-destructive">{localErrors.password}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.confirmPassword ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.confirmPassword && <p className="mt-1 text-xs text-destructive">{localErrors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={isSubmitting || isFormInvalid}>
            {isSubmitting ? 'Creating account…' : 'Create Codin Account'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              await register({ name: 'Demo User', email: 'kelvin@example.com', codinId: 'kelvin', password: 'password123' });
              setIsSubmitting(false);
            }}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.3v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
