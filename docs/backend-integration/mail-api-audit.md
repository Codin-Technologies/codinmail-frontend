# Codin Mail API Audit

> Generated during Phase F3 — Codin Mail Real API Integration
> Source of truth: Backend implementation at `C:\Users\HomePC\Codin Backend\src\modules\mail\`

---

## Base URL

All endpoints are prefixed with `/api/v1` and mounted under `/workspaces` for workspace-scoped routes.

Example: `GET /api/v1/workspaces/:workspaceId/threads`

---

## Authentication

All application mail routes require authentication via the `authenticate` middleware, which validates the `Authorization: Bearer <token>` header against Supabase auth.

---

## Workspace Scoping

All mail endpoints operate within a workspace context. The `:workspaceId` path parameter identifies the workspace. The backend enforces workspace membership and mailbox-level permissions via `mail.permissions.ts`.

---

## Application Mail Endpoints

### Inbox

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/inbox` |
| Auth | Required (Bearer token) |
| Workspace | Yes (path) |
| Query params | `limit` (default 50), `cursor`, `folder`, `isRead`, `isStarred`, `labelId`, `q` |
| Response | `{ data: { threads: ThreadListItem[], nextCursor?: string } }` |
| Error | 401 (unauthorized), 404 (workspace not found) |

**ThreadListItem shape:**
```typescript
{
  thread: MailThread,
  latestMessage: {
    id: string;
    messageId: string;
    sender: string;
    subject: string;
    preview: string;
    receivedAt: string;
    isRead: boolean;
    isStarred: boolean;
    attachmentPresent: boolean;
    labels: Array<{ id: string; name: string; color: string }>;
  }
}
```

### List Threads

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/threads` |
| Auth | Required |
| Workspace | Yes |
| Query params | `mailboxId`, `folder` (inbox/sent/drafts/archive/trash/spam), `isRead`, `isStarred`, `labelId`, `q`, `limit` (1-100, default 50), `cursor` |
| Response | `{ data: { threads: ThreadListItem[], nextCursor?: string } }` |
| Error | 401, 404 |

### Thread Detail

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/threads/:threadId` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: { thread: MailThread, messages: any[] } }` |
| Error | 401, 403 (mailbox unauthorized), 404 (thread not found) |

### Update Thread

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | `/workspaces/:workspaceId/threads/:threadId` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ isStarred?: boolean, isArchived?: boolean, isDeleted?: boolean }` |
| Response | `{ data: MailThread }` |
| Error | 401, 403, 404 |

### Mark Thread Read

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/threads/:threadId/read` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: { success: true } }` |
| Error | 401, 403, 404 |

### Mark Thread Unread

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/threads/:threadId/unread` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: { success: true } }` |
| Error | 401, 403, 404 |

### Archive Thread

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/threads/:threadId/archive` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailThread }` |
| Error | 401, 403, 404 |

### Trash Thread

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/threads/:threadId/trash` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailThread }` |
| Error | 401, 403, 404 |

---

## Message Endpoints

### Message Detail

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/messages/:messageId` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailMessage }` |
| Error | 401, 404 |

**MailMessage shape:**
```typescript
{
  id: string;
  messageId: string;
  threadId: string | null;
  direction: "inbound" | "outbound";
  sender: string;
  recipients: any[];
  cc: any[];
  bcc: any[];
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
  status: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  inReplyTo: string | null;
  references: any[];
  sizeBytes: number;
  receivedAt: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Update Message State

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | `/workspaces/:workspaceId/messages/:messageId` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ isRead?: boolean, isStarred?: boolean, folder?: "inbox"\|"sent"\|"drafts"\|"archive"\|"trash"\|"spam", labels?: string[] }` |
| Response | `{ data: MailMessage }` |
| Error | 401, 403, 404 |

### Delete Message Permanently

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | `/workspaces/:workspaceId/messages/:messageId` |
| Auth | Required |
| Workspace | Yes |
| Response | 204 No Content |
| Error | 401, 403, 404 |

### Batch Update Messages

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/messages/batch` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ messageIds: string[], action: "markRead"\|"markUnread"\|"star"\|"unstar"\|"archive"\|"trash"\|"restore"\|"delete"\|"move", folder?: string, labelId?: string }` |
| Response | `{ data: { updatedCount: number } }` |
| Error | 401, 403, 422 |

