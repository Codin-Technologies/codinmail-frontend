"use client";

import { Mail, Paperclip, Star } from "lucide-react";
import type { ThreadListItem } from "../../../lib/features/mail/types/mail.api.types";

function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } catch {
    return "";
  }
}

interface ThreadListProps {
  mailboxId?: string;
  folderName?: string;
  threads?: ThreadListItem[];
  isLoading?: boolean;
  onSelectThread?: (threadId: string) => void;
}

export function ThreadList({
  mailboxId,
  folderName,
  threads,
  isLoading,
  onSelectThread,
}: ThreadListProps) {
  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading messages…</div>;
  }

  if (!threads || threads.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No messages</div>;
  }

  return (
    <div className="h-full overflow-auto">
      {threads.map((item) => {
        const thread = item.thread;
        const latest = item.latestMessage;
        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread?.(thread.id)}
            className="w-full text-left border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`truncate font-medium ${!latest.isRead ? "text-foreground" : "text-gray-500"}`}>
                    {latest.sender || "Unknown"}
                  </span>
                  {!latest.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <div className="truncate text-sm text-gray-700">{latest.subject}</div>
                <div className="truncate text-xs text-gray-500">{latest.preview}</div>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {latest.attachmentPresent && (
                  <Paperclip size={12} className="text-gray-400" />
                )}
                {latest.isStarred && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                <span className="text-xs text-gray-400">
                  {timeAgo(latest.receivedAt)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
