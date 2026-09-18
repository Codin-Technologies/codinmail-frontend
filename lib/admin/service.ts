import { activities, attention, dashboard, domains, integrations, organizations, users } from './mock-data';
import type { AdminDashboard, AdminUser, Domain, Organization } from './types';

const pause = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), 180));
let mutableUsers = [...users];
let mutableDomains = [...domains];

export const organizationService = { getOrganizations: () => pause(organizations), getOrganization: (id: string) => pause(organizations.find((organization) => organization.id === id) ?? organizations[0]), updateOrganization: (organization: Organization) => pause(organization) };
export const adminDashboardService = { getDashboard: (): Promise<AdminDashboard> => pause(dashboard) };
export const userService = {
  getUsers: () => pause(mutableUsers),
  createUser: (data: Pick<AdminUser, 'name' | 'email' | 'role'>) => { const user: AdminUser = { id: `u-${Date.now()}`, ...data, status: 'Invited', storage: '0 MB', lastActive: 'Invitation pending' }; mutableUsers = [user, ...mutableUsers]; return pause(user); },
  suspendUser: (id: string) => { mutableUsers = mutableUsers.map((user) => user.id === id ? { ...user, status: user.status === 'Suspended' ? 'Active' : 'Suspended' } : user); return pause(mutableUsers.find((user) => user.id === id)!); },
};
export const domainService = {
  getDomains: (): Promise<Domain[]> => pause(mutableDomains),
  createDomain: (name: string, provider: string) => { const domain: Domain = { id: `domain-${Date.now()}`, name, provider, status: 'Pending', users: 0, records: [{ name: 'Verification', type: 'TXT', status: 'Missing', host: '@', value: `codin-verification=${Math.random().toString(36).slice(2, 12)}` }] }; mutableDomains = [domain, ...mutableDomains]; return pause(domain); },
  verifyDomain: (id: string) => { mutableDomains = mutableDomains.map((domain) => domain.id === id ? { ...domain, status: 'Verified' } : domain); return pause(mutableDomains.find((domain) => domain.id === id)!); },
};
export const auditService = { getLogs: () => pause(activities) };
export const integrationService = { getIntegrations: () => pause(integrations) };
export const attentionService = { getItems: () => pause(attention) };
