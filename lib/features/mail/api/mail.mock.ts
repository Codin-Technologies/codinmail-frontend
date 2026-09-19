import type { MailApi } from "./mail.api";
import type {
  Mailbox,
  ThreadListResponse,
  Thread,
  Message,
  Draft,
  Attachment,
  Folder,
  SendMailResult,
} from "../types/mail.api.types";

export class MockMailApi implements MailApi {
  async listMailboxes(_workspaceId: string): Promise<Mailbox[]> { return []; }
  async listThreads(_workspaceId: string, _query?: any): Promise<ThreadListResponse> { return { threads: [], nextCursor: undefined }; }
  async getThread(_workspaceId: string, _threadId: string): Promise<Thread> { throw new Error("Not implemented"); }
  async updateThread(_workspaceId: string, _threadId: string, _updates: any): Promise<Thread> { throw new Error("Not implemented"); }
  async markThreadRead(_workspaceId: string, _threadId: string): Promise<void> {}
  async markThreadUnread(_workspaceId: string, _threadId: string): Promise<void> {}
  async archiveThread(_workspaceId: string, _threadId: string): Promise<Thread> { throw new Error("Not implemented"); }
  async trashThread(_workspaceId: string, _threadId: string): Promise<Thread> { throw new Error("Not implemented"); }
  async getMessage(_workspaceId: string, _messageId: string): Promise<Message> { throw new Error("Not implemented"); }
  async updateMessage(_workspaceId: string, _messageId: string, _updates: any): Promise<Message> { throw new Error("Not implemented"); }
  async deleteMessage(_workspaceId: string, _messageId: string): Promise<void> {}
  async batchMessages(_workspaceId: string, _action: any): Promise<{ updatedCount: number }> { return { updatedCount: 0 }; }
  async createDraft(_workspaceId: string, _data: any): Promise<Draft> { throw new Error("Not implemented"); }
  async listDrafts(_workspaceId: string, _mailboxId: string): Promise<Draft[]> { return []; }
  async getDraft(_workspaceId: string, _draftId: string): Promise<Draft> { throw new Error("Not implemented"); }
  async updateDraft(_workspaceId: string, _draftId: string, _data: any): Promise<Draft> { throw new Error("Not implemented"); }
  async deleteDraft(_workspaceId: string, _draftId: string): Promise<void> {}
  async sendDraft(_workspaceId: string, _draftId: string): Promise<{ messageId: string; rfcMessageId: string; outboxId: string }> { throw new Error("Not implemented"); }
  async sendMail(_workspaceId: string, _payload: any): Promise<SendMailResult> { return { messageId: "", rfcMessageId: "", outboxId: "", status: "queued" }; }
  async search(_workspaceId: string, _query: any): Promise<{ messages: Message[]; nextCursor?: string }> { return { messages: [] }; }
  async listFolders(_workspaceId: string, _mailboxId: string): Promise<Folder[]> { return []; }
  async getMessageAttachments(_workspaceId: string, _messageId: string): Promise<Attachment[]> { return []; }
  async getAttachment(_workspaceId: string, _attachmentId: string): Promise<Attachment> { throw new Error("Not implemented"); }
}

export const mockMailApi = new MockMailApi();
