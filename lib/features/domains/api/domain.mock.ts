import type { CreateDomainInput, Domain, DomainApi, DomainDnsRecord, DomainWithVerification } from './domain.types';

const wait = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDomains: Domain[] = [
  {
    id: 'dom_demo_001',
    name: 'codin.co.tz',
    status: 'verified',
    mailEnabled: true,
    verifiedAt: '2025-01-01T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'dom_demo_002',
    name: 'fleetco.co.tz',
    status: 'pending_verification',
    mailEnabled: false,
    verifiedAt: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
];

const mockDnsRecords: Record<string, DomainDnsRecord[]> = {
  dom_demo_001: [
    { id: 'rec_1', type: 'TXT', host: '@', expectedValue: 'codin-domain-verification=abc', observedValue: 'codin-domain-verification=abc', status: 'valid', lastCheckedAt: '2025-01-01T00:00:00.000Z' },
    { id: 'rec_2', type: 'MX', host: '@', expectedValue: '10 mail.codin.co.tz', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_3', type: 'SPF', host: '@', expectedValue: 'v=spf1 include:mail.codin.co.tz -all', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_4', type: 'DMARC', host: '_dmarc', expectedValue: 'v=DMARC1; p=quarantine', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_5', type: 'DKIM', host: 'codin._domainkey', expectedValue: 'v=DKIM1; k=rsa; p=', observedValue: null, status: 'pending', lastCheckedAt: null },
  ],
  dom_demo_002: [
    { id: 'rec_6', type: 'TXT', host: '@', expectedValue: 'codin-domain-verification=def', observedValue: null, status: 'missing', lastCheckedAt: null },
    { id: 'rec_7', type: 'MX', host: '@', expectedValue: '10 mail.fleetco.co.tz', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_8', type: 'SPF', host: '@', expectedValue: 'v=spf1 include:mail.fleetco.co.tz -all', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_9', type: 'DMARC', host: '_dmarc', expectedValue: 'v=DMARC1; p=quarantine', observedValue: null, status: 'pending', lastCheckedAt: null },
    { id: 'rec_10', type: 'DKIM', host: 'codin._domainkey', expectedValue: 'v=DKIM1; k=rsa; p=', observedValue: null, status: 'pending', lastCheckedAt: null },
  ],
};

export class MockDomainApi implements DomainApi {
  private _domains: Map<string, Domain[]> = new Map([
    ['ws_demo_001', [...mockDomains]],
  ]);
  private _dnsRecords: Record<string, DomainDnsRecord[]> = { ...mockDnsRecords };

  async list(workspaceId: string): Promise<Domain[]> {
    await wait(250);
    return [...(this._domains.get(workspaceId) ?? [])];
  }

  async get(workspaceId: string, domainId: string): Promise<Domain | null> {
    await wait(180);
    const list = this._domains.get(workspaceId) ?? [];
    const domain = list.find((d) => d.id === domainId);
    return domain ?? null;
  }

  async create(workspaceId: string, input: CreateDomainInput): Promise<DomainWithVerification> {
    await wait(550);
    const domain: Domain = {
      id: `dom_${Date.now()}`,
      name: input.name,
      status: 'pending_verification',
      mailEnabled: false,
      verifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const list = this._domains.get(workspaceId) ?? [];
    this._domains.set(workspaceId, [...list, domain]);

    const verificationValue = `codin-domain-verification=${domain.id}`;
    this._dnsRecords[domain.id] = [
      { id: `rec_${Date.now()}_1`, type: 'TXT', host: '@', expectedValue: verificationValue, observedValue: null, status: 'pending', lastCheckedAt: null },
      { id: `rec_${Date.now()}_2`, type: 'MX', host: '@', expectedValue: `10 mail.${domain.name}`, observedValue: null, status: 'pending', lastCheckedAt: null },
      { id: `rec_${Date.now()}_3`, type: 'SPF', host: '@', expectedValue: `v=spf1 include:mail.${domain.name} -all`, observedValue: null, status: 'pending', lastCheckedAt: null },
      { id: `rec_${Date.now()}_4`, type: 'DMARC', host: '_dmarc', expectedValue: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain.name}`, observedValue: null, status: 'pending', lastCheckedAt: null },
      { id: `rec_${Date.now()}_5`, type: 'DKIM', host: 'codin._domainkey', expectedValue: 'v=DKIM1; k=rsa; p=', observedValue: null, status: 'pending', lastCheckedAt: null },
    ];

    return {
      ...domain,
      verification: {
        type: 'TXT',
        host: '@',
        value: verificationValue,
      },
    };
  }

  async verify(workspaceId: string, domainId: string): Promise<Domain> {
    await wait(600);
    const list = this._domains.get(workspaceId) ?? [];
    const domain = list.find((d) => d.id === domainId);
    if (!domain) {
      throw { code: 'DOMAIN_NOT_FOUND', message: 'Domain not found', status: 404 };
    }

    if (domain.status === 'verified') {
      return domain;
    }

    const updated: Domain = {
      ...domain,
      status: 'verified',
      mailEnabled: true,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._domains.set(
      workspaceId,
      list.map((d) => (d.id === domainId ? updated : d))
    );

    return updated;
  }

  async checkDns(_workspaceId: string, domainId: string): Promise<DomainDnsRecord[]> {
    await wait(400);
    return this._dnsRecords[domainId] ?? [];
  }

  async delete(workspaceId: string, domainId: string): Promise<void> {
    await wait(300);
    const list = this._domains.get(workspaceId) ?? [];
    this._domains.set(
      workspaceId,
      list.filter((d) => d.id !== domainId)
    );
    delete this._dnsRecords[domainId];
  }
}

export const mockDomainApi = new MockDomainApi();

export { mockDomains };
