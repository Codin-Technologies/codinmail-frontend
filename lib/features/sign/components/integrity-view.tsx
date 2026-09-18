'use client';

import { Shield, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { useIntegrity } from '@/lib/features/sign/hooks/sign-queries';
import { cn } from '@/lib/utils';

export function IntegrityView({
  workspaceId,
  requestId,
}: {
  workspaceId: string | null;
  requestId: string;
}) {
  const { data, isLoading, error, refetch } = useIntegrity(workspaceId, requestId);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Unable to verify document integrity.
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isValid = data.valid;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <Shield size={16} className="text-green-600" />
          ) : (
            <ShieldAlert size={16} className="text-red-600" />
          )}
          <h3 className="text-sm font-semibold">Document Integrity</h3>
        </div>
        <button
          onClick={() => refetch()}
          className="h-5 w-5 rounded text-muted-foreground hover:bg-muted"
          aria-label="Re-verify integrity"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="mt-2 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle size={12} className={isValid ? 'text-green-600' : 'text-red-600'} />
          <span className={cn(isValid ? 'text-foreground' : 'text-red-600')}>
            {isValid ? 'Document integrity verified' : 'Document integrity compromised'}
          </span>
        </div>

        {data.currentChecksum && (
          <div className="break-all font-mono text-xs text-muted-foreground">
            <span className="text-muted-foreground">Checksum:</span> {data.currentChecksum}
          </div>
        )}

        {data.originalChecksum && data.currentChecksum !== data.originalChecksum && (
          <div className="break-all font-mono text-xs text-red-600">
            <span className="text-muted-foreground">Original:</span> {data.originalChecksum}
          </div>
        )}
      </div>
    </div>
  );
}