---

## Draft Endpoints

### Create Draft

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/drafts` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ mailboxId: string, threadId?: string, to: string[], cc?: string[], bcc?: string[], subject: string, textBody?: string, htmlBody?: string, inReplyTo?: string, references?: string[], replyContext?: object, forwardContext?: object }` |
| Response | `{ data: MailDraft }` — 201 Created |
| Error | 401, 403, 404, 422 |

**MailDraft shape:**
```typescript
{
  id: string;
  workspaceId: string;
  mailboxId: string;
  threadId: string | null;
  toRecipients: any[];
  ccRecipients: any[];
  bccRecipients: any[];
  subject: string;
  textBody: string | null;
  htmlBody: string | null;
  inReplyTo: string | null;
  references: any[];
  replyContext: object | null;
  forwardContext: object | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}
```

### List Drafts

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/drafts` |
| Auth | Required |
| Workspace | Yes |
| Query params | `mailboxId` (required) |
| Response | `{ data: MailDraft[] }` |
| Error | 401, 404 |

### Get Draft

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/drafts/:draftId` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailDraft }` |
| Error | 401, 403, 404 |

### Update Draft

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | `/workspaces/:workspaceId/drafts/:draftId` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ to?: string[], cc?: string[], bcc?: string[], subject?: string, textBody?: string, htmlBody?: string, inReplyTo?: string, references?: string[], replyContext?: object, forwardContext?: object, version?: number }` |
| Response | `{ data: MailDraft }` |
| Error | 401, 403, 404, 409 (version conflict) |

### Delete Draft

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | `/workspaces/:workspaceId/drafts/:draftId` |
| Auth | Required |
| Workspace | Yes |
| Response | 204 No Content |
| Error | 401, 403, 404 |

### Send Draft

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/drafts/:draftId/send` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: { messageId: string, rfcMessageId: string, outboxId: string }, message: "Draft sent and queued for delivery" }` — 202 Accepted |
| Error | 401, 403, 404 |

---

## Search Endpoint

### Search Messages

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/search` |
| Auth | Required |
| Workspace | Yes |
| Query params | `q` (required, min 1 char), `mailboxId`, `folder`, `labelId`, `isRead`, `isStarred`, `dateFrom`, `dateTo`, `limit` (1-100, default 50), `cursor` |
| Response | `{ data: { messages: MailMessage[], nextCursor?: string } }` |
| Error | 401, 422 |

Search uses PostgreSQL full-text search across subject, sender, body, and labels.

---

## Attachment Endpoints

### Get Attachment Metadata

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/attachments/:attachmentId` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailMessageAttachment }` |
| Error | 401, 404 |

**Attachment shape:**
```typescript
{
  id: string;
  messageId: string;
  workspaceId: string;
  mailboxId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  checksumSha256: string | null;
  downloadCount: number;
  createdAt: string;
}
```

### List Message Attachments

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/messages/:messageId/attachments` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailMessageAttachment[] }` |
| Error | 401, 404 |

### Download Attachment

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/attachments/:attachmentId/download` |
| Auth | Required |
| Workspace | Yes |
| Response | Binary file (Content-Disposition: attachment) |
| Error | 401, 404 |

---

## Label Endpoints

### Create Label

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/labels` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ mailboxId: string, name: string, color?: string }` |
| Response | `{ data: MailLabel }` — 201 |
| Error | 401, 403, 422 |

### List Labels

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/labels` |
| Auth | Required |
| Workspace | Yes |
| Query params | `mailboxId` (required) |
| Response | `{ data: MailLabel[] }` |
| Error | 401 |

### Get Label

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/labels/:labelId` |
| Auth | Required |
| Workspace | Yes |
| Response | `{ data: MailLabel }` |
| Error | 401, 404 |

