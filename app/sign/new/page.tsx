import { Suspense } from 'react';
import { CreateRequestWizard } from '@/lib/features/sign/components/create-request-wizard';

export const dynamic = 'force-dynamic';

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <CreateRequestWizard />
    </Suspense>
  );
}
