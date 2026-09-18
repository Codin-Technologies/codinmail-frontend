import { ApplicationShell } from '@/app/components/application-shell';
import Loading from '@/app/loading';
import { Suspense } from 'react';

export function generateStaticParams() {
  const folderNames = [
    'inbox',
    'starred',
    'drafts',
    'sent',
    'archive',
    'trash',
  ];

  return folderNames.map((name) => ({ name }));
}

export default function ThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  return (
    <div className="flex h-screen w-full">
      <Suspense fallback={<ThreadsSkeleton />}>
        <Threads params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ThreadsSkeleton() {
  return <Loading />;
}

async function Threads({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  let { name } = await params;
  let { q } = await searchParams;
  let threads: any[] = [];
  let dataUnavailable = false;
  try {
    const { getThreadsForFolder } = await import('@/lib/db/queries');
    threads = await getThreadsForFolder(name);
  } catch {
    dataUnavailable = true;
  }

  return <ApplicationShell folderName={name} threads={threads} searchQuery={q} dataUnavailable={dataUnavailable} />;
}
