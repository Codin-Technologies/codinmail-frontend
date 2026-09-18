'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthApi } from '@/lib/features/auth/api/auth.client';
import type { LoginCredentials, RegisterInput } from '@/lib/features/auth/api/auth.types';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth:me'],
    queryFn: async () => {
      const api = await getAuthApi();
      const user = await api.getCurrentUser();
      if (!user) throw new Error('No authenticated user');
      return user;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const api = await getAuthApi();
      const result = await api.login(credentials);
      return result;
    },
    onSuccess: (result) => {
      if (result.success && result.user) {
        queryClient.setQueryData(['auth:me'], result.user);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const api = await getAuthApi();
      await api.logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth:me'], null);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const api = await getAuthApi();
      const result = await api.register(input);
      return result;
    },
  });
}
