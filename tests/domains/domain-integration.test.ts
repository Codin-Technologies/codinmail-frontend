import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockDomainApi } from '@/lib/features/domains/api/domain.mock';
import { CodinDomainApi } from '@/lib/features/domains/api/domain.real';
import { getDomainApi, resetDomainApi, setDomainApi } from '@/lib/features/domains/api/domain.client';
import { getAccessToken, setAccessToken } from '@/lib/api/api-client';

describe('Domain Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    setAccessToken('mock-token');
    resetDomainApi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Custom Override', () => {
    const wsId = 'ws_demo_001';

    it('lists domains for a workspace', async () => {
      const api = new MockDomainApi();
      const domains = await api.list(wsId);
      expect(domains.length).toBeGreaterThan(0);
      expect(domains[0]).toHaveProperty('name');
      expect(domains[0]).toHaveProperty('status');
    });

    it('adds a new domain and provides verification TXT record instructions', async () => {
      const api = new MockDomainApi();
      const created = await api.create(wsId, { name: 'codintech.io' });
      expect(created.name).toBe('codintech.io');
      expect(created.verification).toBeDefined();
      expect(created.verification.type).toBe('TXT');
      expect(created.verification.value).toBeDefined();
    });

    it('checks DNS records for a domain', async () => {
      const api = new MockDomainApi();
      const domains = await api.list(wsId);
      const target = domains[0];
      const records = await api.checkDns(wsId, target.id);
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]).toHaveProperty('type');
      expect(records[0]).toHaveProperty('status');
    });

    it('verifies an unverified domain', async () => {
      const api = new MockDomainApi();
      const created = await api.create(wsId, { name: 'verifytest.com' });
      expect(created.status).toBe('pending_verification');

      const verified = await api.verify(wsId, created.id);
      expect(verified.status).toBe('verified');
    });

    it('deletes a domain from the workspace', async () => {
      const api = new MockDomainApi();
      const created = await api.create(wsId, { name: 'tobedeleted.com' });
      const beforeList = await api.list(wsId);
      expect(beforeList.some((d) => d.id === created.id)).toBe(true);

      await api.delete(wsId, created.id);
      const afterList = await api.list(wsId);
      expect(afterList.some((d) => d.id === created.id)).toBe(false);
    });

    it('maintains isolation between different workspaces', async () => {
      const api = new MockDomainApi();
      await api.create('ws_1', { name: 'ws1-domain.com' });
      await api.create('ws_2', { name: 'ws2-domain.com' });
      const ws1Domains = await api.list('ws_1');
      const ws2Domains = await api.list('ws_2');
      expect(ws1Domains.map((d) => d.name)).not.toEqual(ws2Domains.map((d) => d.name));
    });
  });

  describe('CodinDomainApi Endpoint Contract', () => {
    const wsId = 'ws-corp-99';

    it('fetches domains using workspace-scoped route /workspaces/:id/domains', async () => {
      const api = new CodinDomainApi();
      const mockResponse = {
        domains: [
          { id: 'dom-1', name: 'corp.example.com', status: 'verified', mailEnabled: true },
        ],
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const domains = await api.list(wsId);
      expect(domains).toHaveLength(1);
      expect(domains[0].name).toBe('corp.example.com');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/workspaces/${wsId}/domains`),
        expect.anything()
      );
    });

    it('calls verify endpoint via POST /workspaces/:id/domains/:domainId/verify', async () => {
      const api = new CodinDomainApi();
      const mockResponse = {
        domain: { id: 'dom-2', name: 'test.com', status: 'verified', mailEnabled: true },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await api.verify(wsId, 'dom-2');
      expect(result.status).toBe('verified');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining(`/workspaces/${wsId}/domains/dom-2/verify`),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
