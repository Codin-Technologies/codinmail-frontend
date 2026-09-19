import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { Message, Draft } from "../types/mail.api.types";

export function useMessages(workspaceId: string, threadId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "messages", threadId],
    queryFn: async () => {
      if (!workspaceId || !threadId) throw new Error("Workspace and thread ID required");
      const api = await getMailApi();
      return api.getThread(workspaceId, threadId);
    },
    enabled: !!workspaceId && !!threadId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMessage(workspaceId: string, messageId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "message", messageId],
    queryFn: async () => {
      const api = await getMailApi();
      return api.getMessage(workspaceId, messageId);
    },
    enabled: !!workspaceId && !!messageId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMessageActions(workspaceId: string) {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async (messageId: string) => {
      const api = await getMailApi();
      return api.updateMessage(workspaceId, messageId, { isRead: true });
    },
    onSuccess: (_data, messageId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "messages"],
      });
    },
  });

  const markUnread = useMutation({
    mutationFn: async (messageId: string) => {
      const api = await getMailApi();
      return api.updateMessage(workspaceId, messageId, { isRead: false });
    },
    onSuccess: (_data, messageId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", messageId],
      });
    },
  });

  const star = useMutation({
    mutationFn: async (messageId: string) => {
      const api = await getMailApi();
      return api.updateMessage(workspaceId, messageId, { isStarred: true });
    },
    onSuccess: (_data, messageId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", messageId],
      });
    },
  });

  const unstar = useMutation({
    mutationFn: async (messageId: string) => {
      const api = await getMailApi();
      return api.updateMessage(workspaceId, messageId, { isStarred: false });
    },
    onSuccess: (_data, messageId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", messageId],
      });
    },
  });

  const moveMessage = useMutation({
    mutationFn: async ({ messageId, folder }: { messageId: string; folder: string }) => {
      const api = await getMailApi();
      return api.updateMessage(workspaceId, messageId, { folder });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", variables.messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "messages"],
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const api = await getMailApi();
      await api.deleteMessage(workspaceId, messageId);
    },
    onSuccess: (_data, messageId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "message", messageId],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "messages"],
      });
    },
  });

  return {
    markRead,
    markUnread,
    star,
    unstar,
    moveMessage,
    deleteMessage,
  };
}
