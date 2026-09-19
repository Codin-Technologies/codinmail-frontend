import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { SendMailPayload, SendMailResult } from "../types/mail.api.types";

export function useSendMail(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SendMailPayload) => {
      const api = await getMailApi();
      return api.sendMail(workspaceId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "threads"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mail", workspaceId, "threads", "sent"],
      });
    },
  });
}
