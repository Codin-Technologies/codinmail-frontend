export type AuthStatus = 'unauthenticated' | 'authenticated' | 'pending_verification' | 'loading';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  codinId: string;
  avatar: string | null;
  emailVerified: boolean;
};

export type MockWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  industry?: string;
  country?: string;
  timezone?: string;
  hasMailbox?: boolean;
};

export type WorkspaceMember = { id: string; name: string; email: string; role: 'Owner' | 'Admin' | 'Member'; status: 'Active' | 'Invited' };

export type MailboxProvider = 'Google' | 'Microsoft 365' | 'Custom IMAP/SMTP' | 'Codin Hosted Email';

export type Mailbox = {
  id: string;
  provider: MailboxProvider;
  address: string;
  status: 'connected' | 'disconnected' | 'error';
};

export type Invitation = {
  id: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
};

export type SecuritySession = {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type Domain = {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'failed';
  provider: string;
  users: number;
};
