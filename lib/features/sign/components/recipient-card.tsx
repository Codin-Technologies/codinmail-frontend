'use client';

import { SigningRecipient } from '@/lib/features/sign/api/sign.types';
import { StatusBadge } from '@/lib/features/sign/components/status-badge';
import { RecipientSigningModal } from '@/lib/features/sign/components/recipient-signing';
import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import { initials, recipientAvatarColor, formatDateTime } from '@/lib/features/sign/utils/format';
import { getAvailableRecipientActions, actionLabel } from '@/lib/features/sign/utils/state';
import { Mail, CheckCircle, Clock, Eye } from 'lucide-react';
import { useState } from 'react';
import { useWorkspace } from '@/lib/stores/workspace-context';

const RECIPIENT_ACTION_ICONS: Record<string, JSX.Element> = {
  sign: <CheckCircle size={14} />,
  approve: <CheckCircle size={14} />,
  reject: <Mail size={14} />,
  decline: <Mail size={14} />,
  request_changes: <Clock size={14} />,
  complete_review: <Eye size={14} />,
};

export function RecipientCard({
  recipient,
  onAction,
}: {
  recipient: SigningRecipient;
  onAction: () => void;
}) {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? '';
  const [showSigningModal, setShowSigningModal] = useState(false);
  const avatarColor = recipientAvatarColor(recipient.email);
  const actions = getAvailableRecipientActions(recipient);

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold',
              avatarColor === 'coral' && 'bg-corald/10 text-coral',
              avatarColor === 'slate' && 'bg-slate-200/50 text-slate-700',
              avatarColor === 'gold' && 'bg-amber-100 text-amber-700',
              avatarColor === 'green' && 'bg-green-100 text-green-700',
              avatarColor === 'blue' && 'bg-blue-100 text-blue-700',
              avatarColor === 'purple' && 'bg-purple-100 text-purple-700',
              avatarColor === 'teal' && 'bg-teal-100 text-teal-700',
            )}
          >
            {initials(recipient.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{recipient.name}</p>
              <StatusBadge status={recipient.status} variant="outline" />
            </div>
            <p className="text-xs text-muted-foreground">{recipient.email}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {recipient.role} • {recipient.recipientType}
            </p>
            {recipient.notifiedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Notified {formatDateTime(recipient.notifiedAt)}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {actions.slice(0, 2).map((action) => (
                <button
                  key={action}
                  onClick={() => setShowSigningModal(true)}
                  className="inline-flex h-6 items-center gap-1 rounded-md bg-primary/10 px-2 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  {RECIPIENT_ACTION_ICONS[action] ?? <Mail size={14} />}
                  {actionLabel(action)}
                </button>
              ))}
              {actions.length > 2 && (
                <span className="text-xs text-muted-foreground">+{actions.length - 2} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      {showSigningModal && (
        <RecipientSigningModal
          recipient={recipient}
          workspaceId={workspaceId}
          requestId={recipient.signingRequestId}
          onClose={() => setShowSigningModal(false)}
          onActionCompleted={onAction}
        />
      )}
    </>
  );
}
