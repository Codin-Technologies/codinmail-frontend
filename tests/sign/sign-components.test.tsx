/// <reference types="vitest/globals" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import React from 'react';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('StatusBadge Component', () => {
  it('renders status with correct label', async () => {
    const { StatusBadge } = await import('@/lib/features/sign/components/status-badge');
    render(
      <TestWrapper>
        <StatusBadge status="completed" />
      </TestWrapper>
    );
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders outline variant', async () => {
    const { StatusBadge } = await import('@/lib/features/sign/components/status-badge');
    render(
      <TestWrapper>
        <StatusBadge status="in_progress" variant="outline" />
      </TestWrapper>
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});

describe('ProgressIndicator Component', () => {
  it('renders progress bar with correct percentage', async () => {
    const { ProgressIndicator } = await import('@/lib/features/sign/components/progress-indicator');
    const { container } = render(
      <TestWrapper>
        <ProgressIndicator completed={2} total={4} label="50% complete" />
      </TestWrapper>
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('handles zero recipients', async () => {
    const { ProgressIndicator } = await import('@/lib/features/sign/components/progress-indicator');
    const { container } = render(
      <TestWrapper>
        <ProgressIndicator completed={0} total={0} />
      </TestWrapper>
    );
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('State Utility Functions', () => {
  describe('canTransition', () => {
    it('allows valid request transitions', async () => {
      const { canTransition } = await import('@/lib/features/sign/utils/state');
      expect(canTransition('draft', 'sent')).toBe(true);
      expect(canTransition('draft', 'cancelled')).toBe(true);
      expect(canTransition('sent', 'in_progress')).toBe(true);
      expect(canTransition('sent', 'completed')).toBe(true);
    });

    it('prevents invalid request transitions', async () => {
      const { canTransition } = await import('@/lib/features/sign/utils/state');
      expect(canTransition('draft', 'completed')).toBe(false);
      expect(canTransition('completed', 'sent')).toBe(false);
      expect(canTransition('cancelled', 'sent')).toBe(false);
    });
  });

  describe('canRecipientTransition', () => {
    it('allows valid recipient transitions', async () => {
      const { canRecipientTransition } = await import('@/lib/features/sign/utils/state');
      expect(canRecipientTransition('pending', 'notified')).toBe(true);
      expect(canRecipientTransition('notified', 'viewed')).toBe(true);
      expect(canRecipientTransition('viewed', 'signed')).toBe(true);
      expect(canRecipientTransition('signed', 'completed')).toBe(true);
    });

    it('prevents invalid recipient transitions', async () => {
      const { canRecipientTransition } = await import('@/lib/features/sign/utils/state');
      expect(canRecipientTransition('signed', 'pending')).toBe(false);
      expect(canRecipientTransition('declined', 'signed')).toBe(false);
      expect(canRecipientTransition('completed', 'signed')).toBe(false);
    });
  });

  describe('canEditRequest / canSendRequest / canCancelRequest', () => {
    const mockRequest = (status: string) => ({ status });

    it('allows editing draft requests', async () => {
      const { canEditRequest } = await import('@/lib/features/sign/utils/state');
      expect(canEditRequest(mockRequest('draft') as any)).toBe(true);
      expect(canEditRequest(mockRequest('sent') as any)).toBe(true);
      expect(canEditRequest(mockRequest('completed') as any)).toBe(false);
    });

    it('allows sending only draft requests', async () => {
      const { canSendRequest } = await import('@/lib/features/sign/utils/state');
      expect(canSendRequest(mockRequest('draft') as any)).toBe(true);
      expect(canSendRequest(mockRequest('sent') as any)).toBe(false);
    });

    it('allows cancelling draft, sent, in_progress', async () => {
      const { canCancelRequest } = await import('@/lib/features/sign/utils/state');
      expect(canCancelRequest(mockRequest('draft') as any)).toBe(true);
      expect(canCancelRequest(mockRequest('sent') as any)).toBe(true);
      expect(canCancelRequest(mockRequest('in_progress') as any)).toBe(true);
      expect(canCancelRequest(mockRequest('completed') as any)).toBe(false);
    });

    it('allows deleting draft, sent, cancelled, declined, expired', async () => {
      const { canDeleteRequest } = await import('@/lib/features/sign/utils/state');
      expect(canDeleteRequest(mockRequest('draft') as any)).toBe(true);
      expect(canDeleteRequest(mockRequest('completed') as any)).toBe(false);
      expect(canDeleteRequest(mockRequest('in_progress') as any)).toBe(false);
    });
  });

  describe('getAvailableRecipientActions', () => {
    it('returns sign/decline for active signers', async () => {
      const { getAvailableRecipientActions } = await import('@/lib/features/sign/utils/state');
      const recipient = { status: 'action_required', role: 'signer' };
      expect(getAvailableRecipientActions(recipient as any)).toEqual(['sign', 'decline']);
    });

    it('returns approve/reject/decline for approvers', async () => {
      const { getAvailableRecipientActions } = await import('@/lib/features/sign/utils/state');
      const recipient = { status: 'notified', role: 'approver' };
      const actions = getAvailableRecipientActions(recipient as any);
      expect(actions).toContain('approve');
      expect(actions).toContain('reject');
      expect(actions).toContain('decline');
    });

    it('returns empty for completed recipients', async () => {
      const { getAvailableRecipientActions } = await import('@/lib/features/sign/utils/state');
      const recipient = { status: 'completed', role: 'signer' };
      expect(getAvailableRecipientActions(recipient as any)).toEqual([]);
    });
  });

  describe('actionLabel', () => {
    it('returns human-readable labels', async () => {
      const { actionLabel } = await import('@/lib/features/sign/utils/state');
      expect(actionLabel('sign')).toBe('Sign');
      expect(actionLabel('request_changes')).toBe('Request Changes');
      expect(actionLabel('complete_review')).toBe('Complete Review');
    });
  });
});

describe('Format Utility Functions', () => {
  it('formats bytes correctly', async () => {
    const { formatBytes } = await import('@/lib/features/sign/utils/format');
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(2_400_000)).toBe('2.3 MB');
  });

  it('formats dates', async () => {
    const { formatDate, formatDateTime, formatRelativeDate } = await import('@/lib/features/sign/utils/format');
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatRelativeDate(null)).toBe('—');
  });

  it('detects expired dates', async () => {
    const { isExpired } = await import('@/lib/features/sign/utils/format');
    expect(isExpired(null)).toBe(false);
    expect(isExpired('2020-01-01')).toBe(true);
    expect(isExpired('2099-01-01')).toBe(false);
  });

  it('calculates days until expiration', async () => {
    const { getDaysUntilExpiration } = await import('@/lib/features/sign/utils/format');
    expect(getDaysUntilExpiration(null)).toBe(null);
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(getDaysUntilExpiration(future)).toBe(3);
  });

  it('truncates long strings', async () => {
    const { truncate } = await import('@/lib/features/sign/utils/format');
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello world', 8)).toBe('hello w…');
  });

  it('generates initials', async () => {
    const { initials } = await import('@/lib/features/sign/utils/format');
    expect(initials('John Doe')).toBe('JD');
    expect(initials('Alice')).toBe('A');
    expect(initials('Bob Smith Jones')).toBe('BS');
  });

  it('generates avatar colors', async () => {
    const { recipientAvatarColor } = await import('@/lib/features/sign/utils/format');
    const color = recipientAvatarColor('test@example.com');
    expect(typeof color).toBe('string');
    expect(['coral', 'slate', 'gold', 'green', 'blue', 'purple', 'teal']).toContain(color);
  });
});
