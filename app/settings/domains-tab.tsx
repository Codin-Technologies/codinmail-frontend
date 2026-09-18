'use client';

import { useState, Suspense } from 'react';
import { Globe2, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useDomains,
  useAddDomain,
  useDeleteDomain,
  useVerifyDomain,
  useCheckDns,
} from '@/lib/features/domains/hooks/use-domains';
import type { DomainWithVerification } from '@/lib/features/domains/api/domain.types';

interface DomainsTabProps {
  activeWorkspace: { id: string; name: string } | null;
}

function DomainsListContent({ activeWorkspace }: { activeWorkspace: { id: string; name: string } | null }) {
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{ domainId: string; error?: string; success?: string } | null>(null);
  const [createdVerification, setCreatedVerification] = useState<{ name: string; host: string; type: string; value: string } | null>(null);
  const [copiedValue, setCopiedValue] = useState(false);

  const { data: domains, isLoading: domainsLoading, error: domainsError } = useDomains(activeWorkspace?.id ?? null);
  const addDomainMutation = useAddDomain();
  const deleteDomainMutation = useDeleteDomain();
  const verifyDomainMutation = useVerifyDomain();
  const checkDnsMutation = useCheckDns();

  if (!activeWorkspace) {
    return <div className="text-sm text-muted-foreground">Select a workspace to manage domains.</div>;
  }

  const handleVerify = async (domainId: string) => {
    setVerificationFeedback(null);
    try {
      await verifyDomainMutation.mutateAsync({ workspaceId: activeWorkspace.id, domainId });
      setVerificationFeedback({ domainId, success: 'Domain verified successfully!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please check your DNS TXT record.';
      setVerificationFeedback({ domainId, error: msg });
    }
  };

  const handleCheckDns = async (domainId: string) => {
    setVerificationFeedback(null);
    try {
      const records = await checkDnsMutation.mutateAsync({ workspaceId: activeWorkspace.id, domainId });
      const valid = records.some((r) => r.status === 'valid');
      if (valid) {
        setVerificationFeedback({ domainId, success: 'Valid DNS records detected!' });
      } else {
        setVerificationFeedback({ domainId, error: 'DNS record not found or still propagating.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query DNS.';
      setVerificationFeedback({ domainId, error: msg });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 2000);
  };

  return (
    <>
      {domainsError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          Failed to load domains: {domainsError instanceof Error ? domainsError.message : 'Unknown error'}
        </div>
      )}

      {createdVerification && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">DNS Setup for {createdVerification.name}</span>
            <button
              onClick={() => setCreatedVerification(null)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
          <p className="mt-1 text-muted-foreground">
            Add this TXT record to your domain provider to verify ownership:
          </p>
          <div className="mt-2.5 flex items-center justify-between rounded bg-muted/60 px-3 py-2 font-mono text-[11px]">
            <span>
              Type: <strong>{createdVerification.type}</strong> | Host: <strong>{createdVerification.host}</strong> | Value: {createdVerification.value}
            </span>
            <button
              onClick={() => copyToClipboard(createdVerification.value)}
              className="ml-2 flex items-center gap-1 rounded bg-background px-2 py-1 text-[10px] font-sans hover:bg-accent"
            >
              {copiedValue ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedValue ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {domainsLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : !domains || domains.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
          <Globe2 className="mx-auto h-8 w-8 text-muted-foreground" />
          <h4 className="mt-3 text-sm font-semibold text-foreground">No domains connected</h4>
          <p className="mt-1 text-xs text-muted-foreground">Add a domain to configure email routing for this workspace.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => {
            const isVerified = domain.status === 'verified' || domain.status === 'active';
            const feedback = verificationFeedback?.domainId === domain.id ? verificationFeedback : null;

            return (
              <div key={domain.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{domain.name}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isVerified
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isVerified ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                      {domain.status}
                    </span>
                    {domain.mailEnabled && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Mail Enabled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isVerified && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px]"
                          disabled={checkDnsMutation.isPending}
                          onClick={() => handleCheckDns(domain.id)}
                        >
                          <RefreshCw className={`mr-1 h-3 w-3 ${checkDnsMutation.isPending ? 'animate-spin' : ''}`} />
                          Check DNS
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-[11px]"
                          disabled={verifyDomainMutation.isPending}
                          onClick={() => handleVerify(domain.id)}
                        >
                          Verify
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => deleteDomainMutation.mutate({ workspaceId: activeWorkspace.id, domainId: domain.id })}
                      disabled={deleteDomainMutation.isPending}
                      className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"
                      title="Remove domain"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {feedback?.error && (
                  <div className="mt-2 text-[11px] text-destructive">
                    {feedback.error}
                  </div>
                )}
                {feedback?.success && (
                  <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                    {feedback.success}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <Button variant="outline" className="h-9 text-xs font-semibold" onClick={() => { setShowAddDomain(true); setAddError(null); }}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Domain
        </Button>
      </div>

      {showAddDomain && activeWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Add Domain</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Enter the domain name you wish to associate with this workspace.
            </p>
            <input
              type="text"
              placeholder="example.com"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {addError && (
              <p className="mt-2 text-xs text-destructive">{addError}</p>
            )}
            <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" className="h-9 text-xs" onClick={() => setShowAddDomain(false)}>
                Cancel
              </Button>
              <Button
                className="h-9 text-xs font-semibold"
                disabled={addDomainMutation.isPending || !newDomainName.trim()}
                onClick={async () => {
                  if (!newDomainName.trim()) return;
                  setAddError(null);
                  try {
                    const res = await addDomainMutation.mutateAsync({
                      workspaceId: activeWorkspace.id,
                      input: { name: newDomainName.trim().toLowerCase() },
                    }) as unknown as DomainWithVerification;
                    if (res && res.verification) {
                      setCreatedVerification({
                        name: res.name || newDomainName.trim(),
                        type: res.verification.type || 'TXT',
                        host: res.verification.host || '@',
                        value: res.verification.value || '',
                      });
                    }
                    setNewDomainName('');
                    setShowAddDomain(false);
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Failed to add domain';
                    setAddError(msg);
                  }
                }}
              >
                {addDomainMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export function DomainsTabContent({ activeWorkspace }: DomainsTabProps) {
  return (
    <Suspense fallback={<div className="space-y-2"><div className="h-16 rounded-lg border border-border bg-card animate-pulse" /><div className="h-16 rounded-lg border border-border bg-card animate-pulse" /></div>}>
      <DomainsListContent activeWorkspace={activeWorkspace} />
    </Suspense>
  );
}