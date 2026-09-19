'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useArchiveThread,
  useTrashThread,
} from '@/lib/features/mail/hooks/use-thread-actions';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { Archive, Check, Clock } from 'lucide-react';

interface ThreadActionsProps {
  threadId: string;
}

export function ThreadActions({ threadId }: ThreadActionsProps) {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? '';

  const archiveMutation = useArchiveThread(workspaceId);
  const trashMutation = useTrashThread(workspaceId);

  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  const archivePending = archiveMutation.isPending;
  const trashPending = trashMutation.isPending;

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => archiveMutation.mutate(threadId)}
              disabled={
                !workspaceId ||
                archivePending ||
                isProduction
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Archive thread"
            >
              <Check size={14} className="text-gray-600" />
            </button>
          </TooltipTrigger>

          {isProduction && (
            <TooltipContent>
              <p>Archiving is disabled in production</p>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Snooze thread"
            >
              <Clock size={14} className="text-gray-400" />
            </button>
          </TooltipTrigger>

          <TooltipContent>
            <p>This feature is not yet implemented</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => trashMutation.mutate(threadId)}
              disabled={
                !workspaceId ||
                trashPending ||
                isProduction
              }
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Move thread to trash"
            >
              <Archive size={14} className="text-gray-600" />
            </button>
          </TooltipTrigger>

          {isProduction && (
            <TooltipContent>
              <p>Moving to trash is disabled in production</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}