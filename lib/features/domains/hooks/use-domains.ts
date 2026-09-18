'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDomainApi } from '@/lib/features/domains/api/domain.client';
import type { CreateDomainInput } from '@/lib/features/domains/api/domain.types';

export function useDomains(workspaceId: string | null) {
  return useQuery({
    queryKey: ['domains', workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const api = await getDomainApi();
      const result = await api.list(workspaceId);
      return result;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useDomain(workspaceId: string | null, domainId: string | null) {
  return useQuery({
    queryKey: ['domains', workspaceId, domainId],
    queryFn: async () => {
      if (!workspaceId || !domainId) throw new Error('Workspace ID and Domain ID are required');
      const api = await getDomainApi();
      const result = await api.get(workspaceId, domainId);
      if (!result) throw new Error('Domain not found');
      return result;
    },
    enabled: !!workspaceId && !!domainId,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useAddDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, input }: { workspaceId: string; input: CreateDomainInput }) => {
      const api = await getDomainApi();
      const result = await api.create(workspaceId, input);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains', variables.workspaceId] });
    },
  });
}

export { useAddDomain as useCreateDomain };

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, domainId }: { workspaceId: string; domainId: string }) => {
      const api = await getDomainApi();
      await api.delete(workspaceId, domainId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains', variables.workspaceId] });
    },
  });
}

export function useVerifyDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, domainId }: { workspaceId: string; domainId: string }) => {
      const api = await getDomainApi();
      const result = await api.verify(workspaceId, domainId);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['domains', variables.workspaceId] });
    },
  });
}

export function useCheckDns() {
  return useMutation({
    mutationFn: async ({ workspaceId, domainId }: { workspaceId: string; domainId: string }) => {
      const api = await getDomainApi();
      const result = await api.checkDns(workspaceId, domainId);
      return result;
    },
  });
}

