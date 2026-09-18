# Codin Sign — Capability Matrix

This matrix maps every backend capability to its frontend API method, TanStack
Query operation, UI screen, UI component, and test. Only backend-discovered
capabilities are listed.

## Legend

- **Frontend API Method** — the method on the `SignApi` interface implemented by both `MockSignApi` and `CodinSignApi`
- **TanStack Query** — the hook used in React components
- **UI Screen** — the Next.js page / route segment
- **UI Component** — the specific component within that screen
- **Test** — the test file covering this path

---

## Sign Requests — CRUD

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| List requests (workspace-scoped, with status/limit/offset filters) | `GET /api/v1/workspaces?workspaceId, status, limit, offset` | `listRequests(workspaceId, filters)` | `useSigningRequests(workspaceId, filters)` (query) | `/f/sign` (Dashboard + list) | `SignRequestList` | `sign-api.test.ts` |
| Get single request by ID | `GET /api/v1/workspaces/:requestId?workspaceId` | `getRequest(workspaceId, requestId)` | `useSigningRequest(workspaceId, requestId)` (query) | `/f/sign/[requestId]` | `SignRequestDetail` | `sign-api.test.ts` |
| Create draft request | `POST /api/v1/workspaces?workspaceId` | `createRequest(workspaceId, input)` | `useCreateRequest(workspaceId)` (mutation) | `/f/sign/new` → Step 1+ | `CreateRequestWizard` | `sign-api.test.ts` |
| Update request (draft/sent only) | `PATCH /api/v1/workspaces/:requestId?workspaceId` | `updateRequest(workspaceId, requestId, patch)` | `useUpdateRequest(workspaceId, requestId)` (mutation) | `/f/sign/new` → Review | `ReviewStep` | `sign-api.test.ts` |
| Delete request (not in_progress/completed) | `DELETE /api/v1/workspaces/:requestId?workspaceId` | `deleteRequest(workspaceId, requestId)` | `useDeleteRequest(workspaceId)` (mutation) | `/f/sign/[requestId]` | `RequestActions` | `sign-api.test.ts` |

## Sign Requests — Workflow

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| Send draft request (→ sent, notifies recipients) | `POST /api/v1/workspaces/:requestId/send?workspaceId` | `sendRequest(workspaceId, requestId)` | `useSendRequest(workspaceId)` (mutation) | `/f/sign/new` → Step 4 (Review) | `ReviewStep`, `SendButton` | `sign-workflow.test.ts` |
| Cancel request | `POST /api/v1/workspaces/:requestId/cancel?workspaceId` | `cancelRequest(workspaceId, requestId)` | `useCancelRequest(workspaceId)` (mutation) | `/f/sign/[requestId]` | `RequestActions` | `sign-workflow.test.ts` |

## Sign Recipients

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| List recipients for a request | (via `getRequest` → no direct list endpoint; only `addRecipient` / `removeRecipient` / `action`) | `listRecipients?(workspaceId, requestId)` (optional helper in mock) | `useSigningRecipients(workspaceId, requestId)` (query) | `/f/sign/[requestId]` | `RecipientList` | `sign-api.test.ts` |
| Add recipient (draft only) | `POST /api/v1/workspaces/:requestId/recipients?workspaceId` | `addRecipient(workspaceId, requestId, input)` | `useAddRecipient(workspaceId, requestId)` (mutation) | `/f/sign/new` → Step 2 | `RecipientForm`, `RecipientList` | `sign-api.test.ts` |
| Remove recipient (draft only) | `DELETE /api/v1/workspaces/:requestId/recipients/:recipientId?workspaceId` | `removeRecipient(workspaceId, requestId, recipientId)` | `useRemoveRecipient(workspaceId, requestId)` (mutation) | `/f/sign/new` → Step 2 | `RecipientList` | `sign-api.test.ts` |
| Recipient action (sign/decline/approve/reject/etc.) | `POST /api/v1/workspaces/:requestId/recipients/:recipientId/action?workspaceId` | `recipientAction(workspaceId, requestId, recipientId, input)` | `useRecipientAction(workspaceId, requestId, recipientId)` (mutation) | `/sign/[requestId]/[recipientId]` | `RecipientActionForm` | `sign-workflow.test.ts` |

