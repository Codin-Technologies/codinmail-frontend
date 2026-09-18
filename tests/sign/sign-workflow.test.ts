/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach } from 'vitest';
import { MockSignApi } from '@/lib/features/sign/api/sign.mock';
import { setSignApi } from '@/lib/features/sign/api/sign.client';

const WORKSPACE_ID = 'ws_workflow_001';

describe('Signing Workflow: End-to-End', () => {
  let api: MockSignApi;

  beforeEach(() => {
    api = new MockSignApi();
    api.reset(WORKSPACE_ID);
    api.reset('ws_demo_001');
    setSignApi(api);
  });

  it('completes full parallel workflow: create → add recipients → send → sign → complete', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Q4 Financial Agreement',
      description: 'Annual financial agreement for Q4',
      workflowMode: 'parallel',
    });
    expect(request.status).toBe('draft');

    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'signer',
    });
    const r2 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'approver',
    });

    const recipients = await api.listRecipients(WORKSPACE_ID, request.id);
    expect(recipients).toHaveLength(2);

    const sent = await api.sendRequest(WORKSPACE_ID, request.id);
    expect(sent.status).toBe('sent');

    const notifiedRecipients = await api.listRecipients(WORKSPACE_ID, request.id);
    notifiedRecipients.forEach((r) => {
      expect(r.status).toBe('notified');
    });

    await api.recipientAction(WORKSPACE_ID, request.id, recipients[0].id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'alice@example.com',
    });

    await api.recipientAction(WORKSPACE_ID, request.id, r2.id, {
      action: 'approve',
      actorType: 'external',
      actorId: 'bob@example.com',
    });

    const completed = await api.getRequest(WORKSPACE_ID, request.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.completedAt).toBeTruthy();

    const completion = await api.getCompletion(WORKSPACE_ID, request.id);
    expect(completion).not.toBeNull();
    expect(completion?.verificationStatus).toBe('verified');
  });

  it('completes full sequential workflow with ordered recipients', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
      workflowMode: 'sequential',
    });

    const r1 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'First Signer',
      email: 'first@example.com',
      role: 'signer',
      signingOrder: 0,
    });
    const r2 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Second Signer',
      email: 'second@example.com',
      role: 'signer',
      signingOrder: 1,
    });

    await api.sendRequest(WORKSPACE_ID, request.id);

    const afterSend = await api.listRecipients(WORKSPACE_ID, request.id);
    expect(afterSend[0].status).toBe('action_required');
    expect(afterSend[1].status).toBe('notified');

    await api.recipientAction(WORKSPACE_ID, request.id, r1.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'first@example.com',
    });

    const afterFirst = await api.listRecipients(WORKSPACE_ID, request.id);
    expect(afterFirst[1].status).toBe('action_required');

    await api.recipientAction(WORKSPACE_ID, request.id, r2.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'second@example.com',
    });

    const completed = await api.getRequest(WORKSPACE_ID, request.id);
    expect(completed?.status).toBe('completed');
  });

  it('handles partial completion then decline in parallel workflow', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Multi-party Agreement',
      workflowMode: 'parallel',
    });

    const r1 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Signatory 1',
      email: 's1@example.com',
      role: 'signer',
    });
    const r2 = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'Signatory 2',
      email: 's2@example.com',
      role: 'signer',
    });

    await api.sendRequest(WORKSPACE_ID, request.id);

    await api.recipientAction(WORKSPACE_ID, request.id, r1.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 's1@example.com',
    });

    const afterFirst = await api.getRequest(WORKSPACE_ID, request.id);
    expect(afterFirst?.status).toBe('in_progress');

    await api.recipientAction(WORKSPACE_ID, request.id, r2.id, {
      action: 'decline',
      actorType: 'external',
      actorId: 's2@example.com',
    });

    const declined = await api.getRequest(WORKSPACE_ID, request.id);
    expect(declined?.status).toBe('declined');

    const completion = await api.getCompletion(WORKSPACE_ID, request.id);
    expect(completion).toBeNull();
  });

  it('rejects invalid actions on signed recipients', async () => {
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

    await api.recipientAction(WORKSPACE_ID, request.id, recipient.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'john@example.com',
    });

    await expect(
      api.recipientAction(WORKSPACE_ID, request.id, recipient.id, {
        action: 'sign',
      })
    ).rejects.toMatchObject({ code: 'INVALID_REQUEST', status: 409 });
  });

  it('audit trail captures all workflow events', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
    });

    const recipient = await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });
    await api.sendRequest(WORKSPACE_ID, request.id);
    await api.recipientAction(WORKSPACE_ID, request.id, recipient.id, {
      action: 'sign',
      actorType: 'external',
      actorId: 'john@example.com',
    });

    const events = await api.listAuditEvents(WORKSPACE_ID, request.id);

    const eventTypes = events.map((e) => e.eventType);
    expect(eventTypes).toContain('created');
    expect(eventTypes).toContain('recipient_added');
    expect(eventTypes).toContain('sent');
    expect(eventTypes).toContain('recipient_sign');
    expect(eventTypes).toContain('completed');
  });

  it('maintains request state integrity through full workflow', async () => {
    const request = await api.createRequest(WORKSPACE_ID, {
      fileId: 'file-1',
      fileVersionId: 'ver-1',
      title: 'Contract',
      workflowMode: 'parallel',
    });

    expect(request.status).toBe('draft');
    expect(request.sentAt).toBeNull();
    expect(request.completedAt).toBeNull();

    await api.addRecipient(WORKSPACE_ID, request.id, {
      name: 'John',
      email: 'john@example.com',
    });

    const draft = await api.getRequest(WORKSPACE_ID, request.id);
    expect(draft?.status).toBe('draft');
    expect(draft?.sentAt).toBeNull();

    await api.sendRequest(WORKSPACE_ID, request.id);

    const sent = await api.getRequest(WORKSPACE_ID, request.id);
    expect(sent?.status).toBe('sent');
    expect(sent?.sentAt).toBeTruthy();
    expect(sent?.completedAt).toBeNull();

    const recipientList = await api.listRecipients(WORKSPACE_ID, request.id);
    await api.recipientAction(
      WORKSPACE_ID,
      request.id,
      recipientList[0].id,
      { action: 'sign', actorType: 'external', actorId: 'john@example.com' }
    );

    const completed = await api.getRequest(WORKSPACE_ID, request.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.completedAt).toBeTruthy();
  });
});
