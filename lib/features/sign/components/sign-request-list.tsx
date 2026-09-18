'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc, RefreshCw, FileText, Send, Clock, Check, PenLine, AlertCircle, FileX, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { StatusPill } from '@/lib/features/sign/components/status-badge';
import { formatRelativeDate } from '@/lib/features/sign/utils/format';
import type { SigningRequest, SigningRequestStatus } from '@/lib/features/sign/api/sign.types';
import { useSigningRequests } from '@/lib/features/sign/hooks/sign-queries';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { id: string; label: string; value: SigningRequestStatus | 'all' }[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'draft', label: 'Draft', value: 'draft' },
  { id: 'sent', label: 'Sent', value: 'sent' },
  { id: 'in_progress', label: 'In Progress', value: 'in_progress' },
  { id: 'completed', label: 'Completed', value: 'completed' },
  { id: 'cancelled', label: 'Cancelled', value: 'cancelled' },
  { id: 'expired', label: 'Expired', value: 'expired' },
  { id: 'declined', label: 'Declined', value: 'declined' },
];

const SORT_OPTIONS: { id: string; label: string }[] = [
  { id: 'updatedAt', label: 'Last updated' },
  { id: 'createdAt', label: 'Created date' },
  { id: 'sentAt', label: 'Sent date' },
  { id: 'title', label: 'Name' },
];

export function SignRequestList({ initialStatus = 'all' }: { initialStatus?: string }) {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? null;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useSigningRequests(workspaceId, {
    status: statusFilter === 'all' ? undefined : (statusFilter as SigningRequestStatus),
    limit,
    offset: (page - 1) * limit,
  });

  const requests = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const filtered = useMemo(() => {
    let result = requests;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a] ?? '';
      const bVal = b[sortKey as keyof typeof b] ?? '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
    return result;
  }, [requests, searchQuery, sortKey, sortDir]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
            <h1 className="text-2xl font-semibold tracking-tight">
              {STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? 'All Requests'}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total} {total === 1 ? 'request' : 'requests'} in this view
            </p>
          </div>
          <Link
            href="/sign/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <FileText size={14} />
            New signing request
          </Link>
        </div>
      </div>

      <div className="border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search requests"
              aria-label="Search signing requests"
              className="h-8 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-xs font-medium transition-colors',
                  statusFilter === f.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-l border-border pl-3">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted"
              aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
              title={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortDir === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />}
            </button>
            <button
              onClick={() => refetch()}
              className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full border-b border-border first:rounded-t-lg last:rounded-b-lg" />
              ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <button
              className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <FileText size={28} className="text-muted-foreground" />
            <p className="text-sm font-semibold">
              {searchQuery ? 'No matching requests' : 'No signing requests'}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? 'Try a different search term or filter.'
                : 'Create a new signing request to get started.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {filtered.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || isLoading}
                    className="h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          'h-7 w-7 rounded border text-xs font-medium',
                          pageNum === page
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        )}
                        aria-label={`Page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || isLoading}
                    className="h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RequestRow({ request }: { request: SigningRequest }) {
  return (
    <Link
      href={`/sign/${request.id}`}
      className="flex items-center gap-4 px-4 py-3 text-left outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
    >
      <FileText size={16} className="text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{request.title}</span>
          <StatusPill status={request.status} />
        </div>
        {request.description && (
          <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
            {request.description}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Updated {formatRelativeDate(request.updatedAt)}</span>
          {request.sentAt && <span>Sent {formatRelativeDate(request.sentAt)}</span>}
          {request.expiresAt && (
            <span
              className={new Date(request.expiresAt) < new Date() ? 'text-red-600' : ''}
            >
              Expires {formatRelativeDate(request.expiresAt)}
            </span>
          )}
        </div>
      </div>
      <MoreHorizontal size={16} className="text-muted-foreground" />
    </Link>
  );
}
