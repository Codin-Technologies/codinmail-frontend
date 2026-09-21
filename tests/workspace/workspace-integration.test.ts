import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockWorkspaceApi } from '@/lib/features/workspace/api/workspace.mock';
import { CodinWorkspaceApi } from '@/lib/features/workspace/api/workspace.real';
import { getWorkspaceApi, resetWorkspaceApi, setWorkspaceApi } from '@/lib/features/workspace/api/workspace.client';
import { getAccessToken, setAccessToken } from '@/lib/api/api-client';

describe('Workspace Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    setAccessToken('mock-token');
    resetWorkspaceApi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Custom Override', () => {
    it('lists workspaces successfully', async () => {
      const api = new MockWorkspaceApi();
      const workspaces = await api.list();
      expect(workspaces.length).toBeGreaterThan(0);
      expect(workspaces[0]).toHaveProperty('id');
      expect(workspaces[0]).toHaveProperty('name');
      expect(workspaces[0]).toHaveProperty('slug');
    });

    it('gets a single workspace by id', async () => {
      const api = new MockWorkspaceApi();
      const workspaces = await api.list();
      const first = workspaces[0];
      const fetched = await api.get(first.id);
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(first.id);
      expect(fetched?.name).toBe(first.name);
    });

    it('returns null when getting a non-existent workspace', async () => {
      const api = new MockWorkspaceApi();
      const fetched = await api.get('non_existent_id');
      expect(fetched).toBeNull();
    });

    it('creates a new workspace and appends to list', async () => {
      const api = new MockWorkspaceApi();
      const initial = await api.list();
      const newWs = await api.create({
        name: 'New Enterprise',
        slug: 'new-enterprise',
        description: 'Testing workspace creation',
      });

      expect(newWs.id).toBeDefined();
      expect(newWs.name).toBe('New Enterprise');
      expect(newWs.slug).toBe('new-enterprise');

      const after = await api.list();
      expect(after.length).toBe(initial.length + 1);
      expect(after.some((w) => w.id === newWs.id)).toBe(true);
    });
  });

  describe('CodinWorkspaceApi Endpoint Contract', () => {
    it('fetches workspaces list from /workspaces with auth token', async () => {
      const api = new CodinWorkspaceApi();
      const mockResponse = {
        workspaces: [
          { id: 'ws-101', name: 'Real Corp', slug: 'real-corp', role: 'owner' },
        ],
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const list = await api.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('ws-101');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/workspaces'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('creates a workspace via POST /workspaces', async () => {
      const api = new CodinWorkspaceApi();
      const newWsData = {
        workspace: { id: 'ws-202', name: 'Alpha Tech', slug: 'alpha-tech', role: 'owner' },
      };

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify(newWsData), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const created = await api.create({ name: 'Alpha Tech', slug: 'alpha-tech' });
      expect(created.id).toBe('ws-202');
      expect(created.name).toBe('Alpha Tech');
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/workspaces'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Alpha Tech', slug: 'alpha-tech' }),
        })
      );
    });
  });
});
