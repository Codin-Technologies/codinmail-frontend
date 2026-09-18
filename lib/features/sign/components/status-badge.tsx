'use client';

import { cn } from '@/lib/utils';
import type { SigningRequestStatus, RecipientStatus } from '@/lib/features/sign/api/sign.types';
import { statusLabel, recipientStatusLabel } from '@/lib/features/sign/utils/state';
import { STATUS_COLORS, RECIPIENT_STATUS_COLORS } from '@/lib/features/sign/api/sign.types';

interface StatusBadgeProps {
  status: SigningRequestStatus | RecipientStatus;
  variant?: 'default' | 'outline' | 'dot';
  className?: string;
}

export function StatusBadge({ status, variant = 'dot', className }: StatusBadgeProps) {
  const isRecipient = ['pending', 'notified', 'viewed', 'action_required', 'signed', 'approved', 'rejected', 'declined', 'completed'].includes(status);
  const colorClass = isRecipient
    ? RECIPIENT_STATUS_COLORS[status as RecipientStatus]
    : STATUS_COLORS[status as SigningRequestStatus];

  const label = isRecipient ? recipientStatusLabel(status as RecipientStatus) : statusLabel(status as SigningRequestStatus);

  if (variant === 'outline') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium',
          colorClass,
          className
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {variant === 'dot' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: SigningRequestStatus }) {
  const colorMap: Record<SigningRequestStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    expired: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    declined: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', colorMap[status])}>
      {statusLabel(status)}
    </span>
  );
}
