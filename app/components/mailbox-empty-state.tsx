'use client';

import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function MailboxEmptyState() {
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
        <Mail className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">No email account connected</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Connect an email account to start managing email from this workspace. You can still use Chat, Tasks, Calendar, and Files.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => router.push('/mailbox/connect')} className="text-xs font-semibold">
          Connect Email
        </Button>
        <Button variant="outline" onClick={() => router.push('/chat')} className="text-xs">
          Open Chat
        </Button>
      </div>
    </div>
  );
}
