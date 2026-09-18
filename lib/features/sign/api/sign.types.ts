export type SigningRequestStatus =
  | 'draft'
  | 'sent'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'declined';

export type WorkflowMode = 'sequential' | 'parallel';

export type RecipientRole = 'signer' | 'approver' | 'reviewer' | 'viewer';

export type RecipientType = 'internal' | 'external';

export type RecipientStatus =
  | 'pending'
  | 'notified'
  | 'viewed'
  | 'action_required'
  | 'signed'
  | 'approved'
  | 'rejected'
  | 'declined'
  | 'completed';

export type SigningActionType =
  | 'sign'
  | 'decline'
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'complete_review';

export type ActorType = 'user' | 'system' | 'external';

export type VerificationStatus = 'verified' | 'tampered' | 'error';

export interface SigningRequest {
  id: string;
  workspaceId: string;
  fileId: string;
  fileVersionId: string;
  title: string;
  description: string;
  status: SigningRequestStatus;
  workflowMode: WorkflowMode;
  documentChecksum: string;
  mimeType: string;
  storageKey: string;
  createdBy: string;
  sentAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SigningRecipient {
  id: string;
  workspaceId: string;
  signingRequestId: string;
  name: string;
  email: string;
  workspaceUserId: string | null;
  recipientType: RecipientType;
  role: RecipientRole;
  signingOrder: number;
  status: RecipientStatus;
  notifiedAt: string | null;
  viewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SigningAuditEvent {
  id: string;
  workspaceId: string;
  signingRequestId: string;
  actorType: ActorType;
  actorId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SigningCompletionRecord {
  id: string;
  workspaceId: string;
  signingRequestId: string;
  fileVersionId: string;
  originalChecksum: string;
  completedAt: string;
  verificationStatus: VerificationStatus;
  metadata: Record<string, unknown>;
}

export interface SigningAction {
  id: string;
  workspaceId: string;
  signingRequestId: string;
  recipientId: string;
  actorType: ActorType;
  actorId: string;
  action: SigningActionType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SigningStats {
  total: number;
  byStatus: Record<SigningRequestStatus, number>;
  completedCount: number;
  averageCompletionHours: number | null;
}

export interface CreateSigningRequestInput {
  fileId: string;
  fileVersionId: string;
  title: string;
  description?: string;
  workflowMode?: WorkflowMode;
  expiresAt?: Date | null;
}

export interface AddRecipientInput {
  name: string;
  email: string;
  workspaceUserId?: string | null;
  recipientType?: RecipientType;
  role?: RecipientRole;
  signingOrder?: number;
}

export interface RecipientActionInput {
  action: SigningActionType;
  actorType?: ActorType;
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSigningRequestInput {
  title?: string;
  description?: string;
  expiresAt?: Date | null;
}

export interface ListRequestsFilters {
  status?: SigningRequestStatus;
  limit?: number;
  offset?: number;
}

export interface ListRequestsResult {
  data: SigningRequest[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface FileRecord {
  id: string;
  workspaceId: string;
  folderId: string | null;
  name: string;
  displayName: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: number;
  checksumSha256: string | null;
  storageProvider: string;
  storageKey: string;
  status: string;
  currentVersionId: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FileVersionRecord {
  id: string;
  fileId: string;
  workspaceId: string;
  versionNumber: number;
  storageProvider: string;
  storageKey: string;
  sizeBytes: number;
  mimeType: string;
  checksumSha256: string | null;
  createdBy: string;
  createdAt: string;
}

export interface RecipientWithActions extends SigningRecipient {
  requestTitle?: string;
}

export const SIGNING_STATUS_LABELS: Record<SigningRequestStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  declined: 'Declined',
};

export const RECIPIENT_STATUS_LABELS: Record<RecipientStatus, string> = {
  pending: 'Pending',
  notified: 'Notified',
  viewed: 'Viewed',
  action_required: 'Action Required',
  signed: 'Signed',
  approved: 'Approved',
  rejected: 'Rejected',
  declined: 'Declined',
  completed: 'Completed',
};

export const RECIPIENT_ROLE_LABELS: Record<RecipientRole, string> = {
  signer: 'Signer',
  approver: 'Approver',
  reviewer: 'Reviewer',
  viewer: 'Viewer',
};

export const WORKFLOW_MODE_LABELS: Record<WorkflowMode, string> = {
  sequential: 'Sequential',
  parallel: 'Parallel',
};

export const SIGNING_STATUS_TRANSITIONS: Record<SigningRequestStatus, SigningRequestStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['in_progress', 'completed', 'cancelled', 'expired'],
  in_progress: ['completed', 'cancelled', 'expired', 'declined'],
  completed: [],
  cancelled: [],
  expired: [],
  declined: [],
};

export const RECIPIENT_STATUS_TRANSITIONS: Record<RecipientStatus, RecipientStatus[]> = {
  pending: ['notified', 'declined'],
  notified: ['viewed', 'signed', 'approved', 'action_required', 'rejected', 'declined'],
  viewed: ['action_required', 'signed', 'approved', 'rejected', 'declined'],
  action_required: ['signed', 'approved', 'rejected', 'declined'],
  signed: ['completed'],
  approved: ['completed'],
  rejected: ['action_required', 'declined'],
  declined: [],
  completed: [],
};

export function canTransition(
  current: SigningRequestStatus,
  next: SigningRequestStatus
): boolean {
  return SIGNING_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export function canRecipientTransition(
  current: RecipientStatus,
  next: RecipientStatus
): boolean {
  return RECIPIENT_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export const STATUS_COLORS: Record<SigningRequestStatus, string> = {
  draft: 'text-muted-foreground',
  sent: 'text-blue-600',
  in_progress: 'text-amber-600',
  completed: 'text-green-600',
  cancelled: 'text-gray-500',
  expired: 'text-red-600',
  declined: 'text-red-600',
};

export const RECIPIENT_STATUS_COLORS: Record<RecipientStatus, string> = {
  pending: 'text-muted-foreground',
  notified: 'text-blue-600',
  viewed: 'text-purple-600',
  action_required: 'text-amber-600',
  signed: 'text-green-600',
  approved: 'text-green-600',
  rejected: 'text-red-600',
  declined: 'text-red-600',
  completed: 'text-green-600',
};
