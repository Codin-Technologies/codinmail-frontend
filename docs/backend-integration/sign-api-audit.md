# Codin Sign — Backend API Audit

**Audit date:** 2026-09-09  
**Backend repo:** `C:\Users\HomePC\Codin Backend`  
**Phase references:** Phase 8D — Document Signing & Approval Workflows, Phase 9 — Unified API & Platform Event Layer

## 1. Route Mounting

The `signRouter` is registered in `src/routes/index.ts` as:

```ts
app.use(`${apiV1}/workspaces`, signRouter);
```

where `apiV1 = "/api/v1"`. Therefore the Sign API base path is:

```
/api/v1/workspaces
```

The router applies `authenticate` middleware to every route. Authentication uses
Supabase bearer-token verification (`src/middleware/auth.ts`). The `workspaceId`
is read from `req.workspaceId` (set by `requireWorkspaceMember` middleware, which
is defined but **not** applied to the sign router — see API Gap #1 below). In
practice the workspace context is expected via the `?workspaceId=` query parameter.

## 2. Endpoint Summary

| # | Method | Path | Query / Body | Response | Notes |
|---|--------|------|-------------|----------|-------|
| 1 | POST | `/api/v1/workspaces` | body: create request | `{ data: SigningRequestRecord }` | 201; 404 if file/version not found |
| 2 | GET | `/api/v1/workspaces` | `?workspaceId, status, limit, offset` | `{ data, meta: { total, limit, offset } }` | default limit 50, offset 0 |
| 3 | GET | `/api/v1/workspaces/stats` | `?workspaceId` | `{ data: SigningStats }` | per-workspace stats |
| 4 | GET | `/api/v1/workspaces/:requestId` | `?workspaceId` | `{ data: SigningRequestRecord }` | 404 if not found |
| 5 | PATCH | `/api/v1/workspaces/:requestId` | `?workspaceId`, body: update | `{ data: SigningRequestRecord }` | 409 if not draft/sent |
| 6 | DELETE | `/api/v1/workspaces/:requestId` | `?workspaceId` | 204 No Content | 409 if in_progress/completed |
| 7 | POST | `/api/v1/workspaces/:requestId/send` | `?workspaceId` | `{ data: SigningRequestRecord }` | 409 if not draft; 422 if no recipients |
| 8 | POST | `/api/v1/workspaces/:requestId/cancel` | `?workspaceId` | `{ data: SigningRequestRecord }` | 409 if can't transition |
| 9 | GET | `/api/v1/workspaces/:requestId/integrity` | `?workspaceId` | `{ data: { valid, currentChecksum?, originalChecksum? } }` | 404 if request not found |
| 10 | GET | `/api/v1/workspaces/:requestId/completion` | `?workspaceId` | `{ data: SigningCompletionRecord \| null }` | null if not completed |
| 11 | POST | `/api/v1/workspaces/:requestId/recipients` | `?workspaceId`, body: add recipient | `{ data: SigningRecipientRecord }` | 201; 409 if not draft |
| 12 | DELETE | `/api/v1/workspaces/:requestId/recipients/:recipientId` | `?workspaceId` | 204 No Content | 409 if not draft |
| 13 | POST | `/api/v1/workspaces/:requestId/recipients/:recipientId/action` | `?workspaceId`, body: action | `{ data: SigningRecipientRecord }` | evaluates workflow completion |

## 3. Endpoints in Detail

### 3.1 Create Signing Request

```
POST /api/v1/workspaces?workspaceId={wsId}
```

**Request body (zod schema):**
```ts
{
  fileId: string (uuid),           // required
  fileVersionId: string (uuid),    // required
  title: string,                   // required, 1–255 chars
  description: string,             // optional, max 5000 chars
  workflowMode: 'sequential' | 'parallel', // optional, default 'parallel'
  expiresAt: Date,                 // optional, coerced
}
```

The controller resolves the file and its version via the Files module
(`file.repository.getFile`, `file.repository.getFileVersion`). If either is
missing, a `404` with `{ error: { code: 'FILE_NOT_FOUND' } }` or
`{ error: { code: 'FILE_VERSION_NOT_FOUND' } }` is returned.

The `documentChecksum`, `mimeType`, and `storageKey` are derived from the file
version (falling back to file-level values):
```ts
documentChecksum = version.checksumSha256 || file.checksumSha256 || crypto.randomUUID()
mimeType = version.mimeType || file.mimeType
storageKey = version.storageKey || file.storageKey
```

**Success response (201):** `{ data: SigningRequestRecord }`

### 3.2 List Signing Requests

```
GET /api/v1/workspaces?workspaceId={wsId}&status={status}&limit={n}&offset={n}
```

**Query parameters:**
- `status` — optional string filter (`draft`, `sent`, `in_progress`, `completed`, `cancelled`, `expired`, `declined`)
- `limit` — optional integer, default 50
- `offset` — optional integer, default 0

**Success response (200):**
```ts
{
  data: SigningRequestRecord[],
  meta: { total: number, limit: number, offset: number }
}
```

### 3.3 Get Signing Statistics

```
GET /api/v1/workspaces/stats?workspaceId={wsId}
```

**Success response (200):**
```ts
{
  data: {
    total: number,
    byStatus: Record<SigningRequestStatus, number>,
    completedCount: number,
    averageCompletionHours: number | null
  }
}
```

### 3.4 Get Signing Request (Detail)

```
GET /api/v1/workspaces/:requestId?workspaceId={wsId}
```

Records a "viewed" audit event on every call.

**Success response (200):** `{ data: SigningRequestRecord }`  
**Error (404):** request not found

### 3.5 Update Signing Request

```
PATCH /api/v1/workspaces/:requestId?workspaceId={wsId}
```

**Request body (zod schema):**
```ts
{
  title: string,          // optional, 1–255 chars
  description: string,    // optional, max 5000 chars
  expiresAt: Date | null  // optional, coerced
}
```

Only requests in `draft` or `sent` status can be updated (409 otherwise).

**Success response (200):** `{ data: SigningRequestRecord }`

### 3.6 Delete Signing Request

```
DELETE /api/v1/workspaces/:requestId?workspaceId={wsId}
```

Cannot delete requests in `in_progress` or `completed` status (409).

**Success response (204):** No Content

### 3.7 Send Signing Request

```
POST /api/v1/workspaces/:requestId/send?workspaceId={wsId}
```

Transitions the request from `draft` to `sent`. Records `sentAt`. Sets all
recipients to `notified` with `notifiedAt`.

**Errors:**
- 409 — cannot transition from current status
- 422 — no recipients attached

**Success response (200):** `{ data: SigningRequestRecord }` (updated, with `status: 'sent'` and `sentAt`)

### 3.8 Cancel Signing Request

```
POST /api/v1/workspaces/:requestId/cancel?workspaceId={wsId}
```

Transitions to `cancelled`. Must be in a state that allows the transition
(`draft`, `sent`, `in_progress`).

**Success response (200):** `{ data: SigningRequestRecord }`

### 3.9 Verify Document Integrity

```
GET /api/v1/workspaces/:requestId/integrity?workspaceId={wsId}
```

Recomputes the SHA-256 checksum of the stored file object and compares it to
`documentChecksum` on the signing request record.

**Success response (200):**
```ts
{
  data: {
    valid: boolean,
    currentChecksum?: string,
    originalChecksum?: string
  }
}
```

### 3.10 Verify Completion

```
GET /api/v1/workspaces/:requestId/completion?workspaceId={wsId}
```

Returns the `SigningCompletionRecord` if the request is completed, otherwise `null`.
If the document has been tampered since completion, the completion record's
`verificationStatus` is updated to `"tampered"`.

**Success response (200):** `{ data: SigningCompletionRecord | null }`

### 3.11 Add Recipient

```
POST /api/v1/workspaces/:requestId/recipients?workspaceId={wsId}
```

**Request body (zod schema):**
```ts
{
  name: string,           // required, 1–255 chars
  email: string,          // required, valid email
  workspaceUserId: string (uuid),         // optional
  recipientType: 'internal' | 'external',// optional, default 'external'
  role: 'signer' | 'approver' | 'reviewer' | 'viewer', // optional, default 'signer'
  signingOrder: number,   // optional, integer ≥ 0, default 0
}
```

Can only add recipients to `draft` requests (409 otherwise).

**Success response (201):** `{ data: SigningRecipientRecord }`

### 3.12 Remove Recipient

```
DELETE /api/v1/workspaces/:requestId/recipients/:recipientId?workspaceId={wsId}
```

Can only remove recipients from `draft` requests (409 otherwise).

**Success response (204):** No Content

### 3.13 Recipient Action

```
POST /api/v1/workspaces/:requestId/recipients/:recipientId/action?workspaceId={wsId}
```

**Request body (zod schema):**
```ts
{
  action: 'sign' | 'decline' | 'approve' | 'reject' | 'request_changes' | 'complete_review',
  actorType: 'user' | 'system' | 'external', // optional, default 'user'
  actorId: string,                          // optional, defaults to authenticated user or 'external'
  metadata: Record<string, unknown>,         // optional
}
```

Action → new recipient status mapping:
| Action | New Recipient Status |
|--------|---------------------|
| sign | `signed` |
| decline | `declined` |
| approve | `approved` |
| reject | `rejected` |
| request_changes | `action_required` |
| complete_review | `completed` |

After the recipient action is recorded, `evaluateWorkflowCompletion` is called
automatically by the backend.

**Success response (200):** `{ data: SigningRecipientRecord }`

## 4. Backend State Machine

### 4.1 Signing Request Transitions

```
draft      ──send──► sent
  ├─cancel────────────────► cancelled
sent       ──first-action──► in_progress
  ├─complete-all────────────► completed
  ├─decline-one─────────────► declined
  ├─cancel──────────────────► cancelled
  └─expire──────────────────► expired
in_progress ──complete-all──► completed
  ├─decline-one─────────────► declined
  ├─cancel──────────────────► cancelled
  └─expire──────────────────► expired
completed  (terminal)
cancelled  (terminal)
expired    (terminal)
declined   (terminal)
```

Transition table (`SIGNING_STATUS_TRANSITIONS`):
| From | Allowed To |
|------|-----------|
| draft | sent, cancelled |
| sent | in_progress, completed, cancelled, expired |
| in_progress | completed, cancelled, expired, declined |
| completed | (none) |
| cancelled | (none) |
| expired | (none) |
| declined | (none) |

### 4.2 Recipient Status Transitions

| From | Allowed To |
|------|-----------|
| pending | notified, declined |
| notified | viewed, declined |
| viewed | action_required, signed, approved, rejected, declined |
| action_required | signed, approved, rejected, declined |
| signed | completed |
| approved | completed |
| rejected | action_required, declined |
| declined | (none) |
| completed | (none) |

### 4.3 Workflow Completion Rules

When a recipient action is processed (`recipientActionService`):

1. **Any recipient declined** → request transitions to `declined`
2. **All recipients signed/approved/completed** → request transitions to `completed`
   - A `SigningCompletionRecord` is created with `verificationStatus: "verified"`
3. **Sequential mode:** The next pending recipient (lowest `signingOrder`) in
   `pending`, `notified`, or `viewed` status is promoted to `action_required`
4. **Parallel mode:** All recipients in `pending` or `notified` status are promoted
   to `action_required`

## 5. Data Models

### SigningRequestRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | primary key |
| workspaceId | UUID | workspace scope |
| fileId | UUID | FK → files |
| fileVersionId | UUID | FK → file_versions |
| title | TEXT | NOT NULL |
| description | TEXT | default '' |
| status | TEXT | default 'draft' |
| workflowMode | TEXT | default 'parallel' |
| documentChecksum | TEXT | SHA-256 |
| mimeType | TEXT | |
| storageKey | TEXT | |
| createdBy | UUID | |
| sentAt | TIMESTAMPTZ | nullable |
| completedAt | TIMESTAMPTZ | nullable |
| expiresAt | TIMESTAMPTZ | nullable |
| createdAt | TIMESTAMPTZ | |
| updatedAt | TIMESTAMPTZ | |

### SigningRecipientRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | primary key |
| workspaceId | UUID | |
| signingRequestId | UUID | FK |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| workspaceUserId | UUID | nullable |
| recipientType | TEXT | default 'external' |
| role | TEXT | default 'signer' |
| signingOrder | INTEGER | default 0 |
| status | TEXT | default 'pending' |
| notifiedAt | TIMESTAMPTZ | nullable |
| viewedAt | TIMESTAMPTZ | nullable |
| completedAt | TIMESTAMPTZ | nullable |
| createdAt | TIMESTAMPTZ | |
| updatedAt | TIMESTAMPTZ | |

### SigningAuditEventRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | primary key |
| workspaceId | UUID | |
| signingRequestId | UUID | FK |
| actorType | TEXT | user\|system\|external |
| actorId | TEXT | |
| eventType | TEXT | free-form (created, viewed, updated, sent, cancelled, recipient_added, etc.) |
| metadata | JSONB | |
| createdAt | TIMESTAMPTZ | |

### SigningCompletionRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | primary key |
| workspaceId | UUID | |
| signingRequestId | UUID | FK |
| fileVersionId | UUID | FK |
| originalChecksum | TEXT | |
| completedAt | TIMESTAMPTZ | default NOW() |
| verificationStatus | TEXT | default 'verified' (verified\|tampered\|error) |
| metadata | JSONB | |

### SigningActionRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | primary key |
| workspaceId | UUID | |
| signingRequestId | UUID | FK |
| recipientId | UUID | FK |
| actorType | TEXT | |
| actorId | TEXT | |
| action | TEXT | sign\|decline\|approve\|reject\|request_changes\|complete_review |
| metadata | JSONB | |
| createdAt | TIMESTAMPTZ | |

## 6. Authentication & Authorization

- **Auth:** Bearer token (Supabase JWT) verified via `authenticate` middleware
- **Workspace isolation:** All operations require an active workspace member
  (`requireWorkspaceMember` checks `workspace_members.status = 'active'`)
- **RLS:** All sign tables have Row-Level Security policies scoped to
  `workspace_members` where `workspace_members.status = 'active'`
- **Per-request authorization:** Performed in service layer
  (`requireSigningRequestAccess` checks workspace membership + request existence)

## 7. Response Format

**Success:**
```ts
{ data: T }              // single resource
{ data: T[], meta: { total, limit, offset } }  // list
{ data: null }           // nullable
```

**Error:**
```ts
{
  error: {
    code: string,        // e.g. "FILE_NOT_FOUND", "INVALID_REQUEST", etc.
    message: string,
    details?: Record<string, unknown>
  }
}
```

**HTTP status code mapping:**
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Validation error (Zod parsing) |
| 401 | Authentication required |
| 403 | Workspace unauthorized |
| 404 | Resource not found |
| 409 | State transition conflict |
| 422 | Business rule validation |
| 500 | Internal server error |

## 8. Files Integration

The create-signing-request endpoint integrates with the Files module by:
1. Calling `getFile(workspaceId, fileId)` — returns 404 if file not found
2. Calling `getFileVersion(fileId, fileVersionId)` — returns 404 if version not found
3. Deriving `documentChecksum`, `mimeType`, `storageKey` from the file version

The frontend must obtain `fileId` and `fileVersionId` from the Files module before
creating a signing request. The Files list endpoint is:
```
GET /api/v1/workspaces/{workspaceId}/files?folderId={folderId}
```

File version listing:
```
GET /api/v1/workspaces/{workspaceId}/files/{fileId}/versions
```

## 9. Notifications

The backend defines notification helpers (`sign.notifications.ts`) but they are
**not invoked** from the sign service. The worker (`sign.worker.ts`) schedules
reminders and expiration checks via BullMQ, but the signing service itself does
not call `sendSigningInvitation` or `sendSigningReminder` directly.

The worker generates signing URLs in the format:
```
{appUrl}/sign/{requestId}/{recipientId}
```
This is a backend-internal URL pattern used for email links; the frontend
recipient experience uses its own routing.

## 10. Events (Phase 9)

The event registry (`event.registry.ts`) defines the following Sign events:
- `sign.request.created`
- `sign.request.sent`
- `sign.recipient.action_required`
- `sign.request.completed`
- `sign.request.declined`
- `sign.request.expired`

However, **the sign service does not currently publish any events** via
`publishEvent`. Audit events are recorded via `recordAuditEvent` (DB-level),
but these are not dispatched on the platform event bus. This is an API gap —
the events are defined but not emitted.

## 11. Background Worker

`sign.worker.ts` handles:
- `expireOldRequests` — bulk job that expires draft/sent/in_progress requests past `expiresAt`
- `sendReminder` — sends email reminders to specific recipients

The worker is not started in `server.ts` (only mail and file-processing workers
are started). This is an API gap — the sign worker is defined but not wired up.

## 12. API Gaps

| # | Gap | Backend Status | Frontend Guidance |
|---|-----|---------------|-------------------|
| 1 | workspaceId not set via middleware | `getWorkspaceId` reads `req.workspaceId` but `authenticate` doesn't set it; `requireWorkspaceMember` is not applied to signRouter | Frontend must pass `?workspaceId=` query param |
| 2 | No file picker endpoint for sign | Create request requires `fileId` + `fileVersionId` from Files module; no sign-specific file listing | Frontend reuses Files API to pick documents |
| 3 | Events not published | Phase 9 event types defined but not emitted by sign service | Frontend should be prepared for future realtime; uses polling/invalidation for now |
| 4 | Worker not started | `createSigningWorker` exists but not called in `server.ts` | Expiration is backend-managed; frontend should check `expiresAt` |
| 5 | No recipient notification dispatch | `sendSigningInvitation` exists but not called from service | Frontend must not assume email sent; relies on backend |
| 6 | No recipient token lookup | No endpoint to look up a recipient by token for the `/sign/{recipientToken}` experience | Recipient URL includes both `requestId` and `recipientId`; frontend route uses these params |
| 7 | No update recipient endpoint | Recipients can only be added/removed (draft only) and take actions; no PATCH on recipient | Frontend recipient management is add/remove only in draft state |
| 8 | No bulk recipient operations | Recipients must be added one at a time | Frontend adds recipients sequentially |
| 9 | No search on recipient list | `listRecipients` takes no search/filter params | Frontend shows all recipients for a request only |
