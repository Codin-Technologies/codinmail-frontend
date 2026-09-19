'use client';

import { useWorkspace } from "@/lib/stores/workspace-context";
import { useQuery } from "@tanstack/react-query";
import { getMailApi } from "@/lib/features/mail/api/mail.client";
import { MailboxEmptyState } from "@/app/components/mailbox-empty-state";
import { FolderNav } from "@/app/mail/components/folder-nav";
import { ThreadList } from "@/app/mail/components/thread-list";
import { ThreadDetail } from "@/app/mail/components/thread-detail";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function MailPage() {
  const { activeWorkspace } = useWorkspace();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const { data: mailboxes, isLoading: mailboxesLoading, isError: mailboxesError } = useQuery({
    queryKey: ["mail", activeWorkspace?.id, "mailboxes"],
    queryFn: async () => {
      if (!activeWorkspace) throw new Error("No active workspace");
      const api = await getMailApi();
      return api.listMailboxes(activeWorkspace.id);
    },
    enabled: !!activeWorkspace,
  });

  if (mailboxesLoading) {
    return <div className="flex h-screen items-center justify-center">Loading mail…</div>;
  }

  if (mailboxesError || !mailboxes || mailboxes.length === 0) {
    return <MailboxEmptyState />;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="w-64 border-r border-gray-200 overflow-auto">
        <FolderNav mailboxes={mailboxes} />
      </div>
      <div className="w-80 border-r border-gray-200 overflow-auto">
        <ThreadList
          mailboxId={mailboxes[0]?.id}
          onSelectThread={(id) => setSelectedThreadId(id)}
        />
      </div>
      <div className="grow overflow-auto">
        {selectedThreadId && (
          <ThreadDetail
            workspaceId={activeWorkspace!.id}
            threadId={selectedThreadId}
          />
        )}
      </div>
    </div>
  );
}
