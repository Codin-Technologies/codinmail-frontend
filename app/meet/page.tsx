'use client';

import { ApplicationShell } from '@/app/components/application-shell';
import { useThreads } from '@/lib/features/mail/hooks/use-threads';
import { adaptThreadListItems } from '@/lib/features/mail/hooks/use-threads-adapter';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { Suspense } from 'react';

function MeetThreads() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? '';

  const { data, isLoading, isError } = useThreads('inbox');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName="inbox"
          threads={[]}
          initialWorkspace="meet"
          dataUnavailable={false}
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName="inbox"
          threads={[]}
          initialWorkspace="meet"
          dataUnavailable={true}
        />
      </div>
    );
  }

  const adaptedThreads = adaptThreadListItems(data.threads);

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell
        folderName="inbox"
        threads={adaptedThreads}
        initialWorkspace="meet"
        dataUnavailable={false}
      />
    </div>
  );
}

export default function MeetPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName="inbox"
          threads={[]}
          initialWorkspace="meet"
          dataUnavailable={false}
        />
      </div>
    }>
      <MeetThreads />
    </Suspense>
  );
}