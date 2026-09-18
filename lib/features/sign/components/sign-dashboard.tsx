'use client';

import Link from 'next/link';
import { BarChart3, FileText, PenLine, Send, Clock, Check, AlertCircle, FileX, Plus } from 'lucide-react';
import { StatusPill } from '@/lib/features/sign/components/status-badge';
import { formatRelativeDate } from '@/lib/features/sign/utils/format';
import type { SigningRequest, SigningStats } from '@/lib/features/sign/api/sign.types';
import { useSigningStats, useSigningRequests } from '@/lib/features/sign/hooks/sign-queries';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { Skeleton } from '@/components/ui/skeleton';

export function SignDashboard() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? null;

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="border-b border-border px-6 py-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="eyebrow">Workspace</span>
          <span className="text-xs font-medium text-muted-foreground">
            {activeWorkspace?.name ?? 'Loading…'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sign</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage documents and signing requests
            </p>
          </div>
            <Link
              href="/sign/new"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
            <Plus size={14} />
            New signing request
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <DashboardContent workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ workspaceId }: { workspaceId: string | null }) {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSigningStats(workspaceId);
  const {
    data: recentData,
    isLoading: recentLoading,
    error: recentError,
  } = useSigningRequests(workspaceId, { limit: 10 });

  if (statsError || recentError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Unable to load signing activity</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {statsError?.message ?? recentError?.message}
          </p>
        </div>
        <button
          className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <StatsCards stats={stats} loading={statsLoading} />
      <StatusSections stats={stats} />
      <RecentRequestsSection requests={recentData?.data ?? null} loading={recentLoading} />
    </>
  );
}

function StatsCards({ stats, loading }: { stats: SigningStats | undefined; loading: boolean }) {
  const entries = [
    { label: 'Drafts', value: stats?.byStatus?.draft ?? 0, icon: PenLine },
    { label: 'Sent', value: stats?.byStatus?.sent ?? 0, icon: Send },
    { label: 'In Progress', value: stats?.byStatus?.in_progress ?? 0, icon: Clock },
    { label: 'Completed', value: stats?.byStatus?.completed ?? 0, icon: Check },
  ];

  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map((e) => (
          <Skeleton key={e.label} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entries.map((card) => (
        <div key={card.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
            <card.icon size={14} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_SECTIONS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Requests', icon: BarChart3 },
  { id: 'draft', label: 'Drafts', icon: PenLine },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'in-progress', label: 'In Progress', icon: Clock },
  { id: 'completed', label: 'Completed', icon: Check },
];

function StatusSections({ stats }: { stats: SigningStats | undefined }) {
  if (!stats) return null;

  const countByStatus: Record<string, number> = {
    all: stats.total,
    draft: stats.byStatus?.draft ?? 0,
    sent: stats.byStatus?.sent ?? 0,
    in_progress: stats.byStatus?.in_progress ?? 0,
    completed: stats.byStatus?.completed ?? 0,
    declined: stats.byStatus?.declined ?? 0,
    expired: stats.byStatus?.expired ?? 0,
  };

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-semibold">By status</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STATUS_SECTIONS.map((s) => {
          const count = countByStatus[s.id] ?? 0;
          if (count === 0 && s.id !== 'all') return null;
          return (
            <Link
              key={s.id}
              href={s.id === 'all' ? '/sign/all' : `/sign/${s.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40"
            >
              <div className="flex items-center gap-2.5">
                <s.icon size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <span className="text-sm font-semibold">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentRequestsSection({
  requests,
  loading,
}: {
  requests: SigningRequest[] | null;
  loading: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent requests</h2>
        {requests && requests.length > 0 && (
          <Link href="/sign/all" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && requests !== null && requests.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <FileText size={28} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-semibold">No signing requests yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first signing request to get started.
          </p>
          <Link
            href="/sign/new"
            className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus size={14} />
            New signing request
          </Link>
        </div>
      )}

      {!loading && requests !== null && requests.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/sign/${request.id}`}
              className="block w-full px-4 py-3 text-left hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-muted-foreground" />
                    <span className="font-semibold text-foreground">{request.title}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusPill status={request.status} />
                    <span>·</span>
                    <span>{formatRelativeDate(request.updatedAt)}</span>
                  </div>
                </div>
                <StatusPill status={request.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
