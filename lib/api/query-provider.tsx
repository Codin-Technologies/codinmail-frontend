'use client';

import { QueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export { queryClient };

const QueryClientContext = createContext<QueryClient | null>(null);

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientContext.Provider value={queryClient}>{children}</QueryClientContext.Provider>;
}

export function useQueryClientContext() {
  const ctx = useContext(QueryClientContext);
  if (!ctx) throw new Error('useQueryClientContext must be used within QueryProvider');
  return ctx;
}
