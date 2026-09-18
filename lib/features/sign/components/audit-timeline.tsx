'use client';

import { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle, Clock, User, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuditEvents } from '@/lib/features/sign/hooks/sign-queries';
import { cn } from '@/lib/utils';
import type { JSX } from 'react';
import type { SigningAuditEvent } from '@/lib/features/sign/api/sign.types';

const EVENT_ICONS: Record<string, JSX.Element> = {
  created: <FileText size={14} />,
  sent: <Send size={14} />,
  completed: <CheckCircle size={14} />,
  cancelled: <Trash2 size={14} />,
  declined: <Trash2 size={14} />,
  expired: <Clock size={14} />,
  updated: <FileText size={14} />,
  deleted: <Trash2 size={14} />,
  recipient_added: <User size={14} />,
  recipient_removed: <User size={14} />,
  recipient_sign: <CheckCircle size={14} />,
  recipient_approve: <CheckCircle size={14} />,
  recipient_reject: <Trash2 size={14} />,
  recipient_decline: <Trash2 size={14} />,
  recipient_request_changes: <Clock size={14} />,
  recipient_complete_review: <CheckCircle size={14} />,
  integrity_verified: <CheckCircle size={14} />,
};

function getEventLabel(event: SigningAuditEvent): string {
  const labels: Record<string, string> = {
    created: 'Request created',
    sent: 'Request sent',
    completed: 'Signing completed',
    cancelled: 'Request cancelled',
    declined: 'Request declined',
    expired: 'Request expired',
    updated: 'Request updated',
    deleted: 'Request deleted',
    recipient_added: 'Recipient added',
    recipient_removed: 'Recipient removed',
    recipient_sign: 'Recipient signed',
    recipient_approve: 'Recipient approved',
    recipient_reject: 'Recipient rejected',
    recipient_decline: 'Recipient declined',
    recipient_request_changes: 'Changes requested',
    recipient_complete_review: 'Review completed',
    integrity_verified: 'Integrity verified',
  };
  return labels[event.eventType] ?? event.eventType.replace(/_/g, ' ');
}

function actorLabel(event: SigningAuditEvent): string {
  if (event.actorType === 'user') return 'User';
  if (event.actorType === 'system') return 'System';
  if (event.actorType === 'external') return 'Recipient';
  return event.actorType;
}

export function AuditTimeline({
  workspaceId,
  requestId,
}: {
  workspaceId: string | null;
  requestId: string;
}) {
  const { data: events, isLoading, error, refetch } = useAuditEvents(workspaceId, requestId);
  const [expanded, setExpanded] = useState(false);

  const displayEvents = expanded ? events : events?.slice(0, 15);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Audit Trail</h3>
        <button
          onClick={() => refetch()}
          className="h-5 w-5 rounded text-muted-foreground hover:bg-muted"
          aria-label="Refresh audit trail"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {isLoading && (
        <div className="mt-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="mt-0.5 h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle size={14} />
          <span>Unable to load audit events.</span>
        </div>
      )}

      {events && events.length === 0 && !isLoading && (
        <p className="mt-3 text-xs text-muted-foreground">No audit events recorded.</p>
      )}

      {events && events.length > 0 && (
        <div className="mt-3 space-y-3">
          {displayEvents?.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div
                className={cn(
                  'flex-shrink-0 rounded-lg p-1',
                  event.eventType.includes('recipient') || event.eventType.includes('integrity')
                    ? 'bg-muted/50'
                    : 'bg-primary/10'
                )}
              >
                {EVENT_ICONS[event.eventType] ?? <AlertCircle size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{getEventLabel(event)}</p>
                <p className="text-xs text-muted-foreground">
                  {actorLabel(event)} • {event.actorId}
                </p>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <pre className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                    {JSON.stringify(event.metadata).slice(0, 80)}
                    {JSON.stringify(event.metadata).length > 80 && '…'}
                  </pre>
                )}
              </div>
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {new Date(event.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}

          {events && events.length > 15 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Show all {events.length} events
            </button>
          )}
        </div>
      )}
    </div>
  );
}
