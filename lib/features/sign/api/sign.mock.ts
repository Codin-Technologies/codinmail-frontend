import type { SignApi } from './sign.api';
import type {
  AddRecipientInput,
  CreateSigningRequestInput,
  FileRecord,
  FileVersionRecord,
  ListRequestsFilters,
  ListRequestsResult,
  RecipientActionInput,
  SigningAuditEvent,
  SigningCompletionRecord,
  SigningRecipient,
  SigningRequest,
  SigningRequestStatus,
  SigningStats,
  UpdateSigningRequestInput,
} from './sign.types';

import { canTransition, canRecipientTransition } from './sign.types';

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function nowISO(): string {
  return new Date().toISOString();
}

interface MockState {
  requests: SigningRequest[];
  recipients: SigningRecipient[];
  auditEvents: SigningAuditEvent[];
  completionRecords: SigningCompletionRecord[];
}

const workspaceStates: Record<string, MockState> = {};

function getState(workspaceId: string): MockState {
  if (!workspaceStates[workspaceId]) {
    workspaceStates[workspaceId] = createSeedState(workspaceId);
  }
  return workspaceStates[workspaceId];
}

function createSeedState(workspaceId: string): MockState {
  const state: MockState = {
    requests: [],
    recipients: [],
    auditEvents: [],
    completionRecords: [],
  };

  if (workspaceId === 'ws_demo_001') {
    const req1: SigningRequest = {
      id: uuid(),
      workspaceId,
      fileId: uuid(),
      fileVersionId: uuid(),
      title: 'Client Contract Agreement',
      description: 'Annual service agreement with ABC Logistics',
      status: 'in_progress',
      workflowMode: 'parallel',
      documentChecksum: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      mimeType: 'application/pdf',
      storageKey: `workspaces/${workspaceId}/files/${uuid()}/objects/v1`,
      createdBy: 'usr_demo_001',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const req2: SigningRequest = {
      id: uuid(),
      workspaceId,
      fileId: uuid(),
      fileVersionId: uuid(),
      title: 'NDA - Vendor Onboarding',
      description: '',
      status: 'completed',
      workflowMode: 'sequential',
      documentChecksum: 'f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5',
      mimeType: 'application/pdf',
      storageKey: `workspaces/${workspaceId}/files/${uuid()}/objects/v1`,
      createdBy: 'usr_demo_001',
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const req3: SigningRequest = {
      id: uuid(),
      workspaceId,
      fileId: uuid(),
      fileVersionId: uuid(),
      title: 'Q3 Financial Review',
      description: 'Quarterly financial review document',
      status: 'draft',
      workflowMode: 'parallel',
      documentChecksum: 'a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0c0d0e0f0a0b0',
      mimeType: 'application/pdf',
      storageKey: `workspaces/${workspaceId}/files/${uuid()}/objects/v1`,
      createdBy: 'usr_demo_001',
      sentAt: null,
      completedAt: null,
      expiresAt: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    state.requests = [req1, req2, req3];

    const recipients: SigningRecipient[] = [
      {
        id: uuid(),
        workspaceId,
        signingRequestId: req1.id,
        name: 'John Smith',
        email: 'john@fleetco.example',
        workspaceUserId: null,
        recipientType: 'external',
        role: 'signer',
        signingOrder: 0,
        status: 'signed',
        notifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuid(),
        workspaceId,
        signingRequestId: req1.id,
        name: 'Mary Jones',
        email: 'mary@fleetco.example',
        workspaceUserId: null,
        recipientType: 'external',
        role: 'approver',
        signingOrder: 1,
        status: 'action_required',
        notifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewedAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: uuid(),
        workspaceId,
        signingRequestId: req1.id,
        name: 'David Wilson',
        email: 'david@fleetco.example',
        workspaceUserId: null,
        recipientType: 'external',
        role: 'signer',
        signingOrder: 2,
        status: 'notified',
        notifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        viewedAt: null,
        completedAt: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    state.recipients = recipients;

    state.auditEvents = [
      { id: uuid(), workspaceId, signingRequestId: req1.id, actorType: 'user', actorId: 'usr_demo_001', eventType: 'created', metadata: {}, createdAt: req1.createdAt },
      { id: uuid(), workspaceId, signingRequestId: req1.id, actorType: 'user', actorId: 'usr_demo_001', eventType: 'sent', metadata: { recipientCount: '3' }, createdAt: req1.sentAt || '' },
      { id: uuid(), workspaceId, signingRequestId: req1.id, actorType: 'external', actorId: 'john@fleetco.example', eventType: 'recipient_sign', metadata: { recipientId: recipients[0].id }, createdAt: recipients[0].completedAt || '' },
    ];
  }

  return state;
}

export class MockSignApi implements SignApi {
  async listRequests(workspaceId: string, filters?: ListRequestsFilters): Promise<ListRequestsResult> {
    await wait(300 + Math.random() * 200);
    const state = getState(workspaceId);

    if (workspaceId === 'ws_forbidden') {
      throw { code: 'WORKSPACE_UNAUTHORIZED', message: 'Not a workspace member', status: 403 };
    }

    let rows = [...state.requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.status) {
      rows = rows.filter((r) => r.status === filters.status);
    }

    const total = rows.length;
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const data = rows.slice(offset, offset + limit);

    return { data, meta: { total, limit, offset } };
  }

  async getRequest(workspaceId: string, requestId: string): Promise<SigningRequest | null> {
    await wait(200 + Math.random() * 150);
    const state = getState(workspaceId);
    return state.requests.find((r) => r.id === requestId) ?? null;
  }

  async createRequest(
    workspaceId: string,
    input: CreateSigningRequestInput
  ): Promise<SigningRequest> {
    await wait(400 + Math.random() * 300);

    const state = getState(workspaceId);

    if (workspaceId === 'ws_forbidden') {
      throw { code: 'WORKSPACE_UNAUTHORIZED', message: 'Not a workspace member', status: 403 };
    }

    if (!input.fileId || !input.fileVersionId) {
      throw { code: 'FILE_NOT_FOUND', message: 'File not found', status: 404 };
    }

    if (!input.title || input.title.trim().length === 0) {
      throw { code: 'VALIDATION_ERROR', message: 'Title is required', status: 400 };
    }

    const request: SigningRequest = {
      id: uuid(),
      workspaceId,
      fileId: input.fileId,
      fileVersionId: input.fileVersionId,
      title: input.title,
      description: input.description ?? '',
      status: 'draft',
      workflowMode: input.workflowMode ?? 'parallel',
      documentChecksum: 'mock-checksum-' + uuid().replace(/-/g, ''),
      mimeType: 'application/pdf',
      storageKey: `workspaces/${workspaceId}/files/${input.fileId}/objects/mock`,
      createdBy: 'usr_demo_001',
      sentAt: null,
      completedAt: null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    state.requests.push(request);
    this.recordAudit(workspaceId, request.id, 'user', 'usr_demo_001', 'created', {});

    return request;
  }

  async updateRequest(
    workspaceId: string,
    requestId: string,
    patch: UpdateSigningRequestInput
  ): Promise<SigningRequest> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (!canTransition(request.status, request.status)) {
      // canTransition checks valid next states, but for update we need to check
      // the backend rule: only draft/sent can be updated
    }

    if (request.status !== 'draft' && request.status !== 'sent') {
      throw {
        code: 'INVALID_REQUEST',
        message: `Cannot update signing request in status: ${request.status}`,
        status: 409,
      };
    }

    Object.assign(request, patch, { updatedAt: nowISO() });
    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'updated', {
      patch: JSON.stringify(patch),
    });

    return request;
  }

  async deleteRequest(workspaceId: string, requestId: string): Promise<void> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (request.status === 'in_progress' || request.status === 'completed') {
      throw {
        code: 'INVALID_REQUEST',
        message: `Cannot delete signing request in status: ${request.status}`,
        status: 409,
      };
    }

    state.requests = state.requests.filter((r) => r.id !== requestId);
    state.recipients = state.recipients.filter((r) => r.signingRequestId !== requestId);
    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'deleted', {});
  }

  async sendRequest(workspaceId: string, requestId: string): Promise<SigningRequest> {
    await wait(500 + Math.random() * 300);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (!canTransition(request.status, 'sent')) {
      throw {
        code: 'INVALID_REQUEST',
        message: `Cannot send signing request from status: ${request.status}`,
        status: 409,
      };
    }

    const recipients = state.recipients.filter((r) => r.signingRequestId === requestId);
    if (recipients.length === 0) {
      throw {
        code: 'INVALID_REQUEST',
        message: 'Signing request must have at least one recipient',
        status: 422,
      };
    }

    request.status = 'sent';
    request.sentAt = nowISO();
    request.updatedAt = nowISO();

    for (const recipient of recipients) {
      recipient.status = 'notified';
      recipient.notifiedAt = nowISO();
      recipient.updatedAt = nowISO();
    }

    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'sent', {
      recipientCount: String(recipients.length),
    });

    if (request.workflowMode === 'sequential') {
      this.evaluateWorkflowCompletion(state, workspaceId, requestId, request);
    }

    return request;
  }

  async cancelRequest(workspaceId: string, requestId: string): Promise<SigningRequest> {
    await wait(400 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (!canTransition(request.status, 'cancelled')) {
      throw {
        code: 'INVALID_REQUEST',
        message: `Cannot cancel signing request from status: ${request.status}`,
        status: 409,
      };
    }

    request.status = 'cancelled';
    request.updatedAt = nowISO();

    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'cancelled', {});

    return request;
  }

  async addRecipient(
    workspaceId: string,
    requestId: string,
    input: AddRecipientInput
  ): Promise<SigningRecipient> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (request.status !== 'draft') {
      throw {
        code: 'INVALID_REQUEST',
        message: 'Can only add recipients to draft signing requests',
        status: 409,
      };
    }

    if (!input.name || input.name.trim().length === 0) {
      throw { code: 'VALIDATION_ERROR', message: 'Name is required', status: 400 };
    }

    if (!input.email || !input.email.includes('@')) {
      throw { code: 'VALIDATION_ERROR', message: 'Valid email is required', status: 400 };
    }

    const recipient: SigningRecipient = {
      id: uuid(),
      workspaceId,
      signingRequestId: requestId,
      name: input.name,
      email: input.email,
      workspaceUserId: input.workspaceUserId ?? null,
      recipientType: input.recipientType ?? 'external',
      role: input.role ?? 'signer',
      signingOrder: input.signingOrder ?? state.recipients.filter((r) => r.signingRequestId === requestId).length,
      status: 'pending',
      notifiedAt: null,
      viewedAt: null,
      completedAt: null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    state.recipients.push(recipient);
    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'recipient_added', {
      recipientId: recipient.id,
      email: input.email,
    });

    return recipient;
  }

  async removeRecipient(workspaceId: string, requestId: string, recipientId: string): Promise<void> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (request.status !== 'draft') {
      throw {
        code: 'INVALID_REQUEST',
        message: 'Can only remove recipients from draft signing requests',
        status: 409,
      };
    }

    const idx = state.recipients.findIndex(
      (r) => r.signingRequestId === requestId && r.id === recipientId
    );

    if (idx === -1) {
      throw { code: 'FILE_NOT_FOUND', message: 'Recipient not found', status: 404 };
    }

    state.recipients.splice(idx, 1);
    this.recordAudit(workspaceId, requestId, 'user', 'usr_demo_001', 'recipient_removed', {
      recipientId,
    });
  }

  async listRecipients(workspaceId: string, requestId: string): Promise<SigningRecipient[]> {
    await wait(200 + Math.random() * 100);
    const state = getState(workspaceId);
    return state.recipients.filter((r) => r.signingRequestId === requestId);
  }

  async recipientAction(
    workspaceId: string,
    requestId: string,
    recipientId: string,
    input: RecipientActionInput
  ): Promise<SigningRecipient> {
    await wait(400 + Math.random() * 300);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    const recipient = state.recipients.find((r) => r.id === recipientId);

    if (!recipient) {
      throw { code: 'FILE_NOT_FOUND', message: 'Recipient not found', status: 404 };
    }

    const validTransitions: Record<string, string> = {
      sign: 'signed',
      decline: 'declined',
      approve: 'approved',
      reject: 'rejected',
      request_changes: 'action_required',
      complete_review: 'completed',
    };

    const newStatus = validTransitions[input.action] as SigningRecipient['status'];
    if (!newStatus) {
      throw { code: 'INVALID_REQUEST', message: `Invalid action: ${input.action}`, status: 422 };
    }

    if (!canRecipientTransition(recipient.status, newStatus)) {
      throw {
        code: 'INVALID_REQUEST',
        message: `Cannot transition recipient from ${recipient.status} to ${newStatus}`,
        status: 409,
      };
    }

    recipient.status = newStatus;
    recipient.completedAt = newStatus === 'completed' ? nowISO() : recipient.completedAt;
    if (newStatus === 'signed') {
      recipient.completedAt = nowISO();
    }
    recipient.updatedAt = nowISO();

    if (newStatus === 'notified') recipient.notifiedAt = nowISO();
    if (newStatus === 'viewed') recipient.viewedAt = nowISO();

    this.recordAudit(workspaceId, requestId, input.actorType ?? 'external', input.actorId ?? recipient.email, `recipient_${input.action}`, {
      recipientId,
      recipientEmail: recipient.email,
    });

    this.evaluateWorkflowCompletion(state, workspaceId, requestId, request);

    return recipient;
  }

  async getStats(workspaceId: string): Promise<SigningStats> {
    await wait(250 + Math.random() * 150);
    const state = getState(workspaceId);

    if (workspaceId === 'ws_forbidden') {
      throw { code: 'WORKSPACE_UNAUTHORIZED', message: 'Not a workspace member', status: 403 };
    }

    const byStatus: Record<string, number> = {};
    let completedCount = 0;
    let totalCompletionMs = 0;
    const rows = state.requests;

    for (const req of rows) {
      byStatus[req.status] = (byStatus[req.status] || 0) + 1;
      if (req.status === 'completed' && req.sentAt && req.completedAt) {
        completedCount++;
        totalCompletionMs += new Date(req.completedAt).getTime() - new Date(req.sentAt).getTime();
      }
    }

    return {
      total: rows.length,
      byStatus: byStatus as Record<string, number>,
      completedCount,
      averageCompletionHours:
        completedCount > 0 ? totalCompletionMs / completedCount / (1000 * 60 * 60) : null,
    };
  }

  async verifyIntegrity(
    workspaceId: string,
    requestId: string
  ): Promise<{ valid: boolean; currentChecksum?: string; originalChecksum?: string }> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    const currentChecksum = request.documentChecksum;
    const valid = true;

    this.recordAudit(workspaceId, requestId, 'system', 'integrity_check', 'integrity_verified', {
      valid: String(valid),
      currentChecksum,
    });

    return {
      valid,
      currentChecksum,
      originalChecksum: request.documentChecksum,
    };
  }

  async getCompletion(workspaceId: string, requestId: string): Promise<SigningCompletionRecord | null> {
    await wait(300 + Math.random() * 200);

    const state = getState(workspaceId);
    const request = state.requests.find((r) => r.id === requestId);

    if (!request) {
      throw { code: 'FILE_NOT_FOUND', message: 'Signing request not found', status: 404 };
    }

    if (request.status !== 'completed') {
      return null;
    }

    return (
      state.completionRecords.find((c) => c.signingRequestId === requestId) ?? null
    );
  }

  async listAuditEvents(workspaceId: string, requestId: string): Promise<SigningAuditEvent[]> {
    await wait(200 + Math.random() * 100);
    const state = getState(workspaceId);
    return state.auditEvents
      .filter((e) => e.signingRequestId === requestId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listFiles(workspaceId: string, folderId?: string | null): Promise<FileRecord[]> {
    await wait(300 + Math.random() * 200);

    const mockFiles: FileRecord[] = [
      {
        id: 'file-doc-1',
        workspaceId,
        folderId: folderId ?? 'fld-root',
        name: 'project-proposal',
        displayName: 'Project Proposal.pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        sizeBytes: 2_400_000,
        checksumSha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        storageProvider: 'codin',
        storageKey: `workspaces/${workspaceId}/files/file-doc-1/objects/v4`,
        status: 'ready',
        currentVersionId: 'ver-doc-1-v4',
        createdBy: 'usr_demo_001',
        updatedBy: 'usr_demo_001',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: null,
      },
      {
        id: 'file-doc-2',
        workspaceId,
        folderId: folderId ?? 'fld-root',
        name: 'nda-agreement',
        displayName: 'NDA Agreement.pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        sizeBytes: 1_100_000,
        checksumSha256: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
        storageProvider: 'codin',
        storageKey: `workspaces/${workspaceId}/files/file-doc-2/objects/v1`,
        status: 'ready',
        currentVersionId: 'ver-doc-2-v1',
        createdBy: 'usr_demo_001',
        updatedBy: 'usr_demo_001',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: null,
      },
      {
        id: 'file-doc-3',
        workspaceId,
        folderId: folderId ?? 'fld-root',
        name: 'contract-terms',
        displayName: 'Contract Terms.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: 'docx',
        sizeBytes: 850_000,
        checksumSha256: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
        storageProvider: 'codin',
        storageKey: `workspaces/${workspaceId}/files/file-doc-3/objects/v2`,
        status: 'ready',
        currentVersionId: 'ver-doc-3-v2',
        createdBy: 'usr_demo_001',
        updatedBy: 'usr_demo_001',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        deletedAt: null,
      },
    ];

    return mockFiles;
  }

  async getFileVersions(workspaceId: string, fileId: string): Promise<FileVersionRecord[]> {
    await wait(250);

    const file = (await this.listFiles(workspaceId)).find((f) => f.id === fileId);
    if (!file) return [];

    const versions: FileVersionRecord[] = [];
    const versionCount = 4;
    for (let i = 1; i <= versionCount; i++) {
      versions.push({
        id: `ver-${fileId}-v${i}`,
        fileId,
        workspaceId,
        versionNumber: i,
        storageProvider: 'codin',
        storageKey: `workspaces/${workspaceId}/files/${fileId}/objects/v${i}`,
        sizeBytes: file.sizeBytes - (versionCount - i) * 100000,
        mimeType: file.mimeType,
        checksumSha256: file.checksumSha256,
        createdBy: 'usr_demo_001',
        createdAt: new Date(Date.now() - (versionCount - i) * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return versions.reverse();
  }

  async getFileVersion(
    workspaceId: string,
    fileId: string,
    versionId: string
  ): Promise<FileVersionRecord | null> {
    const versions = await this.getFileVersions(workspaceId, fileId);
    return versions.find((v) => v.id === versionId) ?? null;
  }

  private recordAudit(
    workspaceId: string,
    signingRequestId: string,
    actorType: string,
    actorId: string,
    eventType: string,
    metadata: Record<string, unknown>
  ) {
    const state = getState(workspaceId);
    state.auditEvents.push({
      id: uuid(),
      workspaceId,
      signingRequestId,
      actorType: actorType as ActorType,
      actorId,
      eventType,
      metadata,
      createdAt: nowISO(),
    });
  }

  private evaluateWorkflowCompletion(
    state: MockState,
    workspaceId: string,
    requestId: string,
    request: SigningRequest
  ) {
    if (request.status === 'completed' || request.status === 'cancelled') {
      return false;
    }

    const recipients = state.recipients.filter((r) => r.signingRequestId === requestId);
    const hasDeclined = recipients.some(
      (r) => r.status === 'declined' || r.status === 'rejected'
    );

    if (hasDeclined) {
      request.status = 'declined' as SigningRequestStatus;
      request.updatedAt = nowISO();
      this.recordAudit(workspaceId, requestId, 'system', 'system', 'declined', {});
      return false;
    }

    const allCompleted = recipients.every(
      (r) => r.status === 'signed' || r.status === 'approved' || r.status === 'completed'
    );

    if (allCompleted) {
      request.status = 'completed';
      request.completedAt = nowISO();
      request.updatedAt = nowISO();

      state.completionRecords.push({
        id: uuid(),
        workspaceId,
        signingRequestId: requestId,
        fileVersionId: request.fileVersionId,
        originalChecksum: request.documentChecksum,
        completedAt: nowISO(),
        verificationStatus: 'verified',
        metadata: {
          completedAt: nowISO(),
          recipientCount: String(recipients.length),
        },
      });

      this.recordAudit(workspaceId, requestId, 'system', 'system', 'completed', {
        recipientCount: String(recipients.length),
        completedAt: nowISO(),
      });

      return true;
    }

    if (request.workflowMode === 'sequential') {
      const pendingInOrder = recipients
        .filter(
          (r) =>
            r.status === 'pending' || r.status === 'notified' || r.status === 'viewed'
        )
        .sort((a, b) => a.signingOrder - b.signingOrder);

      if (pendingInOrder.length > 0) {
        const next = pendingInOrder[0];
        if (next) {
          next.status = 'action_required';
          next.updatedAt = nowISO();
        }
      }
    }

    if (request.status !== 'in_progress') {
      request.status = 'in_progress' as SigningRequestStatus;
      request.updatedAt = nowISO();
    }

    return false;
  }

  reset(workspaceId?: string) {
    if (workspaceId) {
      delete workspaceStates[workspaceId];
    } else {
      Object.keys(workspaceStates).forEach((k) => delete workspaceStates[k]);
    }
  }
}

type ActorType = 'user' | 'system' | 'external';
