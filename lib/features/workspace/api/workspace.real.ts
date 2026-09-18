import type { CreateWorkspaceInput, Workspace, WorkspaceApi } from './workspace.types';
import { apiFetch } from '@/lib/api/api-client';
import { ApiError } from '@/lib/api/api-errors';

export class CodinWorkspaceApi implements WorkspaceApi {
  async list(): Promise<Workspace[]> {
    const result = await apiFetch('/workspaces') as { workspaces: Workspace[] };
    if (!result || !Array.isArray(result.workspaces)) {
      return [];
    }
    return result.workspaces;
  }

  async get(workspaceId: string): Promise<Workspace | null> {
    try {
      const result = await apiFetch(`/workspaces/${workspaceId}`) as { workspace: Workspace };
      return result.workspace ?? null;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        return null;
      }
      throw err;
    }
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const result = await apiFetch('/workspaces', {
      method: 'POST',
      body: input,
    }) as { workspace: Workspace };
    return result.workspace;
  }
}

export const codinWorkspaceApi = new CodinWorkspaceApi();
