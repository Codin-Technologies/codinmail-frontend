import type { SigningRequest, SigningRequestStatus } from '@/lib/features/sign/api/sign.types';
import {
  SIGNING_STATUS_LABELS,
  RECIPIENT_STATUS_LABELS,
  type RecipientStatus,
  canTransition,
  canRecipientTransition,
} from '@/lib/features/sign/api/sign.types';
import type { SigningRecipient } from '@/lib/features/sign/api/sign.types';

export { SIGNING_STATUS_LABELS, RECIPIENT_STATUS_LABELS, canTransition, canRecipientTransition };

export function statusLabel(status: SigningRequestStatus): string {
  return SIGNING_STATUS_LABELS[status] ?? status;
}

export function recipientStatusLabel(status: RecipientStatus): string {
  return RECIPIENT_STATUS_LABELS[status] ?? status;
}

export function requestProgress(recipients: SigningRecipient[]): {
  completed: number;
  total: number;
  percentage: number;
  nextRecipient: SigningRecipient | null;
} {
  const total = recipients.length;
  const completed = recipients.filter(
    (r) => r.status === 'signed' || r.status === 'approved' || r.status === 'completed'
  ).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextRecipient =
    recipients.find(
      (r) =>
        r.status === 'pending' ||
        r.status === 'notified' ||
        r.status === 'viewed' ||
        r.status === 'action_required'
    ) ?? null;

  return { completed, total, percentage, nextRecipient };
}

export function getAvailableRecipientActions(recipient: SigningRecipient): string[] {
  const { status, role } = recipient;
  const actions: string[] = [];

   if (status === 'pending' || status === 'notified' || status === 'viewed' || status === 'action_required') {
     if (role === 'signer') {
       actions.push('sign', 'decline');
     } else if (role === 'approver') {
      actions.push('approve', 'reject', 'decline');
    } else if (role === 'reviewer') {
      actions.push('approve', 'request_changes', 'decline');
    } else if (role === 'viewer') {
      actions.push('complete_review');
    }
  }

  return actions;
}

export function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    sign: 'Sign',
    decline: 'Decline',
    approve: 'Approve',
    reject: 'Reject',
    request_changes: 'Request Changes',
    complete_review: 'Complete Review',
  };
  return labels[action] ?? action;
}

export function canEditRequest(request: SigningRequest): boolean {
  return request.status === 'draft' || request.status === 'sent';
}

export function canSendRequest(request: SigningRequest): boolean {
  return request.status === 'draft';
}

export function canCancelRequest(request: SigningRequest): boolean {
  return request.status === 'draft' || request.status === 'sent' || request.status === 'in_progress';
}

export function canDeleteRequest(request: SigningRequest): boolean {
  return request.status === 'draft' || request.status === 'sent' || request.status === 'cancelled' || request.status === 'declined' || request.status === 'expired';
}
