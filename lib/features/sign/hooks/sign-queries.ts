import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getSignApi } from '@/lib/features/sign/api/sign.client';
import type {
  AddRecipientInput,
  CreateSigningRequestInput,
  ListRequestsFilters,
  RecipientActionInput,
  SigningCompletionRecord,
  SigningRecipient,
  SigningRequest,
  SigningStats,
  UpdateSigningRequestInput,
} from '@/lib/features/sign/api/sign.types';
import { signKeys } from '@/lib/features/sign/api/sign-query-keys';

export function useSigningRequests(workspaceId: string | null, filters?: ListRequestsFilters) {
  return useQuery({
    queryKey: signKeys.list(workspaceId ?? '', filters),
    queryFn: async () => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().listRequests(workspaceId, filters);
    },
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useSigningRequest(workspaceId: string | null, requestId: string | null) {
  return useQuery({
    queryKey: signKeys.detail(workspaceId ?? '', requestId ?? ''),
    queryFn: async () => {
      if (!workspaceId || !requestId) throw new Error('workspaceId and requestId required');
      return getSignApi().getRequest(workspaceId, requestId);
    },
    enabled: !!workspaceId && !!requestId,
  });
}

export function useSigningStats(workspaceId: string | null) {
  return useQuery({
    queryKey: signKeys.stats(workspaceId ?? ''),
    queryFn: async () => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().getStats(workspaceId);
    },
    enabled: !!workspaceId,
  });
}

export function useSigningRecipients(workspaceId: string | null, requestId: string | null) {
  return useQuery({
    queryKey: signKeys.recipients(workspaceId ?? '', requestId ?? ''),
    queryFn: async () => {
      if (!workspaceId || !requestId) throw new Error('Required params missing');
      const request = await getSignApi().getRequest(workspaceId, requestId);
      if (!request) return [] as SigningRecipient[];
      return getSignApi().listRecipients?.(workspaceId, requestId) ?? [];
    },
    enabled: !!workspaceId && !!requestId,
  });
}

export function useAuditEvents(workspaceId: string | null, requestId: string | null) {
  return useQuery({
    queryKey: signKeys.audit(workspaceId ?? '', requestId ?? ''),
    queryFn: async () => {
      if (!workspaceId || !requestId) throw new Error('Required params missing');
      return getSignApi().listAuditEvents?.(workspaceId, requestId) ?? [];
    },
    enabled: !!workspaceId && !!requestId,
  });
}

export function useIntegrity(workspaceId: string | null, requestId: string | null) {
  return useQuery({
    queryKey: signKeys.integrity(workspaceId ?? '', requestId ?? ''),
    queryFn: async () => {
      if (!workspaceId || !requestId) throw new Error('Required params missing');
      return getSignApi().verifyIntegrity(workspaceId, requestId);
    },
    enabled: !!workspaceId && !!requestId,
  });
}

export function useCompletion(workspaceId: string | null, requestId: string | null) {
  return useQuery({
    queryKey: signKeys.completion(workspaceId ?? '', requestId ?? ''),
    queryFn: async () => {
      if (!workspaceId || !requestId) throw new Error('Required params missing');
      return getSignApi().getCompletion(workspaceId, requestId);
    },
    enabled: !!workspaceId && !!requestId,
  });
}

export function useAvailableFiles(workspaceId: string | null, folderId?: string | null) {
  return useQuery({
    queryKey: ['sign', 'files', workspaceId, folderId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().listFiles(workspaceId, folderId);
    },
    enabled: !!workspaceId,
  });
}

export function useFileVersions(workspaceId: string | null, fileId: string | null) {
  return useQuery({
    queryKey: ['sign', 'files', workspaceId, fileId, 'versions'],
    queryFn: async () => {
      if (!workspaceId || !fileId) throw new Error('Required params missing');
      return getSignApi().getFileVersions(workspaceId, fileId);
    },
    enabled: !!workspaceId && !!fileId,
  });
}

export function useCreateRequest(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSigningRequestInput) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().createRequest(workspaceId, input);
    },
    onSuccess: (data) => {
      qc.setQueryData(signKeys.detail(workspaceId ?? '', data.id), data);
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
    },
  });
}

export function useUpdateRequest(workspaceId: string | null, requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateSigningRequestInput) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().updateRequest(workspaceId, requestId, patch);
    },
    onSuccess: (data) => {
      qc.setQueryData(signKeys.detail(workspaceId ?? '', requestId), data);
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
    },
  });
}

export function useDeleteRequest(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().deleteRequest(workspaceId, requestId);
    },
    onSuccess: (_, requestId) => {
      qc.removeQueries({ queryKey: signKeys.detail(workspaceId ?? '', requestId) });
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
      qc.invalidateQueries({ queryKey: signKeys.stats(workspaceId ?? '') });
    },
  });
}

export function useSendRequest(workspaceId: string | null, requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().sendRequest(workspaceId, requestId);
    },
    onSuccess: (data) => {
      qc.setQueryData(signKeys.detail(workspaceId ?? '', requestId), data);
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
      qc.invalidateQueries({ queryKey: signKeys.stats(workspaceId ?? '') });
    },
  });
}

export function useCancelRequest(workspaceId: string | null, requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().cancelRequest(workspaceId, requestId);
    },
    onSuccess: (data) => {
      qc.setQueryData(signKeys.detail(workspaceId ?? '', requestId), data);
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
      qc.invalidateQueries({ queryKey: signKeys.stats(workspaceId ?? '') });
    },
  });
}

export function useAddRecipient(workspaceId: string | null, requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddRecipientInput) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().addRecipient(workspaceId, requestId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: signKeys.recipients(workspaceId ?? '', requestId) });
      qc.invalidateQueries({ queryKey: signKeys.detail(workspaceId ?? '', requestId) });
    },
  });
}

export function useRemoveRecipient(workspaceId: string | null, requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipientId: string) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().removeRecipient(workspaceId, requestId, recipientId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: signKeys.recipients(workspaceId ?? '', requestId) });
      qc.invalidateQueries({ queryKey: signKeys.detail(workspaceId ?? '', requestId) });
    },
  });
}

export function useRecipientAction(workspaceId: string | null, requestId: string, recipientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecipientActionInput) => {
      if (!workspaceId) throw new Error('workspaceId required');
      return getSignApi().recipientAction(workspaceId, requestId, recipientId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: signKeys.recipients(workspaceId ?? '', requestId) });
      qc.invalidateQueries({ queryKey: signKeys.detail(workspaceId ?? '', requestId) });
      qc.invalidateQueries({ queryKey: signKeys.lists(workspaceId ?? '') });
      qc.invalidateQueries({ queryKey: signKeys.stats(workspaceId ?? '') });
    },
  });
}

export function useInvalidateSignWorkspace(workspaceId: string | null) {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: signKeys.all });
  }, [qc]);
}

export type { SigningRequest, SigningRecipient, SigningStats, SigningCompletionRecord };
