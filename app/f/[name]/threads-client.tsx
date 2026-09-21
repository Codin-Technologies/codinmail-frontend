'use client';

import { ApplicationShell } from '@/app/components/application-shell';
import { useThreads } from '@/lib/features/mail/hooks/use-threads';
import { adaptThreadListItems } from '@/lib/features/mail/hooks/use-threads-adapter';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export function ThreadsClient() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();

  const folderName = typeof params.name === 'string' ? params.name : params.name?.[0] ?? 'inbox';
  const searchQuery = searchParams.get('q') ?? '';

  const { data, isLoading, isError } = useThreads(folderName);

  const threads = useMemo(
    () => (data?.threads ? adaptThreadListItems(data.threads) : []),
    [data],
  );

  const dataUnavailable = !isLoading && (isError || !data);

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell
        folderName={folderName}
        threads={threads}
        searchQuery={searchQuery}
        dataUnavailable={dataUnavailable}
      />
    </div>
  );
}
