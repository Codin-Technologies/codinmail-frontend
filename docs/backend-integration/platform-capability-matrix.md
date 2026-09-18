# Platform Capability Matrix

## Authentication

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| Login | Supabase Auth + POST /api/v1/auth/bootstrap | AuthApi.login | Mutation | /sign-in | Yes | Partial (no Supabase client) | No |
| Registration | Supabase Auth + POST /api/v1/auth/bootstrap | AuthApi.register | Mutation | /sign-up | Yes | Partial (no Supabase client) | No |
| Logout | Supabase Auth signOut | AuthApi.logout | Mutation | Settings/Workspace Shell | Yes | Partial (no Supabase client) | No |
| Current User | GET /api/v1/me | AuthApi.me | Query | Shell, Settings, Onboarding | Yes | No | No |
| Session Check | GET /api/v1/me | AuthApi.me | Query | RouteGuard | Yes | No | No |
| Session Expiration | 401 on /api/v1/me | AuthApi.me (error) | Query error | RouteGuard redirect | Yes | No | No |
| Email Verification | Supabase Auth | AuthApi.verifyEmail | Mutation | /verify-email | Yes | No | No |
| Password Reset | Supabase Auth | AuthApi.forgotPassword, resetPassword | Mutation | /forgot-password, /reset-password | Yes | No | No |
| Bootstrap User | POST /api/v1/auth/bootstrap | AuthApi.bootstrap | Mutation | Onboarding (implicit) | Yes | No | No |

## Workspaces

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Workspaces | GET /api/v1/workspaces | WorkspaceApi.list | Query | Onboarding, WorkspaceSwitcher, Settings | Yes | No | No |
| Get Workspace | GET /api/v1/workspaces/:id | WorkspaceApi.get | Query | Sign Detail, Settings | Yes | No | No |
| Create Workspace | POST /api/v1/workspaces | WorkspaceApi.create | Mutation | Onboarding, WorkspaceSwitcher | Yes | No | No |
| Switch Workspace | (client-side context) | useWorkspace.switchWorkspace | Local state | All workspace UIs | Yes | N/A | No |
| Workspace Members | (backend service only, no HTTP route) | — | — | Settings > Members | Yes (mock) | N/A | No |
| Workspace Permissions | (embedded in workspace responses as `role`) | — | — | RouteGuard, Settings | Yes (mock `role` field) | No | No |
| Join Workspace (invitation) | — | — | — | Onboarding | Yes (mock code) | No (no backend support) | No |

## Onboarding

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| Check Onboarding State | GET /api/v1/me + GET /api/v1/workspaces | (derived from auth + workspace queries) | — | /onboarding | Yes | No | No |
| Create Workspace | POST /api/v1/workspaces | WorkspaceApi.create | Mutation | /onboarding/create-workspace | Yes | No | No |
| Join Workspace | — | — | — | /onboarding/join-workspace | Yes (mock only) | No (no backend support) | No |
| Complete Onboarding | (inferred: user has workspaces) | — | — | Redirect to /f/inbox | Yes | No | No |

## Domains

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Domains | GET /api/v1/workspaces/:id/domains | DomainApi.list | Query | Settings > Domains, Admin Console | Yes | No | No |
| Get Domain | GET /api/v1/workspaces/:id/domains/:domainId | DomainApi.get | Query | Domain Detail | Yes | No | No |
| Create Domain | POST /api/v1/workspaces/:id/domains | DomainApi.create | Mutation | Settings > Domains (Add Domain) | Yes | No | No |
| Verify Domain | POST /api/v1/workspaces/:id/domains/:domainId/verify | DomainApi.verify | Mutation | Domain Detail (Verify button) | Yes | No | No |
| Check DNS Records | GET /api/v1/workspaces/:id/domains/:domainId/check-dns | DomainApi.checkDns | Query | Domain Detail (DNS table) | Yes | No | No |
| Delete Domain | DELETE /api/v1/workspaces/:id/domains/:domainId | DomainApi.delete | Mutation | Domain Detail (Delete) | Yes | No | No |

## Mail (Read-Only Status)

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Mailboxes | GET /api/v1/workspaces/:id/mailboxes | — | — | Mailbox Connect | Partial | N/A | N/A |
| List Messages | GET /api/v1/workspaces/:id/mail/messages | — | — | Mail App | Partial | N/A | N/A |

*Mail integration is partially complete and not in scope for Phase F2.*

## Calendar (Read-Only Status)

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Calendars | GET /api/v1/workspaces/:id/calendars | — | — | Calendar App | Partial | N/A | N/A |
| Calendar Events | GET /api/v1/workspaces/:id/calendar/events | — | — | Calendar App | Partial | N/A | N/A |

