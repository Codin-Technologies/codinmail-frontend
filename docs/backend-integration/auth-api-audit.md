# Auth API Audit

## Backend Endpoints

### POST /api/v1/auth/bootstrap
**Frontend Method:** `CodinAuthApi.bootstrap(input: BootstrapInput)` → `Promise<CurrentUser>`

**Backend Route:** `POST /api/v1/auth/bootstrap`
- Middleware: `authenticate` (requires valid Supabase JWT)
- Controller: `bootstrap` in `auth.controller.ts`
- Service: `bootstrapUser` in `auth.service.ts`

**Request:**
```json
{
  "firstName": "string (min 1, max 100)",
  "lastName": "string (min 1, max 100)",
  "displayName": "string (min 1, max 255)",
  "timezone": "string (optional, default: Africa/Dar_es_Salaam)",
  "locale": "string (optional, default: en-TZ)"
}
```

**Headers:**
- `Authorization: Bearer <supabase_access_token>`
- `Content-Type: application/json`

**Authentication:** Supabase JWT validated by `authenticate` middleware → `req.user = { authUserId, email }`

**Response (200):**
```json
{
  "user": {
    "id": "string (uuid)",
    "authUserId": "string (supabase uuid)",
    "email": "string",
    "displayName": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "string",
    "timezone": "string",
    "locale": "string"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper for this endpoint.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 401: `AUTH_INVALID_TOKEN` - Invalid/expired token
- 422: `VALIDATION_ERROR` - Invalid request body
- 500: `DATABASE_ERROR` - Failed to create user

**Permissions:** Authenticated user with verified email

---

### GET /api/v1/me
**Frontend Method:** `CodinAuthApi.getCurrentUser()` → `Promise<CurrentUser | null>`

**Backend Route:** `GET /api/v1/me`
- Middleware: `authenticate` (requires valid Supabase JWT)
- Controller: `getMe` in `users.controller.ts`
- Service: `getUserByAuthUserId` in `users.service.ts`

**Headers:**
- `Authorization: Bearer <supabase_access_token>`

**Authentication:** Supabase JWT validated by `authenticate` middleware

**Response (200):**
```json
{
  "user": {
    "id": "string (uuid)",
    "email": "string",
    "displayName": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "string",
    "timezone": "string",
    "locale": "string"
  }
}
```
Note: Backend does NOT use standardized `success: true` wrapper for this endpoint.

**Error Responses:**
- 401: `AUTH_UNAUTHORIZED` - Missing/invalid token
- 404: `USER_PROFILE_NOT_INITIALIZED` - User not bootstrapped
- 500: `INTERNAL_SERVER_ERROR`

**Permissions:** Authenticated user with bootstrapped profile

---

## Frontend vs Backend Mismatches

### 1. Response Format
- **Backend:** Returns raw `{ user: {...} }` without `success` wrapper
- **Frontend (auth.real.ts line 93):** Expects `{ data: CurrentUser }` or `{ user: CurrentUser }`
- **Fix Needed:** Update frontend to handle raw response format

### 2. Bootstrap Response
- **Backend:** Returns `{ user: {...} }` with `authUserId` field
- **Frontend (auth.types.ts):** `CurrentUser` has `authUserId?: string` but `bootstrap` returns `CurrentUser` without it
- **Fix Needed:** Update `CurrentUser` type to include `authUserId` as required, handle in bootstrap

### 3. getCurrentUser 404 Handling
- **Backend:** Returns 404 with `USER_PROFILE_NOT_INITIALIZED` when user not bootstrapped
- **Frontend (auth.real.ts line 104-112):** Catches 401/404 and returns `null`
- **Status:** OK - frontend correctly handles 404

### 4. Missing Auth Endpoints in Backend
The following frontend AuthApi methods have NO corresponding backend endpoints:
- `register()` - Frontend uses Supabase directly (correct)
- `login()` - Frontend uses Supabase directly (correct)
- `logout()` - Frontend uses Supabase directly (correct)
- `verifyEmail()` - Frontend uses Supabase directly (correct)
- `resendVerification()` - Frontend uses Supabase directly (correct)
- `forgotPassword()` - Frontend uses Supabase directly (correct)
- `resetPassword()` - Frontend uses Supabase directly (correct)

**Status:** These are correctly implemented via Supabase client, not backend API.

---

## Action Items

1. ✅ Fix `CodinAuthApi.getCurrentUser()` to handle raw `{ user: ... }` response
2. ✅ Fix `CodinAuthApi.bootstrap()` to handle raw `{ user: ... }` response  
3. ✅ Update `CurrentUser` type to include `authUserId` as required field
4. ✅ Remove `success` wrapper expectation from auth real implementation