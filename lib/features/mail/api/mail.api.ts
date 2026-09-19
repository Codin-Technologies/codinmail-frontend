import type {
  Mailbox,
  ThreadListResponse,
  Thread,
  Message,
  Draft,
  Attachment,
  Label,
  Folder,
  SendMailResult,
  SearchResponse,
  CreateDraftData,
  UpdateDraftData,
  SendMailPayload,
  BatchMessageAction,
} from "../types/mail.api.types";

export interface MailApi {
  listMailboxes(workspaceId: string): Promise<Mailbox[]>;

  listThreads(workspaceId: string, query?: {
    mailboxId?: string;
    folder?: string;
    isRead?: boolean;
    isStarred?: boolean;
    labelId?: string;
    q?: string;
    limit?: number;
    cursor?: string;
  }): Promise<ThreadListResponse>;

  getThread(workspaceId: string, threadId: string): Promise<Thread>;

  updateThread(
    workspaceId: string,
    threadId: string,
    updates: { isStarred?: boolean; isArchived?: boolean; isDeleted?: boolean }
  ): Promise<Thread>;

  markThreadRead(workspaceId: string, threadId: string): Promise<void>;
  markThreadUnread(workspaceId: string, threadId: string): Promise<void>;
  archiveThread(workspaceId: string, threadId: string): Promise<Thread>;
  trashThread(workspaceId: string, threadId: string): Promise<Thread>;

  getMessage(workspaceId: string, messageId: string): Promise<Message>;
  updateMessage(
    workspaceId: string,
    messageId: string,
    updates: { isRead?: boolean; isStarred?: boolean; folder?: string; labels?: string[] }
  ): Promise<Message>;
  deleteMessage(workspaceId: string, messageId: string): Promise<void>;
  batchMessages(
    workspaceId: string,
    action: BatchMessageAction
  ): Promise<{ updatedCount: number }>;

  createDraft(workspaceId: string, data: CreateDraftData): Promise<Draft>;
  listDrafts(workspaceId: string, mailboxId: string): Promise<Draft[]>;
  getDraft(workspaceId: string, draftId: string): Promise<Draft>;
  updateDraft(
    workspaceId: string,
    draftId: string,
    data: UpdateDraftData
  ): Promise<Draft>;
  deleteDraft(workspaceId: string, draftId: string): Promise<void>;
  sendDraft(workspaceId: string, draftId: string): Promise<{
    messageId: string;
    rfcMessageId: string;
    outboxId: string;
  }>;

  sendMail(workspaceId: string, payload: SendMailPayload): Promise<SendMailResult>;

  search(workspaceId: string, query: {
    q: string;
    mailboxId?: string;
    folder?: string;
    labelId?: string;
    isRead?: boolean;
    isStarred?: boolean;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SearchResponse>;

  listFolders(workspaceId: string, mailboxId: string): Promise<Folder[]>;

  getMessageAttachments(workspaceId: string, messageId: string): Promise<Attachment[]>;
  getAttachment(workspaceId: string, attachmentId: string): Promise<Attachment>;
}
