'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Plus, Trash2, Send, FileText, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAvailableFiles } from '@/lib/features/sign/hooks/sign-queries';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { useSignStore, SignStoreProvider, SignStoreProviderInline } from '@/lib/features/sign/stores/sign-store';
import { getSignApi } from '@/lib/features/sign/api/sign.client';
import { signKeys } from '@/lib/features/sign/api/sign-query-keys';
import {
  type CreateSigningRequestInput,
  type AddRecipientInput,
  type RecipientRole,
  type WorkflowMode,
} from '@/lib/features/sign/api/sign.types';
import { formatBytes } from '@/lib/features/sign/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'document', label: 'Document', desc: 'Select a document' },
  { id: 'recipients', label: 'Recipients', desc: 'Add signers' },
  { id: 'order', label: 'Signing Order', desc: 'Configure workflow' },
  { id: 'review', label: 'Review & Send', desc: 'Review and send' },
] as const;

export function CreateRequestWizard() {
  return (
    <SignStoreProvider>
      <CreateRequestWizardInner />
    </SignStoreProvider>
  );
}

function CreateRequestWizardInner() {
  const { activeWorkspace } = useWorkspace();

  if (!activeWorkspace) return null;

  return <WizardBody workspaceId={activeWorkspace.id} workspaceName={activeWorkspace.name} />;
}

function WizardBody({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();
  const store = useSignStore();
  const [currentStep, setCurrentStep] = useState(store.step);

  useEffect(() => {
    if (store.step !== currentStep) {
      store.setStep(currentStep);
    }
  }, [currentStep, store]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      store.setStep(next);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      store.setStep(prev);
    }
  };

  const activeStep = STEPS[currentStep];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="eyebrow">Workspace</span>
          <span className="text-xs font-medium text-muted-foreground">
            {workspaceName}
          </span>
        </div>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New signing request</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{activeStep.desc}</p>
          </div>
          <Link
            href="/sign/all"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-6 flex items-center gap-2 text-xs">
          {STEPS.map((step, i) => (
            <StepIndicator
              key={step.id}
              index={i}
              label={step.label}
              active={i === currentStep}
              completed={i < currentStep}
            />
          ))}
        </div>

        <div className="space-y-4">
          {currentStep === 0 && <DocumentStep workspaceId={workspaceId} />}
          {currentStep === 1 && <RecipientsStep />}
          {currentStep === 2 && <SigningOrderStep />}
          {currentStep === 3 && <ReviewStep workspaceId={workspaceId} onComplete={() => router.push('/sign/all')} />}
        </div>
      </div>

      <div className="flex justify-between border-t border-border px-6 py-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={cn(
            'h-9 rounded-md px-3 text-xs font-semibold',
            currentStep === 0
              ? 'cursor-not-allowed text-muted-foreground'
              : 'border border-border bg-background text-foreground hover:bg-muted'
          )}
        >
          <ArrowLeft size={14} />
          Back
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed(currentStep, store)}
            className={cn(
              'h-9 rounded-md px-3 text-xs font-semibold text-primary-foreground',
              canProceed(currentStep, store)
                ? 'bg-primary hover:opacity-90'
                : 'cursor-not-allowed bg-muted'
            )}
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

function StepIndicator({
  index,
  label,
  active,
  completed,
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
          active
            ? 'bg-primary text-primary-foreground'
            : completed
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
        )}
      >
        {completed && <Check size={12} />}
        {!completed && index + 1}
      </div>
      <span
        className={cn(
          'hidden sm:inline',
          active ? 'font-medium text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </>
  );
}

function canProceed(step: number, store: ReturnType<typeof useSignStore>) {
  if (step === 0) return !!store.selectedFileId && !!store.selectedVersionId;
  if (step === 1) return store.recipients.length > 0;
  return true;
}

// ---- Document Step ----

function DocumentStep({ workspaceId }: { workspaceId: string }) {
  const { data: files, isLoading, error } = useAvailableFiles(workspaceId);
  const store = useSignStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <FileText size={24} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const fileItems = files ?? [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Select a document from Codin Files</h3>
      {fileItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <FileText size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-semibold">No documents found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add files to Codin Files to use them for signing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fileItems.map((file) => {
            const selected = store.selectedFileId === file.id;
            return (
              <FileCard
                key={file.id}
                file={file}
                selected={selected}
                onSelect={() => {
                  store.selectFile(
                    file.id,
                    file.displayName || file.name,
                    file.mimeType,
                    file.sizeBytes
                  );
                  store.selectVersion(file.currentVersionId, file.id);
                }}
              />
            );
          })}
        </div>
      )}

      {store.selectedFileId && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {store.selectedFileName}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            This document will be sent for signature.
          </p>
        </div>
      )}
    </div>
  );
}

