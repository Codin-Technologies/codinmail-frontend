"use client";

import { useQuery } from "@tanstack/react-query";
import { getMailApi } from "../../../lib/features/mail/api/mail.client";
import type { Thread } from "../../../lib/features/mail/types/mail.api.types";

interface ThreadDetailProps {
  workspaceId: string;
  threadId: string;
}

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

export function ThreadDetail({ workspaceId, threadId }: ThreadDetailProps) {
  const { data: thread, isLoading, isError } = useQuery({
    queryKey: ["mail", workspaceId, "thread", threadId],
    queryFn: async () => {
      const api = await getMailApi();
      return api.getThread(workspaceId, threadId);
    },
    enabled: !!workspaceId && !!threadId,
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading thread…</div>;
  }

  if (isError || !thread) {
    return <div className="p-6 text-sm text-red-600">Unable to load thread</div>;
  }

  const messages = thread.messages ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{thread.subject || "(no subject)"}</h2>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span>{thread.participants?.join(", ") || "Unknown"}</span>
          <span>·</span>
          <span>{thread.messageCount} messages</span>
          <span>·</span>
          <span>{thread.unreadCount} unread</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg: any, idx: number) => (
          <div key={msg.id ?? idx} className={`rounded-lg border p-4 ${msg.isRead ? "bg-white" : "bg-blue-50/50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{msg.sender || "Unknown"}</span>
                <div className="text-xs text-gray-500">{msg.recipients?.join(", ") || ""}</div>
              </div>
              <span className="text-xs text-gray-400">
                {timeAgo(msg.receivedAt)}
              </span>
            </div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{msg.textBody || msg.htmlBody || "(no content)"}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              {msg.sizeBytes > 0 && (
                <>
                  <span className="inline-block w-3 h-3">📎</span>
                  <span>Attachment</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 cursor-pointer">↩ Reply</span>
          <span className="text-gray-400 cursor-pointer">↪ Forward</span>
          <span className="text-gray-400 cursor-pointer">📥 Archive</span>
          <span className="text-gray-400 cursor-pointer">🗑 Trash</span>
          <span className="text-gray-400 cursor-pointer">★ Star</span>
        </div>
      </div>
    </div>
  );
}
