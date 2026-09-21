'use client';

import { ApplicationShell } from '@/app/components/application-shell';
import { useThreads } from '@/lib/features/mail/hooks/use-threads';
import { adaptThreadListItems } from '@/lib/features/mail/hooks/use-threads-adapter';
import { Suspense, useMemo } from 'react';

function CalendarThreads() {
  const { data, isLoading, isError } = useThreads('inbox');

  const threads = useMemo(
    () => (data?.threads ? adaptThreadListItems(data.threads) : []),
    [data],
  );

  const dataUnavailable = !isLoading && (isError || !data);

  return (
    <div className="flex h-screen w-full">
      <ApplicationShell
        folderName="inbox"
        threads={threads}
        initialWorkspace="calendar"
        dataUnavailable={dataUnavailable}
      />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full">
        <ApplicationShell
          folderName="inbox"
          threads={[]}
          initialWorkspace="calendar"
          dataUnavailable={false}
        />
      </div>
    }>
      <CalendarThreads />
    </Suspense>
  );
}