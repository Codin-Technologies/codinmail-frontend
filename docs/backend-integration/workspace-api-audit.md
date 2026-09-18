# Workspace API Audit

## Backend Endpoints

### POST /api/v1/workspaces
**Frontend Method:** `CodinWorkspaceApi.create(input: CreateWorkspaceInput)` → `Promise<Workspace>`

**Backend Route:** `POST /api/v1/workspaces`
- Middleware: `authenticate` (requires valid Supabase JWT)
- Controller: `createWorkspaceHandler` in `workspace.controller.ts`
- Service: `createWorkspace` in `workspace.service.ts`

**Request:**
```json
{
  "name": "string (min 1, max 255)",
  "slug": "string (min 1, max 100, regex: ^[a-z0-9-]+$)",
  "description": "string (max 500, optional)"
}
```

**Headers:**
- `Authorization: Bearer <supabase_access_token>`
- `Content-Type: application/json`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Response (201):**
```json
{
  "workspace": {
    "id": "string (uuid)",
    "name": "string",
    "slug": "string",
    "description": "string",
    "status": "string",
    "role": "string"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 409: `WORKSPACE_SLUG_CONFLICT` - Slug already taken
- 422: `VALIDATION_ERROR` - Invalid request body
- 500: `DATABASE_ERROR` - Failed to create workspace

**Permissions:** Authenticated user

---

### GET /api/v1/workspaces
**Frontend Method:** `CodinWorkspaceApi.list()` → `Promise<Workspace[]>`

**Backend Route:** `GET /api/v1/workspaces`
- Middleware: `authenticate` (requires valid Supabase JWT)
- Controller: `listWorkspacesHandler` in `workspace.controller.ts`
- Service: `listWorkspacesByUser` in `workspace.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Response (200):**
```json
{
  "workspaces": [
    {
      "id": "string (uuid)",
      "name": "string",
      "slug": "string",
      "description": "string",
      "status": "string",
      "role": "string"
    }
  ]
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user (returns only workspaces where user has active membership)

---

### GET /api/v1/workspaces/:workspaceId
**Frontend Method:** `CodinWorkspaceApi.get(workspaceId: string)` → `Promise<Workspace | null>`

**Backend Route:** `GET /api/v1/workspaces/:workspaceId`
- Middleware: `authenticate` (requires valid Supabase JWT)
- Controller: `getWorkspaceHandler` in `workspace.controller.ts`
- Service: `getWorkspaceWithMembership` in `workspace.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Workspace Context:** Path parameter `workspaceId`

**Response (200):**
```json
{
  "workspace": {
    "id": "string (uuid)",
    "name": "string",
    "slug": "string",
    "description": "string",
    "status": "string",
    "role": "string"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 404: `RESOURCE_NOT_FOUND` - Workspace not found or user not member
- 422: `VALIDATION_ERROR` - Workspace ID required
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with active membership in workspace

---

### GET /api/v1/workspaces/:workspaceId/members
**Frontend Method:** `CodinWorkspaceApi.getMembers(workspaceId: string)` → `Promise<WorkspaceMember[]>`

**Backend Route:** Not exposed via HTTP (service function exists but no route)

**Backend Service:** `getWorkspaceMembers` in `workspace.service.ts` (exists but no HTTP route)

**Status:** **NOT IMPLEMENTED AS HTTP ENDPOINT**

**Frontend Impact:** `CodinWorkspaceApi.getMembers()` will fail with 404

**Action Required:** Either add route or remove from frontend API

---

## Frontend vs Backend Mismatches

### 1. Response Format
- **Backend:** Returns raw `{ workspace: {...} }` or `{ workspaces: [...] }` without `success` wrapper
- **Frontend (workspace.real.ts):** Expects `{ workspace: Workspace }` or `{ workspaces: Workspace[] }`
- **Status:** Partially OK - frontend already handles this pattern but doesn't check for `success` field

### 2. Workspace Type Fields
- **Backend Workspace type (from service):**
  - `id`, `name`, `slug`, `description`, `logoUrl`, `ownerId`, `status`, `createdAt`, `updatedAt`
  - Plus `role` from membership (added in controller response)
- **Frontend Workspace type (workspace.types.ts):**
  - `id`, `name`, `slug`, `description`, `status`, `role`, `createdAt`, `updatedAt`
  - Missing: `logoUrl`, `ownerId`
  - Extra: `role` is on Workspace type (OK, added by controller)

**Status:** Minor - frontend missing `logoUrl`, `ownerId` but not used

### 3. getMembers Endpoint Missing
- **Backend:** No HTTP route for `/workspaces/:workspaceId/members`
- **Frontend:** `CodinWorkspaceApi.getMembers()` calls `/workspaces/${workspaceId}/members`
- **Result:** 404 error

**Action Required:** Remove `getMembers` from frontend WorkspaceApi interface or add backend route

### 4. CreateWorkspaceInput
- **Frontend:** `name`, `slug`, `description`
- **Backend:** Same - matches ✅

### 5. Workspace Member Type
- **Backend (service):**
  - `id`, `userId`, `displayName`, `email`, `role`, `status`, `joinedAt`
- **Frontend:**
  - `id`, `userId`, `displayName`, `email`, `role`, `status`, `joinedAt`
- **Status:** Matches ✅

---

## Action Items

1. ✅ Fix `CodinWorkspaceApi.list()` to handle raw `{ workspaces: [...] }` response
2. ✅ Fix `CodinWorkspaceApi.get()` to handle raw `{ workspace: ... }` response
3. ✅ Fix `CodinWorkspaceApi.create()` to handle raw `{ workspace: ... }` response
4. ❌ Remove `getMembers` from `WorkspaceApi` interface (no backend endpoint)
5. ✅ Update `Workspace` type to include `logoUrl?`, `ownerId?` (optional)
6. ✅ Ensure error handling for 404 on get() matches backend behavior