# Onboarding API Audit

## Backend Implementation

**No dedicated onboarding module exists** in the backend. Onboarding is handled as a client-side flow that uses existing API endpoints:

1. Authentication via Supabase → `POST /api/v1/auth/bootstrap` or `GET /api/v1/me`
2. Workspace creation via `POST /api/v1/workspaces`
3. Workspace selection from `GET /api/v1/workspaces`

The backend does not expose onboarding state (e.g., "NOT_STARTED", "IN_PROGRESS", "COMPLETED"). Onboarding completion is determined by whether the user has at least one workspace with active membership.

## Endpoints Used (Indirect)

### POST /api/v1/auth/bootstrap
- Creates the user's Codin profile if it doesn't exist
- Required before any workspace operations

### GET /api/v1/workspaces
- Lists workspaces where the user has active membership
- If empty, the user needs to create or join a workspace to complete onboarding

### POST /api/v1/workspaces
- Creates a new workspace (and the caller becomes owner)
- Used during onboarding flow for "Create Workspace"

## Onboarding Flow (Backend Perspective)

```
1. User authenticates via Supabase → receives access token
2. Frontend calls GET /api/v1/me
   - 200: User profile exists → skip bootstrap
   - 404: User profile not initialized → call POST /api/v1/auth/bootstrap
3. Frontend calls GET /api/v1/workspaces
   - Empty: User has no workspaces → show "Create or Join Workspace"
   - Non-empty: User has workspaces → proceed to workspace selection
4. (Optional) User creates workspace via POST /api/v1/workspaces
5. User selects a workspace
6. User is now "onboarded" — has a valid profile and active workspace access
```

## Onboarding State Determination

The frontend must determine onboarding state from backend responses:

| Condition | Onboarding State |
|-----------|-----------------|
| No user profile (404 on `/me`) | Bootstrap needed |
| User profile exists, no workspaces | Workspace creation needed |
| User profile exists, has workspaces | Onboarding complete |

**No explicit onboarding state API exists.** The frontend should infer state from `/me` and `/workspaces` responses.

## Workspace Invitation / Join

The backend's `joinWorkspace` is only in the frontend mock. The backend has no "join workspace" endpoint (no invitation code API exists in the current backend routes). The `workspaceMembers` table supports `invited` status, but no HTTP route exposes invitation sending or joining.

## Frontend Usage

### New User
1. Supabase sign-in/up → access token
2. `GET /api/v1/me` → if 404, `POST /api/v1/auth/bootstrap`
3. `GET /api/v1/workspaces` → if empty, create workspace via `POST /api/v1/workspaces`

### Existing User
1. Supabase sign-in → access token
2. `GET /api/v1/me` → user profile
3. `GET /api/v1/workspaces` → list of workspaces
4. Redirect to workspace selection or last active workspace

## Mock Implementation Status
- **Mock onboarding exists** in `lib/mock/workspaces.ts` — `joinWorkspace` simulates joining via invitation code
- **No real backend support** for workspace join/invitation via API

## Real API Implementation Status
- Not yet integrated
- Backend supports: bootstrap, get-me, list workspaces, create workspace
- Backend does NOT support: join workspace via invitation code, onboarding state tracking

## Test Status
- No onboarding integration tests exist
