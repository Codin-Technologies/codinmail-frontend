'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceApi } from '@/lib/features/workspace/api/workspace.client';
import type { CreateWorkspaceInput, Workspace } from '@/lib/features/workspace/api/workspace.types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const api = await getWorkspaceApi();
      const result = await api.list();
      return result;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: ['workspaces', id],
    queryFn: async () => {
      if (!id) throw new Error('Workspace ID is required');
      const api = await getWorkspaceApi();
      const result = await api.get(id);
      if (!result) throw new Error('Workspace not found');
      return result;
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export { useWorkspace as useWorkspaceQuery };

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      const api = await getWorkspaceApi();
      const result = await api.create(input);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<Workspace> }) => {
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