## Signing Order

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| `signingOrder` field on recipient | — (model field) | `addRecipient` with `signingOrder` | — | `/f/sign/new` → Step 3 | `SigningOrderStep` | `sign-workflow.test.ts` |
| Workflow mode (sequential/parallel) | `workflowMode` field on request | `createRequest` with `workflowMode` | — | `/f/sign/new` → Step 1 | `DocumentStep` | `sign-workflow.test.ts` |

## Statistics

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| Get workspace signing stats | `GET /api/v1/workspaces/stats?workspaceId` | `getStats(workspaceId)` | `useSigningStats(workspaceId)` (query) | `/f/sign` | `SignDashboard` (stat cards) | `sign-api.test.ts` |

## Integrity & Completion

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| Verify document integrity (checksum comparison) | `GET /api/v1/workspaces/:requestId/integrity?workspaceId` | `verifyIntegrity(workspaceId, requestId)` | `useVerifyIntegrity(workspaceId, requestId)` (query) | `/f/sign/[requestId]/integrity` | `IntegrityVerifier` | `sign-api.test.ts` |
| Verify completion record | `GET /api/v1/workspaces/:requestId/completion?workspaceId` | `getCompletion(workspaceId, requestId)` | `useCompletionRecord(workspaceId, requestId)` (query) | `/f/sign/[requestId]/completion` | `CompletionView` | `sign-api.test.ts` |

## Audit / History

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| List audit events for a request | (no direct endpoint; audit events stored in `signing_audit_events` table but not exposed via controller) | `listAuditEvents?(workspaceId, requestId)` (mock-only) | `useAuditEvents(workspaceId, requestId)` (query) | `/f/sign/[requestId]/audit` | `AuditTimeline` | API gap #9 |

## Files Integration (for document selection)

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| List workspace files | `GET /api/v1/workspaces/{workspaceId}/files?folderId` | `listFiles(workspaceId, folderId)` | `useFiles(workspaceId, folderId)` (query) | `/f/sign/new` → Step 1 | `DocumentPicker` | `sign-api.test.ts` |
| Get file version (for checksum/mimeType/storageKey) | `GET /api/v1/workspaces/{workspaceId}/files/{fileId}/versions` | `getFileVersion(workspaceId, fileId, versionId)` | `useFileVersion(...)` | `/f/sign/new` → Step 1 | `DocumentPicker` | `sign-api.test.ts` |

## Authentication & Workspace

| Backend Capability | Backend Endpoint | Frontend API Method | TanStack Query Operation | UI Screen | UI Component | Test |
|---|---|---|---|---|---|---|
| Bearer token auth | `Authorization: Bearer <token>` header | handled centrally in API client | — | All Sign pages | — | `sign-api.test.ts` |
| Workspace isolation | `?workspaceId=` query param | workspaceId passed to every method | Query keys include workspaceId | All Sign pages | — | `sign-query.test.ts` |

## Errors Handled

| HTTP Code | Error Condition | Frontend Handling | Test |
|---|---|---|---|
| 401 | Missing/invalid token | Redirect to sign-in | `sign-api.test.ts` |
| 403 | Not a workspace member | Permission denied UI | `sign-error.test.tsx` |
| 404 | Request/file/recipient not found | Not-found state | `sign-error.test.tsx` |
| 409 | Invalid state transition | Action-invalidation message | `sign-state.test.tsx` |
| 422 | Business validation (e.g. no recipients) | Field-level error display | `sign-api.test.ts` |
| 5xx | Server error | Error boundary + retry | `sign-error.test.tsx` |
