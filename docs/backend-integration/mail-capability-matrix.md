# Codin Mail Capability Matrix

> Generated during Phase F3 — Codin Mail Real API Integration
> Maps backend capabilities to frontend integration status.

---

| Capability | Backend Exists | Endpoint | Frontend Exists | Integration Status |
|------------|----------------|----------|-----------------|-------------------|
| Mailbox listing | Yes | `GET /workspaces/:workspaceId/mailboxes` (mailbox.routes.ts) | No | Not implemented |
| Folder listing | Yes | `GET /workspaces/:workspaceId/folders?mailboxId=...` | No | Planned |
| Folder creation | Yes | `POST /workspaces/:workspaceId/folders` | No | Not implemented |
| Folder update | Yes | `PATCH /workspaces/:workspaceId/folders/:folderId` | No | Not implemented |
| Folder deletion | Yes | `DELETE /workspaces/:workspaceId/folders/:folderId` | No | Not implemented |
| Thread listing | Yes | `GET /workspaces/:workspaceId/threads` | No | Planned |
| Thread detail | Yes | `GET /workspaces/:workspaceId/threads/:threadId` | No | Planned |
| Thread update | Yes | `PATCH /workspaces/:workspaceId/threads/:threadId` | No | Planned |
| Thread mark read | Yes | `POST /workspaces/:workspaceId/threads/:threadId/read` | No | Planned |
| Thread mark unread | Yes | `POST /workspaces/:workspaceId/threads/:threadId/unread` | No | Planned |
| Thread archive | Yes | `POST /workspaces/:workspaceId/threads/:threadId/archive` | No | Planned |
| Thread trash | Yes | `POST /workspaces/:workspaceId/threads/:threadId/trash` | No | Planned |
| Message detail | Yes | `GET /workspaces/:workspaceId/messages/:messageId` | No | Planned |
| Message update state | Yes | `PATCH /workspaces/:workspaceId/messages/:messageId` | No | Planned |
| Message delete permanently | Yes | `DELETE /workspaces/:workspaceId/messages/:messageId` | No | Planned |
| Message batch update | Yes | `POST /workspaces/:workspaceId/messages/batch` | No | Planned |
| Draft creation | Yes | `POST /workspaces/:workspaceId/drafts` | No | Planned |
| Draft listing | Yes | `GET /workspaces/:workspaceId/drafts?mailboxId=...` | No | Planned |
| Draft detail | Yes | `GET /workspaces/:workspaceId/drafts/:draftId` | No | Planned |
| Draft update | Yes | `PATCH /workspaces/:workspaceId/drafts/:draftId` | No | Planned |
| Draft deletion | Yes | `DELETE /workspaces/:workspaceId/drafts/:draftId` | No | Planned |
| Draft send | Yes | `POST /workspaces/:workspaceId/drafts/:draftId/send` | No | Planned |
| Send email (direct) | Yes | `POST /workspaces/:workspaceId/mail/send` | No | Planned |
| Search | Yes | `GET /workspaces/:workspaceId/search?q=...` | No | Planned |
| Attachment metadata | Yes | `GET /workspaces/:workspaceId/attachments/:attachmentId` | No | Planned |
| List message attachments | Yes | `GET /workspaces/:workspaceId/messages/:messageId/attachments` | No | Planned |
| Download attachment | Yes | `GET /workspaces/:workspaceId/attachments/:attachmentId/download` | No | Planned |
| Label listing | Yes | `GET /workspaces/:workspaceId/labels?mailboxId=...` | No | Not implemented |
| Label creation | Yes | `POST /workspaces/:workspaceId/labels` | No | Not implemented |
| Label update | Yes | `PATCH /workspaces/:workspaceId/labels/:labelId` | No | Not implemented |
| Label deletion | Yes | `DELETE /workspaces/:workspaceId/labels/:labelId` | No | Not implemented |
| External account listing | Yes | `GET /workspaces/:workspaceId/mail/accounts` | No | Not implemented |
| External account creation | Yes | `POST /workspaces/:workspaceId/mail/accounts` | No | Not implemented |
| External account update | Yes | `PATCH /workspaces/:workspaceId/mail/accounts/:accountId` | No | Not implemented |
| External account deletion | Yes | `DELETE /workspaces/:workspaceId/mail/accounts/:accountId` | No | Not implemented |
| Account test connection | Yes | `POST /workspaces/:workspaceId/mail/accounts/:accountId/test` | No | Not implemented |
| Account sync | Yes | `POST /workspaces/:workspaceId/mail/accounts/:accountId/sync` | No | Not implemented |
| Migration listing | Yes | `GET /workspaces/:workspaceId/migrations` | No | Not implemented |
| Migration create | Yes | `POST /workspaces/:workspaceId/migrations` | No | Not implemented |
| Migration actions | Yes | Multiple migration endpoints | No | Not implemented |
| Mailbox listing (mailbox module) | Yes | `GET /workspaces/:workspaceId/mailboxes` | No | Not implemented |
| Mailbox creation | Yes | `POST /workspaces/:workspaceId/mailboxes` | No | Not implemented |
| Mailbox update | Yes | `PATCH /workspaces/:workspaceId/mailboxes/:mailboxId` | No | Not implemented |
| Mailbox deletion | Yes | `DELETE /workspaces/:workspaceId/mailboxes/:mailboxId` | No | Not implemented |

---

## Capability Summary

### Fully Supported by Backend (Core Mail Features)
- Thread listing with cursor pagination
- Thread detail with messages
- Thread state management (read/unread, star, archive, trash)
- Message state management (read/unread, star, move, batch)
- Draft CRUD with optimistic locking (version)
- Draft send
- Search with filters (query, folder, labels, read, star, date range)
- Attachments (metadata, list, download)
- Labels (CRUD)
- Folders (CRUD)
- External accounts (CRUD, test, sync)
- Direct email sending

### Partially Supported (Backend Has Endpoints, Frontend Needs Implementation)
- Mailbox listing/management (mailbox.routes.ts — separate from mail module)
- Folder navigation via backend data
- Provider/connected account management
- Synchronization status
- Migration management

### Not Implemented (Backend Stubs/Not Ready)
- Account credentials retrieval (returns 501)
- Account connection testing (returns `connected: false`)

---

## Workspace → Mailbox → Provider Architecture

```
Workspace
├── Mailbox (codin — managed in mailboxes module)
│   ├── Provider (implicit: codin hosted)
│   └── Mailboxes in workspace
├── Company Mailbox (shared mailbox)
│   └── Shared mailbox members
└── Connected External Mailbox
    └── External account (mail_external_accounts)
        ├── Gmail (google_workspace)
        ├── Microsoft 365 (microsoft365)
        ├── IMAP/SMTP (imap_smtp)
        └── cPanel (cpanel)
```
