# Domain API Audit

## Backend Endpoints

### POST /api/v1/workspaces/:workspaceId/domains
**Frontend Method:** `CodinDomainApi.create(workspaceId: string, input: CreateDomainInput)` → `Promise<DomainWithVerification>`

**Backend Route:** `POST /api/v1/workspaces/:workspaceId/domains`
- Middleware: `authenticate` + `verifyWorkspaceAccess` (requires owner/admin role)
- Controller: `createDomainHandler` in `domain.controller.ts`
- Service: `createDomain` in `domain.service.ts`

**Request:**
```json
{
  "name": "string (valid domain format, min 3, max 255)"
}
```

**Headers:**
- `Authorization: Bearer <supabase_access_token>`
- `Content-Type: application/json`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameter `workspaceId` (validated via `verifyWorkspaceAccess` for owner/admin roles)

**Response (201):**
```json
{
  "domain": {
    "id": "string (uuid)",
    "name": "string",
    "status": "pending_verification",
    "mailEnabled": false,
    "verifiedAt": null,
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  },
  "verification": {
    "type": "TXT",
    "host": "@",
    "value": "codin-domain-verification=<token>"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not owner/admin of workspace
- 409: `DOMAIN_ALREADY_EXISTS` - Domain already taken
- 422: `VALIDATION_ERROR` - Invalid domain name format
- 500: `DATABASE_ERROR` - Failed to create domain

**Permissions:** Authenticated user with owner/admin role in workspace

---

### GET /api/v1/workspaces/:workspaceId/domains
**Frontend Method:** `CodinDomainApi.list(workspaceId: string)` → `Promise<Domain[]>`

**Backend Route:** `GET /api/v1/workspaces/:workspaceId/domains`
- Middleware: `authenticate` + membership check (read access)
- Controller: `listDomainsHandler` in `domain.controller.ts`
- Service: `listDomainsByWorkspace` in `domain.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameter `workspaceId` (validated for membership)

**Response (200):**
```json
{
  "domains": [
    {
      "id": "string (uuid)",
      "name": "string",
      "status": "pending_verification | verified | active | suspended | disabled",
      "mailEnabled": true,
      "verifiedAt": "string (ISO 8601) | null",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ]
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not a member of workspace
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with any active membership in workspace

---

### GET /api/v1/workspaces/:workspaceId/domains/:domainId
**Frontend Method:** `CodinDomainApi.get(workspaceId: string, domainId: string)` → `Promise<Domain | null>`

**Backend Route:** `GET /api/v1/workspaces/:workspaceId/domains/:domainId`
- Middleware: `authenticate` + membership check
- Controller: `getDomainHandler` in `domain.controller.ts`
- Service: `getDomainById` in `domain.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameters `workspaceId`, `domainId`

**Response (200):**
```json
{
  "domain": {
    "id": "string (uuid)",
    "name": "string",
    "status": "string",
    "mailEnabled": true,
    "verifiedAt": "string | null",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not a member of workspace
- 404: `RESOURCE_NOT_FOUND` - Domain not found
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with active membership in workspace

---

### POST /api/v1/workspaces/:workspaceId/domains/:domainId/verify
**Frontend Method:** `CodinDomainApi.verify(workspaceId: string, domainId: string)` → `Promise<Domain>`

**Backend Route:** `POST /api/v1/workspaces/:workspaceId/domains/:domainId/verify`
- Middleware: `authenticate` + `verifyWorkspaceAccess` (requires owner/admin)
- Controller: `verifyDomainHandler` in `domain.controller.ts`
- Service: `verifyDomain` in `domain.service.ts`

**Request:** Empty body `{}`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`
- `Content-Type: application/json`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameters `workspaceId`, `domainId` (validated for owner/admin)

**Response (200):**
```json
{
  "domain": {
    "id": "string (uuid)",
    "name": "string",
    "status": "verified",
    "mailEnabled": true,
    "verifiedAt": "string (ISO 8601)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not owner/admin of workspace
- 404: `DOMAIN_NOT_FOUND` - Domain not found
- 400: `VERIFICATION_EXPIRED` - Verification token expired
- 422: `VERIFICATION_EXPIRED` - TXT record not found (same code, different message)
- 500: `DATABASE_ERROR` - Failed to verify domain

**Permissions:** Authenticated user with owner/admin role in workspace

---

### GET /api/v1/workspaces/:workspaceId/domains/:domainId/check-dns
**Frontend Method:** `CodinDomainApi.checkDns(workspaceId: string, domainId: string)` → `Promise<DomainDnsRecord[]>`

**Backend Route:** `GET /api/v1/workspaces/:workspaceId/domains/:domainId/check-dns`
- Middleware: `authenticate` + membership check
- Controller: `checkDnsDomainHandler` in `domain.controller.ts`
- Service: `checkDomainDnsRecords` in `domain.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameters `workspaceId`, `domainId`

**Response (200):**
```json
{
  "records": [
    {
      "id": "string (uuid)",
      "type": "TXT | MX | SPF | DKIM | DMARC",
      "host": "string",
      "expectedValue": "string",
      "observedValue": "string | null",
      "status": "pending | valid | invalid | missing | error",
      "lastCheckedAt": "string (ISO 8601) | null"
    }
  ]
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not a member of workspace
- 404: `DOMAIN_NOT_FOUND` - Domain not found
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with active membership in workspace

---

### DELETE /api/v1/workspaces/:workspaceId/domains/:domainId
**Frontend Method:** `CodinDomainApi.delete(workspaceId: string, domainId: string)` → `Promise<void>`

**Backend Route:** `DELETE /api/v1/workspaces/:workspaceId/domains/:domainId`
- Middleware: `authenticate` + `verifyWorkspaceAccess` (requires owner/admin)
- Controller: `deleteDomainHandler` in `domain.controller.ts`
- Service: `deleteDomain` in `domain.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameters `workspaceId`, `domainId` (validated for owner/admin)

