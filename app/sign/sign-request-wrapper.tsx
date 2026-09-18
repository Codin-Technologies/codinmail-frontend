'use client';

import { Suspense } from 'react';
import { SignRequestList } from '@/lib/features/sign/components/sign-request-list';

export function SignRequestListWrapper({ initialStatus }: { initialStatus?: string }) {
  return (
    <Suspense fallback={<div className="space-y-4 p-6"><div className="h-8 w-3/4 bg-muted animate-pulse rounded" /><div className="h-8 w-1/2 bg-muted animate-pulse rounded" /></div>}>
      <SignRequestList initialStatus={initialStatus as any} />
    </Suspense>
  );
}