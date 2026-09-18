import { Suspense } from 'react';
import { SignSettings } from '@/lib/features/sign/components/sign-settings';

export const dynamic = 'force-dynamic';

export default function SignSettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <SignSettings />
    </Suspense>
  );
}
