export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'suspended' | 'archived';
  role: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  logoUrl?: string | null;
  ownerId?: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'invited' | 'active' | 'suspended' | 'removed';
  joinedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  description?: string;
}

export interface WorkspaceApi {
  list(): Promise<Workspace[]>;
  get(workspaceId: string): Promise<Workspace | null>;
  create(input: CreateWorkspaceInput): Promise<Workspace>;
}
