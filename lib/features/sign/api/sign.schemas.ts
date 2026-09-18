import { z } from 'zod';
import type {
  ActorType,
  RecipientRole,
  RecipientStatus,
  RecipientType,
  SigningActionType,
  SigningRequestStatus,
  WorkflowMode,
} from './sign.types';

export const SigningRequestStatusSchema = z.enum([
  'draft',
  'sent',
  'in_progress',
  'completed',
  'cancelled',
  'expired',
  'declined',
]);

export const WorkflowModeSchema = z.enum(['sequential', 'parallel']);

export const RecipientRoleSchema = z.enum(['signer', 'approver', 'reviewer', 'viewer']);

export const RecipientTypeSchema = z.enum(['internal', 'external']);

export const RecipientStatusSchema = z.enum([
  'pending',
  'notified',
  'viewed',
  'action_required',
  'signed',
  'approved',
  'rejected',
  'declined',
  'completed',
]);

export const SigningActionTypeSchema = z.enum([
  'sign',
  'decline',
  'approve',
  'reject',
  'request_changes',
  'complete_review',
]);

export const ActorTypeSchema = z.enum(['user', 'system', 'external']);

export const SigningRequestSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string(),
  fileId: z.string().uuid(),
  fileVersionId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: SigningRequestStatusSchema,
  workflowMode: WorkflowModeSchema,
  documentChecksum: z.string(),
  mimeType: z.string(),
  storageKey: z.string(),
  createdBy: z.string(),
  sentAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SigningRecipientSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string(),
  signingRequestId: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  workspaceUserId: z.string().uuid().nullable(),
  recipientType: RecipientTypeSchema,
  role: RecipientRoleSchema,
  signingOrder: z.number().int().min(0),
  status: RecipientStatusSchema,
  notifiedAt: z.coerce.date().nullable(),
  viewedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SigningAuditEventSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string(),
  signingRequestId: z.string().uuid(),
  actorType: ActorTypeSchema,
  actorId: z.string(),
  eventType: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.coerce.date(),
});

export const SigningCompletionRecordSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string(),
  signingRequestId: z.string().uuid(),
  fileVersionId: z.string().uuid(),
  originalChecksum: z.string(),
  completedAt: z.coerce.date().default(() => new Date()),
  verificationStatus: z.enum(['verified', 'tampered', 'error']),
  metadata: z.record(z.string(), z.unknown()),
});

export const SigningStatsSchema = z.object({
  total: z.number().int(),
  byStatus: z.record(SigningRequestStatusSchema, z.number().int()),
  completedCount: z.number().int(),
  averageCompletionHours: z.number().nullable(),
});

export const CreateSigningRequestInputSchema = z.object({
  fileId: z.string().uuid(),
  fileVersionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  workflowMode: WorkflowModeSchema.optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const AddRecipientInputSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  workspaceUserId: z.string().uuid().optional().nullable(),
  recipientType: RecipientTypeSchema.optional(),
  role: RecipientRoleSchema.optional(),
  signingOrder: z.number().int().min(0).optional(),
});

export const RecipientActionInputSchema = z.object({
  action: SigningActionTypeSchema,
  actorType: ActorTypeSchema.optional(),
  actorId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateSigningRequestInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const ListRequestsFiltersSchema = z.object({
  status: SigningRequestStatusSchema.optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export const FileRecordSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string(),
  folderId: z.string().nullable(),
  name: z.string(),
  displayName: z.string(),
  mimeType: z.string(),
  extension: z.string().nullable(),
  sizeBytes: z.number().int(),
  checksumSha256: z.string().nullable(),
  storageProvider: z.string(),
  storageKey: z.string(),
  status: z.string(),
  currentVersionId: z.string().nullable(),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const FileVersionRecordSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(),
  workspaceId: z.string(),
  versionNumber: z.number().int(),
  storageProvider: z.string(),
  storageKey: z.string(),
  sizeBytes: z.number().int(),
  mimeType: z.string(),
  checksumSha256: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
});

export const PaginationMetaSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
