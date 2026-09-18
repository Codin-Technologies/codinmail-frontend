import type { CreateWorkspaceInput, Workspace, WorkspaceApi } from './workspace.types';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const demoTenantWorkspaces: Workspace[] = [
  {
    id: 'ws_demo_001',
    name: 'Codin Technology',
    slug: 'codin-technology',
    description: 'Codin company workspace',
    status: 'active',
    role: 'owner',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    logoUrl: null,
    ownerId: 'usr_demo_001',
  },
  {
    id: 'ws_demo_002',
    name: 'FleetCo Solutions',
    slug: 'fleetco',
    description: 'FleetCo logistics workspace',
    status: 'active',
    role: 'member',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    logoUrl: null,
    ownerId: 'usr_002',
  },
  {
    id: 'ws_demo_003',
    name: 'Personal Workspace',
    slug: 'personal',
    description: 'Personal workspace',
    status: 'active',
    role: 'owner',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T00:00:00.000Z',
    logoUrl: null,
    ownerId: 'usr_demo_001',
  },
];

export class MockWorkspaceApi implements WorkspaceApi {
  private _workspaces: Workspace[] = [...demoTenantWorkspaces];

  async list(): Promise<Workspace[]> {
    await wait(180);
    return this._workspaces;
  }

  async get(workspaceId: string): Promise<Workspace | null> {
    await wait(180);
    const ws = this._workspaces.find((w) => w.id === workspaceId);
    return ws ?? null;
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    await wait(520);
    const workspace: Workspace = {
      id: `ws_${Date.now()}`,
      name: input.name,
      slug: input.slug,
      description: input.description ?? '',
      status: 'active',
      role: 'owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logoUrl: null,
      ownerId: 'usr_demo_001',
    };
    this._workspaces = [...this._workspaces, workspace];
    return workspace;
  }
}

export const mockWorkspaceApi = new MockWorkspaceApi();

export { demoTenantWorkspaces };
