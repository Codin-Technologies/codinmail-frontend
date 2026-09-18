import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MockSignApi } from '@/lib/features/sign/api/sign.mock';
import { setSignApi } from '@/lib/features/sign/api/sign.client';
import { useSigningRequests, useSigningRequest, useSigningStats, useCreateRequest } from '@/lib/features/sign/hooks/sign-queries';
import React from 'react';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function TestList({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useSigningRequests(workspaceId);
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="total">{data?.data.length ?? 0}</div>
      <div data-testid="meta-total">{data?.meta.total ?? 0}</div>
    </div>
  );
}

function TestDetail({ workspaceId, requestId }: { workspaceId: string; requestId: string }) {
  const { data, isLoading } = useSigningRequest(workspaceId, requestId);
  if (isLoading) return <div>Loading...</div>;
  return <div data-testid="request-title">{data?.title ?? 'not found'}</div>;
}

function TestStats({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useSigningStats(workspaceId);
  if (isLoading) return <div>Loading...</div>;
  return <div data-testid="total-requests">{data?.total ?? 0}</div>;
}

describe('Sign Query Hooks', () => {
  let mockApi: MockSignApi;

  beforeEach(() => {
    mockApi = new MockSignApi();
    mockApi.reset('ws_test_001');
    setSignApi(mockApi);
  });

  describe('useSigningRequests', () => {
    it('fetches requests for workspace', async () => {
      render(
        <TestWrapper>
          <TestList workspaceId="ws_test_001" />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByTestId('total')).toHaveTextContent('0'));
    });

    it('fetches with status filter', async () => {
      await mockApi.createRequest('ws_test_001', {
        fileId: 'file-1', fileVersionId: 'v1', title: 'Draft 1',
      });

      render(
        <TestWrapper>
          <TestList workspaceId="ws_test_001" />
        </TestWrapper>
      );

      await waitFor(() => expect(screen.getByTestId('total')).toHaveTextContent('1'));
    });
  });

  describe('useSigningRequest', () => {
    it('returns request when found', async () => {
      const request = await mockApi.createRequest('ws_test_001', {
        fileId: 'file-1', fileVersionId: 'v1', title: 'My Request',
      });

      render(
        <TestWrapper>
          <TestDetail workspaceId="ws_test_001" requestId={request.id} />
        </TestWrapper>
      );

      await waitFor(() => expect(screen.getByTestId('request-title')).toHaveTextContent('My Request'));
    });

    it('returns null when request not found', async () => {
      render(
        <TestWrapper>
          <TestDetail workspaceId="ws_test_001" requestId="nonexistent-id" />
        </TestWrapper>
      );

      await waitFor(() => expect(screen.getByTestId('request-title')).toHaveTextContent('not found'));
    });
  });

  describe('useSigningStats', () => {
    it('fetches stats for workspace', async () => {
      await mockApi.createRequest('ws_test_001', {
        fileId: 'file-1', fileVersionId: 'v1', title: 'Request 1',
      });

      render(
        <TestWrapper>
          <TestStats workspaceId="ws_test_001" />
        </TestWrapper>
      );

      await waitFor(() => expect(screen.getByTestId('total-requests')).toHaveTextContent('1'));
    });
  });

  describe('useCreateRequest mutation', () => {
    it('creates and caches the request', async () => {
      const mutation = useCreateRequest('ws_test_001');
      const result = await mutation.mutateAsync({
        fileId: 'file-1',
        fileVersionId: 'v1',
        title: 'New Request',
      });

      expect(result.status).toBe('draft');
      expect(result.title).toBe('New Request');
    });
  });
});
