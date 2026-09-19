import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { Draft, CreateDraftData, UpdateDraftData } from "../types/mail.api.types";

export function useDrafts(workspaceId: string, mailboxId: string) {
  return useQuery({
    queryKey: ["mail", workspaceId, "drafts", mailboxId],
    queryFn: async () => {
      if (!workspaceId || !mailboxId) throw new Error("Workspace and mailbox ID required");
      const api = await getMailApi();
      return api.listDrafts(workspaceId, mailboxId);
    },
    enabled: !!workspaceId && !!mailboxId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDraftData) => {
      const api = await getMailApi();
      return api.createDraft(workspaceId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "drafts", data.mailboxId],
      });
    },
  });
}

export function useUpdateDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ draftId, data }: { draftId: string; data: UpdateDraftData }) => {
      const api = await getMailApi();
      return api.updateDraft(workspaceId, draftId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "drafts", data.mailboxId],
      });
    },
  });
}

export function useDeleteDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draftId: string) => {
      const api = await getMailApi();
      await api.deleteDraft(workspaceId, draftId);
    },
    onSuccess: (_data, draftId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "drafts"],
      });
    },
  });
}

export function useSendDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draftId: string) => {
      const api = await getMailApi();
      return api.sendDraft(workspaceId, draftId);
    },
    onSuccess: (_data, draftId) => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "drafts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "threads"],
      });
    },
  });
}
