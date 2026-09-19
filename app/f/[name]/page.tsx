import { Suspense } from 'react';
import { ThreadsClient } from './threads-client';

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

export default function ThreadsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full" />
    }>
      <ThreadsClient />
    </Suspense>
  );
}