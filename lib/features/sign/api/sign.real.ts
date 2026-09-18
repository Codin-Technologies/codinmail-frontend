import { apiFetch } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';
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
  SigningStats,
  UpdateSigningRequestInput,
} from './sign.types';

function parseDate(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

export class CodinSignApi implements SignApi {
  private base = '/workspaces';

  private wsParams(workspaceId: string) {
    return { workspaceId };
  }

  async listRequests(workspaceId: string, filters?: ListRequestsFilters): Promise<ListRequestsResult> {
    const params: Record<string, string | number> = { workspaceId };
    if (filters?.status) params.status = filters.status;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.offset !== undefined) params.offset = filters.offset;

    const resp = await apiFetch(this.base, {
      method: 'GET',
      params,
    });

    const r = resp as { data?: SigningRequest[]; meta?: { total: number; limit: number; offset: number } };
    return {
      data: (r.data ?? []).map(this.transformRequest),
      meta: r.meta ?? { total: 0, limit: 50, offset: 0 },
    };
  }

  async getRequest(workspaceId: string, requestId: string): Promise<SigningRequest | null> {
    try {
      const resp = await apiFetch(`${this.base}/${requestId}`, {
        method: 'GET',
        params: this.wsParams(workspaceId),
      });
      const r = resp as { data: unknown };
      return this.transformRequest(r.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async createRequest(
    workspaceId: string,
    input: CreateSigningRequestInput
  ): Promise<SigningRequest> {
    const resp = await apiFetch(this.base, {
      method: 'POST',
      params: this.wsParams(workspaceId),
      body: {
        fileId: input.fileId,
        fileVersionId: input.fileVersionId,
        title: input.title,
        description: input.description,
        workflowMode: input.workflowMode,
        expiresAt: input.expiresAt ? input.expiresAt.toISOString() : undefined,
      },
    });
    const r = resp as { data: unknown };
    return this.transformRequest(r.data);
  }

  async updateRequest(
    workspaceId: string,
    requestId: string,
    patch: UpdateSigningRequestInput
  ): Promise<SigningRequest> {
    const resp = await apiFetch(`${this.base}/${requestId}`, {
      method: 'PATCH',
      params: this.wsParams(workspaceId),
      body: {
        title: patch.title,
        description: patch.description,
        expiresAt: patch.expiresAt ? patch.expiresAt.toISOString() : patch.expiresAt === null ? null : undefined,
      },
    });
    const r = resp as { data: unknown };
    return this.transformRequest(r.data);
  }

  async deleteRequest(workspaceId: string, requestId: string): Promise<void> {
    await apiFetch(`${this.base}/${requestId}`, {
      method: 'DELETE',
      params: this.wsParams(workspaceId),
    });
  }

  async sendRequest(workspaceId: string, requestId: string): Promise<SigningRequest> {
    const resp = await apiFetch(`${this.base}/${requestId}/send`, {
      method: 'POST',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data: unknown };
    return this.transformRequest(r.data);
  }

  async cancelRequest(workspaceId: string, requestId: string): Promise<SigningRequest> {
    const resp = await apiFetch(`${this.base}/${requestId}/cancel`, {
      method: 'POST',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data: unknown };
    return this.transformRequest(r.data);
  }

  async addRecipient(
    workspaceId: string,
    requestId: string,
    input: AddRecipientInput
  ): Promise<SigningRecipient> {
    const resp = await apiFetch(`${this.base}/${requestId}/recipients`, {
      method: 'POST',
      params: this.wsParams(workspaceId),
      body: {
        name: input.name,
        email: input.email,
        workspaceUserId: input.workspaceUserId ?? undefined,
        recipientType: input.recipientType,
        role: input.role,
        signingOrder: input.signingOrder,
      },
    });
    const r = resp as { data: unknown };
    return this.transformRecipient(r.data);
  }

  async removeRecipient(workspaceId: string, requestId: string, recipientId: string): Promise<void> {
    await apiFetch(`${this.base}/${requestId}/recipients/${recipientId}`, {
      method: 'DELETE',
      params: this.wsParams(workspaceId),
    });
  }

  async listRecipients(workspaceId: string, requestId: string): Promise<SigningRecipient[]> {
    const resp = await apiFetch(`${this.base}/${requestId}/recipients`, {
      method: 'GET',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data?: unknown[] };
    return (r.data ?? []).map(this.transformRecipient);
  }

  async recipientAction(
    workspaceId: string,
    requestId: string,
    recipientId: string,
    input: RecipientActionInput
  ): Promise<SigningRecipient> {
    const resp = await apiFetch(`${this.base}/${requestId}/recipients/${recipientId}/action`, {
      method: 'POST',
      params: this.wsParams(workspaceId),
      body: {
        action: input.action,
        actorType: input.actorType,
        actorId: input.actorId,
        metadata: input.metadata,
      },
    });
    const r = resp as { data: unknown };
    return this.transformRecipient(r.data);
  }

  async getStats(workspaceId: string): Promise<SigningStats> {
    const resp = await apiFetch(`${this.base}/stats`, {
      method: 'GET',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data: unknown };
    return r.data as SigningStats;
  }

  async verifyIntegrity(
    workspaceId: string,
    requestId: string
  ): Promise<{ valid: boolean; currentChecksum?: string; originalChecksum?: string }> {
    const resp = await apiFetch(`${this.base}/${requestId}/integrity`, {
      method: 'GET',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data: unknown };
    return r.data as { valid: boolean; currentChecksum?: string; originalChecksum?: string };
  }

  async getCompletion(workspaceId: string, requestId: string): Promise<SigningCompletionRecord | null> {
    try {
      const resp = await apiFetch(`${this.base}/${requestId}/completion`, {
        method: 'GET',
        params: this.wsParams(workspaceId),
      });
      const r = resp as { data: unknown };
      return (r.data ?? null) as SigningCompletionRecord | null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async listAuditEvents(workspaceId: string): Promise<SigningAuditEvent[]> {
    const resp = await apiFetch(`${this.base}/audit`, {
      method: 'GET',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data?: SigningAuditEvent[] };
    return r.data ?? [];
  }

  async listFiles(workspaceId: string, folderId?: string | null): Promise<FileRecord[]> {
    const params: Record<string, string | number> = { workspaceId };
    if (folderId) params.folderId = folderId;

    const resp = await apiFetch(`/workspaces/${workspaceId}/files`, {
      method: 'GET',
      params: folderId ? undefined : undefined,
    });
    const r = resp as { data?: FileRecord[] };
    return (r.data ?? []).map(this.transformFile);
  }

  async getFileVersions(workspaceId: string, fileId: string): Promise<FileVersionRecord[]> {
    const resp = await apiFetch(`/workspaces/${workspaceId}/files/${fileId}/versions`, {
      method: 'GET',
      params: this.wsParams(workspaceId),
    });
    const r = resp as { data?: FileVersionRecord[] };
    return r.data ?? [];
  }

  async getFileVersion(
    workspaceId: string,
    fileId: string,
    versionId: string
  ): Promise<FileVersionRecord | null> {
    try {
      const resp = await apiFetch(
        `/workspaces/${workspaceId}/files/${fileId}/versions/${versionId}`,
        {
          method: 'GET',
          params: this.wsParams(workspaceId),
        }
      );
      const r = resp as { data: unknown };
      return this.transformFileVersion(r.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  private transformRequest(data: unknown): SigningRequest {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      workspaceId: String(d.workspaceId ?? ''),
      fileId: String(d.fileId ?? ''),
      fileVersionId: String(d.fileVersionId ?? ''),
      title: String(d.title ?? ''),
      description: String(d.description ?? ''),
      status: d.status as SigningRequest['status'],
      workflowMode: d.workflowMode as SigningRequest['workflowMode'],
      documentChecksum: String(d.documentChecksum ?? ''),
      mimeType: String(d.mimeType ?? ''),
      storageKey: String(d.storageKey ?? ''),
      createdBy: String(d.createdBy ?? ''),
      sentAt: parseDate(d.sentAt),
      completedAt: parseDate(d.completedAt),
      expiresAt: parseDate(d.expiresAt),
      createdAt: parseDate(d.createdAt) ?? nowISO(),
      updatedAt: parseDate(d.updatedAt) ?? nowISO(),
    };
  }

  private transformRecipient(data: unknown): SigningRecipient {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      workspaceId: String(d.workspaceId ?? ''),
      signingRequestId: String(d.signingRequestId ?? ''),
      name: String(d.name ?? ''),
      email: String(d.email ?? ''),
      workspaceUserId: d.workspaceUserId ? String(d.workspaceUserId) : null,
      recipientType: d.recipientType as SigningRecipient['recipientType'],
      role: d.role as SigningRecipient['role'],
      signingOrder: Number(d.signingOrder ?? 0),
      status: d.status as SigningRecipient['status'],
      notifiedAt: parseDate(d.notifiedAt),
      viewedAt: parseDate(d.viewedAt),
      completedAt: parseDate(d.completedAt),
      createdAt: parseDate(d.createdAt) ?? nowISO(),
      updatedAt: parseDate(d.updatedAt) ?? nowISO(),
    };
  }

  private transformFile(data: unknown): FileRecord {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      workspaceId: String(d.workspaceId ?? ''),
      folderId: d.folderId ? String(d.folderId) : null,
      name: String(d.name ?? ''),
      displayName: String(d.displayName ?? d.name ?? ''),
      mimeType: String(d.mimeType ?? ''),
      extension: d.extension ? String(d.extension) : null,
      sizeBytes: Number(d.sizeBytes ?? d.size ?? 0),
      checksumSha256: d.checksumSha256 ? String(d.checksumSha256) : null,
      storageProvider: String(d.storageProvider ?? ''),
      storageKey: String(d.storageKey ?? ''),
      status: String(d.status ?? ''),
      currentVersionId: d.currentVersionId ? String(d.currentVersionId) : null,
      createdBy: String(d.createdBy ?? ''),
      updatedBy: String(d.updatedBy ?? ''),
      createdAt: parseDate(d.createdAt) ?? nowISO(),
      updatedAt: parseDate(d.updatedAt) ?? nowISO(),
      deletedAt: parseDate(d.deletedAt),
    };
  }

  private transformFileVersion(data: unknown): FileVersionRecord {
    const d = data as Record<string, unknown>;
    return {
      id: String(d.id ?? ''),
      fileId: String(d.fileId ?? ''),
      workspaceId: String(d.workspaceId ?? ''),
      versionNumber: Number(d.versionNumber ?? 1),
      storageProvider: String(d.storageProvider ?? ''),
      storageKey: String(d.storageKey ?? ''),
      sizeBytes: Number(d.sizeBytes ?? 0),
      mimeType: String(d.mimeType ?? ''),
      checksumSha256: d.checksumSha256 ? String(d.checksumSha256) : null,
      createdBy: String(d.createdBy ?? ''),
      createdAt: parseDate(d.createdAt) ?? nowISO(),
    };
  }
}

function nowISO(): string {
  return new Date().toISOString();
}
