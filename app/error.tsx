'use client';

import { Database, RefreshCw, Terminal, MailWarning } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDatabaseError = /postgres|database|connection|ECONNREFUSED|connect/i.test(error.message);

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive text-destructive-foreground"
          style={{ animation: 'error-shake 2.5s ease-in-out infinite' }}
        >
          <MailWarning className="h-7 w-7" />
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {isDatabaseError ? 'Database connection error' : 'Couldn\'t open your workspace'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isDatabaseError ? 'Unable to connect to the PostgreSQL database.' : 'An unexpected error stopped this screen from loading.'}
              </p>
            </div>
          </div>

          {isDatabaseError && <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              Quick Fix: Start Postgres via Docker
            </div>
            <code className="block rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground">
              docker compose up -d
            </code>
            <p className="mt-3 text-xs text-muted-foreground">
              Then run migrations if starting for the first time:
            </p>
            <code className="mt-1.5 block rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground">
              pnpm db:migrate &amp;&amp; pnpm db:seed
            </code>
          </div>}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isDatabaseError ? (
                <>
                  Target:{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                    localhost:54322
                  </code>
                </>
              ) : (
                error.message || 'Unexpected render error'
              )}
            </span>
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes error-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
