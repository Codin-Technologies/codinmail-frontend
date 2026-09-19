import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";

export function useThreadRead(workspaceId: string, threadId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!workspaceId || !threadId) throw new Error("Workspace and thread ID required");
      const api = await getMailApi();
      await api.markThreadRead(workspaceId, threadId);
    },
    onSuccess: () => {
      if (threadId) {
        queryClient.invalidateQueries({
          queryKey: ["mail", workspaceId, "thread", threadId],
        });
        queryClient.invalidateQueries({
          queryKey: ["mail", workspaceId, "threads"],
        });
      }
    },
  });
}

export function useThreadUnread(workspaceId: string, threadId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!workspaceId || !threadId) throw new Error("Workspace and thread ID required");
      const api = await getMailApi();
      await api.markThreadUnread(workspaceId, threadId);
    },
    onSuccess: () => {
      if (threadId) {
        queryClient.invalidateQueries({
          queryKey: ["mail", workspaceId, "thread", threadId],
        });
        queryClient.invalidateQueries({
          queryKey: ["mail", workspaceId, "threads"],
        });
      }
    },
  });
}

export function useArchiveThread(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const api = await getMailApi();
      return api.archiveThread(workspaceId, threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail", workspaceId, "threads"] });
    },
  });
}

export function useTrashThread(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (threadId: string) => {
      const api = await getMailApi();
      return api.trashThread(workspaceId, threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail", workspaceId, "threads"] });
    },
  });
}

export function useUpdateThread(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ threadId, updates }: { threadId: string; updates: { isStarred?: boolean; isArchived?: boolean; isDeleted?: boolean } }) => {
      const api = await getMailApi();
      return api.updateThread(workspaceId, threadId, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "thread", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "threads"],
      });
    },
  });
}
