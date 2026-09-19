import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import type { ThreadListItem } from "../types/mail.api.types";
import { useWorkspace } from "@/lib/stores/workspace-context";

export function useThreads(folderName?: string) {
  const { activeWorkspace } = useWorkspace();
  return useQuery({
    queryKey: ["mail", activeWorkspace?.id, "threads", folderName ?? "inbox"],
    queryFn: async () => {
      if (!activeWorkspace) throw new Error("No active workspace");
      const api = await getMailApi();
      const result = await api.listThreads(activeWorkspace.id, {
        folder: folderName,
      });
      return result;
    },
    enabled: !!activeWorkspace,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useThread(workspaceId: string, threadId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "thread", threadId],
    queryFn: async () => {
      const api = await getMailApi();
      return api.getThread(workspaceId, threadId);
    },
    enabled: !!workspaceId && !!threadId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useThreadList(workspaceId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "thread-list"],
    queryFn: async () => {
      const api = await getMailApi();
      const result = await api.listThreads(workspaceId);
      return result.threads.map((t) => t.thread);
    },
    enabled: !!workspaceId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useThreadByMessage(workspaceId: string, messageId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "thread", messageId],
    queryFn: async () => {
      if (!workspaceId || !messageId) throw new Error("Workspace and message ID required");
      const api = await getMailApi();
      return api.getThread(workspaceId, messageId);
    },
    enabled: !!workspaceId && !!messageId,
    staleTime: 30_000,
    retry: 1,
  });
}