### Update Label

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | `/workspaces/:workspaceId/labels/:labelId` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ name?: string, color?: string }` |
| Response | `{ data: MailLabel }` |
| Error | 401, 403, 404 |

### Delete Label

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | `/workspaces/:workspaceId/labels/:labelId` |
| Auth | Required |
| Workspace | Yes |
| Response | 204 |
| Error | 401, 403, 404 |

---

## Folder Endpoints

### Create Folder

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/folders` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ mailboxId: string, name: string, parentId?: string }` |
| Response | `{ data: MailFolder }` — 201 |
| Error | 401, 403, 422 |

### List Folders

| Property | Value |
|----------|-------|
| Method | GET |
| Path | `/workspaces/:workspaceId/folders` |
| Auth | Required |
| Workspace | Yes |
| Query params | `mailboxId` (required) |
| Response | `{ data: MailFolder[] }` |
| Error | 401 |

### Update Folder

| Property | Value |
|----------|-------|
| Method | PATCH |
| Path | `/workspaces/:workspaceId/folders/:folderId` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ name?: string, sortOrder?: number }` |
| Response | `{ data: MailFolder }` |
| Error | 401, 403, 404 |

### Delete Folder

| Property | Value |
|----------|-------|
| Method | DELETE |
| Path | `/workspaces/:workspaceId/folders/:folderId` |
| Auth | Required |
| Workspace | Yes |
| Response | 204 |
| Error | 401, 403, 404 |

---

## Send Email (Outbound)

| Property | Value |
|----------|-------|
| Method | POST |
| Path | `/workspaces/:workspaceId/mail/send` |
| Auth | Required |
| Workspace | Yes |
| Body | `{ mailboxId: string, to: string[], cc?: string[], bcc?: string[], subject: string, bodyText?: string, bodyHtml?: string }` |
| Response | `{ data: { messageId: string, rfcMessageId: string, outboxId: string, status: "queued" }, message: "Outbound email accepted and queued for delivery" }` — 202 |
| Error | 400, 401, 404 |

---

## External Account Endpoints

Mounted at `/api/v1/workspaces` via `accountsRouter`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspaces/:workspaceId/mail/accounts` | List external accounts |
| GET | `/workspaces/:workspaceId/mail/accounts/:accountId` | Get account |
| POST | `/workspaces/:workspaceId/mail/accounts` | Create account |
| PATCH | `/workspaces/:workspaceId/mail/accounts/:accountId` | Update account |
| DELETE | `/workspaces/:workspaceId/mail/accounts/:accountId` | Delete account |
| POST | `/workspaces/:workspaceId/mail/accounts/:accountId/test` | Test connection |
| POST | `/workspaces/:workspaceId/mail/accounts/:accountId/sync` | Trigger sync |
| GET | `/workspaces/:workspaceId/mail/accounts/:accountId/credentials` | Get credentials (501 — not supported) |

---

## Internal Mail Endpoints (Daemon)

Mounted at `/api/v1/internal/mail`. These are for backend daemon communication (Haraka SMTP gateway) and are NOT intended for frontend use.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/internal/mail/recipient-lookup?email=...` | Recipient validation |
| POST | `/internal/mail/inbound-delivered` | Inbound delivery confirmation |

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "AUTH_UNAUTHORIZED|MAILBOX_NOT_FOUND|WORKSPACE_NOT_FOUND|INVALID_REQUEST|VALIDATION_ERROR|INTERNAL_SERVER_ERROR|...",
    "message": "Human readable message",
    "details": { /* optional */ }
  }
}
```

HTTP status mapping:
- 400 — Validation error / bad request
- 401 — Authentication required / invalid token
- 403 — Mailbox unauthorized / workspace unauthorized
- 404 — Resource not found
- 409 — Conflict (e.g., draft version mismatch)
- 422 — Validation failed (Zod errors)
- 500 — Internal server error

---

## Pagination

List endpoints (threads, messages, search) use cursor-based pagination:
- `limit` query param (default 50, max 100)
- `cursor` query param (opaque cursor for next page)
- Response includes `nextCursor` for pagination

---

## Workspace Isolation

Every request includes `:workspaceId` in the path. The backend verifies:
1. User is authenticated (JWT token in Authorization header)
2. User is a member of the workspace
3. User has appropriate mailbox permissions (read/send/delete/manage)

Permission hierarchy: Read < Send < Delete < Manage

---

## CORS

Configured via `app.ts` middleware using `env.CORS_ORIGIN`. Only explicitly configured origins are allowed (no wildcard for authenticated APIs).
