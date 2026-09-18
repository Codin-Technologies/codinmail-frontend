import type { CreateDomainInput, Domain, DomainApi, DomainDnsRecord, DomainWithVerification } from './domain.types';
import { apiFetch } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';

export class CodinDomainApi implements DomainApi {
  async list(workspaceId: string): Promise<Domain[]> {
    const result = await apiFetch(`/workspaces/${workspaceId}/domains`) as { domains: Domain[] };
    return result.domains ?? [];
  }

  async get(workspaceId: string, domainId: string): Promise<Domain | null> {
    try {
      const result = await apiFetch(`/workspaces/${workspaceId}/domains/${domainId}`) as { domain: Domain };
      return result.domain ?? null;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        return null;
      }
      throw err;
    }
  }

  async create(workspaceId: string, input: CreateDomainInput): Promise<DomainWithVerification> {
    const result = await apiFetch(`/workspaces/${workspaceId}/domains`, {
      method: 'POST',
      body: input,
    }) as { domain: Domain; verification: { type: string; host: string; value: string } };
    return { ...result.domain, verification: result.verification };
  }

  async verify(workspaceId: string, domainId: string): Promise<Domain> {
    const result = await apiFetch(`/workspaces/${workspaceId}/domains/${domainId}/verify`, {
      method: 'POST',
      body: {},
    }) as { domain: Domain };
    return result.domain;
  }

  async checkDns(workspaceId: string, domainId: string): Promise<DomainDnsRecord[]> {
    const result = await apiFetch(`/workspaces/${workspaceId}/domains/${domainId}/check-dns`) as { records: DomainDnsRecord[] };
    return result.records ?? [];
  }

  async delete(workspaceId: string, domainId: string): Promise<void> {
    await apiFetch(`/workspaces/${workspaceId}/domains/${domainId}`, {
      method: 'DELETE',
    });
  }
}

export const codinDomainApi = new CodinDomainApi();
