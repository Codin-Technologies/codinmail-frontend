import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { Mailbox } from "../types/mail.api.types";

export function useMailboxes() {
  const { activeWorkspace } = useWorkspace();
  return useQuery({
    queryKey: ["mail", activeWorkspace?.id, "mailboxes"],
    queryFn: async () => {
      if (!activeWorkspace) throw new Error("No active workspace");
      const api = await getMailApi();
      return api.listMailboxes(activeWorkspace.id);
    },
    enabled: !!activeWorkspace,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useConnectedAccounts(workspaceId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "accounts"],
    queryFn: async () => {
      if (!workspaceId) throw new Error("Workspace ID required");
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/mail/accounts`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      return data.accounts ?? [];
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
    retry: 1,
  });
}
