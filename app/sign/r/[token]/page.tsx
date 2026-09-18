'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Shield, CheckCircle, ThumbsUp, ThumbsDown, Clock, Send } from 'lucide-react';
import { getSignApi } from '@/lib/features/sign/api/sign.client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { JSX } from 'react';
import type { SigningRequest, SigningRecipient, SigningActionType } from '@/lib/features/sign/api/sign.types';

export default function RecipientSigningPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [request, setRequest] = useState<SigningRequest | null>(null);
  const [recipient, setRecipient] = useState<SigningRecipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<SigningActionType | null>(null);

  useEffect(() => {
    if (!token) return;
    loadSigningContext();
  }, [token]);

  async function loadSigningContext() {
    setLoading(true);
    try {
      const api = getSignApi();
      const req = await api.getRequest('ws_demo_001', token);
      if (!req) {
        toast.error('Signing request not found');
        return;
      }
      setRequest(req);
      const recipients = await api.listRecipients?.('ws_demo_001', req.id) ?? [];
      const recipient = recipients[0];
      setRecipient(recipient ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load signing request');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: SigningActionType) {
    if (!request || !recipient || !token) return;
    setSelectedAction(action);

    try {
      const api = getSignApi();
      await api.recipientAction('ws_demo_001', request.id, recipient.id, {
        action,
        actorType: 'external',
        actorId: recipient.email,
      });

      toast.success(
        action === 'sign' ? 'Document signed' :
        action === 'approve' ? 'Approved' :
        action === 'decline' ? 'Declined' : 'Action completed'
      );
      loadSigningContext();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSelectedAction(null);
    }
  }

  if (loading || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading signing request…</p>
        </div>
      </div>
    );
  }

  const roleActions = getRoleActions(recipient?.role ?? 'signer');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-6">
        <div className="border-b border-border px-2 py-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h1 className="text-xl font-semibold">Codin Sign</h1>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">{request.title}</h2>
          {request.description && (
            <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>Document integrity verified</span>
          </div>

          {recipient && (
            <div className="mt-4 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-muted">
                  <span className="text-xs font-bold">
                    {recipient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{recipient.name}</p>
                  <p className="text-xs text-muted-foreground">{recipient.email}</p>
                </div>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Role: </span>
                <span className="font-medium capitalize">{recipient.role}</span>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Choose an action</label>
            <div className="grid grid-cols-2 gap-2">
              {roleActions.map((a) => (
                <button
                  key={a.value}
                  onClick={() => handleAction(a.value)}
                  disabled={selectedAction !== null}
                  className={cn(
                    'flex h-10 items-center justify-center gap-1.5 rounded-md border text-xs font-medium',
                    selectedAction === a.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {a.icon}
                  {selectedAction === a.value ? 'Processing…' : a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRoleActions(role: string): { value: SigningActionType; label: string; icon: JSX.Element }[] {
  switch (role) {
    case 'signer':
      return [
        { value: 'sign', label: 'Sign', icon: <CheckCircle size={14} /> },
        { value: 'decline', label: 'Decline', icon: <ThumbsDown size={14} /> },
      ];
    case 'approver':
      return [
        { value: 'approve', label: 'Approve', icon: <ThumbsUp size={14} /> },
        { value: 'reject', label: 'Reject', icon: <ThumbsDown size={14} /> },
        { value: 'decline', label: 'Decline', icon: <Clock size={14} /> },
      ];
    case 'reviewer':
      return [
        { value: 'approve', label: 'Approve', icon: <ThumbsUp size={14} /> },
        { value: 'request_changes', label: 'Request Changes', icon: <Clock size={14} /> },
        { value: 'decline', label: 'Decline', icon: <ThumbsDown size={14} /> },
      ];
    case 'viewer':
      return [
        { value: 'complete_review', label: 'Complete Review', icon: <CheckCircle size={14} /> },
      ];
    default:
      return [
        { value: 'sign', label: 'Sign', icon: <CheckCircle size={14} /> },
      ];
  }
}