*Calendar integration is partially complete and not in scope for Phase F2.*

## Files (Read-Only Status)

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Files | GET /api/v1/workspaces/:id/files | — | — | Files App | Partial | N/A | N/A |
| File Versions | GET /api/v1/workspaces/:id/files/:fileId/versions | — | — | File Details | Partial | N/A | N/A |

*Files integration is partially complete and not in scope for Phase F2.*

## Sign (Completed in Phase F1)

| Capability | Backend Endpoint | Frontend API | Query/Mutation | UI | Mock | Real API | Tested |
|---|---|---|---|---|---|---|---|
| List Requests | GET /api/v1/workspaces/:id/sign | useSigningRequests | Query | SignDashboard | Yes | Yes | Yes |
| Get Request | GET /api/v1/workspaces/:id/sign/:requestId | useSigningRequest | Query | SignRequestDetailPage | Yes | Yes | Yes |
| Create Request | POST /api/v1/workspaces/:id/sign | useCreateRequest | Mutation | CreateRequestWizard | Yes | Yes | Yes |
| Send Request | POST /api/v1/workspaces/:id/sign/:requestId/send | useSendRequest | Mutation | SignRequestDetailPage | Yes | Yes | Yes |
| Cancel Request | POST /api/v1/workspaces/:id/sign/:requestId/cancel | useCancelRequest | Mutation | SignRequestDetailPage | Yes | Yes | Yes |
| Delete Request | DELETE /api/v1/workspaces/:id/sign/:requestId | useDeleteRequest | Mutation | SignRequestDetailPage | Yes | Yes | Yes |
| Add Recipient | POST /api/v1/workspaces/:id/sign/:requestId/recipients | useAddRecipient | Mutation | SignRequestDetailPage | Yes | Yes | Yes |
| Remove Recipient | DELETE /api/v1/workspaces/:id/sign/:requestId/recipients/:recipientId | useRemoveRecipient | Mutation | SignRequestDetailPage | Yes | Yes | Yes |
| Recipient Action | POST /api/v1/workspaces/:id/sign/:requestId/recipients/:recipientId/action | useRecipientAction | Mutation | RecipientSigningModal | Yes | Yes | Yes |
| Verify Integrity | GET /api/v1/workspaces/:id/sign/:requestId/integrity | useIntegrity | Query | IntegrityView | Yes | Yes | Yes |
| Get Completion | GET /api/v1/workspaces/:id/sign/:requestId/completion | useCompletion | Query | CompletionView | Yes | Yes | Yes |
| Get Stats | GET /api/v1/workspaces/:id/sign/stats | useSigningStats | Query | SignDashboard | Yes | Yes | Yes |
| Get Recipients | (via getRequest + listRecipients) | — | Query | SignRequestDetailPage | Yes | Yes | Yes |
| Audit Events | (via listAuditEvents in mock) | useAuditEvents | Query | AuditTimeline | Yes | Partial | Yes |
| List Files | GET /api/v1/workspaces/:id/files | useAvailableFiles | Query | DocumentPicker | Yes | Yes | Yes |
| Get File Versions | GET /api/v1/workspaces/:id/files/:fileId/versions | useFileVersions | Query | File version selection | Yes | Yes | Yes |

## Platform API Layer

| Component | Status | Notes |
|---|---|---|
| Centralized API client (`lib/api/api-client.ts`) | Exists | `apiFetch` used by Sign real API only |
| API error handling (`lib/api/api-errors.ts`) | Exists | `ApiError`, `isApiError`, auth/error helpers |
| API response types (`lib/api/api-response.ts`) | Exists | `isApiErrorResponse`, `ApiResponse`, `PaginatedResponse` |
| API config (`lib/api/config.ts`) | Exists | `getApiMode()`, `getApiUrl()` |
| Query provider (`lib/api/query-provider.tsx`) | Exists | `QueryProvider`, `queryClient` |
| Supabase client | Does not exist | Needs creation for real auth mode |
| Auth API abstraction | Does not exist | Mock only via `lib/mock/auth.ts` |
| Workspace API abstraction | Does not exist | Mock only via `lib/mock/workspaces.ts` |
| Domain API abstraction | Does not exist | Mock only via hardcoded settings page |
| Onboarding API | N/A | Derived from auth + workspace queries |

## Key Constraints

1. **Backend uses Supabase JWT** — Frontend must use `@supabase/supabase-js` for authentication, then call Codin Backend API with the access token
2. **No `NEXT_PUBLIC_` secrets** — Supabase anon key is public-safe, service role key is backend-only
3. **Workspace-scoped queries** — All domain/workspace queries must include workspaceId in query keys
4. **Route protection** — Frontend route guard for UX, backend `authenticate` middleware for security
