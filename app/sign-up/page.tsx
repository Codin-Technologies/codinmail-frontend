'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { user, status, register, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'pending_verification') {
      router.replace('/verify-email');
    }
  }, [status, router]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim() || firstName.trim().length > 100) errors.firstName = 'Enter a first name (up to 100 characters).';
    if (!lastName.trim() || lastName.trim().length > 100) errors.lastName = 'Enter a last name (up to 100 characters).';
    if (!displayName.trim() || displayName.trim().length > 255) errors.displayName = 'Enter a display name (up to 255 characters).';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
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
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = !firstName.trim() || !lastName.trim() || !displayName.trim() || !email.trim() || !password || !confirmPassword;

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
            <label className="mb-1.5 block text-xs font-medium text-foreground">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Kelvin"
                maxLength={100}
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.firstName ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.firstName && <p className="mt-1 text-xs text-destructive">{localErrors.firstName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kijazi"
                maxLength={100}
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.lastName ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.lastName && <p className="mt-1 text-xs text-destructive">{localErrors.lastName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Kelvin Kijazi"
                maxLength={255}
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.displayName ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.displayName && <p className="mt-1 text-xs text-destructive">{localErrors.displayName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${localErrors.email ? 'border-destructive' : 'border-input'}`}
                required
              />
            </div>
            {localErrors.email && <p className="mt-1 text-xs text-destructive">{localErrors.email}</p>}
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