**Response (204):** No content

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 403: `DOMAIN_UNAUTHORIZED` - Not owner/admin of workspace
- 404: `DOMAIN_NOT_FOUND` - Domain not found
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with owner/admin role in workspace

---

## Frontend vs Backend Mismatches

### 1. Response Format
- **Backend:** All endpoints return raw responses without `success` wrapper
- **Frontend (domain.real.ts):** Expects wrapped responses like `{ domain: Domain }`, `{ domains: Domain[] }`, `{ records: DomainDnsRecord[] }`
- **Status:** Frontend already handles this correctly (doesn't expect `success` wrapper)

### 2. Domain Type Fields
- **Backend Domain Response (from service):**
  - `id`, `name`, `status`, `mailEnabled`, `verifiedAt`, `createdAt`, `updatedAt`
- **Frontend Domain type (domain.types.ts):**
  - `id`, `name`, `status`, `mailEnabled`, `verifiedAt`, `createdAt`, `updatedAt`
- **Status:** Matches ✅

### 3. DomainWithVerification
- **Backend create response:** `{ domain: {...}, verification: { type, host, value } }`
- **Frontend DomainWithVerification:** Extends Domain with `verification: { type, host, value }`
- **Status:** Matches ✅

### 4. DomainDnsRecord
- **Backend check-dns response:** `{ id, type, host, expectedValue, observedValue, status, lastCheckedAt }`
- **Frontend DomainDnsRecord:** Same fields ✅

### 5. CreateDomainInput
- **Frontend:** `{ name: string }`
- **Backend:** Same ✅

### 6. Verify Method Signature
- **Frontend:** `verify(workspaceId: string, domainId: string)` - no body
- **Backend:** Empty body `{}` - matches ✅

### 7. API Client URL Building
- **Frontend (api-client.ts):** Uses `workspaceId` as query param `?workspaceId=...`
- **Backend:** Uses path parameter `/workspaces/:workspaceId/domains`
- **MISMATCH:** Frontend sends `GET /api/v1/domains?workspaceId=xxx` but backend expects `GET /api/v1/workspaces/xxx/domains`

**CRITICAL FIX NEEDED:** Update `domain.real.ts` to use correct URL paths with workspaceId in path, not query string.

### 8. Workspace ID in All Domain Calls
All domain endpoints require `workspaceId` in the path:
- `POST /workspaces/:workspaceId/domains`
- `GET /workspaces/:workspaceId/domains`
- `GET /workspaces/:workspaceId/domains/:domainId`
- `POST /workspaces/:workspaceId/domains/:domainId/verify`
- `GET /workspaces/:workspaceId/domains/:domainId/check-dns`
- `DELETE /workspaces/:workspaceId/domains/:domainId`

**Frontend domain.real.ts currently uses:** `/workspaces/${workspaceId}/domains` - this is CORRECT ✅
Wait, let me re-check...

Looking at domain.real.ts:
- `list(workspaceId)`: `apiFetch(`/workspaces/${workspaceId}/domains`)` ✅
- `get(workspaceId, domainId)`: `apiFetch(`/workspaces/${workspaceId}/domains/${domainId}`)` ✅
- `create(workspaceId, input)`: `apiFetch(`/workspaces/${workspaceId}/domains`, ...)` ✅
- `verify(workspaceId, domainId)`: `apiFetch(`/workspaces/${workspaceId}/domains/${domainId}/verify`, ...)` ✅
- `checkDns(workspaceId, domainId)`: `apiFetch(`/workspaces/${workspaceId}/domains/${domainId}/check-dns`)` ✅
- `delete(workspaceId, domainId)`: `apiFetch(`/workspaces/${workspaceId}/domains/${domainId}`, ...)` ✅

Actually the domain.real.ts paths are CORRECT. The issue is in api-client.ts which appends workspaceId as query param when it's already in the path. But since the basePath already includes workspaceId, the buildUrl function will add it again as query param.

Looking at api-client.ts buildUrl:
```typescript
if (workspaceId && !basePath.includes(workspaceId)) {
  url.searchParams.append('workspaceId', workspaceId);
}
```

So if basePath is `/workspaces/ws_123/domains`, it includes `ws_123` so it won't add as query param. This should work correctly.

### 9. Missing Methods in Frontend DomainApi
- `DomainApi` interface in domain.types.ts has all 6 methods matching backend ✅

---

## Action Items

1. ✅ Verify domain.real.ts paths are correct (they are)
2. ✅ Verify api-client.ts buildUrl doesn't duplicate workspaceId (it checks `basePath.includes(workspaceId)`)
3. ✅ Confirm Domain type matches backend response
4. ✅ Confirm DomainWithVerification matches backend create response
5. ✅ Confirm DomainDnsRecord matches backend check-dns response
6. ❌ Fix: Ensure error handling for 403 (DOMAIN_UNAUTHORIZED) is handled
7. ❌ Fix: Ensure error handling for 409 (DOMAIN_ALREADY_EXISTS) is handled
8. ❌ Fix: Ensure error handling for 422 (VERIFICATION_EXPIRED - both expired token and TXT not found) is handled