function FileCard({
  file,
  selected,
  onSelect,
}: {
  file: { id: string; displayName?: string; name: string; mimeType: string; sizeBytes: number };
  selected: boolean;
  onSelect: () => void;
}) {
  const iconColor = file.mimeType?.includes('pdf')
    ? 'text-red-500'
    : file.mimeType?.includes('word') || file.mimeType?.includes('document')
      ? 'text-blue-600'
      : file.mimeType?.includes('spreadsheet') || file.mimeType?.includes('excel')
        ? 'text-green-600'
        : 'text-muted-foreground';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex h-full flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-border bg-card hover:border-border hover:bg-muted/40'
      )}
    >
      <div className="flex w-full items-start gap-2">
        <FileText size={16} className={iconColor} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{file.displayName || file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.sizeBytes ? formatBytes(file.sizeBytes) : ''}
          </p>
        </div>
        {selected && <Check size={14} className="mt-0.5 text-primary" />}
      </div>
    </button>
  );
}

// ---- Recipients Step ----

function RecipientsStep() {
  const store = useSignStore();

  const handleAdd = () => {
    store.addRecipient({
      id: `temp_${Date.now()}_${store.recipients.length}`,
      name: '',
      email: '',
      role: 'signer',
      recipientType: 'external',
      signingOrder: store.recipients.length,
    });
  };

  const handleRemove = (id: string) => {
    store.removeRecipient(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recipients</h3>
        <button
          onClick={handleAdd}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus size={12} />
          Add recipient
        </button>
      </div>

      {store.recipients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Users size={24} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-semibold">No recipients added</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add recipients who need to sign or review this document.
          </p>
          <button
            onClick={handleAdd}
            className="mt-3 h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Add recipient
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {store.recipients.map((r, index) => (
            <RecipientRow
              key={r.id}
              recipient={r}
              index={index}
              onUpdate={store.updateRecipient}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {store.recipients.length > 1 && (
        <p className="text-xs text-muted-foreground">
          You can configure the signing order in the next step.
        </p>
      )}
    </div>
  );
}

function RecipientRow({
  recipient,
  index,
  onUpdate,
  onRemove,
}: {
  recipient: {
    id: string;
    name: string;
    email: string;
    role: RecipientRole;
    recipientType: 'internal' | 'external';
    signingOrder: number;
  };
  index: number;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-muted">
          <span className="text-xs font-bold">{index + 1}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            placeholder="Full name"
            value={recipient.name}
            onChange={(e) => onUpdate(recipient.id, 'name', e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30"
          />
          <input
            type="email"
            placeholder="Email address"
            value={recipient.email}
            onChange={(e) => onUpdate(recipient.id, 'email', e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30"
          />
          <div className="flex items-center gap-2">
            <select
              value={recipient.role}
              onChange={(e) => onUpdate(recipient.id, 'role', e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-within:border-primary"
            >
              <option value="signer">Signer</option>
              <option value="approver">Approver</option>
              <option value="reviewer">Reviewer</option>
              <option value="viewer">Viewer</option>
            </select>
            <select
              value={recipient.recipientType}
              onChange={(e) => onUpdate(recipient.id, 'recipientType', e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-within:border-primary"
            >
              <option value="external">External</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => onRemove(recipient.id)}
          className="h-6 w-6 flex-shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Remove recipient"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ---- Signing Order Step ----

function SigningOrderStep() {
  const store = useSignStore();
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>(store.workflowMode);

  useEffect(() => {
    store.setWorkflowMode(workflowMode);
  }, [workflowMode, store]);

  const moveUp = (id: string) => {
    const recipients = [...store.recipients];
    const idx = recipients.findIndex((r) => r.id === id);
    if (idx > 0) {
      [recipients[idx], recipients[idx - 1]] = [recipients[idx - 1], recipients[idx]];
      recipients.forEach((r, i) => (r.signingOrder = i));
      store.setRecipients(recipients);
    }
  };

  const moveDown = (id: string) => {
    const recipients = [...store.recipients];
    const idx = recipients.findIndex((r) => r.id === id);
    if (idx < recipients.length - 1) {
      [recipients[idx], recipients[idx + 1]] = [recipients[idx + 1], recipients[idx]];
      recipients.forEach((r, i) => (r.signingOrder = i));
      store.setRecipients(recipients);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Signing order</h3>
        <p className="text-xs text-muted-foreground">
          Configure how recipients will receive and complete signing.
        </p>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="workflowMode"
            checked={workflowMode === 'parallel'}
            onChange={() => setWorkflowMode('parallel')}
            className="h-4 w-4 text-primary"
          />
          <span className="text-sm">Parallel — all recipients sign simultaneously</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="workflowMode"
            checked={workflowMode === 'sequential'}
            onChange={() => setWorkflowMode('sequential')}
            className="h-4 w-4 text-primary"
          />
          <span className="text-sm">Sequential — recipients sign in order</span>
        </label>
      </div>

      {workflowMode === 'sequential' ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Drag to reorder recipients in sequential signing order.
          </p>
          {store.recipients.map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {i + 1}.
              </span>
              <span className="flex-1 text-sm font-medium">{r.name || `Recipient ${i + 1}`}</span>
              <span className="text-xs text-muted-foreground">{r.email}</span>
              <button
                onClick={() => moveUp(r.id)}
                disabled={i === 0}
                className="h-5 w-5 rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
                aria-label="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(r.id)}
                disabled={i === store.recipients.length - 1}
                className="h-5 w-5 rounded text-muted-foreground hover:bg-muted disabled:opacity-50"
                aria-label="Move down"
              >
                ▼
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            All {store.recipients.length} recipient{store.recipients.length !== 1 ? 's' : ''} will
            receive their signing invitation simultaneously.
          </p>
          <div className="mt-3 space-y-1">
            {store.recipients.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-muted-foreground" />
                <span>{r.name || `Recipient ${i + 1}`}</span>
                <span className="text-muted-foreground capitalize">({r.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Review Step ----

function ReviewStep({
  workspaceId,
  onComplete,
}: {
  workspaceId: string;
  onComplete: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const store = useSignStore();
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState(store.title);
  const [description, setDescription] = useState(store.description);
  const [expiresAt, setExpiresAt] = useState(store.expiresAt);

  useEffect(() => {
    store.setTitle(title);
  }, [title, store]);

  useEffect(() => {
    store.setDescription(description);
  }, [description, store]);

  useEffect(() => {
    store.setExpiresAt(expiresAt);
  }, [expiresAt, store]);

  const createMutation = useMutation({
    mutationFn: (input: CreateSigningRequestInput) => getSignApi().createRequest(workspaceId, input),
  });

  const addRecipientMutation = useMutation({
    mutationFn: ({ requestId, input }: { requestId: string; input: AddRecipientInput }) =>
      getSignApi().addRecipient(workspaceId, requestId, input),
  });

  const sendMutation = useMutation({
    mutationFn: (requestId: string) => getSignApi().sendRequest(workspaceId, requestId),
  });

  const handleSend = async () => {
    if (!store.selectedFileId || !store.selectedVersionId) {
      toast.error('Please select a document');
      return;
    }
    if (store.recipients.length === 0) {
      toast.error('Add at least one recipient');
      return;
    }

    const validRecipients = store.recipients.every(
      (r) => r.name.trim() && r.email.trim() && r.email.includes('@')
    );
    if (!validRecipients) {
      toast.error('Please fill in all recipient details');
      return;
    }

    setIsSending(true);
    try {
      const request = await createMutation.mutateAsync({
        fileId: store.selectedFileId,
        fileVersionId: store.selectedVersionId,
        title: title || 'Untitled signing request',
        description,
        workflowMode: store.workflowMode,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      for (const r of store.recipients) {
        await addRecipientMutation.mutateAsync({
          requestId: request.id,
          input: {
            name: r.name,
            email: r.email,
            recipientType: r.recipientType,
            role: r.role,
            signingOrder: r.signingOrder,
          },
        });
      }

      toast.success('Signing request created');

      const updated = await sendMutation.mutateAsync(request.id);
      toast.success('Signing request sent successfully');
      qc.setQueryData(signKeys.detail(workspaceId, updated.id), updated);
      qc.invalidateQueries({ queryKey: signKeys.list(workspaceId, undefined) });
      router.push(`/sign/${updated.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold">Review and send</h3>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Document</h4>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <span className="font-medium">{store.selectedFileName || 'Not selected'}</span>
          </div>
          <input
            type="text"
            placeholder="Request title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 h-7 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus-within:border-primary"
            rows={3}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Recipients</h4>
          {store.recipients.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between py-1.5 text-sm">
              <div>
                <span className="font-medium">{r.name || 'Unnamed'}</span>
                <span className="text-muted-foreground"> — {r.email}</span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{r.role}</span>
            </div>
          ))}
          {store.recipients.length === 0 && (
            <p className="text-xs text-muted-foreground">No recipients added</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Settings</h4>
          <div className="text-sm">
            <span className="text-muted-foreground">Workflow:</span>{' '}
            <span className="font-medium capitalize">{store.workflowMode}</span>
          </div>
          {expiresAt && (
            <div className="mt-1 text-sm">
              <span className="text-muted-foreground">Expires:</span>{' '}
              <span className="font-medium">{expiresAt}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={isSending || !store.selectedFileId || store.recipients.length === 0}
        className="h-9 w-full rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {isSending ? 'Sending…' : 'Send for signature'}
      </button>
    </div>
  );
}

export { CreateRequestWizardInner as CreateRequestWizardWithProvider };
