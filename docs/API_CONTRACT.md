# Codin Frontend API Contract

This document describes the API surface that the frontend expects from the backend. All current implementations use mock services under `lib/mock/`. The backend should replace these with real API clients without modifying the UI layer.

## Authentication

### Register
- **Endpoint:** `POST /auth/register`
- **Request:** `{ name, email, codinId, password }`
- **Response:** `{ success: true, user: MockUser, requiresVerification: boolean }`

### Login
- **Endpoint:** `POST /auth/login`
- **Request:** `{ email, password }`
- **Response:** `{ success: true, user: MockUser }` or `{ success: false, error: string }`

### Logout
- **Endpoint:** `POST /auth/logout`
- **Response:** `{ success: true }`

### Verify Email
- **Endpoint:** `POST /auth/verify-email`
- **Request:** `{ token: string }` or current user context
- **Response:** `{ success: true, user: MockUser }`

### Resend Verification
- **Endpoint:** `POST /auth/resend-verification`
- **Response:** `{ success: true }`

### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Request:** `{ email: string }`
- **Response:** `{ success: true, email: string }`

### Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Request:** `{ token: string, password: string }`
- **Response:** `{ success: true }`

### Get Current User
- **Endpoint:** `GET /auth/session`
- **Response:** `{ user: MockUser }`

## Workspaces

### Get Workspaces
- **Endpoint:** `GET /workspaces`
- **Response:** `MockWorkspace[]`

### Get Workspace
- **Endpoint:** `GET /workspaces/:id`
- **Response:** `MockWorkspace`

### Create Workspace
- **Endpoint:** `POST /workspaces`
- **Request:** `{ name, slug, industry, country, timezone, hasMailbox? }`
- **Response:** `MockWorkspace`

### Join Workspace
- **Endpoint:** `POST /workspaces/join`
- **Request:** `{ code: string }`
- **Response:** `{ success: true, workspace: MockWorkspace }` or `{ success: false, error: string }`

### Switch Workspace
- **Endpoint:** `POST /workspaces/:id/switch`
- **Response:** `{ success: true, workspace: MockWorkspace }`

### Get Members
- **Endpoint:** `GET /workspaces/:id/members`
- **Response:** `WorkspaceMember[]`

### Invite Member
- **Endpoint:** `POST /workspaces/:id/members/invite`
- **Request:** `{ email, role }`
- **Response:** `{ success: true }`

## Mailboxes

### Get Mailboxes
- **Endpoint:** `GET /workspaces/:id/mailboxes`
- **Response:** `Mailbox[]`

### Connect Mailbox
- **Endpoint:** `POST /workspaces/:id/mailboxes`
- **Request:** `{ provider, details }`
- **Response:** `{ id, provider, address, status }`

### Disconnect Mailbox
- **Endpoint:** `DELETE /workspaces/:id/mailboxes/:mailboxId`
- **Response:** `{ success: true }`

### Get Providers
- **Endpoint:** `GET /mailboxes/providers`
- **Response:** `{ id, name, icon }[]`

## Domains

### Get Domains
- **Endpoint:** `GET /workspaces/:id/domains`
- **Response:** `Domain[]`

### Add Domain
- **Endpoint:** `POST /workspaces/:id/domains`
- **Request:** `{ name, provider }`
- **Response:** `Domain`

### Verify Domain
- **Endpoint:** `POST /workspaces/:id/domains/:domainId/verify`
- **Response:** `{ success: true, domain: Domain }`

## User

### Get Current User
- **Endpoint:** `GET /user/me`
- **Response:** `MockUser`

### Update Profile
- **Endpoint:** `PATCH /user/me`
- **Request:** `{ name?, timezone?, language? }`
- **Response:** `MockUser`

## Security

### Get Sessions
- **Endpoint:** `GET /user/sessions`
- **Response:** `SecuritySession[]`

### Sign Out Session
- **Endpoint:** `DELETE /user/sessions/:id`
- **Response:** `{ success: true }`

### Change Password
- **Endpoint:** `POST /user/password`
- **Request:** `{ currentPassword, newPassword }`
- **Response:** `{ success: true }`

## Invitations

### Get Invitations
- **Endpoint:** `GET /workspaces/:id/invitations`
- **Response:** `Invitation[]`

### Accept Invitation
- **Endpoint:** `POST /invitations/:id/accept`
- **Response:** `{ success: true, workspace: MockWorkspace }`
