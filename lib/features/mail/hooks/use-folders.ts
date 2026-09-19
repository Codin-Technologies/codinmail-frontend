import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { Folder } from "../types/mail.api.types";

export function useFolders(workspaceId: string, mailboxId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "folders", mailboxId],
    queryFn: async () => {
      if (!workspaceId || !mailboxId) throw new Error("Workspace and mailbox ID required");
      const api = await getMailApi();
      return api.listFolders(workspaceId, mailboxId);
    },
    enabled: !!workspaceId && !!mailboxId,
    staleTime: 60_000,
    retry: 1,
  });
}
