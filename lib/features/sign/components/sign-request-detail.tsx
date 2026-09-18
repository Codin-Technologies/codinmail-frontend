'use client';

import {
  FileText,
  Send,
  Users,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { StatusPill } from '@/lib/features/sign/components/status-badge';
import { ProgressIndicator } from '@/lib/features/sign/components/progress-indicator';
import { AuditTimeline } from '@/lib/features/sign/components/audit-timeline';
import { IntegrityView } from '@/lib/features/sign/components/integrity-view';
import { CompletionView } from '@/lib/features/sign/components/completion-view';
import { RecipientCard } from '@/lib/features/sign/components/recipient-card';
import { useSigningRequest, useSigningRecipients, useCancelRequest } from '@/lib/features/sign/hooks/sign-queries';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { formatDateTime, isExpired } from '@/lib/features/sign/utils/format';
import { canCancelRequest, canSendRequest } from '@/lib/features/sign/utils/state';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? null;

  return <SignRequestDetailContent workspaceId={workspaceId} requestId={id} />;
}

function SignRequestDetailContent({
  workspaceId,
  requestId,
}: {
  workspaceId: string | null;
  requestId?: string;
}) {
  const { data: request, isLoading, error, refetch } = useSigningRequest(workspaceId, requestId ?? null);
  const { data: recipients = [], isLoading: recipientsLoading } = useSigningRecipients(
    workspaceId,
    requestId ?? null
  );
  const cancelMutation = useCancelRequest(workspaceId, request?.id ?? '');

  if (isLoading || !request) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-64 rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          {error ? error.message : 'Signing request not found'}
        </p>
        <Link
          href="/sign/all"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to all requests
        </Link>
      </div>
    );
  }

  const completedRecipients = recipients.filter(
    (r) =>
      r.status === 'signed' || r.status === 'approved' || r.status === 'completed'
  ).length;

  const progress =
    recipients.length > 0 ? (completedRecipients / recipients.length) * 100 : 0;

  return (
    <div>
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/sign/all"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Sign
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="font-mono text-xs text-muted-foreground">{request.id.slice(0, 8)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{request.title}</h1>
              <StatusPill status={request.status} />
            </div>
            {request.description && (
              <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            {canSendRequest(request) && (
              <Link
                href={`/sign/${request.id}/recipients`}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Send size={12} />
                Send
              </Link>
            )}
            {canCancelRequest(request) && request.status !== 'cancelled' && (
              <button
                onClick={async () => {
                  await cancelMutation.mutateAsync();
                  toast.success('Request cancelled');
                }}
                disabled={cancelMutation.isPending}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Archive size={12} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
          <ProgressIndicator
            completed={completedRecipients}
            total={recipients.length}
            currentStep={
              <span className="text-xs text-muted-foreground">
                {recipients.length} recipients • {request.workflowMode} workflow
              </span>
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <DocumentSection request={request} />
              <RecipientsSection
                recipients={recipients}
                isLoading={recipientsLoading}
                onRecipientAdded={() => refetch()}
              />
            </div>

            <aside className="space-y-6">
              <RequestMeta request={request} />
            </aside>
          </div>

          <div className="border-t border-border pt-6">
            <AuditTimeline workspaceId={workspaceId} requestId={request.id} />
          </div>

          {request.status === 'completed' && <CompletionView request={request} />}
          <IntegrityView workspaceId={workspaceId} requestId={request.id} />
        </div>
      </div>
    </div>
  );
}

function DocumentSection({ request }: { request: { title: string; mimeType: string; documentChecksum: string; fileId: string } }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">{request.title}</h3>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium text-foreground">{request.mimeType}</span>
        </div>
        <div>
          <span className="text-muted-foreground">File ID</span>
          <span className="font-mono text-foreground">{request.fileId.slice(0, 8)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Checksum (SHA-256)</span>
          <code className="block break-all font-mono text-xs text-foreground">{request.documentChecksum}</code>
        </div>
      </div>
    </div>
  );
}

function RecipientsSection({
  recipients,
  isLoading,
  onRecipientAdded,
}: {
  recipients: any[];
  isLoading: boolean;
  onRecipientAdded: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recipients ({recipients.length})</h3>
      </div>

      <div className="space-y-3">
        {recipients.map((r) => (
          <RecipientCard key={r.id} recipient={r} onAction={onRecipientAdded} />
        ))}
      </div>

      {recipients.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
          <Users size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-semibold">No recipients</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add recipients to this signing request.
          </p>
        </div>
      )}
    </div>
  );
}

function RequestMeta({ request }: { request: any }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Workflow</h4>
        <div className="text-sm">
          <span className="text-muted-foreground">Mode</span>
          <span className="ml-2 font-medium capitalize">{request.workflowMode}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Timeline</h4>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-muted-foreground">Created</span>
            <span className="ml-2 font-medium">{formatDateTime(request.createdAt)}</span>
          </div>
          {request.sentAt && (
            <div>
              <span className="text-muted-foreground">Sent</span>
              <span className="ml-2 font-medium">{formatDateTime(request.sentAt)}</span>
            </div>
          )}
          {request.completedAt && (
            <div>
              <span className="text-muted-foreground">Completed</span>
              <span className="ml-2 font-medium">{formatDateTime(request.completedAt)}</span>
            </div>
          )}
          {request.expiresAt && (
            <div>
              <span className="text-muted-foreground">Expires</span>
              <span className="ml-2 font-medium">
                {formatDateTime(request.expiresAt)}
                {isExpired(request.expiresAt) && (
                  <span className="ml-1 text-red-600">(Expired)</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
