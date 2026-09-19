'use client';

import { ApplicationShell } from '@/app/components/application-shell';
import { useThreads } from '@/lib/features/mail/hooks/use-threads';
import { adaptThreadListItems } from '@/lib/features/mail/hooks/use-threads-adapter';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export function ThreadsClient() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const { activeWorkspace } = useWorkspace();

  const folderName = params.name;
  const searchQuery = searchParams.get('q') ?? '';

  const { data, isLoading, isError } = useThreads(folderName);
  const [threads, setThreads] = useState<ReturnType<typeof adaptThreadListItems>>([]);
  const [dataUnavailable, setDataUnavailable] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName={folderName}
          threads={[]}
          searchQuery={searchQuery}
          dataUnavailable={false}
        />
      </div>
    );
  }

  if (isError || !data) {
    setDataUnavailable(true);
    return (
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName={folderName}
          threads={[]}
          searchQuery={searchQuery}
          dataUnavailable={true}
        />
      </div>
    );
  }

  const adaptedThreads = adaptThreadListItems(data.threads);
  setThreads(adaptedThreads);
  setDataUnavailable(false);

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell
        folderName={folderName}
        threads={adaptedThreads}
        searchQuery={searchQuery}
        dataUnavailable={false}
      />
    </div>
  );
}