"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWorkspace } from "@/lib/stores/workspace-context";
import { useQuery } from "@tanstack/react-query";
import { getMailApi } from "@/lib/features/mail/api/mail.client";
import { MailboxEmptyState } from "@/app/components/mailbox-empty-state";
import { FolderNav } from "@/app/mail/components/folder-nav";
import { ThreadList } from "@/app/mail/components/thread-list";
import { ThreadDetail } from "@/app/mail/components/thread-detail";
import { useState } from "react";

export default function FolderPage() {
  const { folderName } = useParams<{ workspaceId: string; folderName: string }>();
  const { activeWorkspace } = useWorkspace();
  const router = useRouter();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const workspaceId = activeWorkspace?.id;

  const { data: mailboxes, isLoading: mailboxesLoading, isError: mailboxesError } = useQuery({
    queryKey: ["mail", workspaceId, "mailboxes"],
    queryFn: async () => {
      if (!workspaceId) throw new Error("No active workspace");
      const api = await getMailApi();
      return api.listMailboxes(workspaceId);
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (!workspaceId) {
      router.push("/workspaces/select");
    }
  }, [workspaceId, router]);

  if (mailboxesLoading) {
    return <div className="flex h-screen items-center justify-center">Loading mail…</div>;
  }

  if (mailboxesError || !mailboxes || mailboxes.length === 0) {
    return <MailboxEmptyState />;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="w-64 border-r border-gray-200 overflow-auto">
        <FolderNav mailboxes={mailboxes} activeFolder={folderName} />
      </div>
      <div className="w-80 border-r border-gray-200 overflow-auto">
        <ThreadList
          mailboxId={mailboxes[0]?.id}
          folderName={folderName}
          onSelectThread={(id) => setSelectedThreadId(id)}
        />
      </div>
      <div className="grow overflow-auto">
        {selectedThreadId && workspaceId && (
          <ThreadDetail
            workspaceId={workspaceId}
            threadId={selectedThreadId}
          />
        )}
      </div>
    </div>
  );
}
