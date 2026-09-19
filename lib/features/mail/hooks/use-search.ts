import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMailApi } from "../api/mail.client";
import { useWorkspace } from "@/lib/stores/workspace-context";
import type { SearchResponse } from "../types/mail.api.types";

export function useSearch(workspaceId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["mail", workspaceId, "search"],
    queryFn: async () => {
      if (!workspaceId) throw new Error("Workspace ID required");
      const api = await getMailApi();
      return api.search(workspaceId, { q: "", limit: 50 });
    },
    enabled: false,
    staleTime: 0,
  });
}

export function useSearchMutation(workspaceId: string) {
  return useMutation({
    mutationFn: async (query: { q: string; folder?: string; limit?: number }) => {
      if (!workspaceId) throw new Error("Workspace ID required");
      const api = await getMailApi();
      return api.search(workspaceId, {
        q: query.q,
        folder: query.folder,
        limit: query.limit,
      });
    },
  });
}
