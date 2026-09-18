# Codin frontend API contract

The frontend currently calls the mock services in `lib/mock`. A backend can replace these implementations without changing the screens or state model.

| Area | Contract |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/session`, `POST /auth/verify-email`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Workspaces | `GET /workspaces`, `POST /workspaces`, `GET /workspaces/:id`, `POST /workspaces/join`, `POST /workspaces/:id/members` |
| Mailboxes | `GET /workspaces/:id/mailboxes`, `POST /workspaces/:id/mailboxes`, `DELETE /workspaces/:id/mailboxes/:mailboxId` |

The Codin account, workspace membership, active workspace and optional mailbox are intentionally separate resources.
