'use client';

import { CheckCircle } from 'lucide-react';
import type { SigningRequest, SigningCompletionRecord } from '@/lib/features/sign/api/sign.types';
import { formatDateTime } from '@/lib/features/sign/utils/format';

export function CompletionView({
  request,
  completion,
}: {
  request: SigningRequest;
  completion?: SigningCompletionRecord | null;
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-green-600" />
        <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
          Signing Complete
        </h3>
      </div>

      <div className="mt-2 text-xs text-green-700/80 dark:text-green-300/80">
        <p>
          This signing request was completed on{' '}
          {request.completedAt ? formatDateTime(request.completedAt) : '—'}.
        </p>
        <p className="mt-1">
          A completion record has been generated with a verified document checksum for audit.
        </p>
      </div>

      {completion && (
        <div className="mt-3 border-t border-green-200/50 dark:border-green-900/20 pt-2">
          <div className="font-mono text-[10px] break-all text-green-700/60 dark:text-green-300/60">
            {completion.originalChecksum}
          </div>
        </div>
      )}
    </div>
  );
}
