'use client';

import { SignRequestList } from '@/lib/features/sign/components/sign-request-list';

export default function RecipientsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        Recipient management will be available soon.
      </p>
    </div>
  );
}
