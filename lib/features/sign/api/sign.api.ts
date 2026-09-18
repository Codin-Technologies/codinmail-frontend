import type {
  AddRecipientInput,
  CreateSigningRequestInput,
  FileRecord,
  FileVersionRecord,
  ListRequestsFilters,
  ListRequestsResult,
  RecipientActionInput,
  SigningAuditEvent,
  SigningCompletionRecord,
  SigningRecipient,
  SigningRequest,
  SigningStats,
  UpdateSigningRequestInput,
} from './sign.types';

export interface SignApi {
  listRequests(workspaceId: string, filters?: ListRequestsFilters): Promise<ListRequestsResult>;
  getRequest(workspaceId: string, requestId: string): Promise<SigningRequest | null>;
  createRequest(
    workspaceId: string,
    input: CreateSigningRequestInput
  ): Promise<SigningRequest>;
  updateRequest(
    workspaceId: string,
    requestId: string,
    patch: UpdateSigningRequestInput
  ): Promise<SigningRequest>;
  deleteRequest(workspaceId: string, requestId: string): Promise<void>;
  sendRequest(workspaceId: string, requestId: string): Promise<SigningRequest>;
  cancelRequest(workspaceId: string, requestId: string): Promise<SigningRequest>;

  addRecipient(
    workspaceId: string,
    requestId: string,
    input: AddRecipientInput
  ): Promise<SigningRecipient>;
   removeRecipient(
    workspaceId: string,
    requestId: string,
    recipientId: string
  ): Promise<void>;
  listRecipients(
    workspaceId: string,
    requestId: string
  ): Promise<SigningRecipient[]>;
  recipientAction(
    workspaceId: string,
    requestId: string,
    recipientId: string,
    input: RecipientActionInput
  ): Promise<SigningRecipient>;

  getStats(workspaceId: string): Promise<SigningStats>;
  verifyIntegrity(
    workspaceId: string,
    requestId: string
  ): Promise<{ valid: boolean; currentChecksum?: string; originalChecksum?: string }>;
  getCompletion(
    workspaceId: string,
    requestId: string
  ): Promise<SigningCompletionRecord | null>;

  listAuditEvents?(
    workspaceId: string,
    requestId: string
  ): Promise<SigningAuditEvent[]>;

  listFiles(workspaceId: string, folderId?: string | null): Promise<FileRecord[]>;
  getFileVersions(workspaceId: string, fileId: string): Promise<FileVersionRecord[]>;
  getFileVersion(
    workspaceId: string,
    fileId: string,
    versionId: string
  ): Promise<FileVersionRecord | null>;
}
