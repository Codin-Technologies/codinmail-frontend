/**
 * @deprecated LEGACY MOCK - Use `lib/features/workspace/api/workspace.mock.ts` instead.
 * This file is retained only for backward compatibility.
 */
import type { MockUser, MockWorkspace, WorkspaceMember, Invitation, Mailbox, SecuritySession, Domain } from './types';

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const demoWorkspaces: MockWorkspace[] = [
  { id: 'ws_demo_001', name: 'Codin Technology', slug: 'codin-technology', role: 'owner', industry: 'Technology', country: 'Kenya', timezone: 'Africa/Nairobi', hasMailbox: false },
  { id: 'ws_demo_002', name: 'FleetCo Solutions', slug: 'fleetco', role: 'member', industry: 'Logistics', country: 'Kenya', timezone: 'Africa/Nairobi', hasMailbox: true },
  { id: 'ws_demo_003', name: 'Personal Workspace', slug: 'personal', role: 'owner', industry: 'Personal', country: 'Kenya', timezone: 'Africa/Nairobi', hasMailbox: false },
];

export const mockWorkspaceApi = {
  async getWorkspaces(user: MockUser) { await wait(180); return user.email === 'kelvin@example.com' ? demoWorkspaces : []; },
  async createWorkspace(input: Omit<MockWorkspace, 'id' | 'role'>) { await wait(520); return { ...input, id: `ws_${Date.now()}`, role: 'owner' as const }; },
  async joinWorkspace(code: string) { await wait(520); if (code.trim().toLowerCase() === 'expired') return { success: false as const, error: 'This invitation has expired.' }; if (!code.trim()) return { success: false as const, error: 'Enter an invitation code.' }; return { success: true as const, workspace: demoWorkspaces[1] }; },
  async getMembers(): Promise<WorkspaceMember[]> { await wait(180); return [{ id: 'usr_demo_001', name: 'Kelvin Kijazi', email: 'kelvin@example.com', role: 'Owner', status: 'Active' }, { id: 'usr_002', name: 'John Smith', email: 'john@fleetco.example', role: 'Admin', status: 'Active' }, { id: 'usr_003', name: 'Mary Jones', email: 'mary@fleetco.example', role: 'Member', status: 'Active' }]; },
  async inviteMember(email: string, role: WorkspaceMember['role']) { await wait(350); return { success: true, email, role }; },
  async getInvitations(): Promise<Invitation[]> { await wait(200); return [{ id: 'inv_001', email: 'john@example.com', workspaceId: 'ws_demo_001', workspaceName: 'Codin Technology', role: 'member', status: 'pending', expiresAt: '2026-09-01T00:00:00Z' }]; },
  async getMailboxes() { await wait(200); return []; },
};
