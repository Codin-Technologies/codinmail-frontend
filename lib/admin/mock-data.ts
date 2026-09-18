import type { AdminActivity, AdminDashboard, AdminUser, AttentionItem, Domain, Integration, Organization } from './types';

export const organizations: Organization[] = [
  { id: 'org-codin', name: 'Codin Technology', domain: 'codin.co.tz', industry: 'Technology', website: 'https://codin.co.tz', country: 'Tanzania', timezone: 'Africa/Dar_es_Salaam', accent: '#c92b2b' },
  { id: 'org-fleetco', name: 'FleetCo Solutions', domain: 'fleetco.co.tz', industry: 'Fleet management', website: 'https://fleetco.co.tz', country: 'Tanzania', timezone: 'Africa/Dar_es_Salaam', accent: '#176b87' },
  { id: 'org-teletrac', name: 'Teletrac Tanzania', domain: 'teletrac.co.tz', industry: 'Telematics', website: 'https://teletrac.co.tz', country: 'Tanzania', timezone: 'Africa/Dar_es_Salaam', accent: '#34745b' },
];

export const users: AdminUser[] = [
  { id: 'u-kelvin', name: 'Kelvin Kijazi', email: 'kelvin@codin.co.tz', role: 'Super Admin', status: 'Active', storage: '2.4 GB', lastActive: 'Today', recoveryEmail: 'kelvin.backup@example.com' },
  { id: 'u-john', name: 'John Doe', email: 'john@codin.co.tz', role: 'User', status: 'Active', storage: '1.1 GB', lastActive: 'Yesterday', recoveryEmail: 'john.personal@example.com' },
  { id: 'u-mary', name: 'Mary Smith', email: 'mary@codin.co.tz', role: 'Manager', status: 'Suspended', storage: '800 MB', lastActive: 'Aug 20' },
  { id: 'u-george', name: 'George Wilson', email: 'george@codin.co.tz', role: 'Organization Admin', status: 'Active', storage: '1.8 GB', lastActive: 'Today' },
  { id: 'u-zuri', name: 'Zuri Mrema', email: 'zuri@codin.co.tz', role: 'User', status: 'Invited', storage: '—', lastActive: 'Invitation pending' },
];

export const domains: Domain[] = [
  { id: 'domain-codin', name: 'codin.co.tz', status: 'Verified', provider: 'Codin Mail Hosting', users: 24, records: [
    { name: 'MX', type: 'MX', status: 'Configured', host: '@', value: 'mx1.codinmail.com' }, { name: 'SPF', type: 'TXT', status: 'Configured', host: '@', value: 'v=spf1 include:codinmail.com ~all' }, { name: 'DKIM', type: 'TXT', status: 'Missing', host: 'selector1._domainkey', value: 'k=rsa; p=MIIBIjANBg…' }, { name: 'DMARC', type: 'TXT', status: 'Missing', host: '_dmarc', value: 'v=DMARC1; p=none' },
  ] },
  { id: 'domain-codin-com', name: 'codin.com', status: 'Pending', provider: 'Microsoft 365', users: 0, records: [
    { name: 'Verification', type: 'TXT', status: 'Missing', host: '@', value: 'codin-verification=abc123xyz' }, { name: 'MX', type: 'MX', status: 'Missing', host: '@', value: 'mx1.codinmail.com' },
  ] },
];

export const activities: AdminActivity[] = [
  { id: 'a1', actor: 'Kelvin Kijazi', action: 'created user', resource: 'john@codin.co.tz', time: '10:32 AM', status: 'Success' },
  { id: 'a2', actor: 'Mary Smith', action: 'changed organization settings', resource: 'Codin Technology', time: '9:48 AM', status: 'Success' },
  { id: 'a3', actor: 'Kelvin Kijazi', action: 'verified domain', resource: 'codin.co.tz', time: 'Yesterday', status: 'Success' },
  { id: 'a4', actor: 'System', action: 'detected incomplete DKIM configuration', resource: 'codin.co.tz', time: 'Yesterday', status: 'Pending' },
];

export const attention: AttentionItem[] = [
  { id: 'at1', title: 'DKIM configuration incomplete', detail: 'Add the DKIM DNS record to improve email deliverability.', severity: 'High', target: 'domains' },
  { id: 'at2', title: 'Two users need recovery email', detail: 'Help users recover access if they lose their primary credentials.', severity: 'Medium', target: 'users' },
  { id: 'at3', title: 'Storage usage needs review', detail: '68 GB of 250 GB is in use across Mail and Files.', severity: 'Low', target: 'storage' },
];

export const dashboard: AdminDashboard = { users: 25, emailAccounts: 23, domains: 2, storageUsed: 68, storageTotal: 250, securityScore: 82, activities, attention };

export const integrations: Integration[] = [
  { id: 'google-calendar', name: 'Google Calendar', category: 'Calendar', status: 'Connected', description: 'Sync meetings and availability.' },
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'Email provider', status: 'Requires action', description: 'One domain needs connection approval.' },
  { id: 'google-workspace', name: 'Google Workspace', category: 'Email provider', status: 'Not connected', description: 'Import mail and directory data.' },
  { id: 'google-meet', name: 'Google Meet', category: 'Meetings', status: 'Not connected', description: 'Use Google conferencing for meetings.' },
];
