'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/lib/stores/workspace-context';

export default function JoinWorkspacePage() {
  const router = useRouter();
  const { joinWorkspace, status } = useWorkspace();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!code.trim()) {
      setError('Enter an invitation code.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await joinWorkspace(code.trim());
      if (response.success) {
        setResult({ type: 'success', message: `You joined ${response.workspace?.name ?? 'the workspace'}.` });
        setTimeout(() => router.push('/onboarding'), 1200);
      } else {
        setResult({ type: 'error', message: response.error || 'Failed to join workspace.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Join a Workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter the invitation code shared with you</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${result.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
              {result.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {result.message}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Invitation code</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. codin-workspace-2026"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm uppercase tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Ask your workspace admin for the invitation code</p>
          </div>

          <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={isSubmitting || status === 'loading'}>
            {isSubmitting || status === 'loading' ? 'Joining…' : 'Join Workspace'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push('/onboarding/create-workspace')}
            className="text-xs text-primary hover:underline"
          >
            Or create a new workspace
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
