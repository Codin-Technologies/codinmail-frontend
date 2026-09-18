export type DomainStatus = 'pending_verification' | 'verified' | 'active' | 'suspended' | 'disabled' | 'pending';

export interface DomainDnsRecord {
  id: string;
  type: 'TXT' | 'MX' | 'SPF' | 'DMARC' | 'DKIM';
  host: string;
  expectedValue: string;
  observedValue: string | null;
  status: 'pending' | 'valid' | 'invalid' | 'missing';
  lastCheckedAt: string | null;
}

export interface Domain {
  id: string;
  name: string;
  status: DomainStatus;
  mailEnabled: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainWithVerification extends Domain {
  verification: {
    type: string;
    host: string;
    value: string;
  };
}

export interface CreateDomainInput {
  name: string;
}

export interface DomainApi {
  list(workspaceId: string): Promise<Domain[]>;
  get(workspaceId: string, domainId: string): Promise<Domain | null>;
  create(workspaceId: string, input: CreateDomainInput): Promise<DomainWithVerification>;
  verify(workspaceId: string, domainId: string): Promise<Domain>;
  checkDns(workspaceId: string, domainId: string): Promise<DomainDnsRecord[]>;
  delete(workspaceId: string, domainId: string): Promise<void>;
}
