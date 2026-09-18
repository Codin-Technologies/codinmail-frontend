import type { MailboxProvider } from './types';

export const mockMailboxApi = {
  async connectMailbox(provider: MailboxProvider, details?: Record<string, string>) { await new Promise((r) => setTimeout(r, 550)); return { id: `mb_${Date.now()}`, provider, address: details?.email ?? 'kelvin@codin.co.tz', status: 'connected' as const }; },
  async disconnectMailbox() { await new Promise((r) => setTimeout(r, 250)); return { success: true }; },
  async getMailboxes() { return [] as any[]; },
  async getProviders() { return [{ id: 'google', name: 'Google', icon: 'G' }, { id: 'microsoft', name: 'Microsoft 365', icon: 'M' }, { id: 'imap', name: 'Custom IMAP/SMTP', icon: '@' }, { id: 'codin', name: 'Codin Hosted Email', icon: 'C' }]; },
};
