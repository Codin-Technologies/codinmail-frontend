import { Suspense } from 'react';
import { SignDashboard } from '@/lib/features/sign/components/sign-dashboard';

export default function SignPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignDashboard />
    </Suspense>
  );
}
