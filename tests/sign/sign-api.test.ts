/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import { MockSignApi } from '@/lib/features/sign/api/sign.mock';
import { setSignApi, getSignApi } from '@/lib/features/sign/api/sign.client';

const WORKSPACE_ID = 'ws_test_001';

describe('MockSignApi: Signing Request Lifecycle', () => {
  let api: MockSignApi;

  beforeEach(() => {
    api = new MockSignApi();
    api.reset(WORKSPACE_ID);
    setSignApi(api);
  });

  it('creates a draft signing request with valid input', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'NDA Agreement',
      description: 'Non-disclosure agreement',
      workflowMode: 'parallel',
    });

    expect(request.id).toBeTruthy();
    expect(request.workspaceId).toBe(WORKSPACE_ID);
    expect(request.title).toBe('NDA Agreement');
    expect(request.status).toBe('draft');
    expect(request.workflowMode).toBe('parallel');
  });

  it('rejects creation with missing file', async () => {
    await expect(
      api.createRequest(WORKSPACE_ID, {
        fileId: '',
        fileVersionId: '',
        title: 'Test',
      })
    ).rejects.toMatchObject({ code: 'FILE_NOT_FOUND', status: 404 });
  });

  it('rejects creation with empty title', async () => {
    await expect(
      api.createRequest(WORKSPACE_ID, {
        fileId: 'file-1',
        fileVersionId: 'ver-1',
        title: '',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 });
  });

  it('sends a draft request and transitions to sent', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'signer',
    });

    const sent = await api.sendRequest(WORKSPACE_ID, request.id);
    expect(sent.status).toBe('sent');
    expect(sent.sentAt).toBeTruthy();
  });

  it('prevents sending with no recipients', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    await expect(api.sendRequest(WORKSPACE_ID, request.id)).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      status: 422,
    });
  });

  it('prevents sending from non-draft status', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    await expect(api.sendRequest(WORKSPACE_ID, request.id)).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      status: 409,
    });
  });

  it('cancels a sent request', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });
    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    const cancelled = await api.cancelRequest(WORKSPACE_ID, request.id);
    expect(cancelled.status).toBe('cancelled');
  });
});

describe('MockSignApi: Recipient Workflow', () => {
  let api: MockSignApi;

  beforeEach(() => {
    api = new MockSignApi();
    api.reset(WORKSPACE_ID);
    setSignApi(api);
  });

  it('adds recipients only to draft requests', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    const recipient = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'signer',
      recipientType: 'external',
    });

    expect(recipient.id).toBeTruthy();
    expect(recipient.name).toBe('Jane Smith');
    expect(recipient.status).toBe('pending');
  });

  it('validates recipient email', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    await expect(
      api.addRecipient(WORKSPACE_ID, request.id, {
        name: 'Jane',
        email: 'invalid-email',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 });
  });

  it('prevents adding recipients to sent requests', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });
    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    await expect(
      api.addRecipient(WORKSPACE_ID, request.id, {
        name: 'Jane',
        email: 'jane@example.com',
      })
    ).rejects.toMatchObject({ code: 'INVALID_REQUEST', status: 409 });
  });

  it('removes recipients from draft requests', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });
    const recipient = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });

    await api.removeRecipient(WORKSPACE_ID, request.id, recipient.id);

    const recipients = await api.listRecipients(WORKSPACE_ID, request.id);
    expect(recipients).toHaveLength(0);
  });
});

describe('MockSignApi: Recipient Actions & Workflow Completion', () => {
  let api: MockSignApi;

  beforeEach(() => {
    api = new MockSignApi();
    api.reset(WORKSPACE_ID);
    setSignApi(api);
  });

  it('transitions recipient through sign workflow and completes request', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
      workflowMode: 'parallel',
    });

    const recipient = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
      role: 'signer',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    const signed = await api.recipientAction(
      WORKSPACE_ID,
      request.id,
      recipient.id,
      { action: 'sign', actorType: 'external', actorId: 'john@example.com' }
    );

    expect(signed.status).toBe('signed');
    expect(signed.completedAt).toBeTruthy();

    const completed = await api.getRequest(WORKSPACE_ID, request.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.completedAt).toBeTruthy();
  });

  it('transitions recipient through sequential signing workflow', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
      workflowMode: 'sequential',
    });

    const r1 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Alice',
      email: 'alice@example.com',
      role: 'signer',
      signingOrder: 0,
    });
    const r2 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Bob',
      email: 'bob@example.com',
      role: 'signer',
      signingOrder: 1,
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    await api.recipientAction(WORKSPACE_ID, request.id, r1.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'alice@example.com',
    });

    const bob = await api.recipientAction(WORKSPACE_ID, request.id, r2.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'bob@example.com',
    });

    expect(bob.status).toBe('signed');

    const completed = await api.getRequest(WORKSPACE_ID, request.id);
    expect(completed?.status).toBe('completed');
  });

  it('handles decline action and marks request as declined', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
      workflowMode: 'parallel',
    });

    const recipient = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
      role: 'signer',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);

    const declined = await api.recipientAction(
      WORKSPACE_ID,
      request.id,
      recipient.id,
      { action: 'decline', actorType: 'external', actorId: 'john@example.com' }
    );

    expect(declined.status).toBe('declined');

    const updated = await api.getRequest(WORKSPACE_ID, request.id);
    expect(updated?.status).toBe('declined');
  });

  it('rejects invalid actions', async () => {
    await expect(
      api.recipientAction(WORKSPACE_ID, 'nonexistent', 'nonexistent', {
        action: 'sign',
      })
    ).rejects.toMatchObject({ code: 'FILE_NOT_FOUND', status: 404 });
  });
});

describe('MockSignApi: Audit and Integrity', () => {
  let api: MockSignApi;

  beforeEach(() => {
    api = new MockSignApi();
    api.reset(WORKSPACE_ID);
    setSignApi(api);
  });

  it('records audit events for all actions', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    const events = await api.listAuditEvents(WORKSPACE_ID, request.id);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventType).toBe('created');
    expect(events[0].actorType).toBe('user');
  });

  it('verifies document integrity', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    const result = await api.verifyIntegrity(WORKSPACE_ID, request.id);
    expect(result.valid).toBe(true);
    expect(result.currentChecksum).toBe(request.documentChecksum);
  });
});

describe('MockSignApi: Workspace Isolation', () => {
  it('isolates state between workspaces', async () => {
    const api = new MockSignApi();
    api.reset();

    const req1 = await api.createRequest('ws_a', {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Request A',
    });

    const req2 = await api.createRequest('ws_b', {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Request B',
    });

    const listA = await api.listRequests('ws_a');
    const listB = await api.listRequests('ws_b');

    expect(listA.data).toHaveLength(1);
    expect(listB.data).toHaveLength(1);
    expect(listA.data[0].title).toBe('Request A');
    expect(listB.data[0].title).toBe('Request B');
  });

  it('rejects unauthenticated workspace access', async () => {
    const api = new MockSignApi();
    api.reset('ws_forbidden');

    await expect(api.listRequests('ws_forbidden')).rejects.toMatchObject({
      code: 'WORKSPACE_UNAUTHORIZED',
      status: 403,
    });
  });
});
