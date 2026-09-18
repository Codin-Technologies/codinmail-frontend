import { Suspense } from 'react';
import { SignRequestListWrapper } from '@/app/sign/sign-request-wrapper';

export const dynamic = 'force-dynamic';

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="space-y-4 p-6"><div className="h-8 w-3/4 bg-muted animate-pulse rounded" /><div className="h-8 w-1/2 bg-muted animate-pulse rounded" /></div>}>
      <SignRequestListWrapper initialStatus='completed' />
    </Suspense>
  );
}
