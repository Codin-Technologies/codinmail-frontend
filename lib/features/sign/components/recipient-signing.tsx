'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { X, CheckCircle, Pen, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { SigningRecipient, SigningActionType } from '@/lib/features/sign/api/sign.types';
import { useRecipientAction } from '@/lib/features/sign/hooks/sign-queries';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function RecipientSigningModal({
  recipient,
  workspaceId,
  requestId,
  onClose,
  onActionCompleted,
}: {
  recipient: SigningRecipient;
  workspaceId: string;
  requestId: string;
  onClose: () => void;
  onActionCompleted: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState<SigningActionType | null>(null);
  const [comment, setComment] = useState('');
  const actionMutation = useRecipientAction(workspaceId, requestId, recipient.id);

  const roleActions = getRoleActions(recipient.role);

  const handleSubmit = async () => {
    if (!selectedAction) {
      toast.error('Select an action');
      return;
    }

    try {
      await actionMutation.mutateAsync({
        action: selectedAction,
        actorType: 'external',
        actorId: recipient.email,
        metadata: comment ? { comment } : undefined,
      });

      toast.success(
        selectedAction === 'sign'
          ? 'Document signed'
          : selectedAction === 'approve'
            ? 'Approved'
            : selectedAction === 'decline'
              ? 'Declined'
              : selectedAction === 'reject'
                ? 'Rejected'
                : selectedAction === 'request_changes'
                  ? 'Changes requested'
                  : 'Review completed'
      );

      onActionCompleted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Review and Sign — {recipient.name}</h2>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold',
              'bg-muted text-foreground'
            )}
          >
            {recipient.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{recipient.name}</p>
            <p className="text-xs text-muted-foreground">{recipient.email}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              Status: <span className="font-medium capitalize">{recipient.status}</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Role: {recipient.role} • Type: {recipient.recipientType}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground">
            Action
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roleActions.map((a) => (
              <ActionOption
                key={a.value}
                value={a.value}
                label={a.label}
                icon={a.icon}
                selected={selectedAction === a.value}
                onSelect={setSelectedAction}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary"
            rows={3}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={actionMutation.isPending || !selectedAction}
            className={cn(
              'h-8 rounded-md px-3 text-xs font-semibold text-primary-foreground',
              actionMutation.isPending || !selectedAction
                ? 'cursor-not-allowed bg-muted'
                : 'bg-primary hover:opacity-90'
            )}
          >
            {actionMutation.isPending ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionOption({
  value,
  label,
  icon,
  selected,
  onSelect,
}: {
  value: SigningActionType;
  label: string;
  icon: JSX.Element;
  selected: boolean;
  onSelect: (v: SigningActionType) => void;
}) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'flex h-9 items-center justify-center gap-1.5 rounded-md border text-xs font-medium',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground hover:bg-muted/40'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function getRoleActions(role: SigningRecipient['role']) {
  switch (role) {
    case 'signer':
      return [
        { value: 'sign' as SigningActionType, label: 'Sign', icon: <CheckCircle size={14} /> },
        { value: 'decline' as SigningActionType, label: 'Decline', icon: <ThumbsDown size={14} /> },
      ];
    case 'approver':
      return [
        { value: 'approve' as SigningActionType, label: 'Approve', icon: <ThumbsUp size={14} /> },
        { value: 'reject' as SigningActionType, label: 'Reject', icon: <ThumbsDown size={14} /> },
        { value: 'decline' as SigningActionType, label: 'Decline', icon: <Clock size={14} /> },
      ];
    case 'reviewer':
      return [
        { value: 'approve' as SigningActionType, label: 'Approve', icon: <ThumbsUp size={14} /> },
        { value: 'request_changes' as SigningActionType, label: 'Request Changes', icon: <Pen size={14} /> },
        { value: 'decline' as SigningActionType, label: 'Decline', icon: <Clock size={14} /> },
      ];
    case 'viewer':
      return [
        { value: 'complete_review' as SigningActionType, label: 'Complete Review', icon: <CheckCircle size={14} /> },
      ];
    default:
      return [
        { value: 'sign' as SigningActionType, label: 'Sign', icon: <CheckCircle size={14} /> },
      ];
  }
}
