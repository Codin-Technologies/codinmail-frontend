'use client';

import { formatEmailString, highlightText } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { NavMenu } from '../components/menu';
import { Search } from '../components/search';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { useSearchMutation } from '@/lib/features/mail/hooks/use-search';
import { adaptThreadListItems, UIThread } from '@/lib/features/mail/hooks/use-threads-adapter';

function Threads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? '';
  const [q, setQ] = useState('');

  const searchMutation = useSearchMutation(workspaceId);
  const [threads, setThreads] = useState<UIThread[]>([]);

  const handleSearch = async (query: string) => {
    setQ(query);
    if (!workspaceId || !query.trim()) {
      setThreads([]);
      return;
    }

    try {
      const result = await searchMutation.mutateAsync({ q: query, limit: 50 });
      const adaptedThreads = adaptThreadListItems(result.messages.map((msg) => ({
        thread: {
          id: msg.threadId ?? '',
          workspaceId: '',
          mailboxId: '',
          subject: msg.subject ?? '',
          participants: [msg.sender],
          latestMessageId: msg.id,
          latestMessageAt: msg.receivedAt,
          messageCount: 1,
          unreadCount: msg.isRead ? 0 : 1,
          isStarred: msg.isStarred,
          isArchived: false,
          isDeleted: false,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        },
        latestMessage: {
          id: msg.id,
          messageId: msg.messageId,
          sender: msg.sender,
          subject: msg.subject ?? '',
          preview: msg.textBody ?? '',
          receivedAt: msg.receivedAt ?? '',
          isRead: msg.isRead,
          isStarred: msg.isStarred,
          attachmentPresent: false,
          labels: [],
        },
      })));
      setThreads(adaptedThreads);
    } catch {
      setThreads([]);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-auto">
      {threads.map((thread) => {
        const latestEmail = thread.emails[0];
        return (
          <Link
            key={thread.id}
            href={`/f/inbox/${thread.id}`}
          >
            <div
              className={`flex cursor-pointer items-center border-b border-gray-100 p-4 hover:bg-gray-50`}
            >
              <div className="flex grow items-center overflow-hidden">
                <div className="mr-4 w-[200px] shrink-0">
                  <span className="truncate font-medium">
                    {highlightText(formatEmailString(latestEmail.sender), q)}
                  </span>
                </div>
                <div className="flex grow items-center overflow-hidden">
                  <span className="mr-2 max-w-[400px] min-w-[175px] truncate font-medium">
                    {highlightText(thread.subject ?? '', q)}
                  </span>
                  <span className="truncate text-gray-600">
                    {highlightText(latestEmail.body ?? '', q)}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex w-40 shrink-0 items-center justify-end">
                <span className="text-sm text-gray-500">
                  {thread.lastActivityDate ? new Date(thread.lastActivityDate).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams.q ?? '';

  return (
    <div className="flex h-screen">
      <div className="grow overflow-hidden border-r border-gray-200">
        <div className="flex h-[70px] items-center justify-between border-b border-gray-200 p-4">
          <div className="flex w-full items-center">
            <NavMenu />
            <Suspense>
              <Search />
            </Suspense>
          </div>
          <div className="ml-4 flex items-center">
            <Link href="/" passHref>
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </Link>
          </div>
        </div>
        <Suspense>
          <Threads searchParams={Promise.resolve(resolvedParams)} />
        </Suspense>
      </div>
    </div>
  );
}