import { Suspense } from 'react';
import { SignRequestDetailPage } from '@/lib/features/sign/components/sign-request-detail';

export const dynamic = 'force-dynamic';

export default function RequestDetailPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignRequestDetailPage />
    </Suspense>
  );
}
