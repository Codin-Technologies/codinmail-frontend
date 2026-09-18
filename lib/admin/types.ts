export type AdminRole = 'Owner' | 'Super Admin' | 'Organization Admin' | 'Manager' | 'User';
export type UserStatus = 'Active' | 'Suspended' | 'Invited';
export type DomainStatus = 'Verified' | 'Pending' | 'Action required';

export type Organization = { id: string; name: string; domain: string; industry: string; website: string; country: string; timezone: string; accent: string };
export type AdminUser = { id: string; name: string; email: string; role: AdminRole; status: UserStatus; storage: string; lastActive: string; recoveryEmail?: string };
export type Domain = { id: string; name: string; status: DomainStatus; provider: string; users: number; records: { name: string; type: string; status: 'Configured' | 'Missing'; host: string; value: string }[] };
export type AdminActivity = { id: string; actor: string; action: string; resource: string; time: string; status: 'Success' | 'Pending' };
export type AttentionItem = { id: string; title: string; detail: string; severity: 'High' | 'Medium' | 'Low'; target: string };
export type Integration = { id: string; name: string; category: string; status: 'Connected' | 'Not connected' | 'Requires action'; description: string };

export type AdminDashboard = {
  users: number; emailAccounts: number; domains: number; storageUsed: number; storageTotal: number;
  securityScore: number; activities: AdminActivity[]; attention: AttentionItem[];
};
